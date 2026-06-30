import { useState, useEffect, useMemo } from 'react';

function headingId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function TopicNav({ content }) {
  const [activeId, setActiveId] = useState('');

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

  useEffect(() => {
    if (topics.length === 0) return;
    const ids = topics.map(t => t.id);
    const observers = [];
    const handleIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      }
    };
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observers.push(el);
      }
    }
    return () => {
      for (const el of observers) observer.unobserve(el);
    };
  }, [topics]);

  if (topics.length === 0) return null;

  return (
    <nav className="sticky top-24 w-48 shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="text-xs font-semibold uppercase tracking-wider text-content-muted mb-4">
        On this page
      </div>
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-0">
          {topics.map((topic) => {
            const isActive = activeId === topic.id;
            return (
              <li key={topic.id}>
                <a
                  href={`#${topic.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(topic.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`flex items-start gap-3 py-1.5 group transition-colors ${
                    isActive ? 'text-content' : 'text-content-muted hover:text-content'
                  }`}
                >
                  <span className="relative flex items-center justify-center shrink-0 mt-1">
                    <span
                      className={`block w-[15px] h-[15px] rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-accent bg-accent'
                          : 'border-border bg-surface group-hover:border-content-muted'
                      }`}
                    />
                  </span>
                  <span className={`text-xs leading-snug transition-colors ${
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
    </nav>
  );
}
