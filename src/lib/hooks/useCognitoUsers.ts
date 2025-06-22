import { useEffect, useState } from 'react';

export function useCognitoUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 從 localStorage 取得 idToken
    const idToken = localStorage.getItem('cognito_id_token');
    if (!idToken) {
      setUsers([]);
      setLoading(false);
      return;
    }
    fetch('/api/cognito-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading };
} 