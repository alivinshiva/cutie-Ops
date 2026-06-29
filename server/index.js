import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const OWNER = 'alivinshiva';
const REPO = 'devops-prep-plan';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

app.use(cors());
app.use(express.json());

let treeCache = null;
let contentCache = {};
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000;

const HEADERS = {
  'User-Agent': 'cutie-ops',
};

async function ghFetch(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`fetch failed: ${url} (${res.status})`);
  return res;
}

async function fetchTree(force = false) {
  const now = Date.now();
  if (!force && treeCache && now - lastFetch < CACHE_TTL) return treeCache;
  const res = await ghFetch(`${API_BASE}/git/trees/${BRANCH}?recursive=1`);
  const data = await res.json();
  treeCache = data;
  lastFetch = now;
  return data;
}

async function fetchAPIContent(path) {
  if (contentCache[path]) return contentCache[path];
  const res = await ghFetch(`${API_BASE}/contents/${path}`);
  const data = await res.json();
  if (data.encoding === 'base64' && data.content) {
    const text = Buffer.from(data.content, 'base64').toString('utf-8');
    contentCache[path] = text;
    return text;
  }
  if (typeof data.content === 'string') {
    contentCache[path] = data.content;
    return data.content;
  }
  throw new Error(`Unexpected content format for ${path}`);
}

app.get('/api/structure', async (req, res) => {
  try {
    const tree = await fetchTree();
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/content', async (req, res) => {
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'path required' });
  try {
    const content = await fetchAPIContent(path);
    res.json({ path, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/week-plan', async (req, res) => {
  try {
    const content = await fetchAPIContent('devops_8_10_week_plan.md');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/readme', async (req, res) => {
  try {
    const content = await fetchAPIContent('README.md');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', cacheSize: Object.keys(contentCache).length });
});

const distDir = new URL('../dist', import.meta.url).pathname;
app.use(express.static(distDir));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(`${distDir}/index.html`);
});

app.listen(PORT, () => {
  console.log(`cutie-ops server running on :${PORT}`);
});
