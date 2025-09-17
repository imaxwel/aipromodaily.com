"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Crown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { PaywallPricing } from "./PaywallPricing";
import { usePurchases } from "@saas/payments/hooks/purchases";
import { useSession } from "@saas/auth/hooks/use-session";

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
  const { user } = useSession();
  const { hasSubscription, hasPurchase } = usePurchases();

  const permission = useMemo(() => {
    const isAuthenticated = !!user;
    // pro plan covers monthly/yearly (recurring); lifetime is one-time
    const isPremium = hasSubscription("pro") || hasPurchase("lifetime");

    let canAccess = false;
    switch (accessLevel) {
      case "PUBLIC":
        canAccess = true;
        break;
      case "REGISTERED":
        canAccess = isAuthenticated;
        break;
      case "PREMIUM":
        canAccess = isAuthenticated && isPremium;
        break;
    }

    return {
      canAccess,
      isAuthenticated,
      hasSubscription: isPremium,
      // purchases hook will fetch lazily; render once client has computed values
      loading: false,
    };
  }, [accessLevel, user, hasSubscription, hasPurchase]);

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
    <div className="space-y-8">
      {/* 预览内容 */}
      {previewContent && (
        <div className="relative">
          <div className="prose prose-lg max-w-none">{previewContent}</div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      )}

      {/* 权限卡片 */}
      <div className="border-t border-border pt-8">
        <Card className="max-w-6xl mx-auto border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              {accessLevel === "REGISTERED" ? (
                <>
                  <User className="h-6 w-6" />
                  需要登录才能查看完整内容
                </>
              ) : (
                <>
                  <Crown className="h-8 w-8 text-yellow-500" />
                  此内容为付费订阅专享
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {!permission.isAuthenticated ? (
              <div className="text-center space-y-4 max-w-md mx-auto">
                <p className="text-muted-foreground">
                  请登录以继续阅读 {postTitle ? `"${postTitle}"` : "这篇文章"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push("/auth/login")} size="lg">
                    登录
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/auth/signup")} size="lg">
                    注册账号
                  </Button>
                </div>
              </div>
            ) : (
              <PaywallPricing />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
