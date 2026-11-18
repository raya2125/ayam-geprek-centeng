/**
 * ============================================================
 * AYAM GEPREK CENTENG - DATA MENU RESMI & KONFIGURASI
 * ============================================================
 * Menu resmi yang tersedia saat ini:
 * 1. Ayam Geprek
 * 2. Es Teh
 * Dilengkapi Sistem Payment Gateway (QRIS, VA Bank, E-Wallet)
 * ============================================================
 */

const WA_PHONE_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp aktif (awali 62)
const BRAND_NAME = "Ayam Geprek Centeng";

// Konfigurasi Payment Gateway
const PAYMENT_GATEWAY_CONFIG = {
  enabled: true,
  merchantName: "Ayam Geprek Centeng",
  merchantCity: "JAKARTA",
  qrisNmid: "ID1029384756910",
  vaNumbers: {
    bca: "8801281234567890",
    mandiri: "8901281234567890",
    bri: "1201281234567890",
    bni: "9801281234567890"
  },
  ewalletNumbers: {
    gopay: "0812-3456-7890",
    dana: "0812-3456-7890",
    ovo: "0812-3456-7890",
    shopeepay: "0812-3456-7890"
  }
};

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
