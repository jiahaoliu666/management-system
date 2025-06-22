import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const region = process.env.COGNITO_REGION!;
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID!;
const userPoolId = process.env.COGNITO_USER_POOL_ID!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { idToken } = req.body;
  if (!idToken) {
    res.status(401).json({ error: 'Missing idToken' });
    return;
  }
  try {
    const credentials = fromCognitoIdentityPool({
      clientConfig: { region },
      identityPoolId,
      logins: {
        [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
      },
    });
    const client = new CognitoIdentityProviderClient({ region, credentials });
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 60,
    });
    const data = await client.send(command);
    res.status(200).json({ users: data.Users || [] });
  } catch (error: any) {
    console.error('Cognito API error:', error);
    res.status(500).json({ error: error.message || '取得 Cognito 用戶失敗', detail: error });
  }
} 