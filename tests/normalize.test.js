import { describe, it, expect } from 'vitest';
import { normalizeJudgment } from '../judge/normalize.js';

describe('normalizeJudgment', () => {

    it('parses valid JSON with all fields', () => {
        const input = JSON.stringify({
            risk: 'HIGH',
            issues: ['auth bypass'],
            summary: 'Dangerous change',
        });
        const result = normalizeJudgment(input);
        expect(result.risk).toBe('HIGH');
        expect(result.issues).toEqual(['auth bypass']);
        expect(result.summary).toBe('Dangerous change');
    });

    it('accepts LOW risk with empty issues array', () => {
        const input = JSON.stringify({
            risk: 'LOW',
            issues: [],
            summary: 'Safe refactor',
        });
        const result = normalizeJudgment(input);
        expect(result.risk).toBe('LOW');
        expect(result.issues).toEqual([]);
    });

    it('accepts MEDIUM risk', () => {
        const input = JSON.stringify({
            risk: 'MEDIUM',
            issues: ['new API endpoint'],
            summary: 'Added endpoint',
        });
        expect(normalizeJudgment(input).risk).toBe('MEDIUM');
    });

    it('trims whitespace from summary', () => {
        const input = JSON.stringify({
            risk: 'LOW',
            issues: [],
            summary: '  some summary  ',
        });
        expect(normalizeJudgment(input).summary).toBe('some summary');
    });

    it('extracts JSON from LLM output with surrounding text', () => {
        const input = 'Here is my review:\n{"risk":"HIGH","issues":["bug"],"summary":"Bad code"}\nThanks!';
        expect(normalizeJudgment(input).risk).toBe('HIGH');
    });

    it('throws on empty input', () => {
        expect(() => normalizeJudgment('')).toThrow(/empty output/);
    });

    it('throws on null input', () => {
        expect(() => normalizeJudgment(null)).toThrow(/empty output/);
    });

    it('throws on non-JSON text', () => {
        expect(() => normalizeJudgment('this is not json at all')).toThrow(/not valid JSON/);
    });

    it('throws on invalid risk level', () => {
        const input = JSON.stringify({ risk: 'CRITICAL', issues: [], summary: 'x' });
        expect(() => normalizeJudgment(input)).toThrow(/Invalid risk level/);
    });

    it('throws on missing issues array', () => {
        const input = JSON.stringify({ risk: 'LOW', summary: 'x' });
        expect(() => normalizeJudgment(input)).toThrow(/invalid "issues"/);
    });

    it('throws on non-string issue in array', () => {
        const input = JSON.stringify({ risk: 'LOW', issues: [123], summary: 'x' });
        expect(() => normalizeJudgment(input)).toThrow(/must be a string/);
    });

    it('throws on missing summary', () => {
        const input = JSON.stringify({ risk: 'LOW', issues: [] });
        expect(() => normalizeJudgment(input)).toThrow(/Missing or empty "summary"/);
    });

    it('throws on empty summary', () => {
        const input = JSON.stringify({ risk: 'LOW', issues: [], summary: '   ' });
        expect(() => normalizeJudgment(input)).toThrow(/Missing or empty "summary"/);
    });

    it('throws if parsed value is an array', () => {
        expect(() => normalizeJudgment('[1,2,3]')).toThrow(/not a JSON object/);
    });
});
