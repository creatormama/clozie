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
  shadowColorR?: number;
  shadowColorG?: number;
  shadowColorB?: number;
  // 'jpeg-white' (default) = today's composite-over-white JPEG.
  // 'png' = transparent cutout, no white composite.
  outputFormat?: 'jpeg-white' | 'png';

  // Build 27: garment-only correction, applied after the cutout. DORMANT — every field
  // defaults to identity (0 = off) in the native Record; Build B turns a layer on by
  // passing a non-zero value here (JS only, no Swift recompile).
  wbTemperature?: number;  // delta from neutral; 0 = no white-balance shift
  wbTint?: number;         // green(-)/magenta(+) delta; 0 = no tint shift
  exposureEV?: number;     // CIExposureAdjust EV; 0 = no exposure lift
  edgeChokePx?: number;    // alpha erosion in px; 0 = no choke
  edgeSharpness?: number;  // 0..1 alpha-ramp steepen; 0 = no ramp change

  // Build 27 Phase 2: garment-only automatic white balance (validated Fork-A AWB).
  // false/omitted = OFF (default, byte-identical to Build A). true = correct the cut garment.
  autoWhiteBalance?: boolean;
}
