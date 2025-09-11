import { PenLine } from '@tamagui/lucide-icons'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Stack, YStack } from 'tamagui'
import { Image } from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

import { DefaultProviderIcon } from '@/components/icons/DefaultProviderIcon'
import { useDialog } from '@/hooks/useDialog'
import { loggerService } from '@/services/LoggerService'
import { FileMetadata } from '@/types/file'
import { getFileType } from '@/utils/file'

const logger = loggerService.withContext('ProviderIconButton')

// Constants for image validation
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FORMATS = ['png', 'jpg', 'jpeg']
interface ProviderIconButtonProps {
  providerId: string
  iconUri?: string
  onImageSelected?: (file: Omit<FileMetadata, 'md5'> | null) => void
}

// Helper function to create file from image asset
const createFileFromImageAsset = (
  asset: ImagePicker.ImagePickerAsset,
  providerId: string
): Omit<FileMetadata, 'md5'> => {
  const ext = asset.fileName?.split('.').pop() || 'png'

  return {
    id: providerId,
    name: asset.fileName || providerId,
    origin_name: asset.fileName || providerId,
    path: asset.uri,
    size: asset.fileSize || 0,
    ext,
    type: getFileType(ext),
    created_at: new Date().toISOString(),
    count: 1
  }
}

// Helper function to validate image
const validateImage = (asset: ImagePicker.ImagePickerAsset): string | null => {
  const ext = asset.fileName?.split('.').pop()?.toLowerCase()

  if (ext && !ALLOWED_FORMATS.includes(ext)) {
    return 'Invalid image format. Please use PNG, JPG, or JPEG.'
  }

  if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
    return 'Image size is too large. Please use an image smaller than 5MB.'
  }

  return null
}

export function ProviderIconButton({ providerId, iconUri, onImageSelected }: ProviderIconButtonProps) {
  const { t } = useTranslation()
  const dialog = useDialog()
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    if (!iconUri) {
      setImage(null)
      return
    }

    setImage(iconUri)
  }, [iconUri])

  const handleUploadIcon = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Force square aspect ratio
        quality: 0.8
      })

      if (result.canceled) return

      const asset = result.assets[0]
      const validationError = validateImage(asset)

      if (validationError) {
        dialog.open({
          type: 'error',
          title: t('common.error'),
          content: validationError
        })
        return
      }

      setImage(asset.uri)
      const file = createFileFromImageAsset(asset, providerId)
      onImageSelected?.(file)
    } catch (error) {
      logger.error('handleUploadIcon Error', error)
      dialog.open({
        type: 'error',
        title: t('common.error_occurred'),
        content: 'Failed to upload image. Please try again.'
      })
    }
  }

  return (
    <YStack position="relative">
      <Button
        size={120}
        circular
        borderColor="$green100"
        borderWidth={5}
        overflow="hidden"
        {...(!image && {
          paddingTop: 12,
          paddingLeft: 19
        })}
        onPress={handleUploadIcon}>
        {image ? <Image source={{ uri: image }} height={120} width={120} /> : <DefaultProviderIcon />}
      </Button>

      <Stack
        height={40}
        width={40}
        position="absolute"
        borderRadius={99}
        bottom={0}
        right={0}
        backgroundColor="$green100"
        zIndex={10}
        cursor="pointer">
        <LinearGradient
          width="100%"
          height="100%"
          borderRadius={99}
          colors={['$green100', '#00B96B']}
          start={[1, 1]}
          end={[0, 0]}
          justifyContent="center"
          alignItems="center">
          <PenLine size={24} />
        </LinearGradient>
      </Stack>
    </YStack>
  )
}
