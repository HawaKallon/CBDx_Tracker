import 'server-only';

type TokenResponse = {
  access_token: string;
  expires_in: number;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const tenant = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenant || !clientId || !clientSecret) {
    throw new Error('Azure credentials missing (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)');
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as TokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

function buildContentUrl(): string {
  const driveId = process.env.GRAPH_DRIVE_ID;
  const itemId = process.env.ONEDRIVE_FILE_ID;
  const userEmail = process.env.ONEDRIVE_USER_EMAIL;
  const filePath = process.env.ONEDRIVE_FILE_PATH;

  if (driveId && itemId) {
    return `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`;
  }

  if (userEmail && filePath) {
    const encoded = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}/drive/root:/${encodeURIComponent(encoded)}:/content`;
  }

  if (itemId) {
    return `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/content`;
  }

  throw new Error(
    'Graph file location not configured. Set GRAPH_DRIVE_ID + ONEDRIVE_FILE_ID, or ONEDRIVE_USER_EMAIL + ONEDRIVE_FILE_PATH.',
  );
}

export async function fetchWorkbookFromGraph(): Promise<Buffer> {
  const token = await getAccessToken();
  const url = buildContentUrl();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft Graph workbook fetch failed (${res.status}): ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function isGraphConfigured(): boolean {
  const hasAzure =
    Boolean(process.env.AZURE_TENANT_ID) &&
    Boolean(process.env.AZURE_CLIENT_ID) &&
    Boolean(process.env.AZURE_CLIENT_SECRET);

  const hasFile =
    (Boolean(process.env.GRAPH_DRIVE_ID) && Boolean(process.env.ONEDRIVE_FILE_ID)) ||
    (Boolean(process.env.ONEDRIVE_USER_EMAIL) && Boolean(process.env.ONEDRIVE_FILE_PATH)) ||
    Boolean(process.env.ONEDRIVE_FILE_ID);

  return hasAzure && hasFile;
}
