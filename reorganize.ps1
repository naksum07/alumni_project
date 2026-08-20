# =========================================================
# Alumni Project Reorganizer
# Run this from inside: C:\Users\kulun\Desktop\alumni_project
# =========================================================

Write-Host "Starting reorganization..." -ForegroundColor Yellow

# --- 1. Create frontend structure ---
$folders = @(
    "frontend\public",
    "frontend\pages",
    "frontend\pages\profiles",
    "frontend\styles",
    "frontend\scripts"
)
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}
Write-Host "Created frontend folders" -ForegroundColor Green

# --- 2. Move main HTML pages ---
$pages = @(
    "index.html","about.html","admin.html","events.html","jobs.html",
    "login.html","register.html","networking.html","career_fair.html",
    "annual-alumni-meet.html","networking_session.html"
)
foreach ($f in $pages) {
    if (Test-Path $f) {
        Move-Item $f "frontend\pages\" -Force
        Write-Host ("  moved " + $f + " to frontend/pages/")
    }
}

# --- 3. Move alumni profile pages ---
$profiles = @("Arjun-Das.html","Priya-Sharma.html","Rahul-Sharma.html")
foreach ($f in $profiles) {
    if (Test-Path $f) {
        Move-Item $f "frontend\pages\profiles\" -Force
        Write-Host ("  moved " + $f + " to frontend/pages/profiles/")
    }
}

# --- 4. Move CSS ---
$css = @("admin.css","events.css","jobs.css","networking.css")
foreach ($f in $css) {
    if (Test-Path $f) {
        Move-Item $f "frontend\styles\" -Force
        Write-Host ("  moved " + $f + " to frontend/styles/")
    }
}

# --- 5. Move frontend JS ---
$js = @("admin.js","events.js","jobs.js","networking.js")
foreach ($f in $js) {
    if (Test-Path $f) {
        Move-Item $f "frontend\scripts\" -Force
        Write-Host ("  moved " + $f + " to frontend/scripts/")
    }
}

# --- 6. Flag files that need a manual decision ---
if (Test-Path "new.html") {
    Write-Host ""
    Write-Host "NOTE: new.html was left in place. It looked like a possible test or leftover file. Move or delete it manually." -ForegroundColor Magenta
}

Write-Host ""
Write-Host "Reorganization complete!" -ForegroundColor Green
Write-Host "Backend folders were left untouched: config, controllers, db, middleware, routes, server.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS - the site will be broken until you do these:" -ForegroundColor Yellow
Write-Host "  1. In every moved HTML file, fix stylesheet and script paths."
Write-Host "     Example: href equals admin.css should become href equals ../styles/admin.css"
Write-Host "     Example: src equals admin.js should become src equals ../scripts/admin.js"
Write-Host "  2. Update server.js so it serves the frontend folder as static files."
Write-Host "  3. Test every page in the browser and check the console for 404 errors."
