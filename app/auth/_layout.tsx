import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 300,
                contentStyle: { backgroundColor: '#ffffff' },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="signin" />
        </Stack>
    );
}
