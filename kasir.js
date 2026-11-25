/**
 * ============================================================
 * AYAM GEPREK CENTENG - SCRIPT KHUSUS PENJUAL / KASIR TUNAI
 * Input pesanan cepat oleh penjual & pencatatan pembayaran Cash
 * ke database antrean & rekap Excel bersama (shared-store.js).
 * ============================================================
 */

let posCart = [];
let posOrderType = 'Makan di Tempat';
let posActiveFilter = 'all';
let posCurrentReceiptOrder = null;

document.addEventListener('DOMContentLoaded', () => {
  posRenderMenu();
  posRenderCart();
  posRenderOrdersTable();
  posStartClock();
  loadOrdersFromBackend(posRenderOrdersTable);

  // Sinkronisasi otomatis real-time lintas tab maupun antar perangkat (via server.js)
  subscribeOrderSync(posRenderOrdersTable);

  window.addEventListener('click', (e) => {
    const receiptModal = document.getElementById('posReceiptModal');
    if (e.target === receiptModal) posCloseReceiptModal();
  });
});

/** Merender kartu menu resmi dengan tombol input cepat untuk kasir. */
function posRenderMenu() {
  const grid = document.getElementById('posMenuGrid');
  if (!grid || typeof MENU_LIST === 'undefined') return;

  grid.innerHTML = '';
  MENU_LIST.forEach((item) => {
    const inCart = posCart.find((c) => c.id === item.id);
    const qty = inCart ? inCart.qty : 0;

    const card = document.createElement('div');
    card.className = `pos-menu-item ${qty > 0 ? 'has-qty' : ''}`;
    card.innerHTML = `
      <div class="pos-menu-top">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="pos-menu-thumb">
        <div class="pos-menu-info">
          <h3>
            ${escapeHtml(item.name)}
            ${qty > 0 ? `<span class="pos-qty-pill">${qty}x</span>` : ''}
          </h3>
          <div class="pos-menu-price">${escapeHtml(item.formattedPrice)}</div>
        </div>
      </div>
      <div class="pos-menu-actions">
        <button type="button" class="pos-btn-add" onclick="posAddItem(${item.id}, 1)">
          <i class="fas fa-plus"></i> Tambah 1
        </button>
        <button type="button" class="pos-btn-quick-qty" onclick="posAddItem(${item.id}, 2)">+2</button>
        <button type="button" class="pos-btn-quick-qty" onclick="posAddItem(${item.id}, 5)">+5</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/** Menambahkan sejumlah menu ke keranjang kasir. */
function posAddItem(menuId, qtyToAdd = 1) {
  const menu = MENU_LIST.find((m) => m.id === menuId);
  if (!menu) return;

  const existing = posCart.find((c) => c.id === menuId);
  if (existing) {
    existing.qty += qtyToAdd;
  } else {
    posCart.push({
      id: menu.id,
      name: menu.name,
      price: menu.price,
      qty: qtyToAdd
    });
  }

  posRenderMenu();
  posRenderCart();
}

/** Mengubah jumlah item di keranjang kasir (+/-). */
function posChangeQty(menuId, delta) {
  const existing = posCart.find((c) => c.id === menuId);
  if (!existing) return;

  existing.qty += delta;
  if (existing.qty <= 0) {
    posCart = posCart.filter((c) => c.id !== menuId);
  }

  posRenderMenu();
  posRenderCart();
}

/** Mengosongkan keranjang kasir saat ini. */
function posClearCart() {
  posCart = [];
  const cashInput = document.getElementById('posCashReceived');
  if (cashInput) cashInput.value = '';
  posRenderMenu();
  posRenderCart();
}

/** Menghitung total harga item di keranjang kasir. */
function posGetCartTotal() {
  return posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** Merender daftar item di panel kanan kasir. */
function posRenderCart() {
  const listEl = document.getElementById('posCartList');
  const totalEl = document.getElementById('posTotalAmount');
  if (!listEl || !totalEl) return;

  const total = posGetCartTotal();
  totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;

  if (posCart.length === 0) {
    listEl.innerHTML = `
      <div class="pos-cart-empty">
        <i class="fas fa-hand-pointer" style="font-size: 1.6rem; margin-bottom: 6px; opacity: 0.45;"></i>
        <p>Belum ada menu dipilih.</p>
        <small>Klik menu di sebelah kiri untuk mulai input pesanan cash.</small>
      </div>
    `;
  } else {
    listEl.innerHTML = '';
    posCart.forEach((item) => {
      const subtotal = item.price * item.qty;
      const row = document.createElement('div');
      row.className = 'pos-cart-row';
      row.innerHTML = `
        <div class="pos-cart-row-info">
          <strong>${escapeHtml(item.name)}</strong>
          <span>Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</span>
        </div>
        <div class="cart-qty-ctrl">
          <button type="button" class="btn-qty" onclick="posChangeQty(${item.id}, -1)">-</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button type="button" class="btn-qty" onclick="posChangeQty(${item.id}, 1)">+</button>
        </div>
        <div class="pos-cart-row-sub">Rp ${subtotal.toLocaleString('id-ID')}</div>
      `;
      listEl.appendChild(row);
    });
  }

  posUpdateCashChange();
}

/** Mengatur pilihan tipe pesanan (Makan di Tempat / Bawa Pulang). */
function posSelectOrderType(type) {
  posOrderType = type;

  document.querySelectorAll('#posOrderTypeRow .pos-choice-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
}

/** Menambahkan catatan cepat ke kolom input catatan kasir. */
function posAppendNote(noteText) {
  const input = document.getElementById('posOrderNotes');
  if (!input) return;

  const existing = input.value.trim();
  if (!existing) {
    input.value = noteText;
    return;
  }
  const parts = existing.split(',').map((s) => s.trim().toLowerCase());
  if (!parts.includes(noteText.toLowerCase())) {
    input.value = `${existing}, ${noteText}`;
  }
}

/** Mengisi input uang tunai dengan tombol nominal cepat. */
function posSetQuickCash(amountOrMode) {
  const input = document.getElementById('posCashReceived');
  if (!input) return;

  const total = posGetCartTotal();
  if (amountOrMode === 'exact') {
    input.value = total > 0 ? String(total) : '';
  } else {
    input.value = String(amountOrMode);
  }
  posUpdateCashChange();
}

/** Menghitung nominal tunai diterima dan kembalian secara konsisten. */
function posComputeCashPayment() {
  const total = posGetCartTotal();
  const input = document.getElementById('posCashReceived');
  const rawVal = input && input.value !== undefined && input.value !== null ? String(input.value).trim() : '';

  if (rawVal === '') {
    return {
      total,
      hasExplicitInput: false,
      cashReceived: total,
      change: 0,
      isSufficient: total > 0
    };
  }

  const paid = Math.max(0, parseInt(rawVal, 10) || 0);
  const diff = paid - total;
  return {
    total,
    hasExplicitInput: true,
    cashReceived: paid,
    change: diff,
    isSufficient: total > 0 && diff >= 0
  };
}

/** Memperbarui tampilan kembalian dan status tombol simpan kasir. */
function posUpdateCashChange() {
  const row = document.getElementById('posChangeRow');
  const label = document.getElementById('posChangeLabel');
  const amount = document.getElementById('posChangeAmount');
  const hint = document.getElementById('posCashHint');
  const submitBtn = document.getElementById('posSubmitBtn');

  const calc = posComputeCashPayment();

  if (calc.total === 0) {
    if (row) row.classList.remove('insufficient');
    if (label) label.innerText = 'Kembalian:';
    if (amount) amount.innerText = 'Rp 0';
    if (hint) hint.innerText = 'Pilih minimal 1 menu terlebih dahulu.';
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  if (!calc.isSufficient) {
    const shortage = Math.abs(calc.change);
    if (row) row.classList.add('insufficient');
    if (label) label.innerText = 'Uang Kurang:';
    if (amount) amount.innerText = `Rp ${shortage.toLocaleString('id-ID')}`;
    if (hint) hint.innerText = 'Nominal uang tunai masih kurang dari total tagihan.';
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  if (row) row.classList.remove('insufficient');
  if (label) label.innerText = 'Kembalian:';
  if (amount) amount.innerText = `Rp ${calc.change.toLocaleString('id-ID')}`;
  if (hint) {
    hint.innerText = calc.hasExplicitInput
      ? `Diterima Rp ${calc.cashReceived.toLocaleString('id-ID')} • Siap diproses LUNAS.`
      : `Uang pas Rp ${calc.total.toLocaleString('id-ID')} (siap langsung simpan).`;
  }
  if (submitBtn) submitBtn.disabled = false;
}

/** Menyimpan pesanan Cash dari penjual, memicu struk, dan memperbarui rekap. */
function posSubmitCashOrder() {
  const calc = posComputeCashPayment();
  if (posCart.length === 0) {
    alert('Pilih menu yang dibeli terlebih dahulu.');
    return;
  }
  if (!calc.isSufficient) {
    alert('Nominal uang cash yang diinput masih kurang dari total pembayaran.');
    return;
  }

  const nameInput = document.getElementById('posCustomerName');
  const notesInput = document.getElementById('posOrderNotes');

  const customerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Pelanggan Tunai';
  const notes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : '-';

  const now = new Date();
  const itemsList = posCart.map((c) => ({
    name: c.name,
    qty: c.qty,
    price: c.price,
    subtotal: c.price * c.qty
  }));

  const newOrder = {
    id: Date.now(),
    queueNumber: getNextQueueNumber(),
    timestamp: formatOrderTimestamp(now),
    customerName: customerName,
    orderType: posOrderType,
    tableNumber: '-',
    items: itemsList,
    menuSummary: itemsList.map((i) => `${i.qty}x ${i.name}`).join(', '),
    spicyLevel: '-',
    notes: notes,
    totalPrice: calc.total,
    status: 'Sedang Disiapkan',
    paymentMethod: 'Tunai / Cash di Kasir',
    paymentStatus: 'LUNAS',
    transactionId: generateTransactionId('CASH', now),
    cashReceived: calc.cashReceived,
    cashChange: calc.change
  };

  saveOrderToStorage(newOrder);
  posRenderOrdersTable();

  // Reset form kasir agar siap langsung melayani pembeli berikutnya
  posCart = [];
  if (nameInput) nameInput.value = '';
  if (notesInput) notesInput.value = '';
  const cashInput = document.getElementById('posCashReceived');
  if (cashInput) cashInput.value = '';
  posRenderMenu();
  posRenderCart();

  showToast(`Pesanan Cash ${newOrder.queueNumber} (LUNAS) masuk dapur & Excel!`);
  posOpenReceiptModal(newOrder);
}

/** Memeriksa apakah metode pembayaran pesanan adalah tunai/cash. */
function isCashPaymentOrder(order) {
  const method = (order.paymentMethod || '').toLowerCase();
  return method.includes('tunai') || method.includes('cash');
}

/** Mengubah filter tampilan tabel antrean & rekap pesanan. */
function posSetFilter(filterName) {
  posActiveFilter = filterName;
  document.querySelectorAll('#posFilterRow .pos-choice-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filterName);
  });
  posRenderOrdersTable();
}

/** Mengevaluasi apakah pesanan cocok dengan filter dan kata kunci pencarian. */
function posMatchesFilter(order, filterName, searchTerm) {
  if (filterName === 'unpaid' && order.paymentStatus === 'LUNAS') return false;
  if (filterName === 'Sedang Disiapkan' && order.status !== 'Sedang Disiapkan') return false;
  if (filterName === 'Siap Diambil' && order.status !== 'Siap Diambil') return false;
  if (filterName === 'cash' && !isCashPaymentOrder(order)) return false;
  if (filterName === 'noncash' && isCashPaymentOrder(order)) return false;

  if (searchTerm) {
    const haystack = `${order.queueNumber} ${order.customerName} ${order.menuSummary} ${order.tableNumber} ${order.paymentCode || ''}`.toLowerCase();
    if (!haystack.includes(searchTerm)) return false;
  }
  return true;
}

/** Merender panel khusus pesanan "Bayar di Tempat" yang belum divalidasi oleh kasir. */
function posRenderPendingCashBox(orders) {
  const box = document.getElementById('posPendingCashBox');
  const listEl = document.getElementById('posPendingCashList');
  const countBadge = document.getElementById('posPendingCountBadge');
  if (!box || !listEl) return;

  const pendingOrders = orders.filter((o) => o.paymentStatus !== 'LUNAS');
  if (countBadge) countBadge.innerText = pendingOrders.length;

  if (pendingOrders.length === 0) {
    box.style.display = 'none';
    listEl.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  listEl.innerHTML = '';

  pendingOrders.forEach((o) => {
    const card = document.createElement('div');
    card.className = 'pos-pending-card';
    const dest = o.orderType || 'Makan di Tempat';
    card.innerHTML = `
      <div class="pos-pending-card-top">
        <div>
          <span class="pos-pending-qnum">${escapeHtml(o.queueNumber)}</span>
          <strong>${escapeHtml(o.customerName)}</strong>
          <small>(${escapeHtml(dest)})</small>
        </div>
        ${o.paymentCode ? `<span class="pos-pending-code">Kode: ${escapeHtml(o.paymentCode)}</span>` : ''}
      </div>
      <div class="pos-pending-menu">${escapeHtml(o.menuSummary)} &bull; <strong>Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}</strong></div>
      <div class="pos-pending-actions">
        <input type="number" id="pendingCashInput_${o.id}" class="form-control pos-pending-input" min="0" step="500" placeholder="Tunai (kosong = pas Rp ${(o.totalPrice || 0).toLocaleString('id-ID')})">
        <button type="button" class="pos-mini-btn pay" onclick="posValidateCashOrder(${o.id})">
          <i class="fas fa-check-circle"></i> Validasi Cash &amp; Masak
        </button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

/** Memperbarui ringkasan statistik omzet Cash, Non-Tunai, dan total pesanan. */
function posRenderStats(orders) {
  let totalRev = 0;
  let cashRev = 0;
  let nonCashRev = 0;

  orders.forEach((o) => {
    if (o.paymentStatus !== 'LUNAS') return;
    const amount = o.totalPrice || 0;
    totalRev += amount;
    if (isCashPaymentOrder(o)) cashRev += amount;
    else nonCashRev += amount;
  });

  const badge = document.getElementById('posOrderCountBadge');
  const totalEl = document.getElementById('posStatTotal');
  const revEl = document.getElementById('posStatRevenue');
  const cashEl = document.getElementById('posStatCashRevenue');
  const nonCashEl = document.getElementById('posStatNonCashRevenue');

  if (badge) badge.innerText = orders.length;
  if (totalEl) totalEl.innerText = orders.length;
  if (revEl) revEl.innerText = `Rp ${totalRev.toLocaleString('id-ID')}`;
  if (cashEl) cashEl.innerText = `Rp ${cashRev.toLocaleString('id-ID')}`;
  if (nonCashEl) nonCashEl.innerText = `Rp ${nonCashRev.toLocaleString('id-ID')}`;
}

/** Merender tabel daftar antrean & riwayat penjualan di halaman kasir. */
function posRenderOrdersTable() {
  const orders = getStoredOrders();
  posRenderPendingCashBox(orders);
  posRenderStats(orders);

  const tbody = document.getElementById('posOrdersTableBody');
  if (!tbody) return;

  const searchInput = document.getElementById('posSearchInput');
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const filtered = [...orders].reverse().filter((o) => posMatchesFilter(o, posActiveFilter, searchTerm));

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fas fa-receipt" style="font-size: 2rem; opacity: 0.35; margin-bottom: 8px;"></i>
          <p>Belum ada pesanan yang sesuai filter ini.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach((o) => {
    const tr = document.createElement('tr');
    const isPaid = o.paymentStatus === 'LUNAS';
    const dest = o.orderType || 'Makan di Tempat';
    const cashDetail = o.cashReceived !== undefined && o.cashReceived !== null
      ? `<br><small style="color: #107C41;">Bayar Rp ${o.cashReceived.toLocaleString('id-ID')} • Kembali Rp ${(o.cashChange || 0).toLocaleString('id-ID')}</small>`
      : '';
    const extraNotes = o.notes && o.notes !== '-' ? `Catatan: ${o.notes}` : '';

    tr.innerHTML = `
      <td><strong>${escapeHtml(o.queueNumber)}</strong></td>
      <td>${escapeHtml(o.timestamp)}</td>
      <td>
        <strong>${escapeHtml(o.customerName)}</strong><br>
        <small style="color: var(--text-muted);">${escapeHtml(dest)}</small>
      </td>
      <td>
        <strong>${escapeHtml(o.menuSummary)}</strong>
        ${extraNotes ? `<br><small style="color: var(--text-muted);">${escapeHtml(extraNotes)}</small>` : ''}
      </td>
      <td><strong>Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}</strong></td>
      <td>
        <span class="badge-pay-status ${isPaid ? 'paid' : 'cash'}">${isPaid ? '✓ LUNAS' : escapeHtml(o.paymentStatus || 'BELUM BAYAR')}</span><br>
        <small style="color: var(--text-muted);">${escapeHtml(o.paymentMethod || 'QRIS')}${!isPaid && o.paymentCode ? ` • Kode: ${escapeHtml(o.paymentCode)}` : ''}</small>${cashDetail}
      </td>
      <td>
        <span class="badge-status ${o.status === 'Siap Diambil' || o.status === 'Selesai' ? 'ready' : 'preparing'}">${escapeHtml(o.status)}</span>
      </td>
      <td>
        <div class="pos-action-group">
          ${!isPaid ? `<button type="button" class="pos-mini-btn pay" onclick="posValidateCashOrder(${o.id})" title="Terima uang cash dan validasi masuk dapur"><i class="fas fa-money-bill-wave"></i> Lunas Cash</button>` : ''}
          ${!isPaid ? `<button type="button" class="pos-mini-btn done" onclick="posValidateAndCompleteOrder(${o.id})" title="Validasi cash &amp; selesaikan antrean"><i class="fas fa-check-double"></i> Validasi Selesai</button>` : ''}
          ${isPaid && o.status === 'Sedang Disiapkan' ? `<button type="button" class="pos-mini-btn ready" onclick="posUpdateOrderStatus(${o.id}, 'Siap Diambil')"><i class="fas fa-bell"></i> Siap</button>` : ''}
          ${isPaid && o.status !== 'Selesai' ? `<button type="button" class="pos-mini-btn done" onclick="posUpdateOrderStatus(${o.id}, 'Selesai')" title="Validasi antrean selesai"><i class="fas fa-check"></i> Validasi Selesai</button>` : ''}
          <button type="button" class="pos-mini-btn" onclick="posViewOrderReceipt(${o.id})" title="Lihat & Cetak Struk"><i class="fas fa-receipt"></i></button>
          <button type="button" class="pos-mini-btn danger" onclick="posDeleteOrder(${o.id})" title="Hapus pesanan"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/** Memvalidasi pembayaran tunai "Bayar di Tempat", menandai LUNAS & meneruskan ke dapur. */
function posValidateCashOrder(orderId) {
  const orders = getStoredOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) return;

  const total = target.totalPrice || 0;
  const cashInput = document.getElementById(`pendingCashInput_${orderId}`);
  const rawVal = cashInput && cashInput.value !== undefined && cashInput.value !== null ? String(cashInput.value).trim() : '';

  let cashReceived = total;
  if (rawVal !== '') {
    cashReceived = Math.max(0, parseInt(rawVal, 10) || 0);
    if (cashReceived < total) {
      alert(`Uang tunai kurang! Total tagihan Rp ${total.toLocaleString('id-ID')}.`);
      return;
    }
  }

  const change = cashReceived - total;
  target.paymentMethod = 'Bayar di Tempat (Cash Kasir)';
  target.paymentStatus = 'LUNAS';
  target.cashReceived = cashReceived;
  target.cashChange = change;
  if (target.status === 'Menunggu Pembayaran') {
    target.status = 'Sedang Disiapkan';
  }

  setStoredOrders(orders);
  posRenderOrdersTable();

  const changeMsg = change > 0 ? ` • Kembalian: Rp ${change.toLocaleString('id-ID')}` : '';
  showToast(`Pesanan ${target.queueNumber} LUNAS & masuk antrean dapur!${changeMsg}`);
}

/** Alias kompatibilitas untuk pelunasan tunai di kasir. */
function posMarkOrderPaidCash(orderId) {
  posValidateCashOrder(orderId);
}

/** Memvalidasi pembayaran cash (jika belum lunas) sekaligus menandai antrean Selesai. */
function posValidateAndCompleteOrder(orderId) {
  const orders = getStoredOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) return;

  if (target.paymentStatus !== 'LUNAS') {
    const total = target.totalPrice || 0;
    const cashInput = document.getElementById(`pendingCashInput_${orderId}`);
    const rawVal = cashInput && cashInput.value !== undefined && cashInput.value !== null ? String(cashInput.value).trim() : '';

    let cashReceived = total;
    if (rawVal !== '') {
      cashReceived = Math.max(0, parseInt(rawVal, 10) || 0);
      if (cashReceived < total) {
        alert(`Uang tunai kurang! Total tagihan Rp ${total.toLocaleString('id-ID')}.`);
        return;
      }
    }
    target.paymentMethod = 'Bayar di Tempat (Cash Kasir)';
    target.paymentStatus = 'LUNAS';
    target.cashReceived = cashReceived;
    target.cashChange = cashReceived - total;
  }

  target.status = 'Selesai';
  setStoredOrders(orders);
  posRenderOrdersTable();
  showToast(`Antrean ${target.queueNumber} tervalidasi LUNAS & Selesai!`);
}

/** Memvalidasi antrean melalui scan QR kasir, nomor antrean (#003), atau kode bayar 4-digit. */
function posValidateByCodeOrQr() {
  const input = document.getElementById('posValidateCodeInput');
  const raw = input ? String(input.value || '').trim() : '';
  if (!raw) {
    alert('Masukkan atau scan QR / nomor antrean / kode bayar terlebih dahulu.');
    return;
  }

  let queueToken = raw;
  let codeToken = raw;
  if (raw.includes('|')) {
    const parts = raw.split('|').map((s) => s.trim());
    queueToken = parts[1] || '';
    codeToken = parts[2] || '';
  }

  const normalizedQueue = /^\d+$/.test(queueToken.replace(/^#/, ''))
    ? `#${queueToken.replace(/^#/, '').padStart(3, '0')}`
    : queueToken.toUpperCase();

  const orders = getStoredOrders();
  const target = orders.find((o) => {
    if (o.status === 'Selesai') return false;
    const matchQueue = o.queueNumber && o.queueNumber.toUpperCase() === normalizedQueue;
    const matchCode = o.paymentCode && String(o.paymentCode).trim() === codeToken;
    return matchQueue || matchCode;
  });

  if (!target) {
    alert(`Antrean aktif dengan QR/kode "${raw}" tidak ditemukan.`);
    return;
  }

  if (input) input.value = '';
  posValidateAndCompleteOrder(target.id);
}

/** Memperbarui status dapur pesanan (Siap Diambil / Selesai). */
function posUpdateOrderStatus(orderId, newStatus) {
  const orders = getStoredOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) return;

  if (newStatus === 'Selesai' && target.paymentStatus !== 'LUNAS') {
    alert('Pesanan belum lunas! Validasi pembayaran cash di kasir terlebih dahulu.');
    return;
  }

  target.status = newStatus;
  setStoredOrders(orders);
  posRenderOrdersTable();
  showToast(`Status ${target.queueNumber} diubah menjadi: ${newStatus}`);
}

/** Membuka struk pesanan tertentu dari riwayat tabel. */
function posViewOrderReceipt(orderId) {
  const order = getStoredOrders().find((o) => o.id === orderId);
  if (order) posOpenReceiptModal(order);
}

/** Menghapus satu pesanan dari database. */
function posDeleteOrder(orderId) {
  if (!confirm('Hapus pesanan ini dari riwayat penjualan?')) return;
  const orders = getStoredOrders().filter((o) => o.id !== orderId);
  setStoredOrders(orders);
  posRenderOrdersTable();
  showToast('Pesanan berhasil dihapus.');
}

/** Menghapus seluruh data pesanan dan mengulang counter antrean ke #001. */
function posClearAllOrders() {
  if (!confirm('Hapus seluruh riwayat pesanan & reset nomor antrean ke #001?')) return;
  clearStoredOrders();
  posRenderOrdersTable();
  showToast('Seluruh riwayat pesanan berhasil di-reset.');
}

/** Menampilkan modal struk kasir dengan rincian pembayaran & kembalian. */
function posOpenReceiptModal(order) {
  posCurrentReceiptOrder = order;
  const modal = document.getElementById('posReceiptModal');
  const queueEl = document.getElementById('posReceiptQueue');
  const typeEl = document.getElementById('posReceiptType');
  const stampEl = document.getElementById('posReceiptStamp');
  const txIdEl = document.getElementById('posReceiptTxId');
  const timeEl = document.getElementById('posReceiptTimestamp');
  const bodyEl = document.getElementById('posReceiptItemsBody');
  const totalEl = document.getElementById('posReceiptTotal');
  const cashBoxEl = document.getElementById('posReceiptCashBox');
  const paidEl = document.getElementById('posReceiptPaid');
  const changeEl = document.getElementById('posReceiptChange');

  if (queueEl) queueEl.innerText = order.queueNumber;
  if (typeEl) {
    typeEl.innerText = order.orderType || 'Makan di Tempat';
  }
  if (stampEl) {
    const isPaid = order.paymentStatus === 'LUNAS';
    const stampClass = isPaid ? 'stamp-paid-badge' : 'stamp-cash-badge';
    const iconClass = isPaid ? 'fa-check-circle' : 'fa-clock';
    const labelText = isPaid ? 'LUNAS' : escapeHtml(order.paymentStatus || 'BELUM LUNAS');
    stampEl.innerHTML = `<div class="${stampClass}"><i class="fas ${iconClass}"></i> ${labelText} • ${escapeHtml(order.paymentMethod || 'TUNAI CASH')}</div>`;
  }
  if (txIdEl) txIdEl.innerText = `ID Transaksi: ${order.transactionId || '-'}`;
  if (timeEl) timeEl.innerText = `${order.timestamp} WIB | Pemesan: ${order.customerName}`;

  if (bodyEl) {
    bodyEl.innerHTML = '';
    (order.items || []).forEach((it) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.qty}x ${escapeHtml(it.name)}</td>
        <td style="text-align: right; font-weight: 700;">Rp ${(it.price * it.qty).toLocaleString('id-ID')}</td>
      `;
      bodyEl.appendChild(tr);
    });
  }

  if (totalEl) totalEl.innerText = `Rp ${(order.totalPrice || 0).toLocaleString('id-ID')}`;

  if (cashBoxEl) {
    const hasCashInfo = order.cashReceived !== undefined && order.cashReceived !== null;
    cashBoxEl.style.display = hasCashInfo ? 'block' : 'none';
    if (hasCashInfo) {
      if (paidEl) paidEl.innerText = `Rp ${order.cashReceived.toLocaleString('id-ID')}`;
      if (changeEl) changeEl.innerText = `Rp ${(order.cashChange || 0).toLocaleString('id-ID')}`;
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/** Menutup modal struk kasir. */
function posCloseReceiptModal() {
  const modal = document.getElementById('posReceiptModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/** Mencetak struk kasir melalui dialog print browser. */
function posPrintReceipt() {
  document.body.classList.add('printing-pos-receipt');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-pos-receipt');
  }, 500);
}

/** Mengunduh struk kasir aktif ke file Excel (.xlsx). */
function posDownloadReceiptExcel() {
  if (posCurrentReceiptOrder) {
    exportSingleOrderToExcel(posCurrentReceiptOrder);
  }
}

/** Menjalankan jam digital kasir secara real-time. */
function posStartClock() {
  const clockEl = document.getElementById('posLiveClock');
  if (!clockEl) return;

  function tick() {
    const str = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\./g, ':');
    clockEl.innerText = `${str} WIB`;
  }
  tick();
  setInterval(tick, 1000);
}

/** Menampilkan notifikasi toast di pojok bawah halaman kasir. */
function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  const msgEl = document.getElementById('toastNoticeMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
