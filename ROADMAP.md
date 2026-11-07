# BAKE PRO roadmap

Every idea for BAKE Studio, in one list. These are possible avenues, not a to-do list. The list itself lives in `ROADMAP.json` (edit that file and the BAKE PRO buttons update too); this page is made from it. Business plan: `VISION.md`. Updated 2026-11-07.

**Already done:** Drag-and-drop sections (Step 3); Inspector sidebar (Step 3); Google Fonts; Image editor with crop and border/frame controls.

**Top picks** are marked ★. **Plan first** means Claude shows a plan and costs and waits for an OK before building.

## Anytime: Studio improvements that need no accounts or services; do them whenever you like

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
| ★ | **Automatic testing robot**<br>A robot clicks through everything on every change. Essential once real money is involved. | Quality | Medium | — |
| ★ | **Undo, redo and history**<br>The safety net every pro editor has. Nobody fears experimenting. | Editing | Quick | — |
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

## Phase 1: Accounts and the first paid publish

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
| ★ | **Pagename accounts** (plan first)<br>Sign up with a pagename, title and description. The pagename becomes the client's address, email and repository name. | Accounts | Big | A free Supabase account |
|  | **Pagename email addresses** (plan first)<br>pagename@ourdomain for every client, without sharing a Gmail password. | Accounts | Medium | Our email domain set up for forwarding or Google Workspace |
|  | **A repository for every pagename** (plan first)<br>Each page gets its own GitHub repository in a BAKE organization, created automatically. | Accounts | Medium | A GitHub organization and a GitHub App |
| ★ | **Turn designs into real websites**<br>The engine behind every paid publish: the chosen template becomes a fast, real, standalone site. | Publishing | Big | — |
| ★ | **Publish to ourdomain/pagename** (plan first)<br>The first way to earn: a one-time fee of $25 to $500 depending on the template. | Publishing | Big | A Stripe account |
|  | **Price shown as you design** (plan first)<br>Clients always see what publishing will cost: template tier plus domain option. | Publishing | Quick | Your price list |
|  | **Terms and policies** (plan first)<br>Terms of service, expert agreement, escrow and refund policy, privacy policy. | Operations | Medium | A lawyer to review the drafts |

## Phase 2: Domains, server functions and sharing

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
|  | **New domain through Porkbun** (plan first)<br>For $50 more, search, buy and connect a brand-new domain in one flow. | Publishing | Medium | A Porkbun account with API access and prepaid credit |
|  | **Connect an existing domain** (plan first)<br>For $100 more: a guided, checked setup, with an admin by screen-share as backup. | Publishing | Medium | — |
|  | **Updates and rollback after launch**<br>Clients keep editing and republish anytime, and can undo a bad publish. | Publishing | Quick | — |
|  | **Import any website** (plan first)<br>Fixes most sites blocking imports, and blocked images in screenshots. | Studio | Medium | Supabase |
|  | **Real AI images** (plan first)<br>Turns the sample artwork tab into real generated logos, heroes and illustrations. | AI | Medium | An OpenAI account with billing, plus Supabase |
|  | **AI writing help on every field** (plan first)<br>Improve, shorten, make friendlier, fix spelling or translate any text. | AI | Medium | An AI server function (Supabase plus an API key) |
|  | **Shareable preview link** (plan first)<br>Send anyone a link to see the new site on every screen size. | Sharing | Medium | Supabase |
|  | **Pin comments on the preview** (plan first)<br>Click any spot and leave a note, like Figma comments. Great for client and expert feedback. | Sharing | Medium | Supabase |
|  | **Requests reach your inbox** (plan first)<br>Development requests arrive by email instead of staying in one browser. | Sharing | Medium | Supabase, plus a free email-sending account (like Resend) |
|  | **Requests that write the brief**<br>Every request or task arrives as a complete brief, so work starts with no back-and-forth. | Sharing | Medium | — |

## Phase 3: The expert marketplace, escrow and reviews

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
|  | **Expert profiles**<br>Experts show skills, portfolio, rates and reviews, so clients choose with confidence. | Accounts | Medium | — |
| ★ | **Ask for help from anywhere**<br>Click any part of the preview, describe what you want, and it becomes a task experts can bid on. | Marketplace | Medium | Accounts first |
|  | **AI task writer**<br>Turns a vague request into a clear brief and suggests a fair price range. | Marketplace | Quick | An AI server function |
|  | **Expert bidding**<br>Experts quote a price (even $0), a delivery time and an approval window. | Marketplace | Medium | — |
|  | **Task workspace**<br>Chat, files and a safe copy of the client's project for the expert to work on. | Marketplace | Big | — |
| ★ | **Escrow payments** (plan first)<br>The client pays when accepting a quote, and the money is held until they approve. | Payments | Big | A Stripe account, plus a quick check with an accountant or lawyer |
|  | **Fees, payouts and receipts**<br>Our 10% fee, expert payouts and clear receipts for everyone. | Payments | Medium | Escrow first |
|  | **Dispute centre**<br>An escrow specialist sees everything in one place and decides fairly. | Payments | Medium | — |
| ★ | **Required public reviews**<br>Every finished task gets a public review, so the marketplace earns trust. | Trust | Quick | — |
|  | **Expert reputation and badges**<br>Completion rate, on-time rate and badges like Rising expert for $0 starters. | Trust | Quick | — |
|  | **Safety and fraud protection**<br>Keeps payments on the platform and bad actors out. | Trust | Medium | — |

## Phase 4: Operations, automation and scale

| | Task | Area | Size | You'll need |
|---|---|---|---|---|
|  | **Admin control room**<br>Your dashboard for users, requests, tasks, escrow, disputes, domains and manual jobs. | Operations | Big | Accounts first |
|  | **On-call specialist queue**<br>Manual steps get done almost instantly, with alerts to the specialist on call. | Operations | Medium | — |
|  | **Automate the manual steps** (plan first)<br>Each manual job becomes automatic over time, with the specialist as backup. | Operations | Big | — |
|  | **Protect the templates** (plan first)<br>Moves page rendering to a server so nobody can copy your template code. | Operations | Big | Possibly a small paid server; plan first |
