import { useLocale } from 'next-intl';
import { useMemo } from 'react';

// List of RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'ku', 'ms', 'ml'];

/**
 * Hook to determine if the current locale is RTL
 */
export function useRTL() {
  const locale = useLocale();
  
  const isRTL = useMemo(() => {
    // Check if the locale or its base language is RTL
    const baseLocale = locale.split('-')[0].toLowerCase();
    return RTL_LANGUAGES.includes(baseLocale);
  }, [locale]);
  
  return {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr' as 'rtl' | 'ltr',
    locale
  };
}

/**
 * Hook to get direction-aware classes
 */
export function useDirectionalClasses() {
  const { isRTL } = useRTL();
  
  return {
    // Text alignment
    textStart: isRTL ? 'text-right' : 'text-left',
    textEnd: isRTL ? 'text-left' : 'text-right',
    
    // Margin utilities
    ms: (value: string | number) => isRTL ? `mr-${value}` : `ml-${value}`,
    me: (value: string | number) => isRTL ? `ml-${value}` : `mr-${value}`,
    
    // Padding utilities
    ps: (value: string | number) => isRTL ? `pr-${value}` : `pl-${value}`,
    pe: (value: string | number) => isRTL ? `pl-${value}` : `pr-${value}`,
    
    // Position utilities
    start: (value: string | number) => isRTL ? `right-${value}` : `left-${value}`,
    end: (value: string | number) => isRTL ? `left-${value}` : `right-${value}`,
    
    // Border utilities
    borderStart: (value: string | number) => isRTL ? `border-r-${value}` : `border-l-${value}`,
    borderEnd: (value: string | number) => isRTL ? `border-l-${value}` : `border-r-${value}`,
    
    // Rounded corners
    roundedStart: (value: string) => isRTL ? `rounded-r-${value}` : `rounded-l-${value}`,
    roundedEnd: (value: string) => isRTL ? `rounded-l-${value}` : `rounded-r-${value}`,
    
    // Float
    floatStart: isRTL ? 'float-right' : 'float-left',
    floatEnd: isRTL ? 'float-left' : 'float-right',
  };
}

/**
 * Utility function to get RTL-aware class names
 */
export function rtlClass(ltrClass: string, rtlClass: string, isRTL: boolean): string {
  return isRTL ? rtlClass : ltrClass;
}

/**
 * Utility to flip horizontal values for RTL
 */
export function flipHorizontal(value: 'left' | 'right', isRTL: boolean): 'left' | 'right' {
  if (!isRTL) return value;
  return value === 'left' ? 'right' : 'left';
}