const LLM_URL = 'http://127.0.0.1:1234/v1/chat/completions';
const LLM_MODEL = 'qwen/qwen3-4b-2507';
const TIMEOUT_MS = 60_000;

export class LLMConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LLMConnectionError';
    }
}

export class LLMResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LLMResponseError';
    }
}

/**
 * Sends messages to the local LLM and returns the raw response text.
 * Pure plumbing — no prompt construction, no output parsing, no policy.
 *
 * Throws LLMConnectionError when the server is unreachable or times out.
 * Throws LLMResponseError when the server responds but the output is bad.
 *
 * @param {Array<{ role: string, content: string }>} messages - OpenAI-format messages array
 * @returns {Promise<string>} Raw text content from the LLM response
 */
export async function callLLM(messages) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response;

    try {
        response = await fetch(LLM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages,
                temperature: 0,
            }),
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new LLMConnectionError(`LLM timed out after ${TIMEOUT_MS / 1000}s`);
        }
        throw new LLMConnectionError(`LLM not reachable: ${err.message}`);
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        throw new LLMConnectionError(`LLM returned HTTP ${response.status}`);
    }

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
        throw new LLMResponseError('LLM returned empty or malformed response');
    }

    return content.trim();
}
