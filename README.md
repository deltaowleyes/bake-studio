# BAKE Studio

A website design studio. Live: https://deltaowleyes.ca/bake-studio/

## The five steps
1. **Your site**: import an existing website by its address (or paste its page code), including its other pages, every image, story and video rows, and podcasts. Or start fresh from a starter.
2. **Brand**: logo, hero image and illustrations from generated SVG artwork, your own uploads, AI images, or images found on your site. Plus colours and fonts.
3. **Sections**: pick a page, then add, delete, reorder and fully edit every section and its items (including any image from your site), with a live preview. Section types include video galleries, podcasts and page headers.
4. **Menu**: menu links and groups, and a separate menu style for desktop, tablet and phone.
5. **Templates**: 24 templates, filtered to the ones that fit your sections and menu. Previews are full-page screenshots (desktop, tablet, phone), not live page code. Preview any page of your site in any template. Pick one and request development with notes for changes.

Progress is saved in the browser for now. Supabase (logins, saved projects, change requests, and OpenAI images through a secure function) comes next.

## Files
- `index.html`: the studio page
- `css/studio.css`: studio look; `css/site.css`: the generated website's look (also used in downloads)
- `js/art.js`: palettes, fonts and SVG artwork
- `js/importer.js`: reads an existing site
- `js/render.js`: builds pages, menus and templates
- `js/shot.js`: turns pages into full-page screenshots
- `js/app.js`: the five steps
