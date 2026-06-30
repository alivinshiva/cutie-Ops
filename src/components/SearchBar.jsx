import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Hash, CalendarDays, CornerDownLeft } from 'lucide-react';
import { fetchSearchIndex } from '../utils/api';
import { weekNames } from '../utils/weeks';

// Fetch the index once and share the promise across every open of the palette.
let indexPromise = null;
function getIndex() {
  if (!indexPromise) indexPromise = fetchSearchIndex();
  return indexPromise;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function buildResults(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const chapters = [];
  const topics = [];
  const weeksMatched = [];

  // Weeks
  for (const [num, name] of Object.entries(weekNames)) {
    if (
      name.toLowerCase().includes(q) ||
      `week ${num}`.includes(q) ||
      `w${num}` === q
    ) {
      weeksMatched.push({
        type: 'week',
        title: `Week ${num}`,
        sub: name,
        to: `/week/${num}`,
        key: `week-${num}`,
      });
    }
  }

  // Chapters + topics
  for (const doc of index.docs || []) {
    if (doc.title.toLowerCase().includes(q)) {
      chapters.push({
        type: 'chapter',
        title: doc.title,
        sub: doc.week != null ? `Week ${doc.week}` : '',
        to: `/lab/${doc.slug}`,
        key: doc.path,
      });
    }
    for (const h of doc.headings || []) {
      if (h.text.toLowerCase().includes(q)) {
        topics.push({
          type: 'topic',
          title: h.text,
          sub: doc.title,
          to: `/lab/${doc.slug}#${h.id}`,
          key: `${doc.path}#${h.id}`,
        });
      }
    }
  }

  return [
    ...chapters.slice(0, 8),
    ...topics.slice(0, 30),
    ...weeksMatched.slice(0, 5),
  ];
}

const typeMeta = {
  chapter: { icon: FileText, label: 'Chapter' },
  topic: { icon: Hash, label: 'Topic' },
  week: { icon: CalendarDays, label: 'Week' },
};

export default function SearchBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Global ⌘K / Ctrl+K shortcut.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lazily load the index the first time the palette opens.
  useEffect(() => {
    if (!open || index) return;
    setLoading(true);
    getIndex()
      .then((data) => setIndex(data))
      .catch(() => setIndex({ docs: [] }))
      .finally(() => setLoading(false));
  }, [open, index]);

  // Focus the input and reset state when opening.
  useEffect(() => {
    if (open) {
      setActive(0);
      const id = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(id);
    }
    setQuery('');
  }, [open]);

  const results = useMemo(
    () => (index ? buildResults(index, query) : []),
    [index, query]
  );

  useEffect(() => setActive(0), [query]);

  const go = useCallback(
    (item) => {
      if (!item) return;
      setOpen(false);
      navigate(item.to);
    },
    [navigate]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  // Keep the active item scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <>
      {/* Header trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{ backgroundColor: 'var(--color-surface-secondary)' }}
        className="flex items-center gap-2 w-full max-w-md px-3 py-1.5 rounded-lg border border-border text-content-muted hover:text-content hover:border-accent/60 transition-colors text-sm"
      >
        <Search size={16} className="shrink-0" />
        <span className="flex-1 text-left truncate">Search topics, chapters…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border text-[10px] font-medium text-content-muted">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>

      {/* Palette overlay */}
      {open && (
        <div
          style={{ backgroundColor: 'var(--color-overlay)' }}
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh] backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            style={{ backgroundColor: 'var(--color-card)' }}
            className="w-full max-w-xl border border-border rounded-2xl shadow-2xl ring-1 ring-accent/25 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search size={18} className="text-content-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search topics, chapters, weeks…"
                className="flex-1 bg-transparent py-4 text-content placeholder:text-content-muted outline-none text-base"
              />
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded border border-border text-[10px] text-content-muted">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
              {loading && (
                <div className="px-3 py-8 text-center text-sm text-content-muted">
                  Building search index…
                </div>
              )}

              {!loading && query.trim() && results.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-content-muted">
                  No results for “{query.trim()}”
                </div>
              )}

              {!loading && !query.trim() && (
                <div className="px-3 py-8 text-center text-sm text-content-muted">
                  Search across {index?.docs?.length || ''} chapters and their topics.
                </div>
              )}

              {results.map((item, i) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                const isActive = i === active;
                return (
                  <button
                    key={item.key}
                    data-idx={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-accent text-surface' : 'text-content hover:bg-accent-light'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`shrink-0 ${isActive ? 'text-surface' : 'text-content-muted'}`}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      {item.sub && (
                        <span
                          className={`block truncate text-xs ${
                            isActive ? 'text-surface/80' : 'text-content-muted'
                          }`}
                        >
                          {meta.label}
                          {item.sub ? ` · ${item.sub}` : ''}
                        </span>
                      )}
                    </span>
                    {isActive && <CornerDownLeft size={14} className="shrink-0 opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
