# Git Gandalf 🧙‍♂️

A **local, pre-commit AI code reviewer** that runs entirely on your machine. It reads your staged diff, sends it to a local LLM, and blocks risky commits before they land.

No SaaS. No cloud calls. No frameworks. No magic.

Just Git → Node → Local LLM → Decision.

---

## How It Works

```
git commit
    ↓
pre-commit hook
    ↓
git diff --cached  →  STDIN  →  gitgandalf.js
    ↓
1. Read diff (intake.js)
2. Extract metadata (metadata.js)
3. Build prompt + send to local LLM (prompt.js → llm.js)
4. Validate LLM response (normalize.js)
5. Apply policy (decide.js)
6. Render result (terminal.js)
7. Exit 0 (allow) or Exit 1 (block)
```

---

## Requirements

- **Node.js** v18 or later (uses built-in `fetch`)
- **LM Studio** with a running local server
- A model loaded in LM Studio (default: `qwen/qwen3-4b-2507`)

---

## Setup

### 1. Clone & install

```bash
git clone <repo-url> ~/gitgandalf
cd ~/gitgandalf
npm install
```

### 2. Start LM Studio

1. Open LM Studio
2. Download a model (e.g. `qwen/qwen3-4b-2507`)
3. Click **Start Server**
4. Confirm the API is running at `http://127.0.0.1:1234`

Git Gandalf does not manage models. It only talks to a running server.

### 3. Wire to a repo

In the repo you want to protect, create the hook:

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

DIFF=$(git diff --cached)

if [ -z "$DIFF" ]; then
    exit 0
fi

echo "$DIFF" | node ~/gitgandalf/gitgandalf.js
exit $?
EOF

chmod +x .git/hooks/pre-commit
```

Replace `~/gitgandalf` with the actual path to this project.

### 4. Use it

From now on, every `git commit` runs Git Gandalf automatically.

- **LOW risk** → ✅ ALLOW → commit proceeds
- **MEDIUM risk** → ⚠️ WARN → commit proceeds with warnings shown
- **HIGH risk** → ❌ BLOCK → commit is rejected

To bypass:

```bash
git commit --no-verify
```

---

## Running Tests

```bash
npm test
```

Uses Node's built-in test runner — no test frameworks needed.

---

## Project Structure

```
gitgandalf/
├── gitgandalf.js          # Orchestrator — the full pipeline
├── diff/
│   ├── intake.js          # Reads stdin, size cap, CRLF normalization
│   └── metadata.js        # Diff → { files, lines_added, lines_removed }
├── judge/
│   ├── llm.js             # HTTP client for LM Studio API
│   ├── prompt.js          # Builds the messages array
│   ├── prompt.v1.txt      # System prompt (versioned)
│   └── normalize.js       # Validates LLM JSON response
├── policy/
│   └── decide.js          # LOW→ALLOW, MEDIUM→WARN, HIGH→BLOCK
├── render/
│   └── terminal.js        # Colored terminal output
├── tests/                 # All unit tests
├── package.json
└── README.md
```

---

## Failure Behavior

Git Gandalf fails loudly, never silently.

| Scenario | Behavior | Exit Code |
|---|---|---|
| LLM not running | ⚠️ WARN — commit allowed, warning shown | 0 |
| LLM times out (60s) | ⚠️ WARN — commit allowed, warning shown | 0 |
| LLM returns bad JSON | ❌ BLOCK — commit rejected | 1 |
| Internal error | ❌ BLOCK — commit rejected | 1 |
| Empty diff | Skip — no review | 0 |
| Diff too large (>500KB) | ❌ BLOCK — commit rejected | 1 |

---

## Limitations

- One hardcoded policy (no config files)
- No per-repo or per-file rules
- No retry logic
- No caching of previous reviews
- Single model, single endpoint
- Prompt changes are breaking changes

This is deliberate. Git Gandalf is a guardrail, not a replacement for code review.

---

## License

ISC
