import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import formidable, { Part } from 'formidable';
import fs from 'fs';

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

// 配置 formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!bucket) {
    res.status(500).json({ error: 'S3 bucket not configured' });
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

  const s3 = new S3Client({ region });

  if (req.method === 'POST') {
    try {
      const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowEmptyFiles: false,
        filter: (part: Part) => {
          // 允許的文件類型
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          ];
          return allowedTypes.includes(part.mimetype || '');
        }
      });

      const [fields, files] = await form.parse(req);
      const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

      if (!uploadedFiles || uploadedFiles.length === 0) {
        res.status(400).json({ error: '沒有選擇檔案' });
        return;
      }

      const results = [];

      for (const file of uploadedFiles) {
        if (!file) continue;

        const fileBuffer = fs.readFileSync(file.filepath);
        const fileName = file.originalFilename || `file_${Date.now()}`;
        const fileExtension = fileName.split('.').pop() || '';
        const s3Key = `uploads/${userId}/${Date.now()}_${fileName}`;

        try {
          const uploadCommand = new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: file.mimetype || 'application/octet-stream',
            Metadata: {
              originalName: fileName,
              uploadedBy: userId,
              uploadedAt: new Date().toISOString()
            }
          });

          await s3.send(uploadCommand);

          results.push({
            originalName: fileName,
            s3Key: s3Key,
            size: file.size,
            type: file.mimetype,
            url: `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`
          });

          // 清理臨時檔案
          fs.unlinkSync(file.filepath);
        } catch (error) {
          console.error('S3 上傳失敗:', error);
          // 清理臨時檔案
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
          }
          throw error;
        }
      }

      res.status(200).json({
        success: true,
        files: results
      });
    } catch (error: any) {
      console.error('檔案上傳失敗:', error);
      res.status(500).json({ error: error.message || '檔案上傳失敗' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const { s3Key } = req.body;
      
      if (!s3Key) {
        res.status(400).json({ error: '缺少 S3 金鑰' });
        return;
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: s3Key
      });

      await s3.send(deleteCommand);

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('檔案刪除失敗:', error);
      res.status(500).json({ error: error.message || '檔案刪除失敗' });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
} 