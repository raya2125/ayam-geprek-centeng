/**
 * ============================================================
 * AYAM GEPREK CENTENG - LOCALHOST DEV SERVER & AUTO-EXCEL SYNC
 * Menjalankan web pembeli (index.html), kasir (kasir.html), dan
 * mencatat setiap pesanan otomatis ke file Excel lokal (.xlsx).
 * ============================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { writeOrdersXlsxFile } = require('./xlsx-writer');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ORDERS_DB_PATH = path.join(DATA_DIR, 'orders.json');
const EXCEL_LEDGER_PATH = path.join(ROOT_DIR, 'Catatan_Penjualan_Centeng.xlsx');
const PREFERRED_PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

const DEFAULT_SEED_DB = {
  queueCounter: 2,
  orders: [
    {
      id: 1001,
      queueNumber: '#001',
      timestamp: 'Hari ini 12:15',
      customerName: 'Budi Santoso',
      orderType: 'Makan di Tempat',
      tableNumber: 'Meja 03',
      items: [
        { name: 'Ayam Geprek', qty: 2, price: 15000, subtotal: 30000 },
        { name: 'Es Teh', qty: 2, price: 5000, subtotal: 10000 }
      ],
      menuSummary: '2x Ayam Geprek, 2x Es Teh',
      spicyLevel: 'Level 3 (Sedang)',
      notes: 'Sambal dipisah',
      totalPrice: 40000,
      status: 'Siap Diambil',
      paymentMethod: 'QRIS (kiki ramadhani)',
      paymentStatus: 'LUNAS',
      transactionId: 'TRX-20261118-84920'
    },
    {
      id: 1002,
      queueNumber: '#002',
      timestamp: 'Hari ini 12:20',
      customerName: 'Siti Rahma',
      orderType: 'Bawa Pulang',
      tableNumber: '-',
      items: [
        { name: 'Ayam Geprek', qty: 1, price: 15000, subtotal: 15000 },
        { name: 'Es Teh', qty: 1, price: 5000, subtotal: 5000 }
      ],
      menuSummary: '1x Ayam Geprek, 1x Es Teh',
      spicyLevel: 'Level 5 (Pedas Nampol)',
      notes: '-',
      totalPrice: 20000,
      status: 'Sedang Disiapkan',
      paymentMethod: 'QRIS (kiki ramadhani)',
      paymentStatus: 'LUNAS',
      transactionId: 'TRX-20261118-93102'
    }
  ]
};

/** Memastikan folder data dan database awal tersedia serta file Excel ter-sinkron. */
function ensureLedgerInitialized() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = readDb();
  writeDbAndExcel(db.orders, db.queueCounter);
}

/** Membaca data pesanan dari data/orders.json (atau seed awal jika belum ada). */
function readDb() {
  try {
    if (fs.existsSync(ORDERS_DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(ORDERS_DB_PATH, 'utf8'));
      return {
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        queueCounter: typeof parsed.queueCounter === 'number' ? parsed.queueCounter : 0
      };
    }
  } catch (err) {
    console.warn('Gagal membaca orders.json, memakai data awal:', err.message);
  }
  return {
    orders: JSON.parse(JSON.stringify(DEFAULT_SEED_DB.orders)),
    queueCounter: DEFAULT_SEED_DB.queueCounter
  };
}

/** Menyimpan data pesanan ke JSON serta menuliskan ulang file Catatan_Penjualan_Centeng.xlsx. */
function writeDbAndExcel(orders, queueCounter) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const payload = {
    updatedAt: new Date().toISOString(),
    queueCounter: typeof queueCounter === 'number' ? queueCounter : 0,
    orders: Array.isArray(orders) ? orders : []
  };
  fs.writeFileSync(ORDERS_DB_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return writeOrdersXlsxFile(EXCEL_LEDGER_PATH, payload.orders);
}

/** Mengirimkan respons JSON standar. */
function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

/** Membaca body request JSON hingga batas 1 MB. */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload terlalu besar'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

/** Menangani endpoint API untuk membaca/menyimpan pesanan & sinkronisasi Excel lokal. */
async function handleApiRequest(req, res, pathname) {
  if (pathname === '/api/orders' && req.method === 'GET') {
    const db = readDb();
    sendJson(res, 200, { ok: true, orders: db.orders, queueCounter: db.queueCounter });
    return true;
  }

  if (pathname === '/api/orders/sync' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const orders = Array.isArray(body.orders) ? body.orders : [];
      const queueCounter = parseInt(body.queueCounter, 10) || 0;
      const xlsxResult = writeDbAndExcel(orders, queueCounter);
      sendJson(res, 200, {
        ok: true,
        excelFile: 'Catatan_Penjualan_Centeng.xlsx',
        excelUpdated: xlsxResult.written,
        locked: Boolean(xlsxResult.locked)
      });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
    }
    return true;
  }

  return false;
}

/** Mengubah URL request menjadi path file lokal yang aman di dalam ROOT_DIR. */
function resolveSafeFilePath(requestUrl) {
  let cleanUrl;
  try {
    cleanUrl = decodeURIComponent((requestUrl || '/').split('?')[0]);
  } catch (e) {
    return null;
  }
  const relativePath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
  const fullPath = path.resolve(ROOT_DIR, relativePath);

  if (fullPath !== ROOT_DIR && !fullPath.startsWith(ROOT_DIR + path.sep)) {
    return null;
  }
  return fullPath;
}

/** Menangani setiap HTTP request (API sinkronisasi Excel maupun file statis). */
async function handleRequest(req, res) {
  const pathname = (req.url || '/').split('?')[0];
  if (pathname.startsWith('/api/')) {
    const handled = await handleApiRequest(req, res, pathname);
    if (!handled) {
      sendJson(res, 404, { ok: false, error: 'Endpoint tidak ditemukan' });
    }
    return;
  }

  const targetPath = resolveSafeFilePath(req.url);
  if (!targetPath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(targetPath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(targetPath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store'
      });
      res.end(data);
    });
  });
}

/** Memulai server HTTP dengan fallback port otomatis jika port utama terpakai. */
function startServer(port) {
  ensureLedgerInitialized();
  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === PREFERRED_PORT) {
      console.log(`Port ${port} sedang dipakai, mencoba port ${port + 1}...`);
      startServer(port + 1);
    } else if (err.code === 'EADDRINUSE' && port !== 0) {
      startServer(0);
    } else {
      console.error('Gagal menjalankan server:', err);
      process.exit(1);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    const boundPort = server.address().port;
    console.log(`Server Ayam Geprek Centeng aktif!`);
    console.log(`Halaman Pembeli : http://localhost:${boundPort}`);
    console.log(`Halaman Kasir   : http://localhost:${boundPort}/kasir.html`);
    console.log(`File Excel Auto : ${EXCEL_LEDGER_PATH}`);
  });
}

startServer(PREFERRED_PORT);
