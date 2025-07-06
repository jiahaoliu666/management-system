import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const bucket = process.env.DOCUMENTS_BUCKET_NAME!;
const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-southeast-1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { s3Key } = req.body;
  if (!s3Key) {
    res.status(400).json({ error: '缺少 s3Key' });
    return;
  }
  try {
    const s3 = new S3Client({ region });
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: s3Key }));
    res.status(200).json({ exists: true });
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      res.status(200).json({ exists: false });
    } else {
      res.status(500).json({ error: err.message || 'S3 檢查失敗' });
    }
  }
} 