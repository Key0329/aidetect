# AI Detect 工具集

使用最新的 AI 技術提供智能檢測和搜尋服務的工具集，整合多種 AI 模型為您提供準確可靠的分析結果。

## 功能特色

### 🔍 Perplexity AI 搜尋

- 使用 Perplexity AI 進行智能搜尋
- 支援多種 AI 模型選擇（Sonar、Sonar Pro、Sonar Reasoning 等）
- 提供引用來源和相關搜尋結果
- 即時回應和詳細的使用統計

### 📄 AI 履歷檢測

- 智能分析履歷內容
- 檢測 AI 生成痕跡
- 提供詳細的分析報告和改善建議

### 💼 商務卡片展示

- 專業的商務卡片展示功能
- 企業級的視覺效果和互動體驗

## 技術架構

- **Nuxt 3** - 現代化的全端 Vue.js 框架
- **TypeScript** - 類型安全的開發體驗
- **UnoCSS** - 原子化 CSS 框架
- **Perplexity AI** - 先進的搜尋和推理能力
- **SASS** - CSS 預處理器

## 安裝與設定

### 前置需求

- Node.js 18+
- pnpm（推薦）或 npm

### 1. 安裝依賴

```bash
# 使用 pnpm（推薦）
pnpm install

# 或使用 npm
npm install
```

### 2. 環境變數設定

創建 `.env` 檔案並設定 Perplexity API Key：

```bash
# 從 https://www.perplexity.ai/settings/api 獲取您的 API Key
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

#### 如何獲取 Perplexity API Key：

1. 前往 [Perplexity API 設定頁面](https://www.perplexity.ai/settings/api)
2. 登入您的 Perplexity 帳戶
3. 創建新的 API Key
4. 複製 API Key 並設定到環境變數中

### 3. 啟動開發伺服器

```bash
pnpm dev
```

開發伺服器將在 `http://localhost:3000` 啟動

## 使用方式

### Perplexity AI 搜尋

1. 訪問首頁 `http://localhost:3000`
2. 點擊「Perplexity AI 搜尋」卡片
3. 選擇合適的 AI 模型
4. 輸入您的搜尋查詢
5. 點擊「搜尋」按鈕或按 Enter 鍵
6. 查看 AI 回應、引用來源和相關搜尋結果

### 可用的 AI 模型

- **Sonar** - 標準搜尋模型，平衡速度和品質
- **Sonar Pro** - 進階搜尋模型，更高的準確性
- **Sonar Reasoning** - 具備推理能力的搜尋模型
- **Sonar Reasoning Pro** - 最先進的推理搜尋模型

## API 端點

### POST `/api/perplexity/search`

使用 Perplexity AI 進行搜尋

**請求參數：**

```json
{
  "query": "您的搜尋查詢",
  "model": "sonar" // 可選：sonar, sonar-pro, sonar-reasoning, sonar-reasoning-pro
}
```

**回應格式：**

```json
{
  "id": "request_id",
  "model": "sonar",
  "created": 1234567890,
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 100,
    "total_tokens": 110
  },
  "citations": ["https://example.com"],
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "AI 回應內容"
      }
    }
  ],
  "search_results": [
    {
      "title": "相關結果標題",
      "url": "https://example.com",
      "date": "2024-01-01"
    }
  ]
}
```

## 建置與部署

### 建置生產版本

```bash
pnpm build
```

### 預覽生產版本

```bash
pnpm preview
```

### 產生靜態網站

```bash
pnpm generate
```

## 開發指令

```bash
# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build

# 預覽生產版本
pnpm preview

# 產生靜態網站
pnpm generate

# 安裝依賴
pnpm install

# Nuxt 後安裝設定
pnpm postinstall
```

## 專案結構

```
aidetect/
├── assets/                 # 靜態資源
│   ├── images/             # 圖片資源
│   └── styles/             # 全域樣式
├── pages/                  # 頁面路由
│   ├── index.vue          # 首頁
│   ├── perplexity-search.vue  # Perplexity 搜尋頁面
│   ├── ai-resume-detect.vue   # AI 履歷檢測頁面
│   └── bc.vue             # 商務卡片頁面
├── server/                # 伺服器端代碼
│   └── api/               # API 端點
│       └── perplexity/    # Perplexity API 相關
├── public/                # 公共靜態檔案
├── nuxt.config.ts         # Nuxt 設定
├── uno.config.ts          # UnoCSS 設定
└── package.json           # 專案依賴設定
```

## 環境需求

- Node.js 18.0.0 或更高版本
- 有效的 Perplexity API Key
- 現代化的瀏覽器（支援 ES2020+）

## 授權

此專案為私人開發項目。

## 支援

如有問題或建議，請聯繫開發團隊。

---

**注意：** 使用 Perplexity API 需要有效的 API Key，請確保已正確設定環境變數。API 使用可能產生費用，請參考 Perplexity 的定價方案。
