# FOLDFIELD — Phase 0 visual audit

26 September 2026. **Baseline, not approval.** Creative source is frozen; only development/test inspection code has been added. The pre-reset source is preserved in the collection `.workspace/visual-reset/02-foldfield-pre-reset.zip`. The earlier functional browser checks do not satisfy the new visual bar.

## Evidence / renderer

[Full capture metadata](captures/baseline/meta.json): twelve bookmarks × the existing tier × desktop 1920×1080 DPR1 and phone viewport 390×844 DPR3. Application DPR is capped at 1.6. Raw WebGL images have `_webgl` suffix; canvas-region screenshots can include HTML overlays. Fixed paper seed 82 and other authored constants; hook seed 870 is a declared baseline ID and rejects alternatives. Time is frozen at zero; each state settles for 30 frames. No motion quality claim follows.

GPU: ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 (0x00001F15) Direct3D11 vs_5_0 ps_5_0, D3D11). WebGL2 r186, direct Three in React. Runtime confirms colour management on, sRGB output, AgX once, exposure 0.92, MSAA on. No post-processing passes, AO or bloom. No double tone-mapping evidence.

## Every light / environment

One DirectionalLight #fff6df, intensity 3.1; position is 12 times the configured sun vector, rotated by the card mount -0.12 rad. Target is the card origin. One HemisphereLight, white sky / #d5c6c0 ground, intensity 1.25. There are no point/spot practicals. PCF shadows 2048², bounds ±11, bias -0.00006, normalBias 0.018; fitted but not texel-snapped. Complete camera/shadow parameters are in metadata.

PMREM RoomEnvironment blur 0.07, environment intensity 0.3. The background is #e1e1dc and the visible ground is a 120×120 plane at y=-0.14. Unlike ODD TIDE, a studio environment is compatible with the tabletop concept; there is no evidenced outdoor/indoor contradiction here. However, no calibrated grey/mirror/chart test exists, and the large grey ground and fill flatten the paper/material hierarchy. Moving the key leaves the indoor reflection environment unchanged.

## Geometry, materials and origin

All model geometry is original procedural geometry. No sourced material scan or well-modelled prop asset was acquired. Rain Library uses thin boxes for sheets/slats/seat/person, cylinders for hinge pins, circles for the scale figure/markers and a printed plane over a box base. Listening Pavilion adds extruded cut-out sails and nine cylinders; Theatre adds four independent box-sheet assemblies and folding steps. A rectangular sheet can be correct for paper; the fault is missing fibre, cut edge, crease deformation, fastening and material reference, not merely the use of BoxGeometry.

| Study (open bookmark) | Existing mesh geometry inventory (includes hidden diagnostic markers) |
|---|---|
| Rain Library | 67 boxes / 804 triangles; 4 cylinders / 192; 2 planes / 4; 26 circles / 324. |
| Listening Pavilion | 19 boxes / 228; 9 cylinders / 432; 3 extruded sails / 756; 3 planes / 6; 26 circles / 348. |
| Sunset Theatre | 50 boxes / 600; 8 cylinders / 384; 2 planes / 4; 26 circles / 348. |

The 256² seeded paper grain is a linear bump texture (appropriate data colour space). Printed cards/labels are sRGB colour textures, up to 1024×1664. No normal, roughness, metalness or AO map is present. Paper roughness is constant (usually 0.93–0.96); metal has a single roughness/metalness pair; vellum uses thin transmission/opacity but lacks source-calibrated fibre and translucency. Full per-material inventory is saved, including hidden scene objects. All shadows and geometry respond to actual configuration, but that does not establish tactile material quality.

## Measured resources

| Bookmark | Desktop calls / triangles | Portrait calls / triangles |
|---|---:|---:|
| rain-flat | 155 / 2,020 | 155 / 2,020 |
| rain-half-fold | 155 / 2,020 | 155 / 2,020 |
| rain-open | 151 / 1,972 | 151 / 1,972 |
| rain-inhabit | 155 / 2,020 | 151 / 1,972 |
| roof-grazing | 148 / 1,936 | 149 / 1,948 |
| rain-plan | 151 / 1,972 | 151 / 1,972 |
| rain-section | 155 / 2,020 | 151 / 1,972 |
| vellum-low-sun | 109 / 1,468 | 109 / 1,468 |
| shelter-rain | 129 / 1,696 | 129 / 1,696 |
| listening-pavilion | 62 / 2,838 | 62 / 2,838 |
| sunset-theatre | 115 / 1,972 | 115 / 1,972 |
| postcard-return | 107 / 1,444 | 107 / 1,444 |

Public files total 1,054,040 bytes (1.01 MiB). Renderer memory counts range from 35 to 76 geometries and 6–7 textures; these are resource counts, not GPU memory bytes. Budget comparison awaits D02. No glTF file is present, so baseline glTF validation is not applicable.

The flat card raw canvas has only 5.0/255 luminance p95–p5 contrast; its colour entropy is 0.74 bits at desktop. The open Library contrast is 47.6/255; Pavilion 25.7/255. These are diagnostic signals of weak contrast/large uniform space, not automatic aesthetic scores. All 24 raw canvases are non-blank; no runtime/console errors were recorded in this matrix.

## Failure patterns established

- [Hinge/material close view](captures/baseline/roof-grazing_existing_desktop_webgl.png): smooth flat sheets, uncapped-looking utilitarian pin geometry, little fibre/crease detail and weak separation between white screens and grey background. The portrait inspection crop cuts off much of the roof; public close cameras also need fit checks at maximum span.
- [Pavilion](captures/baseline/listening-pavilion_existing_desktop_webgl.png): bench top almost disappears against the card; folded paper and metal supports lack distinct surface response. The scene reads as a schematic construction.
- [Theatre](captures/baseline/sunset-theatre_existing_desktop_webgl.png): steps merge with the base; hinge/panel connections have little visible craft; broad uniform lighting compresses material depth.
- [Flat card](captures/baseline/rain-flat_existing_desktop.png): the object is small within a broad grey field and its pale surfaces approach the ground value.
- [Section](captures/baseline/rain-section_existing_desktop.png): the section plane slices the paper person into an unhelpful thin fragment; a model/diagram can be geometrically consistent and still fail visual communication.
- Existing separate defect: `output/playwright/brief-final.png` showed the live canvas blank after successful postcard export; renderer resize clears it while it is offscreen. Preserve this evidence and fix through a focused before/after pass. Frozen baseline rendering deliberately does not reproduce the export sequence, so its non-blank result does not clear this defect.

## Ranked fix list / orchestrator gate

1. Build look-dev using the exact studio pipeline, 18% grey/mirror/chart and representative paper, vellum and metal. Establish references for real card stock, cut edges, scored folds and fastenings.
2. Source a licence-clean paper surface candidate; compare fibre/roughness/edge behaviour at arm length. Keep configuration-driven geometry only where justified by fold mechanics and architectural dimensions, and model joinery from references.
3. Correct bench/step/background value separation within the single lighting/material setup; do not give dark objects rescue lights.
4. Improve folded/unfolded composition and portrait close-camera fitting; make section presentation purposeful.
5. Fix the export restore defect with matching brief frames; re-run journey tests and unchanged bookmarks.
6. Implement approved tiers, collect physical-device performance, obtain independent review and repeat scorecards.

**Visual revisions remain paused for handover and project sequencing.** D01 now permits GPT-6 Sol MAX independent review, but this project's cold review has not happened. D02 supplies the measured local policy, not a passing FOLDFIELD performance result. D03 remains specific to the existing font exception; it does not block unrelated unchanged-font work. Complete ODD TIDE before creative production resumes here. [Provisional scorecard](SCORECARD.md) is self-critique, not independent approval. No geometry, material, light, renderer or dependency has been replaced in this audit.

## Supplemental layout and vision captures

Main study UI captured at the 360, 850 and 1180 CSS breakpoints in portrait/landscape pairs; none had document-level horizontal overflow. Protanopia/deuteranopia/tritanopia captured at 1920 and 390 widths. [Supplemental metadata](captures/baseline/responsive-meta.json). This covers the main study UI, not every bookmark at every supplemental width. The main matrix covers all twelve bookmarks at desktop and portrait DPR3.
