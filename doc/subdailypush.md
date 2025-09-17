# SubDailyPush - AI领域促销信息聚合平台开发方案

## 项目概述

SubDailyPush 是一个专注于AI领域促销信息的多语言聚合平台，为全球用户提供最新的AI工具优惠码、折扣信息和免费试用机会。平台支持分级会员体系，通过订阅模式实现商业变现。

### 核心功能
- 🌍 **多语言支持**: 英语、西班牙语、法语、德语、中文、日语
- 💎 **分级会员体系**: 游客、普通用户、订阅用户
- 📊 **管理后台**: 自动/手动发布促销内容
- 🔔 **推送通知**: 第一时间推送给订阅用户
- 🎨 **富媒体内容**: 支持图片、排版文字、链接

### 技术栈
- **框架**: Next.js 15.3 + TypeScript
- **数据库**: PostgreSQL (Prisma ORM)
- **认证**: Better Auth
- **支付**: Stripe/支付宝/微信支付
- **UI组件**: Radix UI + Tailwind CSS
- **国际化**: next-intl
- **AI服务**: OpenAI/Claude API (自动翻译)

## 数据库设计

### 1. 促销信息模型

```prisma
// packages/database/prisma/schema.prisma

// AI工具/产品模型
model AiProduct {
  id            String          @id @default(cuid())
  slug          String          @unique
  name          String
  description   String?         @db.Text
  logo          String?
  website       String
  category      AiCategory      @relation(fields: [categoryId], references: [id])
  categoryId    String
  
  // SEO和元数据
  tags          String[]
  featured      Boolean         @default(false)
  verified      Boolean         @default(false) // 官方验证
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  // 关联
  promotions    Promotion[]
  
  @@index([slug])
  @@index([categoryId])
  @@index([featured])
  @@map("ai_product")
}

// AI产品分类
model AiCategory {
  id            String          @id @default(cuid())
  slug          String          @unique
  nameKey       String          // i18n key for translation
  icon          String?
  order         Int             @default(0)
  
  products      AiProduct[]
  
  @@map("ai_category")
}

// 促销信息模型
model Promotion {
  id            String          @id @default(cuid())
  
  // 基本信息
  title         Json            // 多语言标题 {"en": "...", "zh": "..."}
  description   Json            // 多语言描述
  content       Json            // 多语言富文本内容
  
  // 促销详情
  type          PromotionType   // DISCOUNT, COUPON, FREE_TRIAL, LIFETIME_DEAL
  discountValue String?         // 折扣值 (如 "50%", "$20 off")
  couponCode    String?         // 优惠码
  originalPrice Decimal?        @db.Decimal(10, 2)
  salePrice     Decimal?        @db.Decimal(10, 2)
  currency      String          @default("USD")
  
  // 时间管理
  startDate     DateTime
  endDate       DateTime?       // null表示长期有效
  
  // 访问控制
  accessLevel   AccessLevel     @default(PUBLIC)
  minTier       UserTier        @default(FREE) // 最低会员等级要求
  
  // 媒体资源
  coverImage    String?
  images        String[]
  
  // 链接
  promotionUrl  String
  termsUrl      String?
  
  // 关联
  product       AiProduct       @relation(fields: [productId], references: [id])
  productId     String
  
  // 发布者信息
  publishedBy   User?           @relation(fields: [publisherId], references: [id])
  publisherId   String?
  source        String?         // 信息来源
  
  // 状态和统计
  status        PromotionStatus @default(DRAFT)
  viewCount     Int             @default(0)
  clickCount    Int             @default(0)
  savedCount    Int             @default(0)
  
  // 审核信息
  verified      Boolean         @default(false)
  verifiedAt    DateTime?
  verifiedBy    String?
  
  // 优先级和排序
  priority      Int             @default(0) // 越高越靠前
  featured      Boolean         @default(false)
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  publishedAt   DateTime?
  
  // 关联
  savedByUsers  SavedPromotion[]
  notifications PromotionNotification[]
  
  @@index([status, publishedAt])
  @@index([productId])
  @@index([type])
  @@index([startDate, endDate])
  @@index([accessLevel])
  @@index([featured, priority])
  @@map("promotion")
}

// 促销类型枚举
enum PromotionType {
  DISCOUNT      // 折扣
  COUPON        // 优惠码
  FREE_TRIAL    // 免费试用
  LIFETIME_DEAL // 终身优惠
  BUNDLE        // 捆绑销售
  LIMITED_TIME  // 限时优惠
}

// 促销状态枚举
enum PromotionStatus {
  DRAFT         // 草稿
  PENDING       // 待审核
  PUBLISHED     // 已发布
  EXPIRED       // 已过期
  ARCHIVED      // 已归档
}

// 访问级别枚举
enum AccessLevel {
  PUBLIC        // 公开（游客可见）
  REGISTERED    // 注册用户可见
  PREMIUM       // 付费订阅用户可见
  VIP           // VIP用户专享
}

// 用户等级枚举
enum UserTier {
  FREE          // 免费用户
  BASIC         // 基础会员
  PREMIUM       // 高级会员
  VIP           // VIP会员
  LIFETIME      // 终身会员
}

// 用户保存的促销
model SavedPromotion {
  id            String          @id @default(cuid())
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  promotion     Promotion       @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  promotionId   String
  
  savedAt       DateTime        @default(now())
  
  @@unique([userId, promotionId])
  @@index([userId])
  @@index([promotionId])
  @@map("saved_promotion")
}

// 促销通知记录
model PromotionNotification {
  id            String          @id @default(cuid())
  promotion     Promotion       @relation(fields: [promotionId], references: [id])
  promotionId   String
  
  // 通知渠道
  channel       NotificationChannel
  
  // 接收者
  recipientType RecipientType   // ALL, TIER_BASED, SPECIFIC
  tierFilter    UserTier[]      // 如果是基于等级
  
  // 发送状态
  status        NotificationStatus
  sentAt        DateTime?
  sentCount     Int             @default(0)
  
  createdAt     DateTime        @default(now())
  
  @@index([promotionId])
  @@index([status])
  @@map("promotion_notification")
}

enum NotificationChannel {
  EMAIL
  PUSH
  SMS
  IN_APP
}

enum RecipientType {
  ALL           // 所有订阅用户
  TIER_BASED    // 基于会员等级
  SPECIFIC      // 特定用户
}

enum NotificationStatus {
  PENDING
  SENDING
  SENT
  FAILED
}

// 扩展User模型
model User {
  // ... 现有字段 ...
  
  // 新增字段
  tier              UserTier              @default(FREE)
  preferredLanguage String                @default("en")
  notificationPrefs Json?                 // 通知偏好设置
  
  // 关联
  savedPromotions   SavedPromotion[]
  publishedPromotions Promotion[]
}
```

### 2. 订阅计划配置

```prisma
// 订阅计划（复用现有模型，添加特定配置）
model SubscriptionPlan {
  // ... 现有字段 ...
  
  // 新增功能配置
  features      Json  // {
                      //   "maxSavedPromotions": 100,
                      //   "earlyAccess": true,
                      //   "exclusiveDeals": true,
                      //   "apiAccess": false,
                      //   "customAlerts": true
                      // }
  
  // 对应的用户等级
  userTier      UserTier
}
```

## API 设计

### 1. 促销信息API

```typescript
// apps/web/app/api/promotions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/database";
import { getUserPermissions } from "@repo/auth/lib/permissions";

// GET /api/promotions - 获取促销列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale") || "en";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const sort = searchParams.get("sort") || "latest";
  
  const permissions = await getUserPermissions(request);
  
  // 构建查询条件
  const where = {
    status: "PUBLISHED",
    OR: [
      { endDate: null },
      { endDate: { gte: new Date() } }
    ],
    ...(category && { product: { categoryId: category } }),
    ...(type && { type }),
  };
  
  // 根据用户权限过滤
  if (!permissions.isAuthenticated) {
    where.accessLevel = "PUBLIC";
  } else if (!permissions.hasActiveSubscription) {
    where.accessLevel = { in: ["PUBLIC", "REGISTERED"] };
  }
  // 订阅用户可以看到所有内容
  
  // 排序逻辑
  const orderBy = sort === "discount" 
    ? { discountValue: "desc" }
    : sort === "popular"
    ? { clickCount: "desc" }
    : { publishedAt: "desc" };
  
  const [promotions, total] = await Promise.all([
    db.promotion.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    }),
    db.promotion.count({ where })
  ]);
  
  // 格式化多语言内容
  const formattedPromotions = promotions.map(promo => ({
    ...promo,
    title: promo.title[locale] || promo.title["en"],
    description: promo.description[locale] || promo.description["en"],
    content: permissions.canAccessContent(promo.accessLevel) 
      ? promo.content[locale] || promo.content["en"]
      : null
  }));
  
  return NextResponse.json({
    promotions: formattedPromotions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

// POST /api/promotions - 创建促销（管理员）
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const data = await request.json();
  
  // 创建促销信息
  const promotion = await db.promotion.create({
    data: {
      ...data,
      publisherId: session.user.id,
      status: "PENDING" // 需要审核
    }
  });
  
  // 如果设置了立即发布且用户有权限
  if (data.publishNow && session.user.role === "ADMIN") {
    await db.promotion.update({
      where: { id: promotion.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        verified: true,
        verifiedBy: session.user.id,
        verifiedAt: new Date()
      }
    });
    
    // 触发通知
    await createPromotionNotification(promotion.id);
  }
  
  return NextResponse.json(promotion);
}
```

### 2. 保存/收藏API

```typescript
// apps/web/app/api/promotions/[id]/save/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Please login to save promotions" },
      { status: 401 }
    );
  }
  
  // 检查保存数量限制
  const savedCount = await db.savedPromotion.count({
    where: { userId: session.user.id }
  });
  
  const maxSaved = getMaxSavedPromotions(session.user.tier);
  if (savedCount >= maxSaved) {
    return NextResponse.json(
      { error: `You can only save up to ${maxSaved} promotions` },
      { status: 400 }
    );
  }
  
  const saved = await db.savedPromotion.create({
    data: {
      userId: session.user.id,
      promotionId: params.id
    }
  });
  
  // 更新统计
  await db.promotion.update({
    where: { id: params.id },
    data: { savedCount: { increment: 1 } }
  });
  
  return NextResponse.json(saved);
}
```

### 3. 通知系统API

```typescript
// apps/web/app/api/notifications/subscribe/route.ts
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { categories, types, channels } = await request.json();
  
  // 更新用户通知偏好
  await db.user.update({
    where: { id: session.user.id },
    data: {
      notificationPrefs: {
        categories,
        types,
        channels,
        enabled: true
      }
    }
  });
  
  return NextResponse.json({ success: true });
}
```

## 前端实现

### 1. 首页组件

```tsx
// apps/web/app/(marketing)/[locale]/page.tsx
import { PromotionGrid } from "@/components/promotions/PromotionGrid";
import { CategoryFilter } from "@/components/promotions/CategoryFilter";
import { HeroSection } from "@/components/marketing/HeroSection";

export default async function HomePage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const t = await getTranslations();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        ctaText={t("hero.cta")}
      />
      
      {/* 分类筛选 */}
      <CategoryFilter />
      
      {/* 促销信息网格 */}
      <PromotionGrid 
        locale={params.locale}
        accessLevel="PUBLIC"
      />
      
      {/* 订阅引导 */}
      <SubscriptionCTA />
    </div>
  );
}
```

### 2. 促销卡片组件

```tsx
// apps/web/components/promotions/PromotionCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Tag, 
  ExternalLink, 
  Bookmark,
  Share2,
  Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface PromotionCardProps {
  promotion: any;
  isAuthenticated: boolean;
  canAccess: boolean;
  locale: string;
}

export function PromotionCard({
  promotion,
  isAuthenticated,
  canAccess,
  locale
}: PromotionCardProps) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  
  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    try {
      const res = await fetch(`/api/promotions/${promotion.id}/save`, {
        method: saved ? "DELETE" : "POST"
      });
      
      if (res.ok) {
        setSaved(!saved);
      }
    } catch (error) {
      console.error("Failed to save promotion:", error);
    }
  };
  
  const handleClick = async () => {
    // 记录点击
    await fetch(`/api/promotions/${promotion.id}/click`, {
      method: "POST"
    });
    
    if (canAccess) {
      window.open(promotion.promotionUrl, "_blank");
    } else {
      router.push(`/subscription/plans`);
    }
  };
  
  const getDiscountBadge = () => {
    switch (promotion.type) {
      case "DISCOUNT":
        return (
          <Badge variant="destructive">
            {promotion.discountValue}
          </Badge>
        );
      case "FREE_TRIAL":
        return (
          <Badge variant="secondary">
            Free Trial
          </Badge>
        );
      case "LIFETIME_DEAL":
        return (
          <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
            Lifetime Deal
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {promotion.product.logo && (
              <img 
                src={promotion.product.logo} 
                alt={promotion.product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {promotion.product.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {promotion.product.category.name}
              </p>
            </div>
          </div>
          {getDiscountBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 标题和描述 */}
        <div>
          <h4 className="font-medium mb-1">
            {promotion.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {promotion.description}
          </p>
        </div>
        
        {/* 优惠码 */}
        {promotion.couponCode && canAccess && (
          <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
            <Tag className="w-4 h-4" />
            <code className="font-mono text-sm">
              {promotion.couponCode}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigator.clipboard.writeText(promotion.couponCode)}
            >
              Copy
            </Button>
          </div>
        )}
        
        {/* 价格信息 */}
        {promotion.originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              ${promotion.salePrice}
            </span>
            <span className="text-sm line-through text-muted-foreground">
              ${promotion.originalPrice}
            </span>
          </div>
        )}
        
        {/* 时间限制 */}
        {promotion.endDate && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Ends {formatDistanceToNow(new Date(promotion.endDate))}
            </span>
          </div>
        )}
        
        {/* 访问限制提示 */}
        {!canAccess && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <Lock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600">
              {promotion.accessLevel === "PREMIUM" 
                ? "Premium members only"
                : "Login required"}
            </span>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            className="flex-1"
            onClick={handleClick}
            disabled={!canAccess}
          >
            {canAccess ? (
              <>
                Get Deal
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Upgrade to Access"
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleSave}
          >
            <Bookmark 
              className={`w-4 h-4 ${saved ? "fill-current" : ""}`} 
            />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {/* 分享逻辑 */}}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. 管理后台

```tsx
// apps/web/app/(admin)/admin/promotions/page.tsx
"use client";

import { useState } from "react";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { PromotionTable } from "@/components/admin/PromotionTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPromotionsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Promotion Management</h1>
      
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">All Promotions</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <PromotionTable />
        </TabsContent>
        
        <TabsContent value="create">
          <PromotionForm />
        </TabsContent>
        
        <TabsContent value="pending">
          <PendingReview />
        </TabsContent>
        
        <TabsContent value="analytics">
          <PromotionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 国际化配置

### 1. 翻译文件结构

```
apps/web/messages/
├── en.json
├── zh.json
├── es.json
├── fr.json
├── de.json
└── ja.json
```

### 2. 示例翻译文件

```json
// apps/web/messages/en.json
{
  "hero": {
    "title": "AI Tools Deals & Discounts",
    "subtitle": "Save money on the best AI tools with exclusive offers",
    "cta": "Start Saving"
  },
  "promotions": {
    "filter": {
      "all": "All Categories",
      "writing": "Writing Tools",
      "image": "Image Generation",
      "video": "Video Tools",
      "coding": "Coding Assistants",
      "productivity": "Productivity"
    },
    "type": {
      "discount": "Discount",
      "coupon": "Coupon Code",
      "free_trial": "Free Trial",
      "lifetime": "Lifetime Deal"
    },
    "sort": {
      "latest": "Latest",
      "popular": "Most Popular",
      "discount": "Biggest Discount",
      "ending": "Ending Soon"
    }
  },
  "subscription": {
    "free": {
      "title": "Free",
      "features": [
        "View public deals",
        "Save up to 10 promotions",
        "Daily newsletter"
      ]
    },
    "premium": {
      "title": "Premium",
      "price": "$9.99/month",
      "features": [
        "Access all exclusive deals",
        "Unlimited saved promotions",
        "Early access to new deals",
        "Custom deal alerts",
        "No ads"
      ]
    },
    "lifetime": {
      "title": "Lifetime",
      "price": "$299 once",
      "features": [
        "Everything in Premium",
        "API access",
        "Priority support",
        "Future features included"
      ]
    }
  }
}
```

```json
// apps/web/messages/zh.json
{
  "hero": {
    "title": "AI工具优惠折扣",
    "subtitle": "独家优惠，助您省钱使用最好的AI工具",
    "cta": "开始省钱"
  },
  "promotions": {
    "filter": {
      "all": "所有分类",
      "writing": "写作工具",
      "image": "图像生成",
      "video": "视频工具",
      "coding": "编程助手",
      "productivity": "生产力工具"
    },
    "type": {
      "discount": "折扣",
      "coupon": "优惠码",
      "free_trial": "免费试用",
      "lifetime": "终身优惠"
    },
    "sort": {
      "latest": "最新",
      "popular": "最受欢迎",
      "discount": "最大折扣",
      "ending": "即将结束"
    }
  },
  "subscription": {
    "free": {
      "title": "免费版",
      "features": [
        "查看公开优惠",
        "保存最多10个促销",
        "每日邮件推送"
      ]
    },
    "premium": {
      "title": "高级会员",
      "price": "¥69/月",
      "features": [
        "访问所有独家优惠",
        "无限保存促销信息",
        "抢先获得新优惠",
        "自定义优惠提醒",
        "无广告"
      ]
    },
    "lifetime": {
      "title": "终身会员",
      "price": "¥1999 一次性",
      "features": [
        "高级会员所有功能",
        "API访问权限",
        "优先支持",
        "未来功能免费使用"
      ]
    }
  }
}
```

## 自动化和集成

### 1. 自动抓取脚本

```typescript
// scripts/scrape-deals.ts
import { db } from "@repo/database";
import * as cheerio from "cheerio";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 数据源配置
const sources = [
  {
    name: "ProductHunt",
    url: "https://www.producthunt.com/topics/artificial-intelligence",
    selector: ".deal-card"
  },
  {
    name: "AppSumo",
    url: "https://appsumo.com/browse/",
    selector: ".product-card"
  }
  // 更多数据源...
];

async function scrapeDeals() {
  for (const source of sources) {
    try {
      const response = await fetch(source.url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const deals = [];
      $(source.selector).each((i, elem) => {
        // 提取信息
        const title = $(elem).find(".title").text();
        const description = $(elem).find(".description").text();
        const price = $(elem).find(".price").text();
        // ... 更多字段
        
        deals.push({
          title,
          description,
          price,
          source: source.name
        });
      });
      
      // 使用AI增强和翻译
      for (const deal of deals) {
        const enhanced = await enhanceDealWithAI(deal);
        await saveDeal(enhanced);
      }
    } catch (error) {
      console.error(`Failed to scrape ${source.name}:`, error);
    }
  }
}

async function enhanceDealWithAI(deal: any) {
  const prompt = `
    Analyze this deal and provide:
    1. A better formatted title
    2. Key features list
    3. Discount percentage
    4. Category classification
    5. Translations to: Chinese, Spanish, French, German, Japanese
    
    Deal info:
    ${JSON.stringify(deal)}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a deals analyst and translator." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

async function saveDeal(deal: any) {
  // 检查是否已存在
  const existing = await db.promotion.findFirst({
    where: {
      title: { contains: deal.title.en }
    }
  });
  
  if (!existing) {
    await db.promotion.create({
      data: {
        title: deal.title,
        description: deal.description,
        type: deal.type,
        discountValue: deal.discount,
        promotionUrl: deal.url,
        status: "PENDING", // 需要人工审核
        source: deal.source
      }
    });
  }
}

// 定时任务配置
if (require.main === module) {
  scrapeDeals()
    .then(() => console.log("Scraping completed"))
    .catch(console.error);
}
```

### 2. 通知推送服务

```typescript
// apps/web/lib/notifications.ts
import { db } from "@repo/database";
import { Resend } from "resend";
import { render } from "@react-email/render";
import webpush from "web-push";

const resend = new Resend(process.env.RESEND_API_KEY);

// Web Push配置
webpush.setVapidDetails(
  "mailto:support@subdailypush.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPromotionNotification(promotionId: string) {
  const promotion = await db.promotion.findUnique({
    where: { id: promotionId },
    include: {
      product: true
    }
  });
  
  if (!promotion) return;
  
  // 获取订阅用户
  const subscribers = await db.user.findMany({
    where: {
      tier: { in: getEligibleTiers(promotion.minTier) },
      notificationPrefs: {
        path: "$.enabled",
        equals: true
      }
    }
  });
  
  // 批量发送
  const batches = chunk(subscribers, 100);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(user => sendToUser(user, promotion))
    );
    
    // 避免超限
    await sleep(1000);
  }
  
  // 记录发送状态
  await db.promotionNotification.create({
    data: {
      promotionId,
      channel: "EMAIL",
      recipientType: "TIER_BASED",
      status: "SENT",
      sentAt: new Date(),
      sentCount: subscribers.length
    }
  });
}

async function sendToUser(user: any, promotion: any) {
  const prefs = user.notificationPrefs;
  const locale = user.preferredLanguage;
  
  // Email通知
  if (prefs?.channels?.includes("email")) {
    await resend.emails.send({
      from: "SubDailyPush <deals@subdailypush.com>",
      to: user.email,
      subject: getEmailSubject(promotion, locale),
      html: render(PromotionEmail({ promotion, user, locale }))
    });
  }
  
  // Push通知
  if (prefs?.channels?.includes("push") && user.pushSubscription) {
    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify({
        title: promotion.title[locale] || promotion.title.en,
        body: promotion.description[locale] || promotion.description.en,
        icon: promotion.product.logo,
        badge: "/icon-192.png",
        url: `/promotions/${promotion.id}`
      })
    );
  }
}
```

## 性能优化

### 1. 缓存策略

```typescript
// apps/web/lib/cache.ts
import { unstable_cache } from "next/cache";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

// 促销列表缓存
export const getCachedPromotions = unstable_cache(
  async (params: any) => {
    const key = `promotions:${JSON.stringify(params)}`;
    
    // 尝试从Redis获取
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 从数据库获取
    const data = await db.promotion.findMany(params);
    
    // 缓存到Redis
    await redis.setex(key, 300, JSON.stringify(data)); // 5分钟缓存
    
    return data;
  },
  ["promotions"],
  {
    revalidate: 60,
    tags: ["promotions"]
  }
);

// 清除缓存
export async function invalidatePromotionCache() {
  await redis.del("promotions:*");
  revalidateTag("promotions");
}
```

### 2. 图片优化

```typescript
// apps/web/lib/image-optimization.ts
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function optimizeAndUploadImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  // 生成多个尺寸
  const sizes = [
    { width: 1200, suffix: "xl" },
    { width: 800, suffix: "lg" },
    { width: 400, suffix: "md" },
    { width: 200, suffix: "sm" }
  ];
  
  const urls = [];
  
  for (const size of sizes) {
    const optimized = await sharp(buffer)
      .resize(size.width, null, {
        withoutEnlargement: true,
        fit: "inside"
      })
      .webp({ quality: 85 })
      .toBuffer();
    
    const key = `promotions/${filename}-${size.suffix}.webp`;
    
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: optimized,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000"
    }));
    
    urls.push(`${process.env.CDN_URL}/${key}`);
  }
  
  return urls[0]; // 返回最大尺寸URL
}
```

## 部署配置

### 1. 环境变量

```env
# .env.production
# 数据库
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# 认证
NEXTAUTH_URL="https://subdailypush.com"
NEXTAUTH_SECRET="..."

# 支付
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
ALIPAY_APP_ID="..."
WECHAT_PAY_APP_ID="..."

# AI服务
OPENAI_API_KEY="sk-..."
CLAUDE_API_KEY="..."

# 存储
S3_BUCKET="subdailypush-assets"
CDN_URL="https://cdn.subdailypush.com"

# 通知
RESEND_API_KEY="..."
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."

# 监控
SENTRY_DSN="..."
PLAUSIBLE_DOMAIN="subdailypush.com"
```

### 2. Docker配置

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 依赖安装
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# 运行时
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 3. Kubernetes部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: subdailypush
spec:
  replicas: 3
  selector:
    matchLabels:
      app: subdailypush
  template:
    metadata:
      labels:
        app: subdailypush
    spec:
      containers:
      - name: app
        image: subdailypush:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: subdailypush-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: subdailypush
spec:
  selector:
    app: subdailypush
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 监控和分析

### 1. 业务指标监控

```typescript
// apps/web/lib/analytics.ts
export async function trackPromotionMetrics() {
  const metrics = await db.$queryRaw`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_promotions,
      SUM(view_count) as total_views,
      SUM(click_count) as total_clicks,
      SUM(saved_count) as total_saves,
      AVG(click_count::float / NULLIF(view_count, 0)) as avg_ctr
    FROM promotion
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  
  // 发送到监控平台
  await sendToDatadog(metrics);
  
  return metrics;
}

// 用户行为追踪
export function trackUserAction(
  action: string,
  properties: Record<string, any>
) {
  // Plausible
  if (typeof window !== "undefined") {
    window.plausible?.(action, { props: properties });
  }
  
  // 自定义分析
  fetch("/api/analytics/track", {
    method: "POST",
    body: JSON.stringify({ action, properties })
  });
}
```

### 2. 错误监控

```typescript
// apps/web/lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: db })
  ]
});

// 自定义错误上报
export function reportError(
  error: Error,
  context?: Record<string, any>
) {
  console.error(error);
  Sentry.captureException(error, {
    extra: context
  });
}
```

## 实施计划

### 第一阶段：基础功能（第1-2周）
- [ ] 数据库设计和迁移
- [ ] 基础API开发
- [ ] 前端页面框架
- [ ] 多语言配置

### 第二阶段：核心功能（第3-4周）
- [ ] 促销信息CRUD
- [ ] 用户权限系统
- [ ] 订阅支付集成
- [ ] 管理后台

### 第三阶段：自动化（第5-6周）
- [ ] 自动抓取脚本
- [ ] AI翻译集成
- [ ] 通知推送系统
- [ ] 定时任务

### 第四阶段：优化上线（第7-8周）
- [ ] 性能优化
- [ ] SEO优化
- [ ] 监控部署
- [ ] 上线发布

## 成本预算

### 月度运营成本
- **服务器**: $100-300 (AWS/Vercel)
- **数据库**: $50-150 (PostgreSQL + Redis)
- **CDN**: $20-50
- **AI API**: $50-200 (OpenAI/Claude)
- **邮件服务**: $20-50
- **监控工具**: $50-100
- **总计**: $290-850/月

### 一次性成本
- **域名**: $20/年
- **SSL证书**: 免费 (Let's Encrypt)
- **设计资源**: $500-1000

## 技术支持资源

### 官方文档
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

### 社区资源
- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Slack](https://slack.prisma.io)
- Stack Overflow相关标签

## 总结

SubDailyPush平台通过以下特点实现差异化竞争：

1. **专注AI领域**：深度聚焦AI工具和服务的促销信息
2. **多语言支持**：覆盖全球主要语言市场
3. **分级会员体系**：通过订阅模式实现可持续盈利
4. **自动化运营**：AI驱动的内容抓取和翻译
5. **优质用户体验**：精心设计的UI/UX和推送系统

基于现有的supastarter框架，可以快速实现MVP并迭代优化，预计8周内可以完成开发并上线。
