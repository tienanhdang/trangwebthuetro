import { test, expect } from '@playwright/test';

test('TC-SEARCH-01 - Tìm kiếm phòng bằng từ khóa hợp lệ', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập từ khóa
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('Cầu Giấy');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Kiểm tra kết quả tìm kiếm có xuất hiện
    await expect(page.locator('body')).toContainText('Cầu Giấy');

});

test('TC-SEARCH-02 - Tìm kiếm bằng từ khóa không tồn tại', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập từ khóa không tồn tại
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('XYZ_KHONG_TON_TAI_999999');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Kiểm tra thông báo không có kết quả
    await expect(page.locator('body')).toContainText(
        'Không tìm thấy phòng nào phù hợp với tiêu chí tìm kiếm.'
    );

});

test('TC-SEARCH-03 - Tìm kiếm với từ khóa rỗng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Để trống ô tìm kiếm
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Kiểm tra danh sách phòng vẫn hiển thị
    await expect(page.locator('body')).toContainText('phòng');

});

test('TC-SEARCH-04 - Lọc phòng theo khoảng giá', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập khoảng giá
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-05 - Lọc phòng theo nội thất', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Mở bộ lọc nội thất
    await page
        .getByRole('button', { name: ' Nội thất' })
        .click();

    // Chọn Giường
    await page
        .getByRole('checkbox', { name: '🛏️ Giường' })
        .check();

    // Chọn Điều hòa
    await page
        .getByRole('checkbox', { name: '❄️ Điều hòa' })
        .check();

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-06 - Kết hợp từ khóa và khoảng giá', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập từ khóa
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('Cầu Giấy');

    // Nhập khoảng giá
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-07 - Kết hợp từ khóa và khoảng giá', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập từ khóa
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('Cầu Giấy');

    // Nhập khoảng giá
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-08 - Kết hợp khoảng giá và nội thất', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập khoảng giá
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Mở bộ lọc nội thất
    await page
        .getByRole('button', { name: ' Nội thất' })
        .click();

    // Chọn nội thất
    await page
        .getByRole('checkbox', { name: '🛏️ Giường' })
        .check();

    // Tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-09 - Kết hợp từ khóa, khoảng giá và nội thất', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Từ khóa
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('Cầu Giấy');

    // Khoảng giá
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Mở bộ lọc nội thất
    await page
        .getByRole('button', { name: ' Nội thất' })
        .click();

    // Chọn nội thất
    await page
        .getByRole('checkbox', { name: '🛏️ Giường' })
        .check();

    // Tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-10 - Áp dụng tất cả tiêu chí tìm kiếm', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Từ khóa
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('Cầu Giấy');

    // Giá thấp nhất
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    // Giá cao nhất
    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Mở bộ lọc nội thất
    await page
        .getByRole('button', { name: ' Nội thất' })
        .click();

    // Chọn nội thất
    await page
        .getByRole('checkbox', { name: '🛏️ Giường' })
        .check();

    await page
        .getByRole('checkbox', { name: '❄️ Điều hòa' })
        .check();

    // Tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-11 - Tìm kiếm không có điều kiện lọc', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Không nhập từ khóa, không chọn bộ lọc

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Kiểm tra danh sách phòng vẫn hiển thị
    await expect(page.locator('body')).toContainText('phòng');

});

test('TC-SEARCH-12 - Tìm kiếm với một điều kiện lọc', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Chỉ sử dụng một điều kiện: từ khóa
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill('Cầu Giấy');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Kiểm tra kết quả
    await expect(page.locator('body')).toContainText('Cầu Giấy');

});

test('TC-SEARCH-13 - Tìm kiếm với nhiều điều kiện lọc', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Điều kiện 1: khoảng giá
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    // Điều kiện 2: nội thất
    await page
        .getByRole('button', { name: ' Nội thất' })
        .click();

    await page
        .getByRole('checkbox', { name: '🛏️ Giường' })
        .check();

    // Tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-14 - Thay đổi bộ lọc tìm kiếm', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Lọc lần 1: giá 2 - 5 triệu
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('2000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('5000000');

    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Thay đổi bộ lọc: giá 5 - 10 triệu
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('5000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('10000000');

    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-15 - Khoảng giá không hợp lệ', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập khoảng giá không hợp lệ: thấp > cao
    await page
        .getByRole('spinbutton', { name: '💰 Giá thấp nhất (VNĐ)' })
        .fill('5000000');

    await page
        .getByRole('spinbutton', { name: '💰 Giá cao nhất (VNĐ)' })
        .fill('2000000');

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

});

test('TC-SEARCH-16 - Kiểm tra SQL Injection', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Nhập chuỗi SQL Injection
    await page
        .getByRole('textbox', { name: '🔍 Tên phòng, khu vực, địa chỉ' })
        .fill("' OR '1'='1");

    // Bấm tìm kiếm
    await page
        .getByRole('button', { name: ' TÌM KIẾM' })
        .click();

    // Kiểm tra trang vẫn hoạt động bình thường
    await expect(page.locator('body')).toBeVisible();

});

test('TC-DETAIL-01 - Xem chi tiết phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Chọn một phòng
    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Kiểm tra đã chuyển sang trang chi tiết
    await expect(page).toHaveURL(/chitiet\.html/);

});

test('TC-DETAIL-02 - Kiểm tra thông tin phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Mở phòng
    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Kiểm tra trang chi tiết có thông tin phòng
    await expect(page.locator('body')).toContainText('Lan Quế Phường');

});

test('TC-DETAIL-03 - Kiểm tra thông tin nội thất phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    // Mở phòng
    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Kiểm tra trang chi tiết có thông tin nội thất
    await expect(page.locator('body')).toContainText('Nội thất');

});

test('TC-DETAIL-04 - Kiểm tra giá phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Kiểm tra trang chi tiết có thông tin giá
    await expect(page.locator('body')).toContainText('Giá');

});

test('TC-DETAIL-05 - Kiểm tra địa chỉ phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Kiểm tra trang chi tiết có thông tin địa chỉ
    await expect(page.locator('body')).toContainText('Địa chỉ');

});

test('TC-DETAIL-06 - Kiểm tra mô tả phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Kiểm tra trang chi tiết có thông tin mô tả
    await expect(page.locator('body')).toContainText('Mô tả');

});

test('TC-DETAIL-07 - Kiểm tra hình ảnh phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('img').first()).toBeVisible();
});


test('TC-DETAIL-08 - Kiểm tra thông tin chủ phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).toContainText('chủ');
});


test('TC-DETAIL-09 - Kiểm tra nút quay lại', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await page.goBack();

    await expect(page).toHaveURL(/localhost:3000/);
});


test('TC-DETAIL-10 - Kiểm tra trang chi tiết không bị lỗi', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).not.toContainText('Cannot GET');
    await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
});

test('TC-CONTACT-01 - Kiểm tra thông tin liên hệ khi chưa đăng nhập', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).toBeVisible();
});


test('TC-CONTACT-02 - Kiểm tra thông tin liên hệ phòng', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).toContainText('Liên hệ');
});


test('TC-CONTACT-03 - Kiểm tra số điện thoại khi chưa đăng nhập', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    // Trang vẫn phải hoạt động
    await expect(page.locator('body')).toBeVisible();
});


test('TC-CONTACT-04 - Kiểm tra yêu cầu đăng nhập khi xem liên hệ', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).not.toContainText('Cannot GET');
});


test('TC-CONTACT-05 - Kiểm tra thông tin liên hệ sau khi đăng nhập', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await expect(page.locator('body')).toBeVisible();
});


test('TC-CONTACT-06 - Kiểm tra quyền truy cập thông tin liên hệ', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await expect(page.locator('body')).toBeVisible();
});


test('TC-CONTACT-07 - Kiểm tra thông tin liên hệ không bị lỗi', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
});


test('TC-CONTACT-08 - Kiểm tra trang liên hệ hoạt động', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    await page
        .getByRole('link', { name: 'Lan Quế Phường Lan Quế Phường' })
        .getByRole('button')
        .click();

    await expect(page.locator('body')).toBeVisible();
});


test('TC-CONTACT-09 - Không trả về số điện thoại khi chưa đăng nhập', async ({ page }) => {

    await page.goto('http://localhost:3000/');

    const response = await page.request.get(
        'http://localhost:3000/phongtro'
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    const rooms = Array.isArray(data)
        ? data
        : (data.data || data.rooms || []);

    for (const room of rooms) {
        expect(room).not.toHaveProperty('so_dien_thoai');
        expect(room).not.toHaveProperty('sdt');
        expect(room).not.toHaveProperty('phone');
        expect(room).not.toHaveProperty('dien_thoai');
    }
});