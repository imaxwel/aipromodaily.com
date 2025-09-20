import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import {
	createDocSchema,
	createMetaSchema,
	transformMDX,
} from "@fumadocs/content-collections/configuration";
import rehypeShiki from "@shikijs/rehype";
import { remarkImage } from "fumadocs-core/mdx-plugins";
import { config } from "../../config";

function sanitizePath(path: string) {
	return path
		// Remove ".<locale>.<ext>" like ".ru.mdx" or ".ja.mdx"
		.replace(/\.[a-zA-Z-]{2,5}\.(md|mdx|json)$/i, "")
		// Fallback: remove plain extension like ".mdx" or ".md" or ".json"
		.replace(/\.(md|mdx|json)$/i, "")
		.replace(/^\//, "")
		.replace(/\/$/, "")
		.replace(/index$/, "");
}

function getLocaleFromFilePath(path: string) {
	return (
		path
			.match(/(\.[a-zA-Z-]{2,5})+\.(md|mdx|json)$/)?.[1]
			?.replace(".", "") ?? config.i18n.defaultLocale
	);
}

const posts = defineCollection({
	name: "posts",
	directory: "content/posts",
	include: "**/*.{mdx,md}",
	schema: (z) => ({
		title: z.string(),
		date: z.string(),
		image: z.string().optional(),
		authorName: z.string(),
		authorImage: z.string().optional(),
		authorLink: z.string().optional(),
		excerpt: z.string().optional(),
		tags: z.array(z.string()),
		published: z.boolean(),
		// 添加访问级别控制
		accessLevel: z.enum(["PUBLIC", "REGISTERED", "PREMIUM"]).default("PUBLIC"),
		previewContent: z.string().optional(), // 付费内容的预览部分
	}),
	transform: async (document, context) => {
		const body = await compileMDX(context, document, {
			rehypePlugins: [
				[
					rehypeShiki,
					{
						theme: "nord",
					},
				],
			],
		});

		// 如果有预览内容，也需要编译
		let compiledPreviewContent = undefined;
		if (document.previewContent) {
			const previewDoc = {
				...document,
				_meta: {
					...document._meta,
					filePath: document._meta.filePath.replace(/\.mdx?$/, '-preview.mdx'),
				},
				content: document.previewContent,
			};
			compiledPreviewContent = await compileMDX(context, previewDoc, {
				rehypePlugins: [
					[
						rehypeShiki,
						{
							theme: "nord",
						},
					],
				],
			});
		}

		return {
			...document,
			body,
			previewContent: compiledPreviewContent,
			locale: getLocaleFromFilePath(document._meta.filePath),
			path: sanitizePath(document._meta.path),
		};
	},
});

const legalPages = defineCollection({
	name: "legalPages",
	directory: "content/legal",
	include: "**/*.{mdx,md}",
	schema: (z) => ({
		title: z.string(),
	}),
	transform: async (document, context) => {
		const body = await compileMDX(context, document);

		return {
			...document,
			body,
			locale: getLocaleFromFilePath(document._meta.filePath),
			path: sanitizePath(document._meta.path),
		};
	},
});

const docs = defineCollection({
	name: "docs",
	directory: "content/docs",
	include: "**/*.mdx",
	schema: createDocSchema,
	transform: async (document, context) =>
		transformMDX(document, context, {
			remarkPlugins: [
				[
					remarkImage,
					{
						publicDir: "public",
					},
				],
			],
		}),
});

const docsMeta = defineCollection({
	name: "docsMeta",
	directory: "content/docs",
	include: "**/meta.json",
	parser: "json",
	schema: createMetaSchema,
});

export default defineConfig({
	collections: [posts, legalPages, docs, docsMeta],
});
