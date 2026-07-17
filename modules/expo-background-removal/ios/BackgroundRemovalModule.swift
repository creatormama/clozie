import ExpoModulesCore
import UIKit
import Vision

// Build 26: JS-tunable options. All defaults are NO-OP — with no options (or a
// nil/partial record) the pipeline produces the exact Build 25 white-JPEG cutout.
// The new look is turned on entirely from App.js by passing explicit values.
struct RemoveBackgroundOptions: Record {
  @Field var enhanceStrength: Double = 0          // 0 = no enhance
  @Field var shadowOpacity: Double = 0            // 0 = no baked shadow
  @Field var shadowBlur: Double = 0
  @Field var shadowOffsetX: Double = 0
  @Field var shadowOffsetY: Double = 0
  @Field var shadowColorR: Double = 0.5           // soft gray, never pure black
  @Field var shadowColorG: Double = 0.5
  @Field var shadowColorB: Double = 0.5
  @Field var outputFormat: String = "jpeg-white"  // 'jpeg-white' | 'png'

  // Build 27 (Build A): dormant garment-only correction. ALL default to identity —
  // at these values the helpers early-return the exact input (see guards below), so
  // output stays byte-identical to Build A's JS tuning alone. Build B flips these in
  // JS only (no Swift recompile) to turn each layer on.
  @Field var wbTemperature: Double = 0   // delta from neutral; 0 = no white-balance shift
  @Field var wbTint: Double = 0          // green(−)/magenta(+) delta; 0 = no tint shift
  @Field var exposureEV: Double = 0      // CIExposureAdjust EV; 0 = no exposure lift
  @Field var edgeChokePx: Double = 0     // alpha erosion in px; 0 = no choke
  @Field var edgeSharpness: Double = 0   // 0..1 alpha-ramp steepen; 0 = no ramp change

  // Build 27 (Phase 2): garment-only automatic white balance (the validated Fork-A AWB).
  // false = OFF (default, byte-identical to Build A). true = run AutoWhiteBalance.corrected
  // on the cut garment. Wired at the correction chain in P4; flipped on from App.js in P5.
  @Field var autoWhiteBalance: Bool = false
}

private extension UIImage {
  // Returns an upright copy with UIImage.imageOrientation baked into pixels.
  // No-op for already-upright images (returns self). Preserves scale, so pixel
  // dimensions are unchanged — production passes an EXIF-baked .up JPEG, so this
  // leaves the Build 25 output byte-identical.
  func normalizedUp() -> UIImage {
    guard imageOrientation != .up else { return self }
    let format = UIGraphicsImageRendererFormat.default()
    format.scale = scale
    format.opaque = false
    let renderer = UIGraphicsImageRenderer(size: size, format: format)
    return renderer.image { _ in
      draw(in: CGRect(origin: .zero, size: size))
    }
  }
}

// Auto-enhance a CGImage using Core Image's autoAdjustmentFilters, blended with the
// original by `strength` (0 = original, 1 = fully corrected). Returns the input
// unchanged when strength <= 0 or on any failure — never breaks the pipeline.
fileprivate func autoEnhancedCGImage(_ cgImage: CGImage, strength: Double) -> CGImage {
  guard strength > 0 else { return cgImage }
  let original = CIImage(cgImage: cgImage)
  var enhanced = original
  for filter in original.autoAdjustmentFilters() {
    filter.setValue(enhanced, forKey: kCIInputImageKey)
    if let out = filter.outputImage {
      enhanced = out
    }
  }
  let t = min(max(strength, 0), 1)
  let blended: CIImage
  if t >= 1 {
    blended = enhanced
  } else if let mix = CIFilter(name: "CIDissolveTransition", parameters: [
    kCIInputImageKey: original,
    kCIInputTargetImageKey: enhanced,
    kCIInputTimeKey: t
  ])?.outputImage {
    blended = mix
  } else {
    blended = enhanced
  }
  let ctx = CIContext()
  guard let out = ctx.createCGImage(blended, from: original.extent) else { return cgImage }
  return out
}

// Builds a garment-over-shadow CIImage from the alpha silhouette: a blurred,
// offset, tinted copy of the mask composited UNDER the garment. Returns the
// foreground unchanged when shadowOpacity <= 0.
fileprivate func shadowedForeground(_ foreground: CIImage, options: RemoveBackgroundOptions?) -> CIImage {
  let opacity = options?.shadowOpacity ?? 0
  guard opacity > 0 else { return foreground }

  let r = options?.shadowColorR ?? 0.5
  let g = options?.shadowColorG ?? 0.5
  let b = options?.shadowColorB ?? 0.5
  let blur = options?.shadowBlur ?? 0
  let dx = options?.shadowOffsetX ?? 0
  let dy = options?.shadowOffsetY ?? 0

  // 1. Silhouette in the shadow color, shaped by the garment's alpha.
  let solid = CIImage(color: CIColor(red: r, green: g, blue: b, alpha: 1))
  var shadow = solid.applyingFilter("CISourceInCompositing", parameters: [
    kCIInputBackgroundImageKey: foreground
  ])
  // 2. Soften the edges.
  if blur > 0 {
    shadow = shadow.applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: blur])
  }
  // 3. Scale alpha by opacity (layer transparency).
  shadow = shadow.applyingFilter("CIColorMatrix", parameters: [
    "inputAVector": CIVector(x: 0, y: 0, z: 0, w: opacity)
  ])
  // 4. Offset. CI space is y-up, so a positive `dy` (downward on screen) is -dy here.
  shadow = shadow.transformed(by: CGAffineTransform(translationX: dx, y: -dy))

  // 5. Garment crisply on top of its shadow.
  return foreground.composited(over: shadow)
}

// Garment-only white balance (opt-in via wbTemperature/wbTint != 0): neutralizes an
// ambient color cast on the already-cut garment. CITemperatureAndTint remaps the assumed
// source neutral to a target, expressed here as a delta from 6500K/0 so identity is 0/0.
// Negative wbTemperature cools a warm cast; positive deepens it. Returns the exact input at
// identity, or on any failure — never breaks the pipeline. DORMANT at Build A defaults.
fileprivate func whiteBalancedForeground(_ foreground: CIImage, options: RemoveBackgroundOptions?) -> CIImage {
  let temp = options?.wbTemperature ?? 0
  let tint = options?.wbTint ?? 0
  guard temp != 0 || tint != 0 else { return foreground }
  guard let filter = CIFilter(name: "CITemperatureAndTint", parameters: [
    kCIInputImageKey: foreground,
    "inputNeutral": CIVector(x: 6500 + temp, y: tint),
    "inputTargetNeutral": CIVector(x: 6500, y: 0)
  ]), let out = filter.outputImage else { return foreground }
  return out
}

// Garment-only exposure lift (opt-in via exposureEV != 0): brightens/darkens the cut
// garment via CIExposureAdjust (inputEV, 0 = identity). Returns the exact input at
// identity, or on any failure — never breaks the pipeline. DORMANT at Build A defaults.
fileprivate func exposureAdjustedForeground(_ foreground: CIImage, options: RemoveBackgroundOptions?) -> CIImage {
  let ev = options?.exposureEV ?? 0
  guard ev != 0 else { return foreground }
  guard let filter = CIFilter(name: "CIExposureAdjust", parameters: [
    kCIInputImageKey: foreground,
    kCIInputEVKey: ev
  ]), let out = filter.outputImage else { return foreground }
  return out
}

// Garment-only edge treatment (opt-in via edgeChokePx/edgeSharpness != 0): tightens the
// matte BEFORE the shadow is derived from it. edgeChokePx erodes the alpha silhouette
// inward (CIMorphologyMinimum radius); edgeSharpness steepens the alpha ramp around 0.5
// so soft feathered edges read crisper (CIColorMatrix on the alpha channel, then clamp).
// Returns the exact input at identity, or on any failure — never breaks the pipeline.
// DORMANT at Build A defaults.
// CAVEAT: the ACTIVE path is UNVERIFIED — CIMorphologyMinimum also darkens RGB near the
// edge and the alpha ramp interacts with premultiplication. Eyeball on-device before
// Build B locks values; the active path may need a native revision (not JS-only).
fileprivate func chokedForeground(_ foreground: CIImage, options: RemoveBackgroundOptions?) -> CIImage {
  let choke = options?.edgeChokePx ?? 0
  let sharpness = options?.edgeSharpness ?? 0
  guard choke != 0 || sharpness != 0 else { return foreground }

  var result = foreground

  // Erode the silhouette inward by `choke` px.
  if choke > 0 {
    result = result.applyingFilter("CIMorphologyMinimum", parameters: [
      kCIInputRadiusKey: choke
    ]).cropped(to: foreground.extent)
  }

  // Steepen the alpha ramp around 0.5: a' = clamp((a - 0.5) * k + 0.5).
  if sharpness > 0 {
    let k = 1 + sharpness * 4   // sharpness 0..1 -> slope 1..5
    result = result.applyingFilter("CIColorMatrix", parameters: [
      "inputAVector": CIVector(x: 0, y: 0, z: 0, w: k),
      "inputBiasVector": CIVector(x: 0, y: 0, z: 0, w: 0.5 - 0.5 * k)
    ])
    result = result.applyingFilter("CIColorClamp")
  }

  return result
}

public class BackgroundRemovalModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackgroundRemoval")

    AsyncFunction("removeBackground") { (imageUri: String, options: RemoveBackgroundOptions?) -> String? in
      // Vision foreground instance mask requires iOS 17+.
      guard #available(iOS 17.0, *) else { return nil }

      let path = imageUri.hasPrefix("file://")
        ? String(imageUri.dropFirst(7))
        : imageUri

      guard let input = UIImage(contentsOfFile: path) else { return nil }
      // EXIF rider: input.cgImage ignores UIImage.imageOrientation, so a photo that
      // carries EXIF rotation would be processed sideways. Redraw upright first.
      let upright = input.normalizedUp()
      guard let cgImage = upright.cgImage else { return nil }

      // Auto-enhance (opt-in via enhanceStrength > 0), applied BEFORE masking on the
      // EXIF-normalized image. Best-effort: any failure falls back to the original.
      // enhanceStrength defaults to 0, so this is a no-op unless App.js opts in.
      let processedCG = autoEnhancedCGImage(cgImage, strength: options?.enhanceStrength ?? 0)

      do {
        let request = VNGenerateForegroundInstanceMaskRequest()
        let handler = VNImageRequestHandler(cgImage: processedCG, options: [:])
        try handler.perform([request])

        guard let result = request.results?.first else { return nil }

        let maskedPixelBuffer = try result.generateMaskedImage(
          ofInstances: result.allInstances,
          from: handler,
          croppedToInstancesExtent: true
        )

        let foreground = CIImage(cvPixelBuffer: maskedPixelBuffer)
        let context = CIContext()

        // Garment-only correction chain (all DORMANT at Build A defaults — each helper
        // early-returns the exact input, so `corrected` == `foreground` and output stays
        // byte-identical to the JS tuning alone). WB + exposure fix the cut garment's
        // color; the edge choke tightens the matte. Choke runs BEFORE the shadow so the
        // baked shadow derives from the CHOKED mask (shadowedForeground shapes the shadow
        // from the alpha it is handed).
        var corrected = foreground
        corrected = whiteBalancedForeground(corrected, options: options)
        corrected = exposureAdjustedForeground(corrected, options: options)
        corrected = chokedForeground(corrected, options: options)

        // Baked silhouette shadow (opt-in via shadowOpacity > 0): composited UNDER the
        // garment. No-op when shadowOpacity <= 0, so `subject` == `corrected`.
        let subject = shadowedForeground(corrected, options: options)

        // Transparent PNG branch (opt-in via outputFormat: "png"): encode the
        // alpha-bearing cutout directly, skipping the white composite. The default
        // jpeg-white path below stays byte-identical to Build 25.
        if options?.outputFormat == "png" {
          guard let outputCG = context.createCGImage(subject, from: subject.extent) else { return nil }
          let outputImage = UIImage(cgImage: outputCG)
          guard let pngData = outputImage.pngData() else { return nil }
          let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("clozie-bg-removed-\(UUID().uuidString).png")
          try pngData.write(to: tempURL)
          return tempURL.absoluteString
        }

        // Default (jpeg-white) — composite over white, encode JPEG q0.9.
        let whiteBg = CIImage(color: .white).cropped(to: subject.extent)
        let composited = subject.composited(over: whiteBg)
        guard let outputCG = context.createCGImage(composited, from: composited.extent) else { return nil }
        let outputImage = UIImage(cgImage: outputCG)
        guard let jpegData = outputImage.jpegData(compressionQuality: 0.9) else { return nil }
        let tempURL = FileManager.default.temporaryDirectory
          .appendingPathComponent("clozie-bg-removed-\(UUID().uuidString).jpg")
        try jpegData.write(to: tempURL)
        return tempURL.absoluteString
      } catch {
        return nil
      }
    }
  }
}
