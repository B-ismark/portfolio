'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ed } from '../lib/edit';

// A shelf of favourite books. Each is a typographic cover — blue impression +
// misregistered pink plate — that OPENS like a hardcover: the cover swings back
// on its spine, then a run of pages RIFFLES past before settling on the page
// with the favourite line.
//
// The opening is POSITIONED like the real book. `folio / pages` places the
// quote in the volume, and that drives everything: how many pages riffle (a
// deeper quote = a longer flip) and the page-edge thickness on each side (read
// pages stack left, remaining pages stack right). "One must imagine Sisyphus
// happy" is the last line of its essay — folio === pages — so it opens right to
// the back, no pages left on the right.
//
// The page reads like real book text, but everything except the favourite line
// is BLURRED greeked filler; the line alone is in focus and the pink highlighter
// swipes it as the book lands — the line that stuck.
//
// Gated like every signature move: it lives under `.book.is-enhanced`, added
// only when JS is on AND motion is allowed. No-JS / reduced-motion get the flat
// printed card — cover + page + highlighted line in one frame, nothing hidden.

// Fallback greeked filler, only used if a book ships no real surrounding text.
// The lines are BLURRED on the page, so believable English beats Latin here —
// each book carries its own `contextTop` / `contextBottom` in the content.
const FAUX_TOP = [
  'and the room was quiet enough to hear the page turn,',
  'the sentence waiting there the way true ones do,',
  'plain on the paper and heavier than its length.',
];
const FAUX_BOTTOM = [
  'He read it twice, then let the book fall closed,',
  'the line already lodged somewhere it would keep.',
];
const MAX_LEAVES = 5;

const positionOf = (b) =>
  b.pages ? Math.min(1, Math.max(0, b.folio / b.pages)) : 0.5;
const leavesOf = (b) => Math.max(1, Math.round(positionOf(b) * MAX_LEAVES));

export default function Bookshelf({ books, editBase }) {
  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useState(() => books.map(() => false));

  const cardRefs = useRef([]);
  const tlRefs = useRef([]);
  const sticky = useRef(books.map(() => false));

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnhanced(true);
  }, []);

  useEffect(() => {
    if (!enhanced) return;
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cover = card.querySelector('.book-cover');
        const leaves = card.querySelectorAll('.book-leaf');
        const shadow = card.querySelector('.book-shadow');
        const lines = card.querySelectorAll('.book-line');
        const pull = card.querySelectorAll('.book-quote-mark, .book-quote');
        const mark = card.querySelector('.book-mark');
        const meta = card.querySelector('.book-runhead');

        gsap.set(cover, { transformOrigin: 'left center' });
        gsap.set(leaves, { transformOrigin: 'left center', rotationY: 0 });
        gsap.set(lines, { autoAlpha: 0, y: 12 });
        gsap.set(pull, { autoAlpha: 0, y: 14 });
        if (mark) gsap.set(mark, { backgroundSize: '0% 100%' });
        if (meta) gsap.set(meta, { autoAlpha: 0 });
        if (shadow) gsap.set(shadow, { autoAlpha: 0 });

        const n = leaves.length;
        const RIFFLE = 0.14; // when the pages start turning
        const STAGGER = 0.06;
        const FLIP = 0.32;
        const lastLeaf = RIFFLE + Math.max(0, n - 1) * STAGGER;
        const reveal = lastLeaf + FLIP * 0.4;

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.inOut' },
        });

        // cover swings open on the spine
        tl.to(cover, { rotationY: -165, duration: 0.44 }, 0);

        // hard ink gutter shade — peaks as things lift, clears for a flat page
        if (shadow)
          tl.to(shadow, { autoAlpha: 1, duration: 0.2 }, 0.05).to(
            shadow,
            { autoAlpha: 0, duration: 0.4 },
            lastLeaf
          );

        // the riffle — each page turns on the spine, staggered; a deeper quote
        // ships more leaves, so the flip runs longer the further in it sits
        if (n)
          tl.to(
            leaves,
            {
              rotationY: -172,
              duration: FLIP,
              ease: 'power2.inOut',
              stagger: STAGGER,
            },
            RIFFLE
          );

        // the page settles: running head, then the (blurred) text, then the line
        if (meta) tl.to(meta, { autoAlpha: 1, duration: 0.35 }, reveal - 0.1);
        tl.to(
          lines,
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
          reveal
        );
        tl.to(
          pull,
          { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out' },
          reveal + 0.08
        );
        if (mark)
          tl.fromTo(
            mark,
            { backgroundSize: '0% 100%' },
            { backgroundSize: '100% 100%', duration: 0.5, ease: 'power2.out' },
            reveal + 0.2
          );

        tlRefs.current[i] = tl.timeScale(1.4);
      });
    });
    return () => ctx.revert();
  }, [enhanced]);

  const onEnter = (i) => {
    if (!sticky.current[i]) tlRefs.current[i]?.play();
  };
  const onLeave = (i) => {
    if (!sticky.current[i]) tlRefs.current[i]?.reverse();
  };
  const onClick = (i) => {
    const next = !sticky.current[i];
    sticky.current[i] = next;
    setOpen((o) => o.map((v, j) => (j === i ? next : v)));
    next ? tlRefs.current[i]?.play() : tlRefs.current[i]?.reverse();
  };

  return (
    <ul className="shelf" role="list">
      {books.map((b, i) => {
        const pos = positionOf(b);
        const inner = (
          <span className="book-inner" style={{ '--pos': pos }}>
            <span className="book-covers" aria-hidden={enhanced || undefined}>
              <span className="book-cover">
                <span className="book-coverface">
                  <span className="book-spine" aria-hidden="true" />
                  <span className="book-cover-copy">
                    <span
                      className="book-title"
                      data-text={b.title}
                      {...ed(`${editBase}[${i}].title`)}
                    >
                      {b.title}
                    </span>
                    <span
                      className="book-author"
                      {...ed(`${editBase}[${i}].author`)}
                    >
                      {b.author}
                    </span>
                  </span>
                  <span className="book-cue" aria-hidden="true">
                    Favourite line →
                  </span>
                </span>
              </span>
            </span>

            {enhanced && (
              <span className="book-leaves" aria-hidden="true">
                {Array.from({ length: leavesOf(b) }).map((_, k) => (
                  <span className="book-leaf" key={k} />
                ))}
              </span>
            )}
            {enhanced && <span className="book-shadow" aria-hidden="true" />}

            <span
              className="book-page"
              aria-hidden={enhanced && !open[i] ? true : undefined}
            >
              <span className="book-edge book-edge--l" aria-hidden="true" />
              <span className="book-edge book-edge--r" aria-hidden="true" />
              <span className="book-runhead" aria-hidden="true">
                <span className="book-runhead-title">{b.title}</span>
                <span className="book-folio">
                  p. {b.folio} / {b.pages}
                </span>
              </span>
              <span className="book-body">
                <span className="book-fauxset" aria-hidden="true">
                  {(b.contextTop?.length ? b.contextTop : FAUX_TOP).map((t, k) => (
                    <span className="book-line" key={`t${k}`}>
                      {t}
                    </span>
                  ))}
                </span>
                <span className="book-pull">
                  <span className="book-quote-mark" aria-hidden="true">
                    &ldquo;
                  </span>
                  <span className="book-quote" {...ed(`${editBase}[${i}].quote`)}>
                    <span className="book-mark">{b.quote}</span>
                  </span>
                  <span className="book-pull-author">— {b.author}</span>
                </span>
                {(b.contextBottom ?? FAUX_BOTTOM).length > 0 && (
                  <span className="book-fauxset" aria-hidden="true">
                    {(b.contextBottom ?? FAUX_BOTTOM).map((t, k) => (
                      <span className="book-line" key={`b${k}`}>
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </span>
          </span>
        );

        return (
          <li
            key={b.title}
            ref={(el) => (cardRefs.current[i] = el)}
            className={`book${enhanced ? ' is-enhanced' : ''}${
              open[i] ? ' is-open' : ''
            }`}
            data-book
          >
            {enhanced ? (
              <button
                type="button"
                className="book-flip"
                aria-expanded={open[i]}
                aria-label={`Favourite line from ${b.title} by ${b.author}`}
                onClick={() => onClick(i)}
                onMouseEnter={() => onEnter(i)}
                onMouseLeave={() => onLeave(i)}
              >
                {inner}
              </button>
            ) : (
              <div className="book-flip">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
