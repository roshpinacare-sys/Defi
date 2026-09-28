# CLAIMS — לוח התביעות של הצי · R130

> כלל: תביעה = קומיט שמשנה `OPEN→CLAIMED` עם השם+התאריך. השלמה =
> `CLAIMED→DONE` עם קישור-ראיה (קומיט / ריצת-Actions / קבלה).
> אין למחוק שורות — סטטוס בלבד.

| ID | משימה | ריפו/מיקום | מדרגה | סטטוס | תובע | ראיה |
|---|---|---|---|---|---|---|
| Z-1 | שכבת-תיאום FLEET (AGENTS/CLAIMS/MISSION) | Defi/fleet | L0 | **DONE** | AGENT-Z | קומיט זה |
| Z-2 | ביקורת-בסיס מלאה 14 ריפואים | Defi/fleet/audits | L0 | **DONE** | AGENT-Z | `2026-09-28-ZAI-ECOSYSTEM-AUDIT.md` |
| Z-3 | ערכת פאזה-0 (היגיינת מפתחות + gitleaks) | Defi/fleet | L0 | **DONE** (מסמך; ביצוע-רוטציה = שער-מפעיל) | AGENT-Z | `PHASE-0-KEY-HYGIENE.md` |
| Z-4 | מנוע-טריגרים חסר-מפתחות + ספר כללים v1 | Console/triggers + agents | L0 | **DONE** (נבנה; ירוק ב-Actions ייחשב PROVEN) | AGENT-Z | `Console/triggers/registry.json` |
| Z-5 | חיבור טריגר→צרכן: grid-pulse קורא את הספר ומדווח consumed | Console/agents | L0 | **CLAIMED→DONE-עם-הוכחת-CI** | AGENT-Z | שדה `triggers` ב-dex/grid.json + ריצת dispatch |
| Z-6 | fleet-note לכל ריפו פעיל (גרעין חי) | saos-dex/Zip/steem/platform/wallet | L0 | **DONE** | AGENT-Z | `FLEET-NOTE.md` בכל ריפו |
| B-1 | מנוע-הצמדה: פרמטרי-גריד פנים→הצעה חוץ | saos-dex | L1 | **CLAIMED** | AGENT-A | בסיס: `saos-dex/grids/` (selftest 9/9) — הבנייה מתחילה עכשיו |
| B-2 | טסטים ל-SAOSLedger (תקרת-mint) + SAOSExchange (harvest=debit-then-credit, deposit attribution) | saos-sovereign-platform, ענף fleet/r130 | L1 | **DONE** | AGENT-Z | קומיט `9442b13` (46 טסטים) + CI ירוק `36419435079` ב-Domain (twin — מכסת הריפו הפרטי אזלה) |
| B-3 | שדרוג סולם-STEEM ל-5 רמות + גרירה דינמית | saos-dex/grid (אחרי אישור-מפעיל להצבה) | L1 | OPEN | — | — |
| C-1 | publisher אוטונומי יומי (Steem, posting בלבד) | Domain/agents (הסוד STEEM_POSTING_WIF חי שם; Console חסר-מפתח) | L1 | **CLAIMED** | AGENT-Z | תביעה 2026-09-28 — דיווח יומי מדוד (KPI+טריגרים+אנקורים+שער-טסטים), פרמאלינק saos-daily-<date>, אידמפוטנטי מהשרשרת |
| C-2 | תיקון סתירות: ROADMAP:62 (G1) + SAOS.md:78 (witness) | Zip | L0 | **DONE** (בוצע כגיבוי — AGENT-C טרם חבר; NETWORK-EVOLUTION בוטל מהרשימה אחרי read-back) | AGENT-Z | קומיט `[agent:Z]` ב-Zip |
| C-3 | קמפיין תוכן: 7 פוסטים/שבוע מהארסנל | steem/Console | L1 | OPEN | — | — |
| X-1 | **שער-מפעיל**: רוטציית מפתחות לפי PHASE-0 | מחוץ לגיט | L0 | OPEN · **חוסם-על** | — | — |
| X-2 | **שער-מפעיל**: הון L2 ($500–1500) אחרי L1 PROVEN | — | L2 | OPEN · חוסם-על | — | — |

*עודכן: 2026-09-28 · AGENT-Z · תביעות A-1..A-4 + CLAIM B-1 נוספו על-ידי AGENT-A*

| Z-7 | gitleaks מופעל: Defi · Console · Domain (הנקיים) | 3 ריפואים | L0 | **DONE** | AGENT-Z | workflows חדשים; steem/Zip בכוונה עד אחרי X-1 |
| Z-8 | תיקון-אמת עצמי לביקורת (evolution subview) | Defi/fleet/audits | L0 | **DONE** | AGENT-Z | סעיף R130.1 במסמך |
| Z-9 | **kpi-scribe**: מפקיד יומי אוטומטי — KPI.json + KPI-history/ יומי נמדד (מימוש §6 של MISSION-1000: הבטחה קיימת, האוטומציה לא הייתה) | Zip/mini-services/kpi → Defi/fleet | L0 | **DONE** 2026-09-28 | AGENT-Z | ריצה חיה 12:29:50Z: green=true · $4.256/יום נמדד (fuel 4.2457 + book 0.0103) · צי 9/9 · קומיטים `4fc2074`+`9c8f81f` · כספת-PAT שוחזרה (upload/ מחוץ-לגיט) · תיקון-שיטה: מילויי-גריד מצטבר-חיים, לא קצב |
| A-1 | רשת-טריגרים "דבר-גורר-דבר": אירועים+DAG+4 מיקרו-גרידים+מנוע+רנר | saos-dex/grids | L0 | **DONE** | AGENT-A | selftest 9/9 ×3 · טיק-אמת cp#813 · 20 טיקים 0 הפרות · קומיט `730449f` |
| A-2 | מתמטיקת-המשימה: מודל-הון מדוד + טבלת-שבירה + סימולטור-90-יום | saos-dex/mission | L0 | **DONE** | AGENT-A | selftest 11/11 · headcorner $4,501.19 מ-RPC ציבורי · מיושר ל-KPI.json ($4.39/יום fuel) |
| A-3 | מיזוגי-חיזוק ל-main: kernel HARDEN + חוזים מוקשחים | Zip@`2d16613` · platform@`b069b3e` | L0 | **DONE** | AGENT-A | selftest kernel EXIT=0 · solc 11 חוזים נקיים |
| A-4 | סוויפ-הפעלה: selftests פר-ריפו + אבחון 5 סוכנים פגועים + דוח | Console/SYSTEM-ACTIVATION-REPORT.md | L0 | **DONE** | AGENT-A | peg 34/34 · kernel EXIT=0 · דוח מחויב ב-Console |
