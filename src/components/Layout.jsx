import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { fetchStructure } from '../utils/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [structure, setStructure] = useState([]);

  useEffect(() => {
    fetchStructure()
      .then((data) => {
        const items = data.tree?.filter(
          (f) => f.type === 'blob' && f.path.endsWith('.md') && !f.path.includes('problems-faced')
        ) || [];
        setStructure(items);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar structure={structure} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-surface-secondary text-content-muted hover:text-content transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-border py-4 px-6">
          <p className="text-xs text-content-muted text-center">
            Cutie Ops — DevOps Preparation Plan. MIT License.
          </p>
        </footer>
      </div>
    </div>
  );
}
