let input = '';

process.stdin.on('data', (chunk) => {
    input += chunk.toString();
});

process.stdin.on('end', () => {
    if (!input || input.trim().length === 0) {
        console.log('Git Gandalf: no input received');
        process.exit(0);
    }

    console.log('Git Ggndalf: review placeholder');
    process.exit(0);
});

process.stdin.on('error', () => {
    console.error('Git Gandalf: failed to read input');
    process.exit(1);
});

if (process.stdin.isTTY) {
    console.log('Git Gandalf: no input received');
    process.exit(0);
}
