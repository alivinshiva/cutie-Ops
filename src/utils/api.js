const BASE = import.meta.env.PROD ? '/api' : '/api';

export async function fetchStructure() {
  const res = await fetch(`${BASE}/structure`);
  if (!res.ok) throw new Error('Failed to fetch structure');
  return res.json();
}

export async function fetchContent(path) {
  const res = await fetch(`${BASE}/content?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to fetch content: ${path}`);
  return res.json();
}

export async function fetchWeekPlan() {
  const res = await fetch(`${BASE}/week-plan`);
  if (!res.ok) throw new Error('Failed to fetch week plan');
  return res.json();
}

export async function fetchReadme() {
  const res = await fetch(`${BASE}/readme`);
  if (!res.ok) throw new Error('Failed to fetch readme');
  return res.json();
}

export async function fetchSearchIndex() {
  const res = await fetch(`${BASE}/search-index`);
  if (!res.ok) throw new Error('Failed to fetch search index');
  return res.json();
}
