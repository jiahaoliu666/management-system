import type { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const tableName = process.env.DIRECTORY_TABLE_NAME!;
const bucket = process.env.DOCUMENTS_BUCKET_NAME!;
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
  if (!tableName || !bucket) {
    res.status(500).json({ error: 'Table/Bucket name not configured' });
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
  const db = new DynamoDBClient({ region });
  const s3 = new S3Client({ region });
  if (req.method === 'POST') {
    // 新增文件 metadata
    const { id, name, parentId, s3Key, fileType } = req.body;
    if (!id || !name || !s3Key) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      const cmd = new PutItemCommand({
        TableName: tableName,
        Item: {
          PK: { S: `file#${id}` },
          SK: { S: `file#${id}` },
          name: { S: name },
          parentId: { S: parentId || 'root' },
          s3Key: { S: s3Key },
          fileType: { S: fileType || 'doc' },
          type: { S: 'file' },
          createdBy: { S: userId },
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      });
      await db.send(cmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === 'PUT') {
    // 修改文件 metadata
    const { id, name } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      const cmd = new UpdateItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: `file#${id}` },
          SK: { S: `file#${id}` },
        },
        UpdateExpression: 'SET #n = :name',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: { ':name': { S: name } },
      });
      await db.send(cmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === 'DELETE') {
    // 刪除文件 metadata + S3 檔案
    const { id, s3Key } = req.body;
    if (!id || !s3Key) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      // 刪除 metadata
      const cmd = new DeleteItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: `file#${id}` },
          SK: { S: `file#${id}` },
        },
      });
      await db.send(cmd);
      // 刪除 S3 檔案
      const delCmd = new DeleteObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });
      await s3.send(delCmd);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
