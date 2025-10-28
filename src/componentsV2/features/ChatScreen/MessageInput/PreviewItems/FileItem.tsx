import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { viewDocument } from '@react-native-documents/viewer'

import { FileIcon, Share, X } from '@/componentsV2/icons'
import { useToast } from '@/hooks/useToast'
import { shareFile } from '@/services/FileService'
import { loggerService } from '@/services/LoggerService'
import { FileMetadata } from '@/types/file'
import { formatFileSize } from '@/utils/file'
import Text from '@/componentsV2/base/Text'
import XStack from '@/componentsV2/layout/XStack'
import YStack from '@/componentsV2/layout/YStack'
import ContextMenu from '@/componentsV2/base/ContextMenu'

const logger = loggerService.withContext('File Item')

interface FileItemProps {
  file: FileMetadata
  onRemove?: (file: FileMetadata) => void
  width?: number
  height?: number
  disabledContextMenu?: boolean
}

const FileItem: FC<FileItemProps> = ({ file, onRemove, width, disabledContextMenu }) => {
  const { t } = useTranslation()
  const toast = useToast()

  const handlePreview = () => {
    viewDocument({ uri: file.path, mimeType: file.type }).catch(error => {
      logger.error('Handle Preview Error', error)
    })
  }

  const handleRemove = (e: any) => {
    e.stopPropagation()
    onRemove?.(file)
  }

  const handleShareFile = async () => {
    try {
      const result = await shareFile(file.path)

      if (result.success) {
        logger.info('File shared successfully')
      } else {
        toast.show(result.message, { color: 'red', duration: 2500 })
        logger.warn('Failed to share file:', result.message)
      }
    } catch (error) {
      toast.show(t('common.error_occurred'), { color: 'red', duration: 2500 })
      logger.error('Error in handleShareFile:', error)
    }
  }

  return (
    <ContextMenu
      onPress={handlePreview}
      disableContextMenu={disabledContextMenu}
      list={[
        {
          title: t('button.share'),
          iOSIcon: 'square.and.arrow.up',
          androidIcon: <Share size={16} className="text-text-primary dark:text-text-primary-dark" />,
          onSelect: handleShareFile
        }
      ]}
      borderRadius={16}>
      <XStack className="gap-1.5 rounded-lg bg-green-20 dark:bg-green-dark-20 justify-start items-center py-1.5 px-1.5 pr-3">
        <View className="w-9 h-9 gap-2 rounded-[9.5px] bg-green-100 dark:bg-green-dark-100 items-center justify-center">
          <FileIcon size={20} className="text-white dark:text-black" />
        </View>
        <YStack className="justify-center gap-0.75">
          <Text
            className="text-sm leading-3.5 text-text-primary dark:text-text-primary-dark"
            numberOfLines={1}
            ellipsizeMode="middle">
            {file.name}
          </Text>
          <Text className="text-xs leading-2.75 text-text-secondary dark:text-text-secondary-dark">
            {formatFileSize(file.size)}
          </Text>
        </YStack>
      </XStack>
      {onRemove && (
        <TouchableOpacity onPress={handleRemove} hitSlop={5} className="absolute -top-1.5 -right-1.5 rounded-full">
          <View className="border border-white rounded-full p-0.5">
            <X size={14} />
          </View>
        </TouchableOpacity>
      )}
    </ContextMenu>
  )
}

export default FileItem
