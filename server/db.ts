import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
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
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
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

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { articles, Article, InsertArticle, socialAccounts, SocialAccount, InsertSocialAccount, scheduledPosts, ScheduledPost, InsertScheduledPost, postLogs, PostLog, InsertPostLog } from "../drizzle/schema";
import { desc } from "drizzle-orm";

// ========== Articles ==========
export async function createArticle(article: InsertArticle): Promise<Article> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(articles).values(article);
  const result = await db.select().from(articles).where(eq(articles.id, article.id!)).limit(1);
  return result[0];
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0];
}

export async function getUserArticles(userId: string): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(articles).where(eq(articles.userId, userId)).orderBy(desc(articles.createdAt));
}

export async function updateArticle(id: string, updates: Partial<InsertArticle>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(articles).set(updates).where(eq(articles.id, id));
}

// ========== Social Accounts ==========
export async function createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(socialAccounts).values(account);
  const result = await db.select().from(socialAccounts).where(eq(socialAccounts.id, account.id!)).limit(1);
  return result[0];
}

export async function getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId)).orderBy(desc(socialAccounts.createdAt));
}

export async function updateSocialAccount(id: string, updates: Partial<InsertSocialAccount>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(socialAccounts).set(updates).where(eq(socialAccounts.id, id));
}

export async function deleteSocialAccount(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
}

// ========== Scheduled Posts ==========
export async function createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(scheduledPosts).values(post);
  const result = await db.select().from(scheduledPosts).where(eq(scheduledPosts.id, post.id!)).limit(1);
  return result[0];
}

export async function getUserScheduledPosts(userId: string): Promise<ScheduledPost[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scheduledPosts).where(eq(scheduledPosts.userId, userId)).orderBy(desc(scheduledPosts.createdAt));
}

export async function getPendingScheduledPosts(): Promise<ScheduledPost[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scheduledPosts).where(eq(scheduledPosts.status, "pending"));
}

export async function updateScheduledPost(id: string, updates: Partial<InsertScheduledPost>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(scheduledPosts).set(updates).where(eq(scheduledPosts.id, id));
}

// ========== Post Logs ==========
export async function createPostLog(log: InsertPostLog): Promise<PostLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(postLogs).values(log);
  const result = await db.select().from(postLogs).where(eq(postLogs.id, log.id!)).limit(1);
  return result[0];
}

export async function getPostLogsByScheduledPostId(scheduledPostId: string): Promise<PostLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(postLogs).where(eq(postLogs.scheduledPostId, scheduledPostId));
}
