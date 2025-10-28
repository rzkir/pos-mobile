import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'admins' | 'karyawan';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
    signOut: () => Promise<void>;
    changeRole: (newRole: Role) => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
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
                    role: 'karyawan', // default role for mock sign in
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

    const signUp = async (name: string, email: string, password: string, role: Role): Promise<boolean> => {
        try {
            setLoading(true);
            // Simulate API call - replace with actual registration logic
            if (name && email && password && role) {
                const userData: User = {
                    id: '1',
                    name,
                    email,
                    role,
                };
                setUser(userData);
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
                await AsyncStorage.setItem('has_visited_auth', 'true');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error signing up:', error);
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

    const changeRole = async (newRole: Role): Promise<void> => {
        try {
            setLoading(true);
            if (user) {
                const updatedUser = { ...user, role: newRole };
                setUser(updatedUser);
                await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error changing role:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData: Partial<User>): Promise<void> => {
        try {
            setLoading(true);
            if (user) {
                const updatedUser = { ...user, ...userData };
                setUser(updatedUser);
                await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        changeRole,
        updateUser,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
