/**
 * ============================================================
 * AYAM GEPREK CENTENG - APPLICATION LOGIC
 * ============================================================
 */

// State variables
let currentCategoryFilter = 'all';
let currentBasePrice = 18000;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Menu Render
  renderMenuList('all');

  // 2. Setup Category Filter Tabs
  setupFilterTabs();

  // 3. Setup 3D Customizer Controls
  setup3dControls();

  // 4. Setup Mobile Navigation Toggle
  setupMobileNav();

  // 5. Setup Scroll Spy for Active Nav Links
  setupScrollSpy();
});

/**
 * Render dynamic menu cards from menu-data.js
 */
function renderMenuList(category) {
  const grid = document.getElementById('menuGrid');
  if (!grid || typeof MENU_LIST === 'undefined') return;

  grid.innerHTML = '';

  const filtered = category === 'all' 
    ? MENU_LIST 
    : MENU_LIST.filter(item => item.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-utensils" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--border-color);"></i>
        <p>Belum ada menu di kategori ini.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';

    // Spicy badge if applicable
    const spicyFlag = item.isSpicySelectable 
      ? `<span class="card-spicy-flag"><i class="fas fa-pepper-hot"></i> Level 0-10</span>`
      : '';

    // Action button: If it's geprek, allow 3D preview link too
    const previewBtn = item.category === 'geprek'
      ? `<button class="btn btn-outline btn-sm" onclick="previewMenuItemIn3D('${escapeHtml(item.name)}')">
           <i class="fas fa-cube"></i> 3D
         </button>`
      : '';

    card.innerHTML = `
      <div class="card-thumb-placeholder">
        <span class="card-badge">${escapeHtml(item.badge || 'Pilihan')}</span>
        ${spicyFlag}
        <i class="fas ${escapeHtml(item.icon || 'fa-drumstick-bite')} card-icon-big"></i>
      </div>
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(item.name)}</h3>
        <p class="card-desc">${escapeHtml(item.description)}</p>
        <div class="card-footer">
          <span class="card-price">${escapeHtml(item.formattedPrice)}</span>
          <div style="display: flex; gap: 8px;">
            ${previewBtn}
            <button class="btn btn-primary btn-sm" onclick="openOrderModal('${escapeHtml(item.name)}')">
              <i class="fab fa-whatsapp"></i> Pesan
            </button>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/**
 * Filter tabs click events
 */
function setupFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-category');
      currentCategoryFilter = cat;
      renderMenuList(cat);
    });
  });
}

/**
 * Setup 3D Customizer event listeners
 */
function setup3dControls() {
  // A. Sambal Buttons
  const sambalButtons = document.querySelectorAll('.sambal-btn');
  sambalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sambalButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const sambalType = btn.getAttribute('data-sambal');
      if (main3dViewer) {
        main3dViewer.setSambalVariant(sambalType);
      }
      updateCustomizerSummary();
    });
  });

  // B. Slider Level Pedas
  const pedasSlider = document.getElementById('pedasSlider');
  const levelLabel = document.getElementById('levelLabelText');
  if (pedasSlider) {
    pedasSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      let desc = `Level ${val}`;
      if (val === 0) desc = 'Level 0 (Original - Tidak Pedas)';
      else if (val <= 2) desc = `Level ${val} (Pedas Santai)`;
      else if (val <= 4) desc = `Level ${val} (Sedang - Pas)`;
      else if (val <= 7) desc = `Level ${val} (Pedas Nampol 🔥)`;
      else desc = `Level ${val} (Centeng Bar-bar! 🌶️🔥)`;

      if (levelLabel) levelLabel.innerText = desc;

      if (main3dViewer) {
        main3dViewer.setPedasLevel(val);
      }
      updateCustomizerSummary();
    });
  }

  // C. Toppings Checkboxes
  const toggleMozarella = document.getElementById('toggleMozarella');
  const toggleNasi = document.getElementById('toggleNasi');
  const toggleLalapan = document.getElementById('toggleLalapan');

  if (toggleMozarella) {
    toggleMozarella.addEventListener('change', (e) => {
      if (main3dViewer) main3dViewer.toggleMozarella(e.target.checked);
      updateCustomizerSummary();
    });
  }

  if (toggleNasi) {
    toggleNasi.addEventListener('change', (e) => {
      if (main3dViewer) main3dViewer.toggleNasi(e.target.checked);
      updateCustomizerSummary();
    });
  }

  if (toggleLalapan) {
    toggleLalapan.addEventListener('change', (e) => {
      if (main3dViewer) main3dViewer.toggleLalapan(e.target.checked);
    });
  }

  // D. Tool Buttons (Reset & AutoRotate)
  const btnReset = document.getElementById('btnResetCamera');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (main3dViewer) main3dViewer.resetCamera();
    });
  }

  const btnAutoRotate = document.getElementById('btnToggleAutoRotate');
  const iconAutoRotate = document.getElementById('iconAutoRotate');
  if (btnAutoRotate) {
    btnAutoRotate.addEventListener('click', () => {
      if (main3dViewer) {
        const isRotating = main3dViewer.toggleAutoRotate();
        if (iconAutoRotate) {
          iconAutoRotate.className = isRotating ? 'fas fa-pause' : 'fas fa-play';
        }
      }
    });
  }

  updateCustomizerSummary();
}

/**
 * Update 3D Customizer Status Pill and Estimated Price
 */
function updateCustomizerSummary() {
  const activeSambalBtn = document.querySelector('.sambal-btn.active');
  const sambalName = activeSambalBtn 
    ? activeSambalBtn.querySelector('.sambal-name').innerText 
    : 'Sambal Korek';

  const pedasSlider = document.getElementById('pedasSlider');
  const pedasVal = pedasSlider ? pedasSlider.value : 3;

  const toggleMozarella = document.getElementById('toggleMozarella');
  const hasMozarella = toggleMozarella ? toggleMozarella.checked : false;

  const toggleNasi = document.getElementById('toggleNasi');
  const hasNasi = toggleNasi ? toggleNasi.checked : true;

  // Calculate Price
  let totalPrice = 15000; // Base Ayam Geprek
  if (hasNasi) totalPrice += 4000;
  if (hasMozarella) totalPrice += 5000;

  // Format IDR
  const priceDisplay = document.getElementById('customPriceDisplay');
  if (priceDisplay) {
    priceDisplay.innerText = 'Rp ' + totalPrice.toLocaleString('id-ID');
  }

  // Update Status Pill
  const pillText = document.getElementById('statusPillText');
  if (pillText) {
    let text = `${sambalName} • Level ${pedasVal}`;
    if (hasMozarella) text += ' • +Mozarella';
    pillText.innerText = text;
  }
}

/**
 * Scroll to 3D section and focus
 */
function previewMenuItemIn3D(menuName) {
  const previewSection = document.getElementById('preview3d');
  if (previewSection) {
    previewSection.scrollIntoView({ behavior: 'smooth' });
    const pillText = document.getElementById('statusPillText');
    if (pillText) {
      pillText.innerText = `Menampilkan 3D: ${menuName}`;
    }
  }
}

/**
 * Order directly from 3D Customizer
 */
function orderFrom3dCustomizer() {
  const activeSambalBtn = document.querySelector('.sambal-btn.active');
  const sambalName = activeSambalBtn 
    ? activeSambalBtn.querySelector('.sambal-name').innerText 
    : 'Sambal Korek';

  const pedasSlider = document.getElementById('pedasSlider');
  const pedasVal = pedasSlider ? pedasSlider.value : 3;

  const hasMozarella = document.getElementById('toggleMozarella')?.checked;
  const hasNasi = document.getElementById('toggleNasi')?.checked;

  let menuDesc = `Paket Geprek 3D Custom (${sambalName})`;
  let extras = [];
  if (hasNasi) extras.push('Nasi Putih');
  if (hasMozarella) extras.push('Mozarella Melt');
  if (extras.length > 0) {
    menuDesc += ` [Extra: ${extras.join(', ')}]`;
  }

  openOrderModal(menuDesc, `Level ${pedasVal}`);
}

/**
 * Order Modal Handlers
 */
function openOrderModal(prefilledMenu = '', prefilledLevel = '') {
  const modal = document.getElementById('orderModal');
  const menuInput = document.getElementById('orderMenu');
  const levelSelect = document.getElementById('orderLevel');

  if (menuInput && prefilledMenu) {
    menuInput.value = prefilledMenu;
  } else if (menuInput && !menuInput.value) {
    menuInput.value = 'Paket Geprek Centeng Signature';
  }

  if (levelSelect && prefilledLevel) {
    for (let opt of levelSelect.options) {
      if (opt.value.includes(prefilledLevel)) {
        opt.selected = true;
        break;
      }
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside dialog
window.addEventListener('click', (e) => {
  const modal = document.getElementById('orderModal');
  if (e.target === modal) {
    closeOrderModal();
  }
});

/**
 * Handle form submit and redirect to WhatsApp
 */
function handleSendWaOrder(e) {
  e.preventDefault();

  const name = document.getElementById('orderName').value.trim();
  const menu = document.getElementById('orderMenu').value.trim();
  const level = document.getElementById('orderLevel').value;
  const qty = document.getElementById('orderQty').value;
  const notes = document.getElementById('orderNotes').value.trim();

  const waNumber = (typeof WA_PHONE_NUMBER !== 'undefined' && WA_PHONE_NUMBER) 
    ? WA_PHONE_NUMBER 
    : '6281234567890';

  let message = `Halo Admin *Ayam Geprek Centeng*, saya mau pesan nih:\n\n`;
  message += `👤 *Nama:* ${name}\n`;
  message += `🍗 *Menu:* ${menu}\n`;
  message += `🌶️ *Level Pedas:* ${level}\n`;
  message += `📦 *Jumlah:* ${qty} Porsi\n`;
  if (notes) {
    message += `📝 *Catatan / Alamat:* ${notes}\n`;
  }
  message += `\nMohon total pembayaran dan info rekening/QRIS ya min. Terima kasih! 🙏`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  
  // Close modal and redirect
  closeOrderModal();
  window.open(waUrl, '_blank');
}

/**
 * Mobile Navigation Toggle
 */
function setupMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close when clicking a nav link
    const links = navMenu.querySelectorAll('.nav-link');
    links.forEach(l => {
      l.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

/**
 * Smooth Scroll Spy for Active Navigation Links
 */
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

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

/**
 * Utility HTML sanitizer
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
