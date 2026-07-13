// Public types for expo-background-removal.
//
// removeBackground(imageUri):
//   - imageUri: local file URI (file://... or absolute path) of a JPEG/PNG/HEIC image.
//   - resolves to: a new local file URI of the cutout composited onto a white background (JPEG),
//                  OR null on any failure (iOS <17, image load error, Vision throw, Android, web).
//
// Caller is responsible for any cleanup of returned temp files if needed.

// ---- Build 26: options for removeBackground ----
// ALL fields optional. Omitting the options object (or any field) preserves the
// exact Build 25 behavior: white-background JPEG, no enhance, no shadow.
// The new look is opt-in — App.js passes explicit values to turn it on.
export interface RemoveBackgroundOptions {
  // 0 = no enhance (default). 1 = full autoAdjustmentFilters. Blends original↔corrected.
  enhanceStrength?: number;
  // 0 = no baked shadow (default). 0..1 opacity of the silhouette shadow.
  shadowOpacity?: number;
  // Gaussian blur radius (px) for the shadow. Ignored when shadowOpacity is 0.
  shadowBlur?: number;
  // Shadow offset in px. Small downward default recipe applied by the caller, not here.
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // Shadow tint, each channel 0..1. Soft gray, never pure black.
  shadowColor?: { r: number; g: number; b: number };
  // 'jpeg-white' (default) = today's composite-over-white JPEG.
  // 'png' = transparent cutout, no white composite.
  outputFormat?: 'jpeg-white' | 'png';
}
