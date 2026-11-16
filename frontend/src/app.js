import { createAuthHtml } from './views/authView.js';
import { getMainLayoutHTML } from './views/mainLayoutView.js';
import { getDashboardOverviewHTML } from './views/dashboardView.js';
import { getMyTaskDetailHTML } from './views/myTaskView.js';
import { getProfileViewHTML } from './views/profileView.js';
import { getEditTaskViewHTML } from './views/addTaskView.js';
import * as authApi from './api/authApi.js';
import * as taskApi from './api/taskApi.js';
import { currentUser, setCurrentUser } from './state/authStore.js';
import { taskState, loadTasks, clearTasks } from './state/taskStore.js';

const app = document.getElementById('app');
const message = document.getElementById('app-message');
let authMode = 'signin';
let busy = false;
let messageTimer;
const titles = { dashboard: 'Dashboard', mytask: 'My Tasks', vital: 'Vital Tasks' };

function notify(text, error = false) {
    clearTimeout(messageTimer);
    message.textContent = text;
    message.dataset.error = String(error);
    message.hidden = false;
    messageTimer = setTimeout(() => { message.hidden = true; }, error ? 10000 : 5000);
}

function renderAuth(mode = 'signin') {
    authMode = mode;
    app.innerHTML = createAuthHtml(mode);
}

function renderMain(detail) {
    app.innerHTML = getMainLayoutHTML(taskState.results, titles[taskState.menu], taskState.menu, currentUser, taskState);
    document.getElementById('task-detail-container').innerHTML = detail || (
        taskState.menu === 'dashboard' ? getDashboardOverviewHTML(taskState.summary)
            : '<p class="p-6 text-slate-500">Chọn một công việc để xem chi tiết.</p>'
    );
}

function showDetail(html) {
    const container = document.getElementById('task-detail-container');
    container.innerHTML = html;
    closeSidebar();
    if (window.matchMedia('(max-width: 768px)').matches) container.scrollIntoView({ behavior: 'smooth' });
}

function closeSidebar() {
    document.getElementById('mobile-sidebar')?.classList.remove('active');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
    document.getElementById('menu-toggle')?.setAttribute('aria-expanded', 'false');
}

function handleError(error) {
    if (error.code === 'auth_required') {
        setCurrentUser(null);
        clearTasks();
        renderAuth();
    }
    notify(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', true);
}

async function run(action, form = null) {
    if (busy) return;
    busy = true;
    app.inert = true;
    app.setAttribute('aria-busy', 'true');
    const submit = form?.querySelector('[type="submit"]');
    const label = submit?.textContent;
    if (submit) { submit.disabled = true; submit.textContent = 'Đang xử lý…'; }
    try {
        await action();
    } catch (error) {
        handleError(error);
    } finally {
        busy = false;
        app.inert = false;
        app.setAttribute('aria-busy', 'false');
        if (submit?.isConnected) { submit.disabled = false; submit.textContent = label; }
    }
}

async function refresh(options) {
    await loadTasks(options);
    renderMain();
}

async function afterSave(text) {
    // Clear the submitted form once the server saved it, even if a refresh fails.
    renderMain();
    try {
        await refresh();
        notify(text);
    } catch (error) {
        if (error.code === 'auth_required') throw error;
        notify(`${text} Chưa tải lại được danh sách; chọn lại mục ở menu để thử lại.`, true);
    }
}

app.addEventListener('click', (event) => {
    const target = event.target.closest('button, a, [data-task-id], #sidebar-overlay');
    if (!target || busy || target.disabled) return;
    if (target.matches('a')) event.preventDefault();

    if (target.dataset.authToggle) return renderAuth(target.dataset.authToggle);
    if (target.hasAttribute('data-toggle-password')) {
        const input = document.getElementById('auth-password');
        input.type = input.type === 'password' ? 'text' : 'password';
        return;
    }
    if (target.id === 'retry-start') return run(start);
    if (target.id === 'menu-toggle') {
        const open = document.getElementById('mobile-sidebar').classList.toggle('active');
        document.getElementById('sidebar-overlay').classList.toggle('active', open);
        target.setAttribute('aria-expanded', String(open));
        return;
    }
    if (target.id === 'sidebar-overlay') return closeSidebar();
    if (target.dataset.menu) return run(() => refresh({ menu: target.dataset.menu, page: 1, status: '' }));
    if (target.hasAttribute('data-page')) return run(() => refresh({ page: Number(target.dataset.page) }));
    if (target.id === 'user-avatar-btn') return showDetail(getProfileViewHTML(currentUser));
    if (target.id === 'add-task-btn') return showDetail(getEditTaskViewHTML(null, 'add'));
    if (target.hasAttribute('data-logout')) {
        return run(async () => {
            await authApi.logout();
            setCurrentUser(null);
            clearTasks();
            renderAuth();
        });
    }

    const action = target.dataset.action;
    if (action === 'go-back') return renderMain();
    const id = Number(target.dataset.taskId);
    if (!id) return;
    if (action === 'toggle-menu') {
        const menu = document.getElementById(`menu-${id}`);
        const wasHidden = menu.classList.contains('hidden');
        document.querySelectorAll('[data-task-menu]').forEach((item) => item.classList.add('hidden'));
        menu.classList.toggle('hidden', !wasHidden);
        return;
    }
    if (action === 'remove-task' && !window.confirm('Xóa công việc này?')) return;
    return run(async () => {
        if (action === 'remove-task') {
            await taskApi.deleteTask(id);
            await afterSave('Đã xóa công việc.');
        } else if (action === 'finish-task') {
            await taskApi.updateTask(id, { status: 'completed' });
            await afterSave('Đã hoàn thành công việc.');
        } else {
            const task = await taskApi.getTask(id);
            showDetail(action === 'edit-task' ? getEditTaskViewHTML(task, 'edit') : getMyTaskDetailHTML(task));
        }
    });
});

document.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="toggle-menu"]')) return;
    document.querySelectorAll('[data-task-menu]').forEach((menu) => menu.classList.add('hidden'));
});

app.addEventListener('change', (event) => {
    if (event.target.id !== 'status-filter' || busy) return;
    const status = event.target.value;
    run(async () => {
        try { await refresh({ status, page: 1 }); }
        finally { if (event.target.isConnected) event.target.value = taskState.status; }
    });
});

app.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const value = (id) => form.querySelector(`#${id}`).value;
    run(async () => {
        if (form.id === 'auth-form') {
            const credentials = { email: value('auth-email').trim(), password: value('auth-password') };
            if (authMode === 'signup') {
                await authApi.register({ ...credentials, name: value('auth-name').trim() });
                renderAuth();
                document.getElementById('auth-email').value = credentials.email;
                notify('Đăng ký thành công. Hãy đăng nhập.');
            } else {
                setCurrentUser(await authApi.login(credentials));
                renderMain();
                await refresh({ menu: 'dashboard', page: 1, status: '' });
            }
        } else if (form.id === 'edit-task-form') {
            const body = { title: value('edit-title').trim(), description: value('edit-description'),
                priority: value('edit-priority'), image: value('edit-image').trim() };
            const date = value('edit-date');
            if (date) body.date = date;
            if (!body.title) throw new Error('Vui lòng nhập tiêu đề.');
            if (form.dataset.mode === 'add') await taskApi.createTask(body);
            else await taskApi.updateTask(Number(form.dataset.taskId), body);
            await afterSave('Đã lưu công việc.');
        } else if (form.id === 'profile-form') {
            setCurrentUser(await authApi.updateProfile({ name: value('profile-name').trim(), avatar: value('profile-avatar-url').trim() }));
            renderMain(getProfileViewHTML(currentUser));
            notify('Đã cập nhật thông tin.');
        } else if (form.id === 'password-form') {
            await authApi.changePassword({ current_password: value('current-password'), new_password: value('new-password') });
            form.reset();
            notify('Đã đổi mật khẩu.');
        }
    }, form);
});

async function start() {
    try { localStorage.removeItem('todo_user'); } catch { /* Storage may be disabled. */ }
    app.innerHTML = '<p class="p-6 text-slate-500">Đang tải…</p>';
    try {
        setCurrentUser(await authApi.getMe());
    } catch (error) {
        if (error.code === 'auth_required') { renderAuth(); return; }
        app.innerHTML = '<div class="p-6"><p>Không tải được ứng dụng.</p><button id="retry-start" class="form-button mt-4">Thử lại</button></div>';
        throw error;
    }
    renderMain();
    await refresh({ menu: 'dashboard', page: 1, status: '' });
}

run(start);
