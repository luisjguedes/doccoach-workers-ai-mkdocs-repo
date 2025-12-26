# DocCoach backend (Cloudflare Worker + Workers AI)

## Deploy

```bash
npm install
npx wrangler login
npx wrangler deploy
```

After deploy you’ll get a URL like:
`https://doccoach-chat.<your-subdomain>.workers.dev`

Your chat endpoint is:
`https://doccoach-chat.<your-subdomain>.workers.dev/api/chat`

## CORS allowlist
Update the `allowedOrigins` list in `src/index.js` to include:
- your GitHub Pages origin (usually `https://<username>.github.io`)
- localhost (already included)

## Model
Default model in `src/index.js`:
`@cf/meta/llama-3.1-8b-instruct`

You can switch to a smaller model to stretch the free daily quota.

