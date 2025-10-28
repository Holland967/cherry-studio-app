import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Container, HeaderBar, PressableRow, SafeAreaContainer, Text, XStack, YStack } from '@/componentsV2'
import { defaultLanguage, languagesOptions } from '@/config/languages'
import { useBuiltInAssistants } from '@/hooks/useAssistant'
import { GeneralSettingsNavigationProps } from '@/types/naviagate'
import { storage } from '@/utils'

export default function LanguageChangeScreen() {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation<GeneralSettingsNavigationProps>()
  const [currentLanguage, setCurrentLanguage] = useState<string>(storage.getString('language') || defaultLanguage)
  const { resetBuiltInAssistants } = useBuiltInAssistants()

  const changeLanguage = async (langCode: string) => {
    storage.set('language', langCode)
    await i18n.changeLanguage(langCode)
    setCurrentLanguage(langCode)
    navigation.goBack()
  }

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode)
    resetBuiltInAssistants()
  }

  return (
    <SafeAreaContainer className="flex-1">
      <HeaderBar title={t('settings.general.language.title')} />
      <Container>
        <YStack className="flex-1 gap-3 px-4">
          {languagesOptions.map(opt => (
            <PressableRow
              key={opt.value}
              onPress={() => handleLanguageChange(opt.value)}
              className="bg-ui-card-background dark:bg-ui-card-background-dark p-4 rounded-xl">
              <XStack className="items-center gap-3">
                <Text className="text-base">{opt.flag}</Text>
                <Text className="text-base">{opt.label}</Text>
              </XStack>

              <XStack
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  currentLanguage === opt.value
                    ? 'border-gray-900 dark:border-gray-100'
                    : 'border-gray-400 dark:border-gray-600'
                }`}>
                {currentLanguage === opt.value && (
                  <XStack className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-gray-100" />
                )}
              </XStack>
            </PressableRow>
          ))}
        </YStack>
      </Container>
    </SafeAreaContainer>
  )
}
