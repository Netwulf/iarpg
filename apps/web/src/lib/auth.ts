import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import { supabase } from '@iarpg/db';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  trustHost: true, // Required for production deployments (Vercel)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data: user, error } = await (supabase
          .from('users') as any)
          .select('*')
          .eq('email', credentials.email as string)
          .single();

        if (error || !user || !user.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          tier: user.tier,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = (user as any).tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).tier = token.tier as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'discord') {
        // Check if user exists
        const { data: existingUser } = await (supabase
          .from('users') as any)
          .select('*')
          .eq('email', user.email!)
          .single();

        if (!existingUser) {
          // Create user from OAuth
          await (supabase
            .from('users') as any)
            .insert({
              email: user.email!,
              username: user.email!.split('@')[0] + Math.random().toString(36).substring(7),
              tier: 'free',
            });
        }
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
