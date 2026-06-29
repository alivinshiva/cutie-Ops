import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
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
