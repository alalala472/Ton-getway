# Security checklist

- Never commit `.env`.
- Use a unique `SESSION_SECRET` in production.
- Use a random 32-byte `ENCRYPTION_KEY`.
- Change the initial admin password before production.
- Provider API keys are encrypted; gateway keys are stored as SHA-256 hashes.
- Full gateway keys are only returned on creation/regeneration.
- Provider API keys are never returned by dashboard APIs.
- Request bodies are not stored by default.
- Add external WAF/rate limiting if the gateway becomes public to many clients.
- Use only authorized outbound proxies.
