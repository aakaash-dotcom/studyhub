# Using the studio

Seven screens. Here is what each one is for, and the three habits that keep the
queue healthy.

## The screens

| Screen | What you do there |
| --- | --- |
| **Dashboard** | Today's numbers: what is scheduled, what needs your approval, what failed. Your starting point. |
| **Accounts** | Connect Instagram and YouTube accounts, see token health, set per-account daily caps. |
| **Compose** | Write a caption, attach media, pick brands/accounts, pick a time (IST), submit. |
| **Calendar** | The month ahead, in IST, with a link into the queue for any day. |
| **Queue** | Approve, reschedule or cancel; see every target and the honest state of each. |
| **Media box** | Every uploaded asset with its public URL and the platform rules it satisfies. |
| **Settings** | What is configured, which providers are in mock or live mode, brands, roadmap. |

## The three habits

1. **Submit for review, not straight to schedule**, for anything going to a brand
   page. One click on `/queue` and it is out — and you keep a human in front of
   the tuition centre's reputation.
2. **Let the caps work.** Each account has a daily limit and the scheduler spaces
   posts out. Cranking five accounts to publish the same Reel at 8:00 pm is how
   accounts get flagged.
3. **Read the queue on failure, not the log.** A failed target shows the platform's
   own words plus a plain-English next action — usually "reconnect the account",
   "media too large", or "daily limit reached, rescheduled for tomorrow".

## What the studio will never do

- It will not automate a browser or reuse your password — official APIs only.
- It will not delete a published post to fix a mistake; it queues the correction.
- It will not post to a single account twice for the same target (idempotent by
  target key, so a retry can never double-post).

## Statuses you will see

`draft` → you have started a post but nothing is committed.
`needs review` → waiting for a human click. Nothing publishes in this state.
`approved` → jobs are queued for each target but not sent yet.
`queued` → the scheduler has picked a run time; it will be sent then.
`publishing` → being sent right now.
`published` → live, with the permalink.
`failed` → the platform refused; the reason and the next action are on the row.
`skipped` → deliberately not published (cancelled, or the target was removed).
