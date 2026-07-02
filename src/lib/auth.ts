import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { gmailScopes } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
import { ensureTenantForUser, getActiveMembership } from "@/lib/tenant";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/signin",
    error: "/signin"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope: gmailScopes
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const membership = await getActiveMembership(user.id);
        session.user.tenantId = membership?.tenantId;
        session.user.tenantName = membership?.tenant.name;
        session.user.tenantRole = membership?.role;
      }

      return session;
    }
  },
  events: {
    async createUser({ user }) {
      await ensureTenantForUser(user.id, user.name, user.email);
    },
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.id) {
        return;
      }

      await ensureTenantForUser(user.id, user.name, user.email);

      await prisma.account.updateMany({
        where: {
          userId: user.id,
          provider: "google",
          providerAccountId: account.providerAccountId
        },
        data: {
          access_token: account.access_token,
          expires_at: account.expires_at,
          id_token: account.id_token,
          refresh_token: account.refresh_token ?? undefined,
          scope: account.scope,
          token_type: account.token_type
        }
      });
    }
  }
};
