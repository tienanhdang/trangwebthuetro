const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const accounts = {
    admin: {
        username: 'admin',
        password: 'admin123'
    },

    chuTro: {
        username: 'chutro',
        password: 'chutro123'
    },

    sinhVien: {
        username: 'sinhvien',
        password: 'sinhvien123'
    }
};


// =====================================================
// HÀM ĐĂNG NHẬP
// =====================================================

async function login(page, account) {

    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill(
        '#ten_tai_khoan',
        account.username
    );

    await page.fill(
        '#mat_khau',
        account.password
    );

    // Website dùng onclick="login()"
    await page.click('button:has-text("Đăng nhập ngay")');

    // Chờ JavaScript xử lý đăng nhập
    await page.waitForTimeout(1000);
}


// =====================================================
// 1. ADMIN ĐƯỢC TRUY CẬP TRANG QUẢN LÝ USER
// =====================================================

test('Admin được truy cập quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.admin);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    await expect(page).toHaveURL(
        /quanlytaikhoan\.html/i
    );
});


// =====================================================
// 2. GIAO DIỆN SINH VIÊN KHÔNG CÓ NÚT QUẢN LÝ TÀI KHOẢN
// =====================================================

test('Sinh viên không có nút quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.sinhVien);

    await page.goto(`${BASE_URL}/index.html`);

    const adminButton = page.locator(
        'a:has-text("Quản lý tài khoản"), ' +
        'button:has-text("Quản lý tài khoản"), ' +
        '[href*="quanlytaikhoan"]'
    );

    await expect(adminButton).toHaveCount(0);
});


// =====================================================
// 3. GIAO DIỆN CHỦ TRỌ KHÔNG CÓ NÚT QUẢN LÝ TÀI KHOẢN
// =====================================================

test('Chủ trọ không có nút quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.chuTro);

    await page.goto(`${BASE_URL}/index.html`);

    const adminButton = page.locator(
        'a:has-text("Quản lý tài khoản"), ' +
        'button:has-text("Quản lý tài khoản"), ' +
        '[href*="quanlytaikhoan"]'
    );

    await expect(adminButton).toHaveCount(0);
});


// =====================================================
// 4. SINH VIÊN KHÔNG ĐƯỢC TRUY CẬP TRỰC TIẾP TRANG ADMIN
// =====================================================

test('Sinh viên không được truy cập trực tiếp trang quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.sinhVien);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    // Sinh viên đáng lẽ phải bị từ chối / redirect
    // Nếu vẫn ở trang quản lý tài khoản -> FAIL
    await expect(page).not.toHaveURL(
        /quanlytaikhoan\.html/i
    );
});


// =====================================================
// 5. CHỦ TRỌ KHÔNG ĐƯỢC TRUY CẬP TRỰC TIẾP TRANG ADMIN
// =====================================================

test('Chủ trọ không được truy cập trực tiếp trang quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.chuTro);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    // Chủ trọ đáng lẽ phải bị từ chối / redirect
    // Nếu vẫn ở trang quản lý tài khoản -> FAIL
    await expect(page).not.toHaveURL(
        /quanlytaikhoan\.html/i
    );
});


// =====================================================
// 6. KIỂM TRA ROLE TRONG JWT CỦA ADMIN
// =====================================================

test('JWT của Admin có role admin', async ({ page }) => {

    await login(page, accounts.admin);

    const payload = await page.evaluate(() => {

        const token = localStorage.getItem('token');

        if (!token) {
            return null;
        }

        const parts = token.split('.');

        if (parts.length !== 3) {
            return null;
        }

        return JSON.parse(
            atob(
                parts[1]
                    .replace(/-/g, '+')
                    .replace(/_/g, '/')
            )
        );
    });

    expect(payload).not.toBeNull();

    expect(payload.role).toBe('admin');
});