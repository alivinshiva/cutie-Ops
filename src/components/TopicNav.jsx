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
    const els = [];
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
        els.push(el);
      }
    }
    return () => {
      for (const el of els) observer.unobserve(el);
    };
  }, [topics]);

  if (topics.length === 0) return null;

  return (
    <nav className="fixed right-0 top-14 bottom-0 w-[25vw] max-w-72 bg-surface/95 z-20 flex flex-col overflow-y-auto">
      <div className="mt-auto mb-auto p-5 w-full">
        <div className="text-sm font-semibold uppercase tracking-wider text-content-muted mb-5">
          On this page
        </div>
        <ul className="space-y-1">
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
                  className={`flex items-start gap-3 py-2 group transition-colors ${
                    isActive ? 'text-content' : 'text-content-muted hover:text-content'
                  }`}
                >
                  <span className="relative flex items-center justify-center shrink-0 mt-0.5">
                    <span
                      className={`block w-[19px] h-[19px] rounded-full border-2 transition-all ${
                        isActive
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
    </nav>
  );
}
