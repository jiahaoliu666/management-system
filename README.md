# MetaAge 管理系統

一個基於 Next.js、React 和 AWS 的現代化文件管理系統，支援文件編輯、版本控制和團隊協作。

## 功能特色

- 🔐 **AWS Cognito 認證** - 安全的用戶認證和授權
- 📁 **文件管理** - 支援文件創建、編輯、分類和標籤
- 🔄 **自動儲存** - 智能自動儲存功能，防止資料遺失
- 📊 **版本控制** - 文件版本歷史和回滾功能
- 👥 **團隊協作** - 用戶管理和權限控制
- 🌙 **深色模式** - 支援淺色和深色主題
- 📱 **響應式設計** - 適配各種設備尺寸

## 技術架構

### 前端技術

- **Next.js 15** - React 框架
- **React 19** - 用戶介面庫
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Lucide React** - 圖標庫

### 後端服務

- **AWS DynamoDB** - 資料儲存
  - `metaage-management-system-directory` - 目錄結構
  - `metaage-management-system-document` - 文件內容
- **AWS S3** - 文件內容儲存
- **AWS Cognito** - 用戶認證
- **Next.js API Routes** - 後端 API

## 快速開始

### 1. 環境設定

複製環境變數範例文件：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，填入您的 AWS 配置：

```env
# AWS 設定
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB 表格名稱
DIRECTORY_TABLE_NAME=metaage-management-system-directory
DOCUMENT_TABLE_NAME=metaage-management-system-document

# S3
DOCUMENTS_BUCKET_NAME=your-documents-bucket
AVATAR_BUCKET_NAME=your-avatar-bucket

# Cognito
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
COGNITO_REGION=ap-southeast-1
COGNITO_IDENTITY_POOL_ID=your-identity-pool-id
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## AWS 設定

詳細的 AWS 設定說明請參考 [AWS 設定指南](docs/aws-setup.md)。

### 必要服務

1. **DynamoDB 表格**

   - `metaage-management-system-directory` - 儲存目錄結構
   - `metaage-management-system-document` - 儲存文件元資料

2. **S3 儲存桶**

   - 用於儲存文件內容

3. **Cognito 用戶池**

   - 用戶認證和授權

4. **IAM 角色和權限**
   - 應用程式存取 AWS 服務的權限

## 專案結構

```
src/
├── auth/                 # 認證相關
│   ├── AuthContext.tsx   # 認證上下文
│   └── ProtectedRoute.tsx # 路由保護
├── components/           # React 組件
│   ├── FileEditor.tsx    # 文件編輯器
│   ├── FileVersionHistory.tsx # 版本歷史
│   ├── modals/          # 模態框組件
│   └── ...
├── lib/                  # 工具庫
│   ├── api/             # API 客戶端
│   ├── hooks/           # 自定義 Hooks
│   └── config/          # 配置
├── pages/               # Next.js 頁面
│   ├── api/            # API 路由
│   └── ...
└── types/               # TypeScript 類型定義
```

## 資料模型

### 目錄表格 (metaage-management-system-directory)

```json
{
  "PK": "dir#folder-id",
  "SK": "dir#folder-id",
  "name": "資料夾名稱",
  "parentId": "parent-folder-id",
  "type": "folder",
  "createdBy": "user-id",
  "createdAt": "2024-03-20T10:30:00Z",
  "updatedAt": "2024-03-20T10:30:00Z"
}
```

### 文件表格 (metaage-management-system-document)

```json
{
  "PK": "file#file-id",
  "SK": "file#file-id",
  "name": "文件名稱",
  "parentId": "folder-id",
  "s3Key": "documents/file-id.json",
  "fileType": "document",
  "type": "file",
  "createdBy": "user-id",
  "createdAt": "2024-03-20T10:30:00Z",
  "updatedAt": "2024-03-20T10:30:00Z"
}
```

## 開發指南

### 新增功能

1. 在 `src/components/` 中創建新的 React 組件
2. 在 `src/lib/hooks/` 中創建自定義 Hooks
3. 在 `src/pages/api/` 中創建 API 路由
4. 更新 `src/types/` 中的類型定義

### 測試

```bash
# 執行 lint 檢查
npm run lint

# 建置專案
npm run build
```

## 部署

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 Vercel 中連接 GitHub 倉庫
3. 設定環境變數
4. 部署

### 其他平台

專案支援部署到任何支援 Next.js 的平台，如：

- AWS Amplify
- Netlify
- Railway
- 自建伺服器

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 授權

MIT License
