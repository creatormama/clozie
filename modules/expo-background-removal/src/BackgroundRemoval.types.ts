// Public types for expo-background-removal.
//
// removeBackground(imageUri):
//   - imageUri: local file URI (file://... or absolute path) of a JPEG/PNG/HEIC image.
//   - resolves to: a new local file URI of the cutout composited onto a white background (JPEG),
//                  OR null on any failure (iOS <17, image load error, Vision throw, Android, web).
//
// Caller is responsible for any cleanup of returned temp files if needed.
