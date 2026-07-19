// Single source of truth for site copy. The data lives in content.json so the
// in-browser editor (dev only) can read and write it cleanly; this module is a
// thin wrapper that re-exports it plus the few non-data bits (liveStatuses).
// Authorial notes that used to sit inline here now live in docs/content-notes.md.
//
// Text is used verbatim from portfolio-content.md — styling and structure live
// in the components.

import data from './content.json';

export const site = data.site;
export const hero = data.hero;
export const clients = data.clients;
export const products = data.products;
export const explorationProjects = data.explorationProjects;
export const explorations = data.explorations;
export const about = data.about;
export const work = data.work;

// Statuses that read as "in motion" get a quiet accent dot.
export const liveStatuses = new Set(['Live', 'Ongoing']);
