/**
 * ============================================================
 * AYAM GEPREK CENTENG - SHARED DATABASE & EXCEL STORE
 * Modul bersama untuk Halaman Pembeli (index.html) dan
 * Halaman Penjual / Kasir Cash (kasir.html).
 * ============================================================
 */

const STORAGE_ORDERS_KEY = 'centeng_orders_db';
const STORAGE_QUEUE_COUNTER_KEY = 'centeng_queue_counter';

// Definisi resmi 2 menu utama (anti-cache override)
const OFFICIAL_MENUS = [
  {
    id: 1,
    name: "Ayam Geprek",
    category: "geprek",
    price: 15000,
    formattedPrice: "Rp 15.000",
    badge: "Best Seller",
    description: "Ayam goreng krispi renyah gurih dengan sambal korek ulek dadakan cabai rawit merah asli + nasi putih pulen hangat.",
    image: "assets/ayam-geprek.jpg",
    isSpicySelectable: true
  },
  {
    id: 2,
    name: "Es Teh",
    category: "minuman",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Segar Dingin",
    description: "Es teh manis segar dingin racikan daun teh melati pilihan khas nusantara, penuntas dahaga & pereda pedas terbaik.",
    image: "assets/es-teh.jpg",
    isSpicySelectable: false
  }
];
window.MENU_LIST = OFFICIAL_MENUS;

/** Mengambil seluruh daftar pesanan dari localStorage. */
function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/** Menyimpan seluruh daftar pesanan ke localStorage. */
function setStoredOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
}

/** Menambahkan satu pesanan baru ke database localStorage. */
function saveOrderToStorage(order) {
  const orders = getStoredOrders();
  orders.push(order);
  setStoredOrders(orders);
}

/** Menghasilkan nomor antrean berurutan format #001. */
function getNextQueueNumber() {
  let counter = parseInt(localStorage.getItem(STORAGE_QUEUE_COUNTER_KEY) || '0', 10);
  counter += 1;
  localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, counter.toString());
  return counter < 10 ? `#00${counter}` : counter < 100 ? `#0${counter}` : `#${counter}`;
}

/** Memformat tanggal saat ini ke tampilan lokal Indonesia. */
function formatOrderTimestamp(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\./g, ':');
}

/** Menghasilkan ID transaksi unik dengan awalan tertentu (TRX / CASH). */
function generateTransactionId(prefix = 'TRX', date = new Date()) {
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateCode = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${dateCode}-${randomHex}`;
}

/** Menampilkan notifikasi toast jika handler tersedia di halaman aktif. */
function notifyToast(msg) {
  if (typeof showToast === 'function') {
    showToast(msg);
  }
}

/** Melakukan sanitasi karakter HTML untuk mencegah XSS saat render DOM. */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Mengekspor semua pesanan ke file Excel (.xlsx) atau fallback CSV. */
function exportToExcel(showPrompt = true) {
  const orders = getStoredOrders();
  if (orders.length === 0) {
    if (showPrompt) alert('Belum ada pesanan yang tersimpan untuk di-download.');
    return;
  }

  const excelData = orders.map((o, idx) => ({
    "No": idx + 1,
    "Nomor Antrean": o.queueNumber,
    "Waktu Pesan": o.timestamp,
    "ID Transaksi": o.transactionId || "-",
    "Nama Pemesan": o.customerName,
    "Tipe Pesanan": o.orderType,
    "Nomor Meja": o.tableNumber || "-",
    "Daftar Menu": o.menuSummary,
    "Total Bayar (Rp)": o.totalPrice,
    "Metode Pembayaran": o.paymentMethod || "QRIS",
    "Uang Diterima (Rp)": o.cashReceived !== undefined && o.cashReceived !== null ? o.cashReceived : "-",
    "Kembalian (Rp)": o.cashChange !== undefined && o.cashChange !== null ? o.cashChange : "-",
    "Status Pembayaran": o.paymentStatus || "LUNAS",
    "Status Dapur": o.status,
    "Catatan": o.notes || "-"
  }));

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Rekap_Pesanan_Ayam_Geprek_Centeng_${dateStr}.xlsx`;

  if (typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 15 }, // Nomor Antrean
      { wch: 18 }, // Waktu
      { wch: 22 }, // ID Transaksi
      { wch: 20 }, // Nama
      { wch: 18 }, // Tipe
      { wch: 12 }, // Meja
      { wch: 30 }, // Menu
      { wch: 16 }, // Total
      { wch: 24 }, // Metode Bayar
      { wch: 18 }, // Uang Diterima
      { wch: 16 }, // Kembalian
      { wch: 18 }, // Status Bayar
      { wch: 18 }, // Status Dapur
      { wch: 22 }  // Catatan
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Pesanan Centeng");
    XLSX.writeFile(wb, filename);

    if (showPrompt) notifyToast('File Excel Rekap (.xlsx) berhasil di-download!');
  } else {
    exportToCsvFallback(excelData, `Rekap_Pesanan_Ayam_Geprek_Centeng_${dateStr}.csv`);
  }
}

/** Mengekspor satu struk pesanan ke file Excel (.xlsx). */
function exportSingleOrderToExcel(order) {
  const singleData = [
    { "Keterangan": "Nomor Antrean", "Nilai": order.queueNumber },
    { "Keterangan": "ID Transaksi", "Nilai": order.transactionId || "-" },
    { "Keterangan": "Waktu Transaksi", "Nilai": order.timestamp + " WIB" },
    { "Keterangan": "Nama Pemesan", "Nilai": order.customerName },
    { "Keterangan": "Tipe Pesanan", "Nilai": order.orderType },
    { "Keterangan": "Nomor Meja", "Nilai": order.tableNumber },
    { "Keterangan": "Rincian Menu", "Nilai": order.menuSummary },
    { "Keterangan": "Level Pedas", "Nilai": order.spicyLevel || "-" },
    { "Keterangan": "Total Bayar (Rp)", "Nilai": order.totalPrice },
    { "Keterangan": "Metode Pembayaran", "Nilai": order.paymentMethod || "QRIS" },
    { "Keterangan": "Status Pembayaran", "Nilai": order.paymentStatus || "LUNAS" },
    { "Keterangan": "Status Dapur", "Nilai": order.status }
  ];

  if (order.cashReceived !== undefined && order.cashReceived !== null) {
    singleData.push({ "Keterangan": "Uang Tunai Diterima (Rp)", "Nilai": order.cashReceived });
    singleData.push({ "Keterangan": "Kembalian (Rp)", "Nilai": order.cashChange || 0 });
  }

  const filename = `Struk_Antrean_${order.queueNumber.replace('#', '')}_Centeng.xlsx`;

  if (typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.json_to_sheet(singleData);
    ws['!cols'] = [{ wch: 26 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Struk Pesanan");
    XLSX.writeFile(wb, filename);
    notifyToast(`Struk Excel ${order.queueNumber} berhasil di-download!`);
  } else {
    exportToCsvFallback(singleData, filename.replace('.xlsx', '.csv'));
  }
}

/** Fallback ekspor CSV dengan BOM UTF-8 jika library SheetJS gagal dimuat. */
function exportToCsvFallback(dataArray, filename) {
  if (!dataArray || dataArray.length === 0) return;

  const headers = Object.keys(dataArray[0]);
  let csvContent = '\uFEFF';
  csvContent += headers.map(h => `"${h}"`).join(';') + '\r\n';

  dataArray.forEach(row => {
    const rowValues = headers.map(h => {
      let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      val = val.replace(/"/g, '""');
      return `"${val}"`;
    });
    csvContent += rowValues.join(';') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  notifyToast('File CSV/Excel berhasil di-download!');
}
