# DocCoach — MkDocs + Cloudflare Workers AI (free-tier friendly)

A public **MkDocs Material** site with a floating **chat widget** that talks to an LLM via a **Cloudflare Worker** using **Workers AI** (no API key required).

## What you get
- ✅ Static docs site (MkDocs Material)
- ✅ Floating chat widget with:
  - page-context toggle (“Ask about this page”)
  - local conversation state (in-memory for session)
- ✅ Cloudflare Worker backend endpoint: `POST /api/chat`
- ✅ GitHub Actions for CI + GitHub Pages deploy

---

## 1) Run the docs locally

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell:
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
mkdocs serve
```

Open: http://127.0.0.1:8000

---

## 2) Publish the MkDocs site on GitHub Pages

1. Push this repo to GitHub (public recommended for visibility).
2. Repo → **Settings → Pages**
3. Set **Source = GitHub Actions**
4. Push a commit to trigger deployment
5. Your site URL will look like:
   `https://<username>.github.io/<repo>/`

---

## 3) Deploy the chat backend (Cloudflare Worker + Workers AI)

### Prereqs
- Cloudflare account
- Node.js 18+

### Create and deploy
```bash
cd backend/doccoach-chat
npm install
npx wrangler login
npx wrangler deploy
```

Wrangler will print a URL like:
`https://doccoach-chat.<your-subdomain>.workers.dev`

---

## 4) Wire the frontend to your Worker URL

Edit this file:

- `docs/assets/chat.js`

Find:

```js
const DEFAULT_ENDPOINT = "https://YOUR-WORKER-SUBDOMAIN.workers.dev/api/chat";
```

Replace it with your real Worker URL (ending with `/api/chat`).

Also update CORS allowlist in the Worker:

- `backend/doccoach-chat/src/index.js`

Replace the placeholder GitHub Pages origin:
`https://YOUR_GITHUB_USERNAME.github.io`

---

## 5) Smoke test (recommended)

Open your published site → click **DocCoach** button → ask:

> “Review this page for clarity and information architecture issues.”

If you hit Cloudflare free-tier limits, the Worker will return an error and the UI will show it.

---

## Notes on “$0 cost”
Cloudflare Workers AI includes a daily free allocation (10,000 neurons/day on Free plan). When it’s exhausted, requests fail until the daily reset. This template intentionally keeps answers short and trims page context to help you stay within free quotas.

---

## License
MIT
