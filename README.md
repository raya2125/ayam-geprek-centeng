# 🍗 Ayam Geprek Centeng - Digital Kiosk, Live Queue & Payment Gateway System

Website resmi dan sistem pemesanan mandiri (*self-ordering kiosk*) untuk **Ayam Geprek Centeng**. Dirancang dengan tampilan hangat & humanis (*warm humanist dining aesthetic*), sistem **Pesan di Tempat (Dine-In)** dengan nomor meja, **Layar Antrean Real-Time ala Burger King**, **Gerbang Pembayaran Multi-Metode (Payment Gateway: QRIS, VA Bank, E-Wallet)**, serta integrasi pencatatan otomatis ke **Microsoft Excel (.xlsx)** dan **WhatsApp**.

---

## ✨ Fitur Utama

1. **💳 Gerbang Pembayaran Terpadu (Payment Gateway Multi-Channel)**
   - **QRIS Dinamis**: Menghasilkan kode QR standar QRIS nasional secara otomatis sesuai nominal tagihan, dilengkapi penghitung waktu mundur (*countdown timer 5 menit*), tombol unduh QR, dan verifikasi otomatis. Mendukung BCA Mobile, Livin Mandiri, BRImo, BNI Mobile, GoPay, OVO, DANA, dan ShopeePay.
   - **Virtual Account (VA Transfer)**: Pilihan 4 bank besar (**BCA**, **Mandiri**, **BRI / BRIVA**, **BNI**) lengkap dengan nomor VA 16-digit, tombol salin instan (*copy to clipboard*), dan panduan transfer ATM / m-Banking.
   - **E-Wallet Instan**: Mendukung pembayaran via GoPay, DANA, OVO, dan ShopeePay.
   - **Bayar Tunai di Kasir**: Pilihan fleksibel bagi pelanggan yang ingin membayar langsung di meja kasir.
   - **Animasi Verifikasi Cepat**: Dilengkapi efek loading verifikasi dan centang sukses yang otomatis menyematkan stempel resmi **LUNAS / PAID** pada struk digital dan status pesanan.

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

6. **📟 Layar Monitor Antrean ala Burger King (*Live Order Board*)**
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
├── index.html          # Struktur landing page, kiosk antrean, payment gateway modal, struk & excel
├── style.css           # Desain visual hangat humanis, kartu menu, payment gateway UI, antrean & struk
├── app.js              # Logika interaktif: keranjang, payment gateway (QRIS/VA), antrean BK & Excel
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

1. Buka file [`index.html`](index.html) langsung di peramban web (Google Chrome, Microsoft Edge, Mozilla Firefox).
2. Tambahkan **Ayam Geprek** atau **Es Teh** ke keranjang pesanan.
3. Klik tombol **Pesan di Tempat**, pilih **Nomor Meja**, lalu klik **Lanjut ke Pembayaran (Payment Gateway)**.
4. Di jendela **Payment Gateway**:
   - Pilih metode bayar: **QRIS**, **Virtual Account** (BCA, Mandiri, BRI, BNI), **E-Wallet**, atau **Bayar di Kasir**.
   - Klik tombol **Simulasi Bayar QRIS (Lunas)** atau **Cek Status / Simulasi Transfer Berhasil**.
5. Anda akan melihat animasi verifikasi pembayaran sukses, kemudian struk digital terbuka dengan stempel hijau **LUNAS • PAID**, nomor antrean aktif di **Layar Antrean Burger King**, dan otomatis tercatat di **Rekap Kasir Excel**.
