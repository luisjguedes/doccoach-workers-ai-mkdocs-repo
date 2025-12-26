# Privacy & safety

## Don’t paste secrets
Do not paste API keys, credentials, customer data, or other sensitive information into the chat.

## How requests are handled
- Your browser sends your message (and optional page text) to a Cloudflare Worker endpoint.
- The Worker forwards the prompt to Cloudflare Workers AI and returns an answer.

## Logging
This template does **not** store conversation history server-side.
However, Cloudflare may retain standard request logs depending on your account settings.

## Safety behavior
DocCoach should refuse or redirect requests for sensitive data, wrongdoing, or unsafe instructions.

If you want stricter controls:
- Add **Cloudflare Turnstile** verification before calling the model.
- Add rate limiting / bot protection rules.
- Add allowlists (origins, paths) and tighter prompt constraints.

