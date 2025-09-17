/**
 * Cookie Manager - Handles third-party script loading based on consent
 */

import { CookiePreferences } from '../components/ConsentProvider';

export class CookieManager {
	private static instance: CookieManager;
	private scriptsLoaded = {
		analytics: false,
		marketing: false,
	};

	private constructor() {
		// Listen for consent updates
		if (typeof window !== 'undefined') {
			window.addEventListener('cookieConsentUpdated', this.handleConsentUpdate);
			window.addEventListener('cookieConsentRevoked', this.handleConsentRevoked);
		}
	}

	public static getInstance(): CookieManager {
		if (!CookieManager.instance) {
			CookieManager.instance = new CookieManager();
		}
		return CookieManager.instance;
	}

	private handleConsentUpdate = (event: Event) => {
		const customEvent = event as CustomEvent<{ preferences: CookiePreferences }>;
		const preferences = customEvent.detail.preferences;

		if (preferences.analytics && !this.scriptsLoaded.analytics) {
			this.loadAnalytics();
		}

		if (preferences.marketing && !this.scriptsLoaded.marketing) {
			this.loadMarketing();
		}

		if (!preferences.analytics && this.scriptsLoaded.analytics) {
			this.disableAnalytics();
		}

		if (!preferences.marketing && this.scriptsLoaded.marketing) {
			this.disableMarketing();
		}
	};

	private handleConsentRevoked = () => {
		this.disableAnalytics();
		this.disableMarketing();
		this.clearCookies();
	};

	private loadAnalytics() {
		// Google Analytics 4
		const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
		
		if (!GA_MEASUREMENT_ID) {
			console.log('Analytics: No GA Measurement ID configured');
			return;
		}

		// Check if already loaded
		if ((window as any).gtag) {
			console.log('Analytics: Google Analytics already loaded');
			return;
		}

		// Load Google Analytics
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
		script.onload = () => {
			(window as any).dataLayer = (window as any).dataLayer || [];
			function gtag(...args: any[]) {
				(window as any).dataLayer.push(args);
			}
			gtag('js', new Date());
			gtag('config', GA_MEASUREMENT_ID, {
				page_path: window.location.pathname,
				anonymize_ip: true, // GDPR compliance
			});
			
			console.log('Analytics: Google Analytics loaded successfully');
			this.scriptsLoaded.analytics = true;
		};
		script.onerror = () => {
			console.error('Analytics: Failed to load Google Analytics');
		};
		document.head.appendChild(script);
	}

	private loadMarketing() {
		// Facebook Pixel
		const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
		
		if (FB_PIXEL_ID) {
			this.loadFacebookPixel(FB_PIXEL_ID);
		}

		// Google Ads
		const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
		if (GOOGLE_ADS_ID) {
			this.loadGoogleAds(GOOGLE_ADS_ID);
		}

		// LinkedIn Insight
		const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
		if (LINKEDIN_PARTNER_ID) {
			this.loadLinkedInInsight(LINKEDIN_PARTNER_ID);
		}

		this.scriptsLoaded.marketing = true;
	}

	private loadFacebookPixel(pixelId: string) {
		if ((window as any).fbq) {
			console.log('Marketing: Facebook Pixel already loaded');
			return;
		}

		(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
			if (f.fbq) return;
			n = f.fbq = function() {
				n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
			};
			if (!f._fbq) f._fbq = n;
			n.push = n;
			n.loaded = !0;
			n.version = '2.0';
			n.queue = [];
			t = b.createElement(e);
			t.async = !0;
			t.src = v;
			s = b.getElementsByTagName(e)[0];
			s.parentNode.insertBefore(t, s);
		})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

		(window as any).fbq('init', pixelId);
		(window as any).fbq('track', 'PageView');
		
		console.log('Marketing: Facebook Pixel loaded successfully');
	}

	private loadGoogleAds(adsId: string) {
		if ((window as any).gtag) {
			// Google Ads uses the same gtag as Analytics
			(window as any).gtag('config', adsId);
			console.log('Marketing: Google Ads configured');
		} else {
			// Load gtag if not already loaded
			const script = document.createElement('script');
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
			script.onload = () => {
				(window as any).dataLayer = (window as any).dataLayer || [];
				function gtag(...args: any[]) {
					(window as any).dataLayer.push(args);
				}
				gtag('js', new Date());
				gtag('config', adsId);
				console.log('Marketing: Google Ads loaded successfully');
			};
			document.head.appendChild(script);
		}
	}

	private loadLinkedInInsight(partnerId: string) {
		if ((window as any)._linkedin_data_partner_ids) {
			console.log('Marketing: LinkedIn Insight already loaded');
			return;
		}

		(window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
		(window as any)._linkedin_data_partner_ids.push(partnerId);

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
		document.head.appendChild(script);

		console.log('Marketing: LinkedIn Insight loaded successfully');
	}

	private disableAnalytics() {
		// Set opt-out cookie for Google Analytics
		const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
		if (GA_MEASUREMENT_ID) {
			(window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
		}

		// Remove Google Analytics cookies
		this.deleteCookie('_ga');
		this.deleteCookie('_gid');
		this.deleteCookie('_gat');
		
		this.scriptsLoaded.analytics = false;
		console.log('Analytics: Disabled and cookies cleared');
	}

	private disableMarketing() {
		// Facebook Pixel opt-out
		if ((window as any).fbq) {
			(window as any).fbq('consent', 'revoke');
		}

		// Clear marketing cookies
		this.deleteCookie('_fbp');
		this.deleteCookie('fr');
		
		this.scriptsLoaded.marketing = false;
		console.log('Marketing: Disabled and cookies cleared');
	}

	private clearCookies() {
		// Get all cookies
		const cookies = document.cookie.split(';');
		
		// Clear each cookie except necessary ones
		const necessaryCookies = ['cookie_consent', 'session', 'csrf'];
		
		cookies.forEach(cookie => {
			const eqPos = cookie.indexOf('=');
			const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
			
			if (!necessaryCookies.includes(name)) {
				this.deleteCookie(name);
			}
		});

		console.log('Cookies: Non-essential cookies cleared');
	}

	private deleteCookie(name: string) {
		// Delete cookie for all possible paths and domains
		const pathBits = location.pathname.split('/');
		const pathCurrent = ' path=';

		// Try deleting for current path and all parent paths
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${location.hostname}`;

		for (let i = 0; i < pathBits.length; i++) {
			const pathEnd = pathBits.slice(0, i + 1).join('/');
			if (pathEnd.length > 0) {
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;${pathCurrent}${pathEnd};`;
			}
		}
	}

	// Public methods for manual script loading
	public checkAndLoadScripts(preferences: CookiePreferences) {
		if (preferences.analytics && !this.scriptsLoaded.analytics) {
			this.loadAnalytics();
		}
		if (preferences.marketing && !this.scriptsLoaded.marketing) {
			this.loadMarketing();
		}
	}

	// Helper method to check if a specific cookie category is enabled
	public isCategoryEnabled(category: keyof CookiePreferences): boolean {
		const consentData = localStorage.getItem('cookie_consent');
		if (!consentData) return false;

		try {
			const data = JSON.parse(consentData);
			return data.preferences[category] || false;
		} catch {
			return false;
		}
	}
}

// Export singleton instance
export const cookieManager = CookieManager.getInstance();
