# 管理系統

這是一個基於 Next.js 和 AWS Cognito 的現代化管理系統，提供文件管理、團隊協作等功能。

## 功能特色

### 身份驗證
- 基於 AWS Cognito 的用戶認證
- 支援首次登入密碼設定
- 安全的會話管理

### 團隊管理
- 邀請新成員加入團隊
- 自動記錄成員加入日期（使用 birthdate 屬性）
- 成員狀態管理（啟用、停用、待驗證等）
- 安全的成員刪除功能

### 文件管理
- 文件上傳和管理
- 分類和標籤系統
- 權限控制

## 團隊成員加入日期功能

### 功能說明
當管理員邀請新成員時，系統會自動在 AWS Cognito 用戶池中設置該成員的 `birthdate` 屬性為當前日期（YYYY-MM-DD 格式），作為團隊加入日期記錄。

### 技術實現
1. **API 層面** (`src/pages/api/invite-user.ts`)
   - 在創建用戶時自動設置 `birthdate` 屬性
   - 使用 `getCurrentDateString()` 函數生成標準格式日期

2. **前端顯示** (`src/components/TeamView.tsx`)
   - 優先顯示 `birthdate` 屬性作為加入日期
   - 如果沒有 `birthdate`，則使用 `UserCreateDate` 作為備用
   - 使用 `formatJoinDate()` 函數格式化日期顯示

3. **工具函數** (`src/utils/constants.ts`)
   - `formatJoinDate()`: 將日期格式化為本地化格式
   - `getCurrentDateString()`: 獲取當前日期字符串

### 使用方式
1. 在團隊管理頁面點擊「邀請成員」
2. 輸入新成員的電子郵件地址
3. 點擊「發送邀請」
4. 系統會自動設置加入日期並創建用戶

## 開發環境設置

### 環境變數
```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-1
COGNITO_REGION=ap-southeast-1
COGNITO_USER_POOL_ID=your_user_pool_id
```

### 安裝依賴
```bash
npm install
```

### 啟動開發服務器
```bash
npm run dev
```

## 技術棧

- **前端**: Next.js, React, TypeScript, Tailwind CSS
- **身份驗證**: AWS Cognito
- **UI 組件**: Lucide React Icons
- **通知**: React Hot Toast

## 項目結構

```
src/
├── auth/           # 身份驗證相關
├── components/     # React 組件
├── lib/           # 工具庫和配置
├── pages/         # Next.js 頁面和 API
├── styles/        # 樣式文件
├── types/         # TypeScript 類型定義
└── utils/         # 工具函數
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
