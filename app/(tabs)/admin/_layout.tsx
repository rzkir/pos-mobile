import DynamicTabs from '@/components/ui/dynamic-tabs'

import { adminTabConfigs, adminTabs } from '@/helper/tabs/admins/admin'

import React from 'react'

import { View } from 'react-native'

export default function AdminTabsLayout() {
    return (
        <View className='flex-1'>
            <DynamicTabs
                tabs={adminTabs}
                tabConfigs={adminTabConfigs}
            />
        </View>
    )
}