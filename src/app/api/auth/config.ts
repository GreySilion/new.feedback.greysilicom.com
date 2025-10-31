import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

// Extend the built-in session and user types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      accessToken: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    accessToken: string;  // Make accessToken required to match lib/auth.ts
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    name?: string | null;
    email?: string | null;
  }
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  [key: string]: any; // Allow additional properties
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user in database
          const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          ) as any; // Type assertion to bypass type checking for now

          const user = rows[0];
          
          if (!user) {
            throw new Error('No user found with this email');
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            throw new Error('Invalid password');
          }

          // Return user data without the password
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          } as User;
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to the token
      if (user) {
        token.id = user.id;
        token.name = user.name || null;
        token.email = user.email || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to the session
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name || null;
        session.user.email = token.email || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'default-secret',
};
