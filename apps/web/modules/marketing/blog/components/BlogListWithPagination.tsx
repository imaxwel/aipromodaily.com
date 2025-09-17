import { PostListItem } from "@marketing/blog/components/PostListItem";
import { getAllPosts } from "@marketing/blog/utils/lib/posts";
import { getPaginatedPosts, getPageFromSearchParams } from "@marketing/blog/utils/pagination";
import { Pagination } from "../../../../components/ui/Pagination";
import { BlogSearchV2 } from "../../../../components/search/BlogSearchV2";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";

interface BlogListWithPaginationProps {
	searchParams: { [key: string]: string | string[] | undefined };
	basePath?: string;
	showTitle?: boolean;
	locale?: string;
}

export async function BlogListWithPagination({ 
	searchParams, 
	basePath = "/blog",
	showTitle = true,
	locale: providedLocale
}: BlogListWithPaginationProps) {
	const locale = providedLocale || await getLocale();
	const t = await getTranslations();

	// 获取当前页码
	const currentPage = getPageFromSearchParams(searchParams);

	// 获取所有文章
	const allPosts = await getAllPosts();

	// 筛选当前语言的已发布文章
	const filteredPosts = allPosts
		.filter((post) => post.published && locale === post.locale)
		.sort((a, b) => {
			// 首先按日期从新到旧排序
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			
			if (dateB !== dateA) {
				return dateB - dateA; // 新的日期在前
			}
			
			// 如果日期相同，按文件名的字母顺序排序（a-z）
			// 使用 path 字段作为文件名标识
			const fileNameA = a.path || '';
			const fileNameB = b.path || '';
			
			return fileNameA.localeCompare(fileNameB);
		});

	// 获取分页数据
	const { posts, totalPages, totalPosts } = getPaginatedPosts(filteredPosts, currentPage);

	return (
		<div className="container max-w-6xl pt-32 pb-16">
			{showTitle && (
				<div className="mb-12 pt-8 text-center">
					<h1 className="mb-2 font-bold text-5xl">{t("blog.title")}</h1>
					<p className="text-lg opacity-50">{t("blog.description")}</p>
					{totalPosts > 0 && (
						<p className="mt-2 text-sm opacity-40">
							{totalPosts} {totalPosts === 1 ? 'article' : 'articles'}
						</p>
					)}
					{/* 搜索组件 */}
					<div className="mt-6 flex justify-center">
					<BlogSearchV2 />
					</div>
				</div>
			)}

			{posts.length > 0 ? (
				<>
					<div className="grid gap-8 md:grid-cols-2">
						{posts.map((post) => (
							<PostListItem post={post} key={post.path} />
						))}
					</div>

					{/* 分页组件 */}
					<Suspense fallback={null}>
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							basePath={basePath}
						/>
					</Suspense>
				</>
			) : (
				<div className="text-center py-12">
					<p className="text-lg opacity-50">No articles found.</p>
				</div>
			)}
		</div>
	);
}
