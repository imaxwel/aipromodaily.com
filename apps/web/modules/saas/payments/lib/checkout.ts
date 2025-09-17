import { getServerApiClient } from "@shared/lib/server";

export async function createCheckoutLink({
  type,
  productId,
  redirectUrl,
  organizationId,
}: {
  type: "one-time" | "subscription";
  productId: string;
  redirectUrl?: string;
  organizationId?: string;
}) {
  const apiClient = await getServerApiClient();
  
  const response = await apiClient.payments["create-checkout-link"].$post({
    query: {
      type,
      productId,
      redirectUrl,
      organizationId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to create checkout link:", errorText);
    throw new Error("Failed to create checkout link");
  }

  return response.json();
}
