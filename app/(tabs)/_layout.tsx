import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { View, Text, useWindowDimensions } from 'react-native'

export default function TabLayout() {
    const isDark = false
    const { width } = useWindowDimensions()
    const isTablet = width >= 768

    return (
        <View className='flex-1'>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: '#FF9228',
                    tabBarInactiveTintColor: isDark ? '#A1A5B7' : '#6B7280',
                    tabBarStyle: {
                        backgroundColor: isDark ? '#181A20' : '#FFFFFF',
                        height: isTablet ? 68 : 56,
                        paddingHorizontal: isTablet ? 24 : 12,
                    },
                    tabBarItemStyle: {
                        paddingVertical: isTablet ? 10 : 8,
                    },
                    headerShown: false,
                }}>
                <Tabs.Screen
                    name="beranda"
                    options={{
                        title: 'Beranda',
                        tabBarIcon: ({ focused }: { focused: boolean }) => (
                            <View
                                className={`relative flex-row items-center gap-2 rounded-full px-3 ${isTablet ? 'h-[44px] w-[128px]' : 'h-[36px] w-[92px]'} justify-center ${focused ? 'bg-accent-primary' : ''}`}
                            >
                                <View>
                                    <Ionicons size={isTablet ? 24 : 20} name="home" color={focused ? '#FFFFFF' : (isDark ? '#A1A5B7' : '#6B7280')} />
                                </View>
                                <View>
                                    <Text className={`${isTablet ? 'text-sm' : 'text-xs'} font-medium ${focused ? 'text-white' : (isTablet ? (isDark ? 'text-zinc-400' : 'text-gray-500') : 'opacity-0 absolute')}`}>Beranda</Text>
                                </View>
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="transaction"
                    options={{
                        title: 'Transaction',
                        tabBarIcon: ({ focused }: { focused: boolean }) => (
                            <View
                                className={`relative flex-row items-center gap-2 rounded-full px-3 ${isTablet ? 'h-[44px] w-[128px]' : 'h-[36px] w-[92px]'} justify-center ${focused ? 'bg-accent-primary' : ''}`}
                            >
                                <View>
                                    <Ionicons size={isTablet ? 24 : 20} name="card" color={focused ? '#FFFFFF' : (isDark ? '#A1A5B7' : '#6B7280')} />
                                </View>
                                <View>
                                    <Text className={`${isTablet ? 'text-sm' : 'text-xs'} font-medium ${focused ? 'text-white' : (isTablet ? (isDark ? 'text-zinc-400' : 'text-gray-500') : 'opacity-0 absolute')}`}>Transaksi</Text>
                                </View>
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="products"
                    options={{
                        title: 'Products',
                        tabBarIcon: ({ focused }: { focused: boolean }) => (
                            <View
                                className={`relative flex-row items-center gap-2 rounded-full px-3 ${isTablet ? 'h-[44px] w-[128px]' : 'h-[36px] w-[92px]'} justify-center ${focused ? 'bg-accent-primary' : ''}`}
                            >
                                <View>
                                    <Ionicons size={isTablet ? 24 : 20} name="cube" color={focused ? '#FFFFFF' : (isDark ? '#A1A5B7' : '#6B7280')} />
                                </View>
                                <View>
                                    <Text className={`${isTablet ? 'text-sm' : 'text-xs'} font-medium ${focused ? 'text-white' : (isTablet ? (isDark ? 'text-zinc-400' : 'text-gray-500') : 'opacity-0 absolute')}`}>Produk</Text>
                                </View>
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ focused }: { focused: boolean }) => (
                            <View
                                className={`relative flex-row items-center gap-2 rounded-full px-3 ${isTablet ? 'h-[44px] w-[128px]' : 'h-[36px] w-[92px]'} justify-center ${focused ? 'bg-accent-primary' : ''}`}
                            >
                                <View
                                >
                                    <Ionicons size={isTablet ? 24 : 20} name="person" color={focused ? '#FFFFFF' : (isDark ? '#A1A5B7' : '#6B7280')} />
                                </View>
                                <View
                                >
                                    <Text className={`${isTablet ? 'text-sm' : 'text-xs'} font-medium ${focused ? 'text-white' : (isTablet ? (isDark ? 'text-zinc-400' : 'text-gray-500') : 'opacity-0 absolute')}`}>Profile</Text>
                                </View>
                            </View>
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}