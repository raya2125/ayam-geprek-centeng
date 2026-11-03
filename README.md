# 🍗 Ayam Geprek Centeng - Official Landing Page

Landing page modern, responsif, dan interaktif untuk usaha kuliner **Ayam Geprek Centeng**. Dilengkapi dengan fitur **3D Interactive Menu Preview** berbasis WebGL (Three.js) yang super ringan (*lightweight*, tanpa beban download 3D model eksternal yang berat), serta sistem katalog menu modular yang mudah dikustomisasi.

---

## ✨ Fitur Utama

1. **3D Interactive Food Preview (Ultra-Lightweight & Cepat)**
   - Visualisasi 3D realistis Ayam Geprek di atas cobek batu tradisional beralas daun pisang.
   - Efek uap panas (*steaming particles*) dinamis.
   - Kontrol kamera 360° (*OrbitControls*): drag untuk putar, zoom, dan pan.
   - **Kustomisasi Real-Time:**
     - Ganti varian sambal: *Sambal Korek Bawang*, *Sambal Matah Bali*, *Sambal Ijo Padang*, & *Saus Keju*.
     - Slider Level Pedas (Level 0 sampai 10) dengan visualisasi ketebalan sambal dan taburan biji cabai rawit dadakan.
     - Toggle topping 3D: Nasi putih hangat pulen, lelehan keju mozarella (*melted cheese*), dan irisan timun lalapan segar.
     - Tombol Reset View dan Auto-Rotate 360°.

2. **Daftar Menu Fleksibel & Terkategori (Modular Data)**
   - Filter kategori interaktif: *Semua Menu*, *Paket Geprek*, *Aneka Sambal*, *Topping & Camilan*, *Minuman Segar*.
   - Saat ini disiapkan dalam bentuk slot placeholder yang rapi dan siap diisi nama menu kapan saja melalui file `menu-data.js`.
   - Tombol pesan langsung terhubung ke WhatsApp.

3. **Integrasi Pesanan Cepat WhatsApp (Direct Order)**
   - Popup modal pesanan otomatis menghitung menu, level pedas, jumlah porsi, serta catatan alamat pengiriman.
   - Menghasilkan tautan pesan WhatsApp dengan template format pemesanan rapi.

4. **Section Informasi Lengkap**
   - Hero banner dengan rating bintang dan delivery partner badges (GoFood, GrabFood, ShopeeFood).
   - Nilai keunggulan rasa (*Ayam Segar Marinasi 12 Jam*, *Ulekan Dadakan*, *100% Cabai Asli*, *Harga Pelajar*).
   - Testimoni pelanggan.
   - Jam operasional dan mockup lokasi pengiriman (radius 10 km).

---

## 📁 Struktur File

```
tugas bkin web makanan/
├── index.html       # Struktur utama landing page & layout responsif
├── style.css        # Desain visual modern, animasi glow, dan responsive styling
├── app.js           # Logika interaksi, filter kategori, dan integrasi WhatsApp
├── three-viewer.js  # Engine 3D Three.js ultra-lightweight (0 assets download lag)
├── menu-data.js     # Pusat konfigurasi data menu & nomor WhatsApp
└── README.md        # Dokumentasi panduan penggunaan & deployment
```

---

## 🛠️ Cara Mengubah Nama Menu & Harga (Mudah Sekali!)

Buka file [`menu-data.js`](menu-data.js). Anda akan menemukan daftar menu:

```javascript
{
  id: 1,
  name: "Paket Geprek Centeng Original", // Ganti dengan nama menu Anda
  category: "geprek",                    // Kategori: 'geprek', 'sambal', 'camilan', 'minuman'
  price: 18000,                          // Harga angka
  formattedPrice: "Rp 18.000",           // Format tampilan harga
  badge: "Favorit Pelanggan",            // Badge label (opsional)
  description: "Ayam crispy jumbo + sambal ulek dadakan + nasi pulen.",
  icon: "fa-drumstick-bite",
  image: "",                             // Link gambar jika ada (opsional)
  isSpicySelectable: true,
  isPopular: true
}
```

Cukup ubah teks di dalam file tersebut, simpan, dan web akan langsung memperbarui daftarnya secara otomatis.

Untuk mengganti nomor WhatsApp tujuan pesanan, ubah variabel di baris bawah [`menu-data.js`](menu-data.js):
```javascript
const WA_PHONE_NUMBER = "628xxxxxxxxxx"; // Ganti dengan nomor WhatsApp aktif
```

---

## 🚀 Cara Menjalankan Secara Lokal

Cukup buka file `index.html` langsung di browser favorit Anda (Google Chrome, Firefox, Safari, Edge), atau jalankan local server ringan:

```bash
# Menggunakan Node.js
npx serve .

# Atau menggunakan Python jika terpasang
python -m http.server 3000
```

Buka `http://localhost:3000` di browser.

---

## 🌐 Lisensi & Hak Cipta
Dibuat dengan ❤️ untuk **Ayam Geprek Centeng**.
