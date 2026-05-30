import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../src/store/authStore';
import { authAPI } from '../../src/services/api';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/theme';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import GradientBackground from '../../src/components/GradientBackground';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.signup(email, password, name);
      await setAuth(data.user, data.accessToken, data.refreshToken);
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: `Welcome to Smart Deal, ${data.user.name}`,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start finding amazing deals today</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button 
              title="Sign Up" 
              onPress={handleSignup} 
              loading={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.dark.text,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark.textMuted,
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.dark.textMuted,
    ...TYPOGRAPHY.body,
  },
  linkText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
});
