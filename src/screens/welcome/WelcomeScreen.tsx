import { useNavigation } from '@react-navigation/native'
import React, { useRef } from 'react'
import { View } from 'react-native'

import { Image, SafeAreaContainer, YStack } from '@/componentsV2'
import { useAppState } from '@/hooks/useAppState'
import { useCurrentTopic } from '@/hooks/useTopic'
import { getDefaultAssistant } from '@/services/AssistantService'
import { topicService } from '@/services/TopicService'
import { RootNavigationProps } from '@/types/naviagate'
import { Button } from 'heroui-native'
import { useTranslation } from 'react-i18next'
import FastSquircleView from 'react-native-fast-squircle'
import WelcomeTitle from './WelcomeTitle'
import { ImportDataSheet } from './ImportDataSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

export default function WelcomeScreen() {
  const navigation = useNavigation<RootNavigationProps>()
  const { setWelcomeShown } = useAppState()
  const { switchTopic } = useCurrentTopic()
  const { t } = useTranslation()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const handleStart = async () => {
    const defaultAssistant = await getDefaultAssistant()
    const newTopic = await topicService.createTopic(defaultAssistant)
    navigation.navigate('HomeScreen', {
      screen: 'Home',
      params: {
        screen: 'ChatScreen',
        params: { topicId: newTopic.id }
      }
    })
    await switchTopic(newTopic.id)
    await setWelcomeShown(true)
  }

  return (
    <>
      <SafeAreaContainer style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 0 }}>
        <View className="flex-1 justify-center items-center gap-5">
          <FastSquircleView
            style={{
              width: 176,
              height: 176,
              borderRadius: 35,
              overflow: 'hidden'
            }}
            cornerSmoothing={0.6}>
            <Image className="w-full h-full" source={require('@/assets/images/favicon.png')} />
          </FastSquircleView>
          <View className="items-center justify-center px-4">
            <View className="flex-row items-center justify-center flex-wrap">
              <WelcomeTitle className="text-3xl font-bold text-center" />
              <View className="w-7 h-7 ml-2 rounded-full bg-black dark:bg-white" />
            </View>
          </View>
        </View>
        {/* register and login*/}
        <View className="justify-center items-center h-1/4 w-full bg-ui-card-background dark:bg-ui-card-background-dark ">
          <YStack className="flex-1 justify-center items-center gap-5">
            <Button className="w-3/4" variant="primary" onPress={() => bottomSheetModalRef.current?.present()}>
              <Button.Label className="w-full text-lg text-center">
                {t('common.import_from_cherry_studio')}
              </Button.Label>
            </Button>

            <Button className="w-3/4" variant="secondary" onPress={handleStart}>
              <Button.Label className="w-full text-lg text-center">{t('common.start')}</Button.Label>
            </Button>
          </YStack>
        </View>
        <ImportDataSheet ref={bottomSheetModalRef} handleStart={handleStart} />
      </SafeAreaContainer>
    </>
  )
}
