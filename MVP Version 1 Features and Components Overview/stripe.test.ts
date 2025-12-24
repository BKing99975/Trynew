import { describe, it, expect, beforeEach, vi } from "vitest";
import { syncSubscriptionStatus } from "./stripe";
import { getDb } from "../db";
import { users, subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock the database
vi.mock("../db");

describe("Stripe Webhook Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncSubscriptionStatus", () => {
    it("should update user role to pro when subscription is active", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            role: "free",
            stripeCustomerId: "cus_123",
            subscriptionStatus: "none",
            subscriptionTier: "free",
            currentPeriodEnd: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        ]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await syncSubscriptionStatus(
        "cus_123",
        "active",
        "sub_123",
        Math.floor(Date.now() / 1000) + 2592000 // 30 days from now
      );

      // Verify the user was updated with pro role
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "pro",
          subscriptionStatus: "active",
          subscriptionTier: "pro",
        })
      );
    });

    it("should update user role to free when subscription is canceled", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            role: "pro",
            stripeCustomerId: "cus_123",
            subscriptionStatus: "active",
            subscriptionTier: "pro",
            currentPeriodEnd: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        ]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await syncSubscriptionStatus("cus_123", "canceled", "sub_123");

      // Verify the user was downgraded to free
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "free",
          subscriptionStatus: "canceled",
          subscriptionTier: "free",
        })
      );
    });

    it("should handle trialing subscription status as active", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            role: "free",
            stripeCustomerId: "cus_123",
            subscriptionStatus: "none",
            subscriptionTier: "free",
            currentPeriodEnd: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        ]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await syncSubscriptionStatus(
        "cus_123",
        "trialing",
        "sub_123",
        Math.floor(Date.now() / 1000) + 1209600 // 14 days from now
      );

      // Verify the user was granted pro access during trial
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "pro",
          subscriptionStatus: "trialing",
          subscriptionTier: "pro",
        })
      );
    });

    it("should log warning when customer not found", async () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await syncSubscriptionStatus("cus_unknown", "active", "sub_123");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No user found for customer")
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Subscription Lifecycle", () => {
    it("should create subscription record when none exists", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn()
          .mockResolvedValueOnce([
            {
              id: 1,
              openId: "test-user",
              name: "Test User",
              email: "test@example.com",
              role: "free",
              stripeCustomerId: "cus_123",
              subscriptionStatus: "none",
              subscriptionTier: "free",
              currentPeriodEnd: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastSignedIn: new Date(),
            },
          ])
          .mockResolvedValueOnce([]), // No existing subscription
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await syncSubscriptionStatus("cus_123", "active", "sub_123");

      // Verify insert was called for subscription
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
