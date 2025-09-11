import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Check } from '@tamagui/lucide-icons'
import React, { forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Text, View, XStack, YStack } from 'tamagui'

import {
  MdiLightbulbAutoOutline,
  MdiLightbulbOffOutline,
  MdiLightbulbOn10,
  MdiLightbulbOn50,
  MdiLightbulbOn90
} from '@/components/icons/MdiLightbulbIcon'
import { GEMINI_FLASH_MODEL_REGEX, MODEL_SUPPORTED_OPTIONS } from '@/config/models'
import {
  isDoubaoThinkingAutoModel,
  isSupportedReasoningEffortGrokModel,
  isSupportedThinkingTokenDoubaoModel,
  isSupportedThinkingTokenGeminiModel,
  isSupportedThinkingTokenQwenModel
} from '@/config/models'
import { useTheme } from '@/hooks/useTheme'
import { Assistant, ThinkingOption } from '@/types/assistant'

interface ReasoningSheetProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

const createThinkingIcon = (option?: ThinkingOption) => {
  switch (option) {
    case 'low':
      return <MdiLightbulbOn10 />
    case 'medium':
      return <MdiLightbulbOn50 />
    case 'high':
      return <MdiLightbulbOn90 />
    case 'auto':
      return <MdiLightbulbAutoOutline />
    case 'off':
      return <MdiLightbulbOffOutline />
    default:
      return <MdiLightbulbOffOutline />
  }
}

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
)

export const ReasoningSheet = forwardRef<BottomSheetModal, ReasoningSheetProps>(
  ({ assistant, updateAssistant }, ref) => {
    const { t } = useTranslation()
    const { isDark } = useTheme()
    const model = assistant.model!

    const isGrokModel = isSupportedReasoningEffortGrokModel(model)
    const isGeminiModel = isSupportedThinkingTokenGeminiModel(model)
    const isGeminiFlashModel = GEMINI_FLASH_MODEL_REGEX.test(model?.id || '')
    const isQwenModel = isSupportedThinkingTokenQwenModel(model)
    const isDoubaoModel = isSupportedThinkingTokenDoubaoModel(model)
    const insets = useSafeAreaInsets()

    // Converted from useMemo to a simple const
    const currentReasoningEffort = assistant.settings?.reasoning_effort || 'off'

    const modelType = (() => {
      if (isGeminiModel) {
        return isGeminiFlashModel ? 'gemini' : 'gemini_pro'
      }

      if (isGrokModel) return 'grok'
      if (isQwenModel) return 'qwen'
      if (isDoubaoModel) return 'doubao'
      return 'default'
    })()

    // 获取当前模型支持的选项
    const supportedOptions: ThinkingOption[] = useMemo(() => {
      if (modelType === 'doubao') {
        if (isDoubaoThinkingAutoModel(model)) {
          return ['off', 'auto', 'high']
        }

        return ['off', 'high']
      }

      return MODEL_SUPPORTED_OPTIONS[modelType]
    }, [model, modelType])

    const onValueChange = (option?: ThinkingOption) => {
      const isEnabled = option !== undefined && option !== 'off'

      if (!isEnabled) {
        updateAssistant({
          ...assistant,
          settings: {
            ...assistant.settings,
            reasoning_effort: undefined,
            qwenThinkMode: false
          }
        })
      } else {
        updateAssistant({
          ...assistant,
          settings: {
            ...assistant.settings,
            reasoning_effort: option,
            qwenThinkMode: true
          }
        })
      }

      ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    }

    const sheetOptions = supportedOptions.map(option => ({
      value: option,
      label: t(`assistants.settings.reasoning.${option === 'auto' ? 'auto' : option}`),
      icon: createThinkingIcon(option),
      isSelected: currentReasoningEffort === option,
      action: () => onValueChange(option)
    }))

    return (
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enableDynamicSizing={true}
        ref={ref}
        backgroundStyle={{
          borderRadius: 30,
          backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
        }}>
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
          <YStack gap={10} paddingHorizontal={20} paddingBottom={20}>
            {sheetOptions.map(option => (
              <Button
                key={option.value}
                icon={option.icon}
                onPress={option.action}
                justifyContent="space-between"
                chromeless>
                <XStack flex={1} justifyContent="space-between" alignItems="center">
                  <Text>{option.label}</Text>
                  {option.isSelected ? <Check size={20} /> : <View width={20} />}
                </XStack>
              </Button>
            ))}
          </YStack>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

ReasoningSheet.displayName = 'ReasoningSheet'
