import { BottomSheetBackdrop, BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import React, { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Text, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { loggerService } from '@/services/LoggerService'
import { Model, Provider } from '@/types/assistant'
import { getDefaultGroupName } from '@/utils/naming'

const logger = loggerService.withContext('AddModelSheet')

interface AddModelSheetProps {
  provider?: Provider
  updateProvider: (provider: Provider) => Promise<void>
}

const AddModelSheet = forwardRef<BottomSheetModal, AddModelSheetProps>(({ provider, updateProvider }, ref) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const [modelId, setModelId] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelGroup, setModelGroup] = useState('')
  const insets = useSafeAreaInsets()

  useEffect(() => {
    setModelName(modelId)
    setModelGroup(getDefaultGroupName(modelId, provider?.id))
  }, [modelId, provider?.id])

  const handleAddModel = async () => {
    if (!provider || !modelId.trim()) {
      logger.warn('Provider not available or Model ID is required.')
      return
    }

    if (provider.models.some(model => model.id === modelId.trim())) {
      logger.warn('Model ID already exists.', { modelId: modelId.trim() })
      return
    }

    const newModel: Model = {
      id: modelId,
      provider: provider.id,
      name: modelName,
      group: modelGroup
    }

    const updatedProvider: Provider = {
      ...provider,
      models: [...provider.models, newModel]
    }

    try {
      await updateProvider(updatedProvider)
      logger.info('Successfully added model:', newModel)
      ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    } catch (error) {
      logger.error('Failed to add model:', error)
    } finally {
      setModelId('')
      setModelName('')
      setModelGroup('')
    }
  }

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  return (
    <BottomSheetModal
      enableDynamicSizing={true}
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <YStack alignItems="center" paddingTop={10} paddingBottom={30} paddingHorizontal={20} gap={10}>
            <XStack width="100%" alignItems="center" justifyContent="center">
              <Text fontSize={24}>{t('settings.models.add.model')}</Text>
            </XStack>
            <YStack width="100%" gap={24} justifyContent="center" alignItems="center">
              {/* Model ID Input */}
              <YStack width="100%" gap={8}>
                <XStack gap={8}>
                  <Text color="red">*</Text>
                  <Text>{t('settings.models.add.model.id')}</Text>
                </XStack>
                <BottomSheetTextInput
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#19191C' : '#ffffffff',
                    borderWidth: 1,
                    borderColor: '#a0a1b066',
                    color: isDark ? '#f9f9f9ff' : '#202020ff'
                  }}
                  placeholder={t('settings.models.add.model.id.placeholder')}
                  value={modelId}
                  onChangeText={setModelId}
                />
              </YStack>
              {/* Model Name Input */}
              <YStack width="100%" gap={8}>
                <Text>{t('settings.models.add.model.name')}</Text>
                <BottomSheetTextInput
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#19191C' : '#ffffffff',
                    borderWidth: 1,
                    borderColor: '#a0a1b066',
                    color: isDark ? '#f9f9f9ff' : '#202020ff'
                  }}
                  placeholder={t('settings.models.add.model.name.placeholder')}
                  value={modelName}
                  onChangeText={setModelName}
                />
              </YStack>
              {/* Model Group Input */}
              <YStack width="100%" gap={8}>
                <Text>{t('settings.models.add.model.group')}</Text>
                <BottomSheetTextInput
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#19191C' : '#ffffffff',
                    borderWidth: 1,
                    borderColor: '#a0a1b066',
                    color: isDark ? '#f9f9f9ff' : '#202020ff'
                  }}
                  placeholder={t('settings.models.add.model.group.placeholder')}
                  value={modelGroup}
                  onChangeText={setModelGroup}
                />
              </YStack>
              <Button
                backgroundColor="$green10"
                borderColor="$green20"
                color="$green100"
                height={44}
                width={216}
                borderRadius={15}
                onPress={handleAddModel}
                disabled={!modelId.trim()}>
                {t('settings.models.add.model')}
              </Button>
            </YStack>
          </YStack>
        </TouchableWithoutFeedback>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

export { AddModelSheet }
