# CLAUDE.md — handoff-framework

**This repository is EXECUTE-ONLY for agents.** Run the scripts; do not edit them.

Full contract: [`AGENTS.md`](./AGENTS.md). Cross-surface guard skill:
`documentation-standards/skills/handoff-framework-guard/SKILL.md`.

## Rules

- Do NOT modify `src/**`, `workflows/**`, `package.json`, `tsconfig.json`, or the
  handoff prompt suite (`documentation-standards/templates/handoff/**`).
- Framework changes require a human / GOV reviewer — never an autonomous agent edit.
- Handoff *content* goes to target repos + CORTEX, never back into this tree.

## Execute-only entry points

```bash
npx tsx src/cli.mts verify-integrity --strict   # read-only guard (run first)
npx tsx src/cli.mts tasklist --repos="$REPOS"    # read-only task list
npx tsx src/cli.mts validate-manifests --repos="$REPOS"
npx tsx src/cli.mts scaffold-sunset --from-session=<id> --repos="$REPOS" --scope=sunset
npx tsx src/cli.mts finalize --repo=<slug> --project=<dir> --from-session=<id> --session=<slug>
```

`--repos` is a variable. `--session-path` overrides the derived `docs/session-manifests/` dir.
