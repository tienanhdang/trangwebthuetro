const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

// ID phòng thực tế trong database
const ROOM_ID = 20;

const chuTro = {
    username: 'chutro',
    password: 'chutro123'
};

// ================================
// Hàm đăng nhập
// ================================
async function login(page) {
    await page.goto(`${BASE_URL}/dangnhap.html`);

    await page.fill('#ten_tai_khoan', chuTro.username);
    await page.fill('#mat_khau', chuTro.password);

    await page.click('button:has-text("Đăng nhập ngay")');

    await page.waitForTimeout(1000);
}


// ============================================================
// 1. Map hiển thị trên trang sửa phòng
// ============================================================
test('Map hiển thị trên trang sửa phòng', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');

    await expect(map).toBeVisible();
    await expect(map).toHaveClass(/leaflet-container/);
});


// ============================================================
// 2. Marker vị trí phòng hiển thị
// ============================================================
test('Marker vị trí phòng hiển thị', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');
    const marker = map.locator('.leaflet-marker-icon');

    await expect(map).toBeVisible();
    await expect(marker).toBeVisible();
});


// ============================================================
// 3. Tọa độ phòng cũ được load vào form
// ============================================================
test('Tọa độ phòng cũ được load vào form', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const lat = page.locator('#lat');
    const lng = page.locator('#lng');

    await expect(lat).not.toHaveValue('');
    await expect(lng).not.toHaveValue('');

    const latValue = await lat.inputValue();
    const lngValue = await lng.inputValue();

    expect(Number(latValue)).not.toBeNaN();
    expect(Number(lngValue)).not.toBeNaN();

    expect(Number(latValue)).toBeGreaterThanOrEqual(-90);
    expect(Number(latValue)).toBeLessThanOrEqual(90);

    expect(Number(lngValue)).toBeGreaterThanOrEqual(-180);
    expect(Number(lngValue)).toBeLessThanOrEqual(180);
});


// ============================================================
// 4. Click trên map cập nhật tọa độ
// ============================================================
test('Click trên map cập nhật tọa độ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');

    await expect(map).toBeVisible();

    const oldLat = await page.locator('#lat').inputValue();
    const oldLng = await page.locator('#lng').inputValue();

    const box = await map.boundingBox();

    expect(box).not.toBeNull();

    await map.click({
        position: {
            x: box.width * 0.7,
            y: box.height * 0.4
        }
    });

    await page.waitForTimeout(500);

    const newLat = await page.locator('#lat').inputValue();
    const newLng = await page.locator('#lng').inputValue();

    console.log('Tọa độ cũ:', oldLat, oldLng);
    console.log('Tọa độ mới:', newLat, newLng);

    expect(newLat).not.toBe(oldLat);
    expect(newLng).not.toBe(oldLng);

    await expect(
        map.locator('.leaflet-marker-icon')
    ).toBeVisible();
});


// ============================================================
// 5. Kéo marker cập nhật tọa độ
// ============================================================
test('Kéo marker cập nhật tọa độ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');
    const marker = map.locator('.leaflet-marker-icon');

    await expect(map).toBeVisible();
    await expect(marker).toBeVisible();

    const oldLat = await page.locator('#lat').inputValue();
    const oldLng = await page.locator('#lng').inputValue();

    await marker.dragTo(map, {
        targetPosition: {
            x: 100,
            y: 100
        }
    });

    await page.waitForTimeout(1000);

    const newLat = await page.locator('#lat').inputValue();
    const newLng = await page.locator('#lng').inputValue();

    console.log('Tọa độ cũ:', oldLat, oldLng);
    console.log('Tọa độ mới:', newLat, newLng);

    expect(newLat).not.toBe(oldLat);
    expect(newLng).not.toBe(oldLng);
});


// ============================================================
// 6. Kéo map để di chuyển bản đồ
// ============================================================
test('Kéo map để di chuyển vị trí hiển thị', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');

    await expect(map).toBeVisible();

    const oldLat = await page.locator('#lat').inputValue();
    const oldLng = await page.locator('#lng').inputValue();

    const box = await map.boundingBox();

    expect(box).not.toBeNull();

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();

    await page.mouse.move(
        centerX + 150,
        centerY + 50,
        {
            steps: 20
        }
    );

    await page.mouse.up();

    await page.waitForTimeout(500);

    await expect(map).toBeVisible();

    const newLat = await page.locator('#lat').inputValue();
    const newLng = await page.locator('#lng').inputValue();

    // Kéo bản đồ chỉ di chuyển viewport,
    // không được thay đổi tọa độ phòng.
    expect(newLat).toBe(oldLat);
    expect(newLng).toBe(oldLng);
});


// ============================================================
// 7. Chọn thành phố cập nhật vị trí map
// ============================================================
test('Chọn thành phố cập nhật vị trí map', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const city = page.locator('#thanh_pho');
    const map = page.locator('#map-selection');

    await expect(city).toBeVisible();
    await expect(map).toBeVisible();

    await city.selectOption('Hà Nội');

    await page.waitForTimeout(1000);

    const lat = await page.locator('#lat').inputValue();
    const lng = await page.locator('#lng').inputValue();

    console.log('Tọa độ sau khi chọn Hà Nội:', lat, lng);

    expect(Number(lat)).not.toBeNaN();
    expect(Number(lng)).not.toBeNaN();

    await expect(
        map.locator('.leaflet-marker-icon')
    ).toBeVisible();
});





// ============================================================
// 9. Có thể zoom in
// ============================================================
test('Có thể zoom in bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');
    const zoomIn = map.locator('.leaflet-control-zoom-in');

    await expect(map).toBeVisible();
    await expect(zoomIn).toBeVisible();

    await zoomIn.click();

    await page.waitForTimeout(500);

    await expect(map).toBeVisible();
    await expect(
        map.locator('.leaflet-marker-icon')
    ).toBeVisible();
});


// ============================================================
// 10. Có thể zoom out
// ============================================================
test('Có thể zoom out bản đồ', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/suaphong.html?id=${ROOM_ID}`);

    const map = page.locator('#map-selection');
    const zoomOut = map.locator('.leaflet-control-zoom-out');

    await expect(map).toBeVisible();
    await expect(zoomOut).toBeVisible();

    await zoomOut.click();

    await page.waitForTimeout(500);

    await expect(map).toBeVisible();
    await expect(
        map.locator('.leaflet-marker-icon')
    ).toBeVisible();
});