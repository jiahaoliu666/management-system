import type { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand, DeleteItemCommand, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const documentTableName = process.env.DOCUMENT_TABLE_NAME || 'metaage-management-system-document';
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
  if (!documentTableName || !bucket) {
    res.status(500).json({ error: 'Document table/Bucket name not configured' });
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

  if (req.method === 'GET') {
    // 獲取文件列表或單個文件
    const { id, parentId } = req.query;
    
    if (id) {
      // 獲取單個文件
      try {
        const cmd = new GetItemCommand({
          TableName: documentTableName,
          Key: {
            PK: { S: `file#${id}` },
            SK: { S: `file#${id}` },
          },
        });
        const data = await db.send(cmd);
        
        if (!data.Item) {
          res.status(404).json({ error: '文件不存在' });
          return;
        }

        // 從 S3 獲取文件內容
        let content = '';
        try {
          const s3Key = data.Item.s3Key?.S;
          if (s3Key) {
            const getObjectCmd = new GetObjectCommand({
              Bucket: bucket,
              Key: s3Key,
            });
            const s3Data = await s3.send(getObjectCmd);
            content = await s3Data.Body?.transformToString() || '';
          }
        } catch (s3Error) {
          console.error('S3 讀取失敗:', s3Error);
          // 即使 S3 讀取失敗，也返回 metadata
        }

        res.status(200).json({
          id,
          name: data.Item.name?.S,
          parentId: data.Item.parentId?.S,
          s3Key: data.Item.s3Key?.S,
          fileType: data.Item.fileType?.S,
          content,
          createdBy: data.Item.createdBy?.S,
          createdAt: data.Item.createdAt?.S,
          updatedAt: data.Item.updatedAt?.S,
        });
      } catch (e: any) {
        console.error('DynamoDB Get 失敗:', e);
        res.status(500).json({ error: e.message });
      }
    } else {
      // 獲取文件列表
      try {
        const cmd = new ScanCommand({
          TableName: documentTableName,
          FilterExpression: parentId ? '#parentId = :parentId' : undefined,
          ExpressionAttributeNames: parentId ? { '#parentId': 'parentId' } : undefined,
          ExpressionAttributeValues: parentId ? { ':parentId': { S: parentId as string } } : undefined,
        });
        const data = await db.send(cmd);
        res.status(200).json({ items: data.Items || [] });
      } catch (e: any) {
        console.error('DynamoDB Scan 失敗:', e);
        res.status(500).json({ error: e.message });
      }
    }
    return;
  }

  if (req.method === 'POST') {
    // 新增文件 metadata + 內容到 S3
    const { id, name, parentId, s3Key, fileType, content, category, tags } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      // 儲存內容到 S3
      if (content) {
        const putObjectCmd = new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key || `documents/${id}.json`,
          Body: content,
          ContentType: 'application/json',
        });
        await s3.send(putObjectCmd);
      }

      // 儲存 metadata 到 DynamoDB
      const cmd = new PutItemCommand({
        TableName: documentTableName,
        Item: {
          PK: { S: `file#${id}` },
          SK: { S: `file#${id}` },
          name: { S: name },
          parentId: { S: parentId || 'root' },
          s3Key: { S: s3Key || `documents/${id}.json` },
          fileType: { S: fileType || 'document' },
          category: { S: category || fileType || 'document' },
          tags: { SS: tags || [] },
          type: { S: 'file' },
          createdBy: { S: userId },
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() },
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      });
      await db.send(cmd);
      res.status(200).json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  if (req.method === 'PUT') {
    // 修改文件 metadata + 內容
    const { id, name, content, parentId, category, tags } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }
    try {
      // 獲取現有的 s3Key
      const getCmd = new GetItemCommand({
        TableName: documentTableName,
        Key: {
          PK: { S: `file#${id}` },
          SK: { S: `file#${id}` },
        },
      });
      const existingData = await db.send(getCmd);
      
      if (!existingData.Item) {
        res.status(404).json({ error: '文件不存在' });
        return;
      }

      const s3Key = existingData.Item.s3Key?.S;

      // 更新內容到 S3
      if (content && s3Key) {
        const putObjectCmd = new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key,
          Body: content,
          ContentType: 'application/json',
        });
        await s3.send(putObjectCmd);
      }

      // 更新 metadata 到 DynamoDB
      let updateExpression = 'SET #n = :name, #updatedAt = :updatedAt';
      const expressionAttributeNames: Record<string, string> = { '#n': 'name', '#updatedAt': 'updatedAt' };
      const expressionAttributeValues: Record<string, any> = { 
        ':name': { S: name },
        ':updatedAt': { S: new Date().toISOString() }
      };

      // 如果提供了 parentId，也更新它
      if (parentId !== undefined) {
        updateExpression += ', #parentId = :parentId';
        expressionAttributeNames['#parentId'] = 'parentId';
        expressionAttributeValues[':parentId'] = { S: parentId };
      }

      // 如果提供了 category，也更新它
      if (category !== undefined) {
        updateExpression += ', #category = :category';
        expressionAttributeNames['#category'] = 'category';
        expressionAttributeValues[':category'] = { S: category };
      }

      // 如果提供了 tags，也更新它
      if (tags !== undefined) {
        updateExpression += ', #tags = :tags';
        expressionAttributeNames['#tags'] = 'tags';
        expressionAttributeValues[':tags'] = { SS: tags };
      }

      const cmd = new UpdateItemCommand({
        TableName: documentTableName,
        Key: {
          PK: { S: `file#${id}` },
          SK: { S: `file#${id}` },
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
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
        TableName: documentTableName,
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
