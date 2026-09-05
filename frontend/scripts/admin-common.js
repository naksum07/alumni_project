// admin-common.js

function getAdminToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
}

function clearAdminTokens() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function injectAdminStyles() {
    if (document.getElementById('admin-custom-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-custom-styles';
    style.textContent = `
        .admin-content {
            max-width: 80rem;
            margin-left: auto;
            margin-right: auto;
            padding: 2rem 1rem;
        }
        @media (min-width: 640px) {
            .admin-content {
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }
        }
        @media (min-width: 1024px) {
            .admin-content {
                padding-left: 2rem;
                padding-right: 2rem;
            }
        }
        .admin-table {
            width: 100%;
            text-align: left;
            border-collapse: collapse;
            font-size: 0.875rem;
        }
        .admin-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.75rem;
        }
        .admin-table td {
            padding: 1rem;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        .admin-table tbody tr:hover {
            background-color: #f8fafc;
        }
        .modal-overlay {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 60;
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .modal-overlay.hidden {
            display: none !important;
        }
        .modal-content {
            background-color: #ffffff;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            padding: 1.5rem;
            width: 100%;
            max-width: 32rem;
            position: relative;
            margin: auto;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    injectAdminStyles();

    // Check if on login page
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    // Auth Check: Protected pages require token
    const token = getAdminToken();
    if (!isLoginPage && !token) {
        clearAdminTokens();
        window.location.href = 'login.html';
        return;
    }

    // Render Sidebar if not on login page
    if (!isLoginPage) {
        renderSidebar();
    }
});

function renderSidebar() {
    if (document.getElementById('adminNavbar')) return;

    const navbar = document.createElement('header');
    navbar.id = 'adminNavbar';
    navbar.className = 'fixed left-0 right-0 top-0 z-50 bg-blue-900 text-white shadow-lg';

    const currentPath = window.location.pathname;
    const navLinkClasses = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition';

    navbar.innerHTML = `
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav class="flex h-20 items-center justify-between gap-4">
                <a href="dashboard.html" class="flex items-center gap-3 hover:opacity-90 transition">
                    <span class="text-3xl">🎓</span>
                    <div class="text-lg font-bold tracking-tight">
                        Alumni<span class="text-red-400">Connect</span>
                        <span class="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-800 text-blue-200 uppercase">Admin</span>
                    </div>
                </a>

                <div class="hidden items-center gap-1 lg:gap-2 md:flex">
                    <a href="dashboard.html" class="${navLinkClasses} ${currentPath.includes('dashboard') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="events.html" class="${navLinkClasses} ${currentPath.includes('events') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-calendar-alt"></i>
                        <span>Events</span>
                    </a>
                    <a href="news.html" class="${navLinkClasses} ${currentPath.includes('news') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-bullhorn"></i>
                        <span>News</span>
                    </a>
                    <a href="announcements.html" class="${navLinkClasses} ${currentPath.includes('announcements') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-bell"></i>
                        <span>Announcements</span>
                    </a>
                    <a href="members.html" class="${navLinkClasses} ${currentPath.includes('members') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-users"></i>
                        <span>Members</span>
                    </a>
                    <a href="feedback.html" class="${navLinkClasses} ${currentPath.includes('feedback') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-comments"></i>
                        <span>Feedback</span>
                    </a>
                    <a href="../pages/index.html" class="${navLinkClasses} text-blue-200 hover:bg-blue-800 hover:text-white border border-blue-700/50 ml-2" title="Return to Public Site">
                        <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                        <span>Public Site</span>
                    </a>
                </div>

                <button id="logoutBtn" class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 cursor-pointer">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    `;

    document.body.prepend(navbar);
    document.body.style.paddingTop = '80px';

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAdminTokens();
            window.location.href = 'login.html';
        });
    }
}
