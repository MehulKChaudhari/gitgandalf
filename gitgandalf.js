import chalk from 'chalk';
import { inTake } from './diff/intake.js';
import { extractMetadata } from './diff/metadata.js';
import { buildMessages } from './judge/prompt.js';
import { callLLM, LLMConnectionError } from './judge/llm.js';
import { normalizeJudgment } from './judge/normalize.js';
import { decide } from './policy/decide.js';
import { renderReview } from './render/terminal.js';

const EXIT_CODES = { ALLOW: 0, WARN: 0, BLOCK: 1 };

if (process.stdin.isTTY) {
    console.log('Git Gandalf: no input received');
    process.exit(0);
}

try {
    const diff = await inTake();

    if (diff === null) {
        console.log('Git Gandalf: no staged changes detected. Skipping.');
        process.exit(0);
    }

    const metadata = extractMetadata(diff);
    const messages = buildMessages(metadata, diff);

    let llmResponse;
    try {
        llmResponse = await callLLM(messages);
    } catch (err) {
        if (err instanceof LLMConnectionError) {
            console.log(renderReview(
                { risk: 'MEDIUM', issues: [err.message], summary: 'LLM unavailable — could not perform review.' },
                'WARN'
            ));
            process.exit(0);
        }
        throw err;
    }

    let judgment;
    try {
        judgment = normalizeJudgment(llmResponse);
    } catch (err) {
        console.log(renderReview(
            { risk: 'HIGH', issues: [`Malformed LLM output: ${err.message}`], summary: 'LLM returned unparseable response. Blocking for safety.' },
            'BLOCK'
        ));
        process.exit(1);
    }

    const decision = decide(judgment.risk);
    const output = renderReview(judgment, decision);

    console.log(output);
    process.exit(EXIT_CODES[decision]);

} catch (err) {
    console.error(`\n${chalk.red.bold('\u274C Git Gandalf Error:')}\n  ${err.message}\n`);
    process.exit(1);
}
