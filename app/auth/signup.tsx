import { useAuth } from '@/context/AuthContext';

import { router } from 'expo-router';

import { useState } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import Toast from 'react-native-toast-message';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthIndex() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, loading } = useAuth();

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            Toast.show({ type: 'error', text1: 'Please enter name, email and password' });
            return;
        }

        const success = await signUp(name, email, password, 'karyawan');
        if (success) {
            router.replace('/auth/signin');
        } else {
            Toast.show({ type: 'error', text1: 'Failed to create account' });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-6 py-8 justify-center">
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-primary mb-2">Welcome</Text>
                    <Text className="text-base text-secondary">Create an account to continue</Text>
                </View>

                <View className="mb-6">
                    <TextInput
                        className="py-4 px-4 bg-card rounded-xl mb-4 text-primary border border-border-primary"
                        placeholder="Name"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <TextInput
                        className="py-4 px-4 bg-card rounded-xl mb-4 text-primary border border-border-primary"
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        className="py-4 px-4 bg-card rounded-xl mb-4 text-primary border border-border-primary"
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    className="py-4 px-6 rounded-xl items-center mb-4 bg-blue-500 shadow-lg"
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    <Text className="text-white text-base font-semibold">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="py-4 px-6 rounded-xl items-center"
                    onPress={() => router.push('/auth/signin' as any)}
                >
                    <Text className="text-tertiary text-base font-medium">Already have an account? Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}