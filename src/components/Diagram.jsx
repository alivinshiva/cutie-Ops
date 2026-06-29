import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  theme: 'default',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryBorderColor: '#4f46e5',
    primaryTextColor: '#1e293b',
    lineColor: '#94a3b8',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#f8fafc',
  },
  flowchart: { useMaxWidth: true, htmlLabels: true },
  sequence: { useMaxWidth: true },
});

export default function Diagram({ definition }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      mermaid.run({
        nodes: [ref.current],
        suppressErrors: true,
      });
    }
  }, [definition]);

  return (
    <div className="mermaid" ref={ref}>
      {definition}
    </div>
  );
}
