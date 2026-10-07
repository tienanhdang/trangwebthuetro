# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-realtime.spec.js >> PHÂN VÙNG TƯƠNG ĐƯƠNG CHO NỘI DUNG TIN NHẮN >> TC-EP-03 - Nội dung chỉ chứa khoảng trắng
- Location: tests\chat-realtime.spec.js:60:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | const BASE_URL = 'http://localhost:3000';
  4  | 
  5  | const TOKEN_A = process.env.CHAT_TOKEN_A;
  6  | 
  7  | const VALID_CONVERSATION_ID =
  8  |     Number(process.env.CHAT_CONVERSATION_ID || 0);
  9  | 
  10 | 
  11 | async function sendMessage(request, content) {
  12 |     return await request.post(
  13 |         `${BASE_URL}/api/chat/send`,
  14 |         {
  15 |             headers: {
  16 |                 Authorization: `Bearer ${TOKEN_A}`,
  17 |                 'Content-Type': 'application/json'
  18 |             },
  19 |             data: {
  20 |                 conversationId: VALID_CONVERSATION_ID,
  21 |                 content
  22 |             }
  23 |         }
  24 |     );
  25 | }
  26 | 
  27 | 
  28 | test.describe('PHÂN VÙNG TƯƠNG ĐƯƠNG CHO NỘI DUNG TIN NHẮN', () => {
  29 | 
  30 |     test('TC-EP-01 - Nội dung rỗng', async ({ request }) => {
  31 |         test.skip(
  32 |             !TOKEN_A || !VALID_CONVERSATION_ID,
  33 |             'Thiếu TOKEN_A hoặc conversation ID'
  34 |         );
  35 | 
  36 |         const response = await sendMessage(
  37 |             request,
  38 |             ''
  39 |         );
  40 | 
  41 |         expect(response.status()).toBe(400);
  42 |     });
  43 | 
  44 | 
  45 |     test('TC-EP-02 - Nội dung hợp lệ', async ({ request }) => {
  46 |         test.skip(
  47 |             !TOKEN_A || !VALID_CONVERSATION_ID,
  48 |             'Thiếu TOKEN_A hoặc conversation ID'
  49 |         );
  50 | 
  51 |         const response = await sendMessage(
  52 |             request,
  53 |             'Xin chào'
  54 |         );
  55 | 
  56 |         expect([200, 201]).toContain(response.status());
  57 |     });
  58 | 
  59 | 
  60 |     test('TC-EP-03 - Nội dung chỉ chứa khoảng trắng', async ({ request }) => {
  61 |         test.skip(
  62 |             !TOKEN_A || !VALID_CONVERSATION_ID,
  63 |             'Thiếu TOKEN_A hoặc conversation ID'
  64 |         );
  65 | 
  66 |         const response = await sendMessage(
  67 |             request,
  68 |             ' '
  69 |         );
  70 | 
  71 |         /*
  72 |          * Đây chính là case đang FAIL trong Excel
  73 |          * nếu backend chưa xử lý trim/whitespace.
  74 |          *
  75 |          * Khi backend được sửa:
  76 |          * expect(response.status()).toBe(400);
  77 |          *
  78 |          * Nếu bạn muốn Playwright phản ánh đúng trạng thái
  79 |          * FAIL hiện tại trong Excel, giữ dòng dưới.
  80 |          */
> 81 |         expect(response.status()).toBe(400);
     |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  82 |     });
  83 | 
  84 | });
```