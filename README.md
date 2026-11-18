# 🍗 Ayam Geprek Centeng - Digital Kiosk, Live Queue & Payment Gateway System

Website resmi dan sistem pemesanan mandiri (*self-ordering kiosk*) untuk **Ayam Geprek Centeng**. Dirancang dengan tampilan hangat & humanis (*warm humanist dining aesthetic*), sistem **Pesan di Tempat (Dine-In)** dengan nomor meja, **Layar Antrean Real-Time**, **Gerbang Pembayaran Multi-Metode (Payment Gateway: QRIS, VA Bank, E-Wallet)**, serta integrasi pencatatan otomatis ke **Microsoft Excel (.xlsx)** dan **WhatsApp**.

---

## ✨ Fitur Utama

1. **💳 Portal Pembeli — Payment Gateway Non-Tunai (`index.html`)**
   - **Khusus Pembeli Cashless**: Pembeli yang memesan langsung dari katalog/kiosk melakukan pembayaran online melalui **QRIS**, **Virtual Account** (**BCA**, **Mandiri**, **BRI / BRIVA**, **BNI**), atau **E-Wallet** (**GoPay**, **DANA**, **OVO**, **ShopeePay**).
   - **QRIS Dinamis**: Menghasilkan kode QR standar QRIS secara otomatis sesuai nominal tagihan, dilengkapi penghitung waktu mundur (*countdown timer 5 menit*), tombol unduh QR, dan verifikasi otomatis.
   - **Animasi Verifikasi Cepat**: Dilengkapi efek loading verifikasi dan centang sukses yang otomatis menyematkan stempel resmi **LUNAS • PAID** pada struk digital dan status pesanan.

2. **💵 Portal Khusus Penjual / Kasir Tunai (`kasir.html`)**
   - **Input Pesanan Cepat (POS)**: Dirancang khusus untuk penjual yang melayani pelanggan bayar tunai (*Cash*)—tinggal klik apa yang dibeli & dipesan (menu, tipe *Dine-In/Takeaway*, nomor meja, level pedas, nama/catatan opsional).
   - **Kalkulator Uang Tunai & Kembalian**: Input uang diterima dengan tombol nominal cepat (**Uang Pas**, **Rp 20.000**, **Rp 50.000**, **Rp 100.000**) dan perhitungan kembalian otomatis secara *real-time*.
   - **Kelola Antrean & Pelunasan**: Penjual dapat langsung menandai status dapur (**Siap Diambil** / **Selesai**), melunasi pesanan via cash, mencetak struk, dan menyinkronkan data otomatis lintas tab dengan layar antrean pembeli.

2. **Logo & Maskot Ayam Resmi**
   - Menggunakan maskot ayam jago jempolan khas kuliner nusantara yang ramah dan bersahabat di navbar, hero, struk digital, layar antrean, dan footer.

3. **Desain Hangat & Humanis (*Warm Appetite Palette*)**
   - Menggantikan nuansa gelap/merah menyala yang agresif dengan palet hangat ala restoran santai: krem vanila lembut (`#FAF6EF`), aksen terracotta panggang (`#C84626`), emas mustard (`#E88C08`), dan teks espresso cokelat yang nyaman di mata.

4. **2 Pilihan Menu Utama Spesial**
   - **Ayam Geprek** (Rp 15.000) – Pilihan level pedas 0 sampai 10 (Centeng Bar-bar).
   - **Es Teh Manis** (Rp 5.000) – Es teh melati segar dingin pereda pedas terbaik.

5. **🍽️ Pesan di Tempat (Dine-In Kiosk) & Pemilih Meja Interaktif**
   - Pelanggan yang datang ke kedai dapat langsung memilih nomor meja mereka (Meja 01 s/d Meja 12).
   - Pesanan langsung terhubung dengan nomor meja pelanggan tanpa perlu berdesakan di depan kasir.
   - Pilihan fleksibel antara: **Makan di Tempat (Dine-In)**, **Bawa Pulang (Takeaway)**, atau **Pesan Antar (Delivery)**.

6. **📟 Layar Monitor Antrean (*Live Order Board*)**
   - Tampilan monitor antrean pesanan digital dengan 2 kolom terpisah:
     - 🟡 **SEDANG DISIAPKAN (PREPARING IN KITCHEN)** dengan lampu indikator berkedip dan status pembayaran (`✓ LUNAS` / `KASIR`).
     - 🟢 **SIAP DIAMBIL / DIANTAR (READY FOR COLLECTION)** dengan kartu hijau bercahaya.
   - Dilengkapi tombol simulasi dapur/kasir (`✓ Siap` dan `✓ Selesai`) untuk menggerakkan status pesanan secara real-time.
   - Jam digital realtime WIB di layar monitor.

7. **🧾 Struk Digital Antrean & Stempel LUNAS**
   - Menerbitkan struk digital instan setelah pembayaran dengan nomor antrean besar (contoh: `#001`), stempel **LUNAS • PAID**, ID Transaksi resmi (`TRX-YYYYMMDD-XXXX`), rincian menu, nomor meja, dan total harga.
   - Tombol instan untuk download struk ke Excel maupun kirim ke WhatsApp kasir.

8. **📊 Rekap Kasir & Database Excel Otomatis (.xlsx)**
   - **Pencatatan Otomatis**: Setiap pesanan yang masuk otomatis tersimpan ke database browser (`localStorage`).
   - **Kolom Pembayaran**: Mencatat Metode Pembayaran (QRIS, VA Bank, E-Wallet, Tunai), Status Pembayaran (LUNAS / Kasir), dan ID Transaksi.
   - **Download Excel (.xlsx)**: Menggunakan pustaka SheetJS untuk mengunduh rekap spreadsheet resmi berformat `.xlsx`.
   - **Ringkasan Kasir**: Menampilkan total pesanan, total omset/pendapatan, jumlah pesanan lunas, dan pesanan bayar di kasir.

---

## 📁 Struktur File Proyek

```
tugas bkin web makanan/
├── index.html          # Halaman Pembeli: katalog, pesan di tempat, payment gateway non-tunai (QRIS/VA/E-Wallet), antrean BK & struk
├── kasir.html          # Halaman Khusus Penjual / Kasir Cash: input pesanan cepat, kalkulator kembalian, kelola antrean & omzet
├── style.css           # Desain visual hangat humanis, payment gateway UI, halaman kasir POS, antrean & struk
├── shared-store.js     # Modul database bersama (localStorage), generator antrean/ID, dan ekspor Excel (.xlsx / CSV)
├── app.js              # Logika halaman pembeli: keranjang, payment gateway non-tunai & layar antrean Burger King
├── kasir.js            # Logika halaman penjual/kasir: POS input menu cepat, hitung kembalian cash, struk cetak & kelola order
├── menu-data.js        # Data 2 menu utama dan konfigurasi Payment Gateway (NMID, nomor VA)
├── assets/
│   ├── ayam-geprek.jpg    # Foto resmi menu Ayam Geprek
│   ├── es-teh.jpg         # Foto resmi menu Es Teh
│   ├── logo-chicken.jpg   # Foto maskot ayam resmi Centeng
│   ├── qrcode.min.js      # Library offline generator QR Code QRIS
│   └── brand-reference.png# Referensi logo brand
└── README.md           # Panduan dokumentasi proyek
```

---

## 🛠️ Cara Menguji / Menjalankan

### A. Alur Pembeli (Non-Tunai: QRIS / VA / E-Wallet)
1. Buka [`index.html`](index.html) di peramban web.
2. Tambahkan **Ayam Geprek** atau **Es Teh** ke keranjang, pilih nomor meja, lalu klik **Lanjut ke Pembayaran (Payment Gateway)**.
3. Pilih **QRIS**, **Virtual Account**, atau **E-Wallet** dan klik tombol simulasi bayar untuk melihat verifikasi, struk berstempel **LUNAS**, serta antrean otomatis.

### B. Alur Penjual / Kasir (Pembayaran Cash / Tunai)
1. Buka [`kasir.html`](kasir.html) (atau klik tautan **Kasir (Penjual)** di navigasi atas).
2. Klik menu yang dibeli pelanggan (**+ Tambah 1**, **+2**, **+5**), pilih **Makan di Tempat / Bawa Pulang**, nomor meja, serta level pedas.
3. Masukkan uang tunai yang diterima (atau klik **Uang Pas** / nominal cepat) lalu klik **Simpan Pesanan & Terima Cash (LUNAS)**.
4. Struk resmi kasir akan muncul beserta rincian kembalian, dan pesanan otomatis masuk ke layar antrean dapur serta rekap Excel (`.xlsx`).
