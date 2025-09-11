import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Eye, EyeOff, ShieldCheck } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { Button, Input, Stack, Text, XStack, YStack } from 'tamagui'

import ExternalLink from '@/components/ExternalLink'
import { SettingContainer, SettingGroupTitle, SettingHelpText } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { ApiCheckSheet } from '@/components/settings/websearch/ApiCheckSheet'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { WEB_SEARCH_PROVIDER_CONFIG } from '@/config/websearchProviders'
import { useDialog } from '@/hooks/useDialog'
import { useWebSearchProvider } from '@/hooks/useWebsearchProviders'
import { WebSearchStackParamList } from '@/navigators/settings/WebSearchStackNavigator'
import WebSearchService from '@/services/WebSearchService'
import { ApiStatus } from '@/types/assistant'
import { haptic } from '@/utils/haptic'

type WebsearchProviderSettingsRouteProp = RouteProp<WebSearchStackParamList, 'WebSearchProviderSettingsScreen'>

export default function WebSearchProviderSettingsScreen() {
  const { t } = useTranslation()
  const dialog = useDialog()
  const route = useRoute<WebsearchProviderSettingsRouteProp>()

  const [showApiKey, setShowApiKey] = useState(false)
  const [checkApiStatus, setCheckApiStatus] = useState<ApiStatus>('idle')

  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const { providerId } = route.params
  const { provider, isLoading, updateProvider } = useWebSearchProvider(providerId)
  const webSearchProviderConfig = provider?.id ? WEB_SEARCH_PROVIDER_CONFIG[provider.id] : undefined
  const apiKeyWebsite = webSearchProviderConfig?.websites?.apiKey

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
    haptic(ImpactFeedbackStyle.Medium)
    bottomSheetRef.current?.present()
  }

  const handleBottomSheetClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prevShowApiKey => !prevShowApiKey)
  }

  const handleProviderConfigChange = async (key: 'apiKey' | 'apiHost', value: string) => {
    const updatedProvider = { ...provider, [key]: value }
    await updateProvider(updatedProvider)
  }

  async function checkSearch() {
    // TODO : 支持多个 API Key 检测
    if (!provider) return
    setCheckApiStatus('processing')

    try {
      const { valid, error } = await WebSearchService.checkSearch(provider)
      const errorMessage =
        error && error?.message
          ? ' ' + (error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message)
          : ''

      if (valid) {
        setCheckApiStatus('success')
      } else {
        dialog.open({
          type: 'error',
          title: t('settings.websearch.check_fail'),
          content: errorMessage,
          onConFirm: () => handleBottomSheetClose()
        })
      }
    } catch (error) {
      dialog.open({
        type: 'error',
        title: t('settings.websearch.check_error'),
        content: t('common.error_occurred'),
        onConFirm: () => handleBottomSheetClose()
      })
      throw error
    } finally {
      setTimeout(() => {
        setCheckApiStatus('idle')
        handleBottomSheetClose()
      }, 500)
    }
  }

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <HeaderBar title={provider.name} />
      <SettingContainer>
        {/* API Key 配置 */}
        {provider.type === 'api' && (
          <YStack gap={8}>
            <XStack paddingHorizontal={10} height={20} justifyContent="space-between" alignItems="center">
              <SettingGroupTitle>{t('settings.websearch.api_key')}</SettingGroupTitle>
              <Button
                size={16}
                icon={<ShieldCheck size={16} color="$textLink" />}
                backgroundColor="$colorTransparent"
                circular
                onPress={handleOpenBottomSheet}
              />
            </XStack>

            <XStack paddingVertical={8} gap={8} position="relative">
              <Input
                paddingVertical={0}
                flex={1}
                placeholder={t('settings.websearch.api_key.placeholder')}
                secureTextEntry={!showApiKey}
                paddingRight={48}
                value={provider?.apiKey || ''}
                onChangeText={text => handleProviderConfigChange('apiKey', text)}
                fontSize={14}
                multiline={false}
                numberOfLines={1}
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
                onPress={toggleApiKeyVisibility}
                cursor="pointer">
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Stack>
            </XStack>

            <XStack justifyContent="space-between">
              <SettingHelpText>{t('settings.provider.api_key.tip')}</SettingHelpText>
              <ExternalLink href={apiKeyWebsite} size={12}>
                {t('settings.websearch.api_key.get')}
              </ExternalLink>
            </XStack>
          </YStack>
        )}

        {/* API Host 配置 */}
        <YStack gap={8}>
          <XStack paddingHorizontal={10} height={20} alignItems="center">
            <SettingGroupTitle>{t('settings.websearch.api_host')}</SettingGroupTitle>
          </XStack>
          <Input
            paddingVertical={0}
            placeholder={t('settings.websearch.api_host.placeholder')}
            value={provider?.apiHost || ''}
            onChangeText={text => handleProviderConfigChange('apiHost', text)}
            multiline={false}
            numberOfLines={1}
          />
        </YStack>
      </SettingContainer>
      <ApiCheckSheet ref={bottomSheetRef} onStartModelCheck={checkSearch} checkApiStatus={checkApiStatus} />
    </SafeAreaContainer>
  )
}
