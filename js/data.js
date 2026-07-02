// ================================
// 3t Coffee - Data
// ================================

const DATA = {
    // ================================
    // tHông tin website - chỉnh sửa thông tin website
    // ================================
    settings: {
        siteName: '3T Coffee',
        siteDescription: 'Cà phê nguyên chất',
        siteEmail: '3TCoffee3@gmail.com',
        sitePhone: '0373 189 077',
        siteAddress: 'Vinhome Grand Park, Đường Nguyễn Xiển, P.Long Thạnh Mỹ, TP.Thủ Đức, TP.HCM',
        shippingFee: 30000,
        freeShippingMin: 200000,
        bankAccount: '1234567890',
        bankName: 'Vietcombank',
        bankHolder: 'Nguyen Van A',
        flashSaleStart: '2026-06-11T14:38:00.000Z',
        flashSaleEnd: '2026-07-10T14:38:00.000Z',
    },

    // ================================
    // DANH MỤC SẢN PHẨM - cHỉnh sửa danh mục, thêm danh mục mới, xóa danh mục
    // ================================
    categories: [
        { id: 'cat001', name: 'Cà phê đen', slug: 'ca-phe-den', image: 'images/ca-phe-den.jpg', description: 'Cà phê đen nguyên chất', sortOrder: 1 },
        { id: 'cat002', name: 'Cà phê sữa', slug: 'ca-phe-sua', image: 'images/ca-phe-sua-da-3T.jpg', description: 'Cà phê sữa đá truyền thống', sortOrder: 2 },
        { id: 'cat003', name: 'Cà phê đặc biệt', slug: 'ca-phe-dac-biet', image: 'images/ca-phe-cot-dua.jpg', description: 'Cà phê đặc biệt rang xay', sortOrder: 3 },
        { id: 'cat004', name: 'Latte & Cappuccino', slug: 'latte-cappuccino', image: 'images/matcha.jpg', description: 'Latte, Cappuccino thơm béo', sortOrder: 4 },
        { id: 'cat005', name: 'Cold Brew', slug: 'cold-brew', image: 'images/cold-brew.jpg', description: 'Cà phê cold brew mát lạnh', sortOrder: 5 },
        { id: 'cat006', name: 'Trà sữa', slug: 'tra-sua', image: 'images/tra-sua-xoai.jpg', description: 'Trà sữa thơm ngon', sortOrder: 6 },
        { id: 'cat007', name: 'Trà trái cây', slug: 'tra-trai-cay', image: 'images/tra-nhiet-doi.jpg', description: 'Trà trái cây tươi mát', sortOrder: 7 },
        { id: 'cat008', name: 'Nước ép', slug: 'nuoc-ep', image: 'images/nuoc-ep-cam.jpg', description: 'Nước ép trái cây tươi', sortOrder: 8 },
    ],

    // ================================
// Sản Phẩm - Chỉnh sửa sản phẩm, thêm sản phẩm mới, xóa sản phẩm
    // ================================
    products: [
        {
            id: '1', name: 'Cà phê đen nóng 3T Signature', slug: 'ca-phe-den-nong-3t-signature',
            description: 'Hương vị đậm đà từ vùng Pleiku, rang medium để giữ trọn vị chua nhẹ và hậu ngọt đặc trưng.',
            ingredients: '100% Cà phê Arabica Pleiku', volume: '350ml', calories: 80,
            price: 45000, salePrice: 39000, categoryId: 'cat001', categoryName: 'Cà phê đen',
            images: ['images/ca-phe-den-3T.jpg'],
            stock: 99, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.8, reviewCount: 156, soldCount: 1251, createdAt: '2025-01-01',
        },
        {
            id: '2', name: 'Cà phê đen đá 3T Signature', slug: 'ca-phe-den-da-3t-signature',
            description: 'Hương vị đậm đà từ vùng Pleiku, rang medium để giữ trọn vị chua nhẹ và hậu ngọt đặc trưng.',
            ingredients: '100% Cà phê Arabica Pleiku', volume: '350ml', calories: 80,
            price: 45000, salePrice: 39000, categoryId: 'cat001', categoryName: 'Cà phê đen',
            images: ['images/ca-phe-den-da.jpg'],
            stock: 99, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.8, reviewCount: 156, soldCount: 1251, createdAt: '2025-01-01',
        },
        
        {
            id: '3', name: 'Cà phê sữa đá 3T', slug: 'ca-phe-sua-da-3t',
            description: 'Công thức gia truyền với sữa đặc và cà phê rang vừa, hòa quyện hoàn hảo.',
            ingredients: 'Cà phê, Sữa đặc, Đường', volume: '350ml', calories: 150,
            price: 35000, categoryId: 'cat002', categoryName: 'Cà phê sữa',
            images: ['images/ca-phe-sua-da-3T.jpg'],
            stock: 150, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.9, reviewCount: 234, soldCount: 2100, createdAt: '2025-01-01',
        },
        {
            id: '4', name: 'Cà phê sữa nóng 3T', slug: 'ca-phe-sua-nong-3t',
            description: 'Cà phê sữa phục vụ nóng, thơm ngào từng hơi.',
            ingredients: 'Cà phê, Sữa tươi, Đường', volume: '300ml', calories: 140,
            price: 38000, categoryId: 'cat002', categoryName: 'Cà phê sữa',
            images: ['images/ca-phe-sua-nong-3T.jpg'],
            stock: 80, isFeatured: false, isNew: true, isFlashSale: false,
            rating: 4.7, reviewCount: 89, soldCount: 560, createdAt: '2025-02-15',
        },
        {
            id: '5', name: 'Latte Caramel', slug: 'latte-caramel',
            description: 'Espresso pha với sữa nóng và caramel ngọt ngào, trang trí bọt sữa mịn màng.',
            ingredients: 'Espresso, Sữa nóng, Caramel', volume: '350ml', calories: 180,
            price: 55000, salePrice: 49000, categoryId: 'cat004', categoryName: 'Latte & Cappuccino',
            images: ['images/latte-caramel.jpg'],
            stock: 59, isFeatured: true, isNew: false, isFlashSale: true,
            rating: 4.8, reviewCount: 178, soldCount: 981, createdAt: '2025-01-01',
        },
        {
            id: '6', name: 'Cappuccino Classic', slug: 'cappuccino-classic',
            description: 'Cappuccino truyền thống với bọt sữa dày và cacao powder.',
            ingredients: 'Espresso, Sữa nóng, Bọt sữa, Cacao', volume: '300ml', calories: 160,
            price: 58000, categoryId: 'cat004', categoryName: 'Latte & Cappuccino',
            images: ['images/capuchino.jpg'],
            stock: 50, isFeatured: false, isNew: false, isFlashSale: false,
            rating: 4.6, reviewCount: 112, soldCount: 720, createdAt: '2025-01-01',
        },
        {
            id: '7', name: 'Mocha Delight', slug: 'mocha-delight',
            description: 'Sự kết hợp hoàn hảo giữa espresso, chocolate và sữa.',
            ingredients: 'Espresso, Socola, Sữa', volume: '350ml', calories: 220,
            price: 62000, categoryId: 'cat003', categoryName: 'Cà phê đặc biệt',
            images: ['images/mocha-delight.jpg'],
            stock: 40, isFeatured: false, isNew: true, isFlashSale: true,
            rating: 4.7, reviewCount: 95, soldCount: 450, createdAt: '2025-03-01',
        },
        {
            id: '8', name: 'Cold Brew Classic', slug: 'cold-brew-classic',
            description: 'Cà phê ủ lạnh 24 giờ, uống lạnh, thanh mát, ít chua.',
            ingredients: '100% Cà phê Arabica', volume: '400ml', calories: 60,
            price: 45000, categoryId: 'cat005', categoryName: 'Cold Brew',
            images: ['images/cold-brew.jpg'],
            stock: 70, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.9, reviewCount: 289, soldCount: 1560, createdAt: '2025-01-01',
        },
         {
            id: '9', name: 'Cold Brew Cam Sã', slug: 'cold-brew-cam-sa',
            description: 'Cà phê ủ lạnh 24 giờ, uống lạnh, thanh mát, ít chua.',
            ingredients: '100% Cà phê Arabica ,nước cam' , volume: '400ml', calories: 60,
            price: 45000, categoryId: 'cat005', categoryName: 'Cold Brew',
            images: ['images/cold-brew-cam-xa.jpg'],
            stock: 70, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.9, reviewCount: 289, soldCount: 1560, createdAt: '2025-01-01',
        },
        {
            id: '10', name: 'Cà Phê Cốt Dừa', slug: 'ca-phe-cot-dua',
            description: 'Cà phê cốt dừa từ cà phê Pleiku, hương vị đặc trưng vùng cao nguyên.',
            ingredients: '100% Cà phê Pleiku,sữa đặc, cốt dừa', volume: '400ml', calories: 65,
            price: 48000, salePrice: 42000, categoryId: 'cat003', categoryName: 'Cà phê đặc biệt',
            images: ['images/ca-phe-cot-dua.jpg'],
            stock: 54, isFeatured: true, isNew: false, isFlashSale: true,
            rating: 4.8, reviewCount: 167, soldCount: 891, createdAt: '2025-01-01',
        },
        {
            id: '11', name: 'Trà sữa 3T ', slug: 'tra-sua-3t',
            description: 'Trà sữa béo ngậy thơm ngon và đầy hương vị.',
            ingredients: 'Trà Oolong, Sữa tươi, Trân châu,thạch thủy tinh', volume: '500ml', calories: 250,
            price: 55000, categoryId: 'cat006', categoryName: 'Trà sữa',
            images: ['images/tra-sua-3T.jpg'],
            stock: 90, isFeatured: true, isNew: false, isFlashSale: true,
            rating: 4.7, reviewCount: 203, soldCount: 1340, createdAt: '2025-01-01',
        },
        {
            id: '12', name: 'Trà sữa xoài', slug: 'tra-sua-xoai',
            description: 'Trà sữa với hương vị xoài tươi ngon.',
            ingredients: 'Trà xanh, Sữa, Xoài', volume: '450ml', calories: 280,
            price: 58000, categoryId: 'cat006', categoryName: 'Trà sữa',
            images: ['images/tra-sua-xoai.jpg'],
            stock: 65, isFeatured: false, isNew: true, isFlashSale: false,
            rating: 4.6, reviewCount: 78, soldCount: 420, createdAt: '2025-04-01',
        },
        {
            id: '13', name: 'Trà Nhiệt Đới', slug: 'tra-nhiet-doi',
            description: 'Trà ô long với hương vị nhiệt đới.',
            ingredients: 'Trà ô long,  hoa quả, cam,  dưa hấu', volume: '400ml', calories: 180,
            price: 52000, categoryId: 'cat007', categoryName: 'Trà trái cây',
            images: ['images/tra-nhiet-doi.jpg'],
            stock: 43, isFeatured: false, isNew: true, isFlashSale: false,
            rating: 4.5, reviewCount: 56, soldCount: 282, createdAt: '2025-04-15',
        },
        {
            id: '14', name: 'Cà phê muối 3T Signature', slug: 'ca-phe-muoi-3t-signature',
            description: 'Cà phê muối đặc trưng 3T, vị mặn nhẹ hòa với đắng cà phê.',
            ingredients: 'Cà phê, Sữa, Muối tinh, Whipping cream', volume: '350ml', calories: 190,
            price: 48000, categoryId: 'cat003', categoryName: 'Cà phê đặc biệt',
            images: ['images/ca-phe-muoi.jpg'],
            stock: 75, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.9, reviewCount: 312, soldCount: 2180, createdAt: '2025-01-01',
        },
        {
            id: '15', name: 'Trà đào cam xả', slug: 'tra-dao-cam-xa',
            description: 'Trà hoa quả tươi mát với đào, cam và bạc hà.',
            ingredients: 'Trà, Đào, Cam, Bạc hà', volume: '400ml', calories: 90,
            price: 45000, categoryId: 'cat007', categoryName: 'Trà trái cây',
            images: ['images/tra-dao-cam-xa.jpg'],
            stock: 60, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.6, reviewCount: 134, soldCount: 760, createdAt: '2025-01-01',
        },
        {
            id: '16', name: 'Trà vải mát lạnh', slug: 'tra-vai-mat-lanh',
            description: 'Trà vải thiết kế vị ngọt thanh, mát lạnh.',
            ingredients: 'Trà xanh, Vải, Đá', volume: '400ml', calories: 85,
            price: 42000, categoryId: 'cat007', categoryName: 'Trà trái cây',
            images: ['images/tra-vai.jpg'],
            stock: 49, isFeatured: false, isNew: true, isFlashSale: false,
            rating: 4.4, reviewCount: 67, soldCount: 341, createdAt: '2025-05-01',
        },
        {
            id: '17', name: 'Nước cam ép', slug: 'nuoc-ep-cam-ep',
            description: 'Cam ép tươi 100%, không đường, không chất bảo quản.',
            ingredients: '100% Cam ép', volume: '350ml', calories: 110,
            price: 38000, categoryId: 'cat008', categoryName: 'Nước ép',
            images: ['images/nuoc-ep-cam.jpg'],
            stock: 40, isFeatured: false, isNew: false, isFlashSale: false,
            rating: 4.5, reviewCount: 89, soldCount: 520, createdAt: '2025-01-01',
        },
        {
            id: '18', name: 'Matcha Latte', slug: 'matcha-latte',
            description: 'Matcha Latte thơm béo, bột matcha Nhật Bản chất lượng cao.',
            ingredients: 'Matcha, Sữa tươi', volume: '350ml', calories: 220,
            price: 58000, categoryId: 'cat004', categoryName: 'Latte & Cappuccino',
            images: ['images/matcha.jpg'],
            stock: 45, isFeatured: true, isNew: false, isFlashSale: false,
            rating: 4.7, reviewCount: 145, soldCount: 890, createdAt: '2025-02-20',
        },
     {
            id: '19', name: 'Trà sữa trân châu đen', slug: 'tra-sua-tran-chau-den',
            description: 'Công thức gia truyền với trà ô long kèm với vị sữa béo ngậy, hòa quyện hoàn hảo.',
            ingredients: 'Trà ô long, Sữa đặc, Trân châu', volume: '500ml', calories: 150,
            price: 40000, categoryId: 'cat006', categoryName: 'Trà sữa',
            images: ['images/tra-sua-tran-chau-den.jpg'],
            stock: 100, isFeatured: true, isNew: true, isFlashSale: false,
            rating: 4.9, reviewCount: 234, soldCount: 2100, createdAt: '2025-01-01',
        },
        {
            id: '20', name: 'Nước ép dưa hấu', slug: 'nuoc-ep-dua-hau',
            description: 'Dưa hấu ép tươi 100%, không đường, không chất bảo quản.',
            ingredients: '100% Dưa hấu ép', volume: '350ml', calories: 110,
            price: 38000, categoryId: 'cat008', categoryName: 'Nước ép',
            images: ['images/ep-dua-hau.jpg'],
            stock: 40, isFeatured: false, isNew: false, isFlashSale: false,
            rating: 4.5, reviewCount: 89, soldCount: 520, createdAt: '2025-01-01',
        },
        {
            id: '21', name: 'Nước chanh', slug: 'nuoc-chanh',
            description: 'Chanh ép tươi 100%, không chất bảo quản.',
            ingredients: '100% Chanh ép', volume: '350ml', calories: 110,
            price: 38000, categoryId: 'cat008', categoryName: 'Nước ép',
            images: ['images/nuoc-chanh.jpg'],
            stock: 40, isFeatured: false, isNew: false, isFlashSale: false,
            rating: 4.5, reviewCount: 89, soldCount: 520, createdAt: '2025-01-01',
        },
    ],

    // ================================
    // BLOGS
    // ================================
    blogs: [
        {
            id: '1', title: 'Cách pha cà phê phin chuẩn vị Việt', slug: 'cach-pha-ca-phe-phin',
            excerpt: 'Hướng dẫn chi tiết cách pha cà phê phin truyền thống tại nhà với 5 bước đơn giản.',
            content: `<h3>Nguyên liệu cần chuẩn bị</h3>
<ul>
<li>25g cà phê rang xay</li>
<li>80-100ml nước sôi (~95°C)</li>
<li>Phin pha cà phê</li>
<li>Sữa đặc (nếu làm cà phê sữa)</li>
</ul>
<h3>Các bước pha</h3>
<ol>
<li>Tráng phin với nước nóng</li>
<li>Cho 25g cà phê vào, dàn đều</li>
<li>Đặt nắp gài nhẹ lên trên bột cà phê</li>
<li>Chế khoảng 30ml nước sôi, đợi 30 giây cho cà phê nở</li>
<li>Rót tiếp 50-70ml nước sôi, đậy nắp và đợi cà phê nhỏ giọt</li>
<li>Thêm sữa đặc hoặc đường tùy khẩu vị</li>
</ol>
<p>Cà phê phin là cách pha truyền thống mang đậm hương vị Việt Nam. Chúc bạn pha thành công!</p>`,
            image: 'images/cf1.jpg',
            author: '3TCoffee', publishedAt: '2025-05-15', views: 1250,
        },
        {
            id: '2', title: 'Tìm hiểu về cà phê Arabica và Robusta', slug: 'tim-hieu-ca-phe-arabica-robusta',
            excerpt: 'So sánh sự khác biệt giữa hai loại cà phê phổ biến nhất thế giới.',
            content: `<h3>Arabica vs Robusta</h3>
<p>Cà phê Arabica và Robusta là hai loại cà phê phổ biến nhất thế giới, chiếm khoảng 99% sản lượng cà phê toàn cầu.</p>
<h3>Cà phê Arabica</h3>
<ul>
<li>Hương vị phong phú, phức tạp</li>
<li>Hàm lượng caffeine thấp (1-1.5%)</li>
<li>Yêu cầu độ cao trồng từ 600-2000m</li>
<li>Khó trồng, dễ bị sâu bệnh</li>
</ul>
<h3>Cà phê Robusta</h3>
<ul>
<li>Hương vị đắng, mạnh</li>
<li>Hàm lượng caffeine cao (2-2.5%)</li>
<li>Trồng được ở độ cao thấp</li>
<li>Kháng sâu bệnh tốt</li>
</ul>
<p>3TCoffee sử dụng 100% cà phê Arabica để đảm bảo chất lượng tốt nhất cho khách hàng.</p>`,
            image: 'images/cf2.jpg',
            author: '3TCoffee', publishedAt: '2025-05-10', views: 980,
        },
        {
            id: '3', title: 'Lợi ích sức khỏe từ cà phê mỗi ngày', slug: 'loi-ich-suc-khoe-tu-ca-phe',
            excerpt: 'Uống cà phê đúng cách mang lại nhiều lợi ích bất ngờ cho sức khỏe.',
            content: `<h3>Lợi ích của cà phê</h3>
<ul>
<li><strong>Tăng cường năng lượng:</strong> Caffeine giúp tỉnh táo và tập trung</li>
<li><strong>Hỗ trợ trao đổi chất:</strong> Uống cà phê có thể tăng tốc độ metabolisms lên 3-11%</li>
<li><strong>Chống oxy hóa:</strong> Cà phê chứa nhiều chất chống oxy hóa</li>
<li><strong>Giảm nguy cơ bệnh tiểu đường type 2:</strong> Nghiên cứu cho thấy những người uống cà phê có nguy cơ thấp hơn</li>
<li><strong>Bảo vệ gan:</strong> Có thể giảm nguy cơ bệnh gan</li>
</ul>
<p>Tuy nhiên, nên uống cà phê với lượng vừa phải (2-3 tách/ngày) để tận dụng lợi ích tốt nhất.</p>`,
            image: 'images/cf3.jpg',
            author: '3TCoffee', publishedAt: '2025-05-05', views: 1560,
        },
        {
            id: '4', title: 'Hướng dẫn làm Cold Brew tại nhà', slug: 'huong-dan-lam-cold-brew',
            excerpt: 'Cách làm cà phê Cold Brew thơm ngon ngay tại nhà với 3 nguyên liệu đơn giản.',
            content: `<h3>Công thức Cold Brew cơ bản</h3>
<h4>Nguyên liệu:</h4>
<ul>
<li>100g cà phê rang vừa-xay thô</li>
<li>1 lít nước lọc</li>
<li>Bình hoặc lọ có nắp</li>
</ul>
<h4>Các bước thực hiện:</h4>
<ol>
<li>Trộn cà phê với nước theo tỉ lệ 1:10</li>
<li>Khuấy đều và đậy nắp</li>
<li>Bảo quản trong tủ lạnh 12-24 giờ</li>
<li>Lọc cà phê qua rây hoặc vải</li>
<li>Bảo quản lạnh và sử dụng trong 1-2 tuần</li>
</ol>
<p>Thưởng thức với đá hoặc sữa tùy ý!</p>`,
            image: 'images/cf4.jpg',
            author: '3TCoffee', publishedAt: '2025-04-28', views: 2100,
        },
        {
            id: '5', title: 'Cà phê Tây Nguyên - Hương vị đặc trưng Việt Nam', slug: 'ca-phe-tay-nguyen',
            excerpt: 'Khám phá hương vị cà phê Tây Nguyên nổi tiếng khắp thế giới.',
            content: `<h3>Cà phê Tây Nguyên - Đặc sản Việt Nam</h3>
<p>Tây Nguyên là vùng trồng cà phê lớn nhất Việt Nam, đặc biệt là các tỉnh Đắk Lắk, Đắk Nông, Lâm Đồng.</p>
<h4>Đặc điểm cà phê Tây Nguyên:</h4>
<ul>
<li>Độ cao trên 800m, khí hậu mát mẻ quanh năm</li>
<li>Đất đỏ bazan giàu dinh dưỡng</li>
<li>Hương vị đậm đà, có vị chua nhẹ đặc trưng</li>
<li>Được thu hoạch vào mùa khô (tháng 11-3)</li>
</ul>
<p>3TCoffee tự hào mang đến bạn những hạt cà phê Tây Nguyên chất lượng cao nhất.</p>`,
            image: 'images/cf7.jpg',
            author: '3TCoffee', publishedAt: '2025-04-20', views: 890,
        },
        {
            id: '6', title: 'Cách chọn hạt cà phê ngon cho gia đình', slug: 'cach-chon-hat-ca-phe-ngon',
            excerpt: 'Những tiêu chí quan trọng để chọn được hạt cà phê chất lượng.',
            content: `<h3>Hướng dẫn chọn cà phê ngon</h3>
<h4>1. Về ngoại quan</h4>
<ul>
<li>Hạt cà phê phải đều nhau, không lẫn tạp chất</li>
<li>Màu sắc đồng đều (nâu sáng hoặc nâu đậm tùy mức rang)</li>
<li>Không có hạt nứt, vỡ hay mốc</li>
</ul>
<h4>2. Về mùi hương</h4>
<ul>
<li>Cà phê rang mộc có mùi thơm đặc trưng</li>
<li>Không có mùi ẩm mốc, khét hay lạ</li>
</ul>
<h4>3. Về độ ẩm</h4>
<ul>
<li>Độ ẩm lý tưởng: 12-13%</li>
<li>Hạt giòn, không ỏe hay mềm</li>
</ul>
<h4>4. Về nguồn gốc</h4>
<ul>
<li>Ưu tiên cà phê có nhãn mác rõ ràng</li>
<li>Chọn nhà cung cấp uy tín</li>
</ul>`,
            image: 'images/cf8.jpg',
            author: '3TCoffee', publishedAt: '2025-04-15', views: 720,
        },
    ],

    // ================================
    // FAQS
    // ================================
    faqs: [
        { id: '1', question: 'Thời gian giao hàng bao lâu?', answer: 'Giao hàng trong 30-60 phút tại nội thành TP.HCM. Các khu vực ngoại thành có thể lâu hơn 1-2 giờ.', sortOrder: 1 },
        { id: '2', question: 'Có hỗ trợ đổi trả không?', answer: 'Chúng tôi hỗ trợ đổi trả trong 24h nếu sản phẩm có vấn đề về chất lượng hoặc giao sai đơn hàng.', sortOrder: 2 },
        { id: '3', question: 'Phương thức thanh toán nào được hỗ trợ?', answer: 'Chúng tôi hỗ trợ COD (thanh toán khi nhận hàng), chuyển khoản ngân hàng, VNPay và ví MoMo.', sortOrder: 3 },
        { id: '4', question: 'Có giao hàng vào cuối tuần không?', answer: 'Có, chúng tôi giao hàng 7 ngày trong tuần từ 7h00 - 21h00, kể cả ngày lễ và Tết.', sortOrder: 4 },
        { id: '5', question: 'Đơn hàng tối thiểu là bao nhiêu?', answer: 'Không có đơn hàng tối thiểu. Miễn phí vận chuyển cho đơn hàng từ 200,000đ.', sortOrder: 5 },
        { id: '6', question: 'Làm sao để theo dõi đơn hàng?', answer: 'Sau khi đặt hàng, bạn sẽ nhận được mã đơn hàng qua email/SMS. Truy cập trang "Theo dõi đơn hàng" và nhập mã để xem trạng thái.', sortOrder: 6 },
        { id: '7', question: 'Có chương trình khách hàng thân thiết không?', answer: 'Có! Điểm tích lũy sẽ được cộng vào tài khoản sau mỗi đơn hàng. Tích đủ điểm để đổi ưu đãi hấp dẫn.', sortOrder: 7 },
        { id: '8', question: 'Tôi có thể đặt hàng trước cho sự kiện không?', answer: 'Có, chúng tôi nhận đặt hàng số lượng lớn cho các sự kiện, tiệc,... với giá ưu đãi. Liên hệ hotline để được báo giá.', sortOrder: 8 },
    ],

    // ================================
    // BANNERS
    // ================================
    banners: [
        {
            id: '1', title: 'Trải nghiệm cà phê tốt nhất', subtitle: 'Tận hưởng ly cà phê nguyên chất, rang xay từ những hạt cà phê chọn lọc',
            image: 'images/1.png', link: 'san-pham.html', sortOrder: 1, isActive: true,
        },
        {
            id: '2', title: 'Khuyến mãi mùa hè', subtitle: 'Giảm 20% cho tất cả các loại Cold Brew',
            image: 'images/2.png', link: 'san-pham.html?category=cold-brew', sortOrder: 2, isActive: true,
        },
        {
            id: '3', title: 'Hương vị tuyệt vời', subtitle: 'Cà phê đặc biệt Plei Signature',
            image: 'images/3.png', link: 'san-pham.html', sortOrder: 3, isActive: true,
        },
    ],

    // ================================
    // tài khoản đăng nhập
    // ================================
    users: [
        { id: 'admin001', email: 'admin@3T.com', password: 'admin123', name: 'Admin 3TCoffee', role: 'admin', phone: '0901234567', address: 'TP.HCM', loyaltyPoints: 0 },
        { id: 'user002', email: 'tram@gmail.com', password: 'tram123', name: 'Trâm', role: 'customer', phone: '0334780643', address: 'TP.HCM', loyaltyPoints: 200 },
        { id: 'user003', email: 'truc@gmail.com', password: 'truc123', name: 'Trâm', role: 'customer', phone: '0334780643', address: 'TP.HCM', loyaltyPoints: 200 },
    ],

    // ================================
    // REVIEWS (Product reviews)
    // ================================
    reviews: [
        { id: 'r1', productId: '1', userName: 'Nguyễn Minh Hoàng', rating: 5, comment: 'Cà phê rất ngon, đậm đà! Giao hàng nhanh, đóng gói cẩn thận.', createdAt: '2025-06-15' },
        { id: 'r2', productId: '1', userName: 'Trần Thị Lan', rating: 4, comment: 'Hương vị tuyệt vời, giao hàng nhanh! Sẽ ủng hộ tiếp.', createdAt: '2025-06-10' },
        { id: 'r3', productId: '1', userName: 'Lê Văn Tuấn', rating: 5, comment: 'Đây là loại cà phê tôi luôn tìm kiếm. Perfect!', createdAt: '2025-06-05' },
        { id: 'r4', productId: '2', userName: 'Phạm Thị Hương', rating: 5, comment: 'Cà phê sữa đá ngon nhất từng uống! Sẽ giới thiệu cho bạn bè.', createdAt: '2025-06-12' },
        { id: 'r5', productId: '2', userName: 'Đặng Văn Nam', rating: 4, comment: 'Cà phê đậm đà, giao hàng đúng hẹn. Good job!', createdAt: '2025-06-08' },
        { id: 'r6', productId: '4', userName: 'Hoàng Thị Mai', rating: 5, comment: 'Latte caramel thơm béo, rất đáng thử! Topping đầy đủ.', createdAt: '2025-06-14' },
        { id: 'r7', productId: '4', userName: 'Vũ Văn Hùng', rating: 4, comment: 'Vị caramel hơi ngọt với mình, nhưng overall rất ngon.', createdAt: '2025-06-11' },
        { id: 'r8', productId: '7', userName: 'Ngô Thị Thu', rating: 5, comment: 'Cold Brew cực kỳ mát lạnh và thơm. Perfect cho ngày hè!', createdAt: '2025-06-18' },
        { id: 'r9', productId: '7', userName: 'Trịnh Văn Đức', rating: 5, comment: 'Đây là cold brew ngon nhất mà tôi từng thử. Recommend!', createdAt: '2025-06-16' },
        { id: 'r10', productId: '8', userName: 'Bùi Thị Hà', rating: 4, comment: 'Cold brew plei rất thơm, giao hàng nhanh.', createdAt: '2025-06-13' },
        { id: 'r11', productId: '9', userName: 'Đào Văn Phong', rating: 5, comment: 'Trà sữa ngon, trân châu dai giòn. Sẽ order lại!', createdAt: '2025-06-17' },
        { id: 'r12', productId: '12', userName: 'Lý Thị Yến', rating: 5, comment: 'Cà phê muối độc đáo! Vị mặn nhẹ rất lạ miệng.', createdAt: '2025-06-19' },
    ],

    // ================================
    // VOUCHERS
    // ================================
    vouchers: [
        { id: 'v001', code: 'WELCOME50', discount: 50, discountType: 'fixed', minOrder: 0, description: 'Giảm 50K cho đơn hàng đầu tiên', isActive: true, expDate: '2026-12-31', usageLimit: 100, usedCount: 0 },
        { id: 'v002', code: 'SUMMER20', discount: 20, discountType: 'percent', minOrder: 150000, maxDiscount: 50000, description: 'Giảm 20% cho đơn từ 150K', isActive: true, expDate: '2026-08-31', usageLimit: 500, usedCount: 120 },
        { id: 'v003', code: 'FREESHIP', discount: 0, discountType: 'freeship', minOrder: 100000, description: 'Miễn phí ship cho đơn từ 100K', isActive: true, expDate: '2026-12-31', usageLimit: 1000, usedCount: 450 },
        { id: 'v004', code: 'NEWCUSTOMER', discount: 15, discountType: 'percent', minOrder: 100000, maxDiscount: 30000, description: 'Giảm 15% cho khách mới', isActive: true, expDate: '2026-12-31', usageLimit: 200, usedCount: 89 },
        { id: 'v005', code: 'BUY2GET1', discount: 33, discountType: 'percent', minOrder: 200000, description: 'Mua 2 được giảm 33%', isActive: true, expDate: '2026-07-31', usageLimit: 100, usedCount: 45 },
        { id: 'v006', code: '3TCoffee', discount: 10, discountType: 'percent', minOrder: 50000, maxDiscount: 20000, description: 'Giảm 10% cho mọi đơn', isActive: true, expDate: '2026-12-31', usageLimit: 0, usedCount: 0 },
    ],

    // ================================
    // POPUPS
    // ================================
    popups: [
        { id: 'popup001', title: 'Chào mừng đến với 3TCoffee!', content: 'Đăng ký ngay hôm nay và nhận voucher giảm 50K cho đơn hàng đầu tiên!', image: 'images/popup-welcome.jpg', isActive: true, showOnce: true },
    ],
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATA;
}
