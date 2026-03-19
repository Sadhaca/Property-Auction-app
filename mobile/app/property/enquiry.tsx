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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useAuthStore } from '../../src/lib/auth';
import { api } from '../../src/lib/api';

export default function EnquiryScreen() {
  const router = useRouter();
  const { propertyId, propertyTitle } = useLocalSearchParams<{
    propertyId: string;
    propertyTitle: string;
  }>();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState(
    `I am interested in the property "${propertyTitle || ''}". Please share more details.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/enquiries', {
        property_id: propertyId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      Alert.alert(
        'Enquiry Sent',
        'Your enquiry has been submitted successfully. We will get back to you soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Failed to send enquiry. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
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
        {/* Property Info */}
        {propertyTitle && (
          <View style={styles.propertyInfo}>
            <Ionicons name="home-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.propertyTitle} numberOfLines={2}>
              {propertyTitle}
            </Text>
          </View>
        )}

        <Text style={styles.formTitle}>Contact Details</Text>
        <Text style={styles.formSubtitle}>
          Fill in your details to send an enquiry about this property
        </Text>

        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={18}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.text.tertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={18}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={colors.text.tertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Message */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Your message..."
            placeholderTextColor={colors.text.tertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color={colors.white} />
              <Text style={styles.submitButtonText}>Send Enquiry</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By submitting this enquiry, you agree to be contacted regarding this property.
          Your information will be shared with relevant parties.
        </Text>
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
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  propertyTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as any,
    color: colors.primary[500],
    flex: 1,
  },
  formTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  formSubtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  fieldContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    height: 50,
  },
  inputIcon: {
    marginRight: spacing[2],
  },
  countryCode: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
    marginRight: spacing[2],
    paddingRight: spacing[2],
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text.primary,
    height: '100%',
  },
  messageInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    height: 56,
    borderRadius: borderRadius.xl,
    gap: spacing[2],
    marginTop: spacing[4],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.white,
  },
  disclaimer: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[4],
    lineHeight: 18,
  },
});
