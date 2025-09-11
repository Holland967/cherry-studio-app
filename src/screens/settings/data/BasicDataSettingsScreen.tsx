import { useNavigation } from '@react-navigation/native'
import { ChevronRight, FileText, Folder, FolderOpen, RotateCcw, Trash2 } from '@tamagui/lucide-icons'
import { reloadAppAsync } from 'expo'
import * as DocumentPicker from 'expo-document-picker'
import { Paths } from 'expo-file-system/next'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PressableSettingRow, SettingContainer, SettingGroup, SettingGroupTitle } from '@/components/settings'
import { RestoreProgressModal } from '@/components/settings/data/RestoreProgressModal'
import { HeaderBar } from '@/components/settings/HeaderBar'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { useDialog } from '@/hooks/useDialog'
import { LOCAL_RESTORE_STEPS, useRestore } from '@/hooks/useRestore'
import { getCacheDirectorySize, resetCacheDirectory } from '@/services/FileService'
import { loggerService } from '@/services/LoggerService'
import { persistor } from '@/store'
import { NavigationProps } from '@/types/naviagate'
import { formatFileSize } from '@/utils/file'

import { resetDatabase } from '../../../../db/queries/reset.queries'
const logger = loggerService.withContext('BasicDataSettingsScreen')

interface SettingItemConfig {
  title: string
  screen?: string
  icon: React.ReactElement
  subtitle?: string
  danger?: boolean
  onPress?: () => void
  disabled?: boolean
}

interface SettingGroupConfig {
  title: string
  items: SettingItemConfig[]
}

export default function BasicDataSettingsScreen() {
  const { t } = useTranslation()
  const dialog = useDialog()
  const [isResetting, setIsResetting] = useState(false)
  const [cacheSize, setCacheSize] = useState<string>('--')
  const { isModalOpen, restoreSteps, overallStatus, startRestore, closeModal } = useRestore({
    stepConfigs: LOCAL_RESTORE_STEPS
  })

  const loadCacheSize = async () => {
    try {
      const size = await getCacheDirectorySize()
      setCacheSize(formatFileSize(size))
    } catch (error) {
      logger.error('loadCacheSize', error as Error)
      setCacheSize('--')
    }
  }

  useEffect(() => {
    loadCacheSize()
  }, [])

  const handleRestore = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/zip' })
    if (result.canceled) return

    const asset = result.assets[0]
    await startRestore({
      name: asset.name,
      uri: asset.uri,
      size: asset.size,
      mimeType: asset.mimeType
    })
  }

  const handleDataReset = async () => {
    if (isResetting) return

    dialog.open({
      type: 'warning',
      title: t('settings.data.reset'),
      content: t('settings.data.reset_warning'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConFirm: async () => {
        setIsResetting(true)

        try {
          await resetDatabase() // reset sqlite
          await persistor.purge() // reset redux
          await resetCacheDirectory() // reset cache
        } catch (error) {
          dialog.open({
            type: 'error',
            title: t('common.error'),
            content: t('settings.data.data_reset.error')
          })
          logger.error('handleDataReset', error as Error)
        } finally {
          setIsResetting(false)
          await reloadAppAsync()
        }
      }
    })
  }

  const handleClearCache = async () => {
    if (isResetting) return

    dialog.open({
      type: 'warning',
      title: t('settings.data.reset'),
      content: t('settings.data.reset_warning'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConFirm: async () => {
        setIsResetting(true)

        try {
          await resetCacheDirectory() // reset cache
          await loadCacheSize() // refresh cache size after clearing
        } catch (error) {
          dialog.open({
            type: 'error',
            title: t('common.error'),
            content: t('settings.data.data_reset.error')
          })
          logger.error('handleDataReset', error as Error)
        } finally {
          setIsResetting(false)
        }
      }
    })
  }

  const handleOpenAppData = async () => {
    try {
      if (Platform.OS === 'android') {
        // Open file manager on Android
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: Paths.document.uri,
          type: 'resource/folder'
        })
      } else {
        // On iOS, we can only share the directory info
        dialog.open({
          type: 'info',
          title: t('settings.data.app_data'),
          content: `${t('settings.data.app_data_location')}: ${Paths.document.uri}`
        })
      }
    } catch (error) {
      logger.error('handleOpenAppData', error as Error)
      dialog.open({
        type: 'info',
        title: t('settings.data.app_data'),
        content: `${t('settings.data.app_data_location')}: ${Paths.document.uri}`
      })
    }
  }

  const handleOpenAppLogs = async () => {
    try {
      const logPath = Paths.join(Paths.document.uri, 'app.log')

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(logPath)
      } else {
        dialog.open({
          type: 'info',
          title: t('settings.data.app_logs'),
          content: `${t('settings.data.log_location')}: ${logPath}`
        })
      }
    } catch (error) {
      logger.error('handleOpenAppLogs', error as Error)
      const logPath = Paths.join(Paths.document.uri, 'app.log')
      dialog.open({
        type: 'info',
        title: t('settings.data.app_logs'),
        content: `${t('settings.data.log_location')}: ${logPath}`
      })
    }
  }

  const settingsItems: SettingGroupConfig[] = [
    {
      title: t('settings.data.title'),
      items: [
        // todo
        // {
        //   title: t('settings.data.backup'),
        //   icon: <Save size={24} />,
        //   onPress: () => {}
        // },
        {
          title: t('settings.data.recovery'),
          icon: <Folder size={24} />,
          onPress: handleRestore
        },
        {
          title: isResetting ? t('common.loading') : t('settings.data.reset'),
          icon: <RotateCcw size={24} color="red" />,
          danger: true,
          onPress: handleDataReset,
          disabled: isResetting
        }
      ]
    },
    {
      title: t('settings.data.data.title'),
      items: [
        {
          title: t('settings.data.app_data'),
          icon: <FolderOpen size={24} />,
          onPress: handleOpenAppData
        },
        {
          title: t('settings.data.app_logs'),
          icon: <FileText size={24} />,
          onPress: handleOpenAppLogs
        },
        {
          title: t('settings.data.clear_cache.button', { cacheSize }),
          icon: <Trash2 size={24} color="red" />,
          danger: true,
          onPress: handleClearCache
        }
      ]
    }
  ]

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <HeaderBar title={t('settings.data.basic_title')} />

      <SettingContainer>
        <YStack gap={24} flex={1}>
          {settingsItems.map(group => (
            <Group key={group.title} title={group.title}>
              {group.items.map(item => (
                <SettingItem key={item.title} {...item} />
              ))}
            </Group>
          ))}
        </YStack>
      </SettingContainer>

      <RestoreProgressModal
        isOpen={isModalOpen}
        steps={restoreSteps}
        overallStatus={overallStatus}
        onClose={closeModal}
      />
    </SafeAreaContainer>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <YStack gap={8}>
      <SettingGroupTitle>{title}</SettingGroupTitle>
      <SettingGroup>{children}</SettingGroup>
    </YStack>
  )
}

function SettingItem({ title, screen, icon, subtitle, danger, onPress, disabled }: SettingItemConfig) {
  const navigation = useNavigation<NavigationProps>()

  const handlePress = () => {
    if (disabled) return

    if (onPress) {
      onPress()
    } else if (screen) {
      navigation.navigate(screen as any)
    }
  }

  return (
    <PressableSettingRow onPress={handlePress} opacity={disabled ? 0.5 : 1}>
      <XStack alignItems="center" gap={12}>
        {icon}
        <YStack>
          <Text fontSize="$5" color={danger ? 'red' : undefined}>
            {title}
          </Text>
          {subtitle && <Text fontSize="$2">{subtitle}</Text>}
        </YStack>
      </XStack>
      {screen && <ChevronRight size={24} color="$colorFocus" />}
    </PressableSettingRow>
  )
}
