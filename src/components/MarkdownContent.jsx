import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import Diagram from './Diagram';

export default function MarkdownContent({ content, className = '' }) {
  const [copied, setCopied] = useState(null);

  const processed = useMemo(() => {
    if (!content) return '';
    let text = content;

    text = text.replace(/---[\s\S]*?---/, '');

    text = text.replace(/```mermaid\s*\n([\s\S]*?)```/g, (_, def) => {
      const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
      return `<div class="mermaid-placeholder" data-mermaid-id="${id}" data-definition="${encodeURIComponent(def)}"></div>`;
    });

    return text;
  }, [content]);

  const renderDiagram = (def) => {
    try {
      return <Diagram key={def} definition={decodeURIComponent(def)} />;
    } catch {
      return null;
    }
  };

  const segments = useMemo(() => {
    if (!processed) return [];
    const parts = processed.split(/(<div class="mermaid-placeholder"[\s\S]*?><\/div>)/g);
    return parts.map((part, i) => {
      const match = part.match(/data-definition="([^"]+)"/);
      if (match) {
        return { type: 'mermaid', def: match[1], key: i };
      }
      return { type: 'md', text: part, key: i };
    });
  }, [processed]);

  if (!content) {
    return (
      <div className="flex items-center justify-center py-20 text-content-muted">
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className={`prose max-w-none ${className}`}>
      {segments.map((seg) => {
        if (seg.type === 'mermaid') {
          return <div key={seg.key}>{renderDiagram(seg.def)}</div>;
        }
        return (
          <ReactMarkdown
            key={seg.key}
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isInline = !className;
                const codeStr = String(children).replace(/\n$/, '');

                if (isInline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }

                const isCommandBlock = codeStr.includes('$ ') || codeStr.includes('# ');
                const lines = codeStr.split('\n');
                const hasOutput = lines.some((l) => !l.startsWith('$ ') && !l.startsWith('# ') && l.trim() && lines.indexOf(l) > 0);

                if (isCommandBlock) {
                  return (
                    <div className="command-block not-prose my-4">
                      <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border border-border rounded-t-xl border-b-0">
                        <span className="text-xs font-medium text-content-muted">Terminal</span>
                        <button
                          className="copy-btn relative opacity-100 p-1.5 rounded-lg hover:bg-surface text-content-muted hover:text-content"
                          onClick={() => {
                            const cmds = lines.filter((l) => l.startsWith('$ ') || l.startsWith('# ')).map((l) => l.replace(/^[#$] /, '')).join('\n');
                            navigator.clipboard.writeText(cmds);
                            setCopied(`cmd-${codeStr}`);
                            setTimeout(() => setCopied(null), 2000);
                          }}
                        >
                          {copied === `cmd-${codeStr}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="bg-code-bg border border-border rounded-b-xl p-4 font-mono text-sm leading-relaxed overflow-x-auto">
                        {lines.map((line, i) => {
                          if (line.startsWith('$ ')) {
                            return (
                              <div key={i} className="flex gap-2">
                                <span className="text-accent shrink-0 select-none">$</span>
                                <span className="text-content">{line.slice(2)}</span>
                              </div>
                            );
                          }
                          if (line.startsWith('# ')) {
                            return (
                              <div key={i} className="flex gap-2">
                                <span className="text-amber-500 shrink-0 select-none">#</span>
                                <span className="text-content-secondary italic">{line.slice(2)}</span>
                              </div>
                            );
                          }
                          if (line.trim()) {
                            return (
                              <div key={i} className="text-content-secondary pl-0">
                                {line}
                              </div>
                            );
                          }
                          return <div key={i} className="h-2" />;
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="not-prose relative group my-4">
                    <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border border-border rounded-t-xl border-b-0">
                      <span className="text-xs font-medium text-content-muted">Code</span>
                      <button
                        className="p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-surface transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(codeStr);
                          setCopied(`code-${codeStr.slice(0, 20)}`);
                          setTimeout(() => setCopied(null), 2000);
                        }}
                      >
                        {copied === `code-${codeStr.slice(0, 20)}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre className="!mt-0 !rounded-t-none !border-t-0">
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  </div>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse">{children}</table>
                  </div>
                );
              },
              a({ href, children }) {
                const isExternal = href?.startsWith('http');
                return (
                  <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
                    {children}
                  </a>
                );
              },
            }}
          >
            {seg.text}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
