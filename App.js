import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_400Regular, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import * as NativeSplash from 'expo-splash-screen';

// ── Design tokens — sacred, never change ─────────────────────────────────────
const G = '#C9A96E';       // gold accent
const BG = '#0D0C0A';      // background
const CARD = '#161512';     // card background
const BORDER = '#252320';   // border color
const CREAM = '#EDE5D8';    // logo "Clo" color

// Keep native splash visible while fonts load
NativeSplash.preventAutoHideAsync();

// ── Splash Screen ───────────────────────────────────────────────────────────
function SplashScreenView({ onFinished }) {
  const logoFade = useRef(new Animated.Value(0)).current;
  const labelFade = useRef(new Animated.Value(0)).current;
  const labelPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(logoFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(labelFade, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(labelPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(labelPulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      onFinished();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity: logoFade }}>
        <Text style={styles.splashLogo}>
          <Text style={styles.logoClo}>Clo</Text>
          <Text style={styles.logoZie}>zie</Text>
        </Text>
      </Animated.View>
      <Animated.View style={{ opacity: Animated.multiply(labelFade, labelPulse) }}>
        <Text style={styles.splashLabel}>✦ YOUR PERSONAL STYLIST ✦</Text>
      </Animated.View>
    </View>
  );
}

// ── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onNext, onSignIn }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Subtle radial gold glow in centre — Welcome screen ONLY */}
      <View style={styles.glowContainer}>
        <View style={styles.glow} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.label}>✦ PERSONAL STYLIST ✦</Text>

        <Text style={styles.logo}>
          <Text style={styles.logoClo}>Clo</Text>
          <Text style={styles.logoZie}>zie</Text>
        </Text>

        <Text style={styles.emojis}>👗 👔</Text>

        <Text style={styles.tagline}>
          Everyone says I have nothing to wear.{'\n'}
          Clozie solves that in 30 seconds.
        </Text>

        <TouchableOpacity style={styles.goldButton} activeOpacity={0.8} onPress={onNext}>
          <Text style={styles.goldButtonText}>Next →</Text>
        </TouchableOpacity>

        <Text style={styles.signInRow}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={onSignIn}>Sign in</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Peek Inside Screen (How It Works) ────────────────────────────────────────
function PeekInsideScreen({ onStartStyling, onSignIn }) {
  const [activeStep, setActiveStep] = useState(0);
  const [hasTapped, setHasTapped] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hintPulse = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse the hint text 3 times then stay still
    Animated.sequence([
      Animated.timing(hintPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Bounce the gold dot on Step 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -5, duration: 500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTabTap = (index) => {
    setActiveStep(index);
    setHasTapped(true);
  };

  // ── Step 1 Visual: Snap & Add ──
  const Step1Visual = () => (
    <View style={peekStyles.visualCard}>
      {/* Item row */}
      <View style={peekStyles.itemRow}>
        <View style={peekStyles.itemIcon}>
          <Text style={{ fontSize: 28 }}>👗</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={peekStyles.recognisedLabel}>RECOGNISED ✦</Text>
          <Text style={peekStyles.itemName}>Navy Blue Wrap Dress</Text>
          <Text style={peekStyles.itemMeta}>Dresses · Navy blue · Midi length</Text>
        </View>
        <View style={peekStyles.checkCircle}>
          <Text style={{ fontSize: 11 }}>✅</Text>
        </View>
      </View>
      {/* Category tags row */}
      <View style={peekStyles.tagRow}>
        {['👗 Tops · 3', '👖 Bottoms · 2', '👠 Shoes · 3'].map((tag, i) => (
          <View key={i} style={peekStyles.tagChip}>
            <Text style={peekStyles.tagChipText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Step 2 Visual: Tell Clozie Your Day ──
  const Step2Visual = () => (
    <View style={peekStyles.visualCard}>
      <Text style={peekStyles.vibeLabel}>TODAY'S VIBE</Text>
      {/* Weather chips */}
      <View style={peekStyles.chipRow}>
        {['Sunny & Hot', 'Warm & Breezy', 'Cold & Dry'].map((w, i) => (
          <View key={i} style={[
            peekStyles.chip,
            i === 0 ? peekStyles.chipSelected : peekStyles.chipDefault,
          ]}>
            <Text style={[
              peekStyles.chipText,
              { color: i === 0 ? BG : '#555' },
            ]}>{w}</Text>
          </View>
        ))}
      </View>
      {/* Occasion chips */}
      <View style={peekStyles.chipRow}>
        {['Date Night', 'Casual Day', 'Work / Office'].map((o, i) => (
          <View key={i} style={[
            peekStyles.chip,
            i === 0 ? peekStyles.chipAccent : peekStyles.chipDefault,
          ]}>
            <Text style={[
              peekStyles.chipText,
              { color: i === 0 ? G : '#555' },
            ]}>{o}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Step 3 Visual: Get 3 Perfect Outfits ──
  const Step3Visual = () => (
    <View style={[peekStyles.visualCard, { borderColor: G + '40' }]}>
      {/* Header row */}
      <View style={peekStyles.outfitHeader}>
        <View>
          <Text style={peekStyles.outfitVibe}>ROMANTIC</Text>
          <Text style={peekStyles.outfitName}>Evening Glow</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={peekStyles.moodTab}>
            <Text style={peekStyles.moodTabText}>🖼 Mood Board</Text>
          </View>
          <View style={peekStyles.bodyTab}>
            <Text style={peekStyles.bodyTabText}>✦ On Body</Text>
          </View>
        </View>
      </View>
      {/* Item chips */}
      <View style={peekStyles.tagRow}>
        {['Navy Wrap Dress', 'Brown Flats', 'Gold Earrings'].map((item, i) => (
          <View key={i} style={peekStyles.outfitChip}>
            <Text style={peekStyles.outfitChipText}>{item}</Text>
          </View>
        ))}
      </View>
      {/* Italic description */}
      <Text style={peekStyles.outfitDesc}>
        "The wrap silhouette is perfect for date night — elegant and effortless."
      </Text>
    </View>
  );

  const visuals = [<Step1Visual />, <Step2Visual />, <Step3Visual />];
  const titles = ['Snap & Add Your Clothes', 'Tell Clozie Your Day', 'Get 3 Perfect Outfits'];
  const descs = [
    'Take a photo of any item — Clozie instantly fills in all the details. Your wardrobe is ready in minutes.',
    'Pick the weather and your occasion. Heading to work? Date night? Weekend errands? Clozie styles you perfectly for the moment.',
    'Clozie creates 3 styled outfits from YOUR actual clothes. See them in a mood board or on the mannequin. Rate them and Clozie learns your taste.',
  ];
  const icons = ['📸', '🌤', '✨'];

  return (
    <View style={[styles.screen, { justifyContent: 'flex-start' }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={peekStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>

          {/* Logo + label */}
          <View style={peekStyles.headerBlock}>
            <Text style={[styles.logo, { marginBottom: 4 }]}>
              <Text style={[styles.logoClo, { fontSize: 36 }]}>Clo</Text>
              <Text style={[styles.logoZie, { fontSize: 36 }]}>zie</Text>
            </Text>
            <Text style={peekStyles.howLabel}>✦ HERE'S HOW IT WORKS ✦</Text>
          </View>

          {/* 3 step tabs */}
          <View style={peekStyles.tabRow}>
            {icons.map((icon, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => handleTabTap(i)}
                style={[
                  peekStyles.tab,
                  {
                    borderColor: activeStep === i ? G : BORDER,
                    backgroundColor: activeStep === i ? G + '15' : CARD,
                  },
                ]}
              >
                {/* Bouncing gold dot on Step 1 — disappears after first tap */}
                {i === 0 && !hasTapped && (
                  <Animated.View
                    style={[
                      peekStyles.bounceDot,
                      { transform: [{ translateY: bounceAnim }] },
                    ]}
                  />
                )}
                <Text style={{ fontSize: 18, marginBottom: 3 }}>{icon}</Text>
                <Text style={[
                  peekStyles.tabLabel,
                  { color: activeStep === i ? G : '#444' },
                ]}>STEP {i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hint text — pulses 3 times, disappears after first tap */}
          {!hasTapped && (
            <Animated.View style={{ opacity: hintPulse, marginBottom: 14 }}>
              <Text style={peekStyles.hintText}>✦ Tap each step to explore</Text>
            </Animated.View>
          )}
          {hasTapped && <View style={{ marginBottom: 14 }} />}

          {/* Content card */}
          <View style={peekStyles.contentCard}>
            <Text style={peekStyles.cardTitle}>{titles[activeStep]}</Text>
            <Text style={peekStyles.cardDesc}>{descs[activeStep]}</Text>
            {visuals[activeStep]}
          </View>

          {/* Navigation dots */}
          <View style={peekStyles.dotRow}>
            {[0, 1, 2].map((i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => handleTabTap(i)}
              >
                <View style={[
                  peekStyles.dot,
                  {
                    width: activeStep === i ? 24 : 8,
                    backgroundColor: activeStep === i ? G : BORDER,
                  },
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Gold button — Start Styling */}
          <TouchableOpacity style={[styles.goldButton, { width: '100%' }]} activeOpacity={0.8} onPress={onStartStyling}>
            <Text style={styles.goldButtonText}>✦ Start Styling — It's Free</Text>
          </TouchableOpacity>

          {/* Sign in link */}
          <Text style={[styles.signInRow, { marginTop: 12 }]}>
            Already have an account?{' '}
            <Text style={styles.signInLink} onPress={onSignIn}>Sign in</Text>
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Main App — navigation: Splash → Welcome → Peek Inside ───────────────────
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    DMMono_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await NativeSplash.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {currentScreen === 'splash' && (
        <SplashScreenView onFinished={() => setCurrentScreen('welcome')} />
      )}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onNext={() => setCurrentScreen('peek')}
          onSignIn={() => {/* Login screen — built in next phase */}}
        />
      )}
      {currentScreen === 'peek' && (
        <PeekInsideScreen
          onStartStyling={() => {/* Sign Up screen — built in next phase */}}
          onSignIn={() => {/* Login screen — built in next phase */}}
        />
      )}
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

  // ── Splash Screen styles ────────────────────────────────────────────────
  splashLogo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  splashLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    letterSpacing: 3,
    color: G,
    textAlign: 'center',
  },

  // ── Welcome Screen styles ──────────────────────────────────────────────
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

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 480,
  },

  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    letterSpacing: 3,
    color: G,
    marginBottom: 32,
  },

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

  emojis: {
    fontSize: 36,
    letterSpacing: 8,
    marginBottom: 28,
  },

  tagline: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 20,
    color: '#6A6058',
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 48,
  },

  // ── Shared styles ─────────────────────────────────────────────────────
  goldButton: {
    backgroundColor: G,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    marginBottom: 14,
  },
  goldButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
    textAlign: 'center',
  },

  signInRow: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  signInLink: {
    color: G,
  },
});

// ── Peek Inside Screen styles ────────────────────────────────────────────────
const peekStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  howLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 3,
    marginTop: 12,
  },

  // ── Step tabs ──
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    letterSpacing: 1,
  },

  // Bouncing gold dot on Step 1
  bounceDot: {
    position: 'absolute',
    top: -6,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: G,
    borderWidth: 2,
    borderColor: BG,
  },

  // Hint text
  hintText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 1,
    textAlign: 'center',
  },

  // ── Content card ──
  contentCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: G + '30',
    width: '100%',
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 22,
    color: CREAM,
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: '#6A6058',
    lineHeight: 20,
    marginBottom: 16,
  },

  // ── Navigation dots ──
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 100,
  },

  // ── Step 1 Visual ──
  visualCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1A1815',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recognisedLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    marginBottom: 3,
  },
  itemName: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: CREAM,
  },
  itemMeta: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A3A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagChip: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: BG,
    borderRadius: 8,
    alignItems: 'center',
  },
  tagChipText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },

  // ── Step 2 Visual ──
  vibeLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: G,
    letterSpacing: 2,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: G,
    borderColor: G,
  },
  chipAccent: {
    backgroundColor: G + '20',
    borderColor: G + '60',
  },
  chipDefault: {
    backgroundColor: 'transparent',
    borderColor: BORDER,
  },
  chipText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
  },

  // ── Step 3 Visual ──
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  outfitVibe: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: G,
    letterSpacing: 2,
  },
  outfitName: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 16,
    color: CREAM,
  },
  moodTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#1A1512',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  moodTabText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: G,
  },
  bodyTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: G + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: G + '60',
  },
  bodyTabText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: G,
  },
  outfitChip: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: BG,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  outfitChipText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: '#8A7A68',
    textAlign: 'center',
  },
  outfitDesc: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#7A6A58',
    marginTop: 8,
    lineHeight: 17,
  },
});
