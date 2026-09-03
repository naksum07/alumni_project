import os
import re

def update_js_file(filepath, arr_name, grid_id, render_func_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic JS pagination block to inject
    pagination_js = f"""
  // --- Pagination State ---
  let allData = [];
  let currentPage = 1;
  const itemsPerPage = 40;

  function updatePaginationControls(totalItems) {{
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const paginationControls = document.getElementById('paginationControls');

    if (totalItems <= itemsPerPage) {{
      if (paginationControls) {{
        paginationControls.classList.add('hidden');
        paginationControls.classList.remove('flex');
      }}
    }} else {{
      if (paginationControls) {{
        paginationControls.classList.remove('hidden');
        paginationControls.classList.add('flex');
      }}
    }}

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    if (pageIndicator) pageIndicator.textContent = `Page ${{currentPage}} of ${{totalPages}}`;
  }}

  function getPaginatedData(filteredData) {{
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }}
  // --- End Pagination State ---
"""

    if 'let allData = []' not in content:
        # Prepend after IIFE starts
        content = content.replace('(function () {', '(function () {\n' + pagination_js)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# We actually need more custom logic for each file since the variable names and rendering logic differ.
# Let's just create individual rewriting scripts or write the entire files.
