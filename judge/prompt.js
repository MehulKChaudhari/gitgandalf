import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = readFileSync(join(__dirname, 'prompt.v1.txt'), 'utf-8');

/**
 * Builds the messages array for the LLM call.
 * Combines the system prompt with the diff metadata and raw diff.
 *
 * @param {{ files_changed: number, files: string[], lines_added: number, lines_removed: number }} metadata
 * @param {string} rawDiff
 * @returns {Array<{ role: string, content: string }>}
 */
export function buildMessages(metadata, rawDiff) {
    const userContent = [
        '## Diff Metadata',
        `Files changed: ${metadata.files_changed}`,
        `Files: ${metadata.files.join(', ')}`,
        `Lines added: ${metadata.lines_added}`,
        `Lines removed: ${metadata.lines_removed}`,
        '',
        '## Raw Diff',
        rawDiff,
    ].join('\n');

    return [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
    ];
}
