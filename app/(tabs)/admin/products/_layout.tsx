import { Stack } from 'expo-router';

import React from 'react';

export default function ProfilLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen options={{
                headerShown: false,
            }} name="index" />
        </Stack>
    );
}