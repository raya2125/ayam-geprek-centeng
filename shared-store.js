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
    price: 10000,
    formattedPrice: "Rp 10.000",
    badge: "Best Seller",
    description: "Ayam goreng krispi renyah gurih dengan sambal korek ulek dadakan cabai rawit merah asli + nasi putih pulen hangat.",
    image: "assets/ayam-geprek.jpg",
    isSpicySelectable: false
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
  },
  {
    id: 3,
    name: "Hati Ayam",
    category: "lauk",
    price: 4000,
    formattedPrice: "Rp 4.000",
    badge: "Lauk",
    description: "Hati ampela ayam goreng bumbu rempah gurih renyah, cocok sebagai lauk pendamping ayam geprek.",
    image: "assets/hati-ayam.jpg",
    isSpicySelectable: false
  },
  {
    id: 4,
    name: "Jamur Goreng",
    category: "lauk",
    price: 2000,
    formattedPrice: "Rp 2.000",
    badge: "Lauk",
    description: "Jamur tiram goreng tepung krispi satuan porsi kecil yang renyah dan gurih.",
    image: "assets/jamur-goreng.jpg",
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

const ordersSyncChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('centeng_orders_sync')
  : null;

/** Mengirim sinyal sinkronisasi instan ke tab lain dalam browser yang sama. */
function notifyOrderSyncChannel() {
  if (ordersSyncChannel) {
    try {
      ordersSyncChannel.postMessage({ type: 'orders_updated', at: Date.now() });
    } catch (e) {}
  }
}

/** Menyimpan seluruh daftar pesanan ke localStorage & menyinkronkan ke server Excel/Sheets. */
function setStoredOrders(orders, queueCounterOverride = null) {
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  const counter = queueCounterOverride !== null
    ? queueCounterOverride
    : (parseInt(localStorage.getItem(STORAGE_QUEUE_COUNTER_KEY) || '0', 10) || 0);
  syncLedgerToBackend(orders, counter);
  notifyOrderSyncChannel();
}

/** Menghapus seluruh pesanan di localStorage & mereset catatan server/Excel. */
function clearStoredOrders() {
  localStorage.setItem(STORAGE_ORDERS_KEY, '[]');
  localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, '0');
  syncLedgerToBackend([], 0);
  notifyOrderSyncChannel();
}

/** Menambahkan satu pesanan baru ke database localStorage & catatan otomatis. */
function saveOrderToStorage(order) {
  const orders = getStoredOrders();
  orders.push(order);
  setStoredOrders(orders);
}

/** Mengirim pembaruan pesanan ke server Node.js (untuk menulis .xlsx lokal) & Google Apps Script. */
function syncLedgerToBackend(orders, queueCounter) {
  if (typeof fetch !== 'function' || typeof window === 'undefined' || !window.location) return;

  const isLocalServer = window.location.protocol.startsWith('http') && !window.location.hostname.endsWith('github.io');
  if (isLocalServer) {
    fetch('/api/orders/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders, queueCounter })
    }).catch(() => {});
  }

  if (typeof GOOGLE_SHEETS_WEBHOOK_URL === 'string' && GOOGLE_SHEETS_WEBHOOK_URL.trim() !== '') {
    fetch(GOOGLE_SHEETS_WEBHOOK_URL.trim(), {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ orders })
    }).catch(() => {});
  }
}

/** Memuat pesanan terbaru dari server Node.js (jika aktif) dan menyinkronkan ke localStorage. */
function loadOrdersFromBackend(onSynced) {
  if (typeof fetch !== 'function' || typeof window === 'undefined' || !window.location) return;
  const isLocalServer = window.location.protocol.startsWith('http') && !window.location.hostname.endsWith('github.io');
  if (!isLocalServer) return;

  fetch('/api/orders', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data || !data.ok || !Array.isArray(data.orders)) return;
      const serialized = JSON.stringify(data.orders);
      const prev = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (serialized !== prev) {
        localStorage.setItem(STORAGE_ORDERS_KEY, serialized);
        localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, String(data.queueCounter || data.orders.length));
        if (typeof onSynced === 'function') onSynced(data.orders);
      }
    })
    .catch(() => {});
}

/** Mendaftarkan listener sinkronisasi otomatis real-time (BroadcastChannel, storage, focus, polling 2.5 detik). */
function subscribeOrderSync(onChange) {
  if (typeof onChange !== 'function') return;

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_ORDERS_KEY || event.key === STORAGE_QUEUE_COUNTER_KEY) {
        onChange();
      }
    });
    window.addEventListener('focus', () => loadOrdersFromBackend(onChange));
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) loadOrdersFromBackend(onChange);
    });
  }

  if (ordersSyncChannel && typeof ordersSyncChannel.addEventListener === 'function') {
    ordersSyncChannel.addEventListener('message', () => onChange());
  }

  if (typeof setInterval === 'function') {
    setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        loadOrdersFromBackend(onChange);
      }
    }, 2500);
  }
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
