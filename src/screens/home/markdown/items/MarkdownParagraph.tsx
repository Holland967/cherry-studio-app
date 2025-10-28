import React, { ReactNode } from 'react'
import { View, ViewStyle } from 'react-native'

interface MarkdownParagraphProps {
  children: ReactNode[]
  styles?: ViewStyle
}

export const MarkdownParagraph: React.FC<MarkdownParagraphProps> = ({ children, styles }) => {
  return (
    <View className="select-none" style={{ ...styles }}>
      {children}
    </View>
  )
}

export default MarkdownParagraph
