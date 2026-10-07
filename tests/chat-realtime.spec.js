const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const TOKEN_A = process.env.CHAT_TOKEN_A;

const VALID_CONVERSATION_ID =
    Number(process.env.CHAT_CONVERSATION_ID || 0);


async function sendMessage(request, content) {
    return await request.post(
        `${BASE_URL}/api/chat/send`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN_A}`,
                'Content-Type': 'application/json'
            },
            data: {
                conversationId: VALID_CONVERSATION_ID,
                content
            }
        }
    );
}


test.describe('PHÂN VÙNG TƯƠNG ĐƯƠNG CHO NỘI DUNG TIN NHẮN', () => {

    test('TC-EP-01 - Nội dung rỗng', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const response = await sendMessage(
            request,
            ''
        );

        expect(response.status()).toBe(400);
    });


    test('TC-EP-02 - Nội dung hợp lệ', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const response = await sendMessage(
            request,
            'Xin chào'
        );

        expect([200, 201]).toContain(response.status());
    });


    test('TC-EP-03 - Nội dung chỉ chứa khoảng trắng', async ({ request }) => {
        test.skip(
            !TOKEN_A || !VALID_CONVERSATION_ID,
            'Thiếu TOKEN_A hoặc conversation ID'
        );

        const response = await sendMessage(
            request,
            ' '
        );

        /*
         * Đây chính là case đang FAIL trong Excel
         * nếu backend chưa xử lý trim/whitespace.
         *
         * Khi backend được sửa:
         * expect(response.status()).toBe(400);
         *
         * Nếu bạn muốn Playwright phản ánh đúng trạng thái
         * FAIL hiện tại trong Excel, giữ dòng dưới.
         */
        expect(response.status()).toBe(400);
    });

});