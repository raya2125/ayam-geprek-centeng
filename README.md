# 🍗 Ayam Geprek Centeng - Official Website & Digital Menu

Website resmi dan katalog menu digital untuk **Ayam Geprek Centeng**. Dirancang dengan tampilan modern, bersih, ramah pengguna (*clean & appetizing design*), fitur keranjang pesanan (*shopping cart drawer*), live search menu, filter kategori, serta integrasi pemesanan langsung ke **WhatsApp**.

---

## ✨ Fitur Utama

1. **Desain Kuliner Autentik & Modern**
   - Tampilan bersih tanpa elemen artifisial, cocok untuk branding UMKM / restoran kuliner ayam geprek profesional.
   - Responsif di semua perangkat (smartphone, tablet, maupun laptop/komputer).

2. **Katalog Menu Lengkap & Terkategori**
   - Filter kategori interaktif: *Semua*, *Paket Geprek*, *Aneka Sambal*, *Topping & Tambahan*, *Minuman Segar*.
   - Fitur pencarian cepat (*Real-time Live Search*) untuk menemukan menu favorit dengan instan.
   - Pilihan level kepedasan dari Level 0 (Original) hingga Level 10 (Centeng Bar-bar).

3. **Keranjang Pesanan Interaktif (*Slide-over Cart Drawer*)**
   - Tombol `+ Tambah` pada tiap menu dengan drawer pesanan yang muncul dari samping.
   - Tambah/kurang jumlah porsi secara langsung dengan kalkulasi total otomatis dalam Rupiah.

4. **Integrasi Checkout WhatsApp Otomatis**
   - Modal konfirmasi pesanan: nama pemesan, ringkasan menu yang dipesan, pilihan level pedas, tipe pesanan (Delivery/Takeaway/Dine-in), dan alamat/catatan pengiriman.
   - Format pesan WhatsApp terkirim secara terstruktur dan rapi ke admin.

5. **Informasi Bisnis Lengkap**
   - Alamat lengkap kedai, jam operasional (10.00 - 22.00 WIB), metode pembayaran (QRIS, Tunai, Transfer Bank), dan ulasan pelanggan.

---

## 📁 Struktur File

```
tugas bkin web makanan/
├── index.html       # Halaman utama landing page & layout keranjang
├── style.css        # Desain visual, tipografi, dan responsive layout
├── app.js           # Logika interaktif: keranjang, live search, filter & WhatsApp checkout
├── menu-data.js     # Pusat konfigurasi data menu & nomor WhatsApp
└── README.md        # Panduan penggunaan & kustomisasi
```

---

## 🛠️ Cara Mengubah Nama Menu & Harga

Buka file [`menu-data.js`](menu-data.js). Anda dapat dengan bebas mengubah nama menu, kategori, harga, deskripsi, dan foto:

```javascript
{
  id: 1,
  name: "Geprek Centeng Krispi Jumbo", // Masukkan nama menu Anda
  category: "geprek",                   // Kategori: 'geprek', 'sambal', 'camilan', 'minuman'
  price: 18000,                         // Harga angka
  formattedPrice: "Rp 18.000",          // Format tampilan harga
  badge: "Best Seller",                 // Badge (opsional)
  description: "Ayam crispy jumbo + sambal ulek dadakan + nasi pulen.",
  image: "https://link-foto-makanan.jpg",
  isSpicySelectable: true
}
```

Untuk mengubah nomor WhatsApp tujuan pemesanan, ubah di baris atas [`menu-data.js`](menu-data.js):
```javascript
const WA_PHONE_NUMBER = "628xxxxxxxxxx"; // Ganti dengan nomor WhatsApp aktif Anda (awali dengan 62)
```

---

## 🚀 Live Demo & Repository
* **Web Live (GitHub Pages):** [https://raya2125.github.io/ayam-geprek-centeng/](https://raya2125.github.io/ayam-geprek-centeng/)
* **Repository GitHub:** [https://github.com/raya2125/ayam-geprek-centeng](https://github.com/raya2125/ayam-geprek-centeng)
