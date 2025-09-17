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
  const session = request 
    ? await auth.api.getSession({ headers: request.headers })
    : await auth.api.getSession({ headers: new Headers() });
  
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
