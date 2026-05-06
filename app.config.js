import 'dotenv/config';

export default {
  expo: {
    name: 'Clozie',
    slug: 'clozie',
    version: '1.0.0',
    orientation: 'portrait',
    ios: {
      infoPlist: {
        NSCameraUsageDescription: "Clozie uses your camera to photograph wardrobe items.",
        NSPhotoLibraryUsageDescription: "Clozie needs access to your photo library so you can add wardrobe items.",
      },
    },
    plugins: [
      "expo-font",
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      anthropicKey: process.env.EXPO_PUBLIC_ANTHROPIC_KEY,
    },
  },
};
