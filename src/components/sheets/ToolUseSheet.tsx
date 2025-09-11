import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { SquareFunction, Wrench } from '@tamagui/lucide-icons'
import { forwardRef } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Text, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { Assistant } from '@/types/assistant'

interface ToolUseSheetProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

const ToolUseSheet = forwardRef<BottomSheetModal, ToolUseSheetProps>(({ assistant, updateAssistant }, ref) => {
  const { isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  const toolUseOptions = [
    {
      id: 'function' as const,
      name: t('assistants.settings.tooluse.function'),
      icon: <SquareFunction size={20} />
    },
    {
      id: 'prompt' as const,
      name: t('assistants.settings.tooluse.prompt'),
      icon: <Wrench size={20} />
    }
  ]

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  const handleToolUseModeToggle = async (mode: 'function' | 'prompt') => {
    const newToolUseMode = mode === assistant.settings?.toolUseMode ? undefined : mode
    await updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        toolUseMode: newToolUseMode
      }
    })
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
  }

  return (
    <BottomSheetModal
      snapPoints={['25%']}
      enableDynamicSizing={true}
      ref={ref}
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>
        <YStack gap={5} paddingHorizontal={20} paddingBottom={20}>
          <YStack gap={5} padding="20">
            {toolUseOptions.map(option => (
              <Button
                key={option.id}
                onPress={() => handleToolUseModeToggle(option.id)}
                justifyContent="space-between"
                chromeless
                paddingHorizontal={8}
                paddingVertical={8}
                borderColor={assistant.settings?.toolUseMode === option.id ? '$green20' : 'transparent'}
                backgroundColor={assistant.settings?.toolUseMode === option.id ? '$green10' : 'transparent'}>
                <XStack gap={8} flex={1} alignItems="center" justifyContent="space-between" width="100%">
                  <XStack gap={8} flex={1} alignItems="center" maxWidth="80%">
                    {/* Tool use mode icon */}
                    <XStack justifyContent="center" alignItems="center" flexShrink={0}>
                      {option.icon}
                    </XStack>
                    {/* Tool use mode name */}
                    <Text color="$textPrimary" numberOfLines={1} ellipsizeMode="tail" flex={1}>
                      {option.name}
                    </Text>
                  </XStack>
                  <XStack gap={8} alignItems="center" flexShrink={0}></XStack>
                </XStack>
              </Button>
            ))}
          </YStack>
        </YStack>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

export default ToolUseSheet
