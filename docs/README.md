# docs/README.md — how to read these docs (60-sec version)

**Imagine this repo is a library.** Each `docs/NN-*.md` is a labelled shelf. The 6 foundational docs are the "how the library works" guide. The 21 feature docs are the books on the shelves. Every doc follows the SAME recipe so you can jump to any section in 10 seconds.

## Recipe (every feature doc)
1. **What it does (60-sec)** — plain words, no jargon. A 5-year-old gets the idea.
2. **How it works (step-by-step)** — numbered flow: user action → code → screen.
3. **Every function** — table: name | what it does | inputs | outputs | file.
4. **Why we built it this way** — Problem → Options we compared → Why we chose X → How X solves it.
5. **Real-world example** — story/analogy a 5-year-old understands.
6. **Algorithm** — numbered human steps (not code).
7. **What could go wrong** — edge cases + what the app does.
8. **How we stay safe** — security per feature.
9. **How we test it** — what tests check.

## Foundational docs (read in order)
- `ARCHITECTURE.md` — system map (hybrid fetch, dependency graph, flag→dynamic).
- `SECURITY.md` — threat model + headers + sanitization + rate-limit.
- `GDPR.md` — GDPR + PDPA/APPI overlay, Mumbai residency, consent, rights.
- `EDGE-CASES.md` — master edge-case register (all 21 features).
- `TESTING.md` — unit/integration/E2E + a11y + bug-first workflow.
- `FEATURE-README.md` — how to add a new feature (doc→tests→code gate).

## Gate
Each doc is approved before tests are written; tests before code. No skipping.
