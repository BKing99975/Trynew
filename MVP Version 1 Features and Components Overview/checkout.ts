import Stripe from "stripe";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(ENV.stripeSecretKey);

/**
 * Pro plan pricing: $24.99/month recurring
 * These IDs should be set in environment or created on first run
 */
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_1QvPxFD85Arltj2c0000"; // Test mode price

/**
 * Create a Stripe checkout session for Pro subscription
 * Ties the checkout to the authenticated user if available
 */
export async function createProCheckoutSession(
  userIdOrEmail: number | string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let userEmail: string | undefined;
  let stripeCustomerId: string | undefined;

  // If userIdOrEmail is a number, look up the user
  if (typeof userIdOrEmail === "number") {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdOrEmail))
      .limit(1);

    if (userResult.length > 0) {
      const user = userResult[0];
      userEmail = user.email || undefined;
      stripeCustomerId = user.stripeCustomerId || undefined;
    }
  } else {
    // userIdOrEmail is an email
    userEmail = userIdOrEmail;
  }

  if (!userEmail) {
    throw new Error("User email is required for checkout");
  }

  // Create or retrieve Stripe customer
  let customerId = stripeCustomerId;

  if (!customerId) {
    // Search for existing customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: userEmail,
      });
      customerId = customer.id;

      // Update user record with Stripe customer ID if we have a user ID
      if (typeof userIdOrEmail === "number") {
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, userIdOrEmail));
      }
    }
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId: typeof userIdOrEmail === "number" ? userIdOrEmail.toString() : "guest",
      },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  email: string
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already has a Stripe customer ID
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length > 0 && userResult[0].stripeCustomerId) {
    return userResult[0].stripeCustomerId;
  }

  // Search for existing customer by email
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    // Create new customer
    const customer = await stripe.customers.create({
      email,
    });
    customerId = customer.id;
  }

  // Update user record
  await db
    .update(users)
    .set({ stripeCustomerId: customerId })
    .where(eq(users.id, userId));

  return customerId;
}
