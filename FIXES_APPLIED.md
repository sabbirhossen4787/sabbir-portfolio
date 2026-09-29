# Sabbir Portfolio Visual Editor Fixes

- Visual Editor preview now renders the exact live section component tree inside the editor for desktop, tablet, and mobile.
- Selecting a section shows only that section in the preview; navbar/footer are removed from editor-preview mode.
- Preview height follows the rendered section height.
- Hero primary and secondary buttons are independent editor elements and can be moved/scaled separately, including mobile/tablet responsive offsets.
- Hero background image uses a fixed frame; transforms move/scale the image inside the frame rather than moving the frame.
- Added an editable Hero White Line element with move, scale, opacity, and rotation controls.
- Brands & Clients strip is selectable and can be moved/scaled responsively.
- Mobile hero overlay changed from the desktop left gradient to a bottom-to-top gradient that fades to transparent at the top.
- Added image-selection/edit targets for service images, project covers, reel thumbnails, showreel thumbnail, testimonial avatars, and tool logos.
- Added universal transform controls for image/card elements.
- TypeScript check passes with `tsc --noEmit`.

Note: `next build` could not be completed in the isolated environment because Next attempted to download its SWC binary from npm and network access was unavailable. This is an environment/network limitation, not a TypeScript error.
