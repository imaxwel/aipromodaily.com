import type { Post } from "@marketing/blog/types";

export const POSTS_PER_PAGE = 10;

export interface PaginatedPosts {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 获取分页后的文章
 * @param allPosts 所有文章
 * @param page 当前页码（从1开始）
 * @param postsPerPage 每页文章数
 * @returns 分页结果
 */
export function getPaginatedPosts(
  allPosts: Post[],
  page: number = 1,
  postsPerPage: number = POSTS_PER_PAGE
): PaginatedPosts {
  // 确保页码至少为1
  const currentPage = Math.max(1, page);
  
  // 计算总页数
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // 确保当前页不超过总页数
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  
  // 计算起始和结束索引
  const startIndex = (validPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  
  // 获取当前页的文章
  const posts = allPosts.slice(startIndex, endIndex);
  
  return {
    posts,
    currentPage: validPage,
    totalPages,
    totalPosts,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}

/**
 * 从 URL 搜索参数获取页码
 * @param searchParams URL 搜索参数
 * @returns 页码（默认为1）
 */
export function getPageFromSearchParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): number {
  let pageParam: string | undefined;
  
  if (searchParams instanceof URLSearchParams) {
    pageParam = searchParams.get('page') || undefined;
  } else {
    const param = searchParams.page;
    pageParam = Array.isArray(param) ? param[0] : param;
  }
  
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  return isNaN(page) || page < 1 ? 1 : page;
}
