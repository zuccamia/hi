# norah-site

Personal portfolio site. Astro, deployed to `zuccamia.github.io/hi/` via GitHub Actions on every push to `main`.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → ./dist
```

## Layout

```
src/
├── layouts/         BaseLayout, CaseStudyLayout (wraps .md writing)
├── components/      Colophon, Bicycle
├── pages/
│   ├── index.astro
│   └── writing/     index.astro + one .md per piece
└── styles/global.css
```

## Common edits

- **Home copy** (hero, about, selected work) — `src/pages/index.astro`
- **Now line, Where, Writing link** — `src/components/Colophon.astro`
- **Rotating "thinking about" items** — array in `src/layouts/BaseLayout.astro`
- **New writing piece** — add `src/pages/writing/your-slug.md` with frontmatter matching the existing files, then link it from `index.astro` and `writing/index.astro`. URL becomes `/hi/writing/your-slug/`.
- **Résumé link** — hosted on Google Drive; hardcoded in `src/components/Bicycle.astro` and `src/layouts/BaseLayout.astro`. Replace the Drive file in place to avoid touching code.

## Design

Paper + ink base, hanko red (`--accent`) for structure, foliage green (`--foliage`) for personal signals. Fraunces display, IBM Plex Mono labels, Iowan Old Style / Georgia body. Dark mode persists in `localStorage`; all motion respects `prefers-reduced-motion`.

## Moving off `/hi/`

Custom domain: add `public/CNAME`, set `base: '/'` and `site:` in `astro.config.mjs`, update DNS. Different path: rename the repo and update `base:` to match.
