import re

with open('frontend/pages/jobs.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace title
content = content.replace('<title>Jobs &amp; Internships | AlumniConnect</title>', '<title>News &amp; Announcements | AlumniConnect</title>')
# Replace script
content = content.replace('<script src="../scripts/jobs.js" defer></script>', '<script src="../scripts/new.js" defer></script>')

# Replace active nav links
content = content.replace('<a href="news-announcements.html" class="hover:text-[#c4161c] transition">News</a>', '<a href="news-announcements.html" class="text-[#c4161c] transition">News</a>')
content = content.replace('<a href="jobs.html" class="text-[#c4161c] transition">Jobs</a>', '<a href="jobs.html" class="hover:text-[#c4161c] transition">Jobs</a>')

# Mobile nav
content = content.replace('<a href="news-announcements.html" class="block py-3 border-b border-gray-100 hover:text-[#c4161c]">News</a>', '<a href="news-announcements.html" class="block py-3 border-b border-gray-100 text-[#c4161c]">News</a>')
content = content.replace('<a href="jobs.html" class="block py-3 border-b border-gray-100 text-[#c4161c]">Jobs</a>', '<a href="jobs.html" class="block py-3 border-b border-gray-100 hover:text-[#c4161c]">Jobs</a>')

# Update Hero Section
hero_old = """<h2
          class="text-4xl md:text-6xl
                 font-extrabold
                 leading-tight">

          Build Your Career

          <br>

          <span class="text-blue-200">

            With Your Alumni Network

          </span>

        </h2>"""
hero_new = """<h2
          class="text-4xl md:text-6xl
                 font-extrabold
                 leading-tight">

          News &amp; Announcements

        </h2>"""
content = content.replace(hero_old, hero_new)

desc_old = """<p
          class="text-blue-100
                 text-lg mt-6
                 max-w-2xl
                 leading-relaxed">

          Explore jobs and internships
          shared by alumni, companies
          and career partners.

        </p>"""
desc_new = """<p
          class="text-blue-100
                 text-lg mt-6
                 max-w-2xl
                 leading-relaxed">

          Stay updated with the latest news, announcements, and events from the alumni community.

        </p>"""
content = content.replace(desc_old, desc_new)

# Remove buttons from hero
buttons_pattern = r'<div\s+class="flex flex-wrap\s+gap-4 mt-8">.*?</div>'
content = re.sub(buttons_pattern, '<div class="flex flex-wrap gap-4 mt-8"></div>', content, flags=re.DOTALL)

# Update Search / Filters
search_old = 'placeholder="Search job title, company or skill..."'
search_new = 'placeholder="Search news or announcements..."'
content = content.replace(search_old, search_new)

type_select_old = """<select
        id="filterType"
        class="border border-slate-200
               rounded-xl
               px-4 py-3.5
               outline-none
               focus:border-blue-500">

        <option value="All">
          All Types
        </option>

        <option value="Job">
          Full-Time Jobs
        </option>

        <option value="Internship">
          Internships
        </option>

      </select>"""
type_select_new = """<select
        id="filterCategory"
        class="border border-slate-200
               rounded-xl
               px-4 py-3.5
               outline-none
               focus:border-blue-500">
        <option value="All">All Categories</option>
        <option value="Announcement">Announcement</option>
        <option value="Event Recap">Event Recap</option>
        <option value="Newsletter">Newsletter</option>
        <option value="General News">General News</option>
      </select>"""
content = content.replace(type_select_old, type_select_new)

location_select_old = """<select
        id="filterLocation"
        class="border border-slate-200
               rounded-xl
               px-4 py-3.5
               outline-none
               focus:border-blue-500">

        <option value="All">
          All Locations
        </option>

        <option value="Remote">
          Remote
        </option>

        <option value="Bangalore">
          Bangalore
        </option>

        <option value="Kolkata">
          Kolkata
        </option>

        <option value="Delhi">
          Delhi
        </option>

        <option value="Mumbai">
          Mumbai
        </option>

        <option value="Pune">
          Pune
        </option>

        <option value="Hyderabad">
          Hyderabad
        </option>

      </select>"""
location_select_new = """<select
        id="filterSort"
        class="border border-slate-200
               rounded-xl
               px-4 py-3.5
               outline-none
               focus:border-blue-500">
        <option value="Newest">Newest First</option>
        <option value="Oldest">Oldest First</option>
      </select>"""
content = content.replace(location_select_old, location_select_new)

# Update Board Section
content = content.replace('id="opportunities"', 'id="newsSection"')
content = content.replace('Career Board', 'Updates')
content = content.replace('Latest Opportunities', 'Latest News &amp; Announcements')
content = content.replace('Loading opportunities...', 'Loading news...')
content = content.replace('+ Post Opportunity', '') # Removed button text, but the button tag will be empty now
# Remove the empty button
content = re.sub(r'<button[^>]*onclick="openPostModal\(\)"[^>]*>\s*</button>', '', content)

# Grid ID and columns
content = content.replace('id="jobContainer"', 'id="newsGrid"')
content = content.replace('xl:grid-cols-3', 'lg:grid-cols-4')

# Add Pagination controls after newsGrid
grid_end_pattern = r'</div>\s+<!-- NO RESULTS -->'
grid_new = """</div>

  <!-- PAGINATION CONTROLS -->
  <div id="paginationControls" class="hidden flex justify-center items-center gap-4 mt-12 mb-8">
    <button id="prevPageBtn" class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
    <span id="pageIndicator" class="text-slate-600 font-medium">Page 1 of 1</span>
    <button id="nextPageBtn" class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
  </div>


  <!-- NO RESULTS -->"""
content = re.sub(grid_end_pattern, grid_new, content)

content = content.replace('No opportunities found', 'No news or announcements available right now.')

# Replace Modals with News Modal
modals_pattern = r'<!-- =====================================================\n     DETAILS MODAL.*?<footer'
new_modal = """<!-- =====================================================
     NEWS MODAL
===================================================== -->
<div id="newsModal" class="hidden fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm items-center justify-center p-5">
  <div class="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
    <div class="p-8 relative">
      <button onclick="closeNews()" class="absolute right-5 top-4 text-3xl text-slate-400 hover:text-slate-700">&times;</button>
      <div id="modalContent">
        <p id="modalDate" class="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2"></p>
        <h2 id="modalTitle" class="text-3xl font-extrabold"></h2>
        <div class="mt-6 space-y-4 text-slate-600 leading-relaxed" id="modalDescription"></div>
      </div>
    </div>
  </div>
</div>

<footer"""
content = re.sub(modals_pattern, new_modal, content, flags=re.DOTALL)

with open('frontend/pages/news-announcements.html', 'w', encoding='utf-8') as f:
    f.write(content)
