import Text from '@/componentsV2/base/Text'
import XStack from '@/componentsV2/layout/XStack'
import YStack from '@/componentsV2/layout/YStack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'

interface MenuTabContentProps {
  title: string
  onSeeAllPress?: () => void
  children?: React.ReactNode
}

export function MenuTabContent({ title, onSeeAllPress, children }: MenuTabContentProps) {
  const { t } = useTranslation()

  return (
    <YStack className="flex-1 gap-2.5">
      <YStack className="px-5">
        <XStack className="justify-between items-center">
          <XStack className="py-2.5 gap-2 items-center">
            <Text className="text-text-primary dark:text-text-primary-dark">{title}</Text>
          </XStack>
          <TouchableOpacity onPress={onSeeAllPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text className="text-text-link dark:text-text-link-dark">{t('menu.see_all')}</Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
      {children}
    </YStack>
  )
}
