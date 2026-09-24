import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export async function GET() {
    try {
        await initDb();
        const res = await pool.query("SELECT * FROM content_posts ORDER BY post_number ASC");
        return NextResponse.json({
            success: true,
            posts: res.rows,
        });
    } catch (err: any) {
        console.error("GET /api/content-posts error:", err);
        return NextResponse.json(
            { error: "Failed to fetch content posts", details: err.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { id, isPosted, status, postNumber } = body;

        if (!id) {
            return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
        }

        const postedAtVal = isPosted ? new Date().toISOString() : null;
        const statusVal = status || (isPosted ? "Published" : "Pending Review");

        const res = await pool.query(
            `
            INSERT INTO content_posts (id, post_number, is_posted, posted_at, status, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (id) DO UPDATE SET
                is_posted = EXCLUDED.is_posted,
                posted_at = CASE WHEN EXCLUDED.is_posted THEN NOW() ELSE NULL END,
                status = EXCLUDED.status,
                updated_at = NOW()
            RETURNING *
            `,
            [id, postNumber || 0, isPosted, postedAtVal, statusVal]
        );

        return NextResponse.json({
            success: true,
            post: res.rows[0],
        });
    } catch (err: any) {
        console.error("PATCH /api/content-posts error:", err);
        return NextResponse.json(
            { error: "Failed to update content post", details: err.message },
            { status: 500 }
        );
    }
}
