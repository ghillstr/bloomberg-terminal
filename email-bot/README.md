# Email triage bot

An hourly bot that sorts ghillstr56@gmail.com by importance, pushes an alert
when something actually matters, and archives the marketing.

It exists because the inbox runs about 28,500 messages with ~15 newsletters and
promos a day against 2–3 pieces of real mail, and Gmail's own "Important"
marker is set on 49,000 messages — so it carries no signal to sort by.

## Files

| File | What it is |
|---|---|
| `rules.md` | The tuning surface. What counts as Critical / Important / FYI / Noise, and the VIP list. **Edit this.** |
| `routine-prompt.md` | The exact standalone prompt the live Routine runs each hour. |

## How it runs

A Claude Routine fires hourly from 7am to 11pm Eastern. Each firing starts a
fresh session, searches for inbox mail from the last 3 hours that carries no
`Priority/*` label yet, tiers each message, labels it, archives the Noise, and
sends a push notification and email when there is anything Critical or
Important to report. Quiet hours end silently.

The 3-hour window against a 1-hour cadence is deliberate overlap: a missed or
delayed run is picked up by the next one, and the `Priority/*` label exclusion
in the search keeps re-runs from double-processing anything.

## Labels

| Label | Meaning | Inbox |
|---|---|---|
| `Priority/1-Critical` (red) | Needs him now | Stays |
| `Priority/2-Important` (orange) | Real mail, not urgent | Stays |
| `Priority/3-FYI` (blue) | Worth having, no action | Stays |
| `Priority/4-Noise` (gray) | Marketing | Archived |

Nothing is ever deleted. Search `label:Priority/4-Noise` to see everything the
bot archived, and move anything back to the inbox if it got a call wrong.

## Retuning it

1. Edit `rules.md`.
2. Mirror the change into `routine-prompt.md`.
3. Ask Claude to update the live Routine's prompt to match — the running Routine
   does not read this repo, so a repo edit alone changes nothing.

The fastest correction loop is just telling Claude in chat: "the bot archived
the Frick newsletter, I want those" or "add karendennis@mya.org as a VIP". That
updates both the files and the live Routine.

## Adding another email account

The bot covers whichever mailboxes are connected as Claude connectors. To add
one, connect it under claude.ai Settings → Connectors, then ask Claude to
extend the Routine to sweep it too. Non-Gmail accounts that forward into this
Gmail are already covered by the existing sweep.
