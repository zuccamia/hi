---
layout: ../../layouts/CaseStudyLayout.astro
title: Elasticsearch migration
eyebrow: KOMOJU · 2024
meta: Ruby on Rails · Elasticsearch · MySQL · 4 months
description: "Case study: moving payment search off MySQL onto an event-driven Elasticsearch pipeline at KOMOJU."
---

## The problem

Payment search at KOMOJU ran directly on MySQL, using Ransack to compose dynamic filter combinations at query time. Complex searches were slow, around seven seconds on average, and frequently timed out under flash-sale traffic. Adding read replicas and custom indexes had reached diminishing returns.

Search was a critical daily tool. Support engineers, finance, and merchants all used it to investigate specific payments in real time. A seven-second search followed by a timeout meant longer resolution times on real customer problems. It also meant that the tool people relied on most felt broken exactly when the system was busiest, which is the worst possible time for search to be unreliable.

## The approach

I wanted to keep MySQL as the source of truth for writes, add a read-optimized secondary store for search, and keep the two in sync without adding load to the write path. In effect: a CQRS-style split, with MySQL owning payment records and Elasticsearch owning the search index.

The pipeline had three requirements:

- **Event-driven.** Changes to a payment record enqueue a background indexing job. No polling, no periodic full re-syncs.
- **Read from replicas.** Indexing jobs read from MySQL read replicas rather than the primary, so search infrastructure could scale independently of the write path.
- **Idempotent by construction.** The record's primary key becomes the Elasticsearch document ID. Re-running a job is an upsert, not a duplicate. Retries are safe without any explicit coordination.

The last one mattered most. In distributed systems, retry semantics are usually the hard part. Making the index writes idempotent by design meant every downstream component (failure handling, backfill, replay) got safe retries as a side effect.

## The backfill

The most technically interesting part was migrating the historical data. A naive backfill using the ORM and normal worker throughput projected to take several days. Payments have a lot of associations, and loading each record through the ORM meant a cascade of small queries per payment.

I profiled the read path across payments and their associations, identified the join patterns that were doing the most work, and replaced ORM calls with hand-tuned SQL for the backfill workers only. Live indexing kept using the ORM path. No reason to trade maintainability for speed there. But the backfill was a one-time job that needed to finish quickly, so it was worth the specialized code path.

The projected multi-day backfill finished in under 24 hours, running in the background against read replicas without visible impact on production traffic.

## The rollout

I staged the migration behind a dark-launch: index writes were live in production for several weeks before any search traffic was routed to Elasticsearch. That let me validate that the pipeline was keeping up with real event rates, and that document counts matched MySQL counts within expected replica lag.

For observability, I set up Datadog dashboards tracking indexing lag, job queue depth, error rates on both index writes and search queries, and comparative latency between the old and new search paths. The point was to have signal before symptoms. If something started drifting, I wanted to know from the metrics rather than from a support engineer noticing search results looked stale.

Rollout was incident-free. Search latency dropped from around seven seconds to sub-second, and the pipeline held up cleanly under flash-sale traffic.

## The edge case, because there's always one

Under flash-sale peaks, we saw a rare pattern maybe a handful of times: the indexing job would run against a read replica that hadn't caught up to the primary yet. A freshly-created payment would show up in the change event, but when the job queried the replica, the record wasn't there yet. First indexing attempt missed. Retry succeeded a few minutes later.

Because indexing was idempotent by construction, this self-healed. The retry ran, the replica had caught up, the document went in. No manual intervention, no dead-letter jobs, no data loss. The failure mode I'd planned for at the design level had shown up in production and been handled by the design, not by a person.

Precise framing matters here: search availability was never affected. Queries always returned fast. The rare issue was *freshness* on brand-new payments, not the ability to search at all.

## What I'd do differently

Two things.

First, I'd add alerts on replica lag itself, not just on the errors that lag can produce. I had lag on the monitoring dashboard, but I only had paging alerts on explicit error patterns. When the flash-sale edge case surfaced, I found the cause by opening the dashboard to investigate the retry pattern I was seeing. That worked because the self-healing was reliable, but the flow was reactive: symptom appears, engineer investigates, root cause identified. Alerting on lag directly would have surfaced the leading indicator instead of waiting for the trailing one.

Second, I'd consider indexing off the primary for the very newest payments (anything created in the last few seconds) and off the replica for everything else. It would eliminate the freshness gap on new records at the cost of a small amount of primary read load. In the end, the self-healing was so reliable that this wasn't worth the change. But if the pattern had been more frequent, that's the direction I would have gone.
