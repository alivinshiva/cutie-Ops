import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

function headingId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function TopicNav({ content }) {
  // progress is a fractional index (0 .. topics.length-1) of the reading position
  const [progress, setProgress] = useState(0);
  const [fillPx, setFillPx] = useState(0);
  const circleRefs = useRef([]);
  const wrapRef = useRef(null);
  const rafRef = useRef(0);

  const topics = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const result = [];
    for (const line of lines) {
      const m = line.match(/^##\s+(.+)/);
      if (m) {
        const text = m[1].trim();
        const id = headingId(text);
        result.push({ text, id });
      }
    }
    return result;
  }, [content]);

  // Compute the continuous reading position and the pixel height the accent
  // line should fill, interpolating between heading anchors as the user scrolls.
  const compute = useCallback(() => {
    const n = topics.length;
    if (n === 0) return;
    // Reading reference line, just below the sticky 56px header.
    const referenceY = 140;
    const tops = topics.map((t) => {
      const el = document.getElementById(t.id);
      return el ? el.getBoundingClientRect().top : Infinity;
    });

    let idx = -1;
    for (let i = 0; i < n; i++) {
      if (tops[i] - referenceY <= 0) idx = i;
    }

    let frac;
    if (idx < 0) frac = 0;
    else if (idx >= n - 1) frac = n - 1;
    else {
      const span = tops[idx + 1] - tops[idx];
      const t = span > 0 ? (referenceY - tops[idx]) / span : 0;
      frac = idx + Math.min(1, Math.max(0, t));
    }
    setProgress(frac);

    // Map the fractional index onto the timeline by interpolating between the
    // measured circle centers, so the fill stops exactly at the reading point.
    const wrap = wrapRef.current;
    const circles = circleRefs.current;
    if (wrap && circles[0]) {
      const wrapTop = wrap.getBoundingClientRect().top;
      const centerOf = (i) => {
        const c = circles[i];
        if (!c) return 0;
        const r = c.getBoundingClientRect();
        return r.top + r.height / 2 - wrapTop;
      };
      const lo = Math.floor(frac);
      const hi = Math.min(lo + 1, n - 1);
      const t = frac - lo;
      setFillPx(centerOf(lo) + (centerOf(hi) - centerOf(lo)) * t);
    }
  }, [topics]);

  useEffect(() => {
    if (topics.length === 0) return;
    circleRefs.current.length = topics.length;

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        compute();
      });
    };

    // Let the content lay out before the first measurement.
    const id = setTimeout(compute, 50);
    // capture:true so we catch scroll from the inner <main> container too.
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(id);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [topics, compute]);

  if (topics.length === 0) return null;

  const activeIndex = Math.round(progress);

  return (
    <nav className="fixed right-0 top-14 bottom-0 w-[25vw] max-w-72 bg-surface/95 z-20 flex flex-col overflow-y-auto">
      <div className="mt-auto mb-auto p-5 w-full">
        <div className="text-sm font-semibold uppercase tracking-wider text-content-muted mb-5">
          On this page
        </div>
        <div className="relative" ref={wrapRef}>
          {/* Background track */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
          {/* Filled progress that grows with scroll */}
          <div
            className="absolute left-[9px] top-2 w-px bg-accent transition-[height] duration-150 ease-out"
            style={{ height: Math.max(0, fillPx - 8) }}
          />
        <ul className="space-y-1">
          {topics.map((topic, i) => {
            const reached = i <= progress + 0.001;
            const isActive = i === activeIndex;
            return (
              <li key={topic.id}>
                <a
                  href={`#${topic.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(topic.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`flex items-start gap-3 py-2 group transition-colors ${
                    reached ? 'text-content' : 'text-content-muted hover:text-content'
                  }`}
                >
                  <span
                    ref={(el) => { circleRefs.current[i] = el; }}
                    className="relative flex items-center justify-center shrink-0 mt-0.5"
                  >
                    <span
                      className={`block w-[19px] h-[19px] rounded-full border-2 transition-all duration-150 ${
                        reached
                          ? 'border-accent bg-accent'
                          : 'border-border bg-surface group-hover:border-content-muted'
                      }`}
                    />
                  </span>
                  <span className={`text-sm leading-snug transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {topic.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </nav>
  );
}
