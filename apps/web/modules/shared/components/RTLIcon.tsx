'use client';

import { useRTL } from '../hooks/useRTL';
import { cn } from '@/modules/ui/lib/utils';
import React from 'react';

interface RTLIconProps {
  children: React.ReactNode;
  flip?: boolean; // Whether this icon should flip in RTL
  className?: string;
}

/**
 * Wrapper component for icons that need to flip in RTL layouts
 * Icons that represent directional concepts (arrows, chevrons, etc.) should use flip=true
 */
export function RTLIcon({ children, flip = false, className }: RTLIconProps) {
  const { isRTL } = useRTL();
  
  const shouldFlip = flip && isRTL;
  
  return (
    <span
      className={cn(
        'inline-flex',
        shouldFlip && 'rtl-flip',
        className
      )}
      style={shouldFlip ? { transform: 'scaleX(-1)' } : undefined}
    >
      {children}
    </span>
  );
}

/**
 * Hook to determine if an icon should be flipped based on its semantic meaning
 */
export function useIconDirection(iconName: string): boolean {
  const { isRTL } = useRTL();
  
  // List of icon patterns that should flip in RTL
  const directionalIcons = [
    'arrow-left',
    'arrow-right',
    'chevron-left',
    'chevron-right',
    'angle-left',
    'angle-right',
    'caret-left',
    'caret-right',
    'back',
    'forward',
    'previous',
    'next',
    'play', // Play buttons typically flip in RTL
    'fast-forward',
    'rewind',
    'skip-forward',
    'skip-back',
    'undo',
    'redo',
    'reply', // Reply arrows
    'share', // Share arrows often flip
    'logout',
    'login',
    'sign-out',
    'sign-in',
    'external-link',
    'trending', // Trending arrows
  ];
  
  // Check if the icon name matches any directional pattern
  const shouldFlip = directionalIcons.some(pattern => 
    iconName.toLowerCase().includes(pattern)
  );
  
  return shouldFlip && isRTL;
}