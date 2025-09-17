import { Metadata } from "next";
import Link from "next/link";
import { Shield, Settings, ChartBar, Megaphone, Cookie, Info, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
	title: "Cookie Policy",
	description: "Learn about how we use cookies and similar tracking technologies on our website.",
};

export default function CookiePolicyPage() {
	const lastUpdated = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="container mx-auto px-4 py-12 max-w-4xl">
			<div className="prose prose-slate dark:prose-invert max-w-none">
				<h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
					<Cookie className="size-10 text-primary" />
					Cookie Policy
				</h1>
				
				<p className="text-lg text-muted-foreground mb-8">
					Last updated: {lastUpdated}
				</p>

				<div className="bg-muted/30 border border-muted rounded-lg p-6 mb-8">
					<div className="flex items-start gap-3">
						<Info className="size-5 text-primary mt-1 shrink-0" />
						<div>
							<p className="font-semibold mb-2">Your Privacy Matters</p>
							<p className="text-sm">
								This Cookie Policy explains how we use cookies and similar tracking technologies 
								on our website. By using our website, you consent to our use of cookies in 
								accordance with this policy.
							</p>
						</div>
					</div>
				</div>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">What are Cookies?</h2>
					<p className="mb-4">
						Cookies are small text files that are stored on your device when you visit a website. 
						They help websites remember information about your visit, which can make your next visit 
						easier and the site more useful to you.
					</p>
					<p>
						Cookies serve many functions, such as remembering your preferences, improving your 
						experience on our website, and helping us understand how our website is used.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-6">Types of Cookies We Use</h2>
					
					<div className="space-y-6">
						{/* Necessary Cookies */}
						<div className="border-l-4 border-green-600 pl-6">
							<div className="flex items-center gap-3 mb-3">
								<Shield className="size-6 text-green-600" />
								<h3 className="text-xl font-semibold">Strictly Necessary Cookies</h3>
								<span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
									Always Active
								</span>
							</div>
							<p className="mb-3">
								These cookies are essential for the website to function properly. They enable basic 
								functions like page navigation, secure area access, and remembering privacy preferences.
							</p>
							<div className="bg-muted/30 rounded-lg p-4">
								<p className="font-medium mb-2">Examples include:</p>
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>Session management cookies</li>
									<li>Security and authentication cookies</li>
									<li>Load balancing cookies</li>
									<li>Cookie consent preferences</li>
								</ul>
							</div>
						</div>

						{/* Functional Cookies */}
						<div className="border-l-4 border-blue-600 pl-6">
							<div className="flex items-center gap-3 mb-3">
								<Settings className="size-6 text-blue-600" />
								<h3 className="text-xl font-semibold">Functional Cookies</h3>
								<span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
									Optional
								</span>
							</div>
							<p className="mb-3">
								These cookies remember choices you make to improve your experience. They allow us to 
								personalize our content for you, remember your preferences, and provide enhanced features.
							</p>
							<div className="bg-muted/30 rounded-lg p-4">
								<p className="font-medium mb-2">Examples include:</p>
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>Language and region preferences</li>
									<li>Theme settings (dark/light mode)</li>
									<li>Font size preferences</li>
									<li>Previously entered form data</li>
								</ul>
							</div>
						</div>

						{/* Analytics Cookies */}
						<div className="border-l-4 border-purple-600 pl-6">
							<div className="flex items-center gap-3 mb-3">
								<ChartBar className="size-6 text-purple-600" />
								<h3 className="text-xl font-semibold">Analytical Cookies</h3>
								<span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
									Optional
								</span>
							</div>
							<p className="mb-3">
								These cookies help us understand how visitors interact with our website by collecting 
								and reporting information anonymously. This helps us improve our website and services.
							</p>
							<div className="bg-muted/30 rounded-lg p-4">
								<p className="font-medium mb-2">We use the following analytics services:</p>
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>Google Analytics 4 (anonymized IP addresses)</li>
									<li>Performance monitoring tools</li>
									<li>Heat mapping and session recording (anonymized)</li>
									<li>Error tracking and reporting</li>
								</ul>
							</div>
						</div>

						{/* Marketing Cookies */}
						<div className="border-l-4 border-orange-600 pl-6">
							<div className="flex items-center gap-3 mb-3">
								<Megaphone className="size-6 text-orange-600" />
								<h3 className="text-xl font-semibold">Marketing Cookies</h3>
								<span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
									Optional
								</span>
							</div>
							<p className="mb-3">
								These cookies are used to track visitors across websites to display ads that are 
								relevant and engaging. They help us measure the effectiveness of our advertising campaigns.
							</p>
							<div className="bg-muted/30 rounded-lg p-4">
								<p className="font-medium mb-2">We may use cookies from:</p>
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>Google Ads</li>
									<li>Facebook Pixel</li>
									<li>LinkedIn Insight Tag</li>
									<li>Twitter Pixel</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">How to Manage Cookies</h2>
					
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-semibold mb-2">Through Our Cookie Settings</h3>
							<p className="mb-3">
								You can manage your cookie preferences at any time by clicking the "Cookie Settings" 
								button that appears on our website. This allows you to accept or reject different 
								categories of cookies.
							</p>
							<button 
								onClick={() => {
									// Trigger cookie consent banner
									if (typeof window !== 'undefined') {
										window.dispatchEvent(new CustomEvent('showCookieConsent'));
									}
								}}
								className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
							>
								<Settings className="size-4" />
								Manage Cookie Settings
							</button>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-2">Through Your Browser</h3>
							<p className="mb-3">
								Most web browsers allow you to control cookies through their settings. You can set 
								your browser to refuse cookies or delete certain cookies. However, blocking all cookies 
								may affect your ability to use certain features of our website.
							</p>
							<div className="bg-muted/30 rounded-lg p-4">
								<p className="font-medium mb-2">Browser Cookie Settings:</p>
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>
										<a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Chrome
										</a>
									</li>
									<li>
										<a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Firefox
										</a>
									</li>
									<li>
										<a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Safari
										</a>
									</li>
									<li>
										<a href="https://support.microsoft.com/en-us/microsoft-edge/view-and-delete-browser-history-in-microsoft-edge-00cf7943-a9e1-975a-a33d-ac10ce454ca4" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Microsoft Edge
										</a>
									</li>
								</ul>
							</div>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-2">Opt-Out Links</h3>
							<p className="mb-3">
								You can also opt out of certain third-party cookies directly:
							</p>
							<div className="bg-muted/30 rounded-lg p-4">
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>
										<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Google Analytics Opt-out
										</a>
									</li>
									<li>
										<a href="https://www.facebook.com/help/568137493302217" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Facebook Ads Preferences
										</a>
									</li>
									<li>
										<a href="https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											LinkedIn Ads Opt-out
										</a>
									</li>
									<li>
										<a href="http://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											Digital Advertising Alliance Opt-out
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
					<p className="mb-4">
						In addition to our own cookies, we may also use various third-party cookies to report 
						usage statistics of our website, deliver advertisements on and through our website, and 
						provide other services.
					</p>
					<p>
						These third parties have their own privacy policies that govern their use of cookies and 
						other tracking technologies. We encourage you to read their privacy policies to understand 
						how they collect and use your data.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">Changes to This Cookie Policy</h2>
					<p className="mb-4">
						We may update this Cookie Policy from time to time to reflect changes in our practices or 
						for other operational, legal, or regulatory reasons. We will notify you of any material 
						changes by posting the new Cookie Policy on this page with an updated "Last updated" date.
					</p>
					<p>
						We encourage you to review this Cookie Policy periodically to stay informed about our use 
						of cookies and related technologies.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
					<p className="mb-4">
						Depending on your location, you may have certain rights regarding cookies and personal data:
					</p>
					<div className="bg-muted/30 rounded-lg p-4">
						<ul className="list-disc list-inside space-y-2">
							<li>
								<strong>EU/EEA Residents (GDPR):</strong> You have the right to withdraw consent, access 
								your data, request deletion, and data portability.
							</li>
							<li>
								<strong>California Residents (CCPA/CPRA):</strong> You have the right to know what personal 
								information is collected, opt-out of sale, and request deletion.
							</li>
							<li>
								<strong>UK Residents (UK GDPR):</strong> Similar rights to EU/EEA residents under UK data 
								protection laws.
							</li>
						</ul>
					</div>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
					<p className="mb-6">
						If you have any questions about this Cookie Policy or our use of cookies, please contact us:
					</p>
					
					<div className="bg-muted/30 rounded-lg p-6 space-y-4">
						<div className="flex items-center gap-3">
							<Mail className="size-5 text-primary shrink-0" />
							<div>
								<p className="font-medium">Email</p>
								<a href="mailto:privacy@example.com" className="text-primary hover:underline">
									privacy@example.com
								</a>
							</div>
						</div>
						
						<div className="flex items-center gap-3">
							<Phone className="size-5 text-primary shrink-0" />
							<div>
								<p className="font-medium">Phone</p>
								<a href="tel:+1234567890" className="text-primary hover:underline">
									+1 (234) 567-890
								</a>
							</div>
						</div>
						
						<div className="flex items-start gap-3">
							<Cookie className="size-5 text-primary shrink-0 mt-1" />
							<div>
								<p className="font-medium">Data Protection Officer</p>
								<p className="text-sm text-muted-foreground">
									For privacy-related inquiries, you can also contact our Data Protection Officer 
									at dpo@example.com
								</p>
							</div>
						</div>
					</div>
				</section>

				<div className="border-t pt-8">
					<div className="flex flex-wrap gap-4 text-sm">
						<Link href="/privacy-policy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						<Link href="/legal/terms" className="text-primary hover:underline">
							Terms of Service
						</Link>
						<Link href="/legal/gdpr" className="text-primary hover:underline">
							GDPR Compliance
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
