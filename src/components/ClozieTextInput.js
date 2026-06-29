// ClozieTextInput — Dynamic Type-safe <TextInput> wrapper.
// Same contract as ClozieText. See that file for the why.

import React from 'react';
import { TextInput as RNTextInput, StyleSheet, useWindowDimensions } from 'react-native';

const GLOBAL_CAP = 1.3;

const ClozieTextInput = React.forwardRef(function ClozieTextInput(
  { style, dontScale, maxFontSizeMultiplier, allowFontScaling, ...rest },
  ref
) {
  const { fontScale } = useWindowDimensions();

  // (3) dontScale opt-out — frozen, exact fontSize. (No current TextInput uses
  //     this, but kept symmetric with ClozieText so the contract is one rule.)
  if (dontScale) {
    return (
      <RNTextInput ref={ref} {...rest} style={style} allowFontScaling={false} />
    );
  }

  // (4) Flatten safely from style arrays / refs.
  const flat = StyleSheet.flatten(style) || {};
  const baseFontSize = flat.fontSize;

  // (2) No own fontSize → pass through untouched.
  if (typeof baseFontSize !== 'number') {
    return (
      <RNTextInput
        ref={ref}
        {...rest}
        style={style}
        {...(allowFontScaling !== undefined ? { allowFontScaling } : {})}
        {...(maxFontSizeMultiplier !== undefined ? { maxFontSizeMultiplier } : {})}
      />
    );
  }

  // (1) Clamp: per-element cap × global 1.3.
  const elementCap = typeof maxFontSizeMultiplier === 'number' ? maxFontSizeMultiplier : Infinity;
  const cappedScale = Math.min(fontScale, elementCap, GLOBAL_CAP);

  const scaledFontSize = baseFontSize * cappedScale;
  const scaledLineHeight =
    typeof flat.lineHeight === 'number' ? flat.lineHeight * cappedScale : undefined;

  const override =
    scaledLineHeight !== undefined
      ? { fontSize: scaledFontSize, lineHeight: scaledLineHeight }
      : { fontSize: scaledFontSize };

  return (
    <RNTextInput ref={ref} {...rest} style={[style, override]} allowFontScaling={false} />
  );
});

export default ClozieTextInput;
