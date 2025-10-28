import React, { createContext, useContext, useEffect, useState } from 'react';

import { useCameraPermissions } from 'expo-camera';

import * as MediaLibrary from 'expo-media-library';

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PermissionContextType {
    cameraPermission: boolean | null;
    storagePermission: boolean | null;
    allPermissionsGranted: boolean;
    requestPermissions: () => Promise<void>;
    checkPermissions: () => Promise<void>;
    loading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const [loading, setLoading] = useState(true);

    const allPermissionsGranted =
        cameraPermission?.granted === true &&
        (mediaPermission?.granted === true || mediaPermission?.accessPrivileges === 'all');


    const checkPermissions = async () => {
        try {
            setLoading(true);

            // Save permission status to storage
            await AsyncStorage.setItem('permissions_checked', 'true');
        } catch (error) {
            console.error('Error checking permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const requestPermissions = async () => {
        try {
            setLoading(true);

            // Only request camera permission
            if (cameraPermission?.granted !== true) {
                await requestCameraPermission();
            }

            // Request media library permission (read/save photos)
            if (
                !(mediaPermission?.granted === true || mediaPermission?.accessPrivileges === 'all')
            ) {
                await requestMediaPermission();
            }

            // Save permission status to storage
            await AsyncStorage.setItem('permissions_checked', 'true');
        } catch (error) {
            console.error('Error requesting permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkPermissions();

    }, []);

    // Add effect to handle permission state changes
    useEffect(() => {
        if (
            cameraPermission?.granted === true &&
            (mediaPermission?.granted === true || mediaPermission?.accessPrivileges === 'all')
        ) {
            // All permissions granted, no need to keep checking
        }
    }, [cameraPermission?.granted, mediaPermission?.granted, mediaPermission?.accessPrivileges]);

    const value: PermissionContextType = {
        cameraPermission: cameraPermission?.granted || null,
        storagePermission: (mediaPermission?.granted === true || mediaPermission?.accessPrivileges === 'all') ? true : (mediaPermission ? false : null),
        allPermissionsGranted,
        requestPermissions,
        checkPermissions,
        loading,
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};