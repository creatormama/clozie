import { requireOptionalNativeModule, NativeModule } from 'expo';

declare class BackgroundRemovalNative extends NativeModule<{}> {
  removeBackground(imageUri: string): Promise<string | null>;
}

// requireOptionalNativeModule returns null instead of throwing when the native
// binary isn't loaded (Expo Go, web, simulator, iOS <17 — anywhere Vision is unavailable).
const nativeModule = requireOptionalNativeModule<BackgroundRemovalNative>('BackgroundRemoval');

export default {
  async removeBackground(imageUri: string): Promise<string | null> {
    if (!nativeModule) return null;
    try {
      return await nativeModule.removeBackground(imageUri);
    } catch {
      return null;
    }
  },
};
