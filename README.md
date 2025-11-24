# Memory Album

Next.js (app router) + Prismic CMS + Tailwind v4 (Next defaults) with a mobile-first album/memories dashboard.

## Local dev
```bash
npm install
npm run dev
```

## Environment
- `NEXT_PUBLIC_PRISMIC_REPO=birthday-book` (set on Vercel and in `.env.local`)

## Prismic custom types
Custom type JSON lives in `customtypes/`.
- `birthday` — name, relation, date, gift idea, about, photo, tags (use for birthdays/anniversaries/etc.)
- `moment` — timeline entries linked to a birthday (or occasion)

Push types to your Prismic repo (run inside this project):
```bash
npx prismic sm --push --yes
```
If prompted, log into Prismic. Then verify types in the Prismic dashboard → Content model.

## Vercel
- Project linked: `birthday-book-v2`
- Sync envs locally (overwrites): `npx vercel env pull .env.local --yes`
- Deploy: `npx vercel --prod`
