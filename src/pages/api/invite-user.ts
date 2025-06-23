import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.COGNITO_REGION!;
const userPoolId = process.env.COGNITO_USER_POOL_ID!;

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
    const client = new CognitoIdentityProviderClient({ region });
    const command = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
      DesiredDeliveryMediums: ['EMAIL'],
      MessageAction: 'SUPPRESS', // 改成 'SUPPRESS' 讓你可以自訂信件內容，若要 Cognito 寄預設信請移除此行
      ForceAliasCreation: false,
    });
    const data = await client.send(command);
    // TODO: 若要自訂信件內容，可在這裡串接 email service
    res.status(200).json({ user: data.User });
  } catch (error: any) {
    console.error('Cognito AdminCreateUser error:', error);
    res.status(500).json({ error: error.message || '邀請成員失敗', detail: error });
  }
} 