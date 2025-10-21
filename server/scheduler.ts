/**
 * 排程任務執行器
 * 定時檢查並執行待發布的文章
 */

import {
  getPendingScheduledPosts,
  updateScheduledPost,
  getArticleById,
  getUserSocialAccounts,
  createPostLog,
} from "./db";
import { postToSocialMedia } from "./socialMedia";
import { randomUUID } from "crypto";

/**
 * 執行排程任務
 * 檢查所有待執行的排程，並發布到對應的社群媒體
 */
export async function executeScheduledPosts(): Promise<void> {
  try {
    const pendingPosts = await getPendingScheduledPosts();
    const now = new Date();

    for (const scheduledPost of pendingPosts) {
      // 檢查是否到達排程時間
      if (scheduledPost.scheduledTime && scheduledPost.scheduledTime <= now) {
        await processScheduledPost(scheduledPost.id);
      }
    }
  } catch (error) {
    console.error("Error executing scheduled posts:", error);
  }
}

/**
 * 處理單一排程任務
 */
async function processScheduledPost(scheduledPostId: string): Promise<void> {
  try {
    const db = await import("./db").then((m) => m.getDb());
    if (!db) {
      console.error("Database not available");
      return;
    }

    // 獲取排程任務詳情
    const scheduledPostResult = await db
      .select()
      .from((await import("../drizzle/schema")).scheduledPosts)
      .where(
        (await import("drizzle-orm")).eq(
          (await import("../drizzle/schema")).scheduledPosts.id,
          scheduledPostId
        )
      )
      .limit(1);

    if (scheduledPostResult.length === 0) {
      console.error(`Scheduled post ${scheduledPostId} not found`);
      return;
    }

    const scheduledPost = scheduledPostResult[0];

    // 更新狀態為處理中
    await updateScheduledPost(scheduledPostId, {
      status: "processing",
    });

    // 獲取文章內容
    const article = await getArticleById(scheduledPost.articleId);
    if (!article) {
      await updateScheduledPost(scheduledPostId, {
        status: "failed",
        errorMessage: "Article not found",
      });
      return;
    }

    // 獲取使用者的社群媒體帳號
    const socialAccounts = await getUserSocialAccounts(scheduledPost.userId);

    // 解析要發布的平台
    const platforms = JSON.parse(scheduledPost.platforms) as Array<
      "facebook" | "twitter" | "instagram"
    >;

    let hasError = false;
    const errors: string[] = [];

    // 發布到各個平台
    for (const platform of platforms) {
      const account = socialAccounts.find(
        (acc) => acc.platform === platform && acc.isActive === "yes"
      );

      if (!account) {
        const error = `No active ${platform} account found`;
        errors.push(error);
        hasError = true;

        // 記錄失敗日誌
        await createPostLog({
          id: randomUUID(),
          scheduledPostId: scheduledPostId,
          platform: platform,
          status: "failed",
          errorMessage: error,
        });
        continue;
      }

      // 發布到社群媒體
      const result = await postToSocialMedia(platform, account.accessToken, {
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl || undefined,
      });

      // 記錄發布結果
      await createPostLog({
        id: randomUUID(),
        scheduledPostId: scheduledPostId,
        platform: platform,
        postId: result.postId,
        status: result.success ? "success" : "failed",
        errorMessage: result.error,
      });

      if (!result.success) {
        hasError = true;
        errors.push(`${platform}: ${result.error}`);
      }
    }

    // 更新排程任務狀態
    await updateScheduledPost(scheduledPostId, {
      status: hasError ? "failed" : "completed",
      executedAt: new Date(),
      errorMessage: hasError ? errors.join("; ") : undefined,
    });

    // 如果成功發布，更新文章狀態
    if (!hasError) {
      const { updateArticle } = await import("./db");
      await updateArticle(article.id, {
        status: "published",
        publishedAt: new Date(),
      });
    }
  } catch (error) {
    console.error(`Error processing scheduled post ${scheduledPostId}:`, error);

    // 更新為失敗狀態
    await updateScheduledPost(scheduledPostId, {
      status: "failed",
      errorMessage:
        error instanceof Error ? error.message : "Unknown error occurred",
      executedAt: new Date(),
    });
  }
}

/**
 * 啟動排程器
 * 每分鐘檢查一次待執行的任務
 */
export function startScheduler(): void {
  console.log("[Scheduler] Started - checking every minute");

  // 立即執行一次
  executeScheduledPosts();

  // 每分鐘執行一次
  setInterval(() => {
    executeScheduledPosts();
  }, 60 * 1000); // 60 seconds
}

