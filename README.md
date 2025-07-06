# 管理系統 (Management System)

一個現代化的文件管理和團隊協作平台，支援富文本編輯、檔案上傳和 AWS 雲端儲存。

## 功能特色

### 📝 富文本編輯器

- **完整的文字格式化工具**：粗體、斜體、底線、刪除線
- **文字對齊選項**：左對齊、置中、右對齊、兩端對齊
- **清單功能**：有序清單和無序清單
- **插入功能**：連結、圖片、表格、程式碼區塊、引用
- **快捷鍵支援**：Ctrl+B (粗體)、Ctrl+I (斜體)、Ctrl+U (底線)
- **自動儲存**：每 30 秒自動儲存文件內容
- **深色模式支援**：完整的深色主題

### 📁 檔案管理

- **拖拽上傳**：支援拖拽檔案到上傳區域
- **多種檔案格式**：圖片 (JPEG, PNG, GIF, WebP)、文件 (PDF, DOC, DOCX)、試算表 (XLS, XLSX)、簡報 (PPT, PPTX)
- **檔案大小限制**：最大 50MB
- **安全驗證**：檔案類型驗證和用戶身份驗證
- **AWS S3 儲存**：檔案安全儲存在 AWS S3

### 🗂️ 目錄結構

- **樹狀目錄**：支援多層級資料夾結構
- **拖拽操作**：拖拽檔案到不同資料夾
- **搜尋功能**：快速搜尋文件和資料夾
- **權限管理**：基於用戶的存取控制

### 👥 團隊協作

- **用戶管理**：邀請和移除團隊成員
- **活動追蹤**：記錄用戶操作和文件變更
- **通知系統**：即時通知和提醒

## 技術架構

### 前端技術

- **React 19**：現代化的 React 框架
- **Next.js**：全端 React 框架
- **TypeScript**：型別安全的 JavaScript
- **Tailwind CSS**：實用優先的 CSS 框架
- **React Quill**：功能強大的富文本編輯器
- **Lucide React**：現代化的圖標庫

### 後端服務

- **AWS Cognito**：用戶身份驗證
- **AWS DynamoDB**：NoSQL 資料庫
- **AWS S3**：檔案儲存服務
- **Next.js API Routes**：後端 API 端點

### 開發工具

- **ESLint**：程式碼品質檢查
- **Prettier**：程式碼格式化
- **TypeScript**：靜態型別檢查

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境設定

複製 `.env.example` 到 `.env.local` 並填入您的 AWS 設定：

```env
# AWS 區域
AWS_REGION=ap-southeast-1
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-1

# Cognito 設定
COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id

# DynamoDB 表名
DOCUMENT_TABLE_NAME=metaage-management-system-document
DIRECTORY_TABLE_NAME=metaage-management-system-directory

# S3 Bucket
DOCUMENTS_BUCKET_NAME=your-documents-bucket

# AWS 憑證 (本地開發)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**AWS 服務設定：**

請參考 [AWS 設定指南](docs/aws-setup.md) 完成完整的 AWS 服務設定，包括：

1. DynamoDB 表建立
2. S3 Bucket 設定
3. Cognito 用戶池配置
4. IAM 權限設定

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 使用指南

### 富文本編輯器

#### 基本操作

1. **文字格式化**：選取文字後點擊工具列按鈕或使用快捷鍵
2. **插入內容**：點擊工具列中的插入按鈕（圖片、表格、連結等）
3. **自動儲存**：編輯內容會自動儲存，無需手動儲存

#### 快捷鍵

- `Ctrl + B`：粗體
- `Ctrl + I`：斜體
- `Ctrl + U`：底線
- `Ctrl + S`：儲存文件

#### 插入功能

- **圖片**：點擊圖片按鈕，選擇本地檔案或輸入 URL
- **表格**：點擊表格按鈕，輸入行數和列數
- **連結**：點擊連結按鈕，輸入 URL
- **程式碼區塊**：點擊程式碼按鈕插入程式碼
- **引用**：點擊引用按鈕插入引用區塊

### 檔案上傳

#### 支援的檔案類型

- **圖片**：JPEG, PNG, GIF, WebP
- **文件**：PDF, TXT, DOC, DOCX
- **試算表**：XLS, XLSX
- **簡報**：PPT, PPTX

#### 上傳方式

1. **拖拽上傳**：直接拖拽檔案到上傳區域
2. **點擊選擇**：點擊「選擇檔案」按鈕選擇檔案
3. **批量上傳**：支援一次選擇多個檔案

#### 檔案管理

- **檔案大小限制**：最大 50MB
- **自動驗證**：檔案類型和大小自動驗證
- **安全儲存**：檔案儲存在 AWS S3，支援公開存取

### 目錄管理

#### 創建資料夾

1. 在側邊欄點擊「新增資料夾」按鈕
2. 輸入資料夾名稱
3. 選擇父資料夾（可選）

#### 移動檔案

1. 在檔案列表中選擇檔案
2. 拖拽到目標資料夾
3. 或使用「移動到」功能

#### 搜尋檔案

1. 在頂部搜尋欄輸入關鍵字
2. 支援按檔案名、內容、作者搜尋
3. 使用篩選器縮小搜尋範圍

## 部署

### Vercel 部署

1. 將程式碼推送到 GitHub
2. 在 Vercel 中連接 GitHub 倉庫
3. 設定環境變數
4. 部署應用程式

### 環境變數設定

在 Vercel 中設定以下環境變數：

```env
AWS_REGION=ap-southeast-1
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-1
COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
DOCUMENT_TABLE_NAME=metaage-management-system-document
DIRECTORY_TABLE_NAME=metaage-management-system-directory
DOCUMENTS_BUCKET_NAME=your-documents-bucket
```

## 開發指南

### 專案結構

```
src/
├── auth/              # 身份驗證相關
├── components/        # React 組件
│   ├── modals/       # 彈出視窗組件
│   ├── FileEditor.tsx    # 文件編輯器
│   ├── RichTextEditor.tsx # 富文本編輯器
│   └── FileUpload.tsx    # 檔案上傳組件
├── lib/              # 工具函數和 API
│   ├── api/          # API 客戶端
│   └── hooks/        # 自定義 Hooks
├── pages/            # Next.js 頁面
│   └── api/          # API 端點
└── types/            # TypeScript 型別定義
```

### 新增功能

#### 新增富文本編輯器功能

1. 在 `RichTextEditor.tsx` 中添加新的工具按鈕
2. 實作對應的處理函數
3. 更新 Quill 編輯器的 modules 和 formats

#### 新增檔案類型支援

1. 在 `upload-file.ts` 中更新 `allowedTypes` 陣列
2. 在 `FileUpload.tsx` 中更新檔案類型驗證
3. 測試新檔案類型的上傳功能

### 程式碼規範

- 使用 TypeScript 進行型別檢查
- 遵循 ESLint 規則
- 使用 Prettier 格式化程式碼
- 撰寫清晰的註解和文件

## 故障排除

### 常見問題

1. **富文本編輯器無法載入**

   - 檢查 React Quill 是否正確安裝
   - 確認 CSS 檔案是否正確引入

2. **檔案上傳失敗**

   - 檢查 AWS S3 設定
   - 確認檔案大小和類型限制
   - 檢查網路連線

3. **身份驗證錯誤**
   - 檢查 Cognito 設定
   - 確認環境變數是否正確
   - 檢查 JWT 令牌是否過期

### 除錯工具

- **瀏覽器開發者工具**：檢查網路請求和錯誤訊息
- **AWS CloudWatch**：查看服務日誌
- **DynamoDB Console**：檢查資料庫記錄

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 支援

如果您遇到問題或有建議，請：

1. 查看 [故障排除](#故障排除) 章節
2. 搜尋現有的 [Issues](../../issues)
3. 創建新的 Issue 並提供詳細資訊

## 更新日誌

### v1.0.0 (2024-03-20)

- ✨ 新增富文本編輯器功能
- ✨ 新增檔案上傳功能
- ✨ 整合 AWS S3 儲存
- ✨ 完整的目錄管理系統
- ✨ 用戶身份驗證
- ✨ 深色模式支援
