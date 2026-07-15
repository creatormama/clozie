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
      // Forward the 2nd arg only when the caller passes options. Both production call
      // sites pass CUTOUT_OPTIONS; the no-options branch is a defensive fallback for any
      // future 1-arg caller (the native module has been 2-arg since Build 26).
      return options === undefined
        ? await nativeModule.removeBackground(imageUri)
        : await nativeModule.removeBackground(imageUri, options);
    } catch {
      return null;
    }
  },
};
