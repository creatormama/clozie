import { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_400Regular, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import * as SplashScreen from 'expo-splash-screen';

// ── Design tokens — sacred, never change ─────────────────────────────────────
const G = '#C9A96E';       // gold accent
const BG = '#0D0C0A';      // background
const CREAM = '#EDE5D8';    // logo "Clo" color

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

// ── Welcome Screen ───────────────────────────────────────────────────────────
export default function App() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    DMMono_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
      // Start fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.screen} onLayout={onLayoutRootView}>
      <StatusBar style="light" />

      {/* Subtle radial gold glow in centre */}
      <View style={styles.glowContainer}>
        <View style={styles.glow} />
      </View>

      {/* All content fades in together */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* ✦ PERSONAL STYLIST ✦ */}
        <Text style={styles.label}>✦ PERSONAL STYLIST ✦</Text>

        {/* Logo — "Clo" cream + "zie" italic gold */}
        <Text style={styles.logo}>
          <Text style={styles.logoClo}>Clo</Text>
          <Text style={styles.logoZie}>zie</Text>
        </Text>

        {/* Emoji row */}
        <Text style={styles.emojis}>👗 👔</Text>

        {/* Italic tagline — 2 lines */}
        <Text style={styles.tagline}>
          Everyone says I have nothing to wear.{'\n'}
          Clozie solves that in 30 seconds.
        </Text>

        {/* Gold pill button — Next → */}
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>

        {/* Already have an account? Sign in */}
        <Text style={styles.signInRow}>
          Already have an account?{' '}
          <Text style={styles.signInLink}>Sign in</Text>
        </Text>

      </Animated.View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Radial gold glow — very subtle, matches web app
  glowContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 500,
    height: 500,
    marginTop: -250,
    marginLeft: -250,
  },
  glow: {
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: G,
    opacity: 0.03,
  },

  // All content centred
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 480,
  },

  // ✦ PERSONAL STYLIST ✦
  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    letterSpacing: 3,
    color: G,
    marginBottom: 32,
  },

  // Logo
  logo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logoClo: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 72,
    color: CREAM,
  },
  logoZie: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 72,
    color: G,
  },

  // Emoji row
  emojis: {
    fontSize: 36,
    letterSpacing: 8,
    marginBottom: 28,
  },

  // Italic tagline
  tagline: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 20,
    color: '#6A6058',
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 48,
  },

  // Gold pill button
  nextButton: {
    backgroundColor: G,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    marginBottom: 14,
  },
  nextButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
    textAlign: 'center',
  },

  // Sign in row
  signInRow: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#666666',
  },
  signInLink: {
    color: G,
  },
});
