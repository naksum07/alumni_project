// admin-common.js
document.addEventListener('DOMContentLoaded', () => {
    // Check if on login page
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    // Auth Check
    const token = localStorage.getItem('adminToken');
    if (!isLoginPage && !token) {
        window.location.href = '/admin/login.html';
        return;
    }

    if (isLoginPage && token) {
        window.location.href = '/admin/dashboard.html';
        return;
    }

    // Render Sidebar if not on login page
    if (!isLoginPage) {
        renderSidebar();
    }
});

function renderSidebar() {
    const navbar = document.createElement('header');
    navbar.className = 'fixed left-0 right-0 top-0 z-50 bg-blue-900 text-white shadow-lg';

    const currentPath = window.location.pathname;
    const navLinkClasses = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition';

    navbar.innerHTML = `
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav class="flex h-20 items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">🎓</span>
                    <div class="text-lg font-bold tracking-tight">
                        Alumni<span class="text-red-400">Connect</span>
                    </div>
                </div>

                <div class="hidden items-center gap-2 md:flex">
                    <a href="/admin/dashboard.html" class="${navLinkClasses} ${currentPath.includes('dashboard') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/admin/events.html" class="${navLinkClasses} ${currentPath.includes('events') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-calendar-alt"></i>
                        <span>Events</span>
                    </a>
                    <a href="/admin/news.html" class="${navLinkClasses} ${currentPath.includes('news') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-bullhorn"></i>
                        <span>News</span>
                    </a>
                    <a href="/admin/members.html" class="${navLinkClasses} ${currentPath.includes('members') ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-yellow-300'}">
                        <i class="fa-solid fa-users"></i>
                        <span>Members</span>
                    </a>
                </div>

                <button id="logoutBtn" class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700">
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
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login.html';
        });
    }
}
