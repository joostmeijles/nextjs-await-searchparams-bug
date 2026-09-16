# Next.js `<Link>` + draftMode + cacheComponents: client-side navigation renders the wrong page

## Bug

With `cacheComponents: true`, once Draft Mode is enabled, clicking a `<Link>` to a dynamic
`[slug]` route renders the content of a **different, already-prefetched sibling route** instead
of the one that was actually clicked. No new network request is made — the client reuses a
stale prefetched RSC payload. A full page reload always shows the correct content.

Without Draft Mode enabled, navigation works correctly.

## Versions

- `next`: `16.3.4`
- `react` / `react-dom`: `19.2.8`

Confirmed **fixed** as of `next@16.4.0-canary.31`.

## Reproduction steps

```bash
npm install
npm run build
npm start
```

1. Open `http://localhost:3000/api/draft` — enables Draft Mode and redirects to `/`.
2. Click any item in the list, e.g. "alpha".
   - Expected: `Item: alpha`
   - Actual: shows some other item's slug (whichever one got auto-prefetched from the list's
     viewport) — the wrong content, on the very first click.
3. Click "Back to list", then click a *different* item, e.g. "bravo".
   - Same result: shows the wrong (prefetched) item again, not `bravo`.
4. Hard-reload the URL bar (or open the URL in a new tab) — the correct content now renders.
5. Open DevTools Network tab and repeat step 2/3 — no request is made for the clicked item's
   URL at all; the client renders straight from its own (incorrect) cache.
6. Disable Draft Mode (`http://localhost:3000/api/draft` sets the cookie; clear the
   `__prerender_bypass` cookie, or add a `disable` route) and repeat — navigation is correct
   every time.

## What this repo contains

- `next.config.ts` — only `cacheComponents: true`, nothing else non-default.
- `app/page.tsx` — a list of 4 links to `/item/[slug]`.
- `app/item/[slug]/page.tsx` — reads `params` and `draftMode()`, renders the slug. Uses
  `generateStaticParams` returning a single placeholder, the standard on-demand ISR pattern for
  Cache Components (real params aren't known at build time).
- `app/api/draft/route.ts` — enables Draft Mode via the standard `draftMode().enable()` pattern
  from the Next.js docs, then redirects to `/`.

No CMS, no data fetching library, no `'use cache'` directive, no custom `Link` wrapper — this is
the framework's own `<Link>` and `draftMode()` with the minimum config needed to reproduce.

## Notes from a larger app where this was first found

In our real app (much larger, using `'use cache: remote'` for the per-slug data fetch, and
`generateStaticParams` returning an ISR placeholder param exactly like this repro), we ruled out
several things as *not* being the cause before reducing to this minimal case:

- Removing the `'use cache'` directive from the data fetch — no change.
- Removing `generateStaticParams`/ISR entirely — no change.
- `<Link prefetch={false}>` on the affected links — no change (the request that leaks the wrong
  content is a `next-router-segment-prefetch: /_tree` request, not a link-level prefetch).
- Route segment `export const prefetch = 'force-disabled'` on the destination page — no change.
- Wrapping `params` in a `<Suspense>` boundary inside the page (the documented fix for a related,
  officially-described failure mode) — no change.

This matches [vercel/next.js#98037](https://github.com/vercel/next.js/issues/98037), which
describes the same "prefetched sibling routes render the wrong page" symptom (there triggered by
`htmlLimitedBots` instead of Draft Mode) and was reported fixed as of `16.4.0-canary.0`. Draft
Mode forcing every response to `Cache-Control: private, no-cache, no-store, max-age=0,
must-revalidate` appears to trigger the same "bypass PPR shell serving" code path that issue
describes, landing in the same param-blind client cache key collision.
