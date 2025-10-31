import { router, usePathname } from 'expo-router';

import { useEffect, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    let rafId: number | null = null;
    const checkUserAndRedirect = async () => {
      if (hasRedirected.current) return;
      if (pathname !== '/') return;

      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      if (isLoggedIn === 'true') {
        hasRedirected.current = true;
        router.replace('/(tabs)/beranda');
      } else {
        hasRedirected.current = true;
        router.replace('/welcome');
      }
    };
    rafId = requestAnimationFrame(() => {
      checkUserAndRedirect();
    });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  return null;
}