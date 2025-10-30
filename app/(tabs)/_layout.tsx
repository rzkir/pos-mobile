import { AntDesign, Ionicons } from '@expo/vector-icons'

import { Tabs } from 'expo-router'

import { View } from 'react-native'

import { adminTabs, adminTabConfigs } from '@/helper/tabs/tabs';

export default function AdminTabsLayout({ tabs, tabConfigs }: DynamicTabsProps) {
    const safeTabs = tabs || adminTabs;
    const safeTabConfigs = tabConfigs || adminTabConfigs;

    const renderIcon = (tabName: string, color: string, size: number) => {
        const config = safeTabConfigs[tabName]
        if (!config) return null

        const iconProps = { color, size }

        if (config.iconType === 'ionicons') {
            return <Ionicons name={config.icon as any} {...iconProps} />
        } else if (config.iconType === 'antdesign') {
            return <AntDesign name={config.icon as any} {...iconProps} />
        }

        return null
    }

    return (
        <View className='flex-1'>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#f97316',
                    tabBarInactiveTintColor: '#6B7280',
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopColor: '#e5e7eb',
                    },
                    tabBarLabelStyle: {
                        fontWeight: '600',
                    },
                }}
            >
                {safeTabs.map((tabName) => (
                    <Tabs.Screen
                        key={tabName}
                        options={{
                            tabBarIcon: ({ color, size }) => renderIcon(tabName, color, size),
                            title: safeTabConfigs[tabName]?.name || tabName,
                        }}
                        name={tabName}
                    />
                ))}
            </Tabs>
        </View>
    )
}