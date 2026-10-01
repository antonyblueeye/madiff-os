import { Pool } from "pg";

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:8876700@127.0.0.1:5432/madiff";

declare global {
    var _pgPool: Pool | undefined;
    var _isDbInitialized: boolean | undefined;
}

const isProduction = process.env.NODE_ENV === "production";
const isCloudDb = connectionString.includes("sslmode=require") || connectionString.includes("neon.tech") || connectionString.includes("supabase") || connectionString.includes("railway");

const poolConfig = {
    connectionString,
    ssl: isCloudDb || (isProduction && !connectionString.includes("127.0.0.1") && !connectionString.includes("localhost"))
        ? { rejectUnauthorized: false }
        : false,
};

let pool: Pool;

if (isProduction) {
    pool = new Pool(poolConfig);
} else {
    if (!global._pgPool) {
        global._pgPool = new Pool(poolConfig);
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
            ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedin_conversations JSONB DEFAULT '[]'::jsonb;

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

            -- LinkedHelper Webhook Events Log Table
            CREATE TABLE IF NOT EXISTS linkedhelper_events (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(100),
                campaign_id VARCHAR(100),
                campaign_name VARCHAR(255),
                action_name VARCHAR(255),
                profile_id VARCHAR(100),
                profile_url TEXT,
                full_name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(100),
                company VARCHAR(255),
                occupation VARCHAR(255),
                raw_payload JSONB NOT NULL,
                processed_status VARCHAR(50) DEFAULT 'received',
                lead_id VARCHAR(100),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_lh_created_at ON linkedhelper_events(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_lh_email ON linkedhelper_events(email);
            CREATE INDEX IF NOT EXISTS idx_lh_profile_url ON linkedhelper_events(profile_url);
            CREATE INDEX IF NOT EXISTS idx_lh_event_type ON linkedhelper_events(event_type);

            -- Automated Scheduled Daily Sync Logs Table
            CREATE TABLE IF NOT EXISTS scheduled_sync_logs (
                id SERIAL PRIMARY KEY,
                started_at TIMESTAMPTZ DEFAULT NOW(),
                completed_at TIMESTAMPTZ,
                status VARCHAR(50) DEFAULT 'running',
                trigger_source VARCHAR(50) DEFAULT 'scheduler_daily_9am',
                steps JSONB DEFAULT '[]'::jsonb,
                summary TEXT,
                error TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON scheduled_sync_logs(started_at DESC);

            -- Vacancy Searches & Saved Queries
            CREATE TABLE IF NOT EXISTS vacancy_searches (
                id SERIAL PRIMARY KEY,
                query VARCHAR(255) NOT NULL,
                location VARCHAR(255) DEFAULT 'Poland',
                total_found INT DEFAULT 0,
                last_synced_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(query, location)
            );

            -- Vacancies Aggregator Table
            CREATE TABLE IF NOT EXISTS vacancies (
                id SERIAL PRIMARY KEY,
                search_query VARCHAR(255) NOT NULL,
                canonical_key VARCHAR(255) NOT NULL, -- normalized slug: company + title
                title VARCHAR(255) NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                is_remote BOOLEAN DEFAULT false,
                sources JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name": "NoFluffJobs", "url": "https://..."}, {"name": "Remotive", "url": "..."}]
                primary_url TEXT NOT NULL,
                salary_from NUMERIC(10,2),
                salary_to NUMERIC(10,2),
                salary_currency VARCHAR(10) DEFAULT 'PLN',
                salary_type VARCHAR(50),
                description TEXT,
                requirements JSONB DEFAULT '[]'::jsonb,
                posted_at TIMESTAMPTZ,
                status VARCHAR(50) DEFAULT 'active', -- 'active' | 'inactive' | 'archived'
                is_active BOOLEAN DEFAULT true,
                engine_id INT,
                processed_by_engines INT[] DEFAULT ARRAY[]::INT[],
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(canonical_key)
            );

            ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS engine_id INT;
            ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS processed_by_engines INT[] DEFAULT ARRAY[]::INT[];

            CREATE INDEX IF NOT EXISTS idx_vacancies_search_query ON vacancies(search_query);
            CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
            CREATE INDEX IF NOT EXISTS idx_vacancies_is_active ON vacancies(is_active);
            CREATE INDEX IF NOT EXISTS idx_vacancies_company ON vacancies(company_name);
            CREATE INDEX IF NOT EXISTS idx_vacancies_posted_at ON vacancies(posted_at DESC);

            -- Outbound AI Engines Table
            CREATE TABLE IF NOT EXISTS outbound_engines (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                target_role VARCHAR(255) NOT NULL,
                role_description TEXT NOT NULL,
                scrape_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
                scrape_location VARCHAR(255) DEFAULT 'Poland',
                target_titles TEXT[] DEFAULT ARRAY[]::TEXT[],
                target_industries TEXT[] DEFAULT ARRAY[]::TEXT[],
                employee_ranges TEXT[] DEFAULT ARRAY[]::TEXT[],
                leads_per_run INT DEFAULT 25,
                reply_campaign_id BIGINT,
                reply_campaign_name VARCHAR(255),
                email_subject TEXT,
                email_body TEXT,
                enable_ai_filter BOOLEAN DEFAULT true,
                status VARCHAR(50) DEFAULT 'active', -- 'active' | 'paused' | 'archived'
                frequency VARCHAR(50) DEFAULT 'daily', -- 'manual' | 'hourly' | 'daily' | 'weekly'
                last_run_at TIMESTAMPTZ,
                next_run_at TIMESTAMPTZ,
                stats JSONB DEFAULT '{"totalScraped":0,"aiApproved":0,"aiRejected":0,"leadsFound":0,"pushedToReply":0}'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            ALTER TABLE outbound_engines ADD COLUMN IF NOT EXISTS enable_ai_filter BOOLEAN DEFAULT true;

            CREATE INDEX IF NOT EXISTS idx_engines_status ON outbound_engines(status);

            -- Engine Execution Runs Log
            CREATE TABLE IF NOT EXISTS engine_runs (
                id SERIAL PRIMARY KEY,
                engine_id INT NOT NULL REFERENCES outbound_engines(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'running', -- 'running' | 'completed' | 'failed'
                started_at TIMESTAMPTZ DEFAULT NOW(),
                completed_at TIMESTAMPTZ,
                scraped_count INT DEFAULT 0,
                approved_count INT DEFAULT 0,
                rejected_count INT DEFAULT 0,
                leads_count INT DEFAULT 0,
                pushed_count INT DEFAULT 0,
                logs JSONB DEFAULT '[]'::jsonb,
                error_message TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_engine_runs_engine_id ON engine_runs(engine_id);
            CREATE INDEX IF NOT EXISTS idx_engine_runs_started_at ON engine_runs(started_at DESC);
        `);
    } finally {
        client.release();
    }
}
