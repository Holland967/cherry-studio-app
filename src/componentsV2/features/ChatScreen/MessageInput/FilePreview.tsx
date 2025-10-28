import React from 'react'

import { FileMetadata } from '@/types/file'
import { ScrollView } from 'react-native'
import PreviewItem from './PreviewItems/PreviewItem'

interface FilePreviewProps {
  files: FileMetadata[]
  setFiles: (files: FileMetadata[]) => void
}

export const FilePreview: React.FC<FilePreviewProps> = ({ files, setFiles }) => {
  return (
    <ScrollView className="flex-row" horizontal showsHorizontalScrollIndicator={false}>
      {files.map((file, index) => (
        <PreviewItem key={index} file={file} files={files} setFiles={setFiles} />
      ))}
    </ScrollView>
  )
}
