# AWS 設定指南

本文檔說明如何設定 AWS 服務以支援文件編輯器功能。

## 1. S3 儲存桶設定

### 1.1 創建 S3 儲存桶

1. 登入 AWS Console
2. 前往 S3 服務
3. 點擊「創建儲存桶」
4. 設定儲存桶名稱（例如：`my-documents-bucket`）
5. 選擇區域（建議與應用程式相同區域）
6. 設定權限：
   - 取消勾選「封鎖所有公開存取」
   - 啟用版本控制（可選，用於文件版本管理）

### 1.2 設定 CORS

在 S3 儲存桶設定中添加以下 CORS 配置：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 1.3 設定儲存桶政策

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAuthenticatedUsers",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

## 2. DynamoDB 表格設定

### 2.1 創建目錄表格 (metaage-management-system-directory)

1. 前往 DynamoDB 服務
2. 點擊「創建表格」
3. 設定表格名稱：`metaage-management-system-directory`
4. 主鍵設定：
   - 分割鍵：`PK` (String)
   - 排序鍵：`SK` (String)
5. 設定容量：
   - 選擇「按需」或「預設容量」
   - 如果選擇預設容量，建議設定 5 個讀取容量單位和 5 個寫入容量單位

### 2.2 創建文件表格 (metaage-management-system-document)

1. 前往 DynamoDB 服務
2. 點擊「創建表格」
3. 設定表格名稱：`metaage-management-system-document`
4. 主鍵設定：
   - 分割鍵：`PK` (String)
   - 排序鍵：`SK` (String)
5. 設定容量：
   - 選擇「按需」或「預設容量」
   - 如果選擇預設容量，建議設定 5 個讀取容量單位和 5 個寫入容量單位

### 2.3 表格結構

#### 目錄表格 (metaage-management-system-directory)

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

#### 文件表格 (metaage-management-system-document)

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

## 3. IAM 角色和權限

### 3.1 創建 IAM 用戶

1. 前往 IAM 服務
2. 創建新用戶
3. 附加以下政策：

### 3.2 S3 政策

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

### 3.3 DynamoDB 政策

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT:table/metaage-management-system-directory",
        "arn:aws:dynamodb:REGION:ACCOUNT:table/metaage-management-system-document"
      ]
    }
  ]
}
```

## 4. 環境變數設定

在 `.env.local` 文件中添加以下變數：

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

## 5. 安全最佳實踐

### 5.1 最小權限原則

- 只授予應用程式所需的最小權限
- 定期審查和更新 IAM 政策

### 5.2 資料加密

- 啟用 S3 儲存桶的伺服器端加密
- 啟用 DynamoDB 表格的加密

### 5.3 監控和日誌

- 啟用 CloudTrail 來追蹤 API 調用
- 設定 CloudWatch 警報
- 監控 S3 和 DynamoDB 的使用量

### 5.4 備份策略

- 啟用 S3 版本控制
- 設定 DynamoDB 點對點備份
- 定期測試還原程序

## 6. 成本優化

### 6.1 S3 成本優化

- 使用適當的儲存類別
- 設定生命週期政策
- 監控資料傳輸成本

### 6.2 DynamoDB 成本優化

- 使用按需容量模式進行測試
- 生產環境考慮使用預設容量
- 監控讀寫容量使用量

## 7. 故障排除

### 7.1 常見問題

1. **權限錯誤**

   - 檢查 IAM 政策是否正確
   - 確認環境變數是否設定正確

2. **CORS 錯誤**

   - 檢查 S3 儲存桶的 CORS 設定
   - 確認允許的來源是否正確

3. **連線超時**
   - 檢查網路連線
   - 確認 AWS 區域設定

### 7.2 除錯工具

- AWS CloudWatch Logs
- AWS X-Ray
- 瀏覽器開發者工具

## 8. 部署檢查清單

- [ ] S3 儲存桶已創建並設定正確的權限
- [ ] DynamoDB 目錄表格已創建
- [ ] DynamoDB 文件表格已創建
- [ ] IAM 用戶已創建並附加正確的政策
- [ ] 環境變數已正確設定
- [ ] CORS 設定已完成
- [ ] 已測試基本的 CRUD 操作
- [ ] 監控和警報已設定
- [ ] 備份策略已實施

## 9. 測試和驗證

### 9.1 測試目錄操作

使用 AWS CLI 或 DynamoDB Console 測試目錄表格：

```bash
# 創建測試目錄
aws dynamodb put-item \
  --table-name metaage-management-system-directory \
  --item '{
    "PK": {"S": "dir#test-folder-1"},
    "SK": {"S": "dir#test-folder-1"},
    "name": {"S": "測試資料夾"},
    "parentId": {"S": "root"},
    "type": {"S": "folder"},
    "createdBy": {"S": "test-user"},
    "createdAt": {"S": "2024-03-20T10:30:00Z"},
    "updatedAt": {"S": "2024-03-20T10:30:00Z"}
  }'

# 查詢所有目錄
aws dynamodb scan \
  --table-name metaage-management-system-directory \
  --filter-expression "#type = :folderType" \
  --expression-attribute-names '{"#type": "type"}' \
  --expression-attribute-values '{":folderType": {"S": "folder"}}'
```

### 9.2 測試文件操作

測試文件表格：

```bash
# 創建測試文件
aws dynamodb put-item \
  --table-name metaage-management-system-document \
  --item '{
    "PK": {"S": "file#test-doc-1"},
    "SK": {"S": "file#test-doc-1"},
    "name": {"S": "測試文件"},
    "parentId": {"S": "test-folder-1"},
    "s3Key": {"S": "documents/test-doc-1.json"},
    "fileType": {"S": "document"},
    "type": {"S": "file"},
    "createdBy": {"S": "test-user"},
    "createdAt": {"S": "2024-03-20T10:30:00Z"},
    "updatedAt": {"S": "2024-03-20T10:30:00Z"}
  }'

# 查詢所有文件
aws dynamodb scan \
  --table-name metaage-management-system-document
```

### 9.3 應用程式測試

1. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

2. **測試目錄功能**

   - 登入應用程式
   - 在側邊欄創建新資料夾
   - 驗證資料夾出現在目錄樹中

3. **測試文件功能**

   - 點擊文件列表中的文件
   - 驗證文件編輯器打開
   - 編輯文件內容並儲存
   - 驗證自動儲存功能

4. **驗證資料儲存**
   - 檢查 DynamoDB 表格中是否有新記錄
   - 檢查 S3 儲存桶中是否有文件內容

### 9.4 常見問題排查

1. **權限錯誤**

   - 檢查 IAM 政策是否包含兩個表格的權限
   - 確認環境變數設定正確

2. **表格不存在**

   - 確認表格名稱正確
   - 檢查表格是否在正確的區域

3. **S3 存取錯誤**

   - 檢查 S3 儲存桶權限
   - 確認 CORS 設定正確

4. **API 錯誤**
   - 檢查 API 路由是否正確
   - 確認 JWT 令牌是否有效
