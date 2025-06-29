# AWS 設定指南

## 概述

本專案使用 AWS 服務進行身份驗證、資料儲存和檔案管理。以下是完整的 AWS 設定步驟。

## 1. AWS Cognito 設定

### 1.1 創建 User Pool

1. 登入 AWS Console，進入 Cognito 服務
2. 點擊「Create user pool」
3. 設定 User Pool 名稱：`metaage-management-system-users`
4. 選擇「Cognito user pool sign-in options」
5. 選擇「Email」作為用戶名
6. 設定密碼政策：
   - 最小長度：8
   - 需要大寫字母：是
   - 需要小寫字母：是
   - 需要數字：是
   - 需要特殊字符：是
7. 設定 MFA：選擇「No MFA」
8. 設定用戶帳戶恢復：選擇「Self-service recovery」
9. 設定應用程式整合：
   - 選擇「Public client」
   - 應用程式名稱：`management-system-client`
   - 允許 OAuth 流程：選擇「Authorization code grant」
   - 允許的回調 URL：`http://localhost:3000/callback`
   - 允許的登出 URL：`http://localhost:3000`
10. 完成創建

### 1.2 獲取設定資訊

- User Pool ID
- Client ID
- Region

## 2. AWS DynamoDB 設定

### 2.1 創建 Document Table

```bash
aws dynamodb create-table \
  --table-name metaage-management-system-document \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

### 2.2 創建 Directory Table

```bash
aws dynamodb create-table \
  --table-name metaage-management-system-directory \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

## 3. AWS S3 設定

### 3.1 創建 S3 Bucket

1. 登入 AWS Console，進入 S3 服務
2. 點擊「Create bucket」
3. Bucket 名稱：`metaage-management-system-documents`
4. Region：選擇與其他服務相同的區域
5. 設定權限：
   - 取消勾選「Block all public access」
   - 勾選「I acknowledge that the current settings might result in this bucket and the objects within becoming public」
6. 完成創建

### 3.2 設定 CORS 政策

在 S3 Bucket 的「Permissions」標籤中，點擊「CORS configuration」並添加以下設定：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3.3 設定 Bucket Policy

在 S3 Bucket 的「Permissions」標籤中，點擊「Bucket policy」並添加以下政策：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCognitoUsers",
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::metaage-management-system-documents/*",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "your-identity-pool-id"
        }
      }
    }
  ]
}
```

## 4. IAM 角色設定

### 4.1 創建 Lambda 執行角色

```bash
aws iam create-role \
  --role-name ManagementSystemLambdaRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
```

### 4.2 附加必要的政策

```bash
# DynamoDB 政策
aws iam attach-role-policy \
  --role-name ManagementSystemLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# S3 政策
aws iam attach-role-policy \
  --role-name ManagementSystemLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# CloudWatch Logs 政策
aws iam attach-role-policy \
  --role-name ManagementSystemLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

## 5. 環境變數設定

### 5.1 本地開發環境 (.env.local)

```env
# AWS 區域
AWS_REGION=ap-southeast-1
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-1

# Cognito 設定
COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# DynamoDB 表名
DOCUMENT_TABLE_NAME=metaage-management-system-document
DIRECTORY_TABLE_NAME=metaage-management-system-directory

# S3 Bucket
DOCUMENTS_BUCKET_NAME=metaage-management-system-documents

# AWS 憑證 (本地開發)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 5.2 生產環境

在部署平台（如 Vercel、Netlify 等）設定相同的環境變數，但不包含 AWS 憑證（使用 IAM 角色）。

## 6. 檔案上傳功能

### 6.1 功能概述

- 支援拖拽上傳和點擊選擇
- 自動驗證檔案類型和大小
- 上傳到 S3 並返回公開 URL
- 支援圖片、文件、PDF 等多種格式
- 最大檔案大小：50MB

### 6.2 支援的檔案類型

- 圖片：JPEG, PNG, GIF, WebP
- 文件：PDF, TXT, DOC, DOCX
- 試算表：XLS, XLSX
- 簡報：PPT, PPTX

### 6.3 安全設定

- 檔案類型驗證
- 檔案大小限制
- 用戶身份驗證
- S3 存取控制

## 7. 部署檢查清單

- [ ] Cognito User Pool 已創建並配置
- [ ] DynamoDB 表已創建
- [ ] S3 Bucket 已創建並設定 CORS
- [ ] IAM 角色已創建並附加必要政策
- [ ] 環境變數已正確設定
- [ ] 應用程式已測試檔案上傳功能
- [ ] 安全性設定已檢查

## 8. 故障排除

### 8.1 常見問題

1. **CORS 錯誤**：檢查 S3 Bucket 的 CORS 設定
2. **權限錯誤**：檢查 IAM 角色和政策
3. **檔案上傳失敗**：檢查檔案大小和類型限制
4. **身份驗證失敗**：檢查 Cognito 設定

### 8.2 日誌檢查

- CloudWatch Logs
- 瀏覽器開發者工具
- 應用程式控制台輸出

## 9. 成本優化

### 9.1 DynamoDB

- 使用按需計費模式
- 設定適當的讀寫容量
- 使用 TTL 自動刪除過期資料

### 9.2 S3

- 使用 S3 Intelligent-Tiering
- 設定生命週期政策
- 定期清理未使用的檔案

### 9.3 監控

- 設定 CloudWatch 警報
- 監控 API 使用量
- 追蹤成本趨勢
