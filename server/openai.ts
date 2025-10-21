import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";

export interface GeneratedContent {
  title: string;
  content: string;
  imageUrl: string;
}

/**
 * 使用 OpenAI API 根據關鍵字生成文章和圖片
 * @param keyword 關鍵字
 * @param openaiApiKey 使用者提供的 OpenAI API Key（可選）
 * @returns 生成的文章標題、內容和圖片 URL
 */
export async function generateContentWithOpenAI(
  keyword: string,
  openaiApiKey?: string
): Promise<GeneratedContent> {
  try {
    // 第一步：使用 OpenAI 搜尋網路資料並生成文章
    const articleResponse = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `你是一位專業的內容創作者。請根據使用者提供的關鍵字，搜尋相關的網路資料，並撰寫一篇約 500 字的文章。
文章應該：
1. 包含吸引人的標題
2. 內容豐富且具有價值
3. 結構清晰，分段合理
4. 語氣專業但易於理解

請以 JSON 格式回傳，包含 title（標題）和 content（內容）兩個欄位。`,
        },
        {
          role: "user",
          content: `關鍵字：${keyword}\n\n請搜尋相關資料並撰寫文章。`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "article_generation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "文章標題",
              },
              content: {
                type: "string",
                description: "文章內容，約 500 字",
              },
            },
            required: ["title", "content"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = articleResponse.choices[0].message.content;
    if (!messageContent || typeof messageContent !== "string") {
      throw new Error("Invalid response from OpenAI");
    }
    const articleData = JSON.parse(messageContent);

    // 第二步：根據文章標題生成配圖
    const imagePrompt = `Create a professional, high-quality image for an article titled: "${articleData.title}". The image should be visually appealing, relevant to the topic, and suitable for social media sharing.`;

    const imageResult = await generateImage({
      prompt: imagePrompt,
    });

    if (!imageResult.url) {
      throw new Error("Failed to generate image");
    }

    return {
      title: articleData.title,
      content: articleData.content,
      imageUrl: imageResult.url,
    };
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw new Error(
      `Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

