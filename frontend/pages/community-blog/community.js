/* ==========================================================================
   COMMUNITY BLOG DATA & INTERACTION SYSTEM (TAILWIND INTEGRATED)
   ========================================================================== */

const STORAGE_KEY = 'alumni_community_posts_v1';

const DEFAULT_POSTS = [
    {
        id: 'post-1',
        author: 'Priya Sharma',
        role: 'Alumni',
        affiliation: 'Senior SDE @ Microsoft (Batch \'20)',
        category: 'Career',
        title: 'Tips for 3rd & 4th Year Students Preparing for Tech Interviews',
        content: `Hey everyone! For all students aiming for software engineering roles this placement season:

1. Focus deeply on Data Structures (Trees, Graphs, Dynamic Programming).
2. Build at least 2 production-grade full-stack projects with clean git commits and documentation.
3. Practice mock behavioral interviews using the STAR method.

Feel free to ask your questions or request resume reviews below!`,
        likes: 28,
        liked: false,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        comments: [
            {
                id: 'c-1',
                author: 'Rohan Verma',
                role: 'Student',
                content: 'Thank you Priya ma\'am! Should we focus more on LeetCode or system design for entry-level roles?',
                createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
            },
            {
                id: 'c-2',
                author: 'Priya Sharma',
                role: 'Alumni',
                content: 'For fresher roles, DSA and core CS subjects (OS, DBMS, Networks) are 90% of the evaluation. Basic low-level design is enough!',
                createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
            }
        ]
    },
    {
        id: 'post-2',
        author: 'Amit Kumar',
        role: 'Alumni',
        affiliation: 'Product Lead @ FinTech (Batch \'18)',
        category: 'Mentorship',
        title: '🤝 Offering 1-on-1 Resume Reviews & Product Management Guidance',
        content: `Happy to mentor current students and recent graduates interested in transitioning from engineering to Product Management, UI/UX design, or Business Analysis.

Drop a comment with your areas of interest or reach out through the Alumni Directory. Happy to schedule mock sessions!`,
        likes: 23,
        liked: false,
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        comments: [
            {
                id: 'c-3',
                author: 'Anjali Rai',
                role: 'Student',
                content: 'Would love to connect regarding PM roadmaps and APM program preparation!',
                createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
            }
        ]
    },
    {
        id: 'post-3',
        author: 'Sneha Subba',
        role: 'Student',
        affiliation: 'BTech CSE (Batch \'26)',
        category: 'Academics',
        title: '🚀 Starting an AI/ML Open-Source Study Group on Campus',
        content: `A few of us 3rd-year students are starting a weekly peer study group to explore Generative AI, PyTorch models, and real-world open-source contributions.

Any seniors or alumni working in AI/Data Science who would like to guide us, suggest roadmaps, or give a guest talk? All students are welcome to join!`,
        likes: 19,
        liked: false,
        createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        comments: []
    },
    {
        id: 'post-4',
        author: 'Dr. Tashi Dorjee',
        role: 'Faculty',
        affiliation: 'Dept. of Science & Technology',
        category: 'General',
        title: 'Call for Alumni Guest Speakers: Tech Innovate Symposium 2026',
        content: `The Department of Science & Technology is inviting distinguished alumni working in cloud computing, cybersecurity, and data analytics to deliver keynote sessions at our upcoming Tech Innovate Symposium next month. Interested alumni may comment or email the department.`,
        likes: 31,
        liked: false,
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        comments: []
    }
];

function getPosts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
            return DEFAULT_POSTS;
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_POSTS;
    } catch (e) {
        return DEFAULT_POSTS;
    }
}

function savePosts(posts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
        console.error('Failed to save posts to localStorage:', e);
    }
}

function timeAgo(dateString) {
    const date = new Date(dateString);
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
    return 'bg-blue-100 text-blue-800 border-blue-300';
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

window.CommunityBlog = {
    getPosts,
    savePosts,
    timeAgo,
    getAvatarColor,
    getRoleBadge,
    getCategoryBadge,

    createPost: function(postData) {
        const posts = getPosts();
        const newPost = {
            id: 'post-' + Date.now(),
            author: postData.author,
            role: postData.role || 'Alumni',
            affiliation: postData.affiliation || 'Community Member',
            category: postData.category || 'General',
            title: postData.title,
            content: postData.content,
            likes: 1,
            liked: true,
            createdAt: new Date().toISOString(),
            comments: []
        };
        posts.unshift(newPost);
        savePosts(posts);
        return newPost;
    },

    toggleLike: function(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        if (post.liked) {
            post.likes = Math.max(0, (post.likes || 1) - 1);
            post.liked = false;
        } else {
            post.likes = (post.likes || 0) + 1;
            post.liked = true;
        }
        savePosts(posts);
        return post;
    },

    addComment: function(postId, commentData) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        if (!post.comments) post.comments = [];

        const comment = {
            id: 'c-' + Date.now(),
            author: commentData.author || 'You (Community Member)',
            role: commentData.role || 'Student',
            content: commentData.content,
            createdAt: new Date().toISOString()
        };
        post.comments.push(comment);
        savePosts(posts);
        return comment;
    },

    deletePost: function(postId) {
        let posts = getPosts();
        posts = posts.filter(p => p.id !== postId);
        savePosts(posts);
    },

    deleteComment: function(postId, commentId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post || !post.comments) return;
        post.comments = post.comments.filter(c => c.id !== commentId);
        savePosts(posts);
    }
};
