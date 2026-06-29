import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchReadme, fetchWeekPlan } from '../utils/api';
import MarkdownContent from '../components/MarkdownContent';
import { BookOpen, Terminal, Network, Cpu, Container, Shield, BarChart, Lock, Target, Calendar } from 'lucide-react';

const weekData = [
  { num: 1, title: 'Core Foundations + Nginx', icon: Terminal },
  { num: 2, title: 'Networking + Cloud Basics', icon: Network },
  { num: 3, title: 'Terraform Basics', icon: Cpu },
  { num: 4, title: 'Terraform + AWS Project', icon: Cpu },
  { num: 5, title: 'Kubernetes Fundamentals', icon: Container },
  { num: 6, title: 'K8s Advanced + Helm', icon: Container },
  { num: 7, title: 'GitOps + CI/CD', icon: Shield },
  { num: 8, title: 'Observability', icon: BarChart },
  { num: 9, title: 'DevSecOps', icon: Lock },
  { num: 10, title: 'Final Polish', icon: Target },
];

export default function Home() {
  const [readme, setReadme] = useState('');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    fetchReadme().then((d) => setReadme(d.content || '')).catch(() => {});
    fetchWeekPlan().then((d) => setPlan(d.content || '')).catch(() => {});
  }, []);

  const extractOverview = (text) => {
    const match = text?.match(/## What to Prioritize[\s\S]*?(?=## )/);
    return match ? match[0] : '';
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-6">
          <span className="text-2xl font-bold text-surface">CO</span>
        </div>
        <h1 className="text-4xl font-bold text-content mb-3">Cutie Ops</h1>
        <p className="text-lg text-content-secondary max-w-2xl mx-auto">
          A focused, structured 8-10 week plan to become interview-ready for DevOps/SRE roles at top MNCs.
        </p>
      </div>

      {/* Weekly Grid */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={20} className="text-accent" />
          <h2 className="text-xl font-semibold text-content">10-Week Roadmap</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekData.map((w) => {
            const Icon = w.icon;
            return (
              <Link
                key={w.num}
                to={`/week/${w.num}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-content-muted transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-content text-surface">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-semibold text-content-muted bg-surface-secondary px-2 py-1 rounded-md">
                      Week {w.num}
                    </span>
                  </div>
                  <h3 className="font-medium text-content group-hover:text-accent transition-colors">
                    {w.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Overview from README */}
      {readme && (
        <section>
          <h2 className="text-xl font-semibold text-content mb-6">Plan Overview</h2>
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <MarkdownContent content={extractOverview(readme) || readme.slice(0, 2000)} />
          </div>
        </section>
      )}

      {/* Daily Routine */}
      {plan && (
        <section>
          <h2 className="text-xl font-semibold text-content mb-6">Daily Routine</h2>
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <MarkdownContent content={plan.match(/## Daily Routine Template[\s\S]*?(?=## )/)?.[0] || ''} />
          </div>
        </section>
      )}
    </div>
  );
}
