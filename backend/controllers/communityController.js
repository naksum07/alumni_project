const pool = require('../config/db');

// Default seed posts in case table is empty
const DEFAULT_POSTS = [
    {
        author_name: 'Priya Sharma',
        role: 'Alumni',
        affiliation: 'Senior SDE @ Microsoft (Batch \'20)',
        category: 'Career',
        title: 'Tips for 3rd & 4th Year Students Preparing for Tech Interviews',
        content: `Hey everyone! For all students aiming for software engineering roles this placement season:

1. Focus deeply on Data Structures (Trees, Graphs, Dynamic Programming).
2. Build at least 2 production-grade full-stack projects with clean git commits and documentation.
3. Practice mock behavioral interviews using the STAR method.

Feel free to ask your questions or request resume reviews below!`,
        likes: 28
    },
    {
        author_name: 'Amit Kumar',
        role: 'Alumni',
        affiliation: 'Product Lead @ FinTech (Batch \'18)',
        category: 'Mentorship',
        title: '🤝 Offering 1-on-1 Resume Reviews & Product Management Guidance',
        content: `Happy to mentor current students and recent graduates interested in transitioning from engineering to Product Management, UI/UX design, or Business Analysis.

Drop a comment with your areas of interest or reach out through the Alumni Directory. Happy to schedule mock sessions!`,
        likes: 23
    },
    {
        author_name: 'Sneha Subba',
        role: 'Student',
        affiliation: 'BTech CSE (Batch \'26)',
        category: 'Academics',
        title: '🚀 Starting an AI/ML Open-Source Study Group on Campus',
        content: `A few of us 3rd-year students are starting a weekly peer study group to explore Generative AI, PyTorch models, and real-world open-source contributions.

Any seniors or alumni working in AI/Data Science who would like to guide us, suggest roadmaps, or give a guest talk? All students are welcome to join!`,
        likes: 19
    },
    {
        author_name: 'Dr. Tashi Dorjee',
        role: 'Faculty',
        affiliation: 'Dept. of Science & Technology',
        category: 'General',
        title: 'Call for Alumni Guest Speakers: Tech Innovate Symposium 2026',
        content: `The Department of Science & Technology is inviting distinguished alumni working in cloud computing, cybersecurity, and data analytics to deliver keynote sessions at our upcoming Tech Innovate Symposium next month. Interested alumni may comment or email the department.`,
        likes: 31
    }
];

function formatRole(role) {
    if (!role) return 'Student';
    const lower = String(role).toLowerCase();
    if (lower === 'alumni') return 'Alumni';
    if (lower === 'faculty') return 'Faculty';
    if (lower === 'admin') return 'Admin';
    return 'Student';
}

function formatAffiliation(user) {
    if (!user) return '';
    if (user.company && user.job_title) {
        return `${user.job_title} @ ${user.company}`;
    }
    if (user.company) return user.company;
    if (user.department && user.graduation_year) {
        return `${user.department} (Batch '${String(user.graduation_year).slice(-2)})`;
    }
    if (user.department) return user.department;
    return formatRole(user.role);
}

async function getPosts(req, res) {
    try {
        const postsRes = await pool.query(`
            SELECT 
                cp.id, 
                cp.user_id,
                cp.user_id AS "userId",
                COALESCE(u.full_name, cp.author_name, 'Community Member') AS author,
                COALESCE(u.full_name, cp.author_name, 'Community Member') AS author_name,
                COALESCE(
                    CASE 
                        WHEN u.role = 'alumni' THEN 'Alumni'
                        WHEN u.role = 'student' THEN 'Student'
                        WHEN u.role = 'faculty' THEN 'Faculty'
                        WHEN u.role = 'admin' THEN 'Admin'
                        ELSE cp.role
                    END,
                    cp.role,
                    'Alumni'
                ) AS role,
                cp.affiliation,
                cp.category,
                cp.title,
                cp.content,
                cp.likes,
                cp.created_at AS "createdAt",
                cp.created_at
            FROM community_posts cp
            LEFT JOIN users u ON cp.user_id = u.id
            ORDER BY cp.created_at DESC
        `);

        let posts = postsRes.rows;

        // If table is empty, seed default posts
        if (posts.length === 0) {
            for (const p of DEFAULT_POSTS) {
                await pool.query(`
                    INSERT INTO community_posts (author_name, role, affiliation, category, title, content, likes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [p.author_name, p.role, p.affiliation, p.category, p.title, p.content, p.likes]);
            }
            const seededRes = await pool.query(`
                SELECT 
                    id, 
                    user_id,
                    user_id AS "userId",
                    author_name AS author,
                    author_name,
                    role,
                    affiliation,
                    category,
                    title,
                    content,
                    likes,
                    created_at AS "createdAt",
                    created_at
                FROM community_posts
                ORDER BY created_at DESC
            `);
            posts = seededRes.rows;
        }

        // Fetch comments for each post
        for (let post of posts) {
            const commentsRes = await pool.query(`
                SELECT 
                    cc.id, 
                    cc.post_id,
                    cc.user_id,
                    cc.user_id AS "userId",
                    COALESCE(u.full_name, cc.author_name, 'Community Member') AS author,
                    COALESCE(u.full_name, cc.author_name, 'Community Member') AS author_name,
                    COALESCE(
                        CASE 
                            WHEN u.role = 'alumni' THEN 'Alumni'
                            WHEN u.role = 'student' THEN 'Student'
                            WHEN u.role = 'faculty' THEN 'Faculty'
                            WHEN u.role = 'admin' THEN 'Admin'
                            ELSE cc.role
                        END,
                        cc.role,
                        'Student'
                    ) AS role,
                    cc.content,
                    cc.created_at AS "createdAt",
                    cc.created_at
                FROM community_comments cc
                LEFT JOIN users u ON cc.user_id = u.id
                WHERE cc.post_id = $1
                ORDER BY cc.created_at ASC
            `, [post.id]);
            post.comments = commentsRes.rows;
        }

        res.json(posts);
    } catch (err) {
        console.error('Error fetching community posts:', err);
        res.status(500).json({ message: 'Error fetching community posts' });
    }
}

async function createPost(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Logged-in user required' });
        }

        const { category, title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Fetch user from DB to get verified name, role, and profile info
        const userRes = await pool.query(`SELECT id, full_name, role, department, graduation_year, company, job_title FROM users WHERE id = $1`, [userId]);
        const user = userRes.rows[0];

        const authorName = user ? user.full_name : (req.user.email || 'Community Member');
        const role = formatRole(user ? user.role : req.user.role);
        const affiliation = formatAffiliation(user);

        const insertRes = await pool.query(`
            INSERT INTO community_posts (user_id, author_name, role, affiliation, category, title, content, likes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
            RETURNING id, user_id, user_id AS "userId", author_name AS author, author_name, role, affiliation, category, title, content, likes, created_at AS "createdAt", created_at
        `, [userId, authorName, role, affiliation, category || 'General', title, content]);

        const newPost = insertRes.rows[0];
        newPost.comments = [];
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating community post:', err);
        res.status(500).json({ message: 'Error creating community post' });
    }
}

async function updatePost(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Logged-in user required' });
        }

        const { id } = req.params;
        const { category, title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const postRes = await pool.query('SELECT * FROM community_posts WHERE id = $1', [id]);
        if (postRes.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = postRes.rows[0];
        if (Number(post.user_id) !== Number(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only edit your own posts' });
        }

        const updateRes = await pool.query(`
            UPDATE community_posts
            SET title = $1, content = $2, category = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING id, user_id, user_id AS "userId", author_name AS author, author_name, role, affiliation, category, title, content, likes, created_at AS "createdAt", created_at
        `, [title, content, category || post.category || 'General', id]);

        const updatedPost = updateRes.rows[0];

        // Fetch comments for post
        const commentsRes = await pool.query(`
            SELECT cc.id, cc.post_id, cc.user_id, cc.user_id AS "userId", COALESCE(u.full_name, cc.author_name, 'Community Member') AS author, cc.role, cc.content, cc.created_at AS "createdAt"
            FROM community_comments cc
            LEFT JOIN users u ON cc.user_id = u.id
            WHERE cc.post_id = $1
            ORDER BY cc.created_at ASC
        `, [id]);
        updatedPost.comments = commentsRes.rows;

        res.json(updatedPost);
    } catch (err) {
        console.error('Error updating community post:', err);
        res.status(500).json({ message: 'Error updating community post' });
    }
}

async function deletePost(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Logged-in user required' });
        }

        const { id } = req.params;
        const postRes = await pool.query('SELECT * FROM community_posts WHERE id = $1', [id]);
        if (postRes.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = postRes.rows[0];
        if (Number(post.user_id) !== Number(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own posts' });
        }

        await pool.query('DELETE FROM community_posts WHERE id = $1', [id]);
        res.json({ success: true, message: 'Post deleted successfully', id: Number(id) });
    } catch (err) {
        console.error('Error deleting community post:', err);
        res.status(500).json({ message: 'Error deleting community post' });
    }
}

async function toggleLike(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to like posts' });
        }

        const { id } = req.params;
        const updateRes = await pool.query(`
            UPDATE community_posts
            SET likes = likes + 1
            WHERE id = $1
            RETURNING id, likes
        `, [id]);

        if (updateRes.rowCount === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error('Error liking post:', err);
        res.status(500).json({ message: 'Error liking post' });
    }
}

async function addComment(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Logged-in user required' });
        }

        const { id } = req.params; // post_id
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        // Verify post exists
        const postRes = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
        if (postRes.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Fetch commenter user info
        const userRes = await pool.query('SELECT id, full_name, role FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        const authorName = user ? user.full_name : (req.user.email || 'Community Member');
        const role = formatRole(user ? user.role : req.user.role);

        const insertRes = await pool.query(`
            INSERT INTO community_comments (post_id, user_id, author_name, role, content)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, post_id, user_id, user_id AS "userId", author_name AS author, author_name, role, content, created_at AS "createdAt", created_at
        `, [id, userId, authorName, role, content]);

        res.status(201).json(insertRes.rows[0]);
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ message: 'Error adding comment' });
    }
}

async function updateComment(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Logged-in user required' });
        }

        const { id } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const commentRes = await pool.query('SELECT * FROM community_comments WHERE id = $1', [id]);
        if (commentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = commentRes.rows[0];
        if (Number(comment.user_id) !== Number(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only edit your own comments' });
        }

        const updateRes = await pool.query(`
            UPDATE community_comments
            SET content = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, post_id, user_id, user_id AS "userId", author_name AS author, author_name, role, content, created_at AS "createdAt", created_at
        `, [content, id]);

        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ message: 'Error updating comment' });
    }
}

async function deleteComment(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Logged-in user required' });
        }

        const { id } = req.params;
        const commentRes = await pool.query('SELECT * FROM community_comments WHERE id = $1', [id]);
        if (commentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = commentRes.rows[0];
        if (Number(comment.user_id) !== Number(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own comments' });
        }

        await pool.query('DELETE FROM community_comments WHERE id = $1', [id]);
        res.json({ success: true, message: 'Comment deleted successfully', id: Number(id) });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ message: 'Error deleting comment' });
    }
}

module.exports = {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    updateComment,
    deleteComment
};
