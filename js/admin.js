
// ================================================

const Admin = {
    currentPage: 'dashboard',
    data: {
        products: [],
        categories: [],
        orders: [],
        customers: [],
        vouchers: [],
        blogs: [],
        banners: [],
        faqs: [],
        reviews: [],
        settings: {},
        contacts: [],
        auditLogs: []
    },

    // ── Init ──────────────────────────────────────
    init() {
        this.loadAll();
        this.bindNav();
        this.render();

        const user = JSON.parse(localStorage.getItem('plei_current_user') || '{}');
        if (!user.email || user.role !== 'admin') {
            window.location.href = 'dang-nhap.html';
            return;
        }
        const nameEl = document.getElementById('adminDisplayName');
        if (nameEl) nameEl.textContent = user.name || user.email;
        if (user.name) {
            const avatarEl = document.querySelector('.avatar-circle');
            if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
        }
        this.log('Truy cập Dashboard');
    },

    // ── Load All Data ────────────────────────────────
    loadAll() {
        this.data.products = DATA.products || [];
        this.data.categories = DATA.categories || [];
        this.data.orders = JSON.parse(localStorage.getItem('plei_orders') || '[]');
        this.data.customers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        this.data.vouchers = DATA.vouchers || [];
        this.data.blogs = DATA.blogs || [];
        this.data.banners = DATA.banners || [];
        this.data.faqs = DATA.faqs || [];
        this.data.reviews = DATA.reviews || [];
        this.data.settings = DATA.settings || {};
        this.data.contacts = JSON.parse(localStorage.getItem('ple_contacts') || '[]');
        this.data.auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    },

    // ── Navigation ────────────────────────────────
    bindNav() {
        document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.goTo(page);
                // Close sidebar on mobile
                document.getElementById('adminSidebar')?.classList.remove('open');
            });
        });
    },

    goTo(page) {
        this.currentPage = page;
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-link[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');

        const titles = {
            dashboard: 'Dashboard',
            products: 'Sản phẩm',
            categories: 'Danh mục',
            orders: 'Đơn hàng',
            customers: 'Khách hàng',
            vouchers: 'Voucher',
            blogs: 'Blog',
            banners: 'Banner',
            faqs: 'FAQ',
            reviews: 'Đánh giá',
            settings: 'Cài đặt',
            audit: 'Audit Log',
            contacts: 'Tin nhắn liên hệ'
        };
        const titleEl = document.getElementById('topbarTitle');
        if (titleEl) titleEl.textContent = titles[page] || page;

        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        this.render();
        this.loadAll();

        // Scroll to top
        document.getElementById('adminContent')?.scrollTo({ top: 0, behavior: 'smooth' });
    },

    render() {
        const c = document.getElementById('adminContent');
        if (!c) return;
        switch (this.currentPage) {
            case 'dashboard': c.innerHTML = this.renderDashboard(); this.animateStats(); break;
            case 'products': c.innerHTML = this.renderProducts(); break;
            case 'categories': c.innerHTML = this.renderCategories(); break;
            case 'orders': c.innerHTML = this.renderOrders(); break;
            case 'customers': c.innerHTML = this.renderCustomers(); break;
            case 'vouchers': c.innerHTML = this.renderVouchers(); break;
            case 'blogs': c.innerHTML = this.renderBlogs(); break;
            case 'banners': c.innerHTML = this.renderBanners(); break;
            case 'faqs': c.innerHTML = this.renderFAQs(); break;
            case 'reviews': c.innerHTML = this.renderReviews(); break;
            case 'settings': c.innerHTML = this.renderSettings(); break;
            case 'audit': c.innerHTML = this.renderAudit(); break;
            case 'contacts': c.innerHTML = this.renderContacts(); break;
            default: c.innerHTML = this.renderDashboard();
        }
    },

    // ── Dashboard ────────────────────────────────
    renderDashboard() {
        const orders = this.data.orders;
        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
        const completedOrders = orders.filter(o => o.status === 'completed');

        const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
        const monthOrders = orders.filter(o => {
            const d = new Date(o.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0);
        const yearRevenue = orders.filter(o => {
            const d = new Date(o.createdAt);
            const now = new Date();
            return d.getFullYear() === now.getFullYear();
        }).reduce((s, o) => s + (o.total || 0), 0);

        const pending = orders.filter(o => o.status === 'pending').length;
        const confirmed = orders.filter(o => o.status === 'confirmed').length;
        const preparing = orders.filter(o => o.status === 'preparing').length;
        const shipping = orders.filter(o => o.status === 'shipping').length;
        const completed = completedOrders.length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;

        const topProducts = {};
        orders.forEach(o => {
            (o.items || []).forEach(item => {
                topProducts[item.name] = (topProducts[item.name] || 0) + item.quantity;
            });
        });
        const topProductsList = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Monthly revenue for mini chart
        const monthlyRevenue = {};
        orders.forEach(o => {
            const d = new Date(o.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (o.total || 0);
        });
        const monthKeys = Object.keys(monthlyRevenue).sort().slice(-6);
        const maxRev = Math.max(...Object.values(monthlyRevenue), 1);

        return `
        <div class="page-section active">
            <!-- Stats -->
            <div class="stat-grid">
                <div class="stat-card animate-in revenue">
                    <div class="stat-info">
                        <div class="stat-value" data-countup="${todayRevenue}">${this.fp(todayRevenue)}</div>
                        <div class="stat-label">Doanh thu hôm nay</div>
                        <span class="stat-trend up">+${todayOrders.length} đơn</span>
                    </div>
                    <div class="stat-icon">💰</div>
                </div>
                <div class="stat-card animate-in orders">
                    <div class="stat-info">
                        <div class="stat-value" data-countup="${monthRevenue}">${this.fp(monthRevenue)}</div>
                        <div class="stat-label">Doanh thu tháng này</div>
                        <span class="stat-trend up">${monthOrders.length} đơn</span>
                    </div>
                    <div class="stat-icon">📊</div>
                </div>
                <div class="stat-card animate-in pending">
                    <div class="stat-info">
                        <div class="stat-value">${orders.length}</div>
                        <div class="stat-label">Tổng đơn hàng</div>
                        <span class="stat-trend ${pending > 0 ? 'down' : 'up'}">${pending} chờ xử lý</span>
                    </div>
                    <div class="stat-icon">📦</div>
                </div>
                <div class="stat-card animate-in customers">
                    <div class="stat-info">
                        <div class="stat-value">${this.data.customers.length}</div>
                        <div class="stat-label">Khách hàng</div>
                        <span class="stat-trend up">${this.data.customers.filter(u => u.role !== 'admin').length} thành viên</span>
                    </div>
                    <div class="stat-icon">👥</div>
                </div>
            </div>

            <div class="chart-grid">
                <!-- Order Status -->
                <div class="admin-card">
                    <div class="card-header">
                        <div>
                            <h3>Tình trạng đơn hàng</h3>
                            <p>Phân bố theo trạng thái</p>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="Admin.goTo('orders')">Xem tất cả →</button>
                    </div>
                    <div class="card-body">
                        <div class="status-row" style="gap:10px; flex-wrap:wrap;">
                            <div style="text-align:center; flex:1; min-width:90px; padding:12px; border-radius:12px; background:#fef3c7; transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size:22px; font-weight:800; color:#92400e;">${pending}</div>
                                <small style="color:#92400e; font-size:11px; font-weight:600;">Chờ xác nhận</small>
                            </div>
                            <div style="text-align:center; flex:1; min-width:90px; padding:12px; border-radius:12px; background:#dbeafe; transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size:22px; font-weight:800; color:#1e40af;">${confirmed}</div>
                                <small style="color:#1e40af; font-size:11px; font-weight:600;">Đã xác nhận</small>
                            </div>
                            <div style="text-align:center; flex:1; min-width:90px; padding:12px; border-radius:12px; background:#ede9fe; transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size:22px; font-weight:800; color:#5b21b6;">${preparing}</div>
                                <small style="color:#5b21b6; font-size:11px; font-weight:600;">Đang chuẩn bị</small>
                            </div>
                            <div style="text-align:center; flex:1; min-width:90px; padding:12px; border-radius:12px; background:#e0e7ff; transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size:22px; font-weight:800; color:#3730a3;">${shipping}</div>
                                <small style="color:#3730a3; font-size:11px; font-weight:600;">Đang giao</small>
                            </div>
                            <div style="text-align:center; flex:1; min-width:90px; padding:12px; border-radius:12px; background:#dcfce7; transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size:22px; font-weight:800; color:#166534;">${completed}</div>
                                <small style="color:#166534; font-size:11px; font-weight:600;">Hoàn thành</small>
                            </div>
                            <div style="text-align:center; flex:1; min-width:90px; padding:12px; border-radius:12px; background:#fee2e2; transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size:22px; font-weight:800; color:#991b1b;">${cancelled}</div>
                                <small style="color:#991b1b; font-size:11px; font-weight:600;">Đã hủy</small>
                            </div>
                        </div>

                        ${monthKeys.length > 0 ? `
                        <div style="margin-top:20px; padding:16px; background:#fafaf8; border-radius:10px;">
                            <div style="font-size:12px; font-weight:600; color:#888; margin-bottom:8px;">📈 DOANH THU 6 THÁNG GẦN NHẤT</div>
                            <div class="mini-chart">
                                ${monthKeys.map(key => {
                                    const rev = monthlyRevenue[key] || 0;
                                    const pct = (rev / maxRev) * 100;
                                    return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
                                        <div style="font-size:10px; color:#888; font-weight:600;">${this.fp(rev)}</div>
                                        <div style="width:100%; height:${Math.max(pct, 4)}px; background:linear-gradient(to top, #6b4423, #8b5a2b); border-radius:4px 4px 0 0; opacity:0.7; transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"></div>
                                        <div style="font-size:9px; color:#aaa;">${key.slice(5)}</div>
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>` : ''}
                    </div>
                </div>

                <!-- Top Products -->
                <div class="admin-card">
                    <div class="card-header">
                        <div>
                            <h3>Top sản phẩm bán chạy</h3>
                            <p>Tính theo số lượng đã bán</p>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="Admin.goTo('products')">Quản lý →</button>
                    </div>
                    <div class="card-body">
                        ${topProductsList.length ? topProductsList.map(([name, qty], i) => `
                            <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0ede8; transition:background 0.15s; cursor:default;"
                                 onmouseover="this.style.background='#fdf8f3'; this.style.paddingLeft='8px'"
                                 onmouseout="this.style.background='transparent'; this.style.paddingLeft='0'">
                                <span style="width:24px; height:24px; border-radius:50%; background:${['#ffd700','#c0c0c0','#cd7f32'][i]||'#e5e0d8'}; color:white; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0;">${i+1}</span>
                                <span style="flex:1; font-size:13px; font-weight:500; color:#333;">${name}</span>
                                <span style="font-size:14px; font-weight:800; color:var(--admin-primary);">${qty} sp</span>
                            </div>
                        `).join('') : `
                        <div class="empty-state" style="padding:30px 10px;">
                            <div style="font-size:36px; margin-bottom:10px;">📦</div>
                            <p style="color:#aaa; font-size:12px;">Chưa có dữ liệu bán hàng</p>
                        </div>`}
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Đơn hàng gần đây</h3>
                        <p>${orders.length} đơn hàng trên hệ thống</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.goTo('orders')">Quản lý đơn hàng →</button>
                </div>
                <div class="table-wrapper">
                    ${orders.length ? `
                    <table class="sortable">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.slice(-10).reverse().map(o => `
                            <tr>
                                <td><strong style="color:var(--admin-primary); cursor:pointer;" onclick="Admin.viewOrder('${o.code || o.id}')">#${o.code || o.id}</strong></td>
                                <td>
                                    <div style="font-weight:500;">${o.customerName || '-'}</div>
                                    <small style="color:#999;">${o.customerPhone || ''}</small>
                                </td>
                                <td><strong style="color:var(--admin-primary);">${this.fp(o.total)}</strong></td>
                                <td>${o.paymentMethod ? this.paymentMethodText(o.paymentMethod) : '-'}</td>
                                <td>${this.orderStatusBadge(o.status)}</td>
                                <td><small style="color:#888;">${this.fd(o.createdAt)}</small></td>
                                <td>
                                    <button class="action-btn view" onclick="Admin.viewOrder('${o.code || o.id}')" title="Xem chi tiết">👁</button>
                                    ${o.status !== 'completed' && o.status !== 'cancelled' ? `<button class="action-btn confirm" onclick="Admin.nextOrderStatus('${o.code || o.id}')" title="Chuyển trạng thái tiếp theo">▶</button>` : ''}
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>` : `
                    <div class="empty-state">
                        <div class="es-icon">📦</div>
                        <h4>Chưa có đơn hàng nào</h4>
                        <p>Đơn hàng sẽ xuất hiện khi khách đặt hàng</p>
                    </div>`}
                </div>
            </div>
        </div>`;
    },

    animateStats() {
        document.querySelectorAll('[data-countup]').forEach(el => {
            const target = parseInt(el.dataset.countup || '0');
            if (target === 0) return;
            const start = 0;
            const duration = 1000;
            const startTime = performance.now();
            const update = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(start + (target - start) * eased);
                el.textContent = this.fp(current);
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        });
    },

    // ── Products ────────────────────────────────
    renderProducts() {
        const products = this.data.products;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý sản phẩm</h3>
                        <p>${products.length} sản phẩm · <strong style="color:var(--admin-primary)">${this.data.categories.length} danh mục</strong></p>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-sm btn-outline" onclick="Admin.exportData('products')">📥 Xuất dữ liệu</button>
                        <button class="btn btn-sm btn-primary" onclick="Admin.showProductModal()">
                            <span style="font-size:16px;">+</span> Thêm sản phẩm
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="filter-bar">
                        <input type="text" class="search-input" id="productSearch" placeholder="Tìm kiếm sản phẩm..." oninput="Admin.filterProducts()">
                        <select class="form-control form-control-sm" style="max-width:200px;" id="productCategoryFilter" onchange="Admin.filterProducts()">
                            <option value="">Tất cả danh mục</option>
                            ${this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <select class="form-control form-control-sm" style="max-width:160px;" id="productStatusFilter" onchange="Admin.filterProducts()">
                            <option value="">Tất cả</option>
                            <option value="featured">Nổi bật</option>
                            <option value="new">Sản phẩm mới</option>
                            <option value="flashsale">Flash Sale</option>
                        </select>
                    </div>
                    <div class="table-wrapper" id="productsTableWrapper">
                        ${this.buildProductsTable(products)}
                    </div>
                </div>
            </div>
        </div>`;
    },

    buildProductsTable(products) {
        if (!products.length) return `
            <div class="empty-state">
                <div class="es-icon">🛍️</div>
                <h4>Không có sản phẩm nào</h4>
                <p>Nhấn "Thêm sản phẩm" để bắt đầu</p>
            </div>`;
        return `<table class="sortable">
            <thead>
                <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá gốc</th>
                    <th>Giá Sale</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => {
                    const discount = p.salePrice && p.price > p.salePrice
                        ? Math.round((1 - p.salePrice / p.price) * 100)
                        : 0;
                    return `
                    <tr>
                        <td>
                            <img src="${(p.images || [])[0] || 'images/placeholder.jpg'}"
                                 alt="${p.name}" class="img-thumb"
                                 onclick="Admin.viewProductImage('${(p.images || [])[0]}')"
                                 onerror="this.src='images/placeholder.jpg'">
                        </td>
                        <td>
                            <strong>${p.name}</strong>
                            <div class="quick-stats">
                                <span class="quick-stat">⭐ ${p.rating || 0} ·</span>
                                <span class="quick-stat">👀 ${p.reviewCount || 0} đánh giá</span>
                            </div>
                        </td>
                        <td><span class="badge badge-inactive">${this.getCategoryName(p.categoryId)}</span></td>
                        <td><s style="color:#999; font-size:12px;">${p.price ? this.fp(p.price) : '-'}</s></td>
                        <td>
                            ${p.salePrice ? `
                                <strong style="color:var(--admin-danger);">${this.fp(p.salePrice)}</strong>
                                <span class="badge" style="background:#fee2e2; color:#991b1b; margin-left:4px;">-${discount}%</span>
                            ` : `<span style="color:#999; font-size:13px;">-</span>`}
                        </td>
                        <td>
                            <span style="font-weight:700; color:${p.stock > 10 ? 'var(--admin-success)' : p.stock > 0 ? 'var(--admin-warning)' : 'var(--admin-danger)'}">${p.stock || 0}</span>
                        </td>
                        <td>
                            ${p.isFeatured ? '<span class="badge badge-pending">Nổi bật</span>' : ''}
                            ${p.isNew ? '<span class="badge badge-confirmed">Mới</span>' : ''}
                            ${p.isFlashSale ? '<span class="badge badge-shipping">Flash Sale</span>' : ''}
                            ${!p.isFeatured && !p.isNew && !p.isFlashSale ? '<span class="badge badge-inactive">Bình thường</span>' : ''}
                        </td>
                        <td>
                            <button class="action-btn view" onclick="Admin.showProductModal('${p.id}')" title="Sửa">✎</button>
                            <button class="action-btn delete" onclick="Admin.deleteProduct('${p.id}')" title="Xóa">🗑</button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>`;
    },

    viewProductImage(url) {
        this.openModal('Hình ảnh sản phẩm',
            `<div style="text-align:center;">
                <img src="${url}" style="max-width:100%; max-height:400px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15);" onerror="this.src='images/placeholder.jpg'">
                <p style="margin-top:12px; font-size:13px; color:#999;">URL: <code style="font-size:12px; color:var(--admin-primary);">${url}</code></p>
            </div>`,
            `<button class="btn btn-outline" onclick="Admin.closeModal()">Đóng</button>`
        );
    },

    filterProducts() {
        const q = document.getElementById('productSearch').value.toLowerCase();
        const cat = document.getElementById('productCategoryFilter').value;
        const status = document.getElementById('productStatusFilter').value;
        const filtered = this.data.products.filter(p => {
            const matchQ = !q || p.name.toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
            const matchCat = !cat || p.categoryId === cat;
            const matchStatus = !status ||
                (status === 'featured' && p.isFeatured) ||
                (status === 'new' && p.isNew) ||
                (status === 'flashsale' && p.isFlashSale);
            return matchQ && matchCat && matchStatus;
        });
        const wrapper = document.getElementById('productsTableWrapper');
        if (wrapper) wrapper.innerHTML = this.buildProductsTable(filtered);
    },

    showProductModal(id) {
        const product = id ? this.data.products.find(p => p.id === id) : {};
        const isNew = !id;
        this.openModal(
            isNew ? '🎉 Thêm sản phẩm mới' : '✏️ Chỉnh sửa sản phẩm',
            `<form id="productForm" onsubmit="event.preventDefault(); Admin.saveProduct('${id || ''}');">
                <div class="form-row">
                    <div class="form-group">
                        <label>Tên sản phẩm *</label>
                        <input class="form-control" id="pf_name" value="${product.name || ''}" required placeholder="VD: Cà phê đen Plei Signature">
                    </div>
                    <div class="form-group">
                        <label>Slug (URL)</label>
                        <input class="form-control" id="pf_slug" value="${product.slug || ''}" placeholder="tu-dong-tao-tu-ten">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Giá gốc (VNĐ) *</label>
                        <input class="form-control" type="number" id="pf_price" value="${product.price || ''}" required placeholder="45000">
                    </div>
                    <div class="form-group">
                        <label>Giá sale (VNĐ)</label>
                        <input class="form-control" type="number" id="pf_salePrice" value="${product.salePrice || ''}" placeholder="39000 (để trống = không giảm giá)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Danh mục *</label>
                        <select class="form-control" id="pf_category">
                            ${this.data.categories.map(c => `<option value="${c.id}" ${product.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tồn kho</label>
                        <input class="form-control" type="number" id="pf_stock" value="${product.stock || 99}" placeholder="99">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>URL Ảnh chính</label>
                        <input class="form-control" id="pf_image" value="${(product.images || [])[0] || ''}" placeholder="images/cf1.jpg">
                    </div>
                    <div class="form-group">
                        <label>Calories (kcal)</label>
                        <input class="form-control" type="number" id="pf_calories" value="${product.calories || 0}" placeholder="80">
                    </div>
                </div>
                <div class="form-group">
                    <label>Mô tả sản phẩm</label>
                    <textarea class="form-control" id="pf_description" placeholder="Mô tả chi tiết về sản phẩm...">${product.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Khối lượng (ml)</label>
                        <input class="form-control" id="pf_volume" value="${product.volume || '350ml'}" placeholder="350ml">
                    </div>
                    <div class="form-group">
                        <label>Thành phần</label>
                        <input class="form-control" id="pf_ingredients" value="${product.ingredients || ''}" placeholder="100% Cà phê Arabica">
                    </div>
                </div>
                <div style="padding:14px; background:#fdf8f3; border-radius:10px; display:flex; gap:20px; flex-wrap:wrap;">
                    <label style="display:flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" id="pf_featured" ${product.isFeatured ? 'checked' : ''}> ⭐ Nổi bật
                    </label>
                    <label style="display:flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" id="pf_new" ${product.isNew ? 'checked' : ''}> ✨ Sản phẩm mới
                    </label>
                    <label style="display:flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" id="pf_flashsale" ${product.isFlashSale ? 'checked' : ''}> ⚡ Flash Sale
                    </label>
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="productForm" class="btn btn-primary">💾 ${isNew ? 'Tạo sản phẩm' : 'Lưu thay đổi'}</button>`
        );
    },

    saveProduct(id) {
        const name = document.getElementById('pf_name').value.trim();
        const price = parseInt(document.getElementById('pf_price').value) || 0;
        if (!name || !price) { this.toast('Vui lòng nhập tên và giá sản phẩm!', 'error'); return; }

        const slug = document.getElementById('pf_slug').value.trim() ||
            name.toLowerCase()
                .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
                .replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
                .replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ỳýỵỷỹ]/g, 'y')
                .replace(/[đ]/g, 'd')
                .replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

        const newProduct = {
            id: id || 'p' + Date.now(),
            name, slug, price,
            salePrice: parseInt(document.getElementById('pf_salePrice').value) || null,
            categoryId: document.getElementById('pf_category').value,
            categoryName: this.getCategoryName(document.getElementById('pf_category').value),
            stock: parseInt(document.getElementById('pf_stock').value) || 0,
            images: [document.getElementById('pf_image').value || 'images/placeholder.jpg'],
            description: document.getElementById('pf_description').value,
            ingredients: document.getElementById('pf_ingredients').value,
            volume: document.getElementById('pf_volume').value || '350ml',
            calories: parseInt(document.getElementById('pf_calories').value) || 0,
            isFeatured: document.getElementById('pf_featured').checked,
            isNew: document.getElementById('pf_new').checked,
            isFlashSale: document.getElementById('pf_flashsale').checked,
            rating: id ? (this.data.products.find(p => p.id === id)?.rating || 4.5) : 4.5,
            reviewCount: id ? (this.data.products.find(p => p.id === id)?.reviewCount || 0) : 0,
            soldCount: id ? (this.data.products.find(p => p.id === id)?.soldCount || 0) : 0,
            createdAt: id ? (this.data.products.find(p => p.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
        };

        if (id) {
            const idx = this.data.products.findIndex(p => p.id === id);
            if (idx >= 0) this.data.products[idx] = newProduct;
            this.log('Cập nhật sản phẩm', name);
        } else {
            this.data.products.unshift(newProduct);
            this.log('Thêm sản phẩm mới', name);
        }

        this.saveData();
        this.closeModal();
        this.toast(id ? '✅ Cập nhật sản phẩm thành công!' : '✅ Thêm sản phẩm mới thành công!', 'success');
        this.goTo('products');
    },

    deleteProduct(id) {
        if (!confirm('⚠️ Bạn có chắc muốn xóa sản phẩm này?\nHành động này không thể hoàn tác.')) return;
        const p = this.data.products.find(x => x.id === id);
        this.data.products = this.data.products.filter(p => p.id !== id);
        this.saveData();
        this.log('Xóa sản phẩm', p?.name || id);
        this.toast('🗑️ Đã xóa sản phẩm!', 'success');
        this.goTo('products');
    },

    // ── Categories ──────────────────────────────
    renderCategories() {
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý danh mục</h3>
                        <p>${this.data.categories.length} danh mục</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.showCategoryModal()">
                        <span style="font-size:16px;">+</span> Thêm danh mục
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead>
                                <tr><th>#</th><th>Tên danh mục</th><th>Slug</th><th>Mô tả</th><th>Sản phẩm</th><th>Thứ tự</th><th>Thao tác</th></tr>
                            </thead>
                            <tbody>
                                ${this.data.categories.map((c, i) => {
                                    const productCount = this.data.products.filter(p => p.categoryId === c.id).length;
                                    return `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:10px;">
                                                <img src="${c.image || 'images/cf1.jpg'}" alt="${c.name}"
                                                     style="width:40px; height:40px; object-fit:cover; border-radius:8px;"
                                                     onerror="this.src='images/cf1.jpg'">
                                                <strong>${c.name}</strong>
                                            </div>
                                        </td>
                                        <td><code style="font-size:11px; background:#f5f3ef; padding:2px 6px; border-radius:4px;">${c.slug}</code></td>
                                        <td><small style="color:#888;">${c.description || '-'}</small></td>
                                        <td><span class="badge badge-inactive">${productCount} sản phẩm</span></td>
                                        <td><strong style="color:var(--admin-primary);">${c.sortOrder || i + 1}</strong></td>
                                        <td>
                                            <button class="action-btn edit" onclick="Admin.showCategoryModal('${c.id}')">✎</button>
                                            <button class="action-btn delete" onclick="Admin.deleteCategory('${c.id}')">🗑</button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    },

    showCategoryModal(id) {
        const cat = id ? this.data.categories.find(c => c.id === id) : {};
        const isNew = !id;
        this.openModal(
            isNew ? '🏷️ Thêm danh mục mới' : '✏️ Chỉnh sửa danh mục',
            `<form id="catForm" onsubmit="event.preventDefault(); Admin.saveCategory('${id || ''}');">
                <div class="form-row">
                    <div class="form-group">
                        <label>Tên danh mục *</label>
                        <input class="form-control" id="cf_name" value="${cat.name || ''}" required placeholder="VD: Cà phê đen">
                    </div>
                    <div class="form-group">
                        <label>Slug (URL)</label>
                        <input class="form-control" id="cf_slug" value="${cat.slug || ''}" placeholder="tu-dong-tao-neu-trong">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Mô tả</label>
                        <input class="form-control" id="cf_desc" value="${cat.description || ''}" placeholder="Mô tả ngắn về danh mục">
                    </div>
                    <div class="form-group">
                        <label>Thứ tự hiển thị</label>
                        <input class="form-control" type="number" id="cf_order" value="${cat.sortOrder || 1}" min="1">
                    </div>
                </div>
                <div class="form-group">
                    <label>URL Ảnh danh mục</label>
                    <input class="form-control" id="cf_image" value="${cat.image || ''}" placeholder="images/cf1.jpg">
                    ${cat.image ? `<img src="${cat.image}" style="margin-top:8px; width:80px; height:60px; object-fit:cover; border-radius:8px;" onerror="this.src='images/cf1.jpg'">` : ''}
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="catForm" class="btn btn-primary">💾 Lưu danh mục</button>`
        );
    },

    saveCategory(id) {
        const name = document.getElementById('cf_name').value.trim();
        if (!name) { this.toast('Vui lòng nhập tên danh mục!', 'error'); return; }
        const slug = document.getElementById('cf_slug').value.trim() ||
            name.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ỳýỵỷỹ]/g, 'y').replace(/[đ]/g, 'd').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

        const newCat = {
            id: id || 'cat' + Date.now(),
            name, slug,
            description: document.getElementById('cf_desc').value,
            sortOrder: parseInt(document.getElementById('cf_order').value) || 1,
            image: document.getElementById('cf_image').value || 'images/cf1.jpg'
        };
        if (id) {
            const idx = this.data.categories.findIndex(c => c.id === id);
            if (idx >= 0) this.data.categories[idx] = newCat;
            this.log('Cập nhật danh mục', name);
        } else {
            this.data.categories.push(newCat);
            this.log('Thêm danh mục mới', name);
        }
        this.saveData();
        this.closeModal();
        this.toast('✅ Lưu danh mục thành công!', 'success');
        this.goTo('categories');
    },

    deleteCategory(id) {
        const cat = this.data.categories.find(x => x.id === id);
        const inUse = this.data.products.filter(p => p.categoryId === id).length;
        if (inUse > 0) {
            this.toast(`⚠️ Danh mục đang có ${inUse} sản phẩm. Hãy xóa hoặc chuyển sản phẩm trước!`, 'warning');
            return;
        }
        if (!confirm(`⚠️ Xóa danh mục "${cat?.name}"?`)) return;
        this.data.categories = this.data.categories.filter(c => c.id !== id);
        this.saveData();
        this.log('Xóa danh mục', cat?.name || id);
        this.toast('🗑️ Đã xóa danh mục!', 'success');
        this.goTo('categories');
    },

    // ── Orders ────────────────────────────────
    renderOrders() {
        const orders = this.data.orders;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Tất cả đơn hàng</h3>
                        <p>
                            ${orders.length} đơn hàng ·
                            <span class="badge badge-pending" style="margin-left:4px;">${orders.filter(o => o.status === 'pending').length} chờ</span>
                            <span class="badge badge-shipping" style="margin-left:4px;">${orders.filter(o => o.status === 'shipping').length} đang giao</span>
                        </p>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <select class="form-control form-control-sm" style="max-width:180px;" id="orderStatusFilter" onchange="Admin.filterOrders()">
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="preparing">Đang chuẩn bị</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                        <button class="btn btn-sm btn-outline" onclick="Admin.exportData('orders')">📥 Xuất CSV</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="filter-bar">
                        <input type="text" class="search-input" id="orderSearch" placeholder="Tìm theo mã đơn, tên, SĐT khách hàng..." oninput="Admin.filterOrders()">
                    </div>
                    <div class="table-wrapper" id="ordersTableWrapper">
                        ${this.buildOrdersTable(orders)}
                    </div>
                </div>
            </div>
        </div>`;
    },

    buildOrdersTable(orders) {
        if (!orders.length) return `
            <div class="empty-state">
                <div class="es-icon">🧾</div>
                <h4>Chưa có đơn hàng nào</h4>
                <p>Đơn hàng sẽ xuất hiện khi khách đặt hàng</p>
            </div>`;
        return `<table class="sortable">
            <thead>
                <tr><th>Mã đơn</th><th>Khách hàng</th><th>Liên hệ</th><th>Địa chỉ</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
                ${orders.slice().reverse().map(o => `
                <tr>
                    <td><strong style="color:var(--admin-primary); cursor:pointer; font-size:13px;" onclick="Admin.viewOrder('${o.code || o.id}')">#${o.code || o.id}</strong></td>
                    <td><strong>${o.customerName || '-'}</strong></td>
                    <td><small>${o.customerPhone || '-'}<br><span style="color:#999;">${o.customerEmail || ''}</span></small></td>
                    <td>
                        <small style="color:#888; max-width:160px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${o.address || ''}">${o.address || '-'}</small>
                    </td>
                    <td><strong style="color:var(--admin-primary);">${this.fp(o.total)}</strong></td>
                    <td>${o.paymentMethod ? this.paymentMethodText(o.paymentMethod) : '-'}</td>
                    <td>${this.orderStatusBadge(o.status)}</td>
                    <td><small style="color:#888;">${this.fd(o.createdAt)}</small></td>
                    <td>
                        <button class="action-btn view" onclick="Admin.viewOrder('${o.code || o.id}')" title="Chi tiết">👁</button>
                        ${o.status !== 'completed' && o.status !== 'cancelled' ? `<button class="action-btn confirm" onclick="Admin.nextOrderStatus('${o.code || o.id}')" title="Chuyển trạng thái tiếp theo">▶</button>` : ''}
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>`;
    },

    filterOrders() {
        const q = document.getElementById('orderSearch').value.toLowerCase();
        const status = document.getElementById('orderStatusFilter')?.value || '';
        const filtered = this.data.orders.filter(o => {
            const matchQ = !q || (o.code || '').toLowerCase().includes(q) ||
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.customerPhone || '').includes(q) || (o.customerEmail || '').includes(q);
            const matchS = !status || o.status === status;
            return matchQ && matchS;
        });
        const wrapper = document.getElementById('ordersTableWrapper');
        if (wrapper) wrapper.innerHTML = this.buildOrdersTable(filtered);
    },

    viewOrder(idOrCode) {
        const o = this.data.orders.find(x => (x.code || x.id) === idOrCode);
        if (!o) { this.toast('Không tìm thấy đơn hàng!', 'error'); return; }

        const nextStatus = { pending: 'confirmed', confirmed: 'preparing', preparing: 'shipping', shipping: 'completed' };
        const nextLabel = { pending: 'Xác nhận đơn hàng', confirmed: 'Bắt đầu chuẩn bị', preparing: 'Bắt đầu giao hàng', shipping: 'Hoàn thành đơn hàng' };
        const next = nextStatus[o.status];
        const statuses = ['pending', 'confirmed', 'preparing', 'shipping', 'completed'];
        const currentIdx = statuses.indexOf(o.status);
        const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', preparing: 'Đang chuẩn bị', shipping: 'Đang giao', completed: 'Hoàn thành' };
        const statusColors = { pending: '#92400e', confirmed: '#1e40af', preparing: '#5b21b6', shipping: '#3730a3', completed: '#166534' };

        this.openModal(
            `🧾 Đơn hàng #${o.code || o.id}`,
            `<div>
                <div class="status-stepper mb-4">
                    ${statuses.map(s => {
                        const stepIdx = statuses.indexOf(s);
                        const cls = stepIdx < currentIdx ? 'done' : stepIdx === currentIdx ? 'current' : 'pending';
                        return `<div class="status-step ${cls}">${statusLabels[s]}</div>`;
                    }).join('')}
                </div>
                <div class="form-row mb-3">
                    <div><label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#888; letter-spacing:0.5px;">Mã đơn</label><div style="font-weight:700; color:var(--admin-primary); font-size:15px;">#${o.code || o.id}</div></div>
                    <div><label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#888; letter-spacing:0.5px;">Ngày đặt</label><div style="color:#555;">${this.fd(o.createdAt)}</div></div>
                </div>
                <div class="form-row mb-3">
                    <div><label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#888; letter-spacing:0.5px;">Khách hàng</label><div style="font-weight:600;">${o.customerName || '-'}</div></div>
                    <div><label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#888; letter-spacing:0.5px;">Điện thoại</label><div>${o.customerPhone || '-'}</div></div>
                </div>
                <div class="mb-3"><label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#888; letter-spacing:0.5px;">Địa chỉ giao hàng</label><div>${o.address || '-'}</div></div>
                ${o.note ? `<div class="mb-3" style="background:#fef9c3; padding:10px 14px; border-radius:8px; border-left:3px solid #f59e0b;"><label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#92400e; letter-spacing:0.5px;">📝 Ghi chú</label><div style="font-size:13px; color:#78350f; margin-top:4px;">${o.note}</div></div>` : ''}
                <div style="margin:16px 0 12px; padding:12px; background:#fafaf8; border-radius:10px;">
                    <div style="font-size:12px; font-weight:700; color:#888; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">📦 Sản phẩm đã đặt</div>
                    <ul class="order-items-list">
                        ${(o.items || []).map(item => `
                        <li>
                            <span class="item-name">${item.name} <small style="background:#f5f3ef; padding:1px 6px; border-radius:4px; color:#888;">×${item.quantity}</small></span>
                            <span class="item-price">${this.fp(item.price * item.quantity)}</span>
                        </li>`).join('')}
                    </ul>
                    <div style="border-top:2px solid var(--admin-border); padding-top:12px; margin-top:4px;">
                        <div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0;"><span>Tạm tính:</span><strong>${this.fp(o.subtotal || o.total)}</strong></div>
                        ${o.discount ? `<div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0; color:var(--admin-success);"><span>Giảm giá:</span><strong>-${this.fp(o.discount)}</strong></div>` : ''}
                        ${o.couponCode ? `<div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0; color:var(--admin-info);"><span>Voucher (${o.couponCode}):</span><strong>-${this.fp(o.discount)}</strong></div>` : ''}
                        <div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0;"><span>Phí vận chuyển:</span><strong>${o.shipping === 0 ? 'Miễn phí' : this.fp(o.shipping || 30000)}</strong></div>
                        <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; padding-top:12px; border-top:1px solid var(--admin-border); margin-top:4px;"><span>💰 Tổng cộng:</span><span style="color:var(--admin-primary);">${this.fp(o.total)}</span></div>
                    </div>
                </div>
                ${o.paymentMethod ? `<div style="padding:12px; background:#fdf8f3; border-radius:8px; font-size:13px;"><strong>Thanh toán:</strong> ${this.paymentMethodText(o.paymentMethod)} · <strong>Trạng thái:</strong> <span style="color:${statusColors[o.status]}; font-weight:700;">${statusLabels[o.status]}</span></div>` : ''}
            </div>`,
            next
                ? `<button class="btn btn-outline" onclick="Admin.closeModal()">Đóng</button><button class="btn btn-success" onclick="Admin.updateOrderStatus('${o.code || o.id}','${next}')">▶ ${nextLabel[o.status]}</button>`
                : `<button class="btn btn-outline" onclick="Admin.closeModal()">Đóng</button>${o.status === 'pending' ? `<button class="btn btn-danger" onclick="Admin.updateOrderStatus('${o.code || o.id}','cancelled')">❌ Hủy đơn</button>` : ''}`
        );
    },

    updateOrderStatus(idOrCode, status) {
        const idx = this.data.orders.findIndex(o => (o.code || o.id) === idOrCode);
        if (idx < 0) { this.toast('Không tìm thấy đơn!', 'error'); return; }
        const o = this.data.orders[idx];
        const oldStatus = o.status;
        this.data.orders[idx].status = status;
        this.data.orders[idx].updatedAt = new Date().toISOString();
        this.saveData();
        this.log(`Cập nhật đơn hàng #${idOrCode}`, `${oldStatus} → ${status}`);
        this.closeModal();
        this.toast(`✅ Trạng thái đơn #${idOrCode} đã cập nhật!`, 'success');
        this.goTo('orders');
    },

    nextOrderStatus(idOrCode) {
        const o = this.data.orders.find(x => (x.code || x.id) === idOrCode);
        if (!o) return;
        const next = { pending: 'confirmed', confirmed: 'preparing', preparing: 'shipping', shipping: 'completed' }[o.status];
        if (next) this.updateOrderStatus(idOrCode, next);
    },

    // ── Customers ────────────────────────────
    renderCustomers() {
        const customers = this.data.customers;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý khách hàng</h3>
                        <p>${customers.length} tài khoản đã đăng ký</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.showCustomerModal()">
                        <span style="font-size:16px;">+</span> Thêm khách hàng
                    </button>
                </div>
                <div class="card-body">
                    <div class="filter-bar">
                        <input type="text" class="search-input" id="customerSearch" placeholder="Tìm theo tên, email, SĐT..." oninput="Admin.filterCustomers()">
                        <select class="form-control form-control-sm" style="max-width:160px;" id="customerRoleFilter" onchange="Admin.filterCustomers()">
                            <option value="">Tất cả vai trò</option>
                            <option value="admin">Admin</option>
                            <option value="customer">Khách hàng</option>
                        </select>
                    </div>
                    <div class="table-wrapper" id="customersTableWrapper">
                        ${this.buildCustomersTable(customers)}
                    </div>
                </div>
            </div>
        </div>`;
    },

    buildCustomersTable(customers) {
        if (!customers.length) return `<div class="empty-state"><div class="es-icon">👥</div><h4>Chưa có khách hàng nào</h4></div>`;
        return `<table class="sortable">
            <thead><tr><th>Khách hàng</th><th>Email</th><th>SĐT</th><th>Địa chỉ</th><th>Vai trò</th><th>Điểm</th><th>Ngày đăng ký</th><th>Thao tác</th></tr></thead>
            <tbody>${customers.map(c => `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light)); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:14px;">${(c.name || 'U').charAt(0).toUpperCase()}</div>
                            <strong>${c.name || '-'}</strong>
                        </div>
                    </td>
                    <td><small style="color:#555;">${c.email || '-'}</small></td>
                    <td>${c.phone || '-'}</td>
                    <td><small style="color:#888; max-width:160px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.address || '-'}</small></td>
                    <td>${c.role === 'admin' ? '<span class="badge badge-cancelled">Admin</span>' : '<span class="badge badge-active">Khách hàng</span>'}</td>
                    <td><strong style="color:var(--admin-warning);">⭐ ${c.loyaltyPoints || 0}</strong></td>
                    <td><small style="color:#888;">${this.fd(c.createdAt)}</small></td>
                    <td>
                        <button class="action-btn edit" onclick="Admin.showCustomerModal('${c.id}')">✎</button>
                        ${c.role !== 'admin' ? `<button class="action-btn delete" onclick="Admin.deleteCustomer('${c.id}')">🗑</button>` : ''}
                    </td>
                </tr>`).join('')}</tbody>
        </table>`;
    },

    filterCustomers() {
        const q = document.getElementById('customerSearch').value.toLowerCase();
        const role = document.getElementById('customerRoleFilter')?.value || '';
        const filtered = this.data.customers.filter(c => {
            const matchQ = !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
            const matchR = !role || c.role === role;
            return matchQ && matchR;
        });
        const wrapper = document.getElementById('customersTableWrapper');
        if (wrapper) wrapper.innerHTML = this.buildCustomersTable(filtered);
    },

    showCustomerModal(id) {
        const c = id ? this.data.customers.find(x => x.id === id) : {};
        const isNew = !id;
        this.openModal(
            isNew ? '👤 Thêm khách hàng mới' : '✏️ Chỉnh sửa khách hàng',
            `<form id="custForm" onsubmit="event.preventDefault(); Admin.saveCustomer('${id || ''}');">
                <div class="form-row">
                    <div class="form-group">
                        <label>Họ tên *</label>
                        <input class="form-control" id="cu_name" value="${c.name || ''}" required placeholder="Nguyễn Văn A">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input class="form-control" type="email" id="cu_email" value="${c.email || ''}" ${isNew ? 'required' : 'readonly'} style="${isNew ? '' : 'background:#f5f3ef;'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Số điện thoại</label>
                        <input class="form-control" id="cu_phone" value="${c.phone || ''}" placeholder="0373 189 077">
                    </div>
                    <div class="form-group">
                        <label>Địa chỉ</label>
                        <input class="form-control" id="cu_address" value="${c.address || ''}" placeholder="Địa chỉ giao hàng">
                    </div>
                </div>
                ${isNew ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>Mật khẩu *</label>
                        <input class="form-control" type="password" id="cu_pass" value="" placeholder="••••••••" required>
                    </div>
                    <div class="form-group">
                        <label>Xác nhận mật khẩu *</label>
                        <input class="form-control" type="password" id="cu_pass2" value="" placeholder="••••••••" required>
                    </div>
                </div>` : ''}
                <div class="form-row">
                    <div class="form-group">
                        <label>Vai trò</label>
                        <select class="form-control" id="cu_role">
                            <option value="customer" ${(c.role || 'customer') === 'customer' ? 'selected' : ''}>Khách hàng</option>
                            <option value="admin" ${c.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Điểm tích lũy</label>
                        <input class="form-control" type="number" id="cu_points" value="${c.loyaltyPoints || 0}" min="0">
                    </div>
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="custForm" class="btn btn-primary">💾 Lưu khách hàng</button>`
        );
    },

    saveCustomer(id) {
        const name = document.getElementById('cu_name').value.trim();
        const email = document.getElementById('cu_email').value.trim();
        if (!name || !email) { this.toast('Vui lòng nhập đầy đủ thông tin!', 'error'); return; }
        const user = {
            id: id || 'u' + Date.now(),
            name, email,
            phone: document.getElementById('cu_phone').value,
            address: document.getElementById('cu_address').value,
            role: document.getElementById('cu_role').value,
            loyaltyPoints: parseInt(document.getElementById('cu_points').value) || 0,
            createdAt: id ? (this.data.customers.find(x => x.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
        };
        if (!id) {
            const pass = document.getElementById('cu_pass').value;
            const pass2 = document.getElementById('cu_pass2').value;
            if (!pass || pass !== pass2) { this.toast('Mật khẩu không khớp!', 'error'); return; }
            if (this.data.customers.find(x => x.email === email)) { this.toast('Email đã tồn tại trong hệ thống!', 'error'); return; }
            user.passwordHash = btoa(pass);
        }
        if (id) {
            const idx = this.data.customers.findIndex(x => x.id === id);
            if (idx >= 0) this.data.customers[idx] = { ...this.data.customers[idx], ...user };
            this.log('Cập nhật khách hàng', name);
        } else {
            this.data.customers.push(user);
            this.log('Thêm khách hàng mới', name);
        }
        this.saveData();
        this.closeModal();
        this.toast('✅ Lưu khách hàng thành công!', 'success');
        this.goTo('customers');
    },

    deleteCustomer(id) {
        if (!confirm('⚠️ Bạn có chắc muốn xóa khách hàng này?')) return;
        this.data.customers = this.data.customers.filter(c => c.id !== id);
        this.saveData();
        this.toast('🗑️ Đã xóa khách hàng!', 'success');
        this.goTo('customers');
    },

    // ── Vouchers ──────────────────────────────
    renderVouchers() {
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý Voucher</h3>
                        <p>${this.data.vouchers.length} voucher · ${this.data.vouchers.filter(v => v.active !== false).length} đang hoạt động</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.showVoucherModal()">
                        <span style="font-size:16px;">+</span> Thêm voucher
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>Mã</th><th>Loại</th><th>Giá trị</th><th>Đơn tối thiểu</th><th>Giảm tối đa</th><th>Đã dùng</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                            <tbody>${this.data.vouchers.map(v => `
                                <tr>
                                    <td><strong style="color:var(--admin-primary); font-size:14px;">${v.code}</strong></td>
                                    <td>${this.voucherTypeText(v.type)}</td>
                                    <td><strong style="color:var(--admin-success);">${v.type === 'percent' ? v.value + '%' : this.fp(v.value)}</strong></td>
                                    <td><small>${v.minOrder ? 'Từ ' + this.fp(v.minOrder) : '-'}</small></td>
                                    <td><small>${v.maxDiscount ? this.fp(v.maxDiscount) : '-'}</small></td>
                                    <td>${v.usedCount || 0}</td>
                                    <td><small style="color:${v.expiresAt && new Date(v.expiresAt) < new Date() ? 'var(--admin-danger)' : '#888'};">${v.expiresAt ? this.fd(v.expiresAt) : 'Không giới hạn'}</small></td>
                                    <td>${v.active !== false ? '<span class="badge badge-active">Hoạt động</span>' : '<span class="badge badge-inactive">Tắt</span>'}</td>
                                    <td>
                                        <button class="action-btn edit" onclick="Admin.showVoucherModal('${v.code}')">✎</button>
                                        <button class="action-btn delete" onclick="Admin.deleteVoucher('${v.code}')">🗑</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    },

    showVoucherModal(code) {
        const v = code ? this.data.vouchers.find(x => x.code === code) : {};
        const isNew = !code;
        this.openModal(
            isNew ? '🎟️ Thêm Voucher mới' : '✏️ Chỉnh sửa Voucher',
            `<form id="voucherForm" onsubmit="event.preventDefault(); Admin.saveVoucher('${code || ''}');">
                <div class="form-row">
                    <div class="form-group">
                        <label>Mã voucher *</label>
                        <input class="form-control" id="vc_code" value="${v.code || ''}" ${isNew ? 'required' : 'readonly'} style="${isNew ? '' : 'background:#f5f3ef;'}" placeholder="VD: PLEI30">
                    </div>
                    <div class="form-group">
                        <label>Loại giảm giá</label>
                        <select class="form-control" id="vc_type">
                            <option value="percent" ${v.type === 'percent' ? 'selected' : ''}>Phần trăm (%)</option>
                            <option value="fixed" ${v.type === 'fixed' ? 'selected' : ''}>Số tiền cố định (VNĐ)</option>
                            <option value="freeshipping" ${v.type === 'freeshipping' ? 'selected' : ''}>Miễn phí vận chuyển</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Giá trị giảm *</label>
                        <input class="form-control" type="number" id="vc_value" value="${v.value || 0}" required placeholder="30">
                    </div>
                    <div class="form-group">
                        <label>Giảm tối đa (VNĐ)</label>
                        <input class="form-control" type="number" id="vc_max" value="${v.maxDiscount || ''}" placeholder="50000 (0 = không giới hạn)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Đơn hàng tối thiểu (VNĐ)</label>
                        <input class="form-control" type="number" id="vc_min" value="${v.minOrder || ''}" placeholder="100000">
                    </div>
                    <div class="form-group">
                        <label>Số lần sử dụng tối đa</label>
                        <input class="form-control" type="number" id="vc_limit" value="${v.usageLimit || ''}" placeholder="0 = không giới hạn">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ngày hết hạn</label>
                        <input class="form-control" type="date" id="vc_expires" value="${v.expiresAt ? v.expiresAt.split('T')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select class="form-control" id="vc_active">
                            <option value="true" ${v.active !== false ? 'selected' : ''}>Hoạt động</option>
                            <option value="false" ${v.active === false ? 'selected' : ''}>Tắt</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Mô tả voucher</label>
                    <input class="form-control" id="vc_desc" value="${v.description || ''}" placeholder="VD: Giảm 30% cho đơn từ 100K">
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="voucherForm" class="btn btn-primary">💾 Lưu voucher</button>`
        );
    },

    saveVoucher(code) {
        const newV = {
            code: document.getElementById('vc_code').value.trim().toUpperCase(),
            type: document.getElementById('vc_type').value,
            value: parseInt(document.getElementById('vc_value').value) || 0,
            maxDiscount: parseInt(document.getElementById('vc_max').value) || 0,
            minOrder: parseInt(document.getElementById('vc_min').value) || 0,
            usageLimit: parseInt(document.getElementById('vc_limit').value) || 0,
            expiresAt: document.getElementById('vc_expires').value ? document.getElementById('vc_expires').value + 'T23:59:59.000Z' : '',
            active: document.getElementById('vc_active').value === 'true',
            description: document.getElementById('vc_desc').value,
            usedCount: code ? (this.data.vouchers.find(x => x.code === code)?.usedCount || 0) : 0
        };
        if (!newV.code || !newV.value) { this.toast('Mã và giá trị voucher là bắt buộc!', 'error'); return; }

        if (code) {
            const idx = this.data.vouchers.findIndex(x => x.code === code);
            if (idx >= 0) this.data.vouchers[idx] = newV;
            this.log('Cập nhật voucher', code);
        } else {
            if (this.data.vouchers.find(x => x.code === newV.code)) { this.toast('Mã voucher đã tồn tại!', 'error'); return; }
            this.data.vouchers.unshift(newV);
            this.log('Thêm voucher mới', code);
        }
        this.saveData();
        this.closeModal();
        this.toast('✅ Lưu voucher thành công!', 'success');
        this.goTo('vouchers');
    },

    deleteVoucher(code) {
        if (!confirm(`⚠️ Xóa voucher "${code}"?`)) return;
        this.data.vouchers = this.data.vouchers.filter(v => v.code !== code);
        this.saveData();
        this.toast('🗑️ Đã xóa voucher!', 'success');
        this.goTo('vouchers');
    },

    // ── Blogs ─────────────────────────────────
    renderBlogs() {
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý Blog</h3>
                        <p>${this.data.blogs.length} bài viết</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.showBlogModal()">
                        <span style="font-size:16px;">+</span> Viết bài mới
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>Ảnh bìa</th><th>Tiêu đề</th><th>Slug</th><th>Tác giả</th><th>Ngày đăng</th><th>Thao tác</th></tr></thead>
                            <tbody>${this.data.blogs.map(b => `
                                <tr>
                                    <td><img src="${b.image || ''}" alt="" style="width:72px; height:48px; object-fit:cover; border-radius:8px;" onerror="this.src='images/cf1.jpg'"></td>
                                    <td><strong>${b.title}</strong></td>
                                    <td><code style="font-size:11px; background:#f5f3ef; padding:2px 6px; border-radius:4px;">${b.slug}</code></td>
                                    <td>${b.author || 'Admin'}</td>
                                    <td><small style="color:#888;">${this.fd(b.createdAt)}</small></td>
                                    <td>
                                        <button class="action-btn view" onclick="Admin.viewBlog('${b.id}')">👁</button>
                                        <button class="action-btn edit" onclick="Admin.showBlogModal('${b.id}')">✎</button>
                                        <button class="action-btn delete" onclick="Admin.deleteBlog('${b.id}')">🗑</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    },

    viewBlog(id) {
        const b = this.data.blogs.find(x => x.id === id);
        if (!b) return;
        this.openModal(b.title,
            `<div>
                <img src="${b.image || ''}" style="width:100%; max-height:250px; object-fit:cover; border-radius:10px; margin-bottom:16px;" onerror="this.src='images/cf1.jpg'">
                <p style="font-size:12px; color:#888; margin-bottom:12px;">👤 ${b.author || 'Admin'} · ${this.fd(b.createdAt)}</p>
                <div style="line-height:1.8; color:#555; font-size:14px;">${b.content || '<i style="color:#999;">Nội dung bài viết...</i>'}</div>
            </div>`,
            `<button class="btn btn-outline" onclick="Admin.closeModal()">Đóng</button>
             <button class="btn btn-primary" onclick="Admin.closeModal(); Admin.showBlogModal('${id}')">✏️ Sửa bài viết</button>`
        );
    },

    showBlogModal(id) {
        const b = id ? this.data.blogs.find(x => x.id === id) : {};
        const isNew = !id;
        this.openModal(
            isNew ? '📝 Viết bài blog mới' : '✏️ Chỉnh sửa blog',
            `<form id="blogForm" onsubmit="event.preventDefault(); Admin.saveBlog('${id || ''}');">
                <div class="form-group">
                    <label>Tiêu đề bài viết *</label>
                    <input class="form-control" id="bl_title" value="${b.title || ''}" required placeholder="Nhập tiêu đề bài viết...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Slug (URL)</label>
                        <input class="form-control" id="bl_slug" value="${b.slug || ''}" placeholder="tu-dong-tao-neu-trong">
                    </div>
                    <div class="form-group">
                        <label>Tác giả</label>
                        <input class="form-control" id="bl_author" value="${b.author || 'Admin'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>URL Ảnh bìa</label>
                        <input class="form-control" id="bl_image" value="${b.image || ''}" placeholder="images/cf1.jpg">
                    </div>
                    <div class="form-group">
                        <label>Ngày đăng</label>
                        <input class="form-control" type="date" id="bl_date" value="${b.createdAt ? b.createdAt.split('T')[0] : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Nội dung bài viết</label>
                    <textarea class="form-control" id="bl_content" style="min-height:250px;" placeholder="Viết nội dung bài viết tại đây...">${b.content || ''}</textarea>
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="blogForm" class="btn btn-primary">💾 ${isNew ? 'Đăng bài viết' : 'Lưu bài viết'}</button>`
        );
    },

    saveBlog(id) {
        const title = document.getElementById('bl_title').value.trim();
        if (!title) { this.toast('Tiêu đề là bắt buộc!', 'error'); return; }
        const slug = document.getElementById('bl_slug').value.trim() ||
            title.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ỳýỵỷỹ]/g, 'y').replace(/[đ]/g, 'd').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
        const blog = {
            id: id || 'b' + Date.now(),
            title, slug,
            image: document.getElementById('bl_image').value || 'images/cf1.jpg',
            content: document.getElementById('bl_content').value,
            author: document.getElementById('bl_author').value || 'Admin',
            createdAt: id ? (this.data.blogs.find(x => x.id === id)?.createdAt || new Date().toISOString()) :
                (document.getElementById('bl_date').value ? document.getElementById('bl_date').value + 'T00:00:00.000Z' : new Date().toISOString())
        };
        if (id) {
            const idx = this.data.blogs.findIndex(x => x.id === id);
            if (idx >= 0) this.data.blogs[idx] = blog;
            this.log('Cập nhật bài viết blog', title);
        } else {
            this.data.blogs.unshift(blog);
            this.log('Viết bài blog mới', title);
        }
        this.saveData();
        this.closeModal();
        this.toast('✅ Lưu bài viết thành công!', 'success');
        this.goTo('blogs');
    },

    deleteBlog(id) {
        if (!confirm('⚠️ Xóa bài viết này?')) return;
        this.data.blogs = this.data.blogs.filter(b => b.id !== id);
        this.saveData();
        this.toast('🗑️ Đã xóa bài viết!', 'success');
        this.goTo('blogs');
    },

    // ── Banners ───────────────────────────────
    renderBanners() {
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý Banner</h3>
                        <p>${this.data.banners.length} banner · ${this.data.banners.filter(b => b.active !== false).length} đang hiển thị</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.showBannerModal()">
                        <span style="font-size:16px;">+</span> Thêm banner
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Link</th><th>Thứ tự</th><th>Hiển thị</th><th>Thao tác</th></tr></thead>
                            <tbody>${this.data.banners.map(b => `
                                <tr>
                                    <td><img src="${b.image || ''}" alt="" style="width:100px; height:60px; object-fit:cover; border-radius:8px;" onerror="this.src='images/placeholder.jpg'"></td>
                                    <td><strong>${b.title || '-'}</strong></td>
                                    <td><small style="color:var(--admin-info);">${b.link ? `<a href="${b.link}" target="_blank">${b.link.substring(0,30)}...</a>` : '-'}</small></td>
                                    <td><strong style="color:var(--admin-primary);">${b.sortOrder || 0}</strong></td>
                                    <td>${b.active !== false ? '<span class="badge badge-active">Hiện</span>' : '<span class="badge badge-inactive">Ẩn</span>'}</td>
                                    <td>
                                        <button class="action-btn edit" onclick="Admin.showBannerModal('${b.id}')">✎</button>
                                        <button class="action-btn delete" onclick="Admin.deleteBanner('${b.id}')">🗑</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    },

    showBannerModal(id) {
        const b = id ? this.data.banners.find(x => x.id === id) : {};
        const isNew = !id;
        this.openModal(
            isNew ? '🖼️ Thêm Banner mới' : '✏️ Chỉnh sửa Banner',
            `<form id="bannerForm" onsubmit="event.preventDefault(); Admin.saveBanner('${id || ''}');">
                <div class="form-group">
                    <label>Tiêu đề banner</label>
                    <input class="form-control" id="bn_title" value="${b.title || ''}" placeholder="VD: Khuyến mãi mùa hè">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>URL Ảnh banner *</label>
                        <input class="form-control" id="bn_image" value="${b.image || ''}" required placeholder="images/banner1.jpg">
                    </div>
                    <div class="form-group">
                        <label>Link khi click</label>
                        <input class="form-control" id="bn_link" value="${b.link || ''}" placeholder="https://... hoặc san-pham.html">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Thứ tự hiển thị</label>
                        <input class="form-control" type="number" id="bn_order" value="${b.sortOrder || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select class="form-control" id="bn_active">
                            <option value="true" ${b.active !== false ? 'selected' : ''}>Hiển thị</option>
                            <option value="false" ${b.active === false ? 'selected' : ''}>Ẩn</option>
                        </select>
                    </div>
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="bannerForm" class="btn btn-primary">💾 Lưu banner</button>`
        );
    },

    saveBanner(id) {
        const image = document.getElementById('bn_image').value.trim();
        if (!image) { this.toast('URL ảnh là bắt buộc!', 'error'); return; }
        const banner = {
            id: id || 'bn' + Date.now(),
            title: document.getElementById('bn_title').value,
            image, link: document.getElementById('bn_link').value,
            sortOrder: parseInt(document.getElementById('bn_order').value) || 0,
            active: document.getElementById('bn_active').value === 'true'
        };
        if (id) {
            const idx = this.data.banners.findIndex(x => x.id === id);
            if (idx >= 0) this.data.banners[idx] = banner;
        } else {
            this.data.banners.push(banner);
        }
        this.saveData();
        this.closeModal();
        this.toast('✅ Lưu banner thành công!', 'success');
        this.goTo('banners');
    },

    deleteBanner(id) {
        if (!confirm('⚠️ Xóa banner này?')) return;
        this.data.banners = this.data.banners.filter(b => b.id !== id);
        this.saveData();
        this.toast('🗑️ Đã xóa banner!', 'success');
        this.goTo('banners');
    },

    // ── FAQs ────────────────────────────────
    renderFAQs() {
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Quản lý FAQ</h3>
                        <p>${this.data.faqs.length} câu hỏi thường gặp</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="Admin.showFAQModal()">
                        <span style="font-size:16px;">+</span> Thêm câu hỏi
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>#</th><th>Câu hỏi</th><th>Câu trả lời</th><th>Thứ tự</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                            <tbody>${this.data.faqs.map((f, i) => `
                                <tr>
                                    <td><strong style="color:var(--admin-primary);">${i + 1}</strong></td>
                                    <td><strong>${f.question}</strong></td>
                                    <td><small style="color:#666; max-width:300px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${(f.answer || '').substring(0, 80)}${f.answer?.length > 80 ? '...' : ''}</small></td>
                                    <td>${f.sortOrder || 0}</td>
                                    <td>${f.active !== false ? '<span class="badge badge-active">Hiện</span>' : '<span class="badge badge-inactive">Ẩn</span>'}</td>
                                    <td>
                                        <button class="action-btn edit" onclick="Admin.showFAQModal('${f.id}')">✎</button>
                                        <button class="action-btn delete" onclick="Admin.deleteFAQ('${f.id}')">🗑</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    },

    showFAQModal(id) {
        const f = id ? this.data.faqs.find(x => x.id === id) : {};
        const isNew = !id;
        this.openModal(
            isNew ? '❓ Thêm câu hỏi FAQ' : '✏️ Chỉnh sửa FAQ',
            `<form id="faqForm" onsubmit="event.preventDefault(); Admin.saveFAQ('${id || ''}');">
                <div class="form-group">
                    <label>Câu hỏi *</label>
                    <input class="form-control" id="fq_question" value="${f.question || ''}" required placeholder="VD: 3TCoffee có giao hàng không?">
                </div>
                <div class="form-group">
                    <label>Câu trả lời *</label>
                    <textarea class="form-control" id="fq_answer" style="min-height:140px;" required placeholder="Nhập câu trả lời...">${f.answer || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Thứ tự hiển thị</label>
                        <input class="form-control" type="number" id="fq_order" value="${f.sortOrder || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select class="form-control" id="fq_active">
                            <option value="true" ${f.active !== false ? 'selected' : ''}>Hiển thị</option>
                            <option value="false" ${f.active === false ? 'selected' : ''}>Ẩn</option>
                        </select>
                    </div>
                </div>
            </form>`,
            `<button type="button" class="btn btn-outline" onclick="Admin.closeModal()">Hủy bỏ</button>
             <button type="submit" form="faqForm" class="btn btn-primary">💾 Lưu FAQ</button>`
        );
    },

    saveFAQ(id) {
        const question = document.getElementById('fq_question').value.trim();
        const answer = document.getElementById('fq_answer').value.trim();
        if (!question || !answer) { this.toast('Câu hỏi và câu trả lời là bắt buộc!', 'error'); return; }
        const faq = {
            id: id || 'faq' + Date.now(),
            question, answer,
            sortOrder: parseInt(document.getElementById('fq_order').value) || 0,
            active: document.getElementById('fq_active').value === 'true'
        };
        if (id) {
            const idx = this.data.faqs.findIndex(x => x.id === id);
            if (idx >= 0) this.data.faqs[idx] = faq;
        } else {
            this.data.faqs.push(faq);
        }
        this.saveData();
        this.closeModal();
        this.toast('✅ Lưu FAQ thành công!', 'success');
        this.goTo('faqs');
    },

    deleteFAQ(id) {
        if (!confirm('⚠️ Xóa câu hỏi này?')) return;
        this.data.faqs = this.data.faqs.filter(f => f.id !== id);
        this.saveData();
        this.toast('🗑️ Đã xóa FAQ!', 'success');
        this.goTo('faqs');
    },

    // ── Reviews ────────────────────────────────
    renderReviews() {
        const reviews = this.data.reviews;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Đánh giá sản phẩm</h3>
                        <p>${reviews.length} đánh giá từ khách hàng</p>
                    </div>
                </div>
                <div class="card-body">
                    ${reviews.length ? `
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>#</th><th>Khách hàng</th><th>Sản phẩm</th><th>Rating</th><th>Bình luận</th><th>Ngày</th><th>Thao tác</th></tr></thead>
                            <tbody>${reviews.map((r, i) => `
                                <tr>
                                    <td><strong style="color:var(--admin-primary);">${i + 1}</strong></td>
                                    <td><strong>${r.customerName || 'Khách ẩn danh'}</strong></td>
                                    <td><small>${this.getProductName(r.productId)}</small></td>
                                    <td>
                                        <div style="color:#f59e0b; font-size:14px;">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
                                    </td>
                                    <td><small style="color:#666;">${(r.comment || '').substring(0, 60)}${r.comment?.length > 60 ? '...' : ''}</small></td>
                                    <td><small style="color:#888;">${this.fd(r.createdAt)}</small></td>
                                    <td>
                                        <button class="action-btn view" onclick="Admin.viewReview('${r.id}')">👁</button>
                                        <button class="action-btn delete" onclick="Admin.deleteReview('${r.id}')">🗑</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>` : `
                    <div class="empty-state">
                        <div class="es-icon">⭐</div>
                        <h4>Chưa có đánh giá nào</h4>
                        <p>Đánh giá sẽ xuất hiện khi khách hàng đánh giá sản phẩm</p>
                    </div>`}
                </div>
            </div>
        </div>`;
    },

    viewReview(id) {
        const r = this.data.reviews.find(x => x.id === id);
        if (!r) return;
        this.openModal(`⭐ Đánh giá - ${r.customerName || 'Khách ẩn danh'}`,
            `<div>
                <p style="margin-bottom:12px;"><strong>Sản phẩm:</strong> ${this.getProductName(r.productId)}</p>
                <p style="margin-bottom:12px;"><strong>Khách hàng:</strong> ${r.customerName || 'Khách ẩn danh'}</p>
                <p style="margin-bottom:12px;"><strong>Rating:</strong> <span style="color:#f59e0b; font-size:16px;">${'★'.repeat(r.rating || 5)}</span></p>
                <p style="margin-bottom:12px;"><strong>Ngày:</strong> ${this.fd(r.createdAt)}</p>
                <div style="padding:14px; background:#fdf8f3; border-radius:10px; line-height:1.7;">
                    <strong>Bình luận:</strong><br>${r.comment || '<i style="color:#999;">Không có bình luận</i>'}
                </div>
            </div>`,
            `<button class="btn btn-outline" onclick="Admin.closeModal()">Đóng</button>
             <button class="btn btn-danger" onclick="Admin.deleteReview('${id}'); Admin.closeModal();">🗑️ Xóa đánh giá</button>`
        );
    },

    deleteReview(id) {
        if (!confirm('⚠️ Xóa đánh giá này?')) return;
        this.data.reviews = this.data.reviews.filter(r => r.id !== id);
        this.saveData();
        this.toast('🗑️ Đã xóa đánh giá!', 'success');
        this.goTo('reviews');
    },

    // ── Settings ────────────────────────────────
    renderSettings() {
        const s = this.data.settings;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Cài đặt hệ thống</h3>
                        <p>Thông tin cấu hình website 3T Coffee</p>
                    </div>
                </div>
                <div class="card-body">
                    <form id="settingsForm" onsubmit="Admin.saveSettings(event)">
                        <div class="settings-section">
                            <h4>🏪 Thông tin cửa hàng</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tên website</label>
                                    <input class="form-control" id="st_name" value="${s.siteName || ''}" placeholder="3T Coffee">
                                </div>
                                <div class="form-group">
                                    <label>Email liên hệ</label>
                                    <input class="form-control" type="email" id="st_email" value="${s.siteEmail || ''}" placeholder="contact@3tcafe.vn">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Số điện thoại</label>
                                    <input class="form-control" id="st_phone" value="${s.sitePhone || ''}" placeholder="0373 189 077">
                                </div>
                                <div class="form-group">
                                    <label>Địa chỉ cửa hàng</label>
                                    <input class="form-control" id="st_address" value="${s.siteAddress || ''}" placeholder="Địa chỉ đầy đủ...">
                                </div>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h4>🚚 Giao hàng</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phí giao hàng mặc định (VNĐ)</label>
                                    <input class="form-control" type="number" id="st_ship" value="${s.shippingFee || 30000}" placeholder="30000">
                                </div>
                                <div class="form-group">
                                    <label>Miễn phí ship từ (VNĐ)</label>
                                    <input class="form-control" type="number" id="st_freeship" value="${s.freeShippingMin || 200000}" placeholder="200000">
                                </div>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h4>🏦 Thông tin thanh toán</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Số tài khoản</label>
                                    <input class="form-control" id="st_bank_acc" value="${s.bankAccount || ''}" placeholder="1234567890">
                                </div>
                                <div class="form-group">
                                    <label>Tên ngân hàng</label>
                                    <input class="form-control" id="st_bank_name" value="${s.bankName || ''}" placeholder="Vietcombank">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Tên chủ tài khoản</label>
                                <input class="form-control" id="st_bank_holder" value="${s.bankHolder || ''}" placeholder="NGUYEN VAN A">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="padding:12px 28px; font-size:14px;">💾 Lưu cài đặt</button>
                    </form>
                </div>
            </div>
        </div>`;
    },

    saveSettings(e) {
        e.preventDefault();
        this.data.settings = {
            ...this.data.settings,
            siteName: document.getElementById('st_name').value,
            siteEmail: document.getElementById('st_email').value,
            sitePhone: document.getElementById('st_phone').value,
            siteAddress: document.getElementById('st_address').value,
            shippingFee: parseInt(document.getElementById('st_ship').value) || 30000,
            freeShippingMin: parseInt(document.getElementById('st_freeship').value) || 200000,
            bankAccount: document.getElementById('st_bank_acc').value,
            bankName: document.getElementById('st_bank_name').value,
            bankHolder: document.getElementById('st_bank_holder').value
        };
        // Update DATA for frontend
        DATA.settings = { ...DATA.settings, ...this.data.settings };
        this.saveData();
        this.log('Cập nhật cài đặt hệ thống');
        this.toast('✅ Đã lưu cài đặt thành công!', 'success');
    },

    // ── Audit Log ─────────────────────────────
    renderAudit() {
        const logs = this.data.auditLogs;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Audit Log</h3>
                        <p>${logs.length} hoạt động được ghi nhận</p>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="Admin.exportData('audit')">📥 Xuất CSV</button>
                </div>
                <div class="card-body">
                    ${logs.length ? `
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Chi tiết</th></tr></thead>
                            <tbody>${logs.slice().reverse().map(l => `
                                <tr>
                                    <td><small style="color:#888; font-family:monospace;">${this.fd(l.time)}</small></td>
                                    <td><strong>${l.user || '-'}</strong></td>
                                    <td><span class="badge badge-inactive">${l.action || '-'}</span></td>
                                    <td><small style="color:#666;">${l.detail || '-'}</small></td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>` : `
                    <div class="empty-state">
                        <div class="es-icon">🛡️</div>
                        <h4>Chưa có log nào</h4>
                        <p>Hoạt động sẽ được ghi lại khi có thao tác trên hệ thống</p>
                    </div>`}
                </div>
            </div>
        </div>`;
    },

    // ── Contacts ───────────────────────────────
    renderContacts() {
        const contacts = this.data.contacts;
        const unread = contacts.filter(c => !c.replied).length;
        return `
        <div class="page-section active">
            <div class="admin-card">
                <div class="card-header">
                    <div>
                        <h3>Tin nhắn liên hệ</h3>
                        <p>${contacts.length} tin nhắn · ${unread > 0 ? `<span class="badge badge-pending" style="margin-left:4px;">${unread} chưa đọc</span>` : 'Tất cả đã đọc'}</p>
                    </div>
                </div>
                <div class="card-body">
                    ${contacts.length ? `
                    <div class="table-wrapper">
                        <table class="sortable">
                            <thead><tr><th>Thời gian</th><th>Tên</th><th>Email</th><th>Chủ đề</th><th>Nội dung</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                            <tbody>${contacts.map(c => `
                                <tr style="${!c.replied ? 'background:#fdf8f3;' : ''}">
                                    <td><small style="color:#888;">${this.fd(c.createdAt)}</small></td>
                                    <td><strong>${c.name || '-'}</strong></td>
                                    <td><small>${c.email || '-'}</small></td>
                                    <td><strong>${c.subject || '-'}</strong></td>
                                    <td><small style="color:#666; max-width:200px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.message || ''}">${c.message || '-'}</small></td>
                                    <td>${c.replied ? '<span class="badge badge-completed">Đã trả lời</span>' : '<span class="badge badge-pending">Chưa đọc</span>'}</td>
                                    <td>
                                        <button class="action-btn view" onclick="Admin.viewContact('${c.id}')">👁</button>
                                        <button class="action-btn delete" onclick="Admin.deleteContact('${c.id}')">🗑</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>` : `
                    <div class="empty-state">
                        <div class="es-icon">📧</div>
                        <h4>Chưa có tin nhắn nào</h4>
                        <p>Tin nhắn liên hệ từ khách hàng sẽ xuất hiện tại đây</p>
                    </div>`}
                </div>
            </div>
        </div>`;
    },

    viewContact(id) {
        const c = this.data.contacts.find(x => x.id === id);
        if (!c) return;
        if (!c.replied) {
            c.replied = true;
            this.saveData();
        }
        this.openModal(`📧 Tin nhắn từ ${c.name}`,
            `<div style="line-height:1.8;">
                <div style="padding:12px; background:#fdf8f3; border-radius:10px; margin-bottom:16px;">
                    <p><strong>Từ:</strong> ${c.name} &lt;${c.email}&gt;</p>
                    <p><strong>Chủ đề:</strong> ${c.subject || '-'}</p>
                    <p><strong>Ngày:</strong> ${this.fd(c.createdAt)}</p>
                </div>
                <div style="padding:16px; border:1px solid var(--admin-border); border-radius:10px; font-size:14px; line-height:1.8;">
                    ${c.message || '-'}
                </div>
            </div>`,
            `<button class="btn btn-outline" onclick="Admin.closeModal()">Đóng</button>
             <a href="mailto:${c.email}?subject=Re: ${c.subject || 'Phản hồi từ 3T Coffee'}" class="btn btn-primary">📧 Trả lời qua Email</a>`
        );
    },

    deleteContact(id) {
        if (!confirm('⚠️ Xóa tin nhắn này?')) return;
        this.data.contacts = this.data.contacts.filter(c => c.id !== id);
        this.saveData();
        this.toast('🗑️ Đã xóa tin nhắn!', 'success');
        this.goTo('contacts');
    },

    // ── Modal System ──────────────────────────
    openModal(title, bodyHTML, footerHTML) {
        const overlay = document.getElementById('modalOverlay');
        const box = document.getElementById('modalBox');
        if (!overlay || !box) return;

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHTML;
        document.getElementById('modalFooter').innerHTML = footerHTML;
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    // ── Toast System ──────────────────────────
    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastIn 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // ── Toggle Sidebar ─────────────────────────
    toggleSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        if (sidebar) sidebar.classList.toggle('open');
    },

    // ── Log ───────────────────────────────────
    log(action, detail) {
        const user = JSON.parse(localStorage.getItem('plei_current_user') || '{}');
        const entry = {
            time: new Date().toISOString(),
            user: user.name || user.email || 'System',
            action,
            detail
        };
        this.data.auditLogs.push(entry);
        localStorage.setItem('audit_logs', JSON.stringify(this.data.auditLogs));
    },

    // ── Logout ────────────────────────────────
    logout() {
        if (!confirm('Đăng xuất khỏi hệ thống?')) return;
        localStorage.removeItem('plei_current_user');
        window.location.href = 'dang-nhap.html';
    },

    // ── Export ────────────────────────────────
    exportData(type) {
        let rows = [];
        let filename = '';
        if (type === 'orders') {
            filename = '3t_orders_export.csv';
            rows = [['Mã', 'Khách hàng', 'SĐT', 'Email', 'Địa chỉ', 'Tổng tiền', 'Trạng thái', 'Ngày đặt']];
            this.data.orders.forEach(o => {
                rows.push([o.code || o.id, o.customerName, o.customerPhone, o.customerEmail, o.address, o.total, o.status, o.createdAt]);
            });
        } else if (type === 'products') {
            filename = '3t_products_export.csv';
            rows = [['ID', 'Tên', 'Slug', 'Danh mục', 'Giá', 'Giá Sale', 'Tồn kho', 'Nổi bật', 'Mới', 'Flash Sale']];
            this.data.products.forEach(p => {
                rows.push([p.id, p.name, p.slug, p.categoryName, p.price, p.salePrice, p.stock, p.isFeatured, p.isNew, p.isFlashSale]);
            });
        } else if (type === 'audit') {
            filename = '3t_audit_log.csv';
            rows = [['Thời gian', 'Người dùng', 'Hành động', 'Chi tiết']];
            this.data.auditLogs.forEach(l => {
                rows.push([l.time, l.user, l.action, l.detail]);
            });
        }

        const csv = rows.map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        this.toast(`📥 Đã xuất file ${filename}`, 'success');
    },

    // ── Utilities ─────────────────────────────
    getCategoryName(catId) {
        const c = this.data.categories.find(x => x.id === catId);
        return c ? c.name : (catId || '-');
    },

    getProductName(productId) {
        const p = this.data.products.find(x => x.id === productId);
        return p ? p.name : (productId || '-');
    },

    paymentMethodText(m) {
        return { cod: '💵 COD', bank: '🏦 Chuyển khoản', vnpay: '📱 VNPay', momo: '📱 MoMo' }[m] || m || '-';
    },

    orderStatusBadge(status) {
        const map = {
            pending: '<span class="badge badge-pending">Chờ xác nhận</span>',
            confirmed: '<span class="badge badge-confirmed">Đã xác nhận</span>',
            preparing: '<span class="badge badge-preparing">Đang chuẩn bị</span>',
            shipping: '<span class="badge badge-shipping">Đang giao</span>',
            completed: '<span class="badge badge-completed">Hoàn thành</span>',
            cancelled: '<span class="badge badge-cancelled">Đã hủy</span>',
        };
        return map[status] || `<span class="badge badge-inactive">${status || '-'}</span>`;
    },

    voucherTypeText(type) {
        return { percent: 'Phần trăm (%)', fixed: 'Số tiền cố định', freeshipping: 'Miễn phí ship' }[type] || type || '-';
    },

    fp(n) {
        if (!n && n !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
    },

    fd(dateStr) {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return dateStr; }
    },

    saveData() {
        localStorage.setItem('plei_orders', JSON.stringify(this.data.orders));
        localStorage.setItem('registeredUsers', JSON.stringify(this.data.customers));
        localStorage.setItem('ple_contacts', JSON.stringify(this.data.contacts));
        localStorage.setItem('audit_logs', JSON.stringify(this.data.auditLogs));
        DATA.products = this.data.products;
        DATA.categories = this.data.categories;
        DATA.vouchers = this.data.vouchers;
        DATA.blogs = this.data.blogs;
        DATA.banners = this.data.banners;
        DATA.faqs = this.data.faqs;
        DATA.reviews = this.data.reviews;
        DATA.settings = { ...DATA.settings, ...this.data.settings };
    }
};

// ── Auto-init on load ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();

    // Close modal on overlay click
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Admin.closeModal();
        });
    }

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('adminSidebar');
        const toggle = document.querySelector('.mobile-toggle');
        if (sidebar && sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) && !toggle?.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Keyboard shortcut: ESC to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') Admin.closeModal();
    });
});
