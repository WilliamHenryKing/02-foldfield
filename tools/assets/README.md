# FOLDFIELD asset maintenance

The current paper studies, diagrams and scene artwork are authored in code. Self-hosted fonts and original fallback renders are recorded in [CREDITS.md](../../CREDITS.md) and [assets.manifest.json](../../assets.manifest.json). This directory currently contains no fetch or conversion program; it is not a required setup step.

To develop the website, install the repository's locked dependencies and run the commands in the [main README](../../README.md). The existing `public/` outputs are already part of the project.

When adding or replacing a source asset:

1. Verify the source, author and licence before copying it into the project.
2. Retain the original hash and acquisition details in the manifest; keep working originals in ignored `assets-src/`.
3. Put only processed runtime outputs in `public/`, with reversible processing instructions and output hashes.
4. Update the credits and inspect the result in the studio, postcard export and reduced-motion layouts.

Research references are not shipping assets. A browser screenshot or postcard generated from the authored scene is not evidence of a third-party photo licence. Existing source notices and dependency licences remain in force.
