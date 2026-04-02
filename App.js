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

// ── Style DNA Tab ───────────────────────────────────────────────────────────
function StyleDNATab({ onBuildCloset }) {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedColours, setSelectedColours] = useState([]);
  const [neverWear, setNeverWear] = useState('');
  const scaleAnims = useRef(
    ['Minimalist', 'Streetwear', 'Classic', 'Bohemian', 'Sporty', 'Romantic', 'Edgy', 'Business']
      .map(() => new Animated.Value(1))
  ).current;
  const colourScaleAnims = useRef(
    ['Neutrals', 'Earth Tones', 'Bold Colors', 'Pastels', 'Monochrome', 'Black & White', 'Warm Tones', 'Cool Tones']
      .map(() => new Animated.Value(1))
  ).current;

  const styleOptions = ['Minimalist', 'Streetwear', 'Classic', 'Bohemian', 'Sporty', 'Romantic', 'Edgy', 'Business'];
  const colourOptions = ['Neutrals', 'Earth Tones', 'Bold Colors', 'Pastels', 'Monochrome', 'Black & White', 'Warm Tones', 'Cool Tones'];

  const toggleStyle = (style, index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleColour = (colour, index) => {
    Animated.sequence([
      Animated.timing(colourScaleAnims[index], { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(colourScaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setSelectedColours((prev) =>
      prev.includes(colour) ? prev.filter((c) => c !== colour) : [...prev, colour]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={dnaStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={dnaStyles.label}>YOUR STYLE DNA</Text>
      <Text style={dnaStyles.heading}>Your Style Profile</Text>
      <Text style={dnaStyles.subtitle}>
        Clozie uses this to personalize every outfit, the more you use her the better she knows you ✦
      </Text>

      {/* STYLES I LOVE card */}
      <View style={dnaStyles.card}>
        <Text style={dnaStyles.cardHeading}>STYLES I LOVE</Text>
        <View style={dnaStyles.chipRow}>
          {styleOptions.map((style, i) => {
            const isSelected = selectedStyles.includes(style);
            return (
              <Animated.View key={style} style={{ transform: [{ scale: scaleAnims[i] }] }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleStyle(style, i)}
                  style={[
                    dnaStyles.chip,
                    isSelected ? dnaStyles.chipSelected : dnaStyles.chipDefault,
                  ]}
                >
                  <Text style={[
                    dnaStyles.chipText,
                    { color: isSelected ? BG : G },
                  ]}>{style}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* MY COLOUR PALETTE card */}
      <View style={dnaStyles.card}>
        <Text style={dnaStyles.cardHeading}>MY COLOUR PALETTE</Text>
        <View style={dnaStyles.chipRow}>
          {colourOptions.map((colour, i) => {
            const isSelected = selectedColours.includes(colour);
            return (
              <Animated.View key={colour} style={{ transform: [{ scale: colourScaleAnims[i] }] }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleColour(colour, i)}
                  style={[
                    dnaStyles.chip,
                    isSelected ? dnaStyles.chipSelected : dnaStyles.chipDefault,
                  ]}
                >
                  <Text style={[
                    dnaStyles.chipText,
                    { color: isSelected ? BG : G },
                  ]}>{colour}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* I NEVER WANT TO WEAR card */}
      <View style={dnaStyles.card}>
        <Text style={dnaStyles.cardHeading}>I NEVER WANT TO WEAR</Text>
        <TextInput
          style={dnaStyles.textInput}
          placeholder="e.g. neon colours, crop tops, animal print..."
          placeholderTextColor="#555"
          value={neverWear}
          onChangeText={setNeverWear}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Learning notes — no ratings yet */}
      <Text style={dnaStyles.learningNote}>
        ✦ Rate your first outfit and Clozie will start learning your taste
      </Text>

      {/* Build My Closet button */}
      <TouchableOpacity
        style={dnaStyles.buildButton}
        activeOpacity={0.8}
        onPress={onBuildCloset}
      >
        <Text style={dnaStyles.buildButtonText}>Build My Closet →</Text>
      </TouchableOpacity>

      {/* Skip link */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBuildCloset}
      >
        <Text style={dnaStyles.skipLink}>Skip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Category colour helper ──────────────────────────────────────────────────
function getCategoryColour(category) {
  const colours = {
    Tops: '#4A7AB5',
    Bottoms: '#7B5EA7',
    Dresses: '#C47A9A',
    Outerwear: '#5A9E6F',
    Shoes: '#C4953A',
    Accessories: '#C9A96E',
  };
  return colours[category] || '#666';
}

// ── Wardrobe Tab ────────────────────────────────────────────────────────────
function WardrobeTab({ items, setItems, onGoToVibe }) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemColour, setNewItemColour] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const itemCount = items.length;
  const maxItems = 30;
  const progressWidth = (itemCount / maxItems) * 100;

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory || 'Tops',
      colour: newItemColour.trim(),
      notes: newItemNotes.trim(),
      lastWorn: null,
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemCategory('');
    setNewItemColour('');
    setNewItemNotes('');
    setShowCategoryPicker(false);
    setShowAddPanel(false);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [showAnalyseMessage, setShowAnalyseMessage] = useState(false);

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemColour(item.colour);
    setNewItemNotes(item.notes);
    setShowAddPanel(true);
  };

  const handleSaveEdit = () => {
    if (!newItemName.trim()) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === editingItemId
          ? { ...item, name: newItemName.trim(), category: newItemCategory || 'Tops', colour: newItemColour.trim(), notes: newItemNotes.trim() }
          : item
      )
    );
    setEditingItemId(null);
    setNewItemName('');
    setNewItemCategory('');
    setNewItemColour('');
    setNewItemNotes('');
    setShowCategoryPicker(false);
    setShowAddPanel(false);
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={wardrobeStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header row — label + count */}
      <View style={wardrobeStyles.headerRow}>
        <Text style={wardrobeStyles.label}>YOUR WARDROBE</Text>
        <Text style={wardrobeStyles.itemCount}>{itemCount}/{maxItems} items</Text>
      </View>

      {/* Progress bar */}
      <View style={wardrobeStyles.progressBarBg}>
        <View style={[
          wardrobeStyles.progressBarFill,
          { width: progressWidth + '%' },
        ]} />
      </View>

      {/* Empty state */}
      {itemCount === 0 && (
        <View style={wardrobeStyles.emptyState}>
          <Text style={wardrobeStyles.emptyEmoji}>👗</Text>
          <Text style={wardrobeStyles.emptyText}>
            Every great wardrobe starts with one piece. Add your first item and let's see what Clozie can do ✦
          </Text>
        </View>
      )}

      {/* Item grid — 2 columns */}
      {itemCount > 0 && (
        <View style={wardrobeStyles.grid}>
          {items.map((item) => (
            <View key={item.id} style={wardrobeStyles.gridCard}>
              {/* Placeholder photo */}
              <View style={wardrobeStyles.gridCardPhoto}>
                <Text style={{ fontSize: 28 }}>👗</Text>
              </View>
              {/* Edit icon — positioned over photo */}
              <TouchableOpacity
                style={wardrobeStyles.editIcon}
                activeOpacity={0.7}
                onPress={() => handleEditItem(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={wardrobeStyles.editIconText}>✎</Text>
              </TouchableOpacity>
              {/* Delete icon — positioned over photo */}
              <TouchableOpacity
                style={wardrobeStyles.deleteIcon}
                activeOpacity={0.7}
                onPress={() => setDeleteConfirmId(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={wardrobeStyles.deleteIconText}>✕</Text>
              </TouchableOpacity>

              {/* Delete confirmation */}
              {deleteConfirmId === item.id && (
                <View style={wardrobeStyles.deleteConfirm}>
                  <Text style={wardrobeStyles.deleteConfirmText}>
                    Remove {item.name}? This cannot be undone.
                  </Text>
                  <View style={wardrobeStyles.deleteConfirmButtons}>
                    <TouchableOpacity
                      style={wardrobeStyles.deleteConfirmRemove}
                      activeOpacity={0.8}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Text style={wardrobeStyles.deleteConfirmRemoveText}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={wardrobeStyles.deleteConfirmCancel}
                      activeOpacity={0.7}
                      onPress={() => setDeleteConfirmId(null)}
                    >
                      <Text style={wardrobeStyles.deleteConfirmCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Category tag pill */}
              <View style={[wardrobeStyles.categoryTag, { backgroundColor: getCategoryColour(item.category) }]}>
                <Text style={wardrobeStyles.categoryTagText}>{item.category}</Text>
              </View>
              {/* Item name */}
              <Text style={wardrobeStyles.gridCardName} numberOfLines={1}>{item.name}</Text>
              {/* Colour */}
              {item.colour !== '' && (
                <Text style={wardrobeStyles.gridCardColour} numberOfLines={1}>{item.colour}</Text>
              )}
              {/* Last worn date */}
              <Text style={wardrobeStyles.gridCardLastWorn}>
                {item.lastWorn ? `Last worn: ${item.lastWorn}` : 'Never worn'}
              </Text>
              {/* What goes with this */}
              <Text style={wardrobeStyles.gridCardPairLink}>What goes with this? ✦</Text>
            </View>
          ))}
        </View>
      )}

      {/* Add Item button */}
      {!showAddPanel && (
        <TouchableOpacity
          style={wardrobeStyles.addButton}
          activeOpacity={0.8}
          onPress={() => setShowAddPanel(true)}
        >
          <Text style={wardrobeStyles.addButtonText}>
            {itemCount === 0 ? '✦ Add Your First Item' : '✦ Add Another Item'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Add Item panel */}
      {showAddPanel && (
        <View style={wardrobeStyles.addPanel}>
          <View style={wardrobeStyles.addPanelHeader}>
            <Text style={wardrobeStyles.addPanelHeading}>{editingItemId ? 'EDIT ITEM' : 'ADD NEW ITEM'}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { setShowAddPanel(false); setEditingItemId(null); setNewItemName(''); setNewItemCategory(''); setNewItemColour(''); setNewItemNotes(''); setShowCategoryPicker(false); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' }}
            >
              <Text style={wardrobeStyles.addPanelClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Photo section */}
          <View style={wardrobeStyles.photoArea}>
            <Text style={wardrobeStyles.photoPlaceholder}>📷</Text>
            <Text style={wardrobeStyles.photoTitle}>Add a Photo</Text>
            <Text style={wardrobeStyles.photoSubtitle}>✦ Clozie fills in all details automatically</Text>
            <View style={wardrobeStyles.photoButtons}>
              <TouchableOpacity style={wardrobeStyles.photoButton} activeOpacity={0.7}>
                <Text style={wardrobeStyles.photoButtonText}>📸 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wardrobeStyles.photoButton} activeOpacity={0.7}>
                <Text style={wardrobeStyles.photoButtonText}>🖼 Upload File</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tip box */}
          <View style={wardrobeStyles.tipBox}>
            <Text style={wardrobeStyles.tipText}>
              💡 Best results: photograph on a white or light background — Clozie reads colours more accurately.
            </Text>
          </View>

          {/* Name field (required) */}
          <Text style={wardrobeStyles.fieldLabel}>Name *</Text>
          <TextInput
            style={wardrobeStyles.fieldInput}
            placeholder="e.g. Navy Blue Wrap Dress"
            placeholderTextColor="#555"
            value={newItemName}
            onChangeText={setNewItemName}
            returnKeyType="next"
          />

          {/* Category dropdown */}
          <Text style={wardrobeStyles.fieldLabel}>Category</Text>
          <TouchableOpacity
            style={wardrobeStyles.fieldInput}
            activeOpacity={0.7}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={{ fontFamily: 'DMMono_400Regular', fontSize: 13, color: newItemCategory ? CREAM : '#555' }}>
              {newItemCategory || 'Select category'}
            </Text>
          </TouchableOpacity>

          {/* Category options */}
          {showCategoryPicker && (
            <View style={wardrobeStyles.categoryPicker}>
              {['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    wardrobeStyles.categoryOption,
                    newItemCategory === cat && wardrobeStyles.categoryOptionSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setNewItemCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[
                    wardrobeStyles.categoryOptionText,
                    { color: newItemCategory === cat ? BG : CREAM },
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Colour/pattern field */}
          <Text style={wardrobeStyles.fieldLabel}>Colour / Pattern</Text>
          <TextInput
            style={wardrobeStyles.fieldInput}
            placeholder="e.g. Navy blue, striped"
            placeholderTextColor="#555"
            value={newItemColour}
            onChangeText={setNewItemColour}
            returnKeyType="next"
          />

          {/* Notes field */}
          <Text style={wardrobeStyles.fieldLabel}>Notes</Text>
          <TextInput
            style={[wardrobeStyles.fieldInput, { minHeight: 60 }]}
            placeholder="e.g. From Zara, size M, great for date night"
            placeholderTextColor="#555"
            value={newItemNotes}
            onChangeText={setNewItemNotes}
            multiline={true}
            textAlignVertical="top"
          />

          {/* Add to Closet button */}
          <TouchableOpacity
            style={[
              wardrobeStyles.addToClosetButton,
              !newItemName.trim() && wardrobeStyles.addToClosetButtonDisabled,
            ]}
            activeOpacity={newItemName.trim() ? 0.8 : 1}
            disabled={!newItemName.trim()}
            onPress={editingItemId ? handleSaveEdit : handleAddItem}
          >
            <Text style={wardrobeStyles.addToClosetButtonText}>{editingItemId ? 'Save Changes' : 'Add to Closet'}</Text>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            style={wardrobeStyles.cancelButton}
            activeOpacity={0.7}
            onPress={() => {
              setShowAddPanel(false);
              setEditingItemId(null);
              setNewItemName('');
              setNewItemCategory('');
              setNewItemColour('');
              setNewItemNotes('');
              setShowCategoryPicker(false);
            }}
          >
            <Text style={wardrobeStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Analyse My Wardrobe button */}
      {itemCount > 0 && !showAddPanel && (
        <TouchableOpacity
          style={wardrobeStyles.analyseButton}
          activeOpacity={0.7}
          onPress={() => setShowAnalyseMessage(true)}
        >
          <Text style={wardrobeStyles.analyseButtonText}>✦ Analyse My Wardrobe</Text>
        </TouchableOpacity>
      )}

      {/* Analyse message */}
      {showAnalyseMessage && (
        <View style={wardrobeStyles.analyseCard}>
          <Text style={wardrobeStyles.analyseCardText}>
            Wardrobe analysis is coming soon ✦ Keep adding items and Clozie will have more to work with!
          </Text>
          <TouchableOpacity
            style={wardrobeStyles.analyseCardButton}
            activeOpacity={0.8}
            onPress={() => setShowAnalyseMessage(false)}
          >
            <Text style={wardrobeStyles.analyseCardButtonText}>Got it ✦</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Set Today's Vibe button */}
      {!showAddPanel && (
        <TouchableOpacity
          style={wardrobeStyles.vibeButton}
          activeOpacity={0.8}
          onPress={onGoToVibe}
        >
          <Text style={wardrobeStyles.vibeButtonText}>Set Today's Vibe →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ── Today's Vibe Tab ────────────────────────────────────────────────────────
function TodaysVibeTab({ wardrobeItemCount, wardrobeItems, onGenerate }) {
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [pinnedItemId, setPinnedItemId] = useState(null);
  const [extraNotes, setExtraNotes] = useState('');
  const weatherOptions = ['Sunny & Hot', 'Warm & Breezy', 'Mild & Cloudy', 'Cold & Dry', 'Rainy', 'Snowy'];
  const occasionOptions = ['Casual Day', 'Work / Office', 'Date Night', 'Party', 'Outdoor / Sport', 'Formal Event', 'Weekend Errands', 'Travel'];
  const weatherScaleAnims = useRef(weatherOptions.map(() => new Animated.Value(1))).current;
  const occasionScaleAnims = useRef(occasionOptions.map(() => new Animated.Value(1))).current;

  const toggleWeather = (weather, index) => {
    Animated.sequence([
      Animated.timing(weatherScaleAnims[index], { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(weatherScaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setSelectedWeather((prev) => prev === weather ? null : weather);
  };

  const toggleOccasion = (occasion, index) => {
    Animated.sequence([
      Animated.timing(occasionScaleAnims[index], { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(occasionScaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setSelectedOccasion((prev) => prev === occasion ? null : occasion);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={vibeStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={vibeStyles.label}>TODAY'S VIBE</Text>
      <Text style={vibeStyles.heading}>Today's Vibe</Text>
      <Text style={vibeStyles.subheading}>Let's dress you perfectly for today ✦</Text>
      <View style={vibeStyles.badge}>
        <Text style={vibeStyles.badgeText}>✦ Styling from {wardrobeItemCount} items in your wardrobe</Text>
      </View>

      {/* WEATHER OUTSIDE card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>WEATHER OUTSIDE</Text>
        <View style={vibeStyles.chipRow}>
          {weatherOptions.map((weather, i) => {
            const isSelected = selectedWeather === weather;
            return (
              <Animated.View key={weather} style={{ transform: [{ scale: weatherScaleAnims[i] }] }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleWeather(weather, i)}
                  style={[
                    vibeStyles.chip,
                    isSelected ? vibeStyles.chipSelected : vibeStyles.chipDefault,
                  ]}
                >
                  <Text style={[
                    vibeStyles.chipText,
                    { color: isSelected ? BG : G },
                  ]}>{weather}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* THE OCCASION card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>THE OCCASION</Text>
        <View style={vibeStyles.chipRow}>
          {occasionOptions.map((occasion, i) => {
            const isSelected = selectedOccasion === occasion;
            return (
              <Animated.View key={occasion} style={{ transform: [{ scale: occasionScaleAnims[i] }] }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleOccasion(occasion, i)}
                  style={[
                    vibeStyles.chip,
                    isSelected ? vibeStyles.chipSelected : vibeStyles.chipDefault,
                  ]}
                >
                  <Text style={[
                    vibeStyles.chipText,
                    { color: isSelected ? BG : G },
                  ]}>{occasion}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* MUST INCLUDE ITEM card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>MUST INCLUDE ITEM</Text>
        <Text style={vibeStyles.cardSubtext}>Optional — pin one item and every outfit will include it ✦</Text>
        {wardrobeItems.length === 0 ? (
          <Text style={vibeStyles.emptyItemsText}>Add items to your wardrobe first ✦</Text>
        ) : (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={vibeStyles.itemScroll}
          >
            {wardrobeItems.map((item) => {
              const isPinned = pinnedItemId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => setPinnedItemId((prev) => prev === item.id ? null : item.id)}
                  style={[
                    vibeStyles.itemThumb,
                    isPinned && vibeStyles.itemThumbPinned,
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>👗</Text>
                  <Text style={[
                    vibeStyles.itemThumbName,
                    { color: isPinned ? G : '#999' },
                  ]} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ANYTHING ELSE? card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>ANYTHING ELSE?</Text>
        <TextInput
          style={vibeStyles.textInput}
          placeholder="e.g. I want to feel confident, no heels today..."
          placeholderTextColor="#555"
          value={extraNotes}
          onChangeText={setExtraNotes}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Generate My Outfits button */}
      <TouchableOpacity
        style={[
          vibeStyles.generateButton,
          !(selectedWeather && selectedOccasion) && vibeStyles.generateButtonDisabled,
        ]}
        activeOpacity={selectedWeather && selectedOccasion ? 0.8 : 1}
        disabled={!(selectedWeather && selectedOccasion)}
        onPress={onGenerate}
      >
        <Text style={vibeStyles.generateButtonText}>✦ Generate My Outfits →</Text>
      </TouchableOpacity>

      {/* Hint text when button is greyed */}
      {!(selectedWeather && selectedOccasion) && (
        <Text style={vibeStyles.hintText}>Select weather and occasion first ✦</Text>
      )}
    </ScrollView>
  );
}

// ── Your Looks Tab ──────────────────────────────────────────────────────────
function YourLooksTab({ onGoToVibe, isGenerating, wardrobeItems }) {
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [ratings, setRatings] = useState({});
  const [ratingFeedback, setRatingFeedback] = useState({});
  const [wornToday, setWornToday] = useState({});
  const [showBoutique, setShowBoutique] = useState({});

  const handleRate = (outfitId, rating) => {
    setRatings((prev) => ({ ...prev, [outfitId]: rating }));
    setRatingFeedback((prev) => ({ ...prev, [outfitId]: true }));
    setTimeout(() => {
      setRatingFeedback((prev) => ({ ...prev, [outfitId]: false }));
    }, 2000);
  };

  const handleRegenerate = () => {
    setLoading(true);
    setHasGenerated(false);
    setRatings({});
    setRatingFeedback({});
    setWornToday({});
    setShowBoutique({});
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
    setTimeout(() => {
      setLoading(false);
      setHasGenerated(true);
    }, 2000);
  };

  const hasAnyRating = Object.keys(ratings).length > 0;

  const handleWornToday = (outfitId) => {
    setWornToday((prev) => ({ ...prev, [outfitId]: true }));
    setTimeout(() => {
      setWornToday((prev) => ({ ...prev, [outfitId]: false }));
    }, 2000);
  };

  const toggleSave = (outfitId) => {
    setSavedOutfits((prev) =>
      prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
    );
  };

  // Build 3 sample outfits from wardrobe items
  const sampleOutfits = [
    {
      id: '1',
      vibe: 'ROMANTIC',
      name: 'Evening Glow',
      description: '"The wrap silhouette is perfect for date night — elegant and effortless."',
      items: wardrobeItems.slice(0, 3),
    },
    {
      id: '2',
      vibe: 'CASUAL',
      name: 'Day Explorer',
      description: '"Relaxed layers that work from morning coffee to evening drinks."',
      items: wardrobeItems.slice(0, Math.min(wardrobeItems.length, 3)),
    },
    {
      id: '3',
      vibe: 'CHIC',
      name: 'Weekend Ready',
      description: '"Effortlessly put-together — because weekends deserve good outfits too."',
      items: wardrobeItems.length > 1 ? wardrobeItems.slice(1, 4) : wardrobeItems.slice(0, 3),
    },
  ];

  useEffect(() => {
    if (isGenerating && !hasGenerated) {
      setLoading(true);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();

      const timer = setTimeout(() => {
        setLoading(false);
        setHasGenerated(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Loading state
  if (loading) {
    return (
      <View style={[looksStyles.scrollContent, { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.Text style={[looksStyles.spinStar, { transform: [{ rotate: spin }] }]}>✦</Animated.Text>
        <Text style={looksStyles.loadingTitle}>Styling your outfits...</Text>
        <Text style={looksStyles.loadingSubtext}>Clozie is working her magic ✦</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={looksStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={looksStyles.label}>YOUR LOOKS</Text>
      <Text style={looksStyles.heading}>Your Looks</Text>

      {/* Empty state — shown when no outfits generated yet */}
      {!hasGenerated && (
        <View style={looksStyles.emptyState}>
          <Text style={looksStyles.emptyTitle}>No outfits yet ✦</Text>
          <Text style={looksStyles.emptyText}>
            Head to Today's Vibe, tell Clozie about your day, and she'll create your perfect looks.
          </Text>
          <TouchableOpacity
            style={looksStyles.emptyButton}
            activeOpacity={0.8}
            onPress={onGoToVibe}
          >
            <Text style={looksStyles.emptyButtonText}>Go to Today's Vibe →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subtitle — only when outfits generated */}
      {hasGenerated && (
        <Text style={looksStyles.subtitle}>
          Here are today's looks, styled just for you. ✦ Clozie learns your taste with every rating.
        </Text>
      )}

      {/* Outfit cards */}
      {hasGenerated && sampleOutfits.map((outfit) => (
        <View key={outfit.id} style={looksStyles.outfitCard}>
          {/* Item photo strip — 2 columns */}
          <View style={looksStyles.photoStrip}>
            {outfit.items.length > 0 ? outfit.items.map((item) => (
              <View key={item.id} style={looksStyles.photoStripItem}>
                <View style={looksStyles.photoStripThumb}>
                  <Text style={{ fontSize: 22 }}>👗</Text>
                </View>
                <Text style={looksStyles.photoStripName} numberOfLines={1}>{item.name}</Text>
              </View>
            )) : (
              <View style={looksStyles.photoStripItem}>
                <View style={looksStyles.photoStripThumb}>
                  <Text style={{ fontSize: 22 }}>👗</Text>
                </View>
                <Text style={looksStyles.photoStripName}>Sample item</Text>
              </View>
            )}
          </View>

          {/* Vibe + name + save row */}
          <View style={looksStyles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={looksStyles.vibeLabel}>{outfit.vibe}</Text>
              <Text style={looksStyles.outfitName}>{outfit.name}</Text>
            </View>
            <TouchableOpacity
              style={[
                looksStyles.saveButton,
                savedOutfits.includes(outfit.id) && looksStyles.saveButtonSaved,
              ]}
              activeOpacity={0.7}
              onPress={() => toggleSave(outfit.id)}
            >
              <Text style={looksStyles.saveButtonText}>
                {savedOutfits.includes(outfit.id) ? '❤️ Saved' : '🤍 Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={looksStyles.outfitDesc}>{outfit.description}</Text>

          {/* Style Match Score */}
          <Text style={looksStyles.matchScore}>✦ 94% match with your Style DNA</Text>

          {/* Outfit Potential */}
          <Text style={looksStyles.outfitPotential}>These {outfit.items.length || 3} pieces create {(outfit.items.length || 3) * 4} outfits together</Text>

          {/* View Mood Board link */}
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={looksStyles.moodBoardLink}>✦ View mood board</Text>
          </TouchableOpacity>

          {/* Rating buttons */}
          <View style={looksStyles.ratingRow}>
            {[
              { key: 'love', label: '❤️ Love it' },
              { key: 'like', label: '👍 Like it' },
              { key: 'nope', label: '👎 Not for me' },
            ].map((r) => {
              const isSelected = ratings[outfit.id] === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    looksStyles.ratingButton,
                    isSelected && looksStyles.ratingButtonSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleRate(outfit.id, r.key)}
                >
                  <Text style={[
                    looksStyles.ratingButtonText,
                    { color: isSelected ? BG : CREAM },
                  ]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Rating feedback */}
          {ratingFeedback[outfit.id] && (
            <Text style={looksStyles.ratingFeedback}>✦ Thanks! Clozie is learning your taste</Text>
          )}

          {/* I wore this today */}
          <TouchableOpacity
            style={looksStyles.actionButton}
            activeOpacity={0.7}
            onPress={() => handleWornToday(outfit.id)}
          >
            <Text style={looksStyles.actionButtonText}>
              {wornToday[outfit.id] ? '✓ Worn today' : 'I wore this today'}
            </Text>
          </TouchableOpacity>

          {/* Complete The Look */}
          <TouchableOpacity
            style={looksStyles.actionButton}
            activeOpacity={0.7}
            onPress={() => setShowBoutique((prev) => ({ ...prev, [outfit.id]: !prev[outfit.id] }))}
          >
            <Text style={looksStyles.actionButtonText}>✦ Complete The Look</Text>
          </TouchableOpacity>

          {/* Boutique message */}
          {showBoutique[outfit.id] && (
            <Text style={looksStyles.boutiqueMessage}>Boutique partners coming soon ✦</Text>
          )}

          {/* Share Outfit */}
          <TouchableOpacity
            style={looksStyles.actionButton}
            activeOpacity={0.7}
          >
            <Text style={looksStyles.actionButtonText}>Share Outfit ✦</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Bottom buttons — Regenerate + Save Feedback */}
      {hasGenerated && (
        <View style={looksStyles.bottomRow}>
          <TouchableOpacity
            style={looksStyles.regenerateButton}
            activeOpacity={0.7}
            onPress={handleRegenerate}
          >
            <Text style={looksStyles.regenerateButtonText}>🔄 Regenerate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              looksStyles.feedbackButton,
              !hasAnyRating && looksStyles.feedbackButtonDisabled,
            ]}
            activeOpacity={hasAnyRating ? 0.8 : 1}
            disabled={!hasAnyRating}
            onPress={handleRegenerate}
          >
            <Text style={looksStyles.feedbackButtonText}>Save Feedback & Style Again →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ── Main App Screen — 4 bottom tabs ─────────────────────────────────────────
function MainAppScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [hasTriggeredGenerate, setHasTriggeredGenerate] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const tabs = [
    { label: 'Style DNA', icon: '✦' },
    { label: `Wardrobe (${wardrobeItems.length})`, icon: '👗' },
    { label: "Today's Vibe", icon: '🌤' },
    { label: 'Your Looks', icon: '◈' },
  ];

  const tabTitles = ['YOUR STYLE DNA', 'YOUR WARDROBE', "TODAY'S VIBE", 'YOUR LOOKS'];

  return (
    <View style={mainStyles.container}>
      <StatusBar style="light" />

      {/* Tab content area */}
      {activeTab === 0 && <StyleDNATab onBuildCloset={() => setActiveTab(1)} />}
      {activeTab === 1 && <WardrobeTab items={wardrobeItems} setItems={setWardrobeItems} onGoToVibe={() => setActiveTab(2)} />}
      {activeTab === 2 && <TodaysVibeTab wardrobeItemCount={wardrobeItems.length} wardrobeItems={wardrobeItems} onGenerate={() => { setHasTriggeredGenerate(true); setActiveTab(3); }} />}
      {activeTab === 3 && <YourLooksTab onGoToVibe={() => setActiveTab(2)} isGenerating={hasTriggeredGenerate} wardrobeItems={wardrobeItems} />}

      {/* Bottom tab bar */}
      <View style={mainStyles.tabBar}>
        {tabs.map((tab, i) => {
          const isActive = activeTab === i;
          return (
            <TouchableOpacity
              key={i}
              style={mainStyles.tabItem}
              activeOpacity={0.7}
              onPress={() => setActiveTab(i)}
            >
              {isActive && <View style={mainStyles.tabActiveBar} />}
              <Text style={[
                isActive ? mainStyles.tabIconActive : mainStyles.tabIcon,
                { color: isActive ? G : '#555' },
              ]}>{tab.icon}</Text>
              <Text style={[
                mainStyles.tabLabel,
                { color: isActive ? G : '#555' },
              ]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
            setCurrentScreen('main');
          }}
        />
      )}
      {currentScreen === 'main' && (
        <MainAppScreen />
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
              // Returning users skip straight to main app
              setCurrentScreen('main');
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

// ── Style DNA Tab styles ────────────────────────────────────────────────────
const dnaStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    color: CREAM,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#6A6058',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    width: '100%',
    marginBottom: 16,
  },
  cardHeading: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 2,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: G,
    borderColor: G,
  },
  chipDefault: {
    backgroundColor: 'transparent',
    borderColor: G + '50',
  },
  chipText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: CREAM,
    minHeight: 80,
  },
  learningNote: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: G,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    marginTop: 8,
  },
  buildButton: {
    backgroundColor: G,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    marginBottom: 14,
    width: '100%',
  },
  buildButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
    textAlign: 'center',
  },
  skipLink: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

// ── Wardrobe Tab styles ─────────────────────────────────────────────────────
const wardrobeStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    letterSpacing: 3,
  },
  itemCount: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: G,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: G,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: '#6A6058',
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: G,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    marginBottom: 14,
    alignSelf: 'center',
  },
  addButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
    textAlign: 'center',
  },
  addPanel: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    width: '100%',
    marginBottom: 16,
  },
  addPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPanelHeading: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    letterSpacing: 2,
  },
  addPanelClose: {
    fontSize: 18,
    color: G,
  },
  photoArea: {
    borderWidth: 1,
    borderColor: G + '40',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholder: {
    fontSize: 36,
    marginBottom: 10,
  },
  photoTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 18,
    color: CREAM,
    marginBottom: 6,
  },
  photoSubtitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  photoButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: CREAM,
  },
  tipBox: {
    backgroundColor: G + '10',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  tipText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: '#6A6058',
    lineHeight: 18,
  },
  fieldLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  fieldInput: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: CREAM,
  },
  categoryPicker: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  categoryOptionSelected: {
    backgroundColor: G,
  },
  categoryOptionText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
  },
  addToClosetButton: {
    backgroundColor: G,
    paddingVertical: 18,
    borderRadius: 100,
    marginTop: 20,
    marginBottom: 10,
  },
  addToClosetButtonDisabled: {
    opacity: 0.4,
  },
  addToClosetButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  cancelButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gridCardPhoto: {
    width: '100%',
    height: 120,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    overflow: 'hidden',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginTop: 10,
    marginLeft: 10,
  },
  categoryTagText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.5,
  },
  gridCardName: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: CREAM,
    marginTop: 6,
    marginHorizontal: 10,
  },
  gridCardColour: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: '#666',
    marginTop: 3,
    marginHorizontal: 10,
  },
  gridCardLastWorn: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: '#555',
    marginTop: 4,
    marginHorizontal: 10,
  },
  gridCardPairLink: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    marginTop: 6,
    marginHorizontal: 10,
    marginBottom: 12,
  },
  analyseButton: {
    borderWidth: 1,
    borderColor: G,
    paddingVertical: 16,
    borderRadius: 100,
    marginBottom: 12,
    alignItems: 'center',
  },
  analyseButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: G,
  },
  analyseCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: G + '30',
    marginBottom: 12,
    alignItems: 'center',
  },
  analyseCardText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#6A6058',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  analyseCardButton: {
    backgroundColor: G,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  analyseCardButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: BG,
  },
  vibeButton: {
    backgroundColor: G,
    paddingVertical: 18,
    borderRadius: 100,
    marginBottom: 20,
    alignItems: 'center',
  },
  vibeButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
  },
  editIcon: {
    position: 'absolute',
    top: 6,
    right: 40,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  editIconText: {
    fontSize: 14,
    color: '#fff',
  },
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteIconText: {
    fontSize: 14,
    color: '#fff',
  },
  deleteConfirm: {
    backgroundColor: BG,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  deleteConfirmText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: CREAM,
    lineHeight: 18,
    marginBottom: 10,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteConfirmRemove: {
    flex: 1,
    backgroundColor: G,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  deleteConfirmRemoveText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: BG,
  },
  deleteConfirmCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  deleteConfirmCancelText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#666',
  },
});

// ── Today's Vibe Tab styles ─────────────────────────────────────────────────
const vibeStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    letterSpacing: 3,
    marginBottom: 12,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    color: CREAM,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#6A6058',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: G + '15',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  badgeText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    width: '100%',
    marginBottom: 16,
  },
  cardHeading: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 2,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: G,
    borderColor: G,
  },
  chipDefault: {
    backgroundColor: 'transparent',
    borderColor: G + '50',
  },
  chipText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
  },
  cardSubtext: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: '#6A6058',
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyItemsText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    paddingVertical: 16,
  },
  itemScroll: {
    flexDirection: 'row',
  },
  itemThumb: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 8,
  },
  itemThumbPinned: {
    borderColor: G,
    backgroundColor: G + '15',
  },
  itemThumbName: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    marginTop: 6,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: CREAM,
    minHeight: 80,
  },
  generateButton: {
    backgroundColor: G,
    paddingVertical: 18,
    borderRadius: 100,
    marginBottom: 10,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
  },
  hintText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
});

// ── Your Looks Tab styles ───────────────────────────────────────────────────
const looksStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    letterSpacing: 3,
    marginBottom: 12,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    color: CREAM,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: '#6A6058',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: CREAM,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: '#6A6058',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: G,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
  },
  emptyButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: BG,
    textAlign: 'center',
  },
  spinStar: {
    fontSize: 36,
    color: G,
    marginBottom: 20,
  },
  loadingTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: CREAM,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: G,
  },
  outfitCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    width: '100%',
  },
  photoStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  photoStripItem: {
    width: '47%',
    alignItems: 'center',
  },
  photoStripThumb: {
    width: '100%',
    height: 80,
    backgroundColor: BG,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoStripName: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vibeLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: G,
    letterSpacing: 2,
    marginBottom: 4,
  },
  outfitName: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: CREAM,
  },
  outfitDesc: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#7A6A58',
    lineHeight: 19,
  },
  matchScore: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    marginTop: 12,
  },
  outfitPotential: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  moodBoardLink: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    marginTop: 10,
  },
  saveButton: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonSaved: {
    borderColor: G,
  },
  saveButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: CREAM,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  ratingButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: G,
    borderColor: G,
  },
  ratingButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
  },
  ratingFeedback: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    marginTop: 10,
    textAlign: 'center',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: G + '50',
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
  },
  boutiqueMessage: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: '#6A6058',
    textAlign: 'center',
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  regenerateButton: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenerateButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: CREAM,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: G,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackButtonDisabled: {
    opacity: 0.4,
  },
  feedbackButtonText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: BG,
    textAlign: 'center',
  },
});

// ── Main App Screen styles ──────────────────────────────────────────────────
const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tabTitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: G,
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: '#6A6058',
    textAlign: 'center',
    lineHeight: 22,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  tabIconActive: {
    fontSize: 20,
    marginBottom: 5,
    textShadowColor: G + '60',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  tabLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tabActiveBar: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: G,
    borderRadius: 1,
  },
});
