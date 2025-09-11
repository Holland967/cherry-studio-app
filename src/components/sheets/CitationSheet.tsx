import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import * as ExpoLinking from 'expo-linking'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Stack, Text, View, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { loggerService } from '@/services/LoggerService'
import { Citation } from '@/types/websearch'
import { getWebsiteBrand } from '@/utils/websearch'

import FallbackFavicon from '../icons/FallbackFavicon'
const logger = loggerService.withContext('Citation Sheet')

interface CitationSheetProps {
  citations: Citation[]
}

const CitationTitle = ({ number, title }: { number: number; title: string }) => {
  return (
    <XStack gap={11} alignItems="center">
      <Stack
        borderRadius={8}
        borderWidth={0.5}
        padding={3}
        gap={2}
        justifyContent="center"
        alignItems="center"
        borderColor="$green20"
        backgroundColor="$green10"
        minWidth={20}
        minHeight={20}>
        <Text fontSize={10} textAlign="center" color="$green100">
          {number}
        </Text>
      </Stack>
      <Stack flex={1}>
        <Text lineHeight={20} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </Stack>
    </XStack>
  )
}

const Content = ({ content }: { content: string }) => (
  <XStack>
    <Text fontSize={12} lineHeight={16} numberOfLines={2} ellipsizeMode="tail">
      {content}
    </Text>
  </XStack>
)

const Footer = ({ url, title }: { url: string; title: string }) => (
  <XStack gap={6} alignItems="center">
    <FallbackFavicon hostname={new URL(url).hostname} alt={title || ''} />
    <Text lineHeight={20} fontSize={10}>
      {getWebsiteBrand(url)}
    </Text>
  </XStack>
)

const CitationCard = ({ citation, onPress }: { citation: Citation; onPress: (url: string) => void }) => {
  return (
    <View paddingHorizontal={30} paddingVertical={20}>
      <YStack
        gap={5}
        padding={10}
        backgroundColor="$uiCardBackground"
        borderRadius={8}
        onPress={() => onPress(citation.url)}>
        <CitationTitle number={citation.number} title={citation.title || ''} />
        <Content content={citation.content || ''} />
        <Footer url={citation.url} title={citation.title || ''} />
      </YStack>
    </View>
  )
}

const CitationSheet = forwardRef<BottomSheetModal, CitationSheetProps>(({ citations }, ref) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  // 添加背景组件渲染函数
  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  const handlePress = async (url: string) => {
    const supported = await ExpoLinking.canOpenURL(url)

    if (supported) {
      try {
        await ExpoLinking.openURL(url)
      } catch (error) {
        const message = t('errors.cannotOpenLink', {
          error: error instanceof Error ? error.message : String(error)
        })
        logger.error(message, error)
      }
    } else {
      const message = t('errors.deviceCannotHandleLink', { url })
      logger.warn(message)
    }
  }

  return (
    <BottomSheetModal
      snapPoints={['60%']}
      enableDynamicSizing={false}
      ref={ref}
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}>
      <BottomSheetScrollView showsVerticalScrollIndicator={false}>
        <Stack justifyContent="center" alignItems="center" paddingHorizontal={20}>
          <Text fontSize={20} lineHeight={22} fontWeight={600}>
            {t('common.source')}
          </Text>
        </Stack>
        {citations.map((citation, index) => (
          <CitationCard key={index} citation={citation} onPress={handlePress} />
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})

CitationSheet.displayName = 'CitationSheet'

export default CitationSheet
