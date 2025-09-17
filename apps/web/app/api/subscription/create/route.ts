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
