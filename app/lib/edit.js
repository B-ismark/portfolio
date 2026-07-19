// In-browser content editing — attribute helpers.
//
// The editor is a DEV-ONLY overlay. These helpers stamp `data-edit*` markers on
// the elements the overlay makes editable. In a production build
// (`next build` / `output: export`) EDIT_ENABLED is false, every helper returns
// null, and `{...null}` spreads to nothing — so the shipped HTML carries no
// editing markers and the live site is untouched.

export const EDIT_ENABLED = process.env.NODE_ENV === 'development';

const attr = (name, path) =>
  EDIT_ENABLED && path ? { [name]: path } : null;

// Editable inline text. `path` is a dotted/bracketed path into content.json,
// e.g. "hero.title", "clients[0].description", "work.weaver.sections[2].body".
export const ed = (path) => attr('data-edit', path);

// Swappable image. `path` points at the src string in content.json.
export const edImg = (path) => attr('data-edit-img', path);

// Editable alt text for an image (paired with edImg on the same element).
export const edAlt = (path) => attr('data-edit-alt', path);

// Editable link URL. `path` points at the href string in content.json.
export const edHref = (path) => attr('data-edit-href', path);
