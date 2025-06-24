import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.COGNITO_REGION!;
const userPoolId = process.env.COGNITO_USER_POOL_ID!;

// 獲取當前日期，格式為 YYYY-MM-DD
const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: '缺少必要欄位（email）' });
    return;
  }
  try {
    // 生成當前日期，格式為 YYYY-MM-DD
    const today = getCurrentDateString(); // 例如：2025-06-24
    console.log(`邀請新成員: ${email}, 加入日期: ${today}`);
    
    const client = new CognitoIdentityProviderClient({ region });
    const command = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'birthdate', Value: today }, // 設置加入日期為當前日期
      ],
      DesiredDeliveryMediums: ['EMAIL'], // 讓 Cognito 發送邀請信
      // MessageAction: 'SUPPRESS', // 移除此行，啟用預設郵件發送
      ForceAliasCreation: false,
    });
    const data = await client.send(command);
    console.log(`成功邀請成員: ${email}, 用戶ID: ${data.User?.Username}`);
    // TODO: 若要自訂信件內容，可在這裡串接 email service
    res.status(200).json({ user: data.User });
  } catch (error: any) {
    console.error('Cognito AdminCreateUser error:', error);
    res.status(500).json({ error: error.message || '邀請成員失敗', detail: error });
  }
} 