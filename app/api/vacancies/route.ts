import { NextRequest, NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { aggregatePolishVacancies } from "@/lib/vacancy-scraper";

export async function GET(req: NextRequest) {
    try {
        await initDb();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query")?.trim() || "";
        const searchId = searchParams.get("searchId");
        const status = searchParams.get("status") || "active"; // active | all | inactive

        const client = await pool.connect();
        try {
            // 1. Fetch saved searches
            const searchesRes = await client.query(`
                SELECT id, query, location, total_found, last_synced_at, created_at
                FROM vacancy_searches
                ORDER BY last_synced_at DESC
            `);

            // 2. Fetch vacancies based on criteria
            let vacanciesQuery = `
                SELECT id, search_query, canonical_key, title, company_name, location,
                       is_remote, sources, primary_url, salary_from, salary_to,
                       salary_currency, salary_type, description, requirements,
                       posted_at, status, is_active, created_at, updated_at
                FROM vacancies
                WHERE 1=1
            `;
            const params: any[] = [];

            if (status === "active") {
                params.push(true);
                vacanciesQuery += ` AND is_active = $${params.length}`;
            } else if (status === "inactive") {
                params.push(false);
                vacanciesQuery += ` AND is_active = $${params.length}`;
            }

            if (query) {
                params.push(`%${query.toLowerCase()}%`);
                vacanciesQuery += ` AND (LOWER(search_query) LIKE $${params.length} OR LOWER(title) LIKE $${params.length} OR LOWER(company_name) LIKE $${params.length})`;
            }

            vacanciesQuery += ` ORDER BY is_active DESC, posted_at DESC NULLS LAST LIMIT 200`;

            const vacanciesRes = await client.query(vacanciesQuery, params);

            return NextResponse.json({
                success: true,
                searches: searchesRes.rows,
                vacancies: vacanciesRes.rows.map((row) => ({
                    id: row.id,
                    canonicalKey: row.canonical_key,
                    searchQuery: row.search_query,
                    title: row.title,
                    companyName: row.company_name,
                    location: row.location,
                    isRemote: row.is_remote,
                    sources: row.sources || [],
                    primaryUrl: row.primary_url,
                    salaryFrom: row.salary_from ? parseFloat(row.salary_from) : null,
                    salaryTo: row.salary_to ? parseFloat(row.salary_to) : null,
                    salaryCurrency: row.salary_currency,
                    salaryType: row.salary_type,
                    description: row.description,
                    requirements: row.requirements || [],
                    postedAt: row.posted_at,
                    status: row.status,
                    isActive: row.is_active,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                })),
            });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error("[API vacancies GET] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Run a new search or refresh an existing search
export async function POST(req: NextRequest) {
    try {
        await initDb();
        const body = await req.json();
        const query = (body.query || "").trim();
        const location = (body.location || "Poland").trim();

        if (!query) {
            return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
        }

        const normalizedQuery = query.toLowerCase();

        // 1. Fetch fresh aggregated vacancies from portals
        const freshVacancies = await aggregatePolishVacancies(query);

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // 2. Mark older vacancies for this query as inactive (soft delete as requested)
            // They will be updated to active if still present in fresh results
            await client.query(
                `UPDATE vacancies 
                 SET is_active = false, status = 'inactive', updated_at = NOW() 
                 WHERE LOWER(search_query) = $1`,
                [normalizedQuery]
            );

            let insertedCount = 0;
            let updatedCount = 0;

            // 3. Upsert newly found vacancies and mark them as active
            for (const item of freshVacancies) {
                const upsertRes = await client.query(
                    `
                    INSERT INTO vacancies (
                        search_query, canonical_key, title, company_name, location,
                        is_remote, sources, primary_url, salary_from, salary_to,
                        salary_currency, salary_type, description, requirements,
                        posted_at, status, is_active, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11, $12, $13, $14,
                        $15, 'active', true, NOW()
                    )
                    ON CONFLICT (canonical_key) DO UPDATE SET
                        search_query = EXCLUDED.search_query,
                        title = EXCLUDED.title,
                        company_name = EXCLUDED.company_name,
                        location = EXCLUDED.location,
                        is_remote = EXCLUDED.is_remote,
                        sources = EXCLUDED.sources,
                        primary_url = EXCLUDED.primary_url,
                        salary_from = COALESCE(EXCLUDED.salary_from, vacancies.salary_from),
                        salary_to = COALESCE(EXCLUDED.salary_to, vacancies.salary_to),
                        description = EXCLUDED.description,
                        requirements = EXCLUDED.requirements,
                        status = 'active',
                        is_active = true,
                        updated_at = NOW()
                    RETURNING (xmax = 0) AS is_inserted
                    `,
                    [
                        normalizedQuery,
                        item.canonicalKey,
                        item.title,
                        item.companyName,
                        item.location,
                        item.isRemote,
                        JSON.stringify(item.sources),
                        item.primaryUrl,
                        item.salaryFrom,
                        item.salaryTo,
                        item.salaryCurrency,
                        item.salaryType,
                        item.description,
                        JSON.stringify(item.requirements),
                        item.postedAt,
                    ]
                );

                if (upsertRes.rows[0]?.is_inserted) {
                    insertedCount++;
                } else {
                    updatedCount++;
                }
            }

            // 4. Save or update the search in vacancy_searches table
            const searchUpsert = await client.query(
                `
                INSERT INTO vacancy_searches (query, location, total_found, last_synced_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (query, location) DO UPDATE SET
                    total_found = $3,
                    last_synced_at = NOW()
                RETURNING id, query, location, total_found, last_synced_at, created_at
                `,
                [query, location, freshVacancies.length]
            );

            await client.query("COMMIT");

            return NextResponse.json({
                success: true,
                query,
                totalFound: freshVacancies.length,
                inserted: insertedCount,
                updated: updatedCount,
                search: searchUpsert.rows[0],
            });
        } catch (dbErr: any) {
            await client.query("ROLLBACK");
            throw dbErr;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error("[API vacancies POST] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a saved search (and optionally cascade or archive its vacancies)
export async function DELETE(req: NextRequest) {
    try {
        await initDb();
        const { searchParams } = new URL(req.url);
        const searchId = searchParams.get("id");
        const query = searchParams.get("query")?.trim();

        if (!searchId && !query) {
            return NextResponse.json({ success: false, error: "Search ID or query required" }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            let targetQuery = query;
            if (searchId) {
                const s = await client.query(`SELECT query FROM vacancy_searches WHERE id = $1`, [searchId]);
                if (s.rows.length > 0) {
                    targetQuery = s.rows[0].query;
                }
                await client.query(`DELETE FROM vacancy_searches WHERE id = $1`, [searchId]);
            } else if (query) {
                await client.query(`DELETE FROM vacancy_searches WHERE LOWER(query) = LOWER($1)`, [query]);
            }

            if (targetQuery) {
                // Mark associated vacancies as inactive / deleted
                await client.query(
                    `UPDATE vacancies 
                     SET is_active = false, status = 'archived', updated_at = NOW() 
                     WHERE LOWER(search_query) = LOWER($1)`,
                    [targetQuery]
                );
            }

            await client.query("COMMIT");
            return NextResponse.json({ success: true, message: "Search removed and vacancies archived." });
        } catch (dbErr: any) {
            await client.query("ROLLBACK");
            throw dbErr;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error("[API vacancies DELETE] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
