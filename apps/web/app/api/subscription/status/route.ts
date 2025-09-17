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

    // Check both UserSubscription and Purchase tables for active subscriptions
    const userSubscription = await db.userSubscription.findFirst({
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

    // Also check the Purchase table for active subscriptions (Stripe webhook data)
    const activePurchase = await db.purchase.findFirst({
      where: {
        userId: session.user.id,
        type: "SUBSCRIPTION",
        status: "active", // Stripe status is lowercase
      },
    });

    const hasActiveSubscription = !!userSubscription || !!activePurchase;

    return NextResponse.json({
      authenticated: true,
      hasActiveSubscription,
      subscription: userSubscription
        ? {
            planName: userSubscription.plan.name,
            interval: userSubscription.plan.interval,
            endDate: userSubscription.endDate,
            autoRenew: userSubscription.autoRenew,
          }
        : activePurchase
          ? {
              planName: "Premium", // Default plan name
              interval: "MONTH", // Default interval
              endDate: null,
              autoRenew: true,
              purchaseId: activePurchase.id,
              stripeSubscriptionId: activePurchase.subscriptionId,
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
