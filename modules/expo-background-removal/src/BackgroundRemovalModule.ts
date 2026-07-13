import { requireOptionalNativeModule, NativeModule } from 'expo';
import type { RemoveBackgroundOptions } from './BackgroundRemoval.types';

declare class BackgroundRemovalNative extends NativeModule<{}> {
  removeBackground(imageUri: string, options?: RemoveBackgroundOptions): Promise<string | null>;
}

// requireOptionalNativeModule returns null instead of throwing when the native
// binary isn't loaded (Expo Go, web, simulator, iOS <17 — anywhere Vision is unavailable).
const nativeModule = requireOptionalNativeModule<BackgroundRemovalNative>('BackgroundRemoval');

export default {
  async removeBackground(imageUri: string, options?: RemoveBackgroundOptions): Promise<string | null> {
    if (!nativeModule) return null;
    try {
      // Forward the 2nd arg ONLY when given, so 1-arg callers keep hitting the
      // 1-arg native path (safe while Swift is still single-arg, Steps 1–7).
      return options === undefined
        ? await nativeModule.removeBackground(imageUri)
        : await nativeModule.removeBackground(imageUri, options);
    } catch {
      return null;
    }
  },
};
