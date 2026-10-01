export interface GeminiValidationResult {
    vacancyTitle: string;
    companyName: string;
    isRelevant: boolean;
    confidenceScore: number; // 0 to 100
    reason: string;
}

/**
 * Validates a batch of scraped vacancies against the target role title and description using Gemini 3.8 Flash.
 */
export async function validateVacanciesWithGemini(params: {
    targetRole: string;
    roleDescription: string;
    vacancies: Array<{
        title: string;
        companyName: string;
        description: string;
        requirements: string[];
    }>;
}): Promise<GeminiValidationResult[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || params.vacancies.length === 0) {
        return params.vacancies.map((v) => ({
            vacancyTitle: v.title,
            companyName: v.companyName,
            isRelevant: true,
            confidenceScore: 50,
            reason: "AI validation skipped (no key or vacancies)",
        }));
    }

    const systemPrompt = `You are an expert technical talent qualification AI.
Your task is to analyze candidate job postings and strictly verify if they match the TARGET ROLE.
Many job boards return false positives (e.g. searching for "AI Engineer" might return "Design Engineer", "Civil Engineer", "Sales Engineer", or other unrelated positions).

TARGET ROLE: ${params.targetRole}
EVALUATION CRITERIA: ${params.roleDescription}

For each posting, return true if it is legitimately hiring for the target role, or false if it is unrelated.
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "index": number,
    "isRelevant": boolean,
    "confidenceScore": number (0-100),
    "reason": "Short explanation why relevant or rejected"
  }
]`;

    // Process in batches of 35 to prevent payload limits and 503 timeouts
    const batchSize = 35;
    const finalResults: GeminiValidationResult[] = [];

    for (let i = 0; i < params.vacancies.length; i += batchSize) {
        const chunk = params.vacancies.slice(i, i + batchSize);
        const userPrompt = `Evaluate these postings:\n${JSON.stringify(
            chunk.map((v, localIdx) => ({
                index: localIdx,
                title: v.title,
                company: v.companyName,
                requirements: v.requirements?.slice(0, 5),
                descriptionPreview: (v.description || "").slice(0, 200),
            })),
            null,
            2
        )}`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.1,
                            responseMimeType: "application/json",
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errText = await response.text();
                console.error("[Gemini API Error]", response.status, errText);
                // On failure for this chunk, fallback
                chunk.forEach((v) => {
                    finalResults.push({
                        vacancyTitle: v.title,
                        companyName: v.companyName,
                        isRelevant: true,
                        confidenceScore: 50,
                        reason: `AI API returned status ${response.status}`,
                    });
                });
                continue;
            }

            const data = await response.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
            const parsedArray: any[] = JSON.parse(rawContent);

            chunk.forEach((v, localIdx) => {
                const evalItem = parsedArray.find((item: any) => item.index === localIdx) || parsedArray[localIdx];
                finalResults.push({
                    vacancyTitle: v.title,
                    companyName: v.companyName,
                    isRelevant: evalItem ? Boolean(evalItem.isRelevant) : true,
                    confidenceScore: evalItem?.confidenceScore ?? 75,
                    reason: evalItem?.reason || "Evaluated by Gemini",
                });
            });
        } catch (err: any) {
            console.error("[Gemini Chunk Error]:", err.message);
            chunk.forEach((v) => {
                finalResults.push({
                    vacancyTitle: v.title,
                    companyName: v.companyName,
                    isRelevant: true,
                    confidenceScore: 50,
                    reason: `Evaluation error: ${err.message}`,
                });
            });
        }
    }

    return finalResults;
}
