const API_BASE = '/api/v1';
let csrfToken = null;

export class ApiError extends Error {
    constructor(status, data) {
        const fields = data.fields || {};
        super(Object.values(fields).flat().join(' ') || data.message || 'Yêu cầu không thành công.');
        this.status = status;
        this.code = data.code;
        this.fields = fields;
    }
}

async function send(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, { credentials: 'same-origin', cache: 'no-store', ...options });
    } catch {
        throw new ApiError(0, { code: 'network_error', message: 'Không kết nối được máy chủ. Vui lòng thử lại.' });
    }
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(response.status, data || {});
    return data;
}

export const resetCsrf = () => { csrfToken = null; };

async function ensureCsrf() {
    if (!csrfToken) csrfToken = (await send('/auth/csrf/')).csrfToken;
}

export async function request(path, { method = 'GET', body } = {}) {
    const writing = !['GET', 'HEAD', 'OPTIONS'].includes(method);
    if (writing) await ensureCsrf();
    const options = {
        method,
        headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };
    if (writing) options.headers['X-CSRFToken'] = csrfToken;
    try {
        return await send(path, options);
    } catch (error) {
        // CSRF rejection happens before mutation; retry once with a fresh token.
        if (writing && error.code === 'csrf_failed') {
            resetCsrf();
            await ensureCsrf();
            options.headers['X-CSRFToken'] = csrfToken;
            return send(path, options);
        }
        throw error;
    }
}
