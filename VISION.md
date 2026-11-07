# BAKE Studio: vision

BAKE Studio is growing from a design studio into a marketplace. Clients design their own website, hire experts when they need help, and publish with one click. This file is the business plan the code is built toward. `ARCHITECTURE.md` describes what exists today.

## 1. Accounts
- A client signs up with a **pagename** (like a username), a **title** and a **description**.
- The pagename names everything that belongs to the client: their page address, their email address and their code repository.
- There are three roles: **client**, **expert** and **administrator**. The **escrow specialist** is an administrator role.

## 2. Build it yourself
- The client builds their page in the studio (the five steps in `ARCHITECTURE.md`).

## 3. Get help: the expert marketplace
1. At any point, the client describes what they want. That becomes a **task**.
2. Experts **bid** with a price, a delivery time and a message. A **$0 quote** is allowed, so new experts can earn feedback.
3. The client and the expert agree on an **approval window**: how long the client has to check the finished work.
4. The client accepts a quote and **pays**. The money is held in **escrow**.
5. The expert delivers. The client approves the work, asks for a revision, or opens a dispute.
6. Approval releases the money to the expert, minus the **10% platform fee**.
7. **Disputes:** an escrow specialist reviews the messages, the versions and the brief. Then they release, split or refund the money.
8. **Public feedback is required** from the client for every task, so others can choose experts with good information.

## 4. Publishing
| Option | Price | How |
|---|---|---|
| Our domain + `/pagename` | $25–$500 one-time, depending on the template originally chosen | Automatic |
| A new domain | +$50 | Registered through Porkbun, then pointed at the page |
| The client's existing domain | +$100 | The client's DNS is pointed at the page. For now an administrator does this by hand; later it's guided and checked automatically |

## 5. Operations
- The goal is automation everywhere. A specialist is always on call, so any manual step happens almost instantly.

## 6. Design notes (adjustments recommended on 2026-11-07, for the owner to decide)
These keep the vision intact while staying within the rules of the services it depends on.
- **Email:** don't share one Gmail login between the administrator and the client. Google doesn't allow software to create Gmail accounts, and a shared password means no clear owner. Instead, give each client `pagename@<our domain>` (forwarding to their real email, with an admin copy, or a mailbox on Google Workspace or Zoho). Administrators get their own admin access.
- **GitHub:** GitHub's terms require a human to create each account. They also allow only one free account per person and don't allow a login to be shared. Instead, create **one repository per pagename inside a BAKE GitHub organization**, using a GitHub App. A client who wants their code can have the repository transferred to them.
- **Escrow:** Stripe Connect can hold funds before paying them out, but only for a limited time (90 days). Holding other people's money can also carry legal duties. Check with an accountant or lawyer in Canada before launch.
- **Porkbun:** its API can check prices, register domains and set DNS records. It pays from prepaid account credit, and a single API registration is capped at $100. Register each domain in the client's name, so the client owns it.
- **Existing domains:** rather than an administrator logging into the client's registrar with the client's password, show guided steps for the client's registrar and check the DNS live. Keep the administrator as the fallback, using screen-share, so passwords are never handed over.
