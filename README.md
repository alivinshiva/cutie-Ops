# Cutie Ops

Beautiful, reader-friendly website for the [DevOps 8-10 Week Preparation Plan](https://github.com/alivinshiva/devops-prep-plan). Interactive labs with architecture diagrams, command examples, and three viewing modes.

## Features

- **3 themes** — Dark, Light, and Reader (warm yellow) mode
- **Structured navigation** — Browse by week, with nested lab guides
- **Live diagrams** — Mermaid architecture diagrams for networking, K8s, Terraform
- **Command blocks** — Syntax-highlighted terminal blocks with copy button, showing commands and their output
- **Responsive** — Sidebar collapses on mobile

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, react-router-dom
- **Markdown:** react-markdown, remark-gfm
- **Diagrams:** Mermaid.js
- **Backend:** Express.js (fetches content from GitHub)

## Development

```bash
npm install
cd server && npm install && cd ..

# Start both server and dev server
npm run server &
npm run dev
```

## Build

```bash
npm run build
npm run server  # serves API
npx vite preview  # serves built frontend
```

## Data Source

Content is fetched live from the [devops-prep-plan](https://github.com/alivinshiva/devops-prep-plan) repo. No database required.
