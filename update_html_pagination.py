import re

files = ['frontend/pages/alumni-directory.html', 'frontend/pages/student-directory.html', 'frontend/pages/events.html']

controls = """
  <!-- PAGINATION CONTROLS -->
  <div id="paginationControls" class="hidden flex justify-center items-center gap-4 mt-12 mb-8">
    <button id="prevPageBtn" class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
    <span id="pageIndicator" class="text-slate-600 font-medium">Page 1 of 1</span>
    <button id="nextPageBtn" class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
  </div>
"""

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if file.endswith('alumni-directory.html'):
        pattern = r'(<div[^>]*id="alumniGrid"[^>]*>.*?</div>)'
        # Replace only if not already present
        if 'id="paginationControls"' not in content:
            content = re.sub(pattern, r'\1' + controls, content, flags=re.DOTALL)
            # Update grid to be md:grid-cols-2 lg:grid-cols-4 for uniformity
            content = content.replace('sm:grid-cols-2\n                       lg:grid-cols-4', 'grid-cols-1\n                       md:grid-cols-2\n                       lg:grid-cols-4')
    elif file.endswith('student-directory.html'):
        pattern = r'(<div[^>]*id="studentGrid"[^>]*>.*?</div>)'
        if 'id="paginationControls"' not in content:
            content = re.sub(pattern, r'\1' + controls, content, flags=re.DOTALL)
            content = content.replace('sm:grid-cols-2\n                       lg:grid-cols-4', 'grid-cols-1\n                       md:grid-cols-2\n                       lg:grid-cols-4')
    elif file.endswith('events.html'):
        pattern = r'(<div[^>]*id="eventsContainer"[^>]*>.*?</div>)'
        if 'id="paginationControls"' not in content:
            content = re.sub(pattern, r'\1' + controls, content, flags=re.DOTALL)
            # events page grid class: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
            content = content.replace('md:grid-cols-2\n           xl:grid-cols-3', 'md:grid-cols-2\n           lg:grid-cols-4')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
