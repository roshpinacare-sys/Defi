# Z-27 · Usage Verification + DEX Depth + Bridge Truth + Idle-Stake Activation
**Date: 2026-09-30 · Operator directive: "implement the bridge, account, DEX, exposure, paths — everything; verify our usage; extract as much value as possible"**

## 1. What was implemented (shipped, committed, CI-wired)
| agent | file | function | first live run |
|---|---|---|---|
| capability-matrix | `Domain/agents/capability-matrix.cjs` | per-account×chain authority audit (byte-verified) + idle-capital flags → committed book | steem 11 · hive 9 · blurt 11 posting=OURS; 7 idle flags |
| dex-book | `Domain/agents/dex-book.cjs` | steem internal orderbook + SBD-premium + HE AMM depth + slippage model → committed book | premium +0.102% (no arb); SWAP.BTC pool 821k HIVE |
| bridge-desk | `Domain/agents/bridge-desk.cjs` | daily no-account-exchanger sweep with disabled/min truth + per-coin verdicts | godex STEEM/HIVE DISABLED (min 2400/2800) |
| blurt-curate | `Domain/agents/blurt-curate.cjs` | activates idle 8,727 BP: VP-gated bounded curation, byte-verify before sign | honest SKIP-VP (VP=0 measured; fires on regen) |

Wired into `.github/workflows/treasury-route.yml` (daily 16:20 UTC + push triggers). All receipts secretless, fail-soft, verify-then-sign.

## 2. What the books now measure (truth that changed this session)
1. **Hive-Engine depth = AMM, not orderbook.** The legacy `book` table returns EMPTY for wrapped coins; every wrapped-coin route runs through `marketpools`. Consequences: SWAP.BTC 821k HIVE reserve (0.01% impact @100 HIVE), SWAP.LTC 180k, SWAP.DOGE 186k, LEO 82k — deep enough for real routing **the day HIVE-side capital lands**. SWAP.ETH 631 HIVE (15.9% impact) and SWAP.SOL 93.5 HIVE (107% impact) are present but dust-deep — present ≠ routable.
2. **SBD is worth ~$0.0067** (feed 0.104102 SBD per STEEM × $0.0644) and trades +0.102% over feed — no convert-grade arb exists. The steem internal market remains a market-making venue (dex-grid), not an arb venue.
3. **godex is not a bridge.** STEEM/HIVE listed but disabled, minimums 2,400/2,800. No no-account exchanger we can reach supports STEEM/HIVE→BTC today. blocktrades re-probed daily from CI IPs.
4. **Key-derivation law**: BLT pubkey = STM body + prefix swap (10/10 chain-verified). Recomputed ripemd160² checksums produce invalid keys — documented, never to be repeated.
5. **Idle capital is now named daily**: 7 steem soldiers with VP 0 (their stakes are fuel-sized; curation resumes as VP regens), head blurt VP 0 → blurt-curate armed.

## 3. Value-extraction state after Z-27 (unchanged invariants, sharpened paths)
- Owned artery: 475.78 SP/wk powerdown → dex-grid market-making → booked by treasury-desk ($30.8/wk gross flow).
- Compounding: head steem curation 4×50%/day (verified) + blurt curation armed + claims rails on all three chains.
- External BTC/ETH/SOL exposure: still ZERO by design. The ignition switch remains ONE of: (a) blocktrades reachable from CI (probed daily), (b) operator C-gate: one exchange account+API keys (MEXC lists both STEEM and HIVE), (c) HIVE-side capital ≥ ~500 HIVE reaching the deep AMM pools. The books now verify all three daily, autonomously.
