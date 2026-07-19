'use client';

// DEV-ONLY in-browser content editor.
//
// Mounted only when NODE_ENV === 'development' (see layout.js). It turns every
// element carrying a data-edit* marker into an editable surface, then POSTs the
// changes to the local save-server (tools/edit-server.mjs on :4000), which
// writes them back into app/content.json. Nothing here ships to production.

import { useCallback, useEffect, useRef, useState } from 'react';

// 127.0.0.1, not "localhost": on Windows the browser resolves localhost to IPv6
// (::1) first, but the save-server binds IPv4 — so "localhost" would fail to
// connect. Hitting 127.0.0.1 directly matches the server's bind.
const SERVER = 'http://127.0.0.1:4000';
const INK = '#17130f';
const ACCENT = '#ffd166';

export default function EditLayer() {
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [serverUp, setServerUp] = useState(null); // null = unknown
  const [toast, setToast] = useState('');
  const [menu, setMenu] = useState(null);

  const dirty = useRef(new Map()); // path -> new value
  const onRef = useRef(false);
  onRef.current = on;

  const flash = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(''), 3200);
  }, []);

  // ping the save-server so the toolbar can show whether it's reachable
  useEffect(() => {
    let live = true;
    fetch(`${SERVER}/ping`)
      .then((r) => live && setServerUp(r.ok))
      .catch(() => live && setServerUp(false));
    return () => {
      live = false;
    };
  }, []);

  // ---- DOM event handlers (stable) -----------------------------------------
  const onInput = useCallback((e) => {
    const el = e.target.closest?.('[data-edit]');
    if (!el || el.contentEditable === 'inherit') return;
    dirty.current.set(el.getAttribute('data-edit'), el.innerText.replace(/\s+$/g, ''));
    setCount(dirty.current.size);
  }, []);

  const openImage = useCallback((el) => {
    setMenu({
      kind: 'img',
      el,
      path: el.getAttribute('data-edit-img'),
      altPath: el.getAttribute('data-edit-alt') || null,
      src: el.getAttribute('src') || '',
      alt: el.getAttribute('alt') || '',
      rect: el.getBoundingClientRect(),
    });
  }, []);

  const openHref = useCallback((el) => {
    setMenu({
      kind: 'href',
      el,
      path: el.getAttribute('data-edit-href'),
      href: el.getAttribute('href') || '',
      rect: el.getBoundingClientRect(),
    });
  }, []);

  const onClick = useCallback(
    (e) => {
      if (!onRef.current) return;
      const img = e.target.closest?.('[data-edit-img]');
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        openImage(img);
        return;
      }
      const hrefEl = e.target.closest?.('[data-edit-href]');
      if (hrefEl) {
        e.preventDefault();
        e.stopPropagation();
        openHref(hrefEl);
        return;
      }
      // any other link: stay on the page so edits aren't lost (caret still lands)
      if (e.target.closest?.('a')) e.preventDefault();
    },
    [openImage, openHref]
  );

  const onKey = useCallback((e) => {
    if (e.key === 'Escape') setMenu(null);
  }, []);

  // ---- enable / disable editing --------------------------------------------
  useEffect(() => {
    if (!on) return;
    document.body.classList.add('edit-mode');
    const els = Array.from(document.querySelectorAll('[data-edit]'));
    els.forEach((el) => {
      try {
        el.contentEditable = 'plaintext-only';
      } catch {
        el.contentEditable = 'true';
      }
      el.spellcheck = false;
    });
    document.addEventListener('input', onInput, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.body.classList.remove('edit-mode');
      els.forEach((el) => {
        el.contentEditable = 'inherit';
      });
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      setMenu(null);
    };
  }, [on, onInput, onClick, onKey]);

  // ---- actions -------------------------------------------------------------
  const applyImage = useCallback(
    ({ url, alt }) => {
      const m = menu;
      if (!m) return;
      if (url && url !== m.src) {
        m.el.src = url;
        dirty.current.set(m.path, url);
      }
      if (m.altPath && alt != null && alt !== m.alt) {
        m.el.alt = alt;
        dirty.current.set(m.altPath, alt);
      }
      setCount(dirty.current.size);
      setMenu(null);
    },
    [menu]
  );

  const applyHref = useCallback(
    (url) => {
      const m = menu;
      if (!m) return;
      if (url && url !== m.href) {
        m.el.setAttribute('href', url);
        dirty.current.set(m.path, url);
        setCount(dirty.current.size);
      }
      setMenu(null);
    },
    [menu]
  );

  const upload = useCallback(
    async (file) => {
      const dataUrl = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
      const r = await fetch(`${SERVER}/upload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: file.name, dataUrl }),
      });
      if (!r.ok) throw new Error(`upload failed (HTTP ${r.status})`);
      const { path } = await r.json();
      return path;
    },
    []
  );

  const save = useCallback(async () => {
    const patches = Array.from(dirty.current.entries()).map(([path, value]) => ({
      path,
      value,
    }));
    if (!patches.length) return;
    setSaving(true);
    try {
      const r = await fetch(`${SERVER}/content`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ patches }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      dirty.current.clear();
      flash('Saved ✓ reloading…');
      window.setTimeout(() => window.location.reload(), 450);
    } catch (err) {
      setSaving(false);
      flash(`Save failed: ${err.message}. Is the edit-server running on :4000?`);
    }
  }, [flash]);

  const discard = useCallback(() => {
    if (!dirty.current.size) {
      setOn(false);
      return;
    }
    if (window.confirm('Discard all unsaved changes?')) {
      dirty.current.clear();
      window.location.reload();
    }
  }, []);

  // never render in a production build (belt-and-braces alongside layout guard)
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <style>{CSS}</style>

      <div style={S.bar}>
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          style={{ ...S.btn, ...(on ? S.btnOn : null) }}
          title="Toggle in-browser editing"
        >
          {on ? '● Editing' : '✎ Edit'}
        </button>

        {on && (
          <>
            <span style={S.count}>{count} change{count === 1 ? '' : 's'}</span>
            <button
              type="button"
              onClick={save}
              disabled={saving || count === 0}
              style={{ ...S.btn, ...S.save, ...(saving || count === 0 ? S.dim : null) }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={discard} style={{ ...S.btn, ...S.ghost }}>
              Discard
            </button>
          </>
        )}

        <span
          style={{
            ...S.dot,
            background:
              serverUp === null ? '#bbb' : serverUp ? '#3fb950' : '#e5534b',
          }}
          title={
            serverUp === null
              ? 'checking save-server…'
              : serverUp
                ? 'save-server connected (:4000)'
                : 'save-server offline — run: npm run edit-server'
          }
        />
      </div>

      {toast && <div style={S.toast}>{toast}</div>}

      {menu?.kind === 'img' && (
        <ImageMenu menu={menu} onApply={applyImage} onClose={() => setMenu(null)} onUpload={upload} onError={flash} />
      )}
      {menu?.kind === 'href' && (
        <HrefMenu menu={menu} onApply={applyHref} onClose={() => setMenu(null)} />
      )}
    </>
  );
}

// ---- image popover ---------------------------------------------------------
function ImageMenu({ menu, onApply, onClose, onUpload, onError }) {
  const [url, setUrl] = useState(menu.src);
  const [alt, setAlt] = useState(menu.alt);
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const path = await onUpload(file);
      setUrl(path);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover rect={menu.rect} onClose={onClose} title="Image">
      <label style={S.field}>
        <span style={S.lab}>Upload new</span>
        <input type="file" accept="image/*" onChange={pick} disabled={busy} style={S.file} />
      </label>
      <label style={S.field}>
        <span style={S.lab}>Path {busy ? '(uploading…)' : ''}</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} style={S.input} spellCheck={false} />
      </label>
      {menu.altPath && (
        <label style={S.field}>
          <span style={S.lab}>Alt text</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} style={S.input} />
        </label>
      )}
      <div style={S.row}>
        <button type="button" style={{ ...S.btn, ...S.ghost }} onClick={onClose}>Cancel</button>
        <button type="button" style={{ ...S.btn, ...S.save }} onClick={() => onApply({ url, alt })}>
          Apply
        </button>
      </div>
    </Popover>
  );
}

// ---- link URL popover ------------------------------------------------------
function HrefMenu({ menu, onApply, onClose }) {
  const [url, setUrl] = useState(menu.href);
  return (
    <Popover rect={menu.rect} onClose={onClose} title="Link URL">
      <label style={S.field}>
        <span style={S.lab}>URL</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={S.input}
          spellCheck={false}
          autoFocus
        />
      </label>
      <div style={S.row}>
        <button type="button" style={{ ...S.btn, ...S.ghost }} onClick={onClose}>Cancel</button>
        <button type="button" style={{ ...S.btn, ...S.save }} onClick={() => onApply(url)}>Apply</button>
      </div>
    </Popover>
  );
}

// ---- generic anchored popover ----------------------------------------------
function Popover({ rect, onClose, title, children }) {
  const W = 300;
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - W - 12));
  const top = Math.min(rect.bottom + 8, window.innerHeight - 220);
  return (
    <>
      <div style={S.scrim} onClick={onClose} />
      <div style={{ ...S.pop, left, top, width: W }}>
        <div style={S.popTitle}>{title}</div>
        {children}
      </div>
    </>
  );
}

// ---- styles ----------------------------------------------------------------
const S = {
  bar: {
    // bottom-LEFT so it stays clear of the scroll-to-top button (bottom-right)
    // and the sticky nav (top). Dev-only overlay; never ships.
    position: 'fixed', bottom: 16, left: 16, zIndex: 100000,
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 999,
    background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
    border: `1px solid rgba(23,19,15,.12)`, boxShadow: '0 6px 24px rgba(23,19,15,.14)',
    font: '600 13px/1 ui-sans-serif, system-ui, sans-serif', color: INK,
  },
  btn: {
    // longhand border props (not the `border` shorthand) so the btnOn/save
    // overrides below can change only borderColor without React warning about
    // mixing shorthand + non-shorthand on rerender
    appearance: 'none', borderWidth: '1px', borderStyle: 'solid',
    borderColor: 'rgba(23,19,15,.16)', cursor: 'pointer',
    padding: '7px 12px', borderRadius: 999, background: '#fff', color: INK,
    font: 'inherit', lineHeight: 1,
  },
  btnOn: { background: ACCENT, borderColor: 'rgba(23,19,15,.28)' },
  save: { background: INK, color: '#fff', borderColor: INK },
  ghost: { background: 'transparent' },
  dim: { opacity: 0.45, cursor: 'not-allowed' },
  count: { font: '500 12px/1 ui-sans-serif, system-ui', color: 'rgba(23,19,15,.6)' },
  dot: { width: 9, height: 9, borderRadius: 999, display: 'inline-block' },
  toast: {
    position: 'fixed', bottom: 68, left: 16, zIndex: 100000, maxWidth: 340,
    padding: '10px 14px', borderRadius: 12, background: INK, color: '#fff',
    font: '500 13px/1.4 ui-sans-serif, system-ui', boxShadow: '0 6px 24px rgba(0,0,0,.2)',
  },
  scrim: { position: 'fixed', inset: 0, zIndex: 99998, background: 'transparent' },
  pop: {
    position: 'fixed', zIndex: 100001, padding: 14, borderRadius: 14,
    background: '#fff', border: '1px solid rgba(23,19,15,.14)',
    boxShadow: '0 10px 40px rgba(23,19,15,.22)', color: INK,
    font: '500 13px/1.4 ui-sans-serif, system-ui, sans-serif',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  popTitle: { font: '700 12px/1 ui-sans-serif', letterSpacing: '.04em', textTransform: 'uppercase', color: 'rgba(23,19,15,.55)' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  lab: { font: '600 11px/1 ui-sans-serif', color: 'rgba(23,19,15,.6)' },
  input: { padding: '8px 10px', borderRadius: 9, border: '1px solid rgba(23,19,15,.2)', font: '400 13px/1.3 ui-monospace, monospace', color: INK, width: '100%', boxSizing: 'border-box' },
  file: { font: '400 12px/1 ui-sans-serif' },
  row: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2 },
};

const CSS = `
body.edit-mode [data-edit]{outline:1px dashed rgba(23,19,15,.28);outline-offset:3px;border-radius:3px;cursor:text!important}
body.edit-mode [data-edit]:hover{background:rgba(255,209,102,.18)}
body.edit-mode [data-edit]:focus{outline:2px solid ${INK};background:rgba(255,209,102,.14)}
body.edit-mode [data-edit-img]{outline:2px dashed rgba(23,19,15,.4);outline-offset:3px;cursor:zoom-in!important}
body.edit-mode [data-edit-href]{outline:1px dashed rgba(23,19,15,.4);outline-offset:3px}
`;
