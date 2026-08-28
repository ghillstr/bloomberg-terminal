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

## Status: the schedule is built but PAUSED

The Routine exists (`trig_017FGqJ16LGLMdC93NWtQEMs`) and is currently
**disabled**, because Routines created from a Claude Code session cannot carry
a connector grant on this account — the `connectors` parameter is rejected at
the org level, and a test firing produced a session with no `mcp__Gmail__*`
tools at all. An hourly run with no Gmail access would do nothing and notify
about it 16 times a day, so it is paused rather than left to fail.

**To switch it on:** open Routines at claude.ai, and either attach the Gmail
connector to the existing "Hourly inbox triage" Routine and re-enable it, or
create a new Routine there with Gmail attached, pasting the prompt from
`routine-prompt.md` and the schedule `17 0-3,11-23 * * *` (UTC). Routines
created in that UI can hold connector grants; ones minted from a session
cannot.

Until then, triage runs when asked for directly in a Claude session, where the
Gmail connector is available.

## How it runs

A Claude Routine fires hourly from 7am to 11pm Eastern. Each firing starts a
fresh session, searches for inbox mail from the last 3 hours that carries no
`Priority/*` label yet, tiers each message, labels it, archives the Noise, and
sends a push notification and email when there is anything Critical or
Important to report. Quiet hours end silently.

The cron is written in UTC and fixed to Eastern Daylight Time. When Eastern
goes back to standard time in November the window shifts an hour earlier
(6am–10pm) until the cron is adjusted.

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

## The three accounts

| Address | Status |
|---|---|
| `ghillstr56@gmail.com` | Connected and swept |
| `georgehillstrom@gmail.com` | Not connected — receives the PNC card statements |
| `hillstromgeorge@gmail.com` | Not connected |

Neither of the other two forwards into the connected mailbox. That was checked
by searching for mail delivered to those addresses: every hit was either
dual-addressed by the sender or manually forwarded years ago. So their mail is
currently invisible to the bot.

There are two ways to fix that, and both need George, not Claude — an account
can only be authorized by its owner signing in.

**Connect each account** (keeps the mailboxes separate). At claude.ai, go to
Settings → Connectors, add Gmail again, and sign in as the second account; then
repeat for the third. Once they appear as connected, ask Claude to re-run
triage and it will sweep all three. Each mailbox needs its own `Priority/*`
labels created on first run.

**Or forward them into ghillstr56** (one mailbox to watch). In each of the other
two accounts: Settings → Forwarding and POP/IMAP → Add a forwarding address →
`ghillstr56@gmail.com`, then confirm from the email Google sends. The existing
sweep then covers all three with no further setup. The tradeoff is that
everything lands in one inbox and replies go out from the wrong address unless
send-as is also configured.
