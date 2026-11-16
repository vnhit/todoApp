import { getHeaderHTML } from '../components/Header.js';
import { createTaskCardHTML } from '../components/TaskCard.js';
import { escapeHTML, safeImageURL } from '../utils/html.js';

export const getMainLayoutHTML = (tasks, title, activeMenu, user, pagination) => {

    // Gọi thằng TaskCard đúc ra một mảng các thẻ Card, rồi ghép dính lại với nhau
    const cardsListHTML = tasks.map(task => createTaskCardHTML(task)).join('');

    const activeClass = "bg-white text-[#FF5722] rounded-2xl font-bold shadow-sm transition-all";
    const inactiveClass = "text-gray-400 hover:text-white transition-all font-medium";


    return `
    <div class="h-screen w-screen flex overflow-hidden bg-[#F8F9FB] font-sans">

        <!-- Overlay for mobile sidebar -->
        <div id="sidebar-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-30"></div>

        <div class="w-[280px] flex flex-col h-full shrink-0" id="mobile-sidebar">
            <div class="h-24 flex items-center pl-10">
                <h1 class="text-3xl font-bold tracking-tight">
                    <span class="text-[#FF5722]">To</span><span class="text-slate-800">-Do</span>
                </h1>
            </div>
            <aside class="flex-1 bg-[#0A0A0A] rounded-tr-[40px] relative flex flex-col px-6 pb-8">
                <div class="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <button id="user-avatar-btn" aria-label="Thông tin cá nhân"><img src="${escapeHTML(safeImageURL(user.avatar, '/static/src/avatar.svg'))}" alt="User Avatar" class="w-24 h-24 rounded-full border-[6px] border-[#F8F9FB] object-cover bg-white shadow-sm"></button>
                </div>
                <div class="mt-14 text-center">
                    <h2 class="text-white font-semibold text-lg">${escapeHTML(user.name)}</h2>
                    <p class="text-gray-400 text-xs mt-0.5 break-all">${escapeHTML(user.email)}</p>
                </div>
                <nav class="mt-10 space-y-1.5 flex-1">

                    <a href="#" data-menu="dashboard" class="flex items-center gap-4 px-5 py-4 ${activeMenu === 'dashboard' ? activeClass : inactiveClass}">
                        <i class="${activeMenu === 'dashboard' ? 'ph-fill' : 'ph-bold'} ph-squares-four text-2xl"></i> Dashboard
                    </a>

                    <a href="#" data-menu="vital" class="flex items-center gap-4 px-5 py-4 ${activeMenu === 'vital' ? activeClass : inactiveClass}">
                        <i class="${activeMenu === 'vital' ? 'ph-fill' : 'ph-bold'} ph-warning-circle text-2xl"></i> Vital Task
                    </a>

                    <a href="#" data-menu="mytask" class="flex items-center gap-4 px-5 py-4 ${activeMenu === 'mytask' ? activeClass : inactiveClass}">
                        <i class="${activeMenu === 'mytask' ? 'ph-fill' : 'ph-bold'} ph-check-square-offset text-2xl"></i> My Task
                    </a>

                </nav>
                <a href="#" data-logout class="flex items-center gap-4 px-5 py-3 mt-auto text-gray-400 hover:text-white transition-all font-medium">
                    <i class="ph-bold ph-sign-out text-2xl"></i> Logout
                </a>
            </aside>
        </div>

        <div class="flex-1 flex flex-col h-full overflow-hidden">

            ${getHeaderHTML()}

            <div class="flex-1 flex gap-6 px-10 py-6 overflow-hidden">

                <div class="w-1/2 flex flex-col h-full overflow-hidden">
                    <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-bold text-slate-800">${escapeHTML(title)}</h2>
                            <button id="add-task-btn" class="bg-[#FF5722] text-white px-4 py-2 rounded-xl hover:bg-[#e64a19] transition-all text-sm font-semibold flex items-center gap-2">
                                <i class="ph-bold ph-plus"></i> Add New
                            </button>
                    </div>
                    <label class="text-sm text-slate-500 mb-3">Trạng thái
                        <select id="status-filter" class="ml-2 rounded-lg border border-slate-200 p-2">
                            <option value="" ${!pagination.status ? 'selected' : ''}>Tất cả</option>
                            <option value="pending" ${pagination.status === 'pending' ? 'selected' : ''}>Đang làm</option>
                            <option value="completed" ${pagination.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                        </select>
                    </label>
                    <div class="flex-1 overflow-y-auto pr-2 pb-10">
                        ${cardsListHTML || '<p class="text-gray-400 p-4 text-left">Hiện không có công việc nào!</p>'}
                    </div>
                    <div class="flex items-center justify-between gap-3 py-2 text-sm">
                        <button data-page="${pagination.page - 1}" ${!pagination.previous ? 'disabled' : ''} class="rounded-lg border px-3 py-2">Trước</button>
                        <span>Trang ${pagination.page} · ${pagination.count} task</span>
                        <button data-page="${pagination.page + 1}" ${!pagination.next ? 'disabled' : ''} class="rounded-lg border px-3 py-2">Sau</button>
                    </div>
                </div>

                <div class="w-1/2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto h-full">
                    <div id="task-detail-container" class="h-full">
                        </div>
                </div>

            </div>
        </div>
    </div>
    `;
};
