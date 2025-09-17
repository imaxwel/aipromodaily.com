# 订阅支付成功但页面仍显示付费墙——排查与修复（基于 supastarter 复用）

根据日志，Stripe 回调已正确到达并返回 2xx，说明支付链路正常。问题出在付费墙判断未复用现有的 purchases 逻辑，仍通过自建的 `/api/subscription/status` 判断，导致与实际的 `Purchase` 数据源不一致。

## 根因
- 后端 webhook 已把成功支付写入 `Purchase` 表（supastarter 标准流）。
- 前端付费墙组件 `apps/web/components/blog/ContentGate.tsx` 依赖自建 API `/api/subscription/status`，而不是复用 `usePurchases` / `createPurchasesHelper`。

## 修复原则
不更改 Supabase/数据库结构，不跑迁移脚本，完全复用 supastarter.dev 已有的“检查是否有订阅/购买”的通用逻辑。

## 实施的代码编辑

1) 重构付费墙组件以复用 purchases 逻辑
- 文件：`apps/web/components/blog/ContentGate.tsx`
- 变更：移除对 `/api/subscription/status` 的请求；改为使用 `@saas/auth/hooks/use-session` 获取登录态，`@saas/payments/hooks/purchases` 获取 `hasSubscription()`，以此判断访问权限。
- 关键片段：
```ts
import { usePurchases } from "@saas/payments/hooks/purchases";
import { useSession } from "@saas/auth/hooks/use-session";

const { user } = useSession();
const { hasSubscription } = usePurchases();

const isAuthenticated = !!user;
const isPremium = hasSubscription();
// PUBLIC -> true; REGISTERED -> isAuthenticated; PREMIUM -> isAuthenticated && isPremium
```

2) 未引入任何数据库/脚本变更
- 未修改 Supabase schema
- 未新增/执行迁移脚本
- 未改动 webhook 存储逻辑

## 验证步骤
1) 打开 `http://localhost:3000/en/blog/premium-post`
2) 确保已登录；完成支付回调后，`usePurchases` 会从 `/payments/purchases` 读取到 `Purchase` 记录，`hasSubscription()` 返回 true，付费墙自动消失。

可选：如需 SSR 场景也同步判断，可在 RSC 中使用：
```ts
import { getPurchases } from "@saas/payments/lib/server";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
const purchases = await getPurchases();
const { hasSubscription } = createPurchasesHelper(purchases);
```

## 结论
- 复用 supastarter 内置 `Purchase` 流程与 helper，前端不再依赖自建的 `/api/subscription/status`。
- 无需改数据库、无需跑迁移，页面付费墙与支付数据保持一致。