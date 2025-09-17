// 博文类型定义
import { ContentAccessLevel, UserRole } from './user';

export interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  accessLevel: ContentAccessLevel;
  tags: string[];
  category: string;
  searchableBy: UserRole[]; // 哪些角色可以搜索到
  viewableBy: UserRole[];   // 哪些角色可以查看
  metadata: {
    readTime: number;
    wordCount: number;
    featured: boolean;
    seoKeywords: string[];
  };
}