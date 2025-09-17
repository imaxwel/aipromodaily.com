import { type Config, config } from "@repo/config";
import type { Purchase } from "@repo/database";

const plans = config.payments.plans as Config["payments"]["plans"];

type PlanId = keyof typeof config.payments.plans;
type PurchaseWithoutTimestamps = Omit<Purchase, "createdAt" | "updatedAt">;

function getActivePlanFromPurchases(purchases?: PurchaseWithoutTimestamps[]) {
	const subscriptionPurchase = purchases?.find(
		(purchase) => purchase.type === "SUBSCRIPTION",
	);

	if (subscriptionPurchase) {
		const plan = Object.entries(plans).find(([_, plan]) =>
			plan.prices?.some(
				(price) => price.productId === subscriptionPurchase.productId,
			),
		);

		return {
			id: plan?.[0] as PlanId,
			price: plan?.[1].prices?.find(
				(price) => price.productId === subscriptionPurchase.productId,
			),
			status: subscriptionPurchase.status,
			purchaseId: subscriptionPurchase.id,
		};
	}

	const oneTimePurchase = purchases?.find(
		(purchase) => purchase.type === "ONE_TIME",
	);

	if (oneTimePurchase) {
		const plan = Object.entries(plans).find(([_, plan]) =>
			plan.prices?.some(
				(price) => price.productId === oneTimePurchase.productId,
			),
		);

		return {
			id: plan?.[0] as PlanId,
			price: plan?.[1].prices?.find(
				(price) => price.productId === oneTimePurchase.productId,
			),
			status: "active",
			purchaseId: oneTimePurchase.id,
		};
	}

	const freePlan = Object.entries(plans).find(([_, plan]) => plan.isFree);

	return freePlan
		? {
				id: freePlan[0] as PlanId,
				status: "active",
			}
		: null;
}

export function createPurchasesHelper(purchases: PurchaseWithoutTimestamps[]) {
	const activePlan = getActivePlanFromPurchases(purchases);

	function getPlanIdByProductId(productId: string): PlanId | undefined {
		const entry = Object.entries(plans).find(([_id, plan]) =>
			plan.prices?.some((price) => price.productId === productId),
		);
		return entry?.[0] as PlanId | undefined;
	}

	const isActiveSubscription = (purchase: PurchaseWithoutTimestamps) => {
		if (purchase.type !== "SUBSCRIPTION") return false;
		const status = purchase.status ?? "active";
		return status === "active" || status === "trialing";
	};

	const hasSubscription = (planIds?: PlanId[] | PlanId) => {
		const eligible = purchases?.filter(isActiveSubscription) ?? [];

		// Require explicit plan ids for subscription checks
		if (!planIds) {
			return false;
		}

		if (Array.isArray(planIds)) {
			return eligible.some((p) => {
				const planId = getPlanIdByProductId(p.productId);
				return !!planId && planIds.includes(planId);
			});
		}

		return eligible.some((p) => getPlanIdByProductId(p.productId) === planIds);
	};

	const hasPurchase = (planId: PlanId) => {
		return !!purchases?.some((purchase) =>
			Object.entries(plans)
				.find(([id]) => id === planId)?.[1]
				.prices?.some(
					(price) => price.productId === purchase.productId,
				),
		);
	};

	return { activePlan, hasSubscription, hasPurchase };
}
