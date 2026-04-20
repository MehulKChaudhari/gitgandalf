/**
 * Extracts structural metadata from a unified diff string.
 * Pure function — no I/O, no side effects, deterministic.
 *
 * @param {string} rawDiff - The full unified diff text
 * @returns {{ files_changed: number, files: string[], lines_added: number, lines_removed: number }}
 */
export function extractMetadata(rawDiff) {
    if (!rawDiff || rawDiff.trim().length === 0) {
        return { files_changed: 0, files: [], lines_added: 0, lines_removed: 0 };
    }

    const files = [];
    let linesAdded = 0;
    let linesRemoved = 0;

    const lines = rawDiff.split('\n');

    for (const line of lines) {
        if (line.startsWith('diff --git ')) {
            const match = line.match(/diff --git a\/.+ b\/(.+)/);
            if (match) {
                files.push(match[1]);
            }
            continue;
        }

        if (line.startsWith('Binary files ')) {
            continue;
        }

        if (line.startsWith('+++ ') || line.startsWith('--- ')) {
            continue;
        }

        if (line.startsWith('+')) {
            linesAdded++;
            continue;
        }

        if (line.startsWith('-')) {
            linesRemoved++;
        }
    }

    return {
        files_changed: files.length,
        files,
        lines_added: linesAdded,
        lines_removed: linesRemoved,
    };
}
