/* ===================================================
   Triple Chocolate Bowle - Main JavaScript
   Features: Intro animation, Scroll effects, Cart,
             Customizer, WhatsApp, Reservation
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -------- INTRO ANIMATION -------- */
  const intro = document.getElementById('intro-overlay');
  setTimeout(() => {
    if (intro) intro.classList.add('hidden');
  }, 3500);

  /* -------- NAVBAR SCROLL -------- */
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 60);
    if (backToTop) backToTop.classList.toggle('show', y > 500);
  });

  /* -------- MOBILE NAV -------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
  }
  // Close nav on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* -------- SMOOTH SCROLL -------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* -------- BACK TO TOP -------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------- SCROLL REVEAL -------- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ========================================
     CUSTOMIZER - Dynamic Price Calculator
     ======================================== */
  const pricing = {
    size: { Small: 149, Medium: 199, Large: 249 },
    base: { Dark: 0, Milk: 0, White: 20 },
    fillings: { 'Brownie chunks': 30, 'Oreo': 35, 'Nuts': 25, 'Caramel': 30, 'Marshmallow': 20 },
    toppings: { 'Choco chips': 20, 'KitKat': 40, 'Gems': 25, 'Syrup drizzle': 15 },
    addons: { 'Ice cream scoop': 50, 'Extra choco layer': 40 }
  };

  const selection = {
    size: 'Medium',
    base: 'Dark',
    fillings: [],
    toppings: [],
    addons: []
  };

  // Handle chip clicks
  document.querySelectorAll('.option-chips').forEach(group => {
    const type = group.dataset.type; // size, base, fillings, toppings, addons
    const isMulti = ['fillings', 'toppings', 'addons'].includes(type);

    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.value;

        if (isMulti) {
          chip.classList.toggle('active');
          const arr = selection[type];
          const idx = arr.indexOf(val);
          if (idx === -1) arr.push(val); else arr.splice(idx, 1);
        } else {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          selection[type] = val;
        }

        updateSummary();
      });
    });
  });

  function updateSummary() {
    let total = 0;
    const lines = [];

    // Size
    const sizePrice = pricing.size[selection.size] || 199;
    total += sizePrice;
    lines.push({ label: `Bowl (${selection.size})`, value: sizePrice });

    // Base
    const basePrice = pricing.base[selection.base] || 0;
    if (basePrice > 0) {
      total += basePrice;
      lines.push({ label: `${selection.base} Chocolate`, value: basePrice });
    }

    // Fillings
    selection.fillings.forEach(f => {
      const p = pricing.fillings[f] || 0;
      total += p;
      lines.push({ label: f, value: p });
    });

    // Toppings
    selection.toppings.forEach(t => {
      const p = pricing.toppings[t] || 0;
      total += p;
      lines.push({ label: t, value: p });
    });

    // Addons
    selection.addons.forEach(a => {
      const p = pricing.addons[a] || 0;
      total += p;
      lines.push({ label: a, value: p });
    });

    // Update DOM
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');

    if (summaryItems) {
      summaryItems.innerHTML = lines.map(l =>
        `<div class="summary-line">
           <span class="label">${l.label}</span>
           <span class="value">\u20B9${l.value}</span>
         </div>`
      ).join('');
    }

    if (summaryTotal) {
      summaryTotal.innerHTML = `
        <span class="label">Total</span>
        <span class="value">\u20B9${total}</span>
      `;
    }

    // Store total for cart
    window.__customTotal = total;
    window.__customSelection = { ...selection, fillings: [...selection.fillings], toppings: [...selection.toppings], addons: [...selection.addons] };
  }

  // Set initial active chips
  document.querySelectorAll('.chip[data-value="Medium"]').forEach(c => {
    if (c.closest('[data-type="size"]')) c.classList.add('active');
  });
  document.querySelectorAll('.chip[data-value="Dark"]').forEach(c => {
    if (c.closest('[data-type="base"]')) c.classList.add('active');
  });
  updateSummary();

  /* ========================================
     CART SYSTEM
     ======================================== */
  let cart = [];

  const cartOverlay = document.querySelector('.cart-overlay');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total-value');
  const cartCountEls = document.querySelectorAll('.cart-count');

  function openCart() {
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
  }
  function closeCart() {
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
  }

  // Cart buttons
  document.querySelectorAll('.open-cart').forEach(btn => {
    btn.addEventListener('click', openCart);
  });
  document.querySelectorAll('.close-cart').forEach(btn => {
    btn.addEventListener('click', closeCart);
  });
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function updateCartUI() {
    const totalItems = cart.length;
    cartCountEls.forEach(el => {
      el.textContent = totalItems;
      el.style.display = totalItems > 0 ? 'flex' : 'none';
    });

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <span class="empty-icon">\uD83D\uDED2</span>
          <p>Your cart is empty</p>
          <p style="font-size:.85rem;margin-top:8px;">Add some delicious chocolatey items!</p>
        </div>`;
      cartTotalEl.textContent = '\u20B90';
      return;
    }

    let total = 0;
    cartItemsEl.innerHTML = cart.map((item, idx) => {
      total += item.price;
      return `
        <div class="cart-item">
          <div class="cart-item-icon">${item.icon}</div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="item-details">${item.details || ''}</p>
          </div>
          <span class="cart-item-price">\u20B9${item.price}</span>
          <button class="cart-item-remove" onclick="removeCartItem(${idx})" title="Remove">&times;</button>
        </div>`;
    }).join('');

    cartTotalEl.textContent = `\u20B9${total}`;
  }

  window.removeCartItem = function(idx) {
    cart.splice(idx, 1);
    updateCartUI();
    showToast('Item removed from cart');
  };

  window.addToCart = function(name, price, icon, details) {
    cart.push({ name, price: Number(price), icon, details: details || '' });
    updateCartUI();
    showToast(`${name} added to cart!`);
  };

  // Add customized bowl to cart
  window.addCustomToCart = function() {
    const sel = window.__customSelection;
    const total = window.__customTotal || 199;
    if (!sel) return;

    const parts = [];
    parts.push(`${sel.size} ${sel.base} Chocolate Bowl`);
    if (sel.fillings.length) parts.push('Fillings: ' + sel.fillings.join(', '));
    if (sel.toppings.length) parts.push('Toppings: ' + sel.toppings.join(', '));
    if (sel.addons.length)   parts.push('Add-ons: ' + sel.addons.join(', '));

    cart.push({
      name: 'Custom Triple Choco Bowle',
      price: total,
      icon: '\uD83C\uDF6B',
      details: parts.join(' | ')
    });
    updateCartUI();
    showToast('Custom bowl added to cart!');
  };

  updateCartUI();

  /* ========================================
     WHATSAPP ORDER
     ======================================== */
  window.placeWhatsAppOrder = function() {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }

    let msg = '*\uD83C\uDF6B Triple Chocolate Bowle - Order*\n\n';
    let total = 0;

    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} — \u20B9${item.price}\n`;
      if (item.details) msg += `   _${item.details}_\n`;
      total += item.price;
    });

    msg += `\n*Total: \u20B9${total}*\n\n`;
    msg += 'Please confirm my order. Thank you! \uD83D\uDE0A';

    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/918605463560?text=${encoded}`;
    window.open(url, '_blank');
  };

  /* ========================================
     TABLE RESERVATION
     ======================================== */
  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    reservationForm.addEventListener('submit', e => {
      e.preventDefault();

      const name   = document.getElementById('res-name').value.trim();
      const phone  = document.getElementById('res-phone').value.trim();
      const date   = document.getElementById('res-date').value;
      const time   = document.getElementById('res-time').value;
      const guests = document.getElementById('res-guests').value;

      if (!name || !phone || !date || !time || !guests) {
        showToast('Please fill in all fields');
        return;
      }

      showToast(`\u2705 Reservation confirmed for ${name}! ${guests} guest(s) on ${date} at ${time}.`);
      reservationForm.reset();
    });
  }

  /* ========================================
     TOAST NOTIFICATION
     ======================================== */
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>\uD83C\uDF6B</span> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  /* -------- PARALLAX EFFECT -------- */
  window.addEventListener('scroll', () => {
    const parallax = document.querySelectorAll('.parallax-divider');
    parallax.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = 0.3;
      el.style.backgroundPositionY = `${rect.top * speed}px`;
    });
  });

});
