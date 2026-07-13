package expo.modules.backgroundremoval

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Android stub — background removal is iOS-only (Apple Vision).
// Always returns null so JS can fall back gracefully.
class BackgroundRemovalModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BackgroundRemoval")

    AsyncFunction("removeBackground") { _: String, _: Map<String, Any?>? ->
      return@AsyncFunction null as String?
    }
  }
}
