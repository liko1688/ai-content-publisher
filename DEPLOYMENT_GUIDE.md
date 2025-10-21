# 部署指引

本文件提供 AI 內容自動發佈系統的完整部署指引。

## 前置準備

### 1. 必要帳號

- **GitHub 帳號**：已完成（代碼已推送到 https://github.com/liko1688/ai-content-publisher）
- **Vercel 帳號**：前往 https://vercel.com 註冊
- **MySQL 資料庫**：可使用以下服務
  - [PlanetScale](https://planetscale.com/)（推薦，免費方案）
  - [Railway](https://railway.app/)
  - [Supabase](https://supabase.com/)
  - 自架 MySQL 伺服器

### 2. 社群媒體開發者帳號（依需求）

- **Facebook Developers**: https://developers.facebook.com/
- **Twitter Developer Portal**: https://developer.twitter.com/
- **Instagram Business Account**: 透過 Facebook 設定

## 部署步驟

### 步驟一：設定資料庫

#### 使用 PlanetScale（推薦）

1. 前往 https://planetscale.com/ 註冊帳號
2. 建立新資料庫
   - 資料庫名稱：`ai-content-publisher`
   - 區域：選擇最近的區域
3. 取得連接字串
   - 點擊 "Connect"
   - 選擇 "Node.js"
   - 複製連接字串（格式：`mysql://...`）

#### 使用其他服務

依照各服務的文件建立 MySQL 資料庫並取得連接字串。

### 步驟二：部署到 Vercel

#### 方法一：透過 Vercel Dashboard（推薦）

1. 前往 https://vercel.com/dashboard
2. 點擊 "Add New..." → "Project"
3. 選擇 "Import Git Repository"
4. 授權 GitHub 並選擇 `ai-content-publisher` repository
5. 設定專案：
   - **Framework Preset**: 選擇 "Other"
   - **Root Directory**: 保持預設（`.`）
   - **Build Command**: `pnpm build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `pnpm install`

6. 設定環境變數（點擊 "Environment Variables"）：

```env
# 必要變數
DATABASE_URL=your_mysql_connection_string
NODE_ENV=production

# JWT Secret（使用隨機字串）
JWT_SECRET=your_random_secret_key_here

# Manus OAuth（如果使用 Manus 平台）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# OpenAI API（可選，系統已內建）
OPENAI_API_KEY=your_openai_api_key
```

7. 點擊 "Deploy" 開始部署

8. 等待部署完成（約 2-3 分鐘）

9. 部署成功後，Vercel 會提供一個網址，例如：
   ```
   https://ai-content-publisher.vercel.app
   ```

#### 方法二：透過 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署專案
cd /home/ubuntu/ai-content-publisher
vercel

# 設定環境變數
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV

# 重新部署以套用環境變數
vercel --prod
```

### 步驟三：推送資料庫 Schema

部署完成後，需要推送資料庫結構：

```bash
# 在本地執行
cd /home/ubuntu/ai-content-publisher
DATABASE_URL="your_mysql_connection_string" pnpm db:push
```

或在 Vercel Dashboard 中：
1. 前往專案設定 → "Settings" → "Environment Variables"
2. 確認 `DATABASE_URL` 已設定
3. 在本地執行 `pnpm db:push`

### 步驟四：驗證部署

1. 訪問 Vercel 提供的網址
2. 應該能看到登入頁面
3. 登入後測試各項功能：
   - 文章生成
   - 社群帳號管理
   - 排程設定

## 設定社群媒體 API

### Facebook

1. **建立 Facebook App**
   - 前往 https://developers.facebook.com/apps/
   - 點擊 "Create App"
   - 選擇 "Business" 類型
   - 填寫應用程式名稱和聯絡信箱

2. **新增產品**
   - 在 Dashboard 中點擊 "Add Product"
   - 選擇 "Facebook Login"
   - 完成設定

3. **取得 Page Access Token**
   - 前往 Graph API Explorer: https://developers.facebook.com/tools/explorer/
   - 選擇你的應用程式
   - 點擊 "Get Token" → "Get Page Access Token"
   - 選擇要管理的粉絲專頁
   - 授予 `pages_manage_posts` 和 `pages_read_engagement` 權限
   - 複製 Access Token

4. **在系統中新增帳號**
   - 登入 AI 內容發佈系統
   - 前往「社群帳號」頁面
   - 選擇 Facebook
   - 貼上 Access Token

### Twitter (X)

1. **申請 Developer Account**
   - 前往 https://developer.twitter.com/
   - 點擊 "Sign up"
   - 填寫申請表單（說明使用目的）

2. **建立 App**
   - 在 Developer Portal 中點擊 "Create Project"
   - 填寫專案資訊
   - 建立 App

3. **設定 OAuth 2.0**
   - 在 App 設定中啟用 OAuth 2.0
   - 設定 Redirect URI
   - 取得 Client ID 和 Client Secret

4. **取得 Bearer Token**
   - 在 "Keys and tokens" 頁面
   - 點擊 "Generate" 取得 Bearer Token
   - 複製 Token

5. **在系統中新增帳號**
   - 登入系統
   - 前往「社群帳號」頁面
   - 選擇 Twitter
   - 貼上 Bearer Token

### Instagram

1. **設定 Instagram Business Account**
   - 將 Instagram 帳號轉換為 Business Account
   - 連結到 Facebook 粉絲專頁

2. **使用 Facebook Graph API**
   - Instagram 發文使用 Facebook Graph API
   - 需要先設定 Facebook App（參考上方 Facebook 設定）

3. **取得 Instagram Business Account ID**
   - 使用 Graph API Explorer
   - 查詢：`me/accounts?fields=instagram_business_account`
   - 複製 Instagram Business Account ID

4. **在系統中新增帳號**
   - 登入系統
   - 前往「社群帳號」頁面
   - 選擇 Instagram
   - 貼上 Access Token（與 Facebook 相同）

## 環境變數說明

### 必要變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `DATABASE_URL` | MySQL 連接字串 | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | JWT 簽名密鑰 | 隨機字串（至少 32 字元） |
| `NODE_ENV` | 執行環境 | `production` |

### OAuth 變數（使用 Manus 平台）

| 變數名稱 | 說明 |
|---------|------|
| `VITE_APP_ID` | Manus App ID |
| `OAUTH_SERVER_URL` | OAuth 伺服器網址 |
| `VITE_OAUTH_PORTAL_URL` | OAuth 登入頁面網址 |
| `OWNER_OPEN_ID` | 擁有者 Open ID |
| `OWNER_NAME` | 擁有者名稱 |

### 可選變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `OPENAI_API_KEY` | OpenAI API Key | 系統內建 |
| `PORT` | 伺服器埠號 | `3000` |

## 常見問題

### Q1: 部署後無法連接資料庫

**解決方法**：
1. 檢查 `DATABASE_URL` 是否正確設定
2. 確認資料庫允許外部連接
3. 檢查資料庫防火牆設定
4. 確認已執行 `pnpm db:push`

### Q2: OpenAI API 錯誤

**解決方法**：
1. 檢查 API Key 是否有效
2. 確認 OpenAI 帳號有足夠的配額
3. 查看 Vercel 部署日誌中的錯誤訊息

### Q3: 社群媒體發文失敗

**解決方法**：
1. 檢查 Access Token 是否過期
2. 確認 Token 有足夠的權限
3. 查看「排程管理」頁面的錯誤訊息
4. 參考各平台的 API 文件

### Q4: 排程任務沒有執行

**解決方法**：
1. 確認排程時間設定正確（使用 UTC 時間）
2. 檢查伺服器日誌
3. 確認排程器已啟動（查看伺服器啟動日誌）
4. 在 Vercel 中，排程器可能因為 Serverless 限制而無法持續運行，建議使用 Vercel Cron Jobs

### Q5: 如何設定 Vercel Cron Jobs

Vercel 的 Serverless 環境不支援持續運行的排程器。建議使用以下方案：

**方案一：使用 Vercel Cron Jobs**

1. 建立 `vercel.json`：
```json
{
  "crons": [{
    "path": "/api/cron/execute-scheduled-posts",
    "schedule": "* * * * *"
  }]
}
```

2. 建立 API 端點 `server/api/cron/execute-scheduled-posts.ts`

**方案二：使用外部 Cron 服務**
- [Cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)

設定每分鐘呼叫：`https://your-app.vercel.app/api/cron/execute-scheduled-posts`

## 監控和維護

### 查看部署日誌

1. 前往 Vercel Dashboard
2. 選擇專案
3. 點擊 "Deployments"
4. 選擇部署記錄
5. 查看 "Runtime Logs"

### 更新代碼

```bash
# 在本地修改代碼後
git add .
git commit -m "Update: description"
git push github master

# Vercel 會自動偵測並重新部署
```

### 資料庫備份

定期備份資料庫資料：

```bash
# 使用 mysqldump
mysqldump -h host -u user -p database > backup.sql

# 或使用資料庫服務提供的備份功能
```

## 安全建議

1. **保護 Access Token**
   - 不要將 Token 提交到版本控制
   - 定期更換 Token
   - 使用環境變數儲存

2. **資料庫安全**
   - 使用強密碼
   - 限制連接來源
   - 定期備份

3. **API 限制**
   - 監控 API 使用量
   - 設定合理的排程間隔
   - 避免過度使用

4. **環境變數**
   - 在 Vercel 中設定，不要硬編碼
   - 使用不同的值區分開發和生產環境

## 效能優化

1. **資料庫索引**
   - 為常用查詢欄位建立索引
   - 定期清理舊資料

2. **快取策略**
   - 使用 Redis 快取常用資料
   - 設定適當的 CDN

3. **圖片優化**
   - 壓縮生成的圖片
   - 使用 CDN 加速

## 支援

如有問題，請：
1. 查看 [README.md](./README.md)
2. 在 GitHub Issues 提問
3. 查看 Vercel 和各 API 平台的官方文件

## 相關連結

- **GitHub Repository**: https://github.com/liko1688/ai-content-publisher
- **Vercel 文件**: https://vercel.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api
- **Twitter API**: https://developer.twitter.com/en/docs
- **Instagram API**: https://developers.facebook.com/docs/instagram-api

