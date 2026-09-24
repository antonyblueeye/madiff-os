// Reply.io API Client (v1 / v3)

const REPLY_API_URL_V1 = "https://api.reply.io/v1";
const REPLY_API_URL_V3 = "https://api.reply.io/v3";

export function getReplyApiKey(): string {
    const key = process.env.REPLY_API_KEY || "hlo97MWk6uEiiLZvVfgL04U4";
    return key;
}

export interface ReplyCampaignItem {
    id: number;
    name: string;
    status: number | string;
    created?: string;
    emailAccount?: string;
    ownerEmail?: string;
    deliveriesCount?: number;
    opensCount?: number;
    repliesCount?: number;
    bouncesCount?: number;
    optOutsCount?: number;
    peopleCount?: number;
}

export interface ReplyEmailAccount {
    id: number;
    email: string;
    senderName: string;
    isDefault?: boolean;
}

// 1. Fetch all campaigns / sequences from Reply.io
export async function getReplyCampaigns(): Promise<ReplyCampaignItem[]> {
    const key = getReplyApiKey();
    const res = await fetch(`${REPLY_API_URL_V1}/campaigns`, {
        headers: { "x-api-key": key },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch Reply.io campaigns: ${res.statusText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

// 2. Fetch connected email accounts
export async function getReplyEmailAccounts(): Promise<ReplyEmailAccount[]> {
    const key = getReplyApiKey();
    const res = await fetch(`${REPLY_API_URL_V3}/email-accounts`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
    });

    if (!res.ok) {
        return [];
    }

    const data = await res.json();
    return (data.items || []).map((acc: any) => ({
        id: acc.id,
        email: acc.email,
        senderName: acc.senderName,
        isDefault: acc.isDefault,
    }));
}

// 3. Search contact in Reply.io by email
export async function findReplyContactByEmail(email: string) {
    if (!email) return null;
    const key = getReplyApiKey();
    const res = await fetch(
        `${REPLY_API_URL_V3}/contacts?email=${encodeURIComponent(email.trim().toLowerCase())}`,
        {
            headers: { Authorization: `Bearer ${key}` },
            cache: "no-store",
        }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0] || null;
}

// 4. Fetch timeline & conversation activities for a contact
export async function getReplyContactActivities(contactId: number | string) {
    const key = getReplyApiKey();
    const res = await fetch(
        `${REPLY_API_URL_V3}/contacts/${contactId}/activities`,
        {
            headers: { Authorization: `Bearer ${key}` },
            cache: "no-store",
        }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
}

// 5. Add & Push contact to existing campaign
export async function pushContactToCampaign(params: {
    campaignId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    title?: string;
    phone?: string;
}) {
    const key = getReplyApiKey();
    const res = await fetch(`${REPLY_API_URL_V1}/actions/addandpushtocampaign`, {
        method: "POST",
        headers: {
            "x-api-key": key,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            campaignId: params.campaignId,
            email: params.email,
            firstName: params.firstName || "",
            lastName: params.lastName || "",
            company: params.company || "",
            title: params.title || "",
            phone: params.phone || "",
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Push to campaign failed with status ${res.status}`);
    }

    return true;
}

// 6. Create a brand new Sequence / Campaign in Reply.io
export async function createReplySequence(params: {
    name: string;
    subject: string;
    body: string;
    emailAccountId?: number;
}) {
    const key = getReplyApiKey();

    const payload: any = {
        name: params.name,
        steps: [
            {
                type: "email",
                delayInMinutes: 0,
                executionMode: "automatic",
                variants: [
                    {
                        subject: params.subject,
                        message: params.body,
                    },
                ],
            },
        ],
    };

    if (params.emailAccountId) {
        payload.emailAccounts = [{ id: params.emailAccountId }];
    }

    const res = await fetch(`${REPLY_API_URL_V3}/sequences`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Failed to create sequence: ${res.statusText}`);
    }

    return await res.json();
}
