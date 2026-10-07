const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const TOKEN_A = process.env.CHAT_TOKEN_A;
const TOKEN_B = process.env.CHAT_TOKEN_B;

const CONVERSATION_WITH_MESSAGES =
    Number(process.env.CHAT_CONVERSATION_ID || 0);

test.describe('TEST CASE DANH SÁCH CUỘC TRÒ CHUYỆN', () => {

    test('TC-CHAT-01 - Người dùng đăng nhập, JWT hợp lệ', async ({ request }) => {
        test.skip(!TOKEN_A, 'Thiếu CHAT_TOKEN_A');

        const response = await request.get(
            `${BASE_URL}/api/chat/conversations`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN_A}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const data = await response.json();

        expect(Array.isArray(data)).toBeTruthy();
    });


    test('TC-CHAT-02 - Người dùng chưa đăng nhập, không có JWT', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}/api/chat/conversations`
        );

        expect([401, 403]).toContain(response.status());
    });


    test('TC-CHAT-03 - JWT không hợp lệ', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}/api/chat/conversations`,
            {
                headers: {
                    Authorization: 'Bearer jwt_sai_khong_hop_le'
                }
            }
        );

        expect([401, 403]).toContain(response.status());
    });


test('TC-CHAT-04 - Người dùng chưa có cuộc trò chuyện', async ({ request }) => {
    test.skip(
        !process.env.CHAT_TOKEN_EMPTY,
        'CHAT_TOKEN_EMPTY phải là tài khoản chưa có conversation'
    );

    const response = await request.get(
        `${BASE_URL}/api/chat/conversations`,
        {
            headers: {
                Authorization: `Bearer ${process.env.CHAT_TOKEN_EMPTY}`
            }
        }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBeTruthy();

    expect(data.length).toBe(0);
});


    test('TC-CHAT-05 - Người dùng có nhiều cuộc trò chuyện', async ({ request }) => {
        test.skip(
            !TOKEN_B,
            'Thiếu CHAT_TOKEN_B'
        );

        const response = await request.get(
            `${BASE_URL}/api/chat/conversations`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN_B}`
                }
            }
        );

        expect(response.status()).toBe(200);

        const data = await response.json();

        expect(Array.isArray(data)).toBeTruthy();

        /*
         * Nếu tài khoản A được chuẩn bị có >= 2 conversation
         * thì test này xác nhận hệ thống trả đầy đủ danh sách.
         */
        expect(data.length).toBeGreaterThanOrEqual(2);
    });

});