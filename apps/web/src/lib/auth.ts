import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import { createSupabaseAdmin } from '@iarpg/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not set');
}

export const authConfig: NextAuthConfig = {
  trustHost: true, // Required for production deployments (Vercel)
  secret: process.env.NEXTAUTH_SECRET,
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
          console.error('[Auth] Missing credentials');
          return null;
        }

        const supabaseAdmin = createSupabaseAdmin();

        const { data: user, error } = await (supabaseAdmin
          .from('users') as any)
          .select('*')
          .eq('email', credentials.email as string)
          .single();

        if (error || !user || !user.password_hash) {
          console.error('[Auth] User not found or no password_hash:', { error, hasUser: !!user, hasHash: !!user?.password_hash });
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        console.log('[Auth] Password validation result:', isPasswordValid);

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
    // ⚠️ TEMPORARILY DISABLED: OAuth providers without credentials
    // causing issues in production. Re-enable when credentials are configured.
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || '',
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // }),
    // DiscordProvider({
    //   clientId: process.env.DISCORD_CLIENT_ID || '',
    //   clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    // }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
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

      // Generate a custom JWT token for backend API calls
      // Backend expects: {id, email, name, tier}
      const apiToken = jwt.sign(
        {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          tier: token.tier as string,
        },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '30d' }
      );

      (session as any).accessToken = apiToken;
      return session;
    },
    async signIn({ user, account }) {
      // ⚠️ DISABLED: OAuth sign-in logic (providers currently disabled)
      // if (account?.provider === 'google' || account?.provider === 'discord') {
      //   const supabaseAdmin = createSupabaseAdmin();

      //   // Check if user exists
      //   const { data: existingUser } = await (supabaseAdmin
      //     .from('users') as any)
      //     .select('*')
      //     .eq('email', user.email!)
      //     .single();

      //   if (!existingUser) {
      //     // Create user from OAuth
      //     await (supabaseAdmin
      //       .from('users') as any)
      //       .insert({
      //         email: user.email!,
      //         username: user.email!.split('@')[0] + Math.random().toString(36).substring(7),
      //         tier: 'free',
      //       });
      //   }
      // }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
