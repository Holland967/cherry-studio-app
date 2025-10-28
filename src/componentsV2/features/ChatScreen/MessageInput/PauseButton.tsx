import React from 'react'

import { CirclePause } from '@/componentsV2/icons'
import { IconButton } from '@/componentsV2/base/IconButton'

interface PauseButtonProps {
  onPause: () => void
}

export const PauseButton: React.FC<PauseButtonProps> = ({ onPause }) => {
  return (
    <IconButton icon={<CirclePause size={24} className="text-text-delete dark:text-text-delete" />} onPress={onPause} />
  )
}
