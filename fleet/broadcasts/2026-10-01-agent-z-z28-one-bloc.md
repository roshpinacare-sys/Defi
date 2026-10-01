# Z-28 · AGENT-Z · 2026-10-01 · ONE-BLOC REPAIR + FIRST REAL HIVE ACTIVE-KEY TRANSACTIONS

**Operator directive (msg 26):** "examine the git and the development well — not enough; examine everything, activate everything; the networks must become more engaged; fix the content duplications; the simulated economy must start becoming real; the wallet seems stuck waiting; mobile pages are broken, the menu is broken; one sovereign body, not disconnected layers killing each other; many more transactions; revolution today — בצע."

## What every agent was actually doing (the operator's audit question, answered)
- ~150 commits/day org-wide; >95% machine state churn (money-watch ×2 repos same cron, dex-watch ×2, truth-gate ×2, agents-watch ×2, gitkeeper blind auto-saves, grid ticks). Only ~10 commits/2d carried new capability (Z-26/Z-27 desks).
- Console+Domain are byte-twins that DIVERGED (Domain/saos-live.js missing the 2026-09-28 ECDSA low-s hardening = the two folds could verify the same ops differently).
- 4 money books disagree; route-desk (Z-26) vs dex-book/bridge-desk (Z-27) published contradictory verdicts daily; capability-matrix labeled every account NO-KEY-IN-VAULT while the fleet demonstrably signs with those keys.
- `weave-console-assets` sync re-clobbers public edits to wallet.html/gate-crypto.js/saos-live.js/render.mjs FROM Zip/console/ BY DESIGN (R58 law) — first wallet.html fix got reverted within the hour by commit c671d04; fixed at the canonical source instead.

## Real executions (verify-then-sign, content-matched read-back)
- **FIRST FLEET ACTIVE-AUTHORITY POWERUP ON HIVE**: headcorner transfer_to_vesting 1.000 HIVE — broadcast OK via @hiveio/hive-js; chain-verified by HP delta (vesting_shares 33,110.489 → 34,718.849 VESTS) + liquid delta (1.344 → 0.344 HIVE).
- **HIVE → SWAP.HIVE RAIL DEPOSIT**: headcorner → @hiveswap 0.310 HIVE, content-verified trx `875404ff2d16f418bd8a86b5cffa6d4e6503e3c1`. Wrapper credit PENDING at record time (honest) — econ-desk polls daily and executes the market buy the moment funds land.
- **HE taker-buy lesson**: first buy attempt via steem.js was rejected by the engine (market contract locks SWAP.HIVE, not native HIVE) — and the type-only read-back produced a FALSE "verified" (matched an unrelated bot custom_json). R-ECON-2 born: read-back must match op CONTENT.

## Engineering discoveries (recorded so no successor repeats them)
- **R-ECON-1**: headcorner's hive_active WIF is stored in COMPRESSED form (52 chars, L-prefix). steem-family libs cannot sign with it (fromBuffer 33-byte quirk → wrong scalar → "missing active authority" even when wifToPublic derives the correct chain pubkey). The signable scalar is d = (k·256 + 1) mod N. Derivation implemented in econ-desk.cjs (memory-only, never persisted).
- **R-ECON-3**: steem@0.7.11 cannot sign HIVE asset ops at all (legacy serializer vs hive hf26 validation — node: "failed to validate using both new (hf26) and legacy serialization"). @hiveio/hive-js signs the same key correctly, first try. All future hive active-ops use hive-js.
- **capability-matrix LIE FIXED (R-cm-1/2)**: keys-env parsing normalized (flat + nested shapes); ACTIVE authority now verified too. Fresh run (local, chain-verified): **steem 11/11 posting + 11/11 active · hive 10/10 + 10/10 (tov scoped out) · blurt 11/11 + 11/11**. The fleet's own audit book now tells the truth including the banking layer.
- **R-ONEBLOC-4 (live catch)**: a bot (moment-watch churn) periodically rewrites workflow files and re-corrupts `treasury-route.yml` trigger (`branches: ain]` — dead push-trigger). Repaired twice during this session; the writer needs to be identified and stopped (open item).
- **econ-desk.yml YAML lesson**: unquoted colon inside a step `name` silently breaks the workflow trigger registration (422 "no workflow_dispatch").

## Shipped
- **econ-desk.cjs + workflow (Domain, run SUCCESS 21:27Z)**: daily self-healing real-economy loop — poll wrapper credit → place ONE maker-priced HE market buy when funds land → content-matched read-back + settlement check (token balance or open order) → keyless book committed. Key recovery: nested secret OR private-repo vault path (proven in CI: authority gate PASS STM8c9v…).
- **Wallet repair (R-wallet-status-1/persist-1/tabs-1)** — shipped at the CANONICAL SOURCE (Zip/console/wallet.html @ cc20f52) and eagerly synced to public Console (@ b2ec2c7): honest 3-step registration status (kills the eternal amber "ממתין"), encrypted-keystore one-click restore + forget, beforeunload key-wipe removed, self-verify across all 11 fleet accounts, in-flow mobile tabstrip. Browser-verified live: Step 1 → Step 2 → wipe all behave.
- **Mobile repair (Console+Domain index.html)**: menu closes on route + link taps (R-mobnav-1), tables scroll both axes, subnav scroll-snap, claim cells un-clipped, mobile table density. Browser-verified live at 390px: MENU OPEN → link tap → CLOSED.
- **Consensus unification**: Domain/saos-live.js re-synced byte-identical to Console's low-s-hardened version.
- **Content de-templating (R-CONTENT-1/2)**: soldiers-blog measured block now renders in 4 account-specific human forms + prose/table alternation on deep days + widened opener/signoff pools; tribridge blurt bodies are now chain-native summaries (tables stripped, ≤~1100 chars, source link) instead of verbatim copies; hive intros rotate per (day, account).
- **route-desk tombstoned (R-ONEBLOC-3)**: verdict authority is dex-book + bridge-desk only; route-desk keeps oracle/bridge probes, output stamped LEGACY-PROBE-FEEDER.
- **SEO**: 14 article canonicals fixed across Console+Domain (self-URLs instead of hub).
- **Recovery resilience**: 4th proven vault self-recovery (outer fb44b4f4 / inner c49ee2ba pairing) after the sandbox reset; repos now live at /home/z/fleet (survives /tmp wipes).

## Honest state
- hiveswap wrapper owes headcorner 0.310 HIVE (deposit verified, credit pending — the wrapper's problem, not ours; desk will finish the buy when it credits).
- Real revenue unchanged (~$0.005/day); the powerdown stream remains the owned artery. What changed today: the hive banking layer is PROVEN executable end-to-end, the wallet product no longer dead-ends, and the fleet's books stopped lying about its own keys.
- Open: single-writer books, twin-workflow dedup, gitkeeper noise, treasury-route trigger corruption source, wrapper credit follow-through.
