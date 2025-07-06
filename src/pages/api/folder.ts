import type { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const directoryTableName = process.env.DIRECTORY_TABLE_NAME || 'metaage-management-system-directory';
const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-southeast-1';
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const cognitoClientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!directoryTableName) {
    res.status(500).json({ error: 'Directory table name not configured' });
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
  
  const client = new DynamoDBClient({ region });

  if (req.method === 'GET') {
    // 查詢所有目錄
    try {
      const cmd = new ScanCommand({
        TableName: directoryTableName,
        FilterExpression: '#type = :folderType',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':folderType': { S: 'folder' } }
      });
      const data = await client.send(cmd);
      res.status(200).json({ items: data.Items || [] });
    } catch (e: any) {
      console.error('DynamoDB Scan 失敗:', e);
      res.status(500).json({ error: e.message, stack: e.stack, detail: e });
    }
    return;
  }

  if (req.method === 'POST') {
    // 新增目錄
    const { id, name, parentId } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    
    try {
      // 生產環境：實際儲存到 DynamoDB
      const cmd = new PutItemCommand({
        TableName: directoryTableName,
        Item: {
          PK: { S: `dir#${id}` },
          SK: { S: `dir#${id}` },
          name: { S: name },
          parentId: { S: parentId || 'root' },
          type: { S: 'folder' },
          createdBy: { S: userId },
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() },
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      });
      await client.send(cmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      console.error('創建資料夾失敗:', e);
      res.status(500).json({ error: e.message || '創建資料夾失敗' });
    }
    return;
  }
  if (req.method === 'PUT') {
    // 修改目錄名稱
    const { id, name } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      const cmd = new UpdateItemCommand({
        TableName: directoryTableName,
        Key: {
          PK: { S: `dir#${id}` },
          SK: { S: `dir#${id}` },
        },
        UpdateExpression: 'SET #n = :name, #updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#n': 'name', '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: { 
          ':name': { S: name },
          ':updatedAt': { S: new Date().toISOString() }
        },
      });
      await client.send(cmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === 'DELETE') {
    // 刪除目錄
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      const cmd = new DeleteItemCommand({
        TableName: directoryTableName,
        Key: {
          PK: { S: `dir#${id}` },
          SK: { S: `dir#${id}` },
        },
      });
      await client.send(cmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
