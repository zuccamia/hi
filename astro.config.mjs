import { defineConfig } from 'astro/config';

// Deploys to zuccamia.github.io/hi/ (a project site alongside
// zuccamia.github.io/career-planner/). If you later move to a custom
// domain, set base back to '/' and update the workflow accordingly.
export default defineConfig({
  site: 'https://zuccamia.github.io',
  base: '/hi',
  trailingSlash: 'ignore',
  build: {
    format: 'directory'
  },
  markdown: {
    // Dual themes so code blocks follow the site's light/dark toggle (see global.css).
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' }
    }
  }
});
