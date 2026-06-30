import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Network, Terminal, Cpu, Container, Shield, BarChart, Lock, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { weekNames, weeks } from '../utils/weeks';


const weekIcons = {
  0: BookOpen,
  1: Terminal,
  2: Network,
  3: Cpu,
  4: Cpu,
  5: Container,
  6: Container,
  7: Shield,
  8: BarChart,
  9: Lock,
  10: Target,
  11: BarChart,
  12: Target,
};

export default function Sidebar({ structure, isOpen, onClose }) {
  const [expanded, setExpanded] = useState({});

  const toggleWeek = (num) => {
    setExpanded((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const labsForWeek = (num) => {
    const prefix = num === 0 ? '00' : String(num).padStart(2, '0');
    return (structure || []).filter((item) => item.path.startsWith(`${prefix}-`));
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`;

  const subLinkClass = ({ isActive }) =>
    `sidebar-link text-sm ${isActive ? 'active' : ''}`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-surface border-r border-border z-50 transform transition-transform duration-300 overflow-y-auto lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-surface z-10 border-b border-border">
          <div className="flex items-center justify-between px-4 h-16">
            <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-surface font-bold text-sm">CO</span>
              </div>
              <div>
                <span className="font-semibold text-content">Cutie Ops</span>
                <p className="text-xs text-content-muted">DevOps Prep Plan</p>
              </div>
            </NavLink>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <NavLink to="/" end className={linkClass} onClick={onClose}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>

          <div className="pt-4 pb-2">
            <p className="nav-section-title">Weekly Plan</p>
          </div>

          {weeks.map((num) => {
            const Icon = weekIcons[num] || BookOpen;
            const labs = labsForWeek(num);
            const isExpanded = expanded[num];
            const isPrereq = num === 0;

            return (
              <div key={num}>
                <NavLink
                  to={isPrereq ? '#' : `/week/${num}`}
                  className={linkClass}
                  onClick={(e) => {
                    if (isPrereq || labs.length > 0) {
                      e.preventDefault();
                      toggleWeek(num);
                    }
                    onClose?.();
                  }}
                >
                  <Icon size={18} />
                  <span className="flex-1 truncate">
                    {isPrereq ? (
                      weekNames[num]
                    ) : (
                      <>
                        <span className="text-content-muted font-normal mr-1.5">W{num}</span>
                        {weekNames[num]}
                      </>
                    )}
                  </span>
                  {labs.length > 0 && (
                    <span onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleWeek(num); }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </NavLink>

                {isExpanded && labs.length > 0 && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                    {labs.map((lab) => (
                      <NavLink
                        key={lab.path}
                        to={`/lab/${lab.path.replace('.md', '')}`}
                        className={subLinkClass}
                        onClick={onClose}
                      >
                        <span className="truncate">{(lab.name || lab.path.split('/').pop()).replace('.md', '')}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
