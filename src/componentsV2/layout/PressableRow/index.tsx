import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import XStack from '../XStack'

export interface PressableRowProps extends TouchableOpacityProps {
  className?: string
}

const PressableRow: React.FC<PressableRowProps> = ({ className, children, ...props }) => {
  return (
    <TouchableOpacity {...props}>
      <XStack className={`justify-between items-center py-[14px] px-4 ${className || ''}`}>{children}</XStack>
    </TouchableOpacity>
  )
}

export default PressableRow
