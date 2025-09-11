import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Eye, EyeOff, ShieldCheck } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import { sortBy } from 'lodash'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { Input, Stack, Text, XStack, YStack } from 'tamagui'

import ExternalLink from '@/components/ExternalLink'
import { SettingContainer, SettingGroupTitle, SettingHelpText } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { ApiCheckSheet } from '@/components/settings/providers/ApiCheckSheet'
import { IconButton } from '@/components/ui/IconButton'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { isEmbeddingModel } from '@/config/models'
import { PROVIDER_URLS } from '@/config/providers'
import { useDialog } from '@/hooks/useDialog'
import { useProvider } from '@/hooks/useProviders'
import { ProvidersStackParamList } from '@/navigators/settings/ProvidersStackNavigator'
import { checkApi } from '@/services/ApiService'
import { loggerService } from '@/services/LoggerService'
import { ApiStatus, Model } from '@/types/assistant'
import { haptic } from '@/utils/haptic'
import { getModelUniqId } from '@/utils/model'
const logger = loggerService.withContext('ApiServiceScreen')

type ProviderSettingsRouteProp = RouteProp<ProvidersStackParamList, 'ApiServiceScreen'>

export default function ApiServiceScreen() {
  const { t } = useTranslation()
  const dialog = useDialog()
  const route = useRoute<ProviderSettingsRouteProp>()

  const { providerId } = route.params
  const { provider, isLoading, updateProvider } = useProvider(providerId)

  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Model | undefined>()
  const [checkApiStatus, setCheckApiStatus] = useState<ApiStatus>('idle')
  const [apiKey, setApiKey] = useState(provider?.apiKey || '')
  const [apiHost, setApiHost] = useState(provider?.apiHost || '')

  const bottomSheetRef = useRef<BottomSheetModal>(null)

  // 当 provider 改变时更新本地状态
  React.useEffect(() => {
    if (provider) {
      setApiKey(provider.apiKey || '')
      setApiHost(provider.apiHost || '')
    }
  }, [provider])

  const webSearchProviderConfig = provider?.id ? PROVIDER_URLS[provider.id] : undefined
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

  const selectOptions = !provider.models?.length
    ? []
    : [
        {
          label: provider.isSystem ? t(`provider.${provider.id}`) : provider.name,
          title: provider.name,
          options: sortBy(provider.models, 'name')
            .filter(model => !isEmbeddingModel(model))
            .map(model => ({
              label: model.name,
              value: getModelUniqId(model),
              model
            }))
        }
      ]

  const handleOpenBottomSheet = () => {
    haptic(ImpactFeedbackStyle.Medium)
    bottomSheetRef.current?.present()
  }

  const handleBottomSheetClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  const handleModelChange = (value: string) => {
    if (!value) {
      setSelectedModel(undefined)
      return
    }

    const allOptions = selectOptions.flatMap(group => group.options)
    const foundOption = allOptions.find(opt => opt.value === value)
    setSelectedModel(foundOption?.model)
  }

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prevShowApiKey => !prevShowApiKey)
  }

  const handleProviderConfigChange = async (key: 'apiKey' | 'apiHost', value: string) => {
    if (key === 'apiKey') {
      setApiKey(value)
    } else if (key === 'apiHost') {
      setApiHost(value)
    }

    const updatedProvider = { ...provider, [key]: value }
    await updateProvider(updatedProvider)
  }

  // 模型检测处理
  const handleStartModelCheck = async () => {
    if (!selectedModel || !apiKey) {
      let errorKey = ''

      if (!selectedModel && !apiKey) {
        errorKey = 'model_api_key_empty'
      } else if (!selectedModel) {
        errorKey = 'model_empty'
      } else if (!apiKey) {
        errorKey = 'api_key_empty'
      }

      dialog.open({
        type: 'error',
        title: t('settings.provider.check_failed.title'),
        content: t(`settings.provider.check_failed.${errorKey}`),
        onConFirm: () => handleBottomSheetClose()
      })
      return
    }

    try {
      setCheckApiStatus('processing')
      await checkApi(provider, selectedModel)
      setCheckApiStatus('success')
    } catch (error: any) {
      logger.error('Model check failed:', error)
      const errorMessage =
        error && error.message
          ? ' ' + (error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message)
          : ''

      setCheckApiStatus('error')

      dialog.open({
        type: 'error',
        title: t('settings.provider.check_failed.title'),
        content: errorMessage,
        onConFirm: () => handleBottomSheetClose()
      })
    } finally {
      setTimeout(() => {
        setCheckApiStatus('idle')
        handleBottomSheetClose()
      }, 500)
    }
  }

  return (
    <SafeAreaContainer
      style={{
        flex: 1
      }}>
      <HeaderBar title={t('settings.provider.api_service')} />

      <SettingContainer>
        {/* API Key 配置 */}
        <YStack gap={8}>
          <XStack paddingHorizontal={10} height={20} justifyContent="space-between" alignItems="center">
            <SettingGroupTitle>{t('settings.provider.api_key')}</SettingGroupTitle>
            <IconButton icon={<ShieldCheck size={16} color="$textLink" />} onPress={handleOpenBottomSheet} />
          </XStack>

          <XStack paddingVertical={8} gap={8} position="relative">
            <Input
              paddingVertical={0}
              flex={1}
              placeholder={t('settings.provider.api_key.placeholder')}
              secureTextEntry={!showApiKey}
              paddingRight={48}
              value={apiKey}
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
              {t('settings.provider.api_key.get')}
            </ExternalLink>
          </XStack>
        </YStack>

        {/* API Host 配置 */}
        <YStack gap={8}>
          <XStack paddingHorizontal={10} height={20} alignItems="center">
            <SettingGroupTitle>{t('settings.provider.api_host')}</SettingGroupTitle>
          </XStack>
          <Input
            paddingVertical={0}
            placeholder={t('settings.provider.api_host.placeholder')}
            value={apiHost}
            onChangeText={text => handleProviderConfigChange('apiHost', text)}
            multiline={false}
            numberOfLines={1}
          />
        </YStack>
      </SettingContainer>

      <ApiCheckSheet
        ref={bottomSheetRef}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        selectOptions={selectOptions}
        onStartModelCheck={handleStartModelCheck}
        checkApiStatus={checkApiStatus}
      />
    </SafeAreaContainer>
  )
}
