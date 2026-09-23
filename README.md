# MedTropic — In your space

Camera-first AR showroom for enchi and fairafric.

Live address: https://frzreik.github.io/medtropic-ar-realistic/
QR page: https://frzreik.github.io/medtropic-ar-realistic/qr.html

Open the site, allow camera access, and see both 3D pieces. Tap either object or its logo to open the matching website. Drag to inspect without following a link. Tap **Place on floor · full size** for surface-tracked AR on supported devices.

## Deployment

Static website, no build step and no server secrets. All runtime assets are local files in this folder. Upload every file into the repository root; use GitHub Pages → Deploy from a branch → main → / (root). HTTPS is required for camera and AR. Old printed QR query strings still open the new two-brand flow when used on this new URL.

## Models

- `enchi_live_edge_table.glb`: live-edge slab, two U-frame supports, mounting plates and bolts; 2.60 × approximately 1.02 × 0.765 metres. Scanned wood colour, normal and roughness maps; softened edges and matte finish.
- `fairafric_booth.glb`: photo-derived cardboard display and individual packages, enlarged 1.6×; approximately 1.00 × 0.86 × 1.06 metres. The steel shelving beneath it has been removed as requested.
- `medtropic_showroom.glb`: both objects on a common ground plane, with fixed scale in AR. About 5.5 MB before HTTP transfer compression.

Geometry follows the supplied photos, with estimated dimensions. These are artist-made models, not exact measured scans. Unseen package sides and structural details are approximated. The wood texture is a real scanned wood material, warmed to suit the reference, rather than the source photo with glare baked into it.

## AR behavior and limits

The initial live-camera composition is a **preview**, not surface tracking. True placement needs the AR button and browser permission. WebXR uses device-supported estimated lighting, fixed scale, floor placement, and tracking guidance. iPhone opens native Quick Look; other Android configurations may open Scene Viewer. Native viewers do not run this page's clickable HTML logo links; return to the page to visit either website. Native controls and rendering vary by device. Quick Look USDZ is generated on demand by model-viewer. No depth occlusion is claimed.

Camera access is local, with no recording or upload. No microphone access is requested. Camera tracks stop when the page is hidden or AR takes over. Camera permission denial, missing devices, model errors, and retry have explicit states.

## Validation

See `TEST-REPORT.md` and the machine-readable reports for actual checks and limitations. Physical iPhone/Android AR tracking still requires a real-device check. Do not infer hardware certification from simulated browser tests.

## Attribution

- Model-viewer 4.3.1, Apache-2.0; bundled locally. See `MODEL-VIEWER-LICENSE.txt`.
- Scanned wood: Poly Haven, American Walnut Veneer, CC0: https://polyhaven.com/a/american_walnut_veneer . Diffuse 2K, normal/roughness 1K; material colour adjusted, applied to a solid slab. https://polyhaven.com/license
- Hanken Grotesk, SIL Open Font License; see `HANKEN-LICENSE.txt`. The enchi wordmark uses the type treatment from https://enchifurniture.com/.
- MedTropic logo and table/display reference photographs supplied by the user. fairafric logo from its official website. Brand artwork remains the property of its respective owners.

Technical references: https://modelviewer.dev/examples/augmentedreality/ and https://developer.mozilla.org/en-US/docs/Web/API/XRSystem/requestSession .
