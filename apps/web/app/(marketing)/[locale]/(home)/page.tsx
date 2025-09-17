import { BlogListWithPagination } from "@marketing/blog/components/BlogListWithPagination";
import { setRequestLocale, getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();
	return {
		title: t("blog.title"),
	};
}

interface HomePageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({
	params,
	searchParams,
}: HomePageProps) {
	const { locale } = await params;
	setRequestLocale(locale);
	const searchParamsData = await searchParams;

	return (
		<BlogListWithPagination 
			searchParams={searchParamsData}
			basePath="/"
			showTitle={true}
			locale={locale}
		/>
	);
}
