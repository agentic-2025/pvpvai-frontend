# PvPvAI Frontend

## Key libraries
* `bun` is being used as the package manager because it's 2025
    * `bun dev` to start the dev server
    * `bun run build` to do a production build of the app (don't do `bun build`, it's a different command)
    * `bun start` to start the app against a production build
* nextjs is being used as the framework
* shadcn/ui + tailwind is being used for styling with some compoonents from
* storybook is installed, but **use is not required**, please avoid if it'll slow you down (I personally iterate faster in early design with it)

## Get types from Supabase

Guide is here, TL;DR below: <https://supabase.com/docs/guides/database/typescript-types>.

```bash
npm i -g supabase
supabase gen types typescript --project-id "fxewzungnacaxpsnowcu" --schema public > ./src/database.types.ts
```
supabase gen types typescript --project-id "fxewzungnacaxpsnowcu" --schema public > lib/database.types.ts
Run this whenever you update tables for any reason. See [the docs for details on how to consume](https://supabase.com/docs/guides/api/rest/generating-types#using-typescript-type-definitions).

# Original README from bootstrap below
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


