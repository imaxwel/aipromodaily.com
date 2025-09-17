// Pagefind客户端搜索集成
import { isPagefindEnabled } from '@/lib/config/search';

interface PagefindResult {
  id: string;
  data: () => Promise<any>;
  score: number;
  words: number[];
  excerpt: string;
}

interface PagefindSearch {
  results: PagefindResult[];
  totalResults: number;
  query: string;
}

// Pagefind实例类型
interface PagefindInstance {
  init: () => Promise<void>;
  search: (query: string, options?: any) => Promise<PagefindSearch>;
  debouncedSearch: (query: string, callback: (results: PagefindSearch) => void, delay?: number) => void;
  destroy: () => void;
}

// 单例模式管理Pagefind实例
let pagefindInstance: PagefindInstance | null = null;

/**
 * 初始化Pagefind实例
 */
export async function initPagefind(): Promise<PagefindInstance> {
  // 检查 Pagefind 功能是否启用
  if (!isPagefindEnabled()) {
    throw new Error('搜索功能已禁用');
  }
  
  if (pagefindInstance) return pagefindInstance;
  
  if (typeof window === 'undefined') {
    throw new Error('Pagefind只能在客户端运行');
  }
  
  try {
    // 动态加载Pagefind脚本
    // @ts-ignore
    const pagefind = (window as any).pagefind || await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/pagefind/pagefind.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        resolve((window as any).pagefind);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    await pagefind.init();
    pagefindInstance = pagefind;
    // @ts-ignore
    (window as any).pagefind = pagefind;
    
    return pagefind;
  } catch (error) {
    console.error('Failed to initialize Pagefind:', error);
    throw new Error('无法初始化搜索功能');
  }
}

/**
 * 执行客户端搜索
 */
export async function searchClient(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
    filters?: Record<string, string[]>;
  }
): Promise<any[]> {
  const pagefind = await initPagefind();
  
  // 构建搜索查询
  let searchQuery = query;
  
  // 添加过滤器
  if (options?.filters) {
    for (const [key, values] of Object.entries(options.filters)) {
      if (values && values.length > 0) {
        const filterStr = values.map(v => `${key}:${v}`).join(' OR ');
        searchQuery += ` AND (${filterStr})`;
      }
    }
  }
  
  // 执行搜索
  const searchResults = await pagefind.search(searchQuery, {
    limit: options?.limit || 20,
    offset: options?.offset || 0
  });
  
  // 加载详细数据
  const posts = await Promise.all(
    searchResults.results.map(async (result) => {
      const data = await result.data();
      return {
        ...data,
        score: result.score,
        excerpt: result.excerpt
      };
    })
  );
  
  return posts;
}

/**
 * 销毁Pagefind实例
 */
export function destroyPagefind() {
  if (pagefindInstance) {
    pagefindInstance.destroy();
    pagefindInstance = null;
  }
}