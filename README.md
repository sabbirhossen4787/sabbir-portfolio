This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production database: Turso

V5 uses a single JSON CMS document in Turso/libSQL for production. The local `data/db.json` file remains as a development/first-deploy seed and fallback when Turso environment variables are not configured.

Set these Vercel environment variables:

- `TURSO_DATABASE_URL` — your Turso database URL (`libsql://...` or `https://...`)
- `TURSO_AUTH_TOKEN` — your Turso database auth token

On the first production request, the API creates the `cms_content` table and seeds row `id=1` from `data/db.json` if the database is empty. Admin **Publish Live** saves the complete CMS document to Turso.

### Create the Turso database

1. Create a free Turso account at turso.tech.
2. Create a database, for example `sabbir-portfolio`.
3. Copy its database URL.
4. Create an auth token and copy it once.
5. Add both values to the Vercel project's Environment Variables for Production (and Preview if desired).
6. Redeploy.

Do not commit `.env.local` or the Turso auth token.

> Media uploads are still separate from the database. The current V5 upload route writes to `public/uploads` for local development; for Vercel production, move media to Cloudflare R2 and store only the resulting URLs/keys in Turso.
