"use client";

import { useCreateCustomerPortalLinkMutation } from "@saas/payments/lib/api";
import { Button } from "@ui/components/button";
import { CreditCardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function CustomerPortalButton({ purchaseId }: { purchaseId: string }) {
	const t = useTranslations();
	const createCustomerPortalMutation = useCreateCustomerPortalLinkMutation();

	const createCustomerPortal = async () => {
		try {
			const { customerPortalLink } =
				await createCustomerPortalMutation.mutateAsync({
					purchaseId,
					redirectUrl: window.location.href,
				});

			window.location.href = customerPortalLink;
		} catch (error: any) {
			// Check if this is a Stripe configuration error
			if (error?.message?.includes("customer portal") || error?.message?.includes("configuration")) {
				toast.error(
					"Stripe Customer Portal is not configured. Please contact support or configure it in your Stripe Dashboard.",
				);
			} else {
				toast.error(
					t(
						"settings.billing.createCustomerPortal.notifications.error.title",
					),
				);
			}
		}
	};

	return (
		<Button
			variant="light"
			size="sm"
			onClick={() => createCustomerPortal()}
			loading={createCustomerPortalMutation.isPending}
		>
			<CreditCardIcon className="mr-2 size-4" />
			{t("settings.billing.createCustomerPortal.label")}
		</Button>
	);
}
