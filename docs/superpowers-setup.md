# Superpowers Setup

This repository can be used with the `obra/superpowers` skills workflow for coding agents.

## Install

```bash
git clone https://github.com/obra/superpowers.git ~/.codex/superpowers
mkdir -p ~/.agents/skills
ln -s ~/.codex/superpowers/skills ~/.agents/skills/superpowers
```

If `~/.codex/superpowers` already exists:

```bash
cd ~/.codex/superpowers && git pull --ff-only
mkdir -p ~/.agents/skills
ln -sfn ~/.codex/superpowers/skills ~/.agents/skills/superpowers
```

## Verify

```bash
ls -la ~/.agents/skills/superpowers
```

Expected result: `superpowers` is a symlink to `~/.codex/superpowers/skills`.

Then restart your coding-agent session so skill discovery runs again.

## Update

```bash
cd ~/.codex/superpowers && git pull --ff-only
```

## Uninstall

```bash
rm ~/.agents/skills/superpowers
```

Optional cleanup:

```bash
rm -rf ~/.codex/superpowers
```

## Troubleshooting

- If skills do not appear, restart the agent/CLI session after install.
- If symlink creation fails, ensure `~/.agents/skills` exists and rerun with `ln -sfn`.
- If update fails because of local changes, reset that clone manually or re-clone to `~/.codex/superpowers`.
