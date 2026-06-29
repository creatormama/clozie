// ClozieText — Dynamic Type-safe <Text> wrapper.
//
// Why this exists: on Fabric (RN 0.81.5 + Expo SDK 54), the native
// maxFontSizeMultiplier clamp does not bite at iOS Accessibility (AX)
// text sizes — text keeps growing past the cap (RN issue #47499).
// This wrapper clamps in JS instead: it reads the OS font scale,
// caps it per element + globally at 1.3×, computes the final fontSize,
// and turns OFF native scaling so iOS can't double-scale on top.
//
// Verified on iPhone Step 0 probe (this session): useWindowDimensions()
// returns 3.571 at AX maxed — hook works.

import React from 'react';
import { Text as RNText, StyleSheet, useWindowDimensions } from 'react-native';

const GLOBAL_CAP = 1.3;

const ClozieText = React.forwardRef(function ClozieText(
  { style, dontScale, maxFontSizeMultiplier, allowFontScaling, children, ...rest },
  ref
) {
  const { fontScale } = useWindowDimensions();

  // (3) dontScale opt-out — frozen, normal-size render. Used by ShareCard
  //     so the captured PNG looks identical no matter the sender's AX setting.
  //     Forces allowFontScaling=false + renders fontSize exactly as written.
  if (dontScale) {
    return (
      <RNText ref={ref} {...rest} style={style} allowFontScaling={false}>
        {children}
      </RNText>
    );
  }

  // (4) Flatten so we can read fontSize from arrays / nested style refs.
  const flat = StyleSheet.flatten(style) || {};
  const baseFontSize = flat.fontSize;

  // (2) No own fontSize → pass through untouched. Covers nested logo parents
  //     (Welcome / Peek / Auth logoRow) and any inherited-size text.
  if (typeof baseFontSize !== 'number') {
    return (
      <RNText
        ref={ref}
        {...rest}
        style={style}
        {...(allowFontScaling !== undefined ? { allowFontScaling } : {})}
        {...(maxFontSizeMultiplier !== undefined ? { maxFontSizeMultiplier } : {})}
      >
        {children}
      </RNText>
    );
  }

  // (1) Clamp: honor each element's own maxFontSizeMultiplier
  //     (so Splash/Welcome 1.1 + 1.15 logo caps stay tight) AND the global 1.3.
  const elementCap = typeof maxFontSizeMultiplier === 'number' ? maxFontSizeMultiplier : Infinity;
  const cappedScale = Math.min(fontScale, elementCap, GLOBAL_CAP);

  const scaledFontSize = baseFontSize * cappedScale;
  // Native scaling adjusts lineHeight too — match that so multi-line text
  // (Welcome tagline, brief field, outfit name) doesn't overlap at AX sizes.
  const scaledLineHeight =
    typeof flat.lineHeight === 'number' ? flat.lineHeight * cappedScale : undefined;

  const override =
    scaledLineHeight !== undefined
      ? { fontSize: scaledFontSize, lineHeight: scaledLineHeight }
      : { fontSize: scaledFontSize };

  return (
    <RNText ref={ref} {...rest} style={[style, override]} allowFontScaling={false}>
      {children}
    </RNText>
  );
});

export default ClozieText;
