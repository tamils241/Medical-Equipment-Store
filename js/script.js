document.addEventListener('DOMContentLoaded', function () {

  // ====== Auth Functions ======
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('medistore_users')) || []; } catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem('medistore_users', JSON.stringify(users)); }

  function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem('medistore_session')); } catch { return null; }
  }
  function setSession(user) { sessionStorage.setItem('medistore_session', JSON.stringify(user)); }
  function clearSession() { sessionStorage.removeItem('medistore_session'); }

  function isLoggedIn() { return !!getCurrentUser(); }

  function updateNavbarForAuth() {
    var user = getCurrentUser();
    var navRight = document.querySelector('.sticky-nav .d-flex.align-items-center.gap-3');
    if (!navRight) return;
    if (user) {
      var dashboardLink = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
      var dropdownHtml =
        '<div class="dropdown">' +
        '<a class="btn btn-outline-light btn-sm rounded-pill px-3 user-dropdown-toggle" data-bs-toggle="dropdown">' +
        '<i class="bi bi-person-circle me-1"></i> ' + user.name.split(' ')[0] +
        '</a>' +
        '<ul class="dropdown-menu dropdown-menu-end">' +
        '<li><a class="dropdown-item" href="' + dashboardLink + '"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>' +
        '<li><hr class="dropdown-divider"></li>' +
        '<li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>' +
        '</ul>' +
        '</div>';
      var btns = navRight.querySelectorAll('a[href="login.html"], a[href="register.html"]');
      btns.forEach(function (b) { b.style.display = 'none'; });
      var existing = navRight.querySelector('.dropdown');
      if (!existing) {
        navRight.insertAdjacentHTML('beforeend', dropdownHtml);
      }
      var logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
          e.preventDefault();
          clearSession();
          location.reload();
        });
      }
    } else {
      var btns = navRight.querySelectorAll('a[href="login.html"], a[href="register.html"]');
      btns.forEach(function (b) { b.style.display = ''; });
      var dd = navRight.querySelector('.dropdown');
      if (dd) dd.remove();
    }
  }

  // ====== Login Form ======
  var loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('email').value.trim();
      var password = document.getElementById('password').value.trim();
      var users = getUsers();
      var found = null;
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
          found = users[i]; break;
        }
      }
      if (found) {
        setSession(found);
        if (found.role === 'admin') { window.location.href = 'admin-dashboard.html'; }
        else { window.location.href = 'user-dashboard.html'; }
      } else {
        alert('Invalid email or password.');
      }
    });
  }

  // ====== Restrict name inputs to A-Z + spaces, max 16 chars ======
  function enforceNameInput(input) {
    input.addEventListener('input', function () {
      this.value = this.value.replace(/[^A-Za-z\s]/g, '').slice(0, 16);
    });
  }
  ['firstName', 'lastName', 'contactName'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) enforceNameInput(el);
  });

  // ====== Register Form ======
  var registerForm = document.querySelector('#registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstName = document.getElementById('firstName').value.trim();
      var lastName = document.getElementById('lastName').value.trim();
      var email = document.getElementById('regEmail').value.trim();
      var password = document.getElementById('regPassword').value.trim();
      var confirmPw = document.getElementById('confirmPassword').value.trim();

      if (!firstName) { alert('Please enter your first name.'); return; }
      if (!lastName) { alert('Please enter your last name.'); return; }
      if (password.length < 8) { alert('Password must be at least 8 characters.'); return; }
      if (password !== confirmPw) { alert('Passwords do not match.'); return; }

      var users = getUsers();
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) { alert('Email already registered.'); return; }
      }

      var regRole = document.getElementById('regRole').checked ? 'user' : 'admin';
      var newUser = {
        name: firstName + ' ' + lastName,
        email: email,
        password: password,
        role: regRole,
        created: new Date().toISOString()
      };
      users.push(newUser);
      saveUsers(users);
      setSession(newUser);
      if (regRole === 'admin') { window.location.href = 'admin-dashboard.html'; }
      else { window.location.href = 'user-dashboard.html'; }
    });
  }

  // ====== Redirect logged-in users away from login/register ======
  var isLoginPage = document.getElementById('loginForm');
  var isRegisterPage = document.getElementById('registerForm');
  if ((isLoginPage || isRegisterPage) && isLoggedIn()) {
    var u = getCurrentUser();
    window.location.href = u.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
  }

  // ====== Role toggle active class sync ======
  document.querySelectorAll('.role-toggle input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var opts = this.closest('.role-toggle').querySelectorAll('.toggle-option');
      opts.forEach(function (o, i) {
        o.classList.toggle('active', (i === 0) === cb.checked);
      });
    });
  });

  // ====== Navbar auth update on load ======
  updateNavbarForAuth();

  // ====== Seed default admin if no users exist ======
  if (getUsers().length === 0) {
    saveUsers([{ name: 'Admin', email: 'admin@medistore.com', password: 'admin123', role: 'admin', created: new Date().toISOString() }]);
  }

  // ====== Dashboard user name fill ======
  var user = getCurrentUser();
  if (user) {
    var els = document.querySelectorAll('#userNameDisplay, #welcomeUserName, #sidebarAdminName, #sidebarUserName');
    els.forEach(function (el) { if (el) el.textContent = user.name; });
    var emailEl = document.getElementById('sidebarUserEmail');
    if (emailEl) emailEl.textContent = user.email;
  }

  // ====== Logout button on dashboard pages ======
  var dashLogout = document.getElementById('logoutBtn');
  if (dashLogout) {
    dashLogout.addEventListener('click', function (e) {
      e.preventDefault();
      clearSession();
      window.location.href = 'login.html';
    });
  }

  // ====== Sticky Navbar on Scroll ======
  const navbar = document.querySelector('.sticky-nav');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    if (navbar) {
      if (scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  });

  // ====== Back to Top ======
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

  // ====== Cart Functions ======
  function getCart() {
    try { return JSON.parse(localStorage.getItem('medistore_cart')) || []; } catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem('medistore_cart', JSON.stringify(cart));
  }

  function updateCartBadge() {
    var badge = document.querySelector('.cart-badge');
    if (!badge) return;
    var cart = getCart();
    var count = cart.reduce(function (sum, item) { return sum + (item.qty || 1); }, 0);
    badge.textContent = count;
  }

  function addToCart(product) {
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) { existing = cart[i]; break; }
    }
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      product.qty = 1;
      cart.push(product);
    }
    saveCart(cart);
    updateCartBadge();
  }

  // ====== Product Add to Cart ======
  document.querySelectorAll('.product-card .btn-primary').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var card = this.closest('.product-card');
      var img = card.querySelector('.product-img-el');
      var name = card.querySelector('h6').textContent.trim();
      var priceEl = card.querySelector('.price .fw-bold');
      var price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0;
      var id = card.getAttribute('id') || name.replace(/\s+/g, '-').toLowerCase();
      var image = img ? img.getAttribute('src') : '';

      addToCart({ id: id, name: name, price: price, image: image });

      var original = this.textContent;
      this.textContent = 'Added!';
      this.classList.remove('btn-primary');
      this.classList.add('btn-success');

      var badge = document.querySelector('.cart-badge');
      if (badge) {
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

  // ====== Update badge on page load ======
  updateCartBadge();

  // ====== Render Cart Page ======
  var cartContainer = document.getElementById('cartItemsContainer');
  var cartEmpty = document.getElementById('cartEmpty');

  if (cartContainer) {
    function renderCart() {
      var cart = getCart();
      var emptyEl = document.getElementById('cartEmpty');

      if (cart.length === 0) {
        if (emptyEl) emptyEl.style.display = '';
        cartContainer.innerHTML = '';
        document.getElementById('cartSubtotal').textContent = '$0';
        document.getElementById('cartShipping').textContent = '$0';
        document.getElementById('cartTotal').textContent = '$0';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';

      var html = '';
      var subtotal = 0;

      for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var itemTotal = item.price * (item.qty || 1);
        subtotal += itemTotal;
        html += '<div class="card border-0 shadow-sm mb-3 cart-item" data-index="' + i + '">' +
          '<div class="card-body">' +
          '<div class="row g-3 align-items-center">' +
          '<div class="col-3 col-md-2">' +
          '<img src="' + (item.image || 'images/placeholder.webp') + '" alt="' + item.name + '" class="img-fluid rounded">' +
          '</div>' +
          '<div class="col-5 col-md-4">' +
          '<h6 class="fw-bold mb-1">' + item.name + '</h6>' +
          '<small class="text-muted">$' + item.price.toFixed(2) + ' each</small>' +
          '</div>' +
          '<div class="col-2 col-md-3">' +
          '<div class="input-group input-group-sm">' +
          '<button class="btn btn-outline-secondary cart-qty-minus" data-index="' + i + '">-</button>' +
          '<input type="text" class="form-control text-center cart-qty-input" value="' + (item.qty || 1) + '" readonly>' +
          '<button class="btn btn-outline-secondary cart-qty-plus" data-index="' + i + '">+</button>' +
          '</div>' +
          '</div>' +
          '<div class="col-2 text-end">' +
          '<span class="fw-bold">$' + itemTotal.toFixed(2) + '</span>' +
          '</div>' +
          '</div>' +
          '<div class="text-end mt-2">' +
          '<button class="btn btn-sm btn-outline-danger rounded-pill cart-remove" data-index="' + i + '"><i class="bi bi-trash me-1"></i>Remove</button>' +
          '</div>' +
          '</div>' +
          '</div>';
      }

      cartContainer.innerHTML = html;

      var shipping = subtotal > 100 ? 0 : 15;
      var total = subtotal + shipping;

      document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
      document.getElementById('cartShipping').textContent = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);
      document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);

      // Qty minus
      cartContainer.querySelectorAll('.cart-qty-minus').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index'));
          var cart = getCart();
          if (cart[idx]) {
            if (cart[idx].qty > 1) { cart[idx].qty--; } else { cart.splice(idx, 1); }
            saveCart(cart);
            renderCart();
            updateCartBadge();
          }
        });
      });

      // Qty plus
      cartContainer.querySelectorAll('.cart-qty-plus').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index'));
          var cart = getCart();
          if (cart[idx]) { cart[idx].qty = (cart[idx].qty || 1) + 1; }
          saveCart(cart);
          renderCart();
          updateCartBadge();
        });
      });

      // Remove
      cartContainer.querySelectorAll('.cart-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index'));
          var cart = getCart();
          cart.splice(idx, 1);
          saveCart(cart);
          renderCart();
          updateCartBadge();
        });
      });
    }

    renderCart();

    // Clear cart
    document.getElementById('clearCartBtn').addEventListener('click', function () {
      if (confirm('Clear all items from your cart?')) {
        saveCart([]);
        renderCart();
        updateCartBadge();
      }
    });

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', function () {
      var cart = getCart();
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }
      alert('Thank you for your order! Total: ' + document.getElementById('cartTotal').textContent);
    });
  }

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
    var statsRow = statsSection.closest('.row');
    if (statsRow) observer.observe(statsRow);
  }

  // ====== Product Category Filter & Pagination ======
  (function () {
    var filterContainer = document.getElementById('productFilters');
    if (!filterContainer) return;

    var filterBtns = filterContainer.querySelectorAll('[data-filter]');
    var productsRow = document.getElementById('productsRow');
    if (!productsRow) return;
    var productCols = Array.from(productsRow.querySelectorAll('.col-6'));
    var paginationControls = document.getElementById('paginationControls');

    var currentFilter = 'all';
    var currentPage = 1;
    var perPage = 20;

    // Assign data-category from <small> text
    productCols.forEach(function (col) {
      var catEl = col.querySelector('.product-card .card-body small.text-muted');
      if (catEl) {
        col.setAttribute('data-category', catEl.textContent.trim().toLowerCase());
      }
    });

    function getFilteredProducts() {
      if (currentFilter === 'all') {
        return productCols.slice();
      }
      return productCols.filter(function (col) {
        return col.getAttribute('data-category') === currentFilter;
      });
    }

    function renderPagination(totalItems) {
      if (!paginationControls) return;
      var totalPages = Math.max(1, Math.ceil(totalItems / perPage));
      if (currentPage > totalPages) currentPage = totalPages;

      var html = '';

      // Previous
      html += '<li class="page-item' + (currentPage === 1 ? ' disabled' : '') + '">' +
        '<a class="page-link page-prev" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>' +
        '</li>';

      // Page numbers
      for (var i = 1; i <= totalPages; i++) {
        html += '<li class="page-item' + (i === currentPage ? ' active' : '') + '">' +
          '<a class="page-link page-num" href="#" data-page="' + i + '">' + i + '</a>' +
          '</li>';
      }

      // Next
      html += '<li class="page-item' + (currentPage === totalPages ? ' disabled' : '') + '">' +
        '<a class="page-link page-next" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>' +
        '</li>';

      paginationControls.innerHTML = html;

      // Attach events
      paginationControls.querySelectorAll('.page-num').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          goToPage(parseInt(this.getAttribute('data-page')));
        });
      });

      var prevBtn = paginationControls.querySelector('.page-prev');
      if (prevBtn && !prevBtn.closest('.disabled')) {
        prevBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (currentPage > 1) goToPage(currentPage - 1);
        });
      }

      var nextBtn = paginationControls.querySelector('.page-next');
      if (nextBtn && !nextBtn.closest('.disabled')) {
        nextBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (currentPage < totalPages) goToPage(currentPage + 1);
        });
      }
    }

    function showPageItems(filtered) {
      var start = (currentPage - 1) * perPage;
      var end = start + perPage;

      productCols.forEach(function (col) {
        col.style.display = 'none';
      });

      for (var i = start; i < end && i < filtered.length; i++) {
        filtered[i].style.display = '';
      }
    }

    function goToPage(page) {
      var filtered = getFilteredProducts();
      var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      if (page === currentPage) return;
      currentPage = page;

      // Animate out then in
      productsRow.classList.add('page-fade-out');
      setTimeout(function () {
        showPageItems(filtered);
        renderPagination(filtered.length);
        productsRow.classList.remove('page-fade-out');
        productsRow.classList.add('page-fade-in');
        setTimeout(function () {
          productsRow.classList.remove('page-fade-in');
        }, 300);
      }, 200);
    }

    function applyFilter(filter) {
      currentFilter = filter;
      currentPage = 1;
      var filtered = getFilteredProducts();

      // No animation on filter change — just show
      showPageItems(filtered);
      renderPagination(filtered.length);

      if (filtered.length === 0 && paginationControls) {
        paginationControls.innerHTML = '<li class="page-item disabled"><span class="page-link">No products found</span></li>';
      }
    }

    // Filter button clicks
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var filter = this.getAttribute('data-filter');

        filterBtns.forEach(function (b) {
          b.classList.remove('btn-primary', 'active');
          b.classList.add('btn-outline-primary');
        });
        this.classList.remove('btn-outline-primary');
        this.classList.add('btn-primary', 'active');

        applyFilter(filter);
      });
    });

    // Check for ?category= URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
      // Map URL param values to data-filter values
      var paramToFilter = {
        'lab-diagnostic': 'lab & diagnostic',
        'patient-care': 'patient care',
        'infection-control': 'infection control'
      };
      var targetFilter = paramToFilter[categoryFromUrl] || categoryFromUrl;
      // Find matching filter button and click it
      var matchBtn = Array.from(filterBtns).find(function (btn) {
        return btn.getAttribute('data-filter') === targetFilter;
      });
      if (matchBtn) {
        matchBtn.click();
      } else {
        applyFilter('all');
      }
    } else {
      // Initial render: show first 20 products
      applyFilter('all');
    }
  })();

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

  // ====== Mobile Back Button ======
  var isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
  if (!isIndex) {
    var backBtn = document.createElement('a');
    backBtn.href = '#';
    backBtn.className = 'mobile-back-btn d-md-none';
    backBtn.innerHTML = '<i class="bi bi-arrow-left"></i>';
    backBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (document.referrer && document.referrer !== window.location.href) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
    document.body.appendChild(backBtn);
  }

  // ====== Contact Form Handler ======
  var contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contactName').value.trim();
      if (!/^[A-Za-z\s]+$/.test(name)) { alert('Name must contain only letters and spaces.'); return; }
      if (name.length > 16) { alert('Name must be 16 characters or less.'); return; }
      alert('Thank you for your message! We will get back to you shortly.');
      contactForm.reset();
    });
  }

  // ====== Scroll Reveal Animation ======
  const aosElements = document.querySelectorAll('[data-aos]');
  if (aosElements.length) {
    const aosObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-aos-delay')) || 0;
          setTimeout(function () {
            entry.target.classList.add('aos-animate');
          }, delay);
          aosObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    aosElements.forEach(function (el) { aosObserver.observe(el); });
  }

  // ====== Loader ======
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(function () { loader.style.display = 'none'; }, 600);
    }
  });

  // ====== Hero Text Animation ======
  document.querySelectorAll('.hero-text').forEach(function (container) {
    container.querySelectorAll('h1, p, .hero-badge, .hero-buttons a').forEach(function (el) {
      var text = el.textContent.trim();
      if (!text || el.querySelector('.word')) return;
      var words = text.split(/\s+/);
      if (words.length <= 1) return;
      el.innerHTML = words.map(function (w, i) {
        return '<span class="word" style="--i:' + i + '">' + w + '</span>';
      }).join(' ');
    });
  });

  function animateActiveHero() {
    document.querySelectorAll('.hero-text').forEach(function (h) { h.classList.remove('animate-words'); });
    var active = document.querySelector('.carousel-item.active .hero-text');
    if (active) {
      void active.offsetWidth;
      active.classList.add('animate-words');
    }
  }
  animateActiveHero();

  var heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    heroCarousel.addEventListener('slid.bs.carousel', animateActiveHero);
  }

  // ====== Section Text Animation ======
  function animateSectionWords(containerSel) {
    var container = document.querySelector(containerSel);
    if (!container || container.classList.contains('words-setup')) return;
    container.classList.add('words-setup');
    container.querySelectorAll('h2, p').forEach(function (el) {
      var text = el.textContent.trim();
      if (!text || el.querySelector('.word')) return;
      var words = text.split(/\s+/);
      if (words.length <= 1) return;
      el.innerHTML = words.map(function (w, i) {
        return '<span class="word" style="--i:' + i + '">' + w + '</span>';
      }).join(' ');
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-words');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(container);
  }
  animateSectionWords('.how-it-works .section-title');
  animateSectionWords('#categories .section-title');

  console.log('%c MediStore %c Medical Equipment Theme v1.0 ',
    'background:#0d6efd;color:#fff;padding:4px 0 4px 8px;border-radius:4px 0 0 4px;font-weight:700;',
    'background:#071526;color:#fff;padding:4px 8px 4px 0;border-radius:0 4px 4px 0;font-weight:400;'
  );

});
