/* ================================================
   3T COFFÉ - LAYOUT JS v2.0
   Shared layout: Header, Footer, Cart Drawer,
   Marketing Popup, Hero Slider, Scroll Animations
   ================================================ */

(function() {
  'use strict';

  // ── Page Loader ──
  window.addEventListener('load', function() {
    var loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(function() {
        loader.style.opacity = '0';
        setTimeout(function() { loader.style.display = 'none'; }, 500);
      }, 300);
    }
  });

  // ── Scroll Animations (IntersectionObserver) ──
  var scrollAnimObserver = null;
  var animateSelector = '[data-animate], [data-animate-left], [data-animate-right], [data-animate-scale]';

  function observeAnimatedElements(root) {
    var scope = root || document;
    scope.querySelectorAll(animateSelector).forEach(function(el) {
      if (el.classList.contains('visible')) return;
      if (scrollAnimObserver) {
        scrollAnimObserver.observe(el);
      } else {
        el.classList.add('visible');
      }
    });
  }

  window.refreshScrollAnimations = function(root) {
    observeAnimatedElements(root || document);
  };

  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(animateSelector).forEach(function(el) {
        el.classList.add('visible');
      });
      return;
    }
    scrollAnimObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollAnimObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    observeAnimatedElements(document);
  }

  // ── Hero Slider ──
  function initHeroSlider() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) return;
    var slides = slider.querySelectorAll('.hero-slide');
    var dots = slider.querySelectorAll('.hero-dot');
    var prevBtn = slider.querySelector('.hero-arrow-prev');
    var nextBtn = slider.querySelector('.hero-arrow-next');
    var current = 0;
    var timer;

    function showSlide(index) {
      if (slides.length === 0) return;
      slides.forEach(function(s, i) {
        s.classList.toggle('active', i === index);
      });
      dots.forEach(function(d, i) {
        d.classList.toggle('active', i === index);
      });
      current = index;
    }

    function nextSlide() {
      showSlide((current + 1) % slides.length);
    }

    function startTimer() {
      if (slides.length > 1) {
        timer = setInterval(nextSlide, 5000);
      }
    }

    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
        resetTimer();
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', function() {
      showSlide((current - 1 + slides.length) % slides.length);
      resetTimer();
    });

    if (nextBtn) nextBtn.addEventListener('click', function() {
      nextSlide();
      resetTimer();
    });

    startTimer();
  }

  // ── gio hang──
  window.openCartDrawer = function() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  };

  window.closeCartDrawer = function() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.renderCartDrawer = function() {
    var body = document.getElementById('cartDrawerBody');
    var footer = document.getElementById('cartDrawerFooter');
    if (!body || !footer) return;

    var cart = JSON.parse(localStorage.getItem('plei_cart') || '[]');
    var coupon = null;
    try { coupon = JSON.parse(localStorage.getItem('plei_applied_coupon') || 'null'); } catch(e) {}
    var settings = (typeof DATA !== 'undefined' && DATA.settings) || {};
    var freeShipping = settings.freeShippingMin || 200000;
    var shippingFee = settings.shippingFee || 30000;

    if (cart.length === 0) {
      body.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p style="font-weight:600;color:var(--coffee-700);margin-bottom:4px">Giỏ hàng trống</p><p style="font-size:0.85rem;color:var(--coffee-500);margin-bottom:1rem">Chưa có sản phẩm nào trong giỏ hàng</p><a href="san-pham.html" class="btn-primary-coffee mt-2">☕ Khám phá menu</a></div>';
      footer.style.display = 'none';
      updateHeaderCart();
      return;
    }

    footer.style.display = 'block';

    var subtotal = 0;
    var totalQty = 0;
    var html = '';

    // Free shipping progress bar
    var remaining = Math.max(0, freeShipping - subtotal);
    html += '<div class="cart-shipping-progress">' +
      '<div class="text">';
    if (subtotal >= freeShipping) {
      html += '🎉 Bạn đã được <strong>miễn phí giao hàng!</strong>';
    } else {
      html += 'Mua thêm <strong>' + formatPrice(remaining) + '</strong> để được miễn phí giao hàng';
    }
    html += '</div>' +
      '<div class="cart-shipping-bar">' +
        '<div class="cart-shipping-bar-fill" style="width:' + Math.min(100, (subtotal / freeShipping) * 100) + '%"></div>' +
      '</div>' +
    '</div>';

    cart.forEach(function(item) {
      var price = item.salePrice || item.price;
      subtotal += price * item.quantity;
      totalQty += item.quantity;
      html += '<div class="cart-item">' +
        '<img src="' + (item.image || 'images/placeholder.jpg') + '" alt="' + item.name + '" class="cart-item-img" loading="lazy">' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          '<div class="cart-item-price">' + formatPrice(price) + ' × ' + item.quantity + '</div>' +
          '<div class="d-flex align-items-center gap-2 mt-2">' +
            '<div class="qty-selector" style="font-size:0.8rem">' +
              '<button class="qty-btn" onclick="changeCartQty(\'' + item.id + '\', -1)">−</button>' +
              '<input class="qty-input" type="text" value="' + item.quantity + '" readonly>' +
              '<button class="qty-btn" onclick="changeCartQty(\'' + item.id + '\', 1)">+</button>' +
            '</div>' +
            '<button class="cart-item-remove" onclick="removeCartItem(\'' + item.id + '\')" title="Xóa">✕</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    body.innerHTML = html;

    var shipping = subtotal >= freeShipping ? 0 : shippingFee;

    // Calculate discount from coupon
    var discount = 0;
    if (coupon) {
      switch (coupon.discountType) {
        case 'fixed': discount = coupon.discount; break;
        case 'percent':
          discount = subtotal * (coupon.discount / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          discount = Math.floor(discount);
          break;
        case 'freeship': shipping = 0; break;
      }
    }

    var total = subtotal + shipping - discount;

    var footerHTML =
      '<div class="cart-total-row"><span>Tổng (' + totalQty + ' sản phẩm)</span><span>' + formatPrice(subtotal) + '</span></div>';
    if (discount > 0) {
      footerHTML += '<div class="cart-total-row"><span>Giảm giá</span><span style="color:#22c55e;font-weight:600">-' + formatPrice(discount) + '</span></div>';
    }
    footerHTML += '<div class="cart-total-row"><span>Phí giao hàng</span><span>' + (shipping === 0 ? '<span style="color:#22c55e;font-weight:600">Miễn phí</span>' : formatPrice(shipping)) + '</span></div>' +
      '<div class="cart-total-row" style="border-top:2px solid var(--coffee-200);padding-top:12px;margin-top:4px"><strong>Tổng cộng</strong><strong style="font-size:1.15rem;color:#dc2626">' + formatPrice(total) + '</strong></div>' +
      '<div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">' +
        '<a href="gio-hang.html" class="btn-coffee d-block text-center" style="padding:12px;border-radius:12px">🛒 Xem giỏ hàng</a>' +
        '<a href="thanh-toan.html" class="btn-coffee d-block text-center" style="padding:12px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 4px 16px rgba(34,197,94,0.4)">✅ Thanh toán ngay</a>' +
      '</div>';
    footer.innerHTML = footerHTML;

    updateHeaderCart();
  };

  window.changeCartQty = function(id, delta) {
    var cart = JSON.parse(localStorage.getItem('plei_cart') || '[]');
    var item = cart.find(function(i) { return i.productId === id || i.id === id; });
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    localStorage.setItem('plei_cart', JSON.stringify(cart));
    renderCartDrawer();
    // Sync App.cart.items with localStorage
    if (typeof App !== 'undefined' && App.cart) {
      App.storage.loadCart();
      App.cart.updateUI();
    }
    updateHeaderCart();
  };

  window.removeCartItem = function(id) {
    var cart = JSON.parse(localStorage.getItem('plei_cart') || '[]');
    cart = cart.filter(function(i) { return !(i.productId === id || i.id === id); });
    localStorage.setItem('plei_cart', JSON.stringify(cart));
    renderCartDrawer();
    // Sync App.cart.items with localStorage
    if (typeof App !== 'undefined' && App.cart) {
      App.storage.loadCart();
      App.cart.updateUI();
    }
    updateHeaderCart();
  };

  window.addToCart = function(productId) {
    if (typeof App !== 'undefined' && App.cart) {
      App.cart.add(productId);
      // Sync localStorage → App.cart.items → update both header and cart drawer
      App.storage.loadCart();
      App.cart.updateUI();
      if (typeof updateHeaderCart === 'function') updateHeaderCart();
      if (typeof renderCartDrawer === 'function') renderCartDrawer();
    } else {
      // Fallback direct implementation
      var product = DATA.products.find(function(p) { return p.id === productId; });
      if (!product) return;
      var cart = JSON.parse(localStorage.getItem('plei_cart') || '[]');
      var existing = cart.find(function(i) { return i.productId === productId; });
      if (existing) {
        existing.quantity++;
      } else {
        cart.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          productId: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          image: (product.images && product.images[0]) || 'images/placeholder.jpg',
          quantity: 1,
          stock: product.stock || 99
        });
      }
      localStorage.setItem('plei_cart', JSON.stringify(cart));
      updateHeaderCart();
      renderCartDrawer();
      showToast('Đã thêm vào giỏ hàng!', 'success');
    }
  };

  window.toggleWishlist = function(productId) {
    var wishlist = JSON.parse(localStorage.getItem('plei_wishlist') || '[]');
    var idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast('Đã xóa khỏi yêu thích', 'info');
    } else {
      wishlist.push(productId);
      showToast('Đã thêm vào yêu thích!', 'success');
    }
    localStorage.setItem('plei_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
  };

  window.updateHeaderCart = function() {
    var cart = JSON.parse(localStorage.getItem('plei_cart') || '[]');
    var totalQty = cart.reduce(function(s, i) { return s + (i.quantity || 1); }, 0);
    var badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = totalQty;
      badge.style.display = totalQty > 0 ? 'flex' : 'none';
    }
    var countEl = document.getElementById('cartCount');
    if (countEl) {
      countEl.textContent = totalQty;
      countEl.style.display = totalQty > 0 ? 'inline' : 'none';
    }
  };

  window.updateWishlistUI = function() {
    var wishlist = JSON.parse(localStorage.getItem('plei_wishlist') || '[]');
    document.querySelectorAll('.wishlist-btn').forEach(function(btn) {
      var pid = btn.dataset.productId;
      if (pid) {
        btn.classList.toggle('active', wishlist.indexOf(pid) > -1);
      }
    });
  };

  // ── Cart Drawer Toggle via Header ──
  function initCartDrawerToggle() {
    document.querySelectorAll('[data-cart-toggle]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openCartDrawer();
      });
    });

    var overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) {
      overlay.addEventListener('click', closeCartDrawer);
    }

    var closeBtn = document.getElementById('cartDrawerClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCartDrawer);
    }

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeCartDrawer();
    });
  }

  // ── Mobile Menu ──
  function initMobileMenu() {
    var toggle = document.getElementById('mobileMenuToggle');
    var menu = document.getElementById('mobileNav');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function() {
      menu.classList.toggle('show');
      var icon = toggle.querySelector('.menu-icon');
      if (icon) {
        icon.textContent = menu.classList.contains('show') ? '✕' : '☰';
      }
    });
    // Close on link click
    menu.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        menu.classList.remove('show');
        if (toggle.querySelector('.menu-icon')) {
          toggle.querySelector('.menu-icon').textContent = '☰';
        }
      });
    });
  }

  // ── Active Nav ──
  function initActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'trang-chu.html';
    document.querySelectorAll('#mainNav .nav-link, .site-header .nav-link').forEach(function(link) {
      var href = link.getAttribute('href') || '';
      if (href === path || (path === '' && href === 'trang-chu.html')) {
        link.classList.add('active');
      }
    });
  }

  // ── Back to Top ──
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function() {
      btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }, { passive: true });
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Toast ──
  window.showToast = function(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    toast.className = 'plei-toast toast-' + type;
    toast.innerHTML = '<span>' + message + '</span>';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.animation = 'toastOut 0.4s ease forwards';
      setTimeout(function() { toast.remove(); }, 400);
    }, 3000);
  };

  // ── FAQ Accordion (vanilla) ──
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function(item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;
      question.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.faq-item.open').forEach(function(i) {
          i.classList.remove('open');
        });
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  // ── Flash Countdown ──
  window.initFlashCountdown = function(endTime) {
    var el = document.getElementById('flashCountdown');
    if (!el) return;
    function update() {
      var now = Date.now();
      var diff = endTime - now;
      if (diff <= 0) { el.innerHTML = '<span class="text-white">Đã kết thúc</span>'; return; }
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = '<div class="flash-countdown">' +
        '<div class="countdown-unit"><span class="countdown-number">' + pad(h) + '</span><span class="countdown-label">Giờ</span></div>' +
        '<span style="color:white;font-weight:800;font-size:1.5rem">:</span>' +
        '<div class="countdown-unit"><span class="countdown-number">' + pad(m) + '</span><span class="countdown-label">Phút</span></div>' +
        '<span style="color:white;font-weight:800;font-size:1.5rem">:</span>' +
        '<div class="countdown-unit"><span class="countdown-number">' + pad(s) + '</span><span class="countdown-label">Giây</span></div>' +
      '</div>';
    }
    function pad(n) { return String(n).padStart(2, '0'); }
    update();
    setInterval(update, 1000);
  };

  // ── Product Card Rating Stars ──
  function getStarsHTML(rating) {
    rating = parseFloat(rating) || 0;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= rating) {
        html += '<span style="color:#f59e0b">★</span>';
      } else if (i - 0.5 <= rating) {
        html += '<span style="color:#f59e0b">★</span>';
      } else {
        html += '<span style="color:#d4d4d4">★</span>';
      }
    }
    return html;
  }

  // ── Format Price ──
  window.formatPrice = function(price) {
    if (typeof price !== 'number') price = parseInt(price) || 0;
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // ── Render Product Card (shared template) ──
  window.renderProductCard = function(product) {
    var price = product.salePrice || product.price;
    var hasDiscount = product.salePrice && product.salePrice < product.price;
    var discount = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    var isWishlisted = false;
    try {
      var wl = JSON.parse(localStorage.getItem('plei_wishlist') || '[]');
      isWishlisted = wl.indexOf(product.id) > -1;
    } catch(e) {}

    var img = (product.images && product.images[0]) || 'images/placeholder.jpg';
    var catName = product.categoryName || '';

    return '<div class="product-card" data-animate>' +
      '<a href="chi-tiet-san-pham.html?id=' + encodeURIComponent(product.id) + '" class="text-decoration-none">' +
        '<div class="product-card-img">' +
          '<div class="product-card-img-inner">' +
          '<img src="' + img + '" alt="' + product.name + '" loading="lazy">' +
          '</div>' +
          '<div class="product-card-overlay"></div>' +
          (product.isNew ? '<div class="product-card-badges"><span class="badge-new">Mới</span></div>' : '') +
          (product.isFlashSale ? '<div class="product-card-badges"><span class="badge-flash"><span class="pulse-dot"></span> Flash Sale</span></div>' : '') +
          (hasDiscount ? '<div class="badge-discount"><div class="badge-discount-inner">-' + discount + '%</div></div>' : '') +
          (product.stock <= 0 ? '<div class="product-card-outofstock"><span>Hết hàng</span></div>' : '') +
        '</div>' +
        '<div class="product-card-body">' +
          (catName ? '<div class="product-card-cat">' + catName + '</div>' : '') +
          '<h3 class="product-card-name">' + product.name + '</h3>' +
          '<div class="product-card-rating">' +
            '<span class="rating-stars">' + getStarsHTML(product.rating) + '</span>' +
            '<span class="rating-count">(' + (product.reviewCount || 0) + ')</span>' +
          '</div>' +
          '<div class="product-card-price">' +
            '<span class="price-current">' + formatPrice(price) + '</span>' +
            (hasDiscount ? '<span class="price-original">' + formatPrice(product.price) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</a>' +
      '<div class="product-card-actions">' +
        '<button class="action-btn action-btn-wishlist' + (isWishlisted ? ' active' : '') + '" onclick="toggleWishlist(\'' + product.id + '\'); event.stopPropagation(); event.preventDefault();" aria-label="' + (isWishlisted ? 'Bỏ khỏi' : 'Thêm vào') + ' yêu thích" title="' + (isWishlisted ? 'Bỏ khỏi yêu thích' : 'Yêu thích') + '" style="background:white;color:' + (isWishlisted ? '#ef4444' : 'var(--coffee-500)') + ';border:1.5px solid ' + (isWishlisted ? '#ef4444' : 'var(--coffee-200)') + ';box-shadow:0 2px 8px rgba(0,0,0,0.08);min-width:40px;width:40px;padding:0;border-radius:22px;display:inline-flex;align-items:center;justify-content:center;transition:all 0.25s;flex-shrink:0;font-size:15px;cursor:pointer" onmouseover="this.style.transform=\'scale(1.12)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
          (isWishlisted ? '♥' : '♡') +
        '</button>' +
        '<button class="action-btn action-btn-cart" onclick="addToCart(\'' + product.id + '\'); event.stopPropagation();" aria-label="Thêm ' + product.name + ' vào giỏ hàng" title="Thêm vào giỏ hàng" style="height:40px;border-radius:22px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;box-shadow:0 4px 16px rgba(34,197,94,0.4);flex:1;padding:0 14px;font-size:13px;font-weight:700;letter-spacing:0.2px;gap:6px;display:inline-flex;align-items:center;justify-content:center;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);border:none;cursor:pointer" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 8px 24px rgba(34,197,94,0.5)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'0 4px 16px rgba(34,197,94,0.4)\'">' +
          'Thêm vào giỏ' +
        '</button>' +
      '</div>' +
    '</div>';
  };

  // ── Marketing Popup ──
  function initMarketingPopup() {
    var popup = document.getElementById('marketingPopup');
    if (!popup) return;
    if (sessionStorage.getItem('popupShown')) return;
    setTimeout(function() {
      popup.style.display = 'flex';
      sessionStorage.setItem('popupShown', '1');
    }, 3000);
  }

  window.closeMarketingPopup = function() {
    var popup = document.getElementById('marketingPopup');
    if (popup) popup.style.display = 'none';
  };

  // ── Lazy Image Load ──
  function initLazyLoad() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          obs.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(function(el) { obs.observe(el); });
  }

  // ── Inject Schema ──
  function injectSchema() {
    if (document.querySelector('script[data-schema="main"]')) return;
    var schemas = [
      { '@context': 'https://schema.org', '@type': 'Organization', 'name': '3T Café', 'url': 'https://3TCoffee.vn', 'logo': 'https://3TCoffee.vn/images/logo.png', 'contactPoint': { '@type': 'ContactPoint', 'telephone': '+84-373-189-077', 'contactType': 'customer service' } },
      { '@context': 'https://schema.org', '@type': 'WebSite', 'name': '3T Café', 'url': 'https://3TCoffee.vn', 'potentialAction': { '@type': 'SearchAction', 'target': 'https://3TCoffee.vn/san-pham?q={search_term_string}', 'query-input': 'required name=search_term_string' } }
    ];
    schemas.forEach(function(schema) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-schema', 'main');
      s.textContent = JSON.stringify(schema);
      document.head.appendChild(s);
    });
  }

  // ── Search ──
  function initSearch() {
    var form = document.getElementById('headerSearchForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var q = form.querySelector('input[name="q"], input[type="search"]').value.trim();
      if (q) {
        window.location.href = 'san-pham.html?search=' + encodeURIComponent(q);
      }
    });
  }

  // ── Auth State ──
  function initAuthState() {
    var authItem = document.getElementById('navAuthItem');
    if (!authItem) return;
    
    // Try multiple keys for compatibility
    var user = null;
    var userKeys = ['plei_current_user', 'plei_user', 'currentUser'];
    for (var i = 0; i < userKeys.length; i++) {
      var raw = localStorage.getItem(userKeys[i]);
      if (raw) {
        try { user = JSON.parse(raw); } catch(e) { user = null; }
        if (user && user.email) break;
      }
    }
    
    var isAuth = user && user.email;
    if (isAuth) {
      var name = user.name || user.email || '';
      var initials = name ? name.charAt(0).toUpperCase() : '👤';
      authItem.innerHTML = '<a href="tai-khoan.html" class="nav-link d-flex align-items-center gap-1">  <span>' + (user.name || 'Tài khoản') + '</span></a>';
    } else {
      authItem.innerHTML = '<a href="dang-nhap.html" class="nav-link d-flex align-items-center gap-1">  <span class="d-none d-sm-inline">Đăng nhập</span></a>';
    }
  }

  // ── Scroll Shadow for Header ──
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', function() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ── Boot ──
  function boot() {
    initScrollAnimations();
    initHeroSlider();
    initCartDrawerToggle();
    initMobileMenu();
    initActiveNav();
    initBackToTop();
    initFAQ();
    initLazyLoad();
    initMarketingPopup();
    injectSchema();
    initSearch();
    initAuthState();
    initHeaderScroll();
    updateHeaderCart();
    renderCartDrawer();
    updateWishlistUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})();
