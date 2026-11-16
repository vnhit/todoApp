import { request } from './client.js';

export const listTasks = ({ page = 1, priority, status } = {}) => {
    const query = new URLSearchParams({ page });
    if (priority) query.set('priority', priority);
    if (status) query.set('status', status);
    return request(`/tasks/?${query}`);
};
export const getTask = (id) => request(`/tasks/${id}/`);
export const createTask = (body) => request('/tasks/', { method: 'POST', body });
export const updateTask = (id, body) => request(`/tasks/${id}/`, { method: 'PATCH', body });
export const deleteTask = (id) => request(`/tasks/${id}/`, { method: 'DELETE' });
export const getSummary = () => request('/dashboard/summary/');
