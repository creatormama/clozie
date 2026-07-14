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

      do {
        let request = VNGenerateForegroundInstanceMaskRequest()
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try handler.perform([request])

        guard let result = request.results?.first else { return nil }

        let maskedPixelBuffer = try result.generateMaskedImage(
          ofInstances: result.allInstances,
          from: handler,
          croppedToInstancesExtent: true
        )

        let foreground = CIImage(cvPixelBuffer: maskedPixelBuffer)
        let context = CIContext()

        // Transparent PNG branch (opt-in via outputFormat: "png"): encode the
        // alpha-bearing cutout directly, skipping the white composite. The default
        // jpeg-white path below stays byte-identical to Build 25.
        if options?.outputFormat == "png" {
          guard let outputCG = context.createCGImage(foreground, from: foreground.extent) else { return nil }
          let outputImage = UIImage(cgImage: outputCG)
          guard let pngData = outputImage.pngData() else { return nil }
          let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("clozie-bg-removed-\(UUID().uuidString).png")
          try pngData.write(to: tempURL)
          return tempURL.absoluteString
        }

        // Default (jpeg-white) — composite over white, encode JPEG q0.9.
        let whiteBg = CIImage(color: .white).cropped(to: foreground.extent)
        let composited = foreground.composited(over: whiteBg)
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
