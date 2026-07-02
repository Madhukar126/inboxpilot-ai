import { prisma } from "@/lib/prisma";

export const gmailScopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send"
].join(" ");

type GmailProfile = {
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
  historyId?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type GmailConnection = {
  connected: boolean;
  needsReconnect: boolean;
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
  scope?: string | null;
  expiresAt?: string;
  error?: string;
};

export async function getGmailAccount(userId: string) {
  return prisma.account.findFirst({
    where: {
      userId,
      provider: "google"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function getGmailConnection(userId: string): Promise<GmailConnection> {
  const initialAccount = await getGmailAccount(userId);

  if (!initialAccount?.access_token) {
    return {
      connected: false,
      needsReconnect: false
    };
  }

  const { account, error: refreshError } = await refreshGmailAccountIfNeeded(initialAccount);
  const expiresAt = account.expires_at
    ? new Date(account.expires_at * 1000).toISOString()
    : undefined;

  if (refreshError) {
    return {
      connected: false,
      needsReconnect: true,
      scope: account.scope,
      expiresAt,
      error: refreshError
    };
  }

  if (!account.access_token) {
    return {
      connected: false,
      needsReconnect: true,
      scope: account.scope,
      expiresAt,
      error: "Gmail authorization is missing an access token. Reconnect Google and try again."
    };
  }

  const hasGmailScope = account.scope?.includes("https://www.googleapis.com/auth/gmail.readonly");
  if (!hasGmailScope) {
    return {
      connected: false,
      needsReconnect: true,
      scope: account.scope,
      expiresAt,
      error: "Google account is linked, but Gmail scopes were not granted."
    };
  }

  const response = await fetchGmailProfile(account.access_token);

  if (response.status === 401 || response.status === 403) {
    return {
      connected: false,
      needsReconnect: true,
      scope: account.scope,
      expiresAt,
      error: "Gmail authorization expired or was revoked."
    };
  }

  if (!response.ok) {
    return {
      connected: true,
      needsReconnect: false,
      scope: account.scope,
      expiresAt,
      error: "Gmail is connected, but profile lookup failed."
    };
  }

  const profile = (await response.json()) as GmailProfile;

  return {
    connected: true,
    needsReconnect: false,
    emailAddress: profile.emailAddress,
    messagesTotal: profile.messagesTotal,
    threadsTotal: profile.threadsTotal,
    scope: account.scope,
    expiresAt
  };
}

type GmailAccount = NonNullable<Awaited<ReturnType<typeof getGmailAccount>>>;

async function refreshGmailAccountIfNeeded(account: GmailAccount) {
  const expiresAt = account.expires_at ? account.expires_at * 1000 : undefined;

  if (!expiresAt || expiresAt > Date.now() + 60_000) {
    return { account };
  }

  if (!account.refresh_token) {
    return {
      account,
      error: "Gmail authorization expired. Reconnect Google to grant a new refresh token."
    };
  }

  return refreshGmailAccessToken(account);
}

async function refreshGmailAccessToken(account: GmailAccount) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: account.refresh_token ?? ""
    })
  });

  const tokens = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !tokens.access_token) {
    return {
      account,
      error:
        tokens.error_description ??
        tokens.error ??
        "Unable to refresh Gmail authorization. Reconnect Google and try again."
    };
  }

  const updatedAccount = await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: tokens.access_token,
      expires_at: tokens.expires_in
        ? Math.floor(Date.now() / 1000) + tokens.expires_in
        : account.expires_at,
      refresh_token: tokens.refresh_token ?? account.refresh_token,
      scope: tokens.scope ?? account.scope,
      token_type: tokens.token_type ?? account.token_type
    }
  });

  return { account: updatedAccount };
}

function fetchGmailProfile(accessToken: string) {
  return fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
}
