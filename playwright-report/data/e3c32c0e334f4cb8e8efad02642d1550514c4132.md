# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search-detail-contact.spec.js >> TC-CONTACT-09 - Không trả về số điện thoại khi chưa đăng nhập
- Location: tests\search-detail-contact.spec.js:634:5

# Error details

```
Error: expect(received).not.toHaveProperty(path)

Expected path: not "so_dien_thoai"

Received value: null
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e3]:
    - generic [ref=e4]: 🏠 PHONGTRO
    - generic [ref=e5]:
      - link "Đăng nhập" [ref=e6] [cursor=pointer]:
        - /url: dangnhap.html
      - link "Đăng ký" [ref=e7] [cursor=pointer]:
        - /url: dangky.html
  - generic [ref=e8]:
    - heading " Khám phá không gian sống mới" [level=1] [ref=e9]:
      - generic [ref=e10]: 
      - text: Khám phá không gian sống mới
    - paragraph [ref=e11]: Tìm kiếm phòng trọ nhanh chóng, an toàn và hiện đại với hàng nghìn lựa chọn
  - generic [ref=e12]:
    - generic [ref=e13]:
      - textbox "🔍 Tên phòng, khu vực, địa chỉ..." [ref=e14]
      - button " TÌM KIẾM" [ref=e15] [cursor=pointer]:
        - generic [ref=e16]: 
        - text: TÌM KIẾM
    - generic [ref=e17]:
      - combobox [ref=e19]:
        - option "🏙️ Chọn thành phố" [selected]
        - option "Hà Nội"
        - option "Hải Phòng"
        - option "Thành phố Hồ Chí Minh"
      - combobox [ref=e21]:
        - option "🏘️ Chọn phường xã" [selected]
      - generic [ref=e22]:
        - spinbutton "💰 Giá thấp nhất (VNĐ)" [ref=e23]
        - spinbutton "💰 Giá cao nhất (VNĐ)" [ref=e24]
    - generic [ref=e25]:
      - combobox [ref=e26]:
        - 'option "🕒 Sắp xếp: Mới nhất" [selected]'
        - 'option "📈 Giá: Thấp → Cao"'
        - 'option "📉 Giá: Cao → Thấp"'
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: 
          - text: "Bộ lọc:"
        - button " Trạng thái" [ref=e30] [cursor=pointer]:
          - generic [ref=e31]: 
          - text: Trạng thái
        - button " Nội thất" [ref=e32] [cursor=pointer]:
          - generic [ref=e33]: 
          - text: Nội thất
    - text:  
  - generic [ref=e34]:
    - heading "✨ Danh sách phòng trọ nổi bật" [level=2] [ref=e35]
    - generic [ref=e36]:
      - link "Lan Quế Phường Lan Quế Phường 6,000,000 VNĐ/tháng  Tôi tên là Bằng 🟢 Còn trống  Xem chi tiết" [ref=e37] [cursor=pointer]:
        - /url: chitiet.html?id=16
        - generic [ref=e38]:
          - img "Lan Quế Phường" [ref=e39]
          - generic [ref=e40]:
            - generic [ref=e41]: Lan Quế Phường
            - generic [ref=e42]: 6,000,000 VNĐ/tháng
            - generic [ref=e43]:
              - generic [ref=e44]: 
              - text: Tôi tên là Bằng
            - generic [ref=e45]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e47]:
            - generic [ref=e48]: 
            - text: Xem chi tiết
      - link "Phòng trọ giá rẻ gần Đại học Hà Nội Phòng trọ giá rẻ gần Đại học Hà Nội 2,500,000 VNĐ/tháng  123 Nguyễn Trãi, Thanh Xuân 🟢 Còn trống  Xem chi tiết" [ref=e49] [cursor=pointer]:
        - /url: chitiet.html?id=1
        - generic [ref=e50]:
          - img "Phòng trọ giá rẻ gần Đại học Hà Nội" [ref=e51]
          - generic [ref=e52]:
            - generic [ref=e53]: Phòng trọ giá rẻ gần Đại học Hà Nội
            - generic [ref=e54]: 2,500,000 VNĐ/tháng
            - generic [ref=e55]:
              - generic [ref=e56]: 
              - text: 123 Nguyễn Trãi, Thanh Xuân
            - generic [ref=e57]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e59]:
            - generic [ref=e60]: 
            - text: Xem chi tiết
      - link "Phòng studio full nội thất Nguyễn Trãi Phòng studio full nội thất Nguyễn Trãi 3,500,000 VNĐ/tháng  256 Nguyễn Trãi, Thanh Xuân 🟢 Còn trống  Xem chi tiết" [ref=e61] [cursor=pointer]:
        - /url: chitiet.html?id=2
        - generic [ref=e62]:
          - img "Phòng studio full nội thất Nguyễn Trãi" [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]: Phòng studio full nội thất Nguyễn Trãi
            - generic [ref=e66]: 3,500,000 VNĐ/tháng
            - generic [ref=e67]:
              - generic [ref=e68]: 
              - text: 256 Nguyễn Trãi, Thanh Xuân
            - generic [ref=e69]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e71]:
            - generic [ref=e72]: 
            - text: Xem chi tiết
      - link "Phòng trọ sinh viên gần Đại học Thủy Lợi Phòng trọ sinh viên gần Đại học Thủy Lợi 2,200,000 VNĐ/tháng  45 Tây Sơn, Đống Đa 🟢 Còn trống  Xem chi tiết" [ref=e73] [cursor=pointer]:
        - /url: chitiet.html?id=3
        - generic [ref=e74]:
          - img "Phòng trọ sinh viên gần Đại học Thủy Lợi" [ref=e75]
          - generic [ref=e76]:
            - generic [ref=e77]: Phòng trọ sinh viên gần Đại học Thủy Lợi
            - generic [ref=e78]: 2,200,000 VNĐ/tháng
            - generic [ref=e79]:
              - generic [ref=e80]: 
              - text: 45 Tây Sơn, Đống Đa
            - generic [ref=e81]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e83]:
            - generic [ref=e84]: 
            - text: Xem chi tiết
      - link "Căn hộ mini full đồ tại Đống Đa Căn hộ mini full đồ tại Đống Đa 4,500,000 VNĐ/tháng  78 Chùa Láng, Đống Đa 🟢 Còn trống  Xem chi tiết" [ref=e85] [cursor=pointer]:
        - /url: chitiet.html?id=4
        - generic [ref=e86]:
          - img "Căn hộ mini full đồ tại Đống Đa" [ref=e87]
          - generic [ref=e88]:
            - generic [ref=e89]: Căn hộ mini full đồ tại Đống Đa
            - generic [ref=e90]: 4,500,000 VNĐ/tháng
            - generic [ref=e91]:
              - generic [ref=e92]: 
              - text: 78 Chùa Láng, Đống Đa
            - generic [ref=e93]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e95]:
            - generic [ref=e96]: 
            - text: Xem chi tiết
      - link "Phòng đẹp giá tốt Cầu Giấy Phòng đẹp giá tốt Cầu Giấy 3,000,000 VNĐ/tháng  88 Trần Thái Tông, Cầu Giấy 🟢 Còn trống  Xem chi tiết" [ref=e97] [cursor=pointer]:
        - /url: chitiet.html?id=5
        - generic [ref=e98]:
          - img "Phòng đẹp giá tốt Cầu Giấy" [ref=e99]
          - generic [ref=e100]:
            - generic [ref=e101]: Phòng đẹp giá tốt Cầu Giấy
            - generic [ref=e102]: 3,000,000 VNĐ/tháng
            - generic [ref=e103]:
              - generic [ref=e104]: 
              - text: 88 Trần Thái Tông, Cầu Giấy
            - generic [ref=e105]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e107]:
            - generic [ref=e108]: 
            - text: Xem chi tiết
      - link "Studio cao cấp gần Đại học Quốc gia Studio cao cấp gần Đại học Quốc gia 5,000,000 VNĐ/tháng  120 Xuân Thủy, Cầu Giấy 🟢 Còn trống  Xem chi tiết" [ref=e109] [cursor=pointer]:
        - /url: chitiet.html?id=6
        - generic [ref=e110]:
          - img "Studio cao cấp gần Đại học Quốc gia" [ref=e111]
          - generic [ref=e112]:
            - generic [ref=e113]: Studio cao cấp gần Đại học Quốc gia
            - generic [ref=e114]: 5,000,000 VNĐ/tháng
            - generic [ref=e115]:
              - generic [ref=e116]: 
              - text: 120 Xuân Thủy, Cầu Giấy
            - generic [ref=e117]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e119]:
            - generic [ref=e120]: 
            - text: Xem chi tiết
      - link "Phòng trọ trung tâm Hải Phòng Phòng trọ trung tâm Hải Phòng 2,000,000 VNĐ/tháng  25 Lạch Tray, Ngô Quyền 🟢 Còn trống  Xem chi tiết" [ref=e121] [cursor=pointer]:
        - /url: chitiet.html?id=7
        - generic [ref=e122]:
          - img "Phòng trọ trung tâm Hải Phòng" [ref=e123]
          - generic [ref=e124]:
            - generic [ref=e125]: Phòng trọ trung tâm Hải Phòng
            - generic [ref=e126]: 2,000,000 VNĐ/tháng
            - generic [ref=e127]:
              - generic [ref=e128]: 
              - text: 25 Lạch Tray, Ngô Quyền
            - generic [ref=e129]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e131]:
            - generic [ref=e132]: 
            - text: Xem chi tiết
      - link "Phòng studio Hải Phòng full nội thất Phòng studio Hải Phòng full nội thất 3,200,000 VNĐ/tháng  80 Văn Cao, Ngô Quyền 🟢 Còn trống  Xem chi tiết" [ref=e133] [cursor=pointer]:
        - /url: chitiet.html?id=8
        - generic [ref=e134]:
          - img "Phòng studio Hải Phòng full nội thất" [ref=e135]
          - generic [ref=e136]:
            - generic [ref=e137]: Phòng studio Hải Phòng full nội thất
            - generic [ref=e138]: 3,200,000 VNĐ/tháng
            - generic [ref=e139]:
              - generic [ref=e140]: 
              - text: 80 Văn Cao, Ngô Quyền
            - generic [ref=e141]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e143]:
            - generic [ref=e144]: 
            - text: Xem chi tiết
      - link "Phòng giá rẻ gần Đại học Hàng Hải Phòng giá rẻ gần Đại học Hàng Hải 1,800,000 VNĐ/tháng  150 Lê Thánh Tông, Ngô Quyền 🟢 Còn trống  Xem chi tiết" [ref=e145] [cursor=pointer]:
        - /url: chitiet.html?id=9
        - generic [ref=e146]:
          - img "Phòng giá rẻ gần Đại học Hàng Hải" [ref=e147]
          - generic [ref=e148]:
            - generic [ref=e149]: Phòng giá rẻ gần Đại học Hàng Hải
            - generic [ref=e150]: 1,800,000 VNĐ/tháng
            - generic [ref=e151]:
              - generic [ref=e152]: 
              - text: 150 Lê Thánh Tông, Ngô Quyền
            - generic [ref=e153]: 🟢 Còn trống
          - button " Xem chi tiết" [ref=e155]:
            - generic [ref=e156]: 
            - text: Xem chi tiết
  - contentinfo [ref=e157]:
    - heading " Cần hỗ trợ? Liên hệ ngay!" [level=3] [ref=e158]:
      - generic [ref=e159]: 
      - text: Cần hỗ trợ? Liên hệ ngay!
    - generic [ref=e160]:
      - 'link " Gọi ngay: **** *** ***" [ref=e161] [cursor=pointer]':
        - /url: tel:0987654321
        - generic [ref=e162]: 
        - text: "Gọi ngay: **** *** ***"
      - link [ref=e163] [cursor=pointer]:
        - /url: https://zalo.me/0912345678
        - img "Zalo" [ref=e164]
        - text: "Zalo: **** *** ***"
    - paragraph [ref=e165]:
      - generic [ref=e166]: 
      - text: Hỗ trợ 24/7 - Tư vấn tận tình - Miễn phí hoàn toàn
```

# Test source

```ts
  551 | 
  552 | test('TC-CONTACT-02 - Kiểm tra thông tin liên hệ phòng', async ({ page }) => {
  553 | 
  554 |     await page.goto('http://localhost:3000/');
  555 | 
  556 |     await page
  557 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  558 |         .getByRole('button')
  559 |         .click();
  560 | 
  561 |     await expect(page.locator('body')).toContainText('Liên hệ');
  562 | });
  563 | 
  564 | 
  565 | test('TC-CONTACT-03 - Kiểm tra số điện thoại khi chưa đăng nhập', async ({ page }) => {
  566 | 
  567 |     await page.goto('http://localhost:3000/');
  568 | 
  569 |     await page
  570 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  571 |         .getByRole('button')
  572 |         .click();
  573 | 
  574 |     // Trang vẫn phải hoạt động
  575 |     await expect(page.locator('body')).toBeVisible();
  576 | });
  577 | 
  578 | 
  579 | test('TC-CONTACT-04 - Kiểm tra yêu cầu đăng nhập khi xem liên hệ', async ({ page }) => {
  580 | 
  581 |     await page.goto('http://localhost:3000/');
  582 | 
  583 |     await page
  584 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  585 |         .getByRole('button')
  586 |         .click();
  587 | 
  588 |     await expect(page.locator('body')).not.toContainText('Cannot GET');
  589 | });
  590 | 
  591 | 
  592 | test('TC-CONTACT-05 - Kiểm tra thông tin liên hệ sau khi đăng nhập', async ({ page }) => {
  593 | 
  594 |     await page.goto('http://localhost:3000/');
  595 | 
  596 |     await expect(page.locator('body')).toBeVisible();
  597 | });
  598 | 
  599 | 
  600 | test('TC-CONTACT-06 - Kiểm tra quyền truy cập thông tin liên hệ', async ({ page }) => {
  601 | 
  602 |     await page.goto('http://localhost:3000/');
  603 | 
  604 |     await expect(page.locator('body')).toBeVisible();
  605 | });
  606 | 
  607 | 
  608 | test('TC-CONTACT-07 - Kiểm tra thông tin liên hệ không bị lỗi', async ({ page }) => {
  609 | 
  610 |     await page.goto('http://localhost:3000/');
  611 | 
  612 |     await page
  613 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  614 |         .getByRole('button')
  615 |         .click();
  616 | 
  617 |     await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
  618 | });
  619 | 
  620 | 
  621 | test('TC-CONTACT-08 - Kiểm tra trang liên hệ hoạt động', async ({ page }) => {
  622 | 
  623 |     await page.goto('http://localhost:3000/');
  624 | 
  625 |     await page
  626 |         .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
  627 |         .getByRole('button')
  628 |         .click();
  629 | 
  630 |     await expect(page.locator('body')).toBeVisible();
  631 | });
  632 | 
  633 | 
  634 | test('TC-CONTACT-09 - Không trả về số điện thoại khi chưa đăng nhập', async ({ page }) => {
  635 | 
  636 |     await page.goto('http://localhost:3000/');
  637 | 
  638 |     const response = await page.request.get(
  639 |         'http://localhost:3000/phongtro'
  640 |     );
  641 | 
  642 |     expect(response.ok()).toBeTruthy();
  643 | 
  644 |     const data = await response.json();
  645 | 
  646 |     const rooms = Array.isArray(data)
  647 |         ? data
  648 |         : (data.data || data.rooms || []);
  649 | 
  650 |     for (const room of rooms) {
> 651 |         expect(room).not.toHaveProperty('so_dien_thoai');
      |                          ^ Error: expect(received).not.toHaveProperty(path)
  652 |         expect(room).not.toHaveProperty('sdt');
  653 |         expect(room).not.toHaveProperty('phone');
  654 |         expect(room).not.toHaveProperty('dien_thoai');
  655 |     }
  656 | });
```