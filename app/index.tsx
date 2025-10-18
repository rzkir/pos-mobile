import { usePermissions } from '@/context/PermissionContext';

import { useAuth } from '@/context/AuthContext';

import { router, usePathname } from 'expo-router';

import { useEffect, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  const { loading: permissionLoading } = usePermissions();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (loading || permissionLoading) return;
      if (hasRedirected.current) return;
      if (pathname !== '/') return;

      try {
        const hasVisitedAuth = await AsyncStorage.getItem('has_visited_auth');

        if (user) {
          hasRedirected.current = true;
          // Redirect based on user role
          if (user.role === 'admins') {
            router.replace('/(tabs)/admin/beranda');
          } else {
            router.replace('/(tabs)/karywan/beranda');
          }
        }
        else if (hasVisitedAuth !== 'true') {
          hasRedirected.current = true;
          router.replace('/auth');
        } else {
          hasRedirected.current = true;
          // Default redirect to auth if no user
          router.replace('/auth');
        }
      } catch {
        hasRedirected.current = true;
        router.replace('/permissions');
      }
    };

    checkFirstTimeUser();
  }, [user, loading, permissionLoading, pathname]);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Show loading indicator while contexts are loading
  if (loading || permissionLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#333333" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return null;
}