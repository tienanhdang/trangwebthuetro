# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-booking.spec.js >> Student - Booking, Cancellation & Notifications >> CANCEL-03 - Hủy booking của người khác
- Location: tests\student-booking.spec.js:211:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 400
```

# Test source

```ts
  122 | 
  123 |     test('BOOK-06 - Kiểm tra danh sách booking của sinh viên', async ({ request }) => {
  124 |         const response = await request.get(
  125 |             `${BASE_URL}/api/bookings/my-bookings`,
  126 |             {
  127 |                 headers: {
  128 |                     Authorization: `Bearer ${TOKEN}`
  129 |                 }
  130 |             }
  131 |         );
  132 | 
  133 |         expect(response.status()).toBe(200);
  134 | 
  135 |         const body = await response.json();
  136 | 
  137 |         expect(Array.isArray(body)).toBeTruthy();
  138 | 
  139 |         // Kiểm tra có booking ở trạng thái pending hoặc cancelled
  140 |         if (body.length > 0) {
  141 |             expect(body[0]).toHaveProperty('trang_thai');
  142 |         }
  143 |     });
  144 | 
  145 | 
  146 |     // =====================================================
  147 |     // CANCELLATION
  148 |     // =====================================================
  149 | 
  150 |     test('CANCEL-01 - Hủy booking thành công', async ({ request }) => {
  151 |         // Lấy danh sách booking của sinh viên
  152 |         const listResponse = await request.get(
  153 |             `${BASE_URL}/api/bookings/my-bookings`,
  154 |             {
  155 |                 headers: {
  156 |                     Authorization: `Bearer ${TOKEN}`
  157 |                 }
  158 |             }
  159 |         );
  160 | 
  161 |         expect(listResponse.status()).toBe(200);
  162 | 
  163 |         const bookings = await listResponse.json();
  164 | 
  165 |         // Tìm booking đang pending
  166 |         const booking = bookings.find(
  167 |             item => item.trang_thai === 'pending'
  168 |         );
  169 | 
  170 |         expect(booking).toBeTruthy();
  171 | 
  172 |         const response = await request.post(
  173 |             `${BASE_URL}/api/bookings/${booking.id}/cancel`,
  174 |             {
  175 |                 headers: {
  176 |                     Authorization: `Bearer ${TOKEN}`
  177 |                 }
  178 |             }
  179 |         );
  180 | 
  181 |         expect(response.status()).toBe(200);
  182 | 
  183 |         const body = await response.json();
  184 | 
  185 |         expect(body.message).toBe(
  186 |             'Hủy đặt phòng thành công'
  187 |         );
  188 |     });
  189 | 
  190 | 
  191 |     test('CANCEL-02 - Hủy booking không tồn tại', async ({ request }) => {
  192 |         const response = await request.post(
  193 |             `${BASE_URL}/api/bookings/999999/cancel`,
  194 |             {
  195 |                 headers: {
  196 |                     Authorization: `Bearer ${TOKEN}`
  197 |                 }
  198 |             }
  199 |         );
  200 | 
  201 |         expect(response.status()).toBe(404);
  202 | 
  203 |         const body = await response.json();
  204 | 
  205 |         expect(body.error).toBe(
  206 |             'Không tìm thấy đơn đặt phòng'
  207 |         );
  208 |     });
  209 | 
  210 | 
  211 |     test('CANCEL-03 - Hủy booking của người khác', async ({ request }) => {
  212 |         // Booking ID 1 dùng cho test booking của người khác
  213 |         const response = await request.post(
  214 |             `${BASE_URL}/api/bookings/1/cancel`,
  215 |             {
  216 |                 headers: {
  217 |                     Authorization: `Bearer ${TOKEN}`
  218 |                 }
  219 |             }
  220 |         );
  221 | 
> 222 |         expect(response.status()).toBe(404);
      |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  223 | 
  224 |         const body = await response.json();
  225 | 
  226 |         expect(body.error).toBe(
  227 |             'Không tìm thấy đơn đặt phòng'
  228 |         );
  229 |     });
  230 | 
  231 | 
  232 |     test('CANCEL-04 - Hủy booking đã được hủy', async ({ request }) => {
  233 |         // Booking ID 2 đã được hủy trong manual test
  234 |         const response = await request.post(
  235 |             `${BASE_URL}/api/bookings/2/cancel`,
  236 |             {
  237 |                 headers: {
  238 |                     Authorization: `Bearer ${TOKEN}`
  239 |                 }
  240 |             }
  241 |         );
  242 | 
  243 |         expect(response.status()).toBe(400);
  244 | 
  245 |         const body = await response.json();
  246 | 
  247 |         expect(body.error).toBe(
  248 |             'Đơn đặt phòng đã được hủy trước đó'
  249 |         );
  250 |     });
  251 | 
  252 | 
  253 |     test('CANCEL-05 - Hủy booking không có token', async ({ request }) => {
  254 |         const response = await request.post(
  255 |             `${BASE_URL}/api/bookings/2/cancel`
  256 |         );
  257 | 
  258 |         expect(response.status()).toBe(401);
  259 |     });
  260 | 
  261 | 
  262 |     // =====================================================
  263 |     // NOTIFICATIONS
  264 |     // =====================================================
  265 | 
  266 |     test('NOTI-01 - Lấy danh sách thông báo', async ({ request }) => {
  267 |         const response = await request.get(
  268 |             `${BASE_URL}/api/notifications/`,
  269 |             {
  270 |                 headers: {
  271 |                     Authorization: `Bearer ${TOKEN}`
  272 |                 }
  273 |             }
  274 |         );
  275 | 
  276 |         expect(response.status()).toBe(200);
  277 | 
  278 |         const body = await response.json();
  279 | 
  280 |         expect(Array.isArray(body)).toBeTruthy();
  281 |     });
  282 | 
  283 | 
  284 |     test('NOTI-02 - Lấy thông báo không có token', async ({ request }) => {
  285 |         const response = await request.get(
  286 |             `${BASE_URL}/api/notifications/`
  287 |         );
  288 | 
  289 |         expect(response.status()).toBe(401);
  290 |     });
  291 | 
  292 | 
  293 |     test('NOTI-03 - Đánh dấu thông báo đã đọc', async ({ request }) => {
  294 |         // Lấy notification của chính sinh viên
  295 |         const listResponse = await request.get(
  296 |             `${BASE_URL}/api/notifications/`,
  297 |             {
  298 |                 headers: {
  299 |                     Authorization: `Bearer ${TOKEN}`
  300 |                 }
  301 |             }
  302 |         );
  303 | 
  304 |         expect(listResponse.status()).toBe(200);
  305 | 
  306 |         const notifications = await listResponse.json();
  307 | 
  308 |         // Tài khoản phải có ít nhất 1 notification
  309 |         expect(notifications.length).toBeGreaterThan(0);
  310 | 
  311 |         const notificationId = notifications[0].id;
  312 | 
  313 |         const response = await request.put(
  314 |             `${BASE_URL}/api/notifications/${notificationId}/read`,
  315 |             {
  316 |                 headers: {
  317 |                     Authorization: `Bearer ${TOKEN}`
  318 |                 }
  319 |             }
  320 |         );
  321 | 
  322 |         expect(response.status()).toBe(200);
```