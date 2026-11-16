import { escapeHTML, safeImageURL } from '../utils/html.js';

export const getMyTaskDetailHTML = (task) => {
    if (!task) return '';
    const image = safeImageURL(task.image);
    return `
    <div class="p-6 text-left bg-white h-full animate-fade-in">
        ${image ? `<img src="${escapeHTML(image)}" class="w-full h-52 object-cover rounded-2xl mb-6 bg-gray-100" alt="Task Image">` : ''}
        <h3 class="text-2xl font-bold text-slate-800 leading-snug">${escapeHTML(task.title)}</h3>
        <div class="my-4 flex gap-3 text-xs font-bold">
            <span class="text-red-500 bg-red-50 px-3 py-1.5 rounded-full">Priority: ${escapeHTML(task.priority)}</span>
            <span class="text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">Status: ${escapeHTML(task.status)}</span>
        </div>
        <p class="text-slate-400 text-xs font-semibold mb-6">Ngày công việc: ${escapeHTML(task.date)}</p>
        <div class="space-y-5 text-slate-600 border-t border-gray-100 pt-5 leading-relaxed">
            <h5 class="text-slate-800 font-bold text-sm">Task Description</h5>
            <p class="text-sm whitespace-pre-line">${escapeHTML(task.description)}</p>
        </div>
    </div>`;
};
