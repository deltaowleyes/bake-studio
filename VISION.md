# BAKE: vision

BAKE is growing from a design studio into a home on the web for everyone, in the spirit of GeoCities but built for today. Anyone can design a site and publish it free. Indigenous people and communities get their own free hub. Experts, called **Bakers**, show their work and get hired. PRO clients get their own domain, AI images and Baker help. This file is the business plan the code is built toward. `ARCHITECTURE.md` describes what exists today, and `ROADMAP.md` lists every task.

Updated 2026-11-07.

## 1. The four domains

All four are registered at **Porkbun**.

| Domain | What lives there | Example address |
|---|---|---|
| **bakeaweb.com** | The home of BAKE: the studio, the home page, accounts, the Baker marketplace, the admin control room | `bakeaweb.com` |
| **bakedby.me** | Free **EXPRESS** sites | `bakedby.me/pagename` |
| **indigihub.cloud** | Free sites for Indigenous people, businesses and communities (**IndigiHub**) | `indigihub.cloud/pagename` |
| **bakedbya.pro** | **BAKER** portfolios: examples of each Baker's work, built in the studio | `bakedbya.pro/bakername` |

PRO sites live on the client's own domain (a new one bought through Porkbun, or one they already own).

Addresses use a path (`/pagename`), not a subdomain (`pagename.bakedby.me`). A path works with GitHub Pages today at no cost; subdomains would need an extra service in front.

## 2. The versions

| Version | Who it's for | Where it's published | Price | What's included |
|---|---|---|---|---|
| **EXPRESS** | Anyone | `bakedby.me/pagename` | Free | The full studio, all templates, one-click publish, a small *Baked with BAKE* badge |
| **IndigiHub** | Indigenous people, businesses, Nations and organizations (a free form of EXPRESS) | `indigihub.cloud/pagename` | Free | Everything in EXPRESS, Indigenous language and syllabics support, a listing in the IndigiHub directory |
| **BAKER** | Bakers (the experts) | `bakedbya.pro/bakername` | Free | Portfolio pieces built in the studio, a public profile, reviews, bidding on tasks |
| **PRO** | Clients who want more | Their own domain | One-time fee (§5) | Everything in EXPRESS plus own domain, AI image generation, the Baker marketplace, no badge, more visitor stats |

Everyone starts free and can upgrade to PRO at any time.

## 3. Accounts
- A client signs up with a **pagename** (like a username), a **title** and a **description**.
- One pagename is unique across all four domains. It names the client's address, their email address and their code repository.
- Roles: **client**, **Baker**, **administrator**. The **escrow specialist** and the **IndigiHub reviewer** are administrator roles.
- Reserved words (admin, www, api, brand names) and pagenames that impersonate others are blocked.

### IndigiHub eligibility
- The owner states their Nation or community (**self-declared**), and an administrator **reviews** the page before it goes live.
- Every IndigiHub page has a *Report a concern* link, and decisions can be appealed.
- No status cards or personal documents are asked for.
- An Indigenous advisory circle should shape the review rules, the directory and how cultural content is handled.

## 4. Build it yourself
- Clients build their site in the studio (the five steps in `ARCHITECTURE.md`) and publish to their version's address.

## 5. Publishing and prices

| What | Price | How |
|---|---|---|
| EXPRESS on `bakedby.me/pagename` | Free | Automatic |
| IndigiHub on `indigihub.cloud/pagename` | Free | Automatic after review |
| BAKER portfolio on `bakedbya.pro/bakername` | Free | Automatic |
| **PRO** upgrade | $25–$500 one-time, depending on the template's tier | Stripe Checkout; republishing is free |
| PRO + a new domain | +$50 plus the domain's price | Registered through Porkbun in the client's name, then pointed at the site |
| PRO + the client's existing domain | +$100 | Guided steps for the client's registrar, checked live; an administrator helps by screen-share if needed |

**Costs that recur** (recommended, for the owner to confirm): a domain must be renewed every year, so renewals are charged **at cost** each year with reminders. AI images cost money each time they're made, so each PRO tier includes a set number of **AI image credits**, with top-up packs.

## 6. Get help: the Baker marketplace
1. At any point, the client describes what they want. That becomes a **task**.
2. Bakers **bid** with a price, a delivery time and a message. A **$0 quote** is allowed, so new Bakers can earn feedback.
3. The client and the Baker agree on an **approval window**: how long the client has to check the finished work.
4. The client accepts a quote and **pays**. The money is held in **escrow**.
5. The Baker delivers. The client approves the work, asks for a revision, or opens a dispute.
6. Approval releases the money to the Baker, minus the **10% platform fee**.
7. **Disputes:** an escrow specialist reviews the messages, the versions and the brief. Then they release, split or refund the money.
8. **Public feedback is required** from the client for every task, so others can choose Bakers with good information.
9. With the client's permission, finished work can appear in the Baker's portfolio on bakedbya.pro.

## 7. Community (the GeoCities spirit)
- **Neighbourhoods and Discover:** browse sites by topic and region, with a Site of the week.
- **Webrings, guestbooks and visitor counters:** optional, moderated, fun.
- **Remix a design:** start from a site's design with the owner's permission and credit.
- **Baked with BAKE** and **Baked by** credits link every site back to BAKE and to its Baker, so each site brings in new visitors.

## 8. Operations
- The goal is automation everywhere. A specialist is always on call, so any manual step happens almost instantly.
- Free hosting needs **trust and safety** from day one: a content policy, automatic checks before publishing, a report link on every site, and fast takedowns.

## 9. Design notes and risks (recommended on 2026-11-07, for the owner to decide)
These keep the vision intact while staying within the rules of the services it depends on. Prices were checked on 2026-11-07 and can change.

### Hosting
- **GitHub Pages rules:** GitHub says Pages is not meant to be a free web host for running an online business or e-commerce site. It allows one organization site (and so one custom domain) per GitHub organization, 1 GB per site, and a soft limit of 100 GB of traffic a month. A few hundred community and small-business sites are likely fine. A hosting platform for thousands of sites, including paid PRO sites, is exactly what that rule is about, and one bad site could get a whole organization suspended.
- **Recommendation (BAKE Host):** start on GitHub Pages with one organization per domain (bakedbyme, indigihub, bakedbyapro, plus a PRO organization), and plan the move to **Cloudflare** before a public launch. Cloudflare can serve every site from storage with no traffic charges for static files, and **Cloudflare for SaaS** connects PRO clients' own domains: 100 are free, then about $0.10 a month each. The domains stay registered at Porkbun; only their DNS would move. Decide this in the *BAKE Host* roadmap task.

### Names
- **An "IndigiHub" already exists in Canada:** a platform for Indigenous entrepreneurs, founded in Manitoba, which won a Manitoba Tech Award in 2026. Using the same name for a similar audience risks confusion and a trademark dispute. Check with a trademark lawyer before launch. Partnering with them could also be a real opportunity.
- Check **BAKE**, **Bake a Web**, **Baked by me** and **Baked by a pro** in the Canadian trademark database too. "Baked" is also slang for cannabis in North America; worth knowing when choosing slogans.

### Money
- **One-time pricing and recurring costs:** domain renewals, AI images and (later) hosting cost money every month or year. One-time PRO fees work if renewals are charged at cost and AI use is limited by credits (see §5).
- **Card fees:** Stripe charges about 2.9% + 30¢ per Canadian card payment, plus 0.8% for cards from outside Canada. On a $25 PRO fee that's about $1.03.
- **Escrow:** Stripe Connect can hold funds before paying them out, but only for a limited time (90 days). Holding other people's money can also carry legal duties. Check with an accountant or lawyer in Canada before launch.
- **AI images:** OpenAI now bills images by size and quality, from under a cent to about 20¢ each. Track the real cost, and set a monthly spending alert.

### Accounts, email and code
- **Email:** don't share one Gmail login between the administrator and the client. Google doesn't allow software to create Gmail accounts, and a shared password means no clear owner. Instead, give each client `pagename@` one of our domains (forwarding to their real email, with an admin copy, or a mailbox on Google Workspace or Zoho). Administrators get their own admin access.
- **GitHub:** GitHub's terms require a human to create each account. They also allow only one free account per person and don't allow a login to be shared. Instead, create **one repository per pagename inside a BAKE GitHub organization**, using a GitHub App. A client who wants their code can have the repository transferred to them.

### Domains
- **Porkbun:** its API can check prices, register domains and set DNS records. It pays from prepaid account credit, and a single API registration is capped at $100. Register each domain in the client's name, so the client owns it.
- **Existing domains:** rather than an administrator logging into the client's registrar with the client's password, show guided steps for the client's registrar and check the DNS live. Keep the administrator as the fallback, using screen-share, so passwords are never handed over.

### Laws in Canada (for a lawyer to confirm)
- Privacy (**PIPEDA**), anti-spam rules for email (**CASL**), and the **Copyright Act's notice-and-notice** system for complaints about hosted content. The *Terms and policies* task drafts pages for a lawyer to review.
