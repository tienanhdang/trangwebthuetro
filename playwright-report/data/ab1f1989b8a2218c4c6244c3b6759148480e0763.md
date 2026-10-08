# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phongtro.spec.js >> Validation: sửa phòng >> EDIT-05d: Sửa diện tích âm phải bị từ chối (400)
- Location: tests\phongtro.spec.js:124:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  26  |   mat_khau: process.env.USER_C_PASS || 'chutro2123',
  27  | };
  28  | 
  29  | // PNG 1x1 hợp lệ để giả lập ảnh
  30  | const PNG = Buffer.from(
  31  |   'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  32  |   'base64'
  33  | );
  34  | 
  35  | const auth = (token) => ({ Authorization: `Bearer ${token}` });
  36  | const validBody = (o = {}) => ({
  37  |   tieu_de: 'Phong test', gia_tien: 2000000, dien_tich: 20, dia_chi: 'HN', thanh_pho: 'HN', ...o,
  38  | });
  39  | // Trường bắt buộc đi kèm file, tránh bị 400 vì thiếu trường thay vì vì sai file
  40  | const formFields = (o = {}) => ({
  41  |   tieu_de: 'Phong test', gia_tien: '2000000', dien_tich: '20', dia_chi: 'HN', thanh_pho: 'HN', ...o,
  42  | });
  43  | 
  44  | // ==========================================
  45  | // QUẢN LÝ DỮ LIỆU TEST: tự tạo - tự dọn
  46  | // ==========================================
  47  | let ROOM_ID;             // phòng do chính bộ test tạo ra trong beforeAll
  48  | const createdIds = [];   // phòng rác phát sinh khi backend nhận nhầm dữ liệu sai
  49  | 
  50  | // Lấy id phòng từ response của POST /phongtro. CHỈNH lại theo response thật của API nếu cần.
  51  | const getId = (b) => b?.phong_id ?? b?.id ?? b?.insertId ?? b?.roomId ?? b?.data?.id ?? b?.data?.insertId ?? b?.phongtro?.id ?? b?.room?.id;
  52  | 
  53  | async function login(request, user) {
  54  |   if (!user.ten_tai_khoan) return null;
  55  |   const res = await request.post(`${BASE_URL}/users/login`, { data: user });
  56  |   expect(res.ok(), `Đăng nhập thất bại: ${user.ten_tai_khoan}`).toBeTruthy();
  57  |   return (await res.json()).token;
  58  | }
  59  | 
  60  | async function createRoom(request, token, o = {}) {
  61  |   const res = await request.post(`${BASE_URL}/phongtro`, { headers: auth(token), data: validBody(o) });
  62  |   expect(res.ok(), 'Không tạo được phòng test').toBeTruthy();
  63  |   const body = await res.json().catch(() => ({}));
  64  |   const id = getId(body);
  65  |   expect(id, `Không lấy được id phòng từ response: ${JSON.stringify(body)}`).toBeTruthy();
  66  |   return id;
  67  | }
  68  | 
  69  | async function deleteRoom(request, token, id) {
  70  |   if (!id) return;
  71  |   await request.delete(`${BASE_URL}/phongtro/${id}`, { headers: auth(token) }).catch(() => {});
  72  | }
  73  | 
  74  | let tokenA, tokenB, tokenC;
  75  | // Người "không phải chủ phòng": ưu tiên chủ trọ khác (C), nếu không có thì dùng sinh viên (B)
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
> 126 |       expect(res.status()).toBe(400);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
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
  176 |   expect(res.status()).toBe(400);
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
```