---
layout: ../../layouts/CaseStudyLayout.astro
title: In-store QR payments
eyebrow: KOMOJU · 2025
meta: Ruby on Rails · Distributed coordination · Async
description: "Case study: building a net-new in-store QR payment capability with fail-closed distributed coordination at KOMOJU."
---

## The problem

KOMOJU's branded handheld payment terminal only supported credit-card payments in-store. QR-code payments are more popular than cards with Japanese customers, which made the terminal a harder sell to merchants, and there was no in-store QR capability anywhere else in the product either.

The task was to build in-store QR payment support end-to-end. That meant coordinating asynchronously across the handheld terminal, our payment gateway, and a third-party QR provider, over a network that could stall, drop messages, or reorder events. Payments have to be correct, always. There was no acceptable "usually works" outcome.

## The design

The flow, at a high level:

1. Terminal requests a QR code from our gateway.
2. Gateway requests one from the partner provider and returns it to the terminal.
3. Customer scans the QR and completes payment on their phone.
4. Partner notifies us via webhook that the payment succeeded.
5. Our system reconciles the payment and notifies the terminal.
6. Terminal displays success (or failure) to the cashier.

The interesting design decisions were on steps 5 and 6.

**Terminal polling instead of push.** The terminal drives its own wait. It polls our system on a short interval with a five-minute timeout. If the terminal pushed and waited for us to call it back, a slow or missing partner webhook would leave the terminal hanging indefinitely. Polling meant the terminal always knew where it was in the flow, and always had a bounded exit condition.

**Idempotent webhook handling.** Partner webhooks are retried aggressively by design, so any handler that processes a payment side-effect has to be idempotent. Using the payment ID as the deduplication key made this straightforward, and it meant that duplicate webhook deliveries could never cause a double-processed payment.

## The tradeoff: fail-closed

The load-bearing decision was what to do on the terminal's timeout.

Option A: **fail-open.** Assume the payment succeeded on the partner side and let the customer walk. Fast for the cashier, but risks giving away goods for payments that never completed.

Option B: **fail-closed.** Mark the transaction as failed in our system, even though the partner might have completed it successfully. This creates a deliberate discrepancy: *failed-in-system, paid-on-partner*. The customer has to retry or pay another way, then the daily reconciliation job catches the mismatch and refunds the stuck charge within a day.

I chose fail-closed. Reasoning:

- **In-store transactions have no fulfillment exposure.** Unlike online orders, the customer is physically at the register. If we mark the payment failed and they got charged on the partner side, they retry or pay differently on the spot. The failure mode is *temporary erroneous charge that gets reversed*, not *goods leave the store unpaid*.
- **Reconciliation was already trustworthy.** We had an automated daily reconciliation system in place that matched our transaction records against provider settlements and flagged mismatches to finance via Slack. Fail-closed made this system's edge cases visible in a place where they were guaranteed to be seen and resolved.
- **Fail-open would have required a "how confident are we?" heuristic**, which is exactly the kind of decision that goes wrong in production. Fail-closed is deterministic and reviewable.

The tradeoff I accepted: a small number of customers each month would see a temporary erroneous charge that reconciled within a day. In exchange, the system never confirmed a payment it couldn't verify.

## What shipped

The capability launched cleanly and gave merchants a unified online-and-offline transaction management surface. The same dashboard that showed their e-commerce payments now showed their in-store QR ones too. By the time I left, several merchants were using it for event pop-ups where in-store QR was the primary payment method, which was the exact use case that justified the build.

## What I'd do differently

I'd tighten the terminal-timeout window. Five minutes was a conservative choice, long enough that we were confident no honest partner webhook would arrive after we'd timed out. In practice, most payments completed within seconds, and the long timeout meant customers occasionally had to wait longer than necessary before the cashier saw a definitive answer. A shorter timeout with more aggressive polling toward the end would have improved the customer experience without changing the failure semantics.

I'd also want to build a small tool for merchants to see the reconciliation activity on their own transactions, so they could self-serve the refund status for any stuck charges instead of contacting support. It wasn't in scope for the initial launch, but the daily-refund-cycle timing was probably the biggest friction point after ship.
