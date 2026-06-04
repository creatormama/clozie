import { registerWebModule, NativeModule } from 'expo';

// Background removal is not available on the web platform — always returns null.
class BackgroundRemovalModule extends NativeModule<{}> {
  async removeBackground(_imageUri: string): Promise<string | null> {
    return null;
  }
}

export default registerWebModule(BackgroundRemovalModule, 'BackgroundRemovalModule');
