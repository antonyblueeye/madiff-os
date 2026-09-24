// In-memory cache for access token to prevent Zoho rate-limiting ("Too many requests continuously")
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

// Helper to get a valid Zoho Campaigns Access Token using the refresh token
export async function getZohoAccessToken(): Promise<{ accessToken: string; apiDomain: string }> {
    const now = Date.now();
    // Return cached token if valid for at least another 2 minutes
    if (cachedToken && tokenExpiresAt > now + 120 * 1000) {
        return {
            accessToken: cachedToken,
            apiDomain: "https://campaigns.zoho.com",
        };
    }

    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const accountsServer = process.env.ZOHO_ACCOUNTS_SERVER || "https://accounts.zoho.com";

    if (!refreshToken || !clientId || !clientSecret) {
        throw new Error("Zoho Campaigns OAuth credentials missing in environment variables.");
    }

    const tokenUrl = `${accountsServer}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
    const res = await fetch(tokenUrl, { method: "POST" });
    const data = await res.json();

    if (!data.access_token) {
        const errorDesc = data.error_description || data.error || JSON.stringify(data);
        throw new Error(`Failed to refresh Zoho token: ${errorDesc}`);
    }

    cachedToken = data.access_token;
    // expires_in is usually in seconds (e.g. 3600)
    const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 3600;
    tokenExpiresAt = now + expiresInSec * 1000;

    return {
        accessToken: data.access_token,
        apiDomain: "https://campaigns.zoho.com",
    };
}
