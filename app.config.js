import 'dotenv/config';

export default {
  expo: {
    name: 'Clozie',
    slug: 'clozie',
    version: '1.0.0',
    orientation: 'portrait',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      anthropicKey: process.env.EXPO_PUBLIC_ANTHROPIC_KEY,
    },
  },
};
