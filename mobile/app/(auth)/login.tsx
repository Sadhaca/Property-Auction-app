import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/lib/auth';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="business" size={40} color={colors.white} />
          </View>
          <Text style={styles.appName}>AuctionProp</Text>
          <Text style={styles.tagline}>India's Property Auction Discovery Platform</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue</Text>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email or Phone"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Skip / Guest */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  appName: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.primary[500],
    marginBottom: spacing[1],
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitleText: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing[3],
  },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.text.primary,
    height: '100%',
  },
  eyeButton: {
    padding: spacing[2],
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing[6],
  },
  forgotText: {
    fontSize: fontSizes.md,
    color: colors.primary[500],
    fontWeight: fontWeights.medium as any,
  },
  loginButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    marginHorizontal: spacing[4],
    fontSize: fontSizes.md,
    color: colors.text.tertiary,
  },
  guestButton: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  guestButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.secondary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  registerLink: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.primary[500],
  },
});
