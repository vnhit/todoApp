// File: src/views/myTaskView.js

/**
 * Hàm đúc ra duy nhất phần ruột chi tiết của Task để nhét vào cột bên phải
 * @param {Object} task - Đối tượng chứa dữ liệu của task được click
 * @returns {string} Chuỗi HTML hiển thị chi tiết công việc
 */
export const getMyTaskDetailHTML = (task) => {
    if (!task) return '';
    
    return `
    <div class="p-6 text-left bg-white h-full animate-fade-in">
        <img src="${task.image || 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800'}" 
            class="w-full h-52 object-cover rounded-2xl mb-6 shadow-sm bg-gray-100" alt="Task Image">
        
        <h3 class="text-2xl font-bold text-slate-800 tracking-tight leading-snug">${task.title}</h3>
        
        <div class="my-4 flex gap-3 text-xs font-bold">
            <span class="text-red-500 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-wider">Priority: ${task.priority}</span>
            <span class="text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full uppercase tracking-wider">Status: ${task.status}</span>
        </div>
        
        <p class="text-slate-400 text-xs font-semibold mb-6">📅 Created on: ${task.date}</p>

        <div class="space-y-5 text-slate-600 border-t border-gray-100 pt-5 leading-relaxed">
            <div>
                <h5 class="text-slate-800 font-bold text-sm mb-1 uppercase tracking-wide">Objective:</h5>
                <p class="text-[14px] bg-slate-50 p-3 rounded-xl border border-slate-100/50">${task.objective || 'N/A'}</p>
            </div>
            
            <div>
                <h5 class="text-slate-800 font-bold text-sm mb-1 uppercase tracking-wide">Task Description:</h5>
                <p class="text-[14px] whitespace-pre-line">${task.description}</p>
            </div>
        </div>
    </div>
    `;
};