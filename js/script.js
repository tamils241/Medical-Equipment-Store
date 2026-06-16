document.addEventListener('DOMContentLoaded', function () {

  // ====== Sticky Navbar on Scroll ======
  const navbar = document.querySelector('.sticky-nav');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  // ====== Back to Top ======
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ====== Smooth Scroll for Nav Links ======
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ====== Newsletter Form ======
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      if (input.value.trim()) {
        const btn = this.querySelector('button');
        const original = btn.textContent;
        btn.textContent = 'Subscribed!';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-success');
        input.value = '';
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('btn-success');
          btn.classList.add('btn-warning');
        }, 3000);
      }
    });
  }

  // ====== Product Add to Cart Animation ======
  document.querySelectorAll('.product-card .btn-primary').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const original = this.textContent;
      this.textContent = 'Added!';
      this.classList.remove('btn-primary');
      this.classList.add('btn-success');

      const badge = document.querySelector('.cart-badge');
      if (badge) {
        const count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
        badge.style.transform = 'scale(1.3)';
        setTimeout(function () { badge.style.transform = 'scale(1)'; }, 200);
      }

      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
      }, 2000);
    });
  });

  // ====== Wishlist Heart Toggle ======
  document.querySelectorAll('.product-actions .btn:first-child').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const icon = this.querySelector('i');
      icon.classList.toggle('bi-heart');
      icon.classList.toggle('bi-heart-fill');
      this.classList.toggle('text-danger');
    });
  });

  // ====== Animate Stats on Scroll ======
  const statNumbers = document.querySelectorAll('.stat-card h2');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statNumbers.forEach(function (el) {
      const text = el.textContent;
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (!num) return;
      const suffix = text.replace(/[0-9]/g, '');
      let current = 0;
      const step = Math.ceil(num / 40);
      const timer = setInterval(function () {
        current += step;
        if (current >= num) {
          current = num;
          clearInterval(timer);
        }
        el.textContent = current.toLocaleString() + suffix;
      }, 30);
    });
    statsAnimated = true;
  }

  const statsSection = document.querySelector('.stat-card');
  if (statsSection) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsSection.closest('.row'));
  }

  // ====== Search Icon Click ======
  const searchIcon = document.querySelector('.nav-icon .bi-search');
  if (searchIcon) {
    searchIcon.parentElement.addEventListener('click', function (e) {
      e.preventDefault();
      const query = prompt('Search medical equipment...');
      if (query && query.trim()) {
        alert('Search results for: ' + query.trim());
      }
    });
  }

  console.log('%c MediStore %c Medical Equipment Theme v1.0 ',
    'background:#0d6efd;color:#fff;padding:4px 0 4px 8px;border-radius:4px 0 0 4px;font-weight:700;',
    'background:#071526;color:#fff;padding:4px 8px 4px 0;border-radius:0 4px 4px 0;font-weight:400;'
  );

});
