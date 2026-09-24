# MedTropic AR — Blender edition test report

Release: blender-20260924-1. Checked 24 September 2026.

- HTML, CSS and JavaScript validation passed. Local HTML/CSS/manifest references resolve under the GitHub Pages-style subpath.
- All 20 GLBs pass the Khronos validator with zero errors and zero warnings. Textures and buffers are embedded. Every model was loaded and rendered in the browser and its floor origin checked. Models are under 8 MB each.
- Browser checks passed for rear-camera preference, microphone exclusion, camera playback, permission denial and retry, model loading failure and recovery, exact brand links, 390×844 / 360×640 / 844×390 layouts, direct model taps, vertical wheel and touch-style swipes, AR handoff, and camera recovery after simulated AR exit.
- Samsung Internet simulation passed: Scene Viewer preferred; actual generated Android intent points to the selected GLB; transient user activation preserved; camera released; Open in Chrome link preserves selected product. This was desktop Chrome with Samsung user-agent and touch emulation, not a physical Samsung phone.
- New white transparent logo treatment visually reviewed. Table and stand are separated in the actual combined model. Every product was visually reviewed in a contact sheet.
- Print and digital card PDFs rendered and visually checked. Two pages each; 85×55 mm trim, 3 mm bleed on print version. QR decoded from the card proof and standalone QR to https://frzreik.github.io/medtropic-ar-realistic/ .
- Service-worker scope and offline showroom reload checked.

Physical iPhone Quick Look, Samsung/Android floor detection, room lighting, scale perception and tracking require a real-device acceptance test. Browser simulation cannot prove those hardware behaviors. Models are artist-made reconstructions; no scan accuracy or depth occlusion is claimed. The 5 m waterfall is a bespoke concept. Bars/ingredients are enlarged display models.

## Phone acceptance check

1. Scan the QR with the phone camera and open the HTTPS page; allow rear-camera access.
2. Confirm white logos and a clear gap between the table and stand. Tap the table, swipe vertically on the model, then open AR and check floor contact/resizing.
3. Return to the page, tap the chocolate stand and swipe bars. Launch the selected bar in AR. Samsung Internet should hand off to Scene Viewer when installed and supported.
4. Check brand links, camera-denial recovery and an AR exit/return. If the scan opens an embedded browser, use the Help link to open Chrome.
