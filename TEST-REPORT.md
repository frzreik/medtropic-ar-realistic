# MedTropic AR test report

Date: 23 September 2026. Baseline: frzreik/medtropic-ar at 9d20e3d; delivered as a separate repository, medtropic-ar-realistic.

## Results

- HTML validation: index, QR page and 404 page pass. Custom element and deliberate muted camera autoplay accommodated by the validator configuration.
- CSS parses; app.js and sw.js pass Node syntax checks.
- 14 local HTML/CSS/manifest references checked for existence and HTTP 200 under the GitHub Pages-style subpath.
- Three GLBs pass the Khronos glTF Validator: zero errors and zero warnings. All images and buffers are embedded; no texture path dependencies. Informational notices concern unused UV/tangent attributes and a non-power-of-two source image.

| Model | Size | Errors | Warnings |
|---|---:|---:|---:|
| enchi_live_edge_table.glb | 4.39 MB | 0 | 0 |
| fairafric_booth.glb | 1.11 MB | 0 | 0 |
| medtropic_showroom.glb | 5.5 MB | 0 | 0 |

- Geometry: table 20,960 triangles; display 11,196; shared scene 32,156.
- 19 browser checks pass in installed headless Chrome with a simulated camera: camera-first startup, rear-camera preference, no microphone request, playback, 390×844 / 360×640 / 844×390 layouts, help controls, each logo's exact website link, each 3D mesh's direct link, drag-versus-tap separation, fixed-scale AR configuration, gesture-preserving AR handoff and camera release, placement/tracking feedback, camera return, permission denial and retry, missing-model recovery, and no unexpected browser errors/failed requests.
- AR lifecycle tests dispatch simulated events. They prove application behavior, not physical tracking.
- QR PNG and the QR rendered on the card both decode exactly to https://frzreik.github.io/medtropic-ar-realistic/ .
- Business card: two sides, 85×55 mm trim, 3 mm bleed in print PDF; digital PDF has trim size only. Name, role and phone checked. PDFs rendered and visually reviewed.

## Changes

Both objects share a ground plane with floor placement and fixed scale. Camera-direction placement is provided by the platform's AR viewer after the required user tap. Real scanned wood colour, normal and roughness maps replace baked-in photographic glare. Two steel table frames, fastening plates/bolts, rounded edges and soft contact shadows add physical detail. The fairafric cardboard display has been enlarged 60%; the lower steel shelving is removed. Camera preview remains explicitly labeled until tracked AR is started.

## Real-device checks still required

Physical camera permissions, floor detection, scale perception, tracking stability, lighting estimation, occlusion expectations, and thermal/performance behavior on an actual iPhone and Android phone have not been tested. Quick Look/Scene Viewer launch paths are configured; physical native launches are not certified. Native AR viewers do not preserve HTML logo links; return to the page to open brand websites. WebXR keeps page hotspots. No depth occlusion is implemented.

Dimensions are estimates from photos, not measurements. The enlarged display is a requested design adaptation. A browser cannot silently enter immersive AR from a QR scan: one tap plus device permissions is required.

## Quick phone acceptance test

1. Scan the new QR in Safari or Chrome and allow the camera.
2. Tap Place on floor · full size, point toward a well-lit, textured floor, and move slowly until tracking places the objects.
3. Walk around the objects, check floor contact, return to the page, and test both logos and object taps.
4. Deny camera access once, retry, and test returning from each brand site.
