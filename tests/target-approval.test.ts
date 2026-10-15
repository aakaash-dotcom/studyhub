import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createAccount, createPost, deleteAccount, getDb, getBrandBySlug, getRuntime, tables } from "@centum/core";
import { eq, inArray } from "drizzle-orm";

/**
 * The rule that keeps the studio safe once the scheduler is live: a post that is
 * waiting on a human must NOT have a publish job. Without this, "submit for
 * review" would quietly publish at the requested time anyway.
 */
test("a post awaiting review gets no publish job, a queued post gets exactly one per target", async () => {
  await getBrandBySlug("centum-app");
  const brand = await getBrandBySlug("centum-app");
  assert.ok(brand, "seed brand missing — run npm run db:seed");

  const account = await createAccount({
    platform: "instagram",
    authPath: "instagram_login",
    platformAccountId: `test_guard_${Math.random().toString(36).slice(2, 8)}`,
    handle: "@guard.test",
    accessToken: "test-token",
  });

  const createdPostIds: string[] = [];

  try {
    const when = new Date(Date.now() + 3600_000);

    const forReview = await createPost({
      brandId: brand!.id,
      title: "Awaiting approval",
      caption: "review me",
      scheduledAt: when,
      state: "needs_review",
      targets: [{ accountId: account.id, mediaType: "REEL" }],
    });
    createdPostIds.push(forReview.id);
    assert.equal(forReview.targets[0]?.state, "needs_review", "targets must not look approved");

    const db = await getDb();
    const reviewJobs = await db.select().from(tables.jobs).where(eq(tables.jobs.postTargetId, forReview.targets[0]!.id));
    assert.equal(reviewJobs.length, 0, "no publish job may exist for a post waiting on a human");

    const queued = await createPost({
      brandId: brand!.id,
      title: "Approved already",
      caption: "ship it",
      scheduledAt: when,
      state: "queued",
      targets: [{ accountId: account.id, mediaType: "REEL" }],
    });
    createdPostIds.push(queued.id);
    const queuedJobs = await db.select().from(tables.jobs).where(eq(tables.jobs.postTargetId, queued.targets[0]!.id));
    assert.equal(queuedJobs.length, 1, "an approved post gets exactly one job");
    assert.equal(queued.targets[0]?.state, "queued");
  } finally {
    // Leave nothing behind in a database that is also the running app's.
    const db = await getDb();
    if (createdPostIds.length) await db.delete(tables.posts).where(inArray(tables.posts.id, createdPostIds));
    await deleteAccount(account.id);
  }
});

/**
 * PGlite keeps an open handle, so a test process that touches the database never
 * exits on its own — which shows up as `npm test` hanging forever with a green
 * test inside it. Closing the runtime is what lets the runner finish.
 */
after(async () => {
  await (await getRuntime()).close();
});
