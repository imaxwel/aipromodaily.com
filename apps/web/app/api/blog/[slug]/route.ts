import { getUserPermissions } from "@repo/auth/lib/permissions";
import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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
