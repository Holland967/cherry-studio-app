import React, { memo } from 'react'

import { FileMessageBlock } from '@/types/message'
import { FileItem } from '@/componentsV2'

interface Props {
  block: FileMessageBlock
}

const FileBlock: React.FC<Props> = ({ block }) => {
  return <FileItem file={block.file} />
}

export default memo(FileBlock)
