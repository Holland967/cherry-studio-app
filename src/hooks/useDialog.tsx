import { ImpactFeedbackStyle } from 'expo-haptics'
import { MotiView } from 'moti'
import React, { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet } from 'react-native'
import { Button, StackProps, Text, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { haptic } from '@/utils/haptic'

export type DialogOptions = {
  title?: React.ReactNode | string
  content?: React.ReactNode | string
  confirmText?: string
  cancelText?: string
  confirmStyle?: StackProps['style']
  cancelStyle?: StackProps['style']
  showCancel?: boolean
  /** 是否可以点击遮罩层关闭 */
  maskClosable?: boolean
  type?: 'info' | 'warning' | 'error' | 'success'
  onConFirm?: () => void
  onCancel?: () => void
}

type DialogContextValue = { open: (options: DialogOptions) => void; close: () => void } | undefined

const DialogContext = createContext<DialogContextValue>(undefined)

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme()
  const [isOpen, setOpen] = useState(false)
  const [options, setOptions] = useState<DialogOptions | null>(null)
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)'
    }
  })

  const close = () => {
    setOpen(false)
    setTimeout(() => {
      setOptions(null)
    }, 300)
  }

  const cancel = () => {
    haptic(ImpactFeedbackStyle.Medium)
    options?.onCancel?.()
    close()
  }

  const confirm = () => {
    haptic(ImpactFeedbackStyle.Medium)
    options?.onConFirm?.()
    close()
  }

  const open = (newOptions: DialogOptions) => {
    haptic(ImpactFeedbackStyle.Medium)
    setOptions(newOptions)
    setOpen(true)
  }

  const getConfirmButtonStyle = () => {
    switch (options?.type) {
      case 'info':
        return { backgroundColor: '$blue20', borderColor: '$blue20', color: '$blue100' }
      case 'warning':
        return { backgroundColor: '$orange20', borderColor: '$orange20', color: '$orange100' }
      case 'error':
        return { backgroundColor: '$red20', borderColor: '$red20', color: '$red100' }
      case 'success':
        return { backgroundColor: '$green10', borderColor: '$green20', color: '$green100' }
      default:
        return { backgroundColor: '$green10', borderColor: '$green20', color: '$green100' }
    }
  }

  const api = { open, close }

  const showCancel = options?.showCancel ?? true
  const maskClosable = options?.maskClosable ?? true
  const confirmText = options?.confirmText ?? t('common.ok')
  const cancelText = options?.cancelText ?? t('common.cancel')

  const confirmButtonStyle = getConfirmButtonStyle()

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Modal animationType="fade" transparent visible={isOpen} onRequestClose={cancel}>
        <MotiView
          from={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.centeredView}>
          {maskClosable && <Pressable style={StyleSheet.absoluteFill} onPress={cancel} />}
          <YStack width="75%" borderRadius={20} backgroundColor="$uiCardBackground">
            <YStack gap={12} padding={20} alignItems="center">
              {typeof options?.title === 'string' ? (
                <Text fontSize={18} fontWeight="bold" color="$textPrimary">
                  {options.title}
                </Text>
              ) : (
                options?.title
              )}
              {typeof options?.content === 'string' ? (
                <Text fontSize={15} lineHeight={20} color="$textSecondary" textAlign="center">
                  {options.content}
                </Text>
              ) : (
                options?.content
              )}
            </YStack>

            <XStack padding={20} paddingTop={0} gap={20}>
              {showCancel && (
                <Button
                  flex={1}
                  size={42}
                  borderRadius={30}
                  fontSize={17}
                  backgroundColor="transparent"
                  borderColor="$gray20"
                  color="$gray80"
                  onPress={cancel}
                  style={options?.cancelStyle}>
                  {cancelText}
                </Button>
              )}
              <Button
                flex={1}
                size={42}
                borderRadius={30}
                fontSize={17}
                borderWidth={1}
                backgroundColor={confirmButtonStyle.backgroundColor}
                borderColor={confirmButtonStyle.borderColor}
                color={confirmButtonStyle.color}
                onPress={confirm}
                style={options?.confirmStyle}>
                {confirmText}
              </Button>
            </XStack>
          </YStack>
        </MotiView>
      </Modal>
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider')
  return ctx
}
