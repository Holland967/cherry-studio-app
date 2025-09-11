import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { ChevronRight } from '@tamagui/lucide-icons'
import { MotiView } from 'moti'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Stack, Text, XStack } from 'tamagui'

import { SettingGroup, SettingRow } from '@/components/settings'
import { isReasoningModel } from '@/config/models'
import { DEFAULT_CONTEXTCOUNT, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@/constants'
import { Assistant, AssistantSettings, Model } from '@/types/assistant'

import ModelSheet from '../sheets/ModelSheet'
import { ReasoningSheet } from '../sheets/ReasoningSheet'
import { CustomSwitch } from '../ui/Switch'

interface ModelTabContentProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

export function ModelTabContent({ assistant, updateAssistant }: ModelTabContentProps) {
  const { t } = useTranslation()
  const modelSheetRef = useRef<BottomSheetModal>(null)
  const reasoningSheetRef = useRef<BottomSheetModal>(null)

  // Local state for input values
  const [temperatureInput, setTemperatureInput] = useState(
    (assistant.settings?.temperature ?? DEFAULT_TEMPERATURE).toString()
  )
  const [contextInput, setContextInput] = useState(
    (assistant.settings?.contextCount ?? DEFAULT_CONTEXTCOUNT).toString()
  )
  const [maxTokensInput, setMaxTokensInput] = useState((assistant.settings?.maxTokens ?? DEFAULT_MAX_TOKENS).toString())

  // 统一的助手更新函数
  const handleAssistantChange = async (updates: Partial<Assistant>) => {
    const updatedAssistant = { ...assistant, ...updates }
    await updateAssistant(updatedAssistant)
  }

  // 设置更新函数
  const handleSettingsChange = (key: keyof AssistantSettings, value: any) => {
    const updatedSettings = { ...assistant.settings, [key]: value }
    handleAssistantChange({ settings: updatedSettings })
  }

  // 模型更新函数
  const handleModelChange = (models: Model[]) => {
    handleAssistantChange({ model: models[0] })
  }

  const handleModelPress = () => {
    modelSheetRef.current?.present()
  }

  const handleReasoningPress = () => {
    reasoningSheetRef.current?.present()
  }

  const model = assistant?.model ? [assistant.model] : []
  const settings = assistant.settings || {}

  return (
    <MotiView
      style={{ flex: 1, gap: 30 }}
      from={{ opacity: 0, translateY: 10 }}
      animate={{
        translateY: 0,
        opacity: 1
      }}
      exit={{ opacity: 1, translateY: -10 }}
      transition={{
        type: 'timing'
      }}>
      <Button
        chromeless
        height={30}
        paddingHorizontal={16}
        paddingVertical={23}
        iconAfter={<ChevronRight size={16} />}
        backgroundColor="$uiCardBackground"
        onPress={handleModelPress}>
        <XStack height={20} flex={1} alignItems="center" overflow="hidden" justifyContent="space-between">
          {model.length > 0 ? (
            <>
              <Text lineHeight={17} flexShrink={1} numberOfLines={1} ellipsizeMode="tail">
                {t(`provider.${model[0].provider}`)}
              </Text>
              <Text lineHeight={20} fontSize={12} flexShrink={0} numberOfLines={1} maxWidth="60%" ellipsizeMode="tail">
                {model[0].name}
              </Text>
            </>
          ) : (
            <Text lineHeight={20} flex={1} numberOfLines={1} ellipsizeMode="tail">
              {t('settings.models.empty')}
            </Text>
          )}
        </XStack>
      </Button>
      <SettingGroup>
        <SettingRow>
          <Text>{t('assistants.settings.temperature')}</Text>
          <Input
            minWidth={60}
            height={25}
            fontSize={12}
            lineHeight={12 * 1.2}
            textAlign="center"
            value={temperatureInput}
            onChangeText={setTemperatureInput}
            onBlur={() => {
              const parsedValue = parseFloat(temperatureInput)

              if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 1) {
                handleSettingsChange('temperature', parsedValue)
              } else {
                setTemperatureInput((settings.temperature ?? DEFAULT_TEMPERATURE).toString())
              }
            }}
            keyboardType="numeric"
          />
        </SettingRow>
        <SettingRow>
          <Text>{t('assistants.settings.context')}</Text>
          <Input
            minWidth={60}
            height={25}
            fontSize={12}
            lineHeight={12 * 1.2}
            textAlign="center"
            value={contextInput}
            onChangeText={setContextInput}
            onBlur={() => {
              const parsedValue = parseInt(contextInput)

              if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 30) {
                handleSettingsChange('contextCount', parsedValue)
              } else {
                setContextInput((settings.contextCount ?? DEFAULT_CONTEXTCOUNT).toString())
              }
            }}
            keyboardType="numeric"
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingRow>
          <Text>{t('assistants.settings.stream_output')}</Text>
          <CustomSwitch
            checked={settings.streamOutput ?? true}
            onCheckedChange={checked => handleSettingsChange('streamOutput', checked)}
          />
        </SettingRow>
        <SettingRow>
          <Text>{t('assistants.settings.max_tokens')}</Text>
          <CustomSwitch
            checked={settings.enableMaxTokens ?? false}
            onCheckedChange={checked => handleSettingsChange('enableMaxTokens', checked)}
          />
        </SettingRow>
        {settings.enableMaxTokens && (
          <SettingRow>
            <Text>{t('assistants.settings.max_tokens_value')}</Text>
            <Input
              minWidth={60}
              height={25}
              fontSize={12}
              lineHeight={12 * 1.2}
              textAlign="center"
              value={maxTokensInput}
              onChangeText={setMaxTokensInput}
              onBlur={() => {
                const parsedValue = parseInt(maxTokensInput)

                if (!isNaN(parsedValue) && parsedValue > 0) {
                  handleSettingsChange('maxTokens', parsedValue)
                } else {
                  setMaxTokensInput((settings.maxTokens ?? DEFAULT_MAX_TOKENS).toString())
                }
              }}
              keyboardType="numeric"
            />
          </SettingRow>
        )}
        {isReasoningModel(model[0]) && (
          <Button
            backgroundColor="$colorTransparent"
            borderWidth={0}
            iconAfter={ChevronRight}
            onPress={handleReasoningPress}
            justifyContent="space-between"
            paddingVertical={12}
            paddingLeft={16}
            paddingRight={20}>
            <Text flex={1}>{t('assistants.settings.reasoning')}</Text>

            <Stack justifyContent="flex-end">
              <Text
                fontSize={12}
                backgroundColor="$green10"
                borderColor="$green20"
                color="$green100"
                borderWidth={0.5}
                paddingVertical={2}
                paddingHorizontal={8}
                borderRadius={8}>
                {t(`assistants.settings.reasoning.${settings.reasoning_effort || 'off'}`)}
              </Text>
            </Stack>
          </Button>
        )}
      </SettingGroup>
      <ModelSheet ref={modelSheetRef} mentions={model} setMentions={handleModelChange} multiple={false} />
      {model[0] && (
        <ReasoningSheet ref={reasoningSheetRef} assistant={assistant} updateAssistant={handleAssistantChange} />
      )}
    </MotiView>
  )
}
