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
          mermaid.default.initialize({
            theme: 'base',
            themeVariables: {
              background: '#ffffff',
              primaryColor: '#333333',
              primaryBorderColor: '#555555',
              primaryTextColor: '#111111',
              lineColor: '#999999',
              secondaryColor: '#f0f0f0',
              tertiaryColor: '#f8f8f8',
              clusterBkg: '#f5f5f5',
              clusterBorder: '#cccccc',
              edgeLabelBackground: '#ffffff',
              nodeBorder: '#555555',
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
