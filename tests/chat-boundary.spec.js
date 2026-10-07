const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const TOKEN_A = process.env.CHAT_TOKEN_A;
const TOKEN_C = process.env.CHAT_TOKEN_C;

const VALID_CONVERSATION_ID =
    Number(process.env.CHAT_CONVERSATION_ID || 0);

const OTHER_CONVERSATION_ID =
    Number(process.env.CHAT_OTHER_CONVERSATION_ID || 0);


async function sendMessage(request, token, body) {
    return await request.post(
        `${BASE_URL}/api/chat/send`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: body
        }
    );
}


test.describe('TEST CASE GỬI TIN NHẮN', () => {

    test('TC-SEND-01 - Dữ liệu hợp lệ', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const response = await sendMessage(
            request,
            TOKEN_A,
            {
                conversationId: VALID_CONVERSATION_ID,
                content: `Playwright test ${Date.now()}`
            }
        );

        expect([200, 201]).toContain(response.status());
    });


    test('TC-SEND-02 - Thiếu nội dung', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const response = await sendMessage(
            request,
            TOKEN_A,
            {
                conversationId: VALID_CONVERSATION_ID
            }
        );

        expect(response.status()).toBe(400);
    });


    test('TC-SEND-03 - Thiếu conversationId', async ({ request }) => {
        test.skip(!TOKEN_A, 'Thiếu CHAT_TOKEN_A');

        const response = await sendMessage(
            request,
            TOKEN_A,
            {
                content: 'Tin nhắn test'
            }
        );

        expect(response.status()).toBe(400);
    });


    test('TC-SEND-04 - Thiếu cả conversationId và content', async ({ request }) => {
        test.skip(!TOKEN_A, 'Thiếu CHAT_TOKEN_A');

        const response = await sendMessage(
            request,
            TOKEN_A,
            {}
        );

        expect(response.status()).toBe(400);
    });


    test('TC-SEND-05 - Conversation không tồn tại', async ({ request }) => {
        test.skip(!TOKEN_A, 'Thiếu CHAT_TOKEN_A');

        const response = await sendMessage(
            request,
            TOKEN_A,
            {
                conversationId: 999999999,
                content: 'Test conversation không tồn tại'
            }
        );

        expect(response.status()).toBe(403);
    });


    test('TC-SEND-06 - Không thuộc conversation', async ({ request }) => {
        test.skip(
            !TOKEN_C || !OTHER_CONVERSATION_ID,
            'Cần CHAT_TOKEN_C và CHAT_OTHER_CONVERSATION_ID'
        );

        const response = await sendMessage(
            request,
            TOKEN_C,
            {
                conversationId: OTHER_CONVERSATION_ID,
                content: 'Tin nhắn từ user không có quyền'
            }
        );

        expect(response.status()).toBe(403);
    });


    test('TC-SEND-07 - Không có JWT', async ({ request }) => {
        test.skip(
            !VALID_CONVERSATION_ID,
            'Thiếu CHAT_CONVERSATION_ID'
        );

        const response = await request.post(
            `${BASE_URL}/api/chat/send`,
            {
                data: {
                    conversationId: VALID_CONVERSATION_ID,
                    content: 'Test không có JWT'
                }
            }
        );

        expect(response.status()).toBe(401);
    });


    test('TC-SEND-08 - JWT không hợp lệ', async ({ request }) => {
        test.skip(
            !VALID_CONVERSATION_ID,
            'Thiếu CHAT_CONVERSATION_ID'
        );

        const response = await sendMessage(
            request,
            'jwt_sai_khong_hop_le',
            {
                conversationId: VALID_CONVERSATION_ID,
                content: 'Test JWT sai'
            }
        );

        expect([401, 403]).toContain(response.status());
    });


    test('TC-SEND-09 - Nội dung chỉ có khoảng trắng', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const response = await sendMessage(
            request,
            TOKEN_A,
            {
                conversationId: VALID_CONVERSATION_ID,
                content: '   '
            }
        );

        /*
         * Theo test case phân vùng tương đương:
         * khoảng trắng chỉ được xem là dữ liệu không hợp lệ.
         *
         * Nếu backend hiện tại không validate whitespace,
         * test này sẽ FAIL - đúng với kết quả trong Excel.
         */
        expect(response.status()).toBe(400);
    });


    test('TC-SEND-10 - Gửi nhiều tin liên tiếp', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const totalMessages = 5;

        for (let i = 1; i <= totalMessages; i++) {
            const response = await sendMessage(
                request,
                TOKEN_A,
                {
                    conversationId: VALID_CONVERSATION_ID,
                    content: `Playwright message ${i} - ${Date.now()}`
                }
            );

            expect([200, 201]).toContain(response.status());
        }
    });

});