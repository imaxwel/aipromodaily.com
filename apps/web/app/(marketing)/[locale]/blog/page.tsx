import { BlogListWithPagination } from "@marketing/blog/components/BlogListWithPagination";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();
	return {
		title: t("blog.title"),
	};
}

interface BlogListPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
	const params = await searchParams;

	return (
		<BlogListWithPagination 
			searchParams={params}
			basePath="/blog"
			showTitle={true}
		/>
	);
}
