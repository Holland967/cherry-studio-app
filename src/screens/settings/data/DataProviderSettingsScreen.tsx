import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Eye, EyeOff, ShieldCheck } from '@tamagui/lucide-icons'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { Button, Input, Stack, Text, XStack, YStack } from 'tamagui'

import ExternalLink from '@/components/ExternalLink'
import { SettingContainer, SettingGroupTitle } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { ApiCheckSheet } from '@/components/settings/websearch/ApiCheckSheet'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { CustomSwitch } from '@/components/ui/Switch'
import { useDataBackupProvider } from '@/hooks/useDataBackup'
import { useDialog } from '@/hooks/useDialog'
import { loggerService } from '@/services/LoggerService'
import { ApiStatus } from '@/types/assistant'
const logger = loggerService.withContext('ProviderSettingsScreen')

export type ProviderField = {
  type: 'input' | 'password' | 'switch'
  key: string
  titleKey: string
  placeholderKey?: string
  helpUrl?: string
  helpTextKey?: string
  descriptionKey?: string
}

export type ProviderConfig = {
  providerType: string
  titleKey: string
  fields: ProviderField[]
  checkConnectionFn: () => Promise<void>
}

export default function ProviderSettingsScreen({ config }: { config: ProviderConfig }) {
  const { t } = useTranslation()
  const dialog = useDialog()

  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [checkApiStatus, setCheckApiStatus] = useState<ApiStatus>('idle')
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const { provider, isLoading, updateProvider } = useDataBackupProvider(config.providerType)

  if (isLoading) {
    return (
      <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaContainer>
    )
  }

  if (!provider) {
    return (
      <SafeAreaContainer>
        <HeaderBar title={t('settings.provider.not_found')} />
        <SettingContainer>
          <Text textAlign="center" color="$gray10" paddingVertical={24}>
            {t('settings.provider.not_found_message')}
          </Text>
        </SettingContainer>
      </SafeAreaContainer>
    )
  }

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.present()
  }

  const handleBottomSheetClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleProviderConfigChange = async (key: string, value: any) => {
    try {
      if (!provider) return

      const updatedProvider = {
        ...provider,
        [key]: value
      }

      await updateProvider(updatedProvider)
      logger.info('Provider config updated:', key, value)
    } catch (error) {
      logger.error('Error updating provider config:', error)
      dialog.open({
        type: 'error',
        title: t('common.error'),
        content: t(`settings.${config.providerType}.update.fail`)
      })
    }
  }

  async function checkConnection() {
    setCheckApiStatus('processing')

    try {
      await config.checkConnectionFn()
      setCheckApiStatus('success')
    } catch (error) {
      setCheckApiStatus('error')
      throw error
    } finally {
      setCheckApiStatus('idle')
    }
  }

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <HeaderBar title={t(config.titleKey)} />
      <SettingContainer>
        {config.fields.map((field, index) => (
          <YStack key={index} gap={8}>
            {field.type === 'input' && (
              <>
                <XStack paddingHorizontal={10} height={20} alignItems="center">
                  <SettingGroupTitle>{t(field.titleKey)}</SettingGroupTitle>
                </XStack>
                <Input
                  paddingVertical={0}
                  fontSize={14}
                  lineHeight={14 * 1.2}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : ''}
                  value={provider[field.key] || ''}
                  onChangeText={text => handleProviderConfigChange(field.key, text)}
                />
                {field.helpUrl && field.helpTextKey && (
                  <XStack justifyContent="space-between">
                    <ExternalLink href={field.helpUrl} size={12}>
                      {t(field.helpTextKey)}
                    </ExternalLink>
                  </XStack>
                )}
              </>
            )}

            {field.type === 'password' && (
              <>
                <XStack paddingHorizontal={10} height={20} justifyContent="space-between" alignItems="center">
                  <SettingGroupTitle>{t(field.titleKey)}</SettingGroupTitle>
                  <Button
                    size={16}
                    icon={<ShieldCheck size={16} />}
                    backgroundColor="$colorTransparent"
                    circular
                    onPress={handleOpenBottomSheet}
                  />
                </XStack>

                <XStack paddingVertical={8} gap={8} position="relative">
                  <Input
                    paddingVertical={0}
                    flex={1}
                    placeholder={field.placeholderKey ? t(field.placeholderKey) : ''}
                    secureTextEntry={!showApiKey[field.key]}
                    paddingRight={48}
                    value={provider[field.key] || ''}
                    onChangeText={text => handleProviderConfigChange(field.key, text)}
                  />
                  <Stack
                    position="absolute"
                    right={10}
                    top="50%"
                    height={16}
                    width={16}
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1}
                    onPress={() => toggleApiKeyVisibility(field.key)}
                    cursor="pointer">
                    {showApiKey[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Stack>
                </XStack>

                {field.helpUrl && field.helpTextKey && (
                  <XStack justifyContent="space-between">
                    <ExternalLink href={field.helpUrl} size={12}>
                      {t(field.helpTextKey)}
                    </ExternalLink>
                  </XStack>
                )}
              </>
            )}

            {field.type === 'switch' && (
              <>
                <XStack paddingHorizontal={10} height={20} justifyContent="space-between">
                  <SettingGroupTitle>{t(field.titleKey)}</SettingGroupTitle>
                  <CustomSwitch
                    checked={provider[field.key] || false}
                    onCheckedChange={value => handleProviderConfigChange(field.key, value)}
                  />
                </XStack>
                {field.descriptionKey && (
                  <Text fontSize="$3" color="$gray11" paddingHorizontal={10}>
                    {t(field.descriptionKey)}
                  </Text>
                )}
              </>
            )}
          </YStack>
        ))}
      </SettingContainer>
      <ApiCheckSheet ref={bottomSheetRef} onStartModelCheck={checkConnection} checkApiStatus={checkApiStatus} />
    </SafeAreaContainer>
  )
}
