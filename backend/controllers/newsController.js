const pool = require('../config/db');

// GET /api/news — Public: fetch published news, announcements, and events for public feed
async function getPublicNews(req, res) {
  try {
    // 1. Fetch published news
    const newsPromise = pool.query(
      `SELECT id, title, content, category, image_url, publish_date, visibility, created_at
       FROM news
       WHERE status = 'Published'
       ORDER BY publish_date DESC`
    );

    // 2. Fetch published announcements
    const annPromise = pool.query(
      `SELECT id, title, content, priority, status, created_at
       FROM announcements
       WHERE status = 'Published'
       ORDER BY created_at DESC`
    );

    // 3. Fetch active events
    const eventPromise = pool.query(
      `SELECT id, name, event_date, event_date_end, event_time, venue, description, host, status, created_at
       FROM events
       WHERE COALESCE(status, 'upcoming') != 'cancelled'
       ORDER BY event_date DESC`
    );

    const [newsRes, annRes, eventRes] = await Promise.all([newsPromise, annPromise, eventPromise]);

    const newsItems = newsRes.rows.map(n => ({
      id: `news-${n.id}`,
      original_id: n.id,
      type: 'news',
      title: n.title,
      content: n.content,
      category: n.category || 'News',
      image_url: n.image_url,
      visibility: n.visibility,
      publish_date: n.publish_date || n.created_at,
      created_at: n.created_at
    }));

    const announcementItems = annRes.rows.map(a => ({
      id: `announcement-${a.id}`,
      original_id: a.id,
      type: 'announcement',
      title: a.title,
      content: a.content,
      category: 'Announcement',
      priority: a.priority || 'normal',
      publish_date: a.created_at,
      created_at: a.created_at
    }));

    const eventItems = eventRes.rows.map(e => ({
      id: `event-${e.id}`,
      original_id: e.id,
      type: 'event',
      title: e.name,
      content: e.description || '',
      category: 'Event',
      event_date: e.event_date,
      event_date_end: e.event_date_end,
      event_time: e.event_time,
      venue: e.venue,
      host: e.host,
      status: e.status || 'upcoming',
      publish_date: e.created_at || e.event_date,
      created_at: e.created_at
    }));

    const combined = [...newsItems, ...announcementItems, ...eventItems];
    combined.sort((a, b) => {
      const dateA = new Date(a.publish_date || a.created_at || 0).getTime();
      const dateB = new Date(b.publish_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    res.json(combined);
  } catch (err) {
    console.error('Error fetching public news, announcements and events:', err);
    res.status(500).json({ message: 'Server error while fetching news' });
  }
}

module.exports = { getPublicNews };
