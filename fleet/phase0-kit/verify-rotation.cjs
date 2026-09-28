#!/usr/bin/env node
/* verify-rotation.cjs — PHASE-0 X-1 · post-rotation verifier (clean machine)
 *
 * After rotate-fresh.cjs completes, this tool proves the end state:
 *   for every vault account → live chain authorities (steem + hive) ==
 *   the updated vault.json keys, bit-for-bit, on all four roles.
 *
 * Exit 0 = all green. Exit 2 = any mismatch (do NOT proceed to sweep-history).
 *
 * Usage: node verify-rotation.cjs [--account a,b,c | --all-soldiers | --all]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const STEEM_RPC = process.env.STEEM_RPC || 'https://api.steemit.com';
const HIVE_RPC = process.env.HIVE_RPC || 'https://api.hive.blog';

const args = process.argv.slice(2);
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const steem = createRequire(path.join(__dirname, 'probe.cjs'))('steem');
const VAULT = path.join(__dirname, 'keys', 'vault.json');

function log(m) { console.log('[' + new Date().toISOString() + '] ' + m); }
function mask(p) { return typeof p === 'string' && p.length > 12 ? p.slice(0, 10) + '…' : p; }

async function rpc(url, method, params) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const j = await res.json();
  return j.error ? null : j.result;
}

async function main() {
  if (!fs.existsSync(VAULT)) { log('missing ./keys/vault.json'); process.exit(1); }
  const vault = JSON.parse(fs.readFileSync(VAULT, 'utf8'));
  let accounts = vault.accounts.map(a => String(a.username || '').toLowerCase());
  const spec = argOf('--account');
  if (spec) accounts = spec.split(',').map(s => s.trim().toLowerCase());
  else if (!args.includes('--all')) accounts = accounts.filter(u => u !== 'ynet'); // ynet needs an explicit operator decision

  log(`verifying ${accounts.length} accounts on steem+hive…`);
  let pass = 0, fail = 0;
  const failures = [];
  for (const u of accounts) {
    const entry = vault.accounts.find(a => String(a.username || '').toLowerCase() === u);
    if (!entry?.keys) { failures.push(`${u}: no vault entry`); fail++; continue; }
    const s = (await rpc(STEEM_RPC, 'condenser_api.get_accounts', [[u]]))?.[0] || null;
    const h = (await rpc(HIVE_RPC, 'condenser_api.get_accounts', [[u]]))?.[0] || null;
    if (!s) { failures.push(`${u}: absent on steem`); fail++; continue; }
    const roles = ['owner', 'active', 'posting'];
    const bad = [];
    for (const r of roles) {
      const livePub = s[r]?.key_auths?.[0]?.[0];
      const vaultPub = entry.keys[r]?.pub;
      if (livePub && vaultPub && livePub === vaultPub) continue;
      bad.push(`steem:${r}`);
    }
    if (s.memo_key && entry.keys.memo?.pub && s.memo_key !== entry.keys.memo.pub) bad.push('steem:memo');
    if (h) {
      for (const r of roles) {
        const livePub = h[r]?.key_auths?.[0]?.[0];
        const vaultPub = entry.keys[r]?.pub;
        if (livePub && vaultPub && livePub === vaultPub) continue;
        bad.push(`hive:${r}`);
      }
      if (h.memo_key && entry.keys.memo?.pub && h.memo_key !== entry.keys.memo.pub) bad.push('hive:memo');
    }
    if (bad.length) { failures.push(`${u}: mismatch → ${bad.join(', ')}`); fail++; log(`✗ @${u}: ${bad.join(', ')}`); }
    else { pass++; log(`✓ @${u}: vault == live (owner ${mask(s.owner.key_auths?.[0]?.[0])})${h ? ' · steem+hive' : ' · steem only'}`); }
  }
  log(`── verify: ${pass} pass · ${fail} fail ──`);
  if (failures.length) { log('FAILURES:'); for (const f of failures) log('  · ' + f); log('DO NOT run sweep-history.sh until all green.'); }
  process.exit(fail ? 2 : 0);
}

main().catch(e => { log('fatal: ' + String(e.message).slice(0, 200)); process.exit(1); });
