import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { createCheckoutLink } from "@saas/payments/lib/checkout";

export async function POST(request: NextRequest) {
  try {
    // Log headers for debugging
    console.log("Checkout API - Headers:", {
      cookie: request.headers.get('cookie')?.substring(0, 100) + '...',
      contentType: request.headers.get('content-type'),
    });
    
    // 验证用户会话
    const session = await auth.api.getSession({ headers: request.headers });
    console.log("Checkout API - Session:", session ? { userId: session.user.id, email: session.user.email } : 'No session');
    
    if (!session?.user) {
      console.log("Checkout API - No session found, returning 401");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 获取请求参数
    const body = await request.json();
    const { type, productId, redirectUrl } = body;

    // 验证必需参数
    if (!type || !productId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 使用服务端 API 客户端直接调用后端
    console.log("Checkout API - Calling createCheckoutLink with params:", { type, productId });
    
    const data = await createCheckoutLink({
      type,
      productId,
      redirectUrl: redirectUrl || request.headers.get('referer') || '',
    });
    
    console.log("Checkout API - Successfully created checkout link");
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error creating checkout link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
