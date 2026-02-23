# Verdant Atlas

An interactive planting calendar for Zone 5b / Midcoast Maine featuring 147 flower varieties. Browse species, plan your garden, and track planting timelines through an intuitive web interface.

## Features

- Species browser with search and filtering
- Variety details with images and growing information
- Planting timelines based on local frost dates
- Bloom charts showing seasonal color coverage
- My Garden planner with drag-and-drop ordering
- Dark mode
- Gantt view for timeline visualization
- Gallery view for visual browsing
- Export tools (shopping list, CSV, ICS calendar)

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS v4
- gh-pages for deployment

## Prerequisites

- Node.js >= 20.19 or >= 22.12
- npm

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173/verdant-atlas/`.

## Build and Preview

Create a production build and preview it locally:

```bash
npm run build
npm run preview
```

## Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

This runs `vite build` and pushes the `dist/` directory to the `gh-pages` branch. GitHub Pages serves the site from the `gh-pages` branch.

## Project Architecture

```
src/
  components/   UI components (Header, Toolbar, SpeciesCard, VarietyModal, GanttView, GalleryView, etc.)
  hooks/        Custom React hooks (useGarden, useFilters, useFrostDates, useDarkMode, etc.)
  data/         Static data including the flower database, image URLs, and garden presets
  utils/        Helper functions for dates, timelines, colors, and exports
```

- `vite.config.js` -- Build configuration with base path `/verdant-atlas/`
- `package.json` -- Scripts and dependencies

## Cloudinary Images

Images are loaded from an external Cloudinary CDN. No API key is needed -- all image URLs are public and embedded in the source data.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
