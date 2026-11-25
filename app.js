/**
 * ============================================================
 * AYAM GEPREK CENTENG - OFFICIAL APP SCRIPT
 * Sistem Kiosk, Pesan di Tempat, Layar Antrean Burger King,
 * Keranjang Pesanan, Payment Gateway (QRIS/VA) & Ekspor Excel Otomatis
 * ============================================================
 */

// State
let cart = [];
let currentCategory = 'all';
let searchQuery = '';
let selectedOrderMode = 'Makan di Tempat';
let currentActiveOrder = null;
let currentDraftOrder = null;
let selectedPaymentTab = 'qris';
let pgCountdownTimer = null;

// State (Konstanta database, OFFICIAL_MENUS, helper tanggal, & Ekspor Excel ada di shared-store.js)

/** Menyegarkan tampilan antrean dan struk pelanggan aktif setelah sinkronisasi storage/backend. */
function refreshBuyerOrderViews() {
  renderQueueBoard();
  if (currentActiveOrder) {
    const latest = getStoredOrders().find(o => o.id === currentActiveOrder.id);
    if (latest) {
      currentActiveOrder = latest;
      updateActiveOrderBanner(latest);
      if (document.getElementById('ticketModal')?.classList.contains('active')) {
        showDigitalTicketModal(latest);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  setupCategoryTabs();
  setupMobileNav();
  initQueueSystem();
  loadOrdersFromBackend(refreshBuyerOrderViews);
  openOrderModeModal();

  // Sinkronisasi otomatis lintas tab maupun antar perangkat (via server.js)
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_ORDERS_KEY || event.key === STORAGE_QUEUE_COUNTER_KEY) {
      refreshBuyerOrderViews();
    }
  });
  window.addEventListener('focus', () => loadOrdersFromBackend(refreshBuyerOrderViews));
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

    card.innerHTML = `
      <div class="menu-card-img-wrap">
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
 * 3. MODE PESANAN (DINE-IN / TAKE AWAY & NOMOR ANTREAN)
 * ============================================================
 */

/** Memilih opsi tipe pesanan pada form checkout (Dine-In / Take Away). */
function selectOrderTypeOption(typeValue) {
  selectedOrderMode = typeValue;
  const typeRadios = document.getElementsByName('orderTypeChoice');
  for (let r of typeRadios) {
    r.checked = (r.value === typeValue);
  }

  const modeTextEl = document.getElementById('activeOrderModeText');
  if (modeTextEl) {
    modeTextEl.innerText = typeValue === 'Bawa Pulang' ? '🛍️ Take Away' : '🍽️ Makan di Tempat';
  }
}

/** Membuka modal pilihan awal Makan di Tempat atau Take Away saat web dibuka. */
function openOrderModeModal() {
  const modal = document.getElementById('orderModeModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/** Menutup modal pilihan awal mode pesanan. */
function closeOrderModeModal() {
  const modal = document.getElementById('orderModeModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/** Menyimpan pilihan Makan di Tempat atau Take Away dari modal awal. */
function chooseEntryOrderMode(modeValue) {
  selectOrderTypeOption(modeValue);
  closeOrderModeModal();

  const label = modeValue === 'Bawa Pulang' ? 'Take Away (Bawa Pulang)' : 'Makan di Tempat (Dine-In)';
  showToast(`Mode pesanan: ${label}`);

  const menuEl = document.getElementById('menu-katalog');
  if (menuEl && typeof menuEl.scrollIntoView === 'function') {
    menuEl.scrollIntoView({ behavior: 'smooth' });
  }
}

function startDineInOrder() {
  if (cart.length === 0) {
    addToCart(1);
    addToCart(2);
  }

  selectOrderTypeOption('Makan di Tempat');
  openCheckoutModal();
}

/** Membuka form checkout dengan mode Take Away (Bawa Pulang) aktif. */
function startTakeAwayOrder() {
  if (cart.length === 0) {
    addToCart(1);
  }

  selectOrderTypeOption('Bawa Pulang');
  openCheckoutModal();
}

/**
 * ============================================================
 * 4. CHECKOUT & ORDER CREATION (LANJUT KE PAYMENT GATEWAY)
 * ============================================================
 */
function openCheckoutModal() {
  if (cart.length === 0) {
    alert('Keranjang pesanan masih kosong. Pilih menu dulu yuk!');
    return;
  }

  const drawer = document.getElementById('cartDrawer');
  if (drawer && drawer.classList.contains('active')) {
    toggleCartDrawer();
  }

  const modal = document.getElementById('checkoutModal');
  const totalModalEl = document.getElementById('modalTotalPrice');

  let grandTotal = 0;

  cart.forEach((item) => {
    grandTotal += (item.price * item.qty);
  });

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

// Global modal backdrop close listener
window.addEventListener('click', (e) => {
  const orderModeModal = document.getElementById('orderModeModal');
  const checkoutModal = document.getElementById('checkoutModal');
  const ticketModal = document.getElementById('ticketModal');
  const paymentModal = document.getElementById('paymentGatewayModal');

  if (e.target === orderModeModal) closeOrderModeModal();
  if (e.target === checkoutModal) closeCheckoutModal();
  if (e.target === ticketModal) closeTicketModal();
  if (e.target === paymentModal) closePaymentGateway();
});

/**
 * Handle form order submit:
 * Alihkan ke Payment Gateway Resmi untuk memilih metode pembayaran (QRIS / VA / E-Wallet / Cash)
 */
function handleProcessOrder(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('custName').value.trim() || 'Pelanggan';
  const notes = document.getElementById('custNotes').value.trim();

  // Ambil tipe pesanan
  const typeRadios = document.getElementsByName('orderTypeChoice');
  let orderType = 'Makan di Tempat';
  for (let r of typeRadios) {
    if (r.checked) orderType = r.value;
  }

  const tableNum = '-';

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

  // Generate Queue Number & Waktu via shared-store.js
  const queueNum = getNextQueueNumber();
  const timeFormatted = formatOrderTimestamp();

  const menuSummary = itemsList.map(i => `${i.qty}x ${i.name}`).join(', ');

  const draftOrder = {
    id: Date.now(),
    queueNumber: queueNum,
    timestamp: timeFormatted,
    customerName: name,
    orderType: orderType,
    tableNumber: tableNum,
    items: itemsList,
    menuSummary: menuSummary,
    spicyLevel: '-',
    notes: notes,
    totalPrice: grandTotal,
    status: 'Sedang Disiapkan'
  };

  currentDraftOrder = draftOrder;

  // Tutup checkout modal & buka Payment Gateway
  closeCheckoutModal();
  openPaymentGateway(draftOrder);
}

/**
 * ============================================================
 * 5. PEMBAYARAN NON-TUNAI LOGIC (QRIS & E-WALLET)
 * ============================================================
 */
function openPaymentGateway(order) {
  const modal = document.getElementById('paymentGatewayModal');
  const refText = document.getElementById('pgOrderRefText');
  const totalText = document.getElementById('pgTotalAmountText');
  const qrisAmount = document.getElementById('qrisAmountText');

  if (refText) refText.innerText = `Tagihan Pesanan ${order.queueNumber} (${order.orderType})`;
  if (totalText) totalText.innerText = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;
  if (qrisAmount) qrisAmount.innerText = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;

  // Reset overlay verifikasi jika sebelumnya aktif
  const overlay = document.getElementById('pgVerifyingOverlay');
  if (overlay) overlay.classList.remove('active');

  // Set default tab ke QRIS
  switchPaymentTab('qris');

  // Render dynamic QR code untuk QRIS
  renderQrisCode(order);

  // Mulai hitung mundur 5 menit
  startPaymentCountdown(5 * 60);

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePaymentGateway() {
  const modal = document.getElementById('paymentGatewayModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (pgCountdownTimer) {
    clearInterval(pgCountdownTimer);
    pgCountdownTimer = null;
  }
}

function switchPaymentTab(tabName) {
  selectedPaymentTab = tabName;

  // Update tabs button
  const buttons = document.querySelectorAll('.pg-tab-btn');
  buttons.forEach(btn => {
    if (btn.dataset.pgTab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update panels (QRIS & Bayar di Tempat)
  const panels = {
    qris: document.getElementById('pgPanelQris'),
    cash: document.getElementById('pgPanelCash')
  };

  Object.keys(panels).forEach(k => {
    if (panels[k]) {
      if (k === tabName) panels[k].classList.add('active');
      else panels[k].classList.remove('active');
    }
  });
}

function startPaymentCountdown(seconds) {
  if (pgCountdownTimer) clearInterval(pgCountdownTimer);

  const display = document.getElementById('pgCountdownText');
  let remain = seconds;

  function tick() {
    const mins = Math.floor(remain / 60);
    const secs = remain % 60;
    const str = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (display) display.innerText = str;

    if (remain <= 0) {
      clearInterval(pgCountdownTimer);
      if (display) display.innerText = 'Kadaluarsa';
    }
    remain--;
  }

  tick();
  pgCountdownTimer = setInterval(tick, 1000);
}

function renderQrisCode(order) {
  const container = document.getElementById('qrisQrCodeElement');
  if (!container) return;

  const cfg = typeof PAYMENT_GATEWAY_CONFIG !== 'undefined' ? PAYMENT_GATEWAY_CONFIG : {};
  const qrisImgSrc = cfg.qrisImage || 'assets/qris-code.jpg';

  container.innerHTML = `
    <img src="${escapeHtml(qrisImgSrc)}" alt="QRIS" class="qris-official-poster">
  `;
}

function downloadQrisImage() {
  const qrImg = document.querySelector('#qrisQrCodeElement img');
  const cfg = typeof PAYMENT_GATEWAY_CONFIG !== 'undefined' ? PAYMENT_GATEWAY_CONFIG : {};
  const src = (qrImg && qrImg.getAttribute('src')) || cfg.qrisImage || 'assets/qris-code.jpg';

  const link = document.createElement('a');
  link.download = `QRIS_Centeng_${currentDraftOrder ? currentDraftOrder.queueNumber.replace('#', '') : 'Bayar'}.jpg`;
  link.href = src;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Gambar QRIS berhasil di-download!');
}

function copyPaymentAmount() {
  if (!currentDraftOrder) return;
  navigator.clipboard.writeText(currentDraftOrder.totalPrice.toString()).then(() => {
    showToast(`Nominal Rp ${currentDraftOrder.totalPrice.toLocaleString('id-ID')} disalin!`);
  });
}

/**
 * Eksekusi Pembayaran:
 * Verifikasi 1.2 detik -> Animasi sukses -> Catat ke Excel & Layar Antrean -> Buka Struk LUNAS
 */
function executePaymentProcess(methodType, isInstantPaid) {
  if (!currentDraftOrder) return;

  const overlay = document.getElementById('pgVerifyingOverlay');
  const spinner = document.getElementById('pgSpinner');
  const successIcon = document.getElementById('pgSuccessIcon');
  const title = document.getElementById('pgVerifyingTitle');
  const desc = document.getElementById('pgVerifyingDesc');

  if (overlay) {
    overlay.classList.add('active');
    if (spinner) spinner.style.display = 'block';
    if (successIcon) successIcon.style.display = 'none';
    if (title) title.innerText = 'Memproses Pembayaran...';
    if (desc) desc.innerText = 'Pesanan Anda sedang diproses. Mohon tunggu sebentar.';
  }

  setTimeout(() => {
    const txId = generateTransactionId(isInstantPaid ? 'TRX' : 'KASIR');
    const paymentCode = isInstantPaid ? null : String(Math.floor(1000 + Math.random() * 9000));

    const finalizedOrder = {
      ...currentDraftOrder,
      paymentMethod: methodType,
      paymentStatus: isInstantPaid ? 'LUNAS' : 'Belum Bayar',
      status: isInstantPaid ? 'Sedang Disiapkan' : 'Menunggu Pembayaran',
      paymentCode: paymentCode,
      transactionId: txId
    };

    if (spinner) spinner.style.display = 'none';
    if (successIcon) successIcon.style.display = 'flex';
    if (title) title.innerText = isInstantPaid ? 'Pembayaran Berhasil! (LUNAS)' : 'Antrean & Kode Bayar Terbit!';
    if (desc) {
      desc.innerText = isInstantPaid 
        ? `Pembayaran ${txId} via ${methodType} berhasil dicatat. Pesanan Anda segera diproses!`
        : `Tunjukkan Antrean ${finalizedOrder.queueNumber} & Kode Bayar ${paymentCode} ke kasir untuk pembayaran tunai.`;
    }

    setTimeout(() => {
      closePaymentGateway();

      // Simpan ke database LocalStorage & Excel
      saveOrderToStorage(finalizedOrder);
      currentActiveOrder = finalizedOrder;

      // Reset keranjang
      cart = [];
      updateCartUI();

      // Update Layar Antrean Monitor & Banner Pelanggan
      renderQueueBoard();
      updateActiveOrderBanner(finalizedOrder);

      showToast(isInstantPaid
        ? `Pesanan ${finalizedOrder.queueNumber} [LUNAS] masuk dapur!`
        : `Antrean ${finalizedOrder.queueNumber} • Kode Kasir: ${paymentCode}`);

      // Tampilkan Struk Digital Kiosk
      showDigitalTicketModal(finalizedOrder);
    }, 1000);
  }, 1300);
}

/** Memperbarui banner status antrean milik pelanggan aktif di bawah monitor. */
function updateActiveOrderBanner(order) {
  const activeBar = document.getElementById('bkCustomerActiveBar');
  const myQueueNumText = document.getElementById('myQueueNumberText');
  const myQueueStatusText = document.getElementById('myQueueStatusText');
  if (!activeBar || !myQueueNumText || !order) return;

  activeBar.style.display = 'flex';
  myQueueNumText.innerText = order.queueNumber;

  if (order.paymentStatus === 'LUNAS') {
    myQueueStatusText.innerText = `Pesanan ${order.orderType} • Pembayaran: LUNAS (${order.status})`;
  } else {
    myQueueStatusText.innerText = `Menunggu pembayaran tunai di kasir • Kode Validasi: ${order.paymentCode || '-'}`;
  }
}

/**
 * ============================================================
 * 6. LIVE QUEUE SYSTEM (LAYAR ANTREAN MONITOR)
 * ============================================================
 */
function initQueueSystem() {
  if (localStorage.getItem(STORAGE_ORDERS_KEY) === null) {
    const sampleOrders = [
      {
        id: 1001,
        queueNumber: '#001',
        timestamp: 'Hari ini 12:15',
        customerName: 'Budi Santoso',
        orderType: 'Makan di Tempat',
        tableNumber: '-',
        items: [{ name: 'Ayam Geprek', qty: 2, price: 10000, subtotal: 20000 }, { name: 'Es Teh', qty: 2, price: 5000, subtotal: 10000 }],
        menuSummary: '2x Ayam Geprek, 2x Es Teh',
        spicyLevel: '-',
        notes: 'Sambal dipisah',
        totalPrice: 30000,
        status: 'Siap Diambil',
        paymentMethod: 'QRIS',
        paymentStatus: 'LUNAS',
        transactionId: 'TRX-20261118-84920'
      },
      {
        id: 1002,
        queueNumber: '#002',
        timestamp: 'Hari ini 12:20',
        customerName: 'Siti Rahma',
        orderType: 'Bawa Pulang',
        tableNumber: '-',
        items: [{ name: 'Ayam Geprek', qty: 1, price: 10000, subtotal: 10000 }, { name: 'Es Teh', qty: 1, price: 5000, subtotal: 5000 }],
        menuSummary: '1x Ayam Geprek, 1x Es Teh',
        spicyLevel: '-',
        notes: '-',
        totalPrice: 15000,
        status: 'Sedang Disiapkan',
        paymentMethod: 'QRIS',
        paymentStatus: 'LUNAS',
        transactionId: 'TRX-20261118-93102'
      }
    ];
    localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, '2');
    setStoredOrders(sampleOrders, 2);
  }

  renderQueueBoard();
}

function renderQueueBoard() {
  const orders = getStoredOrders();
  const pendingCashOrders = orders.filter(o => o.status === 'Menunggu Pembayaran');

  const pendingBar = document.getElementById('bkPendingCashBar');
  if (pendingBar) {
    if (pendingCashOrders.length > 0) {
      const summary = pendingCashOrders
        .map(o => `<strong>${escapeHtml(o.queueNumber)}</strong> (Kode: ${escapeHtml(o.paymentCode || '-')})`)
        .join(' • ');
      pendingBar.style.display = 'flex';
      pendingBar.innerHTML = `
        <i class="fas fa-clock"></i>
        <span>Menunggu Bayar di Kasir sebelum dimasak: ${summary}</span>
      `;
    } else {
      pendingBar.style.display = 'none';
      pendingBar.innerHTML = '';
    }
  }
}

/**
 * ============================================================
 * 7. DIGITAL STRUK / RECEIPT MODAL
 * ============================================================
 */
function showDigitalTicketModal(order) {
  const modal = document.getElementById('ticketModal');
  const qNum = document.getElementById('ticketQueueNumber');
  const oType = document.getElementById('ticketOrderType');
  const tTime = document.getElementById('ticketTimestamp');
  const tBody = document.getElementById('ticketItemsBody');
  const tPrice = document.getElementById('ticketTotalPrice');
  const stampContainer = document.getElementById('ticketPaymentStampContainer');
  const txIdEl = document.getElementById('ticketTxIdText');

  if (qNum) qNum.innerText = order.queueNumber;
  if (oType) {
    oType.innerText = order.orderType || 'Makan di Tempat';
  }
  if (tTime) tTime.innerText = `${order.timestamp} WIB | Pemesan: ${order.customerName}`;

  if (stampContainer) {
    if (order.paymentStatus === 'LUNAS') {
      stampContainer.innerHTML = `
        <div class="stamp-paid-badge">
          <i class="fas fa-check-circle"></i> LUNAS • PAID (${escapeHtml(order.paymentMethod || 'QRIS')})
        </div>
      `;
    } else {
      stampContainer.innerHTML = `
        <div class="stamp-cash-badge">
          <i class="fas fa-clock"></i> BELUM BAYAR • BAYAR DI KASIR
        </div>
        <div class="ticket-cash-code-box">
          <span>KODE VALIDASI KASIR:</span>
          <strong>${escapeHtml(order.paymentCode || '-')}</strong>
          <small>Tunjukkan antrean &amp; kode ini ke kasir untuk membayar tunai. Pesanan langsung dimasak setelah divalidasi lunas oleh penjual.</small>
        </div>
      `;
    }
  }

  if (txIdEl) {
    txIdEl.innerText = `ID Transaksi: ${order.transactionId || 'TRX-OFFLINE'} | Metode: ${order.paymentMethod || 'QRIS'}`;
  }

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

/**
 * ============================================================
 * 8. HELPER TOAST & NAVIGASI MOBILE (escapeHtml di shared-store.js)
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
