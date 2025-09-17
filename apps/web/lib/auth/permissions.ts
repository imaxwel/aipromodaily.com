// 权限管理系统
import { User, UserRole, SubscriptionStatus, SubscriptionType, ContentAccessLevel } from '@/types/user';
import { Post } from '@/types/post';

export class PermissionManager {
  /**
   * 检查用户是否有搜索权限
   */
  static canSearch(user: User | null): boolean {
    if (!user) return false;
    return user.role !== UserRole.GUEST;
  }

  /**
   * 获取用户可搜索的内容级别
   */
  static getSearchableContentLevels(user: User | null): ContentAccessLevel[] {
    if (!user) return [];
    
    const subscription = user.subscription;
    
    // 游客：无搜索权限
    if (user.role === UserRole.GUEST) {
      return [];
    }
    
    // 注册用户：公开内容 + 注册用户内容
    if (user.role === UserRole.REGISTERED && !subscription) {
      return [ContentAccessLevel.PUBLIC, ContentAccessLevel.REGISTERED];
    }
    
    // 付费用户：根据订阅类型决定
    if (subscription?.status === SubscriptionStatus.ACTIVE) {
      switch (subscription.type) {
        case SubscriptionType.MONTHLY:
        case SubscriptionType.YEARLY:
          return [
            ContentAccessLevel.PUBLIC,
            ContentAccessLevel.REGISTERED,
            ContentAccessLevel.PREMIUM
          ];
        case SubscriptionType.LIFETIME:
          return Object.values(ContentAccessLevel); // 所有内容
      }
    }
    
    // 默认只能搜索公开内容
    return [ContentAccessLevel.PUBLIC];
  }

  /**
   * 检查用户是否可以查看特定内容
   */
  static canViewContent(user: User | null, post: Post): boolean {
    if (!user && post.accessLevel === ContentAccessLevel.PUBLIC) {
      return true; // 游客可以看公开内容预览
    }
    
    if (!user) return false;
    
    const allowedLevels = this.getSearchableContentLevels(user);
    return allowedLevels.includes(post.accessLevel);
  }

  /**
   * 获取内容预览权限
   */
  static getContentPreviewLevel(user: User | null, post: Post): 'full' | 'preview' | 'none' {
    if (!user) {
      return post.accessLevel === ContentAccessLevel.PUBLIC ? 'preview' : 'none';
    }
    
    if (this.canViewContent(user, post)) {
      return 'full';
    }
    
    // 注册用户可以预览高级内容
    if (user.role === UserRole.REGISTERED) {
      return 'preview';
    }
    
    return 'none';
  }

  /**
   * 检查用户订阅状态
   */
  static isPremiumUser(user: User | null): boolean {
    if (!user) return false;
    return user.subscription?.status === SubscriptionStatus.ACTIVE || false;
  }

  /**
   * 获取用户订阅类型
   */
  static getSubscriptionType(user: User | null): SubscriptionType | null {
    if (!user || !user.subscription) return null;
    if (user.subscription.status !== SubscriptionStatus.ACTIVE) return null;
    return user.subscription.type;
  }

  /**
   * 检查订阅是否即将过期（7天内）
   */
  static isSubscriptionExpiringSoon(user: User | null): boolean {
    if (!user || !user.subscription) return false;
    if (user.subscription.type === SubscriptionType.LIFETIME) return false;
    if (!user.subscription.endDate) return false;
    
    const daysUntilExpiry = Math.floor(
      (user.subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }
}