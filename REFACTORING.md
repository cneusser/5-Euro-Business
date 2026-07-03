# VentureLab Modul-Split (v0.93) — Refactoring-Dokumentation

**Datum:** 2026-07-03 · **Art:** Reines Refactoring, keine funktionalen Änderungen
**Backup des Monolithen:** `index.html.v092-monolith.bak` (8.922 Zeilen, unverändert)

## Technik-Entscheidung

Klassische `<script src>`-Tags in fester Ladereihenfolge statt ES-Module. Grund: Die App nutzt
~470 inline `onclick`-Handler und ~319 Funktionen im globalen Scope. Klassische Scripts teilen
den globalen Scope exakt wie der bisherige eine `<script>`-Block — die Konkatenation aller
Dateien in Ladereihenfolge ist **byte-identisch** zum Original (maschinell verifiziert).
ES-Module hätten hunderte `window.x = x`-Bindungen erfordert (hohes Regressionsrisiko).
Eine spätere ESM-Umstellung bleibt möglich, sobald Tests existieren.

## Diff pro Datei

Alle Dateien enthalten den Original-Code **unverändert** (Zeilenangaben = Original-index.html).
"Diff" ist daher je Datei die Verschiebung; echte Änderungen sind unten separat gelistet.

| Datei | Original-Zeilen | Inhalt |
|---|---|---|
| `core/config.js` | 1358–1388 | CONFIG, FIREBASE_CONFIG |
| `core/state.js` | 1389–1450 | Daten-Arrays, CODES, rebuildCodes() |
| `core/persistence.js` | 1451–1622 | saveData/loadData, _buildPayload, _replaceArrays, _postLoadCalc |
| `core/firebase-auth.js` | 1623–2001 | Magic Link, _onAuthUser, Firebase-Listener |
| `core/app-state.js` | 2002–2021 | UI-State-Objekt |
| `core/feature-flags.js` | **NEU** | game.modules-Flags (s.u.) |
| `modules/registration.js` | 2022–2454 | Team-/Mitglieder-Registrierung, TEST_DATA |
| `core/helpers.js` | 2455–2527 | Hilfsfunktionen |
| `core/auth.js` | 2528–2927 | Passwörter, doLoginStep1/2, finishLogin — **ohne** setLoginLang (→ i18n/en.js) |
| `core/init.js` | 2928–3470 | Init, buildNavigation, Announcements — **1 Zeile geändert** (s.u.) |
| `ui/navigation.js` | 3471–3497 | navigateTo, renderPage — **1 Zeile eingefügt** (s.u.) |
| `modules/ranking.js` | 3498–3694 | Dashboard/Ranking |
| `modules/myteam.js` | 3695–4112 | Mein-Team-Seite |
| `modules/profile.js` | 4113–4242 | Profil-Seite |
| `modules/reflections.js` | 4243–4277 | Reflexions-Seite |
| `modules/teams-blog-tx.js` | 4278–4392 | Teams-/Blog-/Buchungs-Seiten (Render) |
| `modules/feedback.js` | 4393–4541 | Feedback-Seite |
| `modules/kontakt.js` | 4542–4694 | Kontakt/Messaging |
| `modules/admin.js` | 4695–5489 | Admin-Seite (inkl. GDW) |
| `modules/superadmin.js` | 5490–5620 | Superadmin-Seite (Render) |
| `modules/konzept.js` | 5621–5900 | Konzept-Seite |
| `modules/bookings.js` | 5901–6418 | ACTIONS: submitBooking, Blog-/Reflexions-Aktionen |
| `modules/members.js` | 6419–6658 | Mitglieder-Management |
| `modules/code-export.js` | 6659–6697 | Code-Export |
| `ui/modal-dropdowns.js` | 6698–6843 | Modal-Dropdown-Befüllung |
| `core/codegen.js` | 6844–6905 | Code-Generierung |
| `modules/superadmin-manage.js` | 6906–7747 | Spielverwaltung, Ernennung — **ohne** TRANS_MAP/applyLang (→ i18n/en.js) |
| `core/tracking.js` | 7748–7757 | Session-Tracking |
| `modules/weekly-questions.js` | 7758–7851 | Custom Weekly Questions |
| `modules/reminders.js` | 7852–7992 | In-App-Reminder |
| `modules/reports.js` | 7993–8328 | Export / Reporting |
| `modules/guest-admin.js` | 8329–8384 | Gastadmin |
| `modules/bmc.js` | 8385–8577 | Business Model Canvas |
| `core/backup.js` | 8578–8658 | Backup-System, logEvent |
| `i18n/de.js` | **NEU** (Stub) | DE ist Quellsprache im Markup; Zielort für spätere Extraktion |
| `i18n/en.js` | 2542–2626 + 7385–7687 | setLoginLang, TRANS_MAP, applyLang — unverändert verschoben |
| `core/app-start.js` | 8659–8665 | App-Start |
| `index.html` | 1–1356 + 8667–8922 | HTML unverändert; JS-Block ersetzt durch 37 Script-Tags |

Hinweis zur Modul-Zuordnung: Die gewünschten Module *bookings, reports, reflections, bmc,
ranking, admin, superadmin* existieren alle als Dateien. Die Schnitte folgen den vorhandenen
Code-Sektionen (kein Umsortieren einzelner Funktionen = kein Regressionsrisiko). Feinere
Aufteilung (z. B. Blog-Aktionen aus `bookings.js` heraus) ist ein optionaler Folgeschritt.

## Echte Änderungen (die einzigen drei)

**1. `core/init.js` — buildNavigation (ehem. Z. 3006):**
```diff
-  pages.forEach(p=>{
+  // Feature-Flags: deaktivierte Module ausblenden (Default: alle aktiv → kein Verhaltensunterschied)
+  pages.filter(p=>isPageEnabled(p.id)).forEach(p=>{
```

**2. `ui/navigation.js` — navigateTo (ehem. Z. 3474):**
```diff
 function navigateTo(pageId){
+  if(!isPageEnabled(pageId)) return; // Feature-Flag game.modules (Default: alle aktiv)
```

**3. `core/feature-flags.js` — neue Datei:** `DEFAULT_MODULES` (alle `true`),
`PAGE_MODULE_MAP` (Seiten-ID → Modul), `getGameModules(game)`, `isModuleEnabled(name)`,
`isPageEnabled(pageId)`. Ein Spiel kann künftig `game.modules = {bmc:false, reports:false}`
setzen — Tabs und Navigation dieses Spiels blenden sich aus. Superadmin (ohne aktives
"Spiel verwalten") sieht immer alles. **Ohne gesetzte Flags: identisches Verhalten.**

## Maschinelle Verifikation (bestanden)

1. **Phase A:** Konkatenation aller Split-Dateien byte-identisch (SHA-256) mit dem Original-JS-Block.
2. **Phase C:** `node --check` auf allen 37 Dateien ohne Fehler.
3. **Phase D:** Reassembly-Probe — i18n-Moves zurückgesetzt + die 2 Hook-Zeilen zurückgedreht
   ⇒ byte-identisch mit Original. Es gibt also **beweisbar keine** unbeabsichtigte Änderung.

## Testanleitung

**Lokal (vor dem Push):**
1. Im Projektordner: `python3 -m http.server 8000` → `http://localhost:8000/index.html`
   (nicht per Doppelklick öffnen — Script-Pfade und Firebase brauchen HTTP).
2. Konsole (F12) offen halten: keine roten Fehler beim Laden erwartet.
3. Smoke-Test Demo-Modus: „Demo / Testmodus" → Ranking sichtbar, Tabs durchklicken,
   Buchung anlegen (Demo), Sprache auf EN umschalten (prüft verschobenes i18n),
   zurück auf DE, Logout.
4. Smoke-Test echter Login: Zugangscode + Passwort, eine Buchung anlegen, in zweitem
   Browser-Tab prüfen, dass sie synchronisiert.

**Deploy:** Ordner `core/`, `modules/`, `ui/`, `i18n/` und `index.html` gemeinsam ins
GitHub-Repo (Venture-Labs) pushen. Wichtig: alle 4 Ordner müssen mit — sonst weiße Seite.
Nach dem Deploy Hard-Reload (Cmd+Shift+R), da GitHub Pages cached.

**Rollback:** `index.html.v092-monolith.bak` → zurück nach `index.html` kopieren, pushen. Fertig.

**Feature-Flags testen (optional, ändert Verhalten — erst nach Freigabe):**
In der Browser-Konsole als Superadmin:
`GAMES[0].modules = {bmc:false}; saveData(); buildNavigation();` → Canvas-Tab verschwindet
für dieses Spiel. Zurück: `delete GAMES[0].modules; saveData(); buildNavigation();`
