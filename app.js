/**
 * ============================================================
 * AYAM GEPREK CENTENG - APLIKASI WEB RESMI
 * Sistem Katalog Menu, Keranjang Pesanan & WhatsApp Checkout
 * ============================================================
 */

// State
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  setupCategoryTabs();
  setupMobileNav();
  setupScrollSpy();
});

/**
 * Render menu cards based on category & search filter
 */
function renderMenu() {
  const container = document.getElementById('menuCardsGrid');
  if (!container || typeof MENU_LIST === 'undefined') return;

  container.innerHTML = '';

  let filtered = MENU_LIST;

  // Filter category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(item => item.category === currentCategory);
  }

  // Filter search
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.3;"></i>
        <p style="font-size: 1.05rem; color: #fff;">Menu tidak ditemukan</p>
        <small>Coba gunakan kata kunci lain atau pilih kategori Semua.</small>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';

    const spicyPill = item.isSpicySelectable 
      ? `<span class="card-spicy-pill"><i class="fas fa-pepper-hot"></i> Level 0-10</span>`
      : '';

    card.innerHTML = `
      <div class="menu-card-img-wrap">
        <span class="card-badge-top">${escapeHtml(item.badge || 'Pilihan')}</span>
        ${spicyPill}
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="menu-card-img" loading="lazy">
      </div>
      <div class="menu-card-body">
        <h3 class="menu-item-title">${escapeHtml(item.name)}</h3>
        <p class="menu-item-desc">${escapeHtml(item.description)}</p>
        <div class="menu-card-bottom">
          <span class="menu-item-price">${escapeHtml(item.formattedPrice)}</span>
          <button class="btn-add-cart" onclick="addToCart(${item.id})">
            <i class="fas fa-plus"></i> Tambah
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Filter tabs
 */
function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.cat-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-cat');
      renderMenu();
    });
  });
}

/**
 * Live search input
 */
function handleMenuSearch() {
  const input = document.getElementById('menuSearchInput');
  if (input) {
    searchQuery = input.value;
    renderMenu();
  }
}

/**
 * Cart System
 */
function addToCart(id) {
  const item = MENU_LIST.find(m => m.id === id);
  if (!item) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      image: item.image
    });
  }

  updateCartUI();

  // Show cart drawer automatically on first add
  const drawer = document.getElementById('cartDrawer');
  if (drawer && !drawer.classList.contains('active')) {
    toggleCartDrawer();
  }
}

function quickAddToCart(id) {
  addToCart(id);
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }

  updateCartUI();
}

function updateCartUI() {
  // Update badge count
  const badge = document.getElementById('cartCountBadge');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) badge.innerText = totalCount;

  // Update Drawer list
  const container = document.getElementById('cartItemsContainer');
  const totalPriceEl = document.getElementById('cartTotalPrice');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <i class="fas fa-shopping-bag"></i>
        <p>Keranjang pesanan masih kosong.</p>
        <small>Silakan pilih menu favoritmu di katalog.</small>
      </div>
    `;
    if (totalPriceEl) totalPriceEl.innerText = 'Rp 0';
    return;
  }

  container.innerHTML = '';
  let grandTotal = 0;

  cart.forEach(item => {
    grandTotal += (item.price * item.qty);

    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-thumb">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
        <span class="cart-item-unit-price">Rp ${item.price.toLocaleString('id-ID')}</span>
      </div>
      <div class="cart-qty-ctrl">
        <button class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>
        <span class="cart-qty-num">${item.qty}</span>
        <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  if (totalPriceEl) {
    totalPriceEl.innerText = 'Rp ' + grandTotal.toLocaleString('id-ID');
  }
}

/**
 * Toggle Slide-out Cart Drawer
 */
function toggleCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    const isActive = drawer.classList.contains('active');
    if (isActive) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
}

/**
 * Open Checkout Confirmation Modal
 */
function openCheckoutModal() {
  if (cart.length === 0) {
    alert('Keranjang pesanan kamu masih kosong. Pilih menu dulu yuk!');
    return;
  }

  // Close cart drawer
  toggleCartDrawer();

  const modal = document.getElementById('checkoutModal');
  const summaryInput = document.getElementById('custOrderSummary');
  const totalModalEl = document.getElementById('modalTotalPrice');

  let summaryText = '';
  let grandTotal = 0;

  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    grandTotal += subtotal;
    summaryText += `${idx + 1}. ${item.qty}x ${item.name} = Rp ${subtotal.toLocaleString('id-ID')}\n`;
  });

  if (summaryInput) summaryInput.value = summaryText.trim();
  if (totalModalEl) totalModalEl.innerText = 'Rp ' + grandTotal.toLocaleString('id-ID');

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Open Direct Order Modal (e.g., from hero button or catering)
 */
function openDirectOrderModal(defaultMenu = '') {
  const modal = document.getElementById('checkoutModal');
  const summaryInput = document.getElementById('custOrderSummary');
  const totalModalEl = document.getElementById('modalTotalPrice');

  if (summaryInput) {
    summaryInput.value = defaultMenu || '1x Paket Geprek Centeng Juara (Rp 18.000)';
    summaryInput.readOnly = false; // Allow manual edit if needed
  }
  if (totalModalEl) {
    totalModalEl.innerText = 'Sesuai pesanan';
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close checkout modal on backdrop click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('checkoutModal');
  if (e.target === modal) {
    closeCheckoutModal();
  }
});

/**
 * Handle form submit and redirect to WhatsApp
 */
function handleSendWhatsApp(e) {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const summary = document.getElementById('custOrderSummary').value.trim();
  const spicy = document.getElementById('custSpicyLevel').value;
  const type = document.getElementById('custType').value;
  const notes = document.getElementById('custNotes').value.trim();

  let grandTotal = 0;
  cart.forEach(item => { grandTotal += (item.price * item.qty); });

  const totalFormatted = grandTotal > 0 ? 'Rp ' + grandTotal.toLocaleString('id-ID') : 'Sesuai pesanan';

  let msg = `Halo Admin *Ayam Geprek Centeng*, saya mau pesan makanan nih:\n\n`;
  msg += `📋 *DAFTAR PESANAN:*\n${summary}\n\n`;
  msg += `🌶️ *Pilihan Level Pedas:* ${spicy}\n`;
  msg += `🛵 *Tipe Pesanan:* ${type}\n`;
  msg += `👤 *Nama Pemesan:* ${name}\n`;
  if (notes) {
    msg += `📝 *Catatan / Alamat:* ${notes}\n`;
  }
  msg += `\n💰 *Total Estimasi:* ${totalFormatted}\n`;
  msg += `\nMohon info ketersediaan & nomor rekening/QRIS ya min. Terima kasih! 🙏`;

  const waNum = (typeof WA_PHONE_NUMBER !== 'undefined' && WA_PHONE_NUMBER) ? WA_PHONE_NUMBER : '6281234567890';
  const url = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

  closeCheckoutModal();
  window.open(url, '_blank');
}

/**
 * Mobile Navigation Toggle
 */
function setupMobileNav() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('navMenu');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('active');
    });

    const links = menu.querySelectorAll('.nav-item');
    links.forEach(l => {
      l.addEventListener('click', () => {
        menu.classList.remove('active');
      });
    });
  }
}

/**
 * Scroll Spy
 */
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
