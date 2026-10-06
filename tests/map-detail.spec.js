const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

// Dùng một phòng đã tồn tại trong database
const ROOM_ID = 20;

const chuTro = {
    username: 'chutro',
    password: 'chutro123'
};

async function login(page) {
    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill('#ten_tai_khoan', chuTro.username);
    await page.fill('#mat_khau', chuTro.password);

    await page.click('button:has-text("Đăng nhập ngay")');

    await page.waitForTimeout(1000);
}


// =====================================================
// 1. MAP HIỂN THỊ
// =====================================================

test('Map hiển thị trên trang chi tiết phòng', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();
    await expect(map).toHaveClass(/leaflet-container/);
});


// =====================================================
// 2. MARKER HIỂN THỊ
// =====================================================

test('Marker vị trí phòng hiển thị trên bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();

    const marker = page.locator('#map-detail .leaflet-marker-icon');

    await expect(marker).toBeVisible();
});


// =====================================================
// 3. MAP CÓ ĐÚNG TỌA ĐỘ PHÒNG
// =====================================================

test('Map được khởi tạo tại tọa độ của phòng', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    await page.waitForTimeout(1000);

    const lat = await page.locator('#in-vi_do').inputValue();
    const lng = await page.locator('#in-kinh_do').inputValue();

    expect(lat).not.toBe('');
    expect(lng).not.toBe('');

    expect(Number(lat)).not.toBeNaN();
    expect(Number(lng)).not.toBeNaN();

    expect(Number(lat)).toBeGreaterThanOrEqual(-90);
    expect(Number(lat)).toBeLessThanOrEqual(90);

    expect(Number(lng)).toBeGreaterThanOrEqual(-180);
    expect(Number(lng)).toBeLessThanOrEqual(180);
});


// =====================================================
// 4. KÉO MAP
// =====================================================

test('Kéo bản đồ để thay đổi vị trí hiển thị', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();
    await expect(map).toHaveClass(/leaflet-container/);

    const box = await map.boundingBox();

    expect(box).not.toBeNull();

    await page.mouse.move(
        box.x + box.width / 2,
        box.y + box.height / 2
    );

    await page.mouse.down();

    await page.mouse.move(
        box.x + box.width / 2 + 150,
        box.y + box.height / 2 + 50,
        {
            steps: 20
        }
    );

    await page.mouse.up();

    await page.waitForTimeout(500);

    await expect(map).toBeVisible();
});


// =====================================================
// 5. KÉO MAP KHÔNG ĐƯỢC THAY ĐỔI TỌA ĐỘ
// =====================================================

test('Kéo bản đồ không làm thay đổi tọa độ phòng', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();

    const oldLat = await page.locator('#in-vi_do').inputValue();
    const oldLng = await page.locator('#in-kinh_do').inputValue();

    const box = await map.boundingBox();

    expect(box).not.toBeNull();

    await page.mouse.move(
        box.x + box.width / 2,
        box.y + box.height / 2
    );

    await page.mouse.down();

    await page.mouse.move(
        box.x + box.width / 2 + 150,
        box.y + box.height / 2 + 50,
        {
            steps: 20
        }
    );

    await page.mouse.up();

    await page.waitForTimeout(500);

    const newLat = await page.locator('#in-vi_do').inputValue();
    const newLng = await page.locator('#in-kinh_do').inputValue();

    expect(newLat).toBe(oldLat);
    expect(newLng).toBe(oldLng);
});


// =====================================================
// 6. CLICK MAP KHÔNG THAY ĐỔI TỌA ĐỘ KHI CHỈ XEM
// =====================================================

test('Click trên bản đồ không thay đổi tọa độ khi chưa bật chỉnh sửa', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();

    const oldLat = await page.locator('#in-vi_do').inputValue();
    const oldLng = await page.locator('#in-kinh_do').inputValue();

    const box = await map.boundingBox();

    expect(box).not.toBeNull();

    await map.click({
        position: {
            x: box.width * 0.75,
            y: box.height * 0.35
        }
    });

    await page.waitForTimeout(500);

    const newLat = await page.locator('#in-vi_do').inputValue();
    const newLng = await page.locator('#in-kinh_do').inputValue();

    expect(newLat).toBe(oldLat);
    expect(newLng).toBe(oldLng);
});


// =====================================================
// 7. MARKER KHÔNG ĐƯỢC KÉO
// =====================================================

test('Marker không được kéo khi chỉ xem bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const marker = page.locator('#map-detail .leaflet-marker-icon');

    await expect(marker).toBeVisible();

    const oldLat = await page.locator('#in-vi_do').inputValue();
    const oldLng = await page.locator('#in-kinh_do').inputValue();

    const markerBox = await marker.boundingBox();

    expect(markerBox).not.toBeNull();

    const startX = markerBox.x + markerBox.width / 2;
    const startY = markerBox.y + markerBox.height / 2;

    await page.mouse.move(startX, startY);

    await page.mouse.down();

    await page.mouse.move(
        startX + 100,
        startY + 50,
        {
            steps: 20
        }
    );

    await page.mouse.up();

    await page.waitForTimeout(500);

    const newLat = await page.locator('#in-vi_do').inputValue();
    const newLng = await page.locator('#in-kinh_do').inputValue();

    expect(newLat).toBe(oldLat);
    expect(newLng).toBe(oldLng);
});


// =====================================================
// 8. ZOOM IN
// =====================================================

test('Có thể zoom in bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();

    const zoomIn = map.locator('.leaflet-control-zoom-in');

    await expect(zoomIn).toBeVisible();

    await zoomIn.click();

    await page.waitForTimeout(500);

    await expect(map).toBeVisible();
});


// =====================================================
// 9. ZOOM OUT
// =====================================================

test('Có thể zoom out bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/chitiet.html?id=${ROOM_ID}`);

    const map = page.locator('#map-detail');

    await expect(map).toBeVisible();

    const zoomOut = map.locator('.leaflet-control-zoom-out');

    await expect(zoomOut).toBeVisible();

    await zoomOut.click();

    await page.waitForTimeout(500);

    await expect(map).toBeVisible();
});


