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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the Terms and Conditions.');
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
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
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join AuctionProp to discover property auctions across India
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor={colors.text.tertiary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

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
              placeholder="Email Address *"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={colors.text.tertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
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
              placeholder="Password *"
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

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              placeholderTextColor={colors.text.tertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
            >
              {agreeTerms && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingHorizontal: spacing[6],
    paddingTop: spacing[16],
    paddingBottom: spacing[10],
  },
  backButton: {
    marginBottom: spacing[6],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: spacing[8],
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
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
  countryCode: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
    marginRight: spacing[2],
    paddingRight: spacing[2],
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
    marginTop: spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    marginRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary[500],
    fontWeight: fontWeights.medium as any,
  },
  registerButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.primary[500],
  },
});
