# AI 內容自動發佈系統

一個連接 OpenAI API 的內容自動發佈系統，可指定關鍵字自動搜尋網路資料，產出 500 字文章及搭配圖片，並依設定時間自動發文到 Facebook、Twitter、Instagram 等社群媒體平台。

## 功能特色

- **AI 文章生成**：輸入關鍵字，使用 OpenAI API 自動搜尋網路資料並生成約 500 字的專業文章
- **AI 圖片生成**：根據文章標題自動生成配圖
- **多平台發布**：支援 Facebook、Twitter (X)、Instagram 自動發文
- **排程發文**：設定關鍵字、平台和時間，系統自動執行
- **帳號管理**：管理多個社群媒體帳號
- **發文記錄**：追蹤所有發文狀態和結果

## 技術架構

### 前端
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** 組件庫
- **tRPC** 端到端類型安全 API
- **Wouter** 路由管理

### 後端
- **Express 4** + **Node.js**
- **tRPC 11** API 框架
- **Drizzle ORM** + **MySQL** 資料庫
- **OpenAI API** 文章和圖片生成
- **排程系統** 自動執行發文任務

### 部署
- **Vercel** 自動部署
- **GitHub** 版本控制

## 快速開始

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 設定環境變數

需要設定以下環境變數（在 Vercel 部署時配置）：

```env
# 資料庫
DATABASE_URL=your_mysql_connection_string

# OpenAI API（可選，系統已內建）
OPENAI_API_KEY=your_openai_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret

# OAuth 設定（Manus 平台自動注入）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=oauth_server_url
VITE_OAUTH_PORTAL_URL=oauth_portal_url
```

### 3. 推送資料庫 Schema

```bash
pnpm db:push
```

### 4. 啟動開發伺服器

```bash
pnpm dev
```

訪問 `http://localhost:3000` 開始使用。

## 使用指南

### 1. 文章生成

1. 在「文章生成」頁面輸入關鍵字
2. 點擊「生成文章」按鈕
3. AI 將自動搜尋資料並生成文章和配圖
4. 生成的文章會顯示在「我的文章」列表中

### 2. 設定社群媒體帳號

1. 前往「社群帳號」頁面
2. 點擊「新增帳號」
3. 選擇平台（Facebook / Twitter / Instagram）
4. 輸入帳號名稱和 Access Token
5. 參考官方文件取得 Access Token：
   - **Facebook**: [Facebook Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
   - **Twitter**: [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
   - **Instagram**: [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started)

### 3. 建立排程任務

1. 前往「排程管理」頁面
2. 點擊「新增排程」
3. 輸入關鍵字
4. 選擇要發布的平台（可多選）
5. 設定排程時間
6. 系統將在指定時間自動生成文章並發布

### 4. 排程系統運作方式

- 排程器每分鐘檢查一次待執行的任務
- 到達排程時間時，系統會：
  1. 使用 OpenAI API 生成文章和圖片
  2. 儲存文章到資料庫
  3. 發布到選定的社群媒體平台
  4. 記錄發文結果
- 可在「排程管理」頁面查看所有任務狀態

## 社群媒體 API 設定指引

### Facebook

1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 建立應用程式
3. 新增「Facebook Login」產品
4. 取得 Page Access Token
5. 需要 `pages_manage_posts` 和 `pages_read_engagement` 權限

### Twitter (X)

1. 前往 [Twitter Developer Portal](https://developer.twitter.com/)
2. 建立專案和應用程式
3. 啟用 OAuth 2.0
4. 取得 Bearer Token
5. 需要 `tweet.write` 和 `tweet.read` 權限

### Instagram

1. 需要 Instagram Business Account
2. 連結到 Facebook Page
3. 使用 Facebook Graph API
4. 取得 Instagram Business Account ID
5. 需要 `instagram_basic` 和 `instagram_content_publish` 權限

## 資料庫結構

### users
使用者資料表

### articles
文章內容表，儲存生成的文章和圖片

### socialAccounts
社群媒體帳號配置表

### scheduledPosts
排程任務表，儲存待執行的發文任務

### postLogs
發文記錄表，追蹤每次發文的結果

## 部署到 Vercel

### 方法一：透過 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 方法二：透過 GitHub 整合

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Import Project"
3. 選擇此 GitHub repository
4. 設定環境變數
5. 點擊 "Deploy"

### 環境變數設定

在 Vercel 專案設定中新增以下環境變數：

- `DATABASE_URL`: MySQL 連接字串
- `JWT_SECRET`: JWT 簽名密鑰
- `OPENAI_API_KEY`: OpenAI API Key（可選）
- 其他 OAuth 相關變數

## 注意事項

1. **OpenAI API 使用**：文章生成和圖片生成會消耗 OpenAI API 配額，請注意使用量
2. **社群媒體限制**：各平台對 API 使用有頻率限制，請參考官方文件
3. **Access Token 安全**：請妥善保管 Access Token，不要提交到版本控制系統
4. **排程時間**：建議設定在非尖峰時段，避免 API 限制
5. **資料庫備份**：定期備份資料庫資料

## 開發指令

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 推送資料庫 Schema
pnpm db:push

# 建置生產版本
pnpm build

# 啟動生產伺服器
pnpm start
```

## 授權

MIT License

## 支援

如有問題或建議，請在 GitHub Issues 中提出。

## GitHub Repository

https://github.com/liko1688/ai-content-publisher

