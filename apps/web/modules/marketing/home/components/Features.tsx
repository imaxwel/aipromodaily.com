"use client";

import { MobileIcon } from "@radix-ui/react-icons";
import { cn } from "@ui/lib";
import {
	CloudIcon,
	ComputerIcon,
	PaperclipIcon,
	StarIcon,
	WandIcon,
	MessageCircleIcon,
	HeartHandshakeIcon,
	ShieldCheckIcon,
	BrainIcon,
	ClockIcon,
	UsersIcon,
	SparklesIcon,
	LockIcon,
	TrendingUpIcon,
} from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { type JSXElementConstructor, type ReactNode, useState } from "react";
import heroImage from "../../../../public/images/hero.svg";

export const featureTabs: Array<{
	id: string;
	title: string;
	icon: JSXElementConstructor<any>;
	subtitle?: string;
	description?: ReactNode;
	image?: StaticImageData;
	imageBorder?: boolean;
	stack?: {
		title: string;
		href: string;
		icon: JSXElementConstructor<any>;
	}[];
	highlights?: {
		title: string;
		description: string;
		icon: JSXElementConstructor<any>;
		demoLink?: string;
		docsLink?: string;
	}[];
}> = [
	{
		id: "ai-counseling",
		title: "AI Smart Counseling",
		icon: MessageCircleIcon,
		subtitle: "24/7 professional AI counselors, always ready to listen",
		description:
			"Our AI counselors are trained on professional psychology theories and can provide personalized psychological support and guidance. Whenever and wherever you feel lost or in pain, professional companionship and guidance are always available.",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "Instant Response",
				description:
					"No appointment needed, 24-hour round-the-clock service. When you need help, AI counselors immediately provide professional support.",
				icon: ClockIcon,
			},
			{
				title: "Personalized Conversations",
				description:
					"Based on your situation and needs, we provide tailored psychological guidance solutions, making every conversation more aligned with your inner world.",
				icon: BrainIcon,
			},
			{
				title: "Professional & Reliable",
				description:
					"Integrating multiple psychological therapy methods including Cognitive Behavioral Therapy and Mindfulness Therapy to provide scientifically effective mental health support.",
				icon: ShieldCheckIcon,
			},
		],
	},
	{
		id: "privacy-security",
		title: "Privacy & Security Protection",
		icon: ShieldCheckIcon,
		subtitle: "Absolutely secure anonymous environment for safe, authentic expression",
		description: "We understand the sensitivity of mental health topics and provide a completely anonymous consultation environment. Your privacy and data security are our top priority, allowing you to open up without any concerns.",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "Complete Anonymity",
				description:
					"No personal information registration required, completely anonymous usage. You can freely express your inner thoughts without worrying about identity exposure or social judgment.",
				icon: UsersIcon,
			},
			{
				title: "Data Encryption",
				description:
					"Using bank-level data encryption technology to ensure your conversations are absolutely secure. No third party can access your private information.",
				icon: LockIcon,
			},
			{
				title: "Private Browsing",
				description:
					"Supports incognito mode usage, leaving no usage records. Your mental health journey is known only to you.",
				icon: SparklesIcon,
			},
		],
	},
	{
		id: "emotional-support",
		title: "Emotional Support & Growth",
		icon: HeartHandshakeIcon,
		subtitle: "More than problem-solving - accompanying you to rediscover hope in life",
		description:
			"hope.do provides not only psychological counseling but also warm companionship on your emotional growth journey. We help you find hope in despair and discover the strength to grow through difficulties.",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "Emotional Companionship",
				description:
					"Providing warm emotional support and understanding, so you can feel cared for and accepted even in your darkest moments.",
				icon: HeartHandshakeIcon,
			},
			{
				title: "Growth Tracking",
				description:
					"Recording your mental health growth journey, witnessing every small progress, and helping you see your positive changes.",
				icon: TrendingUpIcon,
			},
			{
				title: "Hope Renewed",
				description:
					"Through professional psychological guidance and positive cognitive restructuring, helping you rediscover life's meaning and value, igniting the light of hope within.",
				icon: SparklesIcon,
			},
		],
	},
];

export function Features() {
	const [selectedTab, setSelectedTab] = useState(featureTabs[0].id);
	return (
		<section id="features" className="scroll-my-20 pt-12 lg:pt-16">
			<div className="container max-w-5xl">
				<div className="mx-auto mb-6 lg:mb-0 lg:max-w-5xl lg:text-center">
					<h2 className="font-bold text-4xl lg:text-5xl">
						Professional Mental Health Support, Reigniting Hope in Life
					</h2>
					<p className="mt-6 text-balance text-lg opacity-50">
						When feeling hopeless, find your hope at hope.do. Our AI counselors are available 24/7 to help you overcome challenges and rediscover meaning in life.
					</p>
				</div>

				<div className="mt-8 mb-4 hidden justify-center lg:flex">
					{featureTabs.map((tab) => {
						return (
							<button
								type="button"
								key={tab.id}
								onClick={() => setSelectedTab(tab.id)}
								className={cn(
									"flex w-24 flex-col items-center gap-2 rounded-lg px-4 py-2 md:w-32",
									selectedTab === tab.id
										? "bg-primary/5 font-bold text-primary dark:bg-primary/10"
										: "font-medium text-foreground/80",
								)}
							>
								<tab.icon
									className={cn(
										"size-6 md:size-8",
										selectedTab === tab.id
											? "text-primary"
											: "text-foreground opacity-30",
									)}
								/>
								<span className="text-xs md:text-sm">
									{tab.title}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<div>
				<div className="container max-w-5xl">
					{featureTabs.map((tab) => {
						const filteredStack = tab.stack || [];
						const filteredHighlights = tab.highlights || [];
						return (
							<div
								key={tab.id}
								className={cn(
									"border-t py-8 first:border-t-0 md:py-12 lg:border lg:first:border-t lg:rounded-3xl lg:p-6",
									selectedTab === tab.id
										? "block"
										: "block lg:hidden",
								)}
							>
								<div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
									<div>
										<h3 className="font-normal text-2xl text-foreground/60 leading-normal md:text-3xl">
											<strong className="text-secondary">
												{tab.title}.{" "}
											</strong>
											{tab.subtitle}
										</h3>

										{tab.description && (
											<p className="mt-4 text-foreground/60">
												{tab.description}
											</p>
										)}

										{filteredStack?.length > 0 && (
											<div className="mt-4 flex flex-wrap gap-6">
												{filteredStack.map(
													(tool, k) => (
														<a
															href={tool.href}
															target="_blank"
															key={`stack-tool-${k}`}
															className="flex items-center gap-2"
															rel="noreferrer"
														>
															<tool.icon className="size-6" />
															<strong className="block text-sm">
																{tool.title}
															</strong>
														</a>
													),
												)}
											</div>
										)}
									</div>
									<div>
										{tab.image && (
											<Image
												src={tab.image}
												alt={tab.title}
												className={cn(
													" h-auto w-full max-w-xl",
													{
														"rounded-2xl border-4 border-secondary/10":
															tab.imageBorder,
													},
												)}
											/>
										)}
									</div>
								</div>

								{filteredHighlights.length > 0 && (
									<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{filteredHighlights.map(
											(highlight, k) => (
												<div
													key={`highlight-${k}`}
													className="flex flex-col items-stretch justify-between rounded-xl bg-card border p-4"
												>
													<div>
														<highlight.icon
															className="text-primary text-xl"
															width="1em"
															height="1em"
														/>
														<strong className="mt-2 block">
															{highlight.title}
														</strong>
														<p className="mt-1 text-sm opacity-50">
															{
																highlight.description
															}
														</p>
													</div>
												</div>
											),
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
