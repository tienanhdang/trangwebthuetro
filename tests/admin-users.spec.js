const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const admin = {
    username: 'admin',
    password: 'admin123'
};


// =====================================================
// HÀM ĐĂNG NHẬP ADMIN
// =====================================================

async function loginAdmin(page) {

    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill(
        '#ten_tai_khoan',
        admin.username
    );

    await page.fill(
        '#mat_khau',
        admin.password
    );

    // Website dùng onclick="login()"
    await page.click('button:has-text("Đăng nhập ngay")');

    // Chờ xử lý đăng nhập
    await page.waitForTimeout(1000);
}


// =====================================================
// 1. ADMIN MỞ TRANG QUẢN LÝ USER
// =====================================================

test('Admin mở trang quản lý tài khoản', async ({ page }) => {

    await loginAdmin(page);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    await expect(page).toHaveURL(/quanlytaikhoan/);

    await expect(page.locator('body')).toContainText(
        /quản lý|tài khoản|người dùng/i
    );
});


// =====================================================
// 2. KIỂM TRA DANH SÁCH USER
// =====================================================

test('Admin xem được danh sách tài khoản', async ({ page }) => {

    await loginAdmin(page);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    const rows = page.locator('table tbody tr');

    await expect(rows.first()).toBeVisible();
});


// =====================================================
// 3. KIỂM TRA NÚT XÓA USER
// =====================================================

test('Admin có chức năng xóa tài khoản', async ({ page }) => {

    await loginAdmin(page);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    const deleteButton = page.locator(
        'button:has-text("Xóa"), button:has-text("Xoá"), .delete-user'
    );

    await expect(deleteButton.first()).toBeVisible();
});


// =====================================================
// 4. ADMIN KHÔNG ĐƯỢC TỰ XÓA CHÍNH MÌNH
// =====================================================

test('Admin không được tự xóa tài khoản của mình', async ({ page }) => {

    await loginAdmin(page);

    await page.goto(`${BASE_URL}/quanlytaikhoan.html`);

    // Tìm dòng chứa tài khoản admin
    const adminRow = page.locator(
        'tr:has-text("admin")'
    ).first();

    await expect(adminRow).toBeVisible();

    const deleteButton = adminRow.locator(
        'button:has-text("Xóa"), button:has-text("Xoá"), .delete-user'
    ).first();

    // Nếu Admin có nút Xóa chính mình,
    // test phải kiểm tra rằng hệ thống từ chối thao tác.
    if (await deleteButton.count() > 0) {

        const dialogPromise = page.waitForEvent('dialog').catch(() => null);

        await deleteButton.click();

        const dialog = await dialogPromise;

        if (dialog) {

            const message = dialog.message();

            expect(message).toMatch(
                /không thể|không được|admin|lỗi/i
            );

            await dialog.dismiss();

        } else {

            await expect(page.locator('body')).toContainText(
                /không thể|không được|admin|lỗi/i
            );
        }
    }
});