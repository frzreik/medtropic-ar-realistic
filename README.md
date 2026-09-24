# MedTropic — In your space

Camera-first AR showroom for enchi furniture and fairafric chocolate. Blender edition, 24 September 2026.

All 20 GLB scenes were rebuilt/exported in Blender. Baked color, normal and roughness maps give the ingredients textured surfaces; grain-aligned wood maps provide soft, varied reflections. The combined scene has approximately 0.87 m of clear separation between the table and stand. Brand logos are white with transparent backgrounds and float above the relevant piece. Product packaging retains its original artwork.

Live address intended for deployment: https://frzreik.github.io/medtropic-ar-realistic/
QR page: https://frzreik.github.io/medtropic-ar-realistic/qr.html

Open the site, allow camera access, and see the two-brand showroom. The enchi and fairafric banners float independently above the objects and link to their sites. Tap either 3D object, then swipe up or down on the model (or use a mouse wheel) to browse its products without a visible list or typed product labels. The product indicator shows position only. Tap **Open AR · place on floor** to launch the selected model in supported floor-tracked AR.

The chocolate collection includes the 13 bars listed on fairafric's official bar collection on 24 September 2026. The exhibition-scale bars stand without a pedestal and have individually modeled 3D ingredient forms, including sculpted cacao pods, nuts and fruit. Product pages contain the full legal ingredients and current availability. Enchi previews include the original 2.6 m photo-derived table, listed 3.75 m Albizia waterfall, listed 1.23 m live-edge low table, listed 5.7 m Sapele dining table, and a clearly labeled bespoke 5 m waterfall **concept** based on Albizia. The updated tables use Albizia figure, Sapele ribbon grain, and an irregular end-grain low-table slab. The concept is not represented as a listed Enchi SKU.

## Deployment

Static website, no build step or server secrets. Upload every file to the repository root. Set GitHub Pages to main / (root). HTTPS is required for camera and AR. The existing business-card QR points to the same URL, so it remains valid once this version is published.

## AR behavior

The live camera is an immediate preview, not floor tracking. One tap launches native AR. On iPhone this is Quick Look; Android uses WebXR or Scene Viewer when supported. AR launches the **selected** model, with metric furniture dimensions and resizable placement. Native viewers do not carry the web carousel or HTML links: return to the page to choose another product. Chrome and Safari device support, lighting estimation, and floor detection vary by phone. A simulated browser test cannot certify physical tracking. No depth occlusion is claimed.

The user-supplied booth and table references are photo-derived 3D interpretations, not measured scans. Ingredient forms are artist-made meshes, not 3D scans. Official product images are used as chocolate wrapper references inside the 3D files. Table materials use original generated Albizia, Sapele, walnut and end-grain base-color textures with grain-derived normal and roughness maps baked in Blender. All GLB textures are embedded.

Samsung Internet prioritizes Google's Scene Viewer. An Open in Chrome link in Help retains the selected product when changing browsers. This route was tested with a Samsung browser user agent and actual generated Android intent; it is not a physical Samsung certification. Floor tracking requires a supported phone and its AR services.

The redesigned business card is included as a two-page print PDF (85 × 55 mm trim, 3 mm bleed) and digital PDF. The QR destination is unchanged. Editable Blender sources are supplied in the separate delivery folder, outside the website repository.

## Validation and attribution

See `TEST-REPORT.md`. Model-viewer 4.3.1 is bundled under Apache-2.0 (`MODEL-VIEWER-LICENSE.txt`). Hanken Grotesk is bundled under SIL OFL (`HANKEN-LICENSE.txt`). Poly Haven Natural Walnut Veneer maps are CC0: https://polyhaven.com/a/natural_walnut_veneer . Product names, ingredient information and product images are from https://www.fairafric.com/en/collections/tafelschokolade and https://enchifurniture.com/ . Brand artwork remains with its respective owners.
