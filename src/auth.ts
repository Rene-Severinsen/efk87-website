import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/db/prisma";
import { env } from "./lib/config/env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
          }),
        ]
      : []),
    ...(env.AUTH_EMAIL_SERVER && env.AUTH_EMAIL_FROM
      ? [
          Email({
            server: env.AUTH_EMAIL_SERVER,
            from: env.AUTH_EMAIL_FROM,
          }),
        ]
      : []),
    ...(env.DEV_LOGIN_ENABLED
      ? [
          Credentials({
            id: "dev-login",
            name: "Dev Login",
            credentials: {},
            async authorize() {
              if (!env.DEV_LOGIN_ENABLED) return null;

              const testEmail = "test.member@efk87.local";
              const user = await prisma.user.findUnique({
                where: { email: testEmail },
              });

              if (!user) {
                console.error(`[DevLogin] Dev login failed: User ${testEmail} not found. Run db:seed.`);
                return null;
              }

              return user;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
        session.user.email = token.email || "";
        session.user.name = token.name || "";
      }
      return session;
    },
  },
});
