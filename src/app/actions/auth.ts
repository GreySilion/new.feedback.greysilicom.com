'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserPayload {
  userId: number;
  email: string;
  username: string;
  name?: string;
  role?: string;
  companyId?: number;
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.userId as number,
      name: payload.name as string || (payload.username as string) || 'User',
      email: payload.email as string,
      username: payload.username as string,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
