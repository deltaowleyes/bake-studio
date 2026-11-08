# BAKE Studio: notes for Claude

- Read `ARCHITECTURE.md` first. Source is in `studio/` (React + Vite + Tailwind); the repo main folder holds the BUILT site that GitHub Pages serves at https://bakeaweb.com/ (the old https://deltaowleyes.ca/bake-studio/ forwards there).
- Templates and generated pages (`studio/src/lib/render.js`, `site.css`) stay plain HTML/CSS: PRO previews are screenshots, EXPRESS/IndigiHub/BAKER preview the live page (`LivePreview.jsx`), and `lib/site.js` makes the published files. Use React/Tailwind for the studio UI only.
- BAKE's plan is in `VISION.md`: bakeaweb.com (the studio's new home), bakedby.me (free EXPRESS sites), indigihub.cloud (free IndigiHub sites), bakedbya.pro (BAKER portfolios), PRO on clients' own domains. All four domains are at Porkbun. The repo main folder has a `CNAME` file containing `bakeaweb.com` (that is what puts the studio there); the build scripts leave it alone, so never delete it.
- The roadmap (BAKE PRO) is `ROADMAP.json`; after editing it, run `node studio/scripts/roadmap.mjs` to rewrite `ROADMAP.md`.
- The owner is not a developer. Explain in plain language with links, and offer BAKE / COPY BAKE buttons for next steps.

## Publishing (the owner never publishes; Claude does)
1. Push the current `main` to a backup branch first (for example `backup-YYYY-MM-DD-what`).
2. `cd studio && npm install && npm run build` (writes `index.html`, `assets/`, `.nojekyll` into the repo main folder).
3. Test in headless Chrome (all five steps, no console errors) before pushing.
4. Commit source + build together and push straight to `main`. If publishing fails, give the owner BAKE buttons to retry.
