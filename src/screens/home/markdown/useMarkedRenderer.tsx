import { Copy } from '@tamagui/lucide-icons'
import * as Clipboard from 'expo-clipboard'
import { t } from 'i18next'
import React, { ReactNode, useMemo } from 'react'
import { Dimensions, ScrollView, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import CodeHighlighter from 'react-native-code-highlighter'
import type { RendererInterface } from 'react-native-marked'
import { MarkedTokenizer, Renderer } from 'react-native-marked'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Image, Text, View, XStack, YStack } from 'tamagui'

import { IconButton } from '@/components/ui/IconButton'
import { useToast } from '@/hooks/useToast'
import { getCodeLanguageIcon } from '@/utils/icons/codeLanguage'

import { markdownColors } from './MarkdownStyles'
import { ExtractMathResult, useMathEquation } from './useMathEquation'

// const logger = loggerService.withContext('useMarkedRenderer')

class CustomTokenizer extends MarkedTokenizer {}

class CustomRenderer extends Renderer implements RendererInterface {
  private isDark: boolean
  private equationColor: string
  private extractInlineMathEquation: (text: string) => ExtractMathResult[]
  private extractAllMathEquation: (text: string) => ExtractMathResult[]
  private renderInlineMath: (content: string, key?: string | number) => React.JSX.Element
  private renderBlockMath: (content: string, key?: string | number) => React.JSX.Element
  private showToast: (content: string) => void

  constructor(
    isDark: boolean,
    extractInlineMathEquation: (text: string) => ExtractMathResult[],
    extractAllMathEquation: (text: string) => ExtractMathResult[],
    renderInlineMath: (content: string, key?: string | number) => React.JSX.Element,
    renderBlockMath: (content: string, key?: string | number) => React.JSX.Element,
    showToast: (content: string) => void
  ) {
    super()
    this.isDark = isDark
    this.equationColor = isDark ? markdownColors.dark.text : markdownColors.light.text
    this.extractInlineMathEquation = extractInlineMathEquation
    this.extractAllMathEquation = extractAllMathEquation
    this.renderInlineMath = renderInlineMath
    this.renderBlockMath = renderBlockMath
    this.showToast = showToast
  }

  private async onCopy(content: string) {
    await Clipboard.setStringAsync(content)
    this.showToast(t('common.copied'))
  }

  // Override code block rendering
  code(text: string, language?: string, containerStyle?: ViewStyle, textStyle?: TextStyle): ReactNode {
    const lang = language || 'text'
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light
    return (
      <View
        key={this.getKey()}
        style={{
          gap: 10,
          paddingHorizontal: 14,
          paddingTop: 0,
          paddingBottom: 14,
          borderRadius: 12,
          marginTop: 10,
          ...containerStyle
        }}>
        <XStack
          paddingVertical={10}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderColor={currentColors.codeBorder}>
          <XStack gap={8} flex={1} alignItems="center">
            {getCodeLanguageIcon(lang) && <Image source={getCodeLanguageIcon(lang)} width={18} height={18} />}
            <Text fontSize={13} lineHeight={13} color="$textSecondary" userSelect="none">
              {lang.toUpperCase()}
            </Text>
          </XStack>
          <IconButton icon={<Copy size={16} color="$gray60" />} onPress={() => this.onCopy(text)} />
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
            ...styles.text,
            ...textStyle
          }}
          hljsStyle={this.isDark ? atomOneDark : atomOneLight}
          language={lang}
          wrapLines={true}
          wrapLongLines={true}
          lineProps={{ style: { flexWrap: 'wrap' } }}>
          {text}
        </CodeHighlighter>
      </View>
    )
  }

  // Override inline code rendering
  codespan(text: string): ReactNode {
    // support katex
    const result = this.extractInlineMathEquation(text)

    return result.map(({ type, content }) => {
      if (type === 'text') {
        return (
          <Text key={this.getKey()} color="$green100" fontFamily="monospace" userSelect="none">
            {content}
          </Text>
        )
      } else if (type === 'block-latex') {
        // 上面的 extractInlineMathEquation 不会解析 block latex
        return null
      } else {
        return this.renderInlineMath(content, this.getKey())
      }
    })
  }

  // Override heading rendering
  // heading(text: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return super.heading(text, { ...styles, color: currentColors.text })
  // }

  // Override paragraph rendering
  paragraph(children: ReactNode[], styles?: ViewStyle): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

    return (
      <View
        userSelect="none"
        key={this.getKey()}
        style={{
          ...styles,
          color: currentColors.text
        }}>
        {children}
      </View>
    )
  }

  text(text: string | ReactNode[], styles?: TextStyle): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

    if (typeof text === 'string') {
      // Check for block equations first
      const result = this.extractAllMathEquation(text)

      return result.map(({ type, content }) => {
        if (type === 'block-latex') {
          return this.renderBlockMath(content, this.getKey())
        } else if (type === 'inline-latex') {
          return this.renderInlineMath(content, this.getKey())
        } else {
          return super.text(content, {
            ...styles,
            color: currentColors.text,
            userSelect: 'none'
          })
        }
      })
    } else {
      return super.text(text, {
        userSelect: 'none',
        fontSize: 16,
        lineHeight: 24,
        color: currentColors.text,
        ...styles
      })
    }
  }

  // em(children: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return (
  //     <Text selectable key={this.getKey()} style={[styles, { color: currentColors.text }]}>
  //       {children}
  //     </Text>
  //   )
  // }

  // strong(children: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return (
  //     <Text selectable key={this.getKey()} style={[styles, { color: currentColors.text }]}>
  //       {children}
  //     </Text>
  //   )
  // }

  // del(children: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return (
  //     <Text selectable key={this.getKey()} style={[styles, { color: currentColors.text }]}>
  //       {children}
  //     </Text>
  //   )
  // }

  list(
    ordered: boolean,
    li: ReactNode[],
    listStyle?: ViewStyle,
    textStyle?: TextStyle,
    startIndex?: number
  ): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light
    return super.list(
      ordered,
      li,
      {
        ...listStyle,
        ...currentColors,
        width: 26,
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
      },
      { ...textStyle, textAlign: 'center', marginTop: 8 },
      startIndex
    )
  }

  listItem(children: ReactNode[], styles?: ViewStyle): ReactNode {
    return super.listItem(children, {
      ...styles,
      width: '100%',
      marginTop: 8
    })
  }

  hr(styles?: ViewStyle): ReactNode {
    return super.hr({ ...styles, marginVertical: 12 })
  }

  table(
    header: ReactNode[][],
    rows: ReactNode[][][],
    tableStyle?: ViewStyle,
    rowStyle?: ViewStyle,
    cellStyle?: ViewStyle
  ): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light
    const cellWidth = Math.floor(Dimensions.get('window').width / header.length)

    const renderCell = (cellData: ReactNode, cellIndex: number) => {
      return (
        <View
          userSelect="none"
          key={`${cellIndex}`}
          style={{
            width: cellWidth,
            padding: 8,
            borderRightWidth: cellIndex === header.length - 1 ? 0 : 1,
            borderColor: currentColors.border
          }}>
          {cellData}
        </View>
      )
    }

    return (
      <ScrollView horizontal={true} style={{ marginTop: 10 }}>
        <YStack borderWidth={1} borderColor={currentColors.border} borderRadius={12}>
          <XStack
            borderBottomWidth={1}
            borderColor={currentColors.border}
            borderTopLeftRadius={12}
            borderTopRightRadius={12}
            backgroundColor={currentColors.codeBg}>
            {header.map((cellData, cellIndex) => {
              return renderCell(cellData, cellIndex)
            })}
          </XStack>
          {rows.map((rowData, index) => {
            return (
              <XStack
                key={`${index}`}
                borderBottomWidth={index === rows.length - 1 ? 0 : 1}
                borderColor={currentColors.border}>
                {rowData.map((cellData, cellIndex) => {
                  return renderCell(cellData, cellIndex)
                })}
              </XStack>
            )
          })}
        </YStack>
      </ScrollView>
    )
  }
}

/**
 * A hook that provides the configuration for react-native-marked,
 * including custom tokenizers and renderers for math equations and enhanced code blocks.
 * @param isDark - Whether the theme is dark, used for styling.
 */
export const useMarkedRenderer = (isDark: boolean) => {
  const equationColor = isDark ? markdownColors.dark.text : markdownColors.light.text
  const { extractInlineMathEquation, extractAllMathEquation, renderInlineMath, renderBlockMath } =
    useMathEquation(equationColor)

  // Use useToast hook
  const { show: showToast } = useToast()

  const renderer = useMemo(
    () =>
      new CustomRenderer(
        isDark,
        extractInlineMathEquation,
        extractAllMathEquation,
        renderInlineMath,
        renderBlockMath,
        showToast
      ),
    [isDark, extractInlineMathEquation, extractAllMathEquation, renderInlineMath, renderBlockMath, showToast]
  )
  const tokenizer = useMemo(() => new CustomTokenizer(), [])

  return { renderer, tokenizer }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: 'JetbrainMono',
    userSelect: 'none'
  }
})
