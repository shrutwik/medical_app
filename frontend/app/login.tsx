import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, layout, typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { hasFirebaseConfig } from '../services/auth/firebase';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const firebaseReady = hasFirebaseConfig();

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.accentStrip} />
            <View style={styles.cardBody}>
              <Text style={styles.eyebrow}>Medical Study Hub</Text>
              <Text style={styles.title}>
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'signin'
                  ? 'Sign in to continue your study session.'
                  : 'Create an account to track your progress across sessions.'}
              </Text>

              {!firebaseReady ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Firebase is not configured. Use guest mode or set up environment variables.
                  </Text>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={mode === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                editable={!loading}
              />

              <Pressable
                style={[styles.primaryButton, (!firebaseReady || loading) && styles.primaryButtonDisabled]}
                onPress={handleSubmit}
                disabled={!firebaseReady || loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </Pressable>

              <Pressable style={styles.switchRow} onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(undefined); }}>
                <Text style={styles.switchText}>
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={styles.switchLink}>
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </Text>
                </Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.guestButton} onPress={handleGuest}>
                <Text style={styles.guestButtonText}>Continue as guest</Text>
              </Pressable>
              <Text style={styles.guestNote}>Progress will be saved locally on this device.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: layout.pagePadding,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  accentStrip: {
    height: 4,
    backgroundColor: colors.maroon,
  },
  cardBody: {
    padding: 32,
  },
  eyebrow: {
    ...typography.label,
    color: colors.maroon,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.maroonDeep,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: colors.goldFaint,
    borderRadius: layout.radiusMd,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  warningText: {
    color: colors.gold,
    fontSize: 13,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: layout.radiusMd,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radiusMd,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.offWhite,
  },
  primaryButton: {
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.maroon,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.cloud,
  },
  guestButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  guestNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
});
