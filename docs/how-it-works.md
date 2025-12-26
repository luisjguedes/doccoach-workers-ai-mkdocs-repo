# How it works

## Frontend
- The site is built with **MkDocs Material**.
- A small JS widget (`docs/assets/chat.js`) renders a floating chat panel.
- When you send a message, the widget calls a backend endpoint:

`POST /api/chat`

Payload:
- `messages`: chat history in a simple `{role, content}` array
- `pageContext` (optional): a trimmed text snapshot of the current page

## Backend
- The backend is a **Cloudflare Worker** with a **Workers AI binding** (`[ai] binding = "AI"`).
- The Worker calls `env.AI.run()` with a chat model and returns text.

## Why this is “staff-level”
Because it’s not “just a chat box”:
- You keep keys off the client (no leakage).
- You design for abuse/cost control (short outputs, trimmed context, CORS allowlist).
- You can extend into governance + evaluation + CI gates.

