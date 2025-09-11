import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { BrushCleaning } from '@tamagui/lucide-icons'
import { sortBy } from 'lodash'
import debounce from 'lodash/debounce'
import { forwardRef, useEffect, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Stack, Text, View, XStack, YStack } from 'tamagui'

import { ModelIcon } from '@/components/ui/ModelIcon'
import { ModelTags } from '@/components/ui/ModelTags'
import { isEmbeddingModel, isRerankModel } from '@/config/models'
import { useAllProviders } from '@/hooks/useProviders'
import { useTheme } from '@/hooks/useTheme'
import { Model } from '@/types/assistant'
import { getModelUniqId } from '@/utils/model'

import { ProviderIcon } from '../ui/ProviderIcon'
import { BottomSheetSearchInput } from './BottomSheetSearchInput'

interface ModelSheetProps {
  mentions: Model[]
  setMentions: (mentions: Model[]) => void
  multiple?: boolean
}

const ModelSheet = forwardRef<BottomSheetModal, ModelSheetProps>(({ mentions, setMentions, multiple }, ref) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [selectedModels, setSelectedModels] = useState<string[]>(() => mentions.map(m => getModelUniqId(m)))
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false)
  const insets = useSafeAreaInsets()
  const dimensions = useWindowDimensions()

  const debouncedSetQuery = debounce((query: string) => {
    setSearchQuery(query)
  }, 300)

  const handleSearchChange = (text: string) => {
    setInputValue(text)
    debouncedSetQuery(text)
  }

  useEffect(() => {
    setSelectedModels(mentions.map(m => getModelUniqId(m)))
  }, [mentions])

  const { providers } = useAllProviders()
  const selectOptions = providers
    .filter(p => p.models && p.models.length > 0 && p.enabled)
    .map(p => ({
      label: p.isSystem ? t(`provider.${p.id}`) : p.name,
      title: p.name,
      provider: p,
      options: sortBy(p.models, 'name')
        .filter(m => !isEmbeddingModel(m) && !isRerankModel(m))
        .filter(m => {
          if (!searchQuery) return true
          const query = searchQuery.toLowerCase()
          const modelId = getModelUniqId(m).toLowerCase()
          const modelName = m.name.toLowerCase()
          return modelId.includes(query) || modelName.includes(query)
        })
        .map(m => ({
          label: `${m.name}`,
          value: getModelUniqId(m),
          model: m
        }))
    }))
    .filter(group => group.options.length > 0)

  const allModelOptions = selectOptions.flatMap(group => group.options)

  const handleModelToggle = (modelValue: string) => {
    const isSelected = selectedModels.includes(modelValue)
    let newSelection: string[]

    if (isMultiSelectActive) {
      // 多选模式
      if (!isSelected) {
        newSelection = [...selectedModels, modelValue]
      } else {
        newSelection = selectedModels.filter(id => id !== modelValue)
      }
    } else {
      // 单选模式
      if (!isSelected) {
        newSelection = [modelValue] // 只保留当前选中的
      } else {
        newSelection = [] // 取消选中
      }

      ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    }

    setSelectedModels(newSelection)

    const newMentions = allModelOptions
      .filter(option => newSelection.includes(option.value))
      .map(option => option.model)
    setMentions(newMentions)
  }

  const handleClearAll = () => {
    setSelectedModels([])
    setMentions([])
  }

  const toggleMultiSelectMode = () => {
    const newMultiSelectActive = !isMultiSelectActive
    setIsMultiSelectActive(newMultiSelectActive)

    // 如果切换到单选模式且当前有多个选择，只保留第一个
    if (!newMultiSelectActive && selectedModels.length > 1) {
      const firstSelected = selectedModels[0]
      setSelectedModels([firstSelected])
      const newMentions = allModelOptions.filter(option => option.value === firstSelected).map(option => option.model)
      setMentions(newMentions)
    }
  }

  // 添加背景组件渲染函数
  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  return (
    <BottomSheetModal
      enableDynamicSizing={true}
      ref={ref}
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      android_keyboardInputMode="adjustResize"
      maxDynamicContentSize={dimensions.height - 2 * insets.top}>
      <BottomSheetScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: insets.bottom }}>
        <YStack gap={16} paddingHorizontal={20} paddingBottom={20}>
          <XStack gap={5} flex={1} alignItems="center" justifyContent="center">
            <Stack flex={1}>
              <BottomSheetSearchInput
                value={inputValue}
                onChangeText={handleSearchChange}
                placeholder={t('common.search_placeholder')}
              />
            </Stack>
            {multiple && (
              <Button
                circular
                backgroundColor={isMultiSelectActive ? '$green10' : '$uiCard'}
                borderColor={isMultiSelectActive ? '$green20' : 'transparent'}
                borderWidth={1}
                onPress={toggleMultiSelectMode}>
                <Text color={isMultiSelectActive ? '$green100' : undefined}>{t('button.multiple')}</Text>
              </Button>
            )}
            {multiple && isMultiSelectActive && (
              <Button circular backgroundColor="$uiCard" onPress={handleClearAll} icon={<BrushCleaning size={18} />} />
            )}
          </XStack>
          {selectOptions.map((group, groupIndex) => (
            <View key={group.title || group.label || groupIndex} gap={12}>
              <XStack gap={12} alignItems="center" justifyContent="flex-start" paddingHorizontal={4}>
                <XStack width={32} height={32} borderRadius={8} alignItems="center" justifyContent="center">
                  <ProviderIcon provider={group.provider} />
                </XStack>
                <Text fontSize={15} fontWeight="bold" color="$gray12">
                  {group.label}
                </Text>
              </XStack>
              <YStack gap={6}>
                {group.options.map(item => (
                  <Button
                    key={item.value}
                    onPress={() => handleModelToggle(item.value)}
                    justifyContent="space-between"
                    chromeless
                    paddingHorizontal={8}
                    paddingVertical={8}
                    borderWidth={1}
                    borderColor={selectedModels.includes(item.value) ? '$green20' : 'transparent'}
                    backgroundColor={selectedModels.includes(item.value) ? '$green10' : 'transparent'}>
                    <XStack gap={8} flex={1} alignItems="center" justifyContent="space-between" width="100%">
                      <XStack gap={8} flex={1} alignItems="center" maxWidth="80%">
                        {/* Model icon */}
                        <XStack justifyContent="center" alignItems="center" flexShrink={0}>
                          <ModelIcon model={item.model} />
                        </XStack>
                        {/* Model name */}
                        <Text
                          color={selectedModels.includes(item.value) ? '$green100' : undefined}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          flex={1}>
                          {item.label}
                        </Text>
                      </XStack>
                      <XStack gap={8} alignItems="center" flexShrink={0}>
                        {/* Model tags */}
                        <ModelTags model={item.model} size={11} />
                      </XStack>
                    </XStack>
                  </Button>
                ))}
              </YStack>
            </View>
          ))}
        </YStack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})

ModelSheet.displayName = 'MentionSheet'

export default ModelSheet
