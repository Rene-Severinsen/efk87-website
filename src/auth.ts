import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/db/prisma";
import { env } from "./lib/config/env";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: "placeholder",
      clientSecret: "placeholder",
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
