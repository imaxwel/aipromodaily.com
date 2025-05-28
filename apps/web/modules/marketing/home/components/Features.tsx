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
		title: "AI智能心理咨询",
		icon: MessageCircleIcon,
		subtitle: "24/7专业AI心理咨询师，随时倾听您的心声",
		description:
			"我们的AI心理咨询师基于专业心理学理论训练，能够提供个性化的心理支持和建议。无论何时何地，当您感到迷茫或痛苦时，都有专业的陪伴与指导。",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "即时响应",
				description:
					"无需预约等待，24小时全天候服务。当您需要帮助时，AI心理咨询师立即为您提供专业支持。",
				icon: ClockIcon,
			},
			{
				title: "个性化对话",
				description:
					"基于您的情况和需求，提供量身定制的心理疏导方案，让每一次对话都更贴合您的内心世界。",
				icon: BrainIcon,
			},
			{
				title: "专业可靠",
				description:
					"融合认知行为疗法、正念疗法等多种心理治疗方法，为您提供科学有效的心理健康支持。",
				icon: ShieldCheckIcon,
			},
		],
	},
	{
		id: "privacy-security",
		title: "隐私安全保护",
		icon: ShieldCheckIcon,
		subtitle: "绝对安全的匿名环境，让您安心表达真实感受",
		description: "我们深知心理健康话题的敏感性，提供完全匿名的咨询环境。您的隐私和数据安全是我们的首要承诺，让您能够毫无顾虑地敞开心扉。",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "完全匿名",
				description:
					"无需注册个人信息，完全匿名使用。您可以自由表达内心想法，无需担心身份暴露或社会评判。",
				icon: UsersIcon,
			},
			{
				title: "数据加密",
				description:
					"采用银行级别的数据加密技术，确保您的对话内容绝对安全，任何第三方都无法获取您的隐私信息。",
				icon: LockIcon,
			},
			{
				title: "无痕浏览",
				description:
					"支持无痕模式使用，不留任何使用记录。您的心理健康之路，只有您自己知道。",
				icon: SparklesIcon,
			},
		],
	},
	{
		id: "emotional-support",
		title: "情感陪伴成长",
		icon: HeartHandshakeIcon,
		subtitle: "不只是解决问题，更是陪伴您重新找回生活的希望",
		description:
			"hope.do不仅提供心理咨询，更是您情感成长路上的温暖陪伴。我们帮助您从绝望中找到希望，从困境中发现成长的力量。",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "情感陪伴",
				description:
					"提供温暖的情感支持和理解，让您在最黑暗的时刻也能感受到被关怀和接纳的温暖。",
				icon: HeartHandshakeIcon,
			},
			{
				title: "成长追踪",
				description:
					"记录您的心理健康成长轨迹，见证每一个小进步，帮助您看到自己的积极变化。",
				icon: TrendingUpIcon,
			},
			{
				title: "希望重燃",
				description:
					"通过专业的心理疏导和积极的认知重构，帮助您重新发现生活的意义和价值，点燃内心的希望之光。",
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
						专业心理健康支持，重燃生活希望
					</h2>
					<p className="mt-6 text-balance text-lg opacity-50">
						当感到绝望时，在hope.do找回您的希望。我们的AI心理咨询师24/7在线，帮助您克服挑战，重新发现生活的意义。
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
