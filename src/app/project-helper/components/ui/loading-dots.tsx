"use client"

import React from 'react'
import { cn } from '../../lib/utils'

interface LoadingDotsProps {
  className?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
}

export default function LoadingDots({ 
  className, 
  color = 'currentColor', 
  size = 'medium' 
}: LoadingDotsProps) {
  const dotSize = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  }

  const dotSpacing = {
    small: 'space-x-1',
    medium: 'space-x-2',
    large: 'space-x-2'
  }

  return (
    <div className={cn('flex items-center', dotSpacing[size], className)}>
      <span 
        className={cn(
          'animate-bounce rounded-full', 
          dotSize[size]
        )} 
        style={{ 
          backgroundColor: color,
          animationDelay: '0ms',
          animationDuration: '600ms'
        }}
      />
      <span 
        className={cn(
          'animate-bounce rounded-full', 
          dotSize[size]
        )} 
        style={{ 
          backgroundColor: color,
          animationDelay: '150ms',
          animationDuration: '600ms'
        }}
      />
      <span 
        className={cn(
          'animate-bounce rounded-full', 
          dotSize[size]
        )} 
        style={{ 
          backgroundColor: color,
          animationDelay: '300ms',
          animationDuration: '600ms'
        }}
      />
    </div>
  )
} 