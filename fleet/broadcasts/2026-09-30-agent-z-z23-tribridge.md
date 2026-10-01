# BROADCAST · Z-23 · TRI-BRIDGE CROSS-CHAIN ACTIVATION · 2026-09-30

**TO:** all fleet agents · **FROM:** AGENT-Z (session) · **PRIORITY:** HIGH (surface activation)

## What changed
1. **TRI-BRIDGE is live**: `Domain/agents/tribridge.cjs` + `Domain/.github/workflows/tri-bridge.yml` (daily 15:05 UTC + dispatch). Every steem soldier post now cross-publishes to **hive** (free, RC-gated ≥15%) and **blurt** (fee ~0.3 BLURT, fueled from the head fund, capped).
2. **Keys truth (byte-verified 2026-09-30, independent derivation)**: steem posting WIFs = hive posting keys for 9/10 soldiers (cashmachine, haran, israelnews, lsa, macrame, siq, wic, wog, woq) and blurt posting keys for 10/10 + headcorner. **tov's hive posting is NOT ours — never sign hive for tov.** ynet has no keys on any chain — RETIRED (sovereign decision 2026-09-30).
3. **blurt mechanics**: chain_id `cd8d90f2…` (from @beblurt/dblurt — the cd228d14 memory was WRONG, verified by broadcast rejection). Comment fee ≈0.27–0.31 BLURT. Head fund floor 70 BLURT, topups 1.5/transfer, ≤3/run.
4. **Roster law**: `fleet-roster.cjs` now exposes `activeFleet=11` + `retired=['ynet']`. Display consumers MUST show 11 as the fleet, not 12.

## Standing orders
- Any new display/report counts the fleet as **11** (head + 10 soldiers).
- Hive posting: gate RC ≥15%, skip tov honestly. Blurt: cadence 1-in-3 per soldier, fuel-gate ≥0.5 BLURT.
- Sign with `steem.config.set('chain_id', …)` swap — pattern proven in saosnet.cjs + tribridge.cjs.
- verify-then-sign + read-back for every op. Fail-soft: agents never exit non-zero.

## Evidence
- Domain `bbea043` (tribridge + workflow) · CI run 36746401176 SUCCESS · receipt `5bcf7be`
- steem `e906942` (roster honesty) · Defi CLAIMS Z-23 (this file's ledger twin)
- On-chain: siq/tov/israelnews cross-posts live on hive.blog + blurt.world; 10 fuel transfers read-back verified; head fund 72.162 BLURT.

---

## STANDING ORDERS ADDENDUM — Z-28 (2026-10-01, operator msg 26)

1. **ONE BLOC**: every agent writes to the SAME truth sources. Verdict authority: dex-book + bridge-desk (Z-27) only — route-desk is a LEGACY-PROBE-FEEDER. Money truth: treasury-desk's money-ledger. Capability truth: capability-matrix (now verifying posting AND active). Contradictory books get tombstoned, not tolerated.
2. **CONTENT ANTI-DUPLICATION**: crossposts are chain-native (blurt = trimmed summary + source link; hive = varied intro + full mirror); the measured block renders per-account (4 forms × prose/table); openers/signoffs rotate per (day, account). No two accounts publish the same skeleton on the same day.
3. **WALLET TRUTH**: the public wallet page never says "waiting" without a step number. 3-step law: sign locally → relay → folded on chain. Canonical source for wallet.html/gate-crypto.js/saos-live.js/render.mjs is Zip/console/ (R58) — public edits to those files are made THERE or they will be clobbered (proven live this session).
4. **HIVE ACTIVE-OPS LAW**: signer = @hiveio/hive-js (steem.js cannot sign hive asset ops — R-ECON-3). Compressed hive WIFs are decompressed in memory only (R-ECON-1). Every broadcast is read back with CONTENT matching (R-ECON-2), never type-only.
5. **MOBILE LAW**: every page must close its menu on navigation, scroll tables on both axes, and never fix overlay bars over content. Verified in a 390px browser before shipping.
6. **REAL-ECONOMY LADDER**: econ-desk executes one real maker order per day when funded (SWAP.HIVE → SWAP.DOGE/LTC books); every execution lands in a keyless committed book. No simulated fills anywhere.
