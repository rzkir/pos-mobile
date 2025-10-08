import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('user_data');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            // Simulate API call - replace with actual authentication logic
            if (email && password) {
                const userData: User = {
                    id: '1',
                    name: 'User',
                    email: email,
                };
                setUser(userData);
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
                await AsyncStorage.setItem('has_visited_auth', 'true');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error signing in:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            setLoading(true);
            setUser(null);
            await AsyncStorage.removeItem('user_data');
            await AsyncStorage.removeItem('has_visited_auth');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
