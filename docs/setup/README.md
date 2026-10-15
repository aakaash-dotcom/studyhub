# Setup runbooks

Read them in this order. Each one is short, and none of them require you to
write code — where the studio cannot do something for you (creating a Meta app,
accepting a tester invite, clicking a Google consent screen), the runbook lists
the exact clicks and the exact values to paste.

1. **[connecting-meta.md](connecting-meta.md)** — Instagram. Creating the Meta
   app, adding your accounts as testers, the four values the studio asks for.
   *Key fact: you do NOT need App Review to publish to your own accounts.*
2. **[connecting-google.md](connecting-google.md)** — YouTube. The Google Cloud
   project, the OAuth consent screen, and submitting the compliance audit form
   on day one. *Key fact: until the audit passes, every API upload is locked
   private — so we schedule them public via `publishAt` instead.*
3. **[using-the-studio.md](using-the-studio.md)** — day-to-day: compose, review,
   schedule, read the queue, fix failures.
4. **whatsapp-crm.md** — *not written yet.* It needs your CRM's API docs; the
   adapter seam is already built and waiting for the base URL, auth header and
   send path. Send those over and this becomes a 30-minute job.

## The two things only you can do

Everything else in this project is automated. These are the exceptions:

1. **Create the Meta app and the Google Cloud project** (free, ~20 minutes each
   with the runbooks above). Codes, tokens and screeners are all on your account
   — nobody can do it for you, including an AI agent.
2. **Click the OAuth consent screens** and accept the Instagram tester invites.

After that, connecting accounts and publishing is entirely inside the studio.

## No login page

The studio is built for one operator, so it has no authentication: it opens
straight onto the dashboard. That is deliberate — no session to expire, nothing to
get locked out of, and no cookie for a browser to refuse inside the preview frame.
Before it lives on a public hostname, put a password in front of it at the edge;
see "Exposing this to the internet" in the README.
