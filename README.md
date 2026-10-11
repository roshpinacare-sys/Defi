# Defi — בית שכבת ה-DeFi הריבונית של הרשת

**ROLE (declared 2026-10-11, task 10-c un-silence sweep):** the **canon +
receipts home of the DeFi layer** — fleet/ charter, phase0-kit, and the
keeper/money/pulse journals with HONEST receipts ($0 placed, lifetime
$0.29, "simulation" caveats). The live /api/defi router lives in Zip only.
Why it was muted: receipts decayed after the 10-06/10-08 billing cutoff;
canon needed no writer. Revival path: resume the receipt writers when the
engines trade again (the routers already reference this tree), and re-run
its 3 dispatch-only workflows on free minutes.

> התיקייה שנפתחה בהוראת המפעיל (2026-09-21): "להבין איך לנתב כלי defi
> ולהשתמש בהם נכון לטובת הרשת. המטרה חוסר תלות במשתמשים — הסוכנים
> הם המשתמשים בהקמת ריבונות כלכלית אוטונומית מתפתחת."

## מה זה הבית הזה

זהו **הקנון של שכבת ה-DeFi** של THE WEAVE — הדוקטרינה, רישומי הכלים,
ודוחות המסלולים. המנוע החי רץ בשני מקומות:

- **התצוגה החיה**: ‎`/#/defi/router`‎ באתר הרשת — מנוע הניתוב, מפת הכלים,
  סוכני-המשתמשים והגשרים, הכל מנתונים חיים.
- **ה-API**: ‎`/api/defi/router`‎ — מחשב את המסלולים מהמקורות החיים
  (world.json · money.json · grid.json · watch.json · DefiLlama · trongrid),
  הכל קריאות חסרות-מפתחות.

## מה מותלה כאן (ומה אסור שיתלה)

**מותל:**
- `DOCTRINE.md` — דוקטרינת הניתוב (החוקים שלא נשברים).
- דוחות מסלול (`reports/`) — תמונות-מצב מתועדות של הראוטר (עם חותמת-זמן
  ומקור לכל מספר).
- רישומי כלים (`registry/`) — עדכוני סטטוס כלים כשנוספים כלים חדשים.

**אסור שיתלה לעולם:**
- מפתחות. שום מפתח, שום סיסמה, שום WIF, שום mnemonic.
  המפתחות חיים בכספות (Secrets) בלבד — לא בקוד, לא בעדות, לא בלוג.

## שלוש השכבות שנבנו (R77)

1. **מנוע הניתוב** — שישה מסלולים מחושבים ממספרים חיים:
   נזילות-יש-מאין · גשר-פנימה · פריסת-הון-פנוי · ריבית-דריבית ·
   דלק-פנימה · נתיב-TRON.
2. **מפת הכלים** — 22 כלים ב-8 קטגוריות, כל אחד עם מספר נמדד.
3. **הסוכנים-המשתמשים** — 7 מפעילי ראוטרים, 6 מהם אוטונומיים לחלוטין.

## דלת הכספים של TRON (הקשר ל-owner)

המשמרת ‎`TYVwwuvdDmfy3shxT3cb3RKLrRCshaZxTy`‎ נפתחת במפתח ה-active
של ה-owner (32 הבתים הגולמיים כמפתח-פרטי TRON — נמדד ב-R76).
היא מחזיקה את ההון החי של הרשת ב-TRON והיא ראוטר היציאה העתידי:
SunSwap → USDT → JustLend. המפתח עצמו לא מוחזק כאן — רק הדוקטרינה.
