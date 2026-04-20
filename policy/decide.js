const POLICY = {
    LOW: 'ALLOW',
    MEDIUM: 'WARN',
    HIGH: 'BLOCK',
};

/**
 * Maps a normalized risk level to a policy decision.
 * Pure function, no configuration, no overrides.
 *
 * @param {string} risk - One of "LOW", "MEDIUM", "HIGH"
 * @returns {"ALLOW" | "WARN" | "BLOCK"}
 * @throws {Error} If risk is not a valid level
 */
export function decide(risk) {
    const decision = POLICY[risk];
    if (!decision) {
        throw new Error(`Unknown risk level: "${risk}"`);
    }
    return decision;
}
