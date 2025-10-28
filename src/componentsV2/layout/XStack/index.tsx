import React, { forwardRef } from 'react'
import { View, ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'
import { cn } from 'heroui-native'

export interface XStackProps extends ViewProps {
  className?: string
}

const XStack = forwardRef<View, XStackProps>(({ className = '', ...rest }, ref) => {
  const composed = cn('flex-row', className)

  return <View ref={ref} className={composed} {...rest} />
})

XStack.displayName = 'XStack'

export const AnimatedXStack = Animated.createAnimatedComponent(XStack)

export default XStack
