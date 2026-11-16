import { getSummary, listTasks } from '../api/taskApi.js';

const emptyState = () => ({ menu: 'dashboard', page: 1, status: '', results: [], count: 0,
    next: null, previous: null, summary: { total: 0, pending: 0, completed: 0 } });
export let taskState = emptyState();
export const clearTasks = () => { taskState = emptyState(); };

export async function loadTasks({ menu = taskState.menu, page = taskState.page, status = taskState.status } = {}) {
    const filters = { page, status, ...(menu === 'vital' ? { priority: 'Extreme' } : {}) };
    let list;
    try {
        list = await listTasks(filters);
    } catch (error) {
        if (error.status !== 404 || page <= 1) throw error;
        return loadTasks({ menu, page: page - 1, status });
    }
    const summary = await getSummary();
    taskState = { ...list, menu, page, status, summary };
    return taskState;
}
