import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Trash2 } from '@tamagui/lucide-icons'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { TranslatedIcon, TranslationIcon } from '@/components/icons/TranslationIcon'
import { useMessageActions } from '@/hooks/useMessageActions'
import { useTheme } from '@/hooks/useTheme'
import { Message } from '@/types/message'

interface MessageFooterMoreProps {
  message: Message
}

const MessageFooterMoreSheet = forwardRef<BottomSheetModal, MessageFooterMoreProps>(({ message }, ref) => {
  const { t } = useTranslation()

  const { isDark } = useTheme()
  const { isTranslated, handleTranslate, handleDeleteTranslation, handleDelete } = useMessageActions({ message })

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  const onTranslate = async () => {
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    await handleTranslate()
  }

  const onDeleteTranslation = async () => {
    await handleDeleteTranslation()
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
  }

  const onDelete = async () => {
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    await handleDelete()
  }

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing={true}
      backgroundStyle={{
        borderRadius: 24,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}
      backdropComponent={renderBackdrop}>
      <BottomSheetView>
        <YStack width="100%" paddingTop={0} paddingBottom={30} paddingHorizontal={16} gap={10}>
          <TouchableOpacity onPress={isTranslated ? onDeleteTranslation : onTranslate} activeOpacity={0.7}>
            <XStack
              width="100%"
              alignItems="center"
              gap={10}
              paddingHorizontal={20}
              paddingVertical={16}
              borderRadius={16}
              backgroundColor="$uiCardBackground">
              {isTranslated ? <TranslatedIcon size={18} /> : <TranslationIcon size={18} />}
              <Text fontSize={16}>
                {isTranslated ? t('message.delete_translation') : t('message.translate_message')}
              </Text>
            </XStack>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
            <XStack
              width="100%"
              alignItems="center"
              gap={10}
              paddingHorizontal={20}
              paddingVertical={16}
              borderRadius={16}
              backgroundColor="$uiCardBackground">
              <Trash2 size={18} color="red" />
              <Text fontSize={16} color="red">
                {t('message.delete_message')}
              </Text>
            </XStack>
          </TouchableOpacity>
        </YStack>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

MessageFooterMoreSheet.displayName = 'MessageFooterMoreSheet'

export default MessageFooterMoreSheet
