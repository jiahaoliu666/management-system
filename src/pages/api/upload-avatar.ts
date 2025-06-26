import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-southeast-1';
const bucket = process.env.AVATAR_BUCKET_NAME || process.env.NEXT_PUBLIC_AVATAR_BUCKET_NAME;

// 允許的圖片 MIME 類型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { filename, filetype, oldAvatarUrl } = req.body;
  if (!filename || !filetype) {
    res.status(400).json({ error: '缺少必要欄位（filename, filetype）' });
    return;
  }
  if (!ALLOWED_IMAGE_TYPES.includes(filetype)) {
    res.status(400).json({ error: '不支援的圖片格式' });
    return;
  }
  if (!bucket) {
    res.status(500).json({ error: 'S3 儲存桶未設定' });
    return;
  }
  try {
    const s3 = new S3Client({ region });

    // 如果提供了舊頭像 URL，則嘗試刪除它
    if (oldAvatarUrl) {
      try {
        const oldKey = new URL(oldAvatarUrl).pathname.substring(1); // 移除開頭的 '/'
        if (oldKey && oldKey.startsWith('avatars/')) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: bucket,
            Key: oldKey,
          });
          await s3.send(deleteCommand);
          console.log(`成功刪除舊頭像: ${oldKey}`);
        }
      } catch (deleteError) {
        // 刪除失敗不應中斷主流程，僅記錄錯誤
        console.error('刪除舊頭像失敗:', deleteError);
      }
    }
    
    const key = `avatars/${filename}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: filetype
      // ACL: 'public-read', // Bucket owner enforced 時不可加
    });
    // 產生簽名 URL
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 分鐘有效
    // S3 公開圖片 URL
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    res.status(200).json({ uploadUrl, fileUrl });
  } catch (error: any) {
    console.error('S3 簽名產生失敗:', error);
    res.status(500).json({ error: error.message || 'S3 簽名產生失敗' });
  }
} 