# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search-detail-contact.spec.js >> TC-DETAIL-03 - Kiểm tra thông tin nội thất phòng
- Location: tests\search-detail-contact.spec.js:428:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('body')
Timeout: 5000ms
- Expected substring  -   1
+ Received string     + 203

- Nội thất
+
+
+
+     🏠 Trang chủ
+     🏠 Phòng của tôi
+     🔔 Thông báo
+
+
+
+     
+         ✏️ Sửa thông tin phòng
+         💾 Lưu thay đổi
+     
+
+     
+             
+         
+
+     
+         Lan Quế Phường
+         
+
+         6,000,000 VNĐ/tháng
+         
+
+         
+             
+                 📏 Diện tích
+                 100.00 m²
+                 
+             
+             
+                 🏠 Thành phố
+                 Hà Nội
+                 
+             
+             
+                 🏘️ Phường xã
+                 Định Công
+                 
+             
+             
+                 📍 Địa chỉ cụ thể
+                 Tôi tên là Bằng
+                 
+             
+             
+                 🏠 Trạng thái
+                 🟢 Còn trống
+                 
+                     Còn trống
+                     Ở ghép
+                     Đã thuê
+                 
+             
+         
+
+         
+         
+             
+                 📞 Liên hệ chủ phòng
+                 Đăng nhập để xem
+             
+         
+
+         📝 Mô tả chi tiết
+         sfrgzdfdfzzdfb
+         
+     
+
+     
+
+     
+
+         
+         
+
+         
+             🏠 ĐẶT PHÒNG
+         
+
+         
+             💬 CHAT
+         
+
+         
+             📞 LIÊN HỆ
+         
+
+     
+
+
+     
+     
+         ⭐ Đánh giá phòng trọ
+         Chưa có đánh giá nào cho phòng trọ này.
+     
+
+     
+         📍 Vị trí trên bản đồ
+         💡 Mẹo: Bạn có thể click chuột vào điểm bất kỳ trên bản đồ để cập nhật lại vị trí phòng trọ!
+         +− Leaflet | Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, and others
+     
+     
+     
+     
+
+
+
+
+
+
+     
+         
+             C
+             
+                 Chủ phòng
+                 Đang hoạt động
+             
+         
+         ×
+     
+     
+         
+             💬
+             Bắt đầu cuộc trò chuyện với chủ phòng
+         
+     
+     
+         
+             
+             
+             
+         
+     
+     
+         
+         
+             
+                 
+                 
+             
+         
+     
+
+
+
+
+     
+         
+         
+             🏠 Đặt phòng trọ
+             Hoàn tất thông tin để đặt phòng
+         
+
+         
+         
+             
+                 Họ và tên *
+                 
+                 
+             
+
+             
+                 Số điện thoại *
+                 
+                 
+             
+
+             
+                 
+                     Ngày sinh *
+                     
+                     
+                 
+
+                 
+                     Ngày nhận phòng *
+                     
+                     
+                 
+             
+
+             
+                 Số người ở
+                 
+             
+         
+
+         
+         
+             
+                 ❌ Hủy bỏ
+                 
+                     ✅ ĐẶT PHÒNG
+                 
+             
+         
+     
+
+
+
+

Call log:
  - Expect "toContainText" locator('body') with timeout 5000ms
  - waiting for locator('body')
    - locator resolved to <body>…</body>
    - unexpected value "


    🏠 Trang chủ
    🏠 Phòng của tôi
    🔔 Thông báo



    
        ✏️ Sửa thông tin phòng
        💾 Lưu thay đổi
    

    

    
        Đang tải dữ liệu...
        

        
        

        
            
                📏 Diện tích
                
                
            
            
                🏠 Thành phố
                
                
            
            
                🏘️ Phường xã
                
                
            
            
                📍 Địa chỉ cụ thể
                
                
            
            
                🏠 Trạng thái
                
                
                    Còn trống
                    Ở ghép
                    Đã thuê
                
            
        

        
        
            
                📞 Liên hệ chủ phòng
                Đăng nhập để xem
            
        

        📝 Mô tả chi tiết
        
        
    

    

    

        
        

        
            🏠 ĐẶT PHÒNG
        

        
            💬 CHAT
        

        
            📞 LIÊN HỆ
        

    


    
    
        ⭐ Đánh giá phòng trọ
        
            Đang tải đánh giá...
        
    

    
        📍 Vị trí trên bản đồ
        💡 Mẹo: Bạn có thể click chuột vào điểm bất kỳ trên bản đồ để cập nhật lại vị trí phòng trọ!
        
    
    
    
    






    
        
            C
            
                Chủ phòng
                Đang hoạt động
            
        
        ×
    
    
        
            💬
            Bắt đầu cuộc trò chuyện với chủ phòng
        
    
    
        
            
            
            
        
    
    
        
        
            
                
                
            
        
    




    
        
        
            🏠 Đặt phòng trọ
            Hoàn tất thông tin để đặt phòng
        

        
        
            
                Họ và tên *
                
                
            

            
                Số điện thoại *
                
                
            

            
                
                    Ngày sinh *
                    
                    
                

                
                    Ngày nhận phòng *
                    
                    
                
            

            
                Số người ở
                
            
        

        
        
            
                ❌ Hủy bỏ
                
                    ✅ ĐẶT PHÒNG
                
            
        
    



"
    - locator resolved to <body>…</body>
    - unexpected value "


    🏠 Trang chủ
    🏠 Phòng của tôi
    🔔 Thông báo



    
        ✏️ Sửa thông tin phòng
        💾 Lưu thay đổi
    

    
            
        

    
        Lan Quế Phường
        

        6,000,000 VNĐ/tháng
        

        
            
                📏 Diện tích
                100.00 m²
                
            
            
                🏠 Thành phố
                Hà Nội
                
            
            
                🏘️ Phường xã
                Định Công
                
            
            
                📍 Địa chỉ cụ thể
                Tôi tên là Bằng
                
            
            
                🏠 Trạng thái
                🟢 Còn trống
                
                    Còn trống
                    Ở ghép
                    Đã thuê
                
            
        

        
        
            
                📞 Liên hệ chủ phòng
                Đăng nhập để xem
            
        

        📝 Mô tả chi tiết
        sfrgzdfdfzzdfb
        
    

    

    

        
        

        
            🏠 ĐẶT PHÒNG
        

        
            💬 CHAT
        

        
            📞 LIÊN HỆ
        

    


    
    
        ⭐ Đánh giá phòng trọ
        
            Đang tải đánh giá...
        
    

    
        📍 Vị trí trên bản đồ
        💡 Mẹo: Bạn có thể click chuột vào điểm bất kỳ trên bản đồ để cập nhật lại vị trí phòng trọ!
        +− Leaflet | Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, and others
    
    
    
    






    
        
            C
            
                Chủ phòng
                Đang hoạt động
            
        
        ×
    
    
        
            💬
            Bắt đầu cuộc trò chuyện với chủ phòng
        
    
    
        
            
            
            
        
    
    
        
        
            
                
                
            
        
    




    
        
        
            🏠 Đặt phòng trọ
            Hoàn tất thông tin để đặt phòng
        

        
        
            
                Họ và tên *
                
                
            

            
                Số điện thoại *
                
                
            

            
                
                    Ngày sinh *
                    
                    
                

                
                    Ngày nhận phòng *
                    
                    
                
            

            
                Số người ở
                
            
        

        
        
            
                ❌ Hủy bỏ
                
                    ✅ ĐẶT PHÒNG
                
            
        
    



"
    9 × locator resolved to <body>…</body>
      - unexpected value "


    🏠 Trang chủ
    🏠 Phòng của tôi
    🔔 Thông báo



    
        ✏️ Sửa thông tin phòng
        💾 Lưu thay đổi
    

    
            
        

    
        Lan Quế Phường
        

        6,000,000 VNĐ/tháng
        

        
            
                📏 Diện tích
                100.00 m²
                
            
            
                🏠 Thành phố
                Hà Nội
                
            
            
                🏘️ Phường xã
                Định Công
                
            
            
                📍 Địa chỉ cụ thể
                Tôi tên là Bằng
                
            
            
                🏠 Trạng thái
                🟢 Còn trống
                
                    Còn trống
                    Ở ghép
                    Đã thuê
                
            
        

        
        
            
                📞 Liên hệ chủ phòng
                Đăng nhập để xem
            
        

        📝 Mô tả chi tiết
        sfrgzdfdfzzdfb
        
    

    

    

        
        

        
            🏠 ĐẶT PHÒNG
        

        
            💬 CHAT
        

        
            📞 LIÊN HỆ
        

    


    
    
        ⭐ Đánh giá phòng trọ
        Chưa có đánh giá nào cho phòng trọ này.
    

    
        📍 Vị trí trên bản đồ
        💡 Mẹo: Bạn có thể click chuột vào điểm bất kỳ trên bản đồ để cập nhật lại vị trí phòng trọ!
        +− Leaflet | Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, and others
    
    
    
    






    
        
            C
            
                Chủ phòng
                Đang hoạt động
            
        
        ×
    
    
        
            💬
            Bắt đầu cuộc trò chuyện với chủ phòng
        
    
    
        
            
            
            
        
    
    
        
        
            
                
                
            
        
    




    
        
        
            🏠 Đặt phòng trọ
            Hoàn tất thông tin để đặt phòng
        

        
        
            
                Họ và tên *
                
                
            

            
                Số điện thoại *
                
                
            

            
                
                    Ngày sinh *
                    
                    
                

                
                    Ngày nhận phòng *
                    
                    
                
            

            
                Số người ở
                
            
        

        
        
            
                ❌ Hủy bỏ
                
                    ✅ ĐẶT PHÒNG
                
            
        
    



"

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
  339 | 
  340 |     await page
  341 |         .getByRole('button', { name: ' TÌM KIẾM' })
  342 |         .click();
  343 | 
  344 |     // Thay đổi bộ lọc: giá 5 - 10 triệu
  345 |     await page
  346 |         .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
  347 |         .fill('5000000');
  348 | 
  349 |     await page
  350 |         .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
  351 |         .fill('10000000');
  352 | 
  353 |     await page
  354 |         .getByRole('button', { name: ' TÌM KIẾM' })
  355 |         .click();
  356 | 
  357 | });
  358 | 
  359 | test('TC-SEARCH-15 - Khoảng giá không hợp lệ', async ({ page }) => {
  360 | 
  361 |     await page.goto('http://localhost:3000/');
  362 | 
  363 |     // Nhập khoảng giá không hợp lệ: thấp > cao
  364 |     await page
  365 |         .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
  366 |         .fill('5000000');
  367 | 
  368 |     await page
  369 |         .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
  370 |         .fill('2000000');
  371 | 
  372 |     // Bấm tìm kiếm
  373 |     await page
  374 |         .getByRole('button', { name: ' TÌM KIẾM' })
  375 |         .click();
  376 | 
  377 | });
  378 | 
  379 | test('TC-SEARCH-16 - Kiểm tra SQL Injection', async ({ page }) => {
  380 | 
  381 |     await page.goto('http://localhost:3000/');
  382 | 
  383 |     // Nhập chuỗi SQL Injection
  384 |     await page
  385 |         .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
  386 |         .fill("' OR '1'='1");
  387 | 
  388 |     // Bấm tìm kiếm
  389 |     await page
  390 |         .getByRole('button', { name: ' TÌM KIẾM' })
  391 |         .click();
  392 | 
  393 |     // Kiểm tra trang vẫn hoạt động bình thường
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
> 439 |     await expect(page.locator('body')).toContainText('Nội thất');
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  440 | 
  441 | });
```