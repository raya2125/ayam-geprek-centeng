# 🍗 Ayam Geprek Centeng - Digital Kiosk & Menu System

Website resmi dan sistem pemesanan mandiri (*self-ordering kiosk*) untuk **Ayam Geprek Centeng**. Dirancang dengan tampilan hangat, ramah & humanis (*warm humanist dining aesthetic*), sistem **Pesan di Tempat (Dine-In)** dengan nomor meja, **Layar Antrean Real-Time ala Burger King**, serta integrasi pencatatan otomatis ke **Microsoft Excel (.xlsx)** dan **WhatsApp**.

---

## ✨ Fitur Utama

1. **Logo & Maskot Ayam Resmi**
   - Menggunakan maskot ayam jago jempolan khas kuliner nusantara yang ramah dan bersahabat di navbar, hero, struk digital, dan footer.

2. **Desain Hangat & Humanis (*Warm Appetite Palette*)**
   - Menggantikan nuansa gelap/merah menyala yang agresif dengan palet hangat ala restoran santai: krem vanila lembut (`#FAF6EF`), aksen terracotta panggang (`#C84626`), emas mustard (`#E88C08`), dan teks espresso cokelat yang nyaman di mata.

3. **2 Pilihan Menu Utama Spesial**
   - **Ayam Geprek** (Rp 15.000) – Pilihan level pedas 0 sampai 10 (Centeng Bar-bar).
   - **Es Teh Manis** (Rp 5.000) – Es teh melati segar dingin pereda pedas terbaik.

4. **🍽️ Pesan di Tempat (Dine-In Kiosk) & Pemilih Meja Interaktif**
   - Pelanggan yang datang ke kedai dapat langsung memilih nomor meja mereka (Meja 01 s/d Meja 12).
   - Pesanan langsung terhubung dengan nomor meja pelanggan tanpa perlu berdesakan di depan kasir.
   - Pilihan fleksibel antara: **Makan di Tempat (Dine-In)**, **Bawa Pulang (Takeaway)**, atau **Pesan Antar (Delivery)**.

5. **📟 Layar Monitor Antrean ala Burger King (*Live Order Board*)**
   - Tampilan monitor antrean pesanan digital dengan 2 kolom terpisah:
     - 🟡 **SEDANG DISIAPKAN (PREPARING IN KITCHEN)** dengan lampu indikator berkedip.
     - 🟢 **SIAP DIAMBIL / DIANTAR (READY FOR COLLECTION)** dengan kartu hijau bercahaya.
   - Dilengkapi tombol simulasi dapur/kasir (`✓ Siap` dan `✓ Selesai`) untuk menggerakkan status pesanan secara real-time.
   - Jam digital realtime WIB di layar monitor.

6. **🧾 Struk Digital Antrean (Burger King Style)**
   - Menerbitkan struk digital instan setelah pemesanan dengan nomor antrean besar (contoh: `#001`), rincian menu, nomor meja, dan total harga.
   - Tombol instan untuk download struk ke Excel maupun kirim ke WhatsApp kasir.

7. **📊 Rekap Kasir & Database Excel Otomatis (.xlsx)**
   - **Pencatatan Otomatis**: Setiap pesanan yang masuk otomatis tersimpan ke database browser (`localStorage`).
   - **Download Excel (.xlsx)**: Menggunakan pustaka SheetJS untuk mengunduh rekap spreadsheet resmi berformat `.xlsx` lengkap dengan kolom No, Nomor Antrean, Waktu, Nama, Tipe, Meja, Menu, Level Pedas, Total, dan Status.
   - **Auto-Download Toggle**: Pilihan otomatis download file Excel setiap kali pelanggan menyelesaikan pesanan.
   - **Ringkasan Kasir**: Menampilkan total pesanan, total omset/pendapatan, jumlah pesanan dine-in, dan pesanan takeaway.

---

## 📁 Struktur File Proyek

```
tugas bkin web makanan/
├── index.html       # Struktur landing page, kiosk antrean, modal struk & modal excel
├── style.css        # Desain visual hangat humanis, kartu menu, layar antrean & struk
├── app.js           # Logika interaktif: keranjang, antrean BK, dine-in meja & generator Excel
├── menu-data.js     # Data 2 menu utama (Ayam Geprek & Es Teh) dan nomor WhatsApp
├── assets/
│   ├── logo-chicken.jpg       # Foto maskot ayam resmi Centeng
│   └── brand-reference.png   # Referensi logo brand
└── README.md        # Panduan dokumentasi proyek
```

---

## 🛠️ Cara Menguji / Menjalankan

1. Buka file [`index.html`](index.html) langsung di peramban web (Google Chrome, Microsoft Edge, Mozilla Firefox).
2. Tambahkan **Ayam Geprek** atau **Es Teh** ke keranjang pesanan.
3. Klik tombol **Pesan di Tempat**, pilih **Nomor Meja**, lalu klik **Buat Pesanan & Dapatkan Nomor Antrean**.
4. Anda akan langsung melihat:
   - **Struk Digital Antrean** dengan nomor antrean (misal: `#001`).
   - File Excel otomatis terunduh atau dapat diunduh melalui tombol **Download Rekap Excel (.xlsx)**.
   - Nomor antrean Anda muncul di kolom **Sedang Disiapkan** pada bagian **Layar Antrean**.
   - Klik tombol **Rekap Excel** di navbar atas untuk melihat tabel transaksi kasir dan total omzet secara langsung.
