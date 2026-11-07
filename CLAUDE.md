# BAKE Studio: notes for Claude

- Read `ARCHITECTURE.md` first. Source is in `studio/` (React + Vite + Tailwind); the repo main folder holds the BUILT site that GitHub Pages serves at https://deltaowleyes.ca/bake-studio/.
- Templates and generated pages (`studio/src/lib/render.js`, `site.css`) stay plain HTML/CSS: previews are screenshots. Use React/Tailwind for the studio UI only.
- The owner is not a developer. Explain in plain language with links, and offer BAKE / COPY BAKE buttons for next steps.

## Publishing (the owner never publishes; Claude does)
1. Push the current `main` to a backup branch first (for example `backup-YYYY-MM-DD-what`).
2. `cd studio && npm install && npm run build` (writes `index.html`, `assets/`, `.nojekyll` into the repo main folder).
3. Test in headless Chrome (all five steps, no console errors) before pushing.
4. Commit source + build together and push straight to `main`. If publishing fails, give the owner BAKE buttons to retry.
