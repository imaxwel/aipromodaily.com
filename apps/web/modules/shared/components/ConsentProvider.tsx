"use client";

import Cookies from "js-cookie";
import { createContext, useState, useEffect, useCallback } from "react";

export interface CookiePreferences {
	necessary: boolean;
	functional: boolean;
	analytics: boolean;
	marketing: boolean;
}

export interface ConsentData {
	preferences: CookiePreferences;
	timestamp: string;
	version: string;
}

export const ConsentContext = createContext<{
	userHasConsented: boolean;
	allowCookies: () => void;
	declineCookies: () => void;
	allowAllCookies: () => void;
	declineAllCookies: () => void;
	savePreferences: (preferences: CookiePreferences) => void;
	getPreferences: () => CookiePreferences | null;
	revokeConsent: () => void;
}>({
	userHasConsented: false,
	allowCookies: () => {},
	declineCookies: () => {},
	allowAllCookies: () => {},
	declineAllCookies: () => {},
	savePreferences: () => {},
	getPreferences: () => null,
	revokeConsent: () => {},
});

const CONSENT_KEY = "cookie_consent";
const CONSENT_VERSION = "1.0";
const CONSENT_EXPIRY_DAYS = 365;

export function ConsentProvider({
	children,
	initialConsent,
}: {
	children: React.ReactNode;
	initialConsent?: boolean | ConsentData;
}) {
	const [userHasConsented, setUserHasConsented] = useState(
		typeof initialConsent === "boolean" ? initialConsent : !!initialConsent
	);
	const [preferences, setPreferences] = useState<CookiePreferences>({
		necessary: true,
		functional: false,
		analytics: false,
		marketing: false,
	});

	// Load consent from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(CONSENT_KEY);
			if (stored) {
				try {
					const data = JSON.parse(stored) as ConsentData;
					setPreferences(data.preferences);
					setUserHasConsented(true);
					applyConsent(data.preferences);
				} catch (e) {
					console.error("Failed to parse consent data", e);
				}
			}
		}
	}, []);

	const applyConsent = useCallback((prefs: CookiePreferences) => {
		// Dispatch custom event for third-party scripts to listen to
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent("cookieConsentUpdated", {
					detail: { preferences: prefs },
				})
			);

			// Load analytics scripts if consented
			if (prefs.analytics) {
				// This is where you'd load Google Analytics, etc.
				// loadAnalyticsScripts();
			}

			// Load marketing scripts if consented
			if (prefs.marketing) {
				// This is where you'd load Facebook Pixel, etc.
				// loadMarketingScripts();
			}
		}
	}, []);

	const saveConsent = useCallback(
		(prefs: CookiePreferences) => {
			const consentData: ConsentData = {
				preferences: prefs,
				timestamp: new Date().toISOString(),
				version: CONSENT_VERSION,
			};

			// Save to localStorage
			if (typeof window !== "undefined") {
				localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
			}

			// Save to cookie for server-side access
			Cookies.set(CONSENT_KEY, JSON.stringify(consentData), {
				expires: CONSENT_EXPIRY_DAYS,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
			});

			setPreferences(prefs);
			setUserHasConsented(true);
			applyConsent(prefs);
		},
		[applyConsent]
	);

	// Legacy methods for backward compatibility
	const allowCookies = useCallback(() => {
		saveConsent({
			necessary: true,
			functional: true,
			analytics: true,
			marketing: false,
		});
	}, [saveConsent]);

	const declineCookies = useCallback(() => {
		saveConsent({
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false,
		});
	}, [saveConsent]);

	// New methods for GDPR compliance
	const allowAllCookies = useCallback(() => {
		saveConsent({
			necessary: true,
			functional: true,
			analytics: true,
			marketing: true,
		});
	}, [saveConsent]);

	const declineAllCookies = useCallback(() => {
		saveConsent({
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false,
		});
	}, [saveConsent]);

	const savePreferences = useCallback(
		(prefs: CookiePreferences) => {
			// Ensure necessary cookies are always enabled
			saveConsent({ ...prefs, necessary: true });
		},
		[saveConsent]
	);

	const getPreferences = useCallback(() => {
		return preferences;
	}, [preferences]);

	const revokeConsent = useCallback(() => {
		// Clear stored consent
		if (typeof window !== "undefined") {
			localStorage.removeItem(CONSENT_KEY);
		}
		Cookies.remove(CONSENT_KEY);

		// Reset state
		setUserHasConsented(false);
		setPreferences({
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false,
		});

		// Notify scripts to stop tracking
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent("cookieConsentRevoked")
			);
		}
	}, []);

	return (
		<ConsentContext.Provider
			value={{
				userHasConsented,
				allowCookies,
				declineCookies,
				allowAllCookies,
				declineAllCookies,
				savePreferences,
				getPreferences,
				revokeConsent,
			}}
		>
			{children}
		</ConsentContext.Provider>
	);
}
