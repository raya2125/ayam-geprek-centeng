/**
 * ============================================================
 * AYAM GEPREK CENTENG - DATA MENU RESMI
 * ============================================================
 * Menu resmi yang tersedia saat ini:
 * 1. Ayam Geprek
 * 2. Es Teh
 * ============================================================
 */

const WA_PHONE_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp aktif (awali 62)
const BRAND_NAME = "Ayam Geprek Centeng";

const MENU_LIST = [
  {
    id: 1,
    name: "Ayam Geprek",
    category: "geprek",
    price: 15000,
    formattedPrice: "Rp 15.000",
    badge: "Best Seller",
    description: "Ayam goreng krispi renyah gurih dengan sambal korek ulek dadakan cabai rawit merah asli + nasi putih pulen hangat.",
    image: "assets/ayam-geprek.jpg",
    isSpicySelectable: true
  },
  {
    id: 2,
    name: "Es Teh",
    category: "minuman",
    price: 5000,
    formattedPrice: "Rp 5.000",
    badge: "Segar Dingin",
    description: "Es teh manis segar dingin racikan daun teh melati pilihan khas nusantara, penuntas dahaga & pereda pedas terbaik.",
    image: "assets/es-teh.jpg",
    isSpicySelectable: false
  }
];
