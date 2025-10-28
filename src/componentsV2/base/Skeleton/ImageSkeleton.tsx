import { SkeletonGroup } from 'heroui-native'
import React from 'react'

export const ImageSkeleton = () => {
  return (
    <SkeletonGroup className="w-1/3 aspect-square">
      <SkeletonGroup.Item className="w-full h-full rounded-lg"></SkeletonGroup.Item>
    </SkeletonGroup>
  )
}
