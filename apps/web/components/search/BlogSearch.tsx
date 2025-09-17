'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchResults } from './SearchResults';
import { NoPermissionModal } from './NoPermissionModal';
import { UpgradePrompt } from './UpgradePrompt';
import { Search, X, Lock } from 'lucide-react';
import { useSession } from '@saas/auth/hooks/use-session';
import { usePurchases } from '@saas/payments/hooks/purchases';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { config } from '@repo/config';
import { isSearchEnabled } from '@/lib/config/search';

export function BlogSearch() {
  // 检查搜索功能是否启用
  if (!isSearchEnabled()) {
    return null; // 搜索功能禁用时不渲染任何内容
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoPermission, setShowNoPermission] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const { user } = useSession();
  const { hasSubscription, hasPurchase } = usePurchases();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // 检查是否是RTL语言
  const isRTL = config.i18n.locales[locale as keyof typeof config.i18n.locales]?.direction === 'rtl';
  
  // 检查用户是否可以搜索
  const canSearch = !!user; // 需要登录才能搜索
  
  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, locale })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.requireAuth) {
          setShowNoPermission(true);
          setResults([]);
        } else {
      setError(data.message || t('search.error.failed'));
        }
        return;
      }
      
      setResults(data.results);
      setUserInfo(data.user);
      
      // 检查是否有需要升级才能查看的内容
      const hasRestrictedContent = data.results.some(
        (r: any) => r.access?.upgradeRequired
      );
      if (hasRestrictedContent && !isPremiumUser()) {
        setShowUpgradePrompt(true);
      }
      
    } catch (err) {
      setError(t('search.error.unavailable'));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  
  // 监听搜索词变化
  useEffect(() => {
    if (canSearch && debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery, canSearch, performSearch]);
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (canSearch) {
          setIsOpen(true);
        } else {
          setShowNoPermission(true);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSearch, isOpen]);
  
  const isPremiumUser = () => {
    return hasSubscription('pro') || hasPurchase('lifetime');
  };
  
  return (
    <>
      {/* 搜索触发按钮 */}
      <button
        onClick={() => canSearch ? setIsOpen(true) : setShowNoPermission(true)}
        className={`group flex items-center gap-2 px-4 py-2 text-sm 
                   bg-gray-100 dark:bg-gray-800 rounded-lg
                   hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors duration-200 ${
                   isRTL ? 'flex-row-reverse' : ''
                   }`}
        aria-label={t('search.button.label')}
      >
        <Search className="w-4 h-4" />
        <span>{t('search.button.text')}</span>
        {canSearch ? (
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs 
                         bg-white dark:bg-gray-900 rounded">
            ⌘K
          </kbd>
        ) : (
          <Lock className="w-3 h-3 opacity-60" />
        )}
      </button>
      
      {/* 搜索模态框 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative min-h-screen flex items-start justify-center pt-[10vh]">
            <div className="relative bg-white dark:bg-gray-900 rounded-xl 
                          shadow-2xl w-full max-w-3xl mx-4 
                          max-h-[80vh] overflow-hidden">
              
              {/* 搜索头部 */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 
                            border-b dark:border-gray-700">
                <div className={`flex items-center px-4 py-3 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.input.placeholder')}
                    className={`flex-1 px-3 py-1 bg-transparent outline-none
                             text-gray-900 dark:text-gray-100
                             placeholder-gray-500 dark:placeholder-gray-400 ${
                             isRTL ? 'text-right' : ''
                             }`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-1 text-sm text-gray-600 
                             hover:text-gray-900 dark:text-gray-400 
                             dark:hover:text-gray-100 ${
                             isRTL ? 'mr-2' : 'ml-2'
                             }`}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
                
                {/* 用户权限提示 */}
                {userInfo && (
                  <div className="px-4 pb-2 text-xs text-gray-500">
                    {isPremiumUser() ? (
                      <span className={`flex items-center gap-1 ${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        {t('search.membership.premium')}
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 ${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        {t('search.membership.regular')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* 搜索结果 */}
              <div className="overflow-y-auto max-h-[60vh]">
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  error={error}
                  query={query}
                  onSelect={(post) => {
                    // 处理选择结果
                    if (post.access?.canView) {
                      window.location.href = `/${locale}/blog/post/${post.slug}`;
                    } else {
                      setShowUpgradePrompt(true);
                    }
                    setIsOpen(false);
                  }}
                />
              </div>
              
              {/* 底部提示 */}
              {results.length > 0 && (
                <div className="sticky bottom-0 px-4 py-2 
                              bg-gray-50 dark:bg-gray-800 
                              border-t dark:border-gray-700 
                              text-xs text-gray-500">
                  <div className={`flex items-center justify-between ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}>
                    <span>{t('search.results.count', { count: results.length })}</span>
                    <div className={`flex items-center gap-4 ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}>
                      <span>{t('search.shortcuts.navigate')}</span>
                      <span>{t('search.shortcuts.select')}</span>
                      <span>{t('search.shortcuts.close')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 无权限提示模态框 */}
      <NoPermissionModal
        isOpen={showNoPermission}
        onClose={() => setShowNoPermission(false)}
        onLogin={() => {
          // 跳转到登录页面
          router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        }}
      />
      
      {/* 升级提示模态框 */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        currentPlan={userInfo?.subscription || 'free'}
      />
    </>
  );
}