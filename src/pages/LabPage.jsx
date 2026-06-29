import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchContent, fetchStructure } from '../utils/api';
import MarkdownContent from '../components/MarkdownContent';
import ErrorBoundary from '../components/ErrorBoundary';
import { ArrowLeft, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function LabPage() {
  const location = useLocation();
  const pathname = location.pathname.replace(/^\/lab\//, '').replace(/\/$/, '');
  const decodedPath = decodeURIComponent(pathname) + '.md';
  const [content, setContent] = useState('');
  const [prev, setPrev] = useState(null);
  const [next, setNext] = useState(null);
  const [weekNum, setWeekNum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
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
      .catch((err) => {
        setError(err.message || 'Failed to load content');
        setContent('');
      })
      .finally(() => setLoading(false));
  }, [location.pathname]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-content-muted flex items-center justify-center mb-4">
          <span className="text-surface font-bold text-lg">!</span>
        </div>
        <h2 className="text-lg font-semibold text-content mb-2">Failed to load lesson</h2>
        <p className="text-sm text-content-muted max-w-md mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-content text-surface text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Reload page
        </button>
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
        <ErrorBoundary>
          <MarkdownContent content={content} />
        </ErrorBoundary>
      </div>

      {/* Prev/Next navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          {prev && (
            <Link
                  to={`/lab/${prev.path.replace('.md', '')}`}
              className="flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="truncate max-w-[200px]">{(prev.name || prev.path.split('/').pop()).replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' ')}</span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              to={`/lab/${next.path.replace('.md', '')}`}
              className="flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors group"
            >
              <span className="truncate max-w-[200px]">{(next.name || next.path.split('/').pop()).replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' ')}</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
