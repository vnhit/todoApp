import { request, resetCsrf } from './client.js';

export const register = (body) => request('/auth/register/', { method: 'POST', body });
export const getMe = () => request('/auth/me/');
export const updateProfile = (body) => request('/auth/me/', { method: 'PATCH', body });

export async function login(body) {
    const user = await request('/auth/login/', { method: 'POST', body });
    resetCsrf();
    return user;
}

export async function logout() {
    await request('/auth/logout/', { method: 'POST' });
    resetCsrf();
}

export async function changePassword(body) {
    await request('/auth/change-password/', { method: 'POST', body });
    resetCsrf();
}
