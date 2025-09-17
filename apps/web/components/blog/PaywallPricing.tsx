"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent } from "@ui/components/card";
import { Crown, Check } from "lucide-react";
import { useRouter } from "@shared/hooks/router";
import { config } from "@repo/config";
// import { useCreateCheckoutLinkMutation } from "@saas/payments/lib/api";
import { useSession } from "@saas/auth/hooks/use-session";
import { useState } from "react";
import { useLocaleCurrency } from "@shared/hooks/locale-currency";
import type { PlanId } from "@saas/payments/types";

interface PricingPlan {
  id: string;
  planId: PlanId;
  productId: string;
  name: string;
  price: string;
  period: string;
  yearlyPrice?: string;
  features: string[];
  recommended?: boolean;
  badge?: string;
  type: "recurring" | "one-time";
}

export function PaywallPricing() {
  const router = useRouter();
  const localeCurrency = useLocaleCurrency();
  const { user } = useSession();
  const [loading, setLoading] = useState<string | false>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly"); // 默认选中年度会员
  // const createCheckoutLinkMutation = useCreateCheckoutLinkMutation();

  // Convert config plans to PricingPlan format
  const plans: PricingPlan[] = [];

  // Add monthly plan from pro prices[0]
  const monthlyPrice = config.payments.plans.pro?.prices?.find(
    (p) => p.interval === "month" && p.currency === localeCurrency
  );
  if (monthlyPrice) {
    plans.push({
      id: "monthly",
      planId: "pro",
      productId: monthlyPrice.productId,
      name: "月度会员",
      price: `$${monthlyPrice.amount}`,
      period: "/月",
      features: ["所有付费文章", "优先支持"],
      type: "recurring",
    });
  }

  // Add yearly plan from pro prices[1]
  const yearlyPrice = config.payments.plans.pro?.prices?.find(
    (p) => p.interval === "year" && p.currency === localeCurrency
  );
  if (yearlyPrice) {
    plans.push({
      id: "yearly",
      planId: "pro",
      productId: yearlyPrice.productId,
      name: "年度会员",
      price: `$${yearlyPrice.amount}`,
      period: "/年",
      features: ["所有付费文章", "优先支持", "节省17%"],
      recommended: config.payments.plans.pro.recommended,
      badge: "推荐",
      type: "recurring",
    });
  }

  // Add lifetime plan
  const lifetimePrice = config.payments.plans.lifetime?.prices?.find(
    (p) => p.type === "one-time" && p.currency === localeCurrency
  );
  if (lifetimePrice) {
    plans.push({
      id: "lifetime",
      planId: "lifetime",
      productId: lifetimePrice.productId,
      name: "终身会员",
      price: `$${lifetimePrice.amount}`,
      period: "/终身",
      features: ["所有付费文章", "优先支持", "永久有效"],
      type: "one-time",
    });
  }

  const handleSubscribe = async (plan: PricingPlan) => {
    // If user is not logged in, redirect to signup
    if (!user) {
      router.push("/auth/signup");
      return;
    }

    setLoading(plan.id);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: plan.type === "one-time" ? "one-time" : "subscription",
          productId: plan.productId,
          redirectUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout link");
      }

      const { checkoutLink } = await response.json();
      window.location.href = checkoutLink;
    } catch (error) {
      console.error("Failed to create checkout link:", error);
      // 可以添加用户友好的错误提示
      alert("创建支付链接失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* 标题部分 */}
      <div className="text-center mb-10">
        <p className="text-muted-foreground text-lg">
          升级到高级会员，解锁所有付费内容
        </p>
      </div>

      {/* 价格卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative h-full flex flex-col cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? "border-2 border-primary shadow-lg scale-105"
                : "border border-border hover:border-gray-400"
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {/* 推荐标签 */}
            {selectedPlan === plan.id && plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  {plan.badge}
                </span>
              </div>
            )}

            <CardContent className="p-6 flex flex-col h-full">
              {/* 计划名称 */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
                
                {/* 价格 */}
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>

              {/* 功能列表 */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 选择按钮 */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(plan);
                }}
                variant={selectedPlan === plan.id ? "primary" : "outline"}
                size="lg"
                className="w-full font-medium"
                disabled={loading === plan.id}
              >
                {loading === plan.id ? "处理中..." : `选择${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 底部说明 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>所有会员均可随时取消订阅</p>
        <p>支持支付宝、微信支付</p>
      </div>
    </div>
  );
}
