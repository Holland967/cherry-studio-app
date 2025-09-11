import { useNavigation } from '@react-navigation/native'
import { Trash2 } from '@tamagui/lucide-icons'
import { isEmpty } from 'lodash'
import { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import ContextMenu, { ContextMenuListProps } from '@/components/ui/ContextMenu'
import { useToast } from '@/hooks/useToast'
import { getCurrentTopicId } from '@/hooks/useTopic'
import { deleteAssistantById } from '@/services/AssistantService'
import { loggerService } from '@/services/LoggerService'
import { deleteTopicsByAssistantId, isTopicOwnedByAssistant } from '@/services/TopicService'
import { Assistant } from '@/types/assistant'
import { HomeNavigationProps } from '@/types/naviagate'
import { haptic } from '@/utils/haptic'

import EmojiAvatar from './EmojiAvator'

const logger = loggerService.withContext('Assistant Item')
import { useTheme } from '@/hooks/useTheme'

interface AssistantItemProps {
  assistant: Assistant
  onAssistantPress: (assistant: Assistant) => void
}

const AssistantItem: FC<AssistantItemProps> = ({ assistant, onAssistantPress }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<HomeNavigationProps>()
  const toast = useToast()
  const { isDark } = useTheme()
  const handlePress = () => {
    haptic()
    onAssistantPress(assistant)
  }

  const handleDelete = async () => {
    try {
      // 如果当前删除的assistant包含current topic 就navigate到home screen获取default topic
      if (await isTopicOwnedByAssistant(assistant.id, getCurrentTopicId())) {
        navigation.navigate('ChatScreen', { topicId: 'new' })
      }

      await deleteAssistantById(assistant.id)
      await deleteTopicsByAssistantId(assistant.id)
      toast.show(t('message.assistant_deleted'))
    } catch (error) {
      logger.error('Delete Assistant error', error)
    }
  }

  const contextMenuItems: ContextMenuListProps[] = [
    {
      title: t('common.delete'),
      iOSIcon: 'trash',
      androidIcon: <Trash2 size={16} color="red" />,
      destructive: true,
      color: 'red',
      onSelect: handleDelete
    }
  ]

  return (
    <ContextMenu borderRadius={16} list={contextMenuItems} onPress={handlePress}>
      <XStack
        paddingVertical={10}
        paddingHorizontal={10}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={16}
        backgroundColor="$uiCardBackground">
        <XStack gap={14} flex={1}>
          <EmojiAvatar
            emoji={assistant.emoji}
            size={46}
            borderRadius={18}
            borderWidth={3}
            borderColor={isDark ? '#333333' : '#f7f7f7'}
          />
          <YStack gap={4} flex={1} justifyContent="center">
            <Text fontSize={14} numberOfLines={1} ellipsizeMode="tail" fontWeight="bold" color="$textPrimary">
              {assistant.name}
            </Text>
            {!isEmpty(assistant.prompt) && (
              <Text ellipsizeMode="tail" numberOfLines={1} fontSize={12} lineHeight={18} color="$textSecondary">
                {assistant.prompt}
              </Text>
            )}
          </YStack>
        </XStack>
      </XStack>
    </ContextMenu>
  )
}

export default AssistantItem
