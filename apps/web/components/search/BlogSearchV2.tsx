'use client';

import { useState, useEffect } from 'react';
import { useBlogSearch } from '@/hooks/use-blog-search';
import { SearchResults } from './SearchResults';
import { NoPermissionModal } from './NoPermissionModal';
import { UpgradePrompt } from './UpgradePrompt';
import { Search, X, Lock, AlertCircle } from 'lucide-react';
import { useSession } from '@saas/auth/hooks/use-session';
import { usePurchases } from '@saas/payments/hooks/purchases';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { config } from '@repo/config';
import { isSearchEnabled } from '@/lib/config/search';

export function BlogSearchV2() {
  // 检查搜索功能是否启用
  if (!isSearchEnabled()) {
    return null; // 搜索功能禁用时不渲染任何内容
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [showNoPermission, setShowNoPermission] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { user } = useSession();
  const { hasSubscription, hasPurchase } = usePurchases();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // 使用客户端搜索Hook
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isInitialized,
    clearSearch
  } = useBlogSearch({
    debounceDelay: 300,
    minQueryLength: 2,
    limit: 20
  });
  
  // 检查是否是RTL语言
  const isRTL = config.i18n.locales[locale as keyof typeof config.i18n.locales]?.direction === 'rtl';
  
  // 检查用户是否可以搜索（暂时允许所有人搜索，但根据权限显示不同结果）
  const canSearch = true; // 允许所有用户使用搜索功能
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        clearSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, clearSearch]);
  
  const isPremiumUser = () => {
    return hasSubscription('pro') || hasPurchase('lifetime');
  };
  
  // 处理搜索结果点击
  const handleResultClick = (result: any) => {
    // 检查用户权限
    const needsAuth = !user && result.accessLevel !== 'public';
    const needsUpgrade = user && !isPremiumUser() && 
                         (result.accessLevel === 'premium' || result.accessLevel === 'exclusive');
    
    if (needsAuth) {
      setShowNoPermission(true);
      return;
    }
    
    if (needsUpgrade) {
      setShowUpgradePrompt(true);
      return;
    }
    
    // 导航到文章页面
    const slug = result.slug || result.url?.split('/').pop()?.replace('.html', '');
    if (slug) {
      router.push(`/${locale}/blog/post/${slug}`);
      setIsOpen(false);
      clearSearch();
    }
  };
  
  return (
    <>
      {/* 搜索触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
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
        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs 
                       bg-white dark:bg-gray-900 rounded">
          ⌘K
        </kbd>
      </button>
      
      {/* 搜索模态框 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false);
              clearSearch();
            }}
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
                    placeholder={
                      isInitialized 
                        ? t('search.input.placeholder') 
                        : '正在初始化搜索...'
                    }
                    className={`flex-1 px-3 py-1 bg-transparent outline-none
                             text-gray-900 dark:text-gray-100
                             placeholder-gray-500 dark:placeholder-gray-400 ${
                             isRTL ? 'text-right' : ''
                             }`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    autoFocus
                    disabled={!isInitialized}
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
                    onClick={() => {
                      setIsOpen(false);
                      clearSearch();
                    }}
                    className={`px-3 py-1 text-sm text-gray-600 
                             hover:text-gray-900 dark:text-gray-400 
                             dark:hover:text-gray-100 ${
                             isRTL ? 'mr-2' : 'ml-2'
                             }`}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
                
                {/* 搜索状态提示 */}
                {!isInitialized && (
                  <div className="px-4 pb-2">
                    <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>搜索功能正在初始化，请稍候...</span>
                    </div>
                  </div>
                )}
                
                {/* 用户权限提示 */}
                {user && isInitialized && (
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
                {error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-red-500 mb-2">搜索出错</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
                  </div>
                ) : (
                  <SearchResults
                    results={results.map(r => ({
                      ...r,
                      publishedAt: r.meta?.date || new Date().toISOString(),
                      author: r.meta?.author || '作者',
                      tags: r.meta?.tags || [],
                      access: {
                        level: r.accessLevel || 'public',
                        canView: !user ? r.accessLevel === 'public' : 
                                isPremiumUser() || r.accessLevel !== 'premium',
                        previewOnly: false,
                        upgradeRequired: !isPremiumUser() && r.accessLevel === 'premium'
                      }
                    } as any))}
                    isLoading={isLoading}
                    error={error}
                    query={query}
                    onSelect={handleResultClick}
                  />
                )}
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
          router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        }}
      />
      
      {/* 升级提示模态框 */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        currentPlan={'free'}
      />
    </>
  );
}