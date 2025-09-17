# Stripe 支付回调本地测试指南

## 🔍 项目回调路径分析

根据当前项目代码结构，**Stripe 的 webhook 回调地址是**：
```
/api/webhooks/payments
```

这是一个统一的支付回调端点，支持多种支付提供商（Stripe、LemonSqueezy、Chargebee、Creem、Polar 等）。

### 代码路径说明：
- **API 路由定义**：`packages/api/src/routes/webhooks.ts` 
- **Webhook 处理器**：`packages/payments/provider/stripe/index.ts` 中的 `webhookHandler`
- **统一入口**：所有支付提供商共享同一个回调端点 `/api/webhooks/payments`

## 问题分析

当你在 http://localhost:3000/en/blog/premium-post 使用测试卡（4242 4242 4242 4242）成功支付后，页面刷新仍显示付费墙，这通常是因为：

1. **Webhook 未配置**：Stripe 无法将支付成功事件通知到你的本地服务器
2. **数据库未更新**：没有接收到 Stripe 的 webhook 回调，导致用户的付费状态未更新
3. **本地环境限制**：localhost 无法被外部服务（Stripe）直接访问

## 解决方案：使用 ngrok 进行本地测试

### 方案一：ngrok（推荐）

ngrok 是最流行的解决方案，可以创建一个安全的隧道，让 Stripe 能够访问你的本地服务器。

#### 1. 安装 ngrok

**macOS (Homebrew)**：
```bash
brew install ngrok/ngrok/ngrok
```

**或直接下载**：
```bash
# 访问 https://ngrok.com/download
# 下载后解压并移动到 PATH
unzip ngrok-stable-darwin-amd64.zip
sudo mv ngrok /usr/local/bin/
```

#### 2. 注册 ngrok 账号（可选但推荐）

访问 [ngrok.com](https://ngrok.com) 注册免费账号，获取 authtoken：

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 3. 启动 ngrok 隧道

```bash
# 为你的本地 3000 端口创建隧道
ngrok http 3000
```

你会看到类似输出：
```
Session Status                online
Account                       your-email@example.com
Version                       3.0.0
Region                        United States (us)
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

#### 4. 配置 Stripe Webhook

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. 点击 "Add endpoint"
3. 输入 Endpoint URL：`https://abc123.ngrok.io/api/webhooks/payments`（⚠️ 注意是 `/payments`）
4. 选择要监听的事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`  
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

#### 5. 获取 Webhook 密钥

在 Stripe Dashboard 中创建 webhook 后，点击 "Reveal" 获取 Signing secret：
```
whsec_xxxxxxxxxxxxxxxxxxxxxx
```

#### 6. 更新环境变量

在你的 `.env.local` 文件中添加：

```env
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxx

# ngrok URL（开发时使用）
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### 方案二：Stripe CLI（官方工具） ⭐ 推荐用于本地开发

Stripe CLI 是官方推荐的本地测试工具，**使用它时不需要在 Stripe Dashboard 配置 webhook URL**。

#### 1. 安装 Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# 或下载
# https://github.com/stripe/stripe-cli/releases
```

#### 2. 登录 Stripe

```bash
stripe login
# 浏览器会自动打开，登录你的 Stripe 账号
```

#### 3. 转发 Webhook 事件到本地（重要：使用正确的端点）

```bash
# ⚠️ 注意：根据项目结构，正确的端点是 /api/webhooks/payments
stripe listen --forward-to localhost:3000/api/webhooks/payments

# 或只转发特定事件
stripe listen --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,payment_intent.succeeded \
  --forward-to localhost:3000/api/webhooks/payments
```

运行后你会看到：
```
> Ready! You are using Stripe API Version [2023-10-16]. Your webhook signing secret is:
> whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

#### 4. 配置环境变量

将上面显示的 webhook signing secret 添加到你的 `.env.local`：
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 5. 测试实际支付流程

1. **保持 Stripe CLI 运行**（不要关闭终端窗口）
2. 在另一个终端启动你的开发服务器：`npm run dev`
3. 访问 http://localhost:3000/en/blog/premium-post
4. 使用测试卡完成支付
5. Stripe CLI 会实时显示接收到的事件

#### 6. 手动触发测试事件（可选）

```bash
# 触发 checkout.session.completed 事件
stripe trigger checkout.session.completed

# 触发订阅创建事件
stripe trigger customer.subscription.created
```

### Stripe CLI vs ngrok 对比

| 特性 | Stripe CLI | ngrok |
|------|------------|-------|
| **Stripe Dashboard 配置** | ❌ 不需要 | ✅ 需要手动配置 |
| **Webhook Secret** | 自动生成临时的 | 使用 Dashboard 中的永久密钥 |
| **适用场景** | 本地开发测试 | 本地开发 + 需要外部访问 |
| **事件触发** | 支持手动触发测试事件 | 只能通过实际操作触发 |
| **安装难度** | 简单 | 简单 |
| **免费使用** | ✅ 完全免费 | 有限制（免费版够用） |

**推荐**：
- **本地开发测试**：使用 Stripe CLI（更简单，不需要配置 Dashboard）
- **需要分享测试链接**：使用 ngrok（可以生成公网访问地址）

## Webhook 处理代码分析

### 当前项目的实际处理流程

当前项目使用了统一的 webhook 处理架构：

1. **统一入口** (`packages/api/src/routes/webhooks.ts`):
```typescript
export const webhooksRouter = new Hono().post(
  "/webhooks/payments",  // 注意：是 /payments 不是 /stripe
  describeRoute({
    tags: ["Webhooks"],
    summary: "Handle payments webhook",
  }),
  (c) => {
    return paymentsWebhookHandler(c.req.raw);
  },
);
```

2. **Stripe 处理器** (`packages/payments/provider/stripe/index.ts`):
- 验证 webhook 签名
- 处理不同的事件类型：
  - `checkout.session.completed`: 一次性支付完成
  - `customer.subscription.created`: 订阅创建
  - `customer.subscription.updated`: 订阅更新
  - `customer.subscription.deleted`: 订阅取消

### 参考实现示例（如果需要自定义）

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    // 验证 webhook 签名
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // 更新用户订阅状态
        await handleCheckoutComplete(session)
        break
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // 处理一次性支付
        await handlePaymentSuccess(paymentIntent)
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // 更新订阅信息
        await handleSubscriptionUpdate(subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // 处理订阅取消
        await handleSubscriptionCancel(subscription)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

// 处理函数示例
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { customer_email, metadata } = session
  
  if (!customer_email) return
  
  // 更新用户为付费用户
  await prisma.user.update({
    where: { email: customer_email },
    data: {
      isPremium: true,
      stripeCustomerId: session.customer as string,
      subscriptionId: session.subscription as string,
      subscriptionStatus: 'active',
      subscribedAt: new Date(),
    }
  })
  
  console.log(`✅ User ${customer_email} upgraded to premium`)
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // 处理一次性支付逻辑
  const { metadata } = paymentIntent
  
  if (metadata?.userId) {
    await prisma.user.update({
      where: { id: metadata.userId },
      data: {
        isPremium: true,
        lastPaymentAt: new Date(),
      }
    })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  ) as Stripe.Customer
  
  if (customer.email) {
    await prisma.user.update({
      where: { email: customer.email },
      data: {
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      }
    })
  }
}

async function handleSubscriptionCancel(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  ) as Stripe.Customer
  
  if (customer.email) {
    await prisma.user.update({
      where: { email: customer.email },
      data: {
        isPremium: false,
        subscriptionStatus: 'canceled',
        canceledAt: new Date(),
      }
    })
  }
}
```

## 测试步骤

### 1. 启动本地服务器
```bash
npm run dev
# 服务运行在 http://localhost:3000
```

### 2. 启动 ngrok
```bash
ngrok http 3000
# 获得 https://abc123.ngrok.io
```

### 3. 配置 Stripe Webhook
- 在 Stripe Dashboard 添加 webhook endpoint
- URL: `https://abc123.ngrok.io/api/webhooks/payments` ⚠️ 注意是 `/payments` 不是 `/stripe`
- 复制 webhook secret 到 `.env.local`

### 4. 测试支付流程
1. 访问 `https://abc123.ngrok.io/en/blog/premium-post`（使用 ngrok URL）
2. 点击支付按钮
3. 使用测试卡：
   - 卡号：`4242 4242 4242 4242`
   - 有效期：`12/34`（任意未来日期）
   - CVC：`123`（任意三位数）
   - 邮编：`12345`（任意五位数）
4. 完成支付
5. 检查控制台日志确认 webhook 接收
6. 刷新页面，付费墙应该消失

## 调试技巧

### 1. 查看 ngrok 请求日志
访问 http://127.0.0.1:4040 查看所有通过 ngrok 的请求

### 2. Stripe Dashboard 日志
- 访问 [Stripe Webhook 日志](https://dashboard.stripe.com/test/webhooks)
- 查看事件发送状态和响应

### 3. 本地日志
```javascript
// 在 webhook 处理函数中添加详细日志
console.log('Received webhook:', event.type)
console.log('Event data:', JSON.stringify(event.data.object, null, 2))
```

### 4. 手动触发测试事件
使用 Stripe CLI：
```bash
stripe trigger checkout.session.completed
```

## 常见问题

### Q1: ngrok 连接不稳定
**解决方案**：
- 注册 ngrok 账号获得更稳定的服务
- 使用付费版本获得固定域名
- 考虑使用其他工具如 localtunnel 或 cloudflared

### Q2: Webhook 签名验证失败
**解决方案**：
- 确保使用正确的 webhook secret
- 使用 raw body（不要解析 JSON）
- 检查时间同步问题

### Q3: 数据库未更新
**检查清单**：
1. Webhook 是否成功接收（查看日志）
2. 数据库连接是否正常
3. 用户标识（email/id）是否匹配
4. 事务是否正确提交

### Q4: 支付成功但页面未更新
**解决方案**：
```javascript
// 前端轮询检查支付状态
const checkPaymentStatus = async () => {
  const response = await fetch('/api/check-payment-status')
  const data = await response.json()
  
  if (data.isPaid) {
    // 刷新页面或更新 UI
    window.location.reload()
  }
}

// 每 2 秒检查一次，最多 30 秒
const interval = setInterval(checkPaymentStatus, 2000)
setTimeout(() => clearInterval(interval), 30000)
```

## 生产环境部署注意事项

1. **使用真实域名**：生产环境使用实际域名替代 ngrok
2. **配置生产 Webhook**：在 Stripe Dashboard 配置生产环境的 webhook URL
3. **使用环境变量**：区分测试和生产的 API 密钥
4. **错误处理**：实现重试机制和错误通知
5. **安全性**：始终验证 webhook 签名
6. **幂等性**：确保重复的 webhook 不会造成问题

## 其他本地测试工具

### 1. localtunnel
```bash
npm install -g localtunnel
lt --port 3000 --subdomain myapp
```

### 2. Cloudflare Tunnel
```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

### 3. Serveo (无需安装)
```bash
ssh -R 80:localhost:3000 serveo.net
```

## 📋 快速开始清单

### 使用 Stripe CLI（推荐）

1. **安装 Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **登录 Stripe**:
   ```bash
   stripe login
   ```

3. **启动 webhook 转发**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/payments
   ```

4. **复制 webhook secret 到 `.env.local`**:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # 从 CLI 输出复制
   ```

5. **启动开发服务器并测试**:
   ```bash
   npm run dev
   ```

### 使用 ngrok（需要外部访问时）

1. **安装并启动 ngrok**:
   ```bash
   brew install ngrok
   ngrok http 3000
   ```

2. **在 Stripe Dashboard 配置**:
   - Endpoint URL: `https://你的域名.ngrok.io/api/webhooks/payments`
   - 选择需要的事件
   - 复制 webhook secret

3. **配置环境变量并测试**

## 总结

- **Webhook 端点**：`/api/webhooks/payments`（不是 `/api/webhooks/stripe`）
- **本地测试首选**：Stripe CLI（无需配置 Dashboard）
- **需要外部访问**：使用 ngrok
- **记住**：生产环境需要配置真实的 webhook URL

---

*更新时间：2024-01-13*
*文档版本：1.0.0*
==========

根据你项目的代码结构，Stripe 的 webhook 回调地址是：
⚠️ 不是 /api/webhooks/stripe

这是一个统一的支付回调端点，所有支付提供商（Stripe、LemonSqueezy、Chargebee、Creem、Polar）都共享这个端点。

🚀 使用 Stripe CLI 进行本地测试（推荐方案）

使用 Stripe CLI 的最大优势是：不需要在 Stripe Dashboard 配置 webhook URL！

具体操作步骤：

1. 安装 Stripe CLI：
bash
brew install stripe/stripe-cli/stripe
2. 登录 Stripe：
bash
stripe login
3. 启动 webhook 转发（注意正确的端点）：
bash
stripe listen --forward-to localhost:3000/api/webhooks/payments
运行后会显示：
> Ready! Your webhook signing secret is:
> whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
4. 配置环境变量，将上面的 secret 添加到 .env.local：
env
STRIPE_SECRET_KEY=sk_test_你的密钥
STRIPE_WEBHOOK_SECRET=whsec_上面显示的密钥
5. 测试流程：
•  保持 Stripe CLI 运行
•  在另一个终端运行 npm run dev
•  访问 http://localhost:3000/en/blog/premium-post
•  使用测试卡支付
•  Stripe CLI 会实时显示收到的事件

❓ 常见问题解答

Q: 使用 Stripe CLI 时还需要在 Stripe 后台设置回调地址吗？
A: 不需要！ 这是 Stripe CLI 的最大优势，它会自动处理 webhook 转发，无需在 Dashboard 配置。

Q: Stripe CLI vs ngrok 该选哪个？
•  本地开发测试：选 Stripe CLI（更简单，免配置）
•  需要分享测试链接给他人：选 ngrok（能生成公网地址）

Q: 为什么是 /api/webhooks/payments 而不是 /api/webhooks/stripe？
A: 项目采用了统一的支付处理架构，所有支付提供商共用一个端点，系统会根据请求头和内容自动识别是哪个支付提供商。

现在你可以直接使用 Stripe CLI 进行本地测试了，无需配置 Dashboard，非常方便！
