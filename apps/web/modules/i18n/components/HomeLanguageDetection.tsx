"use client";

import { useLanguageDetection } from "@/hooks/use-language-detection";
import type { Locale } from "@repo/i18n";
import { config } from "@repo/config";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { LanguageSuggestionBanner, type LanguageSuggestionData } from "./LanguageSuggestionBanner";

interface HomeLanguageDetectionProps {
	/**
	 * 可用的语言列表
	 */
	availableLocales: Locale[];
	/**
	 * 是否启用自动检测（如果未提供，将使用全局配置）
	 */
	enabled?: boolean;
	/**
	 * 检测延迟（毫秒，如果未提供，将使用全局配置）
	 */
	detectionDelay?: number;
	/**
	 * 自定义className
	 */
	className?: string;
	/**
	 * 是否使用紧凑模式
	 */
	compact?: boolean;
	/**
	 * 回调函数
	 */
	onDetectionStart?: () => void;
	onDetectionComplete?: (hasValidSuggestion: boolean) => void;
	onLanguageSwitch?: (locale: Locale) => void;
	onSuggestionDismiss?: () => void;
}

export function HomeLanguageDetection({
	availableLocales,
	enabled,
	detectionDelay,
	className = "",
	compact = false,
	onDetectionStart,
	onDetectionComplete,
	onLanguageSwitch,
	onSuggestionDismiss,
}: HomeLanguageDetectionProps) {
	const currentLocale = useLocale() as Locale;
	
	// Use global configuration if not explicitly provided
	const isEnabled = enabled !== undefined ? enabled : config.i18n.ipDetection.enabled;
	const delay = detectionDelay !== undefined ? detectionDelay : (config.i18n.ipDetection.detectionDelay || 1000);
	
	const {
		isDetecting,
		suggestion,
		error,
		detectLanguage,
		acceptSuggestion,
		dismissSuggestion,
	} = useLanguageDetection({
		currentLocale,
		availableLocales,
		onSuggestionShow: (suggestion) => {
			console.log('Language suggestion shown:', suggestion);
			onDetectionComplete?.(true);
		},
		onSuggestionAccept: (locale) => {
			console.log('Language switched to:', locale);
			onLanguageSwitch?.(locale);
		},
		onSuggestionDismiss: (suggestionKey) => {
			console.log('Language suggestion dismissed:', suggestionKey);
			onSuggestionDismiss?.();
		},
	});

	// 自动检测逻辑
	useEffect(() => {
		if (!isEnabled) return;

		const timer = setTimeout(() => {
			onDetectionStart?.();
			detectLanguage().finally(() => {
				if (!suggestion) {
					onDetectionComplete?.(false);
				}
			});
		}, delay);

		return () => clearTimeout(timer);
	}, [isEnabled, delay, detectLanguage, onDetectionStart, onDetectionComplete, suggestion]);

	// 处理接受建议
	const handleAcceptSuggestion = async (locale: Locale) => {
		await acceptSuggestion(locale);
	};

	// 处理忽略建议
	const handleDismissSuggestion = () => {
		dismissSuggestion();
	};

	// 如果有错误，在开发模式下显示
	useEffect(() => {
		if (error && process.env.NODE_ENV === 'development') {
			console.warn('Language detection error:', error);
		}
	}, [error]);

	// 如果没有建议或检测未启用，不渲染任何内容
	if (!isEnabled || !suggestion) {
		return null;
	}

	// 转换建议数据格式以匹配横幅组件的props
	const suggestionData: LanguageSuggestionData = {
		recommendedLocale: suggestion.recommendedLocale,
		currentLocale,
		country: suggestion.geolocation.country,
		countryCode: suggestion.geolocation.countryCode,
		confidence: suggestion.confidence,
	};

	return (
		<div className={`language-detection-container ${className}`}>
			<LanguageSuggestionBanner
				suggestion={suggestionData}
				onAccept={handleAcceptSuggestion}
				onDismiss={handleDismissSuggestion}
				className={compact ? "compact" : ""}
			/>
			
			{/* 开发模式下的调试信息 */}
			{process.env.NODE_ENV === 'development' && (
				<div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
					<div className="font-bold mb-2">🌍 Language Detection Debug</div>
					<div>Current: {currentLocale}</div>
					<div>Suggested: {suggestion.recommendedLocale}</div>
					<div>Country: {suggestion.geolocation.country} ({suggestion.geolocation.countryCode})</div>
					<div>Confidence: {suggestion.confidence}</div>
					<div>Detecting: {isDetecting ? 'Yes' : 'No'}</div>
					{error && <div className="text-red-300">Error: {error}</div>}
				</div>
			)}
		</div>
	);
}

// 简化版本，用于快速集成（使用全局配置）
export function SimpleHomeLanguageDetection({
	availableLocales,
	className,
}: {
	availableLocales: Locale[];
	className?: string;
}) {
	return (
		<HomeLanguageDetection
			availableLocales={availableLocales}
			// 使用全局配置的启用状态和延迟时间
			// enabled 和 detectionDelay 留空，组件将自动使用全局配置
			compact={true}
			className={className}
		/>
	);
}

// Hook版本，用于更高级的自定义
export function useHomeLanguageDetection(availableLocales: Locale[]) {
	const currentLocale = useLocale() as Locale;
	
	return useLanguageDetection({
		currentLocale,
		availableLocales,
	});
}