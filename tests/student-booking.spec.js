const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

// JWT của tài khoản sinh viên
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6InNpbmhfdmllbiIsImhvX3RlbiI6IkjDsiBBIEPDunQiLCJlbWFpbCI6Imx5Y2tpbnk4OEBnbWFpbC5jb20iLCJzb19kaWVuX3Rob2FpIjoiMDk4NzY1NDMyMSIsInRlbl90YWlfa2hvYW4iOiJiYW9odXkiLCJhbmhfZGFpX2RpZW4iOm51bGwsImlhdCI6MTc5MTM0MDgxMiwiZXhwIjoxNzkxNDI3MjEyfQ.gvxBISIZaEenfinK3BwQVhBi0XstzoRmPO3hooCJSXQ ';

test.describe('Student - Booking, Cancellation & Notifications', () => {



    test('BOOK-01 - Sinh viên đặt phòng thành công', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                },
                data: {
                    room_id: 1,
                    ho_ten: 'Hò A Cút',
                    ngay_sinh: '2005-05-11',
                    so_nguoi_o: 1
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.message).toBe('Đặt phòng thành công');
    });


    test('BOOK-02 - Đặt phòng thiếu room_id', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                },
                data: {
                    ho_ten: 'Hò A Cút',
                    ngay_sinh: '2005-05-11',
                    so_nguoi_o: 1
                }
            }
        );

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.error).toBe('Thiếu thông tin bắt buộc');
    });


    test('BOOK-03 - Đặt phòng thiếu ho_ten', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                },
                data: {
                    room_id: 1,
                    ngay_sinh: '2005-05-11',
                    so_nguoi_o: 1
                }
            }
        );

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.error).toBe('Thiếu thông tin bắt buộc');
    });


    test('BOOK-04 - Đặt phòng với room_id không tồn tại', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                },
                data: {
                    room_id: 999999,
                    ho_ten: 'Hò A Cút',
                    ngay_sinh: '2005-05-11',
                    so_nguoi_o: 1
                }
            }
        );

        expect(response.status()).toBe(404);

        const body = await response.json();

        expect(body.error).toBe('Phòng không tồn tại');
    });


    test('BOOK-05 - Đặt phòng không có token', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/`,
            {
                data: {
                    room_id: 1,
                    ho_ten: 'Hò A Cút',
                    ngay_sinh: '2005-05-11',
                    so_nguoi_o: 1
                }
            }
        );

        expect(response.status()).toBe(401);
    });


    test('BOOK-06 - Kiểm tra danh sách booking của sinh viên', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}/api/bookings/my-bookings`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(Array.isArray(body)).toBeTruthy();

        // Kiểm tra có booking ở trạng thái pending hoặc cancelled
        if (body.length > 0) {
            expect(body[0]).toHaveProperty('trang_thai');
        }
    });


    // =====================================================
    // CANCELLATION
    // =====================================================

    test('CANCEL-01 - Hủy booking thành công', async ({ request }) => {
        // Lấy danh sách booking của sinh viên
        const listResponse = await request.get(
            `${BASE_URL}/api/bookings/my-bookings`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(listResponse.status()).toBe(200);

        const bookings = await listResponse.json();

        // Tìm booking đang pending
        const booking = bookings.find(
            item => item.trang_thai === 'pending'
        );

        expect(booking).toBeTruthy();

        const response = await request.post(
            `${BASE_URL}/api/bookings/${booking.id}/cancel`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.message).toBe(
            'Hủy đặt phòng thành công'
        );
    });


    test('CANCEL-02 - Hủy booking không tồn tại', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/999999/cancel`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(404);

        const body = await response.json();

        expect(body.error).toBe(
            'Không tìm thấy đơn đặt phòng'
        );
    });


    test('CANCEL-03 - Hủy booking của người khác', async ({ request }) => {
        // Booking ID 1 dùng cho test booking của người khác
        const response = await request.post(
            `${BASE_URL}/api/bookings/1/cancel`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(404);

        const body = await response.json();

        expect(body.error).toBe(
            'Không tìm thấy đơn đặt phòng'
        );
    });


    test('CANCEL-04 - Hủy booking đã được hủy', async ({ request }) => {
        // Booking ID 2 đã được hủy trong manual test
        const response = await request.post(
            `${BASE_URL}/api/bookings/2/cancel`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.error).toBe(
            'Đơn đặt phòng đã được hủy trước đó'
        );
    });


    test('CANCEL-05 - Hủy booking không có token', async ({ request }) => {
        const response = await request.post(
            `${BASE_URL}/api/bookings/2/cancel`
        );

        expect(response.status()).toBe(401);
    });


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    test('NOTI-01 - Lấy danh sách thông báo', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}/api/notifications/`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(Array.isArray(body)).toBeTruthy();
    });


    test('NOTI-02 - Lấy thông báo không có token', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}/api/notifications/`
        );

        expect(response.status()).toBe(401);
    });


    test('NOTI-03 - Đánh dấu thông báo đã đọc', async ({ request }) => {
        // Lấy notification của chính sinh viên
        const listResponse = await request.get(
            `${BASE_URL}/api/notifications/`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(listResponse.status()).toBe(200);

        const notifications = await listResponse.json();

        // Tài khoản phải có ít nhất 1 notification
        expect(notifications.length).toBeGreaterThan(0);

        const notificationId = notifications[0].id;

        const response = await request.put(
            `${BASE_URL}/api/notifications/${notificationId}/read`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.message).toBe(
            'Đánh dấu đã đọc thành công'
        );
    });


    test('NOTI-04 - Đánh dấu thông báo không tồn tại', async ({ request }) => {
        const response = await request.put(
            `${BASE_URL}/api/notifications/999999/read`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(404);

        const body = await response.json();

        expect(body.error).toBe(
            'Không tìm thấy thông báo'
        );
    });


    test('NOTI-05 - Đánh dấu tất cả thông báo đã đọc', async ({ request }) => {
        const response = await request.put(
            `${BASE_URL}/api/notifications/read-all`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.message).toBe(
            'Đánh dấu tất cả đã đọc thành công'
        );
    });


    test('NOTI-06 - Kiểm tra số thông báo chưa đọc', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}/api/notifications/unread-count`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body).toHaveProperty('count');
        expect(typeof body.count).toBe('number');
    });

});