import chalk from 'chalk';

const DECISION_DISPLAY = {
    ALLOW: { label: chalk.green.bold('ALLOW'), icon: '\u2705' },
    WARN:  { label: chalk.yellow.bold('WARN'),  icon: '\u26A0\uFE0F' },
    BLOCK: { label: chalk.red.bold('BLOCK'), icon: '\u274C' },
};

const RISK_DISPLAY = {
    LOW:    chalk.green('LOW'),
    MEDIUM: chalk.yellow('MEDIUM'),
    HIGH:   chalk.red.bold('HIGH'),
};

const DIVIDER = chalk.dim('─'.repeat(50));

/**
 * Renders the review output as a formatted terminal string.
 * Pure function — returns a string, does not print anything.
 *
 * @param {{ risk: string, issues: string[], summary: string }} judgment
 * @param {string} decision - "ALLOW" | "WARN" | "BLOCK"
 * @returns {string}
 */
export function renderReview(judgment, decision) {
    const dec = DECISION_DISPLAY[decision];
    const lines = [];

    lines.push('');
    lines.push(DIVIDER);
    lines.push(chalk.bold('\u{1F9D9} Git Gandalf Review'));
    lines.push(DIVIDER);
    lines.push('');
    lines.push(`  ${chalk.dim('Risk:')}     ${RISK_DISPLAY[judgment.risk]}`);
    lines.push(`  ${chalk.dim('Decision:')} ${dec.icon} ${dec.label}`);
    lines.push('');
    lines.push(`  ${chalk.dim('Summary:')}  ${judgment.summary}`);

    if (judgment.issues.length > 0) {
        lines.push('');
        lines.push(`  ${chalk.dim('Issues:')}`);
        for (const issue of judgment.issues) {
            lines.push(`    ${chalk.yellow('•')} ${issue}`);
        }
    }

    if (decision === 'BLOCK') {
        lines.push('');
        lines.push(chalk.red.bold('  Commit blocked.'));
        lines.push(chalk.dim(`  Bypass with: git commit --no-verify`));
    }

    lines.push('');
    lines.push(DIVIDER);
    lines.push('');
    return lines.join('\n');
}
