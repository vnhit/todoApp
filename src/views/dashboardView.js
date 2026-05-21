// File: src/views/dashboardView.js

export const getDashboardOverviewHTML = () => {
    return `
    <div class="p-6 h-full w-full flex flex-col items-start justify-start text-left bg-white rounded-3xl">
        <div class="mb-8 mt-2">
            <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống 👋</h2>
            <p class="text-slate-400 mt-1 font-medium">Dưới đây là tiến độ công việc tổng quát của ông hôm nay.</p>
        </div>

        <div class="grid grid-cols-1 gap-5 w-full mb-8">
            <div class="p-5 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-5 transition-transform hover:scale-[1.02] cursor-default">
                <div class="w-14 h-14 bg-[#FF5722] text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
                    <i class="ph-fill ph-list-checks text-3xl"></i>
                </div>
                <div>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Tasks</p>
                    <h3 class="text-2xl font-extrabold text-slate-800 mt-0.5">12 Công việc</h3>
                </div>
            </div>
            
            <div class="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-5 transition-transform hover:scale-[1.02] cursor-default">
                <div class="w-14 h-14 bg-[#4A90E2] text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                    <i class="ph-fill ph-clock text-3xl"></i>
                </div>
                <div>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">In Progress</p>
                    <h3 class="text-2xl font-extrabold text-slate-800 mt-0.5">4 Đang làm</h3>
                </div>
            </div>

            <div class="p-5 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-5 transition-transform hover:scale-[1.02] cursor-default">
                <div class="w-14 h-14 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                    <i class="ph-fill ph-check-circle text-3xl"></i>
                </div>
                <div>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed</p>
                    <h3 class="text-2xl font-extrabold text-slate-800 mt-0.5">8 Đã xong</h3>
                </div>
            </div>
        </div>

        <div class="w-full mt-auto bg-slate-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
            <div>
                <h4 class="font-bold text-slate-700 text-lg">Mẹo nhỏ cho ông 💡</h4>
                <p class="text-slate-500 text-sm mt-1">Bấm vào các Task Card ở cột bên trái để xem chi tiết nhé!</p>
            </div>
            <i class="ph-fill ph-lightbulb text-4xl text-yellow-400"></i>
        </div>
    </div>
    `;
};