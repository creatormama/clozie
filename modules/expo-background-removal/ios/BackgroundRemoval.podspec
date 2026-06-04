Pod::Spec.new do |s|
  s.name           = 'BackgroundRemoval'
  s.version        = '0.1.0'
  s.summary        = 'Apple Vision background removal for Clozie wardrobe photos.'
  s.description    = 'On-device background removal using VNGenerateForegroundInstanceMaskRequest (iOS 17+). Composites the detected subject onto a white background and returns a local JPEG URI. Returns nil on older iOS or any failure.'
  s.author         = 'Clozie'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
