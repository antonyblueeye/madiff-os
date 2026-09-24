import { Pool } from "pg";

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:8876700@127.0.0.1:5432/madiff";

declare global {
    var _pgPool: Pool | undefined;
    var _isDbInitialized: boolean | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === "production") {
    pool = new Pool({ connectionString });
} else {
    if (!global._pgPool) {
        global._pgPool = new Pool({ connectionString });
    }
    pool = global._pgPool;
}

export default pool;

export async function initDb() {
    if (global._isDbInitialized) return;
    const client = await pool.connect();
    try {
        global._isDbInitialized = true;
        await client.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id VARCHAR(100) PRIMARY KEY,
                hubspot_id VARCHAR(100) UNIQUE,
                contact_name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(100),
                company_name VARCHAR(255),
                lead_status VARCHAR(100),
                lifecycle_stage VARCHAR(100),
                contact_owner VARCHAR(255),
                linkedin_connection_status VARCHAR(100),
                linkedin_account VARCHAR(255),
                location VARCHAR(255),
                website_url TEXT,
                linkedin_url TEXT,
                replied VARCHAR(50),
                campaign VARCHAR(255),
                email_status VARCHAR(100),
                technology VARCHAR(255),
                role VARCHAR(255),
                type_of_response VARCHAR(255),
                company_domain_name VARCHAR(255),
                sync_status VARCHAR(50) DEFAULT 'synced',
                dirty_fields JSONB DEFAULT '[]'::jsonb,
                channels JSONB DEFAULT '{"hubspot":{"active":true},"reply":{"active":false},"linkedhelper":{"active":false},"zoho":{"active":false}}'::jsonb,
                notes JSONB DEFAULT '[]'::jsonb,
                timeline JSONB DEFAULT '[]'::jsonb,
                reply_conversations JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_leads_contact_name ON leads(contact_name);
            CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
            CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);
            CREATE INDEX IF NOT EXISTS idx_leads_contact_owner ON leads(contact_owner);
            CREATE INDEX IF NOT EXISTS idx_leads_sync_status ON leads(sync_status);

            CREATE TABLE IF NOT EXISTS sync_metadata (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Zoho Campaigns Tables
            CREATE TABLE IF NOT EXISTS zoho_campaigns (
                campaign_key VARCHAR(150) PRIMARY KEY,
                campaign_id VARCHAR(100),
                campaign_name VARCHAR(255) NOT NULL,
                subject TEXT,
                from_email VARCHAR(255),
                reply_to VARCHAR(255),
                campaign_status VARCHAR(50),
                sent_time TIMESTAMPTZ,
                created_time TIMESTAMPTZ,
                campaign_preview TEXT,
                emails_sent_count INT DEFAULT 0,
                delivered_count INT DEFAULT 0,
                delivered_percent NUMERIC(5,2) DEFAULT 0,
                opens_count INT DEFAULT 0,
                open_percent NUMERIC(5,2) DEFAULT 0,
                unique_clicked_percent NUMERIC(5,2) DEFAULT 0,
                bounces_count INT DEFAULT 0,
                bounce_percent NUMERIC(5,2) DEFAULT 0,
                unsubscribes_count INT DEFAULT 0,
                unsub_percent NUMERIC(5,2) DEFAULT 0,
                raw_report JSONB DEFAULT '{}'::jsonb,
                synced_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_zoho_camp_sent_time ON zoho_campaigns(sent_time);
            CREATE INDEX IF NOT EXISTS idx_zoho_camp_status ON zoho_campaigns(campaign_status);

            CREATE TABLE IF NOT EXISTS zoho_lists (
                list_key VARCHAR(150) PRIMARY KEY,
                list_name VARCHAR(255) NOT NULL,
                contacts_count INT DEFAULT 0,
                unsub_count INT DEFAULT 0,
                bounce_count INT DEFAULT 0,
                created_time TIMESTAMPTZ,
                synced_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Zoho Newsletter Clicked Recipients and Links Table
            CREATE TABLE IF NOT EXISTS zoho_clicks (
                id SERIAL PRIMARY KEY,
                campaign_key VARCHAR(150) NOT NULL,
                campaign_name VARCHAR(255),
                contact_email VARCHAR(255) NOT NULL,
                contact_name VARCHAR(255),
                clicked_url TEXT NOT NULL,
                click_count INT DEFAULT 1,
                clicked_at TIMESTAMPTZ,
                synced_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(campaign_key, contact_email, clicked_url)
            );

            CREATE INDEX IF NOT EXISTS idx_zoho_clicks_camp ON zoho_clicks(campaign_key);
            CREATE INDEX IF NOT EXISTS idx_zoho_clicks_email ON zoho_clicks(contact_email);
            CREATE INDEX IF NOT EXISTS idx_zoho_clicks_url ON zoho_clicks(clicked_url);

            -- Reply.io Campaigns / Sequences Table
            CREATE TABLE IF NOT EXISTS reply_campaigns (
                id BIGINT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(50),
                deliveries_count INT DEFAULT 0,
                opens_count INT DEFAULT 0,
                replies_count INT DEFAULT 0,
                bounces_count INT DEFAULT 0,
                opt_outs_count INT DEFAULT 0,
                people_count INT DEFAULT 0,
                email_account VARCHAR(255),
                owner_email VARCHAR(255),
                created_time TIMESTAMPTZ,
                synced_at TIMESTAMPTZ DEFAULT NOW()
            );

            ALTER TABLE leads ADD COLUMN IF NOT EXISTS reply_conversations JSONB DEFAULT '[]'::jsonb;

            -- LinkedIn Content Posts Status Table
            CREATE TABLE IF NOT EXISTS content_posts (
                id VARCHAR(50) PRIMARY KEY,
                post_number INT,
                is_posted BOOLEAN DEFAULT false,
                posted_at TIMESTAMPTZ,
                status VARCHAR(50) DEFAULT 'Pending Review',
                notes TEXT,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
    } finally {
        client.release();
    }
}
