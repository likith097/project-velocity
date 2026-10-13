# Project Velocity — Integrated Portfolio (first working integration)

This is a NEW, independent React/Vite project assembled from the supplied Github.zip and E5.5D10-City-Visual.zip. The original projects are not modified.

## Start

```powershell
cd D:\project-velocity-phase1\Project-Velocity-Integrated
npm install
npm run dev
```

Open the URL printed by Vite. On the portfolio homepage, click **Enter 3D World**.

## Architecture

- React portfolio remains the main app.
- The existing Three.js city lives under `public/velocity-city/` and is shown in an iframe on entering the world.
- District navigation buttons show the EXISTING React `DistrictContent` panels.
- The city remains its own renderer, preserving its own player movement, minimap, bridges, waterfront, and traffic.
- Saved 29 waterfront transforms are baked in; waterfront editor is disabled.

## Known limits / next step

- Crystal-to-React district interaction and in-world teleportation are not yet wired. District content is accessible from the top navigation instead.
- Verify GLB loads and any missing assets in Chrome DevTools.
- The supplied ZIP is a snapshot; edits made after that ZIP was created will not be present.
- `npm run build` must be run and validated on your PC before deployment.
