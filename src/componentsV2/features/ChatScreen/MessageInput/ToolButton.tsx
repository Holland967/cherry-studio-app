import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useRef } from 'react'
import { Keyboard } from 'react-native'

import { Assistant, Model } from '@/types/assistant'
import { FileMetadata } from '@/types/file'
import { haptic } from '@/utils/haptic'

import { AssetsIcon } from '@/componentsV2/icons'
import { IconButton } from '@/componentsV2/base/IconButton'
import { ToolSheet } from '../../Sheet/ToolSheet'

interface AddAssetsButtonProps {
  mentions: Model[]
  files: FileMetadata[]
  setFiles: (files: FileMetadata[]) => void
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

export const ToolButton: React.FC<AddAssetsButtonProps> = ({
  mentions,
  files,
  setFiles,
  assistant,
  updateAssistant
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const handlePress = () => {
    Keyboard.dismiss()
    haptic(ImpactFeedbackStyle.Medium)
    bottomSheetModalRef.current?.present()
  }

  return (
    <>
      <IconButton icon={<AssetsIcon size={20} />} onPress={handlePress} />

      <ToolSheet
        ref={bottomSheetModalRef}
        mentions={mentions}
        files={files}
        setFiles={setFiles}
        assistant={assistant}
        updateAssistant={updateAssistant}
      />
    </>
  )
}
