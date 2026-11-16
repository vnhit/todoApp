import { escapeHTML } from '../utils/html.js';

export const getEditTaskViewHTML = (task = null, mode = 'edit') => {
    if (task) task = Object.fromEntries(Object.entries(task).map(([key, value]) => [key, escapeHTML(value)]));
    const isAdd = mode === 'add';

    // Xử lý text hiển thị
    const titleText = isAdd ? 'Add New Task' : 'Edit Task';

    // Nếu là add thì để rỗng, nếu là edit thì lấy dữ liệu cũ
    const titleVal = isAdd ? '' : (task?.title || '');
    const dateVal = isAdd ? '' : (task?.date || '');
    const descVal = isAdd ? '' : (task?.description || '');
    const imageVal = isAdd ? '' : (task?.image || '');

    // Xử lý priority (mặc định là Moderate)
    const priorityVal = isAdd ? 'Moderate' : (task?.priority || 'Moderate');

    return `
    <div class="p-6 h-full w-full flex flex-col items-start justify-start text-left bg-white rounded-3xl animate-fade-in shadow-sm border border-gray-100">

        <div class="flex items-center justify-between mb-6 w-full">
            <h1 class="text-2xl font-bold text-slate-800 border-b-2 border-[#FF5722] pb-1 w-fit">${titleText}</h1>
            <a href="#" data-action="go-back" class="text-sm font-semibold underline text-slate-500 hover:text-slate-800">Go Back</a>
        </div>

        <form id="edit-task-form" class="w-full space-y-5 flex-1 flex flex-col" data-mode="${mode}" data-task-id="${isAdd ? 'new' : task.id}">

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input type="text" id="edit-title" value="${titleVal}" required maxlength="200"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-orange-100 font-medium text-slate-800">
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Ngày công việc</label>
                    <input type="date" id="edit-date" value="${dateVal}"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-orange-100 font-medium text-slate-800">
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                    <select id="edit-priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-orange-100 font-medium text-slate-800">
                        <option value="Moderate" ${priorityVal === 'Moderate' ? 'selected' : ''}>Moderate</option>
                        <option value="Extreme" ${priorityVal === 'Extreme' ? 'selected' : ''}>Extreme</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Task Description</label>
                    <textarea id="edit-description" rows="4" maxlength="10000"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-orange-100 font-medium text-slate-800">${descVal}</textarea>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                    <input type="url" id="edit-image" value="${imageVal}"
                        placeholder="https://example.com/image.jpg"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-orange-100 font-medium text-slate-800">
                </div>
            </div>

            <button type="submit"
                    class="w-full bg-[#FF5722] text-white rounded-2xl py-4 font-bold hover:bg-orange-600 transition-colors shadow-sm mt-auto">
                Done
            </button>
        </form>
    </div>
    `;
};
