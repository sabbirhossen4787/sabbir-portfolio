# Portfolio V4 fixes

- Consolidated duplicate Hero image transform/style controls in the Visual Editor.
- Hero image Scale/X/Y now has one authoritative control panel.
- Slider/drag gestures are live during interaction but create a single undo history entry on release.
- Undo now treats 100 -> 150 in one slider gesture as one action; separate gestures 100 -> 120 -> 150 undo to 120, then 100.
- Added Reset Position & Scale for Hero images.
- Added Reset Alignment and Reset Style for generic visual elements.
- About images are auto-fit with `object-cover`; Visual Editor no longer exposes drag/resize/scale controls for About image frames.
- Hero headline Font Size and Transform Scale are now separate; removed double-scaling.
- Visual Editor applies text style directly to the same text nodes used by the live Hero.
- Matched major Hero preview spacing, review-card sizing/positioning, background opacity/object positioning, and brands strip styling between editor and live page.
