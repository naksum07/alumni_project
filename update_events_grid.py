import re

with open('frontend/pages/events.html', 'r', encoding='utf-8') as f:
    events_html = f.read()

events_html = events_html.replace('lg:grid-cols-3 gap-8', 'lg:grid-cols-4 gap-6')
with open('frontend/pages/events.html', 'w', encoding='utf-8') as f:
    f.write(events_html)
