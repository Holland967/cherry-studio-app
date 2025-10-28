import React from 'react'
import { ViewProps } from 'react-native'
import XStack from '../XStack'

export interface RowProps extends ViewProps {
  className?: string
}

const Row: React.FC<RowProps> = ({ className, children, ...props }) => {
  return (
    <XStack className={`justify-between items-center py-[14px] px-4 ${className || ''}`} {...props}>
      {children}
    </XStack>
  )
}

export default Row
