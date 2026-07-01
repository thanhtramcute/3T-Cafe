// ================================
// 3TCoffee - API SERVICE
// ================================
// API Service for communicating with Google Apps Script backend
// Can be switched between mock mode (localStorage) and real API mode

const API = {
    // Configuration
    config: {
        // Set to true to use real API, false for mock data
        useMock: true,
        // Google Apps Script Web App URL (when useMock is false)
        baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
        // Request timeout in ms
        timeout: 10000,
    },

    // Generic request handler
    async request(action, data = {}, method = 'GET') {
        if (this.config.useMock) {
            return this.mockRequest(action, data, method);
        }

        try {
            const params = new URLSearchParams({ action });
            
            if (method === 'GET') {
                Object.keys(data).forEach(key => params.append(key, data[key]));
                const response = await fetch(`${this.config.baseUrl}?${params}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                return await response.json();
            } else {
                const response = await fetch(this.config.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-GAS-Action': action
                    },
                    body: JSON.stringify(data)
                });
                return await response.json();
            }
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Lỗi kết nối: ' + error.message };
        }
    },

    // Mock request handler (for localStorage/demo)
    mockRequest(action, data = {}, method = 'GET') {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = { success: false, message: 'Unknown action' };

                switch (action) {
                    // Products
                    case 'products':
                        result = { success: true, data: DATA.products };
                        break;
                    case 'product':
                        if (data.id) {
                            const product = DATA.products.find(p => p.id === data.id);
                            result = product ? { success: true, data: product } : { success: false, message: 'Product not found' };
                        }
                        break;

                    // Categories
                    case 'categories':
                        result = { success: true, data: DATA.categories };
                        break;

                    // Orders
                    case 'orders':
                        result = { success: true, data: App.orders.items };
                        break;
                    case 'order':
                        if (data.id || data.code) {
                            const order = App.orders.getByCode(data.code) || App.orders.items.find(o => o.id === data.id);
                            result = order ? { success: true, data: order } : { success: false, message: 'Order not found' };
                        }
                        break;
                    case 'create_order':
                        const order = App.orders.create(data);
                        result = { success: true, data: order };
                        break;

                    // Reviews
                    case 'reviews':
                        const reviews = App.reviews.getByProduct(data.productId);
                        result = { success: true, data: reviews };
                        break;
                    case 'create_review':
                        App.reviews.add(data);
                        result = { success: true, message: 'Review added' };
                        break;

                    // Coupons/Vouchers
                    case 'coupons':
                    case 'vouchers':
                        result = { success: true, data: App.vouchers.getAll() };
                        break;
                    case 'validate_coupon':
                        const validation = App.vouchers.validate(data.code, data.subtotal);
                        result = validation.valid ? { success: true, data: validation.voucher } : { success: false, message: validation.message };
                        break;

                    // Auth
                    case 'login':
                        const user = DATA.users.find(u => u.email === data.email && u.password === data.password);
                        if (user) {
                            const { password, ...safeUser } = user;
                            result = { success: true, data: safeUser };
                        } else {
                            result = { success: false, message: 'Invalid credentials' };
                        }
                        break;
                    case 'register':
                        if (DATA.users.find(u => u.email === data.email)) {
                            result = { success: false, message: 'Email already exists' };
                        } else {
                            const newUser = {
                                id: App.utils.generateId(),
                                ...data,
                                role: 'customer',
                                loyaltyPoints: 0,
                                createdAt: new Date().toISOString()
                            };
                            DATA.users.push(newUser);
                            result = { success: true, data: newUser };
                        }
                        break;

                    // Contact
                    case 'contact':
                        console.log('Contact form submitted:', data);
                        result = { success: true, message: 'Message received' };
                        break;

                    // Dashboard/Stats (admin)
                    case 'dashboard':
                        result = {
                            success: true,
                            data: {
                                totalOrders: App.orders.items.length,
                                totalProducts: DATA.products.length,
                                totalUsers: DATA.users.length,
                                recentOrders: App.orders.items.slice(0, 5)
                            }
                        };
                        break;

                    // Blogs
                    case 'blogs':
                        result = { success: true, data: DATA.blogs };
                        break;
                    case 'blog':
                        const blog = DATA.blogs.find(b => b.id === data.id || b.slug === data.slug);
                        result = blog ? { success: true, data: blog } : { success: false, message: 'Blog not found' };
                        break;

                    // FAQs
                    case 'faqs':
                        result = { success: true, data: DATA.faqs };
                        break;

                    // Banners
                    case 'banners':
                        result = { success: true, data: DATA.banners };
                        break;

                    // Popups
                    case 'popups':
                        const activePopups = DATA.popups.filter(p => p.isActive);
                        result = { success: true, data: activePopups };
                        break;

                    default:
                        result = { success: false, message: `Action '${action}' not implemented` };
                }

                resolve(result);
            }, 200); // Simulate network delay
        });
    },

    // ================================
    // API METHODS
    // ================================

    // Products
    products: {
        getAll: (params = {}) => API.request('products', params),
        getById: (id) => API.request('product', { id }),
        getByCategory: (categoryId) => API.request('products', { categoryId }),
        search: (query) => API.request('products', { search: query }),
        getFeatured: (limit = 8) => API.request('products', { featured: true, limit }),
        getFlashSale: () => API.request('products', { flashSale: true }),
    },

    // Categories
    categories: {
        getAll: () => API.request('categories'),
        getById: (id) => API.request('categories', { id }),
    },

    // Cart & Orders
    orders: {
        getAll: () => API.request('orders'),
        getByCode: (code) => API.request('order', { code }),
        create: (orderData) => API.request('create_order', orderData, 'POST'),
    },

    // Reviews
    reviews: {
        getByProduct: (productId) => API.request('reviews', { productId }),
        add: (reviewData) => API.request('create_review', reviewData, 'POST'),
    },

    // Vouchers
    vouchers: {
        getAll: () => API.request('vouchers'),
        validate: (code, subtotal) => API.request('validate_coupon', { code, subtotal }),
    },

    // Auth
    auth: {
        login: (email, password) => API.request('login', { email, password }, 'POST'),
        register: (userData) => API.request('register', userData, 'POST'),
    },

    // Contact
    contact: {
        submit: (formData) => API.request('contact', formData, 'POST'),
    },

    // Admin
    admin: {
        getDashboard: () => API.request('dashboard'),
    },

    // Content
    blogs: {
        getAll: () => API.request('blogs'),
        getById: (id) => API.request('blog', { id }),
    },

    faqs: {
        getAll: () => API.request('faqs'),
    },

    banners: {
        getAll: () => API.request('banners'),
    },

    popups: {
        getActive: () => API.request('popups'),
    },

    // ================================
    // UTILITY METHODS
    // ================================

    // Sync data from API to localStorage
    async syncData() {
        try {
            const [products, categories, vouchers, banners] = await Promise.all([
                this.products.getAll(),
                this.categories.getAll(),
                this.vouchers.getAll(),
                this.banners.getAll()
            ]);

            if (products.success) DATA.products = products.data;
            if (categories.success) DATA.categories = categories.data;
            if (vouchers.success) DATA.vouchers = vouchers.data;
            if (banners.success) DATA.banners = banners.data;

            App.storage.save('syncedData', {
                products: DATA.products,
                categories: DATA.categories,
                vouchers: DATA.vouchers,
                banners: DATA.banners,
                lastSync: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Sync error:', error);
            return false;
        }
    },

    // Load synced data from localStorage
    loadSyncedData() {
        const synced = App.storage.load('syncedData', null);
        if (synced) {
            if (Array.isArray(synced.products) && synced.products.length) DATA.products = synced.products;
            if (Array.isArray(synced.categories) && synced.categories.length) DATA.categories = synced.categories;
            if (Array.isArray(synced.vouchers) && synced.vouchers.length) DATA.vouchers = synced.vouchers;
            if (Array.isArray(synced.banners) && synced.banners.length) DATA.banners = synced.banners;
        }
    },

    // Get last sync time
    getLastSyncTime() {
        const synced = App.storage.load('syncedData', null);
        return synced ? new Date(synced.lastSync) : null;
    },
};

// Initialize API with synced data on load
document.addEventListener('DOMContentLoaded', function() {
    API.loadSyncedData();
});
