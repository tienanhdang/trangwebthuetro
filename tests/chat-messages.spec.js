const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const TOKEN_A = process.env.CHAT_TOKEN_A;
const TOKEN_B = process.env.CHAT_TOKEN_B;
const TOKEN_C = process.env.CHAT_TOKEN_C;

const VALID_CONVERSATION_ID =
    Number(process.env.CHAT_CONVERSATION_ID || 0);

const OTHER_CONVERSATION_ID =
    Number(process.env.CHAT_OTHER_CONVERSATION_ID || 0);

const EMPTY_CONVERSATION_ID =
    Number(process.env.CHAT_EMPTY_CONVERSATION_ID || 0);

test.describe('TEST CASE LỊCH SỬ TIN NHẮN', () => {

    test('TC-MSG-01 - Conversation hợp lệ, người dùng có quyền', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu CHAT_TOKEN_A hoặc CHAT_CONVERSATION_ID'
        );

        const response = await request.get(
            `${BASE_URL}/api/chat/messages/${VALID_CONVERSATION_ID}`,
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


    test('TC-MSG-02 - Conversation không tồn tại', async ({ request }) => {
        test.skip(!TOKEN_A, 'Thiếu CHAT_TOKEN_A');

        const invalidId = 999999999;

        const response = await request.get(
            `${BASE_URL}/api/chat/messages/${invalidId}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN_A}`
                }
            }
        );

        /*
         * Tùy controller của project:
         * - 200 + []
         * - hoặc 404
         */
expect(response.status()).toBe(403);
    });


    test('TC-MSG-03 - Conversation thuộc người dùng khác', async ({ request }) => {
        test.skip(
            !TOKEN_C || !OTHER_CONVERSATION_ID,
            'Cần CHAT_TOKEN_C và CHAT_OTHER_CONVERSATION_ID'
        );

        const response = await request.get(
            `${BASE_URL}/api/chat/messages/${OTHER_CONVERSATION_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN_C}`
                }
            }
        );

        expect(response.status()).toBe(403);
    });


    test('TC-MSG-04 - Không có JWT', async ({ request }) => {
        test.skip(
            !VALID_CONVERSATION_ID,
            'Thiếu CHAT_CONVERSATION_ID'
        );

        const response = await request.get(
            `${BASE_URL}/api/chat/messages/${VALID_CONVERSATION_ID}`
        );

        expect([401, 403]).toContain(response.status());
    });


    test('TC-MSG-05 - JWT không hợp lệ', async ({ request }) => {
        test.skip(
            !VALID_CONVERSATION_ID,
            'Thiếu CHAT_CONVERSATION_ID'
        );

        const response = await request.get(
            `${BASE_URL}/api/chat/messages/${VALID_CONVERSATION_ID}`,
            {
                headers: {
                    Authorization: 'Bearer jwt_sai_khong_hop_le'
                }
            }
        );

        expect([401, 403]).toContain(response.status());
    });


    // test('TC-MSG-06 - Conversation không có tin nhắn', async ({ request }) => {
    //     test.skip(
    //         !TOKEN_A || !EMPTY_CONVERSATION_ID,
    //         'Cần CHAT_TOKEN_A và CHAT_EMPTY_CONVERSATION_ID'
    //     );

    //     const response = await request.get(
    //         `${BASE_URL}/api/chat/messages/${EMPTY_CONVERSATION_ID}`,
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${TOKEN_A}`
    //             }
    //         }
    //     );

    //     expect(response.status()).toBe(200);

    //     const data = await response.json();

    //     expect(Array.isArray(data)).toBeTruthy();
    //     expect(data.length).toBe(0);
    // });

});