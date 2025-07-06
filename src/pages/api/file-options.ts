import type { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const documentTableName = process.env.DOCUMENT_TABLE_NAME || 'metaage-management-system-document';
const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-southeast-1';
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const cognitoClientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

// 默認分類選項
const DEFAULT_CATEGORIES = ['文件', '檔案', '簡報', '外部連結'];

// 默認標籤選項
const DEFAULT_TAGS = ['一般文件', '技術文件', 'SOP', '連結', '外部文件'];

const verifier = CognitoJwtVerifier.create({
  userPoolId: cognitoUserPoolId,
  tokenUse: 'id',
  clientId: cognitoClientId,
});

async function getUserIdFromToken(token: string) {
  try {
    const payload = await verifier.verify(token);
    return payload.sub;
  } catch {
    return null;
  }
}

// 排序函數：確保指定項目在最前面
function sortWithPriority<T>(items: T[], priorityItems: T[]): T[] {
  const prioritySet = new Set(priorityItems);
  const priority = items.filter(item => prioritySet.has(item));
  const others = items.filter(item => !prioritySet.has(item)).sort();
  return [...priority, ...others];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!documentTableName) {
    res.status(500).json({ error: 'Document table name not configured' });
    return;
  }
  
  const auth = req.headers.authorization;
  let userId: string | null = null;
  
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.replace('Bearer ', '');
    userId = await getUserIdFromToken(token);
  }
  
  if (!userId) {
    res.status(401).json({ error: 'JWT 驗證失敗' });
    return;
  }

  const db = new DynamoDBClient({ region });

  if (req.method === 'GET') {
    try {
      // 掃描所有文件以獲取分類和標籤
      const cmd = new ScanCommand({
        TableName: documentTableName,
        ProjectionExpression: 'fileType, tags',
      });
      
      const data = await db.send(cmd);
      const items = data.Items || [];

      // 提取所有分類
      const categories = new Set<string>(DEFAULT_CATEGORIES);
      // 提取所有標籤
      const tags = new Set<string>(DEFAULT_TAGS);

      items.forEach(item => {
        // 提取分類
        if (item.fileType?.S) {
          categories.add(item.fileType.S);
        }
        
        // 提取標籤（假設標籤存儲為字符串數組）
        if (item.tags?.SS) {
          item.tags.SS.forEach(tag => tags.add(tag));
        } else if (item.tags?.S) {
          // 如果標籤是單個字符串，嘗試解析為數組
          try {
            const tagArray = JSON.parse(item.tags.S);
            if (Array.isArray(tagArray)) {
              tagArray.forEach(tag => tags.add(tag));
            }
          } catch {
            // 如果不是JSON格式，直接添加
            tags.add(item.tags.S);
          }
        }
      });

      // 轉換為數組並按優先級排序
      const categoriesArray = sortWithPriority(Array.from(categories), DEFAULT_CATEGORIES);
      const tagsArray = sortWithPriority(Array.from(tags), DEFAULT_TAGS);

      res.status(200).json({
        categories: categoriesArray,
        tags: tagsArray
      });
    } catch (e: any) {
      console.error('獲取選項失敗:', e);
      // 即使資料庫查詢失敗，也返回默認選項
      res.status(200).json({
        categories: DEFAULT_CATEGORIES,
        tags: DEFAULT_TAGS
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
} 