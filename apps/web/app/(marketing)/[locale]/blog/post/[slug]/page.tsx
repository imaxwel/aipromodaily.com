import { LocaleLink, localeRedirect } from "@i18n/routing";
import { ContentGate } from "../../../../../../components/blog/ContentGate";
import { db } from "@repo/database";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getBaseUrl } from "@repo/utils";

type Params = {
  slug: string;
  locale: string;
};

export async function generateMetadata(props: { params: Promise<Params> }) {
  const params = await props.params;
  const { slug } = params;
  
  // 从数据库获取文章
  const post = await db.blogPost.findUnique({
    where: { slug, published: true },
    select: {
      title: true,
      excerpt: true,
      image: true,
    },
  });

  return {
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      title: post?.title,
      description: post?.excerpt,
      images: post?.image
        ? [
            post.image.startsWith("http")
              ? post.image
              : new URL(post.image, getBaseUrl()).toString(),
          ]
        : [],
    },
  };
}

export default async function BlogPostPage(props: { params: Promise<Params> }) {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations();
  
  // 从数据库获取文章
  const post = await db.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      author: true,
      categories: true,
    },
  });

  if (!post) {
    return localeRedirect({ href: "/blog", locale });
  }

  const { title, content, previewContent, accessLevel, author, publishedAt, image, tags } = post;

  return (
    <div className="container max-w-6xl pt-32 pb-24">
      <div className="mx-auto max-w-2xl">
        {/* 文章头部信息 */}
        <div className="mb-12">
          <LocaleLink href="/blog">
            &larr; {t("blog.back")}
          </LocaleLink>
        </div>

        <h1 className="font-bold text-4xl">{title}</h1>

        <div className="mt-4 flex items-center justify-start gap-6">
          {author && (
            <div className="flex items-center">
              {author.image && (
                <div className="relative mr-2 size-8 overflow-hidden rounded-full">
                  <Image
                    src={author.image}
                    alt={author.name}
                    fill
                    sizes="96px"
                    className="object-cover object-center"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm opacity-50">
                  {author.name}
                </p>
              </div>
            </div>
          )}

          <div className="mr-0 ml-auto">
            <p className="text-sm opacity-30">
              {publishedAt && Intl.DateTimeFormat("zh-CN").format(
                new Date(publishedAt),
              )}
            </p>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-1 flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-semibold text-primary text-xs uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {image && (
          <div className="relative mt-6 aspect-16/9 overflow-hidden rounded-xl">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center"
            />
          </div>
        )}

        {/* 内容权限控制 */}
        <ContentGate
          accessLevel={accessLevel}
          previewContent={
            previewContent && (
              <div 
                className="prose prose-lg max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: previewContent }} 
              />
            )
          }
          postTitle={title}
        >
          <div className="pb-8 prose prose-lg max-w-none mt-8">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </ContentGate>
      </div>
    </div>
  );
}
