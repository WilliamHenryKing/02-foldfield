<p align="center"><img src="docs/readme/banner.svg" alt="FOLDFIELD: flat cut patterns fold into rooms for rain, wind and an evening show." width="100%"></p>

<p align="center">
  <a href="https://02-foldfield.williamking.workers.dev"><img alt="Visit the live site" src="https://img.shields.io/badge/Visit_live_site-%E2%86%97-f1e6cf?style=for-the-badge&labelColor=1b1f3d"></a>
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-f1e6cf?style=for-the-badge&logo=threedotjs&logoColor=1b1f3d&labelColor=1b1f3d">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-f1e6cf?style=for-the-badge&logo=typescript&logoColor=1b1f3d&labelColor=1b1f3d">
  <img alt="React" src="https://img.shields.io/badge/React-f1e6cf?style=for-the-badge&logo=react&logoColor=1b1f3d&labelColor=1b1f3d">
  <img alt="GSAP" src="https://img.shields.io/badge/GSAP-f1e6cf?style=for-the-badge&logo=greensock&logoColor=1b1f3d&labelColor=1b1f3d">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-f1e6cf?style=for-the-badge&logo=tailwindcss&logoColor=1b1f3d&labelColor=1b1f3d">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-f1e6cf?style=for-the-badge&logo=vite&logoColor=1b1f3d&labelColor=1b1f3d">
</p>

**Three oversized postcards become small places.** A flat, printed cut pattern folds up into a room: a library for reading in the rain, a pavilion for listening to the wind, a theatre for an evening performance. An experiential 3D website about paper architecture.

<p align="center"><img src="docs/readme/preview.gif" alt="Scrolling from the arrival to the three folding studies" width="800"></p>

## What you can do

- **Pick a study:** The Rain Library, The Listening Pavilion or The Sunset Theatre.
- **Pull the tab** and watch a flat, printed cut pattern fold up into a room along its hinges, then fold back the same way.
- **Shape the place:** span, roof, open, slatted or vellum panels, low sun, wind in the sails and rain, seen as an object, in plan, in section or from the seat.
- **Keep it:** save your postcard on this device, download it as an image, or turn it into a printable brief. Nothing is sent anywhere.

## What's inside

- **Three distinct mechanisms:** a hinged wall, canopy and folding seat for the library; three raised portals with swaying sails for the pavilion; splayed wings, canopy strips and risers for the theatre.
- **Paper you can read:** seeded fibre and grain, embossed scoring, thin sheet edges, brushed hinge pins and printed registration marks under a raking key light.
- **Prerendered pages** that read before JavaScript loads, an arrival loader, and a real 404.
- **Motion with care:** GSAP choreography throughout, and reduced motion respected.

## Screenshots

| Desktop | Phone |
| --- | --- |
| <img src="docs/readme/desktop.png" alt="FOLDFIELD's arrival on desktop" width="560"> | <img src="docs/readme/phone.png" alt="FOLDFIELD on a phone" width="220"> |

## Built with

Direct Three.js for the folding rooms; React for the interface; GSAP for the folds and page choreography; Tailwind CSS with Lightning CSS; TypeScript throughout; Vite and Bun for the build.

## Run it locally

```sh
bun install --frozen-lockfile
bun run dev      # http://127.0.0.1:4512/
bun run check
bun run preview  # http://127.0.0.1:4612/
```

Design intent is in [DESIGN.md](DESIGN.md); the working history is in [docs/PROJECT-NOTES.md](docs/PROJECT-NOTES.md).

## Credits

Sources, authors and licences for everything shipped are in [CREDITS.md](CREDITS.md) and [assets.manifest.json](assets.manifest.json). All places and content are fictional.

---

<p align="center"><sub>Part of William King's portfolio collection.</sub></p>
