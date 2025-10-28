import React, { forwardRef } from 'react'
import { Image as RNImage, ImageProps as RNImageProps, Animated } from 'react-native'
import { cn } from 'heroui-native'

export interface ImageProps extends RNImageProps {
  className?: string
}

const Image = forwardRef<RNImage, ImageProps>(({ className = '', ...rest }, ref) => {
  const composed = cn(className)

  return <RNImage ref={ref} className={composed} {...rest} />
})

Image.displayName = 'Image'

export const AnimatedImage = Animated.createAnimatedComponent(Image)

export default Image
