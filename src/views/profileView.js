// File: src/views/profileView.js

export const getProfileViewHTML = () => {
    // Lấy thông tin user hiện tại ra, nếu chưa có thì dùng thông tin mặc định cũ
    const user = JSON.parse(localStorage.getItem('todo_user')) || { 
        name: 'admin', 
        email: 'admin@gmail.com', 
        password: '1', 
        avatar: 'https://i.pravatar.cc/150?img=11' 
    };

    return `
    <div class="p-6 h-full w-full flex flex-col items-start justify-start text-left bg-white rounded-3xl animate-fade-in">
        <div class="mb-6 mt-2 w-full">
            <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Thông Tin Cá Nhân 👤</h2>
            <p class="text-slate-400 mt-1 font-medium">Cập nhật tên hiển thị, link ảnh đại diện và mật khẩu của ông.</p>
        </div>

        <form id="profile-form" class="w-full space-y-5 flex-1 flex flex-col justify-between">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Tên hiển thị</label>
                    <input type="text" id="profile-name" value="${user.name}" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] font-medium text-slate-800" required>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Link ảnh đại diện (URL)</label>
                    <input type="url" id="profile-avatar-url" value="${user.avatar || ''}" placeholder="https://example.com/avatar.jpg" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] font-medium text-slate-800">
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
                    <input type="password" id="profile-password" value="${user.password}" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] font-medium text-slate-800" required>
                </div>
            </div>

            <button type="submit" class="w-full bg-[#FF5722] text-white rounded-2xl py-4 font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm mt-auto">
                <i class="ph-bold ph-floppy-disk text-xl"></i> Lưu Thay Đổi
            </button>
        </form>
    </div>
    `;
};