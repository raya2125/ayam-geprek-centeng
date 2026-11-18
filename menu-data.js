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

const BRAND_NAME = "Ayam Geprek Centeng";

// Konfigurasi Google Spreadsheet Catatan Penjualan
const GOOGLE_SHEETS_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1Ul4Il-KYMHwirIwqpaJ_HOUPG87gQ3VY5twEicdu7Ow/edit";
const GOOGLE_SHEETS_WEBHOOK_URL = ""; // Opsional: isi URL Web App Apps Script (lihat google-apps-script.js)

// Konfigurasi Pembayaran Non-Tunai (QRIS)
const PAYMENT_GATEWAY_CONFIG = {
  enabled: true,
  merchantName: "Ayam Geprek Centeng",
  qrisImage: "assets/qris-code.jpg"
};

const MENU_LIST = [
  {
    id: 1,
    name: "Ayam Geprek",
    category: "geprek",
    price: 10000,
    formattedPrice: "Rp 10.000",
    badge: "Best Seller",
    description: "Ayam goreng krispi renyah gurih dengan sambal korek ulek dadakan cabai rawit merah asli + nasi putih pulen hangat.",
    image: "assets/ayam-geprek.jpg",
    isSpicySelectable: false
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
