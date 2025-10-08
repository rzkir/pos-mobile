import { Tabs } from 'expo-router';

import React from 'react';

import { AntDesign, Ionicons } from '@expo/vector-icons';

import { View } from 'react-native';

export default function TabLayout() {
    return (
        <View className='flex-1'>
            <Tabs>
                <Tabs.Screen name="beranda" options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                }} />
                <Tabs.Screen name="favorit" options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="heart" color={color} size={size} />
                    ),
                }} />
                <Tabs.Screen name="pesan" options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="message" color={color} size={size} />
                    ),
                }} />
                <Tabs.Screen name="profil" options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" color={color} size={size} />
                    ),
                }} />
            </Tabs>
        </View>
    );
}