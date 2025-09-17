"use client";
import { PricingTable } from "@saas/payments/components/PricingTable";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useTranslations } from "next-intl";

export function ChangePlan({
	organizationId,
	userId,
	activePlanId,
	hideEnterprise = false,
}: {
	organizationId?: string;
	userId?: string;
	activePlanId?: string;
	hideEnterprise?: boolean;
}) {
	const t = useTranslations();

	return (
		<SettingsItem
			title={t("settings.billing.changePlan.title")}
			description={t("settings.billing.changePlan.description")}
		>
			<PricingTable
				organizationId={organizationId}
				userId={userId}
				activePlanId={activePlanId}
				hideEnterprise={hideEnterprise}
			/>
		</SettingsItem>
	);
}
