import { registerWebModule, NativeModule } from 'expo';
import type { RemoveBackgroundOptions } from './BackgroundRemoval.types';

// Background removal is not available on the web platform — always returns null.
class BackgroundRemovalModule extends NativeModule<{}> {
  async removeBackground(_imageUri: string, _options?: RemoveBackgroundOptions): Promise<string | null> {
    return null;
  }
}

export default registerWebModule(BackgroundRemovalModule, 'BackgroundRemovalModule');
