/* ==========================================================================
   COMMUNITY BLOG DATA & INTERACTION SYSTEM (JWT AUTH & REST API INTEGRATED)
   ========================================================================== */

const STORAGE_KEY = 'alumni_community_posts_v1';

const DEFAULT_POSTS = [];

function getAuthToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return !!(getAuthToken() && getCurrentUser());
}

function getLoginUrl() {
    return window.location.pathname.includes('/community-blog/') ? '../login.html' : 'login.html';
}

function requireAuth(actionName = 'participate') {
    if (isLoggedIn()) return true;

    const message = `Please log in to ${actionName}.`;
    const redirect = () => {
        window.location.href = getLoginUrl();
    };

    if (typeof window.showPopup === 'function') {
        window.showPopup(message, 'warning', 'Authentication Required', null, redirect);
    } else if (typeof window.showConfirmPopup === 'function') {
        window.showConfirmPopup(
            `${message} Would you like to go to the login page now?`,
            'Log In Required',
            redirect,
            null,
            'Log In',
            'Cancel'
        );
    } else {
        alert(message);
        redirect();
    }
    return false;
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse(res, defaultErrMsg) {
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const redirect = () => { window.location.href = getLoginUrl(); };
        if (typeof window.showPopup === 'function') {
            window.showPopup('Your session has expired. Please log in again.', 'warning', 'Session Expired', null, redirect);
        } else {
            alert('Your session has expired. Please log in again.');
            redirect();
        }
        throw new Error('Unauthorized');
    }

    if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || 'Forbidden: You are not authorized to perform this action.';
        if (typeof window.showPopup === 'function') {
            window.showPopup(msg, 'error', 'Permission Denied');
        } else {
            alert(msg);
        }
        throw new Error(msg);
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || defaultErrMsg || `Request failed with status ${res.status}`;
        if (typeof window.showPopup === 'function') {
            window.showPopup(msg, 'error', 'Error');
        } else {
            alert(msg);
        }
        throw new Error(msg);
    }

    return await res.json();
}

function getPosts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            const hasLegacy = parsed.some(p => p.author === 'Priya Sharma' || p.author === 'Amit Kumar' || p.author_name === 'Priya Sharma' || p.author_name === 'Amit Kumar');
            if (hasLegacy) {
                localStorage.removeItem(STORAGE_KEY);
                return [];
            }
            return parsed;
        }
        return [];
    } catch (e) {
        return [];
    }
}

function savePosts(posts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('community_posts_updated', { detail: posts }));
        }
    } catch (e) {
        console.error('Failed to save posts to localStorage:', e);
    }
}

async function fetchPostsFromAPI() {
    try {
        const res = await fetch(getApiUrl('/api/community/posts'), {
            headers: getAuthHeaders()
        });
        if (res.ok) {
            const apiPosts = await res.json();
            if (Array.isArray(apiPosts)) {
                savePosts(apiPosts);
                return apiPosts;
            }
        }
    } catch (err) {
        console.warn('Backend API fetch unavailable:', err.message || err);
    }
    return [];
}

function isOwner(itemUserId) {
    const user = getCurrentUser();
    if (!user || !user.id || itemUserId === undefined || itemUserId === null) return false;
    return String(user.id) === String(itemUserId);
}

function timeAgo(dateString) {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getAvatarColor(role) {
    if (role === 'Alumni') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (role === 'Faculty') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    return 'bg-blue-100 text-blue-800 border-blue-200';
}

function getRoleBadge(role) {
    if (role === 'Alumni') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🎓 Alumni</span>';
    if (role === 'Faculty') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">👨‍🏫 Faculty</span>';
    return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">🎒 Student</span>';
}

function getCategoryBadge(category) {
    switch(category) {
        case 'Career': return '<span class="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">💼 Career &amp; Jobs</span>';
        case 'Mentorship': return '<span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">🤝 Mentorship</span>';
        case 'Academics': return '<span class="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">🎓 Academics</span>';
        default: return '<span class="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">💬 General</span>';
    }
}

// Auto-trigger API fetch when script loads
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchPostsFromAPI);
    } else {
        fetchPostsFromAPI();
    }
}

window.CommunityBlog = {
    getAuthToken,
    getCurrentUser,
    isLoggedIn,
    requireAuth,
    isOwner,
    getPosts,
    savePosts,
    fetchPosts: fetchPostsFromAPI,
    timeAgo,
    getAvatarColor,
    getRoleBadge,
    getCategoryBadge,

    createPost: async function(postData) {
        if (!requireAuth('create a post')) return null;

        try {
            const res = await fetch(getApiUrl('/api/community/posts'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    category: postData.category,
                    title: postData.title,
                    content: postData.content
                })
            });
            const newPost = await handleResponse(res, 'Failed to create post');
            await fetchPostsFromAPI();
            return newPost;
        } catch (err) {
            console.error('Error creating post:', err);
            return null;
        }
    },

    updatePost: async function(postId, postData) {
        if (!requireAuth('edit this post')) return null;

        try {
            const res = await fetch(getApiUrl(`/api/community/posts/${postId}`), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    category: postData.category,
                    title: postData.title,
                    content: postData.content
                })
            });
            const updatedPost = await handleResponse(res, 'Failed to update post');
            await fetchPostsFromAPI();
            return updatedPost;
        } catch (err) {
            console.error('Error updating post:', err);
            return null;
        }
    },

    deletePost: async function(postId) {
        if (!requireAuth('delete this post')) return false;

        try {
            const res = await fetch(getApiUrl(`/api/community/posts/${postId}`), {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            await handleResponse(res, 'Failed to delete post');
            await fetchPostsFromAPI();
            return true;
        } catch (err) {
            console.error('Error deleting post:', err);
            return false;
        }
    },

    toggleLike: async function(postId) {
        if (!requireAuth('like posts')) return null;

        try {
            const res = await fetch(getApiUrl(`/api/community/posts/${postId}/like`), {
                method: 'POST',
                headers: getAuthHeaders()
            });
            await handleResponse(res, 'Failed to like post');
            await fetchPostsFromAPI();
            const posts = getPosts();
            return posts.find(p => String(p.id) === String(postId));
        } catch (err) {
            console.error('Error toggling like:', err);
            return null;
        }
    },

    addComment: async function(postId, commentData) {
        if (!requireAuth('add a comment')) return null;

        try {
            const res = await fetch(getApiUrl(`/api/community/posts/${postId}/comments`), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ content: commentData.content })
            });
            const comment = await handleResponse(res, 'Failed to add comment');
            await fetchPostsFromAPI();
            return comment;
        } catch (err) {
            console.error('Error adding comment:', err);
            return null;
        }
    },

    updateComment: async function(commentId, commentData) {
        if (!requireAuth('edit this comment')) return null;

        try {
            const res = await fetch(getApiUrl(`/api/community/comments/${commentId}`), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ content: commentData.content })
            });
            const updatedComment = await handleResponse(res, 'Failed to update comment');
            await fetchPostsFromAPI();
            return updatedComment;
        } catch (err) {
            console.error('Error updating comment:', err);
            return null;
        }
    },

    deleteComment: async function(commentId) {
        if (!requireAuth('delete this comment')) return false;

        try {
            const res = await fetch(getApiUrl(`/api/community/comments/${commentId}`), {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            await handleResponse(res, 'Failed to delete comment');
            await fetchPostsFromAPI();
            return true;
        } catch (err) {
            console.error('Error deleting comment:', err);
            return false;
        }
    }
};
