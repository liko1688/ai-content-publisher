import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

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

  // Content generation router
  content: router({
    generate: protectedProcedure
      .input(
        z.object({
          keyword: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { generateContentWithOpenAI } = await import("./openai");
        const { createArticle } = await import("./db");
        const { randomUUID } = await import("crypto");

        // 生成內容
        const generated = await generateContentWithOpenAI(input.keyword);

        // 儲存到資料庫
        const article = await createArticle({
          id: randomUUID(),
          keyword: input.keyword,
          title: generated.title,
          content: generated.content,
          imageUrl: generated.imageUrl,
          status: "draft",
          userId: ctx.user.id,
        });

        return article;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserArticles } = await import("./db");
      return getUserArticles(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { getArticleById } = await import("./db");
        return getArticleById(input.id);
      }),
  }),

  // Social accounts router
  socialAccounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSocialAccounts } = await import("./db");
      return getUserSocialAccounts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          platform: z.enum(["facebook", "twitter", "instagram"]),
          accountName: z.string(),
          accessToken: z.string(),
          refreshToken: z.string().optional(),
          expiresAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createSocialAccount } = await import("./db");
        const { randomUUID } = await import("crypto");

        return createSocialAccount({
          id: randomUUID(),
          userId: ctx.user.id,
          platform: input.platform,
          accountName: input.accountName,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresAt: input.expiresAt,
          isActive: "yes",
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteSocialAccount } = await import("./db");
        await deleteSocialAccount(input.id);
        return { success: true };
      }),
  }),

  // Scheduled posts router
  scheduledPosts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserScheduledPosts } = await import("./db");
      return getUserScheduledPosts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          keyword: z.string(),
          platforms: z.array(z.enum(["facebook", "twitter", "instagram"])),
          scheduledTime: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createScheduledPost, createArticle } = await import("./db");
        const { generateContentWithOpenAI } = await import("./openai");
        const { randomUUID } = await import("crypto");

        // 生成文章
        const generated = await generateContentWithOpenAI(input.keyword);
        const article = await createArticle({
          id: randomUUID(),
          keyword: input.keyword,
          title: generated.title,
          content: generated.content,
          imageUrl: generated.imageUrl,
          status: "draft",
          userId: ctx.user.id,
        });

        // 建立排程任務
        const scheduledPost = await createScheduledPost({
          id: randomUUID(),
          userId: ctx.user.id,
          articleId: article.id,
          keyword: input.keyword,
          platforms: JSON.stringify(input.platforms),
          scheduledTime: input.scheduledTime,
          status: "pending",
        });

        return { scheduledPost, article };
      }),
  }),
});

export type AppRouter = typeof appRouter;
