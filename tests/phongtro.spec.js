const { test, expect } = require('@playwright/test');

// ==========================================
// CẤU HÌNH (đọc từ biến môi trường, không viết cứng token/mật khẩu)
//   USER_A_*: chủ trọ sở hữu phòng test (phòng do chính bộ test tự tạo)
//   USER_B_*: sinh viên
//   USER_C_*: chủ trọ KHÁC (khuyến nghị) để chứng minh kiểm tra chủ sở hữu
// LƯU Ý: nên đặt workers: 1 trong playwright.config.js
// ==========================================
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 10);
// Thời gian dừng khi quay demo (ms). Chạy thường = 0; quay demo: đặt DEMO_PAUSE_MS=5000
const DEMO_PAUSE = Number(process.env.DEMO_PAUSE_MS || 0);

// Tài khoản test (có thể ghi đè bằng biến môi trường). Không đưa mật khẩu vào báo cáo hay kho mã công khai.
const USER_A = { // chủ trọ 1, sở hữu phòng test
  ten_tai_khoan: process.env.USER_A_NAME || 'chutro',
  mat_khau: process.env.USER_A_PASS || 'chutro123',
};
const USER_B = { // sinh viên 1
  ten_tai_khoan: process.env.USER_B_NAME || 'sinhvien',
  mat_khau: process.env.USER_B_PASS || 'sinhvien123',
};
const USER_C = { // chủ trọ 2 (không sở hữu phòng test), dùng để test phân quyền theo chủ sở hữu
  ten_tai_khoan: process.env.USER_C_NAME || 'chutro2',
  mat_khau: process.env.USER_C_PASS || 'chutro2123',
};

// PNG 1x1 hợp lệ để giả lập ảnh
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const validBody = (o = {}) => ({
  tieu_de: 'Phong test', gia_tien: 2000000, dien_tich: 20, dia_chi: 'HN', thanh_pho: 'HN', ...o,
});
// Trường bắt buộc đi kèm file, tránh bị 400 vì thiếu trường thay vì vì sai file
const formFields = (o = {}) => ({
  tieu_de: 'Phong test', gia_tien: '2000000', dien_tich: '20', dia_chi: 'HN', thanh_pho: 'HN', ...o,
});

// ==========================================
// QUẢN LÝ DỮ LIỆU TEST: tự tạo - tự dọn
// ==========================================
let ROOM_ID;             // phòng do chính bộ test tạo ra trong beforeAll
const createdIds = [];   // phòng rác phát sinh khi backend nhận nhầm dữ liệu sai

// Lấy id phòng từ response của POST /phongtro. CHỈNH lại theo response thật của API nếu cần.
const getId = (b) => b?.phong_id ?? b?.id ?? b?.insertId ?? b?.roomId ?? b?.data?.id ?? b?.data?.insertId ?? b?.phongtro?.id ?? b?.room?.id;

async function login(request, user) {
  if (!user.ten_tai_khoan) return null;
  const res = await request.post(`${BASE_URL}/users/login`, { data: user });
  expect(res.ok(), `Đăng nhập thất bại: ${user.ten_tai_khoan}`).toBeTruthy();
  return (await res.json()).token;
}

async function createRoom(request, token, o = {}) {
  const res = await request.post(`${BASE_URL}/phongtro`, { headers: auth(token), data: validBody(o) });
  expect(res.ok(), 'Không tạo được phòng test').toBeTruthy();
  const body = await res.json().catch(() => ({}));
  const id = getId(body);
  expect(id, `Không lấy được id phòng từ response: ${JSON.stringify(body)}`).toBeTruthy();
  return id;
}

async function deleteRoom(request, token, id) {
  if (!id) return;
  await request.delete(`${BASE_URL}/phongtro/${id}`, { headers: auth(token) }).catch(() => {});
}

let tokenA, tokenB, tokenC;
// Người "không phải chủ phòng": ưu tiên chủ trọ khác (C), nếu không có thì dùng sinh viên (B)
const other = () => tokenC || tokenB;

test.beforeAll(async ({ request }) => {
  tokenA = await login(request, USER_A);
  tokenB = await login(request, USER_B);
  tokenC = await login(request, USER_C);
  if (!tokenC) console.warn('Chưa có User C (chủ trọ khác): phân quyền đang test bằng sinh viên (B), có thể chỉ kiểm tra vai trò.');
  ROOM_ID = await createRoom(request, tokenA, { tieu_de: `TEST-${Date.now()}` });
});

test.afterAll(async ({ request }) => {
  for (const id of createdIds) await deleteRoom(request, tokenA, id);
  await deleteRoom(request, tokenA, ROOM_ID); // xóa bằng chủ phòng, không phụ thuộc DEL-03
});

// ==========================================
// KỊCH BẢN 1: Validation dữ liệu - mỗi case một test, bắt buộc 400
// ==========================================
const createCases = [
  ['ROOM-02', 'Giá bằng 0', { gia_tien: "0" }],
  ['ROOM-03', 'Giá âm', { gia_tien: -500 }],
  ['ROOM-06', 'Diện tích bằng 0', { dien_tich: "0" }],
  ['ROOM-07', 'Diện tích âm', { dien_tich: -5 }],
  ['ROOM-08', 'Sai kiểu dữ liệu', { gia_tien: 'abc', dien_tich: 'xyz' }],
];
test.describe('Validation: thêm phòng', () => {
  for (const [id, desc, override] of createCases) {
    test(`${id}: ${desc} phải bị từ chối (400)`, async ({ request }) => {
      const res = await request.post(`${BASE_URL}/phongtro`, { headers: auth(tokenA), data: validBody(override) });
      if (res.ok()) { // backend lỡ nhận => ghi lại id để afterAll xóa
        const newId = getId(await res.json().catch(() => ({})));
        if (newId) createdIds.push(newId);
      }
      expect(res.status()).toBe(400);
    });
  }
});

const editCases = [
  ['EDIT-05a', 'Sửa giá = 0', { gia_tien: "0" }],
  ['EDIT-05b', 'Sửa giá âm', { gia_tien: -500 }],
  ['EDIT-05c', 'Sửa diện tích = 0', { dien_tich: "0" }],
  ['EDIT-05d', 'Sửa diện tích âm', { dien_tich: -5 }],
  ['EDIT-06a', 'Sửa để trống tiêu đề', { tieu_de: '' }],
  ['EDIT-06b', 'Sửa để trống địa chỉ', { dia_chi: '' }],
];
test.describe('Validation: sửa phòng', () => {
  for (const [id, desc, override] of editCases) {
    test(`${id}: ${desc} phải bị từ chối (400)`, async ({ request }) => {
      const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(tokenA), data: validBody(override) });
      expect(res.status()).toBe(400);
    });
  }
});

// ==========================================
// KỊCH BẢN 2: Phân quyền - bắt buộc 401/403 (DEL-03 để chạy cuối file)
// ==========================================
test.describe('Phân quyền', () => {
  test('ROOM-05: Không token không được đăng phòng', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/phongtro`, { data: validBody() });
    if (res.ok()) { // lỡ tạo được thì ghi lại để dọn
      const newId = getId(await res.json().catch(() => ({})));
      if (newId) createdIds.push(newId);
    }
    expect([401, 403]).toContain(res.status());
  });

  test('EDIT-02: Người khác không được sửa phòng của A', async ({ request }) => {
    const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(other()), data: validBody({ tieu_de: 'Hacked' }) });
    expect(res.status()).toBe(403);
  });

  test('STATUS-04: Người khác không được đổi trạng thái phòng của A', async ({ request }) => {
    const res = await request.patch(`${BASE_URL}/phongtro/${ROOM_ID}/trangthai`, { headers: auth(other()), data: { trang_thai: 'da_thue' } });
    expect(res.status()).toBe(403);
  });

  test('MAP-03: Người khác không được đổi tọa độ phòng của A', async ({ request }) => {
    // Giả định: tọa độ lưu qua PUT /phongtro/:id (theo nút Lưu trong chitiet.html)
    const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(other()), data: validBody({ vi_do: 21.0, kinh_do: 105.8 }) });
    expect(res.status()).toBe(403);
  });

  test('IMG-04: Người khác không được upload ảnh cho phòng của A', async ({ request }) => {
    const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, {
      headers: auth(other()),
      multipart: { ...formFields(), images: { name: 'a.png', mimeType: 'image/png', buffer: PNG } },
    });
    expect(res.status()).toBe(403);
  });
});

// ==========================================
// KỊCH BẢN 3: Trạng thái không hợp lệ
// ==========================================
test('STATUS-05: Trạng thái rác phải bị từ chối (400)', async ({ request }) => {
  const res = await request.patch(`${BASE_URL}/phongtro/${ROOM_ID}/trangthai`, {
    headers: auth(tokenA), data: { trang_thai: 'trang_thai_rac_123' },
  });
  expect(res.status()).toBe(400);
});

// ==========================================
// KỊCH BẢN 4: Upload file - luôn gửi kèm đủ trường bắt buộc
// ==========================================
const badFiles = [
  ['exe', 'virus.exe', 'application/octet-stream'],
  ['pdf', 'tailieu.pdf', 'application/pdf'],
  ['docx', 'tailieu.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
];
test.describe('Upload file', () => {
  for (const [ext, name, mimeType] of badFiles) {
    test(`IMG-02 (.${ext}): file không phải ảnh phải bị từ chối (400/415)`, async ({ request }) => {
      const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, {
        headers: auth(tokenA),
        multipart: { ...formFields(), images: { name, mimeType, buffer: Buffer.from('MZ-not-an-image') } },
      });
      expect([400, 415]).toContain(res.status());
    });
  }

  test(`IMG-03: Ảnh vượt ${MAX_UPLOAD_MB}MB phải bị từ chối (400/413)`, async ({ request }) => {
    test.setTimeout(90000);
    const big = Buffer.alloc((MAX_UPLOAD_MB + 1) * 1024 * 1024);
    const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, {
      headers: auth(tokenA),
      multipart: { ...formFields(), images: { name: 'large.jpg', mimeType: 'image/jpeg', buffer: big } },
    });
    expect([400, 413]).toContain(res.status());
  });

  test('IMG-06: 20 ảnh cùng lúc phải bị từ chối bằng 4xx, không 500', async ({ request }) => {
    const form = new FormData(); // cần Playwright >= 1.44
    Object.entries(formFields()).forEach(([k, v]) => form.append(k, v));
    for (let i = 0; i < 20; i++) form.append('images', new Blob([PNG], { type: 'image/png' }), `a${i}.png`);
    const res = await request.put(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(tokenA), multipart: form });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});

// ==========================================
// KỊCH BẢN 5: Luồng giao diện chính (ROOM-01, EDIT-01, DEL-01)
// Thao tác đúng phòng vừa tạo, không dùng .first(); dọn trong finally nếu lỗi giữa chừng
// ==========================================
test('UI: Thêm -> Sửa -> Xóa phòng (ROOM-01, EDIT-01, DEL-01)', async ({ page, request }) => {
  test.setTimeout(180000); // đủ thời gian cho slowMo và các lần dừng demo
  const title = `Phong E2E ${Date.now()}`;
  const messages = [];
  let uiRoomId;
  page.on('dialog', async (d) => {
    messages.push(d.message());
    await new Promise((r) => setTimeout(r, DEMO_PAUSE)); // giữ hộp thoại hiển thị để người xem đọc
    await d.accept();
  });
  const demoPause = () => (DEMO_PAUSE ? page.waitForTimeout(DEMO_PAUSE) : Promise.resolve());

  try {
    // Đăng nhập (tên tài khoản không dấu, giống đăng nhập API)
    await page.goto(`${BASE_URL}/dangnhap.html`);
    await page.fill('#ten_tai_khoan', USER_A.ten_tai_khoan);
    await page.fill('#mat_khau', USER_A.mat_khau);
    let api = page.waitForResponse((r) => r.url().includes('/users/login'));
    await page.click('button:has-text("Đăng nhập ngay")');
    await api;
    await demoPause();
    await page.waitForURL('**/index.html');

    // ROOM-01: Thêm
    await page.goto(`${BASE_URL}/dangphong.html`);
    await page.fill('#tieu_de', title);
    await page.fill('#gia_tien', '2000000');
    await page.fill('#dien_tich', '20');
    await page.fill('#dia_chi', 'Hà Nội');
    await page.selectOption('#thanh_pho', 'Hà Nội');
    await page.waitForFunction(() => document.querySelector('#phuong_xa').options.length > 1);
    await page.selectOption('#phuong_xa', 'Thanh Xuân');
    api = page.waitForResponse((r) => r.url().includes('/phongtro') && r.request().method() === 'POST');
    await page.click('button:has-text("ĐĂNG PHÒNG")');
    const created = await api;
    uiRoomId = getId(await created.json().catch(() => ({}))); // lưu id để dọn nếu test lỗi giữa chừng
    expect(created.ok(), 'ROOM-01: đăng phòng phải thành công').toBeTruthy();
    await demoPause();
    await page.waitForURL('**/index.html');

    // EDIT-01: Sửa đúng phòng vừa tạo
    await page.goto(`${BASE_URL}/quanlyphong.html`);
    const card = () => page.locator('.room-card', { hasText: title });
    await expect(card()).toBeVisible();
    await card().locator('.btn-edit').click();
    await page.waitForURL('**/suaphong.html*');
    await page.waitForFunction(() => document.querySelector('#tieu_de').value !== '');
    await page.fill('#gia_tien', '2500000');
    api = page.waitForResponse((r) => r.url().includes('/phongtro/') && r.request().method() === 'PUT');
    await page.locator('.btn-save').click();
    expect((await api).ok(), 'EDIT-01: sửa phòng phải thành công').toBeTruthy();
    await demoPause();
    await page.waitForURL('**/quanlyphong.html');

    // DEL-01: Xóa đúng phòng vừa tạo
    await expect(card()).toBeVisible();
    api = page.waitForResponse((r) => r.url().includes('/phongtro/') && r.request().method() === 'DELETE');
    await card().locator('.btn-delete').click();
    expect((await api).ok(), 'DEL-01: xóa phòng phải thành công').toBeTruthy();
    await demoPause();
    await expect(card()).toHaveCount(0);
    expect(messages.join(' | ')).toContain('thành công');
  } finally {
    // Nếu đã xóa ở DEL-01 thì lệnh này trả 404 và bị bỏ qua
    await deleteRoom(request, tokenA, uiRoomId);
  }
});

// ==========================================
// Chạy CUỐI: nếu hệ thống lỗi phân quyền (trả 200) thì chỉ mất phòng test, không mất phòng thật
// ==========================================
test('DEL-03: Người khác không được xóa phòng của A (chạy cuối)', async ({ request }) => {
  const res = await request.delete(`${BASE_URL}/phongtro/${ROOM_ID}`, { headers: auth(other()) });
  expect([403, 404]).toContain(res.status());
});