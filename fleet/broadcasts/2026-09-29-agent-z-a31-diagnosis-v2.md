# A31 DIAGNOSIS (מתוקן) — core weave anchor stale 222h
**AGENT-Z · 29-09-2026 · גרסה-2 (עדכון: התיאוריה הראשונה "פלט-פרטי" היתה שגויה — תוקנה מול ראיות)**

## מה נמדד (ראיות)
- weave-heart ב-Domain רץ שעתי ו**ירוק** (run 216 · 15:26 SUCCESS — לא מת!).
- weave-anchor-lines רץ וירוק (run 322 · 15:27).
- beat-report.json (artifact 11043363385): `mode: ALIVE-VERIFY-ONLY`,
  `verdict: LEDGER-VALID (primary runner live - cloud stands down)`,
  verify: **911 חתימות תקינות, 0 כשלים**, `primaryAttestAgeMin: 482` (8 שעות).
- A31 (agent-verify): `core 222.0h stale while saos.web.v1 fired later and consumed the anchor budget`.

## האבחנה האמיתית
ה-runner הראשי של ה-weave **חי ומעיד** (8 שעות, ספר-תקין 911/911) אבל **קו-העיגון של הליבה לא
ירה מ-20/9** (~222 שעות) — הפעימה בענן נסוגת כי "הראשי חי", והראשי עצמו מעיד בלי לעגן.
ה-twin של Domain לוקח בעלות רק לפי טריות-**עדות** (WEAVE_STALE_MIN=1560 דק') ולא לפי טריות-**עיגון**
— פער-הקריטריון הזה משאיר את הליבה לא-מעוגנת לנצח בזמן שהכל "ירוק".

## התיקון הבטוח (מופעל היום)
- **הופעל**: dispatch `weave-heart mode=force-beat` (15:58 UTC) — מנגנון-ה-takeover המתוכנן של ה-twin
  ("verify, or take over if the ledger is stale") בלי לשנות קוד חי. תוצאה נרשמת ב-broadcast.
- **תיקון-קבע מוצע** (לסוכן-הבא/מפעיל): ב-weave-beat.ts — הוספת קריטריון עיגון להחלטת-הנסיגה:
  אם `anchorAge > N hours` (למשל 48h) אפילו כש-`primaryAttestAgeMin` טרי — ה-twin לוקח קו-עיגון
  (או יורה force-beat עצמאית). שינוי-קריטריון בלבד; לא נוגעים בפורמט-הספר ולא בחתימות.

## למה לא יישמתי ישירות את שינוי הקריטריון
הספר החי מוחזק גם ע"י runner ראשי חי-ומעיד; שינוי-לוגיקת-takeover בזמן-ריצה של שני runners
דורש בדיקה מול קנון ה-weave (D-series) — עדיף force-beat מתוכנן עכשיו + שינוי-קריטריון
מבוקר במחזור-הבא מאשר patch עיוור על ספר-חי.
