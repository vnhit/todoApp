# Kế hoạch backend Django cho Todo Dashboard

Ngày lập: 15/11/2026. Trạng thái: đề xuất triển khai dựa trên mã nguồn hiện tại.

Cập nhật triển khai 16/11/2026: theo yêu cầu tách thư mục, toàn bộ giao diện nằm trong `frontend/`, Django nằm trong `backend/`. Các đường dẫn `src/...` bên dưới tương ứng `frontend/src/...`. Dùng một file `backend/config/settings.py` để giữ cấu hình gọn. PostgreSQL đã có cấu hình; SQLite là lựa chọn chạy local khi máy chưa cài PostgreSQL. Xem [README](../README.md) để cài đặt và chạy.

## 1. Hiện trạng và phạm vi

Frontend dùng JavaScript thuần, ES modules và Tailwind CSS. Chưa có backend. `src/state/taskStore.js` lưu task vào `localStorage`; `src/app.js` tự xử lý đăng ký, đăng nhập và lưu cả mật khẩu trong `todo_user`.

MVP cần hỗ trợ đầy đủ các luồng hiện có:

- Đăng ký bằng tên, email, mật khẩu; đăng nhập và đăng xuất.
- Xem, sửa tên và URL ảnh đại diện; đổi mật khẩu.
- Thêm, xem chi tiết, sửa, xóa và hoàn thành task.
- My Tasks và Vital Tasks; Vital là task có `priority = Extreme`.
- Dashboard gồm tổng số task, đang làm và đã hoàn thành.
- Mỗi tài khoản có dữ liệu riêng, dùng lại được khi đăng nhập trên thiết bị khác.

Các giả định để triển khai:

- Giữ hai trạng thái `pending`, `completed` và hai mức ưu tiên `Moderate`, `Extreme`.
- Trường `date` hiện cho phép sửa nhưng màn hình chi tiết ghi “Created on”. Tạm xác định đây là **ngày công việc**; đổi nhãn giao diện cho rõ và lưu thời điểm tạo thật bằng `created_at`. Chưa coi `date` là hạn chót.
- Dashboard hiện đếm toàn bộ task, dù có câu giới thiệu “hôm nay”. MVP giữ thống kê toàn bộ task của tài khoản và sửa câu giới thiệu tương ứng.
- Ảnh task và avatar tiếp tục dùng URL. `objective` hiện chỉ có giá trị hiển thị dự phòng “Study”, chưa có form nhập; chưa đưa vào mô hình MVP và bỏ nội dung giả khi nối API.
- Thông báo, tích hợp lịch, upload ảnh, chia sẻ task, tìm kiếm và nhắc hạn là hạng mục sau MVP.

## 2. Kiến trúc và công nghệ

```text
Frontend JavaScript hiện tại
          | fetch /api/v1/...
          v
Django + Django REST Framework
          | Django ORM
          v
      PostgreSQL
```

- **Django 5.2 LTS**, dùng bản vá mới nhất trong nhánh khi khởi tạo; nhánh này có hỗ trợ mở rộng đến tháng 4/2028 theo [lịch hỗ trợ Django](https://www.djangoproject.com/download/).
- **Django REST Framework (DRF)** cho serializer, view, quyền truy cập và phân trang.
- **PostgreSQL** cho môi trường phát triển, kiểm thử tích hợp và production; `psycopg` làm driver. Có thể chạy PostgreSQL bằng Docker Compose nếu máy đã có Docker.
- **Django Admin** cho quản trị nội bộ; đăng ký hai model User và Task.
- **Session cookie** cho đăng nhập. Frontend và API cùng origin, ví dụ `/` phục vụ giao diện, `/api/v1/` chuyển đến Django. Đây là lựa chọn phù hợp cho ứng dụng web hiện tại theo [tài liệu SessionAuthentication của DRF](https://www.django-rest-framework.org/api-guide/authentication/#sessionauthentication).
- Development phục vụ trang HTML và tài nguyên qua Django; production phục vụ tài nguyên tĩnh qua web server và chuyển `/api/` đến ứng dụng Django. Tránh thay đổi công cụ frontend trong bước đầu.
- Chốt và khóa phiên bản Python cùng các dependency tương thích khi dựng môi trường. Chưa cần tác vụ nền hay cache phân tán cho các luồng MVP.

Cấu trúc dự kiến:

```text
todo-dashboard/
  backend/
    manage.py
    requirements.txt
    .env.example
    config/
      settings/
        base.py
        development.py
        production.py
      urls.py
      wsgi.py
    accounts/
      models.py, managers.py, serializers.py, views.py, urls.py, admin.py
      migrations/
      tests/
    tasks/
      models.py, serializers.py, views.py, urls.py, admin.py
      migrations/
      tests/
  frontend/src/
    api/
      client.js
      authApi.js
      taskApi.js
    state/
      authStore.js
      taskStore.js
    views/                 # Các view hiện tại được nối API
  docs/
    backend-plan.md
```

## 3. Mô hình dữ liệu

Quan hệ: một User sở hữu nhiều Task; mỗi Task thuộc đúng một User.

| Model | Trường chính | Quy tắc |
| --- | --- | --- |
| User | `id`, `email`, `name`, `avatar_url` | Email dùng để đăng nhập, duy nhất không phân biệt hoa thường; tên bắt buộc, tối đa 150 ký tự; avatar không bắt buộc |
| User | Các trường mật khẩu, quyền và thời gian của Django | Hash mật khẩu bằng cơ chế Django; API không trả mật khẩu hoặc hash |
| Task | `id`, `owner` | ID số do database cấp; owner lấy từ phiên đăng nhập |
| Task | `title`, `description` | Tiêu đề sau khi trim phải dài 1–200 ký tự; mô tả tùy chọn, giới hạn 10.000 ký tự |
| Task | `task_date` | DateField; khi tạo mà không gửi ngày thì dùng ngày hiện tại tại Asia/Ho_Chi_Minh; giá trị sai định dạng bị từ chối |
| Task | `priority` | `Moderate` hoặc `Extreme`; mặc định `Moderate` |
| Task | `status` | `pending` hoặc `completed`; mặc định `pending` |
| Task | `image_url` | URL HTTP/HTTPS, tùy chọn; ảnh dự phòng do frontend xử lý |
| Task | `created_at`, `updated_at` | Backend tự quản lý, không cho client sửa |

Chi tiết thực hiện:

- Tạo custom User từ `AbstractUser`, dùng email làm `USERNAME_FIELD`, bỏ username và bổ sung manager phù hợp. Cấu hình `AUTH_USER_MODEL` trước migration đầu tiên theo [hướng dẫn Django](https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#using-a-custom-user-model-when-starting-a-project).
- Chuẩn hóa email bằng trim/lowercase và đặt ràng buộc duy nhất trong database; serializer trả lỗi rõ ràng khi trùng.
- Task dùng `ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE)`. MVP chưa cung cấp chức năng tự xóa tài khoản.
- Thêm index `(owner, priority)` phục vụ Vital Tasks và `(owner, created_at)` phục vụ danh sách. Trạng thái và mức ưu tiên có validation cùng database check constraint.
- Giữ tên trường API gần frontend hiện tại: `date` ánh xạ `task_date`, `image` ánh xạ `image_url`, `avatar` ánh xạ `avatar_url`.
- Bật `USE_TZ`; timestamp API là ISO 8601 có timezone. Ngày công việc dùng `YYYY-MM-DD` và không chuyển qua UTC như timestamp.

## 4. Hợp đồng API

Prefix: `/api/v1/`. Request và response dùng JSON, ngoại trừ response `204` không có body.

| Method | Endpoint | Chức năng / dữ liệu gửi |
| --- | --- | --- |
| GET | `/auth/csrf/` | Thiết lập CSRF cookie và trả token cho các request ghi |
| POST | `/auth/register/` | `{name, email, password}`; tạo tài khoản, trả user công khai với `201`, rồi chuyển tới đăng nhập |
| POST | `/auth/login/` | `{email, password}`; tạo session, trả user công khai |
| POST | `/auth/logout/` | Hủy session; trả `204` |
| GET | `/auth/me/` | Lấy user hiện tại để khôi phục giao diện khi tải lại trang |
| PATCH | `/auth/me/` | Sửa `{name, avatar}`; email chỉ đọc trong MVP |
| POST | `/auth/change-password/` | `{current_password, new_password}`; kiểm tra mật khẩu hiện tại, đổi mật khẩu, trả `204` |
| GET | `/tasks/` | Danh sách task của user; lọc `priority`, `status`; phân trang |
| POST | `/tasks/` | Tạo task; trả task đã lưu với `201` |
| GET | `/tasks/{id}/` | Xem chi tiết |
| PATCH | `/tasks/{id}/` | Sửa các trường cho phép; Finish gửi `{status: "completed"}` |
| DELETE | `/tasks/{id}/` | Xóa task; trả `204` |
| GET | `/dashboard/summary/` | Trả `{total, pending, completed}` của toàn bộ task thuộc user |

Ví dụ response của một task:

```json
{
  "id": 42,
  "title": "Hoàn thành giao diện Todo",
  "description": "Nối chức năng tạo task với API",
  "date": "2026-11-15",
  "priority": "Extreme",
  "status": "pending",
  "image": "",
  "created_at": "2026-11-15T02:00:00Z",
  "updated_at": "2026-11-15T02:00:00Z"
}
```

Quy ước chung:

- Danh sách trả `{count, next, previous, results}`; mặc định 20 task/trang, tối đa 100; sắp xếp `-created_at, -id` để thứ tự ổn định. Frontend cần nút chuyển trang hoặc tải thêm.
- Vital Tasks gọi `/tasks/?priority=Extreme`. Các bộ lọc kết hợp theo điều kiện AND; giá trị enum không hợp lệ trả `400`.
- Summary được tính từ dữ liệu database của user, độc lập với bộ lọc và trang danh sách đang xem; không suy ra tổng từ 20 task đã tải.
- Dùng một định dạng lỗi: `{code, message, fields}`. `fields` là lỗi từng trường khi có; `400` cho dữ liệu sai, `403` cho yêu cầu bị từ chối, `404` cho task không truy cập được, `429` cho quá giới hạn request.
- Với session auth, phân biệt `403` bằng `code`, ví dụ `auth_required` và `csrf_failed`, để giao diện không nhầm lỗi CSRF với hết phiên. Login sai trả `400` với `invalid_credentials` và thông báo chung.
- Trường `owner`, `id`, `created_at`, `updated_at` không nhận giá trị ghi từ client. Task thuộc user khác trả `404` cho đọc/sửa/xóa.

## 5. Xác thực và quyền truy cập

- Mặc định các API yêu cầu đăng nhập; chỉ CSRF, đăng ký và đăng nhập được truy cập khi chưa có session.
- Cookie session bật HttpOnly, SameSite=Lax và Secure khi chạy HTTPS production. Frontend gửi cookie cùng request và CSRF token qua `X-CSRFToken` khi ghi dữ liệu.
- Bảo vệ CSRF cả đăng ký và đăng nhập khi người dùng còn anonymous; triển khai auth view bằng Django với CSRF protection rõ ràng. Sau login phải lấy token mới vì token có thể được xoay.
- Đăng xuất hủy phiên trên server. Đổi mật khẩu yêu cầu mật khẩu cũ và cập nhật session hash để giữ phiên hiện tại hợp lệ.
- Queryset task luôn bắt đầu từ `Task.objects.filter(owner=request.user)`. Áp dụng cùng phạm vi cho danh sách, chi tiết, chỉnh sửa, xóa và summary.
- Áp dụng password validators của Django, giới hạn tốc độ đăng ký/đăng nhập và không ghi mật khẩu vào log.
- Frontend hiện chèn dữ liệu vào `innerHTML`. Khi nối API cần render văn bản bằng `textContent` hoặc escape đúng ngữ cảnh, kiểm tra URL ảnh trước khi gắn thuộc tính để tránh biến nội dung task thành HTML chạy được.

## 6. Kế hoạch nối frontend

| File / nhóm file | Thay đổi dự kiến |
| --- | --- |
| `src/api/client.js` mới | Wrapper `fetch`: JSON, cookie, CSRF, response rỗng, lỗi API và lỗi mạng |
| `src/api/authApi.js` mới | Các request auth và profile |
| `src/api/taskApi.js` mới | CRUD, danh sách có bộ lọc/phân trang và summary |
| `src/state/authStore.js` mới | User công khai trong bộ nhớ; khởi tạo bằng `/auth/me/` |
| `src/state/taskStore.js` | Chuyển các thao tác sang async; lưu kết quả API trong bộ nhớ; quản lý bộ lọc, trang, loading và lỗi |
| `src/app.js` | `await` API ở từng sự kiện, chỉ báo thành công sau response; khóa nút submit trong lúc chờ; khôi phục phiên khi khởi động |
| `src/views/profileView.js` | Nhận user từ state; tách form đổi mật khẩu; không hiển thị lại mật khẩu đã lưu |
| `src/views/mainLayoutView.js` | Nhận user từ state; thêm điều khiển phân trang |
| `src/views/dashboardView.js` | Nhận số liệu summary từ API |
| Form và card task | Dùng ID backend, giữ tên trường API đã chốt; xử lý dữ liệu hiển thị an toàn |

Sau create/update/delete/finish, tải lại trang danh sách theo bộ lọc hiện tại và tải lại summary. Nếu xóa hết mục ở trang cuối thì chuyển về trang hợp lệ trước đó. Việc lưu điều kiện truy vấn thay cho `lastTasks` tránh lỗi mảng cũ sau xóa hoặc khi task đổi mức ưu tiên.

Dữ liệu demo trong trình duyệt chưa có chủ sở hữu đáng tin cậy. Khi chuyển đổi, bỏ sử dụng và xóa `todo_user` chứa mật khẩu cũ; người dùng đăng ký tài khoản thật. Giữ dữ liệu task cũ để có thể xuất dự phòng, không tự gán vào tài khoản mới. Chức năng nhập task cũ, nếu cần, sẽ được làm riêng với bước chọn tài khoản đích, xem trước và chống nhập trùng.

## 7. Thứ tự triển khai và đầu ra

Ước lượng **7–10 ngày làm việc cho một lập trình viên đã quen Django**, tính cả nối frontend và kiểm thử; cần điều chỉnh theo kinh nghiệm và môi trường triển khai.

| Giai đoạn | Thời gian | Đầu ra / điều kiện hoàn thành |
| --- | --- | --- |
| 1. Khởi tạo | 1 ngày | Django/DRF, PostgreSQL, settings, `.env.example`, custom User, migration và Admin chạy được |
| 2. Tài khoản | 1–2 ngày | Đăng ký/đăng nhập/đăng xuất/me/profile/đổi mật khẩu; kiểm thử session và CSRF đạt |
| 3. Task | 1–2 ngày | Model, CRUD, quyền sở hữu, bộ lọc và phân trang; kiểm thử với hai tài khoản đạt |
| 4. Dashboard và API contract | 0,5 ngày | Summary đúng, response/lỗi nhất quán, tài liệu request/response đầy đủ |
| 5. Nối giao diện | 2–2,5 ngày | Toàn bộ luồng hiện tại dùng API; loading/lỗi, phân trang và tải lại phiên hoạt động |
| 6. Kiểm thử toàn luồng và chuẩn bị chạy | 1 ngày | Kiểm thử trên PostgreSQL, hướng dẫn cài/chạy, build CSS, cấu hình production và kiểm tra triển khai |

Mỗi giai đoạn chức năng có kiểm thử tương ứng ngay trong giai đoạn đó. Giai đoạn cuối kiểm tra toàn luồng từ giao diện đến database.

## 8. Tiêu chí nghiệm thu

- Tài khoản A không xem, sửa, hoàn thành, xóa hoặc thống kê được task của B, kể cả tự sửa ID trên request.
- Đăng ký từ chối email trùng khác hoa/thường; đăng nhập sai báo lỗi; mật khẩu không xuất hiện trong response, localStorage hoặc log.
- Request ghi thiếu/sai CSRF bị từ chối, gồm cả đăng ký và đăng nhập; frontend vẫn hoạt động sau login khi CSRF token đổi.
- Tạo/sửa/xóa/Finish hiển thị đúng sau tải lại trang và đăng nhập từ trình duyệt khác; logout chấm dứt quyền sử dụng phiên cũ.
- Đổi profile không yêu cầu nhập mật khẩu; đổi mật khẩu kiểm tra mật khẩu cũ và không làm lỗi phiên đang dùng.
- Với hơn 20 task, phân trang và summary vẫn đúng; tài khoản chưa có task nhận ba số đếm bằng 0.
- Đổi task từ Extreme sang Moderate làm task biến mất khỏi Vital; xóa task không để card cũ trên giao diện.
- Chuỗi HTML trong tiêu đề/mô tả/tên hiển thị xuất hiện dưới dạng văn bản; URL ảnh sai và enum/ngày không hợp lệ bị từ chối.
- Ngày mặc định đúng tại Asia/Ho_Chi_Minh, kể cả khi UTC đang ở ngày trước; nhãn ngày phân biệt rõ ngày công việc và thời điểm tạo.
- Lỗi mạng giữ lại nội dung form và cho phép thử lại; nút submit không gửi lặp khi đang chờ.
- Kiểm thử backend dùng Django TestCase/DRF APIClient; có ca bật kiểm tra CSRF thật. Kiểm tra thủ công các luồng chính trên giao diện desktop và mobile.
- Trước production: `manage.py check --deploy` với production settings, chạy migration, build Tailwind CSS, HTTPS/cookie phù hợp, `DEBUG=False`, secrets từ môi trường, cấu hình hosts, phục vụ static và phương án sao lưu/khôi phục PostgreSQL.

Bước triển khai đầu tiên: dựng `backend/`, cấu hình PostgreSQL và custom User, rồi hoàn thành auth trước khi chuyển task sang API.
