# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search-detail-contact.spec.js >> TC-DETAIL-07 - Kiểm tra hình ảnh phòng
- Location: tests\search-detail-contact.spec.js:485:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('img').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" locator('img').first() with timeout 5000ms
  - waiting for locator('img').first()
    10 × locator resolved to <img onerror="this.style.display='none'" src="http://localhost:3000/uploads/1791272864884-lan-que-phuong2 (1).png"/>
       - unexpected value "hidden"

```

```yaml
- link "🏠 Trang chủ":
  - /url: index.html
- heading "Lan Quế Phường" [level=1]
- paragraph: 6,000,000 VNĐ/tháng
- text: 📏 Diện tích 100.00 m² 🏠 Thành phố Hà Nội 🏘️ Phường xã Định Công 📍 Địa chỉ cụ thể Tôi tên là Bằng 🏠 Trạng thái 🟢 Còn trống
- heading "📝 Mô tả chi tiết" [level=3]
- text: sfrgzdfdfzzdfb
- heading "⭐ Đánh giá phòng trọ" [level=3]
- paragraph: Chưa có đánh giá nào cho phòng trọ này.
- heading "📍 Vị trí trên bản đồ" [level=3]
- button "Marker"
- button "Zoom in"
- button "Zoom out"
- link "Leaflet":
  - /url: https://leafletjs.com
- text: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, and others"
```

# Test source

```ts
  394 |     await expect(page.locator('body')).toBeVisible();
  395 | 
  396 | });
  397 | 
  398 | test('TC-DETAIL-01 - Xem chi tiết phòng', async ({ page }) => {
  399 | 
  400 |     await page.goto('http://localhost:3000/');
  401 | 
  402 |     // Chọn một phòng
  403 |     await page
  404 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  405 |         .getByRole('button')
  406 |         .click();
  407 | 
  408 |     // Kiểm tra đã chuyển sang trang chi tiết
  409 |     await expect(page).toHaveURL(/chitiet\.html/);
  410 | 
  411 | });
  412 | 
  413 | test('TC-DETAIL-02 - Kiểm tra thông tin phòng', async ({ page }) => {
  414 | 
  415 |     await page.goto('http://localhost:3000/');
  416 | 
  417 |     // Mở phòng
  418 |     await page
  419 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  420 |         .getByRole('button')
  421 |         .click();
  422 | 
  423 |     // Kiểm tra trang chi tiết có thông tin phòng
  424 |     await expect(page.locator('body')).toContainText('Lan Quế Phường');
  425 | 
  426 | });
  427 | 
  428 | test('TC-DETAIL-03 - Kiểm tra thông tin nội thất phòng', async ({ page }) => {
  429 | 
  430 |     await page.goto('http://localhost:3000/');
  431 | 
  432 |     // Mở phòng
  433 |     await page
  434 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  435 |         .getByRole('button')
  436 |         .click();
  437 | 
  438 |     // Kiểm tra trang chi tiết có thông tin nội thất
  439 |     await expect(page.locator('body')).toContainText('Nội thất');
  440 | 
  441 | });
  442 | 
  443 | test('TC-DETAIL-04 - Kiểm tra giá phòng', async ({ page }) => {
  444 | 
  445 |     await page.goto('http://localhost:3000/');
  446 | 
  447 |     await page
  448 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  449 |         .getByRole('button')
  450 |         .click();
  451 | 
  452 |     // Kiểm tra trang chi tiết có thông tin giá
  453 |     await expect(page.locator('body')).toContainText('Giá');
  454 | 
  455 | });
  456 | 
  457 | test('TC-DETAIL-05 - Kiểm tra địa chỉ phòng', async ({ page }) => {
  458 | 
  459 |     await page.goto('http://localhost:3000/');
  460 | 
  461 |     await page
  462 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  463 |         .getByRole('button')
  464 |         .click();
  465 | 
  466 |     // Kiểm tra trang chi tiết có thông tin địa chỉ
  467 |     await expect(page.locator('body')).toContainText('Địa chỉ');
  468 | 
  469 | });
  470 | 
  471 | test('TC-DETAIL-06 - Kiểm tra mô tả phòng', async ({ page }) => {
  472 | 
  473 |     await page.goto('http://localhost:3000/');
  474 | 
  475 |     await page
  476 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  477 |         .getByRole('button')
  478 |         .click();
  479 | 
  480 |     // Kiểm tra trang chi tiết có thông tin mô tả
  481 |     await expect(page.locator('body')).toContainText('Mô tả');
  482 | 
  483 | });
  484 | 
  485 | test('TC-DETAIL-07 - Kiểm tra hình ảnh phòng', async ({ page }) => {
  486 | 
  487 |     await page.goto('http://localhost:3000/');
  488 | 
  489 |     await page
  490 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  491 |         .getByRole('button')
  492 |         .click();
  493 | 
> 494 |     await expect(page.locator('img').first()).toBeVisible();
      |                                               ^ Error: expect(locator).toBeVisible() failed
  495 | });
  496 | 
  497 | 
  498 | test('TC-DETAIL-08 - Kiểm tra thông tin chủ phòng', async ({ page }) => {
  499 | 
  500 |     await page.goto('http://localhost:3000/');
  501 | 
  502 |     await page
  503 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  504 |         .getByRole('button')
  505 |         .click();
  506 | 
  507 |     await expect(page.locator('body')).toContainText('chủ');
  508 | });
  509 | 
  510 | 
  511 | test('TC-DETAIL-09 - Kiểm tra nút quay lại', async ({ page }) => {
  512 | 
  513 |     await page.goto('http://localhost:3000/');
  514 | 
  515 |     await page
  516 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  517 |         .getByRole('button')
  518 |         .click();
  519 | 
  520 |     await page.goBack();
  521 | 
  522 |     await expect(page).toHaveURL(/localhost:3000/);
  523 | });
  524 | 
  525 | 
  526 | test('TC-DETAIL-10 - Kiểm tra trang chi tiết không bị lỗi', async ({ page }) => {
  527 | 
  528 |     await page.goto('http://localhost:3000/');
  529 | 
  530 |     await page
  531 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  532 |         .getByRole('button')
  533 |         .click();
  534 | 
  535 |     await expect(page.locator('body')).not.toContainText('Cannot GET');
  536 |     await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
  537 | });
```