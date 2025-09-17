// 博客搜索Hook
'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchClient, initPagefind } from '@/lib/search/pagefind-client';
import { useDebounce } from '@/hooks/use-debounce';
import { isSearchEnabled, isPagefindEnabled } from '@/lib/config/search';

export interface SearchResult {
  url: string;
  slug?: string;
  title: string;
  content: string;
  excerpt?: string;
  accessLevel?: string;
  score?: number;
  meta?: {
    title?: string;
    image?: string;
    author?: string;
    date?: string;
    tags?: string[];
    access?: string;
  };
}

interface UseSearchOptions {
  debounceDelay?: number;
  minQueryLength?: number;
  limit?: number;
}

export function useBlogSearch(options: UseSearchOptions = {}) {
  const {
    debounceDelay = 300,
    minQueryLength = 2,
    limit = 20
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const debouncedQuery = useDebounce(query, debounceDelay);

  // 初始化Pagefind
  useEffect(() => {
    const init = async () => {
      // 检查搜索功能是否启用
      if (!isSearchEnabled() || !isPagefindEnabled()) {
        setError('搜索功能已禁用');
        return;
      }
      
      try {
        await initPagefind();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize search:', err);
        setError('搜索功能初始化失败');
      }
    };

    // 只在客户端初始化
    if (typeof window !== 'undefined') {
      init();
    }
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }

    if (!isInitialized) {
      setError('搜索功能尚未就绪');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchClient(searchQuery, { limit });
      
      // 转换结果格式
      const formattedResults: SearchResult[] = searchResults.map(result => {
        // 从URL提取slug
        const urlParts = result.url?.split('/') || [];
        const slug = urlParts[urlParts.length - 1]?.replace('.html', '') || '';
        
        return {
          url: result.url,
          slug,
          title: result.meta?.title || result.title || '无标题',
          content: result.content || '',
          excerpt: result.excerpt || result.content?.substring(0, 200) || '',
          meta: {
            title: result.meta?.title,
            image: result.meta?.image,
            author: result.meta?.author,
            date: result.meta?.date,
            tags: result.meta?.tags || []
          },
          // 保留原始数据供权限检查
          accessLevel: result.meta?.access || 'public',
          score: result.score
        } as any;
      });

      // 按相关性得分排序
      formattedResults.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
      
      setResults(formattedResults);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || '搜索失败');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, minQueryLength, limit]);

  // 监听查询变化
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, performSearch]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isInitialized,
    clearSearch
  };
}