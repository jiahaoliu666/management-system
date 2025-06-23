import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.COGNITO_REGION!;
const userPoolId = process.env.COGNITO_USER_POOL_ID!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ error: '缺少必要欄位（username）' });
    return;
  }
  try {
    const client = new CognitoIdentityProviderClient({ region });
    const command = new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    });
    await client.send(command);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Cognito AdminDeleteUser error:', error);
    res.status(500).json({ error: error.message || '刪除成員失敗', detail: error });
  }
} 