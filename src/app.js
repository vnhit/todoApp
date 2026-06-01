import { createAuthHtml } from "./views/authView.js";
import { getMainLayoutHTML } from "./views/mainLayoutView.js"; // Cái Khung Lớn
import { getDashboardOverviewHTML } from "./views/dashboardView.js"; // Ruột thống kê
import { getMyTaskDetailHTML } from "./views/myTaskView.js"; // Ruột chi tiết task
import { addTask, mockTasks, deleteTask, updateTask } from "./state/taskStore.js"; // Dữ liệu mẫu
import { getProfileViewHTML } from "./views/profileView.js";
import { getEditTaskViewHTML } from "./views/addTaskView.js";

(() => {
    const appContainer = document.getElementById('app');
    let currentMode = 'signin';
    let lastActiveMenu = 'dashboard';
    let lastTasks = mockTasks;
    let lastTitle = 'Dashboard';


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
        lastActiveMenu = activeMenuName;
        lastTasks = tasksToDisplay;
        lastTitle = menuTitle;
        appContainer.innerHTML = getMainLayoutHTML(tasksToDisplay, menuTitle, activeMenuName);        
        const detailContainer = document.getElementById('task-detail-container');
        
        if (detailContainer && showDashboardOverview) {
            detailContainer.innerHTML = getDashboardOverviewHTML(mockTasks);
        }
        
        attachMainEvents();
    };

    const attachMainEvents = () => {
        const detailContainer = document.getElementById('task-detail-container');
        
        // === MOBILE HAMBURGER MENU ===
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                overlay.classList.toggle('active');
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
            });
        }

        // --- A. BẮT SỰ KIỆN CLICK CHUYỂN MENU BÊN TRÁI ---
        const menuDashboard = document.querySelector('[data-menu="dashboard"]');
        const menuMyTask = document.querySelector('[data-menu="mytask"]');
        const menuVital = document.querySelector('[data-menu="vital"]');
        const avatarBtn = document.getElementById('user-avatar-btn');
        const logoutBtn = document.querySelector('[data-logout]');
        
        // Helper function to close mobile menu
        const closeMobileMenu = () => {
            if (mobileMenu && overlay) {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
            }
        };

        if(avatarBtn && detailContainer){
            avatarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                detailContainer.innerHTML = getProfileViewHTML();
                attachProfileFormEvents();
                closeMobileMenu();
            })

        }
        if (menuDashboard) {
            menuDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                renderMainScreen(mockTasks, "Dashboard", "dashboard",true);
                closeMobileMenu();
            });
        }

        if (menuMyTask) {
            menuMyTask.addEventListener('click', (e) => {
                e.preventDefault();
                renderMainScreen(mockTasks, "My Tasks","mytask", false);
                closeMobileMenu();
            });
        }

        if (menuVital) {
            menuVital.addEventListener('click', (e) => {
                e.preventDefault();
                const vitalTasks = mockTasks.filter(t => t.priority === 'Extreme');
                renderMainScreen(vitalTasks, "Vital Tasks","vital", false);
                closeMobileMenu();
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Ông có chắc muốn đăng xuất không?")) {
                    closeMobileMenu();
                    renderAuthScreen('signin');
                }
            });
        }

        // --- B. BẮT SỰ KIỆN CLICK VÀO TỪNG TASK CARD Ở CỘT GIỮA ---
        const taskCards = document.querySelectorAll('[data-task-id]');
        
        taskCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                const clickedId = parseInt(card.getAttribute('data-task-id'));
                
                const selectedTask = mockTasks.find(t => t.id === clickedId);
                
                if (selectedTask && detailContainer) {
                    detailContainer.innerHTML = getMyTaskDetailHTML(selectedTask);
                }
            });
        });
        // Nút add task
        const btnAddTask = document.getElementById("add-task-btn");
        if(btnAddTask){
            btnAddTask.addEventListener('click',(e) => {
                e.preventDefault();
                const detailContainer = document.getElementById('task-detail-container');
                if(detailContainer){
                    detailContainer.innerHTML = getEditTaskViewHTML(null,'add');
                    attachEditFormEvents();
                }
            })
        }

        // BẮT SỰ KIỆN TOGGLE MENU
        const toggleMenuBtns = document.querySelectorAll('[data-action="toggle-menu"]');
        toggleMenuBtns.forEach(btn =>{
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const taskId = btn.getAttribute('data-task-id');
                const menu = document.getElementById(`menu-${taskId}`);

                if(menu){
                    menu.classList.toggle('hidden');
                }
            });
        });
        // BẮT SỰ KIÊN EDIT, REMOVE,FINISH
        const editBtns = document.querySelectorAll('[data-action="edit-task"]');
        const finishBtns = document.querySelectorAll('[data-action="finish-task"]');
        const removeBtns = document.querySelectorAll('[data-action="remove-task"]');

        // EDIT
        editBtns.forEach(btn =>{
            btn.addEventListener('click', (e) =>{
                e.preventDefault();
                e.stopPropagation();

                const taskId = parseInt(btn.getAttribute('data-task-id'));
                const selectedTask = mockTasks.find(t => t.id === taskId);

                if(selectedTask && detailContainer){
                    detailContainer.innerHTML = getEditTaskViewHTML(selectedTask,'edit');
                    attachEditFormEvents(selectedTask);
                }
            });
        });
        // FINISH
        finishBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const taskId = parseInt(btn.getAttribute('data-task-id'));
                updateTask(taskId, { status: 'completed' });
                
                alert('✅ Task đã hoàn thành!');
                renderMainScreen(lastTasks, lastTitle, lastActiveMenu, false);
            });
        });
        // REMOVE
        removeBtns.forEach(btn =>{
            btn.addEventListener('click', (e) =>{
                e.preventDefault();
                e.stopPropagation();
                const taskId = parseInt(btn.getAttribute('data-task-id'));
                if(confirm('Bạn chắc muốn xóa ko')) {
                    deleteTask(taskId);
                    alert('Xóa thành công');
                    renderMainScreen(lastTasks,lastTitle, lastActiveMenu, false);
                }
            });
        });
    };
    // đóng menu khi click ngoài
    document.addEventListener('click', (e) => {
        const allMenus = document.querySelectorAll('[id^="menu-"]');
        allMenus.forEach(menu => menu.classList.add('hidden'));

    })

    const attachProfileFormEvents = () => {
        const profileFrom = document.getElementById('profile-form');
        if(profileFrom){
            profileFrom.addEventListener('submit', (e) => {
                e.preventDefault();
                const newName = document.getElementById('profile-name').value;
                const newAvatarUrl = document.getElementById('profile-avatar-url').value;
                const newPassword = document.getElementById('profile-password').value;

                const currentUserData = JSON.parse(localStorage.getItem('todo_user')) || {};

                const updateUser = {
                    ...currentUserData,
                    name: newName,
                    avatar: newAvatarUrl || 'https://i.pravatar.cc/150?img=11',
                    password: newPassword
                };

                localStorage.setItem('todo_user', JSON.stringify(updateUser));
                alert('Cập nhập thành công');
                renderMainScreen(lastTasks,lastTitle,lastActiveMenu,false);

                document.getElementById('task-detail-container').innerHTML = getProfileViewHTML();
                attachProfileFormEvents();

            });
        }
    };

    const attachEditFormEvents = (existingTask = null) => {
        const editForm = document.getElementById('edit-task-form');
        if(!editForm) return;

        editForm.addEventListener('submit', (e) =>{
            e.preventDefault();
            const title = document.getElementById('edit-title').value;
            const date = document.getElementById('edit-date').value;
            const priority = document.getElementById('edit-priority').value;
            const description = document.getElementById('edit-description').value;
            const image = document.getElementById('edit-image').value;

            if(!title.trim()){
                alert('⚠️ Vui lòng nhâp tiêu đề');
                return;
            }
            if(existingTask){
                updateTask(existingTask.id,{
                    title: title,
                    date: date,
                    priority: priority,
                    description: description,
                    image: image
                });
            }else{
                const newTask = {
                    id: Date.now(), 
                    title: title,
                    date: date || new Date().toISOString().split('T')[0], 
                    priority: priority,
                    description: description,
                    image: image || 'https://via.placeholder.com/300x200?text=Task', 
                    status: 'pending'
                };
                addTask(newTask);
                alert('Thêm thành công');
            }
            renderMainScreen(lastTasks,lastTitle, lastActiveMenu,false);
        });
        const goBackbtn = document.querySelector('[data-action="go-back"]');
        if(goBackbtn){
            goBackbtn.addEventListener('click', (e) => {
                e.preventDefault();
                renderMainScreen(lastTasks, lastTitle, lastActiveMenu,false);
            })
        }
    }

    // ==========================================
    // 3. KHỞI CHẠY LẦN ĐẦU
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        renderAuthScreen('signin');
        // renderMainScreen(mockTasks, "Dashboard", "dashboard",true);
    });

})();