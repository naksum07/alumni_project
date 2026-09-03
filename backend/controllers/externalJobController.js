const https = require('https');

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs';

/**
 * Helper: make an HTTPS GET request and return the parsed JSON body.
 * Uses the built-in `https` module so no extra dependency is needed.
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error('Invalid JSON from Adzuna API'));
        }
      });
    }).on('error', reject);
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
    const data = await fetchJSON(url);

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
      source:      'Adzuna',          // aggregates LinkedIn, Indeed, Glassdoor, etc.
    }));

    res.json({
      count:   data.count   ?? jobs.length,
      page:    pageNum,
      perPage,
      jobs,
    });
  } catch (err) {
    console.error('Adzuna API error:', err);
    res.status(502).json({
      message: 'Failed to fetch jobs from Adzuna. Please try again later.',
    });
  }
}

module.exports = { searchExternalJobs };
