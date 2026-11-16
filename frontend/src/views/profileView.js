import { escapeHTML } from '../utils/html.js';

export const getProfileViewHTML = (user) => `
    <div class="p-6 text-left bg-white rounded-3xl">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">Thông tin cá nhân</h2>
        <form id="profile-form" class="space-y-5">
            <div><label for="profile-name" class="block font-bold mb-2">Tên hiển thị</label>
                <input id="profile-name" value="${escapeHTML(user.name)}" required maxlength="150" autocomplete="name" class="form-input"></div>
            <div><label for="profile-email" class="block font-bold mb-2">Email</label>
                <input id="profile-email" value="${escapeHTML(user.email)}" readonly class="form-input bg-slate-50"></div>
            <div><label for="profile-avatar-url" class="block font-bold mb-2">Link ảnh đại diện</label>
                <input type="url" id="profile-avatar-url" value="${escapeHTML(user.avatar)}" maxlength="2048" class="form-input" placeholder="https://example.com/avatar.jpg"></div>
            <button type="submit" class="form-button">Lưu thông tin</button>
        </form>
        <form id="password-form" class="space-y-5 border-t mt-8 pt-6">
            <h3 class="text-xl font-bold text-slate-800">Đổi mật khẩu</h3>
            <div><label for="current-password" class="block font-bold mb-2">Mật khẩu hiện tại</label>
                <input type="password" id="current-password" autocomplete="current-password" required maxlength="128" class="form-input"></div>
            <div><label for="new-password" class="block font-bold mb-2">Mật khẩu mới</label>
                <input type="password" id="new-password" autocomplete="new-password" required minlength="8" maxlength="128" class="form-input"></div>
            <button type="submit" class="form-button">Đổi mật khẩu</button>
        </form>
    </div>`;
