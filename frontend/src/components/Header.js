export const getHeaderHTML = () => {
    const now = new Date();
    const options = { timeZone: 'Asia/Ho_Chi_Minh' };
    return `
    <header class="h-24 flex items-center justify-between px-10 shrink-0 border-b border-gray-100 bg-[#F8F9FB]">
        <button id="menu-toggle" aria-label="Mở menu" aria-expanded="false" class="md:hidden text-slate-800 hover:text-[#FF5722]">
            <i class="ph-bold ph-list text-2xl"></i>
        </button>
        <div></div>
        <div class="text-right leading-tight tracking-wide">
            <p class="text-[15px] font-bold text-slate-800">${now.toLocaleDateString('vi-VN', { ...options, weekday: 'long' })}</p>
            <p class="text-[13px] font-bold text-[#4A90E2] mt-1">${now.toLocaleDateString('vi-VN', options)}</p>
        </div>
    </header>`;
};
