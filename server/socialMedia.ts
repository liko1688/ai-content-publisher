/**
 * 社群媒體發文模組
 * 支援 Facebook、Twitter、Instagram 自動發文
 */

export interface PostContent {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * 發文到 Facebook
 * @param accessToken Facebook Access Token
 * @param content 發文內容
 * @returns 發文結果
 */
export async function postToFacebook(
  accessToken: string,
  content: PostContent
): Promise<PostResult> {
  try {
    // Facebook Graph API 發文
    // 參考文件：https://developers.facebook.com/docs/graph-api/reference/v18.0/page/feed
    
    const pageId = await getFacebookPageId(accessToken);
    
    const formData = new URLSearchParams();
    formData.append("message", `${content.title}\n\n${content.content}`);
    formData.append("access_token", accessToken);
    
    if (content.imageUrl) {
      formData.append("url", content.imageUrl);
    }

    const endpoint = content.imageUrl
      ? `https://graph.facebook.com/v18.0/${pageId}/photos`
      : `https://graph.facebook.com/v18.0/${pageId}/feed`;

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Facebook API error");
    }

    return {
      success: true,
      postId: data.id || data.post_id,
    };
  } catch (error) {
    console.error("Error posting to Facebook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 獲取 Facebook Page ID
 */
async function getFacebookPageId(accessToken: string): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  const data = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error("No Facebook pages found for this account");
  }
  
  return data.data[0].id;
}

/**
 * 發文到 Twitter (X)
 * @param accessToken Twitter Access Token
 * @param content 發文內容
 * @returns 發文結果
 */
export async function postToTwitter(
  accessToken: string,
  content: PostContent
): Promise<PostResult> {
  try {
    // Twitter API v2 發文
    // 參考文件：https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
    
    const tweetText = `${content.title}\n\n${content.content.substring(0, 200)}...`;
    
    let mediaId: string | undefined;
    
    // 如果有圖片，先上傳圖片
    if (content.imageUrl) {
      mediaId = await uploadTwitterMedia(accessToken, content.imageUrl);
    }

    const requestBody: any = {
      text: tweetText,
    };

    if (mediaId) {
      requestBody.media = {
        media_ids: [mediaId],
      };
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.title || "Twitter API error");
    }

    return {
      success: true,
      postId: data.data?.id,
    };
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 上傳圖片到 Twitter
 */
async function uploadTwitterMedia(
  accessToken: string,
  imageUrl: string
): Promise<string> {
  // 下載圖片
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString("base64");

  // 上傳到 Twitter
  const response = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `media_data=${encodeURIComponent(base64Image)}`,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to upload media to Twitter");
  }

  return data.media_id_string;
}

/**
 * 發文到 Instagram
 * @param accessToken Instagram Access Token
 * @param content 發文內容
 * @returns 發文結果
 */
export async function postToInstagram(
  accessToken: string,
  content: PostContent
): Promise<PostResult> {
  try {
    // Instagram Graph API 發文
    // 參考文件：https://developers.facebook.com/docs/instagram-api/guides/content-publishing
    
    if (!content.imageUrl) {
      throw new Error("Instagram posts require an image");
    }

    // 獲取 Instagram Business Account ID
    const igAccountId = await getInstagramAccountId(accessToken);

    // 第一步：建立媒體容器
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          image_url: content.imageUrl,
          caption: `${content.title}\n\n${content.content}`,
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      throw new Error(containerData.error?.message || "Failed to create media container");
    }

    const creationId = containerData.id;

    // 第二步：發布媒體
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new Error(publishData.error?.message || "Failed to publish media");
    }

    return {
      success: true,
      postId: publishData.id,
    };
  } catch (error) {
    console.error("Error posting to Instagram:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 獲取 Instagram Business Account ID
 */
async function getInstagramAccountId(accessToken: string): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error("No Facebook pages found");
  }

  const pageId = data.data[0].id;

  // 獲取關聯的 Instagram 帳號
  const igResponse = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );
  const igData = await igResponse.json();

  if (!igData.instagram_business_account) {
    throw new Error("No Instagram business account linked to this Facebook page");
  }

  return igData.instagram_business_account.id;
}

/**
 * 根據平台發文
 */
export async function postToSocialMedia(
  platform: "facebook" | "twitter" | "instagram",
  accessToken: string,
  content: PostContent
): Promise<PostResult> {
  switch (platform) {
    case "facebook":
      return postToFacebook(accessToken, content);
    case "twitter":
      return postToTwitter(accessToken, content);
    case "instagram":
      return postToInstagram(accessToken, content);
    default:
      return {
        success: false,
        error: `Unsupported platform: ${platform}`,
      };
  }
}

