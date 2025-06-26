import type { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const tableName = process.env.DIRECTORY_TABLE_NAME!;
const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-southeast-1';
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const cognitoClientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

const verifier = CognitoJwtVerifier.create({
  userPoolId: cognitoUserPoolId,
  tokenUse: 'id', // 或 'access'，視你的前端傳哪一種 token
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
  if (!tableName) {
    res.status(500).json({ error: 'Table name not configured' });
    return;
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: '未授權' });
    return;
  }
  const token = auth.replace('Bearer ', '');
  const userId = await getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: 'JWT 驗證失敗' });
    return;
  }
  const client = new DynamoDBClient({ region });

  if (req.method === 'GET') {
    // 查詢所有目錄
    try {
      const cmd = new ScanCommand({
        TableName: tableName,
        FilterExpression: '#type = :folderType',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':folderType': { S: 'folder' } }
      });
      const data = await client.send(cmd);
      res.status(200).json({ items: data.Items || [] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
      const cmd = new PutItemCommand({
        TableName: tableName,
        Item: {
          PK: { S: `dir#${id}` },
          SK: { S: `dir#${id}` },
          name: { S: name },
          parentId: { S: parentId || 'root' },
          type: { S: 'folder' },
          createdBy: { S: userId },
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      });
      await client.send(cmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
        TableName: tableName,
        Key: {
          PK: { S: `dir#${id}` },
          SK: { S: `dir#${id}` },
        },
        UpdateExpression: 'SET #n = :name',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: { ':name': { S: name } },
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
        TableName: tableName,
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
