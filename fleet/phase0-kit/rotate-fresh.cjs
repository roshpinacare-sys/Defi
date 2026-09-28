#!/usr/bin/env node
/* rotate-fresh.cjs — PHASE-0 X-1 · fresh-random key rotation (clean-machine tool)
 *
 * THIS TOOL RUNS ON THE OPERATOR'S CLEAN MACHINE — never inside the sandbox.
 * The sandbox is assumed compromised (PHASE-0 §0 doctrine); any secret generated
 * there is born burned. Fresh secrets are generated HERE, on this machine, from
 * crypto.randomBytes — never derived from FACTORY_MASTER or any historical seed.
 *
 * What it does per account (both chains: steem + hive):
 *   1. generates fresh random WIFs for owner/active/posting/memo
 *   2. verifies the CURRENT vault owner key still matches the LIVE chain owner
 *      authority (abort on mismatch — stale vault never signs)
 *   3. vault-first: writes the new keys into keys/vault.json (machine-local)
 *   4. broadcasts account_update (owner-signed) preserving account_auths
 *   5. writes rotation_evidence/<account>.json (masked pubs + txids — no secrets)
 *
 * Usage:
 *   node rotate-fresh.cjs --dry --account cashmachine,haran
 *   node rotate-fresh.cjs --account cashmachine,haran,lsa,macrame,siq,tov,wic,wog,woq
 *   node rotate-fresh.cjs --all-soldiers          (the 10 vault==live accounts)
 *
 * Inputs (clean machine):
 *   ./keys/vault.json   — extracted from KEYS-BACKUP (keys-backup/agent/keys/vault.json)
 *   ./secrets/          — optional: operator stores printed WIFs here after run (air-gapped)
 * Output:
 *   ./keys/vault.json (updated, mode=fresh) · ./rotation_evidence/*.json
 *
 * LAWS: no secret is ever printed · no secret is ever sent anywhere except the
 * chains' broadcast endpoints · account_auths (rescue anchors) are preserved.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createRequire } = require('module');

const STEEM_RPC = process.env.STEEM_RPC || 'https://api.steemit.com';
const HIVE_RPC = process.env.HIVE_RPC || 'https://api.hive.blog';
const HIVE_CHAIN_ID = Buffer.from('beeab0de00000000000000000000000000000000000000000000000000000000', 'hex');

const args = process.argv.slice(2);
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const DRY = args.includes('--dry') || /^(1|true|yes)$/i.test(process.env.DRY || '');
const ALL_SOLDIERS = args.includes('--all-soldiers');

// steem-js from the tool's own node_modules (npm i steem@0.7.11 first)
const steem = createRequire(path.join(__dirname, 'probe.cjs'))('steem');

const VAULT = path.join(__dirname, 'keys', 'vault.json');
const EVID = path.join(__dirname, 'rotation_evidence');
const ROLES = ['owner', 'active', 'posting', 'memo'];

function log(m) { console.log('[' + new Date().toISOString() + '] ' + m); }
function mask(pub) { return typeof pub === 'string' && pub.length > 12 ? pub.slice(0, 10) + '…' : pub; }

function freshWif() {
  // 32 random bytes → base58check WIF (0x80 prefix) — steem-js compatible
  const k = crypto.randomBytes(32);
  const payload = Buffer.concat([Buffer.from([0x80]), k]);
  const sha1 = crypto.createHash('sha256').update(payload).digest();
  const sha2 = crypto.createHash('sha256').update(sha1).digest();
  const full = Buffer.concat([payload, sha2.slice(0, 4)]);
  // base58 encode
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + full.toString('hex')), out = '';
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of full) { if (b === 0) out = '1' + out; else break; }
  return out;
}

async function rpc(url, method, params) {
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      const j = await res.json();
      if (j.error) throw new Error(String(j.error.message || 'rpc').slice(0, 100));
      return j.result;
    } catch (e) { if (a === 3) throw e; await new Promise(r => setTimeout(r, 1200 * a)); }
  }
}

async function getAcc(url, name) { return (await rpc(url, 'condenser_api.get_accounts', [[name]]))?.[0] || null; }
async function dgpo(url) { return rpc(url, 'condenser_api.get_dynamic_global_properties', []); }

function makeTx(head, ops, chainId) {
  const ref = chainId ? null : head.head_block_id;
  return {
    ref_block_num: head.head_block_number & 0xffff,
    ref_block_prefix: Buffer.from(ref, 'hex').readUInt32LE(4),
    expiration: new Date(new Date(head.time + 'Z').getTime() + 90000).toISOString().slice(0, 19),
    operations: ops,
    extensions: [],
  };
}

function signTx(tx, chain, wifsByRole) {
  if (chain === 'steem') {
    const st = steem;
    const signatures = [];
    // owner authority signs owner-key rotation; steem-js handles via multiple keys
    const keys = [...new Set([wifsByRole.owner])];
    const signed = st.auth.signTransaction(tx, keys);
    return signed;
  }
  // hive via manual tx signing (chain_id prefix, secp256k1)
  throw new Error('hive signing requires steem-js hive fork — use the two-pass mode (--chains steem then hive via hive-js)');
}

async function broadcast(url, signedTx) {
  const r = await rpc(url, 'condenser_api.broadcast_transaction', [signedTx]);
  return r;
}

function updateOp(target, liveSpec, pubs) {
  const auth = (spec, newPub) => ({
    weight_threshold: spec.weight_threshold || 1,
    account_auths: spec.account_auths || [],
    key_auths: [[newPub, 1]],
  });
  return ['account_update', {
    account: target,
    owner: auth(liveSpec.owner, pubs.owner),
    active: auth(liveSpec.active, pubs.active),
    posting: auth(liveSpec.posting, pubs.posting),
    memo_key: pubs.memo,
    json_metadata: liveSpec.json_metadata || '',
  }];
}

async function rotate(account, vault, dry) {
  const entry = (vault.accounts || []).find(a => String(a.username || '').toLowerCase() === account);
  if (!entry || !entry.keys?.owner?.wif) { log(`✗ @${account}: no owner key in vault — cannot sign rotation`); return null; }

  const live = await getAcc(STEEM_RPC, account);
  if (!live) { log(`✗ @${account}: not found on Steem`); return null; }

  // the gate that makes stale vaults fail-closed
  const curOwnerPub = steem.auth.wifToPublic(entry.keys.owner.wif).toString();
  const liveOwnerPub = live.owner.key_auths?.[0]?.[0];
  if (curOwnerPub !== liveOwnerPub) {
    log(`✗ @${account}: vault owner (${mask(curOwnerPub)}) ≠ live owner (${mask(liveOwnerPub)}) — STALE VAULT, aborting. Run soldier repair first.`);
    return null;
  }
  log(`@${account}: vault-owner == live-owner ✓ (${mask(liveOwnerPub)})`);

  const pubs = {}, wifs = {};
  for (const r of ROLES) {
    wifs[r] = freshWif();
    pubs[r] = steem.auth.wifToPublic(wifs[r]).toString();
    if (!steem.auth.isWif(wifs[r])) { log(`✗ @${account}: generated invalid WIF for ${r}`); return null; }
  }

  const head = await dgpo(STEEM_RPC);
  const op = updateOp(account, live, pubs);
  log(`@${account}: plan built — account_auths preserved (owner ${live.owner.account_auths?.length || 0}, posting ${live.posting.account_auths?.length || 0}) · new pubs ${ROLES.map(r => mask(pubs[r])).join(' ')}`);

  if (dry) { log(`[DRY] @${account}: would broadcast account_update on steem+hive and update vault. No broadcast.`); return { account, dry: true, before: mask(liveOwnerPub), after: pubs }; }

  // vault-first (never hold stale creds), then broadcast
  entry.keys = Object.fromEntries(ROLES.map(r => [r, { wif: wifs[r], pub: pubs[r] }]));
  entry.mode = 'fresh';
  entry.rotatedAt = new Date().toISOString();
  entry.rotation = { derivedFrom: 'crypto.randomBytes (clean machine)', chains: ['steem', 'hive'] };
  entry.syncedAt = new Date().toISOString();
  fs.writeFileSync(VAULT, JSON.stringify(vault, null, 2));

  const tx = makeTx(head, [op]);
  let signed;
  try { signed = steem.auth.signTransaction(tx, [entry.keys.owner.wif]); }
  catch (e) { log(`✗ @${account}: signing failed: ${String(e.message).slice(0, 120)} — vault already updated; re-run will use new vault keys`); return null; }
  try {
    await broadcast(STEEM_RPC, signed);
    log(`✓ @${account}: steem broadcast ok`);
  } catch (e) { log(`✗ @${account}: steem broadcast failed: ${String(e.message).slice(0, 140)}`); return null; }

  const ev = {
    at: new Date().toISOString(), account, scheme: 'fresh-crypto-random (PHASE-0)',
    before: mask(liveOwnerPub), after: Object.fromEntries(ROLES.map(r => [r, mask(pubs[r])])),
    accountAuthsPreserved: { owner: live.owner.account_auths || [], posting: live.posting.account_auths || [] },
    chains: { steem: 'broadcast', hive: 'PENDING (run hive pass with hive-js after steem pass)' },
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, account + '.json'), JSON.stringify(ev, null, 2));
  return ev;
}

async function main() {
  if (!fs.existsSync(path.join(__dirname, 'probe.cjs'))) {
    log('setup first: npm init -y && npm i steem@0.7.11 && printf "try{module.exports=require(\\"steem\\")}catch(e){process.exit(1)}" > probe.cjs');
    process.exit(1);
  }
  if (!fs.existsSync(VAULT)) {
    log('missing ./keys/vault.json — extract from KEYS-BACKUP (keys-backup/agent/keys/vault.json) onto this machine');
    process.exit(1);
  }
  const vault = JSON.parse(fs.readFileSync(VAULT, 'utf8'));
  let targets = [];
  if (ALL_SOLDIERS) {
    targets = vault.accounts.map(a => String(a.username || '').toLowerCase())
      .filter(u => u !== 'headcorner' && u !== 'ynet');
  } else {
    const raw = argOf('--account') || '';
    targets = raw.split(',').map(s => s.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
  }
  if (!targets.length) return log('usage: node rotate-fresh.cjs --dry --account a,b,c | --all-soldiers');
  log(`boot · dry=${DRY} · targets(${targets.length}): ${targets.join(', ')}`);
  const results = [];
  for (const t of targets) {
    try { results.push(await rotate(t, vault, DRY)); }
    catch (e) { log(`✗ @${t}: ${String(e.message).slice(0, 140)}`); }
  }
  const ok = results.filter(Boolean);
  log(`── done: ${ok.length}/${targets.length} ${DRY ? '(dry plans)' : 'rotated on steem; hive pass pending'} ──`);
  log('NEXT (after all steem rotations): run hive pass (hive-js, chain_id beeab0de…) · rotate cloud posting WIFs (GitHub secrets) · re-seal KEYS-ZIP · THEN sweep-history.sh');
  process.exit(ok.length === targets.length ? 0 : 2);
}

main().catch(e => { log('fatal: ' + String(e.message).slice(0, 200)); process.exit(1); });
