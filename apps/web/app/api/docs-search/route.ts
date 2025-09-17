import { config } from "@repo/config";
import { createI18nSearchAPI } from "fumadocs-core/search/server";
import { docsSource } from "../../docs-source";

// Map our locale codes to fumadocs supported language codes
const languageMap: Record<string, string> = {
	en: "english",
	zh: "chinese", // fumadocs doesn't have chinese, use english as fallback
	fr: "french",
	es: "spanish",
	ru: "russian",
	ar: "arabic",
	de: "german",
};

// Filter out unsupported languages for search
const supportedSearchLanguages = Object.keys(config.i18n.locales).filter(
	(locale) => ["en", "fr", "es", "ru", "ar", "de"].includes(locale)
);

export const { GET } = createI18nSearchAPI("advanced", {
	i18n: {
		defaultLanguage: config.i18n.defaultLocale,
		languages: supportedSearchLanguages.map((lang) => languageMap[lang] || lang),
	},
	indexes: docsSource.getLanguages().flatMap((entry) => {
		// Only include pages for supported search languages
		if (!supportedSearchLanguages.includes(entry.language)) {
			return [];
		}
		return entry.pages.map((page) => ({
			title: page.data.title,
			description: page.data.description,
			structuredData: page.data.structuredData,
			id: page.url,
			url: page.url,
			locale: languageMap[entry.language] || entry.language,
		}));
	}),
});
