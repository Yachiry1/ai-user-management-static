# Mixology Frontend Lab 1

Static frontend prototype for Mixology AI.

## Project structure

- `src/` - source files (HTML templates, SCSS, assets)
- `docs/` - deploy-ready static pages and compiled CSS

## SCSS compile

```bash
npx sass src/scss/main.scss:docs/css/main.css
```

Watch mode:

```bash
npx sass --watch src/scss/main.scss:docs/css/main.css
```

## Pages in dist

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
