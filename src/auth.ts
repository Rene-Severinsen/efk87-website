import { type Session, type User } from "next-auth";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/db/prisma";
import { env } from "./lib/config/env";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

const providers = [];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

if (env.AUTH_EMAIL_SERVER && env.AUTH_EMAIL_FROM) {
  providers.push(
    Email({
      server: env.AUTH_EMAIL_SERVER,
      from: env.AUTH_EMAIL_FROM,
    })
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  providers,
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export const authInstance = NextAuth(authConfig);
export const auth = authInstance.auth;
export const handlers = authInstance.handlers;
export const signIn = authInstance.signIn;
export const signOut = authInstance.signOut;
