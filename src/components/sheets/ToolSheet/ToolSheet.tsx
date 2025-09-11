import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import React, { forwardRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { Assistant } from '@/types/assistant'
import { FileMetadata } from '@/types/file'

import { AIFeatureOptions } from './AIFeatureOptions'
import { useCameraModal } from './CameraModal'
import { ToolOptions } from './ToolOptions'
import { useAIFeatureHandler } from './useAIFeatureHandler'
import { useFileHandler } from './useFileHandler'

interface ToolSheetProps {
  files: FileMetadata[]
  setFiles: (files: FileMetadata[]) => void
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

const ToolSheet = forwardRef<BottomSheetModal, ToolSheetProps>(
  ({ files, setFiles, assistant, updateAssistant }, ref) => {
    const { isDark } = useTheme()
    const insets = useSafeAreaInsets()

    const dismissSheet = () => {
      ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    }

    const { handleAddImage, handleAddFile, handleAddPhotoFromCamera } = useFileHandler({
      files,
      setFiles,
      onSuccess: dismissSheet
    })

    const { handleEnableGenerateImage, handleEnableWebSearch } = useAIFeatureHandler({
      assistant,
      updateAssistant,
      onSuccess: dismissSheet
    })

    const cameraModal = useCameraModal({
      onPhotoTaken: handleAddPhotoFromCamera,
      onSuccess: dismissSheet
    })

    const handleCameraPress = () => {
      dismissSheet()
      cameraModal.handleOpenCamera()
    }

    const renderBackdrop = (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
    )

    return (
      <>
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
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{ paddingBottom: insets.bottom }}>
            <YStack gap={12}>
              <ToolOptions
                onCameraPress={handleCameraPress}
                onImagePress={handleAddImage}
                onFilePress={handleAddFile}
              />
              <AIFeatureOptions
                assistant={assistant}
                onWebSearchToggle={handleEnableWebSearch}
                onGenerateImageToggle={handleEnableGenerateImage}
              />
            </YStack>
          </BottomSheetView>
        </BottomSheetModal>

        {cameraModal.modal}
      </>
    )
  }
)

ToolSheet.displayName = 'ToolSheet'

export default ToolSheet
