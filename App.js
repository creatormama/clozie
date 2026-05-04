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
  Modal,
  Switch,
  Image,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_400Regular, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import { DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic } from '@expo-google-fonts/dm-serif-display';
import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as NativeSplash from 'expo-splash-screen';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './src/lib/supabase';

// ── Design tokens — sacred, never change ─────────────────────────────────────
const G = '#C9A96E';       // gold accent
const BG = '#0D0C0A';      // background
const CARD = '#161512';     // card background
const BORDER = '#252320';   // border color
const CREAM = '#EDE5D8';    // logo "Clo" color

// ── Welcome Screen photo asset ───────────────────────────────────────────────
const WELCOME_PHOTO = require('./assets/New-welcome-screen-photo.jpg');
const POSTLOGIN_PHOTO = require('./assets/mirror-photo-post-login.jpg');

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
    <View style={styles.splashScreen}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity: logoFade }}>
        <Text style={styles.splashLogo}>
          <Text style={styles.splashLogoClo}>Clo</Text>
          <Text style={styles.splashLogoZie}>zie</Text>
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
    <Animated.View style={[welcomeStyles.screen, { opacity: fadeAnim }]}>
      <StatusBar style="light" />
      <ImageBackground
        source={WELCOME_PHOTO}
        style={welcomeStyles.photo}
        imageStyle={welcomeStyles.photoImage}
        resizeMode="contain"
      >
        <LinearGradient
          colors={['rgba(44,26,14,0.30)', 'rgba(44,26,14,0.12)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={welcomeStyles.topGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(232,228,206,0)', 'rgba(232,228,206,0.7)', '#E8E4CE', '#E8E4CE']}
          locations={[0, 0.25, 0.5, 1]}
          style={welcomeStyles.bottomGradient}
          pointerEvents="none"
        />

        <View style={welcomeStyles.logoBlock} pointerEvents="none">
          <Text style={welcomeStyles.logoRow}>
            <Text style={welcomeStyles.logoClo}>Clo</Text>
            <Text style={welcomeStyles.logoZie}>zie</Text>
          </Text>
          <Text style={welcomeStyles.eyebrow}>YOUR PERSONAL STYLIST</Text>
        </View>

        <View style={welcomeStyles.bottomBlock}>
          <Text style={welcomeStyles.tagline}>
            Everyone says I have nothing to wear.{'\n'}Clozie solves that in 30 seconds.
          </Text>

          <View style={welcomeStyles.buttonRing}>
            <TouchableOpacity
              style={welcomeStyles.button}
              activeOpacity={0.85}
              onPress={onNext}
            >
              <Text style={welcomeStyles.buttonText}>Look Inside →</Text>
            </TouchableOpacity>
          </View>

          <View style={welcomeStyles.signInRow}>
            <Text style={welcomeStyles.signInRowText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={onSignIn}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              accessibilityRole="link"
            >
              <Text style={welcomeStyles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

// ── Peek Inside Screen (How It Works) ────────────────────────────────────────
function PeekInsideScreen({ onStartStyling, onSignIn }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const Step1Visual = () => (
    <View style={peekStyles.innerPreview}>
      <View style={peekStyles.itemRow}>
        <View style={peekStyles.itemIcon}>
          <Text style={{ fontSize: 28 }}>👗</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={peekStyles.recognisedLabel}>CLOZIE RECOGNISED ✦</Text>
          <Text style={peekStyles.itemName}>Teal Wrap Dress</Text>
          <Text style={peekStyles.itemMeta}>Teal · Midi Length</Text>
        </View>
        <View style={peekStyles.checkCircle}>
          <Text style={{ fontSize: 11 }}>✅</Text>
        </View>
      </View>
      <View style={peekStyles.scanProgressBar} />
      <View style={peekStyles.tagRow}>
        {['👚 Tops · 3', '👖 Bottoms · 2', '👟 Shoes · 3'].map((tag, i) => (
          <View key={i} style={peekStyles.tagChip}>
            <Text style={peekStyles.tagChipText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const Step2Visual = () => {
    const temps = ['Cold', 'Cool', 'Warm', 'Hot'];
    const conds = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
    const occs = ['Work · Office', 'Casual Day', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel'];
    const tempSel = 1;
    const condSel = 0;
    const occSel = 0;
    return (
      <View style={peekStyles.innerPreview}>
        <Text style={peekStyles.vibeLabel}>TODAY'S VIBE</Text>
        <View style={peekStyles.chipRow}>
          {temps.map((t, i) => (
            <View key={i} style={[
              peekStyles.chip,
              i === tempSel ? peekStyles.chipSelected : peekStyles.chipDefault,
            ]}>
              <Text style={[peekStyles.chipText, { color: i === tempSel ? '#FFFFFF' : '#5C4A3A' }]}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={peekStyles.chipRow}>
          {conds.map((c, i) => (
            <View key={i} style={[
              peekStyles.chip,
              i === condSel ? peekStyles.chipSelected : peekStyles.chipDefault,
            ]}>
              <Text style={[peekStyles.chipText, { color: i === condSel ? '#FFFFFF' : '#5C4A3A' }]}>{c}</Text>
            </View>
          ))}
        </View>
        <View style={peekStyles.chipRow}>
          {occs.map((o, i) => (
            <View key={i} style={[
              peekStyles.chip,
              i === occSel ? peekStyles.chipSelected : peekStyles.chipDefault,
            ]}>
              <Text style={[peekStyles.chipText, { color: i === occSel ? '#FFFFFF' : '#5C4A3A' }]}>{o}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const Step3Visual = () => (
    <View style={peekStyles.innerPreview}>
      <View style={{ marginBottom: 10 }}>
        <Text style={peekStyles.outfitVibe}>ROMANTIC</Text>
        <Text style={peekStyles.outfitName}>Evening Glow</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 }}>
          <View style={peekStyles.moodTab}>
            <Text style={peekStyles.moodTabText}>🖼 Mood Board</Text>
          </View>
          <View style={peekStyles.bodyTab}>
            <Text style={peekStyles.bodyTabText}>✦ Hanger View</Text>
          </View>
        </View>
      </View>
      <View style={peekStyles.tagRow}>
        {['Teal Wrap Dress', 'Brown Flats', 'Gold Earrings'].map((item, i) => (
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
    'Take a photo of any clothing item, shoes or accessories — best on a white background. Clozie instantly fills in all the details.',
    'Pick the weather and your plans. Heading to work? Going out? Weekend errands? Clozie styles you for the moment.',
    'Clozie creates 3 styled outfits from YOUR actual clothes. See them in a mood board or on the hanger. Rate them and Clozie learns your taste.',
  ];

  return (
    <View style={peekStyles.screen}>
      <StatusBar style="dark" />
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>

        <View style={peekStyles.fixedHeader}>
          <Text style={[styles.logo, { marginBottom: 4 }]}>
            <Text style={peekStyles.peekLogoClo}>Clo</Text>
            <Text style={peekStyles.peekLogoZie}>zie</Text>
          </Text>
          <Text style={peekStyles.howLabel}>✦ YOUR OUTFIT IN 3 STEPS ✦</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={peekStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {[0, 1, 2].map((i) => (
            <View key={i} style={peekStyles.contentCard}>
              <Text style={peekStyles.stepEyebrow}>STEP {i + 1}</Text>
              <Text style={peekStyles.cardTitle}>{titles[i]}</Text>
              <Text style={peekStyles.cardDesc}>{descs[i]}</Text>
              {visuals[i]}
            </View>
          ))}
        </ScrollView>

        <View style={peekStyles.footer}>
          <LinearGradient
            colors={['rgba(232,228,206,0)', '#E8E4CE']}
            style={peekStyles.fade}
            pointerEvents="none"
          />
          <View style={peekStyles.buttonRing}>
            <TouchableOpacity style={peekStyles.button} activeOpacity={0.85} onPress={onStartStyling}>
              <Text style={peekStyles.buttonText}>✦ Start Styling — It's Free</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={peekStyles.signInTouch}
            activeOpacity={0.7}
            onPress={onSignIn}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Sign in"
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text style={peekStyles.signInRow}>
              Already have an account?{' '}
              <Text style={peekStyles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
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
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Clear age error when user ticks the checkbox
  useEffect(() => {
    if (ageError && ageConfirmed) setAgeError('');
  }, [ageConfirmed]);

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setAgeError('');

    // ── Sign Up validation ──
    if (!isLogin && !isForgot) {
      if (!name.trim()) {
        setError('Please tell us your name');
        return;
      }
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setError("That email doesn't look right — please check it");
        return;
      }
      if (password.length < 8) {
        setError('Password needs at least 8 characters');
        return;
      }
      if (!ageConfirmed) {
        setAgeError('Please confirm you are 13 or older');
        return;
      }

      // Real Supabase sign up
      setLoading(true);
      try {
        const { data, error: supaErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });

        if (supaErr) {
          const msg = (supaErr.message || '').toLowerCase();
          const code = supaErr.code || '';
          if (
            code === 'user_already_exists' ||
            msg.includes('already registered') ||
            msg.includes('already been registered') ||
            msg.includes('user already')
          ) {
            setError('An account with this email already exists — try signing in instead');
          } else {
            setError('Something went wrong — please try again');
          }
          return;
        }

        // Success — navigate to Post-Login Welcome
        onDone({ name: name.trim(), email: email.trim(), mode: 'signup' });
      } catch (e) {
        setError('Something went wrong — please try again');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Login validation ──
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password');
        return;
      }

      // Real Supabase sign in
      setLoading(true);
      try {
        const { data, error: supaErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (supaErr) {
          setError("Email or password doesn't match — please try again");
          return;
        }

        // Success — navigate to main app
        onDone({ email: email.trim(), mode: 'login' });
      } catch (e) {
        setError('Something went wrong — please try again');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Forgot Password ──
    if (isForgot) {
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setError("That email doesn't look right — please check it");
        return;
      }
      setLoading(true);
      try {
        const { error: supaErr } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (supaErr) {
          setError("Couldn't send reset link — please try again");
          return;
        }
        setResetSent(true);
      } catch (e) {
        setError("Couldn't send reset link — please try again");
      } finally {
        setLoading(false);
      }
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
      ? ''
      : 'Your personal stylist awaits';

  const buttonLabel = isForgot
    ? 'Send Reset Link →'
    : isLogin
      ? 'Sign In →'
      : 'Create Account →';

  return (
    <View style={[styles.screen, { justifyContent: 'flex-start', backgroundColor: '#E8E4CE' }]}>
      <StatusBar style="dark" />
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
                <Text style={[styles.logoClo, { fontSize: 36, fontFamily: 'DMSerifDisplay_400Regular', color: '#2C1A0E' }]}>Clo</Text>
                <Text style={[styles.logoZie, { fontSize: 36, fontFamily: 'DMSerifDisplay_400Regular_Italic', color: '#C87A52' }]}>zie</Text>
              </Text>
              <Text style={authStyles.headingLabel}>{headingLabel}</Text>
              <Text style={authStyles.subtitle}>{subtitle}</Text>
            </View>

            {/* Social buttons — NOT shown on Forgot Password */}
            {!isForgot && (
              <View style={authStyles.socialBlock}>
                {/* Continue with Google — HIDDEN for Apple review (May 2026). To re-enable, change `false` to `true`. */}
                {false && (
                <TouchableOpacity
                  style={authStyles.socialButton}
                  activeOpacity={0.7}
                  onPress={() => onDone({ email: 'google@user.com', name: 'Google User', mode: isLogin ? 'login' : 'signup' })}
                >
                  <Svg width={20} height={20} viewBox="0 0 48 48">
                    <Path fill="#FBBC05" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <Path fill="#EA4335" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <Path fill="#34A853" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <Path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </Svg>
                  <Text style={authStyles.socialText}>Continue with Google</Text>
                </TouchableOpacity>
                )}

                {/* Continue with Apple */}
                <TouchableOpacity
                  style={authStyles.socialButton}
                  activeOpacity={0.7}
                  onPress={() => onDone({ email: 'apple@user.com', name: 'Apple User', mode: isLogin ? 'login' : 'signup' })}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path
                      fill="#2C1A0E"
                      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    />
                  </Svg>
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
                  Check your email — We've sent a reset link to {email}
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 24, minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}
                  activeOpacity={0.7}
                  onPress={() => onSwitchMode('login')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                      placeholderTextColor="rgba(44,26,14,0.4)"
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
                    placeholderTextColor="rgba(44,26,14,0.4)"
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
                        placeholderTextColor="rgba(44,26,14,0.4)"
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

                {/* Age 13+ checkbox — Sign Up only */}
                {!isLogin && !isForgot && (
                  <View style={authStyles.ageBlock}>
                    <TouchableOpacity
                      style={authStyles.ageRow}
                      activeOpacity={0.7}
                      onPress={() => setAgeConfirmed(!ageConfirmed)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <View style={[authStyles.checkbox, ageConfirmed && authStyles.checkboxChecked]}>
                        {ageConfirmed && <Text style={authStyles.checkmark}>✓</Text>}
                      </View>
                      <Text style={authStyles.ageText}>I am at least 13 years old</Text>
                    </TouchableOpacity>
                    {ageError !== '' && (
                      <Text style={authStyles.ageErrorText}>{ageError}</Text>
                    )}
                  </View>
                )}

                {/* Error message — warm terracotta */}
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
                  style={[styles.goldButton, {
                    width: '100%',
                    marginTop: 4,
                    backgroundColor: '#BCC7B7',
                    borderWidth: 3,
                    borderColor: '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                    opacity: loading ? 0.6 : 1,
                  }]}
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={[styles.goldButtonText, {
                    fontFamily: 'Outfit_500Medium',
                    color: '#2C1A0E',
                  }]}>{buttonLabel}</Text>
                </TouchableOpacity>

                {/* Switch mode link — Login ↔ Sign Up */}
                {!isForgot && (
                  <TouchableOpacity
                    style={{ marginTop: 16, minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
                    activeOpacity={0.7}
                    onPress={() => onSwitchMode(isLogin ? 'signup' : 'login')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#5C4A3A', textAlign: 'center' }}>
                      {isLogin ? "Don't have an account? " : 'Already have an account? '}
                      <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A44A34' }}>
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Back to Sign In — Forgot Password only */}
                {isForgot && (
                  <TouchableOpacity
                    style={{ marginTop: 16, minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}
                    activeOpacity={0.7}
                    onPress={() => onSwitchMode('login')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    <Animated.View style={[postLoginStyles.screen, { opacity: fadeAnim }]}>
      <StatusBar style="dark" />

      {/* Photo fills width at natural 9:16 aspect, top-aligned — nothing cropped */}
      <Image
        source={POSTLOGIN_PHOTO}
        style={postLoginStyles.photoImage}
      />

      {/* Subtle fade — transparent at top, fading to sage at the bottom */}
      <LinearGradient
        colors={['transparent', '#E8E4CE']}
        locations={[0, 0.6]}
        style={postLoginStyles.bottomGradient}
        pointerEvents="none"
      />

      {/* Logo, body text, button — bottom of screen */}
      <View style={postLoginStyles.bottomBlock}>
        <Text style={postLoginStyles.logoRow}>
          <Text style={postLoginStyles.logoClo}>Clo</Text>
          <Text style={postLoginStyles.logoZie}>zie</Text>
        </Text>

        <Text style={postLoginStyles.body}>
          The more you use Clozie, the better she knows you
        </Text>

        <View style={postLoginStyles.buttonRing}>
          <TouchableOpacity
            style={postLoginStyles.button}
            activeOpacity={0.85}
            onPress={onStart}
          >
            <Text style={postLoginStyles.buttonText}>Let's Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
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
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={dnaStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={dnaStyles.heading}>Your Style</Text>
      <Text style={dnaStyles.subtitle}>
        Clozie uses this to personalize every outfit, the more you use her the better she knows you
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
                    { color: '#2C1A0E' },
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
                    { color: '#2C1A0E' },
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
          placeholderTextColor="rgba(44,26,14,0.35)"
          value={neverWear}
          onChangeText={setNeverWear}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Learning notes — no ratings yet */}
      <Text style={dnaStyles.learningNote}>
        Rate your first outfit and Clozie will start learning your taste
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
        hitSlop={{ top: 15, bottom: 15, left: 30, right: 30 }}
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

function getCategoryEmoji(category) {
  const emojis = {
    Tops: '👕',
    Bottoms: '👖',
    Dresses: '👗',
    Outerwear: '🧥',
    Shoes: '👟',
    Accessories: '💍',
  };
  return emojis[category] || '👗';
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
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={wardrobeStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading */}
      <Text style={wardrobeStyles.heading}>Your Closet</Text>

      {/* Item count row */}
      <View style={wardrobeStyles.headerRow}>
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
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Text style={wardrobeStyles.deleteConfirmRemoveText}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={wardrobeStyles.deleteConfirmCancel}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => setDeleteConfirmId(null)}
                    >
                      <Text style={wardrobeStyles.deleteConfirmCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Category tag pill */}
              <View style={wardrobeStyles.categoryTag}>
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
              {/* What goes with this — hidden until tappable feature is built (Phase 2) */}
              {false && (
                <Text style={wardrobeStyles.gridCardPairLink}>What goes with this?</Text>
              )}
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
            placeholderTextColor="rgba(44,26,14,0.40)"
            value={newItemName}
            onChangeText={setNewItemName}
            returnKeyType="next"
          />

          {/* Category dropdown */}
          <Text style={wardrobeStyles.fieldLabel}>Category</Text>
          <TouchableOpacity
            style={wardrobeStyles.fieldInput}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: newItemCategory ? '#2C1A0E' : 'rgba(44,26,14,0.40)' }}>
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
                    { color: '#2C1A0E' },
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
            placeholderTextColor="rgba(44,26,14,0.40)"
            value={newItemColour}
            onChangeText={setNewItemColour}
            returnKeyType="next"
          />

          {/* Notes field */}
          <Text style={wardrobeStyles.fieldLabel}>Notes</Text>
          <TextInput
            style={[wardrobeStyles.fieldInput, { minHeight: 60 }]}
            placeholder="e.g. From Zara, size M, great for date night"
            placeholderTextColor="rgba(44,26,14,0.40)"
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
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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

      {/* Analyse My Wardrobe button — hidden until real Wardrobe Intelligence is built (Phase 2) */}
      {false && itemCount > 0 && !showAddPanel && (
        <TouchableOpacity
          style={wardrobeStyles.analyseButton}
          activeOpacity={0.7}
          onPress={() => setShowAnalyseMessage(true)}
        >
          <Text style={wardrobeStyles.analyseButtonText}>Analyse My Wardrobe</Text>
        </TouchableOpacity>
      )}

      {/* Analyse message — hidden with the button (Phase 2) */}
      {false && showAnalyseMessage && (
        <View style={wardrobeStyles.analyseCard}>
          <Text style={wardrobeStyles.analyseCardText}>
            Wardrobe analysis is coming soon ✦ Keep adding items and Clozie will have more to work with!
          </Text>
          <TouchableOpacity
            style={wardrobeStyles.analyseCardButton}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
  const [selectedTemperature, setSelectedTemperature] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [indoors, setIndoors] = useState(false);
  const [pinnedItemId, setPinnedItemId] = useState(null);
  const [extraNotes, setExtraNotes] = useState('');
  const temperatureOptions = ['Cold', 'Cool', 'Warm', 'Hot'];
  const conditionOptions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
  const occasionOptions = ['Casual Day', 'Work · Office', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel'];
  const temperatureScaleAnims = useRef(temperatureOptions.map(() => new Animated.Value(1))).current;
  const conditionScaleAnims = useRef(conditionOptions.map(() => new Animated.Value(1))).current;
  const occasionScaleAnims = useRef(occasionOptions.map(() => new Animated.Value(1))).current;

  const toggleTemperature = (temperature, index) => {
    Animated.sequence([
      Animated.timing(temperatureScaleAnims[index], { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(temperatureScaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setSelectedTemperature((prev) => prev === temperature ? null : temperature);
  };

  const toggleCondition = (condition, index) => {
    Animated.sequence([
      Animated.timing(conditionScaleAnims[index], { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(conditionScaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setSelectedCondition((prev) => prev === condition ? null : condition);
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
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={vibeStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={vibeStyles.heading}>Today's Vibe</Text>
      <Text style={vibeStyles.subheading}>Pick your weather and occasion — Clozie does the rest.</Text>
      <View style={vibeStyles.badge}>
        <Text style={vibeStyles.badgeText}>Styling from {wardrobeItemCount} items in your wardrobe</Text>
      </View>

      {/* WEATHER OUTSIDE card */}
      <View style={vibeStyles.card}>
        <Text style={[vibeStyles.cardHeading, { color: '#2C1A0E' }]}>WEATHER OUTSIDE</Text>

        <Text style={vibeStyles.subLabel}>TEMPERATURE</Text>
        <View style={vibeStyles.chipRow}>
          {temperatureOptions.map((temperature, i) => {
            const isSelected = selectedTemperature === temperature;
            return (
              <Animated.View key={temperature} style={{ transform: [{ scale: temperatureScaleAnims[i] }] }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleTemperature(temperature, i)}
                  style={[
                    vibeStyles.chip,
                    isSelected ? vibeStyles.chipSelected : vibeStyles.chipDefault,
                  ]}
                >
                  <Text style={vibeStyles.chipText}>{temperature}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <Text style={[vibeStyles.subLabel, { marginTop: 10 }]}>CONDITION</Text>
        <View style={vibeStyles.chipRow}>
          {conditionOptions.map((condition, i) => {
            const isSelected = selectedCondition === condition;
            return (
              <Animated.View key={condition} style={{ transform: [{ scale: conditionScaleAnims[i] }] }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleCondition(condition, i)}
                  style={[
                    vibeStyles.chip,
                    isSelected ? vibeStyles.chipSelected : vibeStyles.chipDefault,
                  ]}
                >
                  <Text style={vibeStyles.chipText}>{condition}</Text>
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
                  <Text style={vibeStyles.chipText}>{occasion}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={vibeStyles.indoorsRow}>
          <Text style={vibeStyles.indoorsLabel}>I'll be indoors</Text>
          <Switch
            value={indoors}
            onValueChange={setIndoors}
            trackColor={{ false: 'rgba(44,26,14,0.15)', true: '#BCC7B7' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="rgba(44,26,14,0.15)"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </View>
      </View>

      {/* MUST INCLUDE ITEM card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>MUST INCLUDE ITEM</Text>
        <Text style={vibeStyles.cardSubtext}>Something in mind? Pin it — Clozie builds around it.{'\n'}A jacket, a dress, those new shoes.</Text>
        {wardrobeItems.length === 0 ? (
          <Text style={vibeStyles.emptyItemsText}>✦ Add items to your wardrobe first ✦</Text>
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
                    { color: isPinned ? '#2C1A0E' : '#5C4A3A' },
                  ]} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* TELL CLOZIE MORE card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>TELL CLOZIE MORE</Text>
        <TextInput
          style={vibeStyles.textInput}
          placeholder="Tell Clozie more — which jacket? office is cold, dinner out, no heels today…"
          placeholderTextColor="rgba(44,26,14,0.40)"
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
          !(selectedTemperature && selectedCondition && selectedOccasion) && vibeStyles.generateButtonDisabled,
        ]}
        activeOpacity={selectedTemperature && selectedCondition && selectedOccasion ? 0.8 : 1}
        disabled={!(selectedTemperature && selectedCondition && selectedOccasion)}
        onPress={onGenerate}
      >
        <Text style={[
          vibeStyles.generateButtonText,
          !(selectedTemperature && selectedCondition && selectedOccasion) && vibeStyles.generateButtonTextDisabled,
        ]}>✦ Generate My Outfits →</Text>
      </TouchableOpacity>

      {/* Hint text when button is greyed */}
      {!(selectedTemperature && selectedCondition && selectedOccasion) && (
        <Text style={vibeStyles.hintText}>Select weather and occasion first</Text>
      )}
    </ScrollView>
  );
}

// ── Mood Board polaroid system ──────────────────────────────────────────────
// Placeholder fill colors per category (used until real item photos land in Phase 2)
const MOOD_PLACEHOLDER_COLORS = {
  Tops:        '#E8E0D5',
  Bottoms:     '#3A4555',
  Outerwear:   '#C9A878',
  Dresses:     '#D8A8A0',
  Shoes:       '#6B4D38',
  Accessories: '#D4B888',
};

// Anatomical sort order for accessories: head → ears → neck → wrist → waist → hand
const accessoryRank = (name) => {
  const n = (name || '').toLowerCase();
  if (/(hat|cap|beret|beanie|headband)/.test(n)) return 1;
  if (/(earring|hoop|stud)/.test(n)) return 2;
  if (/(necklace|choker|pendant)/.test(n)) return 3;
  if (/(bracelet|cuff|watch)/.test(n)) return 4;
  if (/(belt|sash)/.test(n)) return 5;
  if (/(ring|bag|purse|clutch|tote|glove)/.test(n)) return 6;
  return 7;
};

// Auto-detect which of the 8 layouts to use from outfit composition
const detectMoodLayout = (items) => {
  const hasDress = items.some(i => i.category === 'Dresses');
  const hasOuter = items.some(i => i.category === 'Outerwear');
  const hasAcc   = items.some(i => i.category === 'Accessories');
  if (hasDress && !hasOuter && !hasAcc) return 'D';
  if (hasDress && !hasOuter && hasAcc)  return 'F';
  if (hasDress && hasOuter && !hasAcc)  return 'E-fix';
  if (hasDress && hasOuter && hasAcc)   return 'G';
  if (!hasDress && !hasOuter && !hasAcc) return 'C';
  if (!hasDress && !hasOuter && hasAcc)  return 'A';
  if (!hasDress && hasOuter && !hasAcc)  return 'B-lite';
  return 'B';
};

// Decorative outfit palette — first 4 unique category colors, padded with cream
const buildMoodSwatches = (items) => {
  const colors = [];
  const seen = new Set();
  items.forEach(i => {
    const c = MOOD_PLACEHOLDER_COLORS[i.category] || '#E8E0D5';
    if (!seen.has(c)) { seen.add(c); colors.push(c); }
  });
  while (colors.length < 4) colors.push('#E8E0D5');
  return colors.slice(0, 4);
};

// Build the array of polaroid specs for a given layout key
const buildMoodPolaroids = (layout, items) => {
  const dress  = items.find(i => i.category === 'Dresses');
  const top    = items.find(i => i.category === 'Tops');
  const outer  = items.find(i => i.category === 'Outerwear');
  const bottom = items.find(i => i.category === 'Bottoms');
  const shoes  = items.find(i => i.category === 'Shoes');
  const accs   = items
    .filter(i => i.category === 'Accessories')
    .sort((a, b) => accessoryRank(a.name) - accessoryRank(b.name));

  let specs;
  switch (layout) {
    case 'A':
      specs = [
        { kind: 'item', item: top,    w: 130, h: 168, top: 70,    left: 22,     rot: -5 },
        { kind: 'acc',  items: accs,  w: 130, h: 130, top: 90,    right: 22,    rot:  4 },
        { kind: 'item', item: bottom, w: 130, h: 110, bottom: 95, left: 22,     rot: -2 },
        { kind: 'item', item: shoes,  w: 130, h: 110, bottom: 70, right: 22,    rot:  2 },
      ];
      break;
    case 'B':
      specs = [
        { kind: 'item', item: top,    w: 120, h: 150, top: 50,    left: 22,     rot: -5 },
        { kind: 'item', item: outer,  w: 120, h: 150, top: 64,    right: 22,    rot:  4 },
        { kind: 'item', item: bottom, w: 120, h: 150, top: 220,   center: true, rot: -2 },
        { kind: 'item', item: shoes,  w: 120, h: 100, bottom: 30, left: 22,     rot: -3 },
        { kind: 'acc',  items: accs,  w: 120, h: 120, bottom: 20, right: 22,    rot:  3 },
      ];
      break;
    case 'B-lite':
      specs = [
        { kind: 'item', item: top,    w: 130, h: 168, top: 70,    left: 22,  rot: -5 },
        { kind: 'item', item: outer,  w: 130, h: 168, top: 90,    right: 22, rot:  4 },
        { kind: 'item', item: bottom, w: 130, h: 110, bottom: 95, left: 22,  rot: -2 },
        { kind: 'item', item: shoes,  w: 130, h: 110, bottom: 70, right: 22, rot:  2 },
      ];
      break;
    case 'C':
      specs = [
        { kind: 'item', item: top,    w: 130, h: 168, top: 70,    left: 22,     rot: -5 },
        { kind: 'item', item: bottom, w: 130, h: 168, top: 130,   right: 22,    rot:  4 },
        { kind: 'item', item: shoes,  w: 145, h: 105, bottom: 30, center: true, rot: -2 },
      ];
      break;
    case 'D':
      specs = [
        { kind: 'item', item: dress, w: 150, h: 200, top: 70,    left: 30,  rot: -4 },
        { kind: 'item', item: shoes, w: 140, h: 105, bottom: 65, right: 30, rot:  3 },
      ];
      break;
    case 'E-fix':
      specs = [
        { kind: 'item', item: dress, w: 130, h: 168, top: 70,    left: 22,     rot: -5 },
        { kind: 'item', item: outer, w: 130, h: 168, top: 130,   right: 22,    rot:  4 },
        { kind: 'item', item: shoes, w: 145, h: 105, bottom: 30, center: true, rot: -2 },
      ];
      break;
    case 'F':
      specs = [
        { kind: 'item', item: dress, w: 165, h: 220, top: 105,   left: 22,     rot: -3 },
        { kind: 'acc',  items: accs, w:  90, h:  90, top: 50,    right: 14,    rot:  6 },
        { kind: 'item', item: shoes, w: 140, h: 105, bottom: 35, center: true, rot:  2 },
      ];
      break;
    case 'G':
      specs = [
        { kind: 'item', item: dress, w: 130, h: 168, top: 70,    left: 22,  rot: -5 },
        { kind: 'item', item: outer, w: 130, h: 168, top: 90,    right: 22, rot:  4 },
        { kind: 'item', item: shoes, w: 130, h: 110, bottom: 70, left: 22,  rot: -2 },
        { kind: 'acc',  items: accs, w: 130, h: 130, bottom: 60, right: 22, rot:  3 },
      ];
      break;
    default:
      specs = [];
  }

  // Drop polaroids whose source data is missing (e.g. layout expects outerwear but none present)
  return specs.filter(s => s.kind === 'acc' ? (s.items && s.items.length > 0) : !!s.item);
};

// Single accessory cell — colored fill, or empty, or "+N" terracotta capsule
function MoodAccCell({ cell }) {
  if (cell.kind === 'empty') return <View style={{ flex: 1 }} />;
  if (cell.kind === 'overflow') {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#A44A34',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
      }}>
        <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: '#FFFFFF' }}>+{cell.count}</Text>
      </View>
    );
  }
  return <View style={{ flex: 1, backgroundColor: MOOD_PLACEHOLDER_COLORS.Accessories }} />;
}

// Accessory grid — 1 / 2x1 / 2x2 (with empty) / 2x2 / 2x2 + overflow
function MoodAccessoryGrid({ items }) {
  let rows;
  if (items.length === 1) {
    rows = [[{ kind: 'item', item: items[0] }]];
  } else if (items.length === 2) {
    rows = [[{ kind: 'item', item: items[0] }, { kind: 'item', item: items[1] }]];
  } else if (items.length === 3) {
    rows = [
      [{ kind: 'item', item: items[0] }, { kind: 'item', item: items[1] }],
      [{ kind: 'item', item: items[2] }, { kind: 'empty' }],
    ];
  } else if (items.length === 4) {
    rows = [
      [{ kind: 'item', item: items[0] }, { kind: 'item', item: items[1] }],
      [{ kind: 'item', item: items[2] }, { kind: 'item', item: items[3] }],
    ];
  } else {
    rows = [
      [{ kind: 'item', item: items[0] }, { kind: 'item', item: items[1] }],
      [{ kind: 'item', item: items[2] }, { kind: 'overflow', count: items.length - 3 }],
    ];
  }
  return (
    <View style={{ width: '92%', height: '92%', flexDirection: 'column', gap: 3 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flex: 1, flexDirection: 'row', gap: 3 }}>
          {row.map((cell, j) => (
            <View key={j} style={{ flex: 1 }}>
              <MoodAccCell cell={cell} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// One polaroid — handles both single-item and accessory variants
function MoodPolaroid({ kind, item, items, w, h, top, bottom, left, right, center, rot }) {
  const positionStyle = { position: 'absolute', width: w, height: h };
  if (top    !== undefined) positionStyle.top    = top;
  if (bottom !== undefined) positionStyle.bottom = bottom;
  if (left   !== undefined) positionStyle.left   = left;
  if (right  !== undefined) positionStyle.right  = right;
  if (center) {
    positionStyle.left = '50%';
    positionStyle.marginLeft = -w / 2;
  }

  const labelText = kind === 'acc'
    ? items.map(i => i.name).join(' · ')
    : (item?.name || '');

  return (
    <View style={[positionStyle, polaroidStyles.card, { transform: [{ rotate: rot + 'deg' }] }]}>
      <View style={polaroidStyles.clip} />
      <View style={polaroidStyles.photoZone}>
        {kind === 'acc' ? (
          <MoodAccessoryGrid items={items} />
        ) : (
          <View style={{
            width: '92%',
            height: '92%',
            backgroundColor: MOOD_PLACEHOLDER_COLORS[item?.category] || '#E8E0D5',
          }} />
        )}
      </View>
      <Text style={polaroidStyles.label} numberOfLines={1}>{labelText}</Text>
    </View>
  );
}

const polaroidStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 22,
    borderRadius: 2,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 18,
    elevation: 8,
  },
  clip: {
    position: 'absolute',
    top: -7,
    left: '50%',
    marginLeft: -11,
    width: 22,
    height: 12,
    backgroundColor: 'rgba(200,122,82,0.7)',
    borderRadius: 2,
    zIndex: 2,
  },
  photoZone: {
    flex: 1,
    backgroundColor: '#FBFAF3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    textAlign: 'center',
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#5C4A3A',
  },
});

// ── Your Looks Tab ──────────────────────────────────────────────────────────
function YourLooksTab({ onGoToVibe, isGenerating, wardrobeItems }) {
  // ── DEMO_MODE: flip to `true` for visual testing (HIG audit, Mood Board / Hanger View / Saved Outfits review). Production: always `false`. ──
  const DEMO_MODE = false;

  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(DEMO_MODE);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [savedOutfits, setSavedOutfits] = useState(DEMO_MODE ? ['demo-2'] : []);
  const [ratings, setRatings] = useState({});
  const [ratingFeedback, setRatingFeedback] = useState({});
  const [wornToday, setWornToday] = useState({});
  const [showBoutique, setShowBoutique] = useState({});
  const [moodBoardOutfit, setMoodBoardOutfit] = useState(null);
  const [moodBoardTab, setMoodBoardTab] = useState('moodboard');
  const [mannequinBg, setMannequinBg] = useState('Cream');
  const [showSavedScreen, setShowSavedScreen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  // ── DEBUG (temporary — remove before shipping) ───────────────────────────
  // Layout switcher state for testing all 8 Mood Board polaroid layouts
  const [debugLayout, setDebugLayout] = useState('A');
  const DEBUG_LAYOUTS = {
    A:       { name: 'Layout A (4 — top + pants + shoes + acc)',     items: [
      { id: 'd1', name: 'Cream Silk Top',   category: 'Tops' },
      { id: 'd2', name: 'Tailored Trousers', category: 'Bottoms' },
      { id: 'd3', name: 'Tan Loafers',       category: 'Shoes' },
      { id: 'd4', name: 'Gold Hoops',        category: 'Accessories' },
      { id: 'd5', name: 'Brown Tote',        category: 'Accessories' },
    ]},
    B:       { name: 'Layout B (5 — top + jacket + pants + shoes + acc)', items: [
      { id: 'd1', name: 'Cream Silk Top',     category: 'Tops' },
      { id: 'd6', name: 'Beige Blazer',       category: 'Outerwear' },
      { id: 'd2', name: 'Tailored Trousers',  category: 'Bottoms' },
      { id: 'd3', name: 'Tan Loafers',        category: 'Shoes' },
      { id: 'd4', name: 'Gold Hoops',         category: 'Accessories' },
      { id: 'd5', name: 'Brown Tote',         category: 'Accessories' },
    ]},
    'B-lite':{ name: 'Layout B-lite (4 — top + jacket + pants + shoes)', items: [
      { id: 'd1', name: 'Cream Silk Top',    category: 'Tops' },
      { id: 'd6', name: 'Beige Blazer',      category: 'Outerwear' },
      { id: 'd2', name: 'Tailored Trousers', category: 'Bottoms' },
      { id: 'd3', name: 'Tan Loafers',       category: 'Shoes' },
    ]},
    C:       { name: 'Layout C (3 — top + pants + shoes)', items: [
      { id: 'd1', name: 'Cream Silk Top',    category: 'Tops' },
      { id: 'd2', name: 'Tailored Trousers', category: 'Bottoms' },
      { id: 'd3', name: 'Tan Loafers',       category: 'Shoes' },
    ]},
    D:       { name: 'Layout D (2 — dress + shoes)', items: [
      { id: 'd7', name: 'Linen Sundress', category: 'Dresses' },
      { id: 'd3', name: 'Tan Loafers',    category: 'Shoes' },
    ]},
    'E-fix':{ name: 'Layout E-fix (3 — dress + jacket + shoes)', items: [
      { id: 'd7', name: 'Linen Sundress', category: 'Dresses' },
      { id: 'd6', name: 'Beige Blazer',   category: 'Outerwear' },
      { id: 'd3', name: 'Tan Loafers',    category: 'Shoes' },
    ]},
    F:       { name: 'Layout F (3 — dress + acc + shoes)', items: [
      { id: 'd7', name: 'Linen Sundress', category: 'Dresses' },
      { id: 'd4', name: 'Gold Hoops',     category: 'Accessories' },
      { id: 'd5', name: 'Brown Tote',     category: 'Accessories' },
      { id: 'd3', name: 'Tan Loafers',    category: 'Shoes' },
    ]},
    G:       { name: 'Layout G (4 — dress + jacket + shoes + acc)', items: [
      { id: 'd7', name: 'Linen Sundress', category: 'Dresses' },
      { id: 'd6', name: 'Beige Blazer',   category: 'Outerwear' },
      { id: 'd3', name: 'Tan Loafers',    category: 'Shoes' },
      { id: 'd4', name: 'Gold Hoops',     category: 'Accessories' },
      { id: 'd5', name: 'Brown Tote',     category: 'Accessories' },
    ]},
  };
  const buildDebugOutfit = (key) => ({
    id: 'debug-' + key,
    name: 'Debug Outfit',
    vibe: 'TEST',
    items: DEBUG_LAYOUTS[key].items,
  });
  const openDebugModal = (key) => {
    setDebugLayout(key);
    setMoodBoardTab('moodboard');
    setMoodBoardOutfit(buildDebugOutfit(key));
  };

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

  // Outfit shape: { id: string, vibe: string (uppercase), name: string,
  //                 description: string (quoted), items: WardrobeItem[] }
  // Production: empty. DEMO_MODE: 3 fixture outfits covering main layouts (top+bottom+shoes+acc, dress, outerwear).
  const outfits = DEMO_MODE ? [
    {
      id: 'demo-1',
      vibe: 'ROMANTIC',
      name: 'Soft Glow',
      description: 'Floaty, warm, made for golden-hour walks.',
      items: [
        { id: 'd1-1', name: 'Cream Silk Top',     category: 'Tops' },
        { id: 'd1-2', name: 'Tailored Trousers',  category: 'Bottoms' },
        { id: 'd1-3', name: 'Tan Loafers',        category: 'Shoes' },
        { id: 'd1-4', name: 'Gold Hoops',         category: 'Accessories' },
      ],
    },
    {
      id: 'demo-2',
      vibe: 'MINIMALIST',
      name: 'Clean Lines',
      description: 'One dress. One bag. Nothing extra.',
      items: [
        { id: 'd2-1', name: 'Black Slip Dress', category: 'Dresses' },
        { id: 'd2-2', name: 'Strappy Heels',    category: 'Shoes' },
        { id: 'd2-3', name: 'Pearl Studs',      category: 'Accessories' },
      ],
    },
    {
      id: 'demo-3',
      vibe: 'EDGY',
      name: 'Power Move',
      description: 'Sharp, layered, ready to be looked at.',
      items: [
        { id: 'd3-1', name: 'White Tee',         category: 'Tops' },
        { id: 'd3-2', name: 'Leather Jacket',    category: 'Outerwear' },
        { id: 'd3-3', name: 'Black Jeans',       category: 'Bottoms' },
        { id: 'd3-4', name: 'Chelsea Boots',     category: 'Shoes' },
      ],
    },
  ] : [];

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
      <View style={[looksStyles.scrollContent, { flex: 1, backgroundColor: '#E8E4CE', justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.Text style={[looksStyles.spinStar, { transform: [{ rotate: spin }] }]}>✦</Animated.Text>
        <Text style={looksStyles.loadingTitle}>Styling your outfits...</Text>
        <Text style={looksStyles.loadingSubtext}>Clozie is working her magic ✦</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={looksStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={looksStyles.heading}>Your Looks</Text>
        {savedOutfits.length > 0 && (
          <TouchableOpacity
            style={{ minHeight: 44, paddingHorizontal: 4, justifyContent: 'center' }}
            activeOpacity={0.7}
            onPress={() => setShowSavedScreen(true)}
          >
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#A44A34' }}>
              ❤️ Saved ({savedOutfits.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state — shown when no outfits generated yet */}
      {(!hasGenerated || outfits.length === 0) && (
        <View style={looksStyles.emptyState}>
          <Text style={looksStyles.emptyTitle}>No outfits yet</Text>
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

          {/* DEBUG — Mood Board layout switcher button. Gated behind DEMO_MODE (May 2026). */}
          {DEMO_MODE && (
          <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: '#A44A34', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              ✦ DEBUG — Mood Board Test ✦
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openDebugModal('A')}
              style={{ backgroundColor: '#A44A34', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 100 }}
            >
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 13, color: '#FFFFFF' }}>
                Open Mood Board (fake outfit)
              </Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 10, color: '#5C4A3A', opacity: 0.6, marginTop: 8, textAlign: 'center' }}>
              Inside the modal — switch between Layouts A → G
            </Text>
          </View>
          )}
        </View>
      )}

      {/* Subtitle — only when outfits generated */}
      {hasGenerated && outfits.length > 0 && (
        <Text style={looksStyles.subtitle}>
          Here are today's looks, styled just for you. ✦ Clozie learns your taste with every rating.
        </Text>
      )}

      {/* Outfit cards */}
      {hasGenerated && outfits.map((outfit) => (
        <View key={outfit.id} style={looksStyles.outfitCard}>
          {/* Item photo strip — 2 columns */}
          <View style={looksStyles.photoStrip}>
            {outfit.items.length > 0 ? outfit.items.map((item) => (
              <View key={item.id} style={looksStyles.photoStripItem}>
                <View style={looksStyles.photoStripThumb}>
                  <Text style={{ fontSize: 22 }}>{getCategoryEmoji(item.category)}</Text>
                </View>
                <Text style={looksStyles.photoStripName} numberOfLines={1}>{item.name}</Text>
              </View>
            )) : (
              <View style={looksStyles.photoStripItem}>
                <View style={looksStyles.photoStripThumb}>
                  <Text style={{ fontSize: 22 }}>{getCategoryEmoji('Tops')}</Text>
                </View>
                <Text style={looksStyles.photoStripName}>Sample item</Text>
              </View>
            )}
          </View>

          {/* Vibe + name */}
          <View style={looksStyles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={looksStyles.vibeLabel}>{outfit.vibe}</Text>
              <Text style={looksStyles.outfitName}>{outfit.name}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={looksStyles.outfitDesc}>{outfit.description}</Text>

          {/* Style Match Score — hidden until real calculation is built (Phase 2) */}
          {false && (
            <Text style={looksStyles.matchScore}>94% match with Your Style</Text>
          )}

          {/* Outfit Potential — hidden until real calculation is built (Phase 2) */}
          {false && (
            <Text style={looksStyles.outfitPotential}>These {outfit.items.length || 3} pieces create {(outfit.items.length || 3) * 4} outfits together</Text>
          )}

          {/* View Mood Board link */}
          <TouchableOpacity
            style={{ marginTop: 10, minHeight: 44, justifyContent: 'center' }}
            activeOpacity={0.7}
            onPress={() => { setMoodBoardTab('moodboard'); setMoodBoardOutfit(outfit); }}
          >
            <Text style={looksStyles.moodBoardLink}>View mood board</Text>
          </TouchableOpacity>

          {/* Row 1: Save + I wore this today — equal pills */}
          <View style={looksStyles.actionRow}>
            <TouchableOpacity
              style={[
                looksStyles.actionButtonHalf,
                savedOutfits.includes(outfit.id) && looksStyles.actionButtonHalfSaved,
              ]}
              activeOpacity={0.7}
              onPress={() => toggleSave(outfit.id)}
            >
              <Text style={looksStyles.actionButtonText}>
                {savedOutfits.includes(outfit.id) ? '❤️ Saved' : '🤍 Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={looksStyles.actionButtonHalf}
              activeOpacity={0.7}
              onPress={() => handleWornToday(outfit.id)}
            >
              <Text style={looksStyles.actionButtonText}>
                {wornToday[outfit.id] ? '✓ Worn today' : 'I wore this today'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Rating buttons */}
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
                    { color: '#2C1A0E' },
                  ]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Rating feedback */}
          {ratingFeedback[outfit.id] && (
            <Text style={looksStyles.ratingFeedback}>✦ Thanks! Clozie is learning your taste</Text>
          )}

          {/* Row 3: Share Outfit — primary filled */}
          <View style={looksStyles.primaryButtonRing}>
            <TouchableOpacity
              style={looksStyles.primaryButton}
              activeOpacity={0.8}
            >
              <Text style={looksStyles.primaryButtonText}>Share Outfit</Text>
            </TouchableOpacity>
          </View>

          {/* Row 4: Complete The Look — HIDDEN for Apple review (May 2026). To re-enable, change `false` to `true`. */}
          {false && (
          <TouchableOpacity
            style={looksStyles.outlineButton}
            activeOpacity={0.7}
            onPress={() => setShowBoutique((prev) => ({ ...prev, [outfit.id]: !prev[outfit.id] }))}
          >
            <Text style={looksStyles.outlineButtonText}>Complete The Look</Text>
          </TouchableOpacity>
          )}

          {/* Boutique message */}
          {false && showBoutique[outfit.id] && (
            <Text style={looksStyles.boutiqueMessage}>Boutique partners coming soon</Text>
          )}
        </View>
      ))}

      {/* Bottom buttons — Regenerate + Save Feedback */}
      {hasGenerated && outfits.length > 0 && (
        <View style={looksStyles.bottomRow}>
          <TouchableOpacity
            style={looksStyles.regenerateButton}
            activeOpacity={0.7}
            onPress={handleRegenerate}
          >
            <Text style={looksStyles.regenerateButtonText}>🔄 Regenerate</Text>
          </TouchableOpacity>
          <View style={looksStyles.feedbackButtonRing}>
            <TouchableOpacity
              style={[
                looksStyles.feedbackButton,
                !hasAnyRating && looksStyles.feedbackButtonDisabled,
              ]}
              activeOpacity={hasAnyRating ? 0.8 : 1}
              disabled={!hasAnyRating}
              onPress={handleRegenerate}
            >
              <Text style={[looksStyles.feedbackButtonText, !hasAnyRating && { color: 'rgba(44,26,14,0.35)' }]}>Save Feedback & Style Again →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Mood Board Modal */}
      <Modal
        visible={moodBoardOutfit !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMoodBoardOutfit(null)}
      >
        {/* Step 1 — dim near-black backdrop */}
        <View style={moodBoardStyles.backdrop}>
          {/* Step 2 — sage wrapper (chrome) */}
          <View style={moodBoardStyles.wrapper}>
          {/* Header */}
          <View style={moodBoardStyles.header}>
            <View style={{ flex: 1 }}>
              <Text style={moodBoardStyles.vibeLabel}>{moodBoardOutfit?.vibe}</Text>
              <Text style={moodBoardStyles.outfitName}>{moodBoardOutfit?.name}</Text>
            </View>
            <TouchableOpacity
              style={moodBoardStyles.closeButton}
              activeOpacity={0.7}
              onPress={() => setMoodBoardOutfit(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={moodBoardStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs — Mood Board / Hanger View */}
          <View style={moodBoardStyles.tabRow}>
            <TouchableOpacity
              style={[
                moodBoardStyles.tab,
                moodBoardTab === 'moodboard' && moodBoardStyles.tabActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setMoodBoardTab('moodboard')}
            >
              <Text style={[
                moodBoardStyles.tabText,
                moodBoardTab === 'moodboard' && moodBoardStyles.tabTextActive,
              ]}>Mood Board</Text>
              <Text style={moodBoardStyles.tabSubtitle}>Photos side by side</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                moodBoardStyles.tab,
                moodBoardTab === 'hanger' && moodBoardStyles.tabActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setMoodBoardTab('hanger')}
            >
              <Text style={[
                moodBoardStyles.tabText,
                moodBoardTab === 'hanger' && moodBoardStyles.tabTextActive,
              ]}>Hanger View</Text>
              <Text style={moodBoardStyles.tabSubtitle}>Styled together.</Text>
            </TouchableOpacity>
          </View>

          {/* DEBUG — layout switcher (temporary, remove before shipping) */}
          {moodBoardOutfit && String(moodBoardOutfit.id || '').startsWith('debug-') && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(164,74,52,0.08)' }}>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 9, color: '#A44A34', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>
                ✦ Debug — current: {debugLayout} ✦
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}>
                {Object.keys(DEBUG_LAYOUTS).map((key) => {
                  const active = debugLayout === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.8}
                      onPress={() => { setDebugLayout(key); setMoodBoardOutfit(buildDebugOutfit(key)); }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 100,
                        backgroundColor: active ? '#A44A34' : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? '#A44A34' : 'rgba(44,26,14,0.25)',
                      }}
                    >
                      <Text style={{
                        fontFamily: 'Outfit_500Medium',
                        fontSize: 11,
                        color: active ? '#FFFFFF' : '#2C1A0E',
                      }}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Tab content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {moodBoardTab === 'moodboard' && moodBoardOutfit && (
              <View>
                {/* Step 2 — cream stage panel with subtle warmth gradient overlay */}
                <View style={moodBoardStyles.stage}>
                  {/* Warmth gradient overlays — two soft tints, non-interactive */}
                  <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(220,143,104,0.06)', 'rgba(220,143,104,0)']}
                    start={{ x: 0.2, y: 0.3 }}
                    end={{ x: 0.7, y: 0.8 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(188,199,183,0.08)', 'rgba(188,199,183,0)']}
                    start={{ x: 0.8, y: 0.7 }}
                    end={{ x: 0.3, y: 0.2 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Color swatches band — decorative outfit palette */}
                  <View style={moodBoardStyles.swatchRow}>
                    {buildMoodSwatches(moodBoardOutfit.items).map((color, i) => (
                      <View key={i} style={[moodBoardStyles.swatch, { backgroundColor: color }]} />
                    ))}
                  </View>

                  {/* Polaroid composition — debug mode picks layout from switcher, otherwise auto-detect */}
                  {(() => {
                    const isDebug = String(moodBoardOutfit.id || '').startsWith('debug-');
                    const layoutKey = isDebug ? debugLayout : detectMoodLayout(moodBoardOutfit.items);
                    const polaroids = buildMoodPolaroids(layoutKey, moodBoardOutfit.items);
                    return polaroids.map((p, i) => (
                      <MoodPolaroid key={layoutKey + '-' + i} {...p} />
                    ));
                  })()}
                </View>

                {/* Store Suggestions — HIDDEN for Apple review (May 2026). To re-enable, change `false` to `true`. */}
                {false && (
                <>
                <View style={moodBoardStyles.storeDivider} />
                <Text style={moodBoardStyles.storeLabel}>STORE SUGGESTIONS</Text>
                <Text style={moodBoardStyles.storePlaceholder}>Boutique partners coming soon</Text>
                </>
                )}
              </View>
            )}

            {moodBoardTab === 'hanger' && moodBoardOutfit && (() => {
              // ── Item categorisation for Hanger View ───────────────────────────
              const allItems = moodBoardOutfit.items || [];
              const dress = allItems.find(i => i.category === 'Dresses') || null;
              const top = dress || allItems.find(i => i.category === 'Tops') || null;
              const pants = dress ? null : (allItems.find(i => i.category === 'Bottoms') || null);
              const shoes = allItems.find(i => i.category === 'Shoes') || null;
              // Heavy outerwear silently dropped; everything else in Outerwear = light
              const HEAVY_OUTER_RE = /(trench|puffer|parka|winter coat|wrap coat)/i;
              const outerCandidate = allItems.find(i => i.category === 'Outerwear');
              const lightOuter = (outerCandidate && !HEAVY_OUTER_RE.test(outerCandidate.name || '')) ? outerCandidate : null;
              // Accessories ordered head → ears → neck → wrist → waist → hand
              const accs = allItems
                .filter(i => i.category === 'Accessories')
                .sort((a, b) => accessoryRank(a.name) - accessoryRank(b.name))
                .slice(0, 5);

              const stageBg = { Cream: '#F5F0E8', White: '#FFFFFF', Sage: '#E8E4CE', Dark: '#2C1A0E', 'Sage green': '#BCC7B7' }[mannequinBg] || '#F5F0E8';

              return (
                <View style={[moodBoardStyles.hangerStage, { backgroundColor: stageBg }]}>
                  {/* 5-dot background colour picker — top of stage */}
                  <View style={moodBoardStyles.hangerDotsRow}>
                    {[
                      { name: 'Cream', color: '#F5F0E8' },
                      { name: 'White', color: '#FFFFFF' },
                      { name: 'Sage', color: '#E8E4CE' },
                      { name: 'Dark', color: '#2C1A0E' },
                      { name: 'Sage green', color: '#BCC7B7' },
                    ].map((bg) => {
                      const active = mannequinBg === bg.name;
                      return (
                        <TouchableOpacity
                          key={bg.name}
                          activeOpacity={0.7}
                          onPress={() => setMannequinBg(bg.name)}
                          hitSlop={{ top: 9, bottom: 9, left: 9, right: 9 }}
                        >
                          {active ? (
                            <View style={moodBoardStyles.hangerDotRingOuter}>
                              <View style={moodBoardStyles.hangerDotRingInner}>
                                <View style={[moodBoardStyles.hangerDot, { backgroundColor: bg.color }]} />
                              </View>
                            </View>
                          ) : (
                            <View style={moodBoardStyles.hangerDotWrap}>
                              <View style={[moodBoardStyles.hangerDot, moodBoardStyles.hangerDotInactiveBorder, { backgroundColor: bg.color }]} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Closet rod — 80% width, centered, vertical gradient */}
                  <LinearGradient
                    colors={['#B8A890', '#A89878']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={moodBoardStyles.hangerRod}
                  />

                  {/* Hook — vertical connector from rod to hanger */}
                  <View style={moodBoardStyles.hangerHook} />

                  {/* Hanger SVG */}
                  <View style={moodBoardStyles.hangerSvgWrap} pointerEvents="none">
                    <Svg width={130} height={30} viewBox="0 0 130 30">
                      <Path
                        d="M 65 4 Q 65 2 67 2 L 73 2 Q 75 2 75 4 Q 75 8 70 12"
                        stroke="#C8B8A2"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                      />
                      <Path
                        d="M 6 22 Q 65 14 124 22"
                        stroke="#C8B8A2"
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                      />
                    </Svg>
                  </View>

                  {/* Centre stack — top/dress, pants, shoes */}
                  {top && (
                    <View style={moodBoardStyles.hangerSlotTop}>
                      {top.image ? (
                        <Image source={{ uri: top.image }} resizeMode="contain" style={moodBoardStyles.hangerImage} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[top.category] || '#E8E0D5' }]} />
                      )}
                    </View>
                  )}
                  {pants && (
                    <View style={moodBoardStyles.hangerSlotPants}>
                      {pants.image ? (
                        <Image source={{ uri: pants.image }} resizeMode="contain" style={moodBoardStyles.hangerImage} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[pants.category] || '#E8E0D5' }]} />
                      )}
                    </View>
                  )}
                  {shoes && (
                    <View style={moodBoardStyles.hangerSlotShoes}>
                      {shoes.image ? (
                        <Image source={{ uri: shoes.image }} resizeMode="contain" style={moodBoardStyles.hangerImage} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[shoes.category] || '#E8E0D5' }]} />
                      )}
                    </View>
                  )}

                  {/* Left side card — light outerwear (heavy is silently dropped in categorisation) */}
                  {lightOuter && (
                    <View style={moodBoardStyles.hangerLightOuterCard}>
                      <View style={moodBoardStyles.hangerLightOuterClip} />
                      <View style={moodBoardStyles.hangerLightOuterInner}>
                        {lightOuter.image ? (
                          <Image source={{ uri: lightOuter.image }} resizeMode="contain" style={moodBoardStyles.hangerSideImage} />
                        ) : (
                          <View style={[moodBoardStyles.hangerSideImage, { backgroundColor: MOOD_PLACEHOLDER_COLORS[lightOuter.category] || '#E8E0D5' }]} />
                        )}
                      </View>
                    </View>
                  )}

                  {/* Right accessory stack — anatomical order, up to 5 cards */}
                  {accs.map((acc, i) => {
                    const ACC_POSITIONS = [
                      { top: 96,  rot: '3deg'  },
                      { top: 156, rot: '-2deg' },
                      { top: 216, rot: '2deg'  },
                      { top: 276, rot: '-3deg' },
                      { top: 336, rot: '2deg'  },
                    ];
                    const pos = ACC_POSITIONS[i];
                    return (
                      <View
                        key={acc.id || ('acc-' + i)}
                        style={[
                          moodBoardStyles.hangerAccCard,
                          { top: pos.top, transform: [{ rotate: pos.rot }] },
                        ]}
                      >
                        <View style={moodBoardStyles.hangerAccClip} />
                        <View style={moodBoardStyles.hangerAccInner}>
                          {acc.image ? (
                            <Image source={{ uri: acc.image }} resizeMode="contain" style={moodBoardStyles.hangerAccImage} />
                          ) : (
                            <View style={[moodBoardStyles.hangerAccImage, { backgroundColor: MOOD_PLACEHOLDER_COLORS[acc.category] || '#E8E0D5' }]} />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Saved Outfits Modal */}
      <Modal
        visible={showSavedScreen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSavedScreen(false)}
      >
        <View style={savedStyles.container}>
          {/* Header */}
          <View style={savedStyles.header}>
            <TouchableOpacity
              style={savedStyles.backButton}
              activeOpacity={0.7}
              onPress={() => setShowSavedScreen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={savedStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={savedStyles.closeButton}
              activeOpacity={0.7}
              onPress={() => setShowSavedScreen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={savedStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={savedStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={savedStyles.heading}>Saved Outfits</Text>

            {/* Empty state */}
            {savedOutfits.length === 0 && (
              <View style={savedStyles.emptyState}>
                <Text style={{ fontSize: 48, marginBottom: 16, color: '#C87A52' }}>♡</Text>
                <Text style={savedStyles.emptyTitle}>Your saved looks will live here</Text>
                <Text style={savedStyles.emptyText}>
                  Generate outfits and save the ones you love.
                </Text>
                <TouchableOpacity
                  style={savedStyles.emptyButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowSavedScreen(false);
                    onGoToVibe();
                  }}
                >
                  <Text style={savedStyles.emptyButtonText}>Generate My First Looks →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Saved outfits list */}
            {savedOutfits.length > 0 && (
              <>
                <Text style={savedStyles.countText}>{savedOutfits.length} saved look{savedOutfits.length !== 1 ? 's' : ''}</Text>
                <Text style={savedStyles.hintText}>Tap an outfit to see the mood board</Text>

                {outfits
                  .filter((o) => savedOutfits.includes(o.id))
                  .map((outfit) => (
                    <TouchableOpacity
                      key={outfit.id}
                      style={savedStyles.outfitCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        setShowSavedScreen(false);
                        setMoodBoardTab('moodboard');
                        setMoodBoardOutfit(outfit);
                      }}
                    >
                      {/* Photo strip */}
                      <View style={savedStyles.photoStrip}>
                        {outfit.items.map((item) => (
                          <View key={item.id} style={savedStyles.photoStripItem}>
                            <View style={savedStyles.photoStripThumb}>
                              <Text style={{ fontSize: 20 }}>{getCategoryEmoji(item.category)}</Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Vibe + name */}
                      <Text style={savedStyles.vibeLabel}>{outfit.vibe}</Text>
                      <Text style={savedStyles.outfitName}>{outfit.name}</Text>

                      {/* Item chips */}
                      <View style={savedStyles.chipRow}>
                        {outfit.items.map((item) => (
                          <View key={item.id} style={savedStyles.chip}>
                            <Text style={savedStyles.chipText}>{getCategoryEmoji(item.category)} {item.name}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Remove button */}
                      <TouchableOpacity
                        style={savedStyles.removeButton}
                        activeOpacity={0.7}
                        onPress={() => setConfirmRemoveId(outfit.id)}
                      >
                        <Text style={savedStyles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </ScrollView>

          {/* Confirm remove modal — replaces Alert.alert (May 2026) */}
          <Modal
            visible={confirmRemoveId !== null}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setConfirmRemoveId(null)}
          >
            <View style={savedStyles.confirmOverlay}>
              <View style={savedStyles.confirmModal}>
                <Text style={savedStyles.confirmHeading}>Remove this look?</Text>
                <Text style={savedStyles.confirmBody}>
                  This will remove it from your saved collection. You can always save it again.
                </Text>
                <View style={savedStyles.confirmPrimaryRing}>
                  <TouchableOpacity
                    style={savedStyles.confirmPrimaryButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSavedOutfits((prev) => prev.filter((id) => id !== confirmRemoveId));
                      setConfirmRemoveId(null);
                    }}
                  >
                    <Text style={savedStyles.confirmPrimaryButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={savedStyles.confirmCancelButton}
                  activeOpacity={0.7}
                  onPress={() => setConfirmRemoveId(null)}
                >
                  <Text style={savedStyles.confirmCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </Modal>

    </ScrollView>
  );
}

// ── Saved Outfits Styles ────────────────────────────────────────────────────
const savedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4CE',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,26,14,0.08)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#2C1A0E',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#2C1A0E',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
    marginBottom: 8,
  },
  countText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
    marginBottom: 4,
  },
  hintText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#BCC7B7',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: '#2C1A0E',
    textAlign: 'center',
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  photoStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoStripItem: {
    width: '22%',
  },
  photoStripThumb: {
    aspectRatio: 1,
    backgroundColor: '#F5F0E8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  outfitName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#2C1A0E',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: 'rgba(188,199,183,0.30)',
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  chipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#6B7E65',
    letterSpacing: 0.3,
  },
  removeButton: {
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: '#C87A52',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  removeButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#A44A34',
  },

  // Confirm modal — shared between Saved Outfits remove and Settings Clear Memory
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  confirmHeading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#2C1A0E',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmBody: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmPrimaryRing: {
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 100,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmPrimaryButton: {
    backgroundColor: '#BCC7B7',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmPrimaryButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
    letterSpacing: 1,
  },
  confirmCancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.20)',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  confirmCancelButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
});

// ── Mood Board Modal Styles ─────────────────────────────────────────────────
const moodBoardStyles = StyleSheet.create({
  // Step 1 — dim near-black backdrop behind the whole modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.93)',
  },
  // Step 2 — sage chrome wrapper, inset from edges so backdrop shows through
  wrapper: {
    flex: 1,
    backgroundColor: '#E8E4CE',
    marginTop: 60,
    marginHorizontal: 12,
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
    paddingTop: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  // Step 2 — cream stage panel inside the sage wrapper
  stage: {
    backgroundColor: '#F5F0E8',
    borderRadius: 14,
    height: 520,
    overflow: 'hidden',
    marginBottom: 8,
    // iOS inset shadow approximation (subtle)
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  stagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagePlaceholderText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#5C4A3A',
  },
  stagePlaceholderSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    opacity: 0.6,
    marginTop: 4,
  },
  // Step 3 — decorative palette swatches at top of stage
  swatchRow: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    zIndex: 10,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,26,14,0.08)',
  },
  vibeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  outfitName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#2C1A0E',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#2C1A0E',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#A44A34',
  },
  tabText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(92,74,58,0.85)',
  },
  tabTextActive: {
    color: '#2C1A0E',
  },
  tabSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: 'rgba(92,74,58,0.85)',
    marginTop: 2,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemPhoto: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCategoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(188,199,183,0.30)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 10,
    marginLeft: 10,
  },
  itemCategoryText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#6B7E65',
    textTransform: 'uppercase',
  },
  itemName: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#5C4A3A',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 12,
  },
  storeDivider: {
    height: 1,
    backgroundColor: 'rgba(44,26,14,0.08)',
    marginTop: 8,
    marginBottom: 20,
  },
  storeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  storePlaceholder: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    fontStyle: 'italic',
  },

  // ── Hanger View styles (April 28 2026 spec) ─────────────────────────────────
  hangerStage: {
    height: 580,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  hangerDotsRow: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  hangerDotWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangerDotRingOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#A44A34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangerDotRingInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  hangerDotInactiveBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.15)',
  },
  hangerRod: {
    position: 'absolute',
    top: 56,
    left: '10%',
    right: '10%',
    height: 4,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5,
  },
  hangerHook: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 16,
    backgroundColor: '#A89878',
    zIndex: 6,
  },
  hangerSvgWrap: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 6,
  },
  // Centre stack slots — top/dress at 96, pants at 248, shoes at 438
  hangerSlotTop: {
    position: 'absolute',
    top: 96,
    left: '50%',
    marginLeft: -70,
    width: 140,
    height: 158,
    overflow: 'hidden',
    zIndex: 3,
  },
  hangerSlotPants: {
    position: 'absolute',
    top: 248,
    left: '50%',
    marginLeft: -82.5,
    width: 165,
    height: 195,
    overflow: 'hidden',
    zIndex: 3,
  },
  hangerSlotShoes: {
    position: 'absolute',
    top: 438,
    left: '50%',
    marginLeft: -52.5,
    width: 105,
    height: 72,
    overflow: 'hidden',
    zIndex: 3,
  },
  hangerImage: {
    width: '100%',
    height: '100%',
  },
  // Left side card — light outerwear
  hangerLightOuterCard: {
    position: 'absolute',
    top: 116,
    left: 14,
    width: 76,
    height: 96,
    padding: 5,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-4deg' }],
    zIndex: 4,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  hangerLightOuterClip: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -9,
    width: 18,
    height: 9,
    backgroundColor: 'rgba(200,122,82,0.7)',
    borderRadius: 2,
    zIndex: 5,
  },
  hangerLightOuterInner: {
    flex: 1,
    backgroundColor: '#FBFAF3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hangerSideImage: {
    width: '88%',
    height: '88%',
  },
  // Right accessory stack — 56×56 cards
  hangerAccCard: {
    position: 'absolute',
    right: 14,
    width: 56,
    height: 56,
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    zIndex: 4,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  hangerAccClip: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 8,
    backgroundColor: 'rgba(200,122,82,0.7)',
    borderRadius: 2,
    zIndex: 5,
  },
  hangerAccInner: {
    flex: 1,
    backgroundColor: '#FBFAF3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hangerAccImage: {
    width: '84%',
    height: '84%',
  },
});

// ── Subscription Screen ─────────────────────────────────────────────────────
function SubscriptionScreen({ onClose }) {
  // PRO LAUNCH: uncomment below
  // const [notifiedPro, setNotifiedPro] = useState(false);
  // const [notifiedElite, setNotifiedElite] = useState(false);
  //
  // const handleNotifyPro = () => {
  //   // Supabase save comes in Phase 2 when auth is connected
  //   setNotifiedPro(true);
  // };

  // PRO LAUNCH: uncomment below
  // const proFeatures = [
  //   { emoji: '🧳', text: 'Trip Planner — real weather, day by day outfits, activities, missing item alerts, packing list' },
  //   { emoji: '🧹', text: 'Clear Out — items unworn 6+ months, Sell/Donate/Swap' },
  //   { emoji: '🔄', text: 'Clothes Swap — share items with friends' },
  //   { emoji: '🗓', text: 'Outfit Wear History — track what you wore and when' },
  // ];

  // PRO LAUNCH: uncomment below, delete simple version above
  // const freeFeatures = [
  //   'Up to 30 wardrobe items',
  //   '7 outfits per week',
  //   'Clozie styling + learning',
  //   'Saved favourites',
  //   'Style DNA profile',
  //   'Clozie photo recognition',
  //   'Share outfits with friends',
  //   'Selfie sharing',
  //   "Clozie's Pick — one boutique suggestion per outfit",
  //   'Store suggestions in Mood Board',
  //   'Wardrobe Intelligence',
  //   'Style Match Score + Outfit Potential',
  //   'What Goes With This',
  //   // 'Seasonal Wardrobe Report', // Hidden May 2026 — moved to Phase 4+ Pro feature
  // ];
  const freeFeatures = [
    'Up to 30 items in your closet',
    '12 styling sessions every week',
    'Add your clothes — Clozie fills in the details',
    'Pin one item — Clozie builds around it',
    '3 fresh outfit ideas every session',
    'Rate your looks — Clozie takes note',
    'Mood board for every outfit',
    'Save your favorite looks',
    'Share outfit cards',
  ];

  return (
    <View style={subStyles.container}>
      {/* Header */}
      <View style={subStyles.header}>
        <TouchableOpacity
          style={subStyles.backButton}
          activeOpacity={0.7}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={subStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={subStyles.logoWrap}>
          <Text style={subStyles.logoClo}>Clo</Text>
          <Text style={subStyles.logoZie}>zie</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={subStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={subStyles.heading}>Your Plan</Text>

        {/* FREE card */}
        <View style={subStyles.card}>
          <Text style={subStyles.planName}>FREE</Text>
          {freeFeatures.map((feature, i) => (
            <View key={i} style={subStyles.featureRow}>
              <Text style={subStyles.featureCheck}>✓</Text>
              <Text style={subStyles.featureText}>{feature}</Text>
            </View>
          ))}
          <View style={subStyles.currentPlanButton}>
            <Text style={subStyles.currentPlanText}>✓ Your Current Plan</Text>
          </View>
        </View>

        {/* PRO LAUNCH: uncomment below
        PRO card
        <View style={[subStyles.card, subStyles.proCard]}>
          <Text style={subStyles.proPlanName}>✦ PRO — Coming Soon</Text>
          <Text style={subStyles.proPricing}>$6.99/month · $67.99/year</Text>
          <Text style={subStyles.proIntro}>Everything in Free, unlimited, plus:</Text>

          {proFeatures.map((feature, i) => (
            <View key={i} style={subStyles.featureRow}>
              <Text style={subStyles.proEmoji}>{feature.emoji}</Text>
              <Text style={subStyles.featureText}>{feature.text}</Text>
            </View>
          ))}

          {!notifiedPro ? (
            <TouchableOpacity
              style={subStyles.notifyButton}
              activeOpacity={0.8}
              onPress={handleNotifyPro}
            >
              <Text style={subStyles.notifyButtonText}>Notify Me When Pro Launches ✦</Text>
            </TouchableOpacity>
          ) : (
            <View style={subStyles.notifiedWrap}>
              <Text style={subStyles.notifiedText}>✦ You're on the list! We'll let you know the moment Pro is ready.</Text>
            </View>
          )}
        </View>
        */}

        {/* PRO LAUNCH: uncomment below
        ELITE card
        <View style={[subStyles.card, subStyles.proCard]}>
          <Text style={subStyles.proPlanName}>✦ ELITE — Coming Soon</Text>
          <Text style={subStyles.proPricing}>$9.99/month · $95.99/year</Text>
          <Text style={subStyles.proIntro}>Everything in Pro, plus:</Text>

          <View style={subStyles.featureRow}>
            <Text style={subStyles.proEmoji}>📸</Text>
            <Text style={subStyles.featureText}>Photo Outfit Matching</Text>
          </View>
          <View style={subStyles.featureRow}>
            <Text style={subStyles.proEmoji}>🛍️</Text>
            <Text style={subStyles.featureText}>Shop For Me</Text>
          </View>
          <View style={subStyles.featureRow}>
            <Text style={subStyles.proEmoji}>✦</Text>
            <Text style={subStyles.featureText}>And more exciting features coming</Text>
          </View>

          {!notifiedElite ? (
            <TouchableOpacity
              style={subStyles.notifyOutlineButton}
              activeOpacity={0.8}
              onPress={() => setNotifiedElite(true)}
            >
              <Text style={subStyles.notifyOutlineButtonText}>Notify Me When Elite Launches ✦</Text>
            </TouchableOpacity>
          ) : (
            <View style={subStyles.notifiedWrap}>
              <Text style={subStyles.notifiedText}>✦ You're on the list! We'll let you know the moment Elite is ready.</Text>
            </View>
          )}
        </View>
        */}

        {/* PRO LAUNCH: uncomment below
        Footer
        <Text style={subStyles.footer}>Secure payment · Cancel anytime · No hidden fees</Text>
        */}
      </ScrollView>
    </View>
  );
}

// ── Subscription Styles ─────────────────────────────────────────────────────
const subStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4CE',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,26,14,0.08)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#2C1A0E',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoClo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#2C1A0E',
  },
  logoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 32,
    color: '#C87A52',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
    marginTop: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  headingItalic: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 28,
    color: '#2C1A0E',
  },
  subtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  planName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureCheck: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
    width: 22,
  },
  featureText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    flex: 1,
    lineHeight: 20,
  },
  currentPlanButton: {
    backgroundColor: 'rgba(188,199,183,0.45)',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  currentPlanText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  footer: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    textAlign: 'center',
    marginTop: 8,
  },
  proCard: {
    borderColor: 'rgba(44,26,14,0.08)',
  },
  proPlanName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
    marginBottom: 6,
  },
  proPricing: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
    marginBottom: 12,
  },
  proIntro: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    marginBottom: 14,
  },
  proEmoji: {
    fontSize: 16,
    width: 26,
  },
  notifyButton: {
    backgroundColor: 'rgba(188,199,183,0.45)',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  notifyButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  notifyOutlineButton: {
    backgroundColor: 'rgba(188,199,183,0.45)',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  notifyOutlineButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  notifiedWrap: {
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  notifiedText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// ── Settings Screen ─────────────────────────────────────────────────────────
function SettingsScreen({ onClose, onSignOut }) {
  // Real user data — pulled from Supabase auth session on mount
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setDisplayName(user.user_metadata?.full_name || '');
      }
    };
    loadUser();
  }, []);

  // Subscription modal state
  const [showSubscription, setShowSubscription] = useState(false);

  // Edit Profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const openEditProfile = () => {
    setEditName(displayName);
    setProfileError('');
    setSavingProfile(false);
    setShowEditProfile(true);
  };

  const saveProfile = async () => {
    const trimmed = editName.trim();
    if (trimmed.length === 0) {
      setShowEditProfile(false);
      return;
    }
    setProfileError('');
    setSavingProfile(true);
    const { error: supaErr } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    });
    setSavingProfile(false);
    if (supaErr) {
      setProfileError('Could not save — please try again');
      return;
    }
    setDisplayName(trimmed);
    setShowEditProfile(false);
  };

  const cancelEditProfile = () => {
    setShowEditProfile(false);
  };

  // Change Password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPasswordError('');
    setPasswordSuccess('');
    setSavingPassword(false);
    setShowChangePassword(true);
  };

  const cancelChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setShowChangePassword(false);
  };

  const handleUpdatePassword = async () => {
    if (savingPassword) return;
    setPasswordError('');
    setPasswordSuccess('');

    // Validation — in order
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password needs at least 8 characters');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match — please try again");
      return;
    }

    setSavingPassword(true);

    // Verify current password is correct
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });
    if (verifyErr) {
      setSavingPassword(false);
      setPasswordError('Current password is incorrect');
      return;
    }

    // Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setSavingPassword(false);

    if (updateErr) {
      setPasswordError("Couldn't update password — please try again");
      return;
    }

    // Success — show terracotta confirmation, then close panel after 1.5s
    setPasswordSuccess('Password updated ✦');
    setTimeout(() => {
      setPasswordSuccess('');
      setShowChangePassword(false);
    }, 1500);
  };

  const [showClearMemoryModal, setShowClearMemoryModal] = useState(false);

  const handleClearMemory = () => {
    setShowClearMemoryModal(true);
  };

  const confirmClearMemory = () => {
    // Phase 2 — wire when ratings + learning notes tables exist in Supabase.
    // Today: no real ratings/learning data is saved yet, so there is nothing to clear.
    // When Clozie Learning is built, this function should:
    //   1. Delete user's rows from the ratings table
    //   2. Delete user's rows from the learning_notes table
    //   3. Clear any pattern-detected style fields from user_metadata
    setShowClearMemoryModal(false);
  };

  // Delete Account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const openDeleteAccount = () => {
    setDeleteStep(1);
    setDeleteConfirmText('');
    setDeleteError('');
    setDeletingAccount(false);
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    if (deletingAccount) return;
    setDeleteError('');
    setDeletingAccount(true);

    // Call Edge Function to delete the user from Supabase
    const { error: invokeErr } = await supabase.functions.invoke('delete-user');

    if (invokeErr) {
      setDeletingAccount(false);
      setDeleteError("Couldn't delete account — please try again or contact hello@clozie.net.");
      return;
    }

    // Sign out locally to clear the now-invalid session
    await supabase.auth.signOut();

    setShowDeleteModal(false);
    setDeletingAccount(false);
    onClose();
    if (onSignOut) onSignOut();
  };

  // Sign Out error state
  const [signOutError, setSignOutError] = useState('');

  return (
    <View style={settingsStyles.container}>
      {/* Header */}
      <View style={settingsStyles.header}>
        <TouchableOpacity
          style={settingsStyles.backButton}
          activeOpacity={0.7}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={settingsStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={settingsStyles.logoWrap}>
          <Text style={settingsStyles.logoClo}>Clo</Text>
          <Text style={settingsStyles.logoZie}>zie</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={settingsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={settingsStyles.label}>SETTINGS</Text>
        <View style={settingsStyles.headingRow}>
          <Text style={settingsStyles.headingNormal}>Your </Text>
          <Text style={settingsStyles.headingItalic}>Account</Text>
        </View>

        {/* ACCOUNT card */}
        <View style={settingsStyles.card}>
          {/* Name + email + Edit Profile */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              {displayName ? <Text style={settingsStyles.cardName}>{displayName}</Text> : null}
              <Text style={settingsStyles.cardEmail}>{userEmail}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openEditProfile}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={settingsStyles.goldLink}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Profile panel — slides in when tapped */}
          {showEditProfile && (
            <View style={settingsStyles.editPanel}>
              {/* Panel header */}
              <View style={settingsStyles.editPanelHeader}>
                <Text style={settingsStyles.editPanelLabel}>EDIT PROFILE</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={cancelEditProfile}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={settingsStyles.editPanelClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Your Name field */}
              <Text style={settingsStyles.fieldLabel}>Your Name</Text>
              <TextInput
                style={settingsStyles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#555"
                autoCapitalize="words"
                returnKeyType="done"
              />

              {/* Email field — disabled */}
              <Text style={settingsStyles.fieldLabel}>Email</Text>
              <TextInput
                style={[settingsStyles.textInput, settingsStyles.textInputDisabled]}
                value={userEmail}
                editable={false}
              />
              <Text style={settingsStyles.fieldNote}>Email cannot be changed</Text>

              {/* Profile save error — warm terracotta */}
              {profileError !== '' && (
                <Text style={settingsStyles.profileErrorText}>{profileError}</Text>
              )}

              {/* Buttons */}
              <View style={settingsStyles.editButtonRow}>
                <TouchableOpacity
                  style={[settingsStyles.saveButton, savingProfile && { opacity: 0.6 }]}
                  activeOpacity={0.8}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  onPress={saveProfile}
                  disabled={savingProfile}
                >
                  <Text style={settingsStyles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={settingsStyles.cancelButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  onPress={cancelEditProfile}
                >
                  <Text style={settingsStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={settingsStyles.divider} />

          {/* Subscription row */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Subscription</Text>
              <Text style={settingsStyles.cardRowValue}>Free Plan</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSubscription(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {/* PRO LAUNCH: change label back to "Upgrade ✦" */}
              <Text style={settingsStyles.goldLink}>View Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DATA card */}
        <View style={settingsStyles.card}>
          {/* Clear Clozie's Memory */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Clear Clozie's Memory</Text>
              <Text style={settingsStyles.cardRowValue}>Reset learned preferences</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearMemory}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={settingsStyles.goldLink}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={settingsStyles.divider} />

          {/* Change Password */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Change password</Text>
              <Text style={settingsStyles.cardRowValue}>Update your password</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openChangePassword}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={settingsStyles.goldLink}>Update</Text>
            </TouchableOpacity>
          </View>

          {/* Change Password panel */}
          {showChangePassword && (
            <View style={settingsStyles.editPanel}>
              {/* Panel header */}
              <View style={settingsStyles.editPanelHeader}>
                <Text style={settingsStyles.editPanelLabel}>CHANGE PASSWORD</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={cancelChangePassword}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={settingsStyles.editPanelClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Current Password */}
              <Text style={settingsStyles.fieldLabel}>Current Password</Text>
              <View style={settingsStyles.passwordWrap}>
                <TextInput
                  style={settingsStyles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPw}
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={settingsStyles.eyeButton}
                  activeOpacity={0.7}
                  onPress={() => setShowCurrentPw(!showCurrentPw)}
                >
                  <Text style={settingsStyles.eyeIcon}>{showCurrentPw ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={settingsStyles.fieldLabel}>New Password</Text>
              <View style={settingsStyles.passwordWrap}>
                <TextInput
                  style={settingsStyles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPw}
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={settingsStyles.eyeButton}
                  activeOpacity={0.7}
                  onPress={() => setShowNewPw(!showNewPw)}
                >
                  <Text style={settingsStyles.eyeIcon}>{showNewPw ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm New Password */}
              <Text style={settingsStyles.fieldLabel}>Confirm New Password</Text>
              <View style={settingsStyles.passwordWrap}>
                <TextInput
                  style={settingsStyles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPw}
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={settingsStyles.eyeButton}
                  activeOpacity={0.7}
                  onPress={() => setShowConfirmPw(!showConfirmPw)}
                >
                  <Text style={settingsStyles.eyeIcon}>{showConfirmPw ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>

              {/* Error + success messages */}
              {passwordError !== '' && (
                <Text style={settingsStyles.passwordErrorText}>{passwordError}</Text>
              )}
              {passwordSuccess !== '' && (
                <Text style={settingsStyles.passwordSuccessText}>{passwordSuccess}</Text>
              )}

              {/* Buttons */}
              <View style={settingsStyles.editButtonRow}>
                <TouchableOpacity
                  style={settingsStyles.saveButton}
                  activeOpacity={0.8}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  onPress={handleUpdatePassword}
                >
                  <Text style={settingsStyles.saveButtonText}>Update Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={settingsStyles.cancelButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  onPress={cancelChangePassword}
                >
                  <Text style={settingsStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* PREFERENCES card — hidden until Daily Notifications is built (Phase 2) */}
        {false && (
          <View style={settingsStyles.card}>
            <View style={settingsStyles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={settingsStyles.cardRowLabel}>Daily outfit notifications</Text>
                <Text style={settingsStyles.cardRowValue}>Get styled every morning · coming soon</Text>
              </View>
              <Switch
                value={false}
                disabled={true}
                trackColor={{ false: 'rgba(44,26,14,0.15)', true: '#BCC7B7' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="rgba(44,26,14,0.15)"
              />
            </View>
          </View>
        )}

        {/* ABOUT card */}
        <View style={settingsStyles.card}>
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Clozie</Text>
              <Text style={settingsStyles.cardRowValue}>Version 1.0 — Your personal stylist</Text>
            </View>
            <Text style={settingsStyles.versionText}>v1.0</Text>
          </View>

          {/* Divider */}
          <View style={settingsStyles.divider} />

          {/* Delete Account */}
          <TouchableOpacity
            style={settingsStyles.deleteAccountButton}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={openDeleteAccount}
          >
            <Text style={settingsStyles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out error — terracotta inline message */}
        {signOutError ? (
          <Text style={settingsStyles.signOutError}>{signOutError}</Text>
        ) : null}

        {/* Sign Out button */}
        <TouchableOpacity
          style={settingsStyles.signOutButton}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={async () => {
            setSignOutError('');
            const { error: supaErr } = await supabase.auth.signOut();
            if (supaErr) {
              setSignOutError("Couldn't sign out — please try again");
              return;
            }
            onClose();
            if (onSignOut) onSignOut();
          }}
        >
          <Text style={settingsStyles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Subscription Screen Modal */}
      <Modal
        visible={showSubscription}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSubscription(false)}
      >
        <SubscriptionScreen onClose={() => setShowSubscription(false)} />
      </Modal>

      {/* Clear Clozie's Memory confirm modal — replaces Alert.alert (May 2026) */}
      <Modal
        visible={showClearMemoryModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowClearMemoryModal(false)}
      >
        <View style={savedStyles.confirmOverlay}>
          <View style={savedStyles.confirmModal}>
            <Text style={savedStyles.confirmHeading}>Clear Clozie's Memory?</Text>
            <Text style={savedStyles.confirmBody}>
              This will reset everything Clozie has learned about your taste. Your saved outfits and wardrobe stay safe.
            </Text>
            <View style={savedStyles.confirmPrimaryRing}>
              <TouchableOpacity
                style={savedStyles.confirmPrimaryButton}
                activeOpacity={0.8}
                onPress={confirmClearMemory}
              >
                <Text style={savedStyles.confirmPrimaryButtonText}>Yes, reset</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={savedStyles.confirmCancelButton}
              activeOpacity={0.7}
              onPress={() => setShowClearMemoryModal(false)}
            >
              <Text style={savedStyles.confirmCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal — 2-step confirmation */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={settingsStyles.deleteOverlay}>
          <View style={settingsStyles.deleteModal}>
            {deleteStep === 1 && (
              <>
                <Text style={settingsStyles.deleteHeading}>Delete Your Account</Text>
                <Text style={settingsStyles.deleteWarningText}>
                  This will permanently delete:
                </Text>
                <View style={settingsStyles.deleteList}>
                  <Text style={settingsStyles.deleteListItem}>• All your wardrobe items</Text>
                  <Text style={settingsStyles.deleteListItem}>• All your saved outfits</Text>
                  <Text style={settingsStyles.deleteListItem}>• Your Style profile</Text>
                  <Text style={settingsStyles.deleteListItem}>• All outfit ratings and learning data</Text>
                  <Text style={settingsStyles.deleteListItem}>• Your account</Text>
                </View>
                <Text style={settingsStyles.deleteCannotUndo}>This action cannot be undone.</Text>

                <TouchableOpacity
                  style={settingsStyles.deleteRedButton}
                  activeOpacity={0.8}
                  onPress={() => setDeleteStep(2)}
                >
                  <Text style={settingsStyles.deleteRedButtonText}>I understand, continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={settingsStyles.deleteCancelButton}
                  activeOpacity={0.7}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={settingsStyles.deleteCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <Text style={settingsStyles.deleteHeading}>Confirm Deletion</Text>
                <Text style={settingsStyles.deleteWarningText}>
                  Type DELETE to confirm you want to permanently delete your account and all data.
                </Text>

                <TextInput
                  style={settingsStyles.deleteInput}
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  placeholder="Type DELETE here"
                  placeholderTextColor="#555"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                {deleteError !== '' && (
                  <Text style={settingsStyles.deleteErrorText}>{deleteError}</Text>
                )}

                <TouchableOpacity
                  style={[
                    settingsStyles.deleteRedButton,
                    (deleteConfirmText !== 'DELETE' || deletingAccount) && settingsStyles.deleteRedButtonDisabled,
                  ]}
                  activeOpacity={0.8}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  onPress={handleDeleteAccount}
                >
                  <Text style={[
                    settingsStyles.deleteRedButtonText,
                    (deleteConfirmText !== 'DELETE' || deletingAccount) && { opacity: 0.4 },
                  ]}>Delete My Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={settingsStyles.deleteCancelButton}
                  activeOpacity={0.7}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={settingsStyles.deleteCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Settings Styles ─────────────────────────────────────────────────────────
const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4CE',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,26,14,0.08)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#2C1A0E',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoClo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#2C1A0E',
  },
  logoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 32,
    color: '#C87A52',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  headingNormal: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
  },
  headingItalic: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 28,
    color: '#2C1A0E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 16,
    color: '#2C1A0E',
    marginBottom: 2,
  },
  cardEmail: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
  },
  goldLink: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#A44A34',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44,26,14,0.08)',
    marginVertical: 14,
  },
  cardRowLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
    marginBottom: 2,
  },
  cardRowValue: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
  },
  editPanel: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,26,14,0.08)',
    marginTop: 14,
    paddingTop: 14,
  },
  editPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editPanelLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  editPanelClose: {
    fontSize: 18,
    color: '#2C1A0E',
    width: 44,
    height: 44,
    textAlign: 'center',
    lineHeight: 44,
  },
  fieldLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#2C1A0E',
    marginBottom: 6,
  },
  textInput: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  textInputDisabled: {
    color: 'rgba(44,26,14,0.45)',
    backgroundColor: '#F5F0E6',
  },
  fieldNote: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    marginTop: -10,
    marginBottom: 14,
  },
  profileErrorText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(164,74,52,0.88)',
    marginBottom: 10,
    textAlign: 'left',
  },
  passwordErrorText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(200,122,82,0.88)',
    marginBottom: 10,
    textAlign: 'left',
  },
  passwordSuccessText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: 'rgba(200,122,82,0.88)',
    marginBottom: 10,
    textAlign: 'left',
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.20)',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 10,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
    color: '#2C1A0E',
  },
  versionText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
  },
  deleteAccountButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#C87A52',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteAccountButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#A44A34',
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  deleteHeading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#2C1A0E',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteWarningText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#2C1A0E',
    lineHeight: 20,
    marginBottom: 12,
  },
  deleteList: {
    marginBottom: 12,
  },
  deleteListItem: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    lineHeight: 22,
  },
  deleteCannotUndo: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#A44A34',
    opacity: 0.88,
    marginBottom: 20,
  },
  deleteInput: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  deleteRedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#C87A52',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteRedButtonDisabled: {
    opacity: 0.4,
  },
  deleteErrorText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(200,122,82,0.88)',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  deleteRedButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#A44A34',
  },
  deleteCancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.20)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteCancelButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#C87A52',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: '#A44A34',
  },
  signOutError: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(200,122,82,0.88)',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
});

// ── Tab bar icons (SVG) ─────────────────────────────────────────────────────
function TabStarIcon({ active }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"
        stroke={active ? '#A44A34' : 'rgba(44,26,14,0.28)'}
        strokeWidth={active ? 1.9 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TabHangerIcon({ active }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0v3L3.5 13.5A1.5 1.5 0 0 0 4.5 16h15a1.5 1.5 0 0 0 1-2.5L12 7"
        stroke={active ? '#A44A34' : 'rgba(44,26,14,0.28)'}
        strokeWidth={active ? 1.9 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TabSunIcon({ active }) {
  const stroke = active ? '#A44A34' : 'rgba(44,26,14,0.28)';
  const strokeWidth = active ? 1.9 : 1.6;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="12" y1="2" x2="12" y2="4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="12" y1="20" x2="12" y2="22" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="2" y1="12" x2="4" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="20" y1="12" x2="22" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

function TabMirrorIcon({ active }) {
  const stroke = active ? '#A44A34' : 'rgba(44,26,14,0.28)';
  const strokeWidth = active ? 1.9 : 1.6;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="12" y1="15" x2="12" y2="20" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="9" y1="20" x2="15" y2="20" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

// ── Main App Screen — 4 bottom tabs ─────────────────────────────────────────
function MainAppScreen({ onSignOut }) {
  const [activeTab, setActiveTab] = useState(0);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [hasTriggeredGenerate, setHasTriggeredGenerate] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const tabs = [
    { label: 'My Style', icon: '✦', IconComponent: TabStarIcon },
    { label: `My Closet (${wardrobeItems.length})`, icon: '👗', IconComponent: TabHangerIcon },
    { label: "Today's Vibe", icon: '🌤', IconComponent: TabSunIcon },
    { label: 'My Looks', icon: '◈', IconComponent: TabMirrorIcon },
  ];

  const tabTitles = ['YOUR STYLE PROFILE', 'YOUR WARDROBE', "TODAY'S VIBE", 'YOUR LOOKS'];

  return (
    <View style={mainStyles.container}>
      <StatusBar style="light" />

      {/* Settings gear icon — top right */}
      <TouchableOpacity
        style={mainStyles.gearButton}
        activeOpacity={0.7}
        onPress={() => setShowSettingsScreen(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={mainStyles.gearIcon}>⚙</Text>
      </TouchableOpacity>

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
              {tab.IconComponent ? (
                <View style={mainStyles.tabIconWrap}>
                  <tab.IconComponent active={isActive} />
                </View>
              ) : (
                <Text style={[
                  isActive ? mainStyles.tabIconActive : mainStyles.tabIcon,
                  { color: isActive ? G : '#555' },
                ]}>{tab.icon}</Text>
              )}
              <Text style={[
                mainStyles.tabLabel,
                { color: isActive ? '#A44A34' : 'rgba(44,26,14,0.28)' },
              ]}>{tab.label}</Text>
              {isActive && <View style={mainStyles.tabActiveDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Settings Screen Modal */}
      <Modal
        visible={showSettingsScreen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSettingsScreen(false)}
      >
        <SettingsScreen onClose={() => setShowSettingsScreen(false)} onSignOut={onSignOut} />
      </Modal>
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
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
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
        <MainAppScreen onSignOut={() => setCurrentScreen('welcome')} />
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
  splashScreen: {
    flex: 1,
    backgroundColor: '#E8E4CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  splashLogoClo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 72,
    color: '#2C1A0E',
    letterSpacing: -2,
  },
  splashLogoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 72,
    color: '#C87A52',
    letterSpacing: -2,
  },
  splashLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    letterSpacing: 2.5,
    color: '#A44A34',
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

// ── Welcome Screen styles (redesign April 2026) ──────────────────────────────
const welcomeStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E4CE',
  },
  photo: {
    flex: 1,
    width: '100%',
  },
  photoImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1019 / 1358,
    top: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  bottomGradient: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoBlock: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoRow: {
    textAlign: 'center',
  },
  logoClo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 64,
    color: '#2C1A0E',
  },
  logoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 64,
    color: '#DC8F68',
  },
  eyebrow: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    letterSpacing: 3.5,
    color: 'rgba(247,240,227,0.90)',
    marginTop: 43,
    textAlign: 'center',
  },
  bottomBlock: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 18,
    lineHeight: 26,
    color: '#5C4A3A',
    textAlign: 'center',
  },
  buttonRing: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    backgroundColor: '#BCC7B7',
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 100,
  },
  buttonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: '#2C1A0E',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  signInRowText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
  },
  signInLink: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#A44A34',
  },
});

// ── Peek Inside Screen styles ────────────────────────────────────────────────
const peekStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E4CE',
    justifyContent: 'flex-start',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  fixedHeader: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  fade: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    height: 32,
  },

  peekLogoClo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 36,
    color: '#2C1A0E',
    letterSpacing: -1,
  },
  peekLogoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 36,
    color: '#C87A52',
    letterSpacing: -1,
  },
  howLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginTop: 12,
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 26,
    marginBottom: 14,
    width: '100%',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  stepEyebrow: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: '#2C1A0E',
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#5C4A3A',
    lineHeight: 22,
    marginBottom: 16,
  },

  innerPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,122,82,0.18)',
  },
  scanProgressBar: {
    height: 3,
    backgroundColor: '#BCC7B7',
    borderRadius: 2,
    marginVertical: 10,
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
    backgroundColor: '#E8E4CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recognisedLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginBottom: 3,
  },
  itemName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
  },
  itemMeta: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(188,199,183,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(188,199,183,0.30)',
    borderRadius: 100,
  },
  tagChipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#6B7E65',
    letterSpacing: 0.3,
  },

  vibeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
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
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: '#BCC7B7',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  chipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(44,26,14,0.12)',
  },
  chipText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
  },

  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  outfitVibe: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
  },
  outfitName: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 20,
    color: '#2C1A0E',
  },
  moodTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
  },
  moodTabText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#5C4A3A',
  },
  bodyTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#BCC7B7',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  bodyTabText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },
  outfitChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
  },
  outfitChipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#5C4A3A',
  },
  outfitDesc: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#5C4A3A',
    marginTop: 12,
    lineHeight: 22,
  },

  buttonRing: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    backgroundColor: '#BCC7B7',
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 100,
  },
  buttonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  signInTouch: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  signInRow: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    textAlign: 'center',
  },
  signInLink: {
    fontFamily: 'Outfit_500Medium',
    color: '#A44A34',
  },
});

// ── Post-Login Welcome Screen styles ─────────────────────────────────────────
const postLoginStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E4CE',
  },
  photoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: undefined,
    aspectRatio: 864 / 1536,
  },
  bottomGradient: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBlock: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  logoRow: {
    textAlign: 'center',
    marginBottom: 16,
  },
  logoClo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 56,
    color: '#2C1A0E',
  },
  logoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 56,
    color: '#C87A52',
  },
  body: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#5C4A3A',
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonRing: {
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    backgroundColor: '#BCC7B7',
    minHeight: 50,
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    textAlign: 'center',
    letterSpacing: 0.3,
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
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: '#2C1A0E',
  },

  // Header
  headerBlock: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  headingLabel: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 13,
    color: '#2C1A0E',
    letterSpacing: 3,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 10,
    width: '100%',
  },
  socialIcon: {
    fontFamily: 'System',
    fontSize: 20,
    color: '#2C1A0E',
  },
  socialText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#2C1A0E',
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
    backgroundColor: 'rgba(44,26,14,0.12)',
  },
  dividerText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
  },

  // Input fields
  fieldsBlock: {
    width: '100%',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    marginBottom: 10,
    width: '100%',
  },

  // Password container with eye icon
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Age 13+ checkbox row — Sign Up only
  ageBlock: {
    width: '100%',
    marginBottom: 12,
    marginTop: 4,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.35)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#BCC7B7',
    borderColor: '#BCC7B7',
  },
  checkmark: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    lineHeight: 16,
  },
  ageText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    flexShrink: 1,
  },
  ageErrorText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(164,74,52,0.88)',
    marginTop: 6,
    marginLeft: 34,
  },

  // Error message — terracotta at 88% opacity
  errorText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(164,74,52,0.88)',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
    textDecorationLine: 'underline',
  },

  // Forgot password — back to sign in
  forgotBackLink: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
    textAlign: 'center',
  },

  // Reset sent confirmation
  resetSentBlock: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  resetSentText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
    textAlign: 'center',
    lineHeight: 22,
  },
});

// ── Style DNA Tab styles ────────────────────────────────────────────────────
const dnaStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 108,
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
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.06)',
    width: '100%',
    marginBottom: 16,
  },
  cardHeading: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: '#BCC7B7',
    borderColor: '#FFFFFF',
  },
  chipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(44,26,14,0.12)',
  },
  chipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    minHeight: 80,
  },
  learningNote: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    marginTop: 8,
  },
  buildButton: {
    backgroundColor: '#BCC7B7',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  buildButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    textAlign: 'center',
  },
  skipLink: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    textAlign: 'center',
    marginBottom: 20,
  },
});

// ── Wardrobe Tab styles ─────────────────────────────────────────────────────
const wardrobeStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 108,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  itemCount: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#2C1A0E',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(44,26,14,0.10)',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#BCC7B7',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    marginBottom: 14,
    alignSelf: 'center',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  addButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    textAlign: 'center',
  },
  addPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
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
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  addPanelClose: {
    fontSize: 18,
    color: '#2C1A0E',
  },
  photoArea: {
    borderWidth: 1.5,
    borderColor: 'rgba(200,122,82,0.40)',
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
    fontFamily: 'Outfit_500Medium',
    fontSize: 18,
    color: '#2C1A0E',
    marginBottom: 6,
  },
  photoSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: 'center',
  },
  photoButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#2C1A0E',
  },
  tipBox: {
    backgroundColor: 'rgba(188,199,183,0.18)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  tipText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    lineHeight: 18,
  },
  fieldLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#2C1A0E',
  },
  categoryPicker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,26,14,0.08)',
    minHeight: 44,
    justifyContent: 'center',
  },
  categoryOptionSelected: {
    backgroundColor: '#BCC7B7',
  },
  categoryOptionText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
  addToClosetButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 100,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addToClosetButtonDisabled: {
    opacity: 0.4,
  },
  addToClosetButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    marginBottom: 8,
  },
  cancelButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: '#2C1A0E',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
  },
  gridCardPhoto: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    overflow: 'hidden',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(188,199,183,0.30)',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginTop: 10,
    marginLeft: 10,
  },
  categoryTagText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#6B7E65',
    letterSpacing: 0.3,
  },
  gridCardName: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: '#2C1A0E',
    marginTop: 6,
    marginHorizontal: 10,
  },
  gridCardColour: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    marginTop: 3,
    marginHorizontal: 10,
  },
  gridCardLastWorn: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    marginTop: 4,
    marginHorizontal: 10,
  },
  gridCardPairLink: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#A44A34',
    marginTop: 6,
    marginHorizontal: 10,
    marginBottom: 12,
  },
  analyseButton: {
    borderWidth: 1.5,
    borderColor: '#BCC7B7',
    paddingVertical: 16,
    borderRadius: 100,
    marginBottom: 12,
    alignItems: 'center',
  },
  analyseButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  analyseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
    marginBottom: 12,
    alignItems: 'center',
  },
  analyseCardText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  analyseCardButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  analyseCardButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  vibeButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 100,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  vibeButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
  },
  editIcon: {
    position: 'absolute',
    top: 6,
    right: 40,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  editIconText: {
    fontSize: 14,
    color: '#2C1A0E',
  },
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteIconText: {
    fontSize: 14,
    color: '#2C1A0E',
  },
  deleteConfirm: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,26,14,0.08)',
  },
  deleteConfirmText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    lineHeight: 18,
    marginBottom: 10,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteConfirmRemove: {
    flex: 1,
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteConfirmRemoveText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#2C1A0E',
  },
  deleteConfirmCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  deleteConfirmCancelText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#2C1A0E',
  },
});

// ── Today's Vibe Tab styles ─────────────────────────────────────────────────
const vibeStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 108,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#2C1A0E',
    marginBottom: 6,
  },
  subheading: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13.5,
    color: '#5C4A3A',
    marginBottom: 18,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
  },
  badgeText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#5C4A3A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeading: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  subLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  indoorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,26,14,0.08)',
  },
  indoorsLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: '#BCC7B7',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  chipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(44,26,14,0.12)',
  },
  chipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  cardSubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 19,
    marginBottom: 14,
  },
  emptyItemsText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#5C4A3A',
    textAlign: 'center',
    paddingVertical: 16,
  },
  itemScroll: {
    flexDirection: 'row',
  },
  itemThumb: {
    width: 84,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  itemThumbPinned: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    backgroundColor: '#BCC7B7',
  },
  itemThumbName: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    minHeight: 80,
  },
  generateButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 100,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  generateButtonDisabled: {
    backgroundColor: 'rgba(188, 199, 183, 0.45)',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#2C1A0E',
  },
  generateButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
  hintText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    textAlign: 'center',
    marginBottom: 20,
  },
});

// ── Your Looks Tab styles ───────────────────────────────────────────────────
const looksStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 108,
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
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    textAlign: 'center',
  },
  spinStar: {
    fontSize: 36,
    color: '#C87A52',
    marginBottom: 20,
  },
  loadingTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.08)',
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
    backgroundColor: '#E8E4CE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoStripName: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    textAlign: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vibeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  outfitName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
  },
  outfitDesc: {
    fontFamily: 'Outfit_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 20,
  },
  matchScore: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
    marginTop: 12,
  },
  outfitPotential: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    marginTop: 4,
  },
  moodBoardLink: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 100,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#BCC7B7',
    borderColor: '#BCC7B7',
  },
  ratingButtonText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
  },
  ratingFeedback: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A44A34',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#2C1A0E',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionButtonHalf: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 100,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonHalfSaved: {
    borderColor: '#C87A52',
  },
  primaryButtonRing: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#BCC7B7',
    borderRadius: 100,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
    letterSpacing: 1,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#C87A52',
    borderRadius: 100,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#C87A52',
  },
  boutiqueMessage: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.12)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenerateButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
  },
  feedbackButtonRing: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  feedbackButton: {
    backgroundColor: '#BCC7B7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackButtonDisabled: {
    backgroundColor: 'rgba(188,199,183,0.4)',
  },
  feedbackButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
    textAlign: 'center',
  },
});

// ── Main App Screen styles ──────────────────────────────────────────────────
const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  gearButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 22,
    color: G,
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
    backgroundColor: '#E8E4CE',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,26,14,0.08)',
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
  tabIconWrap: {
    marginBottom: 5,
  },
  tabLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tabActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A44A34',
    marginTop: 4,
  },
});
