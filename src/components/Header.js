
export const getHeaderHTML = () => {
    return `
    <header class="h-24 flex items-center justify-between px-10 shrink-0 border-b border-gray-100 bg-[#F8F9FB]">
        <!-- Hamburger Menu Mobile -->
        <button id="menu-toggle" class="md:hidden text-slate-800 hover:text-[#FF5722] transition-colors">
            <i class="ph-bold ph-list text-2xl"></i>
        </button>

        <div class="relative w-[480px]">
        </div>

        <div class="flex items-center gap-8">
            <div class="flex items-center gap-3">
                <button class="bg-[#FF5722] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#E64A19] transition-colors shadow-lg shadow-[#FF5722]/30 relative">
                    <i class="ph-fill ph-bell text-2xl"></i>
                </button>
                <button class="bg-[#FF5722] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#E64A19] transition-colors shadow-lg shadow-[#FF5722]/30">
                    <i class="ph-fill ph-calendar-blank text-2xl"></i>
                </button>
            </div>
            
            <div class="text-right leading-tight tracking-wide">
                <p class="text-[15px] font-bold text-slate-800">Tuesday</p>
                <p class="text-[13px] font-bold text-[#4A90E2] mt-1">20/06/2026</p>
            </div>
        </div>
    </header>
    `;
};