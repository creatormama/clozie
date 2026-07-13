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

public class BackgroundRemovalModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackgroundRemoval")

    AsyncFunction("removeBackground") { (imageUri: String, options: RemoveBackgroundOptions?) -> String? in
      // Vision foreground instance mask requires iOS 17+.
      guard #available(iOS 17.0, *) else { return nil }

      let path = imageUri.hasPrefix("file://")
        ? String(imageUri.dropFirst(7))
        : imageUri

      guard let input = UIImage(contentsOfFile: path),
            let cgImage = input.cgImage else { return nil }

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
        let whiteBg = CIImage(color: .white).cropped(to: foreground.extent)
        let composited = foreground.composited(over: whiteBg)

        let context = CIContext()
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
