import Stripe from "stripe";
import { getDb } from "../db";
import { users, subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey);

/**
 * Verify Stripe webhook signature
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      ENV.stripeWebhookSecret
    );
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Sync subscription status to user role
 */
export async function syncSubscriptionStatus(
  customerId: string,
  subscriptionStatus: string,
  subscriptionId?: string,
  currentPeriodEnd?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find user by Stripe customer ID
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!userResult.length) {
    console.warn(`[Stripe] No user found for customer ${customerId}`);
    return;
  }

  const user = userResult[0];
  let newRole: "guest" | "free" | "pro" | "premium" | "admin" = "free";
  let newSubscriptionTier: "free" | "pro" | "premium" = "free";

  // Determine role based on subscription status
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    newRole = "pro";
    newSubscriptionTier = "pro";
  } else {
    newRole = "free";
    newSubscriptionTier = "free";
  }

  // Update user record with Stripe fields
  await db
    .update(users)
    .set({
      role: newRole,
      stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
      stripeSubStatus: subscriptionStatus as any,
      subscriptionStatus: subscriptionStatus as any,
      subscriptionTier: newSubscriptionTier,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  console.log(
    `[Stripe Webhook] Updated user ${user.id}: role=${newRole}, subId=${subscriptionId}, status=${subscriptionStatus}`
  );

  // Update or create subscription record
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  if (existingSubscription.length) {
    await db
      .update(subscriptions)
      .set({
        tier: newSubscriptionTier,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: subscriptionStatus as any,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, user.id));
  } else {
    await db.insert(subscriptions).values({
      userId: user.id,
      tier: newSubscriptionTier,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: subscriptionStatus as any,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
    });
  }

  console.log(
    `[Stripe] Synced user ${user.id} to role: ${newRole}, status: ${subscriptionStatus}`
  );
}

/**
 * Handle checkout.session.completed event
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log(`[Stripe Webhook] checkout.session.completed: sessionId=${session.id}`);
  
  if (!session.customer || typeof session.customer !== "string") {
    console.warn("[Stripe Webhook] ERROR: No customer ID in checkout session");
    return;
  }

  const customerId = session.customer;
  console.log(`[Stripe Webhook] Processing checkout for customer: ${customerId}`);

  // Get subscription details
  if (session.subscription && typeof session.subscription === "string") {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      ) as any;

      console.log(`[Stripe Webhook] Subscription retrieved: ${subscription.id}, status=${subscription.status}`);
      
      await syncSubscriptionStatus(
        customerId,
        subscription.status,
        subscription.id,
        subscription.current_period_end ?? undefined
      );
    } catch (error) {
      console.error(`[Stripe Webhook] ERROR retrieving subscription: ${error}`);
      throw error;
    }
  } else {
    console.warn(`[Stripe Webhook] No subscription ID in checkout session`);
  }
}

/**
 * Handle customer.subscription.created event
 */
export async function handleSubscriptionCreated(
  subscription: any
) {
  console.log(`[Stripe Webhook] customer.subscription.created: subId=${subscription.id}, customerId=${subscription.customer}, status=${subscription.status}`);
  
  try {
    const customerId = subscription.customer as string;
    await syncSubscriptionStatus(
      customerId,
      subscription.status,
      subscription.id,
      subscription.current_period_end ?? undefined
    );
    console.log(`[Stripe Webhook] Successfully synced subscription creation`);
  } catch (error) {
    console.error(`[Stripe Webhook] ERROR syncing subscription creation: ${error}`);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
export async function handleSubscriptionUpdated(
  subscription: any
) {
  console.log(`[Stripe Webhook] customer.subscription.updated: subId=${subscription.id}, customerId=${subscription.customer}, status=${subscription.status}`);
  
  try {
    const customerId = subscription.customer as string;
    await syncSubscriptionStatus(
      customerId,
      subscription.status,
      subscription.id,
      subscription.current_period_end ?? undefined
    );
    console.log(`[Stripe Webhook] Successfully synced subscription update`);
  } catch (error) {
    console.error(`[Stripe Webhook] ERROR syncing subscription update: ${error}`);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
export async function handleSubscriptionDeleted(
  subscription: any
) {
  const customerId = subscription.customer as string;
  // When subscription is deleted, set status to canceled
  await syncSubscriptionStatus(customerId, "canceled", subscription.id);
}
