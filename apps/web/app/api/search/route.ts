// 搜索API端点
import { NextRequest, NextResponse } from 'next/server';
import { PermissionManager } from '@/lib/auth/permissions';
import { ContentAccessLevel, UserRole, User } from '@/types/user';
import { auth } from '@repo/auth';
import { headers } from 'next/headers';

// 获取当前用户会话
async function getUserFromSession(): Promise<User | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) return null;
    
    // 转换为应用的User类型
    // 暂时使用模拟数据，实际应该从数据库查询完整用户信息
    const user: User = {
      ...session.user,
      role: UserRole.REGISTERED, // 默认注册用户
      subscription: null,
      permissions: []
    };
    return user;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

// 模拟搜索日志记录
async function logSearch(data: {
  userId?: string;
  query: string;
  resultsCount: number;
  timestamp: Date;
}) {
  // TODO: 实现实际的日志记录
  console.log('Search logged:', data);
}

export async function POST(request: NextRequest) {
  try {
    // 1. 获取用户会话
    const user = await getUserFromSession();
    
    // 2. 检查搜索权限
    if (!PermissionManager.canSearch(user)) {
      return NextResponse.json(
        { 
          error: 'SEARCH_UNAUTHORIZED',
          message: '请登录后使用搜索功能',
          requireAuth: true 
        },
        { status: 403 }
      );
    }
    
    // 3. 获取搜索参数
    const { query, filters = {}, locale } = await request.json();
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'INVALID_QUERY', message: '搜索关键词至少需要2个字符' },
        { status: 400 }
      );
    }
    
    // 4. 获取用户可搜索的内容级别
    const allowedLevels = PermissionManager.getSearchableContentLevels(user);
    
    // 5. 执行搜索（这里是模拟数据，实际需要集成Pagefind）
    const searchResults = await performSearch({
      query,
      filters: {
        ...filters,
        accessLevel: allowedLevels,
        locale: locale || 'en' // 根据用户选择的语言过滤
      },
      limit: 20
    });
    
    // 6. 二次过滤和处理结果
    const processedResults = searchResults.map(result => {
      const viewLevel = PermissionManager.getContentPreviewLevel(user, result);
      
      return {
        ...result,
        // 根据权限返回不同的内容
        content: viewLevel === 'full' 
          ? result.content 
          : viewLevel === 'preview'
          ? result.excerpt
          : null,
        // 添加访问权限标记
        access: {
          level: result.accessLevel,
          canView: viewLevel === 'full',
          previewOnly: viewLevel === 'preview',
          upgradeRequired: viewLevel !== 'full' && result.accessLevel !== ContentAccessLevel.PUBLIC
        }
      };
    });
    
    // 7. 记录搜索日志（用于分析）
    await logSearch({
      userId: user?.id,
      query,
      resultsCount: processedResults.length,
      timestamp: new Date()
    });
    
    return NextResponse.json({
      results: processedResults,
      total: processedResults.length,
      query,
      user: {
        role: user?.role,
        subscription: user?.subscription?.type
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'SEARCH_ERROR', message: '搜索服务暂时不可用' },
      { status: 500 }
    );
  }
}

// 模拟搜索函数（后续需要集成Pagefind）
async function performSearch(options: {
  query: string;
  filters: any;
  limit: number;
}): Promise<any[]> {
  // TODO: 集成实际的Pagefind搜索
  // 返回模拟数据用于测试
  return [
    {
      slug: 'test-post-1',
      title: '测试文章1',
      excerpt: '这是一篇测试文章的摘要',
      content: '这是完整的文章内容...',
      author: '作者',
      publishedAt: new Date(),
      accessLevel: ContentAccessLevel.PUBLIC,
      tags: ['测试', 'demo'],
      category: '技术'
    }
  ];
}