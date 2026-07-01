/* ================================================
   3T CAFÉ - PAGE ENHANCEMENTS
   Additional interactions: counters, smooth scroll,
   star rating, quantity buttons
   (loader, toasts, back-to-top, nav handled by layout.js)
   ================================================ */

(function() {
  'use strict';

  // ── Counter Animation ──
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var raw = el.dataset.number || el.textContent.replace(/\D/g, '') || '0';
          var target = parseInt(raw);
          if (!target) return;
          var current = 0;
          var step = Math.max(1, Math.ceil(target / 60));
          var timer = setInterval(function() {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString('vi-VN');
            if (current >= target) clearInterval(timer);
          }, 30);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.number').forEach(function(el) { obs.observe(el); });
  }

  // ── Smooth scroll for anchor links ──
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }

  // ── Product card hover micro-interactions ──
  function initProductCard() {
    document.querySelectorAll('.product-card').forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        card.querySelectorAll('.quick-action-btn').forEach(function(btn, i) {
          btn.style.transitionDelay = (i * 50) + 'ms';
        });
      });
    });

    // Make all product card images zoom
    document.querySelectorAll('.product-card-img img').forEach(function(img) {
      img.addEventListener('mouseenter', function() { img.style.transform = 'scale(1.05)'; });
      img.addEventListener('mouseleave', function() { img.style.transform = ''; });
    });
  }

  // ── Star Rating Interactive (for review forms) ──
  function initStarRating() {
    document.querySelectorAll('.rating-select').forEach(function(container) {
      container.querySelectorAll('.star').forEach(function(star) {
        star.addEventListener('mouseenter', function() {
          var val = parseInt(this.dataset.val);
          container.querySelectorAll('.star').forEach(function(s) {
            s.classList.toggle('hovered', parseInt(s.dataset.val) <= val);
          });
        });
      });
      container.addEventListener('mouseleave', function() {
        container.querySelectorAll('.star').forEach(function(s) { s.classList.remove('hovered'); });
      });
      container.querySelectorAll('.star').forEach(function(star) {
        star.addEventListener('click', function() {
          var val = this.dataset.val;
          var input = container.querySelector('input');
          if (input) input.value = val;
          container.querySelectorAll('.star').forEach(function(s) {
            var sVal = parseInt(s.dataset.val);
            s.classList.toggle('active', sVal <= val);
            s.classList.toggle('selected', sVal === parseInt(val));
          });
        });
      });
    });
  }

  // ── Quantity +/- Buttons (product detail) ──
  function initQuantityButtons() {
    document.querySelectorAll('.qty-btn-plus, .qty-plus').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = this.closest('.qty-group, .qty-selector');
        var input = group ? group.querySelector('.qty-input, input[name="quantity"], .qty-val') : this.parentElement.querySelector('.qty-input, input[name="quantity"]');
        if (input) {
          var val = parseInt(input.value || 0) + 1;
          input.value = val;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    document.querySelectorAll('.qty-btn-minus, .qty-minus').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = this.closest('.qty-group, .qty-selector');
        var input = group ? group.querySelector('.qty-input, input[name="quantity"], .qty-val') : this.parentElement.querySelector('.qty-input, input[name="quantity"]');
        if (input) {
          var val = parseInt(input.value || 0) - 1;
          input.value = Math.max(0, val);
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  // ── Tabs (product detail description/ingredients/reviews) ──
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tabGroup = this.closest('.tab-container, .product-tabs');
        if (!tabGroup) return;
        var targetId = this.dataset.tab;

        // Update buttons
        tabGroup.querySelectorAll('.tab-btn').forEach(function(b) {
          b.classList.toggle('active', b === this);
        }.bind(this));

        // Update panels
        tabGroup.querySelectorAll('.tab-panel').forEach(function(panel) {
          panel.classList.toggle('active', panel.id === targetId);
          panel.style.display = panel.id === targetId ? '' : 'none';
        });
      });
    });
  }

  // ── Accordion (FAQ) ──
  function initAccordion() {
    document.querySelectorAll('.faq-item, .accordion-item').forEach(function(item) {
      var header = item.querySelector('.faq-question, .accordion-header button, .faq-header');
      var body = item.querySelector('.faq-answer, .accordion-collapse, .faq-body');
      if (!header || !body) return;

      header.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');

        // Close all in same group
        var group = item.closest('.faq-list, .accordion-group');
        if (group) {
          group.querySelectorAll('.faq-item.open, .accordion-item.open').forEach(function(i) {
            i.classList.remove('open');
            var b = i.querySelector('.faq-answer, .accordion-collapse, .faq-body');
            if (b) b.style.display = 'none';
          });
        }

        if (!isOpen) {
          item.classList.add('open');
          body.style.display = '';
        }
      });
    });
  }

  // ── Range Slider (price filter) ──
  function initRangeSlider() {
    document.querySelectorAll('.range-slider').forEach(function(slider) {
      var minInput = slider.querySelector('input[name="minPrice"]');
      var maxInput = slider.querySelector('input[name="maxPrice"]');
      var minDisplay = slider.querySelector('.range-min');
      var maxDisplay = slider.querySelector('.range-max');
      var fill = slider.querySelector('.range-fill');
      var minVal = parseInt(slider.dataset.min || 0);
      var maxVal = parseInt(slider.dataset.max || 500000);

      if (!minInput || !maxInput) return;

      function updateFill() {
        var min = parseInt(minInput.value || minVal);
        var max = parseInt(maxInput.value || maxVal);
        var pct = ((max - min) / (maxVal - minVal)) * 100;
        if (fill) fill.style.width = pct + '%';
        if (minDisplay) minDisplay.textContent = formatPrice(min);
        if (maxDisplay) maxDisplay.textContent = formatPrice(max);
      }

      minInput.addEventListener('input', updateFill);
      maxInput.addEventListener('input', updateFill);
      updateFill();
    });
  }

  function formatPrice(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  }

  // ── Form validation (enhance HTML5 validation) ──
  function initFormValidation() {
    document.querySelectorAll('form').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        var invalid = form.querySelector(':invalid');
        if (invalid && !invalid.checkValidity()) {
          e.preventDefault();
          invalid.focus();
          if (typeof showToast !== 'undefined') {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
          }
        }
      });
    });
  }

  // ── Bootstrap tooltips ──
  function initTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (typeof bootstrap !== 'undefined') {
      tooltipTriggerList.forEach(function(el) {
        new bootstrap.Tooltip(el);
      });
    }
  }

  // ── Coupon code copy ──
  function initCopyCode() {
    document.querySelectorAll('[data-copy]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var code = this.dataset.copy;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(function() {
            if (typeof showToast !== 'undefined') showToast('Đã sao chép: ' + code, 'success');
          });
        }
      });
    });
  }

  // ── Boot ──
  function boot() {
    initCounters();
    initSmoothScroll();
    initProductCard();
    initStarRating();
    initQuantityButtons();
    initTabs();
    initAccordion();
    initRangeSlider();
    initFormValidation();
    initTooltips();
    initCopyCode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})();
