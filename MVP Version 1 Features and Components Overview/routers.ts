import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { createProCheckoutSession } from "./stripe/checkout";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  resources: router({
    getByAccessLevel: publicProcedure
      .input(z.enum(["free", "pro"]))
      .query(({ input }) => db.getResourcesByAccessLevel(input)),
    getByCategory: publicProcedure
      .input(z.string())
      .query(({ input }) => db.getResourcesByCategory(input)),
  }),

  products: router({
    getAll: publicProcedure.query(() => db.getAllProducts()),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getProductById(input)),
  }),

  portfolio: router({
    getAll: publicProcedure.query(() => db.getAllPortfolioProjects()),
    getFeatured: publicProcedure.query(() => db.getFeaturedPortfolioProjects()),
  }),

  testimonials: router({
    getAll: publicProcedure.query(() => db.getTestimonials()),
    getFeatured: publicProcedure.query(() => db.getFeaturedTestimonials()),
  }),

  subscription: router({
    getUser: protectedProcedure.query(({ ctx }) => db.getUserSubscription(ctx.user.id)),
    createCheckout: publicProcedure
      .input(
        z.object({
          successUrl: z.string().url(),
          cancelUrl: z.string().url(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const userIdOrEmail = ctx.user?.id || ctx.user?.email || "guest";
        const { sessionId, url } = await createProCheckoutSession(
          userIdOrEmail,
          input.successUrl,
          input.cancelUrl
        );
        return { sessionId, url };
      }),
  }),

  learningModules: router({
    getAll: publicProcedure.query(() => db.getAllLearningModules()),
  }),

  readiness: router({
    getUserResults: protectedProcedure.query(({ ctx }) => db.getUserReadinessResults(ctx.user.id)),
    create: publicProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          email: z.string().email(),
          checklist: z.string(),
          score: z.number(),
        })
      )
      .mutation(({ input }) =>
        db.createReadinessResult(input.userId || null, input.email, input.checklist, input.score)
      ),
  }),

  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          serviceType: z.enum(["consultation", "workshop", "on_site"]),
          description: z.string().optional(),
          eventDate: z.date().optional(),
        })
      )
      .mutation(({ input }) =>
        db.createBooking(
          input.name,
          input.email,
          input.serviceType,
          input.description,
          input.phone,
          input.eventDate
        )
      ),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          subject: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        db.createContactSubmission(input.name, input.email, input.subject, input.message)
      ),
  }),
});

export type AppRouter = typeof appRouter;
