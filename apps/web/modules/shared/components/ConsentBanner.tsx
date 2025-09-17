"use client";

import { useCookieConsent } from "@shared/hooks/cookie-consent";
import { Button } from "@ui/components/button";
import { Checkbox } from "@ui/components/checkbox";
import { CookieIcon, Settings, Shield, ChartBar, Megaphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export function ConsentBanner() {
	const { 
		userHasConsented, 
		allowAllCookies, 
		declineAllCookies,
		savePreferences,
		getPreferences 
	} = useCookieConsent();
	
	const [mounted, setMounted] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [preferences, setPreferences] = useState({
		necessary: true,
		functional: false,
		analytics: false,
		marketing: false
	});

	useEffect(() => {
		setMounted(true);
		const saved = getPreferences();
		if (saved) {
			setPreferences(saved);
		}
	}, [getPreferences]);

	if (!mounted) {
		return null;
	}

	if (userHasConsented) {
		return null;
	}

	const handleSavePreferences = () => {
		savePreferences(preferences);
	};

	const handleAllowAll = () => {
		allowAllCookies();
	};

	const handleDeclineAll = () => {
		declineAllCookies();
	};

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
			<div className="mx-auto max-w-7xl p-4">
				<div className="rounded-2xl border bg-card text-card-foreground shadow-2xl overflow-hidden">
					{/* Main Banner */}
					<div className="p-6">
						<div className="flex items-start gap-4">
							<CookieIcon className="size-8 text-primary/70 shrink-0 mt-1" />
							<div className="flex-1">
								<h2 className="text-lg font-semibold mb-2">
									We value your privacy
								</h2>
								<p className="text-sm text-muted-foreground mb-4">
									We use cookies to enhance your browsing experience, serve personalized content, 
									and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
								</p>
								
								{/* Quick Actions */}
								<div className="flex flex-wrap gap-2 mb-3">
									<Button
										variant="outline"
										size="sm"
										onClick={handleDeclineAll}
										className="hover:bg-destructive/10"
									>
										Reject All
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowDetails(!showDetails)}
										className="flex items-center gap-1"
									>
										<Settings className="size-3" />
										Manage Preferences
									</Button>
									<Button
										size="sm"
										onClick={handleAllowAll}
										className="bg-primary hover:bg-primary/90"
									>
										Accept All
									</Button>
								</div>
								
								<div className="flex gap-4 text-xs">
									<Link 
										href="/cookie-policy" 
										className="text-primary hover:underline"
									>
										Cookie Policy
									</Link>
									<Link 
										href="/privacy-policy" 
										className="text-primary hover:underline"
									>
										Privacy Policy
									</Link>
								</div>
							</div>
						</div>
					</div>
					
					{/* Detailed Preferences (Collapsible) */}
					{showDetails && (
						<div className="border-t bg-muted/30 p-6">
							<h3 className="font-semibold mb-4">Manage Cookie Preferences</h3>
							<div className="space-y-4">
								{/* Necessary Cookies */}
								<div className="flex items-start gap-3">
									<Shield className="size-5 text-green-600 mt-0.5" />
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<label className="font-medium text-sm">
												Strictly Necessary Cookies
											</label>
											<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
												Always Active
											</span>
										</div>
										<p className="text-xs text-muted-foreground">
											These cookies are essential for the website to function properly. 
											They enable basic functions like page navigation and access to secure areas.
										</p>
									</div>
								</div>
								
								{/* Functional Cookies */}
								<div className="flex items-start gap-3">
									<Settings className="size-5 text-blue-600 mt-0.5" />
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<label htmlFor="functional" className="font-medium text-sm cursor-pointer">
												Functional Cookies
											</label>
											<Checkbox
												id="functional"
												checked={preferences.functional}
												onCheckedChange={(checked) => 
													setPreferences(prev => ({ ...prev, functional: checked as boolean }))
												}
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											These cookies remember your preferences and choices to provide enhanced features 
											like language settings, theme preferences, and saved form data.
										</p>
									</div>
								</div>
								
								{/* Analytics Cookies */}
								<div className="flex items-start gap-3">
									<ChartBar className="size-5 text-purple-600 mt-0.5" />
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<label htmlFor="analytics" className="font-medium text-sm cursor-pointer">
												Analytical Cookies
											</label>
											<Checkbox
												id="analytics"
												checked={preferences.analytics}
												onCheckedChange={(checked) => 
													setPreferences(prev => ({ ...prev, analytics: checked as boolean }))
												}
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											These cookies help us understand how visitors interact with our website 
											by collecting and reporting information anonymously.
										</p>
									</div>
								</div>
								
								{/* Marketing Cookies */}
								<div className="flex items-start gap-3">
									<Megaphone className="size-5 text-orange-600 mt-0.5" />
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<label htmlFor="marketing" className="font-medium text-sm cursor-pointer">
												Marketing Cookies
											</label>
											<Checkbox
												id="marketing"
												checked={preferences.marketing}
												onCheckedChange={(checked) => 
													setPreferences(prev => ({ ...prev, marketing: checked as boolean }))
												}
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											These cookies are used to deliver relevant advertisements and track 
											ad campaign effectiveness across different websites.
										</p>
									</div>
								</div>
							</div>
							
							<div className="flex justify-end gap-2 mt-6">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowDetails(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleSavePreferences}
									className="bg-primary hover:bg-primary/90"
								>
									Save Preferences
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
