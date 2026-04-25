import { describe, it, expect } from 'vitest';
import { buildMessages } from '../judge/prompt.js';

describe('buildMessages', () => {

    const metadata = {
        files_changed: 2,
        files: ['auth/login.js', 'db/user.sql'],
        lines_added: 10,
        lines_removed: 3,
    };
    const rawDiff = '+const x = 1;\n-const y = 2;';

    it('returns an array of two messages', () => {
        const messages = buildMessages(metadata, rawDiff);
        expect(messages).toHaveLength(2);
    });

    it('first message is the system prompt', () => {
        const messages = buildMessages(metadata, rawDiff);
        expect(messages[0].role).toBe('system');
        expect(messages[0].content).toContain('senior software engineer');
        expect(messages[0].content).toContain('"risk"');
    });

    it('second message contains metadata and the raw diff', () => {
        const messages = buildMessages(metadata, rawDiff);
        expect(messages[1].role).toBe('user');
        expect(messages[1].content).toContain('Files changed: 2');
        expect(messages[1].content).toContain('auth/login.js');
        expect(messages[1].content).toContain('Lines added: 10');
        expect(messages[1].content).toContain(rawDiff);
    });

    it('system prompt demands JSON-only output', () => {
        const messages = buildMessages(metadata, rawDiff);
        expect(messages[0].content).toContain('ONLY a valid JSON');
    });

    it('system prompt requires the exact schema fields', () => {
        const messages = buildMessages(metadata, rawDiff);
        const sys = messages[0].content;
        expect(sys).toContain('"risk"');
        expect(sys).toContain('"issues"');
        expect(sys).toContain('"summary"');
    });
});
