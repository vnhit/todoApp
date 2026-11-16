import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { request, resetCsrf } from '../src/api/client.js';
import { login } from '../src/api/authApi.js';
import { loadTasks, clearTasks } from '../src/state/taskStore.js';

const originalFetch = globalThis.fetch;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
afterEach(() => { globalThis.fetch = originalFetch; resetCsrf(); clearTasks(); });

test('write sends session credentials and CSRF, and accepts an empty 204 response', async () => {
    const calls = [];
    globalThis.fetch = async (path, options) => {
        calls.push([path, options]);
        return path.endsWith('/csrf/') ? json({ csrfToken: 'token' }) : new Response(null, { status: 204 });
    };
    assert.equal(await request('/tasks/42/', { method: 'DELETE' }), null);
    assert.equal(calls.length, 2);
    assert.equal(calls[1][1].credentials, 'same-origin');
    assert.equal(calls[1][1].headers['X-CSRFToken'], 'token');
});

test('CSRF failure refreshes the token and retries only once', async () => {
    let tokens = 0;
    let writes = 0;
    globalThis.fetch = async (path, options) => {
        if (path.endsWith('/csrf/')) return json({ csrfToken: `token-${++tokens}` });
        writes++;
        assert.equal(options.headers['X-CSRFToken'], `token-${writes}`);
        return json({ code: 'csrf_failed', message: 'Invalid CSRF' }, 403);
    };
    await assert.rejects(request('/tasks/', { method: 'POST', body: { title: 'Test' } }), { code: 'csrf_failed' });
    assert.equal(writes, 2);
});

test('network failure does not automatically repeat a potentially committed write', async () => {
    let writes = 0;
    globalThis.fetch = async (path) => {
        if (path.endsWith('/csrf/')) return json({ csrfToken: 'token' });
        writes++;
        throw new TypeError('Failed to fetch');
    };
    await assert.rejects(request('/tasks/', { method: 'POST', body: { title: 'Test' } }), { code: 'network_error' });
    assert.equal(writes, 1);
});

test('successful login refreshes CSRF before the next write', async () => {
    let tokens = 0;
    globalThis.fetch = async (path, options) => {
        if (path.endsWith('/csrf/')) return json({ csrfToken: `token-${++tokens}` });
        if (path.endsWith('/login/')) return json({ id: 1, name: 'Test' });
        assert.equal(options.headers['X-CSRFToken'], 'token-2');
        return json({ id: 42 });
    };
    await login({ email: 'test@example.com', password: 'password' });
    await request('/tasks/', { method: 'POST', body: { title: 'Test' } });
    assert.equal(tokens, 2);
});

test('expired session and field validation remain distinguishable', async () => {
    globalThis.fetch = async () => json({ code: 'auth_required', message: 'Login required', fields: {} }, 403);
    await assert.rejects(request('/auth/me/'), { code: 'auth_required', status: 403 });
    globalThis.fetch = async () => json({ code: 'invalid_request', fields: { title: ['Required'] } }, 400);
    await assert.rejects(request('/tasks/'), { message: 'Required', status: 400 });
});

test('a deleted final page falls back while retaining Vital and status filters', async () => {
    const paths = [];
    globalThis.fetch = async (path) => {
        paths.push(path);
        if (path.includes('page=2')) return json({ code: 'not_found' }, 404);
        if (path.includes('/summary/')) return json({ total: 50, pending: 49, completed: 1 });
        return json({ count: 1, next: null, previous: null, results: [{ id: 1 }] });
    };
    const state = await loadTasks({ menu: 'vital', page: 2, status: 'pending' });
    assert.equal(state.page, 1);
    assert.equal(state.summary.total, 50);
    assert(paths.slice(0, 2).every((path) => path.includes('priority=Extreme') && path.includes('status=pending')));
});
