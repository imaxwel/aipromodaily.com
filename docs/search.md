# 博客搜索功能实现最佳实践

## 概述

本文档为基于 supabase.dev 二次开发的 Next.js 博客项目提供搜索功能的实现方案。项目使用 MDX 文件作为博文内容源，通过 content-collections 进行内容管理。

## 目录

1. [技术选型对比](#技术选型对比)
2. [推荐方案：Pagefind 实现](#推荐方案pagefind-实现)
3. [备选方案：Algolia 实现](#备选方案algolia-实现)
4. [自建搜索方案](#自建搜索方案)
5. [性能优化](#性能优化)
6. [国际化支持](#国际化支持)
7. [权限控制](#权限控制)

## 技术选型对比

### 1. 静态搜索方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Pagefind** | • 零配置<br/>• 构建时生成索引<br/>• 完全静态<br/>• 支持中文<br/>• 免费 | • 仅支持静态内容<br/>• 索引文件较大 | MDX 博客的最佳选择 |
| **Algolia** | • 搜索速度快<br/>• 功能强大<br/>• 支持实时更新 | • 有免费额度限制<br/>• 需要配置管理 | 大型项目或需要高级功能 |
| **Fuse.js** | • 轻量级<br/>• 易于集成<br/>• 纯前端实现 | • 大数据集性能差<br/>• 功能相对简单 | 小型项目（<100篇文章） |
| **FlexSearch** | • 高性能<br/>• 内存占用小<br/>• 支持多语言 | • 文档较少<br/>• 配置复杂 | 需要高性能的中型项目 |

## 推荐方案：Pagefind 实现

### 为什么选择 Pagefind？

1. **专为静态网站设计**：完美契合 MDX 博客场景
2. **零运行时成本**：搜索功能完全在客户端运行
3. **自动索引生成**：构建时自动处理
4. **优秀的中文支持**：内置中文分词
5. **渐进式加载**：按需加载索引片段

### 实现步骤

#### 1. 安装依赖

```bash
pnpm add -D pagefind
```

#### 2. 配置构建脚本

修改 `apps/web/package.json`：

```json
{
  "scripts": {
    "build": "next build && pnpm build:search",
    "build:search": "pagefind --site out --output-path public/pagefind"
  }
}
```

#### 3. 创建搜索组件

创建 `apps/web/modules/marketing/blog/components/Search.tsx`：

```tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Search as SearchIcon, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

interface PagefindResult {
  url: string;
  title: string;
  excerpt: string;
  meta?: {
    image?: string;
    date?: string;
    author?: string;
    tags?: string[];
  };
}

interface Pagefind {
  search: (query: string) => Promise<{
    results: Array<{
      data: () => Promise<PagefindResult>;
    }>;
  }>;
}

export function BlogSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const pagefindRef = useRef<Pagefind | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // 初始化 Pagefind
  useEffect(() => {
    const initPagefind = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // 动态导入 Pagefind
        const pagefindModule = await import(
          /* webpackIgnore: true */
          '/pagefind/pagefind.js'
        );
        
        if (pagefindModule?.default) {
          await pagefindModule.default.init();
          pagefindRef.current = pagefindModule.default;
        }
      } catch (error) {
        console.error('Failed to initialize Pagefind:', error);
      }
    };

    initPagefind();
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!pagefindRef.current || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const search = await pagefindRef.current.search(searchQuery);
      
      // 加载前 5 个结果的详细数据
      const resultData = await Promise.all(
        search.results.slice(0, 5).map(r => r.data())
      );
      
      // 根据当前语言过滤结果
      const filteredResults = resultData.filter(result => {
        const urlLocale = result.url.split('/')[1];
        return urlLocale === locale;
      });
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  // 监听搜索词变化
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // ESC 关闭搜索
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 搜索触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <SearchIcon className="w-4 h-4" />
        <span>搜索文章...</span>
        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-white rounded dark:bg-gray-900">
          ⌘K
        </kbd>
      </button>

      {/* 搜索模态框 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative min-h-screen flex items-start justify-center pt-[10vh]">
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
              {/* 搜索输入框 */}
              <div className="flex items-center border-b dark:border-gray-700">
                <SearchIcon className="w-5 h-5 ml-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索文章标题、内容..."
                  className="flex-1 px-4 py-4 text-lg bg-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 搜索结果 */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    搜索中...
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={result.url}
                        onClick={() => {
                          router.push(result.url);
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {result.title}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {result.excerpt}
                        </div>
                        {result.meta?.date && (
                          <div className="mt-2 text-xs text-gray-500">
                            {new Date(result.meta.date).toLocaleDateString()}
                            {result.meta.author && ` • ${result.meta.author}`}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className="p-8 text-center text-gray-500">
                    没有找到相关文章
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    输入关键词开始搜索
                  </div>
                )}
              </div>

              {/* 搜索提示 */}
              {results.length > 0 && (
                <div className="px-4 py-2 text-xs text-gray-500 border-t dark:border-gray-700">
                  按 Enter 打开 • 按 ESC 关闭
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

#### 4. 创建自定义 Hook

创建 `apps/web/hooks/use-debounce.ts`：

```tsx
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### 5. 配置 Pagefind

创建 `pagefind.yml`：

```yaml
# Pagefind 配置文件
source: out
output_path: public/pagefind
exclude_selectors:
  - "[data-pagefind-ignore]"
  - "nav"
  - "footer"
  - "script"
  - "style"

# 为搜索结果添加元数据
meta:
  title: "h1, h2, title"
  image: "meta[property='og:image']"
  date: "time[datetime]"
  author: "[data-author]"
  tags: "[data-tags]"

# 支持中文搜索
language: zh
```

#### 6. 修改博客页面模板

更新 `apps/web/app/(marketing)/[locale]/blog/post/[slug]/page.tsx` 添加搜索元数据：

```tsx
// 在页面组件中添加结构化数据
export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  
  return (
    <article>
      {/* 添加 Pagefind 可识别的元数据 */}
      <div data-pagefind-body>
        <h1>{post.title}</h1>
        <time dateTime={post.date}>{post.date}</time>
        <div data-author>{post.authorName}</div>
        <div data-tags>{post.tags.join(', ')}</div>
        
        {/* 文章内容 */}
        <PostContent post={post} />
      </div>
    </article>
  );
}
```

## 备选方案：Algolia 实现

### 实现步骤

#### 1. 安装依赖

```bash
pnpm add algoliasearch react-instantsearch
```

#### 2. 创建索引脚本

创建 `scripts/build-algolia-index.js`：

```javascript
const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { remark } = require('remark');
const strip = require('strip-markdown');

// 初始化 Algolia
const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex('blog_posts');

async function buildSearchIndex() {
  const postsDirectory = path.join(process.cwd(), 'apps/web/content/posts');
  const files = fs.readdirSync(postsDirectory);
  
  const posts = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      // 提取纯文本内容
      const processedContent = await remark()
        .use(strip)
        .process(content);
      
      const plainText = processedContent.toString();
      
      return {
        objectID: filename.replace(/\.mdx?$/, ''),
        title: data.title,
        excerpt: plainText.slice(0, 200),
        content: plainText,
        date: data.date,
        author: data.authorName,
        tags: data.tags,
        locale: filename.match(/\.([a-z]{2})\.mdx?$/)?.[1] || 'en',
        accessLevel: data.accessLevel || 'PUBLIC',
      };
    })
  );
  
  // 批量上传到 Algolia
  await index.saveObjects(posts);
  console.log(`已索引 ${posts.length} 篇文章`);
}

buildSearchIndex().catch(console.error);
```

#### 3. 创建 Algolia 搜索组件

```tsx
// apps/web/modules/marketing/blog/components/AlgoliaSearch.tsx
'use client';

import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
  Configure,
  PoweredBy,
} from 'react-instantsearch';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export function AlgoliaSearch() {
  const router = useRouter();
  const locale = useLocale();
  
  return (
    <InstantSearch searchClient={searchClient} indexName="blog_posts">
      <Configure filters={`locale:${locale}`} />
      <SearchBox
        placeholder="搜索文章..."
        classNames={{
          root: 'relative',
          input: 'w-full px-4 py-2 border rounded-lg',
          submit: 'absolute right-2 top-2',
          reset: 'absolute right-8 top-2',
        }}
      />
      <Hits
        hitComponent={({ hit }) => (
          <article
            onClick={() => router.push(`/${locale}/blog/post/${hit.objectID}`)}
            className="p-4 border-b cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-semibold">
              <Highlight attribute="title" hit={hit} />
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              <Highlight attribute="excerpt" hit={hit} />
            </p>
            <div className="flex gap-2 mt-2 text-xs text-gray-500">
              <span>{hit.date}</span>
              <span>•</span>
              <span>{hit.author}</span>
            </div>
          </article>
        )}
      />
      <PoweredBy />
    </InstantSearch>
  );
}
```

## 自建搜索方案

### 使用 SQLite + FTS5 全文搜索

#### 1. 创建搜索 API

```typescript
// apps/web/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'search.db'));

// 初始化 FTS5 表
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
    slug,
    title,
    content,
    excerpt,
    author,
    tags,
    locale,
    date,
    tokenize = 'unicode61'
  );
`);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const locale = searchParams.get('locale') || 'en';
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    const stmt = db.prepare(`
      SELECT 
        slug,
        title,
        excerpt,
        author,
        date,
        highlight(posts_fts, 1, '<mark>', '</mark>') as highlighted_title,
        snippet(posts_fts, 2, '<mark>', '</mark>', '...', 20) as highlighted_content
      FROM posts_fts
      WHERE posts_fts MATCH ? AND locale = ?
      ORDER BY rank
      LIMIT 10
    `);
    
    const results = stmt.all(`"${query}"`, locale);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

#### 2. 构建索引脚本

```javascript
// scripts/build-sqlite-index.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const db = new Database('search.db');

// 创建 FTS5 表
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
    slug,
    title,
    content,
    excerpt,
    author,
    tags,
    locale,
    date,
    tokenize = 'unicode61'
  );
`);

// 清空现有数据
db.exec('DELETE FROM posts_fts');

// 读取并索引所有文章
const postsDir = path.join(process.cwd(), 'apps/web/content/posts');
const files = fs.readdirSync(postsDir);

const insert = db.prepare(`
  INSERT INTO posts_fts (
    slug, title, content, excerpt, author, tags, locale, date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

files.forEach(filename => {
  const filePath = path.join(postsDir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  const slug = filename.replace(/\.mdx?$/, '');
  const locale = filename.match(/\.([a-z]{2})\.mdx?$/)?.[1] || 'en';
  
  insert.run(
    slug,
    data.title,
    content,
    data.excerpt || content.slice(0, 200),
    data.authorName,
    data.tags?.join(' '),
    locale,
    data.date
  );
});

db.close();
console.log('搜索索引构建完成');
```

## 性能优化

### 1. 搜索结果缓存

```typescript
// apps/web/lib/search-cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 100, // 最多缓存 100 个搜索结果
  ttl: 1000 * 60 * 5, // 5 分钟过期
});

export function getCachedSearch(key: string) {
  return cache.get(key);
}

export function setCachedSearch(key: string, value: any) {
  cache.set(key, value);
}
```

### 2. 搜索防抖优化

```typescript
// 使用 React Query 进行搜索状态管理
import { useQuery } from '@tanstack/react-query';

export function useSearch(query: string, locale: string) {
  return useQuery({
    queryKey: ['search', query, locale],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&locale=${locale}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      return response.json();
    },
    enabled: query.length >= 2, // 至少输入 2 个字符才搜索
    staleTime: 1000 * 60 * 5, // 5 分钟内认为数据是新鲜的
  });
}
```

### 3. 索引优化

```javascript
// 分片索引策略
const CHUNK_SIZE = 50; // 每个索引片段包含 50 篇文章

function buildChunkedIndex(posts) {
  const chunks = [];
  
  for (let i = 0; i < posts.length; i += CHUNK_SIZE) {
    const chunk = posts.slice(i, i + CHUNK_SIZE);
    chunks.push({
      id: Math.floor(i / CHUNK_SIZE),
      posts: chunk,
      minDate: chunk[0].date,
      maxDate: chunk[chunk.length - 1].date,
    });
  }
  
  return chunks;
}
```

## 国际化支持

### 1. 多语言索引策略

```typescript
// 为每种语言创建独立的索引
interface LocalizedIndex {
  [locale: string]: SearchIndex;
}

class MultilingualSearch {
  private indexes: LocalizedIndex = {};
  
  async search(query: string, locale: string) {
    const index = this.indexes[locale];
    if (!index) {
      throw new Error(`No index for locale: ${locale}`);
    }
    
    return index.search(query);
  }
  
  async buildIndex(locale: string, posts: Post[]) {
    // 根据语言使用不同的分词器
    const tokenizer = this.getTokenizer(locale);
    const index = new SearchIndex(tokenizer);
    
    posts.forEach(post => {
      index.add(post);
    });
    
    this.indexes[locale] = index;
  }
  
  private getTokenizer(locale: string) {
    switch (locale) {
      case 'zh':
        return new ChineseTokenizer();
      case 'ja':
        return new JapaneseTokenizer();
      default:
        return new EnglishTokenizer();
    }
  }
}
```

### 2. 搜索关键词翻译

```typescript
// 自动翻译搜索关键词以搜索多语言内容
async function translateAndSearch(query: string, targetLocales: string[]) {
  const translations = await Promise.all(
    targetLocales.map(locale => translateQuery(query, locale))
  );
  
  const results = await Promise.all(
    translations.map((translatedQuery, i) => 
      search(translatedQuery, targetLocales[i])
    )
  );
  
  // 合并和排序结果
  return mergeSearchResults(results);
}
```

## 权限控制

### 1. 基于用户权限的搜索过滤

```typescript
// apps/web/app/api/search/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userAccessLevel = getUserAccessLevel(session);
  
  // 根据用户权限过滤搜索结果
  const results = await searchPosts(query, {
    locale,
    accessLevels: getAllowedAccessLevels(userAccessLevel),
  });
  
  return NextResponse.json({ results });
}

function getAllowedAccessLevels(userLevel: string): string[] {
  switch (userLevel) {
    case 'PREMIUM':
      return ['PUBLIC', 'REGISTERED', 'PREMIUM'];
    case 'REGISTERED':
      return ['PUBLIC', 'REGISTERED'];
    default:
      return ['PUBLIC'];
  }
}
```

### 2. 搜索结果访问控制标记

```tsx
// 在搜索结果中显示访问级别
function SearchResult({ result, userAccessLevel }) {
  const canAccess = checkAccess(result.accessLevel, userAccessLevel);
  
  return (
    <div className={`search-result ${!canAccess ? 'opacity-60' : ''}`}>
      <h3>{result.title}</h3>
      {result.accessLevel !== 'PUBLIC' && (
        <span className="access-badge">
          {result.accessLevel === 'PREMIUM' ? '💎 付费内容' : '🔒 需要登录'}
        </span>
      )}
      <p>{canAccess ? result.excerpt : '此内容需要更高权限查看'}</p>
    </div>
  );
}
```

## 监控和分析

### 1. 搜索分析追踪

```typescript
// 记录搜索查询以优化搜索体验
async function trackSearch(query: string, resultsCount: number, locale: string) {
  await fetch('/api/analytics/search', {
    method: 'POST',
    body: JSON.stringify({
      query,
      resultsCount,
      locale,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    }),
  });
}
```

### 2. 热门搜索词统计

```typescript
// apps/web/app/api/analytics/popular-searches/route.ts
export async function GET() {
  const popularSearches = await db
    .select({
      query: searchLogs.query,
      count: count(searchLogs.id),
    })
    .from(searchLogs)
    .where(gte(searchLogs.createdAt, thirtyDaysAgo))
    .groupBy(searchLogs.query)
    .orderBy(desc(count(searchLogs.id)))
    .limit(10);
  
  return NextResponse.json(popularSearches);
}
```

## 部署注意事项

### 1. 构建时配置

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 确保 Pagefind 资源正确打包
      config.resolve.alias['pagefind'] = false;
    }
    return config;
  },
  
  // 静态导出配置
  output: 'export',
  
  // 确保搜索页面正确生成
  generateStaticParams: async () => {
    return [
      { locale: 'en' },
      { locale: 'zh' },
      // 其他支持的语言
    ];
  },
};
```

### 2. CI/CD 集成

```yaml
# .github/workflows/deploy.yml
name: Deploy with Search Index

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build application
        run: pnpm build
        
      - name: Build search index
        run: pnpm build:search
        
      - name: Deploy
        run: pnpm deploy
```

## 最佳实践总结

1. **选择合适的搜索方案**
   - 小型博客（<100篇）：使用 Fuse.js 或 FlexSearch
   - 中型博客（100-1000篇）：使用 Pagefind
   - 大型博客（>1000篇）：使用 Algolia 或 Elasticsearch

2. **优化搜索体验**
   - 实现搜索防抖（300ms）
   - 提供键盘快捷键（Cmd/Ctrl + K）
   - 显示搜索历史和热门搜索
   - 实现搜索结果高亮

3. **性能优化**
   - 使用 Web Worker 进行搜索计算
   - 实现搜索结果缓存
   - 按需加载搜索组件
   - 使用虚拟滚动显示大量结果

4. **可访问性**
   - 支持键盘导航
   - 提供清晰的视觉反馈
   - 确保屏幕阅读器兼容
   - 支持移动端手势

5. **监控和改进**
   - 追踪搜索查询和点击率
   - 分析无结果搜索
   - 收集用户反馈
   - 定期更新搜索算法

## 相关资源

- [Pagefind 官方文档](https://pagefind.app/)
- [Algolia DocSearch](https://docsearch.algolia.com/)
- [FlexSearch GitHub](https://github.com/nextapps-de/flexsearch)
- [Fuse.js 文档](https://fusejs.io/)
- [SQLite FTS5 文档](https://www.sqlite.org/fts5.html)

## 更新日志

- 2024-12-30: 初始版本，包含 Pagefind、Algolia 和自建方案
- 待更新: 添加 Elasticsearch 集成方案
- 待更新: 添加语音搜索支持