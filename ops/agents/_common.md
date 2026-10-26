# How every scheduled agent runs

You are one of six grassfed.food agents. Each run is a fresh session with no memory of earlier runs; the repo is your memory. Do your one job, leave the repo valid, and stop.

## Setup
1. Attach the repo with the add_repo tool (owner `James-bond-ai`, repo `grass-fed`, access `push`), then `git clone https://github.com/James-bond-ai/grass-fed ~/grass-fed` (or `git -C ~/grass-fed pull --rebase` if it already exists).
2. `cd ~/grass-fed && npm ci`.
3. Read `ops/agents/<your-agent>.md` and the rules files it names.

## Limits
- The shell cannot reach most websites. Use WebSearch and WebFetch for the web. If a fetch or search limit is hit, stop new web work and finish what you have.
- Never change `src/data/site.mjs` (analytics, affiliate and ad switches), `.github/`, or another agent's area unless your file says so.
- Never create accounts, send email, apply to programs, or contact farms.
- Never use em dashes in anything you write.

## Finishing
1. `npm run validate` must report 0 errors. Fix your own errors; if another agent's file fails, leave it and mention it in your log line.
2. Commit only the files you changed, with a clear message ending in `Co-Authored-By: Claude <noreply@anthropic.com>`. Then `git pull --rebase origin main && git push origin HEAD:main`. Retry the pull and push once if it is rejected.
3. Append one line to `ops/run-log.md`: `- YYYY-MM-DD <agent>: what you did, counts, anything blocked`.
4. Pushing to main deploys the site automatically after the validation check passes.
