const fs = require('fs');
let code = fs.readFileSync('frontend/pages/index.html', 'utf8');
const successHTML = \
<!-- SUCCESS STORIES CAROUSEL -->
<section class=\"py-16 bg-white overflow-hidden\" id=\"success-stories-section\" style=\"display:none;\">
    <div class=\"max-w-7xl mx-auto px-6\">
        <div class=\"text-center mb-10\">
            <span class=\"inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#012970] border border-blue-100 uppercase tracking-widest mb-2\">
                ? Alumni Journeys &amp; Impact
            </span>
            <h2 class=\"text-3xl md:text-4xl font-bold text-[#012970]\">Success Stories</h2>
            <p class=\"mt-2 text-slate-600 max-w-2xl mx-auto text-sm md:text-base\">Inspiring milestones and achievements from our distinguished alumni community worldwide.</p>
        </div>

        <div class=\"relative max-w-5xl mx-auto group\" id=\"success-stories-carousel-wrapper\">
            <div class=\"overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0b1728] to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800 relative\">
                <i class=\"fa-solid fa-quote-right absolute right-8 bottom-6 text-7xl text-white/5 pointer-events-none\"></i>
                <div id=\"success-stories-track\" class=\"flex transition-transform duration-700 ease-in-out\"></div>
            </div>
            <button id=\"successStoriesPrevBtn\" aria-label=\"Previous Success Story\" class=\"absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-[#012970] shadow-lg hover:bg-slate-50 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-slate-200 z-20 focus:outline-none\"><i class=\"fa-solid fa-chevron-left text-sm\"></i></button>
            <button id=\"successStoriesNextBtn\" aria-label=\"Next Success Story\" class=\"absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-[#012970] shadow-lg hover:bg-slate-50 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-slate-200 z-20 focus:outline-none\"><i class=\"fa-solid fa-chevron-right text-sm\"></i></button>
            <div id=\"successStoriesDots\" class=\"flex justify-center items-center gap-2 mt-6\"></div>
        </div>
    </div>
</section>
\;

code = code.replace('<!-- FEATURES SECTION -->', successHTML + '\n<!-- FEATURES SECTION -->');
fs.writeFileSync('frontend/pages/index.html', code);
console.log('Successfully inserted success stories section.');
\
