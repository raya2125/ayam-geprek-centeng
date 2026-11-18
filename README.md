# 🍗 Ayam Geprek Centeng - Digital Kiosk, Live Queue & Payment Gateway System

Website resmi dan sistem pemesanan mandiri (*self-ordering kiosk*) untuk **Ayam Geprek Centeng**. Dirancang dengan tampilan hangat & humanis (*warm humanist dining aesthetic*), sistem **Pesan di Tempat (Dine-In)** dengan nomor meja & **Take Away (Bawa Pulang)**, **Layar Antrean Real-Time**, **Gerbang Pembayaran Multi-Metode (Payment Gateway: QRIS, VA Bank, E-Wallet)**, portal kasir tunai, serta pencatatan otomatis ke **Microsoft Excel (.xlsx)**.

---

## ✨ Fitur Utama

1. **💳 Portal Pembeli (`index.html`)**
   - **2 Pilihan Pembayaran:** Pembeli dapat membayar non-tunai lewat **QRIS** (mendukung BCA/Mandiri/BRI/BNI & GoPay/OVO/DANA/ShopeePay) atau memilih **Bayar di Tempat (Kasir)**.
   - **Validasi Bayar di Tempat:** Pembeli yang memilih *Bayar di Tempat* memperoleh **Nomor Antrean** & **Kode Bayar 4-digit** dengan status *Belum Bayar*; pesanan baru dimasak dapur setelah kasir menerima uang tunai dan memvalidasinya menjadi **LUNAS**.

2. **💵 Portal Khusus Penjual / Kasir Tunai (`kasir.html`)**
   - **Input Pesanan Cepat (POS):** Tinggal klik apa yang dibeli & dipesan (menu, *Dine-In/Take Away*, nomor meja) plus kalkulator uang tunai & kembalian.
   - **Validasi Pembayaran di Tempat:** Pesanan pembeli yang memilih *Bayar di Tempat* otomatis muncul di kotak validasi kasir lengkap dengan kode 4-digit agar penjual tinggal mencocokkan, menerima cash, dan meneruskannya ke dapur.

2. **Logo & Maskot Ayam Resmi**
   - Menggunakan maskot ayam jago jempolan khas kuliner nusantara yang ramah dan bersahabat di navbar, hero, struk digital, layar antrean, dan footer.

3. **Desain Hangat & Humanis (*Warm Appetite Palette*)**
   - Menggantikan nuansa gelap/merah menyala yang agresif dengan palet hangat ala restoran santai: krem vanila lembut (`#FAF6EF`), aksen terracotta panggang (`#C84626`), emas mustard (`#E88C08`), dan teks espresso cokelat yang nyaman di mata.

4. **2 Pilihan Menu Utama Spesial**
   - **Ayam Geprek** (Rp 10.000) – Ayam goreng krispi renyah dengan sambal korek cabai rawit merah dadakan + nasi putih hangat.
   - **Es Teh Manis** (Rp 5.000) – Es teh melati segar dingin.

5. **🍽️ Pesan di Tempat (Dine-In Kiosk) & Pemilih Meja Interaktif**
   - Pelanggan yang datang ke kedai dapat langsung memilih nomor meja mereka (Meja 01 s/d Meja 12).
   - Pesanan langsung terhubung dengan nomor meja pelanggan tanpa perlu berdesakan di depan kasir.
   - Pilihan praktis antara: **Makan di Tempat (Dine-In)** dengan nomor meja atau **Bawa Pulang (Take Away)**.

6. **📟 Layar Monitor Antrean (*Live Order Board*)**
   - Tampilan monitor antrean pesanan digital dengan 2 kolom terpisah:
     - 🟡 **SEDANG DISIAPKAN (PREPARING IN KITCHEN)** dengan lampu indikator berkedip dan status pembayaran (`✓ LUNAS` / `KASIR`).
     - 🟢 **SIAP DIAMBIL / DIANTAR (READY FOR COLLECTION)** dengan kartu hijau bercahaya.
   - Dilengkapi tombol simulasi dapur/kasir (`✓ Siap` dan `✓ Selesai`) untuk menggerakkan status pesanan secara real-time.
   - Jam digital realtime WIB di layar monitor.

7. **🧾 Struk Digital Antrean & Stempel LUNAS**
   - Menerbitkan struk digital instan setelah pembayaran dengan nomor antrean besar (contoh: `#001`), stempel **LUNAS • PAID**, ID Transaksi resmi (`TRX-YYYYMMDD-XXXX`), rincian menu, nomor meja, dan total harga.
   - Tombol instan untuk memantau status pesanan langsung di layar antrean.

8. **📊 Rekap Kasir, File Excel Otomatis & Google Spreadsheet (Khusus Halaman Kasir)**
   - **Tersembunyi dari Pembeli**: Seluruh menu admin & tombol Excel hanya tampil di halaman penjual ([`kasir.html`](kasir.html)), sehingga tampilan pembeli tetap bersih.
   - **File Excel Lokal Otomatis (`Catatan_Penjualan_Centeng.xlsx`)**: Saat dijalankan via `node server.js`, setiap pesanan & perubahan status otomatis dicatat langsung ke file Excel lokal di folder proyek (lengkap dengan sheet `Transaksi` dan `Ringkasan Omzet` berumus Excel).
   - **Google Spreadsheet**: Terhubung ke Google Spreadsheet **Catatan Penjualan - Ayam Geprek Centeng** (dengan skrip [`google-apps-script.js`](google-apps-script.js) opsional untuk pencatatan langsung dari web online).
   - **Download Excel (.xlsx)**: Tombol unduh cepat di [`kasir.html`](kasir.html) memakai SheetJS.

---

## 📁 Struktur File Proyek

```
tugas bkin web makanan/
├── index.html                        # Halaman Pembeli: katalog, pesan di tempat, bayar QRIS / Bayar di Tempat, antrean & struk
├── kasir.html                        # Halaman Khusus Penjual / Kasir: input cash, validasi bayar di tempat, rekap Excel & Google Sheet
├── server.js                         # Server localhost Node.js + API sinkronisasi otomatis ke Catatan_Penjualan_Centeng.xlsx
├── xlsx-writer.js                    # Modul Node.js pembuat file Excel (.xlsx) 2 sheet tanpa dependensi eksternal
├── google-apps-script.js             # Skrip Web App opsional untuk sinkronisasi otomatis ke Google Spreadsheet
├── Catatan_Penjualan_Centeng.xlsx    # Buku catatan penjualan Excel lokal yang otomatis ter-update saat server berjalan
├── style.css                         # Desain visual hangat humanis, modal pembayaran, halaman kasir POS, antrean & struk
├── shared-store.js                   # Modul database bersama (localStorage + sync server.js), generator antrean & ekspor Excel
├── app.js                            # Logika halaman pembeli: keranjang, pembayaran QRIS / Bayar di Tempat & layar antrean
├── kasir.js                          # Logika halaman penjual/kasir: POS input cepat, kalkulator cash, validasi kode & rekap
├── menu-data.js                      # Data 2 menu utama, konfigurasi QRIS & URL Google Spreadsheet
├── assets/
│   ├── ayam-geprek.jpg               # Foto resmi menu Ayam Geprek
│   ├── es-teh.jpg                    # Foto resmi menu Es Teh
│   ├── logo-chicken.jpg              # Foto maskot ayam resmi Centeng
│   ├── qris-code.jpg                 # Gambar kode QRIS untuk pembayaran non-tunai
│   └── brand-reference.png           # Referensi logo brand
└── README.md                         # Panduan dokumentasi proyek
```

---

## 🛠️ Cara Menguji / Menjalankan

### Menjalankan Server Lokal + Auto-Catat Excel
```bash
node server.js
```
Lalu buka:
- **Halaman Pembeli:** `http://localhost:3000`
- **Halaman Penjual / Kasir:** `http://localhost:3000/kasir.html`
- **File Excel Lokal:** `Catatan_Penjualan_Centeng.xlsx` (ter-update otomatis setiap ada transaksi)

### A. Alur Pembeli
1. Buka `http://localhost:3000` (atau [`index.html`](index.html)).
2. Tambahkan **Ayam Geprek** atau **Es Teh** ke keranjang, pilih nomor meja (atau Take Away), lalu klik **Lanjut ke Pembayaran**.
3. Pilih **QRIS** atau **Bayar di Tempat** (dapat Kode Bayar 4-digit lalu divalidasi lunas oleh kasir di `kasir.html`).

### B. Alur Penjual / Kasir (`kasir.html` — Link Terpisah)
1. Buka langsung URL terpisah `http://localhost:3000/kasir` (atau `kasir.html` / `/kasir.html` di GitHub Pages; halaman kasir tidak ditautkan dari halaman pembeli agar pembeli tidak bisa masuk ke kasir).
2. Untuk pesanan walk-in cash: klik menu (**+ Tambah 1**, **+2**, **+5**), pilih meja/take away, masukkan uang tunai (atau biarkan kosong untuk uang pas) lalu klik **Simpan Pesanan & Terima Cash (LUNAS)**.
3. Untuk pembeli yang memilih **Bayar di Tempat**: cocokkan Kode Bayar 4-digit di kotak validasi, lalu klik **Validasi Cash & Masak**.
4. Semua catatan otomatis masuk ke `Catatan_Penjualan_Centeng.xlsx`, dan bisa diunduh lewat tombol **Download Excel (.xlsx)** atau dibuka lewat tombol **Buka Google Sheet**.
