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

## WebSocket mini subproject

The SPA also includes a `Live Assistant` screen with a real WebSocket messaging exchange.
Run the static app and WebSocket server in two terminals:

```bash
npm run serve
npm run ws
```

Open `http://localhost:4174/#live`. The browser connects to `ws://localhost:8080`,
sends messages through the open socket, and receives assistant replies without refreshing
the page. To use another WebSocket endpoint, set `window.MIXOLOGY_WS_URL`.

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
