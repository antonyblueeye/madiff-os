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

export interface ScraperSourceInfo {
    id: string;
    name: string;
    region: "Poland" | "Global" | "Europe";
    badge: string;
    description: string;
    website: string;
    status: "Live Active" | "Active";
}

export const SUPPORTED_JOB_SOURCES: ScraperSourceInfo[] = [
    {
        id: "nofluffjobs",
        name: "NoFluffJobs",
        region: "Poland",
        badge: "PL #1 Tech",
        description: "Ведущий польский портал с прозрачными зарплатными вилками в PLN и B2B/UoP.",
        website: "https://nofluffjobs.com",
        status: "Live Active",
    },
    {
        id: "remotive",
        name: "Remotive",
        region: "Global",
        badge: "Worldwide Tech",
        description: "Крупнейшее мировое сообщество и портал удаленной работы для разработчиков и инженеров.",
        website: "https://remotive.com",
        status: "Live Active",
    },
    {
        id: "jobicy",
        name: "Jobicy",
        region: "Europe",
        badge: "EU & Global",
        description: "Международный агрегатор вакансий для инженеров с фильтрацией по Европе и Remote.",
        website: "https://jobicy.com",
        status: "Live Active",
    },
    {
        id: "remoteok",
        name: "RemoteOK",
        region: "Global",
        badge: "Top Global Remote",
        description: "Один из популярнейших международных порталов для найма AI, Web и Cloud инженеров.",
        website: "https://remoteok.com",
        status: "Live Active",
    },
    {
        id: "wwr",
        name: "WeWorkRemotely",
        region: "Global",
        badge: "International",
        description: "Классический мировой портал с проверенными работодателями и контрактами.",
        website: "https://weworkremotely.com",
        status: "Live Active",
    },
];

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
 * 1. Scrapes NoFluffJobs for Poland & remote jobs matching query
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

        if (!response.ok) return [];

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
 * 2. Scrapes Remotive Remote jobs (Global / Europe)
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
 * 3. Scrapes Jobicy (Europe & Worldwide tech jobs)
 */
export async function scrapeJobicy(query: string): Promise<VacancyItem[]> {
    try {
        const url = `https://jobicy.com/api/v2/remote-jobs?count=50&industry=engineering`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            next: { revalidate: 0 },
        });

        if (!response.ok) return [];

        const data = await response.json();
        const jobs: any[] = data.jobs || [];

        const queryLower = query.toLowerCase().trim();
        const queryTerms = queryLower.split(/\s+/).filter(Boolean);

        const filtered = jobs.filter((j) => {
            const combined = `${j.jobTitle || ""} ${j.companyName || ""} ${j.jobDescription || ""}`.toLowerCase();
            return queryTerms.some((term) => combined.includes(term));
        });

        return filtered.slice(0, 25).map((j) => {
            const companyName = j.companyName || "Unknown Company";
            const title = j.jobTitle || "Job Offer";
            const canonicalKey = generateCanonicalKey(companyName, title);

            const cleanDescription = (j.jobDescription || "")
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 300);

            return {
                canonicalKey,
                searchQuery: queryLower,
                title,
                companyName,
                location: j.jobGeo || "Europe / Remote",
                isRemote: true,
                sources: [
                    {
                        name: "Jobicy",
                        url: j.url,
                    },
                ],
                primaryUrl: j.url,
                salaryFrom: j.annualSalaryMin ? Number(j.annualSalaryMin) : null,
                salaryTo: j.annualSalaryMax ? Number(j.annualSalaryMax) : null,
                salaryCurrency: j.salaryCurrency || "USD",
                salaryType: "Annual",
                description: cleanDescription || `Remote position for ${title}`,
                requirements: (j.jobExcerpt ? [j.jobExcerpt.slice(0, 40)] : []).concat(j.jobType ? [j.jobType] : []),
                postedAt: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
                status: "active",
                isActive: true,
            };
        });
    } catch (err: any) {
        console.error("[Jobicy] Scraping error:", err.message);
        return [];
    }
}

/**
 * 4. Scrapes RemoteOK (Top Global Tech & AI jobs)
 */
export async function scrapeRemoteOK(query: string): Promise<VacancyItem[]> {
    try {
        const url = "https://remoteok.com/api";
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            },
            next: { revalidate: 0 },
        });

        if (!response.ok) return [];

        const data: any[] = await response.json();
        // The first element in remoteok api is usually legal disclaimer/metadata object
        const jobs = data.filter((item) => item.id && item.position);

        const queryLower = query.toLowerCase().trim();
        const queryTerms = queryLower.split(/\s+/).filter(Boolean);

        const filtered = jobs.filter((j) => {
            const combined = `${j.position || ""} ${j.company || ""} ${(j.tags || []).join(" ")}`.toLowerCase();
            return queryTerms.some((term) => combined.includes(term));
        });

        return filtered.slice(0, 25).map((j) => {
            const companyName = j.company || "Unknown Company";
            const title = j.position || "Job Offer";
            const canonicalKey = generateCanonicalKey(companyName, title);
            const primaryUrl = j.url || `https://remoteok.com/remote-jobs/${j.id}`;

            return {
                canonicalKey,
                searchQuery: queryLower,
                title,
                companyName,
                location: j.location || "Worldwide Remote",
                isRemote: true,
                sources: [
                    {
                        name: "RemoteOK",
                        url: primaryUrl,
                    },
                ],
                primaryUrl,
                salaryFrom: j.salary_min ? Number(j.salary_min) : null,
                salaryTo: j.salary_max ? Number(j.salary_max) : null,
                salaryCurrency: "USD",
                salaryType: "Annual",
                description: `Remote opportunity at ${companyName}. Key focus: ${(j.tags || []).slice(0, 5).join(", ")}.`,
                requirements: (j.tags || []).slice(0, 6),
                postedAt: j.date ? new Date(j.date).toISOString() : new Date().toISOString(),
                status: "active",
                isActive: true,
            };
        });
    } catch (err: any) {
        console.error("[RemoteOK] Scraping error:", err.message);
        return [];
    }
}

/**
 * 5. Scrapes WeWorkRemotely RSS feed
 */
export async function scrapeWeWorkRemotely(query: string): Promise<VacancyItem[]> {
    try {
        const url = "https://weworkremotely.com/remote-jobs.rss";
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            next: { revalidate: 0 },
        });

        if (!response.ok) return [];

        const xmlText = await response.text();
        const items = xmlText.split("<item>").slice(1);

        const queryLower = query.toLowerCase().trim();
        const queryTerms = queryLower.split(/\s+/).filter(Boolean);

        const results: VacancyItem[] = [];

        for (const item of items) {
            const rawTitle = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
            const region = item.match(/<region>(.*?)<\/region>/)?.[1] || "Remote";
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

            if (!rawTitle || !link) continue;

            const titleLower = rawTitle.toLowerCase();
            const matchesQuery = queryTerms.some((term) => titleLower.includes(term));
            if (!matchesQuery) continue;

            // WWR titles are usually "Company: Job Title"
            let companyName = "WWR Partner";
            let jobTitle = rawTitle;
            if (rawTitle.includes(":")) {
                const parts = rawTitle.split(":");
                companyName = parts[0].trim();
                jobTitle = parts.slice(1).join(":").trim();
            }

            const canonicalKey = generateCanonicalKey(companyName, jobTitle);

            results.push({
                canonicalKey,
                searchQuery: queryLower,
                title: jobTitle,
                companyName,
                location: region,
                isRemote: true,
                sources: [
                    {
                        name: "WeWorkRemotely",
                        url: link,
                    },
                ],
                primaryUrl: link,
                salaryFrom: null,
                salaryTo: null,
                salaryCurrency: "USD",
                salaryType: "Remote",
                description: `Verified remote opening listed on WeWorkRemotely. Location: ${region}.`,
                requirements: ["Remote", "Global"],
                postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                status: "active",
                isActive: true,
            });

            if (results.length >= 25) break;
        }

        return results;
    } catch (err: any) {
        console.error("[WeWorkRemotely] Scraping error:", err.message);
        return [];
    }
}

/**
 * Unified multi-portal aggregator that combines & deduplicates vacancies across ALL resources
 */
export async function aggregatePolishVacancies(query: string): Promise<VacancyItem[]> {
    const [nfjJobs, remotiveJobs, jobicyJobs, remoteOKJobs, wwrJobs] = await Promise.all([
        scrapeNoFluffJobs(query),
        scrapeRemotive(query),
        scrapeJobicy(query),
        scrapeRemoteOK(query),
        scrapeWeWorkRemotely(query),
    ]);

    const deduplicatedMap = new Map<string, VacancyItem>();

    const allBatches = [
        { name: "NoFluffJobs", jobs: nfjJobs },
        { name: "Remotive", jobs: remotiveJobs },
        { name: "Jobicy", jobs: jobicyJobs },
        { name: "RemoteOK", jobs: remoteOKJobs },
        { name: "WeWorkRemotely", jobs: wwrJobs },
    ];

    for (const batch of allBatches) {
        for (const job of batch.jobs) {
            if (deduplicatedMap.has(job.canonicalKey)) {
                const existing = deduplicatedMap.get(job.canonicalKey)!;
                // Add source if not present
                const hasSource = existing.sources.some((s) => s.name === batch.name);
                if (!hasSource) {
                    existing.sources.push({
                        name: batch.name,
                        url: job.primaryUrl,
                    });
                }
                // Merge requirements
                job.requirements.forEach((req) => {
                    if (!existing.requirements.includes(req)) {
                        existing.requirements.push(req);
                    }
                });
                // Merge salary if existing didn't have it
                if (!existing.salaryFrom && job.salaryFrom) {
                    existing.salaryFrom = job.salaryFrom;
                    existing.salaryTo = job.salaryTo;
                    existing.salaryCurrency = job.salaryCurrency;
                    existing.salaryType = job.salaryType;
                }
            } else {
                deduplicatedMap.set(job.canonicalKey, job);
            }
        }
    }

    return Array.from(deduplicatedMap.values());
}
