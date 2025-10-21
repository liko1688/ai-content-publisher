import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 文章內容表
export const articles = mysqlTable("articles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  keyword: text("keyword").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["draft", "published", "failed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  publishedAt: timestamp("publishedAt"),
  userId: varchar("userId", { length: 64 }).notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// 社群媒體帳號配置表
export const socialAccounts = mysqlTable("socialAccounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", ["facebook", "twitter", "instagram"]).notNull(),
  accountName: text("accountName").notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

// 排程任務表
export const scheduledPosts = mysqlTable("scheduledPosts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  articleId: varchar("articleId", { length: 64 }).notNull(),
  keyword: text("keyword").notNull(),
  platforms: text("platforms").notNull(), // JSON array: ["facebook", "twitter"]
  scheduledTime: timestamp("scheduledTime").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow(),
  executedAt: timestamp("executedAt"),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

// 發文記錄表
export const postLogs = mysqlTable("postLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  scheduledPostId: varchar("scheduledPostId", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", ["facebook", "twitter", "instagram"]).notNull(),
  postId: text("postId"),
  status: mysqlEnum("status", ["success", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PostLog = typeof postLogs.$inferSelect;
export type InsertPostLog = typeof postLogs.$inferInsert;
