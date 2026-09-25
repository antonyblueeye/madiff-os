import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/apollo/search
 * Search Apollo database without consuming credits (mixed_people/api_search)
 * Returns total count and preview of matching contacts
 */
export async function POST(req: Request) {
    const apiKey = process.env.APOLLO_KEY || process.env.APOLLO_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "APOLLO_KEY is not defined in environment variables" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const {
            jobTitles,
            locations,
            employeeRanges,
            industries,
            keywords,
            emailStatus = "verified", // "verified" | "any"
            page = 1,
            perPage = 10,
        } = body;

        const apolloPayload: Record<string, any> = {
            page: Number(page) || 1,
            per_page: Math.min(Number(perPage) || 10, 100),
        };

        // Titles
        if (jobTitles && Array.isArray(jobTitles) && jobTitles.length > 0) {
            apolloPayload.person_titles = jobTitles.filter(Boolean);
        } else if (typeof jobTitles === "string" && jobTitles.trim()) {
            apolloPayload.person_titles = jobTitles.split(",").map((s: string) => s.trim()).filter(Boolean);
        }

        // Locations
        if (locations && Array.isArray(locations) && locations.length > 0) {
            apolloPayload.person_locations = locations.filter(Boolean);
        } else if (typeof locations === "string" && locations.trim()) {
            apolloPayload.person_locations = locations.split(",").map((s: string) => s.trim()).filter(Boolean);
        }

        // Company headcount ranges
        if (employeeRanges && Array.isArray(employeeRanges) && employeeRanges.length > 0) {
            apolloPayload.organization_num_employees_ranges = employeeRanges.filter(Boolean);
        }

        // Keywords / tags
        const allKeywords: string[] = [];
        if (industries && Array.isArray(industries)) {
            allKeywords.push(...industries.filter(Boolean));
        } else if (typeof industries === "string" && industries.trim()) {
            allKeywords.push(...industries.split(",").map((s: string) => s.trim()).filter(Boolean));
        }
        if (keywords && Array.isArray(keywords)) {
            allKeywords.push(...keywords.filter(Boolean));
        } else if (typeof keywords === "string" && keywords.trim()) {
            allKeywords.push(...keywords.split(",").map((s: string) => s.trim()).filter(Boolean));
        }
        if (allKeywords.length > 0) {
            apolloPayload.q_organization_keyword_tags = allKeywords;
        }

        // Email status
        if (emailStatus === "verified") {
            apolloPayload.contact_email_status = ["verified"];
        }

        const apolloRes = await fetch("https://api.apollo.io/v1/mixed_people/api_search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify(apolloPayload),
        });

        if (!apolloRes.ok) {
            const errData = await apolloRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: "Apollo API search request failed", details: errData.error || errData },
                { status: apolloRes.status }
            );
        }

        const data = await apolloRes.json();

        const previewPeople = (data.people || []).map((p: any) => ({
            id: p.id,
            firstName: p.first_name || "",
            lastNameObfuscated: p.last_name_obfuscated || "",
            title: p.title || "",
            hasEmail: Boolean(p.has_email),
            companyName: p.organization?.name || "",
            hasCity: Boolean(p.has_city),
            hasCountry: Boolean(p.has_country),
            employeeCount: p.organization?.has_employee_count ? "Available" : "Unknown",
        }));

        return NextResponse.json({
            success: true,
            totalEntries: data.total_entries || 0,
            previewPeople,
        });
    } catch (err: any) {
        console.error("POST /api/apollo/search error:", err);
        return NextResponse.json(
            { error: "Internal server error during Apollo search", message: err.message },
            { status: 500 }
        );
    }
}
