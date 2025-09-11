import { useNavigation } from '@react-navigation/native'
import { Edit3, Trash2 } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import { FC, useEffect, useRef, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import { Input } from 'tamagui'

import ContextMenu from '@/components/ui/ContextMenu'
import { useTheme } from '@/hooks/useTheme'
import i18n from '@/i18n'
import { getAssistantById } from '@/services/AssistantService'
import { useAppDispatch, useAppSelector } from '@/store'
import { setCurrentTopicId } from '@/store/topic'
import { Assistant, Topic } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { storage } from '@/utils'
import { haptic } from '@/utils/haptic'

import { useDialog } from '../../hooks/useDialog'
import EmojiAvatar from '../assistant/EmojiAvator'

type TimeFormat = 'time' | 'date'

interface TopicItemProps {
  topic: Topic
  timeFormat?: TimeFormat
  onDelete?: (topicId: string) => Promise<void>
  onRename?: (topicId: string, newName: string) => Promise<void>
  handleNavigateChatScreen?: (topicId: string) => void
}

const TopicItem: FC<TopicItemProps> = ({
  topic,
  timeFormat = 'time',
  onDelete,
  onRename,
  handleNavigateChatScreen
}) => {
  const { t } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const dispatch = useAppDispatch()
  const navigation = useNavigation<DrawerNavigationProps>()
  const [assistant, setAssistant] = useState<Assistant>()
  const dialog = useDialog()
  const { isDark } = useTheme()
  const isActive = useAppSelector(state => state.topic.currentTopicId === topic.id)

  const openTopic = () => {
    dispatch(setCurrentTopicId(topic.id))

    if (handleNavigateChatScreen) {
      handleNavigateChatScreen(topic.id)
    } else {
      haptic(ImpactFeedbackStyle.Medium)
      navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId: topic.id } })
    }
  }

  const date = new Date(topic.updatedAt)
  const displayTime =
    timeFormat === 'date'
      ? date.toLocaleDateString(currentLanguage, {
          month: 'short',
          day: 'numeric'
        })
      : date.toLocaleTimeString(currentLanguage, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

  useEffect(() => {
    const fetchCurrentLanguage = () => {
      const storedLanguage = storage.getString('language')

      if (storedLanguage) {
        setCurrentLanguage(storedLanguage)
      }
    }

    const fetchAssistant = async () => {
      setAssistant(await getAssistantById(topic.assistantId))
    }

    fetchCurrentLanguage()
    fetchAssistant()
  }, [topic.assistantId])

  const tempNameRef = useRef(topic.name)

  const handleRename = () => {
    dialog.open({
      title: t('topics.rename.title'),
      confirmText: t('common.save'),
      cancelText: t('common.cancel'),
      content: (
        <Input
          width="100%"
          marginTop={8}
          backgroundColor="$colorTransparent"
          defaultValue={topic.name}
          onChangeText={value => {
            tempNameRef.current = value
          }}
          autoFocus
          placeholder={t('common.please_enter') || ''}
        />
      ),
      onConFirm: () => {
        handleSaveRename(tempNameRef.current)
      }
    })
  }

  const handleSaveRename = (newName: string) => {
    if (newName && newName.trim() && newName.trim() !== topic.name) {
      try {
        onRename?.(topic.id, newName.trim())
      } catch (error) {
        dialog.open({
          type: 'error',
          title: t('common.error_occurred'),
          content: (error as Error).message || 'Unknown error'
        })
      }
    }
  }

  return (
    <ContextMenu
      borderRadius={16}
      list={[
        {
          title: t('common.rename'),
          iOSIcon: 'rectangle.and.pencil.and.ellipsis',
          androidIcon: <Edit3 size={16} color="$textPrimary" />,
          onSelect: handleRename
        },
        {
          title: t('common.delete'),
          iOSIcon: 'trash',
          androidIcon: <Trash2 size={16} color="red" />,
          destructive: true,
          color: 'red',
          onSelect: () => onDelete?.(topic.id)
        }
      ]}
      onPress={openTopic}>
      <XStack
        borderRadius={18}
        paddingVertical={5}
        paddingHorizontal={5}
        gap={14}
        justifyContent="center"
        alignItems="center"
        backgroundColor={isActive ? '$green10' : 'transparent'}>
        <EmojiAvatar
          emoji={assistant?.emoji}
          size={40}
          borderRadius={16}
          borderWidth={3}
          borderColor={isDark ? '#444444' : '#ffffff'}
        />
        <YStack flex={1} gap={4}>
          <XStack justifyContent="space-between">
            <Text fontSize={16} lineHeight={16} fontWeight="bold" color="$textPrimary">
              {assistant?.name}
            </Text>
            <Text fontSize={12} color="$textSecondary">
              {displayTime}
            </Text>
          </XStack>
          <Text
            fontSize={13}
            lineHeight={13}
            numberOfLines={1}
            ellipsizeMode="tail"
            fontWeight="400"
            color="$textSecondary">
            {topic.name}
          </Text>
        </YStack>
      </XStack>
    </ContextMenu>
  )
}

export default TopicItem
