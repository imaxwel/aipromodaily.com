"use client";

import { getLanguageDisplayName } from "../../../hooks/use-language-detection";
import type { Locale } from "@repo/i18n";
import { Globe, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export interface LanguageSuggestionData {
	recommendedLocale: Locale;
	currentLocale: Locale;
	country: string;
	countryCode: string;
	confidence: 'high' | 'medium' | 'low';
}

interface LanguageSuggestionBannerProps {
	suggestion: LanguageSuggestionData;
	onAccept: (locale: Locale) => Promise<void>;
	onDismiss: () => void;
	className?: string;
}

export function LanguageSuggestionBanner({
	suggestion,
	onAccept,
	onDismiss,
	className = "",
}: LanguageSuggestionBannerProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const t = useTranslations();

	const handleAccept = async () => {
		if (isLoading) return;
		
		setIsLoading(true);
		try {
			await onAccept(suggestion.recommendedLocale);
		} catch (error) {
			console.error('Failed to switch language:', error);
			// 可以添加错误提示
		} finally {
			setIsLoading(false);
		}
	};

	const handleDismiss = () => {
		setIsVisible(false);
		// 延迟调用onDismiss以等待动画完成
		setTimeout(onDismiss, 300);
	};

	const recommendedLanguageName = getLanguageDisplayName(
		suggestion.recommendedLocale,
		suggestion.currentLocale
	);

	const currentLanguageName = getLanguageDisplayName(
		suggestion.currentLocale,
		suggestion.currentLocale
	);

	// 自动消失逻辑（可选）
	useEffect(() => {
		const timer = setTimeout(() => {
			if (isVisible && suggestion.confidence === 'low') {
				handleDismiss();
			}
		}, 15000); // 15秒后自动消失（仅低置信度建议）

		return () => clearTimeout(timer);
	}, [isVisible, suggestion.confidence]);

	if (!isVisible) return null;

	return (
		<div
			className={`
				bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg
				border-b border-blue-700/20 relative overflow-hidden
				transition-all duration-300 ease-in-out transform
				${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
				${className}
			`}
		>
				{/* 背景装饰 */}
				<div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-50" />
				<div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
				
				<div className="relative px-4 py-3 max-w-7xl mx-auto">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
								<Globe className="w-5 h-5" />
							</div>
							
							<div className="min-w-0 flex-1">
								<div className="flex items-center flex-wrap gap-1 text-sm font-medium">
									<span>
										{t('languageSuggestion.message', {
											country: suggestion.country,
											language: recommendedLanguageName,
											currentLanguage: currentLanguageName,
										})}
									</span>
									{suggestion.confidence === 'medium' && (
										<span className="text-blue-200 text-xs">
											({t('languageSuggestion.suggested')})
										</span>
									)}
								</div>
								
								{suggestion.confidence === 'high' && (
									<div className="text-blue-100 text-xs mt-1">
										{t('languageSuggestion.detectedFrom', { 
											country: suggestion.country 
										})}
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2 flex-shrink-0">
							<button
								onClick={handleAccept}
								disabled={isLoading}
								className={`
									px-4 py-2 bg-white text-blue-600 rounded-md font-medium text-sm
									hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50
									transition-all duration-200 min-w-[80px]
									${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
								`}
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
									</div>
								) : (
									t('languageSuggestion.switchTo', { 
										language: recommendedLanguageName 
									})
								)}
							</button>

							<button
								onClick={handleDismiss}
								className="
									p-2 text-white/80 hover:text-white hover:bg-white/20 
									rounded-md transition-all duration-200 focus:outline-none 
									focus:ring-2 focus:ring-white/50
								"
								aria-label={t('languageSuggestion.dismiss')}
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* 置信度指示器（仅用于开发/调试） */}
					{process.env.NODE_ENV === 'development' && (
						<div className="mt-2 text-xs text-blue-200">
							Confidence: {suggestion.confidence} | Country: {suggestion.countryCode}
						</div>
					)}
				</div>
			</div>
	);
}

// 轻量级版本（更简洁的UI）
export function CompactLanguageSuggestionBanner({
	suggestion,
	onAccept,
	onDismiss,
	className = "",
}: LanguageSuggestionBannerProps) {
	const [isLoading, setIsLoading] = useState(false);
	const t = useTranslations();

	const handleAccept = async () => {
		if (isLoading) return;
		
		setIsLoading(true);
		try {
			await onAccept(suggestion.recommendedLocale);
		} catch (error) {
			console.error('Failed to switch language:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const recommendedLanguageName = getLanguageDisplayName(
		suggestion.recommendedLocale,
		suggestion.currentLocale
	);

	return (
		<div
			className={`
				bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4 my-2
				transition-all duration-200 ease-in-out
				${className}
			`}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-sm text-blue-800">
					<Globe className="w-4 h-4 text-blue-600" />
					<span>
						{t('languageSuggestion.compactMessage', {
							language: recommendedLanguageName
						})}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={handleAccept}
						disabled={isLoading}
						className="
							px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium
							hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50
							disabled:opacity-50 transition-colors duration-200
						"
					>
						{isLoading ? (
							<div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
						) : (
							t('common.yes')
						)}
					</button>
					
					<button
						onClick={onDismiss}
						className="
							px-3 py-1 text-blue-600 border border-blue-300 rounded text-sm
							hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50
							transition-colors duration-200
						"
					>
						{t('common.no')}
					</button>
				</div>
			</div>
		</div>
	);
}