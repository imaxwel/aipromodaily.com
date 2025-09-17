"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/status");
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
      });
      
      if (res.ok) {
        alert("Subscription cancelled successfully");
        fetchSubscription();
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription. Please try again later.");
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Lifetime";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

      {subscription?.hasActiveSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Subscription
              <Badge status="success">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Type</p>
                <p className="font-semibold">{subscription.subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Period</p>
                <p className="font-semibold">
                  {subscription.subscription.interval === "LIFETIME"
                    ? "Lifetime"
                    : subscription.subscription.interval === "YEAR"
                    ? "Yearly"
                    : "Monthly"}
                </p>
              </div>
              {subscription.subscription.endDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-semibold">
                    {formatDate(subscription.subscription.endDate)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Auto-Renewal</p>
                <p className="font-semibold">
                  {subscription.subscription.autoRenew ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {subscription.subscription.interval !== "LIFETIME" && (
                <>
                  <Button variant="outline" onClick={() => router.push("/subscription/upgrade")}>
                    Upgrade Plan
                  </Button>
                  <Button variant="error" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Subscribe to premium membership to unlock all paid content
            </p>
            <Button onClick={() => router.push("/subscription/plans")}>
              View Subscription Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No subscription history yet</p>
          {/* TODO: Implement subscription history list */}
        </CardContent>
      </Card>

      {/* Subscription Benefits */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Member Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="font-semibold">Unlimited Access to Premium Articles</p>
                <p className="text-sm text-muted-foreground">Get all high-quality paid content</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="font-semibold">Priority Technical Support</p>
                <p className="text-sm text-muted-foreground">Get faster response and resolution for your issues</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="font-semibold">Exclusive Resource Downloads</p>
                <p className="text-sm text-muted-foreground">Download member-exclusive code examples and tools</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="font-semibold">Early Access to New Features</p>
                <p className="text-sm text-muted-foreground">Be the first to experience the latest features and improvements</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
