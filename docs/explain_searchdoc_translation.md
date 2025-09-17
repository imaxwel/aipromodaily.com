# 搜索和翻译功能解释文档

## 概述

本文档解释了项目中两个重要文件的搜索和翻译功能实现：

1. `apps/web/app/(marketing)/[locale]/layout.tsx` - 营销页面的根布局
2. `apps/web/app/(marketing)/[locale]/docs/[[...path]]/layout.tsx` - 文档页面的布局

## 1. 翻译功能 (Internationalization/i18n)

### 1.1 动态路由参数 `[locale]`

两个文件都位于 `[locale]` 动态路由下，这表示：
- URL 路径中包含语言代码，如 `/en/docs`、`/zh/docs`、`/fr/docs` 等
- 系统支持多语言切换，通过 URL 路径参数实现

### 1.2 支持的语言

根据 `config/index.ts` 配置，系统支持以下语言：

| 语言代码 | 语言名称 | 货币 | 文本方向 |
|---------|---------|------|---------|
| en | English | USD | ltr (从左到右) |
| zh | 中文 | CNY | ltr |
| fr | Français | EUR | ltr |
| es | Español | EUR | ltr |
| ru | Русский | RUB | ltr |
| ar | العربية | USD | rtl (从右到左) |
| de | Deutsch | EUR | ltr |

### 1.3 翻译实现机制

#### 营销页面布局 (`(marketing)/[locale]/layout.tsx`)

```typescript
// 使用 next-intl 进行国际化
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

// 主要功能：
1. 设置请求的语言环境：setRequestLocale(locale)
2. 获取对应语言的翻译消息：await getMessages()
3. 通过 NextIntlClientProvider 向子组件提供翻译上下文
4. 在 FumadocsRootProvider 中设置 i18n 配置
```

#### 文档页面布局 (`docs/[[...path]]/layout.tsx`)

```typescript
// 使用 getTranslations 获取翻译函数
import { getTranslations } from "next-intl/server";

// 主要功能：
1. 获取翻译函数：const t = await getTranslations()
2. 根据语言加载对应的文档树：tree={docsSource.pageTree[locale]}
3. 翻译界面文本：t("documentation.title")
4. 启用 i18n 支持：i18n prop
```

## 2. 搜索功能

### 2.1 搜索配置

搜索功能主要在营销页面布局中配置：

```typescript
<FumadocsRootProvider
    search={{
        enabled: true,          // 启用搜索
        options: {
            api: "/api/docs-search",  // 搜索API端点
        },
    }}
>
```

### 2.2 搜索API实现 (`/api/docs-search/route.ts`)

搜索API的主要特点：

1. **多语言搜索支持**
   - 使用 `createI18nSearchAPI` 创建国际化搜索API
   - 为不同语言提供专门的搜索索引

2. **语言映射**
   ```typescript
   const languageMap = {
       en: "english",
       zh: "chinese",  // 注：fumadocs不支持中文，回退到英文
       fr: "french",
       es: "spanish",
       ru: "russian",
       ar: "arabic",
       de: "german",
   }
   ```

3. **搜索索引构建**
   - 从 `docsSource` 获取所有语言的文档
   - 为每个文档创建索引，包含：
     - title（标题）
     - description（描述）
     - structuredData（结构化数据）
     - url（链接）
     - locale（语言）

4. **搜索限制**
   - 只有部分语言支持高级搜索：`["en", "fr", "es", "ru", "ar", "de"]`
   - 中文（zh）由于 fumadocs 限制，目前使用英文搜索引擎

### 2.3 文档源配置 (`docs-source.ts`)

```typescript
export const docsSource = loader({
    baseUrl: "/docs",
    i18n: {
        defaultLanguage: config.i18n.defaultLocale,  // 默认语言：en
        languages: Object.keys(config.i18n.locales), // 所有支持的语言
    },
    source: createMDXSource(allDocs, allDocsMetas),
});
```

## 3. 功能差异对比

| 功能 | 营销页面布局 | 文档页面布局 |
|-----|------------|------------|
| **翻译提供方式** | NextIntlClientProvider（客户端） | getTranslations（服务端） |
| **搜索功能** | ✅ 配置搜索API | ❌ 继承父布局的搜索 |
| **文档树** | ❌ 无 | ✅ 根据语言加载文档树 |
| **导航栏** | 通用 NavBar | 文档专用导航 |
| **侧边栏** | ❌ 无 | ✅ 文档侧边栏 |

## 4. 工作流程

### 4.1 用户访问文档流程

1. 用户访问 `/zh/docs/getting-started`
2. 系统从 URL 提取 `locale = "zh"`
3. 营销布局加载中文翻译消息
4. 文档布局加载中文文档树
5. 搜索功能使用中文索引（如果支持）
6. 界面显示中文内容

### 4.2 搜索流程

1. 用户在搜索框输入关键词
2. 前端调用 `/api/docs-search` API
3. API 根据当前语言筛选相关文档
4. 返回匹配的文档列表
5. 用户点击跳转到对应文档

## 5. 技术栈

- **国际化框架**: next-intl
- **文档框架**: fumadocs-ui / fumadocs-core
- **内容管理**: content-collections
- **MDX支持**: @fumadocs/content-collections

## 6. 注意事项

1. **中文搜索限制**：由于 fumadocs 不原生支持中文分词，中文搜索可能效果有限

2. **RTL语言支持**：阿拉伯语（ar）配置了从右到左的文本方向

3. **静态生成**：使用 `generateStaticParams` 为所有语言预生成页面

4. **Cookie存储**：语言偏好通过 `NEXT_LOCALE` cookie 保存

## 总结

这个系统实现了完整的多语言文档站点，具有：
- 基于URL的语言切换
- 服务端和客户端翻译支持
- 多语言文档搜索
- 自动语言检测和回退机制
- 支持7种语言的国际化体验

搜索功能通过独立的API端点实现，能够根据当前语言环境提供相应的搜索结果，确保用户获得本地化的搜索体验。