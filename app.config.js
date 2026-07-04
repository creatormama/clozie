import 'dotenv/config';

export default {
  expo: {
    name: 'Clozie',
    slug: 'clozie',
    version: '1.0.2',
    icon: "./assets/clozie-icon-sage-larger-1024.png",
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    ios: {
      bundleIdentifier: "com.clozie.app",
      supportsTablet: false,
      infoPlist: {
        NSCameraUsageDescription: "Clozie uses your camera to photograph wardrobe items.",
        NSPhotoLibraryUsageDescription: "Clozie needs access to your photo library so you can add wardrobe items.",
        UIDesignRequiresCompatibility: true,
        ITSAppUsesNonExemptEncryption: false,
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
        ],
        NSPrivacyTracking: false,
        NSPrivacyTrackingDomains: [],
        NSPrivacyCollectedDataTypes: [],
      },
    },
    plugins: [
      "expo-font",
      "expo-apple-authentication",
      ["expo-splash-screen", {
        "image": "./assets/splash-clozie.png",
        "backgroundColor": "#E8E4CE",
        "imageWidth": 220
      }],
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "4349e179-c2f9-442f-a6f7-edb315bb80d6",
      },
    },
  },
};
