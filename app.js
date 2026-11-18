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
let selectedTableNumber = 'Meja 01';
let currentActiveOrder = null;
let currentDraftOrder = null;
let selectedPaymentTab = 'qris';
let selectedVaBank = 'bca';
let selectedEwallet = 'gopay';
let pgCountdownTimer = null;

// State (Konstanta database, OFFICIAL_MENUS, helper tanggal, & Ekspor Excel ada di shared-store.js)

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  setupCategoryTabs();
  setupMobileNav();
  setupTablePicker();
  initQueueSystem();
  startLiveClock();
  updateExcelOrderBadge();

  // Sinkronisasi otomatis lintas tab dengan Halaman Penjual (kasir.html)
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_ORDERS_KEY || event.key === STORAGE_QUEUE_COUNTER_KEY) {
      renderQueueBoard();
      updateExcelOrderBadge();
      if (document.getElementById('excelModal')?.classList.contains('active')) {
        renderExcelModalTable();
      }
    }
  });
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

/** Memilih opsi tipe pesanan pada form checkout (Dine-In / Take Away). */
function selectOrderTypeOption(typeValue) {
  const typeRadios = document.getElementsByName('orderTypeChoice');
  for (let r of typeRadios) {
    r.checked = (r.value === typeValue);
  }
  toggleTableInput(typeValue === 'Makan di Tempat');
}

function startDineInOrder() {
  if (cart.length === 0) {
    addToCart(1);
    addToCart(2);
  }

  const modalTableSelect = document.getElementById('custTableNumber');
  if (modalTableSelect) {
    modalTableSelect.value = selectedTableNumber;
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

function toggleTableInput(isDineIn) {
  const group = document.getElementById('tableInputGroup');
  if (group) {
    group.style.display = isDineIn ? 'block' : 'none';
  }
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

// Global modal backdrop close listener
window.addEventListener('click', (e) => {
  const checkoutModal = document.getElementById('checkoutModal');
  const ticketModal = document.getElementById('ticketModal');
  const excelModal = document.getElementById('excelModal');
  const paymentModal = document.getElementById('paymentGatewayModal');

  if (e.target === checkoutModal) closeCheckoutModal();
  if (e.target === ticketModal) closeTicketModal();
  if (e.target === excelModal) closeExcelModal();
  if (e.target === paymentModal) closePaymentGateway();
});

/**
 * Handle form order submit:
 * Alihkan ke Payment Gateway Resmi untuk memilih metode pembayaran (QRIS / VA / E-Wallet / Cash)
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
    spicyLevel: spicy,
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
 * 5. PAYMENT GATEWAY LOGIC (QRIS, VA, E-WALLET, CASH)
 * ============================================================
 */
function openPaymentGateway(order) {
  const modal = document.getElementById('paymentGatewayModal');
  const refText = document.getElementById('pgOrderRefText');
  const totalText = document.getElementById('pgTotalAmountText');
  const qrisAmount = document.getElementById('qrisAmountText');
  const vaAmount = document.getElementById('vaAmountDisplay');

  if (refText) refText.innerText = `Tagihan Pesanan ${order.queueNumber} (${order.orderType})`;
  if (totalText) totalText.innerText = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;
  if (qrisAmount) qrisAmount.innerText = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;
  if (vaAmount) vaAmount.innerText = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;

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

  // Update panels (Cashless Only untuk halaman pembeli)
  const panels = {
    qris: document.getElementById('pgPanelQris'),
    va: document.getElementById('pgPanelVa'),
    ewallet: document.getElementById('pgPanelEwallet')
  };

  Object.keys(panels).forEach(k => {
    if (panels[k]) {
      if (k === tabName) panels[k].classList.add('active');
      else panels[k].classList.remove('active');
    }
  });
}

function selectVaBank(bankCode) {
  selectedVaBank = bankCode;

  const items = document.querySelectorAll('.va-bank-item');
  items.forEach(it => {
    if (it.dataset.bank === bankCode) it.classList.add('active');
    else it.classList.remove('active');
  });

  const vaNumbers = (typeof PAYMENT_GATEWAY_CONFIG !== 'undefined' && PAYMENT_GATEWAY_CONFIG.vaNumbers) 
    ? PAYMENT_GATEWAY_CONFIG.vaNumbers 
    : { bca: '8801281234567890', mandiri: '8901281234567890', bri: '1201281234567890', bni: '9801281234567890' };

  const bankNames = {
    bca: 'Bank BCA (BCA Virtual Account)',
    mandiri: 'Bank Mandiri (Mandiri Virtual Account)',
    bri: 'Bank BRI (BRIVA Virtual Account)',
    bni: 'Bank BNI (BNI Virtual Account)'
  };

  const rawNum = vaNumbers[bankCode] || '8801281234567890';
  // Format 4 4 4 4
  const formatted = rawNum.replace(/(\d{4})/g, '$1 ').trim();

  const numEl = document.getElementById('vaNumberDisplay');
  const nameEl = document.getElementById('vaBankNameText');

  if (numEl) numEl.innerText = formatted;
  if (nameEl) nameEl.innerText = bankNames[bankCode] || bankCode.toUpperCase();
}

function selectEwallet(walletCode) {
  selectedEwallet = walletCode;

  const items = document.querySelectorAll('.ewallet-item');
  items.forEach(it => {
    if (it.dataset.wallet === walletCode) it.classList.add('active');
    else it.classList.remove('active');
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
  const qrisImgSrc = cfg.qrisImage || 'assets/qris-kiki-ramadhani.jpg';
  const merchantLabel = cfg.merchantName || 'kiki ramadhani';
  const nmidLabel = cfg.qrisNmid || 'ID1026545206900';

  container.innerHTML = `
    <img src="${escapeHtml(qrisImgSrc)}" alt="QRIS ${escapeHtml(merchantLabel)} (NMID: ${escapeHtml(nmidLabel)})" class="qris-official-poster">
  `;
}

function downloadQrisImage() {
  const qrImg = document.querySelector('#qrisQrCodeElement img');
  const cfg = typeof PAYMENT_GATEWAY_CONFIG !== 'undefined' ? PAYMENT_GATEWAY_CONFIG : {};
  const src = (qrImg && qrImg.getAttribute('src')) || cfg.qrisImage || 'assets/qris-kiki-ramadhani.jpg';

  const link = document.createElement('a');
  link.download = `QRIS_kiki_ramadhani_${currentDraftOrder ? currentDraftOrder.queueNumber.replace('#', '') : 'Bayar'}.jpg`;
  link.href = src;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Gambar QRIS berhasil di-download!');
}

function copyVaNumber() {
  const numEl = document.getElementById('vaNumberDisplay');
  if (!numEl) return;
  const raw = numEl.innerText.replace(/\s+/g, '');
  navigator.clipboard.writeText(raw).then(() => {
    showToast(`Nomor Virtual Account ${raw} berhasil disalin!`);
  }).catch(() => {
    showToast(`VA: ${raw}`);
  });
}

function copyVaAmount() {
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
    if (title) title.innerText = 'Memverifikasi Pembayaran...';
    if (desc) desc.innerText = 'Sistem sedang memverifikasi transaksi ke Payment Gateway. Mohon tunggu sebentar.';
  }

  setTimeout(() => {
    // Generate Transaction ID unik via shared-store.js
    const txId = generateTransactionId('TRX');

    let fullMethod = methodType;
    if (methodType === 'Virtual Account') {
      fullMethod = `${selectedVaBank.toUpperCase()} Virtual Account`;
    } else if (methodType === 'E-Wallet') {
      const ewalletNames = { gopay: 'GoPay', dana: 'DANA', ovo: 'OVO', shopeepay: 'ShopeePay' };
      fullMethod = `${ewalletNames[selectedEwallet] || 'E-Wallet'} (Online)`;
    }

    const finalizedOrder = {
      ...currentDraftOrder,
      paymentMethod: fullMethod,
      paymentStatus: isInstantPaid ? 'LUNAS' : 'Bayar di Kasir',
      transactionId: txId
    };

    if (spinner) spinner.style.display = 'none';
    if (successIcon) successIcon.style.display = 'flex';
    if (title) title.innerText = isInstantPaid ? 'Pembayaran Berhasil! (LUNAS)' : 'Pesanan Dikonfirmasi!';
    if (desc) {
      desc.innerText = isInstantPaid 
        ? `Transaksi ${txId} via ${fullMethod} resmi terverifikasi. Nomor antrean Anda aktif di dapur!`
        : `Silakan lakukan pembayaran tunai di kasir dengan menunjukkan nomor antrean Anda.`;
    }

    setTimeout(() => {
      closePaymentGateway();

      // Simpan ke database LocalStorage & Excel
      saveOrderToStorage(finalizedOrder);
      currentActiveOrder = finalizedOrder;

      // Reset keranjang
      cart = [];
      updateCartUI();

      // Update Layar Antrean Monitor
      renderQueueBoard();
      updateExcelOrderBadge();

      // Update Banner Pelanggan Aktif
      const activeBar = document.getElementById('bkCustomerActiveBar');
      const myQueueNumText = document.getElementById('myQueueNumberText');
      const myQueueStatusText = document.getElementById('myQueueStatusText');
      if (activeBar && myQueueNumText) {
        activeBar.style.display = 'flex';
        myQueueNumText.innerText = finalizedOrder.queueNumber;
        myQueueStatusText.innerText = `Pesanan ${finalizedOrder.orderType} (${finalizedOrder.tableNumber !== '-' ? finalizedOrder.tableNumber : 'Counter'}) • Pembayaran: ${finalizedOrder.paymentStatus}`;
      }

      showToast(`Pesanan #${finalizedOrder.queueNumber} [${finalizedOrder.paymentStatus}] masuk ke Rekap Excel!`);

      // Auto-download Excel jika checkbox aktif
      const autoDownloadCheckbox = document.getElementById('autoDownloadExcelCheckbox');
      if (autoDownloadCheckbox && autoDownloadCheckbox.checked) {
        setTimeout(() => {
          exportToExcel(false);
        }, 500);
      }

      // Tampilkan Struk Digital Kiosk berstempel LUNAS
      showDigitalTicketModal(finalizedOrder);
    }, 1000);
  }, 1300);
}

/**
 * ============================================================
 * 6. LIVE QUEUE SYSTEM (LAYAR ANTREAN MONITOR)
 * ============================================================
 */
function initQueueSystem() {
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
        status: 'Siap Diambil',
        paymentMethod: 'QRIS (Gojek/BCA)',
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
        items: [{ name: 'Ayam Geprek', qty: 1, price: 15000, subtotal: 15000 }, { name: 'Es Teh', qty: 1, price: 5000, subtotal: 5000 }],
        menuSummary: '1x Ayam Geprek, 1x Es Teh',
        spicyLevel: 'Level 5 (Pedas Nampol)',
        notes: '-',
        totalPrice: 20000,
        status: 'Sedang Disiapkan',
        paymentMethod: 'BCA Virtual Account',
        paymentStatus: 'LUNAS',
        transactionId: 'TRX-20261118-93102'
      }
    ];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(sampleOrders));
    localStorage.setItem(STORAGE_QUEUE_COUNTER_KEY, '2');
  }

  renderQueueBoard();
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
      const isPaid = o.paymentStatus === 'LUNAS';
      card.innerHTML = `
        <div class="bk-card-num">${o.queueNumber}</div>
        <div class="bk-card-type">${dest}</div>
        <div style="margin: 4px 0;">
          <span class="badge-pay-status ${isPaid ? 'paid' : 'cash'}" style="font-size: 0.65rem;">
            ${isPaid ? '✓ LUNAS' : 'KASIR'}
          </span>
        </div>
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
      const isPaid = o.paymentStatus === 'LUNAS';
      card.innerHTML = `
        <div class="bk-card-num">${o.queueNumber}</div>
        <div class="bk-card-type">${dest}</div>
        <div style="margin: 4px 0;">
          <span class="badge-pay-status ${isPaid ? 'paid' : 'cash'}" style="font-size: 0.65rem;">
            ${isPaid ? '✓ LUNAS' : 'KASIR'}
          </span>
        </div>
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
 * 7. DIGITAL STRUK / RECEIPT MODAL (BURGER KING STYLE)
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
    oType.innerText = order.orderType === 'Makan di Tempat' 
      ? `Makan di Tempat - ${order.tableNumber}` 
      : order.orderType;
  }
  if (tTime) tTime.innerText = `${order.timestamp} WIB | Pemesan: ${order.customerName}`;

  if (stampContainer) {
    if (order.paymentStatus === 'LUNAS') {
      stampContainer.innerHTML = `
        <div class="stamp-paid-badge">
          <i class="fas fa-check-circle"></i> LUNAS • PAID (${escapeHtml(order.paymentMethod || 'ONLINE')})
        </div>
      `;
    } else {
      stampContainer.innerHTML = `
        <div class="stamp-cash-badge">
          <i class="fas fa-clock"></i> BAYAR DI KASIR (${escapeHtml(order.paymentMethod || 'TUNAI')})
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

function downloadCurrentOrderExcel() {
  if (!currentActiveOrder) {
    const orders = getStoredOrders();
    currentActiveOrder = orders[orders.length - 1];
  }
  if (!currentActiveOrder) return;
  exportSingleOrderToExcel(currentActiveOrder);
}

/**
 * ============================================================
 * 8. EXCEL MODAL UI & DATABASE KASIR (Helper di shared-store.js)
 * ============================================================
 */

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
  const statPaid = document.getElementById('statPaidOrders');
  const statCash = document.getElementById('statCashOrders');

  let totalRev = 0;
  let countPaid = 0;
  let countCash = 0;

  orders.forEach(o => {
    totalRev += (o.totalPrice || 0);
    if (o.paymentStatus === 'LUNAS') countPaid++;
    else countCash++;
  });

  if (statOrders) statOrders.innerText = orders.length;
  if (statRevenue) statRevenue.innerText = 'Rp ' + totalRev.toLocaleString('id-ID');
  if (statPaid) statPaid.innerText = countPaid;
  if (statCash) statCash.innerText = countCash;

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
    const isPaid = o.paymentStatus === 'LUNAS';
    tr.innerHTML = `
      <td>${reversed.length - idx}</td>
      <td><strong>${o.queueNumber}</strong></td>
      <td>${o.timestamp}</td>
      <td>${escapeHtml(o.customerName)}</td>
      <td>${escapeHtml(o.orderType)}</td>
      <td>${escapeHtml(o.tableNumber)}</td>
      <td>${escapeHtml(o.menuSummary)}</td>
      <td><strong>Rp ${(o.totalPrice).toLocaleString('id-ID')}</strong></td>
      <td>${escapeHtml(o.paymentMethod || 'QRIS')}</td>
      <td>
        <span class="badge-pay-status ${isPaid ? 'paid' : 'cash'}">
          ${isPaid ? '✓ LUNAS' : 'KASIR'}
        </span>
      </td>
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
  const methods = ['QRIS (Instant)', 'BCA Virtual Account', 'GoPay (E-Wallet)', 'Tunai di Kasir'];
  const randomTable = tables[Math.floor(Math.random() * tables.length)];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomMethod = methods[Math.floor(Math.random() * methods.length)];
  const isPaid = randomMethod !== 'Tunai di Kasir';

  const now = new Date();
  const timeFormatted = formatOrderTimestamp(now);
  const txId = generateTransactionId(isPaid ? 'TRX' : 'CASH', now);

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
    status: 'Sedang Disiapkan',
    paymentMethod: randomMethod,
    paymentStatus: isPaid ? 'LUNAS' : 'Bayar di Kasir',
    transactionId: txId
  };

  saveOrderToStorage(demoOrder);
  renderExcelModalTable();
  renderQueueBoard();
  updateExcelOrderBadge();
  showToast(`Pesanan demo ${queueNum} (${randomMethod}) berhasil ditambahkan!`);
}

/**
 * ============================================================
 * 9. HELPER TOAST & NAVIGASI MOBILE (escapeHtml di shared-store.js)
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
