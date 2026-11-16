import { escapeHTML } from '../utils/html.js';

export const createTaskCardHTML = (task) => {
    task = Object.fromEntries(Object.entries(task).map(([key, value]) => [key, escapeHTML(value)]));
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
            <div class="relative">
                <button data-action="toggle-menu" data-task-id="${task.id}" class="text-gray-400 hover:text-slate-600 p-2">
                    <i class="ph-bold ph-dots-three text-xl"></i>
                </button>

                <div id="menu-${task.id}" data-task-menu class="hidden absolute right-0 top-8 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <button data-action="edit-task" data-task-id="${task.id}" class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#FF5722]">Edit</button>
                    <button data-action="finish-task" data-task-id="${task.id}" class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600">Finish</button>
                    <button data-action="remove-task" data-task-id="${task.id}" class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-500">Remove</button>
                </div>
            </div>
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
