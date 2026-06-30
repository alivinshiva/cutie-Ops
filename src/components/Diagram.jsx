import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const MERMAID_PALETTES = {
  light: {
    background: '#ffffff', primaryColor: '#e8e8e8', primaryBorderColor: '#999999',
    primaryTextColor: '#111111', lineColor: '#666666', secondaryColor: '#f5f5f5',
    tertiaryColor: '#fafafa', clusterBkg: '#f0f0f0', clusterBorder: '#cccccc',
    edgeLabelBackground: '#ffffff', nodeBorder: '#888888',
  },
  dark: {
    background: '#1a1a1a', primaryColor: '#333333', primaryBorderColor: '#666666',
    primaryTextColor: '#f5f5f5', lineColor: '#999999', secondaryColor: '#2a2a2a',
    tertiaryColor: '#222222', clusterBkg: '#1a1a1a', clusterBorder: '#444444',
    edgeLabelBackground: '#1a1a1a', nodeBorder: '#666666',
  },
  // Catppuccin Macchiato
  macchiato: {
    background: '#1e2030', primaryColor: '#363a4f', primaryBorderColor: '#8087a2',
    primaryTextColor: '#cad3f5', lineColor: '#a5adcb', secondaryColor: '#494d64',
    tertiaryColor: '#24273a', clusterBkg: '#1e2030', clusterBorder: '#494d64',
    edgeLabelBackground: '#1e2030', nodeBorder: '#8087a2',
  },
};

export default function Diagram({ definition }) {
  const ref = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await import('mermaid');
        const palette =
          theme === 'macchiato' ? MERMAID_PALETTES.macchiato
          : theme === 'light' || theme === 'reader' ? MERMAID_PALETTES.light
          : MERMAID_PALETTES.dark;
        mermaid.default.initialize({
          theme: 'base',
          themeVariables: palette,
          flowchart: { useMaxWidth: true, htmlLabels: true },
          sequence: { useMaxWidth: true },
        });
        if (!cancelled && ref.current) {
          // Restore the source so re-renders (e.g. theme switch) work after
          // mermaid has replaced the node contents with an SVG.
          ref.current.textContent = definition;
          ref.current.removeAttribute('data-processed');
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
  }, [definition, theme]);

  return (
    <div className="mermaid" ref={ref}>
      {definition}
    </div>
  );
}
