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

    const systemPrompt = `You are an expert technical recruiter and talent qualification AI.
Your task is to analyze candidate job postings found online and determine if they truly match the target hiring requirements.
Many job boards return false positives (e.g. searching for "AI Engineer" might return "Design Engineer", "Sales Engineer", or unrelated roles).

TARGET ROLE: ${params.targetRole}
ROLE DESCRIPTION & IDEAL SKILLS: ${params.roleDescription}

Analyze the provided list of job postings. For each posting, decide whether this company is legitimately hiring for the TARGET ROLE.
Return ONLY valid JSON matching this exact array structure:
[
  {
    "index": number,
    "isRelevant": boolean,
    "confidenceScore": number (0-100),
    "reason": "Brief explanation of why it is relevant or why it was rejected"
  }
]`;

    const userPrompt = `Here is the list of job postings to evaluate:
${JSON.stringify(
    params.vacancies.map((v, idx) => ({
        index: idx,
        title: v.title,
        company: v.companyName,
        techStack: v.requirements,
        descriptionPreview: v.description.slice(0, 300),
    })),
    null,
    2
)}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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
            // Fallback: accept all
            return params.vacancies.map((v) => ({
                vacancyTitle: v.title,
                companyName: v.companyName,
                isRelevant: true,
                confidenceScore: 60,
                reason: "Fallback: Gemini evaluation call failed",
            }));
        }

        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const parsedArray: any[] = JSON.parse(rawContent);

        return params.vacancies.map((v, idx) => {
            const evaluation = parsedArray.find((item: any) => item.index === idx) || parsedArray[idx];
            return {
                vacancyTitle: v.title,
                companyName: v.companyName,
                isRelevant: evaluation ? Boolean(evaluation.isRelevant) : true,
                confidenceScore: evaluation?.confidenceScore ?? 70,
                reason: evaluation?.reason || "Matched by AI classifier",
            };
        });
    } catch (err: any) {
        console.error("[Gemini Classification Exception]:", err.message);
        return params.vacancies.map((v) => ({
            vacancyTitle: v.title,
            companyName: v.companyName,
            isRelevant: true,
            confidenceScore: 50,
            reason: `Error during evaluation: ${err.message}`,
        }));
    }
}
