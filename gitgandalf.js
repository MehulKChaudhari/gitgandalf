import { inTake } from './diff/intake.js';

if (process.stdin.isTTY) {
    console.log('Git Gandalf: no input received');
    process.exit(0);
}

try {
    const diff = await inTake();

    if (diff === null) {
        console.log('Git Gandalf: no input received');
        process.exit(0);
    }

    console.log('Git Gandalf: review placeholder (P0)');
    process.exit(0);

} catch (err) {
    console.error(`Git Gandalf: ${err.message}`);
    process.exit(1);
}
