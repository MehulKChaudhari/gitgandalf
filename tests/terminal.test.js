import { describe, it, expect } from 'vitest';
import { renderReview } from '../render/terminal.js';

const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

describe('renderReview', () => {

    const baseJudgment = {
        risk: 'LOW',
        issues: [],
        summary: 'Safe refactor',
    };

    it('includes the wizard header', () => {
        expect(strip(renderReview(baseJudgment, 'ALLOW'))).toContain('Git Gandalf Review');
    });

    it('shows risk level', () => {
        expect(strip(renderReview(baseJudgment, 'ALLOW'))).toContain('LOW');
    });

    it('shows ALLOW decision', () => {
        expect(strip(renderReview(baseJudgment, 'ALLOW'))).toContain('ALLOW');
    });

    it('shows WARN decision', () => {
        const j = { ...baseJudgment, risk: 'MEDIUM' };
        expect(strip(renderReview(j, 'WARN'))).toContain('WARN');
    });

    it('shows BLOCK decision', () => {
        const j = { risk: 'HIGH', issues: ['auth bypass'], summary: 'Dangerous' };
        expect(strip(renderReview(j, 'BLOCK'))).toContain('BLOCK');
    });

    it('shows summary', () => {
        expect(strip(renderReview(baseJudgment, 'ALLOW'))).toContain('Safe refactor');
    });

    it('lists issues when present', () => {
        const j = { risk: 'HIGH', issues: ['SQL injection', 'Missing auth'], summary: 'Bad' };
        const output = strip(renderReview(j, 'BLOCK'));
        expect(output).toContain('SQL injection');
        expect(output).toContain('Missing auth');
    });

    it('does not show issues section when empty', () => {
        expect(strip(renderReview(baseJudgment, 'ALLOW'))).not.toContain('Issues:');
    });

    it('shows bypass hint on BLOCK', () => {
        const j = { risk: 'HIGH', issues: ['bug'], summary: 'Bad' };
        expect(strip(renderReview(j, 'BLOCK'))).toContain('git commit --no-verify');
    });

    it('does not show bypass hint on ALLOW', () => {
        expect(strip(renderReview(baseJudgment, 'ALLOW'))).not.toContain('--no-verify');
    });

    it('does not show bypass hint on WARN', () => {
        const j = { ...baseJudgment, risk: 'MEDIUM' };
        expect(strip(renderReview(j, 'WARN'))).not.toContain('--no-verify');
    });

    it('returns a non-empty string', () => {
        const output = renderReview(baseJudgment, 'ALLOW');
        expect(typeof output).toBe('string');
        expect(output.length).toBeGreaterThan(0);
    });
});
