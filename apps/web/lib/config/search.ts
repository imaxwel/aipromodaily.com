// 搜索功能配置
export interface SearchConfig {
  enabled: boolean;
  pagefindEnabled: boolean;
}

/**
 * 获取搜索功能配置
 * 可以通过环境变量控制，默认开启
 */
export function getSearchConfig(): SearchConfig {
  // 从环境变量读取配置，默认为开启
  const searchEnabled = process.env.NEXT_PUBLIC_SEARCH_ENABLED !== 'false';
  const pagefindEnabled = process.env.NEXT_PUBLIC_PAGEFIND_ENABLED !== 'false';
  
  return {
    enabled: searchEnabled,
    pagefindEnabled: pagefindEnabled,
  };
}

/**
 * 客户端检查搜索功能是否启用
 */
export function isSearchEnabled(): boolean {
  if (typeof window === 'undefined') {
    // 服务端渲染时使用环境变量
    return process.env.NEXT_PUBLIC_SEARCH_ENABLED !== 'false';
  }
  
  // 客户端可以检查 window 对象上的配置
  const config = (window as any).__SEARCH_CONFIG__ || getSearchConfig();
  return config.enabled;
}

/**
 * 检查 Pagefind 功能是否启用
 */
export function isPagefindEnabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_PAGEFIND_ENABLED !== 'false';
  }
  
  const config = (window as any).__SEARCH_CONFIG__ || getSearchConfig();
  return config.pagefindEnabled;
}

// 导出默认配置
export const searchConfig = getSearchConfig();