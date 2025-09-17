"use client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { OrganizationsGrid } from "@saas/organizations/components/OrganizationsGrid";
import { ActivePlan } from "@saas/payments/components/ActivePlan";
import { ChangePlan } from "@saas/payments/components/ChangePlan";
import { useTranslations } from "next-intl";

export default function UserStart({
	userId,
	activePlanId,
}: {
	userId?: string;
	activePlanId?: string;
}) {
	const t = useTranslations();
	const { user } = useSession();

	return (
		<div>
			{config.organizations.enable && <OrganizationsGrid />}

			<div className="mt-6">
				<ActivePlan />
				<ChangePlan 
					userId={userId || user?.id} 
					activePlanId={activePlanId}
					hideEnterprise={true}
				/>
			</div>
		</div>
	);
}
