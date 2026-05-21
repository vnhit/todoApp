// File: src/components/TaskCard.js

export const createTaskCardHTML = (task) => {
    const priorityColor = task.priority === 'Extreme' ? '#FF5722' : '#4A90E2';

    return `
    <div class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer mb-4 text-left" data-task-id="${task.id}">
        <div class="flex items-start justify-between gap-4">
            <div class="flex gap-4">
                <span class="w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0" style="border-color: ${priorityColor}"></span>
                <div>
                    <h4 class="font-bold text-slate-800 text-lg leading-snug">${task.title}</h4>
                    <p class="text-slate-400 text-sm mt-1 line-clamp-2">${task.description}</p>
                </div>
            </div>
            <button class="text-gray-400 hover:text-slate-600"><i class="ph-bold ph-dots-three text-xl"></i></button>
        </div>
        <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 text-xs font-semibold">
            <div class="flex gap-3">
                <span class="text-red-500">Priority: ${task.priority}</span>
                <span class="text-[#4A90E2]">Status: ${task.status}</span>
            </div>
            <span class="text-gray-400">${task.date}</span>
        </div>
    </div>
    `;
};