# 博客订阅权限系统实施指南

## 目录
1. [系统架构概览](#系统架构概览)
2. [数据库设计](#数据库设计)
3. [权限管理实现](#权限管理实现)
4. [后端API实现](#后端api实现)
5. [前端实现](#前端实现)
6. [支付集成](#支付集成)
7. [最佳实践建议](#最佳实践建议)

## 系统架构概览

### 三种访问权限级别
1. **公开内容（Guest）**：游客可查看全文
2. **注册内容（Registered）**：需要注册登录才能查看全文
3. **付费内容（Premium）**：需要有效订阅才能查看全文
   - 月度订阅
   - 年度订阅
   - 终身会员

### 技术栈
- **认证系统**：Better Auth (已集成)
- **数据库**：PostgreSQL + Prisma ORM
- **支付系统**：Stripe/支付宝/微信支付
- **前端框架**：Next.js + TypeScript
- **内容管理**：Content Collections

## 数据库设计

### 1. 更新Prisma Schema

在 `packages/database/prisma/schema.prisma` 中添加以下模型：

```prisma
// 博客文章模型
model BlogPost {
  id            String          @id @default(cuid())
  slug          String          @unique
  title         String
  excerpt       String?
  content       String          @db.Text
  image         String?
  authorId      String
  author        User            @relation(fields: [authorId], references: [id])
  
  // 权限控制字段
  accessLevel   AccessLevel     @default(PUBLIC)
  
  // 付费内容预览
  previewContent String?         @db.Text // 付费内容的预览部分
  
  // 元数据
  tags          String[]
  published     Boolean         @default(false)
  publishedAt   DateTime?
  viewCount     Int             @default(0)
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  // 关联
  categories    BlogCategory[]
  
  @@index([slug])
  @@index([authorId])
  @@index([accessLevel])
  @@index([published, publishedAt])
  @@map("blog_post")
}

// 访问级别枚举
enum AccessLevel {
  PUBLIC      // 公开
  REGISTERED  // 注册用户
  PREMIUM     // 付费订阅
}

// 订阅计划模型
model SubscriptionPlan {
  id            String          @id @default(cuid())
  name          String          // 计划名称：月度、年度、终身
  slug          String          @unique
  description   String?
  
  // 价格信息
  price         Decimal         @db.Decimal(10, 2)
  currency      String          @default("CNY")
  
  // 计划类型
  interval      PlanInterval    // MONTH, YEAR, LIFETIME
  intervalCount Int             @default(1)
  
  // 功能权限
  features      Json            // 存储计划包含的功能列表
  
  active        Boolean         @default(true)
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  // 关联
  subscriptions UserSubscription[]
  
  @@map("subscription_plan")
}

enum PlanInterval {
  MONTH
  YEAR
  LIFETIME
}

// 用户订阅模型
model UserSubscription {
  id               String           @id @default(cuid())
  userId           String
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  planId           String
  plan             SubscriptionPlan @relation(fields: [planId], references: [id])
  
  // 订阅状态
  status           SubscriptionStatus
  
  // 时间管理
  startDate        DateTime         @default(now())
  endDate          DateTime?        // null表示终身
  cancelledAt      DateTime?
  
  // 支付信息
  paymentId        String?          // 外部支付系统ID
  paymentMethod    String?          // 支付方式
  amount           Decimal          @db.Decimal(10, 2)
  
  // 自动续费
  autoRenew        Boolean          @default(true)
  nextBillingDate  DateTime?
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  @@unique([userId, planId, status])
  @@index([userId])
  @@index([status])
  @@index([endDate])
  @@map("user_subscription")
}

enum SubscriptionStatus {
  ACTIVE      // 活跃
  EXPIRED     // 已过期
  CANCELLED   // 已取消
  PENDING     // 待支付
  TRIAL       // 试用期
}

// 博客分类
model BlogCategory {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String?
  posts       BlogPost[]
  
  @@map("blog_category")
}

// 扩展User模型
model User {
  // ... 现有字段 ...
  
  // 添加订阅相关
  subscriptions    UserSubscription[]
  blogPosts        BlogPost[]
  
  // 添加用户等级
  membershipLevel  MembershipLevel    @default(FREE)
}

enum MembershipLevel {
  FREE
  BASIC
  PREMIUM
  LIFETIME
}
```

### 2. 数据库迁移

```bash
# 在项目根目录执行
cd packages/database
npx prisma migrate dev --name add-blog-subscription-system
npx prisma generate
```

## 权限管理实现

### 1. 创建权限检查中间件

创建文件 `packages/auth/lib/permissions.ts`：

```typescript
import { db } from "@repo/database";
import { auth } from "../auth";
import type { AccessLevel, SubscriptionStatus } from "@prisma/client";

export interface PermissionContext {
  userId?: string;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  subscriptionLevel?: "monthly" | "yearly" | "lifetime";
  canAccessContent: (accessLevel: AccessLevel) => boolean;
}

/**
 * 获取用户权限上下文
 */
export async function getUserPermissions(
  request?: Request
): Promise<PermissionContext> {
  const session = await auth.api.getSession({ headers: request?.headers });
  
  if (!session?.user) {
    return {
      isAuthenticated: false,
      hasActiveSubscription: false,
      canAccessContent: (level) => level === "PUBLIC",
    };
  }

  // 检查用户订阅状态
  const activeSubscription = await db.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      OR: [
        { endDate: null }, // 终身会员
        { endDate: { gte: new Date() } }, // 未过期
      ],
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const hasActiveSubscription = !!activeSubscription;
  const subscriptionLevel = activeSubscription?.plan.interval.toLowerCase() as
    | "monthly"
    | "yearly"
    | "lifetime"
    | undefined;

  return {
    userId: session.user.id,
    isAuthenticated: true,
    hasActiveSubscription,
    subscriptionLevel,
    canAccessContent: (level: AccessLevel) => {
      switch (level) {
        case "PUBLIC":
          return true;
        case "REGISTERED":
          return true; // 已登录用户可访问
        case "PREMIUM":
          return hasActiveSubscription;
        default:
          return false;
      }
    },
  };
}

/**
 * 检查用户是否可以访问特定博客文章
 */
export async function canAccessBlogPost(
  postId: string,
  userId?: string
): Promise<{
  canAccess: boolean;
  needsAuth: boolean;
  needsSubscription: boolean;
  previewContent?: string;
}> {
  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: {
      accessLevel: true,
      previewContent: true,
    },
  });

  if (!post) {
    return {
      canAccess: false,
      needsAuth: false,
      needsSubscription: false,
    };
  }

  const permissions = await getUserPermissions();

  const canAccess = permissions.canAccessContent(post.accessLevel);
  const needsAuth = !permissions.isAuthenticated && post.accessLevel !== "PUBLIC";
  const needsSubscription =
    permissions.isAuthenticated &&
    !permissions.hasActiveSubscription &&
    post.accessLevel === "PREMIUM";

  return {
    canAccess,
    needsAuth,
    needsSubscription,
    previewContent: !canAccess ? post.previewContent ?? undefined : undefined,
  };
}

/**
 * 订阅管理辅助函数
 */
export class SubscriptionManager {
  /**
   * 创建新订阅
   */
  static async createSubscription(
    userId: string,
    planId: string,
    paymentInfo: {
      paymentId: string;
      paymentMethod: string;
      amount: number;
    }
  ) {
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error("订阅计划不存在");
    }

    // 计算结束日期
    let endDate: Date | null = null;
    if (plan.interval !== "LIFETIME") {
      endDate = new Date();
      if (plan.interval === "MONTH") {
        endDate.setMonth(endDate.getMonth() + plan.intervalCount);
      } else if (plan.interval === "YEAR") {
        endDate.setFullYear(endDate.getFullYear() + plan.intervalCount);
      }
    }

    // 取消之前的订阅
    await db.userSubscription.updateMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    // 创建新订阅
    const subscription = await db.userSubscription.create({
      data: {
        userId,
        planId,
        status: "ACTIVE",
        endDate,
        ...paymentInfo,
        nextBillingDate: endDate,
      },
    });

    // 更新用户会员等级
    await db.user.update({
      where: { id: userId },
      data: {
        membershipLevel:
          plan.interval === "LIFETIME"
            ? "LIFETIME"
            : plan.interval === "YEAR"
            ? "PREMIUM"
            : "BASIC",
      },
    });

    return subscription;
  }

  /**
   * 检查并更新过期订阅
   */
  static async checkAndUpdateExpiredSubscriptions() {
    const expiredSubscriptions = await db.userSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          not: null,
          lte: new Date(),
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await db.userSubscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });

      // 更新用户会员等级
      await db.user.update({
        where: { id: subscription.userId },
        data: { membershipLevel: "FREE" },
      });
    }
  }

  /**
   * 获取用户订阅历史
   */
  static async getUserSubscriptionHistory(userId: string) {
    return db.userSubscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
```

## 后端API实现

### 1. 创建博客API路由

创建文件 `apps/web/app/api/blog/[slug]/route.ts`：

```typescript
import { getUserPermissions } from "@repo/auth/lib/permissions";
import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const permissions = await getUserPermissions(request);

    // 获取文章
    const post = await db.blogPost.findUnique({
      where: { slug, published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    // 权限检查
    const canAccess = permissions.canAccessContent(post.accessLevel);

    if (!canAccess) {
      // 返回预览内容
      return NextResponse.json({
        ...post,
        content: post.previewContent || post.excerpt || "需要订阅才能查看完整内容",
        isPreview: true,
        requiresAuth: !permissions.isAuthenticated,
        requiresSubscription: 
          permissions.isAuthenticated && !permissions.hasActiveSubscription,
      });
    }

    // 增加浏览量
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      ...post,
      isPreview: false,
    });
  } catch (error) {
    console.error("获取博客文章失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
```

### 2. 创建订阅API

创建文件 `apps/web/app/api/subscription/create/route.ts`：

```typescript
import { auth } from "@repo/auth";
import { SubscriptionManager } from "@repo/auth/lib/permissions";
import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const { planId, paymentMethod } = await request.json();

    // 验证计划
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId, active: true },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "无效的订阅计划" },
        { status: 400 }
      );
    }

    // TODO: 集成支付网关（Stripe/支付宝/微信支付）
    // 这里应该调用支付API创建支付会话
    const paymentId = `payment_${Date.now()}`; // 示例支付ID

    // 创建订阅
    const subscription = await SubscriptionManager.createSubscription(
      session.user.id,
      planId,
      {
        paymentId,
        paymentMethod,
        amount: Number(plan.price),
      }
    );

    return NextResponse.json({
      success: true,
      subscription,
      // 返回支付URL（如果使用外部支付）
      // paymentUrl: stripeSession.url
    });
  } catch (error) {
    console.error("创建订阅失败:", error);
    return NextResponse.json(
      { error: "创建订阅失败" },
      { status: 500 }
    );
  }
}
```

### 3. 订阅状态检查API

创建文件 `apps/web/app/api/subscription/status/route.ts`：

```typescript
import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        hasActiveSubscription: false,
      });
    }

    const activeSubscription = await db.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        plan: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription
        ? {
            planName: activeSubscription.plan.name,
            interval: activeSubscription.plan.interval,
            endDate: activeSubscription.endDate,
            autoRenew: activeSubscription.autoRenew,
          }
        : null,
    });
  } catch (error) {
    console.error("获取订阅状态失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
```

## 前端实现

### 1. 创建权限保护组件

创建文件 `apps/web/components/blog/ContentGate.tsx`：

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Crown } from "lucide-react";

interface ContentGateProps {
  accessLevel: "PUBLIC" | "REGISTERED" | "PREMIUM";
  children: React.ReactNode;
  previewContent?: React.ReactNode;
  postTitle?: string;
}

export function ContentGate({
  accessLevel,
  children,
  previewContent,
  postTitle,
}: ContentGateProps) {
  const router = useRouter();
  const [permission, setPermission] = useState<{
    canAccess: boolean;
    isAuthenticated: boolean;
    hasSubscription: boolean;
    loading: boolean;
  }>({
    canAccess: false,
    isAuthenticated: false,
    hasSubscription: false,
    loading: true,
  });

  useEffect(() => {
    checkPermission();
  }, [accessLevel]);

  const checkPermission = async () => {
    try {
      const res = await fetch("/api/subscription/status");
      const data = await res.json();

      let canAccess = false;
      switch (accessLevel) {
        case "PUBLIC":
          canAccess = true;
          break;
        case "REGISTERED":
          canAccess = data.authenticated;
          break;
        case "PREMIUM":
          canAccess = data.authenticated && data.hasActiveSubscription;
          break;
      }

      setPermission({
        canAccess,
        isAuthenticated: data.authenticated,
        hasSubscription: data.hasActiveSubscription,
        loading: false,
      });
    } catch (error) {
      console.error("权限检查失败:", error);
      setPermission((prev) => ({ ...prev, loading: false }));
    }
  };

  if (permission.loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (permission.canAccess) {
    return <>{children}</>;
  }

  // 显示权限提示
  return (
    <div className="space-y-6">
      {/* 预览内容 */}
      {previewContent && (
        <div className="relative">
          <div className="prose prose-lg max-w-none">{previewContent}</div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      )}

      {/* 权限卡片 */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {accessLevel === "REGISTERED" ? (
              <>
                <User className="h-5 w-5" />
                需要登录才能查看完整内容
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 text-yellow-500" />
                此内容为付费订阅专享
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!permission.isAuthenticated ? (
            <>
              <p className="text-muted-foreground">
                请登录以继续阅读 {postTitle ? `"${postTitle}"` : "这篇文章"}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/auth/login")}>
                  登录
                </Button>
                <Button variant="outline" onClick={() => router.push("/auth/signup")}>
                  注册账号
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                升级到高级会员，解锁所有付费内容
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <PlanCard
                    name="月度会员"
                    price="¥19.9"
                    interval="月"
                    features={["所有付费文章", "优先支持"]}
                    onSelect={() => handleSubscribe("monthly")}
                  />
                  <PlanCard
                    name="年度会员"
                    price="¥199"
                    interval="年"
                    features={["所有付费文章", "优先支持", "节省17%"]}
                    recommended
                    onSelect={() => handleSubscribe("yearly")}
                  />
                  <PlanCard
                    name="终身会员"
                    price="¥599"
                    interval="终身"
                    features={["所有付费文章", "优先支持", "永久有效"]}
                    onSelect={() => handleSubscribe("lifetime")}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  async function handleSubscribe(plan: string) {
    router.push(`/subscription/checkout?plan=${plan}`);
  }
}

// 计划卡片组件
function PlanCard({
  name,
  price,
  interval,
  features,
  recommended,
  onSelect,
}: {
  name: string;
  price: string;
  interval: string;
  features: string[];
  recommended?: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className={recommended ? "border-primary" : ""}>
      {recommended && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm">
          推荐
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <div className="text-2xl font-bold">
            {price}
            <span className="text-sm text-muted-foreground">/{interval}</span>
          </div>
        </div>
        <ul className="space-y-1 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <Button onClick={onSelect} className="w-full" variant={recommended ? "default" : "outline"}>
          选择{name}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2. 更新博客文章页面

更新 `apps/web/app/(marketing)/[locale]/blog/[...path]/page.tsx`：

```tsx
import { ContentGate } from "@/components/blog/ContentGate";
// ... 其他导入

export default async function BlogPostPage(props: { params: Promise<Params> }) {
  const { path, locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const slug = getActivePathFromUrlParam(path);
  
  // 从数据库获取文章
  const post = await db.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      author: true,
      categories: true,
    },
  });

  if (!post) {
    return localeRedirect({ href: "/blog", locale });
  }

  const { title, content, previewContent, accessLevel, author, publishedAt } = post;

  return (
    <div className="container max-w-6xl pt-32 pb-24">
      <div className="mx-auto max-w-2xl">
        {/* 文章头部信息 */}
        <div className="mb-12">
          <LocaleLink href="/blog">
            &larr; {t("blog.back")}
          </LocaleLink>
        </div>

        <h1 className="font-bold text-4xl">{title}</h1>

        <div className="mt-4 flex items-center justify-start gap-6">
          {author && (
            <div className="flex items-center">
              {author.image && (
                <div className="relative mr-2 size-8 overflow-hidden rounded-full">
                  <Image
                    src={author.image}
                    alt={author.name}
                    fill
                    sizes="96px"
                    className="object-cover object-center"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm opacity-50">
                  {author.name}
                </p>
              </div>
            </div>
          )}

          <div className="mr-0 ml-auto">
            <p className="text-sm opacity-30">
              {publishedAt && Intl.DateTimeFormat("zh-CN").format(
                new Date(publishedAt),
              )}
            </p>
          </div>
        </div>

        {/* 内容权限控制 */}
        <ContentGate
          accessLevel={accessLevel}
          previewContent={
            previewContent && (
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            )
          }
          postTitle={title}
        >
          <div className="pb-8 prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </ContentGate>
      </div>
    </div>
  );
}
```

### 3. 创建订阅管理页面

创建文件 `apps/web/app/(saas)/app/subscription/page.tsx`：

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/status");
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error("获取订阅信息失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("确定要取消订阅吗？")) return;

    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
      });
      
      if (res.ok) {
        alert("订阅已取消");
        fetchSubscription();
      }
    } catch (error) {
      console.error("取消订阅失败:", error);
      alert("取消订阅失败，请稍后重试");
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">订阅管理</h1>

      {subscription?.hasActiveSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              当前订阅
              <Badge variant="default">活跃</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">计划类型</p>
                <p className="font-semibold">{subscription.subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">订阅周期</p>
                <p className="font-semibold">
                  {subscription.subscription.interval === "LIFETIME"
                    ? "终身"
                    : subscription.subscription.interval === "YEAR"
                    ? "年度"
                    : "月度"}
                </p>
              </div>
              {subscription.subscription.endDate && (
                <div>
                  <p className="text-sm text-muted-foreground">到期时间</p>
                  <p className="font-semibold">
                    {formatDate(subscription.subscription.endDate)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">自动续费</p>
                <p className="font-semibold">
                  {subscription.subscription.autoRenew ? "已开启" : "已关闭"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {subscription.subscription.interval !== "LIFETIME" && (
                <>
                  <Button variant="outline" onClick={() => router.push("/subscription/upgrade")}>
                    升级计划
                  </Button>
                  <Button variant="destructive" onClick={handleCancelSubscription}>
                    取消订阅
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>您还没有活跃的订阅</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              订阅高级会员，解锁所有付费内容
            </p>
            <Button onClick={() => router.push("/subscription/plans")}>
              查看订阅计划
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 订阅历史 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>订阅历史</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: 显示订阅历史列表 */}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 支付集成

### 1. Stripe集成示例

创建文件 `packages/payments/stripe.ts`：

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

export async function createCheckoutSession(
  userId: string,
  planId: string,
  priceId: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ["card", "alipay", "wechat_pay"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/plans`,
    metadata: {
      userId,
      planId,
    },
  });

  return session;
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      await SubscriptionManager.createSubscription(
        session.metadata!.userId,
        session.metadata!.planId,
        {
          paymentId: session.id,
          paymentMethod: session.payment_method_types[0],
          amount: session.amount_total! / 100,
        }
      );
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      await db.userSubscription.updateMany({
        where: { paymentId: subscription.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      break;
  }
}
```

### 2. 支付宝/微信支付集成

```typescript
// packages/payments/alipay.ts
import AlipaySdk from 'alipay-sdk';

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
});

export async function createAlipayOrder(
  userId: string,
  planId: string,
  amount: number
) {
  const result = await alipaySdk.exec('alipay.trade.page.pay', {
    bizContent: {
      out_trade_no: `SUB_${Date.now()}`,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: amount,
      subject: '博客订阅服务',
      passback_params: JSON.stringify({ userId, planId }),
    },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/alipay`,
  });

  return result;
}
```

## 最佳实践建议

### 1. 性能优化

```typescript
// 使用Redis缓存订阅状态
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function getCachedSubscriptionStatus(userId: string) {
  const cacheKey = `subscription:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const status = await db.userSubscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  
  await redis.setex(cacheKey, 300, JSON.stringify(status)); // 缓存5分钟
  return status;
}
```

### 2. 定时任务

创建文件 `apps/web/app/api/cron/subscriptions/route.ts`：

```typescript
import { SubscriptionManager } from "@repo/auth/lib/permissions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 验证是否为Cron Job请求（例如来自Vercel Cron）
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 检查并更新过期订阅
    await SubscriptionManager.checkAndUpdateExpiredSubscriptions();
    
    // 发送续费提醒
    await sendRenewalReminders();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function sendRenewalReminders() {
  // 查找即将过期的订阅（7天内）
  const expiringSubscriptions = await db.userSubscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      autoRenew: false,
    },
    include: {
      user: true,
      plan: true,
    },
  });

  for (const subscription of expiringSubscriptions) {
    // 发送邮件提醒
    await sendEmail({
      to: subscription.user.email,
      subject: "您的订阅即将到期",
      template: "subscription-expiring",
      data: {
        userName: subscription.user.name,
        planName: subscription.plan.name,
        expiryDate: subscription.endDate,
      },
    });
  }
}
```

### 3. 监控和分析

```typescript
// 订阅分析数据
export async function getSubscriptionAnalytics() {
  const [
    totalSubscribers,
    monthlySubscribers,
    yearlySubscribers,
    lifetimeSubscribers,
    churnRate,
    mrr, // Monthly Recurring Revenue
  ] = await Promise.all([
    db.userSubscription.count({ where: { status: "ACTIVE" } }),
    db.userSubscription.count({
      where: { status: "ACTIVE", plan: { interval: "MONTH" } },
    }),
    db.userSubscription.count({
      where: { status: "ACTIVE", plan: { interval: "YEAR" } },
    }),
    db.userSubscription.count({
      where: { status: "ACTIVE", plan: { interval: "LIFETIME" } },
    }),
    calculateChurnRate(),
    calculateMRR(),
  ]);

  return {
    totalSubscribers,
    breakdown: {
      monthly: monthlySubscribers,
      yearly: yearlySubscribers,
      lifetime: lifetimeSubscribers,
    },
    churnRate,
    mrr,
  };
}
```

### 4. 安全考虑

1. **API限流**：防止恶意请求
```typescript
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1分钟
  uniqueTokenPerInterval: 500,
});

export async function middleware(request: Request) {
  try {
    await limiter.check(request, 10, 'CACHE_TOKEN');
  } catch {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

2. **支付验证**：始终在服务端验证支付状态
3. **数据加密**：敏感信息使用加密存储
4. **审计日志**：记录所有订阅相关操作

### 5. 用户体验优化

1. **试用期**：提供7-14天免费试用
2. **内容分级**：渐进式付费墙
3. **优惠码系统**：促销和推广
4. **推荐奖励**：用户推荐机制
5. **订阅升级/降级**：灵活的计划切换

## 测试建议

### 单元测试示例

```typescript
// __tests__/permissions.test.ts
import { getUserPermissions, canAccessBlogPost } from "@repo/auth/lib/permissions";

describe("Permission System", () => {
  test("游客只能访问公开内容", async () => {
    const permissions = await getUserPermissions();
    expect(permissions.canAccessContent("PUBLIC")).toBe(true);
    expect(permissions.canAccessContent("REGISTERED")).toBe(false);
    expect(permissions.canAccessContent("PREMIUM")).toBe(false);
  });

  test("注册用户可以访问注册内容", async () => {
    // Mock authenticated user
    const permissions = await getUserPermissions(mockAuthRequest);
    expect(permissions.canAccessContent("PUBLIC")).toBe(true);
    expect(permissions.canAccessContent("REGISTERED")).toBe(true);
    expect(permissions.canAccessContent("PREMIUM")).toBe(false);
  });

  test("订阅用户可以访问所有内容", async () => {
    // Mock subscribed user
    const permissions = await getUserPermissions(mockSubscribedRequest);
    expect(permissions.canAccessContent("PUBLIC")).toBe(true);
    expect(permissions.canAccessContent("REGISTERED")).toBe(true);
    expect(permissions.canAccessContent("PREMIUM")).toBe(true);
  });
});
```

## 部署清单

- [ ] 数据库迁移完成
- [ ] 环境变量配置
  - [ ] 支付密钥（Stripe/支付宝/微信）
  - [ ] Redis连接
  - [ ] 邮件服务配置
- [ ] Webhook端点配置
- [ ] 定时任务设置（Vercel Cron/其他）
- [ ] 监控告警配置
- [ ] 备份策略制定
- [ ] 性能测试完成
- [ ] 安全审计通过

## 总结

这个博客订阅权限系统实现了：

1. **三级权限控制**：公开、注册、付费
2. **灵活的订阅计划**：月度、年度、终身
3. **完整的支付集成**：支持多种支付方式
4. **优秀的用户体验**：预览内容、平滑升级
5. **可扩展的架构**：易于添加新功能

系统设计遵循了安全、性能、用户体验的最佳实践，可以根据实际需求进行调整和扩展。
