const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

// Tạo tài khoản mới mỗi lần chạy test
const timestamp = Date.now();

const testUser = {
    hoTen: 'Playwright Test',
    email: `playwright${timestamp}@gmail.com`,
    soDienThoai: `09${timestamp.toString().slice(-8)}`,
    tenTaiKhoan: `playwright${timestamp}`,
    matKhau: '123456'
};


// =====================================================
// 1. ĐĂNG KÝ TÀI KHOẢN MỚI
// =====================================================

test('Đăng ký tài khoản mới', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangky.html`);

    await page.fill('#ho_ten', testUser.hoTen);
    await page.fill('#email', testUser.email);
    await page.fill('#so_dien_thoai', testUser.soDienThoai);
    await page.fill('#ten_tai_khoan', testUser.tenTaiKhoan);
    await page.fill('#mat_khau', testUser.matKhau);

    // Chọn vai trò sinh viên
    await page.selectOption('#role', 'sinh_vien');

    // Button dùng onclick="register()"
    await page.click('button:has-text("Đăng ký ngay")');

    await page.waitForTimeout(1000);
});


// =====================================================
// 2. ĐĂNG NHẬP ĐÚNG
// =====================================================

test('Đăng nhập thành công', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill(
        '#ten_tai_khoan',
        testUser.tenTaiKhoan
    );

    await page.fill(
        '#mat_khau',
        testUser.matKhau
    );

    // Button dùng onclick="login()"
    await page.click('button:has-text("Đăng nhập ngay")');

    // Chờ JavaScript xử lý đăng nhập
    await page.waitForTimeout(1000);

    // Kiểm tra JWT được lưu
    const token = await page.evaluate(() => {
        return localStorage.getItem('token');
    });

    expect(token).not.toBeNull();
});


// =====================================================
// 3. ĐĂNG NHẬP SAI MẬT KHẨU
// =====================================================

test('Không đăng nhập được khi sai mật khẩu', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangnhap.html`);

    // Dùng tài khoản chắc chắn tồn tại
    await page.fill(
        '#ten_tai_khoan',
        'admin'
    );

    // Cố tình nhập sai mật khẩu
    await page.fill(
        '#mat_khau',
        'matkhau_sai_123'
    );

    // Chờ alert
    const dialogPromise = page.waitForEvent('dialog');

    await page.click('button:has-text("Đăng nhập ngay")');

    const dialog = await dialogPromise;

    // Website phải báo sai mật khẩu
    expect(dialog.message()).toMatch(
        /sai|không đúng|thất bại|lỗi/i
    );

    await dialog.dismiss();

    // Không được tạo JWT
    const token = await page.evaluate(() => {
        return localStorage.getItem('token');
    });

    expect(token).toBeNull();
});


// =====================================================
// 4. ĐĂNG NHẬP VỚI TÀI KHOẢN KHÔNG TỒN TẠI
// =====================================================

test('Không đăng nhập được khi tài khoản không tồn tại', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill(
        '#ten_tai_khoan',
        `user_khong_ton_tai_${Date.now()}`
    );

    await page.fill(
        '#mat_khau',
        '123456'
    );

    // Chờ alert
    const dialogPromise = page.waitForEvent('dialog');

    await page.click('button:has-text("Đăng nhập ngay")');

    const dialog = await dialogPromise;

    // Website phải báo tài khoản không tồn tại
    expect(dialog.message()).toMatch(
        /không tồn tại|không tìm thấy|sai|thất bại|lỗi/i
    );

    await dialog.dismiss();

    // Không được tạo JWT
    const token = await page.evaluate(() => {
        return localStorage.getItem('token');
    });

    expect(token).toBeNull();
});


// =====================================================
// 5. ĐĂNG KÝ - BỎ TRỐNG HỌ TÊN
// =====================================================

test('Đăng ký không thành công khi bỏ trống họ tên', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangky.html`);

    await page.fill('#ho_ten', '');
    await page.fill('#email', `test${Date.now()}@gmail.com`);
    await page.fill('#so_dien_thoai', '0912345678');
    await page.fill('#ten_tai_khoan', `test${Date.now()}`);
    await page.fill('#mat_khau', '123456');

    await page.selectOption('#role', 'sinh_vien');

    await page.click('button:has-text("Đăng ký ngay")');

    // Nếu input có required, trình duyệt sẽ giữ nguyên trang
    await expect(page).toHaveURL(/dangky\.html/i);

    // Kiểm tra trường vẫn đang trống
    await expect(page.locator('#ho_ten')).toHaveValue('');
});


// =====================================================
// 6. ĐĂNG KÝ - BỎ TRỐNG EMAIL
// =====================================================

test('Đăng ký không thành công khi bỏ trống email', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangky.html`);

    await page.fill('#ho_ten', 'Playwright Test');
    await page.fill('#email', '');
    await page.fill('#so_dien_thoai', '0912345678');
    await page.fill('#ten_tai_khoan', `test${Date.now()}`);
    await page.fill('#mat_khau', '123456');

    await page.selectOption('#role', 'sinh_vien');

    await page.click('button:has-text("Đăng ký ngay")');

    await expect(page).toHaveURL(/dangky\.html/i);

    await expect(page.locator('#email')).toHaveValue('');
});


// =====================================================
// 7. ĐĂNG KÝ - BỎ TRỐNG SỐ ĐIỆN THOẠI
// =====================================================

test('Đăng ký không thành công khi bỏ trống số điện thoại', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangky.html`);

    await page.fill('#ho_ten', 'Playwright Test');
    await page.fill('#email', `test${Date.now()}@gmail.com`);
    await page.fill('#so_dien_thoai', '');
    await page.fill('#ten_tai_khoan', `test${Date.now()}`);
    await page.fill('#mat_khau', '123456');

    await page.selectOption('#role', 'sinh_vien');

    await page.click('button:has-text("Đăng ký ngay")');

    await expect(page).toHaveURL(/dangky\.html/i);

    await expect(page.locator('#so_dien_thoai')).toHaveValue('');
});


// =====================================================
// 8. ĐĂNG KÝ - BỎ TRỐNG TÊN TÀI KHOẢN
// =====================================================

test('Đăng ký không thành công khi bỏ trống tên tài khoản', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangky.html`);

    await page.fill('#ho_ten', 'Playwright Test');
    await page.fill('#email', `test${Date.now()}@gmail.com`);
    await page.fill('#so_dien_thoai', '0912345678');
    await page.fill('#ten_tai_khoan', '');
    await page.fill('#mat_khau', '123456');

    await page.selectOption('#role', 'sinh_vien');

    await page.click('button:has-text("Đăng ký ngay")');

    await expect(page).toHaveURL(/dangky\.html/i);

    await expect(page.locator('#ten_tai_khoan')).toHaveValue('');
});


// =====================================================
// 9. ĐĂNG KÝ - BỎ TRỐNG MẬT KHẨU
// =====================================================

test('Đăng ký không thành công khi bỏ trống mật khẩu', async ({ page }) => {
    await page.goto(`${BASE_URL}/dangky.html`);

    await page.fill('#ho_ten', 'Playwright Test');
    await page.fill('#email', `test${Date.now()}@gmail.com`);
    await page.fill('#so_dien_thoai', '0912345678');
    await page.fill('#ten_tai_khoan', `test${Date.now()}`);
    await page.fill('#mat_khau', '');

    await page.selectOption('#role', 'sinh_vien');

    await page.click('button:has-text("Đăng ký ngay")');

    await expect(page).toHaveURL(/dangky\.html/i);

    await expect(page.locator('#mat_khau')).toHaveValue('');
});