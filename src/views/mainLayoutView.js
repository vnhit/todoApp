// File: src/views/mainLayoutView.js
import { getHeaderHTML } from '../components/Header.js';
import { createTaskCardHTML } from '../components/TaskCard.js';

export const getMainLayoutHTML = (tasks, title = "Dashboard", activeMenu = "dashboard") => {
    
    // Gọi thằng TaskCard đúc ra một mảng các thẻ Card, rồi ghép dính lại với nhau
    const cardsListHTML = tasks.map(task => createTaskCardHTML(task)).join('');
    
    const activeClass = "bg-white text-[#FF5722] rounded-2xl font-bold shadow-sm transition-all";
    const inactiveClass = "text-gray-400 hover:text-white transition-all font-medium";
    
    return `
    <div class="h-screen w-screen flex overflow-hidden bg-[#F8F9FB] font-sans">
        
        <div class="w-[280px] flex flex-col h-full shrink-0">
            <div class="h-24 flex items-center pl-10">
                <h1 class="text-3xl font-bold tracking-tight">
                    <span class="text-[#FF5722]">To</span><span class="text-slate-800">-Do</span>
                </h1>
            </div>
            <aside class="flex-1 bg-[#0A0A0A] rounded-tr-[40px] relative flex flex-col px-6 pb-8">
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" class="w-24 h-24 rounded-full border-[8px] border-[#F8F9FB] object-cover bg-white shadow-sm">
                </div>
                <div class="mt-14 text-center">
                    <h2 class="text-white font-semibold text-lg">amanuel</h2>
                    <p class="text-gray-400 text-xs mt-0.5">amanuel@gmail.com</p>
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
                    <h2 class="text-2xl font-bold text-slate-800 mb-4">${title}</h2>
                    <div class="flex-1 overflow-y-auto pr-2 pb-10">
                        ${cardsListHTML || '<p class="text-gray-400 p-4 text-left">Hiện không có công việc nào!</p>'}
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