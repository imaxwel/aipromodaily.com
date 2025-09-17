import { memo } from 'react';
import { Lock, Crown, Star } from 'lucide-react';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  publishedAt: string;
  tags: string[];
  access?: {
    level: string;
    canView: boolean;
    previewOnly: boolean;
    upgradeRequired: boolean;
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  onSelect: (result: SearchResult) => void;
}

export const SearchResults = memo(function SearchResults({
  results,
  isLoading,
  error,
  query,
  onSelect
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 
                        border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">搜索中...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-2">搜索出错</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
      </div>
    );
  }
  
  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-500 dark:text-gray-400 text-center">
          <div className="mb-4">输入关键词开始搜索</div>
          <div className="text-sm space-y-1">
            <div>支持搜索文章标题、内容、标签</div>
            <div>使用空格分隔多个关键词</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          没有找到匹配 "{query}" 的文章
        </div>
        <div className="mt-2 text-sm text-gray-400">
          试试其他关键词或检查拼写
        </div>
      </div>
    );
  }
  
  return (
    <div className="divide-y dark:divide-gray-700">
      {results.map((result) => (
        <button
          key={result.slug}
          onClick={() => onSelect(result)}
          className="w-full px-4 py-3 text-left 
                   hover:bg-gray-50 dark:hover:bg-gray-800
                   focus:bg-gray-50 dark:focus:bg-gray-800
                   focus:outline-none transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* 标题和权限标识 */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 
                             truncate">
                  {highlightText(result.title, query)}
                </h3>
                {result.access?.level === 'premium' && (
                  <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
                {result.access?.level === 'exclusive' && (
                  <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
                )}
                {result.access?.upgradeRequired && (
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
              
              {/* 摘要 */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {result.access?.canView || result.access?.previewOnly
                  ? highlightText(result.excerpt, query)
                  : '此内容需要升级会员后查看'}
              </p>
              
              {/* 元信息 */}
              <div className="flex items-center gap-3 mt-2 text-xs 
                            text-gray-500 dark:text-gray-500">
                <span>{formatDate(result.publishedAt)}</span>
                <span>·</span>
                <span>{result.author}</span>
                {result.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <div className="flex gap-1">
                      {result.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 
                                                  bg-gray-100 dark:bg-gray-800 
                                                  rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* 访问状态指示 */}
            <div className="flex-shrink-0">
              {result.access?.upgradeRequired && (
                <div className="px-2 py-1 text-xs bg-yellow-100 
                              dark:bg-yellow-900/20 text-yellow-700 
                              dark:text-yellow-400 rounded">
                  需要升级
                </div>
              )}
              {result.access?.previewOnly && !result.access?.upgradeRequired && (
                <div className="px-2 py-1 text-xs bg-blue-100 
                              dark:bg-blue-900/20 text-blue-700 
                              dark:text-blue-400 rounded">
                  仅预览
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});

// 高亮搜索关键词
function highlightText(text: string, query: string): JSX.Element {
  if (!query.trim()) return <>{text}</>;
  
  const keywords = query.trim().split(/\s+/);
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/50 
                                  text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// 格式化日期
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
}