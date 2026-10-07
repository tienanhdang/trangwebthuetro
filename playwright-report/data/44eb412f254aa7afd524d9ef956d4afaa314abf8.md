# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-boundary.spec.js >> TEST CASE GỬI TIN NHẮN >> TC-SEND-09 - Nội dung chỉ có khoảng trắng
- Location: tests\chat-boundary.spec.js:170:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  92  |         expect(response.status()).toBe(400);
  93  |     });
  94  | 
  95  | 
  96  |     test('TC-SEND-05 - Conversation không tồn tại', async ({ request }) => {
  97  |         test.skip(!TOKEN_A, 'Thiếu CHAT_TOKEN_A');
  98  | 
  99  |         const response = await sendMessage(
  100 |             request,
  101 |             TOKEN_A,
  102 |             {
  103 |                 conversationId: 999999999,
  104 |                 content: 'Test conversation không tồn tại'
  105 |             }
  106 |         );
  107 | 
  108 |         expect(response.status()).toBe(403);
  109 |     });
  110 | 
  111 | 
  112 |     test('TC-SEND-06 - Không thuộc conversation', async ({ request }) => {
  113 |         test.skip(
  114 |             !TOKEN_C || !OTHER_CONVERSATION_ID,
  115 |             'Cần CHAT_TOKEN_C và CHAT_OTHER_CONVERSATION_ID'
  116 |         );
  117 | 
  118 |         const response = await sendMessage(
  119 |             request,
  120 |             TOKEN_C,
  121 |             {
  122 |                 conversationId: OTHER_CONVERSATION_ID,
  123 |                 content: 'Tin nhắn từ user không có quyền'
  124 |             }
  125 |         );
  126 | 
  127 |         expect(response.status()).toBe(403);
  128 |     });
  129 | 
  130 | 
  131 |     test('TC-SEND-07 - Không có JWT', async ({ request }) => {
  132 |         test.skip(
  133 |             !VALID_CONVERSATION_ID,
  134 |             'Thiếu CHAT_CONVERSATION_ID'
  135 |         );
  136 | 
  137 |         const response = await request.post(
  138 |             `${BASE_URL}/api/chat/send`,
  139 |             {
  140 |                 data: {
  141 |                     conversationId: VALID_CONVERSATION_ID,
  142 |                     content: 'Test không có JWT'
  143 |                 }
  144 |             }
  145 |         );
  146 | 
  147 |         expect(response.status()).toBe(401);
  148 |     });
  149 | 
  150 | 
  151 |     test('TC-SEND-08 - JWT không hợp lệ', async ({ request }) => {
  152 |         test.skip(
  153 |             !VALID_CONVERSATION_ID,
  154 |             'Thiếu CHAT_CONVERSATION_ID'
  155 |         );
  156 | 
  157 |         const response = await sendMessage(
  158 |             request,
  159 |             'jwt_sai_khong_hop_le',
  160 |             {
  161 |                 conversationId: VALID_CONVERSATION_ID,
  162 |                 content: 'Test JWT sai'
  163 |             }
  164 |         );
  165 | 
  166 |         expect([401, 403]).toContain(response.status());
  167 |     });
  168 | 
  169 | 
  170 |     test('TC-SEND-09 - Nội dung chỉ có khoảng trắng', async ({ request }) => {
  171 |         test.skip(
  172 |             !TOKEN_A || !VALID_CONVERSATION_ID,
  173 |             'Thiếu TOKEN_A hoặc conversation ID'
  174 |         );
  175 | 
  176 |         const response = await sendMessage(
  177 |             request,
  178 |             TOKEN_A,
  179 |             {
  180 |                 conversationId: VALID_CONVERSATION_ID,
  181 |                 content: '   '
  182 |             }
  183 |         );
  184 | 
  185 |         /*
  186 |          * Theo test case phân vùng tương đương:
  187 |          * khoảng trắng chỉ được xem là dữ liệu không hợp lệ.
  188 |          *
  189 |          * Nếu backend hiện tại không validate whitespace,
  190 |          * test này sẽ FAIL - đúng với kết quả trong Excel.
  191 |          */
> 192 |         expect(response.status()).toBe(400);
      |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  193 |     });
  194 | 
  195 | 
  196 |     test('TC-SEND-10 - Gửi nhiều tin liên tiếp', async ({ request }) => {
  197 |         test.skip(
  198 |             !TOKEN_A || !VALID_CONVERSATION_ID,
  199 |             'Thiếu TOKEN_A hoặc conversation ID'
  200 |         );
  201 | 
  202 |         const totalMessages = 5;
  203 | 
  204 |         for (let i = 1; i <= totalMessages; i++) {
  205 |             const response = await sendMessage(
  206 |                 request,
  207 |                 TOKEN_A,
  208 |                 {
  209 |                     conversationId: VALID_CONVERSATION_ID,
  210 |                     content: `Playwright message ${i} - ${Date.now()}`
  211 |                 }
  212 |             );
  213 | 
  214 |             expect([200, 201]).toContain(response.status());
  215 |         }
  216 |     });
  217 | 
  218 | });
```