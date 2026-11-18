/**
 * ============================================================
 * AYAM GEPREK CENTENG - LOCALHOST DEV SERVER (NODE.JS)
 * Menjalankan web pembeli (index.html) & kasir (kasir.html)
 * secara lokal di browser via http://localhost:3000
 * ============================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
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
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

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

/** Menangani setiap HTTP request statis dengan header anti-cache dev. */
function handleRequest(req, res) {
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
  });
}

startServer(PREFERRED_PORT);
