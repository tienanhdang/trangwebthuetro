# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authorization.spec.js >> Sinh viên không được truy cập trực tiếp trang quản lý tài khoản
- Location: tests\authorization.spec.js:109:1

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /quanlytaikhoan\.html/i
Received string: "http://localhost:3000/quanlytaikhoan.html"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="vi">…</html>
       - unexpected value "http://localhost:3000/quanlytaikhoan.html"

```

```yaml
- link " Quay lại trang chủ":
  - /url: index.html
- heading " Quản lý tài khoản" [level=2]
- text: 
- textbox "Tìm tên, email..."
- table:
  - rowgroup:
    - row "Người dùng Email / SĐT Vai trò Trạng thái Hành động":
      - columnheader "Người dùng"
      - columnheader "Email / SĐT"
      - columnheader "Vai trò"
      - columnheader "Trạng thái"
      - columnheader "Hành động"
  - rowgroup:
    - row "N Nguyễn Văn A @nguyenvana nguyenvana@example.com 0912345678 CHU_TRO Hoạt động  Xóa":
      - cell "N Nguyễn Văn A @nguyenvana":
        - text: "N"
        - strong: Nguyễn Văn A
        - text: "@nguyenvana"
      - cell "nguyenvana@example.com 0912345678"
      - cell "CHU_TRO"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "T Trần Thị B @tranthib tranthib@example.com 0923456789 CHU_TRO Hoạt động  Xóa":
      - cell "T Trần Thị B @tranthib":
        - text: T
        - strong: Trần Thị B
        - text: "@tranthib"
      - cell "tranthib@example.com 0923456789"
      - cell "CHU_TRO"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "L Lê Văn C @levanc levanc@example.com 0934567890 SINH_VIEN Hoạt động  Xóa":
      - cell "L Lê Văn C @levanc":
        - text: L
        - strong: Lê Văn C
        - text: "@levanc"
      - cell "levanc@example.com 0934567890"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "P Phạm Thị D @phamthid phamthid@example.com 0945678901 SINH_VIEN Hoạt động  Xóa":
      - cell "P Phạm Thị D @phamthid":
        - text: P
        - strong: Phạm Thị D
        - text: "@phamthid"
      - cell "phamthid@example.com 0945678901"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "C cường @cuong ádcfsdv@gmail.com 2355645345356 SINH_VIEN Hoạt động  Xóa":
      - cell "C cường @cuong":
        - text: C
        - strong: cường
        - text: "@cuong"
      - cell "ádcfsdv@gmail.com 2355645345356"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "N Nguyễn Văn A @nguyenvana nguyenvana@example.com 0912345678 CHU_TRO Hoạt động  Xóa":
      - cell "N Nguyễn Văn A @nguyenvana":
        - text: "N"
        - strong: Nguyễn Văn A
        - text: "@nguyenvana"
      - cell "nguyenvana@example.com 0912345678"
      - cell "CHU_TRO"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "L Lê Văn C @levanc levanc@example.com 0934567890 SINH_VIEN Hoạt động  Xóa":
      - cell "L Lê Văn C @levanc":
        - text: L
        - strong: Lê Văn C
        - text: "@levanc"
      - cell "levanc@example.com 0934567890"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "P Phạm Thị D @phamthid phamthid@example.com 0945678901 SINH_VIEN Hoạt động  Xóa":
      - cell "P Phạm Thị D @phamthid":
        - text: P
        - strong: Phạm Thị D
        - text: "@phamthid"
      - cell "phamthid@example.com 0945678901"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "T TienAnh @tanh1801 abcd@gmail.com 0987654321 SINH_VIEN Hoạt động  Xóa":
      - cell "T TienAnh @tanh1801":
        - text: T
        - strong: TienAnh
        - text: "@tanh1801"
      - cell "abcd@gmail.com 0987654321"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "Đ Đặng Tiến Anh @tienanh123 binkkun18@gmail.com 0912345678 CHU_TRO Hoạt động  Xóa":
      - cell "Đ Đặng Tiến Anh @tienanh123":
        - text: Đ
        - strong: Đặng Tiến Anh
        - text: "@tienanh123"
      - cell "binkkun18@gmail.com 0912345678"
      - cell "CHU_TRO"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "T tienanh @TienAnhDang tienanhhau@gmail.com 0987654321 ADMIN Hoạt động  Xóa":
      - cell "T tienanh @TienAnhDang":
        - text: T
        - strong: tienanh
        - text: "@TienAnhDang"
      - cell "tienanhhau@gmail.com 0987654321"
      - cell "ADMIN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "N nguyễn hữu hoàng @hoanghuu hoanghuu@gmail.com 0987678901 CHU_TRO Hoạt động  Xóa":
      - cell "N nguyễn hữu hoàng @hoanghuu":
        - text: "N"
        - strong: nguyễn hữu hoàng
        - text: "@hoanghuu"
      - cell "hoanghuu@gmail.com 0987678901"
      - cell "CHU_TRO"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "C ChuTro @chutro chutro@gmail.com 0999888777 CHU_TRO Hoạt động  Xóa":
      - cell "C ChuTro @chutro":
        - text: C
        - strong: ChuTro
        - text: "@chutro"
      - cell "chutro@gmail.com 0999888777"
      - cell "CHU_TRO"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "S Sinhvien @sinhvien sinhvien@gmail.com 0987656789 SINH_VIEN Hoạt động  Xóa":
      - cell "S Sinhvien @sinhvien":
        - text: S
        - strong: Sinhvien
        - text: "@sinhvien"
      - cell "sinhvien@gmail.com 0987656789"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "P Playwright Test @playwright1791283697887 playwright1791283697887@gmail.com 0983697887 SINH_VIEN Hoạt động  Xóa":
      - cell "P Playwright Test @playwright1791283697887":
        - text: P
        - strong: Playwright Test
        - text: "@playwright1791283697887"
      - cell "playwright1791283697887@gmail.com 0983697887"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "P Playwright Test @playwright1791283973778 playwright1791283973778@gmail.com 0983973778 SINH_VIEN Hoạt động  Xóa":
      - cell "P Playwright Test @playwright1791283973778":
        - text: P
        - strong: Playwright Test
        - text: "@playwright1791283973778"
      - cell "playwright1791283973778@gmail.com 0983973778"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "P Playwright Test @playwright1791285334047 playwright1791285334047@gmail.com 0985334047 SINH_VIEN Hoạt động  Xóa":
      - cell "P Playwright Test @playwright1791285334047":
        - text: P
        - strong: Playwright Test
        - text: "@playwright1791285334047"
      - cell "playwright1791285334047@gmail.com 0985334047"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "A Administrator @admin admin@gmail.com 0900000000 ADMIN Hoạt động  Xóa":
      - cell "A Administrator @admin":
        - text: A
        - strong: Administrator
        - text: "@admin"
      - cell "admin@gmail.com 0900000000"
      - cell "ADMIN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
    - row "P Playwright Test @playwright1791286524047 playwright1791286524047@gmail.com 0986524047 SINH_VIEN Hoạt động  Xóa":
      - cell "P Playwright Test @playwright1791286524047":
        - text: P
        - strong: Playwright Test
        - text: "@playwright1791286524047"
      - cell "playwright1791286524047@gmail.com 0986524047"
      - cell "SINH_VIEN"
      - cell "Hoạt động"
      - cell " Xóa":
        - button " Xóa"
```

# Test source

```ts
  17  |         username: 'sinhvien',
  18  |         password: 'sinhvien123'
  19  |     }
  20  | };
  21  | 
  22  | 
  23  | // =====================================================
  24  | // HÀM ĐĂNG NHẬP
  25  | // =====================================================
  26  | 
  27  | async function login(page, account) {
  28  | 
  29  |     await page.goto(`${BASE_URL}/dangnhap.html`);
  30  | 
  31  |     await page.fill(
  32  |         '#ten_tai_khoan',
  33  |         account.username
  34  |     );
  35  | 
  36  |     await page.fill(
  37  |         '#mat_khau',
  38  |         account.password
  39  |     );
  40  | 
  41  |     // Website dùng onclick="login()"
  42  |     await page.click('button:has-text("Đăng nhập ngay")');
  43  | 
  44  |     // Chờ JavaScript xử lý đăng nhập
  45  |     await page.waitForTimeout(1000);
  46  | }
  47  | 
  48  | 
  49  | // =====================================================
  50  | // 1. ADMIN ĐƯỢC TRUY CẬP TRANG QUẢN LÝ USER
  51  | // =====================================================
  52  | 
  53  | test('Admin được truy cập quản lý tài khoản', async ({ page }) => {
  54  | 
  55  |     await login(page, accounts.admin);
  56  | 
  57  |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  58  | 
  59  |     await expect(page).toHaveURL(
  60  |         /quanlytaikhoan\.html/i
  61  |     );
  62  | });
  63  | 
  64  | 
  65  | // =====================================================
  66  | // 2. GIAO DIỆN SINH VIÊN KHÔNG CÓ NÚT QUẢN LÝ TÀI KHOẢN
  67  | // =====================================================
  68  | 
  69  | test('Sinh viên không có nút quản lý tài khoản', async ({ page }) => {
  70  | 
  71  |     await login(page, accounts.sinhVien);
  72  | 
  73  |     await page.goto(`${BASE_URL}/index.html`);
  74  | 
  75  |     const adminButton = page.locator(
  76  |         'a:has-text("Quản lý tài khoản"), ' +
  77  |         'button:has-text("Quản lý tài khoản"), ' +
  78  |         '[href*="quanlytaikhoan"]'
  79  |     );
  80  | 
  81  |     await expect(adminButton).toHaveCount(0);
  82  | });
  83  | 
  84  | 
  85  | // =====================================================
  86  | // 3. GIAO DIỆN CHỦ TRỌ KHÔNG CÓ NÚT QUẢN LÝ TÀI KHOẢN
  87  | // =====================================================
  88  | 
  89  | test('Chủ trọ không có nút quản lý tài khoản', async ({ page }) => {
  90  | 
  91  |     await login(page, accounts.chuTro);
  92  | 
  93  |     await page.goto(`${BASE_URL}/index.html`);
  94  | 
  95  |     const adminButton = page.locator(
  96  |         'a:has-text("Quản lý tài khoản"), ' +
  97  |         'button:has-text("Quản lý tài khoản"), ' +
  98  |         '[href*="quanlytaikhoan"]'
  99  |     );
  100 | 
  101 |     await expect(adminButton).toHaveCount(0);
  102 | });
  103 | 
  104 | 
  105 | // =====================================================
  106 | // 4. SINH VIÊN KHÔNG ĐƯỢC TRUY CẬP TRỰC TIẾP TRANG ADMIN
  107 | // =====================================================
  108 | 
  109 | test('Sinh viên không được truy cập trực tiếp trang quản lý tài khoản', async ({ page }) => {
  110 | 
  111 |     await login(page, accounts.sinhVien);
  112 | 
  113 |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  114 | 
  115 |     // Sinh viên đáng lẽ phải bị từ chối / redirect
  116 |     // Nếu vẫn ở trang quản lý tài khoản -> FAIL
> 117 |     await expect(page).not.toHaveURL(
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  118 |         /quanlytaikhoan\.html/i
  119 |     );
  120 | });
  121 | 
  122 | 
  123 | // =====================================================
  124 | // 5. CHỦ TRỌ KHÔNG ĐƯỢC TRUY CẬP TRỰC TIẾP TRANG ADMIN
  125 | // =====================================================
  126 | 
  127 | test('Chủ trọ không được truy cập trực tiếp trang quản lý tài khoản', async ({ page }) => {
  128 | 
  129 |     await login(page, accounts.chuTro);
  130 | 
  131 |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  132 | 
  133 |     // Chủ trọ đáng lẽ phải bị từ chối / redirect
  134 |     // Nếu vẫn ở trang quản lý tài khoản -> FAIL
  135 |     await expect(page).not.toHaveURL(
  136 |         /quanlytaikhoan\.html/i
  137 |     );
  138 | });
  139 | 
  140 | 
  141 | // =====================================================
  142 | // 6. KIỂM TRA ROLE TRONG JWT CỦA ADMIN
  143 | // =====================================================
  144 | 
  145 | test('JWT của Admin có role admin', async ({ page }) => {
  146 | 
  147 |     await login(page, accounts.admin);
  148 | 
  149 |     const payload = await page.evaluate(() => {
  150 | 
  151 |         const token = localStorage.getItem('token');
  152 | 
  153 |         if (!token) {
  154 |             return null;
  155 |         }
  156 | 
  157 |         const parts = token.split('.');
  158 | 
  159 |         if (parts.length !== 3) {
  160 |             return null;
  161 |         }
  162 | 
  163 |         return JSON.parse(
  164 |             atob(
  165 |                 parts[1]
  166 |                     .replace(/-/g, '+')
  167 |                     .replace(/_/g, '/')
  168 |             )
  169 |         );
  170 |     });
  171 | 
  172 |     expect(payload).not.toBeNull();
  173 | 
  174 |     expect(payload.role).toBe('admin');
  175 | });
```