const https = require('https');

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs';

// In-memory cache for Adzuna API responses (10 minutes TTL)
const jobCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

function getFromCache(key) {
  const cached = jobCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    jobCache.delete(key);
    return null;
  }
  return cached.data;
}

function setInCache(key, data) {
  if (jobCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = jobCache.keys().next().value;
    if (firstKey) jobCache.delete(firstKey);
  }
  jobCache.set(key, { timestamp: Date.now(), data });
}

/**
 * Helper: make an HTTPS GET request and return the parsed JSON body.
 * Includes a configurable timeout to prevent hanging requests.
 */
function fetchJSON(url, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Adzuna API returned HTTP status ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error('Invalid JSON response from Adzuna API'));
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Adzuna API request timed out after ${timeoutMs}ms`));
    });

    req.on('error', reject);
  });
}

/**
 * GET /api/external-jobs
 *
 * Query params (all optional):
 *   what      – keyword / job title (default: "")
 *   where     – location text       (default: "")
 *   country   – 2-letter code       (default: "in" for India)
 *   page      – page number         (default: 1)
 *   per_page  – results per page    (default: 20, max 50)
 *
 * Returns a normalised array:
 *   { title, company, location, description, jobUrl, postedDate, source }
 */
async function searchExternalJobs(req, res) {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return res.status(500).json({
      message: 'Adzuna API credentials are not configured. '
             + 'Set ADZUNA_APP_ID and ADZUNA_APP_KEY in the .env file.',
    });
  }

  const {
    what     = '',
    where    = '',
    country  = 'in',
    page     = 1,
    per_page = 20,
  } = req.query;

  const perPage = Math.min(Number(per_page) || 20, 50);
  const pageNum = Math.max(Number(page) || 1, 1);

  // Build a unique cache key based on search parameters
  const cacheKey = `${country}:${pageNum}:${perPage}:${what.trim().toLowerCase()}:${where.trim().toLowerCase()}`;

  // Serve from cache if available
  const cachedResponse = getFromCache(cacheKey);
  if (cachedResponse) {
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.json({ ...cachedResponse, cached: true });
  }

  // Build the Adzuna search URL
  const params = new URLSearchParams({
    app_id:           appId,
    app_key:          appKey,
    results_per_page: perPage,
  });

  if (what)  params.set('what', what);
  if (where) params.set('where', where);

  const url = `${ADZUNA_BASE}/${encodeURIComponent(country)}/search/${pageNum}?${params}`;

  try {
    const data = await fetchJSON(url, 7000);

    if (!data || !Array.isArray(data.results)) {
      return res.status(502).json({
        message: 'Unexpected response from Adzuna API.',
      });
    }

    // Normalise each result into the fields the frontend expects
    const jobs = data.results.map((item) => ({
      title:       item.title        || 'Untitled',
      company:     item.company?.display_name || 'Unknown Company',
      location:    item.location?.display_name || '',
      description: item.description  || '',
      jobUrl:      item.redirect_url || '',
      postedDate:  item.created      || '',
      salary_min:  item.salary_min   ?? null,
      salary_max:  item.salary_max   ?? null,
      category:    item.category?.label || '',
      source:      'Adzuna',
    }));

    const responseData = {
      count:   data.count   ?? jobs.length,
      page:    pageNum,
      perPage,
      jobs,
    };

    // Store successful response in cache
    setInCache(cacheKey, responseData);

    res.setHeader('Cache-Control', 'public, max-age=600');
    res.json(responseData);
  } catch (err) {
    console.error('Adzuna API error:', err.message);
    res.status(200).json({
      count: 0,
      page: pageNum,
      perPage,
      jobs: [],
      error: true,
      message: 'Adzuna API is currently rate-limited or unavailable. ' + err.message,
    });
  }
}

module.exports = { searchExternalJobs };

