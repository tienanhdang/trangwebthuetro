const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const chuTro = {
    username: 'chutro',
    password: 'chutro123'
};


// ================================
// HÀM ĐĂNG NHẬP
// ================================

async function login(page) {
    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill('#ten_tai_khoan', chuTro.username);
    await page.fill('#mat_khau', chuTro.password);

    await page.click('button:has-text("Đăng nhập ngay")');

    await page.waitForTimeout(1000);
}


// ================================
// 1. MAP HIỂN THỊ
// ================================

test('Map hiển thị trên trang đăng phòng', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    const map = page.locator('#map-selection');

    await expect(map).toBeVisible();

    // Leaflet gắn class leaflet-container trực tiếp
    // vào #map-selection
    await expect(map).toHaveClass(/leaflet-container/);
});


// ================================
// 2. TỌA ĐỘ MẶC ĐỊNH HÀ NỘI
// ================================

test('Map có tọa độ mặc định Hà Nội', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    await expect(page.locator('#lat'))
        .toHaveValue('21.0285');

    await expect(page.locator('#lng'))
        .toHaveValue('105.8542');
});


// ================================
// 3. MARKER XUẤT HIỆN
// ================================

test('Marker xuất hiện trên bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    const marker = page.locator('.leaflet-marker-icon');

    await expect(marker).toBeVisible();
});


// ================================
// 4. CHỌN HÀ NỘI
// ================================

test('Chọn Hà Nội cập nhật tọa độ bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    await page.selectOption('#thanh_pho', 'Hà Nội');

    await expect(page.locator('#lat'))
        .toHaveValue('21.0285');

    await expect(page.locator('#lng'))
        .toHaveValue('105.8542');
});


// ================================
// 5. CHỌN TP HỒ CHÍ MINH
// ================================

test('Chọn TP Hồ Chí Minh cập nhật tọa độ bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    await page.selectOption('#thanh_pho', 'Hồ Chí Minh');

    await expect(page.locator('#lat'))
        .toHaveValue('10.7769');

    await expect(page.locator('#lng'))
        .toHaveValue('106.7009');
});


// ================================
// 6. CLICK MAP ĐỂ ĐẶT MARKER
// ================================

test('Click trên bản đồ cập nhật tọa độ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    const map = page.locator('#map-selection');

    await expect(map).toBeVisible();

    const oldLat = await page.locator('#lat').inputValue();
    const oldLng = await page.locator('#lng').inputValue();

    await map.click({
        position: {
            x: 100,
            y: 100
        }
    });

    await page.waitForTimeout(500);

    await expect(page.locator('#lat'))
        .not.toHaveValue(oldLat);

    await expect(page.locator('#lng'))
        .not.toHaveValue(oldLng);

    await expect(page.locator('.leaflet-marker-icon'))
        .toBeVisible();
});


// ================================
// 7. KÉO MARKER
// ================================

test('Kéo marker cập nhật tọa độ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    const marker = page.locator('.leaflet-marker-icon');

    await expect(marker).toBeVisible();

    const oldLat = await page.locator('#lat').inputValue();
    const oldLng = await page.locator('#lng').inputValue();

    const map = page.locator('#map-selection');

    // Kéo marker tới một vị trí khác trong map
    await marker.dragTo(map, {
        targetPosition: {
            x: 100,
            y: 100
        }
    });

    // Chờ sự kiện dragend của Leaflet
    await page.waitForTimeout(500);

    const newLat = await page.locator('#lat').inputValue();
    const newLng = await page.locator('#lng').inputValue();

    console.log('Tọa độ cũ:', oldLat, oldLng);
    console.log('Tọa độ mới:', newLat, newLng);

    expect(newLat).not.toBe(oldLat);
    expect(newLng).not.toBe(oldLng);
});


// ================================
// 8. KÉO MAP ĐỂ DI CHUYỂN BẢN ĐỒ
// ================================

test('Kéo bản đồ để di chuyển vị trí hiển thị', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dangphong.html`);

    const map = page.locator('#map-selection');

    const box = await map.boundingBox();

    expect(box).not.toBeNull();

    // Lưu tọa độ marker
    const oldLat = await page.locator('#lat').inputValue();
    const oldLng = await page.locator('#lng').inputValue();

    // Bắt đầu kéo bản đồ
    await page.mouse.move(
        box.x + box.width / 2,
        box.y + box.height / 2
    );

    await page.mouse.down();

    // Kéo bản đồ sang vị trí khác
    await page.mouse.move(
        box.x + box.width / 2 + 150,
        box.y + box.height / 2 + 50
    );

    await page.mouse.up();

    await page.waitForTimeout(500);

    // Map vẫn phải hiển thị
    await expect(map).toBeVisible();

    // Quan trọng:
    // Kéo MAP không phải đặt marker,
    // nên tọa độ marker KHÔNG được thay đổi.
    await expect(page.locator('#lat'))
        .toHaveValue(oldLat);

    await expect(page.locator('#lng'))
        .toHaveValue(oldLng);
});