# BAKE Studio

A website design studio. Live: https://deltaowleyes.ca/bake-studio/

## The five steps
1. **Your site**: import an existing website by its address (or paste its page code), or start fresh from a starter.
2. **Brand**: logo, hero image and illustrations from generated SVG artwork, your own uploads, AI images, or images found on your site. Plus colours and fonts.
3. **Sections**: add, delete, reorder and fully edit every section and its items, with a live preview.
4. **Menu**: menu links and groups, and a separate menu style for desktop, tablet and phone.
5. **Templates**: 24 templates, filtered to the ones that fit your sections and menu. Preview, pick, save notes for changes, and download the page as HTML.

Progress is saved in the browser for now. Supabase (logins, saved projects, change requests, and OpenAI images through a secure function) comes next.

## Files
- `index.html`: the studio page
- `css/studio.css`: studio look; `css/site.css`: the generated website's look (also used in downloads)
- `js/art.js`: palettes, fonts and SVG artwork
- `js/importer.js`: reads an existing site
- `js/render.js`: builds pages, menus and templates
- `js/app.js`: the five steps
