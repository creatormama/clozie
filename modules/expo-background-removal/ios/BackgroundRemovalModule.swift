import ExpoModulesCore
import UIKit
import Vision

public class BackgroundRemovalModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackgroundRemoval")

    AsyncFunction("removeBackground") { (imageUri: String) -> String? in
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
