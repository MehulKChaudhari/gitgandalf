const VALID_RISKS = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * Parses and validates raw LLM output into a trusted judgment object.
 * This is the trust boundary — anything malformed is rejected.
 * Pure function, no side effects.
 *
 * @param {string} rawOutput - Raw text from the LLM
 * @returns {{ risk: string, issues: string[], summary: string }}
 * @throws {Error} If output is not valid JSON or fails schema validation
 */
export function normalizeJudgment(rawOutput) {
    if (typeof rawOutput !== 'string' || rawOutput.trim().length === 0) {
        throw new Error('LLM returned empty output');
    }

    let parsed;

    try {
        parsed = JSON.parse(rawOutput);
    } catch {
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('LLM output is not valid JSON');
        }
        try {
            parsed = JSON.parse(jsonMatch[0]);
        } catch {
            throw new Error('LLM output is not valid JSON');
        }
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('LLM output is not a JSON object');
    }

    const { risk, issues, summary } = parsed;

    if (!VALID_RISKS.includes(risk)) {
        throw new Error(`Invalid risk level: "${risk}". Must be LOW, MEDIUM, or HIGH`);
    }

    if (!Array.isArray(issues)) {
        throw new Error('Missing or invalid "issues" array');
    }

    for (const issue of issues) {
        if (typeof issue !== 'string') {
            throw new Error('Each issue must be a string');
        }
    }

    if (typeof summary !== 'string' || summary.trim().length === 0) {
        throw new Error('Missing or empty "summary"');
    }

    return {
        risk,
        issues,
        summary: summary.trim(),
    };
}
