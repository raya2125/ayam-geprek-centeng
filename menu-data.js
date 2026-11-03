/**
 * ============================================================
 * AYAM GEPREK CENTENG - DATA MENU RESMI
 * ============================================================
 * Anda dapat dengan bebas mengubah nama menu, harga, deskripsi, 
 * dan foto di file ini kapan saja sesuai keinginan.
 * ============================================================
 */

const WA_PHONE_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp aktif (awali 62)
const BRAND_NAME = "Ayam Geprek Centeng";

const MENU_LIST = [
  // --- KATEGORI 1: PAKET AYAM GEPREK ---
  {
    id: 1,
    name: "Menu Geprek 1 (Nama Menu Nanti)",
    category: "geprek",
    price: 18000,
    formattedPrice: "Rp 18.000",
    badge: "Best Seller",
    description: "Ayam crispy porsi jumbo digoreng keemasan dengan sambal ulek dadakan + nasi hangat.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },
  {
    id: 2,
    name: "Menu Geprek 2 (Nama Menu Nanti)",
    category: "geprek",
    price: 23000,
    formattedPrice: "Rp 23.000",
    badge: "Favorit",
    description: "Paket ayam geprek spesial topping lelehan mozarella bakar yang gurih dan creamy.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },
  {
    id: 3,
    name: "Menu Geprek 3 (Nama Menu Nanti)",
    category: "geprek",
    price: 20000,
    formattedPrice: "Rp 20.000",
    badge: "Rekomendasi",
    description: "Ayam geprek berpadu sambal ijo rawit segar dengan perasan jeruk nipis harum.",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },
  {
    id: 4,
    name: "Menu Geprek 4 (Nama Menu Nanti)",
    category: "geprek",
    price: 15000,
    formattedPrice: "Rp 15.000",
    badge: "Paket Hemat",
    description: "Paket ramah kantong pelajar / mahasiswa: ayam crispy renyah + sambal korek nampol.",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },

  // --- KATEGORI 2: ANEKA SAMBAL CENTENG ---
  {
    id: 5,
    name: "Sambal 1 (Nama Varian Nanti)",
    category: "sambal",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Ekstra Pedas",
    description: "Porsi ekstra sambal korek bawang asli diulek dadakan dengan minyak panas mendidih.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },
  {
    id: 6,
    name: "Sambal 2 (Nama Varian Nanti)",
    category: "sambal",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Segar Harum",
    description: "Varian sambal matah khas Bali dengan irisan serai wangi, bawang merah, dan daun jeruk.",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },
  {
    id: 7,
    name: "Sambal 3 (Nama Varian Nanti)",
    category: "sambal",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Gurih Mantap",
    description: "Sambal cabai hijau pilihan dengan racikan rempah gurih tidak terlalu berminyak.",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: true
  },

  // --- KATEGORI 3: TOPPING & PELENGKAP ---
  {
    id: 8,
    name: "Topping 1 (Nama Topping Nanti)",
    category: "camilan",
    price: 4000,
    formattedPrice: "Rp 4.000",
    badge: "Pelengkap",
    description: "Pilihan topping pendamping renyah (contoh: Tahu / Tempe goreng renyah / Kol goreng gurih).",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: false
  },
  {
    id: 9,
    name: "Topping 2 (Nama Topping Nanti)",
    category: "camilan",
    price: 6000,
    formattedPrice: "Rp 6.000",
    badge: "Ekstra Keju",
    description: "Lelehan keju mozarella panggang tebal untuk menambah kenikmatan geprek.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: false
  },
  {
    id: 10,
    name: "Topping 3 (Nama Topping Nanti)",
    category: "camilan",
    price: 4000,
    formattedPrice: "Rp 4.000",
    badge: "Pulen",
    description: "Satu porsi ekstra nasi putih pulen hangat yang disajikan bersih dan higienis.",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: false
  },

  // --- KATEGORI 4: MINUMAN SEGAR ---
  {
    id: 11,
    name: "Minuman 1 (Nama Minuman Nanti)",
    category: "minuman",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Pereda Pedas",
    description: "Es teh manis jumbo dingin segar racikan teh melati tradisional khas warung nusantara.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: false
  },
  {
    id: 12,
    name: "Minuman 2 (Nama Minuman Nanti)",
    category: "minuman",
    price: 7000,
    formattedPrice: "Rp 7.000",
    badge: "Segar Dingin",
    description: "Es jeruk peras asli dengan bulir buah segar yang manis dan asam menyegarkan tenggorokan.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: false
  },
  {
    id: 13,
    name: "Minuman 3 (Nama Minuman Nanti)",
    category: "minuman",
    price: 8000,
    formattedPrice: "Rp 8.000",
    badge: "Favorit",
    description: "Minuman racikan soda manis dingin atau es susu segar penuntas dahaga sehabis makan pedas.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    isSpicySelectable: false
  }
];
