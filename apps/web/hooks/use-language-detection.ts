"use client";

import { updateLocale } from "@i18n/lib/update-locale";
import type { Locale } from "@repo/i18n";
import { useCallback, useEffect, useState } from "react";

export interface GeolocationData {
	country: string;
	countryCode: string;
	region?: string;
	city?: string;
	timezone?: string;
	ip: string;
}

interface LanguageSuggestion {
	recommendedLocale: Locale;
	confidence: 'high' | 'medium' | 'low';
	geolocation: GeolocationData;
}

interface UseLanguageDetectionOptions {
	currentLocale: Locale;
	availableLocales: Locale[];
	onSuggestionShow?: (suggestion: LanguageSuggestion) => void;
	onSuggestionAccept?: (locale: Locale) => void;
	onSuggestionDismiss?: (suggestionKey: string) => void;
}

const DISMISSED_SUGGESTIONS_KEY = 'hope-dismissed-language-suggestions';
const GEOLOCATION_CACHE_KEY = 'hope-geolocation-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

export function useLanguageDetection({
	currentLocale,
	availableLocales,
	onSuggestionShow,
	onSuggestionAccept,
	onSuggestionDismiss,
}: UseLanguageDetectionOptions) {
	const [isDetecting, setIsDetecting] = useState(false);
	const [suggestion, setSuggestion] = useState<LanguageSuggestion | null>(null);
	const [error, setError] = useState<string | null>(null);

	// 获取已忽略的建议
	const getDismissedSuggestions = useCallback((): string[] => {
		try {
			const stored = localStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}, []);

	// 保存已忽略的建议
	const saveDismissedSuggestion = useCallback((suggestionKey: string) => {
		try {
			const dismissed = getDismissedSuggestions();
			const updated = [...dismissed, suggestionKey];
			localStorage.setItem(DISMISSED_SUGGESTIONS_KEY, JSON.stringify(updated));
		} catch (error) {
			console.warn('Failed to save dismissed suggestion:', error);
		}
	}, [getDismissedSuggestions]);

	// 获取缓存的地理位置数据
	const getCachedGeolocation = useCallback((): GeolocationData | null => {
		try {
			const cached = localStorage.getItem(GEOLOCATION_CACHE_KEY);
			if (!cached) return null;

			const { data, timestamp } = JSON.parse(cached);
			if (Date.now() - timestamp > CACHE_DURATION) {
				localStorage.removeItem(GEOLOCATION_CACHE_KEY);
				return null;
			}

			return data;
		} catch {
			return null;
		}
	}, []);

	// 缓存地理位置数据
	const cacheGeolocation = useCallback((data: GeolocationData) => {
		try {
			const cacheData = {
				data,
				timestamp: Date.now(),
			};
			localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(cacheData));
		} catch (error) {
			console.warn('Failed to cache geolocation:', error);
		}
	}, []);

	// 检测用户地理位置
	const detectUserLocation = useCallback(async (): Promise<GeolocationData | null> => {
		// 首先检查缓存
		const cached = getCachedGeolocation();
		if (cached) {
			console.log('Using cached geolocation:', cached);
			return cached;
		}

		try {
			// 使用多个免费的地理位置API
			const providers = [
				async () => {
					const response = await fetch('/api/geolocation/ip-info');
					if (!response.ok) throw new Error('IP info API failed');
					return response.json();
				},
				async () => {
					// ip-api.com (免费，无需API key)
					const response = await fetch(
						'https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,timezone,query',
						{ 
							mode: 'cors',
							headers: {
								'Accept': 'application/json',
							}
						}
					);
					if (!response.ok) throw new Error('ip-api HTTP error');
					
					const data = await response.json();
					if (data.status !== 'success') throw new Error('ip-api error');
					
					return {
						country: data.country,
						countryCode: data.countryCode,
						region: data.regionName,
						city: data.city,
						timezone: data.timezone,
						ip: data.query,
					};
				},
				async () => {
					// ipapi.co (免费，无需API key，但有限制)
					const response = await fetch('https://ipapi.co/json/', {
						mode: 'cors',
						headers: {
							'Accept': 'application/json',
						}
					});
					if (!response.ok) throw new Error('ipapi.co HTTP error');
					
					const data = await response.json();
					if (data.error) throw new Error(`ipapi.co error: ${data.reason}`);
					
					return {
						country: data.country_name,
						countryCode: data.country_code,
						region: data.region,
						city: data.city,
						timezone: data.timezone,
						ip: data.ip,
					};
				},
			];

			for (const provider of providers) {
				try {
					const result = await provider();
					if (result) {
						console.log('Successfully detected geolocation:', result);
						cacheGeolocation(result);
						return result;
					}
				} catch (error) {
					console.warn('Geolocation provider failed:', error);
					continue;
				}
			}

			throw new Error('All geolocation providers failed');
		} catch (error) {
			console.error('Failed to detect user location:', error);
			setError(error instanceof Error ? error.message : 'Unknown error');
			return null;
		}
	}, [getCachedGeolocation, cacheGeolocation]);

	// 根据地理位置推荐语言
	const getLanguageRecommendation = useCallback((
		geolocation: GeolocationData
	): LanguageSuggestion | null => {
		// 简化的映射逻辑（在生产环境中应该使用更完整的country-to-locale.ts）
		const countryToLocale: Record<string, Locale> = {
			// 中文
			'CN': 'zh',
			'TW': 'zh', // 繁体未单独提供，回退到 zh
			'HK': 'zh', // 香港未单独提供，回退到 zh
			// 德语系
			'DE': 'de',
			'AT': 'de',
			'CH': 'de',
			// 法语系
			'FR': 'fr',
			'BE': 'fr',
			'CH-FR': 'fr',
			'CA-FR': 'fr',
			// 西语系
			'ES': 'es',
			'MX': 'es',
			'AR': 'es',
			'CO': 'es',
			'CL': 'es',
			'PE': 'es',
			'VE': 'es',
			// 俄语
			'RU': 'ru',
			// 阿拉伯语常见地区
			'SA': 'ar',
			'AE': 'ar',
			'EG': 'ar',
			'IQ': 'ar',
			'MA': 'ar',
			'DZ': 'ar',
			'TN': 'ar',
			'JO': 'ar',
			'KW': 'ar',
			'QA': 'ar',
			'BH': 'ar',
			'OM': 'ar',
			'LY': 'ar',
			'YE': 'ar',
			'PS': 'ar',
			'SY': 'ar',
			// 英语常见地区
			'US': 'en',
			'GB': 'en',
			'CA': 'en',
			'AU': 'en',
			'NZ': 'en',
			'IE': 'en',
			'IN': 'en',
			'PH': 'en',
			'SG': 'en',
		};

		const countryCode = geolocation.countryCode?.toUpperCase();
		if (!countryCode) return null;

		const recommendedLocale = countryToLocale[countryCode];
		if (!recommendedLocale || !availableLocales.includes(recommendedLocale) || recommendedLocale === currentLocale) {
			return null;
		}

		// 检查是否已被忽略
		const suggestionKey = `${countryCode}-${recommendedLocale}`;
		const dismissed = getDismissedSuggestions();
		if (dismissed.includes(suggestionKey)) {
			return null;
		}

		return {
			recommendedLocale,
			confidence: 'high',
			geolocation,
		};
	}, [availableLocales, currentLocale, getDismissedSuggestions]);

	// 主要的检测函数
	const detectLanguage = useCallback(async () => {
		if (isDetecting) return;

		setIsDetecting(true);
		setError(null);

		try {
			const geolocation = await detectUserLocation();
			if (!geolocation) return;

			const languageSuggestion = getLanguageRecommendation(geolocation);
			if (languageSuggestion) {
				setSuggestion(languageSuggestion);
				onSuggestionShow?.(languageSuggestion);
			}
		} catch (error) {
			console.error('Language detection failed:', error);
			setError(error instanceof Error ? error.message : 'Detection failed');
		} finally {
			setIsDetecting(false);
		}
	}, [isDetecting, detectUserLocation, getLanguageRecommendation, onSuggestionShow]);

	// 接受建议
	const acceptSuggestion = useCallback(async (locale: Locale) => {
		try {
			await updateLocale(locale);
			setSuggestion(null);
			onSuggestionAccept?.(locale);
		} catch (error) {
			console.error('Failed to update locale:', error);
			setError('Failed to switch language');
		}
	}, [onSuggestionAccept]);

	// 忽略建议
	const dismissSuggestion = useCallback(() => {
		if (!suggestion) return;

		const suggestionKey = `${suggestion.geolocation.countryCode}-${suggestion.recommendedLocale}`;
		saveDismissedSuggestion(suggestionKey);
		setSuggestion(null);
		onSuggestionDismiss?.(suggestionKey);
	}, [suggestion, saveDismissedSuggestion, onSuggestionDismiss]);

	// 清除缓存和忽略记录（用于测试）
	const clearCache = useCallback(() => {
		try {
			localStorage.removeItem(GEOLOCATION_CACHE_KEY);
			localStorage.removeItem(DISMISSED_SUGGESTIONS_KEY);
			setSuggestion(null);
			setError(null);
		} catch (error) {
			console.warn('Failed to clear cache:', error);
		}
	}, []);

	return {
		isDetecting,
		suggestion,
		error,
		detectLanguage,
		acceptSuggestion,
		dismissSuggestion,
		clearCache,
	};
}

// 语言显示名称映射
export const LANGUAGE_DISPLAY_NAMES: Record<Locale, Record<Locale, string>> = {
	'en': {
		'en': 'English',
		'zh': '中文',
		'de': 'Deutsch',
		'fr': 'Français',
		'es': 'Español',
		'ru': 'Русский',
	},
	'zh': {
		'en': 'English',
		'zh': '中文',
		'de': 'Deutsch',
		'fr': 'Français',
		'es': 'Español',
		'ru': 'Русский',
	}
} as Record<Locale, Record<Locale, string>>;

export function getLanguageDisplayName(locale: Locale, currentLocale: Locale): string {
	return LANGUAGE_DISPLAY_NAMES[currentLocale]?.[locale] || locale;
}