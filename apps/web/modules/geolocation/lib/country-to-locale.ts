import type { Locale } from '@repo/i18n';
import type { GeolocationData } from '../services/ip-geolocation';

/**
 * 国家代码到语言映射表
 * 基于主要国家和地区的官方语言或最常用语言
 */
const COUNTRY_TO_LOCALE_MAP: Record<string, Locale> = {
	// 中文地区
	'CN': 'zh', // 中国大陆 - 简体中文
	'TW': 'zh', // 台湾 - 回退到 zh
	'HK': 'zh', // 香港 - 回退到 zh
	'MO': 'zh', // 澳门 - 回退到 zh
	'SG': 'zh', // 新加坡 - 简体中文（多语言国家，但有大量中文用户）

	// 英语地区
	'US': 'en', // 美国
	'GB': 'en', // 英国
	'CA': 'en', // 加拿大（英语为主）
	'AU': 'en', // 澳大利亚
	'NZ': 'en', // 新西兰
	'IE': 'en', // 爱尔兰
	'ZA': 'en', // 南非
	'IN': 'en', // 印度（英语为官方语言之一）
	'MY': 'en', // 马来西亚
	'PH': 'en', // 菲律宾
    'JP': 'ja', // 日本
    'KR': 'ko', // 韩国

	// 德语
	'DE': 'de', // 德国
	'AT': 'de', // 奥地利
	'CH': 'de', // 瑞士（德语区）
	'LU': 'de', // 卢森堡
	'LI': 'de', // 列支敦士登

	// 法语
	'FR': 'fr', // 法国
	'BE': 'fr', // 比利时（法语区）
	'MC': 'fr', // 摩纳哥
	'CD': 'fr', // 刚果民主共和国
	'CI': 'fr', // 科特迪瓦
	'SN': 'fr', // 塞内加尔

	// 西班牙语
	'ES': 'es', // 西班牙
	'MX': 'es', // 墨西哥
	'AR': 'es', // 阿根廷
	'CO': 'es', // 哥伦比亚
	'VE': 'es', // 委内瑞拉
	'PE': 'es', // 秘鲁
	'CL': 'es', // 智利
	'EC': 'es', // 厄瓜多尔
	'GT': 'es', // 危地马拉
	'CU': 'es', // 古巴
	'BO': 'es', // 玻利维亚
	'DO': 'es', // 多米尼加
	'HN': 'es', // 洪都拉斯
	'PY': 'es', // 巴拉圭
	'SV': 'es', // 萨尔瓦多
	'NI': 'es', // 尼加拉瓜
	'CR': 'es', // 哥斯达黎加
	'PA': 'es', // 巴拿马
	'UY': 'es', // 乌拉圭

	// 葡萄牙语
	'PT': 'pt', // 葡萄牙
	'BR': 'pt', // 巴西

	// 俄语
	'RU': 'ru', // 俄罗斯
	'BY': 'ru', // 白俄罗斯
	'KZ': 'ru', // 哈萨克斯坦
	'KG': 'ru', // 吉尔吉斯斯坦
};

/**
 * 语言优先级映射（用于有多种官方语言的国家）
 */
const COUNTRY_LANGUAGE_PRIORITIES: Record<string, Locale[]> = {
	'CA': ['en', 'fr'], // 加拿大：英语优先，然后是法语
	'CH': ['de', 'fr'], // 瑞士：德语优先
	'BE': ['fr'], // 比利时：法语优先（未提供荷兰语）
	'SG': ['zh', 'en'], // 新加坡：中文优先（考虑到用户群体）
	'MY': ['en', 'zh'], // 马来西亚：英语优先
};

/**
 * 根据地理位置数据推荐语言
 */
export function getRecommendedLocaleFromGeolocation(
	geolocation: GeolocationData,
	availableLocales: Locale[],
	currentLocale: Locale
): {
	recommendedLocale: Locale | null;
	confidence: 'high' | 'medium' | 'low';
} {
	const countryCode = geolocation.countryCode?.toUpperCase();
	
	if (!countryCode) {
		return { recommendedLocale: null, confidence: 'low' };
	}

	// 检查是否有多语言优先级设置
	const priorities = COUNTRY_LANGUAGE_PRIORITIES[countryCode];
	if (priorities) {
		for (const locale of priorities) {
			if (availableLocales.includes(locale) && locale !== currentLocale) {
				return {
					recommendedLocale: locale,
					confidence: 'high'
				};
			}
		}
	}

	// 检查直接映射
	const mappedLocale = COUNTRY_TO_LOCALE_MAP[countryCode];
	if (mappedLocale && availableLocales.includes(mappedLocale) && mappedLocale !== currentLocale) {
		return {
			recommendedLocale: mappedLocale,
			confidence: 'high'
		};
	}

	// 尝试语言族匹配（例如：zh-CN 匹配 zh）
	for (const locale of availableLocales) {
		if (mappedLocale && locale.startsWith(mappedLocale.split('-')[0]) && locale !== currentLocale) {
			return {
				recommendedLocale: locale,
				confidence: 'medium'
			};
		}
	}

	// 地区性语言匹配（例如：根据时区推测）
	if (geolocation.timezone) {
		const timezoneBasedLocale = getLocaleFromTimezone(geolocation.timezone, availableLocales);
		if (timezoneBasedLocale && timezoneBasedLocale !== currentLocale) {
			return {
				recommendedLocale: timezoneBasedLocale,
				confidence: 'low'
			};
		}
	}

	return { recommendedLocale: null, confidence: 'low' };
}

/**
 * 根据时区推测语言（作为辅助方法）
 */
function getLocaleFromTimezone(timezone: string, availableLocales: Locale[]): Locale | null {
	const timezoneToLocale: Record<string, Locale> = {
		// 亚洲时区
		'Asia/Shanghai': 'zh',
		'Asia/Beijing': 'zh',
		'Asia/Hong_Kong': 'zh',
		'Asia/Taipei': 'zh',
        'Asia/Tokyo': 'ja',
        'Asia/Seoul': 'ko',
        'America/Sao_Paulo': 'pt',
		'Asia/Bangkok': 'en',
		'Asia/Ho_Chi_Minh': 'en',
		'Asia/Jakarta': 'en',
		'Asia/Kolkata': 'en',

		// 欧洲时区
		'Europe/London': 'en',
		'Europe/Berlin': 'de',
		'Europe/Paris': 'fr',
		'Europe/Madrid': 'es',
		'Europe/Lisbon': 'pt',
		'Europe/Moscow': 'ru',

		// 美洲时区
		'America/New_York': 'en',
		'America/Los_Angeles': 'en',
		'America/Chicago': 'en',
		'America/Denver': 'en',
		'America/Toronto': 'en',
		'America/Vancouver': 'en',
		'America/Mexico_City': 'es',
		'America/Buenos_Aires': 'es',
		'America/Lima': 'es',
		'America/Bogota': 'es',

		// 大洋洲时区
		'Australia/Sydney': 'en',
		'Australia/Melbourne': 'en',
		'Pacific/Auckland': 'en',
	};

	const mappedLocale = timezoneToLocale[timezone];
	if (mappedLocale && availableLocales.includes(mappedLocale)) {
		return mappedLocale;
	}

	return null;
}

/**
 * 获取语言的本地化显示名称
 */
export function getLocalizedLanguageName(locale: Locale, currentLocale: Locale): string {
	const languageNames: Record<Locale, Record<Locale, string>> = {
		'en': {
			'en': 'English',
			'zh': '中文',
			'de': 'Deutsch',
			'fr': 'Français',
			'es': 'Español',
			'ru': 'Русский',
			'ar': 'العربية',
		},
		'zh': {
			'en': 'English',
			'zh': '中文',
			'de': 'Deutsch',
			'fr': 'Français',
			'es': 'Español',
			'ru': 'Русский',
			'ar': 'العربية',
		}
	} as Record<Locale, Record<Locale, string>>;

	return languageNames[currentLocale]?.[locale] || locale;
}

/**
 * 检查是否应该显示语言切换提示
 */
export function shouldShowLanguageSuggestion(
	geolocation: GeolocationData,
	currentLocale: Locale,
	availableLocales: Locale[],
	userDismissedSuggestions: string[] = []
): boolean {
	const { recommendedLocale, confidence } = getRecommendedLocaleFromGeolocation(
		geolocation,
		availableLocales,
		currentLocale
	);

	if (!recommendedLocale) {
		return false;
	}

	// 检查用户是否已经忽略了这个建议
	const suggestionKey = `${geolocation.countryCode}-${recommendedLocale}`;
	if (userDismissedSuggestions.includes(suggestionKey)) {
		return false;
	}

	// 只有高置信度或中等置信度的建议才显示
	return confidence === 'high' || confidence === 'medium';
}