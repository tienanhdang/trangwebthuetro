const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const ROOM_ID = 20;

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

    await page.click(
        'button:has-text("Đăng nhập ngay")'
    );

    await page.waitForTimeout(1000);
}


// =====================================================
// 1. ADMIN ĐƯỢC TRUY CẬP TRANG QUẢN LÝ USER
// =====================================================

test('Admin được truy cập quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.admin);

    await page.goto(
        `${BASE_URL}/quanlytaikhoan.html`
    );

    await expect(page).toHaveURL(
        /quanlytaikhoan\.html/i
    );
});


// =====================================================
// 2. SINH VIÊN KHÔNG CÓ NÚT QUẢN LÝ TÀI KHOẢN
// =====================================================

test('Sinh viên không có nút quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.sinhVien);

    await page.goto(
        `${BASE_URL}/index.html`
    );

    const adminButton = page.locator(
        'a:has-text("Quản lý tài khoản"), ' +
        'button:has-text("Quản lý tài khoản"), ' +
        '[href*="quanlytaikhoan"]'
    );

    await expect(adminButton).toHaveCount(0);
});


// =====================================================
// 3. CHỦ TRỌ KHÔNG CÓ NÚT QUẢN LÝ TÀI KHOẢN
// =====================================================

test('Chủ trọ không có nút quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.chuTro);

    await page.goto(
        `${BASE_URL}/index.html`
    );

    const adminButton = page.locator(
        'a:has-text("Quản lý tài khoản"), ' +
        'button:has-text("Quản lý tài khoản"), ' +
        '[href*="quanlytaikhoan"]'
    );

    await expect(adminButton).toHaveCount(0);
});


// =====================================================
// 4. SINH VIÊN KHÔNG ĐƯỢC TRUY CẬP TRỰC TIẾP
//    TRANG QUẢN LÝ TÀI KHOẢN
// =====================================================

test('Sinh viên không được truy cập trực tiếp trang quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.sinhVien);

    await page.goto(
        `${BASE_URL}/quanlytaikhoan.html`
    );

    // Nếu vẫn ở trang quản lý tài khoản -> FAIL
    await expect(page).not.toHaveURL(
        /quanlytaikhoan\.html/i
    );
});


// =====================================================
// 5. CHỦ TRỌ KHÔNG ĐƯỢC TRUY CẬP TRỰC TIẾP
//    TRANG QUẢN LÝ TÀI KHOẢN
// =====================================================

test('Chủ trọ không được truy cập trực tiếp trang quản lý tài khoản', async ({ page }) => {

    await login(page, accounts.chuTro);

    await page.goto(
        `${BASE_URL}/quanlytaikhoan.html`
    );

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


// =====================================================
// 7. SINH VIÊN KHÔNG ĐƯỢC TỰ ĐỔI URL
//    ĐỂ VÀO TRANG SỬA PHÒNG
// =====================================================

test('Sinh viên không được truy cập trực tiếp trang sửa phòng', async ({ page }) => {

    await login(page, accounts.sinhVien);

    await page.goto(
        `${BASE_URL}/suaphong.html?id=${ROOM_ID}`
    );

    // Sinh viên đáng lẽ phải bị từ chối / redirect
    // Nếu vẫn ở trang sửa phòng -> FAIL
    await expect(page).not.toHaveURL(
        /suaphong\.html/i
    );
});


// =====================================================
// 8. CHỦ TRỌ KHÔNG ĐƯỢC TỰ ĐỔI URL
//    ĐỂ VÀO TRANG SỬA PHÒNG CỦA PHÒNG KHÔNG THUỘC MÌNH
// =====================================================

test('Chủ trọ không được truy cập trang sửa phòng của phòng không thuộc mình', async ({ page }) => {

    await login(page, accounts.chuTro);

    await page.goto(
        `${BASE_URL}/suaphong.html?id=${ROOM_ID}`
    );

    // Nếu ROOM_ID thuộc tài khoản chutro,
    // test này sẽ không thể kiểm tra quyền sở hữu.
    //
    // Vì vậy ROOM_ID nên là phòng của chủ trọ khác
    // nếu muốn kiểm tra chính xác trường hợp này.

    await expect(page).not.toHaveURL(
        /suaphong\.html/i
    );
});


// =====================================================
// 9. SINH VIÊN KHÔNG ĐƯỢC TỰ ĐỔI URL
//    ĐỂ VÀO TRANG QUẢN LÝ PHÒNG
// =====================================================

test('Sinh viên không được truy cập trực tiếp trang quản lý phòng', async ({ page }) => {

    await login(page, accounts.sinhVien);

    await page.goto(
        `${BASE_URL}/quanlyphong.html`
    );

    // Nếu sinh viên vẫn ở trang quản lý phòng -> FAIL
    await expect(page).not.toHaveURL(
        /quanlyphong\.html/i
    );
});


// =====================================================
// 10. CHỦ TRỌ KHÔNG ĐƯỢC TRUY CẬP TRANG QUẢN LÝ USER
//     ĐÃ KIỂM TRA Ở TEST 5
// =====================================================

// Không cần thêm test trùng với TC 5.
// Test 5 đã kiểm tra trường hợp này.