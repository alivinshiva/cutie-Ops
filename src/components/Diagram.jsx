import { useEffect, useRef } from 'react';

export default function Diagram({ definition }) {
  const ref = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await import('mermaid');
        if (!initialized.current) {
          const isLight = document.documentElement.classList.contains('light') || document.documentElement.classList.contains('reader');
          mermaid.default.initialize({
            theme: 'base',
            themeVariables: {
              background: isLight ? '#ffffff' : '#1a1a1a',
              primaryColor: isLight ? '#e8e8e8' : '#333333',
              primaryBorderColor: isLight ? '#999999' : '#666666',
              primaryTextColor: isLight ? '#111111' : '#f5f5f5',
              lineColor: isLight ? '#666666' : '#999999',
              secondaryColor: isLight ? '#f5f5f5' : '#2a2a2a',
              tertiaryColor: isLight ? '#fafafa' : '#222222',
              clusterBkg: isLight ? '#f0f0f0' : '#1a1a1a',
              clusterBorder: isLight ? '#cccccc' : '#444444',
              edgeLabelBackground: isLight ? '#ffffff' : '#1a1a1a',
              nodeBorder: isLight ? '#888888' : '#666666',
            },
            flowchart: { useMaxWidth: true, htmlLabels: true },
            sequence: { useMaxWidth: true },
          });
          initialized.current = true;
        }
        if (!cancelled && ref.current) {
          ref.current.innerHTML = '';
          await mermaid.default.run({
            nodes: [ref.current],
            suppressErrors: true,
          });
        }
      } catch (e) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<div style="padding:1rem;color:#666;text-align:center">Diagram could not be rendered</div>`;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [definition]);

  return (
    <div className="mermaid" ref={ref}>
      {definition}
    </div>
  );
}
