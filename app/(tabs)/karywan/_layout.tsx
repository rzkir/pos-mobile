import DynamicTabs from '@/components/ui/dynamic-tabs'

import { karyawanTabConfigs, karyawanTabs } from '@/helper/tabs/karyawan/karyawan'

import React from 'react'

import { View } from 'react-native'

export default function KaryawanTabsLayout() {
    return (
        <View className='flex-1'>
            <DynamicTabs
                tabs={karyawanTabs}
                tabConfigs={karyawanTabConfigs}
            />
        </View>
    )
}