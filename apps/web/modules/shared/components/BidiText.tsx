import React from 'react';
import { cn } from '@/modules/ui/lib/utils';

interface BidiTextProps {
  children: React.ReactNode;
  className?: string;
  /**
   * The expected direction of the text content
   * - 'auto': Browser determines direction based on content
   * - 'ltr': Force left-to-right
   * - 'rtl': Force right-to-left
   */
  dir?: 'auto' | 'ltr' | 'rtl';
  /**
   * Whether to use <bdi> tag or apply CSS isolation
   * - true: Use <bdi> tag (recommended for inline content)
   * - false: Use CSS unicode-bidi: isolate (for block elements)
   */
  useBdiTag?: boolean;
}

/**
 * Component for isolating bidirectional text
 * Prevents LTR content (like URLs, code) from disrupting RTL layout
 */
export function BidiText({ 
  children, 
  className,
  dir = 'auto',
  useBdiTag = true 
}: BidiTextProps) {
  if (useBdiTag) {
    return (
      <bdi className={className} dir={dir}>
        {children}
      </bdi>
    );
  }
  
  return (
    <span 
      className={cn('unicode-bidi-isolate', className)}
      dir={dir}
      style={{ unicodeBidi: 'isolate' }}
    >
      {children}
    </span>
  );
}

/**
 * Specialized component for code snippets in mixed-direction content
 */
export function CodeBidi({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <BidiText dir="ltr" className={cn('font-mono', className)}>
      {children}
    </BidiText>
  );
}

/**
 * Specialized component for URLs in mixed-direction content
 */
export function UrlBidi({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <BidiText dir="ltr" className={className}>
      {children}
    </BidiText>
  );
}