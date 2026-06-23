import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AppState,
  Dimensions,
  ScrollView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Platform,
  Modal,
  Pressable,
  Switch,
  Image,
  ImageBackground,
  Alert,
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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './src/lib/supabase';
import { fetchWardrobeItems, getSignedPhotoUrl, uploadWardrobePhoto, insertWardrobeItem, updateWardrobeItem, deleteWardrobePhoto, deleteWardrobeItem } from './src/lib/wardrobeItems';
import { recognizeWardrobePhoto } from './src/lib/clozieRecognition';
import { generateOutfits } from './src/lib/outfitGeneration';
import { upsertOutfitInteraction, markItemsWorn, fetchSavedOutfits, fetchWornOutfits, clearClozieMemory } from './src/lib/outfitHistory';
import { filterWardrobeItems } from './src/lib/filterWardrobeItems';
import { filterSavedOutfits } from './src/lib/filterSavedOutfits';

// ── Design tokens — sacred, never change ─────────────────────────────────────
const G = '#C9A96E';       // gold accent
const BG = '#0D0C0A';      // background
const CARD = '#161512';     // card background
const BORDER = '#252320';   // border color
const CREAM = '#EDE5D8';    // logo "Clo" color

// ── Welcome Screen photo asset ───────────────────────────────────────────────
const WELCOME_PHOTO = require('./assets/New-welcome-screen-photo.jpg');
const POSTLOGIN_PHOTO = require('./assets/mirror-photo-post-login.jpg');

// ── Legal document URLs (Termly-hosted) ──────────────────────────────────────
const PRIVACY_POLICY_URL = 'https://app.termly.io/policy-viewer/policy.html?policyUUID=025e96b1-361b-48eb-bc7a-9e2d065b2834';
const TERMS_OF_SERVICE_URL = 'https://app.termly.io/policy-viewer/policy.html?policyUUID=a55d3621-5c8f-46e6-b7a6-e819434b3acb';

// ── Network error detection (Session 14B) ───────────────────────────────────
// Detects network-level failures (no connection, DNS failure, timeout) vs
// HTTP errors (4xx/5xx with a real response body — gate codes, server errors).
// Used to surface warm Clozie offline messages instead of generic copy.
//
// React Native fetch throws "Network request failed" on no connection.
// supabase-js wraps as FunctionsFetchError when the edge call can't reach Supabase.
function isNetworkError(err) {
  if (!err) return false;
  const message = String(err.message || '').toLowerCase();
  const name = String(err.name || '');
  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('failed to send a request') ||
    (name === 'TypeError' && message.includes('network')) ||
    name === 'FunctionsFetchError' ||
    name === 'AuthRetryableFetchError'
  );
}

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
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoClo}>Clo</Text>
          <Text style={styles.splashLogoZie}>zie</Text>
        </View>
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
          if (isNetworkError(supaErr)) {
            setError('Clozie needs internet to style you. Check your connection and try again.');
            return;
          }
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
        if (isNetworkError(e)) {
          setError('Clozie needs internet to style you. Check your connection and try again.');
        } else {
          setError('Something went wrong — please try again');
        }
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
          if (isNetworkError(supaErr)) {
            setError('Clozie needs internet to style you. Check your connection and try again.');
            return;
          }
          setError("Email or password doesn't match — please try again");
          return;
        }

        // Success — navigate to main app
        onDone({ email: email.trim(), mode: 'login' });
      } catch (e) {
        if (isNetworkError(e)) {
          setError('Clozie needs internet to style you. Check your connection and try again.');
        } else {
          setError('Something went wrong — please try again');
        }
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
          if (isNetworkError(supaErr)) {
            setError('Clozie needs internet to style you. Check your connection and try again.');
            return;
          }
          setError("Couldn't send reset link — please try again");
          return;
        }
        setResetSent(true);
      } catch (e) {
        if (isNetworkError(e)) {
          setError('Clozie needs internet to style you. Check your connection and try again.');
        } else {
          setError("Couldn't send reset link — please try again");
        }
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  // Session 22 — Real Apple Sign-In via Supabase.
  // Apple returns fullName ONLY on first sign-in (documented behavior).
  // We use that presence to route signup → Post-Login Welcome / login → main.
  const handleAppleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError('Something went wrong — please try again');
        return;
      }

      const { data, error: supaErr } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (supaErr) {
        if (isNetworkError(supaErr)) {
          setError('Clozie needs internet to style you. Check your connection and try again.');
        } else {
          setError('Something went wrong — please try again');
        }
        return;
      }

      // Apple returns fullName ONLY on the first sign-in for this Apple ID.
      const givenName = credential.fullName?.givenName?.trim() || '';
      const familyName = credential.fullName?.familyName?.trim() || '';
      const fullName = [givenName, familyName].filter(Boolean).join(' ');
      const isFirstSignIn = Boolean(givenName || familyName);

      if (isFirstSignIn && fullName) {
        // Best-effort persist — never block sign-in if this fails.
        try {
          await supabase.auth.updateUser({ data: { full_name: fullName } });
        } catch (e) {
          console.warn('[Apple Sign-In] failed to persist full_name:', e?.message);
        }
      }

      const userEmail = credential.email || data?.user?.email || '';
      onDone({
        name: fullName || undefined,
        email: userEmail,
        mode: isFirstSignIn ? 'signup' : 'login',
      });
    } catch (err) {
      // User cancelled the native sheet — silent.
      if (err?.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      if (isNetworkError(err)) {
        setError('Clozie needs internet to style you. Check your connection and try again.');
      } else {
        setError('Something went wrong — please try again');
      }
    } finally {
      setLoading(false);
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

                {/* Continue with Apple — Session 22 (2026-06-03): real Sign In with Apple via expo-apple-authentication + Supabase. iOS only; renders nothing on Android. */}
                {Platform.OS === 'ios' && (
                  <View style={{ opacity: loading ? 0.6 : 1, marginBottom: 10 }} pointerEvents={loading ? 'none' : 'auto'}>
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                      cornerRadius={12}
                      style={{ width: '100%', height: 52 }}
                      onPress={handleAppleSignIn}
                    />
                  </View>
                )}

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

                {/* Legal agreement — Sign Up only (Session 14C) */}
                {!isLogin && !isForgot && (
                  <Text style={authStyles.legalAgreement}>
                    By creating an account, you agree to the{' '}
                    <Text
                      style={authStyles.legalAgreementLink}
                      onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL).catch(() => {})}
                    >
                      Terms of Service
                    </Text>
                    {' '}and{' '}
                    <Text
                      style={authStyles.legalAgreementLink}
                      onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Load saved style profile from Supabase user_metadata on mount.
  // Silent fallback — if no session or network fails, start blank (same as before).
  useEffect(() => {
    let cancelled = false;
    const loadStyle = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const meta = user.user_metadata || {};
        if (Array.isArray(meta.styles)) setSelectedStyles(meta.styles);
        if (Array.isArray(meta.colours)) setSelectedColours(meta.colours);
        if (typeof meta.never_wear === 'string') setNeverWear(meta.never_wear);
      } catch {
        // Silent fallback — start blank.
      }
    };
    loadStyle();
    return () => { cancelled = true; };
  }, []);

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

  const handleBuildCloset = async () => {
    if (isSaving) return;
    setSaveError('');
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        styles: selectedStyles,
        colours: selectedColours,
        never_wear: neverWear.trim(),
      },
    });
    setIsSaving(false);
    if (error) {
      setSaveError("Couldn't save your style — please try again");
      return;
    }
    onBuildCloset();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={dnaStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
          placeholderTextColor="rgba(44,26,14,0.65)"
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
        style={[dnaStyles.buildButton, isSaving && { opacity: 0.6 }]}
        activeOpacity={0.8}
        onPress={handleBuildCloset}
        disabled={isSaving}
      >
        <Text style={dnaStyles.buildButtonText}>{isSaving ? 'Saving…' : 'Build My Closet →'}</Text>
      </TouchableOpacity>

      {/* Save error — gentle inline message, no block */}
      {saveError ? (
        <Text style={dnaStyles.saveError}>{saveError}</Text>
      ) : null}

      {/* Skip link */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBuildCloset}
        hitSlop={{ top: 15, bottom: 15, left: 30, right: 30 }}
      >
        <Text style={dnaStyles.skipLink}>Skip</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
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

// Format an ISO timestamp (or null) for the "Last worn" wardrobe card label.
// Returns 'Never worn' when no date, or 'Last worn: May 16' (no year) when present.
// Defensive: malformed strings fall back to 'Never worn' rather than rendering garbage.
function formatLastWorn(iso) {
  if (!iso) return 'Never worn';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Never worn';
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  return `Last worn: ${month} ${day}`;
}

// Session 20: "Your Week" calendar pill date helpers — all in LOCAL time.
// The existing dedupe in upsertOutfitInteraction (outfitHistory.js) uses UTC slice;
// we use LOCAL for display so users see wears bucketed by THEIR calendar day.
// Late-night edge case (local 11:55pm vs UTC midnight) noted in CLAUDE.md Known Issues.
function toLocalYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const offset = day === 0 ? -6 : 1 - day; // Sun → back 6 days; others → 1 - day
  d.setDate(d.getDate() + offset);
  return d;
}

function buildWeekDays(monday) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatWeekRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const startMonth = monday.toLocaleString('en-US', { month: 'long' });
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  if (monday.getMonth() === sunday.getMonth()) {
    return `${startMonth} ${startDay} – ${endDay}`;
  }
  const endMonth = sunday.toLocaleString('en-US', { month: 'long' });
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

// Day-of-week labels for Your Week dot row (Mon-first). Fixed array because
// the calendar pill always starts Monday.
const WEEK_DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ── Wardrobe Tab ────────────────────────────────────────────────────────────
// Session 10B Step 4: Category chip labels for My Closet search.
// Order locked by spec — "All" is the sentinel for "no category filter".
const CATEGORY_CHIPS = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];

function WardrobeTab({ items, setItems, onGoToVibe, isVip }) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemColour, setNewItemColour] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState(null);
  const [autoFilledFields, setAutoFilledFields] = useState({});
  // Session 10B: search + category filter state
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const itemCount = items.length;
  const maxItems = 50;
  const progressWidth = (itemCount / maxItems) * 100;

  // Session 16B: derived nudge for non-VIP wardrobe state.
  // 48 → 2 spots left, 49 → 1 spot left, 50+ → full. VIP always null.
  const wardrobeNudge = isVip
    ? null
    : itemCount === 48
    ? '2 spots left in your wardrobe.'
    : itemCount === 49
    ? '1 spot left in your wardrobe.'
    : itemCount >= 50
    ? 'Your wardrobe is full.'
    : null;

  // Session 10B Step 5: Derived filtered list. When search UI is hidden, filter is bypassed.
  // When visible, filterWardrobeItems applies name (case-insensitive contains) + category AND filters.
  const filteredItems = searchVisible
    ? filterWardrobeItems(items, searchText, selectedCategory)
    : items;

  // Session 10A Step 1b: Auto-scroll the ScrollView to the Add Item panel when it opens.
  // One-shot per open — flag resets when panel closes so the next open scrolls fresh.
  const scrollRef = useRef(null);
  const hasScrolledForPanelRef = useRef(false);
  // Update 1 — Session 2: capture panel Y from onLayout so handleEditItem can scroll
  // back to the panel reliably when a second pencil is tapped while the panel is
  // already open (onLayout doesn't always re-fire if the new item produces the
  // same panel height).
  const panelYRef = useRef(null);
  useEffect(() => {
    if (!showAddPanel) hasScrolledForPanelRef.current = false;
  }, [showAddPanel]);

  const handleAddItem = async () => {
    if (!newItemName.trim() || isSaving) return;
    // Session 16B: cap guard — non-VIP can't add a 51st item. Floating + button
    // is hidden at the cap so this should never fire, but belt-and-suspenders.
    if (!isVip && items.length >= maxItems) return;
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in again to add items.');
      const user = session.user;

      let photoPath = null;
      if (photoUri) {
        photoPath = await uploadWardrobePhoto(photoUri, user.id);
      }

      const newItem = await insertWardrobeItem({
        name: newItemName.trim(),
        category: newItemCategory || 'Tops',
        colour: newItemColour.trim(),
        notes: newItemNotes.trim(),
        photoPath,
      });

      let signedUrl = null;
      if (newItem.photoPath) {
        try {
          signedUrl = await getSignedPhotoUrl(newItem.photoPath);
        } catch {
          // Fall back to emoji placeholder if signing fails — item still saved.
        }
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems((prev) => [{ ...newItem, photoUri: signedUrl }, ...prev]);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemColour('');
      setNewItemNotes('');
      setPhotoUri(null);
      setIsScanning(false);
      setRecognitionStatus(null);
      setAutoFilledFields({});
      setShowCategoryPicker(false);
      Keyboard.dismiss();
      setShowAddPanel(false);
    } catch (err) {
      if (isNetworkError(err)) {
        setRecognitionStatus('offline');
      } else {
        Alert.alert(
          "Couldn't save your item",
          err?.message || 'Something went wrong — please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSaving(false);
    }
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
    setPhotoUri(item.photoUri || null);
    setIsScanning(false);
    setRecognitionStatus(null);
    setAutoFilledFields({});
    setShowAddPanel(true);
    // Update 1 — Session 2: if the panel was ALREADY open when this pencil was
    // tapped, scroll back to the captured panel Y so the re-targeted panel is
    // visible. showAddPanel here is the pre-render closure value (React state
    // setters are async), so this branch only runs for "second pencil while
    // panel is already open." First-open is still covered by the existing
    // one-shot scroll inside the panel's onLayout.
    if (showAddPanel && panelYRef.current != null && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, panelYRef.current - 12), animated: true });
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!newItemName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const originalItem = items.find((i) => i.id === editingItemId);
      const originalPhotoPath = originalItem?.photoPath || null;

      let newPhotoPath = originalPhotoPath;
      let newSignedUrl = photoUri;

      if (photoUri && photoUri.startsWith('file://')) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Please sign in again to save changes.');
        newPhotoPath = await uploadWardrobePhoto(photoUri, session.user.id);
        try {
          newSignedUrl = await getSignedPhotoUrl(newPhotoPath);
        } catch {
          newSignedUrl = null;
        }
      }

      const updatedItem = await updateWardrobeItem(editingItemId, {
        name: newItemName.trim(),
        category: newItemCategory || 'Tops',
        colour: newItemColour.trim(),
        notes: newItemNotes.trim(),
        photoPath: newPhotoPath,
      });

      if (originalPhotoPath && originalPhotoPath !== newPhotoPath) {
        try {
          await deleteWardrobePhoto(originalPhotoPath);
        } catch {
          // Old photo cleanup is best-effort — orphan can be cleaned up later.
        }
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId ? { ...updatedItem, photoUri: newSignedUrl } : item
        )
      );
      setEditingItemId(null);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemColour('');
      setNewItemNotes('');
      setPhotoUri(null);
      setIsScanning(false);
      setRecognitionStatus(null);
      setAutoFilledFields({});
      setShowCategoryPicker(false);
      Keyboard.dismiss();
      setShowAddPanel(false);
    } catch (err) {
      if (isNetworkError(err)) {
        setRecognitionStatus('offline');
      } else {
        Alert.alert(
          "Couldn't save your changes",
          err?.message || 'Something went wrong — please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const item = items.find((i) => i.id === id);
      await deleteWardrobeItem(id, item?.photoPath || null);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      Alert.alert(
        "Couldn't remove your item",
        err?.message || 'Something went wrong — please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Clears any field that was previously auto-filled by Clozie, so a retake
  // starts fresh. User-typed content is preserved (those fields aren't tracked
  // in autoFilledFields once the user edits them).
  const clearStaleClozieFills = () => {
    setAutoFilledFields((prev) => {
      if (prev.name) setNewItemName('');
      if (prev.category) setNewItemCategory('');
      if (prev.colour) setNewItemColour('');
      if (prev.notes) setNewItemNotes('');
      return {};
    });
  };

  // Runs the photo through Clozie recognition and auto-fills empty fields.
  // Only fills a field if it's currently empty — preserves user-typed data.
  const runRecognition = async (uri) => {
    setIsScanning(true);
    setRecognitionStatus('scanning');
    try {
      const recognized = await recognizeWardrobePhoto(uri);
      // Functional setters read the LIVE state value, not the stale closure.
      // Crucial on retake: clearStaleClozieFills() has just queued empty values
      // that won't appear in the closure, but `current` here is post-clear.
      const filled = {};
      if (recognized.name) {
        setNewItemName((current) => {
          if (current.trim()) return current;
          filled.name = true;
          return recognized.name;
        });
      }
      if (recognized.category) {
        setNewItemCategory((current) => {
          if (current) return current;
          filled.category = true;
          return recognized.category;
        });
      }
      if (recognized.color) {
        setNewItemColour((current) => {
          if (current.trim()) return current;
          filled.colour = true;
          return recognized.color;
        });
      }
      if (recognized.description) {
        setNewItemNotes((current) => {
          if (current.trim()) return current;
          filled.notes = true;
          return recognized.description;
        });
      }
      setAutoFilledFields(filled);
      setRecognitionStatus('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (recogErr) {
      console.log('Recognition error:', recogErr);
      if (recogErr?.code === 'NO_KEY') {
        setRecognitionStatus('no-key');
      } else if (isNetworkError(recogErr)) {
        setRecognitionStatus('offline');
      } else {
        setRecognitionStatus('error');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera access needed',
          'Clozie needs camera access to add photos. You can enable this in iPhone Settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });
      if (result.canceled) return;
      const original = result.assets[0];
      // Re-encode + resize: bakes EXIF orientation in, shrinks to 512px max for faster API + smaller storage
      const fixed = await ImageManipulator.manipulateAsync(
        original.uri,
        [{ resize: { width: 512 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      clearStaleClozieFills();
      setPhotoUri(fixed.uri);
      await runRecognition(fixed.uri);
    } catch (e) {
      console.log('Take photo error:', e);
      Alert.alert('Something went wrong', 'Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleUploadFile = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo library access needed',
          'Clozie needs access to your photo library to add photos. You can enable this in iPhone Settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (result.canceled) return;
      const original = result.assets[0];
      // Re-encode + resize: bakes EXIF orientation in, shrinks to 512px max for faster API + smaller storage
      const fixed = await ImageManipulator.manipulateAsync(
        original.uri,
        [{ resize: { width: 512 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      clearStaleClozieFills();
      setPhotoUri(fixed.uri);
      await runRecognition(fixed.uri);
    } catch (e) {
      console.log('Upload file error:', e);
      Alert.alert('Something went wrong', 'Please try again.', [{ text: 'OK' }]);
    }
  };

  // Session 10A Step 4: Empty state — full-screen centered view when closet has 0 items.
  // Falls through to normal render once user taps "+ Add Your First Item" (showAddPanel → true).
  if (itemCount === 0 && !showAddPanel) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#E8E4CE' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={wardrobeStyles.emptyStateContainer}>
          <View style={wardrobeStyles.emptyStateHanger}>
            <AnimatedEmptyStateHanger size={120} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28" />
          </View>
          <AnimatedEmptyStateText>
            <Text style={wardrobeStyles.emptyStateHeading}>
              Every great wardrobe starts with one piece.
            </Text>
            <Text style={wardrobeStyles.emptyStateSubtext}>
              Add your first item and let's see what Clozie can do
            </Text>
            <TouchableOpacity
              style={wardrobeStyles.emptyStateButton}
              activeOpacity={0.85}
              onPress={() => setShowAddPanel(true)}
            >
              <Text style={wardrobeStyles.emptyStateButtonText}>+ Add Your First Item</Text>
            </TouchableOpacity>
          </AnimatedEmptyStateText>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={wardrobeStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Heading */}
      <Text style={wardrobeStyles.heading}>Your Closet</Text>

      {/* Item count row */}
      <View style={wardrobeStyles.headerRow}>
        <Text style={wardrobeStyles.itemCount}>
          {isVip ? `${itemCount} items` : `${itemCount}/${maxItems} items`}
        </Text>
        {/* Session 10B Step 2: Search button (active state swaps colors) */}
        <TouchableOpacity
          style={[
            wardrobeStyles.searchButton,
            searchVisible && wardrobeStyles.searchButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setSearchVisible((v) => !v)}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle
              cx={11}
              cy={11}
              r={7}
              stroke={searchVisible ? '#6B7E65' : '#5C4A3A'}
              strokeWidth={1.8}
            />
            <Line
              x1={20}
              y1={20}
              x2={16.65}
              y2={16.65}
              stroke={searchVisible ? '#6B7E65' : '#5C4A3A'}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </Svg>
          <Text
            style={[
              wardrobeStyles.searchButtonText,
              searchVisible && wardrobeStyles.searchButtonTextActive,
            ]}
          >
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Session 16B: wardrobe nudge — gentle terracotta line for non-VIP at 48/49/50. */}
      {wardrobeNudge && (
        <Text style={wardrobeStyles.wardrobeNudge}>{wardrobeNudge}</Text>
      )}

      {/* Progress bar */}
      <View style={wardrobeStyles.progressBarBg}>
        <View style={[
          wardrobeStyles.progressBarFill,
          { width: progressWidth + '%' },
        ]} />
      </View>

      {/* Session 10B Step 3: Search bar (revealed when searchVisible is true) */}
      {searchVisible && (
        <View style={wardrobeStyles.searchBarRow}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke="#5C4A3A" strokeWidth={1.8} />
            <Line
              x1={20}
              y1={20}
              x2={16.65}
              y2={16.65}
              stroke="#5C4A3A"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </Svg>
          <TextInput
            style={wardrobeStyles.searchBarInput}
            placeholder="Search your closet..."
            placeholderTextColor="rgba(44,26,14,0.65)"
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(false);
              setSearchText('');
              setSelectedCategory('All');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Line x1={6} y1={6} x2={18} y2={18} stroke="#5C4A3A" strokeWidth={1.8} strokeLinecap="round" />
              <Line x1={18} y1={6} x2={6} y2={18} stroke="#5C4A3A" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      )}

      {/* Session 10B Step 4: Category chips (horizontal scroll, gated on searchVisible) */}
      {searchVisible && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={wardrobeStyles.chipsScroll}
          contentContainerStyle={wardrobeStyles.chipsScrollContent}
        >
          {CATEGORY_CHIPS.map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                wardrobeStyles.categoryChip,
                selectedCategory === label && wardrobeStyles.categoryChipActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(label)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text
                style={[
                  wardrobeStyles.categoryChipText,
                  selectedCategory === label && wardrobeStyles.categoryChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Session 10B Step 5: Result count (only when search is visible AND text is non-empty) */}
      {searchVisible && searchText.trim() !== '' && (
        <Text style={wardrobeStyles.searchResultsCount}>
          Showing {filteredItems.length} results for {searchText}
        </Text>
      )}

      {/* Session 13A: Friendly empty state when search filter returns zero results */}
      {searchVisible && itemCount > 0 && filteredItems.length === 0 && (
        <View style={wardrobeStyles.searchEmptyState}>
          <Text style={wardrobeStyles.searchEmptyTitle}>No items match your search</Text>
          <Text style={wardrobeStyles.searchEmptySubtext}>Try a different name or category</Text>
        </View>
      )}

      {/* HIDDEN: Session 10A Step 4 — replaced by the new empty state early return at the top of WardrobeTab render */}
      {/*
      {itemCount === 0 && (
        <View style={wardrobeStyles.emptyState}>
          <Text style={wardrobeStyles.emptyEmoji}>👗</Text>
          <Text style={wardrobeStyles.emptyText}>
            Every great wardrobe starts with one piece. Add your first item and let's see what Clozie can do ✦
          </Text>
        </View>
      )}
      */}

      {/* Item grid — 2 columns */}
      {itemCount > 0 && (
        <View style={wardrobeStyles.grid}>
          {filteredItems.map((item) => (
            <View key={item.id} style={wardrobeStyles.gridCard}>
              {/* Photo (real if added, placeholder emoji otherwise) */}
              <View style={wardrobeStyles.gridCardPhoto}>
                {item.photoUri ? (
                  <Image
                    source={{ uri: item.photoUri }}
                    style={wardrobeStyles.gridCardPhotoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={wardrobeStyles.gridCardPlaceholder}>
                    <TabHangerIcon active={false} size={40} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28" />
                    <Text style={wardrobeStyles.gridCardPlaceholderText}>No photo</Text>
                  </View>
                )}
              </View>
              {/* HIDDEN: Session 10A Step 6 — pencil moved to the category-tag row (below) */}
              {/*
              <TouchableOpacity
                style={wardrobeStyles.editIcon}
                activeOpacity={0.7}
                onPress={() => handleEditItem(item)}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              >
                <Text style={wardrobeStyles.editIconText}>✎</Text>
              </TouchableOpacity>
              */}
              {/* Delete icon — positioned over photo */}
              <TouchableOpacity
                style={wardrobeStyles.deleteIcon}
                activeOpacity={0.7}
                onPress={() => setDeleteConfirmId(item.id)}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
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
                      disabled={isSaving}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Text style={wardrobeStyles.deleteConfirmRemoveText}>{isSaving ? 'Removing…' : 'Remove'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={wardrobeStyles.deleteConfirmCancel}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={isSaving}
                      onPress={() => setDeleteConfirmId(null)}
                    >
                      <Text style={wardrobeStyles.deleteConfirmCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Category tag row — Session 10A Step 6: pencil edit icon right-aligned on this row */}
              <View style={wardrobeStyles.categoryTagRow}>
                <View style={wardrobeStyles.categoryTag}>
                  <Text style={wardrobeStyles.categoryTagText}>{item.category}</Text>
                </View>
                <TouchableOpacity
                  style={wardrobeStyles.editPencil}
                  activeOpacity={0.7}
                  onPress={() => handleEditItem(item)}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                >
                  <Text style={wardrobeStyles.editPencilText}>✎</Text>
                </TouchableOpacity>
              </View>
              {/* Item name */}
              <Text style={wardrobeStyles.gridCardName} numberOfLines={1}>{item.name}</Text>
              {/* Colour */}
              {item.colour !== '' && (
                <Text style={wardrobeStyles.gridCardColour} numberOfLines={1}>{item.colour}</Text>
              )}
              {/* Last worn date */}
              <Text style={wardrobeStyles.gridCardLastWorn}>
                {formatLastWorn(item.lastWorn)}
              </Text>
              {/* What goes with this — hidden until tappable feature is built (Phase 2) */}
              {false && (
                <Text style={wardrobeStyles.gridCardPairLink}>What goes with this?</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* HIDDEN: Session 10A Step 2 — replaced by floating + button (Step 1) and sticky bar (Step 3) */}
      {/*
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
      */}

      {/* Add Item panel */}
      {showAddPanel && (
        <View
          style={wardrobeStyles.addPanel}
          onLayout={(e) => {
            panelYRef.current = e.nativeEvent.layout.y;
            if (showAddPanel && !hasScrolledForPanelRef.current && scrollRef.current) {
              hasScrolledForPanelRef.current = true;
              const { y } = e.nativeEvent.layout;
              scrollRef.current.scrollTo({ y: Math.max(0, y - 12), animated: true });
            }
          }}
        >
          <View style={wardrobeStyles.addPanelHeader}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { Keyboard.dismiss(); setShowAddPanel(false); setEditingItemId(null); setNewItemName(''); setNewItemCategory(''); setNewItemColour(''); setNewItemNotes(''); setPhotoUri(null); setIsScanning(false); setRecognitionStatus(null); setAutoFilledFields({}); setShowCategoryPicker(false); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' }}
            >
              <Text style={wardrobeStyles.addPanelClose}>✕</Text>
            </TouchableOpacity>
            <Text style={wardrobeStyles.addPanelHeading}>{editingItemId ? 'EDIT ITEM' : 'ADD NEW ITEM'}</Text>
          </View>

          {/* Photo section */}
          <View style={wardrobeStyles.photoArea}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={wardrobeStyles.photoPreview}
                resizeMode="cover"
              />
            ) : (
              <>
                <Text style={wardrobeStyles.photoPlaceholder}>📷</Text>
                <Text style={wardrobeStyles.photoTitle}>Add a Photo</Text>
                <Text style={wardrobeStyles.photoSubtitle}>✦ Clozie fills in all details automatically</Text>
              </>
            )}
            <View style={wardrobeStyles.photoButtons}>
              <TouchableOpacity style={wardrobeStyles.photoButton} activeOpacity={0.7} onPress={handleTakePhoto}>
                <Text style={wardrobeStyles.photoButtonText}>{photoUri ? '📸 Retake' : '📸 Take Photo'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wardrobeStyles.photoButton} activeOpacity={0.7} onPress={handleUploadFile}>
                <Text style={wardrobeStyles.photoButtonText}>{photoUri ? '🖼 Replace' : '🖼 Upload File'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recognition status bar — only renders when a scan is in progress / done / failed */}
          {recognitionStatus && (
            <View style={[
              wardrobeStyles.recognitionBar,
              recognitionStatus === 'scanning' && wardrobeStyles.recognitionBarScanning,
              recognitionStatus === 'success' && wardrobeStyles.recognitionBarSuccess,
              recognitionStatus === 'no-key' && wardrobeStyles.recognitionBarNoKey,
              recognitionStatus === 'error' && wardrobeStyles.recognitionBarError,
              recognitionStatus === 'offline' && wardrobeStyles.recognitionBarError,
            ]}>
              {recognitionStatus === 'success' && (
                <Text style={wardrobeStyles.recognitionBarBadge}>CLOZIE RECOGNISED</Text>
              )}
              <Text style={[
                wardrobeStyles.recognitionBarText,
                recognitionStatus === 'scanning' && wardrobeStyles.recognitionBarTextScanning,
              ]}>
                {recognitionStatus === 'scanning' && '✦ Clozie is reading your item…'}
                {recognitionStatus === 'success' && 'Clozie filled in your details — check and edit below!'}
                {recognitionStatus === 'no-key' && 'No Clozie key — fill in details manually'}
                {recognitionStatus === 'error' && "Couldn't read your item — fill in details manually"}
                {recognitionStatus === 'offline' && "Your photo didn't go through. Check your connection and try again."}
              </Text>
            </View>
          )}

          {/* Tip box */}
          <View style={wardrobeStyles.tipBox}>
            <Text style={wardrobeStyles.tipText}>
              💡 Best results: photograph on a white or light background — Clozie reads colours more accurately.
            </Text>
          </View>

          {/* Name field (required) */}
          <Text style={wardrobeStyles.fieldLabel}>Name *</Text>
          <TextInput
            style={[wardrobeStyles.fieldInput, autoFilledFields.name && wardrobeStyles.fieldInputAutoFilled]}
            placeholder="e.g. Navy Blue Wrap Dress"
            placeholderTextColor="rgba(44,26,14,0.65)"
            value={newItemName}
            onChangeText={(text) => {
              setNewItemName(text);
              if (autoFilledFields.name) setAutoFilledFields((prev) => ({ ...prev, name: false }));
            }}
            returnKeyType="next"
          />

          {/* Category dropdown */}
          <Text style={wardrobeStyles.fieldLabel}>Category</Text>
          <TouchableOpacity
            style={[wardrobeStyles.fieldInput, autoFilledFields.category && wardrobeStyles.fieldInputAutoFilled]}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: newItemCategory ? '#2C1A0E' : 'rgba(44,26,14,0.65)' }}>
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
                    if (autoFilledFields.category) setAutoFilledFields((prev) => ({ ...prev, category: false }));
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
            style={[wardrobeStyles.fieldInput, autoFilledFields.colour && wardrobeStyles.fieldInputAutoFilled]}
            placeholder="e.g. Navy blue, striped"
            placeholderTextColor="rgba(44,26,14,0.65)"
            value={newItemColour}
            onChangeText={(text) => {
              setNewItemColour(text);
              if (autoFilledFields.colour) setAutoFilledFields((prev) => ({ ...prev, colour: false }));
            }}
            returnKeyType="next"
          />

          {/* Notes field */}
          <Text style={wardrobeStyles.fieldLabel}>Notes</Text>
          <TextInput
            style={[wardrobeStyles.fieldInput, { minHeight: 60 }, autoFilledFields.notes && wardrobeStyles.fieldInputAutoFilled]}
            placeholder="e.g. From Zara, size M, great for date night"
            placeholderTextColor="rgba(44,26,14,0.65)"
            value={newItemNotes}
            onChangeText={(text) => {
              setNewItemNotes(text);
              if (autoFilledFields.notes) setAutoFilledFields((prev) => ({ ...prev, notes: false }));
            }}
            multiline={true}
            textAlignVertical="top"
          />

          {/* Add to Closet button */}
          <TouchableOpacity
            style={[
              wardrobeStyles.addToClosetButton,
              (!newItemName.trim() || isSaving || isScanning) && wardrobeStyles.addToClosetButtonDisabled,
            ]}
            activeOpacity={newItemName.trim() && !isSaving && !isScanning ? 0.8 : 1}
            disabled={!newItemName.trim() || isSaving || isScanning}
            onPress={editingItemId ? handleSaveEdit : handleAddItem}
          >
            <Text style={wardrobeStyles.addToClosetButtonText}>
              {isSaving ? 'Saving…' : editingItemId ? 'Save Changes' : 'Add to Closet'}
            </Text>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            style={wardrobeStyles.cancelButton}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => {
              Keyboard.dismiss();
              setShowAddPanel(false);
              setEditingItemId(null);
              setNewItemName('');
              setNewItemCategory('');
              setNewItemColour('');
              setNewItemNotes('');
              setPhotoUri(null);
              setIsScanning(false);
              setRecognitionStatus(null);
              setAutoFilledFields({});
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

      {/* HIDDEN: Session 10A Step 2 — replaced by sticky bar (Step 3) */}
      {/*
      {!showAddPanel && (
        <TouchableOpacity
          style={wardrobeStyles.vibeButton}
          activeOpacity={0.8}
          onPress={onGoToVibe}
        >
          <Text style={wardrobeStyles.vibeButtonText}>Set Today's Vibe →</Text>
        </TouchableOpacity>
      )}
      */}
    </ScrollView>

    {/* Session 10A Step 1: Floating + button — opens Add Item panel. Hidden when closet is empty (Step 4 owns empty state) or while Add Item panel is open. */}
    {/* Session 16B: also hidden for non-VIP at cap so they can't open the panel to try to exceed 50. */}
    {itemCount > 0 && !showAddPanel && (isVip || itemCount < maxItems) && (
      <TouchableOpacity
        style={wardrobeStyles.floatingAddButton}
        activeOpacity={0.85}
        onPress={() => setShowAddPanel(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Svg width={26} height={26} viewBox="0 0 26 26">
          <Line x1="13" y1="4" x2="13" y2="22" stroke="#2C1A0E" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="4" y1="13" x2="22" y2="13" stroke="#2C1A0E" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      </TouchableOpacity>
    )}

    {/* Session 10A Step 3 → Session 13B: Floating centered pill (was full-width sticky bar). Wrapper uses pointerEvents="box-none" so taps outside the pill pass through to closet content. Hidden when closet is empty or Add Item panel is open. */}
    {itemCount > 0 && !showAddPanel && (
      <View style={wardrobeStyles.stickyVibeBarWrapper} pointerEvents="box-none">
        <TouchableOpacity
          style={wardrobeStyles.stickyVibeBar}
          activeOpacity={0.85}
          onPress={onGoToVibe}
        >
          <Text style={wardrobeStyles.stickyVibeBarText}>Set Today's Vibe →</Text>
        </TouchableOpacity>
      </View>
    )}
    </KeyboardAvoidingView>
  );
}

// ── Today's Vibe Tab ────────────────────────────────────────────────────────
function TodaysVibeTab({ wardrobeItemCount, wardrobeItems, onGenerate, onGoToCloset }) {
  const [selectedTemperature, setSelectedTemperature] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [indoors, setIndoors] = useState(false);
  const [pinnedItemId, setPinnedItemId] = useState(null);
  const pinnedItem = pinnedItemId ? wardrobeItems.find((i) => i.id === pinnedItemId) : null;
  const [extraNotes, setExtraNotes] = useState('');
  // Session 11 Step B2 — Pin Selector bottom sheet state. Resets on close so reopens start fresh.
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSearchText, setSheetSearchText] = useState('');
  const [sheetSelectedCategory, setSheetSelectedCategory] = useState('All');
  useEffect(() => {
    if (!sheetVisible) {
      setSheetSearchText('');
      setSheetSelectedCategory('All');
    }
  }, [sheetVisible]);
  const sheetFilteredItems = sheetVisible
    ? filterWardrobeItems(wardrobeItems, sheetSearchText, sheetSelectedCategory)
    : [];
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

  // Empty wardrobe: show warm guidance instead of weather/occasion/Generate UI.
  // Generate path is unreachable from this state — gate 4 (not_enough_items) would
  // reject anyway, but the empty state is a friendlier UX than letting them tap and fail.
  if (wardrobeItems.length === 0) {
    return (
      <View style={vibeStyles.emptyContainer}>
        <Text style={vibeStyles.emptyText}>
          Add a few pieces to your closet first — Clozie will do the rest.
        </Text>
        <TouchableOpacity
          style={vibeStyles.emptyButton}
          activeOpacity={0.8}
          onPress={onGoToCloset}
        >
          <Text style={vibeStyles.emptyButtonText}>Go to My Closet →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={vibeStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
                  hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
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
                  hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
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
                  hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
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
        <Text style={vibeStyles.mustIncludeLine1}>Something in mind? Pin it — Clozie builds around it.</Text>
        <Text style={vibeStyles.mustIncludeLine2}>A jacket, a dress, those new shoes.</Text>

        {/* HIDDEN: Session 11 Step B1 — replaced by text-only card + search button. Bottom sheet wires in B2.
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
        */}

        <View style={vibeStyles.mustIncludeRow}>
          <TouchableOpacity
            style={vibeStyles.mustIncludeSearchBtn}
            activeOpacity={0.7}
            onPress={() => setSheetVisible(true)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={7} stroke="#5C4A3A" strokeWidth={1.8} />
              <Line x1={20} y1={20} x2={16.65} y2={16.65} stroke="#5C4A3A" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <Text style={vibeStyles.mustIncludeSearchBtnText}>Search</Text>
          </TouchableOpacity>

          {pinnedItem && (
            <View style={vibeStyles.pinnedPill}>
              <Text style={vibeStyles.pinnedPillSparkle}>✦</Text>
              <Text style={vibeStyles.pinnedPillText} numberOfLines={1}>{pinnedItem.name}</Text>
              <TouchableOpacity
                style={vibeStyles.pinnedPillX}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPinnedItemId(null);
                }}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              >
                <Text style={vibeStyles.pinnedPillXText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!pinnedItem && (
          <Text style={vibeStyles.mustIncludeHint}>No item pinned — Clozie picks freely</Text>
        )}
      </View>

      {/* TELL CLOZIE MORE card */}
      <View style={vibeStyles.card}>
        <Text style={vibeStyles.cardHeading}>TELL CLOZIE MORE</Text>
        <TextInput
          style={vibeStyles.textInput}
          placeholder="Tell Clozie more — which jacket? office is cold, dinner out, no heels today…"
          placeholderTextColor="rgba(44,26,14,0.65)"
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
        onPress={() => onGenerate({
          temperature: selectedTemperature,
          condition: selectedCondition,
          occasion: selectedOccasion,
          indoors,
          pinnedItemId,
          brief: extraNotes.trim() || null,
        })}
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

    {/* Session 11 Step B2 — Pin Selector bottom sheet. Render-only; tap-to-pin wiring lands in B3. */}
    <Modal
      transparent
      visible={sheetVisible}
      animationType="slide"
      onRequestClose={() => setSheetVisible(false)}
    >
      <View style={pinSheetStyles.modalRoot}>
        <Pressable style={pinSheetStyles.backdrop} onPress={() => setSheetVisible(false)} />
        <View style={pinSheetStyles.sheet}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Handle bar */}
            <View style={pinSheetStyles.handleBar} />

            {/* Header row */}
            <View style={pinSheetStyles.headerRow}>
              <Text style={pinSheetStyles.headerTitle}>Pin an Item</Text>
              <TouchableOpacity
                style={pinSheetStyles.closeButton}
                activeOpacity={0.7}
                onPress={() => setSheetVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={pinSheetStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Subtext */}
            <Text style={pinSheetStyles.subtext}>Tap any item — Clozie builds every outfit around it.</Text>

            {/* Search bar */}
            <View style={pinSheetStyles.searchBar}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx={11} cy={11} r={7} stroke="#5C4A3A" strokeWidth={1.8} />
                <Line x1={20} y1={20} x2={16.65} y2={16.65} stroke="#5C4A3A" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
              <TextInput
                style={pinSheetStyles.searchInput}
                value={sheetSearchText}
                onChangeText={setSheetSearchText}
                placeholder="Search your closet..."
                placeholderTextColor="rgba(44,26,14,0.65)"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {sheetSearchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSheetSearchText('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={pinSheetStyles.searchClearX}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category chips — reuses wardrobeStyles.categoryChip cross-tab (intentional, see B2 plan note 3) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={pinSheetStyles.chipScroll}
              contentContainerStyle={pinSheetStyles.chipScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {CATEGORY_CHIPS.map((label) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    wardrobeStyles.categoryChip,
                    sheetSelectedCategory === label && wardrobeStyles.categoryChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSheetSelectedCategory(label)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Text
                    style={[
                      wardrobeStyles.categoryChipText,
                      sheetSelectedCategory === label && wardrobeStyles.categoryChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tap to pin hint */}
            <Text style={pinSheetStyles.tapHint}>Tap to pin</Text>

            {/* Grid */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={pinSheetStyles.gridContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {sheetFilteredItems.length === 0 ? (
                <Text style={pinSheetStyles.emptyResults}>No items match</Text>
              ) : (
                <View style={pinSheetStyles.grid}>
                  {sheetFilteredItems.map((item) => {
                    const isPinned = pinnedItemId === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.85}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          if (pinnedItemId === item.id) {
                            // Tap already-pinned card → unpin, sheet stays open
                            setPinnedItemId(null);
                          } else {
                            // Unpinned card OR different card while one is pinned → switch + auto-dismiss
                            setPinnedItemId(item.id);
                            setSheetVisible(false);
                          }
                        }}
                        style={[
                          pinSheetStyles.gridCard,
                          isPinned && pinSheetStyles.gridCardPinned,
                        ]}
                      >
                        <View style={pinSheetStyles.gridCardPhoto}>
                          {item.photoUri ? (
                            <Image
                              source={{ uri: item.photoUri }}
                              style={pinSheetStyles.gridCardPhotoImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={pinSheetStyles.gridCardPlaceholder}>
                              <TabHangerIcon active={false} size={40} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28" />
                              <Text style={pinSheetStyles.gridCardPlaceholderText}>No photo</Text>
                            </View>
                          )}
                          {isPinned && (
                            <View style={pinSheetStyles.checkCircle}>
                              <Text style={pinSheetStyles.checkCircleText}>✓</Text>
                            </View>
                          )}
                        </View>
                        <View style={pinSheetStyles.categoryTag}>
                          <Text style={pinSheetStyles.categoryTagText}>{item.category}</Text>
                        </View>
                        <Text style={pinSheetStyles.gridCardName} numberOfLines={1}>{item.name}</Text>
                        {item.colour ? (
                          <Text style={pinSheetStyles.gridCardColour} numberOfLines={1}>{item.colour}</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
    </KeyboardAvoidingView>
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
        { kind: 'item', item: bottom, w: 130, h: 140, bottom: 95, left: 22,     rot: -2 },
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
        { kind: 'item', item: bottom, w: 130, h: 140, bottom: 95, left: 22,  rot: -2 },
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
  return cell.item?.photoUri ? (
    <Image source={{ uri: cell.item.photoUri }} style={{ flex: 1 }} />
  ) : (
    <View style={{ flex: 1, backgroundColor: MOOD_PLACEHOLDER_COLORS.Accessories }} />
  );
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
        ) : item?.photoUri ? (
          <Image
            source={{ uri: item.photoUri }}
            style={
              item?.category === 'Bottoms'
                ? { position: 'absolute', top: '4%', left: '4%', width: '92%', aspectRatio: 1 }
                : { width: '92%', height: '92%' }
            }
            resizeMode={item?.category === 'Shoes' ? 'contain' : 'cover'}
          />
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

// ── Share Card — offscreen, captured via react-native-view-shot ─────────────
// Rendered offscreen at top: -10000 inside YourLooksTab. When the user taps
// Share Outfit, the parent sets `outfit`, waits one render tick + ~300ms for
// images to settle, then calls captureRef on the ref to produce a PNG file
// that gets handed to expo-sharing.shareAsync().
function ShareCard({ outfit, shotRef }) {
  if (!outfit) return null;
  const items = Array.isArray(outfit.items) ? outfit.items : [];
  return (
    <View style={shareCardStyles.offscreen} pointerEvents="none">
      <ViewShot ref={shotRef} options={{ format: 'png', quality: 0.95, result: 'tmpfile' }}>
        <View style={shareCardStyles.card}>
          {/* Photo grid — 2 columns, real wardrobe photos */}
          <View style={shareCardStyles.photoGrid}>
            {items.slice(0, 4).map((item) => (
              <View key={item.id} style={shareCardStyles.photoCell}>
                <View style={shareCardStyles.photoThumb}>
                  {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={shareCardStyles.photoImage} />
                  ) : (
                    <View style={[shareCardStyles.photoImage, { backgroundColor: '#F5F0E8' }]} />
                  )}
                </View>
                <Text style={shareCardStyles.photoName} numberOfLines={1}>{item.name}</Text>
              </View>
            ))}
          </View>

          {/* Vibe + name + description */}
          <View style={shareCardStyles.textBlock}>
            <Text style={shareCardStyles.vibeLabel}>{outfit.vibe}</Text>
            <Text style={shareCardStyles.outfitName} numberOfLines={2}>{outfit.name}</Text>
            {outfit.description ? (
              <Text style={shareCardStyles.description} numberOfLines={3}>{outfit.description}</Text>
            ) : null}
          </View>

          {/* Watermark footer — sage bar */}
          <View style={shareCardStyles.watermark}>
            <Text style={shareCardStyles.watermarkText}>Styled by Clozie</Text>
          </View>
        </View>
      </ViewShot>
    </View>
  );
}

const shareCardStyles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -10000,
    left: 0,
  },
  card: {
    width: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    gap: 12,
  },
  photoCell: {
    width: (360 - 18 * 2 - 12) / 2,
  },
  photoThumb: {
    aspectRatio: 4 / 5,
    backgroundColor: '#F5F0E8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoName: {
    marginTop: 6,
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
  },
  textBlock: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  vibeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  outfitName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: '#2C1A0E',
    lineHeight: 30,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Outfit_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 19,
  },
  watermark: {
    backgroundColor: '#E8E4CE',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    color: '#2C1A0E',
    letterSpacing: 0.4,
  },
});

// 9J: Rotating subtitle messages shown under the loading spinner.
const LOADING_MESSAGES = [
  'Browsing your closet ✦',
  'Mixing and matching ✦',
  'Finding your best looks ✦',
  'Almost there ✦',
  'Clozie is working her magic ✦',
];

// Session 12 S2: Occasion filter chips for Saved Outfits search.
// Order: 'All' first (default), then the 7 occasions in the same order they
// appear in the Today's Vibe THE OCCASION card (App.js:221) + the Edge Function's
// FALLBACK_NAMES_BY_OCCASION keys (Session 7C). MIDDOT (·, U+00B7) NOT slash —
// must match the canonical strings the Edge Function writes into outfit_history.occasion.
const OCCASION_CHIPS = ['All', 'Casual Day', 'Work · Office', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel'];

// ── Your Looks Tab ──────────────────────────────────────────────────────────
function YourLooksTab({ onGoToVibe, generationStatus, outfits: outfitsProp, generationError, recoveryMode, wardrobeItems, onRegenerate, onPersistInteraction, onMarkItemsWorn, savedOutfits, setSavedOutfits, wornOutfits, setWornOutfits, generationContext, sessionsUsedThisWeek, isVip }) {
  // ── DEMO_MODE: flip to `true` for visual testing (HIG audit, Mood Board / Hanger View / Saved Outfits review). Production: always `false`. ──
  const DEMO_MODE = false;

  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(DEMO_MODE);
  const spinAnim = useRef(new Animated.Value(0)).current;
  // Hanger View entrance animation — staggered drop+fade per slot (Session 14)
  const hangerCentreAnim = useRef(new Animated.Value(0)).current;
  const hangerPantsAnim = useRef(new Animated.Value(0)).current;
  const hangerShoesAnim = useRef(new Animated.Value(0)).current;
  const hangerSideAnim = useRef(new Animated.Value(0)).current;
  // Session 13G: heart save pulse — single shared Animated.Value, gated by savingOutfitId
  // so only the just-saved card's heart scales (others stay scale=1).
  const saveAnim = useRef(new Animated.Value(1)).current;
  const [savingOutfitId, setSavingOutfitId] = useState(null);
  // Session 12: savedOutfits is now lifted to MainAppScreen via props.
  // Derived set gives O(1) `is this outfit saved?` checks across the render tree.
  const savedIds = new Set((savedOutfits || []).map((o) => o.id));
  const [ratings, setRatings] = useState({});
  const [ratingFeedback, setRatingFeedback] = useState({});
  const [wornToday, setWornToday] = useState({});
  const [showBoutique, setShowBoutique] = useState({});
  const [moodBoardOutfit, setMoodBoardOutfit] = useState(null);
  const [moodBoardTab, setMoodBoardTab] = useState('moodboard');
  const [mannequinBg, setMannequinBg] = useState('Cream');
  const [showSavedScreen, setShowSavedScreen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  // Session 12 S2: Search state for the Saved Outfits modal (wired in S3-S6).
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  // Share — offscreen ShareCard ref + state for one-at-a-time share flow
  const [outfitToShare, setOutfitToShare] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const shareShotRef = useRef(null);
  // Session 20: Your Week bottom sheet visibility (S4). Dot row + day cards in S5/S6.
  const [weekSheetVisible, setWeekSheetVisible] = useState(false);
  // Session 20 S5: selected day (local YYYY-MM-DD). Reset to today on every sheet open
  // — matches Pin Sheet's "filter resets on close" pattern, so each sheet open lands fresh.
  const [selectedDay, setSelectedDay] = useState(() => toLocalYMD(new Date()));
  useEffect(() => {
    if (weekSheetVisible) {
      setSelectedDay(toLocalYMD(new Date()));
    }
  }, [weekSheetVisible]);
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

  const handleRate = (outfit, rating) => {
    setRatings((prev) => ({ ...prev, [outfit.id]: rating }));
    setRatingFeedback((prev) => ({ ...prev, [outfit.id]: true }));
    setTimeout(() => {
      setRatingFeedback((prev) => ({ ...prev, [outfit.id]: false }));
    }, 2000);
    if (onPersistInteraction) onPersistInteraction(outfit, { rating });
  };

  const handleRegenerate = () => {
    // 9F-A: Evaluate circuit-breaker counter from the JUST-RATED outfits, before
    // local resets clear `ratings`. Fire-and-forget — the metadata write races
    // with the next Edge Function call, and that's spec-compliant: recovery
    // mode is meant to fire on subsequent generations, not retroactively.
    //   - Any Love/Like in this session → reset counter to 0
    //   - ALL outfits rated Nope → increment counter
    //   - Incomplete session (0/1/2 ratings, no positives) → leave alone
    const ratingsList = outfits.map((o) => ratings[o.id]);
    const anyPositive = ratingsList.some((r) => r === 'love' || r === 'like');
    const allRatedNegative = outfits.length > 0
      && ratingsList.length === outfits.length
      && ratingsList.every((r) => r === 'nope');
    if (anyPositive) {
      supabase.auth.updateUser({ data: { consecutive_negative_sessions: 0 } })
        .catch((e) => console.warn('[counter] reset failed:', e?.message));
    } else if (allRatedNegative) {
      supabase.auth.getUser().then(({ data }) => {
        const current = typeof data?.user?.user_metadata?.consecutive_negative_sessions === 'number'
          ? data.user.user_metadata.consecutive_negative_sessions
          : 0;
        return supabase.auth.updateUser({ data: { consecutive_negative_sessions: current + 1 } });
      }).catch((e) => console.warn('[counter] increment failed:', e?.message));
    }

    // Local UI resets — clear ratings, feedback, "worn today" markers, boutique panels
    // before firing a new generation. Spinner + hasGenerated flags are driven by the
    // lifted generationStatus useEffect above — no fake setTimeout needed.
    setRatings({});
    setRatingFeedback({});
    setWornToday({});
    setShowBoutique({});
    if (onRegenerate) onRegenerate();
  };

  const hasAnyRating = Object.keys(ratings).length > 0;

  const handleWornToday = (outfit) => {
    setWornToday((prev) => ({ ...prev, [outfit.id]: true }));
    setTimeout(() => {
      setWornToday((prev) => ({ ...prev, [outfit.id]: false }));
    }, 2000);
    const nowIso = new Date().toISOString();
    if (onPersistInteraction) {
      onPersistInteraction(outfit, { appendWornDate: nowIso });
    }
    if (onMarkItemsWorn) {
      const itemIds = (outfit.items || []).map((i) => i?.id).filter(Boolean);
      if (itemIds.length > 0) onMarkItemsWorn(itemIds);
    }
    // Session 20 S8: optimistic local update so the 📅 Your Week pill + dot
    // fills refresh without app reload. Mirrors toggleSave's pattern — full
    // shape stamped so the S2 merge-by-id load overwrites cleanly on next
    // reload. Same-day dedupe uses UTC slice(0,10) to match the DB-side
    // dedupe in upsertOutfitInteraction (outfitHistory.js).
    if (setWornOutfits) {
      const todayUtcKey = nowIso.slice(0, 10);
      setWornOutfits((prev) => {
        const existing = prev.find((o) => o.id === outfit.id);
        if (existing) {
          const alreadyLoggedToday = (existing.wornDates || []).some(
            (d) => typeof d === 'string' && d.slice(0, 10) === todayUtcKey
          );
          if (alreadyLoggedToday) return prev;
          return prev.map((o) =>
            o.id === outfit.id
              ? { ...o, wornDates: [...(o.wornDates || []), nowIso] }
              : o
          );
        }
        return [{
          ...outfit,
          itemIds: (outfit.items || []).map((i) => i.id),
          occasion: generationContext?.occasion ?? null,
          temperature: generationContext?.temperature ?? null,
          condition: generationContext?.condition ?? null,
          indoors: generationContext?.indoors === true,
          brief: generationContext?.brief ?? null,
          pinnedItemId: generationContext?.pinnedItemId ?? null,
          rating: null,
          wornDates: [nowIso],
          savedAt: null,
          createdAt: nowIso,
        }, ...prev];
      });
    }
  };

  const toggleSave = (outfit) => {
    // Session 12: savedOutfits is now SavedOutfit[] (full objects), not string[] (IDs).
    // Newest-first ordering matches fetchSavedOutfits's saved_at DESC order.
    // S1b: stamp itemIds on the optimistic add so the re-hydration effect can
    // re-resolve items if wardrobeItems changes after the save (edit/delete in My Closet).
    // Session 13: stamp context fields onto the optimistic entry so its shape matches
    // fetchSavedOutfits — without this the occasion chip filter returned 0 results
    // for any outfit saved in the current session (outfit.occasion was undefined).
    const isSavingNow = !savedIds.has(outfit.id);
    if (isSavingNow) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSavingOutfitId(outfit.id);
      saveAnim.setValue(1);
      Animated.sequence([
        Animated.spring(saveAnim, { toValue: 1.12, useNativeDriver: true, friction: 5, tension: 150 }),
        Animated.spring(saveAnim, { toValue: 1.0, useNativeDriver: true, friction: 4, tension: 120 }),
      ]).start(() => setSavingOutfitId(null));
    }
    const nowIso = new Date().toISOString();
    setSavedOutfits((prev) =>
      prev.some((o) => o.id === outfit.id)
        ? prev.filter((o) => o.id !== outfit.id)
        : [{
            ...outfit,
            itemIds: (outfit.items || []).map((i) => i.id),
            occasion: generationContext?.occasion ?? null,
            temperature: generationContext?.temperature ?? null,
            condition: generationContext?.condition ?? null,
            indoors: generationContext?.indoors === true,
            brief: generationContext?.brief ?? null,
            pinnedItemId: generationContext?.pinnedItemId ?? null,
            rating: null,
            wornDates: [],
            savedAt: nowIso,
            createdAt: nowIso,
          }, ...prev]
    );
    if (onPersistInteraction) {
      onPersistInteraction(outfit, { saved: isSavingNow });
    }
  };

  // Share Outfit — captures the offscreen ShareCard via react-native-view-shot,
  // then hands the resulting PNG to expo-sharing for the native share sheet.
  // No caption support (expo-sharing is file-only); the watermark on the image
  // itself carries the brand signal.
  const handleShareOutfit = async (outfit) => {
    if (!outfit || isSharing) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', "Sharing isn't available on this device.");
        return;
      }
      setOutfitToShare(outfit);
      setIsSharing(true);
      // Wait for the offscreen ShareCard to mount and images to settle.
      // photoUri values are the same signed URLs the visible photo strip just
      // rendered, so RN's image cache typically has them already.
      await new Promise((resolve) => setTimeout(resolve, 300));
      const uri = await captureRef(shareShotRef, {
        format: 'png',
        quality: 0.95,
        result: 'tmpfile',
      });
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Share your outfit',
        mimeType: 'image/png',
        UTI: 'public.png',
      });
    } catch (err) {
      console.warn('[share-outfit] failed', err);
      Alert.alert("Couldn't share", 'Something went wrong opening the share sheet. Please try again.');
    } finally {
      setIsSharing(false);
      setOutfitToShare(null);
    }
  };

  // Outfit shape: { id: string, vibe: string (uppercase), name: string,
  //                 description: string (quoted), items: WardrobeItem[] }
  // Production: outfits come from MainAppScreen via outfitsProp (Edge Function response,
  // resolved against wardrobeItems). DEMO_MODE: 3 fixture outfits for visual testing.
  const DEMO_OUTFITS = [
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
  ];
  const outfits = DEMO_MODE ? DEMO_OUTFITS : (outfitsProp || []);

  // Drive local loading/hasGenerated flags from the lifted generationStatus.
  // 'idle'    → leave alone (preserves DEMO_MODE initial state)
  // 'loading' → show spinner, hide stale outfits
  // 'success' → show outfits
  // 'error'   → show warm Clozie message inside the empty-state slot
  useEffect(() => {
    if (generationStatus === 'loading') {
      setLoading(true);
      setHasGenerated(false);
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();
    } else if (generationStatus === 'success') {
      setLoading(false);
      setHasGenerated(true);
    } else if (generationStatus === 'error') {
      setLoading(false);
      setHasGenerated(false);
    }
  }, [generationStatus]);

  // 9J: Rotate loading subtitle every 1.5s while loading. Resets to index 0
  // on each new 'loading' transition. Modulo loop covers slow generations.
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  useEffect(() => {
    if (generationStatus !== 'loading') return;
    setLoadingMessageIndex(0);
    const id = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(id);
  }, [generationStatus]);

  // Hanger View entrance — runs when user opens Hanger tab or switches outfit.
  // Stagger: centre 0ms → pants +250 → shoes +500 → side +750, each 350ms duration.
  // useNativeDriver:true keeps animation on the native thread, zero JS impact.
  useEffect(() => {
    if (moodBoardTab === 'hanger' && moodBoardOutfit) {
      hangerCentreAnim.setValue(0);
      hangerPantsAnim.setValue(0);
      hangerShoesAnim.setValue(0);
      hangerSideAnim.setValue(0);
      Animated.stagger(250, [
        Animated.timing(hangerCentreAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(hangerPantsAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(hangerShoesAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(hangerSideAnim,   { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [moodBoardTab, moodBoardOutfit]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Session 12 S6: Derive filtered saved outfits + result count text.
  // When search is open, filterSavedOutfits handles default ('All' + '') as no-op,
  // so filteredSavedOutfits === savedOutfits when no filter content is applied.
  const filteredSavedOutfits = searchVisible
    ? filterSavedOutfits(savedOutfits, searchText, selectedOccasion)
    : savedOutfits;
  const showResultCount = searchVisible
    && (searchText.trim() !== '' || selectedOccasion !== 'All');
  let resultCountText = null;
  if (showResultCount) {
    const n = filteredSavedOutfits.length;
    if (searchText.trim() !== '') {
      resultCountText = `Showing ${n} result${n === 1 ? '' : 's'} for ${searchText.trim()}`;
    } else {
      resultCountText = `Showing ${n} outfit${n === 1 ? '' : 's'} for ${selectedOccasion}`;
    }
  }
  const showFilteredEmpty = showResultCount && filteredSavedOutfits.length === 0;

  // Loading state
  if (loading) {
    return (
      <View style={[looksStyles.scrollContent, { flex: 1, backgroundColor: '#E8E4CE', justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.Text style={[looksStyles.spinStar, { transform: [{ rotate: spin }] }]}>✦</Animated.Text>
        <Text style={looksStyles.loadingTitle}>Styling your outfits...</Text>
        <Text style={looksStyles.loadingSubtext}>{LOADING_MESSAGES[loadingMessageIndex]}</Text>
      </View>
    );
  }

  // Session 16B: session nudge text. Shown alongside outfit cards on Your Looks.
  // VIP always null. Otherwise: 9 → "3 left", 11 → "1 left", else null.
  // sessionsUsedThisWeek is post-insert count from Edge Function (so 9 = "9 used, 3 left").
  const sessionNudge =
    isVip || typeof sessionsUsedThisWeek !== 'number'
      ? null
      : sessionsUsedThisWeek === 9
      ? '3 styling sessions left this week.'
      : sessionsUsedThisWeek === 11
      ? '1 styling session left this week.'
      : null;

  // Session 20 S6: bucket worn outfits by LOCAL date for the Your Week sheet.
  // Per-outfit per-day dedupe handles the rare case where one outfit has
  // multiple ISO timestamps that resolve to the same local day (UTC-dedupe
  // late-night edge case noted in CLAUDE.md Known Issues).
  const wornByDay = new Map();
  for (const outfit of (wornOutfits || [])) {
    if (!Array.isArray(outfit.wornDates)) continue;
    const daysSeenForThisOutfit = new Set();
    for (const iso of outfit.wornDates) {
      if (typeof iso !== 'string') continue;
      const d = new Date(iso);
      if (isNaN(d.getTime())) continue;
      const ymd = toLocalYMD(d);
      if (daysSeenForThisOutfit.has(ymd)) continue;
      daysSeenForThisOutfit.add(ymd);
      const list = wornByDay.get(ymd) || [];
      list.push(outfit);
      wornByDay.set(ymd, list);
    }
  }
  const selectedDayOutfits = wornByDay.get(selectedDay) || [];

  return (
    <>
    <ScrollView
      style={{ flex: 1, backgroundColor: '#E8E4CE' }}
      contentContainerStyle={looksStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={looksStyles.heading}>Your Looks</Text>
        {/* Session 20: right-side pills cluster — 📅 Your Week + ❤️ Saved.
            Each gated on its own data so pills only appear when relevant. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {wornOutfits.length > 0 && (
            <TouchableOpacity
              style={{ minHeight: 44, paddingHorizontal: 4, justifyContent: 'center' }}
              activeOpacity={0.7}
              onPress={() => setWeekSheetVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
              accessibilityLabel="Your Week"
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 16, lineHeight: 18 }}>📅</Text>
            </TouchableOpacity>
          )}
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
      </View>

      {/* Empty state — shown when no outfits generated yet, OR a warm Clozie error */}
      {(!hasGenerated || outfits.length === 0) && (
        <View style={looksStyles.emptyState}>
          {generationStatus === 'error' && generationError ? (
            <>
              <Text style={looksStyles.emptyTitle}>Hmm</Text>
              <Text style={looksStyles.emptyText}>{generationError}</Text>
              <TouchableOpacity
                style={looksStyles.emptyButton}
                activeOpacity={0.8}
                onPress={onGoToVibe}
              >
                <Text style={looksStyles.emptyButtonText}>Adjust your vibe →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
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
            </>
          )}

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

      {/* 9F-E: Recovery banner — appears when circuit breaker is tripped (>=2 all-Nope sessions). */}
      {recoveryMode && hasGenerated && outfits.length > 0 && (
        <View style={looksStyles.recoveryBanner}>
          <Text style={looksStyles.recoveryBannerText}>
            I noticed my last few suggestions didn't land. I'm trying something different today — let me know if I'm getting warmer.
          </Text>
        </View>
      )}

      {/* Session 16B: session nudge — gentle terracotta line for non-VIP at 9 or 11 of 12. */}
      {sessionNudge && hasGenerated && outfits.length > 0 && (
        <Text style={looksStyles.sessionNudge}>{sessionNudge}</Text>
      )}

      {/* Outfit cards */}
      {hasGenerated && outfits.map((outfit) => (
        <View key={outfit.id} style={looksStyles.outfitCard}>
          {/* Item photo strip — 2 columns */}
          <View style={looksStyles.photoStrip}>
            {outfit.items.length > 0 ? outfit.items.map((item) => (
              <View key={item.id} style={looksStyles.photoStripItem}>
                <View style={looksStyles.photoStripThumb}>
                  {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={looksStyles.photoStripThumbImage} />
                  ) : (
                    <Text style={{ fontSize: 22 }}>{getCategoryEmoji(item.category)}</Text>
                  )}
                </View>
              </View>
            )) : (
              <View style={looksStyles.photoStripItem}>
                <View style={looksStyles.photoStripThumb}>
                  <Text style={{ fontSize: 22 }}>{getCategoryEmoji('Tops')}</Text>
                </View>
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
                savedIds.has(outfit.id) && looksStyles.actionButtonHalfSaved,
              ]}
              activeOpacity={0.7}
              onPress={() => toggleSave(outfit)}
            >
              <Animated.View
                style={savingOutfitId === outfit.id ? { transform: [{ scale: saveAnim }] } : null}
              >
                <Text style={looksStyles.actionButtonText}>
                  {savedIds.has(outfit.id) ? '❤️ Saved' : '🤍 Save'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={looksStyles.actionButtonHalf}
              activeOpacity={0.7}
              onPress={() => handleWornToday(outfit)}
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
                  onPress={() => handleRate(outfit, r.key)}
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
              onPress={() => handleShareOutfit(outfit)}
              disabled={isSharing}
            >
              <Text style={looksStyles.primaryButtonText}>{isSharing ? 'Preparing…' : 'Share Outfit'}</Text>
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
                  {/* Color swatches band — HIDDEN for Apple review (May 2026). Decorative palette, non-functional. To re-enable, change `false` to `true`. */}
                  {false && (
                    <View style={moodBoardStyles.swatchRow}>
                      {buildMoodSwatches(moodBoardOutfit.items).map((color, i) => (
                        <View key={i} style={[moodBoardStyles.swatch, { backgroundColor: color }]} />
                      ))}
                    </View>
                  )}

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
              const directTop = dress || allItems.find(i => i.category === 'Tops') || null;
              const pants = dress ? null : (allItems.find(i => i.category === 'Bottoms') || null);
              const shoes = allItems.find(i => i.category === 'Shoes') || null;
              // Heavy outerwear silently dropped; everything else in Outerwear = light
              const HEAVY_OUTER_RE = /(trench|puffer|parka|winter coat|wrap coat)/i;
              const outerCandidate = allItems.find(i => i.category === 'Outerwear');
              const lightOuter = (outerCandidate && !HEAVY_OUTER_RE.test(outerCandidate.name || '')) ? outerCandidate : null;
              // Headless fallback: outerwear promotes to centre top slot when no top/dress
              const top = directTop || lightOuter;
              const sideOuter = (top === lightOuter) ? null : lightOuter;
              // Accessories ordered head → ears → neck → wrist → waist → hand
              const accs = allItems
                .filter(i => i.category === 'Accessories')
                .sort((a, b) => accessoryRank(a.name) - accessoryRank(b.name))
                .slice(0, 5);

              // Dress-outfit shoe position. Dress box ends at y=408 (top:88 + height:320).
              // 418 = 10px gap below dress hem. LOCKED.
              const DRESS_SHOES_TOP = 418;

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
                  {dress ? (
                    <Animated.View style={[
                      moodBoardStyles.hangerSlotDress,
                      {
                        opacity: hangerCentreAnim,
                        transform: [{ translateY: hangerCentreAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
                      },
                    ]}>
                      {dress.photoUri ? (
                        <Image source={{ uri: dress.photoUri }} resizeMode="contain" style={moodBoardStyles.hangerImageDress} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[dress.category] || '#E8E0D5' }]} />
                      )}
                    </Animated.View>
                  ) : top ? (
                    <Animated.View style={[
                      moodBoardStyles.hangerSlotTop,
                      {
                        opacity: hangerCentreAnim,
                        transform: [{ translateY: hangerCentreAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
                      },
                    ]}>
                      {top.photoUri ? (
                        <Image source={{ uri: top.photoUri }} resizeMode="contain" style={moodBoardStyles.hangerImage} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[top.category] || '#E8E0D5' }]} />
                      )}
                    </Animated.View>
                  ) : null}
                  {pants && (
                    <Animated.View style={[
                      moodBoardStyles.hangerSlotPants,
                      {
                        opacity: hangerPantsAnim,
                        transform: [{ translateY: hangerPantsAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
                      },
                    ]}>
                      {pants.photoUri ? (
                        <Image source={{ uri: pants.photoUri }} resizeMode="contain" style={moodBoardStyles.hangerImage} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[pants.category] || '#E8E0D5' }]} />
                      )}
                    </Animated.View>
                  )}
                  {shoes && (
                    <Animated.View style={[
                      moodBoardStyles.hangerSlotShoes,
                      dress && { top: DRESS_SHOES_TOP },
                      {
                        opacity: hangerShoesAnim,
                        transform: [{ translateY: hangerShoesAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
                      },
                    ]}>
                      {shoes.photoUri ? (
                        <Image source={{ uri: shoes.photoUri }} resizeMode="contain" style={moodBoardStyles.hangerImage} />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: MOOD_PLACEHOLDER_COLORS[shoes.category] || '#E8E0D5' }]} />
                      )}
                    </Animated.View>
                  )}

                  {/* Left side card — light outerwear (heavy is silently dropped in categorisation).
                      Hidden when outerwear got promoted to centre top slot for a headless outfit. */}
                  {sideOuter && (
                    <Animated.View style={[
                      moodBoardStyles.hangerLightOuterCard,
                      {
                        opacity: hangerSideAnim,
                        transform: [
                          { rotate: '-4deg' },
                          { translateY: hangerSideAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) },
                        ],
                      },
                    ]}>
                      <View style={moodBoardStyles.hangerLightOuterClip} />
                      <View style={moodBoardStyles.hangerLightOuterInner}>
                        {sideOuter.photoUri ? (
                          <Image source={{ uri: sideOuter.photoUri }} resizeMode="contain" style={moodBoardStyles.hangerSideImage} />
                        ) : (
                          <View style={[moodBoardStyles.hangerSideImage, { backgroundColor: MOOD_PLACEHOLDER_COLORS[sideOuter.category] || '#E8E0D5' }]} />
                        )}
                      </View>
                    </Animated.View>
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
                      <Animated.View
                        key={acc.id || ('acc-' + i)}
                        style={[
                          moodBoardStyles.hangerAccCard,
                          {
                            top: pos.top,
                            opacity: hangerSideAnim,
                            transform: [
                              { rotate: pos.rot },
                              { translateY: hangerSideAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) },
                            ],
                          },
                        ]}
                      >
                        <View style={moodBoardStyles.hangerAccClip} />
                        <View style={moodBoardStyles.hangerAccInner}>
                          {acc.photoUri ? (
                            <Image source={{ uri: acc.photoUri }} resizeMode="contain" style={moodBoardStyles.hangerAccImage} />
                          ) : (
                            <View style={[moodBoardStyles.hangerAccImage, { backgroundColor: MOOD_PLACEHOLDER_COLORS[acc.category] || '#E8E0D5' }]} />
                          )}
                        </View>
                      </Animated.View>
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

          {/* Session 12 S4: KAV wraps the ScrollView so the keyboard doesn't cover
              the search input. keyboardShouldPersistTaps lets X-close (and S5 chips)
              tap through when the keyboard is open. Mirrors Session 8 pattern. */}
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={savedStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Session 12 S3: Heading row pairs "Saved Outfits" with the Search button. */}
            <View style={savedStyles.headingRow}>
              <Text style={savedStyles.heading}>Saved Outfits</Text>
              {savedOutfits.length > 0 && (
                <TouchableOpacity
                  style={[
                    wardrobeStyles.searchButton,
                    searchVisible && wardrobeStyles.searchButtonActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSearchVisible((v) => !v)}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle
                      cx={11}
                      cy={11}
                      r={7}
                      stroke={searchVisible ? '#6B7E65' : '#5C4A3A'}
                      strokeWidth={1.8}
                    />
                    <Line
                      x1={20}
                      y1={20}
                      x2={16.65}
                      y2={16.65}
                      stroke={searchVisible ? '#6B7E65' : '#5C4A3A'}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <Text
                    style={[
                      wardrobeStyles.searchButtonText,
                      searchVisible && wardrobeStyles.searchButtonTextActive,
                    ]}
                  >
                    Search
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Session 12 S4: Search bar (revealed when searchVisible is true). */}
            {searchVisible && (
              <View style={wardrobeStyles.searchBarRow}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx={11} cy={11} r={7} stroke="#5C4A3A" strokeWidth={1.8} />
                  <Line
                    x1={20}
                    y1={20}
                    x2={16.65}
                    y2={16.65}
                    stroke="#5C4A3A"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  />
                </Svg>
                <TextInput
                  style={wardrobeStyles.searchBarInput}
                  placeholder="Search your outfits..."
                  placeholderTextColor="rgba(44,26,14,0.65)"
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                <TouchableOpacity
                  onPress={() => {
                    setSearchVisible(false);
                    setSearchText('');
                    setSelectedOccasion('All');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Line x1={6} y1={6} x2={18} y2={18} stroke="#5C4A3A" strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1={18} y1={6} x2={6} y2={18} stroke="#5C4A3A" strokeWidth={1.8} strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
            )}

            {/* Session 12 S5: Occasion chips (horizontal scroll, gated on searchVisible). */}
            {searchVisible && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={wardrobeStyles.chipsScroll}
                contentContainerStyle={wardrobeStyles.chipsScrollContent}
              >
                {OCCASION_CHIPS.map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      wardrobeStyles.categoryChip,
                      selectedOccasion === label && wardrobeStyles.categoryChipActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedOccasion(label)}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text
                      style={[
                        wardrobeStyles.categoryChipText,
                        selectedOccasion === label && wardrobeStyles.categoryChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

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

            {/* Session 12 S6: Result count line — only when filter active. */}
            {showResultCount && (
              <Text style={wardrobeStyles.searchResultsCount}>{resultCountText}</Text>
            )}

            {/* Session 12 S6: Empty search results — when filter active and zero match. */}
            {/* Session 13A: Added subtext line below the existing "No outfits found". */}
            {showFilteredEmpty && (
              <>
                <Text style={savedStyles.emptySearchResults}>No outfits found</Text>
                <Text style={savedStyles.emptySearchSubtext}>Try a different name or occasion</Text>
              </>
            )}

            {/* Saved outfits list — filtered or full */}
            {savedOutfits.length > 0 && !showFilteredEmpty && (
              <>
                {/* Hide "N saved looks" + hint when filter is active — result count line above already communicates the relevant number */}
                {!showResultCount && (
                  <>
                    <Text style={savedStyles.countText}>{savedOutfits.length} saved look{savedOutfits.length !== 1 ? 's' : ''}</Text>
                    <Text style={savedStyles.hintText}>Tap an outfit to see the mood board</Text>
                  </>
                )}

                {filteredSavedOutfits.map((outfit) => (
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
                              {item.photoUri ? (
                                <Image source={{ uri: item.photoUri }} resizeMode="contain" style={savedStyles.photoStripThumbImage} />
                              ) : (
                                <Text style={{ fontSize: 20 }}>{getCategoryEmoji(item.category)}</Text>
                              )}
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
                            <Text style={savedStyles.chipText}>{item.name}</Text>
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
          </KeyboardAvoidingView>

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
                      // Session 12: persist { saved: false } to DB so the unsave survives reload.
                      // Find the outfit object before filtering so the closure has it for the persist call.
                      const outfitToRemove = savedOutfits.find((o) => o.id === confirmRemoveId);
                      setSavedOutfits((prev) => prev.filter((o) => o.id !== confirmRemoveId));
                      if (outfitToRemove && onPersistInteraction) {
                        onPersistInteraction(outfitToRemove, { saved: false });
                      }
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

    {/* Session 20: Your Week bottom sheet (S4 shell only — dot row + day cards in S5/S6).
        Reuses pinSheetStyles for modal/handle/header/close — Session 11 cross-tab precedent. */}
    <Modal
      transparent
      visible={weekSheetVisible}
      animationType="slide"
      onRequestClose={() => setWeekSheetVisible(false)}
    >
      <View style={pinSheetStyles.modalRoot}>
        <Pressable style={pinSheetStyles.backdrop} onPress={() => setWeekSheetVisible(false)} />
        <View style={pinSheetStyles.sheet}>
          {/* Handle bar */}
          <View style={pinSheetStyles.handleBar} />

          {/* Header row */}
          <View style={pinSheetStyles.headerRow}>
            <Text style={pinSheetStyles.headerTitle}>Your Week</Text>
            <TouchableOpacity
              style={pinSheetStyles.closeButton}
              activeOpacity={0.7}
              onPress={() => setWeekSheetVisible(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={pinSheetStyles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Date range subtitle */}
          <Text style={weekSheetStyles.dateRangeSubtitle}>{formatWeekRange(getMondayOfWeek(new Date()))}</Text>

          {/* Session 20 S5: Week dot row — Mon→Sun in LOCAL time. Dots all hollow at S5;
              terracotta fills land in S6 once we derive wornByDay from wornOutfits. */}
          <View style={weekSheetStyles.dotRow}>
            {buildWeekDays(getMondayOfWeek(new Date())).map((dayDate, idx) => {
              const dayYMD = toLocalYMD(dayDate);
              const isSelected = dayYMD === selectedDay;
              return (
                <TouchableOpacity
                  key={dayYMD}
                  style={weekSheetStyles.dayColumn}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDay(dayYMD)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  accessibilityRole="button"
                  accessibilityLabel={`${dayDate.toLocaleString('en-US', { weekday: 'long' })} ${dayDate.getDate()}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={weekSheetStyles.dayLabel}>{WEEK_DAY_LABELS[idx]}</Text>
                  <View style={[weekSheetStyles.dateNumberCircle, isSelected && weekSheetStyles.dateNumberCircleSelected]}>
                    <Text style={weekSheetStyles.dateNumber}>{dayDate.getDate()}</Text>
                  </View>
                  <View style={[weekSheetStyles.dot, wornByDay.has(dayYMD) ? weekSheetStyles.dotFilled : weekSheetStyles.dotHollow]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Session 20 S6: Day-content cards. Renders nothing on empty days
              (no "nothing worn" message per Grace's directive — hollow dot is enough). */}
          <ScrollView
            style={weekSheetStyles.dayCardsScroll}
            contentContainerStyle={weekSheetStyles.dayCardsContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedDayOutfits.length === 0 && (
              <Text style={weekSheetStyles.dayEmptyMessage}>No outfit logged</Text>
            )}
            {selectedDayOutfits.map((outfit) => (
              <View key={outfit.id} style={weekSheetStyles.dayCard}>
                <Text style={weekSheetStyles.dayCardVibe}>{outfit.vibe}</Text>
                <Text style={weekSheetStyles.dayCardName} numberOfLines={2}>{outfit.name}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={weekSheetStyles.dayCardThumbsRow}
                  contentContainerStyle={weekSheetStyles.dayCardThumbsContent}
                >
                  {(outfit.items || []).map((item) => (
                    <View key={item.id} style={weekSheetStyles.dayCardThumb}>
                      {item.photoUri ? (
                        <Image
                          source={{ uri: item.photoUri }}
                          style={weekSheetStyles.dayCardThumbImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Offscreen share card — captured by react-native-view-shot when user taps Share Outfit */}
    <ShareCard outfit={outfitToShare} shotRef={shareShotRef} />
    </>
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
  // Session 12 S3: Row containing the "Saved Outfits" heading + Search button.
  // marginBottom migrated here from the heading style so spacing below the row
  // matches the prior spacing below the standalone heading (no layout shift).
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#2C1A0E',
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
  // Session 12 S6: Empty state when search filter returns zero results.
  // Distinct from emptyState (no saved outfits at all) — this one is the
  // "you have saved outfits but none match your filter" case.
  // Session 13A: marginBottom dropped 20 → 4 so the new subtext sits close.
  emptySearchResults: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#A09888',
    textAlign: 'center',
    paddingTop: 40,
    marginBottom: 4,
  },
  // Session 13A: Subtext below "No outfits found".
  emptySearchSubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A09888',
    textAlign: 'center',
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
    overflow: 'hidden',
  },
  photoStripThumbImage: {
    width: '100%',
    height: '100%',
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
    top: 455,
    left: '50%',
    marginLeft: -62.5,
    width: 125,
    height: 95,
    overflow: 'hidden',
    zIndex: 3,
  },
  hangerImage: {
    width: '100%',
    height: '100%',
  },
  // Dress slot — taller box for dress outfits (no pants). Uses flex-start + shorter
  // Image height together to pin the photo to the top under the hanger. Neither
  // alone works — Image resizeMode="contain" centers within Image bounds, so the
  // Image height must be < container height for flex-start to anchor anything.
  hangerSlotDress: {
    position: 'absolute',
    top: 88,
    left: '50%',
    marginLeft: -92.5,
    width: 185,
    height: 320,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    zIndex: 4,
  },
  hangerImageDress: {
    width: '100%',
    height: '88%',
  },
  // Left side card — light outerwear
  hangerLightOuterCard: {
    position: 'absolute',
    top: 120,
    left: 14,
    width: 110,
    height: 130,
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
    'Up to 50 items in your closet',
    '12 styling sessions every week',
    'Add your clothes — Clozie fills in the details',
    'Pin one item — Clozie builds around it',
    '3 fresh outfit ideas every session',
    'Rate your looks — Clozie takes note',
    'Mood board for every outfit',
    'Save your favorite looks',
    'Share outfit cards',
    'Log what you wore — track your week',
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
function SettingsScreen({ onClose, onSignOut, onRevokeConsent, onClearMemory }) {
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
  const [clearFlash, setClearFlash] = useState(false);
  const [clearError, setClearError] = useState('');
  const [showRevokeConsentModal, setShowRevokeConsentModal] = useState(false);
  const [revokeFlash, setRevokeFlash] = useState(false);

  // 1.5s inline "Consent revoked" flash after Yes-revoke. Cleanup clears the
  // timer if SettingsScreen unmounts mid-flash (user closes Settings).
  useEffect(() => {
    if (!revokeFlash) return;
    const t = setTimeout(() => setRevokeFlash(false), 1500);
    return () => clearTimeout(t);
  }, [revokeFlash]);

  // 1.5s inline "Memory cleared" flash after Yes-reset success. Cleanup pattern
  // mirrors revokeFlash above — unmount during the timer cancels safely.
  useEffect(() => {
    if (!clearFlash) return;
    const t = setTimeout(() => setClearFlash(false), 1500);
    return () => clearTimeout(t);
  }, [clearFlash]);

  // 4s inline error auto-dismiss after a failed Clear Memory. Slightly longer
  // than the success flash because a failure message takes longer to read.
  useEffect(() => {
    if (!clearError) return;
    const t = setTimeout(() => setClearError(''), 4000);
    return () => clearTimeout(t);
  }, [clearError]);

  const handleClearMemory = () => {
    setShowClearMemoryModal(true);
  };

  // Session 19A — Phase 2 stub replaced with real wiring. Closes modal first
  // for snappy feel, then awaits the parent-supplied helper. On success: 1.5s
  // inline flash. On failure: terracotta inline error (4s auto-dismiss),
  // "Clear" link stays visible for retry.
  const confirmClearMemory = async () => {
    setShowClearMemoryModal(false);
    setClearError(''); // clear any stale error before retry
    try {
      await onClearMemory();
      setClearFlash(true);
    } catch {
      setClearError('Something went wrong — please try again.');
    }
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            {clearFlash ? (
              <Text style={{ color: '#5C4A3A', fontFamily: 'Outfit_500Medium', fontSize: 14 }}>
                Memory cleared
              </Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClearMemory}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={settingsStyles.goldLink}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {clearError ? (
            <Text style={{
              color: 'rgba(164,74,52,0.88)',
              fontFamily: 'Outfit_400Regular',
              fontSize: 13,
              marginTop: 4,
              paddingHorizontal: 4,
            }}>
              {clearError}
            </Text>
          ) : null}

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

          {/* Divider */}
          <View style={settingsStyles.divider} />

          {/* Styling Permissions — Apple 5.1.2(i) revocable consent */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Styling Permissions</Text>
              <Text style={settingsStyles.cardRowValue}>Manage your consent for Clozie styling</Text>
            </View>
            {revokeFlash ? (
              <Text style={{ color: '#5C4A3A', fontFamily: 'Outfit_500Medium', fontSize: 14 }}>
                Consent revoked
              </Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowRevokeConsentModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={settingsStyles.goldLink}>Revoke</Text>
              </TouchableOpacity>
            )}
          </View>
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

        {/* LEGAL card */}
        <View style={settingsStyles.card}>
          {/* Privacy Policy */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Privacy Policy</Text>
              <Text style={settingsStyles.cardRowValue}>How we handle your data</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={settingsStyles.goldLink}>View</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={settingsStyles.divider} />

          {/* Terms of Service */}
          <View style={settingsStyles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={settingsStyles.cardRowLabel}>Terms of Service</Text>
              <Text style={settingsStyles.cardRowValue}>How Clozie works for you</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL).catch(() => {})}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={settingsStyles.goldLink}>View</Text>
            </TouchableOpacity>
          </View>
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
      </KeyboardAvoidingView>

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
              This will reset everything Clozie has learned about your taste — including saved outfits and ratings. Your wardrobe items stay safe.
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

      {/* Revoke Styling Permissions confirm modal — Apple 5.1.2(i) */}
      <Modal
        visible={showRevokeConsentModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRevokeConsentModal(false)}
      >
        <View style={savedStyles.confirmOverlay}>
          <View style={savedStyles.confirmModal}>
            <Text style={savedStyles.confirmHeading}>Revoke Styling Permissions?</Text>
            <Text style={savedStyles.confirmBody}>
              This will require you to re-accept before Clozie can generate outfits. Continue?
            </Text>
            <View style={savedStyles.confirmPrimaryRing}>
              <TouchableOpacity
                style={savedStyles.confirmPrimaryButton}
                activeOpacity={0.8}
                onPress={() => {
                  setShowRevokeConsentModal(false);
                  onRevokeConsent();
                  setRevokeFlash(true);
                }}
              >
                <Text style={savedStyles.confirmPrimaryButtonText}>Yes, revoke</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={savedStyles.confirmCancelButton}
              activeOpacity={0.7}
              onPress={() => setShowRevokeConsentModal(false)}
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        </KeyboardAvoidingView>
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

function TabHangerIcon({ active, size = 20, color, strokeWidth, viewBox = '0 0 24 24' }) {
  const resolvedStroke = color ?? (active ? '#A44A34' : 'rgba(44,26,14,0.28)');
  const resolvedWidth = strokeWidth ?? (active ? 1.9 : 1.6);
  return (
    <Svg width={size} height={size} viewBox={viewBox} fill="none">
      <Path
        d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0v3L3.5 13.5A1.5 1.5 0 0 0 4.5 16h15a1.5 1.5 0 0 0 1-2.5L12 7"
        stroke={resolvedStroke}
        strokeWidth={resolvedWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Session 13H — empty-state hanger split into two paths for stagger-draw animation.
// TabHangerIcon above stays untouched — this is a parallel component scoped to the
// My Closet empty state only. Step 1.2 adds the stroke-dashoffset draw animation.
const AnimatedPath = Animated.createAnimatedComponent(Path);

function AnimatedEmptyStateHanger({ size = 80, color = '#BCC7B7', strokeWidth = 1.6, viewBox = '-2 -2 28 28' }) {
  // strokeDashoffset = 100 → invisible; → 0 = fully drawn.
  // Hardcoded 100 is safely larger than both path lengths (hook ~12, bar ~44).
  const hookOffset = useRef(new Animated.Value(100)).current;
  const barOffset = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Hook draws first (400ms), then bar follows (1100ms). Total ~1.5s.
    // useNativeDriver: false because SVG stroke props aren't supported on native driver.
    Animated.sequence([
      Animated.timing(hookOffset, { toValue: 0, duration: 400, useNativeDriver: false }),
      Animated.timing(barOffset, { toValue: 0, duration: 1100, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Svg width={size} height={size} viewBox={viewBox} fill="none">
      {/* Hook — closed circle at top */}
      <AnimatedPath
        d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={hookOffset}
      />
      {/* Stem + bar — vertical line down from hook, then the triangular hanger */}
      <AnimatedPath
        d="M12 4v3L3.5 13.5A1.5 1.5 0 0 0 4.5 16h15a1.5 1.5 0 0 0 1-2.5L12 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={barOffset}
      />
    </Svg>
  );
}

// Session 13H Phase 3 — fades in heading + subtext + button after the hanger draw
// completes. Mounts/unmounts with the empty state (same gate as AnimatedEmptyStateHanger),
// so the animation replays whenever the user returns to an empty closet.
function AnimatedEmptyStateText({ children }) {
  const textAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(textAnim, {
      toValue: 1,
      duration: 500,
      delay: 1500, // start after hanger draw completes (400ms hook + 1100ms bar)
      useNativeDriver: true,
    }).start();
  }, []);
  const translateY = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  return (
    <Animated.View
      style={{
        width: '100%',
        alignItems: 'center',
        opacity: textAnim,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
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

// ── AI Consent Modal — Apple Guideline 5.1.2(i) ─────────────────────────────
// One-time modal before first outfit generation. Names Anthropic explicitly per
// Apple compliance — this is a documented legal exception to the "never say AI"
// rule (the rule applies elsewhere in the app, not here).
function ConsentModal({ visible, onAccept, onDecline }) {
  const openPrivacyLink = () => {
    Linking.openURL('https://www.anthropic.com/privacy').catch(() => {});
  };
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDecline}
    >
      <View style={consentStyles.backdrop}>
        <View style={consentStyles.card}>
          <Text style={consentStyles.title}>Before Clozie styles you</Text>
          <Text style={consentStyles.body}>
            Clozie uses Anthropic to create outfit suggestions from your wardrobe details and style preferences. Learn more about how Anthropic handles data at{' '}
            <Text style={consentStyles.link} onPress={openPrivacyLink}>
              anthropic.com/privacy
            </Text>
            .
          </Text>
          <TouchableOpacity
            style={consentStyles.acceptButton}
            activeOpacity={0.8}
            onPress={onAccept}
          >
            <Text style={consentStyles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={consentStyles.declineButton}
            activeOpacity={0.7}
            onPress={onDecline}
          >
            <Text style={consentStyles.declineButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main App Screen — 4 bottom tabs ─────────────────────────────────────────
function MainAppScreen({ onSignOut, initialTab = 0 }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  // Generation status drives Your Looks: 'idle' | 'loading' | 'success' | 'error'
  const [generationStatus, setGenerationStatus] = useState('idle');
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [generationError, setGenerationError] = useState('');
  // 9F-B: Circuit-breaker — set true when Edge Function returns recoveryMode=true.
  // Drives the recovery banner in YourLooksTab (wired in 9F-E).
  const [generationRecoveryMode, setGenerationRecoveryMode] = useState(false);
  // Session 16B: count of styling sessions used in the rolling 7-day window.
  // Set from generate-outfits response on success. Drives the 9-of-12 / 11-of-12
  // nudges on Your Looks (Step 5). null = unknown (no generation yet this app open).
  const [sessionsUsedThisWeek, setSessionsUsedThisWeek] = useState(null);
  // Last payload sent to handleGenerate — enables Regenerate button to re-fire same vibe.
  const [lastPayload, setLastPayload] = useState(null);
  // Session 12: lifted from YourLooksTab to survive tab switches + reload (S1b loads from DB).
  // Shape: SavedOutfit[] — each entry is the full outfit object with items: WardrobeItem[].
  const [savedOutfits, setSavedOutfits] = useState([]);
  // Session 20: outfits the user has marked worn at least once. Drives the
  // "Your Week" calendar pill on Your Looks. Shape mirrors savedOutfits —
  // each entry has wornDates: string[] (ISO timestamps) + items: WardrobeItem[].
  const [wornOutfits, setWornOutfits] = useState([]);
  // AI consent state (Apple Guideline 5.1.2i) — read on mount from user_metadata.ai_consent_given.
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentLoaded, setConsentLoaded] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  // Session 16B: VIP status — fresh check on every login, no caching across sessions.
  // Drives bypass of all wardrobe + session limits and nudges. Defaults false (fail-safe).
  const [isVip, setIsVip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Session 12 S1b: ref-tracked wardrobeItems so the savedOutfits load useEffect
  // can read the current value without including wardrobeItems in its deps.
  const wardrobeItemsRef = useRef([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Session 12 S1b: keep wardrobeItemsRef in sync so the savedOutfits DB load
  // can hydrate against the latest wardrobeItems without being in its deps.
  useEffect(() => {
    wardrobeItemsRef.current = wardrobeItems;
  }, [wardrobeItems]);

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      try {
        const items = await fetchWardrobeItems();
        const itemsWithUrls = await Promise.all(
          items.map(async (item) => {
            if (!item.photoPath) return { ...item, photoUri: null };
            try {
              const photoUri = await getSignedPhotoUrl(item.photoPath);
              return { ...item, photoUri };
            } catch {
              return { ...item, photoUri: null };
            }
          })
        );
        if (!cancelled) setWardrobeItems(itemsWithUrls);
      } catch (err) {
        console.warn('Failed to load wardrobe items:', err?.message);
      }
    };

    loadItems();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !cancelled) {
        setWardrobeItems([]);
        setSavedOutfits([]); // Session 12 S1b: also reset saved outfits on sign-out
        setWornOutfits([]); // Session 20: also reset worn outfits on sign-out
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  // Session 16B: VIP status check. Reads vip_emails table on mount + auth changes.
  // RLS scopes the SELECT to the user's own email (auth.jwt() ->> 'email') so a row
  // returned = VIP; null = non-VIP. Fail-safe to false on any error or missing email.
  useEffect(() => {
    let cancelled = false;

    const checkVipStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;
        if (!email) {
          if (!cancelled) setIsVip(false);
          return;
        }
        const { data, error } = await supabase
          .from('vip_emails')
          .select('email')
          .eq('email', email)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.warn('[VIP check] query error:', error.message);
          setIsVip(false);
          return;
        }
        const vip = data !== null;
        setIsVip(vip);
        console.log('[VIP check]', { isVip: vip });
      } catch (err) {
        if (!cancelled) {
          console.warn('[VIP check] failed:', err?.message);
          setIsVip(false);
        }
      }
    };

    checkVipStatus();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        setIsVip(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        checkVipStatus();
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  // Session 12 S1b: Load saved outfits from outfit_history on mount.
  // fetchSavedOutfits returns rows with itemIds: string[] (the snapshot of which
  // items were in the outfit when saved). Items get resolved against the current
  // wardrobeItems via wardrobeItemsRef. The hydration effect below re-resolves
  // when wardrobeItems changes.
  useEffect(() => {
    let cancelled = false;
    const loadSaved = async () => {
      try {
        const rows = await fetchSavedOutfits();
        if (cancelled) return;
        const byId = new Map(wardrobeItemsRef.current.map((i) => [i.id, i]));
        const dbHydrated = rows.map((row) => ({
          ...row,
          items: (row.itemIds || []).map((id) => byId.get(id)).filter(Boolean),
        }));
        // Merge-by-id: preserve any local-only entries added via toggleSave during
        // the brief load window (their DB write may not have propagated yet).
        // For matching IDs, DB version wins (authoritative).
        setSavedOutfits((prev) => {
          const dbIds = new Set(dbHydrated.map((o) => o.id));
          const localOnly = prev.filter((o) => !dbIds.has(o.id));
          return [...localOnly, ...dbHydrated];
        });
      } catch (err) {
        console.warn('[savedOutfits] load failed:', err?.message);
      }
    };
    loadSaved();
    return () => { cancelled = true; };
  }, []);

  // Session 12 S1b: Re-hydrate saved outfit items whenever wardrobeItems changes.
  // Source of truth for an outfit's membership is its itemIds (snapshot at save
  // time). The items array is the rendered display layer, resolved against the
  // current wardrobeItems. Deleted wardrobe items silently drop from items.
  useEffect(() => {
    setSavedOutfits((prev) => {
      if (!prev || prev.length === 0) return prev;
      const byId = new Map(wardrobeItems.map((i) => [i.id, i]));
      return prev.map((outfit) => {
        const ids = Array.isArray(outfit.itemIds) ? outfit.itemIds : [];
        const items = ids.map((id) => byId.get(id)).filter(Boolean);
        return { ...outfit, items };
      });
    });
  }, [wardrobeItems]);

  // Session 20: Load worn outfits from outfit_history on mount.
  // Mirrors the savedOutfits load above — fetchWornOutfits returns rows with
  // wornDates: string[] (the snapshot of ISO wear timestamps). Items get
  // resolved against the current wardrobeItems via wardrobeItemsRef. The
  // hydration effect below re-resolves when wardrobeItems changes.
  useEffect(() => {
    let cancelled = false;
    const loadWorn = async () => {
      try {
        const rows = await fetchWornOutfits();
        if (cancelled) return;
        const byId = new Map(wardrobeItemsRef.current.map((i) => [i.id, i]));
        const dbHydrated = rows.map((row) => ({
          ...row,
          items: (row.itemIds || []).map((id) => byId.get(id)).filter(Boolean),
        }));
        // Merge-by-id: preserve any local-only entries added via optimistic
        // wear update (Session 20 S8) during the brief load window. For
        // matching IDs, DB version wins (authoritative).
        setWornOutfits((prev) => {
          const dbIds = new Set(dbHydrated.map((o) => o.id));
          const localOnly = prev.filter((o) => !dbIds.has(o.id));
          return [...localOnly, ...dbHydrated];
        });
      } catch (err) {
        console.warn('[wornOutfits] load failed:', err?.message);
      }
    };
    loadWorn();
    return () => { cancelled = true; };
  }, []);

  // Session 20: Re-hydrate worn outfit items whenever wardrobeItems changes.
  // Same pattern as the savedOutfits re-hydration above. Deleted wardrobe
  // items silently drop from items; edited photos surface fresh photoUri.
  useEffect(() => {
    setWornOutfits((prev) => {
      if (!prev || prev.length === 0) return prev;
      const byId = new Map(wardrobeItems.map((i) => [i.id, i]));
      return prev.map((outfit) => {
        const ids = Array.isArray(outfit.itemIds) ? outfit.itemIds : [];
        const items = ids.map((id) => byId.get(id)).filter(Boolean);
        return { ...outfit, items };
      });
    });
  }, [wardrobeItems]);

  // Load AI consent flag from auth.user_metadata on mount.
  // consentLoaded becomes true after initial read (success or failure) so the
  // modal trigger in handleGenerate doesn't fire during the load window.
  useEffect(() => {
    let cancelled = false;
    const loadConsent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        const given = user?.user_metadata?.ai_consent_given === true;
        setConsentGiven(given);
        setConsentLoaded(true);
      } catch {
        if (!cancelled) setConsentLoaded(true);
      }
    };
    loadConsent();
    return () => { cancelled = true; };
  }, []);

  // Called from Today's Vibe → switches to Your Looks → calls Edge Function →
  // resolves item IDs to full WardrobeItem objects → drives YourLooksTab via lifted state.
  const handleGenerate = async (payload, { skipConsentCheck = false } = {}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // AI consent check (Apple Guideline 5.1.2i) — show modal before first generation.
    // Gated on consentLoaded so we don't trigger the modal during the initial-load window.
    // skipConsentCheck=true when called from handleAcceptConsent right after consent was saved
    // (React setState is async — the closure here still sees the old consentGiven value).
    if (!skipConsentCheck && consentLoaded && !consentGiven) {
      setPendingPayload(payload);
      setShowConsentModal(true);
      return;
    }
    if (generationStatus === 'loading') return; // spam-tap guard

    // Capture currently-shown outfits BEFORE state resets so Sonnet can vary from them
    // on regenerate. Empty on first Generate of a session. Edge Function omits the
    // JUST SHOWN block when this array is empty (Session 18).
    const currentOutfits = (generatedOutfits || []).map((o) => ({
      name: o.name || '',
      vibe: o.vibe || '',
      itemIds: (o.items || []).map((i) => i?.id).filter(Boolean),
    }));

    setLastPayload(payload);
    setGenerationStatus('loading');
    setGenerationError('');
    setGeneratedOutfits([]);
    setGenerationRecoveryMode(false); // 9F-B: clear stale value before new generation
    setSessionsUsedThisWeek(null); // Session 16B: clear stale value before new generation
    setActiveTab(3);

    // Read style profile from auth.user_metadata (same shape as StyleDNATab saves it)
    let styleProfile = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const meta = user?.user_metadata || {};
      styleProfile = {
        styles: Array.isArray(meta.styles) ? meta.styles : [],
        colours: Array.isArray(meta.colours) ? meta.colours : [],
        neverWear: typeof meta.never_wear === 'string' ? meta.never_wear : '',
      };
    } catch {
      // Continue without style profile.
    }

    try {
      const response = await generateOutfits({ ...payload, styleProfile, currentOutfits });
      const itemsById = new Map(wardrobeItems.map((i) => [i.id, i]));
      const resolved = (response.outfits || []).map((o) => ({
        ...o,
        items: (Array.isArray(o.items) ? o.items : [])
          .map((id) => itemsById.get(id))
          .filter(Boolean),
      }));
      setGeneratedOutfits(resolved);
      setGenerationRecoveryMode(response.recoveryMode === true); // 9F-B
      // Session 16B: capture session counter. Edge Function returns post-insert count
      // (so 12 = "12 used this week, including this one"). null-safe — if Edge Function
      // is on an old deploy that doesn't return this field, we skip the nudge.
      setSessionsUsedThisWeek(
        typeof response.sessionsUsedThisWeek === 'number' ? response.sessionsUsedThisWeek : null
      );
      // Session 16B: sanity-check server VIP status against client check. Log only —
      // client-side isVip remains the source of truth for UI bypass.
      if (typeof response.isVip === 'boolean' && response.isVip !== isVip) {
        console.warn('[VIP mismatch] client isVip:', isVip, 'server isVip:', response.isVip);
      }
      setGenerationStatus('success');
    } catch (err) {
      let warm;
      if (isNetworkError(err)) {
        warm = 'Clozie needs a connection to style you. Check your connection and try again.';
      } else {
        const code = err?.code;
        if (code === 'not_enough_items') {
          warm = 'Add at least 5 items to your wardrobe for Clozie to style you.';
        } else if (code === 'missing_essentials') {
          warm = 'Add at least one top and one bottom (or a dress) so Clozie can style you.';
        } else if (code === 'invalid_pin') {
          warm = "That pinned item isn't available to style — pick another.";
        } else if (code === 'session_limit_reached') {
          // Session 16B: server-side gate fired (non-VIP at 12 sessions in 7-day window).
          warm = "You've used all 12 styling sessions this week. Your earliest session refreshes soon.";
        } else {
          warm = "Couldn't generate outfits — please try again";
        }
      }
      setGenerationError(warm);
      setGenerationStatus('error');
    }
  };

  // Regenerate — re-fire handleGenerate with the same payload from the previous run.
  // Defensive no-op if no prior payload exists (button should not render in that state).
  const handleRegenerate = () => {
    if (!lastPayload) return;
    handleGenerate(lastPayload);
  };

  // Fire-and-forget persistence for outfit interactions (rating, save, wear).
  // Curries the generation context (lastPayload) away so callers pass only outfit + patch.
  // Errors logged but never surfaced — local UI is the source of truth for this session.
  const handlePersistInteraction = (outfit, patch) => {
    upsertOutfitInteraction(outfit, lastPayload, patch).catch((err) => {
      console.warn('[outfit_history] persist failed:', err?.message);
    });
  };

  // Fire-and-forget wardrobe wear counter bumps. Updates last_worn + times_worn
  // in Supabase, then optimistically refreshes local wardrobeItems.lastWorn so
  // My Closet cards surface "Last worn: today" without needing an app reload.
  const handleMarkItemsWorn = (itemIds) => {
    markItemsWorn(itemIds)
      .then(() => {
        const now = new Date().toISOString();
        setWardrobeItems((prev) =>
          prev.map((item) =>
            itemIds.includes(item.id) ? { ...item, lastWorn: now } : item
          )
        );
      })
      .catch((err) => {
        console.warn('[outfit_history] mark items worn failed:', err?.message);
      });
  };

  // Accept handler — saves consent to user_metadata, flips local state, resumes generation.
  // Disclosure already made the moment the modal appeared (Apple 5.1.2i compliance).
  // Save is best-effort; local state flips regardless so the user isn't blocked by a network blip.
  const handleAcceptConsent = async () => {
    const stash = pendingPayload;
    setPendingPayload(null);
    setShowConsentModal(false);
    setConsentGiven(true);
    try {
      await supabase.auth.updateUser({ data: { ai_consent_given: true } });
    } catch {
      // Best-effort save — if it fails, local state still flipped for this session.
      // Modal will re-appear next session if persistence didn't land.
    }
    if (stash) handleGenerate(stash, { skipConsentCheck: true });
  };

  // Decline handler — closes modal, clears pending payload, no save, no generation.
  const handleDeclineConsent = () => {
    setPendingPayload(null);
    setShowConsentModal(false);
  };

  // Revoke handler — Apple 5.1.2(i) requires consent be revocable. Optimistic flip
  // (mirrors handleAcceptConsent pattern); next Generate tap re-triggers ConsentModal.
  const handleRevokeConsent = async () => {
    setConsentGiven(false);
    try {
      await supabase.auth.updateUser({ data: { ai_consent_given: false } });
    } catch {
      // Best-effort save — local state flipped regardless, same pattern as handleAcceptConsent.
    }
  };

  // Session 19A — wipes outfit_history (ratings + saved + worn dates),
  // resets wardrobe_items wear counters, deletes session_log rows. Wardrobe
  // items, style profile, and ai_consent_given are NOT touched. Throws on any
  // Supabase failure so SettingsScreen can show a warm terracotta error.
  // Local state reset is intentionally only on success — if the DB writes fail,
  // local state stays consistent with DB and the user can retry.
  const handleClearMemory = async () => {
    await clearClozieMemory();
    setWardrobeItems((prev) => prev.map((item) => ({ ...item, lastWorn: null })));
    setSavedOutfits([]);
    setWornOutfits([]); // Session 20: clearClozieMemory deletes outfit_history rows, including wear logs
    setGeneratedOutfits([]);
    setGenerationStatus('idle');
    setGenerationError('');
    setSessionsUsedThisWeek(0);
    setLastPayload(null);
  };

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
      {activeTab === 1 && <WardrobeTab items={wardrobeItems} setItems={setWardrobeItems} onGoToVibe={() => setActiveTab(2)} isVip={isVip} />}
      {activeTab === 2 && <TodaysVibeTab wardrobeItemCount={wardrobeItems.length} wardrobeItems={wardrobeItems} onGenerate={handleGenerate} onGoToCloset={() => setActiveTab(1)} />}
      {activeTab === 3 && <YourLooksTab onGoToVibe={() => setActiveTab(2)} generationStatus={generationStatus} outfits={generatedOutfits} generationError={generationError} recoveryMode={generationRecoveryMode} wardrobeItems={wardrobeItems} onRegenerate={handleRegenerate} onPersistInteraction={handlePersistInteraction} onMarkItemsWorn={handleMarkItemsWorn} savedOutfits={savedOutfits} setSavedOutfits={setSavedOutfits} wornOutfits={wornOutfits} setWornOutfits={setWornOutfits} generationContext={lastPayload} sessionsUsedThisWeek={sessionsUsedThisWeek} isVip={isVip} />}

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
        <SettingsScreen
          onClose={() => setShowSettingsScreen(false)}
          onSignOut={onSignOut}
          onRevokeConsent={handleRevokeConsent}
          onClearMemory={handleClearMemory}
        />
      </Modal>

      {/* AI Consent Modal — Apple Guideline 5.1.2(i) */}
      <ConsentModal
        visible={showConsentModal}
        onAccept={handleAcceptConsent}
        onDecline={handleDeclineConsent}
      />
    </View>
  );
}

// ── Main App — navigation ────────────────────────────────────────────────────
export default function App() {
  // Step 1 (Session 26): 'checking' covers the brief moment we ask Supabase
  // if there's an existing session in AsyncStorage. Resolves to 'main' if
  // signed in, 'splash' if not (which then flows splash → welcome → auth).
  const [currentScreen, setCurrentScreen] = useState('checking');
  const [authMode, setAuthMode] = useState('signup'); // 'signup', 'login', or 'forgot'
  // Step 4 (Session 26): which tab MainAppScreen lands on. Set explicitly by
  // each entry point before flipping currentScreen to 'main'. Auto-resume +
  // Sign In → 1 (My Closet). Signup → PostLogin → main → 0 (My Style).
  const [mainInitialTab, setMainInitialTab] = useState(0);

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

  // Step 1 (Session 26): on cold launch, check AsyncStorage for an existing
  // Supabase session. If valid, skip splash/welcome/auth and go straight to
  // main. If no session, fall through to the existing splash → welcome flow.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data?.session) {
        setMainInitialTab(1); // returning user → My Closet
        setCurrentScreen('main');
      } else {
        setCurrentScreen('splash');
      }
    }).catch(() => {
      if (!cancelled) setCurrentScreen('splash');
    });
    return () => { cancelled = true; };
  }, []);

  // Step 6 (Session 26): keep the Supabase auto-refresh timer in sync with
  // foreground/background state. iOS throttles JS timers during deep sleep,
  // so the default auto-refresh can silently miss a token refresh while
  // backgrounded. On 'active' we (re)start it — startAutoRefresh attempts a
  // refresh immediately if the token is stale. On background we stop it
  // cleanly. Canonical Supabase RN pattern.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  // Step 1 (Session 26): brief moment while getSession() resolves. Render
  // nothing — the native splash from app.config.js (Session 19D) stays up.
  if (currentScreen === 'checking') {
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
            setMainInitialTab(0); // new user post-signup → My Style
            setCurrentScreen('main');
          }}
        />
      )}
      {currentScreen === 'main' && (
        <MainAppScreen onSignOut={() => setCurrentScreen('welcome')} initialTab={mainInitialTab} />
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
              setMainInitialTab(1); // returning user signing in → My Closet
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
    lineHeight: 92,
  },
  splashLogoZie: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 72,
    color: '#C87A52',
    letterSpacing: -2,
    paddingRight: 8,
    lineHeight: 92,
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
    color: '#2C1A0E',
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

  // Legal agreement text — Sign Up only (Session 14C)
  legalAgreement: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#5C4A3A',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  legalAgreementLink: {
    color: '#A44A34',
    textDecorationLine: 'underline',
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
  saveError: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(164,74,52,0.88)',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
});

// ── Wardrobe Tab styles ─────────────────────────────────────────────────────
const wardrobeStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 108,
    paddingBottom: 90,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Session 10B Step 2: Search button (magnifying glass + "Search" text in header row)
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44,26,14,0.06)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.08)',
  },
  searchButtonActive: {
    backgroundColor: 'rgba(188,199,183,0.3)',
  },
  searchButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#5C4A3A',
    marginLeft: 6,
  },
  searchButtonTextActive: {
    color: '#6B7E65',
  },
  // Session 10B Step 3: Search bar (40px white pill with magnifying glass + TextInput + X reset)
  searchBarRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.12)',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchBarInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
    marginHorizontal: 10,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
  },
  // Session 10B Step 4: Category chips horizontal scroll
  chipsScroll: {
    marginBottom: 14,
  },
  chipsScrollContent: {
    paddingRight: 4,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.10)',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#BCC7B7',
    borderColor: '#FFFFFF',
  },
  categoryChipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#5C4A3A',
    letterSpacing: 0.2,
  },
  categoryChipTextActive: {
    color: '#2C1A0E',
  },
  // Session 10B Step 5: Result count line (12px muted, only when search text non-empty)
  searchResultsCount: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#A09888',
    marginBottom: 12,
  },
  // Session 13A: Friendly empty state when search filter returns zero results
  searchEmptyState: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  searchEmptyTitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#5C4A3A',
    textAlign: 'center',
  },
  searchEmptySubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A09888',
    marginTop: 4,
    textAlign: 'center',
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
  // Session 16B: nudge text shown to non-VIP at 48/49/50 items.
  // Terracotta inline-message colour (locked UI States, April 19 2026).
  wardrobeNudge: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(164,74,52,0.88)',
    marginTop: 4,
    marginBottom: 8,
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
  // Session 10A Step 4: Full-screen empty state (closet has 0 items) — replaces old 👗 inline empty state.
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateHanger: {
    marginBottom: 28,
  },
  emptyStateHeading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#2C1A0E',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 320,
  },
  emptyStateButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 100,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: '#2C1A0E',
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
  // Session 10A Step 1: Floating + button — bottom offset is Platform-aware to clear the
  // ~86px iOS / ~70px Android tab bar PLUS the 50px sticky vibe bar PLUS a 14px breathing gap.
  floatingAddButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 150 : 134,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#BCC7B7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  // Session 13B: Wrapper for the floating "Set Today's Vibe →" pill. Full-width invisible
  // positioned layer that centers the pill via alignItems. The JSX uses pointerEvents="box-none"
  // so taps outside the pill pass through to closet content (cards remain tappable).
  stickyVibeBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 86 : 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  // Session 10A Step 3 → Session 13B: Floating centered pill. Positioning lives on stickyVibeBarWrapper above.
  stickyVibeBar: {
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: '#BCC7B7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  stickyVibeBarText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: '#2C1A0E',
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
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(44,26,14,0.04)',
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
  recognitionBar: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  recognitionBarScanning: {
    backgroundColor: 'rgba(200,122,82,0.10)',
  },
  recognitionBarSuccess: {
    backgroundColor: 'rgba(188,199,183,0.30)',
  },
  recognitionBarNoKey: {
    backgroundColor: 'rgba(44,26,14,0.06)',
  },
  recognitionBarError: {
    backgroundColor: 'rgba(200,122,82,0.10)',
  },
  recognitionBarText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#5C4A3A',
  },
  recognitionBarTextScanning: {
    color: '#A44A34',
  },
  recognitionBarBadge: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    letterSpacing: 2.5,
    color: '#A44A34',
    marginBottom: 4,
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
  fieldInputAutoFilled: {
    borderColor: '#A44A34',
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
    height: 150,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    overflow: 'hidden',
  },
  gridCardPhotoImage: {
    width: '100%',
    height: '100%',
  },
  // Session 10A Step 5: Placeholder shown inside gridCardPhoto when item.photoUri is absent.
  // Replaces the old 👗 emoji fallback. Sage tint + small hanger + 10px "No photo".
  gridCardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(188,199,183,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardPlaceholderText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#A09888',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  categoryTag: {
    backgroundColor: 'rgba(188,199,183,0.30)',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  categoryTagText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#5C4A3A',
    letterSpacing: 0.3,
  },
  // Session 10A Step 6: Category-tag row — pill on left, pencil edit on right, vertically centered.
  categoryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  editPencil: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editPencilText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#5C4A3A',
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
    paddingVertical: 16,
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
    paddingVertical: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#E8E4CE',
  },
  emptyText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 320,
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
  // Session 11 Step B1 — Must Include redesign (text-only card + Search button + pinned pill)
  mustIncludeLine1: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 20,
    marginTop: 6,
  },
  mustIncludeLine2: {
    fontFamily: 'Outfit_400Regular',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#A09888',
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 12,
  },
  mustIncludeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  mustIncludeSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44,26,14,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 6,
  },
  mustIncludeSearchBtnText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#2C1A0E',
    marginLeft: 8,
  },
  mustIncludeHint: {
    fontFamily: 'Outfit_400Regular',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#A09888',
    marginTop: 4,
  },
  pinnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200,122,82,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(200,122,82,0.18)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 6,
    maxWidth: '100%',
  },
  pinnedPillSparkle: {
    color: '#A44A34',
    fontSize: 14,
    marginRight: 6,
  },
  pinnedPillText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#A44A34',
    flexShrink: 1,
    marginRight: 8,
  },
  pinnedPillX: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(200,122,82,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedPillXText: {
    color: '#A44A34',
    fontSize: 13,
    lineHeight: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },
});

// ── Pin Selector bottom sheet styles (Session 11 Step B2) ─────────────────
const pinSheetStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44,26,14,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(44,26,14,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 6,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2C1A0E',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(44,26,14,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#2C1A0E',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '400',
    includeFontPadding: false,
  },
  subtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 19,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(44,26,14,0.10)',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    marginLeft: 8,
    paddingVertical: 0,
  },
  searchClearX: {
    color: '#5C4A3A',
    fontSize: 18,
    lineHeight: 20,
    marginLeft: 8,
    includeFontPadding: false,
  },
  chipScroll: {
    marginTop: 14,
    marginBottom: 4,
    flexGrow: 0,
    height: 56,
  },
  chipScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tapHint: {
    fontFamily: 'Outfit_400Regular',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#A09888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  gridContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '47%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,26,14,0.06)',
    paddingBottom: 10,
  },
  gridCardPinned: {
    borderWidth: 2.5,
    borderColor: '#C87A52',
  },
  gridCardPhoto: {
    width: '100%',
    height: 150,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    overflow: 'hidden',
    position: 'relative',
  },
  gridCardPhotoImage: {
    width: '100%',
    height: '100%',
  },
  gridCardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(188,199,183,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardPlaceholderText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#A09888',
    letterSpacing: 0.2,
    marginTop: 6,
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BCC7B7',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  checkCircleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Outfit_700Bold',
    lineHeight: 14,
    includeFontPadding: false,
  },
  categoryTag: {
    backgroundColor: 'rgba(188,199,183,0.30)',
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 10,
  },
  categoryTagText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#5C4A3A',
    letterSpacing: 0.3,
  },
  gridCardName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 16,
    color: '#2C1A0E',
    paddingHorizontal: 10,
    marginTop: 6,
  },
  gridCardColour: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#5C4A3A',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  emptyResults: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#A09888',
    textAlign: 'center',
    marginTop: 40,
  },
});

// Session 20: "Your Week" calendar pill — sheet-specific styles (subtitle, dot row).
// Sheet shell (modalRoot/backdrop/sheet/handleBar/headerRow/headerTitle/closeButton/closeButtonText)
// is reused from pinSheetStyles cross-tab (Session 11 precedent). Day-card styles land in S6.
const weekSheetStyles = StyleSheet.create({
  dateRangeSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#5C4A3A',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 19,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 36,
  },
  dayLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#5C4A3A',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dateNumberCircleSelected: {
    backgroundColor: 'rgba(188,199,183,0.30)', // sage tint — locked category-pill color
  },
  dateNumber: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#2C1A0E',
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotHollow: {
    backgroundColor: 'rgba(44,26,14,0.15)',
  },
  // S6 — terracotta fill on days with wears.
  dotFilled: {
    backgroundColor: '#C87A52',
  },
  // Day-content area (S6) — mini white cards stacked vertically, scrolls if needed.
  dayCardsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayCardsContent: {
    paddingBottom: 40,
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  dayCardVibe: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#A44A34',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayCardName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#2C1A0E',
    marginBottom: 12,
    lineHeight: 22,
  },
  dayCardThumbsRow: {
    flexGrow: 0,
  },
  dayCardThumbsContent: {
    gap: 8,
  },
  dayCardThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(188,199,183,0.18)', // soft sage tint — also serves as no-photo fallback
  },
  dayCardThumbImage: {
    width: '100%',
    height: '100%',
  },
  // Empty-day message — muted text centered in the content area. No card wrapper.
  dayEmptyMessage: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#A09888',
    textAlign: 'center',
    paddingTop: 40,
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
  // Session 10A Step 7: Recovery banner restyled — white card with terracotta left-border
  // accent stripe (#C87A52) + subtle shadow. Sits cleanly against cream YourLooksTab bg.
  recoveryBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#C87A52',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  recoveryBannerText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#2C1A0E',
    lineHeight: 21,
  },
  // Session 16B: session nudge text. Sits between recovery banner and outfit cards.
  sessionNudge: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(164,74,52,0.88)',
    marginBottom: 14,
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
    width: '30%',
    alignItems: 'center',
  },
  photoStripThumb: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#E8E4CE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  photoStripThumbImage: {
    width: '100%',
    height: '100%',
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
    fontSize: 11,
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

const consentStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#2C1A0E',
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#5C4A3A',
    lineHeight: 22,
    marginBottom: 24,
  },
  link: {
    color: '#A44A34',
    textDecorationLine: 'underline',
  },
  acceptButton: {
    backgroundColor: '#BCC7B7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: '#2C1A0E',
  },
  declineButton: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#5C4A3A',
  },
});
