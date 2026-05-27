# install/

Drop-in files for the Claude Code project-log system. Walk-through guide is the blog post at <https://daeseon.ai/posts/install-claude-code-project-log>.

## Files in this directory

| File | Goes where | Purpose |
|---|---|---|
| `setup.sh` | Run from your repo root | One-shot bootstrap. Creates directories + downloads the other three files. Idempotent. |
| `troubleshooting-starter.md` | `docs/troubleshooting.md` | Flat problem-indexed log seed. Real entries go below the `---` divider. |
| `settings.json` | `.claude/settings.json` | Adds a Stop hook that prints a reminder after any recent commit. |
| `claude-md-snippet.md` | Append to your `CLAUDE.md` | The rule Claude reads every turn — dual-write requirement + 7 anti-hallucination rules. |

## Fastest path

```bash
cd /path/to/your/repo
curl -fsSL https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install/setup.sh | bash
# Then paste the printed snippet into your CLAUDE.md.
```

## Slower-but-safer path (recommended first time)

```bash
cd /path/to/your/repo
curl -fsSL -o setup.sh https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install/setup.sh
less setup.sh        # read what it does
bash setup.sh
rm setup.sh
```

## Fully manual path (no script)

```bash
mkdir -p docs .claude content/logs/$(basename $PWD)

curl -fsSL -o docs/troubleshooting.md \
  https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install/troubleshooting-starter.md

curl -fsSL -o .claude/settings.json \
  https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install/settings.json

curl -fsSL https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install/claude-md-snippet.md
# Read the output, then paste it at the bottom of your CLAUDE.md.
# Replace <project-slug> with whatever directory name you used under content/logs/.
```

## What `setup.sh` does NOT do

- Doesn't append to your `CLAUDE.md` automatically. It prints the snippet for you to paste manually so you can read it first.
- Doesn't install `jq`. Warns if missing.
- Doesn't overwrite `docs/troubleshooting.md` or `.claude/settings.json` if they already exist.
- Doesn't commit anything. Inspect, then commit when you're ready.

## Where the spec lives

The full design rationale and anti-hallucination rules with examples are in `docs/project-log-spec.md` in this repo, or read the blog post linked at the top.
