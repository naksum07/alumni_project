// TODO: REAL BACKEND INTEGRATION POINT
// This module provides a mock data store using localStorage to simulate a database.
// To use real backend APIs, replace localStorage calls in these functions with fetch() or axios().

const DB_KEY = 'alumni_mock_db';

const initialData = {
    users: [
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', type: 'Alumni', dateJoined: '2023-01-15' },
        { id: 2, name: 'Bob Johnson', email: 'bob@example.com', type: 'Student', dateJoined: '2023-05-20' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', type: 'Alumni', dateJoined: '2024-02-10' }
    ],
    events: [
        { id: 1, title: 'Annual Alumni Meet', host: 'Alumni Association', date: '2024-12-15', status: 'upcoming', participantCount: 150 },
        { id: 2, title: 'Tech Talk: Web Dev', host: 'Alice Smith', date: '2024-10-05', status: 'completed', participantCount: 45 },
        { id: 3, title: 'Career Guidance Session', host: 'Career Cell', date: '2024-11-20', status: 'upcoming', participantCount: 80 }
    ],
    news: [
        { id: 1, title: 'New Mentorship Program Launched', category: 'Announcement', audience: 'Everyone', status: 'Published', date: '2024-10-01' },
        { id: 2, title: 'Upcoming Tech Symposium', category: 'News', audience: 'Students only', status: 'Draft', date: '2024-10-15' }
    ],
    eventParticipants: {
        1: [ { id: 2, name: 'Bob Johnson', email: 'bob@example.com', type: 'Student' } ]
    },
    adminSession: null
};

function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initialData;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Initialize DB if not present
if (!localStorage.getItem(DB_KEY)) {
    saveDB(initialData);
}

const DataStore = {
    // USERS
    getUsers: () => getDB().users,
    addUser: (user) => {
        const db = getDB();
        const newUser = { ...user, id: Date.now(), dateJoined: new Date().toISOString().split('T')[0] };
        db.users.push(newUser);
        saveDB(db);
        return newUser;
    },
    getUserStats: () => {
        const users = getDB().users;
        return {
            total: users.length,
            alumni: users.filter(u => u.type === 'Alumni').length,
            students: users.filter(u => u.type === 'Student').length
        };
    },

    // EVENTS
    getEvents: () => getDB().events,
    addEvent: (event) => {
        const db = getDB();
        const newEvent = { ...event, id: Date.now(), participantCount: 0 };
        db.events.push(newEvent);
        saveDB(db);
        return newEvent;
    },
    deleteEvent: (id) => {
        const db = getDB();
        db.events = db.events.filter(e => e.id !== id);
        delete db.eventParticipants[id];
        saveDB(db);
    },
    getEventParticipants: (eventId) => {
        const db = getDB();
        return db.eventParticipants[eventId] || [];
    },
    getEventStats: () => {
        const events = getDB().events;
        const totalEvents = events.length;
        const totalParticipants = events.reduce((sum, e) => sum + e.participantCount, 0);
        return { totalEvents, totalParticipants };
    },

    // NEWS
    getNews: () => getDB().news,
    addNews: (newsItem) => {
        const db = getDB();
        const newNews = { ...newsItem, id: Date.now(), date: new Date().toISOString().split('T')[0] };
        db.news.push(newNews);
        saveDB(db);
        return newNews;
    },
    toggleNewsStatus: (id) => {
        const db = getDB();
        const news = db.news.find(n => n.id === id);
        if (news) {
            news.status = news.status === 'Published' ? 'Draft' : 'Published';
            saveDB(db);
        }
    },
    deleteNews: (id) => {
        const db = getDB();
        db.news = db.news.filter(n => n.id !== id);
        saveDB(db);
    },

    // ADMIN AUTH
    // TODO: Replace with real JWT based auth request
    adminLogin: (username, passcode) => {
        if (username === 'admin' && passcode === 'admin123') {
            const db = getDB();
            db.adminSession = { username, loggedInAt: new Date().toISOString() };
            saveDB(db);
            return true;
        }
        return false;
    },
    adminLogout: () => {
        const db = getDB();
        db.adminSession = null;
        saveDB(db);
    },
    isAdminAuthenticated: () => {
        return !!getDB().adminSession;
    }
};

window.DataStore = DataStore;
