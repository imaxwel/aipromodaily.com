# 本工程（apps/web）RTL 专用推荐方案

本节针对当前仓库实际技术栈与目录结构，给出最小改造集，让首页顶部语言选择菜单切换到阿拉伯语（ar）时，全站从右到左（RTL）显示；切回其他语言时恢复 LTR。方案与代码片段均基于你项目的真实文件路径。

工程现状识别：
- Next.js 15 App Router
- 国际化：next-intl 4，使用中间件 apps/web/middleware.ts 与 routing.ts
- 入口包装：apps/web/modules/shared/components/Document.tsx 负责输出 <html> 与 <body>；目前只设置了 lang，未设置 dir
- 语言切换入口：营销站导航 apps/web/modules/marketing/shared/components/NavBar.tsx 内的 LocaleSwitch
- CSS：Tailwind v4（通过 @tailwindcss/postcss），全局样式在 apps/web/app/globals.css

落地目标（优先级顺序）：
1) SSR 首屏正确：在 Document.tsx 的 <html> 标签上输出 dir=rtl/ltr
2) 客户端切换语言无刷新同步：在客户端监听 locale 变化，及时更新 <html> 的 dir 与 lang，避免 Hydration 抖动
3) 关键交互方向优化（建议）：
   - Pagination 上/下一页箭头在 RTL 下镜像
   - NavBar 移动端抽屉在 RTL 下从左侧弹出
4) 轻量 CSS 辅助类（可选）：提供 .rtl-flip 等工具类

—

一、在 SSR 阶段为 <html> 设置 dir

当前代码片段（节选）：
```tsx path=C:\Users\aitech\dev\hope2.do\apps\web\modules\shared\components\Document.tsx start=16
export async function Document({
	children,
	locale,
}: PropsWithChildren<{ locale: string }>) {
	const cookieStore = await cookies();
	const consentCookie = cookieStore.get("consent");

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={GeistSans.variable}
		>
```

推荐修改（要点）：
- 依据 locale 计算 dir（示例：ar/he/fa/ur 归为 RTL）
- 在 <html> 上设置 dir 属性
- 在 <body> 内引入一个极小的客户端组件 DirSync，保证 CSR 切换时也能即时更新

示例修改后（示意）：
```tsx path=null start=null
// apps/web/modules/shared/components/Document.tsx（示意片段）
export async function Document({ children, locale }: { children: React.ReactNode; locale: string }) {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get("consent");

  const isRtlLocale = (l: string) => ["ar", "he", "fa", "ur"].includes(l);
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={GeistSans.variable}>
      <body className={cn("min-h-screen bg-background text-foreground antialiased")}> 
        {/* 保证客户端路由切换语言后，<html> 的 dir/lang 也能同步 */}
        <DirSync locale={locale} />
        {children}
      </body>
    </html>
  );
}
```

二、添加客户端 DirSync 组件（保证语言切换后即时同步 dir/lang）

新建文件：apps/web/modules/shared/components/DirSync.tsx
```tsx path=null start=null
"use client";
import { useEffect } from "react";

function getDir(locale: string) {
  return ["ar", "he", "fa", "ur"].includes(locale) ? "rtl" : "ltr";
}

export function DirSync({ locale }: { locale: string }) {
  useEffect(() => {
    const dir = getDir(locale);
    const html = document.documentElement;
    // 仅在实际变更时才设置，避免多余重绘
    if (html.getAttribute("dir") !== dir) html.setAttribute("dir", dir);
    if (html.getAttribute("lang") !== locale) html.setAttribute("lang", locale);
  }, [locale]);
  return null;
}
```

说明：你已经在 App Router 的 layout 中以 <Document locale={locale}> 包裹页面。以营销站为例：
```tsx path=C:\Users\aitech\dev\hope2.do\apps\web\app\(marketing)\[locale]\layout.tsx start=32
	return (
		<Document locale={locale}>
			<FumadocsRootProvider
				i18n={{ locale }}
				search={{
```
因此只需改造 Document.tsx 并添加 DirSync，即可完成 SSR+CSR 的方向切换。

—

三、关键组件的方向感知（建议）

1) Pagination 箭头方向

现有片段（节选）：
```tsx path=C:\Users\aitech\dev\hope2.do\apps\web\components\ui\Pagination.tsx start=71
  return (
    <nav className="flex items-center justify-center mt-12" aria-label="Pagination">
      <div className="flex items-center gap-1">
        {/* 上一页按钮 */}
        {currentPage > 1 ? (
          <LocaleLink
            href={createPageUrl(currentPage - 1)}
            className="inline-flex items-center justify-center size-10 rounded-lg border bg-background hover:bg-accent transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </LocaleLink>
```

推荐改造：抽象 useIsRTL Hook，RTL 下交换左右箭头。

新增 Hook：apps/web/modules/shared/hooks/use-is-rtl.ts
```ts path=null start=null
"use client";
import { useLocale } from "next-intl";

export function useIsRTL() {
  const locale = useLocale();
  return ["ar", "he", "fa", "ur"].includes(locale);
}
```

在 Pagination 中使用：
```tsx path=null start=null
import { useIsRTL } from "@shared/hooks/use-is-rtl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination(props) {
  const isRTL = useIsRTL();
  // ...
  return (
    <nav aria-label="Pagination">
      {/* 上一页按钮 */}
      {currentPage > 1 ? (
        <LocaleLink /* ... */ aria-label="Previous page">
          {isRTL ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </LocaleLink>
      ) : (
        <span /* ... */>
          {isRTL ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </span>
      )}
      {/* ...中间页码... */}
      {/* 下一页按钮 */}
      {currentPage < totalPages ? (
        <LocaleLink /* ... */ aria-label="Next page">
          {isRTL ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </LocaleLink>
      ) : (
        <span /* ... */>
          {isRTL ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </span>
      )}
    </nav>
  );
}
```

2) 移动端抽屉方向（NavBar）

现有片段（节选，右侧抽屉）：
```tsx path=C:\Users\aitech\dev\hope2.do\apps\web\modules\marketing\shared\components\NavBar.tsx start=141
						<Sheet
							open={mobileMenuOpen}
							onOpenChange={(open) => setMobileMenuOpen(open)}
						>
							<SheetTrigger asChild>
								<Button
									className="lg:hidden"
									size="icon"
									variant="light"
									aria-label="Menu"
								>
									<MenuIcon className="size-4" />
								</Button>
							</SheetTrigger>
							<SheetContent className="w-[280px]" side="right">
								<SheetTitle />
```

推荐改造：在 RTL 下从左侧弹出。
```tsx path=null start=null
import { useIsRTL } from "@shared/hooks/use-is-rtl";

function NavBar() {
  const isRTL = useIsRTL();
  // ...
  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>{/* ... */}</SheetTrigger>
      <SheetContent className="w-[280px]" side={isRTL ? "left" : "right"}>
        <SheetTitle />
        {/* ... */}
      </SheetContent>
    </Sheet>
  );
}
```

—

四、轻量 CSS 工具（可选）

在 apps/web/app/globals.css 末尾追加：
```css path=null start=null
/* RTL helpers */
[dir="rtl"] .rtl-flip { transform: scaleX(-1); }
/* 示例：为需要镜像的 SVG 图标加上 className="rtl-flip" 即可 */
```
Tailwind v4 已提供大量逻辑属性支持；对于零星需要镜像的元素，推荐用上述选择器，不必引入额外插件。

—

五、可选：在配置中为 locale 增加 direction 字段（未来可扩展）

如果你希望将方向收敛到配置层，可在 config/index.ts 为各语言补充 direction，示例：
```ts path=null start=null
export const config = {
  i18n: {
    locales: {
      en: { currency: "USD", label: "English", direction: "ltr" },
      zh: { currency: "CNY", label: "中文", direction: "ltr" },
      ar: { currency: "USD", label: "العربية", direction: "rtl" },
      // ...
    },
    // ...
  },
} as const;
```
随后在 Document/DirSync/useIsRTL 中读取 config.i18n.locales[locale].direction 即可。

—

六、验证与回归
- 进入 /ar/... 路由或在导航中切到 العربية：<html dir="rtl" lang="ar">，布局与对齐从右至左
- 切回其它语言：dir 自动恢复 ltr
- 验证分页箭头、移动端抽屉方向是否随语言切换镜像
- 对富文本/博文页中包含英文或链接的片段，建议在渲染器中启用 <bdi> 或 unicode-bidi: isolate 以避免双向文本错位

至此，最小改造即可满足“切换阿拉伯语时页面从右到左显示”的需求，并为后续组件级优化与样式细化留出扩展空间。

---

# 在 Next.js 博客中同时支持从左到右（LTR）与从右到左（RTL）的最佳实践（以阿拉伯语为例）

本文档总结了在 Next.js 博客系统中同时支持 LTR 与 RTL 的完整实践指南，目标是在首页顶部语言选择菜单切换至阿拉伯语（ar，direction: rtl）时，页面整体布局、组件与样式自然切换为从右到左显示，并在返回其它语言（如简体中文、英文等）时恢复 LTR 行为。

适用范围：
- Next.js App Router 或 Pages Router
- CSS/Tailwind/styled-components/Emotion/Chakra UI 等常见栈

核心原则：
1) 服务端与客户端统一设置 dir 与 lang，使 SSR 与 Hydration 一致。
2) CSS 使用逻辑属性（logical properties）与语义化对齐（start/end），少用 left/right。
3) 组件与资源（箭头图标、轮播方向等）可根据 dir 适配或镜像。
4) 国际化日期/数字/货币等使用 Intl API 按 locale 输出。

---

## 1. 基础：正确设置 html 的 dir 与 lang

- dir 决定了文档的书写方向（rtl 或 ltr）。
- lang 指定当前语言，让屏幕阅读器、拼写检查、Hyphenation 等行为正确。

如果你使用 App Router（app 目录）：在顶层 RootLayout（含 locale 段）中注入 dir、lang。

```tsx path=null start=null
// app/[locale]/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

// 你的语言配置，可来自配置文件、DB 或常量
const languages = {
  zh: { label: "简体中文", direction: "ltr" as const },
  en: { label: "English", direction: "ltr" as const },
  ar: { label: "العربية", direction: "rtl" as const },
};

export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: keyof typeof languages };
}) {
  const locale = languages[params.locale] ? params.locale : "en";
  const dir = languages[locale].direction;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

Pages Router（pages 目录）可在 _document.tsx 中根据当前 locale 注入：

```tsx path=null start=null
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document<{ locale: string; dir: "ltr" | "rtl" }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    // 依据你的 i18n 方案，从 cookie、query 或 next-i18next 中取 locale
    const locale = (ctx?.query?.locale as string) || "en";
    const dir = locale === "ar" ? "rtl" : "ltr";
    return { ...initialProps, locale, dir } as any;
  }

  render() {
    const { locale, dir } = (this.props as any);
    return (
      <Html lang={locale} dir={dir}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

注意 suppressHydrationWarning：当客户端切换语言导致 dir/lang 改变时，可避免 Hydration 警告。

---

## 2. 语言切换时同步更新 dir（客户端）

即便 SSR 已正确设置，语言切换（客户端路由）后也要即时更新 document.documentElement 的 dir 与 lang，确保无刷新切换正确。

```tsx path=null start=null
// components/LanguageSwitcher.tsx (客户端组件示例)
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const languages = {
  zh: { label: "简体中文", direction: "ltr" as const },
  en: { label: "English", direction: "ltr" as const },
  ar: { label: "العربية", direction: "rtl" as const },
};

type Locale = keyof typeof languages;

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  // 切换后更新 <html> 的 dir 与 lang
  useEffect(() => {
    const { direction } = languages[currentLocale];
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", currentLocale);
  }, [currentLocale]);

  const onChange = (next: Locale) => {
    // 依据你的路由结构跳转：如 /[locale]/... 结构
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      segments[0] = next; // 替换第一个段为 locale
    }
    router.push("/" + segments.join("/"));
  };

  return (
    <select value={currentLocale} onChange={(e) => onChange(e.target.value as Locale)}>
      {Object.entries(languages).map(([k, v]) => (
        <option key={k} value={k}>
          {v.label}
        </option>
      ))}
    </select>
  );
}
```

若使用 next-i18next 或 next-intl，请在切换后同样更新 html dir/lang（或以框架钩子提供的方法设置）。

---

## 3. CSS 层面：优先使用逻辑属性与语义化对齐

避免写死 left/right、margin-left/right、padding-left/right。

推荐改写：
- margin-left/right -> margin-inline-start/end
- padding-left/right -> padding-inline-start/end
- left/right -> inset-inline-start/end
- border-left/right -> border-inline-start/end
- text-align: left/right -> text-align: start/end
- float: left/right -> float: inline-start/inline-end

示例：

```css path=null start=null
/* 不推荐 */
.card {
  padding-left: 16px;
  text-align: left;
}

/* 推荐：自动随 dir 切换 */
.card {
  padding-inline-start: 16px;
  text-align: start;
}
```

布局方向：
- Flex 方向尽量保持 row，不要为了 RTL 人为切 row-reverse。需要时，使用 gap、justify-content: space-between 等组合，减少方向敏感。
- 仅在个别必须镜像的容器上使用 flex-direction: row-reverse，并确保内部组件未对齐硬编码。

---

## 4. Tailwind CSS 的 RTL 支持

若使用 Tailwind，有三类策略：

1) 使用逻辑属性类（Tailwind v3.4+ 已逐步补齐，但并非全部）。
2) 使用选择器配合 [dir="rtl"]：

```css path=null start=null
/* globals.css */
[dir="rtl"] .text-start { text-align: right; }
[dir="rtl"] .pl-s { padding-left: 0; padding-right: 1rem; }
```

3) 使用官方/社区插件：
- tailwindcss-rtl 插件（或类似）可自动生成 rtl:、ltr: 前缀工具类：

```js path=null start=null
// tailwind.config.js 片段
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  plugins: [require("tailwindcss-rtl")()],
};
```

使用方式：

```tsx path=null start=null
<div className="px-4 rtl:pl-0 rtl:pr-4 ltr:pl-4 ltr:pr-0 text-start">...</div>
```

建议：尽量采用 text-start、me-4/ms-4（margin-inline-end/start）等逻辑类，降低维护成本。

---

## 5. CSS-in-JS 与 UI 库

- styled-components / Emotion：可配合 stylis-plugin-rtl 自动翻转 left/right 等属性。

```ts path=null start=null
// with styled-components + stylis-plugin-rtl
import styled, { ThemeProvider } from "styled-components";
import rtlPlugin from "stylis-plugin-rtl";
import { StyleSheetManager } from "styled-components";

export function RTLProvider({ children, isRTL }: { children: React.ReactNode; isRTL: boolean }) {
  return (
    <StyleSheetManager stylisPlugins={isRTL ? [rtlPlugin] : []}>
      {children}
    </StyleSheetManager>
  );
}
```

- Chakra UI：在主题中设置 direction: "rtl"，并在语言切换时切换主题方向。
- MUI：可以使用 createCache + stylis-plugin-rtl 配合 CacheProvider 实现。

无论采用哪种方案，务必保证：SSR 阶段与客户端一致的方向设置，避免样式抖动。

---

## 6. 图标、箭头与组件交互方向

- 箭头、Chevron、播放/上一步下一步按钮：在 RTL 下通常需要镜像。
- 可选做法：
  - 用 CSS transform: scaleX(-1) 针对 [dir="rtl"] 选择器翻转；
  - 使用方向感知的图标组件，根据 dir 切换 icon；
  - 使用逻辑 API：如上一页使用 inline-start 方向，下一页使用 inline-end。

```css path=null start=null
/* 仅在 RTL 翻转 chevron 图标 */
[dir="rtl"] .icon-chevron { transform: scaleX(-1); }
```

轮播/走马灯：
- 初始 active 索引与滑动方向要按 dir 切换。
- 滑动手势提示与动画曲线也应镜像。

---

## 7. 字体与排版

- 选择合适的阿拉伯语字体（如 "Noto Naskh Arabic"、"Amiri" 等），并设置备用字体。
- 注意数字形态：阿拉伯-印度数字（٠١٢٣٤٥٦٧٨٩）与拉丁数字的选择，可通过字体或 Intl.NumberFormat 控制。

```css path=null start=null
:root { --font-arabic: "Noto Naskh Arabic", "Amiri", system-ui, sans-serif; }
[dir="rtl"] body { font-family: var(--font-arabic); }
```

---

## 8. 国际化日期、数字与货币

使用 Intl API 按 locale 输出，避免手写格式：

```ts path=null start=null
const ar = new Intl.NumberFormat("ar", { style: "currency", currency: "USD" });
console.log(ar.format(1234.56)); // يُطبَّق اتجاه与数字风格

const fmtDate = new Intl.DateTimeFormat("ar", { dateStyle: "long" });
console.log(fmtDate.format(new Date()));
```

你的语言配置示例：

```ts path=null start=null
export const languages = {
  zh: { currency: "CNY", label: "简体中文", direction: "ltr" },
  en: { currency: "USD", label: "English", direction: "ltr" },
  ar: {
    currency: "USD",
    label: "العربية",
    direction: "rtl", // 阿拉伯语从右到左
  },
} as const;
```

---

## 9. 双向内容嵌套：bdi/bdo 与 unicode-bidi

在 RTL 文档中插入 LTR 片段（如英文代码、URL），或在 LTR 文档插入阿文片段，建议使用 bdi/bdo 控制嵌入片段的方向隔离：

```html path=null start=null
<p>查看 <bdi>https://example.com/a/b?x=1</bdi> 以获取更多信息。</p>
<p><bdo dir="ltr">AR-in-LTR 示例段</bdo></p>
```

CSS 也可用 unicode-bidi/isolate：

```css path=null start=null
.isolate { unicode-bidi: isolate; direction: ltr; }
```

---

## 10. 滚动、定位与溢出

- 使用 inset-inline-start/end 代替 left/right 定位。
- scroll-snap-type 与 scroll-margin/padding 建议使用 block/inline 逻辑轴。
- 某些浏览器下滚动条位置在 RTL 中表现不同，注意测试。

```css path=null start=null
.toast {
  position: fixed;
  inset-block-start: 16px;  /* 顶部 */
  inset-inline-end: 16px;   /* LTR 右上角，RTL 左上角自动适配 */
}
```

---

## 11. 语言切换中间件（可选）

使用中间件在首屏就根据 cookie/Accept-Language 决定 locale，并返回正确 dir：

```ts path=null start=null
// middleware.ts (App Router)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const locales = ["zh", "en", "ar"] as const;
  const cookieLocale = req.cookies.get("LOCALE")?.value as typeof locales[number] | undefined;
  const url = req.nextUrl.clone();

  if (!locales.some(l => pathname.startsWith("/" + l))) {
    const negotiated = cookieLocale || "en";
    url.pathname = `/${negotiated}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
```

搭配服务端在 RootLayout 中设置 dir，达到首屏即正确方向。

---

## 12. 可访问性与焦点顺序

- dir 会改变键盘焦点的视觉顺序与空间认知。确保 Tab 顺序符合 DOM 逻辑，避免因 row-reverse 打破顺序。
- 面包屑、分页、上一页/下一页按钮在 RTL 下语义与方向一致。
- ARIA 文案与阅读顺序应匹配当前语言。

---

## 13. 测试与质量保障

- 视觉回归：使用 Playwright 截图分别在 LTR/RTL 下对比主页和关键页面。

```ts path=null start=null
// tests/rtl.spec.ts
import { test, expect } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  test(`Home ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page).toHaveScreenshot(`home-${locale}.png`);
  });
}
```

- 样式约束：使用 stylelint 的 plugin/stylelint-use-logical-spec 之类规则，禁止使用 left/right。
- 交互测试：轮播方向、抽屉侧边弹出（inline-start/inline-end）在 RTL 下正常。

---

## 14. 常见坑位与避坑建议

- 仅在局部容器使用 row-reverse，尽量让全站基于逻辑属性适配，避免“你改我也改”的连锁冲突。
- 避免在组件里到处读取 window 或 document 来判断方向。首选从上层 Context 或 props 传入 isRTL，或读取 documentElement.dir（在 useEffect 中）。
- 图片资源包含方向元素（箭头、播放方向）时，准备 RTL 版或用 CSS 镜像。
- 富文本/Markdown 内容中包含双向片段，建议启用 bdi/isolate 默认样式。

---

## 15. 参考落地清单（Checklist）

- [x] 在 SSR 阶段为 <html> 设置 lang 与 dir
- [x] 语言切换后在客户端更新 documentElement 的 lang 与 dir
- [x] CSS 使用逻辑属性、start/end 对齐
- [x] 关键组件（导航、面包屑、分页、轮播、抽屉）支持 RTL
- [x] 图标与箭头在 RTL 下镜像或切换
- [x] 字体与数字格式适配阿拉伯语
- [x] 使用 Intl 进行日期、数字、货币格式化
- [x] Playwright 等进行 LTR/RTL 双态快照测试
- [x] 引入样式规则限制使用 left/right

---

## 16. 示例：语言选择菜单切换到阿拉伯语即启用 RTL

下面示例展示在首页顶部语言选择菜单切换到阿拉伯语时，页面切换为 RTL：

```tsx path=null start=null
// app/[locale]/page.tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home({ params }: { params: { locale: "zh" | "en" | "ar" } }) {
  return (
    <main className="container mx-auto p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Next.js Blog</h1>
        <LanguageSwitcher currentLocale={params.locale} />
      </header>
      <section className="mt-6">
        {/* 内容区域采用 text-start、me-4 等逻辑工具类，自动随方向切换 */}
        <p className="text-start">欢迎访问！</p>
      </section>
    </main>
  );
}
```

配合上文 RootLayout 与 LanguageSwitcher，即可在切换到 ar 时，<html dir="rtl" lang="ar">，实现从右到左显示。

---

结论：
- 将方向（dir）与语言（lang）作为“第一等公民”在 SSR 与 CSR 中统一管理；
- 在 CSS 与组件层全面采用逻辑方向属性；
- 为图标、交互、排版做 RTL 针对性调整；
- 通过测试与静态检查保证质量。

按本文档落地，即可让你的 Next.js 博客在切换到阿拉伯语时自然切换到 RTL，同时对其它 LTR 语言保持稳定体验。
