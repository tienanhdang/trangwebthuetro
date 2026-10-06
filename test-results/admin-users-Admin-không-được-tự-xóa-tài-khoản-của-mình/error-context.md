# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-users.spec.js >> Admin không được tự xóa tài khoản của mình
- Location: tests\admin-users.spec.js:93:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('tr:has-text("admin")').first().locator('button:has-text("Xóa"), button:has-text("Xoá"), .delete-user').first()
    - locator resolved to <button onclick="deleteUser(100)" class="btn-action btn-lock">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

# Test source

```ts
  16  | 
  17  |     await page.goto(`${BASE_URL}/dangnhap.html`);
  18  | 
  19  |     await page.fill(
  20  |         '#ten_tai_khoan',
  21  |         admin.username
  22  |     );
  23  | 
  24  |     await page.fill(
  25  |         '#mat_khau',
  26  |         admin.password
  27  |     );
  28  | 
  29  |     // Website dùng onclick="login()"
  30  |     await page.click('button:has-text("Đăng nhập ngay")');
  31  | 
  32  |     // Chờ xử lý đăng nhập
  33  |     await page.waitForTimeout(1000);
  34  | }
  35  | 
  36  | 
  37  | // =====================================================
  38  | // 1. ADMIN MỞ TRANG QUẢN LÝ USER
  39  | // =====================================================
  40  | 
  41  | test('Admin mở trang quản lý tài khoản', async ({ page }) => {
  42  | 
  43  |     await loginAdmin(page);
  44  | 
  45  |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  46  | 
  47  |     await expect(page).toHaveURL(/quanlytaikhoan/);
  48  | 
  49  |     await expect(page.locator('body')).toContainText(
  50  |         /quản lý|tài khoản|người dùng/i
  51  |     );
  52  | });
  53  | 
  54  | 
  55  | // =====================================================
  56  | // 2. KIỂM TRA DANH SÁCH USER
  57  | // =====================================================
  58  | 
  59  | test('Admin xem được danh sách tài khoản', async ({ page }) => {
  60  | 
  61  |     await loginAdmin(page);
  62  | 
  63  |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  64  | 
  65  |     const rows = page.locator('table tbody tr');
  66  | 
  67  |     await expect(rows.first()).toBeVisible();
  68  | });
  69  | 
  70  | 
  71  | // =====================================================
  72  | // 3. KIỂM TRA NÚT XÓA USER
  73  | // =====================================================
  74  | 
  75  | test('Admin có chức năng xóa tài khoản', async ({ page }) => {
  76  | 
  77  |     await loginAdmin(page);
  78  | 
  79  |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  80  | 
  81  |     const deleteButton = page.locator(
  82  |         'button:has-text("Xóa"), button:has-text("Xoá"), .delete-user'
  83  |     );
  84  | 
  85  |     await expect(deleteButton.first()).toBeVisible();
  86  | });
  87  | 
  88  | 
  89  | // =====================================================
  90  | // 4. ADMIN KHÔNG ĐƯỢC TỰ XÓA CHÍNH MÌNH
  91  | // =====================================================
  92  | 
  93  | test('Admin không được tự xóa tài khoản của mình', async ({ page }) => {
  94  | 
  95  |     await loginAdmin(page);
  96  | 
  97  |     await page.goto(`${BASE_URL}/quanlytaikhoan.html`);
  98  | 
  99  |     // Tìm dòng chứa tài khoản admin
  100 |     const adminRow = page.locator(
  101 |         'tr:has-text("admin")'
  102 |     ).first();
  103 | 
  104 |     await expect(adminRow).toBeVisible();
  105 | 
  106 |     const deleteButton = adminRow.locator(
  107 |         'button:has-text("Xóa"), button:has-text("Xoá"), .delete-user'
  108 |     ).first();
  109 | 
  110 |     // Nếu Admin có nút Xóa chính mình,
  111 |     // test phải kiểm tra rằng hệ thống từ chối thao tác.
  112 |     if (await deleteButton.count() > 0) {
  113 | 
  114 |         const dialogPromise = page.waitForEvent('dialog').catch(() => null);
  115 | 
> 116 |         await deleteButton.click();
      |                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  117 | 
  118 |         const dialog = await dialogPromise;
  119 | 
  120 |         if (dialog) {
  121 | 
  122 |             const message = dialog.message();
  123 | 
  124 |             expect(message).toMatch(
  125 |                 /không thể|không được|admin|lỗi/i
  126 |             );
  127 | 
  128 |             await dialog.dismiss();
  129 | 
  130 |         } else {
  131 | 
  132 |             await expect(page.locator('body')).toContainText(
  133 |                 /không thể|không được|admin|lỗi/i
  134 |             );
  135 |         }
  136 |     }
  137 | });
```