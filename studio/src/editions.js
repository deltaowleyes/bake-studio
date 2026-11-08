/* BAKE Studio versions (VISION.md §2). The studio is the same for all; these switches decide the preview
   and where a site is published. S.edition holds the choice; ?v=express|indigihub|baker|pro in the address sets it. */
export const EDITIONS = {
  express:   { name: 'EXPRESS',   blurb: 'Free. Publish to bakedby.me/yourname.',                      host: 'bakedby.me',      price: 'Free', live: true },
  indigihub: { name: 'IndigiHub', blurb: 'Free for Indigenous people and communities, after a review.', host: 'indigihub.cloud', price: 'Free', live: true },
  baker:     { name: 'BAKER',     blurb: 'For Bakers: portfolio pieces on bakedbya.pro/yourname.',     host: 'bakedbya.pro',    price: 'Free', live: true },
  pro:       { name: 'PRO',       blurb: 'Your own domain, AI images and Baker help. One-time fee.',  host: 'your own domain', price: '$25–$500 one-time', live: false }
};
export const EDITION_KEYS = Object.keys(EDITIONS);
export function edition(S) { return EDITIONS[S.edition] || EDITIONS.express; }
/** EXPRESS, IndigiHub and BAKER preview the real page; PRO previews screenshots. */
export function livePreview(S) { return edition(S).live; }
