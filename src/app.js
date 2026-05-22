import { createAuthHtml } from "./views/authView.js";
import { getMainLayoutHTML } from "./views/mainLayoutView.js"; // Cái Khung Lớn
import { getDashboardOverviewHTML } from "./views/dashboardView.js"; // Ruột thống kê
import { getMyTaskDetailHTML } from "./views/myTaskView.js"; // Ruột chi tiết task
import { mockTasks } from "./state/taskStore.js"; // Dữ liệu mẫu
(() => {
    const appContainer = document.getElementById('app');
    let currentMode = 'signin';

    // ==========================================
    // 1. MODULE XỬ LÝ ĐĂNG KÝ / ĐĂNG NHẬP
    // ==========================================
    const renderAuthScreen = (mode = 'signin') => {
        currentMode = mode;
        appContainer.innerHTML = createAuthHtml(mode);
        attachAuthEvents(); 
    };

    const attachAuthEvents = () => {
        const toggleLink = document.querySelector('[data-auth-toggle]');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                const newMode = e.target.getAttribute('data-auth-toggle');
                renderAuthScreen(newMode);
            });
        }

        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => { 
                e.preventDefault(); 
                const email = document.getElementById('auth-email').value;
                const password = document.getElementById('auth-password').value;
                
                if (currentMode === 'signup') { 
                    const name = document.getElementById('auth-name').value;
                    const newUser = { name, email, password };
                    localStorage.setItem('todo_user', JSON.stringify(newUser));
                    alert('🎉 Đăng ký thành công! Hãy đăng nhập lại nhé.');
                    renderAuthScreen('signin');
                } else {
                    const savedUserData = localStorage.getItem('todo_user');
                    if (savedUserData) {
                        const user = JSON.parse(savedUserData);
                        if (user.email === email && user.password === password) {
                            alert(`Chào mừng ${user.name} quay trở lại! 🚀`); 
                            
                            // Đăng nhập thành công -> Gọi đạo diễn dựng màn hình chính!
                            // Mặc định lúc mới vào là hiện trang Dashboard Tổng Quan
                            renderMainScreen(mockTasks, "Dashboard", "dashboard", true); 
                        } else {
                            alert('❌ Sai mật khẩu hoặc email!');
                        }
                    } else {
                        alert('⚠️ Tài khoản này chưa được đăng ký!');
                    }
                }
            });
        }
    };

    // ==========================================
    // 2. MODULE ĐIỀU PHỐI MÀN HÌNH CHÍNH (SPA ROUTER)
    // ==========================================
    const renderMainScreen = (tasksToDisplay, menuTitle, activeMenuName, showDashboardOverview = false) => {
        // Bước 1: Dựng Khung Lớn (Sidebar, Header, Cột Giữa) lên màn hình
        appContainer.innerHTML = getMainLayoutHTML(tasksToDisplay, menuTitle, activeMenuName);        
        // Bước 2: Tìm cái ô khoảng trắng ở cột phải
        const detailContainer = document.getElementById('task-detail-container');
        
        // Bước 3: Nếu đang ở mode Dashboard, tự động nhét ruột thống kê vào cột phải
        if (detailContainer && showDashboardOverview) {
            detailContainer.innerHTML = getDashboardOverviewHTML();
        }
        
        // Bước 4: Gắn tai nghe sự kiện cho các nút vừa được vẽ ra
        attachMainEvents();
    };

    const attachMainEvents = () => {
        const detailContainer = document.getElementById('task-detail-container');

        // --- A. BẮT SỰ KIỆN CLICK CHUYỂN MENU BÊN TRÁI ---
        const menuDashboard = document.querySelector('[data-menu="dashboard"]');
        const menuMyTask = document.querySelector('[data-menu="mytask"]');
        const menuVital = document.querySelector('[data-menu="vital"]');

        const logoutBtn = document.querySelector('[data-logout]');

        if (menuDashboard) {
            menuDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                // Bấm Dashboard: Dựng lại khung, nhét ruột tổng quan vào ô phải
                renderMainScreen(mockTasks, "Dashboard", "dashboard",true);
            });
        }

        if (menuMyTask) {
            menuMyTask.addEventListener('click', (e) => {
                e.preventDefault();
                // Bấm My Task: Hiện toàn bộ Task ở cột giữa, ô phải để trống chờ click
                renderMainScreen(mockTasks, "My Tasks","mytask", false);
            });
        }

        if (menuVital) {
            menuVital.addEventListener('click', (e) => {
                e.preventDefault();
                // Bấm Vital Task: Lọc mảng chỉ lấy Extreme, đổ vào cột giữa
                const vitalTasks = mockTasks.filter(t => t.priority === 'Extreme');
                renderMainScreen(vitalTasks, "Vital Tasks","vital", false);
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Ông có chắc muốn đăng xuất không?")) {
                    renderAuthScreen('signin');
                }
            });
        }

        // --- B. BẮT SỰ KIỆN CLICK VÀO TỪNG TASK CARD Ở CỘT GIỮA ---
        const taskCards = document.querySelectorAll('[data-task-id]');
        
        taskCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 1. Lấy ID của cái Card vừa click
                const clickedId = parseInt(card.getAttribute('data-task-id'));
                
                // 2. Đi tìm dữ liệu của Task đó trong kho mockTasks
                const selectedTask = mockTasks.find(t => t.id === clickedId);
                
                // 3. Nếu tìm thấy thì bốc ruột từ myTaskView ném thẳng vào ô phải!
                if (selectedTask && detailContainer) {
                    detailContainer.innerHTML = getMyTaskDetailHTML(selectedTask);
                }
            });
        });
    };

    // ==========================================
    // 3. KHỞI CHẠY LẦN ĐẦU
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        // renderAuthScreen('signin');
        renderMainScreen(mockTasks, "Dashboard", "dashboard",true);
    });

})();