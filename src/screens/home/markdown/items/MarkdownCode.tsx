import React from 'react'
import { ViewStyle, TextStyle, View } from 'react-native'
import CodeHighlighter from 'react-native-code-highlighter'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { IconButton, Image, Text, XStack } from '@/componentsV2'
import { Copy } from '@/componentsV2/icons/LucideIcon'
import { getCodeLanguageIcon } from '@/utils/icons/codeLanguage'
import { markdownColors } from '../MarkdownStyles'

interface MarkdownCodeProps {
  text: string
  language?: string
  isDark: boolean
  onCopy: (content: string) => void
  containerStyle?: ViewStyle
  textStyle?: TextStyle
}

export const MarkdownCode: React.FC<MarkdownCodeProps> = ({
  text,
  language = 'text',
  isDark,
  onCopy,
  containerStyle,
  textStyle
}) => {
  const currentColors = isDark ? markdownColors.dark : markdownColors.light
  const lang = language || 'text'

  return (
    <View className="gap-2 px-3 pt-0 pb-3 rounded-3 mt-2" style={containerStyle}>
      <XStack className="py-2 justify-between items-center border-b" style={{ borderColor: currentColors.codeBorder }}>
        <XStack className="gap-2 flex-1 items-center">
          {getCodeLanguageIcon(lang) && <Image source={getCodeLanguageIcon(lang)} className="w-5 h-5" />}
          <Text className="text-base">{lang.toUpperCase()}</Text>
        </XStack>
        <IconButton icon={<Copy size={16} color="$gray60" />} onPress={() => onCopy(text)} />
      </XStack>
      <CodeHighlighter
        customStyle={{ backgroundColor: 'transparent' }}
        scrollViewProps={{
          contentContainerStyle: {
            backgroundColor: 'transparent'
          },
          showsHorizontalScrollIndicator: false
        }}
        textStyle={{
          ...textStyle,
          fontSize: 12,
          fontFamily: 'JetbrainMono',
          userSelect: 'none'
        }}
        hljsStyle={isDark ? atomOneDark : atomOneLight}
        language={lang}
        wrapLines={true}
        wrapLongLines={true}
        lineProps={{ style: { flexWrap: 'wrap' } }}>
        {text}
      </CodeHighlighter>
    </View>
  )
}

export default MarkdownCode
