import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId?: string;
      tenantName?: string;
      tenantRole?: Role;
    } & DefaultSession["user"];
  }
}
