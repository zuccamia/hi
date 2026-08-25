# norah-site

Personal portfolio site, built with [Astro](https://astro.build/).

## Quick start

```bash
npm install
npm run dev     # local dev server at http://localhost:4321
npm run build   # production build → ./dist
npm run preview # preview production build
```

## Deploying to GitHub Pages

This deploys to `zuccamia.github.io/hi/` as a project site, alongside
`zuccamia.github.io/career-planner/`.

### One-time setup

1. Create a repo on GitHub named `hi` (or whatever you'd like — just
   make sure `astro.config.mjs`'s `base:` matches the URL path you want).
2. In the repo's Settings → Pages, set **Source** to "GitHub Actions".
3. Push this project to the repo's `main` branch.

### Ongoing

Every push to `main` triggers `.github/workflows/deploy.yml`, which
builds the site and deploys it. Deploys typically finish in ~30 seconds.

### Switching to a custom domain (later)

If you buy a domain like `norahoang.com`:

1. Create `public/CNAME` containing just the domain (e.g. `norahoang.com`).
2. Update `astro.config.mjs`: change `base` to `'/'` and `site` to your domain.
3. Update the DNS records at your registrar (GitHub Pages docs walk
   you through the CNAME/ALIAS setup).
4. Push, wait for DNS to propagate.

### Deploying under a different path

To change from `/hi` to another path like `/portfolio` or `/about-me`:

1. Rename the repo on GitHub (or create a new one with the desired name).
2. Update `astro.config.mjs`'s `base:` to match: e.g. `base: '/portfolio'`.
3. Push.

## Adding or updating your résumé

The résumé is hosted externally (Google Drive) rather than in this repo,
so the repo can stay public without exposing the PDF as a downloadable
file in the source tree.

The link is currently hardcoded in two places. To update it (e.g. when
you swap in a new version of the résumé):

- `src/components/Bicycle.astro` — bicycle wrapper's `href`
- `src/layouts/BaseLayout.astro` — delivery-note fallback link's `href`

**To swap the résumé:**

1. Upload the new PDF to Google Drive (replace the existing file to
   preserve the URL, or upload fresh and update the URL in both files).
2. Make sure it's set to "Anyone with the link can view."
3. If you replaced in place, no code changes needed. Otherwise update
   the two hrefs above with the new share URL.

The bicycle interaction is the only in-site path to the résumé. There
is no visible link elsewhere; a small "Résumé available on request"
line in the Reach section is the only text hint.

## Structure

```
src/
├── layouts/
│   ├── BaseLayout.astro            # shared shell: head, mode toggle, delivery note, scripts
│   └── CaseStudyLayout.astro       # wraps .md case studies with article typography
├── components/
│   ├── Colophon.astro              # left-column identity block (avatar, Where, Now)
│   └── Bicycle.astro               # SVG bicycle wrapped as accessible résumé link
├── pages/
│   ├── index.astro                 # home page
│   └── work/
│       ├── elasticsearch-migration.md   # case study — write in markdown
│       └── qr-payments.md               # case study — write in markdown
└── styles/
    └── global.css                  # full design system

public/
├── avatar.png                      # profile illustration (128×128 optimized)
└── robots.txt                      # allow-all (résumé is hosted externally)
```

## Adding a case study

Create a new markdown file at `src/pages/work/your-slug.md`. The URL will
be `/work/your-slug/`. Frontmatter is the metadata block at the top:

```markdown
---
layout: ../../layouts/CaseStudyLayout.astro
title: Your case study title
eyebrow: KOMOJU · 2024
meta: Tech · stack · details
description: "One-line SEO summary of what this covers."
---

## The problem

Write in plain markdown. `##` for section headings.

*Italics* and **bold** work as expected. Inline `code` too.

- Lists
- Also work

[Links](https://example.com) look like this.
```

Save the file and it becomes a page immediately in dev mode. Link to it
from the "Selected work" section on the home page.

## Editing content

- **Rotating "Currently thinking about" items** — array at the top of the
  bicycle/rotator script in `src/layouts/BaseLayout.astro`. Change them
  every few weeks so the site stays alive.
- **Now line** — `src/components/Colophon.astro`. Update when your
  situation shifts (new project, done interviewing, etc.).
- **About paragraphs** — `src/pages/index.astro` under the About section.
- **Case study bodies** — the two files under `src/pages/work/`. Write in
  plain markdown. The frontmatter at the top of each file sets the
  title, eyebrow (e.g. "KOMOJU · 2024"), tech stack, and SEO description;
  everything after `---` is the article body. Standard markdown: `##`
  for headings, `*text*` for italics, `[link](url)` for links.

## Design system

- **Palette:** paper + ink for base, hanko red (`--accent`) for structural
  emphasis, foliage green (`--foliage`) for personal/current signals
- **Type:** Fraunces for display, IBM Plex Mono for technical labels,
  Iowan Old Style / Georgia system serif for body prose
- **Dark mode:** toggle in the top-right, persists in `localStorage`,
  respects `prefers-color-scheme` for first-visit default
- **Motion:** all animations respect `prefers-reduced-motion: reduce`
