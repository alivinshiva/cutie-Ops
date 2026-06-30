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
let searchIndexCache = null;
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

function deriveTitle(path) {
  const file = path.split('/').pop().replace(/\.md$/, '');
  return file
    .replace(/^\d+-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Build a searchable index of every lab: its title plus its ## / ### headings.
// Expensive on first call (one fetch per file) but cached for the process and
// it also warms the content cache so the labs themselves load instantly after.
async function buildSearchIndex(force = false) {
  if (!force && searchIndexCache) return searchIndexCache;
  const tree = await fetchTree();
  const files = (tree.tree || []).filter(
    (f) =>
      f.type === 'blob' &&
      f.path.endsWith('.md') &&
      f.path.includes('/') &&
      !f.path.includes('problems-faced')
  );

  const docs = [];
  for (const f of files) {
    let headings = [];
    try {
      const content = await fetchAPIContent(f.path);
      const lines = content.split('\n');
      let inCode = false;
      for (const line of lines) {
        if (line.trim().startsWith('```')) {
          inCode = !inCode;
          continue;
        }
        if (inCode) continue;
        const m = line.match(/^(#{2,3})\s+(.+)/);
        if (m) {
          const text = m[2].replace(/[#*`]/g, '').trim();
          if (text) headings.push({ text, id: slug(text), level: m[1].length });
        }
      }
    } catch {
      // Skip files that fail to fetch; the rest of the index still works.
    }
    const weekMatch = f.path.match(/^(\d+)/);
    docs.push({
      path: f.path,
      slug: f.path.replace(/\.md$/, ''),
      title: deriveTitle(f.path),
      week: weekMatch ? parseInt(weekMatch[1], 10) : null,
      headings,
    });
  }

  searchIndexCache = { docs, builtAt: Date.now() };
  return searchIndexCache;
}

app.get('/api/search-index', async (req, res) => {
  try {
    const index = await buildSearchIndex(req.query.force === '1');
    res.json(index);
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
