# Deployment sequence

1. Create PostgreSQL.
2. Set Vercel environment variables.
3. Deploy.
4. Initialize schema (`npm run db:push` against the production DATABASE_URL).
5. Seed the initial admin once (`npm run db:seed`).
6. Log in.
7. Add provider API key.
8. Test Connection.
9. Browse Models.
10. Copy the generated `sk-tx-...` gateway key.
11. Configure your application with:

`Base URL = https://YOUR-DOMAIN/v1`

`API Key = sk-tx-...`

12. Test `/v1/models` then `/v1/chat/completions`.
