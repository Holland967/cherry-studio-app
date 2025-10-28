import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { ArrowLeft } from '../../icons/LucideIcon'
import XStack from '@/componentsV2/layout/XStack'
import Text from '@/componentsV2/base/Text'

export interface HeaderBarButton {
  icon: React.ReactNode
  onPress: () => void
}

export interface HeaderBarProps {
  title?: string
  onBackPress?: () => void
  leftButton?: HeaderBarButton
  rightButton?: HeaderBarButton
  rightButtons?: HeaderBarButton[]
  showBackButton?: boolean
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = '',
  onBackPress,
  leftButton,
  rightButton,
  rightButtons,
  showBackButton = true
}) => {
  const buttonsToRender = rightButtons || (rightButton ? [rightButton] : [])
  const navigation = useNavigation<any>()

  const handleBack = () => {
    if (onBackPress) return onBackPress()
    try {
      navigation?.goBack?.()
    } catch {}
  }

  return (
    <XStack className="px-4 items-center h-[44px] justify-between">
      {/* Left area */}
      <XStack className="min-w-[40px] items-center">
        {leftButton ? (
          <TouchableOpacity hitSlop={10} onPress={leftButton.onPress}>
            {leftButton.icon}
          </TouchableOpacity>
        ) : showBackButton ? (
          <TouchableOpacity hitSlop={10} onPress={handleBack}>
            <ArrowLeft size={24} />
          </TouchableOpacity>
        ) : (
          <XStack className="w-[40px]" />
        )}
      </XStack>

      {/* Title */}
      <XStack className="flex-1 justify-center items-center">
        <Text className="text-[18px] font-bold text-center">{title}</Text>
      </XStack>

      {/* Right area */}
      <XStack className="min-w-[40px] items-center justify-end">
        {buttonsToRender.length > 0 ? (
          <XStack className="gap-3">
            {buttonsToRender.map((button, index) => (
              <TouchableOpacity key={index} hitSlop={10} onPress={button.onPress}>
                {button.icon}
              </TouchableOpacity>
            ))}
          </XStack>
        ) : (
          <XStack className="w-[40px]" />
        )}
      </XStack>
    </XStack>
  )
}

export default HeaderBar
