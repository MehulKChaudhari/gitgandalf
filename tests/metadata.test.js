import { describe, it, expect } from 'vitest';
import { extractMetadata } from '../diff/metadata.js';

describe('extractMetadata', () => {

    it('returns zeroes for empty input', () => {
        expect(extractMetadata('')).toEqual({
            files_changed: 0, files: [], lines_added: 0, lines_removed: 0,
        });
    });

    it('returns zeroes for null input', () => {
        expect(extractMetadata(null)).toEqual({
            files_changed: 0, files: [], lines_added: 0, lines_removed: 0,
        });
    });

    it('extracts metadata from a single-file diff', () => {
        const diff = [
            'diff --git a/src/app.js b/src/app.js',
            'index abc1234..def5678 100644',
            '--- a/src/app.js',
            '+++ b/src/app.js',
            '@@ -10,6 +10,8 @@ function init() {',
            '   const x = 1;',
            '+  const y = 2;',
            '+  const z = 3;',
            '   return x;',
            '-  // old comment',
        ].join('\n');

        const result = extractMetadata(diff);
        expect(result.files_changed).toBe(1);
        expect(result.files).toEqual(['src/app.js']);
        expect(result.lines_added).toBe(2);
        expect(result.lines_removed).toBe(1);
    });

    it('extracts metadata from a multi-file diff', () => {
        const diff = [
            'diff --git a/auth/login.js b/auth/login.js',
            '--- a/auth/login.js',
            '+++ b/auth/login.js',
            '@@ -1,3 +1,4 @@',
            ' const a = 1;',
            '+const b = 2;',
            '',
            'diff --git a/db/user.sql b/db/user.sql',
            '--- a/db/user.sql',
            '+++ b/db/user.sql',
            '@@ -5,4 +5,3 @@',
            '-DROP TABLE users;',
            '-DROP TABLE sessions;',
            '+ALTER TABLE users ADD COLUMN email TEXT;',
        ].join('\n');

        const result = extractMetadata(diff);
        expect(result.files_changed).toBe(2);
        expect(result.files).toEqual(['auth/login.js', 'db/user.sql']);
        expect(result.lines_added).toBe(2);
        expect(result.lines_removed).toBe(2);
    });

    it('does not count --- and +++ headers as changes', () => {
        const diff = [
            'diff --git a/file.txt b/file.txt',
            '--- a/file.txt',
            '+++ b/file.txt',
            '@@ -1 +1 @@',
            '-old',
            '+new',
        ].join('\n');

        const result = extractMetadata(diff);
        expect(result.lines_added).toBe(1);
        expect(result.lines_removed).toBe(1);
    });

    it('handles binary file diffs gracefully', () => {
        const diff = [
            'diff --git a/image.png b/image.png',
            'Binary files a/image.png and b/image.png differ',
        ].join('\n');

        const result = extractMetadata(diff);
        expect(result.files_changed).toBe(1);
        expect(result.files).toEqual(['image.png']);
        expect(result.lines_added).toBe(0);
        expect(result.lines_removed).toBe(0);
    });

    it('handles renamed files (takes the new name)', () => {
        const diff = [
            'diff --git a/old-name.js b/new-name.js',
            'similarity index 100%',
            'rename from old-name.js',
            'rename to new-name.js',
        ].join('\n');

        const result = extractMetadata(diff);
        expect(result.files_changed).toBe(1);
        expect(result.files).toEqual(['new-name.js']);
    });

    it('handles new file diffs', () => {
        const diff = [
            'diff --git a/brand-new.js b/brand-new.js',
            'new file mode 100644',
            'index 0000000..abc1234',
            '--- /dev/null',
            '+++ b/brand-new.js',
            '@@ -0,0 +1,3 @@',
            '+const x = 1;',
            '+const y = 2;',
            '+module.exports = { x, y };',
        ].join('\n');

        const result = extractMetadata(diff);
        expect(result.files_changed).toBe(1);
        expect(result.files).toEqual(['brand-new.js']);
        expect(result.lines_added).toBe(3);
        expect(result.lines_removed).toBe(0);
    });

    it('is deterministic — same input always gives same output', () => {
        const diff = [
            'diff --git a/x.js b/x.js',
            '--- a/x.js',
            '+++ b/x.js',
            '@@ -1 +1 @@',
            '-a',
            '+b',
        ].join('\n');

        expect(extractMetadata(diff)).toEqual(extractMetadata(diff));
    });
});
