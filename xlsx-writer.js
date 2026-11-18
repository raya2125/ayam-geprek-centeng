/**
 * ============================================================
 * AYAM GEPREK CENTENG - PURE NODE.JS XLSX WRITER
 * Menghasilkan file Microsoft Excel (.xlsx) asli tanpa dependensi
 * eksternal (memakai modul zlib & fs bawaan Node.js).
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Tabel CRC-32 untuk header arsip ZIP (.xlsx)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

/** Menghitung checksum CRC-32 suatu Buffer. */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** Mengonversi indeks kolom berbasis 0 ke huruf kolom Excel (A, B, ..., AA). */
function colLetter(index) {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Melakukan escape karakter khusus XML agar valid di Excel. */
function escapeXml(val) {
  return String(val === null || val === undefined ? '' : val)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Membentuk elemen sel XML (angka, formula, atau teks inlineStr). */
function buildCellXml(ref, value, styleIndex = 0) {
  if (value && typeof value === 'object' && value.formula) {
    return `<c r="${ref}" s="${styleIndex}"><f>${escapeXml(value.formula)}</f></c>`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}" s="${styleIndex}"><v>${value}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr" s="${styleIndex}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

/** Membentuk XML satu worksheet beserta lebar kolom & daftar baris. */
function buildSheetXml(rows, colWidths, rowStylesFn) {
  const colsXml = colWidths.length > 0
    ? `<cols>${colWidths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : '';

  const rowsXml = rows.map((row, rIdx) => {
    const rowNum = rIdx + 1;
    const cellsXml = row.map((val, cIdx) => {
      const ref = `${colLetter(cIdx)}${rowNum}`;
      const style = rowStylesFn ? rowStylesFn(rIdx, cIdx, val) : (rIdx === 0 ? 1 : 0);
      return buildCellXml(ref, val, style);
    }).join('');
    return `<row r="${rowNum}">${cellsXml}</row>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `${colsXml}` +
    `<sheetData>${rowsXml}</sheetData>` +
    `</worksheet>`;
}

/** Membentuk Buffer arsip ZIP dari daftar entri { name, data }. */
function createZipBuffer(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const rawBuf = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const compBuf = zlib.deflateRawSync(rawBuf);
    const sum = crc32(rawBuf);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8); // deflate
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(sum, 14);
    localHeader.writeUInt32LE(compBuf.length, 18);
    localHeader.writeUInt32LE(rawBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, compBuf);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10); // deflate
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(sum, 16);
    centralHeader.writeUInt32LE(compBuf.length, 20);
    centralHeader.writeUInt32LE(rawBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compBuf.length;
  }

  const centralSize = centralParts.reduce((acc, b) => acc + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

/** Menghasilkan workbook Excel (.xlsx) berisi sheet Transaksi dan Ringkasan Omzet. */
function buildOrdersWorkbookBuffer(orders) {
  const transaksiHeaders = [
    'No', 'Nomor Antrean', 'Waktu Pesan', 'ID Transaksi', 'Kode Kasir',
    'Nama Pemesan', 'Tipe Pesanan', 'Nomor Meja', 'Daftar Menu', 'Level Pedas',
    'Total Bayar (Rp)', 'Uang Diterima (Rp)', 'Kembalian (Rp)',
    'Metode Pembayaran', 'Status Pembayaran', 'Status Dapur', 'Catatan'
  ];

  const transaksiRows = [transaksiHeaders];
  orders.forEach((o, idx) => {
    transaksiRows.push([
      idx + 1,
      o.queueNumber || '-',
      o.timestamp || '-',
      o.transactionId || '-',
      o.paymentCode || '-',
      o.customerName || 'Pelanggan',
      o.orderType || '-',
      o.tableNumber || '-',
      o.menuSummary || '-',
      o.spicyLevel || '-',
      typeof o.totalPrice === 'number' ? o.totalPrice : (parseInt(o.totalPrice, 10) || 0),
      o.cashReceived !== undefined && o.cashReceived !== null ? o.cashReceived : '-',
      o.cashChange !== undefined && o.cashChange !== null ? o.cashChange : '-',
      o.paymentMethod || 'QRIS',
      o.paymentStatus || 'LUNAS',
      o.status || '-',
      o.notes || '-'
    ]);
  });

  const lastRow = Math.max(2, transaksiRows.length);
  const summaryRows = [
    ['Keterangan', 'Nilai', 'Catatan'],
    ['Total Pesanan Tercatat', { formula: `COUNTA(Transaksi!B2:B${lastRow})` }, 'Seluruh pesanan masuk'],
    ['Pesanan Sudah Lunas', { formula: `COUNTIF(Transaksi!O2:O${lastRow},"LUNAS")` }, 'QRIS + Cash tervalidasi'],
    ['Menunggu Bayar di Kasir', { formula: `COUNTIF(Transaksi!O2:O${lastRow},"Belum Bayar")` }, 'Bayar di Tempat belum dibayar'],
    ['Total Omzet Lunas (Rp)', { formula: `SUMIF(Transaksi!O2:O${lastRow},"LUNAS",Transaksi!K2:K${lastRow})` }, 'Akumulasi omzet berstatus LUNAS'],
    ['Omzet QRIS (Rp)', { formula: `SUMIFS(Transaksi!K2:K${lastRow},Transaksi!O2:O${lastRow},"LUNAS",Transaksi!N2:N${lastRow},"*QRIS*")` }, 'Pembayaran non-tunai QRIS'],
    ['Omzet Tunai / Cash Kasir (Rp)', { formula: `SUMIFS(Transaksi!K2:K${lastRow},Transaksi!O2:O${lastRow},"LUNAS",Transaksi!N2:N${lastRow},"*Cash*")+SUMIFS(Transaksi!K2:K${lastRow},Transaksi!O2:O${lastRow},"LUNAS",Transaksi!N2:N${lastRow},"*Tunai*")` }, 'Input kasir & validasi Bayar di Tempat']
  ];

  const sheet1Xml = buildSheetXml(
    transaksiRows,
    [6, 15, 18, 22, 12, 20, 18, 12, 30, 20, 16, 18, 16, 26, 18, 20, 24],
    (r, c, val) => {
      if (r === 0) return 1;
      if ((c === 10 || c === 11 || c === 12) && typeof val === 'number') return 2;
      return 0;
    }
  );

  const sheet2Xml = buildSheetXml(
    summaryRows,
    [34, 18, 38],
    (r, c) => {
      if (r === 0) return 1;
      if (r >= 4 && c === 1) return 2;
      if (c === 0) return 3;
      return 0;
    }
  );

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts>` +
    `<fonts count="3">` +
      `<font><sz val="11"/><name val="Calibri"/></font>` +
      `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>` +
      `<font><b/><sz val="11"/><color rgb="FF2C1A10"/><name val="Calibri"/></font>` +
    `</fonts>` +
    `<fills count="3">` +
      `<fill><patternFill patternType="none"/></fill>` +
      `<fill><patternFill patternType="gray125"/></fill>` +
      `<fill><patternFill patternType="solid"><fgColor rgb="FFC84626"/></patternFill></fill>` +
    `</fills>` +
    `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="4">` +
      `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
      `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>` +
      `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
      `<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
    `</cellXfs>` +
    `</styleSheet>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<calcPr calcId="191029" fullCalcOnLoad="1"/>` +
    `<sheets>` +
      `<sheet name="Transaksi" sheetId="1" r:id="rId1"/>` +
      `<sheet name="Ringkasan Omzet" sheetId="2" r:id="rId2"/>` +
    `</sheets>` +
    `</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;

  return createZipBuffer([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml },
    { name: 'xl/styles.xml', data: stylesXml },
    { name: 'xl/worksheets/sheet1.xml', data: sheet1Xml },
    { name: 'xl/worksheets/sheet2.xml', data: sheet2Xml }
  ]);
}

/** Menulis daftar pesanan ke file .xlsx secara aman dengan fallback jika file sedang dikunci Excel. */
function writeOrdersXlsxFile(filePath, orders) {
  const buf = buildOrdersWorkbookBuffer(orders);
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, buf);
  try {
    fs.renameSync(tmpPath, filePath);
    return { written: true, path: filePath };
  } catch (err) {
    // Jika file sedang dibuka di Microsoft Excel (EBUSY/EPERM), biarkan .tmp atau laporkan lock tanpa crash
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
      return { written: false, locked: true, error: err.message };
    }
    throw err;
  }
}

module.exports = {
  buildOrdersWorkbookBuffer,
  writeOrdersXlsxFile
};
