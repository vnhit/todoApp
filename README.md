# Todo Dashboard

Giao diện JavaScript/Tailwind và backend Django REST Framework được tách riêng:

```text
frontend/    HTML, CSS, JavaScript, package.json
backend/     Django, API, models, migrations, tests, requirements.txt
docs/        Kế hoạch và hợp đồng API
```

Chức năng: đăng ký/đăng nhập/đăng xuất, hồ sơ và đổi mật khẩu, CRUD task, Finish, Vital Tasks, lọc trạng thái, phân trang và dashboard. Mỗi tài khoản chỉ truy cập task của mình.

## Chạy local trên Windows

Cài đặt xong, mở thư mục dự án bằng **File Explorer** và nhấp đúp **`run.bat`** để chạy server. Sau đó vào **http://127.0.0.1:8000/**; giữ cửa sổ server mở khi dùng ứng dụng. Trong VS Code, có thể chạy `.\run.bat` ở terminal tại thư mục gốc.

Cần Python tương thích Django 5.2 và Node.js/npm. SQLite được dùng mặc định để có thể chạy ngay; PostgreSQL cấu hình bên dưới.

Tại thư mục gốc:

```powershell
npm --prefix frontend ci
npm --prefix frontend run build
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Mở **http://127.0.0.1:8000/** và đăng ký tài khoản. Django phục vụ `frontend/index.html` cùng tài nguyên trong `frontend/src` và `frontend/dist`, nên cookie/CSRF hoạt động cùng origin. Không mở HTML bằng `file://` hoặc Live Server riêng.

Nếu môi trường đã cài và migration đã chạy, chỉ cần lệnh `manage.py runserver` ở trên. Khi sửa class Tailwind, chạy `npm --prefix frontend run dev` tại thư mục gốc ở terminal thứ hai.

Tạo tài khoản quản trị, sau đó vào `/admin/`:

```powershell
.\.venv\Scripts\python.exe manage.py createsuperuser
```

## PostgreSQL

Tạo database `todo_dashboard` và tài khoản database. Đặt trong `backend/.env`:

```dotenv
DB_ENGINE=postgresql
DB_NAME=todo_dashboard
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5432
```

Chạy lại `manage.py migrate`. Chuyển cấu hình database không tự chuyển dữ liệu từ SQLite; nên chọn PostgreSQL trước khi nhập dữ liệu thật. Khi chạy test trên PostgreSQL, tài khoản database cần quyền tạo database kiểm thử.

## Kiểm thử

Tại thư mục gốc:

```powershell
backend\.venv\Scripts\python.exe backend\manage.py test accounts tasks
npm --prefix frontend test
npm --prefix frontend run build
backend\.venv\Scripts\python.exe backend\manage.py makemigrations --check --dry-run
```

Backend kiểm thử quyền sở hữu, CSRF thật, session, đổi mật khẩu, validation, phân trang, thống kê và ngày theo giờ Việt Nam. Frontend kiểm thử xử lý cookie/CSRF, lỗi mạng và tải lại trang danh sách. Database kiểm thử được tạo riêng; không dùng task thật.

## API và dữ liệu cũ

Prefix `/api/v1/`; các endpoint và trường dữ liệu được mô tả trong [kế hoạch backend](docs/backend-plan.md#4-hợp-đồng-api).

- Đăng ký không tự đăng nhập. Session được khôi phục qua `/auth/me/` khi tải lại trang.
- Đăng ký local (`DJANGO_DEBUG=True`) giới hạn 60 lượt/phút để thử form; production giới hạn 5 lượt/giờ theo IP. Lượt gửi dữ liệu không hợp lệ cũng được tính.
- Task có `pending/completed`, mức ưu tiên `Moderate/Extreme`. `date` là ngày công việc, `created_at` là thời điểm tạo.
- Ảnh dùng URL HTTP/HTTPS; chưa có upload ảnh, nhắc việc hoặc tích hợp lịch.
- Tài khoản demo cũ chứa mật khẩu trong `localStorage` được xóa khi ứng dụng khởi động. Task cũ trong trình duyệt được giữ nguyên để xuất thủ công; không tự nhập vào tài khoản mới.

## Production

- Dùng PostgreSQL, `DJANGO_DEBUG=False`, `DJANGO_SECRET_KEY` ngẫu nhiên ít nhất 50 ký tự, `DJANGO_ALLOWED_HOSTS` và `DJANGO_CSRF_TRUSTED_ORIGINS` đúng tên miền HTTPS.
- Build CSS, chạy migration và `manage.py collectstatic --noinput`.
- Chạy `config.wsgi:application` bằng WSGI server; web server phục vụ `/static/` từ `backend/staticfiles/`, chuyển các request còn lại tới Django. Nếu kết thúc TLS ở reverse proxy, cấu hình forwarded HTTPS chỉ từ proxy tin cậy.
- Chạy `manage.py check --deploy` với cấu hình production. Không dùng `runserver` trong production.
- Giới hạn đăng nhập/đăng ký trong ứng dụng dùng cache bộ nhớ của Django; khi chạy nhiều worker cần thêm rate limit ở reverse proxy hoặc cache chung.
- Sao lưu PostgreSQL bằng `pg_dump`, kiểm tra khôi phục bằng `pg_restore` trên database riêng trước khi đưa vào sử dụng.
