# FOLDFIELD — visual project profile

26 September 2026. Reset profile from current source and commission. **Visual acceptance withdrawn. No release sign-off.** Paused for handover at William's request; read the [root handoff](../../../../HANDOFF.md) before resuming.

| Field | Verified current state / authority |
|---|---|
| Renderer / framework | Direct Three WebGL in React 19.3.0 + Vite 8.3.0; GSAP 3.15.0. `npm ls three` verified 0.186.0 (r186). No WebGPU migration authorised. |
| Dependencies | Existing exact `package.json` and `bun.lock` remain the approved baseline. No additional runtime or devDependency is approved. Named tools in the directive may run outside the project; glTF Transform through npx, not saved to the manifest. |
| Asset budget | Follow D02's [measured local policy](../../../../docs/visual/LOCAL_MACHINE_BUDGET.md): ≤2.667 GiB resident-texture planning ceiling, subject to ≥1 GiB GPU / ≥1.5 GiB system RAM free. FOLDFIELD still needs its own actual asset/loading measurements and performance path; it does not inherit ODD TIDE's results. Public assets currently total 1,054,040 bytes. Compressed-delivery bytes remain separate from GPU residency. |
| Quality tiers | Current code has **one existing tier**, DPR capped at 1.6 and 2048 shadow map. No mesh/texture LOD tiers or AO. Static poster is recovery, not a 3D tier. Baseline label `existing`; do not invent Standard/High coverage before implementation. All journeys and interactions must remain. |
| Target devices / frame time | Local i7-10750H / RTX 2060 6 GiB / about 15.91 GiB visible RAM; display configured 1920×1080 at 144 Hz. The collection's local criterion is CPU/GPU p95 each ≤13.333 ms at a full-HD buffer, with callback p95 ≤16.917 ms, p99 ≤25 ms and max ≤50 ms. FOLDFIELD has not yet been measured against it. Physical phones remain unmeasured. |
| Commands / current test count | `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, combined `bun run check`. Last recorded baseline-instrumentation pass: 5 tests / 20 assertions plus types/lint/build. Not rerun during the hardware or documentation-only handover; recheck when this project's source changes. Browser procedures in `tools/browser/`. |
| Hosting | Current build self-hosts fonts/images/scripts; no CDN runtime dependency. Continue same-origin during audit. Future hosting provider and publication are not authorised. |
| Use | Commercial portfolio demonstration, established by master plan §§1,12; fictional business/content, no real transaction. Treat sourcing/API terms as commercial. |
| Subject / setting / existing lighting | Paper architecture studies: Rain Library, Listening Pavilion, Sunset Theatre. Existing single studio environment with adjustable sun 15–165 degrees. WebGLRenderer, OrthographicCamera, AgX exposure 0.92, PMREM RoomEnvironment. |
| Art direction sources | Active creative brief and project DESIGN.md; Ulcombe is the craft reference, not reusable site art. Reset ART_DIRECTION.md will specify real-subject references and luminance targets. |
| Hero shots | Flat-to-open Rain Library, configured roof/screens, close hinge/material view, Listening Pavilion, Sunset Theatre, return-to-postcard. |
| Asset source/output | Untouched external originals in gitignored `assets-src/`; processed files in `public/`. `assets.manifest.json` required before revised assets ship. Existing ASSET-REGISTER and font source records remain historical inputs. |
| Licences | CC0/public domain/NASA/CC-BY/ODbL under directive. Existing OFL font exception **assumed / awaiting D03**. No credentials or paid generation approved. |
| Review | D01 approved: GPT-6 Sol at MAX performs independent review and bounded support tasks. Root remains main implementer and director; projects stay sequential. |
| Capture policy | 12 fixed code bookmarks; existing tier at 1920×1080 DPR1 and 390×844 DPR3; breakpoint portrait/landscape sweeps. Hooks development/test only. Fixed seeded scene and frozen time, backend/GPU/revision/commit recorded. |
| Release bar | Directive default: no score below 3; hero average ≥4. Performance and motion cannot receive passing scores without the required evidence. |

[Collection directive](../../../../docs/visual/VISUAL_QUALITY_DIRECTIVE.md) · [Decisions](../../../../docs/visual/DECISIONS.md). The root-machine policy is available; this project's own performance evidence is still required. Synthetic counts from another world are not transferable limits.
