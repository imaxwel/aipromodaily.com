# 博客搜索功能开关实现文档

## 概述

本文档描述了如何实现一个全局的博客搜索功能开关，用于解决 Pagefind 初始化错误并提供灵活的搜索功能控制。

## 问题背景

在首页访问 `http://localhost:3000/en` 时出现两个 Pagefind 相关的 Next.js 错误：

1. `Failed to initialize Pagefind: {}`
2. `Error: 无法初始化搜索功能`

这些错误源于：
- Pagefind 脚本文件 `/pagefind/pagefind.js` 不存在或未正确生成
- 搜索功能在某些环境下不可用
- 需要一个开关来控制搜索功能的显示和初始化

## 解决方案

### 1. 搜索配置系统

创建了 `lib/config/search.ts` 文件，提供集中的搜索配置管理：

```typescript
// lib/config/search.ts
export interface SearchConfig {
  enabled: boolean;
  pagefindEnabled: boolean;
}

export function getSearchConfig(): SearchConfig {
  const searchEnabled = process.env.NEXT_PUBLIC_SEARCH_ENABLED !== 'false';
  const pagefindEnabled = process.env.NEXT_PUBLIC_PAGEFIND_ENABLED !== 'false';
  
  return {
    enabled: searchEnabled,
    pagefindEnabled: pagefindEnabled,
  };
}

export function isSearchEnabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SEARCH_ENABLED !== 'false';
  }
  
  const config = (window as any).__SEARCH_CONFIG__ || getSearchConfig();
  return config.enabled;
}

export function isPagefindEnabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_PAGEFIND_ENABLED !== 'false';
  }
  
  const config = (window as any).__SEARCH_CONFIG__ || getSearchConfig();
  return config.pagefindEnabled;
}
```

### 2. 环境变量配置

通过环境变量控制搜索功能：

```bash
# .env.local 或 .env
# 搜索功能总开关
NEXT_PUBLIC_SEARCH_ENABLED=false

# Pagefind 引擎开关
NEXT_PUBLIC_PAGEFIND_ENABLED=false
```

**注意**: 只有当值设置为 `'false'` 字符串时才会禁用功能，其他任何值（包括未设置）都会启用功能。

### 3. 组件级别的修改

#### 3.1 BlogSearchV2 组件 (`components/search/BlogSearchV2.tsx`)

```typescript
import { isSearchEnabled } from '@/lib/config/search';

export function BlogSearchV2() {
  // 检查搜索功能是否启用
  if (!isSearchEnabled()) {
    return null; // 搜索功能禁用时不渲染任何内容
  }
  
  // ... 其余组件逻辑
}
```

#### 3.2 BlogSearch 组件 (`components/search/BlogSearch.tsx`)

```typescript
import { isSearchEnabled } from '@/lib/config/search';

export function BlogSearch() {
  // 检查搜索功能是否启用
  if (!isSearchEnabled()) {
    return null; // 搜索功能禁用时不渲染任何内容
  }
  
  // ... 其余组件逻辑
}
```

#### 3.3 搜索 Hook (`hooks/use-blog-search.ts`)

```typescript
import { isSearchEnabled, isPagefindEnabled } from '@/lib/config/search';

export function useBlogSearch(options: UseSearchOptions = {}) {
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

    if (typeof window !== 'undefined') {
      init();
    }
  }, []);
  
  // ... 其余 Hook 逻辑
}
```

#### 3.4 Pagefind 客户端 (`lib/search/pagefind-client.ts`)

```typescript
import { isPagefindEnabled } from '@/lib/config/search';

export async function initPagefind(): Promise<PagefindInstance> {
  // 检查 Pagefind 功能是否启用
  if (!isPagefindEnabled()) {
    throw new Error('搜索功能已禁用');
  }
  
  // ... 其余初始化逻辑
}
```

## 使用方法

### 临时禁用搜索功能

在项目根目录的 `.env.local` 文件中添加：

```bash
NEXT_PUBLIC_SEARCH_ENABLED=false
NEXT_PUBLIC_PAGEFIND_ENABLED=false
```

然后重启开发服务器：

```bash
npm run dev
# 或
yarn dev
```

### 启用搜索功能

移除环境变量或设置为其他值：

```bash
NEXT_PUBLIC_SEARCH_ENABLED=true
NEXT_PUBLIC_PAGEFIND_ENABLED=true
```

或者直接删除这些环境变量（默认为启用）。

## 配置选项

### 完全禁用搜索功能

```bash
NEXT_PUBLIC_SEARCH_ENABLED=false
NEXT_PUBLIC_PAGEFIND_ENABLED=false
```

效果：
- 首页搜索框 "Search articles... ⌘K" 完全消失
- 不会尝试初始化 Pagefind
- 不会出现相关错误

### 只禁用 Pagefind，保留搜索 UI

```bash
NEXT_PUBLIC_SEARCH_ENABLED=true
NEXT_PUBLIC_PAGEFIND_ENABLED=false
```

效果：
- 搜索框仍然显示
- 点击搜索会显示 "搜索功能已禁用" 错误
- 可以用于测试或准备替代搜索实现

### 启用所有功能（默认）

```bash
NEXT_PUBLIC_SEARCH_ENABLED=true
NEXT_PUBLIC_PAGEFIND_ENABLED=true
```

或者不设置这些环境变量。

## 错误处理

当搜索功能被禁用时：

1. **组件级别**: 组件返回 `null`，不渲染任何内容
2. **Hook 级别**: 设置错误状态 "搜索功能已禁用"
3. **客户端级别**: 抛出 "搜索功能已禁用" 错误

这样可以优雅地处理搜索功能不可用的情况，避免控制台错误。

## 开发和生产环境配置

### 开发环境

在开发期间，如果遇到 Pagefind 错误，可以临时禁用：

```bash
# .env.local
NEXT_PUBLIC_SEARCH_ENABLED=false
```

### 生产环境

确保 Pagefind 构建正确后启用：

```bash
# .env.production
NEXT_PUBLIC_SEARCH_ENABLED=true
NEXT_PUBLIC_PAGEFIND_ENABLED=true
```

## 技术细节

### 为什么使用 NEXT_PUBLIC_ 前缀

Next.js 要求客户端可访问的环境变量必须以 `NEXT_PUBLIC_` 前缀开头。这些变量会被构建时注入到客户端代码中。

### SSR 兼容性

配置函数同时支持服务端渲染（SSR）和客户端渲染（CSR）：

- 在服务端：直接读取 `process.env`
- 在客户端：可以从 `window.__SEARCH_CONFIG__` 或 `process.env` 读取

### 默认行为

系统设计为"默认启用"：
- 只有显式设置 `'false'` 字符串才会禁用功能
- 未设置变量、空字符串、或任何其他值都会启用功能
- 这确保了向后兼容性

## 文件结构

实现涉及的主要文件：

```
lib/
  config/
    search.ts                    # 搜索配置系统
  search/
    pagefind-client.ts          # Pagefind 客户端（已修改）
hooks/
  use-blog-search.ts            # 搜索 Hook（已修改）
components/
  search/
    BlogSearch.tsx              # 搜索组件 V1（已修改）
    BlogSearchV2.tsx            # 搜索组件 V2（已修改）
.env.example.search             # 示例环境变量配置
docs/
  search_switch.md              # 本文档
```

## 故障排除

### 问题：设置环境变量后搜索框仍然显示

**解决方案**：
1. 确认环境变量设置正确：`NEXT_PUBLIC_SEARCH_ENABLED=false`
2. 重启开发服务器
3. 清除浏览器缓存

### 问题：生产环境下搜索功能不工作

**解决方案**：
1. 确认 `.env.production` 中的配置
2. 检查 Pagefind 是否正确构建
3. 验证 `/pagefind/pagefind.js` 文件是否存在

### 问题：搜索显示 "搜索功能已禁用" 错误

这是正常行为，表明：
- `NEXT_PUBLIC_SEARCH_ENABLED=true`（搜索 UI 显示）
- `NEXT_PUBLIC_PAGEFIND_ENABLED=false`（Pagefind 引擎禁用）

如需完全隐藏搜索功能，请设置 `NEXT_PUBLIC_SEARCH_ENABLED=false`。

## 总结

通过这个搜索开关系统，您可以：

1. **解决当前错误**: 通过设置 `NEXT_PUBLIC_SEARCH_ENABLED=false` 临时隐藏搜索功能
2. **灵活控制**: 分别控制搜索 UI 和 Pagefind 引擎
3. **优雅降级**: 在搜索不可用时提供合理的用户体验
4. **环境适配**: 在不同环境下使用不同的搜索配置
5. **向后兼容**: 默认启用所有功能，不影响现有行为

使用这个系统，您可以立即解决 Pagefind 错误，同时为未来的搜索功能开发提供了灵活的基础架构。