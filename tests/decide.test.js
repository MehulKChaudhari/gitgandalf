import { describe, it, expect } from 'vitest';
import { decide } from '../policy/decide.js';

describe('decide', () => {

    it('LOW → ALLOW', () => {
        expect(decide('LOW')).toBe('ALLOW');
    });

    it('MEDIUM → WARN', () => {
        expect(decide('MEDIUM')).toBe('WARN');
    });

    it('HIGH → BLOCK', () => {
        expect(decide('HIGH')).toBe('BLOCK');
    });

    it('throws on unknown risk level', () => {
        expect(() => decide('CRITICAL')).toThrow(/Unknown risk level/);
    });

    it('throws on empty string', () => {
        expect(() => decide('')).toThrow(/Unknown risk level/);
    });

    it('throws on lowercase (strict matching)', () => {
        expect(() => decide('low')).toThrow(/Unknown risk level/);
    });
});
