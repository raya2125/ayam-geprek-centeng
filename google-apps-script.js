/**
 * ============================================================
 * GOOGLE APPS SCRIPT - AUTO-SYNC GOOGLE SPREADSHEET
 * Catatan Penjualan - Ayam Geprek Centeng
 * ============================================================
 * Cara pasang agar website (bahkan dari GitHub Pages) mencatat
 * langsung ke Google Spreadsheet "Catatan Penjualan - Ayam Geprek Centeng":
 * 1. Buka Google Spreadsheet:
 *    https://docs.google.com/spreadsheets/d/1Ul4Il-KYMHwirIwqpaJ_HOUPG87gQ3VY5twEicdu7Ow/edit
 * 2. Klik menu: Ekstensi (Extensions) > Apps Script
 * 3. Hapus isi editor, paste seluruh kode di bawah ini, lalu Simpan.
 * 4. Klik: Terapkan (Deploy) > Deployment baru (New deployment) > Jenis: Aplikasi Web (Web app)
 *    - Jalankan sebagai: Saya (Me)
 *    - Yang memiliki akses: Siapa saja (Anyone)
 * 5. Salin URL Web App yang muncul, lalu tempel ke GOOGLE_SHEETS_WEBHOOK_URL di menu-data.js.
 */

const SPREADSHEET_ID = '1Ul4Il-KYMHwirIwqpaJ_HOUPG87gQ3VY5twEicdu7Ow';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const orders = Array.isArray(payload.orders) ? payload.orders : [];
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Transaksi') || ss.getSheets()[0];

    const headers = [
      'No', 'Nomor Antrean', 'Waktu Pesan', 'ID Transaksi', 'Kode Kasir',
      'Nama Pemesan', 'Tipe Pesanan', 'Nomor Meja', 'Daftar Menu', 'Level Pedas',
      'Total Bayar (Rp)', 'Uang Diterima (Rp)', 'Kembalian (Rp)',
      'Metode Pembayaran', 'Status Pembayaran', 'Status Dapur', 'Catatan'
    ];

    const rows = [headers];
    orders.forEach(function (o, idx) {
      rows.push([
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
        Number(o.totalPrice) || 0,
        o.cashReceived !== undefined && o.cashReceived !== null ? Number(o.cashReceived) : '-',
        o.cashChange !== undefined && o.cashChange !== null ? Number(o.cashChange) : '-',
        o.paymentMethod || 'QRIS',
        o.paymentStatus || 'LUNAS',
        o.status || '-',
        o.notes || '-'
      ]);
    });

    sheet.clearContents();
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, count: orders.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
