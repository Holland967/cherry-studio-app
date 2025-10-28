import Text from '@/componentsV2/base/Text'
import React from 'react'
import { TextProps } from 'react-native'

export interface GroupTitleProps extends TextProps {
  className?: string
}

const GroupTitle: React.FC<GroupTitleProps> = ({ className, ...props }) => {
  return <Text className={`font-bold opacity-70 pl-3 ${className || ''}`} {...props} />
}

export default GroupTitle
