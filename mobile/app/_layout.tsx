import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useAuthStore } from '../src/lib/auth';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background.secondary,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="property/[id]"
          options={{
            headerShown: true,
            title: 'Property Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="property/enquiry"
          options={{
            headerShown: true,
            title: 'Send Enquiry',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
