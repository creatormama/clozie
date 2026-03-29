import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(hintPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

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

  const Step1Visual = () => (
    <View style={peekStyles.visualCard}>
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
      <View style={peekStyles.tagRow}>
        {['👗 Tops · 3', '👖 Bottoms · 2', '👠 Shoes · 3'].map((tag, i) => (
          <View key={i} style={peekStyles.tagChip}>
            <Text style={peekStyles.tagChipText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const Step2Visual = () => (
    <View style={peekStyles.visualCard}>
      <Text style={peekStyles.vibeLabel}>TODAY'S VIBE</Text>
      <View style={peekStyles.chipRow}>
        {['Sunny & Hot', 'Warm & Breezy', 'Cold & Dry'].map((w, i) => (
          <View key={i} style={[
            peekStyles.chip,
            i === 0 ? peekStyles.chipSelected : peekStyles.chipDefault,
          ]}>
            <Text style={[peekStyles.chipText, { color: i === 0 ? BG : '#555' }]}>{w}</Text>
          </View>
        ))}
      </View>
      <View style={peekStyles.chipRow}>
        {['Date Night', 'Casual Day', 'Work / Office'].map((o, i) => (
          <View key={i} style={[
            peekStyles.chip,
            i === 0 ? peekStyles.chipAccent : peekStyles.chipDefault,
          ]}>
            <Text style={[peekStyles.chipText, { color: i === 0 ? G : '#555' }]}>{o}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const Step3Visual = () => (
    <View style={[peekStyles.visualCard, { borderColor: G + '40' }]}>
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
      <View style={peekStyles.tagRow}>
        {['Navy Wrap Dress', 'Brown Flats', 'Gold Earrings'].map((item, i) => (
          <View key={i} style={peekStyles.outfitChip}>
            <Text style={peekStyles.outfitChipText}>{item}</Text>
          </View>
        ))}
      </View>
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

          <View style={peekStyles.headerBlock}>
            <Text style={[styles.logo, { marginBottom: 4 }]}>
              <Text style={[styles.logoClo, { fontSize: 36 }]}>Clo</Text>
              <Text style={[styles.logoZie, { fontSize: 36 }]}>zie</Text>
            </Text>
            <Text style={peekStyles.howLabel}>✦ HERE'S HOW IT WORKS ✦</Text>
          </View>

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

          {!hasTapped && (
            <Animated.View style={{ opacity: hintPulse, marginBottom: 14 }}>
              <Text style={peekStyles.hintText}>✦ Tap each step to explore</Text>
            </Animated.View>
          )}
          {hasTapped && <View style={{ marginBottom: 14 }} />}

          <View style={peekStyles.contentCard}>
            <Text style={peekStyles.cardTitle}>{titles[activeStep]}</Text>
            <Text style={peekStyles.cardDesc}>{descs[activeStep]}</Text>
            {visuals[activeStep]}
          </View>

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

          <TouchableOpacity style={[styles.goldButton, { width: '100%' }]} activeOpacity={0.8} onPress={onStartStyling}>
            <Text style={styles.goldButtonText}>✦ Start Styling — It's Free</Text>
          </TouchableOpacity>

          <Text style={[styles.signInRow, { marginTop: 12 }]}>
            Already have an account?{' '}
            <Text style={styles.signInLink} onPress={onSignIn}>Sign in</Text>
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Auth Screen (Login / Sign Up / Forgot Password) ──────────────────────────
function AuthScreen({ mode, onDone, onSwitchMode, onForgot, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) setError('');
  }, [name, email, password]);

  const handleSubmit = () => {
    setError('');

    // ── Sign Up validation ──
    if (!isLogin && !isForgot) {
      if (!name.trim()) {
        setError('Please tell us your name ✦');
        return;
      }
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setError("That email doesn't look right — please check it ✦");
        return;
      }
      if (password.length < 8) {
        setError('Password needs at least 8 characters ✦');
        return;
      }
      // Pass data up — Supabase integration comes in Phase 2
      onDone({ name: name.trim(), email: email.trim(), password, mode: 'signup' });
      return;
    }

    // ── Login validation ──
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password ✦');
        return;
      }
      onDone({ email: email.trim(), password, mode: 'login' });
      return;
    }

    // ── Forgot Password validation ──
    if (isForgot) {
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setError("That email doesn't look right — please check it ✦");
        return;
      }
      setResetSent(true);
      return;
    }
  };

  // Heading text per mode
  const headingLabel = isForgot
    ? '✦ RESET YOUR PASSWORD ✦'
    : isLogin
      ? '✦ WELCOME BACK ✦'
      : '✦ CREATE YOUR ACCOUNT ✦';

  const subtitle = isForgot
    ? "Enter your email and we'll send you a reset link"
    : isLogin
      ? 'Sign in to your wardrobe'
      : 'Your personal stylist awaits';

  const buttonLabel = isForgot
    ? 'Send Reset Link →'
    : isLogin
      ? 'Sign In →'
      : 'Create Account →';

  return (
    <View style={[styles.screen, { justifyContent: 'flex-start' }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>

            {/* ← Back button — top left */}
            <TouchableOpacity
              style={authStyles.backButton}
              activeOpacity={0.7}
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={authStyles.backArrow}>←</Text>
            </TouchableOpacity>

            {/* Logo + heading */}
            <View style={authStyles.headerBlock}>
              <Text style={[styles.logo, { marginBottom: 4 }]}>
                <Text style={[styles.logoClo, { fontSize: 36 }]}>Clo</Text>
                <Text style={[styles.logoZie, { fontSize: 36 }]}>zie</Text>
              </Text>
              <Text style={authStyles.headingLabel}>{headingLabel}</Text>
              <Text style={authStyles.subtitle}>{subtitle}</Text>
            </View>

            {/* Social buttons — NOT shown on Forgot Password */}
            {!isForgot && (
              <View style={authStyles.socialBlock}>
                {/* Continue with Google */}
                <TouchableOpacity
                  style={authStyles.socialButton}
                  activeOpacity={0.7}
                  onPress={() => onDone({ email: 'google@user.com', name: 'Google User', mode: isLogin ? 'login' : 'signup' })}
                >
                  <Text style={authStyles.socialIcon}>G</Text>
                  <Text style={authStyles.socialText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Continue with Apple */}
                <TouchableOpacity
                  style={authStyles.socialButton}
                  activeOpacity={0.7}
                  onPress={() => onDone({ email: 'apple@user.com', name: 'Apple User', mode: isLogin ? 'login' : 'signup' })}
                >
                  <Text style={authStyles.socialIcon}></Text>
                  <Text style={authStyles.socialText}>Continue with Apple</Text>
                </TouchableOpacity>

                {/* OR divider */}
                <View style={authStyles.dividerRow}>
                  <View style={authStyles.dividerLine} />
                  <Text style={authStyles.dividerText}>or</Text>
                  <View style={authStyles.dividerLine} />
                </View>
              </View>
            )}

            {/* ── Forgot Password: reset sent confirmation ── */}
            {isForgot && resetSent ? (
              <View style={authStyles.resetSentBlock}>
                <Text style={authStyles.resetSentText}>
                  ✦ Check your email — We've sent a reset link to {email}
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 24 }}
                  activeOpacity={0.7}
                  onPress={() => onSwitchMode('login')}
                >
                  <Text style={authStyles.forgotBackLink}>← Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* ── Input fields ── */}
                <View style={authStyles.fieldsBlock}>
                  {/* Full name — Sign Up only */}
                  {!isLogin && !isForgot && (
                    <TextInput
                      style={authStyles.input}
                      placeholder="Full name"
                      placeholderTextColor="#555"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  )}

                  {/* Email — all modes */}
                  <TextInput
                    style={authStyles.input}
                    placeholder="Email address"
                    placeholderTextColor="#555"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType={isForgot ? 'done' : 'next'}
                  />

                  {/* Password — Login and Sign Up only */}
                  {!isForgot && (
                    <View style={authStyles.passwordContainer}>
                      <TextInput
                        style={[authStyles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Password"
                        placeholderTextColor="#555"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        returnKeyType="done"
                      />
                      <TouchableOpacity
                        style={authStyles.eyeButton}
                        activeOpacity={0.7}
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={authStyles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* "At least 8 characters" — Sign Up only */}
                  {!isLogin && !isForgot && (
                    <Text style={authStyles.passwordHint}>At least 8 characters</Text>
                  )}
                </View>

                {/* Error message — warm gold */}
                {error !== '' && (
                  <Text style={authStyles.errorText}>{error}</Text>
                )}

                {/* Forgot password? — Login only */}
                {isLogin && (
                  <TouchableOpacity
                    style={authStyles.forgotRow}
                    activeOpacity={0.7}
                    onPress={onForgot}
                  >
                    <Text style={authStyles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                )}

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.goldButton, { width: '100%', marginTop: 4 }]}
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                >
                  <Text style={styles.goldButtonText}>{buttonLabel}</Text>
                </TouchableOpacity>

                {/* Switch mode link — Login ↔ Sign Up */}
                {!isForgot && (
                  <Text style={[styles.signInRow, { marginTop: 16 }]}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <Text
                      style={styles.signInLink}
                      onPress={() => onSwitchMode(isLogin ? 'signup' : 'login')}
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </Text>
                  </Text>
                )}

                {/* Back to Sign In — Forgot Password only */}
                {isForgot && (
                  <TouchableOpacity
                    style={{ marginTop: 16 }}
                    activeOpacity={0.7}
                    onPress={() => onSwitchMode('login')}
                  >
                    <Text style={authStyles.forgotBackLink}>← Back to Sign In</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Post-Login Welcome Screen ─────────────────────────────────────────────────
function PostLoginWelcomeScreen({ onStart }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Emoji row */}
        <Text style={styles.emojis}>👗 👔</Text>

        {/* Welcome heading */}
        <Text style={postLoginStyles.heading}>Welcome to{' '}
          <Text style={postLoginStyles.headingClo}>Clo</Text>
          <Text style={postLoginStyles.headingZie}>zie</Text>
        </Text>

        {/* Warm subtitle */}
        <Text style={postLoginStyles.subtitle}>
          The more you use Clozie, the better she knows you
        </Text>

        {/* Let's Start button */}
        <TouchableOpacity
          style={[styles.goldButton, { marginTop: 40 }]}
          activeOpacity={0.8}
          onPress={onStart}
        >
          <Text style={styles.goldButtonText}>Let's Start ✦</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

// ── Main App — navigation ────────────────────────────────────────────────────
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [authMode, setAuthMode] = useState('signup'); // 'signup', 'login', or 'forgot'

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

  // Navigate to auth screen with a specific mode
  const goToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentScreen('auth');
  };

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {currentScreen === 'splash' && (
        <SplashScreenView onFinished={() => setCurrentScreen('welcome')} />
      )}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onNext={() => setCurrentScreen('peek')}
          onSignIn={() => goToAuth('login')}
        />
      )}
      {currentScreen === 'peek' && (
        <PeekInsideScreen
          onStartStyling={() => goToAuth('signup')}
          onSignIn={() => goToAuth('login')}
        />
      )}
      {currentScreen === 'postlogin' && (
        <PostLoginWelcomeScreen
          onStart={() => {
            // Main app tabs will go here — placeholder for now
            console.log('Main app starts here');
            setCurrentScreen('splash'); // Temporary: loops back so app doesn't get stuck
          }}
        />
      )}
      {currentScreen === 'auth' && (
        <AuthScreen
          mode={authMode}
          onDone={(data) => {
            // Supabase auth integration comes in Phase 2
            if (data.mode === 'signup') {
              // New users see Post-Login Welcome Screen
              setCurrentScreen('postlogin');
            } else {
              // Returning users skip straight to main app (placeholder for now)
              console.log('Login — main app starts here');
              setCurrentScreen('splash'); // Temporary: loops back so app doesn't get stuck
            }
          }}
          onSwitchMode={(newMode) => {
            setAuthMode(newMode);
          }}
          onForgot={() => {
            setAuthMode('forgot');
          }}
          onBack={() => {
            // Go back to the previous screen
            if (authMode === 'forgot') {
              setAuthMode('login');
            } else {
              setCurrentScreen('peek');
            }
          }}
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

  hintText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 1,
    textAlign: 'center',
  },

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

// ── Post-Login Welcome Screen styles ─────────────────────────────────────────
const postLoginStyles = StyleSheet.create({
  heading: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    color: CREAM,
    textAlign: 'center',
    marginBottom: 16,
  },
  headingClo: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    color: CREAM,
  },
  headingZie: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 32,
    color: G,
  },
  subtitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 14,
    color: '#6A6058',
    textAlign: 'center',
    lineHeight: 22,
  },
});

// ── Auth Screen styles ───────────────────────────────────────────────────────
const authStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  // ← Back button
  backButton: {
    alignSelf: 'flex-start',
    paddingTop: 40,
    paddingBottom: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    color: G,
  },

  // Header
  headerBlock: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  headingLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 3,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },

  // Social buttons
  socialBlock: {
    width: '100%',
    marginBottom: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 10,
    width: '100%',
  },
  socialIcon: {
    fontSize: 18,
    color: '#fff',
  },
  socialText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: CREAM,
  },

  // OR divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: '#666',
  },

  // Input fields
  fieldsBlock: {
    width: '100%',
    marginBottom: 8,
  },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'DMMono_400Regular',
    fontSize: 14,
    color: CREAM,
    marginBottom: 10,
    width: '100%',
  },

  // Password container with eye icon
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    marginBottom: 4,
    width: '100%',
  },
  eyeButton: {
    paddingHorizontal: 16,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },

  // Password hint
  passwordHint: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: '#555',
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Error message — warm gold
  errorText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: G,
    marginBottom: 12,
    textAlign: 'left',
    width: '100%',
  },

  // Forgot password link — right aligned, clearly visible
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotLink: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: G,
    textDecorationLine: 'underline',
  },

  // Forgot password — back to sign in
  forgotBackLink: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: G,
    textAlign: 'center',
  },

  // Reset sent confirmation
  resetSentBlock: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  resetSentText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: G,
    textAlign: 'center',
    lineHeight: 22,
  },
});
