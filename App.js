import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.logo}>
        <Text style={styles.logoClo}>Clo</Text>
        <Text style={styles.logoZie}>zie</Text>
      </Text>
      <Text style={styles.tagline}>✦ YOUR PERSONAL STYLIST ✦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 72,
    letterSpacing: 2,
  },
  logoClo: {
    fontFamily: 'serif',
    color: '#F5F0E8',
    fontSize: 72,
  },
  logoZie: {
    fontFamily: 'serif',
    color: '#C9A96E',
    fontStyle: 'italic',
    fontSize: 72,
  },
  tagline: {
    color: '#C9A96E',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 16,
  },
});
