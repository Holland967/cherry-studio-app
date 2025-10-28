import { MotiView } from 'moti'
import React, { FC, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Tabs } from 'tamagui'
import { Text, XStack } from '@/componentsV2'

import { Assistant } from '@/types/assistant'
import { AssistantMessageStatus, GroupedMessage, MessageBlock } from '@/types/message'
import { MultiModalIcon } from '@/componentsV2/icons'
import MessageItem from './Message'
import MessageFooter from './MessageFooter'

interface MultiModelTabProps {
  assistant: Assistant
  messages: GroupedMessage[]
  messageBlocks: Record<string, MessageBlock[]>
}

const MultiModelTab: FC<MultiModelTabProps> = ({ assistant, messages, messageBlocks }) => {
  const [currentTab, setCurrentTab] = useState('0')

  if (!messages || messages.length === 0) {
    return null
  }

  return (
    <View className="flex-1">
      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        gap={5}>
        <Tabs.List>
          <XStack className="flex-1 gap-2 justify-center items-center">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack className="gap-[5px]">
                {messages.map((_message, index) => {
                  const tabValue = index.toString()
                  return (
                    <Tabs.Tab
                      key={tabValue}
                      value={tabValue}
                      gap={4}
                      paddingHorizontal={10}
                      paddingVertical={3}
                      borderRadius={48}
                      justifyContent="center"
                      alignItems="center"
                      style={{ backgroundColor: 'transparent' }}
                      height={26}>
                      {_message.useful && <MultiModalIcon size={14} />}
                      <Text
                        className={`text-xs ${
                          currentTab === tabValue ? 'text-green-100 dark:text-green-dark-100' : undefined
                        }`}>
                        @{_message.model?.name}({_message.model?.provider})
                      </Text>
                    </Tabs.Tab>
                  )
                })}
              </XStack>
            </ScrollView>
          </XStack>
        </Tabs.List>

        {messages.map((message, index) => (
          <Tabs.Content key={index} value={index.toString()}>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{
                translateY: 0,
                opacity: 1
              }}
              exit={{ opacity: 1, translateY: -10 }}
              transition={{
                type: 'timing'
              }}>
              <MessageItem message={message} assistant={assistant} isMultiModel={true} messageBlocks={messageBlocks} />
              {/* 输出过程中不显示footer */}
              {message.status !== AssistantMessageStatus.PROCESSING && (
                <MessageFooter assistant={assistant} message={message} isMultiModel={true} />
              )}
            </MotiView>
          </Tabs.Content>
        ))}
      </Tabs>
    </View>
  )
}

export default MultiModelTab
