import { isEmpty } from 'lodash'
import React, { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-native-marked'
import { View } from 'react-native'

import { useTheme } from 'heroui-native'
import { MainTextMessageBlock, ThinkingMessageBlock, TranslationMessageBlock } from '@/types/message'
import { escapeBrackets, removeSvgEmptyLines } from '@/utils/formats'

import { markdownColors } from './MarkdownStyles'
import { useMarkedRenderer } from './useMarkedRenderer'

interface Props {
  block: MainTextMessageBlock | TranslationMessageBlock | ThinkingMessageBlock
}

const ReactNativeMarkdown: FC<Props> = ({ block }) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const getMessageContent = (block: MainTextMessageBlock | TranslationMessageBlock | ThinkingMessageBlock) => {
    const empty = isEmpty(block.content)
    const paused = block.status === 'paused'
    const content = empty && paused ? t('message.chat.completion.paused') : block.content
    return removeSvgEmptyLines(escapeBrackets(content))
  }

  const messageContent = getMessageContent(block)
  const colors = isDark ? markdownColors.dark : markdownColors.light

  const { renderer, tokenizer } = useMarkedRenderer(isDark)

  return (
    <View>
      <Markdown
        theme={{
          colors: {
            code: colors.codeBg,
            link: colors.link,
            text: colors.text,
            border: colors.border
          }
        }}
        value={messageContent}
        renderer={renderer}
        tokenizer={tokenizer}
        flatListProps={{
          initialNumToRender: 8,
          showsVerticalScrollIndicator: false,
          style: {
            backgroundColor: 'transparent'
          },
          scrollEnabled: false,
          nestedScrollEnabled: false
        }}
      />
    </View>
  )
}

export default memo(ReactNativeMarkdown)
