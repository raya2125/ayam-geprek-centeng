/**
 * ============================================================
 * AYAM GEPREK CENTENG - OFFICIAL APP SCRIPT
 * Sistem Kiosk, Pesan di Tempat, Layar Antrean Burger King,
 * Keranjang Pesanan & Ekspor Excel Otomatis
 * ============================================================
 */

// State
let cart = [];
let currentCategory = 'all';
let searchQuery = '';
let selectedTableNumber = 'Meja 01';
let currentActiveOrder = null;

// LocalStorage Keys
const STORAGE_ORDERS_KEY = 'centeng_orders_db';
const STORAGE_QUEUE_COUNTER_KEY = 'centeng_queue_counter';

// Definisi Resmi 2 Menu Utama (Anti-Cache Override)
const OFFICIAL_MENUS = [
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
window.MENU_LIST = OFFICIAL_MENUS;

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  setupCategoryTabs();
  setupMobileNav();
  setupTablePicker();
  initQueueSystem();
  startLiveClock();
  updateExcelOrderBadge();
});

/**
 * ============================================================
 * 1. MENU RENDERING & LIVE FILTER
 * ============================================================
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
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4;"></i>
        <p style="font-size: 1.05rem; color: var(--text-primary); font-weight: 700;">Menu tidak ditemukan</p>
        <small>Coba gunakan kata kunci lain atau pilih Semua Menu.</small>
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

function handleMenuSearch() {
  const input = document.getElementById('menuSearchInput');
  if (input) {
    searchQuery = input.value;
    renderMenu();
  }
}

/**
 * ============================================================
 * 2. KERANJANG PESANAN (CART DRAWER)
 * ============================================================
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
  showToast(`Ditambahkan: ${item.name}`);

  // Buka drawer secara otomatis
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
  const badge = document.getElementById('cartCountBadge');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) badge.innerText = totalCount;

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
 * ============================================================
 * 3. PESAN DI TEMPAT (TABLE PICKER & DINE-IN FLOW)
 * ============================================================
 */
function setupTablePicker() {
  const grid = document.getElementById('tablesGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const tableNumStr = i < 10 ? `0${i}` : `${i}`;
    const btn = document.createElement('div');
    btn.className = `table-btn ${i === 1 ? 'selected' : ''}`;
    btn.dataset.table = `Meja ${tableNumStr}`;
    btn.innerHTML = `
      <span class="table-label">Meja</span>
      <strong class="table-num">${tableNumStr}</strong>
    `;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTableNumber = `Meja ${tableNumStr}`;
      
      const banner = document.getElementById('activeTableBanner');
      if (banner) banner.innerText = `${selectedTableNumber} (Terpilih)`;

      const text = document.getElementById('selectedTableText');
      if (text) text.innerText = `Terpilih: ${selectedTableNumber}`;

      const modalTableSelect = document.getElementById('custTableNumber');
      if (modalTableSelect) modalTableSelect.value = selectedTableNumber;
    });

    grid.appendChild(btn);
  }
}

function startDineInOrder() {
  if (cart.length === 0) {
    // Tambahkan 1x Ayam Geprek dan 1x Es Teh secara instan sebagai rekomendasi
    addToCart(1);
    addToCart(2);
  }

  // Pre-set modal table number
  const modalTableSelect = document.getElementById('custTableNumber');
  if (modalTableSelect) {
    modalTableSelect.value = selectedTableNumber;
  }

  toggleTableInput(true);
  openCheckoutModal();
}

function toggleTableInput(isDineIn) {
  const group = document.getElementById('tableInputGroup');
  if (group) {
    group.style.display = isDineIn ? 'block' : 'none';
  }
}

/**
 * ============================================================
 * 4. CHECKOUT & ORDER CREATION
 * ============================================================
 */
function openCheckoutModal() {
  if (cart.length === 0) {
    alert('Keranjang pesanan masih kosong. Pilih menu dulu yuk!');
    return;
  }

  // Tutup drawer jika terbuka
  const drawer = document.getElementById('cartDrawer');
  if (drawer && drawer.classList.contains('active')) {
    toggleCartDrawer();
  }

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

function openDirectOrderModal(defaultMenu = '') {
  if (cart.length === 0) {
    addToCart(1); // Tambah Ayam Geprek
  }
  openCheckoutModal();
}

// Close checkout modal on backdrop click
window.addEventListener('click', (e) => {
  const checkoutModal = document.getElementById('checkoutModal');
  const ticketModal = document.getElementById('ticketModal');
  const excelModal = document.getElementById('excelModal');

  if (e.target === checkoutModal) closeCheckoutModal();
  if (e.target === ticketModal) closeTicketModal();
  if (e.target === excelModal) closeExcelModal();
});

/**
 * Handle form order submit:
 * 1. Generate Queue Number (Burger King Style)
 * 2. Save order to LocalStorage database
 * 3. Auto-trigger Excel download if enabled
 * 4. Show Digital Ticket Slip
 */
function handleProcessOrder(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('custName').value.trim() || 'Pelanggan';
  const spicy = document.getElementById('custSpicyLevel').value;
  const notes = document.getElementById('custNotes').value.trim();

  // Ambil tipe pesanan
  const typeRadios = document.getElementsByName('orderTypeChoice');
  let orderType = 'Makan di Tempat';
  for (let r of typeRadios) {
    if (r.checked) orderType = r.value;
  }

  let tableNum = '-';
  if (orderType === 'Makan di Tempat') {
    tableNum = document.getElementById('custTableNumber').value || selectedTableNumber;
  }

  // Hitung total
  let grandTotal = 0;
  let itemsList = [];
  cart.forEach(item => {
    grandTotal += (item.price * item.qty);
    itemsList.push({
      name: item.name,
      qty: item.qty,
      price: item.price,
      subtotal: item.price * item.qty
    });
  });

  if (grandTotal === 0 && itemsList.length === 0) {
    alert('Silakan pilih minimal 1 menu.');
    return;
  }

  // Generate Queue Number (e.g. #001)
  const queueNum = getNextQueueNumber();

  // Waktu
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace(/\./g, ':');

  const menuSummary = itemsList.map(i => `${i.qty}x ${i.name}`).join(', ');

  const newOrder = {
    id: Date.now(),
    queueNumber: queueNum,
    timestamp: timeFormatted,
    customerName: name,
    orderType: orderType,
    tableNumber: tableNum,
    items: itemsList,
    menuSummary: menuSummary,
    spicyLevel: spicy,
    notes: notes,
    totalPrice: grandTotal,
    status: 'Sedang Disiapkan'
  };

  // Simpan ke database
  saveOrderToStorage(newOrder);
  currentActiveOrder = newOrder;

  // Reset cart
  cart = [];
  updateCartUI();
  closeCheckoutModal();

  // Update Layar Antrean
  renderQueueBoard();
  updateExcelOrderBadge();

  // Update Banner Pelanggan Aktif
  const activeBar = document.getElementById('bkCustomerActiveBar');
  const myQueueNumText = document.getElementById('myQueueNumberText');
  const myQueueStatusText = document.getElementById('myQueueStatusText');
  if (activeBar && myQueueNumText) {
    activeBar.style.display = 'flex';
    myQueueNumText.innerText = queueNum;
    myQueueStatusText.innerText = `Pesanan ${orderType} (${tableNum !== '-' ? tableNum : 'Counter'}) sedang disiapkan di dapur.`;
  }

  showToast(`Pesanan #${queueNum} berhasil dicatat & masuk ke Rekap Excel!`);

  // Auto-download Excel jika checkbox aktif
  const autoDownloadCheckbox = document.getElementById('autoDownloadExcelCheckbox');
  if (autoDownloadCheckbox && autoDownloadCheckbox.checked) {
    setTimeout(() => {
      exportToExcel(false);
    }, 500);
  }

  // Tampilkan Struk Digital Kiosk (Burger King Style)
  showDigitalTicketModal(newOrder);
}

/**
 * Langsung kirim ke WhatsApp Kasir sekaligus catat ke Excel & Antrean
 */
function submitToWhatsAppDirectly() {
  const name = document.getElementById('custName').value.trim() || 'Pelanggan';
  const spicy = document.getElementById('custSpicyLevel').value;
  const notes = document.getElementById('custNotes').value.trim();

  const typeRadios = document.getElementsByName('orderTypeChoice');
  let orderType = 'Makan di Tempat';
  for (let r of typeRadios) {
    if (r.checked) orderType = r.value;
  }

  let tableNum = '-';
  if (orderType === 'Makan di Tempat') {
    tableNum = document.getElementById('custTableNumber').value || selectedTableNumber;
  }

  let grandTotal = 0;
  let itemsList = [];
  cart.forEach(item => {
    grandTotal += (item.price * item.qty);
    itemsList.push({
      name: item.name,
      qty: item.qty,
      price: item.price,
      subtotal: item.price * item.qty
    });
  });

  const queueNum = getNextQueueNumber();
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace(/\./g, ':');

  const menuSummary = itemsList.map(i => `${i.qty}x ${i.name}`).join(', ');

  const newOrder = {
    id: Date.now(),
    queueNumber: queueNum,
    timestamp: timeFormatted,
    customerName: name,
    orderType: orderType,
    tableNumber: tableNum,
    items: itemsList,
    menuSummary: menuSummary,
    spicyLevel: spicy,
    notes: notes,
    totalPrice: grandTotal,
    status: 'Sedang Disiapkan'
  };

  saveOrderToStorage(newOrder);
  currentActiveOrder = newOrder;

  cart = [];
  updateCartUI();
  closeCheckoutModal();
  renderQueueBoard();
  updateExcelOrderBadge();

  // Buka WhatsApp
  forwardOrderToWhatsApp(newOrder);
}

/**
 * ============================================================
 * 5. BURGER KING STYLE QUEUE SYSTEM (LAYAR ANTREAN MONITOR)
 * ============================================================
 */
function initQueueSystem() {
  // Buat sample order awal jika belum ada data agar langsung terlihat keren
  const existing = getStoredOrders();
  if (existing.length === 0) {
    const sampleOrders = [
      {
        id: 1001,
        queueNumber: '#001',
        timestamp: 'Hari ini 12:15',
        customerName: 'Budi Santoso',
        orderType: 'Makan di Tempat',
        tableNumber: 'Meja 03',
        items: [{ name: 'Ayam Geprek', qty: 2, price: 15000, subtotal: 30000 }, { name: 'Es Teh', qty: 2, price: 5000, subtotal: 10000 }],
        menuSummary: '2x Ayam Geprek, 2x Es Teh',
        spicyLevel: 'Level 3 (Sedang)',
        notes: 'Sambal dipisah',
        totalPrice: 40000,
        status: 'Siap Diambil'
      },
      {
        id: 1002,
        queueNumber: '#002',
        timestamp: 'Hari ini 12:20',
        customerName: 'Siti Rahma',
        orderType: 'Bawa Pulang',
        tableNumber: '-',
        items: [{ name: 'Ayam Geprek', qty: 1, price: 15000, subtotal: 15000 }, { name: 'Es Teh', qty: 1, price: 5000, subtotal: 5000 }],
        menuSummary: '1x Ayam Geprek, 1x Es Teh',
        spicyLevel: 'Level 5 (Pedas Nampol)',
        notes: '-',
        totalPrice: 20000,
        status: 'Sedang Disiapkan'
      }
    ];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(sampleOrders));
    localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, '2');
  }

  renderQueueBoard();
}

function getNextQueueNumber() {
  let counter = parseInt(localStorage.getItem(STORAGE_QUEUE_COUNTER_KEY) || '0', 10);
  counter += 1;
  localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, counter.toString());
  const formatted = counter < 10 ? `#00${counter}` : counter < 100 ? `#0${counter}` : `#${counter}`;
  return formatted;
}

function renderQueueBoard() {
  const prepList = document.getElementById('queuePreparingList');
  const readyList = document.getElementById('queueReadyList');
  if (!prepList || !readyList) return;

  prepList.innerHTML = '';
  readyList.innerHTML = '';

  const orders = getStoredOrders();
  const preparingOrders = orders.filter(o => o.status === 'Sedang Disiapkan');
  const readyOrders = orders.filter(o => o.status === 'Siap Diambil');

  if (preparingOrders.length === 0) {
    prepList.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.4); padding: 30px;">
        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 8px;"></i>
        <p>Semua pesanan selesai disiapkan!</p>
      </div>
    `;
  } else {
    preparingOrders.forEach(o => {
      const card = document.createElement('div');
      card.className = 'bk-queue-card';
      const dest = o.orderType === 'Makan di Tempat' ? o.tableNumber : 'Takeaway';
      card.innerHTML = `
        <div class="bk-card-num">${o.queueNumber}</div>
        <div class="bk-card-type">${dest}</div>
        <div class="bk-card-time">${o.timestamp.split(' ')[1] || ''}</div>
        <div class="bk-card-action">
          <button class="btn-kiosk-action" onclick="updateOrderStatus(${o.id}, 'Siap Diambil')" title="Klik untuk tandai pesanan siap">
            ✓ Siap
          </button>
        </div>
      `;
      prepList.appendChild(card);
    });
  }

  if (readyOrders.length === 0) {
    readyList.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.4); padding: 30px;">
        <i class="fas fa-bell" style="font-size: 2rem; margin-bottom: 8px;"></i>
        <p>Belum ada nomor yang siap diambil.</p>
      </div>
    `;
  } else {
    readyOrders.forEach(o => {
      const card = document.createElement('div');
      card.className = 'bk-queue-card';
      const dest = o.orderType === 'Makan di Tempat' ? o.tableNumber : 'Siap Diambil';
      card.innerHTML = `
        <div class="bk-card-num">${o.queueNumber}</div>
        <div class="bk-card-type">${dest}</div>
        <div class="bk-card-time">Siap di Kasir / Diantar</div>
        <div class="bk-card-action">
          <button class="btn-kiosk-action" onclick="updateOrderStatus(${o.id}, 'Selesai')" title="Selesai & diserahkan ke pelanggan">
            ✓ Selesai
          </button>
        </div>
      `;
      readyList.appendChild(card);
    });
  }
}

function updateOrderStatus(orderId, newStatus) {
  let orders = getStoredOrders();
  const target = orders.find(o => o.id === orderId);
  if (target) {
    target.status = newStatus;
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    renderQueueBoard();
    renderExcelModalTable();
    showToast(`Pesanan ${target.queueNumber} diubah ke: ${newStatus}`);
  }
}

function startLiveClock() {
  const clockEl = document.getElementById('bkLiveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const str = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
    clockEl.innerText = `${str} WIB`;
  }
  update();
  setInterval(update, 1000);
}

/**
 * ============================================================
 * 6. DIGITAL STRUK / RECEIPT MODAL (BURGER KING STYLE)
 * ============================================================
 */
function showDigitalTicketModal(order) {
  const modal = document.getElementById('ticketModal');
  const qNum = document.getElementById('ticketQueueNumber');
  const oType = document.getElementById('ticketOrderType');
  const tTime = document.getElementById('ticketTimestamp');
  const tBody = document.getElementById('ticketItemsBody');
  const tPrice = document.getElementById('ticketTotalPrice');

  if (qNum) qNum.innerText = order.queueNumber;
  if (oType) {
    oType.innerText = order.orderType === 'Makan di Tempat' 
      ? `Makan di Tempat - ${order.tableNumber}` 
      : order.orderType;
  }
  if (tTime) tTime.innerText = `${order.timestamp} WIB | Pemesan: ${order.customerName}`;

  if (tBody) {
    tBody.innerHTML = '';
    order.items.forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.qty}x ${escapeHtml(it.name)}</td>
        <td style="text-align: right; font-weight: 700;">Rp ${(it.price * it.qty).toLocaleString('id-ID')}</td>
      `;
      tBody.appendChild(tr);
    });
  }

  if (tPrice) {
    tPrice.innerText = 'Rp ' + order.totalPrice.toLocaleString('id-ID');
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function viewMyTicket() {
  if (currentActiveOrder) {
    showDigitalTicketModal(currentActiveOrder);
  } else {
    const orders = getStoredOrders();
    if (orders.length > 0) {
      showDigitalTicketModal(orders[orders.length - 1]);
    } else {
      alert('Belum ada pesanan aktif.');
    }
  }
}

function closeTicketModal() {
  const modal = document.getElementById('ticketModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function downloadCurrentOrderExcel() {
  if (!currentActiveOrder) {
    const orders = getStoredOrders();
    currentActiveOrder = orders[orders.length - 1];
  }
  if (!currentActiveOrder) return;
  exportSingleOrderToExcel(currentActiveOrder);
}

function forwardCurrentOrderWhatsApp() {
  if (!currentActiveOrder) {
    const orders = getStoredOrders();
    currentActiveOrder = orders[orders.length - 1];
  }
  if (!currentActiveOrder) return;
  forwardOrderToWhatsApp(currentActiveOrder);
}

function forwardOrderToWhatsApp(order) {
  let msg = `Halo Admin *Ayam Geprek Centeng*, pesanan baru masuk nih:\n\n`;
  msg += `🎫 *NOMOR ANTREAN: ${order.queueNumber}*\n`;
  msg += `🍽️ *Tipe Pesanan:* ${order.orderType} ${order.tableNumber !== '-' ? `(${order.tableNumber})` : ''}\n`;
  msg += `👤 *Nama Pemesan:* ${order.customerName}\n`;
  msg += `🕒 *Waktu Pesan:* ${order.timestamp} WIB\n\n`;
  msg += `📋 *RINCIAN MENU:*\n`;
  order.items.forEach((it, idx) => {
    msg += `   ${idx + 1}. ${it.qty}x ${it.name} = Rp ${it.subtotal.toLocaleString('id-ID')}\n`;
  });
  msg += `\n🌶️ *Level Pedas:* ${order.spicyLevel}\n`;
  if (order.notes && order.notes !== '-') {
    msg += `📝 *Catatan:* ${order.notes}\n`;
  }
  msg += `\n💰 *TOTAL BAYAR:* Rp ${order.totalPrice.toLocaleString('id-ID')}\n`;
  msg += `\nStatus: *${order.status}*\nMohon segera diproses ya min, terima kasih! 🙏`;

  const waNum = (typeof WA_PHONE_NUMBER !== 'undefined' && WA_PHONE_NUMBER) ? WA_PHONE_NUMBER : '6281234567890';
  const url = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

/**
 * ============================================================
 * 7. EXCEL EXPORT & DATABASE KASIR
 * ============================================================
 */
function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveOrderToStorage(order) {
  const orders = getStoredOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
}

function updateExcelOrderBadge() {
  const badge = document.getElementById('excelOrderCountBadge');
  const orders = getStoredOrders();
  if (badge) badge.innerText = orders.length;
}

function openExcelModal() {
  renderExcelModalTable();
  const modal = document.getElementById('excelModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeExcelModal() {
  const modal = document.getElementById('excelModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderExcelModalTable() {
  const orders = getStoredOrders();
  const tbody = document.getElementById('excelOrdersTableBody');
  const statOrders = document.getElementById('statTotalOrders');
  const statRevenue = document.getElementById('statTotalRevenue');
  const statDineIn = document.getElementById('statDineIn');
  const statTakeaway = document.getElementById('statTakeaway');

  let totalRev = 0;
  let countDineIn = 0;
  let countTakeaway = 0;

  orders.forEach(o => {
    totalRev += (o.totalPrice || 0);
    if (o.orderType === 'Makan di Tempat') countDineIn++;
    else countTakeaway++;
  });

  if (statOrders) statOrders.innerText = orders.length;
  if (statRevenue) statRevenue.innerText = 'Rp ' + totalRev.toLocaleString('id-ID');
  if (statDineIn) statDineIn.innerText = countDineIn;
  if (statTakeaway) statTakeaway.innerText = countTakeaway;

  if (!tbody) return;
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fas fa-file-excel" style="font-size: 2rem; opacity: 0.3; margin-bottom: 8px;"></i>
          <p>Belum ada data pesanan di Excel database.</p>
        </td>
      </tr>
    `;
    return;
  }

  // Tampilkan urutan terbaru di atas
  const reversed = [...orders].reverse();
  reversed.forEach((o, idx) => {
    const tr = document.createElement('tr');
    const statusClass = o.status === 'Siap Diambil' ? 'ready' : o.status === 'Selesai' ? 'completed' : 'preparing';
    tr.innerHTML = `
      <td>${reversed.length - idx}</td>
      <td><strong>${o.queueNumber}</strong></td>
      <td>${o.timestamp}</td>
      <td>${escapeHtml(o.customerName)}</td>
      <td>${escapeHtml(o.orderType)}</td>
      <td>${escapeHtml(o.tableNumber)}</td>
      <td>${escapeHtml(o.menuSummary)}</td>
      <td>${escapeHtml(o.spicyLevel)}</td>
      <td><strong>Rp ${(o.totalPrice).toLocaleString('id-ID')}</strong></td>
      <td><span class="badge-status ${statusClass}">${o.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="deleteSingleOrder(${o.id})" title="Hapus pesanan" style="padding: 4px 8px; font-size: 0.75rem;">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteSingleOrder(id) {
  if (!confirm('Yakin ingin menghapus baris pesanan ini?')) return;
  let orders = getStoredOrders();
  orders = orders.filter(o => o.id !== id);
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  renderExcelModalTable();
  renderQueueBoard();
  updateExcelOrderBadge();
  showToast('Pesanan berhasil dihapus dari database.');
}

function clearAllOrders() {
  if (!confirm('Hapus seluruh riwayat pesanan Excel? (Data antrean juga akan di-reset)')) return;
  localStorage.removeItem(STORAGE_ORDERS_KEY);
  localStorage.removeItem(STORAGE_QUEUE_COUNTER_KEY);
  renderExcelModalTable();
  renderQueueBoard();
  updateExcelOrderBadge();
  showToast('Seluruh data pesanan berhasil di-reset.');
}

function addSampleOrderDemo() {
  const queueNum = getNextQueueNumber();
  const tables = ['Meja 02', 'Meja 04', 'Meja 05', 'Meja 08', 'Meja 10'];
  const names = ['Andi Pratama', 'Maya Safitri', 'Dimas Arya', 'Nadia Putri', 'Fajar Ramadhan'];
  const randomTable = tables[Math.floor(Math.random() * tables.length)];
  const randomName = names[Math.floor(Math.random() * names.length)];

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace(/\./g, ':');

  const demoOrder = {
    id: Date.now(),
    queueNumber: queueNum,
    timestamp: timeFormatted,
    customerName: randomName,
    orderType: 'Makan di Tempat',
    tableNumber: randomTable,
    items: [
      { name: 'Ayam Geprek', qty: 1, price: 15000, subtotal: 15000 },
      { name: 'Es Teh', qty: 1, price: 5000, subtotal: 5000 }
    ],
    menuSummary: '1x Ayam Geprek, 1x Es Teh',
    spicyLevel: 'Level 3 (Sedang Mantap)',
    notes: 'Makan di tempat',
    totalPrice: 20000,
    status: 'Sedang Disiapkan'
  };

  saveOrderToStorage(demoOrder);
  renderExcelModalTable();
  renderQueueBoard();
  updateExcelOrderBadge();
  showToast(`Pesanan demo ${queueNum} berhasil ditambahkan!`);
}

/**
 * EXPORT SEMUA PESANAN KE EXCEL (.XLSX / CSV FALLBACK)
 */
function exportToExcel(showPrompt = true) {
  const orders = getStoredOrders();
  if (orders.length === 0) {
    if (showPrompt) alert('Belum ada pesanan yang tersimpan untuk di-download.');
    return;
  }

  // Format dataset yang rapi untuk Excel
  const excelData = orders.map((o, idx) => ({
    "No": idx + 1,
    "Nomor Antrean": o.queueNumber,
    "Waktu Pesan": o.timestamp,
    "Nama Pemesan": o.customerName,
    "Tipe Pesanan": o.orderType,
    "Nomor Meja": o.tableNumber || "-",
    "Daftar Menu": o.menuSummary,
    "Level Pedas": o.spicyLevel,
    "Total Bayar (Rp)": o.totalPrice,
    "Catatan": o.notes || "-",
    "Status Pesanan": o.status
  }));

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const filename = `Rekap_Pesanan_Ayam_Geprek_Centeng_${dateStr}.xlsx`;

  if (typeof XLSX !== 'undefined') {
    // Generate .xlsx dengan SheetJS
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Atur lebar kolom agar proporsional di Microsoft Excel
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 15 }, // Nomor Antrean
      { wch: 18 }, // Waktu
      { wch: 20 }, // Nama
      { wch: 18 }, // Tipe
      { wch: 12 }, // Meja
      { wch: 32 }, // Menu
      { wch: 22 }, // Level
      { wch: 16 }, // Total
      { wch: 24 }, // Catatan
      { wch: 18 }  // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Pesanan");
    XLSX.writeFile(wb, filename);

    if (showPrompt) showToast('File Excel Rekap (.xlsx) berhasil di-download!');
  } else {
    // Fallback CSV ber-BOM UTF-8 (membuka langsung di Excel tanpa masalah karakter)
    exportToCsvFallback(excelData, `Rekap_Pesanan_Ayam_Geprek_Centeng_${dateStr}.csv`);
  }
}

/**
 * EXPORT 1 STRUK PESANAN TERTENTU KE EXCEL
 */
function exportSingleOrderToExcel(order) {
  const singleData = [
    { "Keterangan": "Nomor Antrean", "Nilai": order.queueNumber },
    { "Keterangan": "Waktu Transaksi", "Nilai": order.timestamp + " WIB" },
    { "Keterangan": "Nama Pemesan", "Nilai": order.customerName },
    { "Keterangan": "Tipe Pesanan", "Nilai": order.orderType },
    { "Keterangan": "Nomor Meja", "Nilai": order.tableNumber },
    { "Keterangan": "Rincian Menu", "Nilai": order.menuSummary },
    { "Keterangan": "Level Pedas", "Nilai": order.spicyLevel },
    { "Keterangan": "Catatan", "Nilai": order.notes || "-" },
    { "Keterangan": "Total Bayar (Rp)", "Nilai": order.totalPrice },
    { "Keterangan": "Status", "Nilai": order.status }
  ];

  const filename = `Struk_Antrean_${order.queueNumber.replace('#', '')}_Centeng.xlsx`;

  if (typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.json_to_sheet(singleData);
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Struk Pesanan");
    XLSX.writeFile(wb, filename);
    showToast(`Struk Excel ${order.queueNumber} berhasil di-download!`);
  } else {
    exportToCsvFallback(singleData, filename.replace('.xlsx', '.csv'));
  }
}

/**
 * Fallback CSV dengan UTF-8 BOM
 */
function exportToCsvFallback(dataArray, filename) {
  if (!dataArray || dataArray.length === 0) return;

  const headers = Object.keys(dataArray[0]);
  let csvContent = '\uFEFF'; // UTF-8 BOM agar Excel membacanya dengan tepat
  csvContent += headers.map(h => `"${h}"`).join(';') + '\r\n';

  dataArray.forEach(row => {
    const rowValues = headers.map(h => {
      let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      val = val.replace(/"/g, '""');
      return `"${val}"`;
    });
    csvContent += rowValues.join(';') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File CSV/Excel berhasil di-download!');
}

/**
 * ============================================================
 * 8. HELPER TOAST & UTILITIES
 * ============================================================
 */
function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  const msgEl = document.getElementById('toastNoticeMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
