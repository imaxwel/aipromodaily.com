// 用户角色和权限类型定义

export interface User {
  id: string;
  email: string;
  role: UserRole;
  subscription: Subscription | null;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  GUEST = 'guest',
  REGISTERED = 'registered',
  PREMIUM = 'premium'
}

export interface Subscription {
  id: string;
  userId: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null; // null for lifetime
  autoRenew: boolean;
}

export enum SubscriptionType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export enum ContentAccessLevel {
  PUBLIC = 'public',           // 公开内容
  REGISTERED = 'registered',   // 注册用户可见
  PREMIUM = 'premium',         // 付费用户可见
  EXCLUSIVE = 'exclusive'      // 终身会员独享
}