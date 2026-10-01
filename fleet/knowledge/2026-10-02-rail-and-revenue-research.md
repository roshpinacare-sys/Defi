# Z-30-r research: rail stall + tiny-stake revenue

Task: Z-30-r (independent research team). Retrieval window: 2026-10-01 23:00–23:26 UTC.
Method: z-ai web-search + direct RPC probes (api.hive.blog, api.steemit.com, rpc.blurt.blog,
api.hive-engine.com) + GitHub issue search + official-page fetches. Every claim tagged
FACT (verifiable at cited URL/API, cross-checked on ≥2 sources where important),
INFERENCE (our reasoning), or ESTIMATE (numerical assumption, assumption stated).
No secrets/keys in this file. Not committed by this agent (orchestrator commits).

---

## Q1 — Is the Hive-Engine sidechain stalled? (Verdict: NO — and Z-29's "stall" is a measurement artifact. But TWO of OUR ops really are unapplied, with a proven root cause for one.)

### 1. The headline correction (all FACT, probed via api.hive-engine.com and cross-read on api2.hive-engine.com, retrieved 2026-10-01 23:1x UTC)

Z-29 concluded "newest applied market state frozen at 2026-09-05..09-20" (frontier age 342.9h).
Re-probe with an explicit sort index (`find` on `market/sellBook` with
`indexes:[{"index":"_id","descending":true}]`) shows the books are LIVE:

| Book | Newest applied order | Account | Amount @ price | txId |
|---|---|---|---|---|
| BEE sellBook | 2026-10-01 23:14:15 UTC | sonntags | 1.0 BEE @ 0.55115207 | `MM-P-63344066-110406135-3-55-1` (protocol MM order) |
| BEE sellBook | 2026-10-01 23:11:30 UTC | fucina | 6.36958165 BEE @ 0.55479455 | real chain tx `5fd800d3…` (fetched from chain via condenser_api.get_transaction) |
| BEE sellBook | 2026-10-01 22:00:12 UTC | tenpik | 0.53998649 BEE @ 0.55145207 | real chain tx `49ce00b8…` |
| BEE sellBook | 2026-09-26 / 09-27 | konvik-bee (bot, hourly orders) | ~160–172 BEE | real chain txs |
| ALIVE sellBook | 2026-10-01 14:52:30 UTC | d2connect | 50.0 @ 0.01099998 | real chain tx `70ed6557…` |
| SWAP.LTC sellBook | 2026-10-01 23:06:33 UTC | hannahjames710 | 0.03281140 @ 1211.408 | real chain tx `79740024…` |

- BEE metrics (`market/metrics`) show lastPrice 0.54903003 SWAP.HIVE, 24h volume 416.6 BEE
  (api.hive-engine.com, retrieved 2026-10-01 23:15 UTC).
- Hive chain head at probe time: block 110406093, 2026-10-01 23:12:09 UTC (condenser_api
  get_dynamic_global_properties, api.hive.blog). The engine book contains orders mined minutes
  earlier — engine lag is ~seconds/minutes, not 343 hours.

INFERENCE (root cause of the Z-29 reading): a Hive-Engine API `find` **without an explicit
`indexes` array returns the lowest `_id` (oldest) rows even when `descending:true` is passed**.
I reproduced this exact artifact on my first probe of the session: without indexes the same
sellBook query returned orders timestamped 2026-09-05..09-11 (the "frozen frontier" Z-29 saw);
with the explicit `_id` descending index the true frontier is 2026-10-01. Z-29's probe very
likely made the same unindexed call. The "sorted book frontiers" law must therefore pin the
index explicitly — see Next moves.

### 2. The ops that ARE genuinely unapplied (FACT)

- **Z-29 sell (trx `4d3f27e7d951f181853777ebee4caaae38c24919`, block 110405217)**: mined on
  chain (condenser_api.get_transaction, api.hive.blog, retrieved 2026-10-01 23:1x UTC) but
  headcorner BEE balance still 6.49308870 and no order in sellBook (tokens/balances +
  market/sellBook via api.hive-engine.com) → NOT applied.
  **ROOT CAUSE PROVEN: the op's custom_json `id` is `ssc-mainframe-hive` — a typo.**
  The official Hive-Engine docs require `id: "ssc-mainnet-hive"`
  (https://hive-engine.github.io/engine-docs, fetched 2026-10-01 23:2x UTC) and the official
  hive-engine.com app bundle contains exactly one custom_json id, `ssc-mainnet-hive`
  (grep of https://hive-engine.com/assets/index-JpHN0olS.js). A custom_json with any other id
  is simply never read by engine nodes: mined, RC-charged, silently ignored.
  A control op from fucina (id `ssc-mainnet-hive`, same contract/payload shape) WAS applied at
  23:11:30 UTC — same night, same book. Format was not the problem; the id string was.
- **Z-28 wrapper deposit (trx `875404ff2d16f418bd8a86b5cffa6d4e6503e3c1`)**: transfer
  0.310 HIVE headcorner→@hiveswap, memo "Z-28 SWAP.HIVE rail proof" (chain-verified).
  headcorner SWAP.HIVE balance still 0.00000002 → credit NOT applied. UNRESOLVED:
  (a) the official app bundle contains NO reference to "@hiveswap" as deposit target (its
  withdraw path uses contract `hivepegged`), and hiveengine.readthedocs.io api page 404s;
  (b) condenser get_account_history is broken/empty on api.hive.blog and api.openhive.network
  for ALL accounts (even blocktrades), so the wrapper's incoming-transfer stream cannot be
  audited from the public nodes I probed. Treat the 0.310 HIVE as still owed-or-lost and
  re-verify the deposit method against the live hive-engine.com UI before any further deposit.

### 3. Is there a public incident report? (Negative finding, searched 2026-10-01 23:0x–23:2x UTC)

- No news/announcement/discussion of a Hive-Engine stall/incident in Sept–Oct 2026 was found.
  Queries run: "hive-engine stall frozen sidechain September 2026", "Hive-Engine sidechain
  transactions not processing incident", "hiveswap deposit pending stuck", `"hive-engine"
  problem OR stalled OR replay October 2026`, "hive-engine custom_json ssc-mainframe-hive".
  Results were noise (Liquid Network hack Sept 2026, HIVE Digital mining company, generic
  "swap failed" videos) — no HE outage report. FACT: searches returned nothing relevant;
  this negative result is itself the finding.
- Official @hive-engine Hive account posts are only contract-update notes; newest is
  "comments Smart Contract" 2026-07-14 (condenser get_discussions_by_blog tag=hive-engine).
  @engrave newest post 2026-07-16, nothing on a stall. FACT.
- No status page exists: status.hive-engine.com → connection failure (HTTP 000);
  https://api.hive-engine.com/api/status → 404 nginx. FACT.
- GitHub org hive-engine: issue search `org:hive-engine is:issue updated:>2026-09-01` →
  total_count 0 (api.github.com search, retrieved 2026-10-01 23:2x UTC). Repo/commit listing
  was rate-limited (403) — not completed. FACT + noted gap.
- Closest recent third-party material (context, not the stall): @thecrazygm, "Fixing Data
  Integrity Issues in Hive-Engine Nodes", 2026-07-01, payout 7.654 HBD (condenser get_content;
  mirrors on waivio.com) — documents HE node block-processing bugs (partial writes, concurrent
  processing, silent failures) being fixed in mid-2026. Historic withdrawal-deposit complaints
  exist from earlier years (@candy49, 2024-09-07). FACT.

### 4. Q1 verdict (3 bullets)

- **The sidechain is NOT stalled**: all three books Z-29 cited (BEE/ALIVE/SWAP.LTC) have
  user orders applied within hours/minutes of the probe (2026-10-01). The Z-29 frontier
  reading was a sort-index artifact, reproduced and explained above.
- **Our ops failed for our own reasons**: the Z-29 sell used custom_json id
  `ssc-mainframe-hive` instead of `ssc-mainnet-hive` (proven vs official docs + app bundle);
  the Z-28 0.310 HIVE deposit to @hiveswap is uncredited for an unresolved reason (deposit
  method itself unverified).
- **No public incident, no official statement, no ETA** — because there was no incident to
  report; the public record (searches, @hive-engine account, GitHub, status endpoints) is
  silent for Sept/Oct 2026.

---

## Q2 — Real revenue paths for tiny stakes (no external capital, no KYC)

### Measured inputs (FACT unless noted)

| Asset | Amount | Unit price (CoinGecko, 2026-10-01 23:22 UTC) | Value |
|---|---|---|---|
| STEEM (headcorner effective SP) | ~4,279 SP | $0.063835 | ~$273 |
| STEEM soldiers | 8× 0.010 liquid, ~0 VP | $0.063835 | ~$0.005 |
| HIVE (headcorner HP) | ~17 HP | $0.056521 | ~$0.96 |
| HIVE liquid (fleet) | 0.035 HIVE | $0.056521 | ~$0.002 |
| BLURT (fleet liquid + small VP) | 72.16 BLURT | $0.00130526 | ~$0.094 |
| HE: BEE (keep) | 1.0 BEE (6.49 still on balance; 5.49 sell invalid — see Q1) | 0.54965 bid | ~$0.031 |
| HE: VKBT / BLANK | 23.3 / 10 | 0.00002105 bid / 0.00000031 bid | ~$0.0002 / ~$0.00003 |

Chain params (FACT, retrieved 2026-10-01 23:12–23:26 UTC):
- Hive `hbd_interest_rate` = 1000 → **HBD savings 10.0% APR**, paid monthly via claim
  (condenser DGP, api.hive.blog; corroborated by @arcange's comment "the (current) 10% rate is
  annual but paid every 30 days", hive.blog/proofofbrain/@arcange/re-re-arcange-qxh6rh).
- Steem `sbd_interest_rate` = 0 → **no savings interest on Steem** (api.steemit.com DGP).
- Reward funds: hive post RF 1,081,506 HIVE, 50% to curators; steem post RF 931,764 STEEM, 50%
  curators (condenser get_reward_fund "post", both chains). Blurt post RF 1,759,931 BLURT,
  50% curators (rpc.blurt.blog, chain live at block 64,124,546). At ~7-day drain this implies
  content pools ≈ $8–9k/day each for hive and steem (INFERENCE from RF size).
- Reality anchor for content rewards: **3.3k accounts earned author/beneficiary rewards on
  Hive in Aug 2026 — median 39 HIVE (~$2.2), average 343 HIVE (~$19.4) per month**
  (@dalz, "Top Hive Earners by Category", 2026-09-01,
  https://peakd.com/@dalz/top-hive-earners-by-category-authors-curators-witnesses-dao-hbd-interest-aug-2026).
  Top 3 curators (blocktrades/alpha/appreciator) earned 85–87k HIVE in the month — but they
  run millions of HP.

### Ranked shortlist (EV at OUR stake sizes)

**#1 — Steem author + curation stack on headcorner (4,279 SP). EV ≈ $1.5–4.5/month.**
- Pure curation at 4–10%/yr on $273 (ESTIMATE; steem curation APR range consistent with the
  RF math above and with small-account curation reports e.g. steem-sri.lanka weekly report
  showing single-digit SP/week for community trails, steemit.com/hive-133716/@randulakoralage):
  ≈ $0.9–2.3/mo. Author/self-vote on daily content plausibly doubles it (ESTIMATE, unverified).
- Effort: LOW — curation agent already running (Z-26..Z-29); content engines already
  de-templated (Z-28). CI-able end-to-end: vote cadence + daily claim + book.
- What to build: extend the curation agent to N timely votes/day on rising posts, and let the
  claim desk harvest author+curation rewards daily. This is a 10–30x uplift vs the fleet's
  current realized ~$0.005/day (worklog Z-27/Z-29 honest residuals).

**#2 — HBD savings automation (rate VERIFIED, principal-bound today). EV now ≈ $0.002/mo;
scales to ~$0.83/mo per 100 HBD at the verified 10% APR.**
- 10% APR, interest claimable every 30 days (FACT). Fleet liquid HIVE is 0.035 → even 100%
  converted is dust. Steem has NO equivalent (sbd_interest_rate 0).
- Effort: LOW once principal exists. CI-able: claim_interest op monthly; convert surplus to
  HBD when liquid HIVE/HBD exceeds a floor. Mark: build the loop, fund it later.

**#3 — Keep-alive curation rails on Hive (17 HP) and Blurt (72 BLURT). EV ≈ $0.001–0.01/mo
(honest: near-zero absolute).**
- Hive curation APR ~5–10% on $0.96 (ESTIMATE) ≈ $0.004–0.008/mo. Blurt at $0.094 stake ≈
  fractions of a cent (BLURT at $0.0013 — VERIFIED price; blurt curation APR historically
  double-digit but the stake is dust). 8 blurt soldiers' VP regen adds nothing material.
- Worth it ONLY as zero-cost presence/flag-planting (accounts look alive, fee-free ops).
  Already armed per worklog Z-27; no new build needed.

**#4 — Hive-Engine dust farming (staking/airdrops/faucets). EV ≈ $0.00/mo. Recommend NO EFFORT.**
- 100+ HE tokens have stakingEnabled=true incl. BEE (api.hive-engine.com tokens table,
  retrieved 2026-10-01 23:2x UTC), but staking BEE is governance-weighting with no automatic
  yield to us (UNKNOWN whether any current BEE staking drip exists — found no doc; treat as 0).
- Our VKBT (bid 0.00002105) and BLANK (bid 0.00000031) are unsellable dust by design (bid value
  ≈ $0.0002 total). VKBT/BLANK show no evidence of staking rewards. Token airdrops to holders
  exist historically but with 1.0 BEE + dust the expected pickup is ~$0 (searches found no
  active airdrop relevant to our holdings — negative search, 2026-10-01).
- Effort to farm any of it: real; expected value: ~zero. Skip.

**#5 — SP/HIVE rent-out (dlease etc.). EV ≈ $0 — marketplace is dead.**
- dlease.io now redirects to an unrelated squatter site (curl: final URL belgaumexpress.in,
  anti-bot shell, retrieved 2026-10-01 23:2x UTC) — VERIFIED DEAD. steemit.com/proposals
  returns 403 (bot-walled) and pays proposers, not small delegators. Hive-side RC leasing
  needs stake we don't have (17 HP). No KYC-free rent-out market reachable at our size.
  If a successor marketplace reappears (HE "Lease" tab now on hive-engine.com navigation),
  re-evaluate then — UNKNOWN/low priority.

### What we are NOT doing (honest)

- No BTC/ETH/SOL paths, no exchange accounts, no KYC rails (by design/operator constraint) —
  every idea above is chain-native.
- Hive "boost"/bid-bot services (hive.vote etc.) SPEND tokens for visibility; they are a cost,
  not a revenue path, at our sizes. Not researched further.

---

## Next moves (max 5)

1. **Fix the engine op id law**: change every engine-signing path to custom_json id
   `ssc-mainnet-hive` (grep the fleet for `ssc-mainframe` — likely one constant in
   econ-desk.cjs / wrapper code), re-broadcast the 5.49308870 BEE sell @ ≥0.54965 live bid,
   content-match read-back against market/sellBook, and retire the ENGINE-STALL gate in favor
   of an indexed-frontier gate. CI-able this week.
2. **Fix the frontier probe**: all market probes must pass
   `indexes:[{"index":"_id","descending":true}]` (add an assertion that the newest row's
   timestamp is within 24h of now, else flag). Book a correction note to CLAIMS Z-29 (the
   342.9h "stall" verdict) so downstream books stop carrying it.
3. **Resolve the 0.310 HIVE wrapper credit**: verify the official deposit flow from the live
   hive-engine.com UI (exact account + memo rules) before any retry; if @hiveswap is wrong or
   dead, write the row off honestly and stop polling.
4. **Steem yield sprint (top EV)**: set an explicit curation quota on headcorner (e.g. 10–20
   votes/day, VP-capped) + daily claim of author/curation rewards; measure SP earned/week for
   2 weeks and compare against the $1.5–4.5/mo ESTIMATE. CI-able; reuses live agents.
5. **HBD loop stub**: build the monthly claim_interest + convert-to-HBD-when-above-floor
   routine now (rate verified 10% APR), fund it automatically only when fleet liquid HIVE >
   fuel floor. Zero cost until principal exists.
