import {
	createPurchase,
	deletePurchaseBySubscriptionId,
	getPurchaseBySubscriptionId,
	updatePurchase,
} from "@repo/database";
import { logger } from "@repo/logs";
import Stripe from "stripe";
import { setCustomerIdToEntity } from "../../src/lib/customer";
import type {
	CreateCheckoutLink,
	CreateCustomerPortalLink,
	SetSubscriptionSeats,
	WebhookHandler,
} from "../../types";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
	if (stripeClient) {
		return stripeClient;
	}

	const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;

	if (!stripeSecretKey) {
		throw new Error("Missing env variable STRIPE_SECRET_KEY");
	}

	stripeClient = new Stripe(stripeSecretKey);

	return stripeClient;
}

export const createCheckoutLink: CreateCheckoutLink = async (options) => {
	const stripeClient = getStripeClient();
	const {
		type,
		productId,
		redirectUrl,
		customerId,
		organizationId,
		userId,
		trialPeriodDays,
		seats,
	} = options;

	const metadata = {
		organization_id: organizationId || null,
		user_id: userId || null,
	};

	const response = await stripeClient.checkout.sessions.create({
		mode: type === "subscription" ? "subscription" : "payment",
		success_url: redirectUrl ?? "",
		line_items: [
			{
				quantity: seats ?? 1,
				price: productId,
			},
		],
		customer: customerId,
		...(type === "one-time"
			? {
					payment_intent_data: {
						metadata,
					},
					customer_creation: "always",
				}
		: {
				subscription_data: {
					metadata,
					...(trialPeriodDays && trialPeriodDays > 0
						? { trial_period_days: trialPeriodDays }
						: {}),
				},
			}),
		metadata,
	});

	return response.url;
};

export const createCustomerPortalLink: CreateCustomerPortalLink = async ({
	customerId,
	redirectUrl,
}) => {
	const stripeClient = getStripeClient();

	const response = await stripeClient.billingPortal.sessions.create({
		customer: customerId,
		return_url: redirectUrl ?? "",
	});

	return response.url;
};

export const setSubscriptionSeats: SetSubscriptionSeats = async ({
	id,
	seats,
}) => {
	const stripeClient = getStripeClient();

	const subscription = await stripeClient.subscriptions.retrieve(id);

	if (!subscription) {
		throw new Error("Subscription not found.");
	}

	await stripeClient.subscriptions.update(id, {
		items: [
			{
				id: subscription.items.data[0].id,
				quantity: seats,
			},
		],
	});
};

export const webhookHandler: WebhookHandler = async (req) => {
	const stripeClient = getStripeClient();

	if (!req.body) {
		return new Response("Invalid request.", {
			status: 400,
		});
	}

	let event: Stripe.Event | undefined;

	try {
		event = await stripeClient.webhooks.constructEventAsync(
			await req.text(),
			req.headers.get("stripe-signature") as string,
			process.env.STRIPE_WEBHOOK_SECRET as string,
		);
	} catch (e) {
		logger.error(e);

		return new Response("Invalid request.", {
			status: 400,
		});
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const { mode, metadata, customer, id } = event.data.object;

				if (mode === "subscription") {
					break;
				}

				const checkoutSession =
					await stripeClient.checkout.sessions.retrieve(id, {
						expand: ["line_items"],
					});

				const productId = checkoutSession.line_items?.data[0].price?.id;

				if (!productId) {
					return new Response("Missing product ID.", {
						status: 400,
					});
				}

				await createPurchase({
					organizationId: metadata?.organization_id || null,
					userId: metadata?.user_id || null,
					customerId: customer as string,
					type: "ONE_TIME",
					productId,
				});

				await setCustomerIdToEntity(customer as string, {
					organizationId: metadata?.organization_id,
					userId: metadata?.user_id,
				});

				break;
			}
			case "customer.subscription.created": {
				const { metadata, customer, items, id } = event.data.object;

				const productId = items?.data[0].price?.id;

				if (!productId) {
					return new Response("Missing product ID.", {
						status: 400,
					});
				}

				// Create Purchase record
				await createPurchase({
					subscriptionId: id,
					organizationId: metadata?.organization_id || null,
					userId: metadata?.user_id || null,
					customerId: customer as string,
					type: "SUBSCRIPTION",
					productId,
					status: event.data.object.status,
				});

				// Also create or update UserSubscription for consistency
				if (metadata?.user_id) {
					try {
						const { db } = await import("@repo/database");
						
						// Find or create a default subscription plan
						let plan = await db.subscriptionPlan.findFirst({
							where: { active: true }
						});
						
						if (!plan) {
							// Create a default plan if none exists
							plan = await db.subscriptionPlan.create({
								data: {
									name: "Premium Monthly",
									slug: "premium-monthly",
									description: "Premium subscription plan",
									price: 29.99,
									currency: "USD",
									interval: "MONTH",
									features: { access: "premium", downloads: "unlimited" },
								}
							});
						}
						
						// Create UserSubscription
						await db.userSubscription.upsert({
							where: {
								userId_planId_status: {
									userId: metadata.user_id,
									planId: plan.id,
									status: "ACTIVE"
								}
							},
							update: {
								status: "ACTIVE",
								paymentId: id,
								paymentMethod: "stripe",
								amount: plan.price,
								autoRenew: true,
							},
							create: {
								userId: metadata.user_id,
								planId: plan.id,
								status: "ACTIVE",
								paymentId: id,
								paymentMethod: "stripe",
								amount: plan.price,
								autoRenew: true,
								startDate: new Date(),
							}
						});
					} catch (error) {
						logger.error("Failed to create UserSubscription:", error);
						// Don't fail the webhook if UserSubscription creation fails
					}
				}

				await setCustomerIdToEntity(customer as string, {
					organizationId: metadata?.organization_id,
					userId: metadata?.user_id,
				});

				break;
			}
			case "customer.subscription.updated": {
				const subscriptionId = event.data.object.id;
				const { metadata } = event.data.object;

				const existingPurchase =
					await getPurchaseBySubscriptionId(subscriptionId);

				if (existingPurchase) {
					await updatePurchase({
						id: existingPurchase.id,
						status: event.data.object.status,
						productId: event.data.object.items?.data[0].price?.id,
					});
					
					// Also update UserSubscription status
					if (metadata?.user_id || existingPurchase.userId) {
						try {
							const { db } = await import("@repo/database");
							const userId = metadata?.user_id || existingPurchase.userId;
							
							if (userId) {
								// Map Stripe status to our enum
								const status = event.data.object.status === "active" ? "ACTIVE" : 
													 event.data.object.status === "canceled" ? "CANCELLED" :
													 "EXPIRED";
								
								await db.userSubscription.updateMany({
									where: {
										userId: userId,
										paymentId: subscriptionId,
									},
									data: {
										status,
										...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
									}
								});
							}
						} catch (error) {
							logger.error("Failed to update UserSubscription:", error);
						}
					}
				}

				break;
			}
			case "customer.subscription.deleted": {
				await deletePurchaseBySubscriptionId(event.data.object.id);

				break;
			}

			default:
				return new Response("Unhandled event type.", {
					status: 200,
				});
		}

		return new Response(null, { status: 204 });
	} catch (error) {
		return new Response(
			`Webhook error: ${error instanceof Error ? error.message : ""}`,
			{
				status: 400,
			},
		);
	}
};
