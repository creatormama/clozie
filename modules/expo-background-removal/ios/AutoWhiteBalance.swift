import Foundation
import CoreImage
import CoreGraphics

// ============================================================================
// AutoWhiteBalance — Fork-A port of the Phase-1 validated AWB algorithm.
// Build 27 · Phase 2 · Step P2. Ported verbatim from ~/Desktop/clozie-awb-prototype/
// (awb.swift), garment-only, adapted for the real Vision mask (alpha channel).
//
// PURE CoreImage/CoreGraphics/Foundation — NO UIKit, NO ExpoModulesCore — so the
// SAME source compiles under macOS `swiftc` in Phase 1.5 (compile proof) and the
// core statistics run identically there for the mandatory numeric validation
// (1081 must never whiten) BEFORE this ever reaches an EAS build.
//
// WIRED TO NOTHING in Step P2: BackgroundRemovalModule.swift does not call
// AutoWhiteBalance.corrected(...) yet, so runtime output stays byte-identical to
// Build A. This is inert dead code until Step P4 wires it behind a default-off flag.
//
// TWO assumptions in this file are EMPIRICALLY CONFIRMED in Phase 1.5 (macOS, real
// Vision mask) before wiring. If either is wrong, a tiny follow-up commit corrects
// THIS file first, at zero build cost:
//   (1) the masked source is PREMULTIPLIED (FINDINGS Session 11 landmine, carried) —
//       so unpremultiplyingAlpha() yields straight RGB. Phase 1.5 prints known pixels.
//   (2) the toBitmap -> CGImage rebuild is upright and composites with no fringe halo.
//       Phase 1.5 composites confirm this visually.
//
// Fork-A specifics (approved): garment alpha>0.9 estimate guard; centerSigma 0.26 KEPT;
// brightness anchored to the garment near-NEUTRAL set only (never garment-max); apply
// at NATIVE resolution; unpremultiplied LINEAR-sRGB working space for estimate AND apply.
//
// The one intentional textual change from the prototype: explicit Float libm variants
// (expf/tanhf/powf) to remove any overload-resolution fragility — numerically identical.
// ============================================================================

enum AutoWhiteBalance {

  // ---- tuned parameters — FINDINGS final set, verbatim; + alphaEstMin (new fringe guard) ----
  private static let estMaxSide   = 600            // estimation working resolution (scale-invariant)
  private static let clipLinear   : Float = 0.954  // exclude near-clipped (sRGB >= 250)
  private static let lumaLo       : Float = 0.06   // exclude deep shadow (linear luma)
  private static let neutralThresh: Float = 0.10   // provisionally-balanced chroma cutoff for "neutral"
  private static let estIters     = 4
  private static let centerSigma  : Float = 0.26   // Gaussian center-weight sigma (within cropped extent)
  private static let covLo        : Float = 0.005  // gate: 0.5% coverage -> 0
  private static let covHi        : Float = 0.05   // gate: 5% coverage   -> 1
  private static let wbClamp      : Float = 2.0    // per-channel WB gain clamp [1/c, c]
  private static let warmthLo     : Float = 0.14   // warmth factor ramp (below -> no bright lift)
  private static let warmthHi     : Float = 0.35   // warmth factor ramp (above -> full bright lift)
  private static let refPercentile: Float = 0.88   // neutral-set luma percentile = "scene white"
  private static let targetWhite  : Float = 1.0    // scene white reference target (sRGB 255/255)
  private static let brightClampLo: Float = 0.80
  private static let brightClampHi: Float = 3.00
  private static let knee         : Float = 0.85   // highlight rolloff knee (linear)
  private static let protLo       : Float = 0.22   // chroma-protection ramp: below -> full correction
  private static let protHi       : Float = 0.44   // chroma-protection ramp: above -> preserve (revert)
  private static let alphaEstMin  : Float = 0.9    // NEW fringe guard: estimate uses alpha>0.9 pixels only
  // alpha-gated fringe blend ramp — Fork b (phase15D) validated winner, Session 18.
  // HARDCODED, no env dials. fringeBlendHi intentionally == alphaEstMin (0.9): the body cutoff
  // where s==1 (fully corrected) matches the estimate/chroma body guard.
  private static let fringeBlendLo: Float = 0.85   // alpha <= this -> s=0 (keep original fringe)
  private static let fringeBlendHi: Float = 0.90   // alpha >  this -> s=1 (fully corrected body)
  private static let applyMaxSide = 2400           // cap apply-resolution: bounds the transient linear
                                                   // float buffer (~2400^2 * 16B ~= 88MB) so a very large
                                                   // cutout can't spike memory on older iPhones. Above this
                                                   // the output downsizes; below it, native res is preserved.

  private static let linearCS = CGColorSpace(name: CGColorSpace.linearSRGB)!
  private static let srgbCS   = CGColorSpace(name: CGColorSpace.sRGB)!

  // ---- color helpers (verbatim from prototype; explicit Float libm) ----
  @inline(__always) private static func srgbToLin(_ c: Float) -> Float {
    return c <= 0.04045 ? c/12.92 : powf((c+0.055)/1.055, 2.4)
  }
  @inline(__always) private static func linToSrgb(_ c: Float) -> Float {
    let v = max(0, min(1, c))
    return v <= 0.0031308 ? v*12.92 : 1.055*powf(v, 1/2.4) - 0.055
  }
  @inline(__always) private static func luma(_ r: Float,_ g: Float,_ b: Float) -> Float {
    0.2126*r + 0.7152*g + 0.0722*b
  }
  @inline(__always) private static func rolloff(_ v: Float,_ knee: Float) -> Float {
    if v <= knee { return v }
    return knee + (1-knee)*tanhf((v-knee)/(1-knee))
  }
  @inline(__always) private static func smoothstep(_ lo: Float,_ hi: Float,_ x: Float) -> Float {
    let t = max(0, min(1, (x-lo)/(hi-lo))); return t*t*(3-2*t)
  }

  struct Estimate {
    var gainR: Float; var gainG: Float; var gainB: Float   // WB gains (luma-preserving)
    var brightGain: Float
    var coverage: Float
    var gate: Float
    var illumR: Float; var illumG: Float; var illumB: Float
  }

  // ---- render a (straight-alpha) CIImage to a LINEAR-sRGB float RGBA buffer ----
  // Mirrors the prototype's renderLinear exactly (toBitmap, .RGBAf, linear CS). The
  // caller passes an already-unpremultiplied image, so RGB read here is straight.
  private static func renderLinearRGBA(_ ci: CIImage, maxSide: Int, context: CIContext) -> (w: Int, h: Int, px: [Float])? {
    let ext = ci.extent
    guard ext.width > 0, ext.height > 0, ext.width.isFinite, ext.height.isFinite else { return nil }
    let scale = CGFloat(maxSide) / max(ext.width, ext.height)
    let scaled = ci.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
    let w = max(1, Int((ext.width*scale).rounded()))
    let h = max(1, Int((ext.height*scale).rounded()))
    var buf = [Float](repeating: 0, count: w*h*4)
    buf.withUnsafeMutableBytes { raw in
      context.render(scaled, toBitmap: raw.baseAddress!, rowBytes: w*16,
                     bounds: CGRect(x: scaled.extent.origin.x, y: scaled.extent.origin.y,
                                    width: CGFloat(w), height: CGFloat(h)),
                     format: .RGBAf, colorSpace: linearCS)
    }
    return (w, h, buf)
  }

  // ---- illuminant estimate (Fork-A: garment alpha>0.9 only; centerSigma kept) ----
  // Iterative near-neutral refinement (linear). Colored garments stay chromatic after
  // balancing -> rejected here AND protected at apply. neutralPix feeds the brightness ref.
  private static func estimateIlluminant(_ buf: [Float], _ w: Int, _ h: Int) -> Estimate {
    let n = w*h
    let sig = centerSigma
    @inline(__always) func centerW(_ x: Int,_ y: Int) -> Float {
      let nx = Float(x)/Float(w) - 0.5, ny = Float(y)/Float(h) - 0.5
      return expf(-(nx*nx+ny*ny)/(2*sig*sig))
    }
    // Seed: center-weighted gray-world of in-band, non-clipped, garment (alpha>0.9) pixels.
    var sr: Float = 0, sg: Float = 0, sb: Float = 0, sw: Float = 0
    for y in 0..<h { for x in 0..<w {
      let i=(y*w+x)*4
      if buf[i+3] <= alphaEstMin { continue }            // alpha fringe guard
      let r=buf[i], g=buf[i+1], b=buf[i+2]
      if max(r,max(g,b)) < clipLinear && luma(r,g,b) > lumaLo {
        let wc = centerW(x,y); sr+=r*wc; sg+=g*wc; sb+=b*wc; sw+=wc
      }
    }}
    if sw < 1e-3 {
      return Estimate(gainR:1,gainG:1,gainB:1,brightGain:1,coverage:0,gate:0,illumR:1,illumG:1,illumB:1)
    }
    var ir = sr/sw, ig = sg/sw, ib = sb/sw

    var neutralCount = 0
    var neutralPix: [(Float,Float,Float)] = []
    for _ in 0..<estIters {
      var nr: Float = 0, ng: Float = 0, nb: Float = 0, nw: Float = 0, nc = 0
      neutralPix.removeAll(keepingCapacity: true)
      let L0 = luma(ir, ig, ib)
      let gr = L0/max(ir,1e-5), gg = L0/max(ig,1e-5), gb = L0/max(ib,1e-5)
      for y in 0..<h { for x in 0..<w {
        let i=(y*w+x)*4
        if buf[i+3] <= alphaEstMin { continue }          // alpha fringe guard
        let r=buf[i], g=buf[i+1], b=buf[i+2]
        if max(r,max(g,b)) >= clipLinear || luma(r,g,b) <= lumaLo { continue }
        let br = r*gr, bg = g*gg, bb = b*gb
        let mx = max(br,max(bg,bb)), mn = min(br,min(bg,bb))
        if (mx-mn)/max(mx,1e-5) < neutralThresh {
          let wc = centerW(x,y)
          nr += r*wc; ng += g*wc; nb += b*wc; nw += wc; nc += 1
          neutralPix.append((r,g,b))
        }
      }}
      if nw > 1e-3 { ir = nr/nw; ig = ng/nw; ib = nb/nw; neutralCount = nc }
    }

    // Coverage denominator is w*h (crop area). With croppedToInstancesExtent the crop is
    // mostly garment, so the gate saturates to 0 (saturated garment) or 1 (real white) in
    // all non-borderline cases; Phase 1.5 reports cov%/gate per photo to confirm no binding
    // case sits in the 0.5%-5% ramp. If one does, switch the denominator to garment-area.
    let coverage = Float(neutralCount)/Float(n)
    let t = max(0, min(1, (coverage - covLo)/(covHi - covLo)))
    let gate = t*t*(3 - 2*t)

    // FULL luma-preserving WB: neutralize the illuminant to (L,L,L), gate-blended, clamped.
    let L = luma(ir, ig, ib)
    var gR = L/max(ir,1e-5), gG = L/max(ig,1e-5), gB = L/max(ib,1e-5)
    gR = 1 + gate*(gR-1); gG = 1 + gate*(gG-1); gB = 1 + gate*(gB-1)
    func clampG(_ x: Float) -> Float { max(1/wbClamp, min(wbClamp, x)) }
    gR = clampG(gR); gG = clampG(gG); gB = clampG(gB)

    // WARMTH factor: daylight ~0, warm indoor ~1. Disambiguates "dim warm -> lift" from
    // "correctly-exposed daylight -> leave".
    let warmthAmt = max(gR,gB)/max(min(gR,gB),1e-5) - 1
    let wt = max(0, min(1, (warmthAmt - warmthLo)/(warmthHi - warmthLo)))
    let warmthFactor = wt*wt*(3 - 2*wt)

    // Brightness reference: high percentile of the neutral set's post-WB luma = the scene's
    // reflective white surface. Lift maps it -> ~255, GATED by coverage AND warmth. A chromatic
    // camel has no neutral pixels here -> no lift (this is the 1081 guardrail Phase 1.5 measures).
    var neutralLuma: [Float] = []
    for p in neutralPix { neutralLuma.append(luma(p.0*gR, p.1*gG, p.2*gB)) }
    var brightGain: Float = 1
    if neutralLuma.count > 20 {
      neutralLuma.sort()
      let idx = min(neutralLuma.count-1, Int(Float(neutralLuma.count-1)*refPercentile))
      let refLuma = max(neutralLuma[idx], 1e-4)
      let raw = srgbToLin(targetWhite)/refLuma
      brightGain = 1 + gate*warmthFactor*(raw-1)
      brightGain = max(brightClampLo, min(brightClampHi, brightGain))
    }
    return Estimate(gainR:gR,gainG:gG,gainB:gB,brightGain:brightGain,coverage:coverage,gate:gate,illumR:ir,illumG:ig,illumB:ib)
  }

  // ---- apply correction to a linear RGBA buffer -> sRGB8 RGBA (per-pixel alpha preserved) ----
  // RGB-only correction with per-pixel chroma protection (post-correction chroma lerp). The
  // `correct` flag exists so Phase 1.5 can render before/after from the identical body; the
  // module always passes true.
  private static func applyCorrectionRGBA(_ buf: [Float], _ w: Int, _ h: Int, _ e: Estimate, correct: Bool = true) -> [UInt8] {
    let n = w*h
    var out = [UInt8](repeating: 0, count: n*4)
    let tr = e.gainR*e.brightGain, tg = e.gainG*e.brightGain, tb = e.gainB*e.brightGain
    for i in 0..<n {
      let r0 = buf[i*4], g0 = buf[i*4+1], b0 = buf[i*4+2], a0 = buf[i*4+3]
      var r = r0, g = g0, b = b0
      if correct {
        // provisional fully-corrected pixel
        let pr = rolloff(r0*tr, knee), pg = rolloff(g0*tg, knee), pb = rolloff(b0*tb, knee)
        // CHROMA PROTECTION: strength from the POST-correction chroma. A warm white becomes
        // neutral here (low chroma) -> full correction; a true color stays chromatic -> revert.
        let mx = max(pr,max(pg,pb)), mn = min(pr,min(pg,pb))
        let provChroma = (mx-mn)/max(mx,1e-5)
        let s = 1 - smoothstep(protLo, protHi, provChroma)
        r = r0 + s*(pr-r0); g = g0 + s*(pg-g0); b = b0 + s*(pb-b0)
      }
      out[i*4]   = UInt8(max(0,min(255, (linToSrgb(r)*255).rounded())))
      out[i*4+1] = UInt8(max(0,min(255, (linToSrgb(g)*255).rounded())))
      out[i*4+2] = UInt8(max(0,min(255, (linToSrgb(b)*255).rounded())))
      out[i*4+3] = UInt8(max(0,min(255, (a0*255).rounded())))     // preserve per-pixel alpha
    }
    return out
  }

  // ---- rebuild a straight-alpha sRGB8 CIImage from the corrected buffer ----
  private static func bufferToCIImage(_ px: [UInt8], _ w: Int, _ h: Int) -> CIImage? {
    guard let provider = CGDataProvider(data: Data(px) as CFData) else { return nil }
    guard let cg = CGImage(width: w, height: h, bitsPerComponent: 8, bitsPerPixel: 32,
                           bytesPerRow: w*4, space: srgbCS,
                           bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
                           provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent)
    else { return nil }
    return CIImage(cgImage: cg)
  }

  // ---- public entry point: correct a masked (alpha) CIImage, garment-only ----
  // Returns the corrected CIImage, or nil on any failure (caller falls back to the input).
  static func corrected(_ masked: CIImage) -> CIImage? {
    let ctx = CIContext(options: [.workingColorSpace: linearCS, .outputColorSpace: linearCS])
    // Source is premultiplied (FINDINGS Session 11 landmine) — confirmed in Phase 1.5.
    let straight = masked.unpremultiplyingAlpha()

    // Estimate at estMaxSide (global stats are scale-invariant).
    guard let est = renderLinearRGBA(straight, maxSide: estMaxSide, context: ctx) else { return nil }
    let e = estimateIlluminant(est.px, est.w, est.h)

    // Straight linear reference at capped-native res — chroma stat AND blend base.
    let nativeMaxSide = min(applyMaxSide, Int(max(masked.extent.width, masked.extent.height).rounded()))
    guard let refLin = renderLinearRGBA(straight, maxSide: nativeMaxSide, context: ctx) else { return nil }

    // Garment-level chroma protection scalar sC (mean provisional-corrected chroma, body pixels).
    // A warm white becomes neutral after correction (low chroma) -> sC~1 -> full correction; a true
    // color stays chromatic -> sC~0 -> identity gains -> no shift. Whole-garment decision, not per-pixel.
    let tr = e.gainR * e.brightGain, tg = e.gainG * e.brightGain, tb = e.gainB * e.brightGain
    var sumChroma: Float = 0; var nBody = 0
    for i in 0..<(refLin.w * refLin.h) {
      if refLin.px[i*4+3] <= alphaEstMin { continue }          // body pixels only (same guard as estimate)
      let pr = rolloff(refLin.px[i*4]   * tr, knee)
      let pg = rolloff(refLin.px[i*4+1] * tg, knee)
      let pb = rolloff(refLin.px[i*4+2] * tb, knee)
      let mx = max(pr, max(pg, pb)), mn = min(pr, min(pg, pb))
      sumChroma += (mx - mn) / max(mx, 1e-5)
      nBody += 1
    }
    let meanBodyChroma = nBody > 0 ? sumChroma / Float(nBody) : 0
    let sC = 1 - smoothstep(protLo, protHi, meanBodyChroma)

    // Attenuate WB gains AND brightGain toward identity by sC. sC=1 -> full correction; sC=0 -> identity.
    let gR = 1 + sC * (e.gainR - 1)
    let gG = 1 + sC * (e.gainG - 1)
    let gB = 1 + sC * (e.gainB - 1)
    let g  = 1 + sC * (e.brightGain - 1)

    // Spatially UNIFORM correction: WB as a diagonal CIColorMatrix (alpha row preserves alpha),
    // brightness as CIExposureAdjust (EV = log2 g), in the linear working space. NO per-pixel apply.
    let wb = straight.applyingFilter("CIColorMatrix", parameters: [
      "inputRVector": CIVector(x: CGFloat(gR), y: 0, z: 0, w: 0),
      "inputGVector": CIVector(x: 0, y: CGFloat(gG), z: 0, w: 0),
      "inputBVector": CIVector(x: 0, y: 0, z: CGFloat(gB), w: 0),
      "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
      "inputBiasVector": CIVector(x: 0, y: 0, z: 0, w: 0)
    ])
    let ev = log2f(max(g, 1e-4))
    let correctedCI = wb.applyingFilter("CIExposureAdjust", parameters: ["inputEV": CGFloat(ev)])

    guard let ciLin = renderLinearRGBA(correctedCI, maxSide: nativeMaxSide, context: ctx),
          ciLin.w == refLin.w, ciLin.h == refLin.h else { return nil }

    // Alpha-gated fringe blend (Fork b / phase15D): s = smoothstep(fringeBlendLo, fringeBlendHi, alpha).
    // s=1 body (alpha > 0.9) -> corrected; s=0 fringe (alpha <= 0.85) -> ORIGINAL. The edge-metric band
    // (0.05..0.9) lands on the protected side, so the soft silhouette is kept -> no Build-28 dissolve.
    // The blend only ever moves a fringe pixel TOWARD its original value, never further.
    var blended = [Float](repeating: 0, count: ciLin.w * ciLin.h * 4)
    for i in 0..<(ciLin.w * ciLin.h) {
      let a = refLin.px[i*4+3]
      let s = smoothstep(fringeBlendLo, fringeBlendHi, a)
      blended[i*4]   = refLin.px[i*4]   + s * (ciLin.px[i*4]   - refLin.px[i*4])
      blended[i*4+1] = refLin.px[i*4+1] + s * (ciLin.px[i*4+1] - refLin.px[i*4+1])
      blended[i*4+2] = refLin.px[i*4+2] + s * (ciLin.px[i*4+2] - refLin.px[i*4+2])
      blended[i*4+3] = ciLin.px[i*4+3]                          // alpha passthrough (== refLin alpha)
    }

    // Linear float -> straight-alpha sRGB8 (identity estimate = pure linToSrgb, per-pixel alpha preserved).
    let idEst = Estimate(gainR:1,gainG:1,gainB:1,brightGain:1,coverage:0,gate:0,illumR:1,illumG:1,illumB:1)
    let out = applyCorrectionRGBA(blended, ciLin.w, ciLin.h, idEst, correct: false)
    return bufferToCIImage(out, ciLin.w, ciLin.h)
  }
}
