import { AntDesign, Ionicons } from '@expo/vector-icons'

import { Tabs } from 'expo-router'

import React from 'react'

export default function DynamicTabs({ tabs, tabConfigs }: DynamicTabsProps) {
    const renderIcon = (tabName: string, color: string, size: number) => {
        const config = tabConfigs[tabName]
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
        <Tabs>
            {tabs.map((tabName) => (
                <Tabs.Screen
                    key={tabName}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => renderIcon(tabName, color, size),
                        title: tabConfigs[tabName]?.name || tabName,
                    }}
                    name={tabName}
                />
            ))}
        </Tabs>
    )
}
