import { BottomSheetBackdrop, BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { File, Paths } from 'expo-file-system/next'
import { forwardRef, useEffect, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Text, XStack, YStack } from 'tamagui'

import { useDialog } from '@/hooks/useDialog'
import { useTheme } from '@/hooks/useTheme'
import { fileStorageDir, uploadFiles } from '@/services/FileService'
import { loggerService } from '@/services/LoggerService'
import { saveProvider } from '@/services/ProviderService'
import { Provider, ProviderType } from '@/types/assistant'
import { FileMetadata } from '@/types/file'
import { uuid } from '@/utils'

import { ProviderIconButton } from './ProviderIconButton'
import { ProviderSelect } from './ProviderSelect'

const logger = loggerService.withContext('ProviderSheet')

interface ProviderSheetProps {
  mode?: 'add' | 'edit'
  editProvider?: Provider
  onSave?: (provider: Provider) => void
}

const ProviderSheet = forwardRef<BottomSheetModal, ProviderSheetProps>(
  ({ mode = 'add', editProvider, onSave }, ref) => {
    const { t } = useTranslation()
    const { isDark } = useTheme()
    const insets = useSafeAreaInsets()
    const dialog = useDialog()
    const [providerId, setProviderId] = useState(() => editProvider?.id || uuid())

    const [providerName, setProviderName] = useState(editProvider?.name || '')
    const [selectedProviderType, setSelectedProviderType] = useState<ProviderType | undefined>(
      editProvider?.type || undefined
    )
    const [selectedImageFile, setSelectedImageFile] = useState<Omit<FileMetadata, 'md5'> | null>(null)

    // 当 editProvider 变化时，更新表单字段
    useEffect(() => {
      if (editProvider) {
        setProviderId(editProvider.id)
        setProviderName(editProvider.name || '')
        setSelectedProviderType(editProvider.type || undefined)
      } else {
        setProviderId(uuid())
        setProviderName('')
        setSelectedProviderType(undefined)
      }
    }, [editProvider])

    const renderBackdrop = (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
    )

    const handleImageSelected = (file: Omit<FileMetadata, 'md5'> | null) => {
      setSelectedImageFile(file)
    }

    // Helper function to upload provider image
    const uploadProviderImage = async (file: Omit<FileMetadata, 'md5'> | null) => {
      if (file) {
        await uploadFiles([file])
      }
    }

    // Helper function to create provider data
    const createProviderData = (): Provider => {
      if (mode === 'edit' && editProvider) {
        return {
          ...editProvider,
          name: providerName,
          type: selectedProviderType ?? editProvider.type
        }
      }

      return {
        id: providerId,
        type: selectedProviderType ?? 'openai',
        name: providerName,
        apiKey: '',
        apiHost: '',
        models: []
      }
    }

    const handleSaveProvider = async () => {
      try {
        await uploadProviderImage(selectedImageFile)
        const providerData = createProviderData()
        await saveProvider(providerData)
        onSave?.(providerData)
        ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
      } catch (error) {
        logger.error('handleSaveProvider', error as Error)
        dialog.open({
          type: 'error',
          title: t('common.error_occurred'),
          content: error instanceof Error ? error.message : t('common.unknown_error')
        })
      } finally {
        if (mode === 'add') {
          setSelectedProviderType(undefined)
          setProviderName('')
          setSelectedImageFile(null)
        }
      }
    }

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
                <Text fontSize={24}>
                  {mode === 'edit' ? t('settings.provider.edit.title') : t('settings.provider.add.title')}
                </Text>
              </XStack>
              <YStack width="100%" gap={24} justifyContent="center" alignItems="center">
                <ProviderIconButton
                  providerId={providerId}
                  iconUri={mode === 'edit' ? new File(Paths.join(fileStorageDir, `${providerId}.png`)).uri : undefined}
                  onImageSelected={handleImageSelected}
                />
                <YStack width="100%" gap={8}>
                  <XStack gap={8}>
                    <Text color="red">*</Text>
                    <Text>{t('settings.provider.add.name')}</Text>
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
                    placeholder={t('settings.provider.add.name.placeholder')}
                    value={providerName}
                    onChangeText={setProviderName}
                  />
                </YStack>
                <ProviderSelect
                  value={selectedProviderType}
                  onValueChange={setSelectedProviderType}
                  placeholder={t('settings.provider.add.type')}
                />
                <Button
                  backgroundColor="$green10"
                  borderColor="$green20"
                  color="$green100"
                  height={44}
                  width={216}
                  borderRadius={15}
                  paddingVertical={10}
                  paddingHorizontal={15}
                  fontSize={16}
                  onPress={handleSaveProvider}>
                  {mode === 'edit' ? t('common.save') : t('settings.provider.add.title')}
                </Button>
              </YStack>
            </YStack>
          </TouchableWithoutFeedback>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

export { ProviderSheet }
