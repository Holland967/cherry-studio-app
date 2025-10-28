import React, { FC, memo } from 'react'

import { Assistant } from '@/types/assistant'
import { Message, MessageBlock } from '@/types/message'

import MessageContent from './MessageContent'

interface MessageItemProps {
  message: Message
  assistant?: Assistant
  isMultiModel?: boolean
  messageBlocks: Record<string, MessageBlock[]>
}

const MessageItem: FC<MessageItemProps> = ({ message, assistant, isMultiModel = false, messageBlocks }) => {
  const blocks = messageBlocks[message.id] || []
  return <MessageContent message={message} assistant={assistant} isMultiModel={isMultiModel} blocks={blocks} />
}

export default memo(MessageItem)
