/**
 * ============================================================
 * AYAM GEPREK CENTENG - DATA MENU
 * ============================================================
 * Anda dapat dengan mudah mengubah nama menu, harga, deskripsi, 
 * kategori, dan foto di file ini kapan saja.
 * 
 * Kategori yang tersedia:
 * - 'geprek'  : Paket Nasi & Ayam Geprek
 * - 'sambal'  : Aneka Pilihan Sambal Centeng
 * - 'camilan' : Topping & Camilan Tambahan
 * - 'minuman' : Minuman Segar
 * ============================================================
 */

const MENU_LIST = [
  // --- KATEGORI 1: PAKET AYAM GEPREK (Placeholder Slot) ---
  {
    id: 1,
    name: "Menu Geprek 1 (Nama Menu Nanti)",
    category: "geprek",
    price: 18000,
    formattedPrice: "Rp 18.000",
    badge: "Favorit Pelanggan",
    description: "Slot menu ayam geprek utama. Silakan isi deskripsi kelezatan paket ini nantinya.",
    icon: "fa-drumstick-bite",
    image: "", // Masukkan link gambar atau kosongkan untuk icon default
    isSpicySelectable: true,
    isPopular: true
  },
  {
    id: 2,
    name: "Menu Geprek 2 (Nama Menu Nanti)",
    category: "geprek",
    price: 22000,
    formattedPrice: "Rp 22.000",
    badge: "Spesial",
    description: "Slot varian ayam geprek dengan topping istimewa. Cocok untuk paket makan kenyang.",
    icon: "fa-fire",
    image: "",
    isSpicySelectable: true,
    isPopular: true
  },
  {
    id: 3,
    name: "Menu Geprek 3 (Nama Menu Nanti)",
    category: "geprek",
    price: 25000,
    formattedPrice: "Rp 25.000",
    badge: "Keju Melt",
    description: "Slot menu ayam geprek kombinasi keju atau saus spesial favorit anak muda.",
    icon: "fa-cheese",
    image: "",
    isSpicySelectable: true,
    isPopular: false
  },
  {
    id: 4,
    name: "Menu Geprek 4 (Nama Menu Nanti)",
    category: "geprek",
    price: 15000,
    formattedPrice: "Rp 15.000",
    badge: "Paket Hemat",
    description: "Slot menu paket hemat ramah kantong pelajar dan mahasiswa.",
    icon: "fa-tag",
    image: "",
    isSpicySelectable: true,
    isPopular: false
  },

  // --- KATEGORI 2: ANEKA SAMBAL CENTENG ---
  {
    id: 5,
    name: "Sambal 1 (Nama Varian Nanti)",
    category: "sambal",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Extra Pedas",
    description: "Slot porsi ekstra sambal ulek khas Centeng dengan racikan rempah rahasia.",
    icon: "fa-pepper-hot",
    image: "",
    isSpicySelectable: true,
    isPopular: true
  },
  {
    id: 6,
    name: "Sambal 2 (Nama Varian Nanti)",
    category: "sambal",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Aroma Khas",
    description: "Slot varian sambal segar dengan irisan daun atau bumbu khas nusantara.",
    icon: "fa-seedling",
    image: "",
    isSpicySelectable: true,
    isPopular: false
  },
  {
    id: 7,
    name: "Sambal 3 (Nama Varian Nanti)",
    category: "sambal",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Gurih Segar",
    description: "Slot sambal cabe hijau atau sambal alternatif pedas segar.",
    icon: "fa-leaf",
    image: "",
    isSpicySelectable: true,
    isPopular: false
  },

  // --- KATEGORI 3: TOPPING & CAMILAN ---
  {
    id: 8,
    name: "Topping 1 (Nama Topping Nanti)",
    category: "camilan",
    price: 4000,
    formattedPrice: "Rp 4.000",
    badge: "Pelengkap",
    description: "Slot topping tambahan (misal: Tempe Krispi, Tahu Bejek, atau Kol Goreng).",
    icon: "fa-bread-slice",
    image: "",
    isSpicySelectable: false,
    isPopular: false
  },
  {
    id: 9,
    name: "Topping 2 (Nama Topping Nanti)",
    category: "camilan",
    price: 6000,
    formattedPrice: "Rp 6.000",
    badge: "Crispy",
    description: "Slot camilan gurih renyah pendamping makan ayam geprek.",
    icon: "fa-cookie",
    image: "",
    isSpicySelectable: false,
    isPopular: false
  },
  {
    id: 10,
    name: "Topping 3 (Nama Topping Nanti)",
    category: "camilan",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Topping Melt",
    description: "Slot ekstra keju mozarella atau saus keju panggang leleh.",
    icon: "fa-pizza-slice",
    image: "",
    isSpicySelectable: false,
    isPopular: false
  },

  // --- KATEGORI 4: MINUMAN SEGAR ---
  {
    id: 11,
    name: "Minuman 1 (Nama Minuman Nanti)",
    category: "minuman",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Pereda Pedas",
    description: "Slot minuman dingin pereda pedas porsi jumbo segar.",
    icon: "fa-glass-water",
    image: "",
    isSpicySelectable: false,
    isPopular: true
  },
  {
    id: 12,
    name: "Minuman 2 (Nama Minuman Nanti)",
    category: "minuman",
    price: 7000,
    formattedPrice: "Rp 7.000",
    badge: "Segar Manis",
    description: "Slot minuman rasa buah atau racikan es manis pelepas dahaga.",
    icon: "fa-mug-hot",
    image: "",
    isSpicySelectable: false,
    isPopular: false
  },
  {
    id: 13,
    name: "Minuman 3 (Nama Minuman Nanti)",
    category: "minuman",
    price: 8000,
    formattedPrice: "Rp 8.000",
    badge: "Favorit",
    description: "Slot minuman soda atau es campur segar penutup hidangan.",
    icon: "fa-wine-bottle",
    image: "",
    isSpicySelectable: false,
    isPopular: false
  }
];

// Nomor WhatsApp pemilik/admin Centeng untuk integrasi pesanan langsung
const WA_PHONE_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp aktif Anda (awali 62)
const BRAND_NAME = "Ayam Geprek Centeng";
