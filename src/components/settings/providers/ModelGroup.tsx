import { ChevronDown } from '@tamagui/lucide-icons'
import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'
import { Accordion, Square, Stack, Text, XStack, YStack } from 'tamagui'

import { ModelIcon } from '@/components/ui/ModelIcon'
import { ModelTags } from '@/components/ui/ModelTags'
import { Model } from '@/types/assistant'

interface ModelGroupProps {
  groupName: string
  models: Model[]
  index: number
  renderGroupButton?: (models: Model[]) => React.ReactNode
  renderModelButton?: (model: Model) => React.ReactNode
  showModelCount?: boolean
}

export function ModelGroup({
  groupName,
  models,
  index,
  renderGroupButton,
  renderModelButton,
  showModelCount = false
}: ModelGroupProps) {
  const renderModelItem: ListRenderItem<Model> = ({ item: model }) => (
    <XStack alignItems="center" justifyContent="space-between" width="100%">
      <XStack gap={8} flex={1}>
        {/* icon */}
        <XStack justifyContent="center" alignItems="center" flexShrink={0}>
          <ModelIcon model={model} />
        </XStack>
        {/* name and tool */}
        <YStack gap={5} flex={1}>
          <Text numberOfLines={1} ellipsizeMode="tail">
            {model.name}
          </Text>
          <ModelTags model={model} size={11} />
        </YStack>
      </XStack>
      <XStack flexShrink={0} marginLeft={8}>
        {renderModelButton?.(model)}
      </XStack>
    </XStack>
  )

  return (
    <Accordion.Item key={groupName} value={`item-${index}`} marginBottom={8}>
      <Accordion.Trigger
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingVertical={12}
        paddingHorizontal={16}
        borderWidth={0}
        pressStyle={{ backgroundColor: '$gray20' }}>
        {({ open }: { open: boolean }) => (
          <XStack gap={10} alignItems="center" justifyContent="space-between">
            <XStack gap={10} alignItems="center" flex={1}>
              <Square animation="quick" rotate={open ? '0deg' : '-90deg'}>
                <ChevronDown size={14} />
              </Square>
              <Text fontSize={14} fontWeight="bold">
                {groupName}
              </Text>
              {showModelCount && (
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  padding={3}
                  borderRadius={8}
                  backgroundColor="$green20">
                  <Text fontSize={10} lineHeight={14} height={14} width={14} color="$green100" textAlign="center">
                    {models.length}
                  </Text>
                </Stack>
              )}
            </XStack>

            {renderGroupButton?.(models)}
          </XStack>
        )}
      </Accordion.Trigger>

      <Accordion.HeightAnimator animation="quick">
        <Accordion.Content exitStyle={{ opacity: 0 }} paddingHorizontal={16} paddingVertical={5}>
          <FlatList
            data={models}
            renderItem={renderModelItem}
            keyExtractor={(model, index) => `${model.id}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={() => <YStack height={15} />}
            scrollEnabled={false}
            getItemLayout={(data, index) => ({
              length: 48,
              offset: 48 * index,
              index
            })}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
          />
        </Accordion.Content>
      </Accordion.HeightAnimator>
    </Accordion.Item>
  )
}
