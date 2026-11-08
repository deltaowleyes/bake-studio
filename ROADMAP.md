# BAKE PRO roadmap

Every idea for BAKE Studio, in one list. These are possible avenues, not a to-do list. The list itself lives in `ROADMAP.json` (edit that file and the BAKE PRO buttons update too); this page is made from it by `node studio/scripts/roadmap.mjs`. Business plan: `VISION.md`. Updated 2026-11-07. 68 tasks.

**Already done:** Drag-and-drop sections (Step 3); Inspector sidebar (Step 3); Google Fonts; Image editor with crop and border/frame controls; Versions: EXPRESS, IndigiHub and BAKER preview the live page with View code; PRO previews screenshots; Page files and clickable screenshot pages (lib/site.js).

**Top picks** are marked ★. **Plan first** means Claude shows a plan and costs and waits for an OK before building.

## Anytime: Studio improvements that need no accounts or services; do them whenever you like

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
| ★ | **Automatic testing robot**<br>A robot clicks through everything on every change. Essential once real money is involved. | Quality | Medium | — |
| ★ | **Undo, redo and history**<br>The safety net every pro editor has. Nobody fears experimenting. | Editing | Quick | — |
| ★ | **Free hosting live on bakedby.me, bakedbya.pro and indigihub.cloud**<br>Each free domain gets its home page and a working example site, so the hosting is real before accounts arrive. | Publishing | Quick | DNS at Porkbun for all 4 domains, and the 3 GitHub repositories (step-by-step guide) |
| ★ | **Move the studio to bakeaweb.com**<br>BAKE Studio's real home. The old deltaowleyes.ca/bake-studio address forwards there automatically. | Publishing | Quick | 4 A records and 1 CNAME added at Porkbun (step-by-step guide) |
|  | **bakeaweb.com home page**<br>The front door: what BAKE is, the four versions, prices, examples and a big Start baking button. | Sharing | Medium | — |
|  | **Edit text right on the preview**<br>Double-click a headline in the preview and type. Feels like magic. | Editing | Medium | — |
|  | **Drag and drop for pages, cards and menu links**<br>Sections can already be dragged; this brings it to everything else. | Editing | Quick | — |
|  | **Command palette**<br>Ctrl+K to jump anywhere or do anything. A power-user favourite. | Editing | Quick | — |
| ★ | **Site health check**<br>Scores the old site, then shows how much better the new design is. A built-in sales pitch. | AI | Medium | — |
|  | **Describe your business, get a site**<br>One or two sentences in, a complete draft site out. | AI | Medium | Works locally first; an AI server function later |
|  | **Colours from your logo**<br>Pick a logo and get palettes that match it, with contrast checked. | AI | Quick | — |
|  | **Mix and match templates**<br>Go beyond 24 templates: any section can borrow a style from any family. | Design | Medium | — |
|  | **Compare templates side by side**<br>Put 2 or 3 favourites next to each other and decide faster. | Design | Quick | — |
|  | **Dark mode and seasonal looks**<br>Every template gets a dark version, plus optional holiday accents. | Design | Medium | — |
|  | **More section types**<br>Events, team, FAQ, pricing, hours, map, logos strip, newsletter. | Design | Medium | — |
|  | **Three new template families**<br>Fresh looks that make the gallery feel endless. | Design | Big | — |
|  | **Presentation mode**<br>A full-window walkthrough for pitching a design in a meeting. | Sharing | Quick | — |
|  | **Studio works great on phones**<br>Design a site from the couch, not just the desk. | Quality | Medium | — |
|  | **Faster previews**<br>Thumbnails and screenshots that appear almost instantly. | Quality | Medium | — |
|  | **Guided tour and demo projects**<br>New visitors see the studio's power in one click. | Quality | Quick | — |
|  | **English and French**<br>A bilingual studio and bilingual sites for Canadian clients. | Quality | Medium | — |
|  | **Indigenous languages and syllabics**<br>Sites in Cree, Ojibwe, Inuktitut and more, with syllabics fonts that just work. | Quality | Medium | Indigenous language speakers to check the results |

## Phase 1: Accounts, free hosting and the first PRO publish

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
| ★ | **Pagename accounts** (plan first)<br>Sign up with a pagename, title and description. One pagename works across bakedby.me, indigihub.cloud and bakedbya.pro, and names the client's email and repository. | Accounts | Big | A free Supabase account |
|  | **Choose your version: EXPRESS, IndigiHub, BAKER or PRO**<br>The version picker is in the studio now. Next: tie the version to the account, show which features are PRO, and add Upgrade to PRO. | Accounts | Medium | Accounts first |
|  | **Pagename email addresses** (plan first)<br>pagename@bakedby.me (or another BAKE domain) for every client, without sharing a Gmail password. | Accounts | Medium | Email forwarding set up on one of our Porkbun domains |
|  | **A repository for every pagename** (plan first)<br>Each page gets its own GitHub repository in a BAKE organization, created automatically. | Accounts | Medium | A GitHub organization per hosting domain and a GitHub App |
| ★ | **Turn designs into real websites**<br>The engine behind every publish. Real page files already work (lib/site.js); next come image files, a favicon, a sitemap and testing on every template. | Publishing | Big | — |
| ★ | **BAKE Host: where every site lives** (plan first)<br>Decide now how thousands of free sites are hosted safely, before GitHub's rules or limits become a problem. | Publishing | Medium | Possibly a free Cloudflare account |
| ★ | **Free EXPRESS publish to bakedby.me/pagename** (plan first)<br>Anyone can put their site online free at bakedby.me/pagename in one click, with a small Baked with BAKE badge that brings in new visitors. | Publishing | Big | Accounts first (so a server function can publish safely) |
| ★ | **PRO upgrade and publish fee** (plan first)<br>The first way to earn: a one-time PRO fee of $25 to $500 depending on the template. | Publishing | Medium | A Stripe account |
| ★ | **IndigiHub free pages** (plan first)<br>Free sites for Indigenous people, businesses and communities on indigihub.cloud, with a respectful, trusted review. | Accounts | Medium | Indigenous advisors to shape the rules |
| ★ | **Names and trademarks check** (plan first)<br>An IndigiHub already exists in Canada; check every BAKE name before it's on thousands of sites. | Operations | Quick | A trademark lawyer for the final answer |
| ★ | **Trust and safety for free hosting** (plan first)<br>Free hosting attracts scammers. Keep them out, or GitHub or Cloudflare could take every BAKE site down with them. | Trust | Medium | — |
|  | **Price shown as you design** (plan first)<br>Clients always see what they'll pay: EXPRESS and IndigiHub are free; PRO shows the template's one-time fee plus any domain option. | Publishing | Quick | Your price list |
|  | **Terms and policies** (plan first)<br>Terms of service, Baker agreement, escrow and refund policy, privacy policy, content and takedown policy, IndigiHub rules. | Operations | Medium | A lawyer to review the drafts |

## Phase 2: PRO domains, server functions and sharing

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
|  | **New domain through Porkbun** (plan first)<br>PRO: for $50 more, search, buy and connect a brand-new domain in one flow. | Publishing | Medium | A Porkbun account with API access and prepaid credit |
|  | **Connect an existing domain** (plan first)<br>PRO: for $100 more, a guided, checked setup, with an admin by screen-share as backup. | Publishing | Medium | — |
|  | **BAKER portfolio sites on bakedbya.pro**<br>Every Baker gets bakedbya.pro/bakername: screenshots of their best work, with every menu and link clickable. | Accounts | Medium | Accounts and BAKE Host |
|  | **Domain renewals for PRO** (plan first)<br>Domains cost money every year. A one-time PRO fee can't cover that forever, so no client ever loses their domain by surprise. | Payments | Quick | Porkbun prepaid credit; Stripe |
|  | **Updates and rollback after launch**<br>Clients keep editing and republish anytime, and can undo a bad publish. | Publishing | Quick | — |
|  | **Import any website** (plan first)<br>Fixes most sites blocking imports, and blocked images in screenshots. | Studio | Medium | Supabase |
|  | **Real AI images** (plan first)<br>A PRO feature: turns the sample artwork tab into real generated logos, heroes and illustrations. | AI | Medium | An OpenAI account with billing, plus Supabase |
|  | **AI image credits for PRO** (plan first)<br>Keeps one-time PRO pricing sustainable: AI images cost us money every time they're made. | AI | Quick | An OpenAI account with billing |
|  | **AI writing help on every field** (plan first)<br>Improve, shorten, make friendlier, fix spelling or translate any text. | AI | Medium | An AI server function (Supabase plus an API key) |
|  | **Shareable preview link** (plan first)<br>Send anyone a link to see the new site on every screen size. | Sharing | Medium | Supabase |
|  | **Pin comments on the preview** (plan first)<br>Click any spot and leave a note, like Figma comments. Great for client and Baker feedback. | Sharing | Medium | Supabase |
|  | **Requests reach your inbox** (plan first)<br>Development requests arrive by email instead of staying in one browser. | Sharing | Medium | Supabase, plus a free email-sending account (like Resend) |
|  | **Requests that write the brief**<br>Every request or task arrives as a complete brief, so work starts with no back-and-forth. | Sharing | Medium | — |
|  | **Visitor stats for every site**<br>Owners see how many people visit, without creepy tracking or cookie banners. | Sharing | Medium | Possibly a free Cloudflare account |

## Phase 3: The Baker marketplace, escrow and reviews

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
|  | **Baker profiles**<br>Bakers show skills, rates, reviews and portfolio pieces hosted on bakedbya.pro, so clients choose with confidence. | Accounts | Medium | — |
| ★ | **Ask for help from anywhere**<br>Click any part of the preview, describe what you want, and it becomes a task Bakers can bid on. | Marketplace | Medium | Accounts first |
|  | **AI task writer**<br>Turns a vague request into a clear brief and suggests a fair price range. | Marketplace | Quick | An AI server function |
|  | **Baker bidding**<br>Bakers quote a price (even $0), a delivery time and an approval window. | Marketplace | Medium | — |
|  | **Task workspace**<br>Chat, files and a safe copy of the client's project for the Baker to work on. | Marketplace | Big | — |
| ★ | **Escrow payments** (plan first)<br>The client pays when accepting a quote, and the money is held until they approve. | Payments | Big | A Stripe account, plus a quick check with an accountant or lawyer |
|  | **Fees, payouts and receipts**<br>Our 10% fee, Baker payouts and clear receipts for everyone. | Payments | Medium | Escrow first |
|  | **Dispute centre**<br>An escrow specialist sees everything in one place and decides fairly. | Payments | Medium | — |
| ★ | **Required public reviews**<br>Every finished task gets a public review, so the marketplace earns trust. | Trust | Quick | — |
|  | **Baker reputation and badges**<br>Completion rate, on-time rate and badges like Rising Baker for $0 starters. | Trust | Quick | — |
|  | **Safety and fraud protection**<br>Keeps payments on the platform and bad actors out. | Trust | Medium | — |

## Phase 4: Operations, community and scale

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
|  | **Admin control room**<br>Your dashboard for users, IndigiHub reviews, reports, tasks, escrow, disputes, domains and manual jobs. | Operations | Big | Accounts first |
|  | **On-call specialist queue**<br>Manual steps get done almost instantly, with alerts to the specialist on call. | Operations | Medium | — |
|  | **Automate the manual steps** (plan first)<br>Each manual job becomes automatic over time, with the specialist as backup. | Operations | Big | — |
|  | **Protect the templates** (plan first)<br>Moves page rendering to a server so nobody can copy your template code. | Operations | Big | Possibly a small paid server; plan first |
|  | **Neighbourhoods and Discover**<br>GeoCities-style neighbourhoods for today: browse BAKE sites by topic and region, plus a Site of the week. | Community | Medium | Trust and safety first |
|  | **Webrings, guestbooks and visitor counters**<br>The fun of the old web: join a webring, sign a guestbook, watch your counter climb. Moderated, with no spam. | Community | Medium | Supabase |
|  | **Remix a design**<br>Love a site? Start your own from its design, with permission and credit. | Community | Quick | Accounts first |
|  | **Ready for a million sites**<br>Backups, monitoring and a status page, so growth never means downtime. | Operations | Medium | — |
