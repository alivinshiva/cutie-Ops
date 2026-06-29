import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, BookOpen } from 'lucide-react';

const themes = [
  { key: 'dark', icon: Moon, label: 'Dark mode' },
  { key: 'light', icon: Sun, label: 'Light mode' },
  { key: 'reader', icon: BookOpen, label: 'Reader mode' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-xl border border-border">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            title={t.label}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-sm'
                : 'text-content-muted hover:text-content hover:bg-accent-light'
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
