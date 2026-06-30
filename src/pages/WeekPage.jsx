import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWeekPlan, fetchStructure } from '../utils/api';
import MarkdownContent from '../components/MarkdownContent';
import { ArrowLeft, FileText, BookOpen, Terminal, Network, Cpu, Container, Shield, BarChart, Lock, Target } from 'lucide-react';

const weekIcons = {
  1: Terminal, 2: Network, 3: Cpu, 4: Cpu, 5: Container,
  6: Container, 7: Shield, 8: BarChart, 9: Lock, 10: Target,
  11: BarChart, 12: Target,
};

const weekNames = {
  1: 'Core Foundations + Nginx',
  2: 'Networking + Cloud Basics',
  3: 'Terraform Basics',
  4: 'Terraform + AWS Project',
  5: 'Kubernetes Fundamentals',
  6: 'K8s Advanced + Helm',
  7: 'GitOps + CI/CD',
  8: 'Observability',
  9: 'DevSecOps',
  10: 'Final Polish',
  11: 'Advanced Cloud',
  12: 'Interview Preparation',
};

export default function WeekPage() {
  const { id } = useParams();
  const num = parseInt(id);
  const [plan, setPlan] = useState('');
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetchWeekPlan().then((d) => setPlan(d.content || '')).catch(() => {});
    fetchStructure().then((data) => {
      const items = data.tree?.filter(
        (f) => f.type === 'blob' && f.path.endsWith('.md') && f.path.startsWith(`${String(num).padStart(2, '0')}-`)
      ) || [];
      setLabs(items);
    }).catch(() => {});
  }, [num]);

  const weekPattern = new RegExp(`## Week ${num}[\\s\\S]*?(?=## Week ${num + 1}|$)`, 'i');
  const weekSection = plan.match(weekPattern)?.[0] || '';

  const Icon = weekIcons[num] || BookOpen;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors">
        <ArrowLeft size={16} />
        Back to overview
      </Link>

      {/* Week Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-content text-surface shrink-0">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-content-muted font-medium">Week {num}</p>
          <h1 className="text-2xl font-bold text-content">{weekNames[num] || `Week ${num}`}</h1>
        </div>
      </div>

      {/* Week Plan */}
      {weekSection && (
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <MarkdownContent content={weekSection} />
        </div>
      )}

      {/* Lab Guides */}
      {labs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-content mb-4">Hands-On Labs</h2>
          <div className="grid gap-3">
            {labs.map((lab) => {
              const name = (lab.name || lab.path.split('/').pop()).replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <Link
                  key={lab.path}
                  to={`/lab/${lab.path.replace('.md', '')}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-content-muted hover:bg-accent-light transition-all duration-200 group"
                >
                  <FileText size={18} className="text-content-muted group-hover:text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-content group-hover:text-accent transition-colors">{name}</p>
                    <p className="text-xs text-content-muted mt-0.5">{lab.path}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
