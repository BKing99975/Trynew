import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  resources,
  products,
  subscriptions,
  orders,
  orderItems,
  portfolioProjects,
  testimonials,
  learningModules,
  moduleProgress,
  readinessResults,
  supportTickets,
  bookings,
  contactSubmissions,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Resources
export async function getResourcesByAccessLevel(accessLevel: "free" | "pro") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.accessLevel, accessLevel));
}

export async function getResourcesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.category, category as any));
}

// Products
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

// Subscriptions
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createOrUpdateSubscription(
  userId: number,
  tier: "free" | "pro" | "premium",
  stripeSubscriptionId?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getUserSubscription(userId);
  if (existing) {
    await db.update(subscriptions).set({ tier, stripeSubscriptionId }).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, tier, stripeSubscriptionId });
  }
  return getUserSubscription(userId);
}

// Portfolio
export async function getAllPortfolioProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioProjects).orderBy(portfolioProjects.order);
}

export async function getFeaturedPortfolioProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioProjects).where(eq(portfolioProjects.featured, true));
}

// Testimonials
export async function getTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials);
}

export async function getFeaturedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.featured, true));
}

// Learning Modules
export async function getAllLearningModules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learningModules).orderBy(learningModules.order);
}

export async function getUserModuleProgress(userId: number, moduleId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(moduleProgress)
    .where(and(eq(moduleProgress.userId, userId), eq(moduleProgress.moduleId, moduleId)))
    .limit(1);
  return result[0] || null;
}

// Readiness Results
export async function getUserReadinessResults(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(readinessResults).where(eq(readinessResults.userId, userId));
}

export async function createReadinessResult(
  userId: number | null,
  email: string,
  checklist: string,
  score: number
) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(readinessResults).values({ userId, email, checklist, score });
  return { userId, email, checklist, score };
}

// Support Tickets
export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
}

// Bookings
export async function createBooking(
  name: string,
  email: string,
  serviceType: "consultation" | "workshop" | "on_site",
  description?: string,
  phone?: string,
  eventDate?: Date
) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(bookings).values({ name, email, phone, serviceType, description, eventDate });
  return { name, email, phone, serviceType, description, eventDate };
}

// Contact Submissions
export async function createContactSubmission(name: string, email: string, subject?: string, message?: string) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(contactSubmissions).values({ name, email, subject, message });
  return { name, email, subject, message };
}
