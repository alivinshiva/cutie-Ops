import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchContent, fetchStructure } from '../utils/api';
import MarkdownContent from '../components/MarkdownContent';
import { ArrowLeft, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function LabPage() {
  const { path } = useParams();
  const decodedPath = decodeURIComponent(path) + '.md';
  const [content, setContent] = useState('');
  const [prev, setPrev] = useState(null);
  const [next, setNext] = useState(null);
  const [weekNum, setWeekNum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchContent(decodedPath),
      fetchStructure(),
    ])
      .then(([data, struct]) => {
        setContent(data.content || '');

        const match = decodedPath.match(/^(\d+)/);
        setWeekNum(match ? parseInt(match[1]) : null);

        const items = (struct.tree || []).filter(
          (f) => f.type === 'blob' && f.path.endsWith('.md') && !f.path.includes('problems-faced')
        );

        const idx = items.findIndex((f) => f.path === decodedPath);
        if (idx > 0) setPrev(items[idx - 1]);
        if (idx >= 0 && idx < items.length - 1) setNext(items[idx + 1]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [path]);

  const name = decodedPath
    .replace('.md', '')
    .replace(/^\d+-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-content-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-content-muted">
        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
        {weekNum && (
          <>
            <span>/</span>
            <Link to={`/week/${weekNum}`} className="hover:text-accent transition-colors">Week {weekNum}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-content truncate max-w-[200px]">{name}</span>
      </div>

      {/* Back to week */}
      {weekNum && (
        <Link
          to={`/week/${weekNum}`}
          className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Week {weekNum}
        </Link>
      )}

      {/* Title */}
      <div className="flex items-start gap-3">
        <FileText size={20} className="text-accent mt-1 shrink-0" />
        <h1 className="text-2xl font-bold text-content">{name}</h1>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
        <MarkdownContent content={content} />
      </div>

      {/* Prev/Next navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          {prev && (
            <Link
              to={`/lab/${encodeURIComponent(prev.path.replace('.md', ''))}`}
              className="flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="truncate max-w-[200px]">{prev.name.replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' ')}</span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              to={`/lab/${encodeURIComponent(next.path.replace('.md', ''))}`}
              className="flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors group"
            >
              <span className="truncate max-w-[200px]">{next.name.replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' ')}</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
