# Mixology Frontend Labs 1-2

Static frontend prototype for Mixology AI.

## Project structure

- `src/` - source files (HTML templates, SCSS, assets)
- `docs/` - deploy-ready static pages and compiled CSS

## SCSS compile

```bash
npx sass src/scss/main.scss:docs/css/main.css
```

## Lab 2

The Lab 2 entry point is `docs/index.html`. It is a pure JavaScript SPA that uses `fetch`
for REST-style JSON calls.

```bash
npm install
npm run lint
npm run serve
```

The local demo uses JSON responses from `docs/api`. To connect a real back end, set
`window.MIXOLOGY_API_BASE_URL` before loading `docs/js/api.js`.

Watch mode:

```bash
npx sass --watch src/scss/main.scss:docs/css/main.css
```

## Pages in dist

- `index.html`
- `login.html`
- `logout.html`
- `users.html`
- `user-details.html`
- `user-edit.html`
- `cocktails.html`
- `cocktail-details.html`
- `cocktail-edit.html`
- `ask-ai.html`
- `kb-stats.html`

All pages link only `dist/css/main.css` through `href="css/main.css"`.
