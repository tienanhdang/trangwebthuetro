# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phongtro.spec.js >> STATUS-05: Trạng thái rác phải bị từ chối (400)
- Location: tests\phongtro.spec.js:172:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  76  | const other = () => tokenC || tokenB;
  77  | 
  78  | test.beforeAll(async ({ request }) => {
  79  |   tokenA = await login(request, USER_A);
  80  |   tokenB = await login(request, USER_B);
  81  |   tokenC = await login(request, USER_C);
  82  |   if (!tokenC) console.warn('Chưa có User C (chủ trọ khác): phân quyền đang test bằng sinh viên (B), có thể chỉ kiểm tra vai trò.');
  83  |   ROOM_ID = await createRoom(request, tokenA, { tieu_de: `TEST-${Date.now()}` });
  84  | });
  85  | 
  86  | test.afterAll(async ({ request }) => {
  87  |   for (const id of createdIds) await deleteRoom(request, tokenA, id);
  88  |   await deleteRoom(request, tokenA, ROOM_ID); // xóa bằng chủ phòng, không phụ thuộc DEL-03
  89  | });
  90  | 
  91  | // ==========================================
  92  | // KỊCH BẢN 1: Validation dữ liệu - mỗi case một test, bắt buộc 400
  93  | // ==========================================
  94  | const createCases = [
  95  |   ['ROOM-02', 'Giá bằng 0', { gia_tien: "0" }],
  96  |   ['ROOM-03', 'Giá âm', { gia_tien: -500 }],
  97  |   ['ROOM-06', 'Diện tích bằng 0', { dien_tich: "0" }],
  98  |   ['ROOM-07', 'Diện tích âm', { dien_tich: -5 }],
  99  |   ['ROOM-08', 'Sai kiểu dữ liệu', { gia_tien: 'abc', dien_tich: 'xyz' }],
  100 | ];
  101 | test.describe('Validation: thêm phòng', () => {
  102 |   for (const [id, desc, override] of createCases) {
  103 |     test(`${id}: ${desc} phải bị từ chối (400)`, async ({ request }) => {
  104 |       const res = await request.post(`${BASE_URL}/phongtro`, { headers: auth(tokenA), data: validBody(override) });
  105 |       if (res.ok()) { // backend lỡ nhận => ghi lại id để afterAll xóa
  106 |         const newId = getId(await res.json().catch(() => ({})));
  107 |         if (newId) createdIds.push(newId);
  108 |       }
  109 |       expect(res.status()).toBe(400);
  110 |     });
  111 |   }
  112 | });
  113 | 
  114 | const editCases = [
  115 |   ['EDIT-05a', 'Sửa giá = 0', { gia_tien: "0" }],
  116 |   ['EDIT-05b', 'Sửa giá âm', { gia_tien: -500 }],
  117 |   ['EDIT-05c', 'Sửa diện tích = 0', { dien_tich: "0" }],
  118 |   ['EDIT-05d', 'Sửa diện tích âm', { dien_tich: -5 }],
  119 |   ['EDIT-06a', 'Sửa để trống tiêu đề', { tieu_de: '' }],
  120 |   ['EDIT-06b', 'Sửa để trống địa chỉ', { dia_chi: '' }],
  121 | ];
  122 | test.describe('Validation: sửa phòng', () => {
  123 |   for (const [id, desc, override] of editCases) {
  124 |     test(`${id}: ${desc} phải bị từ chối (400)`, async ({ request }) => {
  125 |       const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(tokenA), data: validBody(override) });
  126 |       expect(res.status()).toBe(400);
  127 |     });
  128 |   }
  129 | });
  130 | 
  131 | // ==========================================
  132 | // KỊCH BẢN 2: Phân quyền - bắt buộc 401/403 (DEL-03 để chạy cuối file)
  133 | // ==========================================
  134 | test.describe('Phân quyền', () => {
  135 |   test('ROOM-05: Không token không được đăng phòng', async ({ request }) => {
  136 |     const res = await request.post(`${BASE_URL}/phongtro`, { data: validBody() });
  137 |     if (res.ok()) { // lỡ tạo được thì ghi lại để dọn
  138 |       const newId = getId(await res.json().catch(() => ({})));
  139 |       if (newId) createdIds.push(newId);
  140 |     }
  141 |     expect([401, 403]).toContain(res.status());
  142 |   });
  143 | 
  144 |   test('EDIT-02: Người khác không được sửa phòng của A', async ({ request }) => {
  145 |     const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(other()), data: validBody({ tieu_de: 'Hacked' }) });
  146 |     expect(res.status()).toBe(403);
  147 |   });
  148 | 
  149 |   test('STATUS-04: Người khác không được đổi trạng thái phòng của A', async ({ request }) => {
  150 |     const res = await request.patch(`${BASE_URL}/phongtro/${ROOM_ID}/trangthai`, { headers: auth(other()), data: { trang_thai: 'da_thue' } });
  151 |     expect(res.status()).toBe(403);
  152 |   });
  153 | 
  154 |   test('MAP-03: Người khác không được đổi tọa độ phòng của A', async ({ request }) => {
  155 |     // Giả định: tọa độ lưu qua PUT /phongtro/:id (theo nút Lưu trong chitiet.html)
  156 |     const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(other()), data: validBody({ vi_do: 21.0, kinh_do: 105.8 }) });
  157 |     expect(res.status()).toBe(403);
  158 |   });
  159 | 
  160 |   test('IMG-04: Người khác không được upload ảnh cho phòng của A', async ({ request }) => {
  161 |     const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, {
  162 |       headers: auth(other()),
  163 |       multipart: { ...formFields(), images: { name: 'a.png', mimeType: 'image/png', buffer: PNG } },
  164 |     });
  165 |     expect(res.status()).toBe(403);
  166 |   });
  167 | });
  168 | 
  169 | // ==========================================
  170 | // KỊCH BẢN 3: Trạng thái không hợp lệ
  171 | // ==========================================
  172 | test('STATUS-05: Trạng thái rác phải bị từ chối (400)', async ({ request }) => {
  173 |   const res = await request.patch(`${BASE_URL}/phongtro/${ROOM_ID}/trangthai`, {
  174 |     headers: auth(tokenA), data: { trang_thai: 'trang_thai_rac_123' },
  175 |   });
> 176 |   expect(res.status()).toBe(400);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  177 | });
  178 | 
  179 | // ==========================================
  180 | // KỊCH BẢN 4: Upload file - luôn gửi kèm đủ trường bắt buộc
  181 | // ==========================================
  182 | const badFiles = [
  183 |   ['exe', 'virus.exe', 'application/octet-stream'],
  184 |   ['pdf', 'tailieu.pdf', 'application/pdf'],
  185 |   ['docx', 'tailieu.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  186 | ];
  187 | test.describe('Upload file', () => {
  188 |   for (const [ext, name, mimeType] of badFiles) {
  189 |     test(`IMG-02 (.${ext}): file không phải ảnh phải bị từ chối (400/415)`, async ({ request }) => {
  190 |       const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, {
  191 |         headers: auth(tokenA),
  192 |         multipart: { ...formFields(), images: { name, mimeType, buffer: Buffer.from('MZ-not-an-image') } },
  193 |       });
  194 |       expect([400, 415]).toContain(res.status());
  195 |     });
  196 |   }
  197 | 
  198 |   test(`IMG-03: Ảnh vượt ${MAX_UPLOAD_MB}MB phải bị từ chối (400/413)`, async ({ request }) => {
  199 |     test.setTimeout(90000);
  200 |     const big = Buffer.alloc((MAX_UPLOAD_MB + 1) * 1024 * 1024);
  201 |     const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, {
  202 |       headers: auth(tokenA),
  203 |       multipart: { ...formFields(), images: { name: 'large.jpg', mimeType: 'image/jpeg', buffer: big } },
  204 |     });
  205 |     expect([400, 413]).toContain(res.status());
  206 |   });
  207 | 
  208 |   test('IMG-06: 20 ảnh cùng lúc phải bị từ chối bằng 4xx, không 500', async ({ request }) => {
  209 |     const form = new FormData(); // cần Playwright >= 1.44
  210 |     Object.entries(formFields()).forEach(([k, v]) => form.append(k, v));
  211 |     for (let i = 0; i < 20; i++) form.append('images', new Blob([PNG], { type: 'image/png' }), `a${i}.png`);
  212 |     const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(tokenA), multipart: form });
  213 |     expect(res.status()).toBeGreaterThanOrEqual(400);
  214 |     expect(res.status()).toBeLessThan(500);
  215 |   });
  216 | });
  217 | 
  218 | // ==========================================
  219 | // KỊCH BẢN 5: Luồng giao diện chính (ROOM-01, EDIT-01, DEL-01)
  220 | // Thao tác đúng phòng vừa tạo, không dùng .first(); dọn trong finally nếu lỗi giữa chừng
  221 | // ==========================================
  222 | test('UI: Thêm -> Sửa -> Xóa phòng (ROOM-01, EDIT-01, DEL-01)', async ({ page, request }) => {
  223 |   test.setTimeout(180000); // đủ thời gian cho slowMo và các lần dừng demo
  224 |   const title = `Phong E2E ${Date.now()}`;
  225 |   const messages = [];
  226 |   let uiRoomId;
  227 |   page.on('dialog', async (d) => {
  228 |     messages.push(d.message());
  229 |     await new Promise((r) => setTimeout(r, DEMO_PAUSE)); // giữ hộp thoại hiển thị để người xem đọc
  230 |     await d.accept();
  231 |   });
  232 |   const demoPause = () => (DEMO_PAUSE ? page.waitForTimeout(DEMO_PAUSE) : Promise.resolve());
  233 | 
  234 |   try {
  235 |     // Đăng nhập (tên tài khoản không dấu, giống đăng nhập API)
  236 |     await page.goto(`${BASE_URL}/dangnhap.html`);
  237 |     await page.fill('#ten_tai_khoan', USER_A.ten_tai_khoan);
  238 |     await page.fill('#mat_khau', USER_A.mat_khau);
  239 |     let api = page.waitForResponse((r) => r.url().includes('/users/login'));
  240 |     await page.click('button:has-text("Đăng nhập ngay")');
  241 |     await api;
  242 |     await demoPause();
  243 |     await page.waitForURL('**/index.html');
  244 | 
  245 |     // ROOM-01: Thêm
  246 |     await page.goto(`${BASE_URL}/dangphong.html`);
  247 |     await page.fill('#tieu_de', title);
  248 |     await page.fill('#gia_tien', '2000000');
  249 |     await page.fill('#dien_tich', '20');
  250 |     await page.fill('#dia_chi', 'Hà Nội');
  251 |     await page.selectOption('#thanh_pho', 'Hà Nội');
  252 |     await page.waitForFunction(() => document.querySelector('#phuong_xa').options.length > 1);
  253 |     await page.selectOption('#phuong_xa', 'Thanh Xuân');
  254 |     api = page.waitForResponse((r) => r.url().includes('/phongtro') && r.request().method() === 'POST');
  255 |     await page.click('button:has-text("ĐĂNG PHÒNG")');
  256 |     const created = await api;
  257 |     uiRoomId = getId(await created.json().catch(() => ({}))); // lưu id để dọn nếu test lỗi giữa chừng
  258 |     expect(created.ok(), 'ROOM-01: đăng phòng phải thành công').toBeTruthy();
  259 |     await demoPause();
  260 |     await page.waitForURL('**/index.html');
  261 | 
  262 |     // EDIT-01: Sửa đúng phòng vừa tạo
  263 |     await page.goto(`${BASE_URL}/quanlyphong.html`);
  264 |     const card = () => page.locator('.room-card', { hasText: title });
  265 |     await expect(card()).toBeVisible();
  266 |     await card().locator('.btn-edit').click();
  267 |     await page.waitForURL('**/suaphong.html*');
  268 |     await page.waitForFunction(() => document.querySelector('#tieu_de').value !== '');
  269 |     await page.fill('#gia_tien', '2500000');
  270 |     api = page.waitForResponse((r) => r.url().includes('/phongtro/') && r.request().method() === 'PUT');
  271 |     await page.locator('.btn-save').click();
  272 |     expect((await api).ok(), 'EDIT-01: sửa phòng phải thành công').toBeTruthy();
  273 |     await demoPause();
  274 |     await page.waitForURL('**/quanlyphong.html');
  275 | 
  276 |     // DEL-01: Xóa đúng phòng vừa tạo
```