import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { ChevronsRight } from '@tamagui/lucide-icons'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Spinner, Text, View, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { ApiStatus } from '@/types/assistant'

interface ApiCheckSheetProps {
  onStartModelCheck: () => void
  checkApiStatus: ApiStatus
}

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
)

export const ApiCheckSheet = forwardRef<BottomSheetModal, ApiCheckSheetProps>(
  ({ onStartModelCheck, checkApiStatus }, ref) => {
    const { t } = useTranslation()

    const { isDark } = useTheme()

    return (
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enableDynamicSizing={true}
        ref={ref}
        backgroundStyle={{
          borderRadius: 30,
          backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
        }}>
        <BottomSheetView>
          <YStack alignItems="center" paddingTop={10} paddingBottom={30} paddingHorizontal={20} gap={10}>
            <XStack width="100%" alignItems="center" justifyContent="center">
              <Text fontSize={24}>{t('settings.provider.api_check.title')}</Text>
            </XStack>
            <XStack width="100%" alignItems="center" justifyContent="center">
              <Button
                height={60}
                width={224}
                borderRadius={70}
                backgroundColor="$color1"
                disabled={checkApiStatus === 'processing'}
                onPress={onStartModelCheck}>
                {checkApiStatus === 'processing' && (
                  <View>
                    <XStack gap={10} width="100%" alignItems="center" justifyContent="center">
                      <Spinner size="small" color="$green100" />
                      <Text fontSize={18} fontWeight="bold" color="$green100">
                        {t('button.checking')}
                      </Text>
                    </XStack>
                  </View>
                )}

                {checkApiStatus === 'idle' && (
                  <View>
                    <XStack width="100%" alignItems="center" justifyContent="space-between">
                      <Text fontSize={18} fontWeight="bold" color="$green100">
                        {t('button.start_check_model')}
                      </Text>
                      <ChevronsRight color="$green100" />
                    </XStack>
                  </View>
                )}

                {checkApiStatus === 'success' && (
                  <View>
                    <XStack width="100%" alignItems="center" justifyContent="space-between">
                      <Text fontSize={18} fontWeight="bold" color="$green100">
                        {t('button.success')}
                      </Text>
                    </XStack>
                  </View>
                )}
              </Button>
            </XStack>
          </YStack>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

ApiCheckSheet.displayName = 'ApiCheckSheet'
