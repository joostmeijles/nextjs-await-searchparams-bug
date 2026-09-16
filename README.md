# Next.js `<Link>` + draftMode + cacheComponents: using searchParams renders the wrong page

## Bug

With `cacheComponents: true`, once Draft Mode is enabled, clicking a `<Link>` that uses a search parameter via `await searchParams` results in the wrong page.

Without Draft Mode enabled, it works correctly.
After a page refresh it also works correctly.

## Reproduction steps

```bash
npm install
npm run build
npm start
```

1. Open `http://localhost:3000/api/draft` — enables Draft Mode and redirects to `/`.
2. Click `Overview`
2. Click every category in the list, e.g. "A".
   - Expected: `Category (via await searchParams): <selected category>`
   - Actual: shows always the same category
3. Hard-reload the URL: the correct content now renders.
