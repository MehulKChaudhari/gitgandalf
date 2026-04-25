import { describe, it, expect } from 'vitest';
import { callLLM, LLMConnectionError, LLMResponseError } from '../judge/llm.js';

describe('callLLM', () => {

    it('returns a string when LM Studio is running, or throws LLMConnectionError when not', async () => {
        try {
            const result = await callLLM([{ role: 'user', content: 'Reply with the word OK' }]);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        } catch (err) {
            expect(err).toBeInstanceOf(LLMConnectionError);
        }
    }, 70_000);

    it('exports both error classes', () => {
        expect(typeof LLMConnectionError).toBe('function');
        expect(typeof LLMResponseError).toBe('function');
    });

    it('error classes have correct names', () => {
        const connErr = new LLMConnectionError('test');
        const respErr = new LLMResponseError('test');
        expect(connErr.name).toBe('LLMConnectionError');
        expect(respErr.name).toBe('LLMResponseError');
        expect(connErr).toBeInstanceOf(Error);
        expect(respErr).toBeInstanceOf(Error);
    });
});
