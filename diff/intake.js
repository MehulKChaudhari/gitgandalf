const MAX_DIFF_BYTES = 500 * 1024;

export function inTake() {
    return new Promise((resolve, reject) => {
        let diff = '';
        let size = 0;

        process.stdin.on('data', (chunk) => {
            size += chunk.length;

            if (size > MAX_DIFF_BYTES) {
                reject(new Error('Diff too large'));
                return;
            }

            diff += chunk.toString();
        });

        process.stdin.on('end', () => {
            diff = diff.replace(/\r\n/g, '\n');

            if (!diff || diff.trim().length === 0) {
                resolve(null); // empty diff
                return;
            }

            resolve(diff);
        });

        process.stdin.on('error', () => {
            reject(new Error('Failed to read stdin'));
        });
    });
}
