/* ================================================
   3T COFFEE - MAIN JS v2.0
   Premium coffee shop frontend
   ================================================ */

(function($) {
  "use strict";

  // ── Loader ──
  var loader = function() {
    setTimeout(function() {
      if ($('#ftco-loader').length > 0) {
        $('#ftco-loader').removeClass('show');
      }
    }, 800);
  };
  loader();

  // ── Scroll Animations (IntersectionObserver) ──
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-scale-in').forEach(el => {
      observer.observe(el);
    });
  }

  // ── Counter Animation ──
  function animateCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.number || el.textContent.replace(/\D/g, ''));
          if (!target) return;
          let current = 0;
          const step = Math.ceil(target / 80);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current.toLocaleString('vi-VN');
          }, 30);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.number').forEach(el => counterObserver.observe(el));
  }

  // ── Navbar Scroll Effect ──
  function initNavbarScroll() {
    $(window).scroll(function() {
      var $w = $(this), st = $w.scrollTop();
      var navbar = $('.ftco_navbar');
      var sd = $('.js-scroll-wrap');

      if (st > 150) navbar.addClass('scrolled');
      if (st < 150) navbar.removeClass('scrolled sleep');
      if (st > 350) { navbar.addClass('awake'); if (sd.length) sd.addClass('sleep'); }
      if (st < 350) { navbar.removeClass('awake').addClass('sleep'); if (sd.length) sd.removeClass('sleep'); }
    });
  }

  // ── Owl Carousels ──
  function initCarousels() {
    $('.home-slider').owlCarousel({
      loop: true, autoplay: true, margin: 0,
      animateOut: 'fadeOut', animateIn: 'fadeIn',
      nav: false, dots: true,
      mouseDrag: true, touchDrag: true,
      autoplayHoverPause: true,
      items: 1,
      navText: ["<span class='ion-md-arrow-back'></span>", "<span class='ion-chevron-right'></span>"],
      responsive: { 0: { items: 1 }, 600: { items: 1 }, 1000: { items: 1 } }
    });

    $('.carousel-work').owlCarousel({
      autoplay: true, center: true, loop: true, items: 1,
      margin: 30, stagePadding: 0, nav: true,
      navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
      responsive: {
        0: { items: 1, stagePadding: 0 },
        600: { items: 2, stagePadding: 50 },
        1000: { items: 3, stagePadding: 100 }
      }
    });
  }

  // ── Nav Dropdown ──
  function initDropdowns() {
    $('nav .dropdown').hover(function() {
      $(this).addClass('show');
      $(this).find('> a').attr('aria-expanded', true);
      $(this).find('.dropdown-menu').addClass('show');
    }, function() {
      $(this).removeClass('show');
      $(this).find('> a').attr('aria-expanded', false);
      $(this).find('.dropdown-menu').removeClass('show');
    });
    $('#dropdown04').on('show.bs.dropdown', function() { /* expanded */ });
  }

  // ── Smooth Scroll ──
  function initSmoothScroll() {
    $(".smoothscroll[href^='#'], #ftco-nav ul li a[href^='#']").on('click', function(e) {
      e.preventDefault();
      var hash = this.hash;
      $('html, body').animate({ scrollTop: $(hash).offset().top }, 700, 'easeInOutExpo');
      if ($('.navbar-toggler').is(':visible')) $('.navbar-toggler').click();
    });
  }

  // ── Magnific Popup ──
  function initMagnific() {
    $('.image-popup').magnificPopup({
      type: 'image', closeOnContentClick: true,
      mainClass: 'mfp-no-margins mfp-with-zoom',
      gallery: { enabled: true, preload: [0, 1] },
      image: { verticalFit: true },
      zoom: { enabled: true, duration: 300 }
    });
    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
      disableOn: 700, type: 'iframe', mainClass: 'mfp-fade',
      removalDelay: 160, preloader: false, fixedContentPos: false
    });
  }

  // ── Lazy Load Images ──
  function initLazyLoad() {
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            img.classList.add('loaded');
            lazyObserver.unobserve(img);
          }
        });
      });
      document.querySelectorAll('img[data-src]').forEach(el => lazyObserver.observe(el));
    }
  }

  // ── Parallax on Scroll ──
  function initParallax() {
    if ($(window).width() > 768) {
      $(window).on('scroll', function() {
        var scrolled = $(window).scrollTop();
        $('.parallax-bg').css('transform', 'translateY(' + (scrolled * 0.3) + 'px)');
      });
    }
  }

  // ── Mobile Menu Close on Link Click ──
  function initMobileMenu() {
    $('.navbar-nav .nav-link').on('click', function() {
      if ($('.navbar-collapse').hasClass('show')) {
        $('.navbar-toggler').click();
      }
    });
  }

  // ── Back to Top ──
  function initBackToTop() {
    $(window).scroll(function() {
      if ($(this).scrollTop() > 300) {
        $('#backToTop').fadeIn();
      } else {
        $('#backToTop').fadeOut();
      }
    });
    $('#backToTop').on('click', function() {
      $('html, body').animate({ scrollTop: 0 }, 600);
      return false;
    });
  }

  // ── Init All ──
  $(document).ready(function() {
    initScrollAnimations();
    animateCounters();
    initNavbarScroll();
    initCarousels();
    initDropdowns();
    initSmoothScroll();
    initMagnific();
    initLazyLoad();
    initParallax();
    initMobileMenu();
    initBackToTop();

    // Counter for #section-counter
    if ($('#section-counter').length) {
      var counterSection = document.getElementById('section-counter');
      var counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            $('.number').each(function() {
              var $this = $(this);
              var num = $this.data('number');
              $this.animateNumber({ number: num }, 2500);
            });
            counterObs.unobserve(counterSection);
          }
        });
      }, { threshold: 0.5 });
      counterObs.observe(counterSection);
    }
  });

  // Smooth image fade-in after load
  $('img').on('load', function() { $(this).addClass('loaded'); }).each(function() {
    if (this.complete) $(this).addClass('loaded');
  });

})(jQuery);

