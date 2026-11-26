# Wrogn Sales (BFS)

Standalone Black Friday Sale experience, split out of `wrogn-looks-web`. It has no Looks code, routes or assets.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks, then writes dist/
npm run preview    # serves dist/ on http://localhost:4173
```

## Routes

| Route | What it is |
|---|---|
| `/` | Sale homepage: Black Friday hero + the sale widget in the bottom nav. Tap either to play the entry film and open `/sales`. |
| `/sales` | Sale landing page: timer, banner, Big Discount Edit strip, Shop by Budget, Catch the Drops game, All sale picks (PLP). |
| `/sale-scene?p=N` | Still preview of one frame of the entry film (design review only). |

## Where things are

- `src/screens/Home.tsx`, `SaleHero.tsx`: homepage. `SaleTransition.tsx`: the entry film.
- `src/screens/Sales.tsx` + `SalesCards.tsx`: landing page and its cards. `DropsGame.tsx`: the Catch the Drops card and bottom-sheet game.
- `src/data/sales.ts`: all placeholder data (sale end date, offers, prize tiers, products, BFS price). Replace with live data.
- `src/screens/*.css`, `src/components/sales-widget.css`: styles, each prefixed per area (`s-`, `pc`, `sh-`, `sw-`, `gm-`, `dc-`, `pl`).
- `public/img/`: sale banners and the product images used by the PLP.

## Notes for developers

- Layout is a 360px mobile column, scaled to fit phones (see `src/App.tsx`, `src/index.css`).
- The Catch the Drops result and the 3 tries live in component state only. Deciding the real outcome and tracking attempts is a backend job.
- Drop a film at `public/video/sale.mp4` to play it over the homepage hero photo. It is optional.
- Deploys as a static SPA: `vercel.json` rewrites every path to `index.html`.
