"use client";

import { LocaleLink } from "@i18n/routing";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsRTL } from "@shared/hooks/use-is-rtl";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const searchParams = useSearchParams();
  const isRTL = useIsRTL();
  
  // 生成页码链接
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // 最多显示7个页码按钮
    
    if (totalPages <= maxVisible) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 显示首页
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // 显示当前页附近的页码
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // 显示末页
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers();

  return (
    <nav className="flex items-center justify-center mt-12" aria-label="Pagination">
      <div className="flex items-center gap-1">
        {/* 上一页按钮 */}
        {currentPage > 1 ? (
          <LocaleLink
            href={createPageUrl(currentPage - 1)}
            className="inline-flex items-center justify-center size-10 rounded-lg border bg-background hover:bg-accent transition-colors"
            aria-label="Previous page"
          >
            {isRTL ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </LocaleLink>
        ) : (
          <span className="inline-flex items-center justify-center size-10 rounded-lg border bg-background opacity-50 cursor-not-allowed">
            {isRTL ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </span>
        )}

        {/* 页码按钮 */}
        <div className="flex items-center gap-1 px-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex items-center justify-center size-10 text-sm"
                >
                  ...
                </span>
              );
            }
            
            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;
            
            return (
              <LocaleLink
                key={pageNumber}
                href={createPageUrl(pageNumber)}
                className={`
                  inline-flex items-center justify-center size-10 rounded-lg border text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background hover:bg-accent'
                  }
                `}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </LocaleLink>
            );
          })}
        </div>

        {/* 下一页按钮 */}
        {currentPage < totalPages ? (
          <LocaleLink
            href={createPageUrl(currentPage + 1)}
            className="inline-flex items-center justify-center size-10 rounded-lg border bg-background hover:bg-accent transition-colors"
            aria-label="Next page"
          >
            {isRTL ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </LocaleLink>
        ) : (
          <span className="inline-flex items-center justify-center size-10 rounded-lg border bg-background opacity-50 cursor-not-allowed">
            {isRTL ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </span>
        )}
      </div>
    </nav>
  );
}
