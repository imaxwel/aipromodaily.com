import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { getSession } from "@saas/auth/lib/server";
import { purchasesQueryKey } from "@saas/payments/lib/api";
import { getPurchases } from "@saas/payments/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import UserStart from "@saas/start/UserStart";
import { getServerQueryClient } from "@shared/lib/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function AppStartPage() {
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	const t = await getTranslations();
	const purchases = await getPurchases();
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: purchasesQueryKey(),
		queryFn: () => purchases,
	});

	const { activePlan } = createPurchasesHelper(purchases);

	return (
		<div className="">
			<PageHeader
				title={t("start.welcome", { name: session?.user.name })}
				// subtitle={t("start.subtitle")}
			/>

			<UserStart 
				userId={session?.user.id} 
				activePlanId={activePlan?.id}
			/>
		</div>
	);
}
