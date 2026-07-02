// ================================
// 3TCoffee - ỨNG DỤNG CHÍNH
// ================================

const App = {
    // ================================
    // CẤU HÌNH
    // ================================
    config: {
        currency: 'đ',
        get freeShipThreshold() {
            return (typeof DATA !== 'undefined' && DATA.settings?.freeShippingMin) || 200000;
        },
        get shippingFee() {
            return (typeof DATA !== 'undefined' && DATA.settings?.shippingFee) || 30000;
        },
    },

    // ================================
    // TIỆN ÍCH
    // ================================
    utils: {
        formatPrice: function(price) {
            return new Intl.NumberFormat('vi-VN').format(price) + App.config.currency;
        },

        formatDate: function(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
        },

        generateId: function() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        generateOrderCode: function() {
            return 'PLEI' + Date.now().toString().slice(-8);
        },

        slugify: function(text) {
            return text.toLowerCase()
                .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
                .replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
                .replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ỳýỵỷỹ]/g, 'y')
                .replace(/[đ]/g, 'd')
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
                .replace(/--+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        },

        getUrlParam: function(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },

        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },
    },

    // ================================
    // LƯU TRỮ (Bọc LocalStorage)
    // ================================
    storage: {
        key: 'plei_cart', // shared key with layout.js

        save: function(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        },

        load: function(key, defaultValue) {
            if (defaultValue === undefined) defaultValue = null;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        },

        get: function(key, defaultValue) {
            if (defaultValue === undefined) defaultValue = null;
            return this.load(key, defaultValue);
        },

        remove: function(key) {
            localStorage.removeItem(key);
        },

        saveCart: function() {
            this.save('plei_cart', App.cart.items);
        },

        saveWishlist: function() {
            this.save('plei_wishlist', App.wishlist.items);
        },

        loadCart: function() {
            const cart = this.load('plei_cart', []);
            App.cart.items = Array.isArray(cart) ? cart : [];
        },

        loadWishlist: function() {
            const wl = this.load('plei_wishlist', []);
            App.wishlist.items = Array.isArray(wl) ? wl : [];
        },

        saveAll: function() {
            this.saveCart();
            this.saveWishlist();
            this.saveOrders();
        },

        loadAll: function() {
            this.loadCart();
            this.loadWishlist();
            this.loadOrders();
            const lastUser = this.load('currentUser', null);
            if (lastUser) {
                // Đồng thời lưu vào các khóa cũ (legacy)
                this.save('plei_current_user', lastUser);
                this.save('plei_user', lastUser);
                App.auth.currentUser = lastUser;
            }
        },
    },

    // ================================
    // XÁC THỰC
    // ================================
    auth: {
        currentUser: null,

        init: function() {
            const savedUsers = App.storage.load('registeredUsers', null);
            if (savedUsers && Array.isArray(savedUsers)) {
                DATA.users = savedUsers;
            }
            this.currentUser = App.storage.load('currentUser', null);
            this.updateUI();
        },

        login: function(email, password) {
            const user = DATA.users.find(u => u.email === email && u.password === password);
            if (user) {
                const { password, ...safeUser } = user;
                this.currentUser = safeUser;
                App.storage.save('currentUser', safeUser);
                // Đồng thời lưu vào các khóa cũ để tương thích với header
                App.storage.save('plei_current_user', safeUser);
                App.storage.save('plei_user', safeUser);
                this.updateUI();
                App.toast.show('Đăng nhập thành công!', 'success');
                return true;
            }
            App.toast.show('Email hoặc mật khẩu không đúng!', 'error');
            return false;
        },

        register: function(userData) {
            const exists = DATA.users.find(u => u.email === userData.email);
            if (exists) {
                App.toast.show('Email đã được sử dụng!', 'error');
                return false;
            }

            const newUser = {
                id: App.utils.generateId(),
                email: userData.email,
                password: userData.password,
                name: userData.name,
                phone: userData.phone || '',
                address: userData.address || '',
                role: 'customer',
                loyaltyPoints: 0,
                createdAt: new Date().toISOString(),
            };

            DATA.users.push(newUser);
            App.storage.save('registeredUsers', DATA.users);

            if (userData.autoLogin) {
                const { password, ...safeUser } = newUser;
                this.currentUser = safeUser;
                App.storage.save('currentUser', safeUser);
                App.storage.save('plei_current_user', safeUser);
                App.storage.save('plei_user', safeUser);
                this.updateUI();
                App.toast.show('Đăng ký thành công!', 'success');
                return true;
            }

            App.toast.show('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            return true;
        },

        logout: function() {
            this.currentUser = null;
            App.storage.remove('currentUser');
            App.storage.remove('plei_current_user');
            App.storage.remove('plei_user');
            this.updateUI();
            App.toast.show('Đã đăng xuất!', 'info');
            if (window.location.pathname.includes('quan-tri.html')) {
                window.location.href = 'dang-nhap.html';
            }
        },

        isLoggedIn: function() {
            return this.currentUser !== null;
        },

        isAdmin: function() {
            return this.currentUser && this.currentUser.role === 'admin';
        },

        updateUI: function() {
            const authLinks = document.querySelectorAll('[data-auth]');
            authLinks.forEach(link => {
                const authState = link.dataset.auth;
                if (authState === 'logged') {
                    link.style.display = this.isLoggedIn() ? '' : 'none';
                } else if (authState === 'guest') {
                    link.style.display = !this.isLoggedIn() ? '' : 'none';
                } else if (authState === 'admin') {
                    link.style.display = this.isAdmin() ? '' : 'none';
                }
            });

            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = this.currentUser ? this.currentUser.name : 'Tài khoản';
            }

            this.injectNavAuth();
        },

        injectNavAuth: function() {
            // Xử lý #navAuthItem (header kiểu layout.js, dùng ở hầu hết các trang)
            const authItem = document.getElementById('navAuthItem');
            if (authItem) {
                if (this.isLoggedIn()) {
                    const href = this.isAdmin() ? 'quan-tri.html' : 'tai-khoan.html';
                    const label = this.isAdmin() ? 'Quản trị' : 'Tài khoản';
                    const name = this.currentUser ? this.currentUser.name : label;
                    authItem.innerHTML = '<a href="' + href + '" class="nav-link d-flex align-items-center gap-1">  <span>' + name + '</span></a>';
                } else {
                    authItem.innerHTML = '<a href="dang-nhap.html" class="nav-link d-flex align-items-center gap-1">  <span class="d-none d-sm-inline">Đăng nhập</span></a>';
                }
            }

            // Xử lý thanh điều hướng #ftco-nav (kiểu Bootstrap, dùng ở một số trang)
            document.querySelectorAll('#ftco-nav .navbar-nav').forEach(nav => {
                if (nav.querySelector('[data-nav-auth]')) return;

                const li = document.createElement('li');
                li.className = 'nav-item';
                li.setAttribute('data-nav-auth', 'true');

                if (this.isLoggedIn()) {
                    const href = this.isAdmin() ? 'quan-tri.html' : 'tai-khoan.html';
                    const label = this.isAdmin() ? 'Quản trị' : 'Tài khoản';
                    li.innerHTML = '<a href="' + href + '" class="nav-link"><span class="icon-user"></span> ' + label + '</a>';
                } else {
                    li.innerHTML = '<a href="dang-nhap.html" class="nav-link"><span class="icon-user"></span> Đăng nhập</a>';
                }

                const wishlistItem = nav.querySelector('a[href="trang-yeu-thich.html"]');
                if (wishlistItem && wishlistItem.closest('.nav-item')) {
                    nav.insertBefore(li, wishlistItem.closest('.nav-item'));
                } else {
                    nav.appendChild(li);
                }
            });

            // Đồng thời gọi initAuthState của layout.js nếu có
            if (typeof initAuthState === 'function') {
                initAuthState();
            }
        },
    },

    // ================================
    // GIỎ HÀNG
    // ================================
    cart: {
        items: [],
        voucherDiscount: 0,
        shippingDiscount: 0,

        init: function() {
            App.storage.loadAll();
            App.vouchers.init();
            this.voucherDiscount = App.vouchers.getDiscount(this.getSubtotal());
            this.shippingDiscount = App.vouchers.getShippingDiscount();
            this.updateUI();
        },

        add: function(productId, quantity = 1) {
            const product = DATA.products.find(p => p.id === productId);
            if (!product) return false;

            const existingItem = this.items.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    id: App.utils.generateId(),
                    productId: product.id,
                    name: product.name,
                    price: product.salePrice || product.price,
                    image: product.images[0],
                    quantity: quantity,
                    addedAt: new Date().toISOString(),
                });
            }

            this.save();
            this.updateUI();
            // Thông báo (toast) được hiển thị bởi hàm addToCart trong layout.js
            return true;
        },

        remove: function(itemId) {
            this.items = this.items.filter(item => item.id !== itemId);
            this.save();
            this.updateUI();
            App.toast.show('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
        },

        updateQuantity: function(itemId, quantity) {
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                if (quantity <= 0) {
                    this.remove(itemId);
                } else {
                    item.quantity = quantity;
                    this.save();
                    this.updateUI();
                }
            }
        },

        clear: function() {
            this.items = [];
            this.voucherDiscount = 0;
            this.shippingDiscount = 0;
            App.vouchers.remove();
            this.save();
            this.updateUI();
        },

        getSubtotal: function() {
            return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },

        getAll: function() {
            return this.items;
        },

        update: function(idOrProductId, quantity) {
            const item = this.items.find(i => i.id === idOrProductId || i.productId === idOrProductId);
            if (item) {
                this.updateQuantity(item.id, quantity);
            }
        },

        getBaseShipping: function() {
            const subtotal = this.getSubtotal();
            return subtotal >= App.config.freeShipThreshold ? 0 : App.config.shippingFee;
        },

        getShipping: function() {
            const base = this.getBaseShipping();
            if (App.vouchers.appliedCode) {
                const voucher = App.vouchers.getByCode(App.vouchers.appliedCode);
                if (voucher && voucher.discountType === 'freeship') {
                    return 0;
                }
            }
            return base;
        },

        getDiscount: function() {
            this.voucherDiscount = App.vouchers.getDiscount(this.getSubtotal());
            return this.voucherDiscount;
        },

        getTotal: function() {
            return this.getSubtotal() + this.getShipping() - this.getDiscount();
        },

        getCount: function() {
            return this.items.reduce((sum, item) => sum + item.quantity, 0);
        },

        save: function() {
            App.storage.saveAll();
        },

        updateUI: function() {
            const cartCountEl = document.getElementById('cartCount');
            if (cartCountEl) {
                const count = this.getCount();
                cartCountEl.textContent = count;
                cartCountEl.style.display = count > 0 ? '' : 'none';
            }

            const cartBadgeEl = document.getElementById('cartBadge');
            if (cartBadgeEl) {
                const count = this.getCount();
                cartBadgeEl.textContent = count;
                cartBadgeEl.style.display = count > 0 ? 'flex' : 'none';
            }

            this.renderSidebar();

            if (document.getElementById('cartItems')) {
                this.renderCartPage();
            }

            if (document.getElementById('checkoutCart') || document.getElementById('checkoutItems')) {
                this.renderCheckout();
            }

            this.updateCartPageTotals();
        },

        updateCartPageTotals: function() {
            const subtotalEl = document.getElementById('subtotal');
            if (!subtotalEl) return;

            subtotalEl.textContent = App.utils.formatPrice(this.getSubtotal());

            const shippingEl = document.getElementById('shipping');
            if (shippingEl) {
                const shipping = this.getShipping();
                shippingEl.textContent = shipping === 0 ? 'Miễn phí' : App.utils.formatPrice(shipping);
            }

            const discount = this.getDiscount();
            const voucherEl = document.getElementById('voucherDiscount');
            if (voucherEl) {
                voucherEl.textContent = discount > 0 ? '-' + App.utils.formatPrice(discount) : '0đ';
                voucherEl.className = discount > 0 ? 'text-success' : '';
            }

            const totalEl = document.getElementById('total');
            if (totalEl) {
                totalEl.textContent = App.utils.formatPrice(this.getTotal());
            }

            const appliedEl = document.getElementById('appliedVoucherCode');
            if (appliedEl) {
                appliedEl.textContent = App.vouchers.appliedCode || '';
            }

            const appliedWrap = document.getElementById('appliedVoucherWrap');
            if (appliedWrap) {
                appliedWrap.style.display = App.vouchers.appliedCode ? 'block' : 'none';
            }

            const freeShipHint = document.getElementById('freeShipHint');
            if (freeShipHint) {
                const subtotal = this.getSubtotal();
                const remaining = App.config.freeShipThreshold - subtotal;
                if (remaining > 0 && this.getShipping() > 0) {
                    freeShipHint.style.display = 'block';
                    freeShipHint.textContent = 'Mua thêm ' + App.utils.formatPrice(remaining) + ' để được miễn phí giao hàng!';
                } else {
                    freeShipHint.style.display = 'none';
                }
            }
        },

        applyVoucherCode: function() {
            const input = document.getElementById('voucherInput');
            if (!input) return;
            const code = input.value.trim();
            if (!code) {
                App.toast.show('Vui lòng nhập mã voucher!', 'warning');
                return;
            }
            if (App.vouchers.apply(code, this.getSubtotal())) {
                input.value = '';
                this.updateUI();
            }
        },

        removeVoucherCode: function() {
            App.vouchers.remove();
            this.updateUI();
            App.toast.show('Đã xóa mã voucher', 'info');
        },

        renderSidebar: function() {
            const sidebar = document.getElementById('cartSidebar');
            if (!sidebar) return;

            if (this.items.length === 0) {
                sidebar.innerHTML = `
                    <div class="text-center py-5">
                        <i class="flaticon-shopping-bag" style="font-size: 48px; color: #ccc;"></i>
                        <p class="mt-3 text-muted">Giỏ hàng trống</p>
                    </div>
                `;
                return;
            }

            let html = '';
            this.items.slice(0, 5).forEach(item => {
                html += `
                    <div class="cart-item d-flex align-items-center mb-3">
                        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        <div class="ml-3 flex-grow-1">
                            <h6 class="mb-0" style="font-size: 14px;">${item.name}</h6>
                            <small class="text-muted">${App.utils.formatPrice(item.price)} x ${item.quantity}</small>
                        </div>
                        <button class="btn btn-sm text-danger" onclick="App.cart.remove('${item.id}')">
                            <i class="icon-close"></i>
                        </button>
                    </div>
                `;
            });

            html += `
                <div class="mt-3 pt-3 border-top">
                    <div class="d-flex justify-content-between mb-2">
                        <strong>Tổng cộng:</strong>
                        <strong class="text-primary">${App.utils.formatPrice(this.getSubtotal())}</strong>
                    </div>
                    <a href="gio-hang.html" class="btn btn-primary btn-block">Xem giỏ hàng</a>
                    <a href="thanh-toan.html" class="btn btn-outline-primary btn-block mt-2">Thanh toán</a>
                </div>
            `;

            sidebar.innerHTML = html;
        },

        renderCartPage: function() {
            const container = document.getElementById('cartItems');
            const summaryEl = document.getElementById('cartSummary');
            if (!container) return;

            const isTableBody = container.tagName === 'TBODY';

            if (this.items.length === 0) {
                if (isTableBody) {
                    container.innerHTML = '<tr><td colspan="7" class="text-center py-5"><p class="mb-0 text-muted">Giỏ hàng trống!</p><a href="san-pham.html" class="btn btn-primary mt-3">Tiếp tục mua sắm</a></td></tr>';
                } else {
                    container.innerHTML = `
                        <div class="text-center py-5">
                            <i class="flaticon-shopping-bag" style="font-size: 64px; color: #ccc;"></i>
                            <h4 class="mt-4 text-muted">Giỏ hàng trống</h4>
                            <p class="text-muted">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                            <a href="san-pham.html" class="btn btn-primary mt-3">Khám phá menu</a>
                        </div>
                    `;
                }
                if (summaryEl) summaryEl.style.display = 'none';
                this.updateCartPageTotals();
                return;
            }

            if (summaryEl) summaryEl.style.display = '';

            let html = '';
            this.items.forEach(item => {
                const lineTotal = item.price * item.quantity;
                if (isTableBody) {
                    html += `
                        <tr class="text-center">
                            <td class="product-remove"><a href="#" onclick="App.cart.remove('${item.id}'); return false;"><span class="ion-ios-close"></span></a></td>
                            <td class="image-prod"><div class="img" style="width:100px;margin:0 auto;"><img src="${item.image}" alt="${item.name}" style="width:100%;"></div></td>
                            <td class="product-name"><h3><a href="chi-tiet-san-pham.html?id=${item.productId}">${item.name}</a></h3></td>
                            <td class="price">${App.utils.formatPrice(item.price)}</td>
                            <td class="quantity">
                                <div class="input-group mb-3 justify-content-center">
                                    <span class="input-group-btn"><button type="button" class="quantity-left-minus btn" onclick="App.cart.updateQuantity('${item.id}', ${item.quantity - 1})"><span class="ion-ios-remove"></span></button></span>
                                    <input type="text" class="form-control text-center" value="${item.quantity}" readonly style="max-width:60px;">
                                    <span class="input-group-btn"><button type="button" class="quantity-right-plus btn" onclick="App.cart.updateQuantity('${item.id}', ${item.quantity + 1})"><span class="ion-ios-add"></span></button></span>
                                </div>
                            </td>
                            <td class="total">${App.utils.formatPrice(lineTotal)}</td>
                            <td class="product-remove"><a href="#" onclick="App.wishlist.toggle('${item.productId}'); return false;" title="Yêu thích"><span class="ion-ios-heart"></span></a></td>
                        </tr>
                    `;
                } else {
                    html += `
                        <div class="cart-item-row d-flex align-items-center py-3 border-bottom" data-item-id="${item.id}">
                            <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                            <div class="ml-4 flex-grow-1">
                                <h5 class="mb-1">${item.name}</h5>
                                <p class="text-muted mb-2">${App.utils.formatPrice(item.price)}</p>
                                <div class="quantity-control d-inline-flex align-items-center border rounded">
                                    <button class="btn btn-sm btn-outline-secondary" onclick="App.cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                    <span class="px-3">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="App.cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                                </div>
                            </div>
                            <div class="text-right">
                                <h5 class="text-primary mb-2">${App.utils.formatPrice(lineTotal)}</h5>
                                <button class="btn btn-sm btn-outline-danger" onclick="App.cart.remove('${item.id}')"><i class="icon-trash"></i> Xóa</button>
                            </div>
                        </div>
                    `;
                }
            });

            container.innerHTML = html;
            this.updateCartPageTotals();
        },

        renderCheckout: function() {
            const container = document.getElementById('checkoutCart') || document.getElementById('checkoutItems');
            if (!container) return;

            if (this.items.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <p class="text-muted">Không có sản phẩm nào để thanh toán</p>
                        <a href="san-pham.html" class="btn btn-primary">Tiếp tục mua sắm</a>
                    </div>
                `;
                return;
            }

            let html = '';
            if (container.id === 'checkoutItems') {
                html = '<div class="checkout-items-list">';
                this.items.forEach(item => {
                    html += `
                        <div class="d-flex align-items-center py-2 border-bottom">
                            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                            <div class="ml-3 flex-grow-1">
                                <strong>${item.name}</strong>
                                <small class="d-block text-muted">x${item.quantity}</small>
                            </div>
                            <strong>${App.utils.formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    `;
                });
                html += '</div>';
            } else {
                this.items.forEach(item => {
                    html += `
                        <div class="d-flex align-items-center py-2">
                            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                            <div class="ml-3 flex-grow-1">
                                <strong>${item.name}</strong>
                                <small class="d-block text-muted">x${item.quantity}</small>
                            </div>
                            <strong>${App.utils.formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    `;
                });

                const discount = this.getDiscount();
                const shipping = this.getShipping();

                html += `
                    <hr>
                    <div class="d-flex justify-content-between"><span>Tạm tính:</span><strong>${App.utils.formatPrice(this.getSubtotal())}</strong></div>
                    ${discount > 0 ? `<div class="d-flex justify-content-between text-success"><span>Giảm giá (${App.vouchers.appliedCode}):</span><strong>-${App.utils.formatPrice(discount)}</strong></div>` : ''}
                    <div class="d-flex justify-content-between"><span>Phí vận chuyển:</span><strong>${shipping === 0 ? 'Miễn phí' : App.utils.formatPrice(shipping)}</strong></div>
                    <div class="d-flex justify-content-between mt-2 pt-2 border-top"><strong>Tổng cộng:</strong><strong class="text-primary h4">${App.utils.formatPrice(this.getTotal())}</strong></div>
                `;
            }

            container.innerHTML = html;
            this.updateCartPageTotals();
        },
    },

    // ================================
    // MÃ GIẢM GIÁ
    // ================================
    vouchers: {
        appliedCode: null,

        init: function() {
            const saved = App.storage.load('appliedVoucher', null);
            if (saved) {
                this.appliedCode = saved;
            }
        },

        getAll: function() {
            return DATA.vouchers.filter(v => v.isActive);
        },

        getByCode: function(code) {
            return DATA.vouchers.find(v => v.code === code && v.isActive);
        },

        validate: function(code, subtotal) {
            const voucher = this.getByCode(code);
            if (!voucher) {
                return { valid: false, message: 'Mã voucher không hợp lệ!' };
            }

            // Kiểm tra ngày hết hạn
            if (new Date(voucher.expDate) < new Date()) {
                return { valid: false, message: 'Mã voucher đã hết hạn!' };
            }

            // Kiểm tra giới hạn số lần sử dụng
            if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
                return { valid: false, message: 'Mã voucher đã hết lượt sử dụng!' };
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if (voucher.minOrder > subtotal) {
                return { valid: false, message: `Đơn hàng tối thiểu ${App.utils.formatPrice(voucher.minOrder)} để sử dụng mã này!` };
            }

            return { valid: true, voucher: voucher, message: 'Áp dụng thành công!' };
        },

        apply: function(code, subtotal) {
            const result = this.validate(code, subtotal);
            if (result.valid) {
                this.appliedCode = code;
                App.storage.save('appliedVoucher', code);
                App.toast.show(result.message, 'success');
                return result.voucher;
            } else {
                App.toast.show(result.message, 'error');
                return null;
            }
        },

        remove: function() {
            this.appliedCode = null;
            App.storage.remove('appliedVoucher');
        },

        getDiscount: function(subtotal) {
            if (!this.appliedCode) return 0;
            const voucher = this.getByCode(this.appliedCode);
            if (!voucher) return 0;

            let discount = 0;
            switch (voucher.discountType) {
                case 'fixed':
                    discount = voucher.discount;
                    break;
                case 'percent':
                    discount = subtotal * (voucher.discount / 100);
                    if (voucher.maxDiscount) {
                        discount = Math.min(discount, voucher.maxDiscount);
                    }
                    break;
                case 'freeship':
                    discount = 0;
                    break;
            }

            return Math.min(Math.floor(discount), subtotal);
        },

        getShippingDiscount: function() {
            return 0;
        },
    },

    // ================================
    // ĐÁNH GIÁ
    // ================================
    reviews: {
        userReviews: [],

        init: function() {
            const saved = App.storage.load('userReviews', []);
            this.userReviews = saved;
        },

        getAll: function() {
            return DATA.reviews;
        },

        getByProduct: function(productId) {
            return [...DATA.reviews.filter(r => r.productId === productId), 
                    ...this.userReviews.filter(r => r.productId === productId)];
        },

        add: function(reviewData) {
            if (!App.auth.isLoggedIn()) {
                App.toast.show('Vui lòng đăng nhập để đánh giá!', 'warning');
                return false;
            }

            const review = {
                id: App.utils.generateId(),
                productId: reviewData.productId,
                userName: App.auth.currentUser.name,
                rating: reviewData.rating,
                comment: reviewData.comment,
                createdAt: new Date().toISOString().split('T')[0],
            };

            this.userReviews.push(review);
            App.storage.save('userReviews', this.userReviews);

            // Cập nhật điểm đánh giá sản phẩm
            const product = DATA.products.find(p => p.id === reviewData.productId);
            if (product) {
                const allReviews = this.getByProduct(reviewData.productId);
                const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
                product.rating = Math.round(avgRating * 10) / 10;
                product.reviewCount = allReviews.length;
            }

            App.toast.show('Cảm ơn bạn đã đánh giá!', 'success');
            return true;
        },

        getAverageRating: function(productId) {
            const reviews = this.getByProduct(productId);
            if (reviews.length === 0) return 0;
            return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        },

        getRatingCounts: function(productId) {
            const reviews = this.getByProduct(productId);
            const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach(r => {
                if (counts[r.rating] !== undefined) counts[r.rating]++;
            });
            return counts;
        },
    },

    // ================================
    // DANH SÁCH YÊU THÍCH
    // ================================
    wishlist: {
        items: [],

        init: function() {
            App.storage.loadAll();
            this.updateUI();
            this.renderWishlistPage();
        },

        toggle: function(productId) {
            const product = DATA.products.find(p => p.id === productId);
            if (!product) return;

            const index = this.items.indexOf(productId);
            if (index > -1) {
                this.items.splice(index, 1);
                App.toast.show(`Đã xóa "${product.name}" khỏi danh sách yêu thích!`, 'info');
            } else {
                this.items.push(productId);
                App.toast.show(`Đã thêm "${product.name}" vào danh sách yêu thích!`, 'success');
            }

            this.save();
            this.updateUI();
            this.renderWishlistPage();
        },

        isInWishlist: function(productId) {
            return this.items.includes(productId);
        },

        getProducts: function() {
            return this.items.map(id => DATA.products.find(p => p.id === id)).filter(Boolean);
        },

        save: function() {
            App.storage.saveAll();
        },

        updateUI: function() {
            const wishlistCountEl = document.getElementById('wishlistCount');
            if (wishlistCountEl) {
                const count = this.items.length;
                wishlistCountEl.textContent = count;
                wishlistCountEl.style.display = count > 0 ? '' : 'none';
            }

            document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
                const productId = btn.dataset.wishlistBtn;
                if (this.isInWishlist(productId)) {
                    btn.classList.add('text-danger');
                    btn.innerHTML = '<i class="icon-heart"></i>';
                } else {
                    btn.classList.remove('text-danger');
                    btn.innerHTML = '<i class="icon-heart-o"></i>';
                }
            });
        },

        renderWishlistPage: function() {
            const container = document.getElementById('wishlistItems');
            if (!container) return;

            const products = this.getProducts();
            if (products.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="icon-heart" style="font-size: 64px; color: #ccc;"></i>
                        <h4 class="mt-4 text-muted">Chưa có sản phẩm yêu thích</h4>
                        <p class="text-muted">Hãy thêm sản phẩm bạn thích vào danh sách</p>
                        <a href="san-pham.html" class="btn btn-primary mt-3">Khám phá menu</a>
                    </div>
                `;
                return;
            }

            let html = '<div class="row">';
            products.forEach(product => {
                html += `<div class="col-md-3 col-sm-6">${App.render.productCard(product)}</div>`;
            });
            html += '</div>';
            container.innerHTML = html;
        },
    },

    // ================================
    // ĐƠN HÀNG
    // ================================
    orders: {
        items: [],

        init: function() {
            App.storage.loadAll();
        },

        create: function(orderData) {
            const discount = App.cart.getDiscount();
            const voucherCode = App.vouchers.appliedCode;
            const shipping = App.cart.getShipping();

            const order = {
                id: App.utils.generateId(),
                code: App.utils.generateOrderCode(),
                items: App.cart.items.map(i => ({
                    productId: i.productId,
                    productName: i.name,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    total: i.price * i.quantity,
                    image: i.image,
                })),
                subtotal: App.cart.getSubtotal(),
                discount: discount,
                shipping: shipping,
                shippingFee: shipping,
                total: App.cart.getTotal(),
                couponCode: voucherCode || '',
                customer: {
                    name: orderData.name,
                    phone: orderData.phone,
                    email: orderData.email || '',
                    address: orderData.address,
                    note: orderData.note || orderData.notes || '',
                    userId: App.auth.currentUser?.id || null,
                },
                customerName: orderData.name,
                customerEmail: orderData.email || '',
                customerPhone: orderData.phone,
                address: orderData.address,
                note: orderData.note || orderData.notes || '',
                status: 'pending',
                paymentStatus: ['vnpay', 'momo'].includes(orderData.paymentMethod) ? 'paid' : 'pending',
                paymentMethod: orderData.paymentMethod || 'cod',
                createdAt: new Date().toISOString(),
                notes: orderData.note || orderData.notes || '',
            };

            if (voucherCode) {
                const voucher = App.vouchers.getByCode(voucherCode);
                if (voucher) voucher.usedCount = (voucher.usedCount || 0) + 1;
            }

            this.items.unshift(order);
            App.cart.clear();
            App.storage.saveOrders();

            App.toast.show('Đặt hàng thành công! Mã đơn hàng: ' + order.code, 'success');
            App.storage.save('lastOrder', order);

            return order;
        },

        add: function(orderData) {
            return this.create(orderData.customer || orderData);
        },

        getByCode: function(code) {
            return this.items.find(o => o.code === code || o.id === code);
        },

        getByUser: function(userId) {
            if (!userId) return [];
            const user = App.auth.currentUser;
            return this.items.filter(o =>
                o.customer?.userId === userId ||
                (user && o.customerEmail === user.email) ||
                (user && o.customer?.email === user.email)
            );
        },

        updateStatus: function(orderId, status) {
            const order = this.items.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                order.updatedAt = new Date().toISOString();
                App.storage.saveOrders();
            }
        },
    },

    // ================================
    // SẢN PHẨM
    // ================================
    products: {
        getAll: function() {
            return DATA.products;
        },

        getById: function(id) {
            return DATA.products.find(p => p.id === id);
        },

        getBySlug: function(slug) {
            return DATA.products.find(p => p.slug === slug);
        },

        getByCategory: function(categoryId) {
            return DATA.products.filter(p => p.categoryId === categoryId);
        },

        getFeatured: function(limit = 8) {
            return DATA.products.filter(p => p.isFeatured).slice(0, limit);
        },

        getNew: function(limit = 4) {
            return DATA.products.filter(p => p.isNew).slice(0, limit);
        },

        getFlashSale: function() {
            return DATA.products.filter(p => p.isFlashSale || (p.salePrice && p.salePrice < p.price));
        },

        getRelated: function(productId, categoryId, limit = 4) {
            return DATA.products
                .filter(p => p.id !== productId && p.categoryId === categoryId)
                .slice(0, limit);
        },

        search: function(query) {
            const q = query.toLowerCase();
            return DATA.products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.categoryName.toLowerCase().includes(q)
            );
        },

        filter: function(options = {}) {
            let results = [...DATA.products];

            if (options.category) {
                results = results.filter(p => p.categoryId === options.category);
            }

            if (options.minPrice) {
                results = results.filter(p => (p.salePrice || p.price) >= options.minPrice);
            }

            if (options.maxPrice) {
                results = results.filter(p => (p.salePrice || p.price) <= options.maxPrice);
            }

            if (options.search) {
                const q = options.search.toLowerCase();
                results = results.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
                );
            }

            if (options.sort) {
                switch (options.sort) {
                    case 'price-asc':
                        results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                        break;
                    case 'price-desc':
                        results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                        break;
                    case 'name':
                        results.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    case 'newest':
                        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        break;
                    case 'popular':
                        results.sort((a, b) => b.soldCount - a.soldCount);
                        break;
                }
            }

            return results;
        },
    },

    // ================================
    // DANH MỤC
    // ================================
    categories: {
        getAll: function() {
            return DATA.categories;
        },

        getById: function(id) {
            return DATA.categories.find(c => c.id === id);
        },

        getBySlug: function(slug) {
            return DATA.categories.find(c => c.slug === slug);
        },
    },

    // ================================
    // BÀI VIẾT
    // ================================
    blogs: {
        getAll: function() {
            return DATA.blogs;
        },

        getById: function(id) {
            return DATA.blogs.find(b => b.id === id);
        },

        getBySlug: function(slug) {
            return DATA.blogs.find(b => b.slug === slug);
        },

        getRecent: function(limit = 3) {
            return [...DATA.blogs].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, limit);
        },
    },

    // ================================
    // CÂU HỎI THƯỜNG GẶP
    // ================================
    faqs: {
        getAll: function() {
            return DATA.faqs || [];
        },

        getById: function(id) {
            return (DATA.faqs || []).find(f => f.id === id);
        },
    },

    // ================================
    // THÔNG BÁO (TOAST)
    // ================================
    toast: {
        container: null,

        init: function() {
            if (!document.getElementById('toastContainer')) {
                const container = document.createElement('div');
                container.id = 'toastContainer';
                container.className = 'toast-container position-fixed bottom-0 right-0 p-3';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
            }
            this.container = document.getElementById('toastContainer');
        },

        show: function(message, type = 'info') {
            if (!this.container) this.init();

            const toast = document.createElement('div');
            const icons = {
                success: '<i class="icon-check"></i>',
                error: '<i class="icon-close"></i>',
                warning: '<i class="icon-warning"></i>',
                info: '<i class="icon-info"></i>'
            };

            toast.className = `toast ${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML = `
                ${icons[type] || icons.info}
                <span>${message}</span>
                <button class="toast-close" aria-label="Close">&times;</button>
            `;

            this.container.appendChild(toast);

            // Hiệu ứng xuất hiện
            setTimeout(() => toast.classList.add('show'), 10);

            // Nút đóng
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.dismiss(toast);
            });

            // Tự động ẩn
            setTimeout(() => this.dismiss(toast), 4000);

            return toast;
        },

        dismiss: function(toast) {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        },

        success: function(message) { return this.show(message, 'success'); },
        error: function(message) { return this.show(message, 'error'); },
        warning: function(message) { return this.show(message, 'warning'); },
        info: function(message) { return this.show(message, 'info'); },
    },

    // ================================
    // HÀM HỖ TRỢ HIỂN THỊ
    // ================================
        render: {
            productCard: function(product) {
                const price = product.salePrice || product.price;
                const originalPrice = product.salePrice ? product.price : null;
                const discount = originalPrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

                return `
                    <div class="product-card menu-entry text-center" data-product-id="${product.id}">
                        <div class="img-container position-relative overflow-hidden">
                            <a href="chi-tiet-san-pham.html?id=${product.id}">
                                <img src="${product.images[0]}" alt="${product.name}" class="menu-img w-100" style="height: 220px; object-fit: cover;" loading="lazy">
                            </a>
                            ${product.isNew ? '<span class="badge badge-success position-absolute" style="top: 10px; left: 10px;">Mới</span>' : ''}
                            ${product.isFlashSale ? `<span class="badge badge-danger position-absolute" style="top: 10px; right: 10px;">-${discount}%</span>` : ''}
                            <button class="btn btn-outline-light position-absolute wishlist-btn" style="bottom: 10px; right: 10px;" data-wishlist-btn="${product.id}" onclick="App.wishlist.toggle('${product.id}')">
                                <i class="icon-heart-o"></i>
                            </button>
                        </div>
                        <div class="text py-3 px-2">
                            <h3 class="mb-1" style="font-size: 16px;"><a href="chi-tiet-san-pham.html?id=${product.id}" class="text-dark">${product.name}</a></h3>
                            <p class="text-muted mb-2" style="font-size: 13px;">${product.volume}</p>
                            <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
                                <span class="h5 mb-0 text-primary">${App.utils.formatPrice(price)}</span>
                                ${originalPrice ? `<span class="text-muted text-decoration-line-through">${App.utils.formatPrice(originalPrice)}</span>` : ''}
                            </div>
                            <div class="d-flex justify-content-center align-items-center gap-1 mb-2">
                                <span class="text-warning">${'★'.repeat(Math.round(product.rating))}</span>
                                <small class="text-muted">(${product.reviewCount})</small>
                            </div>
                            <button class="btn btn-primary btn-sm w-100" onclick="App.cart.add('${product.id}')">
                                <i class="icon-shopping-cart"></i> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                `;
            },

            productGrid: function(products, containerId) {
                const container = document.getElementById(containerId);
                if (!container) return;

                if (products.length === 0) {
                    container.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="flaticon-coffee-bean" style="font-size: 64px; color: #ccc;"></i>
                            <h4 class="mt-4 text-muted">Không tìm thấy sản phẩm</h4>
                        </div>
                    `;
                    return;
                }

                let html = '<div class="row">';
                products.forEach(product => {
                    html += `<div class="col-lg-3 col-md-4 col-sm-6">${this.productCard(product)}</div>`;
                });
                html += '</div>';
                container.innerHTML = html;
                App.wishlist.updateUI();
            },

            categoryCard: function(category) {
                return `
                    <div class="col-md-3 col-sm-6">
                        <div class="category-card text-center p-4 border rounded">
                            <a href="san-pham.html?category=${category.id}">
                                <img src="${category.image}" alt="${category.name}" class="rounded-circle mb-3" style="width: 120px; height: 120px; object-fit: cover;" loading="lazy">
                                <h5 class="mb-1">${category.name}</h5>
                                <small class="text-muted">${DATA.products.filter(p => p.categoryId === category.id).length} sản phẩm</small>
                            </a>
                        </div>
                    </div>
                `;
            },

            blogCard: function(blog) {
                return `
                    <div class="col-md-4">
                        <div class="blog-card blog-entry align-self-stretch">
                            <a href="chi-tiet-blog.html?id=${blog.id}" class="block-20">
                                <img src="${blog.image}" alt="${blog.title}" class="img-fluid" style="height: 200px; object-fit: cover;" loading="lazy">
                            </a>
                            <div class="text py-3 d-block">
                                <h3 class="heading mt-2"><a href="chi-tiet-blog.html?id=${blog.id}">${blog.title}</a></h3>
                                <div class="meta mb-2">
                                    <span><i class="icon-calendar"></i> ${App.utils.formatDate(blog.publishedAt)}</span>
                                    <span><i class="icon-eye"></i> ${blog.views} lượt xem</span>
                                </div>
                                <p>${blog.excerpt}</p>
                            </div>
                        </div>
                    </div>
                `;
            },

            blogCardHorizontal: function(blog) {
                return `
                    <div class="blog-entry d-flex">
                        <a href="chi-tiet-blog.html?id=${blog.id}" class="blog-img" style="min-width: 200px;">
                            <img src="${blog.image}" alt="${blog.title}" class="img-fluid" style="height: 150px; object-fit: cover;" loading="lazy">
                        </a>
                        <div class="text p-3">
                            <h3 class="heading"><a href="chi-tiet-blog.html?id=${blog.id}">${blog.title}</a></h3>
                            <div class="meta mb-2">
                                <span><i class="icon-calendar"></i> ${App.utils.formatDate(blog.publishedAt)}</span>
                                <span><i class="icon-eye"></i> ${blog.views} lượt xem</span>
                            </div>
                            <p>${blog.excerpt}</p>
                        </div>
                    </div>
                `;
            },

            faqItem: function(faq, index) {
                return `
                    <div class="faq-item mb-3">
                        <div class="card">
                            <div class="card-header" id="faqHeading${index}">
                                <h5 class="mb-0">
                                    <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#faqCollapse${index}">
                                        <i class="icon-question-circle mr-2"></i>${faq.question}
                                    </button>
                                </h5>
                            </div>
                            <div id="faqCollapse${index}" class="collapse" data-parent="#faqAccordion">
                                <div class="card-body">${faq.answer}</div>
                            </div>
                        </div>
                    </div>
                `;
            },

            reviewCard: function(review) {
                return `
                    <div class="review-item mb-3 p-3 border rounded">
                        <div class="d-flex justify-content-between mb-2">
                            <strong><i class="icon-user mr-1"></i>${review.userName}</strong>
                            <div>
                                ${'★'.repeat(review.rating).split('').map(() => '<span class="text-warning">★</span>').join('')}
                                ${'☆'.repeat(5 - review.rating).split('').map(() => '<span class="text-muted">☆</span>').join('')}
                            </div>
                        </div>
                        <p class="mb-1">${review.comment}</p>
                        <small class="text-muted"><i class="icon-calendar mr-1"></i>${App.utils.formatDate(review.createdAt)}</small>
                    </div>
                `;
            },

            reviewsSection: function(productId) {
                const reviews = App.reviews.getByProduct(productId);
                const avgRating = App.reviews.getAverageRating(productId);
                const ratingCounts = App.reviews.getRatingCounts(productId);
                const totalReviews = reviews.length;

                let html = `
                    <div class="reviews-container mt-4">
                        <h4 class="mb-4">Đánh giá sản phẩm</h4>
                        ${totalReviews > 0 ? `
                        <div class="row mb-4">
                            <div class="col-md-4 text-center">
                                <div class="rating-overview">
                                    <div class="h1 mb-0 text-primary">${avgRating.toFixed(1)}</div>
                                    <div class="text-warning mb-2">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))}</div>
                                    <small class="text-muted">${totalReviews} đánh giá</small>
                                </div>
                            </div>
                            <div class="col-md-8">
                                ${[5, 4, 3, 2, 1].map(stars => {
                                    const count = ratingCounts[stars] || 0;
                                    const percent = totalReviews > 0 ? (count / totalReviews * 100) : 0;
                                    return `
                                        <div class="d-flex align-items-center mb-1">
                                            <span class="mr-2">${stars} <span class="text-warning">★</span></span>
                                            <div class="progress flex-grow-1" style="height: 8px;">
                                                <div class="progress-bar bg-warning" style="width: ${percent}%"></div>
                                            </div>
                                            <span class="ml-2 text-muted small">${count}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div class="reviews-list">
                            ${reviews.map(r => this.reviewCard(r)).join('')}
                        </div>
                        ` : '<p class="text-muted">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>'}
                    </div>
                `;
                return html;
            },

            voucherCard: function(voucher) {
                const isExpired = new Date(voucher.expDate) < new Date();
                const isUsedOut = voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit;
                const isDisabled = isExpired || isUsedOut;

                let discountText = '';
                switch (voucher.discountType) {
                    case 'fixed':
                        discountText = `Giảm ${App.utils.formatPrice(voucher.discount)}`;
                        break;
                    case 'percent':
                        discountText = `Giảm ${voucher.discount}%`;
                        if (voucher.maxDiscount) discountText += ` (tối đa ${App.utils.formatPrice(voucher.maxDiscount)})`;
                        break;
                    case 'freeship':
                        discountText = 'Miễn phí vận chuyển';
                        break;
                }

                return `
                    <div class="voucher-card border rounded p-3 mb-3 ${isDisabled ? 'opacity-50' : ''}">
                        <div class="row align-items-center">
                            <div class="col-md-3 text-center border-right">
                                <div class="h4 mb-0 text-danger">${discountText}</div>
                                ${voucher.minOrder > 0 ? `<small class="text-muted">Đơn từ ${App.utils.formatPrice(voucher.minOrder)}</small>` : ''}
                            </div>
                            <div class="col-md-6">
                                <h5 class="mb-1">${voucher.code}</h5>
                                <p class="mb-0 text-muted small">${voucher.description}</p>
                                <small class="text-muted">
                                    <i class="icon-calendar mr-1"></i>Hết hạn: ${App.utils.formatDate(voucher.expDate)}
                                    ${voucher.usageLimit > 0 ? `<span class="ml-2"><i class="icon-check mr-1"></i>${voucher.usageLimit - voucher.usedCount}/${voucher.usageLimit} lượt</span>` : ''}
                                </small>
                            </div>
                            <div class="col-md-3 text-right">
                                ${isDisabled ? 
                                    `<span class="badge badge-secondary">Đã hết</span>` : 
                                    `<button class="btn btn-sm btn-outline-primary" onclick="App.vouchers.apply('${voucher.code}', App.cart.getSubtotal()); window.location.href='gio-hang.html';">
                                        <i class="icon-check mr-1"></i>Áp dụng
                                    </button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            },
        },

    // ================================
    // KHỞI TẠO
    // ================================
    init: function() {
        this.auth.init();
        this.cart.init();
        this.wishlist.init();
        this.orders.init();
        this.reviews.init();
        this.toast.init();

        const voucherParam = this.utils.getUrlParam('voucher');
        if (voucherParam && App.cart.items.length > 0) {
            App.vouchers.apply(voucherParam, App.cart.getSubtotal());
            App.cart.updateUI();
        }

        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        this.setActiveNav();

        if (document.getElementById('checkoutForm') && App.auth.isLoggedIn()) {
            const u = App.auth.currentUser;
            const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
            setVal('name', u.name);
            setVal('email', u.email);
            setVal('phone', u.phone);
            setVal('address', u.address);
        }

        console.log('3TCoffee App Initialized');
    },

    setActiveNav: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'trang-chu.html';
        document.querySelectorAll('.nav-link, .navbar-nav .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'trang-chu.html')) {
                link.classList.add('active');
            }
        });
    },
};

// Bí danh toàn cục để tương thích ngược
App.formatPrice = App.utils.formatPrice.bind(App.utils);
window.updateCartUI = function() { App.cart.updateUI(); };

// Khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});