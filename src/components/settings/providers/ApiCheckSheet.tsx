import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { ChevronsRight } from '@tamagui/lucide-icons'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Spinner, Text, View, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { ApiStatus, Model } from '@/types/assistant'
import { getModelUniqId } from '@/utils/model'

import { ModelSelect } from './ModelSelect'

interface ApiCheckSheetProps {
  selectedModel: Model | undefined
  onModelChange: (value: string) => void
  selectOptions: {
    label: string
    title: string
    options: {
      label: string
      value: string
      model: Model
    }[]
  }[]
  onStartModelCheck: () => void
  checkApiStatus: ApiStatus
}

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
)

export const ApiCheckSheet = forwardRef<BottomSheetModal, ApiCheckSheetProps>(
  ({ selectedModel, onModelChange, selectOptions, onStartModelCheck, checkApiStatus }, ref) => {
    const { t } = useTranslation()
    const { isDark } = useTheme()
    const insets = useSafeAreaInsets()

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
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
          <YStack alignItems="center" paddingTop={10} paddingBottom={30} paddingHorizontal={20} gap={10}>
            <XStack width="100%" alignItems="center" justifyContent="center">
              <Text fontSize={24}>{t('settings.provider.api_check.title')}</Text>
            </XStack>

            <YStack width="100%" gap={5}>
              <Text>{t('settings.provider.api_check.tooltip')}</Text>
              <ModelSelect
                value={selectedModel ? getModelUniqId(selectedModel) : undefined}
                onValueChange={onModelChange}
                selectOptions={selectOptions}
                placeholder={t('settings.models.empty')}
              />
            </YStack>

            <XStack width="100%" alignItems="center" justifyContent="center">
              <Button
                height={44}
                width={224}
                borderRadius={15}
                backgroundColor="$green10"
                borderColor="$green20"
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
