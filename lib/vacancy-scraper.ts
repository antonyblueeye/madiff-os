export interface JobSource {
    name: string;
    url: string;
}

export interface VacancyItem {
    id?: number;
    canonicalKey: string;
    searchQuery: string;
    title: string;
    companyName: string;
    location: string;
    isRemote: boolean;
    sources: JobSource[];
    primaryUrl: string;
    salaryFrom?: number | null;
    salaryTo?: number | null;
    salaryCurrency?: string;
    salaryType?: string;
    description: string;
    requirements: string[];
    postedAt: string;
    status: "active" | "inactive" | "archived";
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface VacancySearchRecord {
    id: number;
    query: string;
    location: string;
    total_found: number;
    last_synced_at: string;
    created_at: string;
}

// Canonical key generator for deduplication across platforms
export function generateCanonicalKey(company: string, title: string): string {
    const cleanCompany = (company || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 30);
    const cleanTitle = (title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 40);
    return `${cleanCompany}___${cleanTitle}`;
}

/**
 * Scrapes NoFluffJobs for Poland & remote jobs matching query
 */
export async function scrapeNoFluffJobs(query: string): Promise<VacancyItem[]> {
    try {
        const url = "https://nofluffjobs.com/api/search/posting?salaryCurrency=PLN&salaryPeriod=month";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                rawSearch: query,
            }),
            next: { revalidate: 0 },
        });

        if (!response.ok) {
            console.error(`[NoFluffJobs] Search responded with status ${response.status}`);
            return [];
        }

        const data = await response.json();
        const postings: any[] = data.postings || [];

        return postings.map((p) => {
            const companyName = p.name || "Unknown Company";
            const title = p.title || "Job Offer";
            const canonicalKey = generateCanonicalKey(companyName, title);
            const jobSlug = p.url || p.id;
            const primaryUrl = `https://nofluffjobs.com/job/${jobSlug}`;

            const locationPlace = p.location?.places?.[0]?.city || (p.fullyRemote ? "Remote" : "Poland");
            const requirements: string[] = [];
            if (p.technology) requirements.push(p.technology);
            if (p.tiles?.values) {
                p.tiles.values.forEach((v: any) => {
                    if (v.value && !requirements.includes(v.value)) {
                        requirements.push(v.value);
                    }
                });
            }

            const salary = p.salary;

            return {
                canonicalKey,
                searchQuery: query.toLowerCase().trim(),
                title,
                companyName,
                location: locationPlace,
                isRemote: Boolean(p.fullyRemote),
                sources: [
                    {
                        name: "NoFluffJobs",
                        url: primaryUrl,
                    },
                ],
                primaryUrl,
                salaryFrom: salary?.from ?? null,
                salaryTo: salary?.to ?? null,
                salaryCurrency: salary?.currency || "PLN",
                salaryType: salary?.type || "b2b",
                description: `Category: ${p.category || "IT"} | Seniority: ${(p.seniority || []).join(", ") || "Not specified"}. Required stack: ${requirements.join(", ")}`,
                requirements,
                postedAt: p.posted ? new Date(p.posted).toISOString() : new Date().toISOString(),
                status: "active",
                isActive: true,
            };
        });
    } catch (err: any) {
        console.error("[NoFluffJobs] Scraping error:", err.message);
        return [];
    }
}

/**
 * Scrapes Remotive Remote jobs as a secondary cross-matching resource
 */
export async function scrapeRemotive(query: string): Promise<VacancyItem[]> {
    try {
        const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            next: { revalidate: 0 },
        });

        if (!response.ok) return [];

        const data = await response.json();
        const jobs: any[] = data.jobs || [];

        return jobs.slice(0, 30).map((j) => {
            const companyName = j.company_name || "Unknown Company";
            const title = j.title || "Job Offer";
            const canonicalKey = generateCanonicalKey(companyName, title);
            const primaryUrl = j.url;

            const cleanDescription = (j.description || "")
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 300);

            return {
                canonicalKey,
                searchQuery: query.toLowerCase().trim(),
                title,
                companyName,
                location: j.candidate_required_location || "Worldwide / Remote",
                isRemote: true,
                sources: [
                    {
                        name: "Remotive",
                        url: primaryUrl,
                    },
                ],
                primaryUrl,
                salaryFrom: null,
                salaryTo: null,
                salaryCurrency: "USD",
                salaryType: "Remote",
                description: cleanDescription || `Remote position for ${title}`,
                requirements: (j.tags || []).slice(0, 6),
                postedAt: j.publication_date ? new Date(j.publication_date).toISOString() : new Date().toISOString(),
                status: "active",
                isActive: true,
            };
        });
    } catch (err: any) {
        console.error("[Remotive] Scraping error:", err.message);
        return [];
    }
}

/**
 * Unified multi-portal aggregator that combines & deduplicates vacancies across resources
 */
export async function aggregatePolishVacancies(query: string): Promise<VacancyItem[]> {
    const [nfjJobs, remotiveJobs] = await Promise.all([
        scrapeNoFluffJobs(query),
        scrapeRemotive(query),
    ]);

    const deduplicatedMap = new Map<string, VacancyItem>();

    // Process primary Polish source (NoFluffJobs)
    for (const job of nfjJobs) {
        deduplicatedMap.set(job.canonicalKey, job);
    }

    // Merge or append secondary source (Remotive)
    for (const job of remotiveJobs) {
        if (deduplicatedMap.has(job.canonicalKey)) {
            const existing = deduplicatedMap.get(job.canonicalKey)!;
            // Merge source platforms so both are displayed
            const hasSource = existing.sources.some((s) => s.name === "Remotive");
            if (!hasSource) {
                existing.sources.push({
                    name: "Remotive",
                    url: job.primaryUrl,
                });
            }
            // Enhance requirements if missing
            job.requirements.forEach((req) => {
                if (!existing.requirements.includes(req)) {
                    existing.requirements.push(req);
                }
            });
        } else {
            // Also include remote match if relevant
            deduplicatedMap.set(job.canonicalKey, job);
        }
    }

    return Array.from(deduplicatedMap.values());
}
