// ════════════════════════════════════════════════════════════════════
//  KONZEPT PAGE
// ════════════════════════════════════════════════════════════════════
function renderKonzept(){
  document.getElementById('konzeptContent').innerHTML=`
    <div class="concept-section">
      <h2>🏗️ Systemarchitektur</h2>
      <p>Multi-Tenant Plattform mit 4-stufigem Rollen-System, individuellem Member-Login, privatem Reflexions-System, Wochen-Progression und Forschungs-Tracking.</p>
      <div class="flow-row">
        <div class="flow-box">👑 Superadmin<br><span style="font-size:10px;color:var(--gray-mid);">Plattform-weit</span></div><div class="flow-arrow">→</div>
        <div class="flow-box">⚙️ Admin<br><span style="font-size:10px;color:var(--gray-mid);">Pro Hochschule</span></div><div class="flow-arrow">→</div>
        <div class="flow-box">👥 Team<br><span style="font-size:10px;color:var(--gray-mid);">Team-Login</span></div><div class="flow-arrow">→</div>
        <div class="flow-box">👤 Member<br><span style="font-size:10px;color:var(--gray-mid);">Individuell</span></div>
      </div>
    </div>

    <div class="concept-section">
      <h2>📦 Version 1.0 — Feature-Set</h2>
      <p>Version 1.0 ist der erste vollständige, produktionsreife Release der VentureLab Plattform für den Einsatz in Lehrveranstaltungen.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
        ${[
          ['🔐 Auth & Rollen','4-stufiges Code-System (Superadmin / Admin / Team / Member), SHA-256 Passwörter, First-Login Setup, Passwort ändern'],
          ['👥 Team-Management','Rollen (CEO/CFO/CMO/COO/CTO) einmalig pro Team, Team-Profil, Logo-Upload, Farben, Slogan'],
          ['💳 Buchungen','Einnahmen & Ausgaben, CFO-only Buchungserfassung, Kategorie-System, Saldo-Berechnung'],
          ['📖 Blog & Berichte','Wöchentliche Berichte, Admin-Freigabe-Workflow, Stimmungsbild, MVP-Wahl'],
          ['🔒 Reflexionen','Private wöchentliche Reflexionen, nur für Autor und Admin sichtbar, Stimmung 1–5'],
          ['📊 Dashboard & Ranking','Live-Ranking, Umsatzentwicklung (Chart), ROI-Berechnung, Ticker'],
          ['🌐 i18n DE/EN','DOM-Walker Übersetzungssystem, per User speicherbar, Toggle in Topbar'],
          ['📄 FAQ-Dokumente','Admin lädt PDF hoch (max. 5 MB), Anzeige im Inline-Viewer auf Feedback-Seite'],
          ['📢 Pinnwand','Ankündigungen von Admin an alle Teams oder einzelne Teams, Anpinnen möglich'],
          ['✉️ Messaging','Hierarchischer E-Mail-Versand (Admin→Teams/Mitglieder) via Google Apps Script'],
          ['📡 Session-Tracking','Alle Klicks & Aktionen → Google Sheet "Tracking" (Forschungsprojekt)'],
          ['💾 Backup','Manueller JSON-Download + automatisches 24h-Backup → Google Sheet "Backups"'],
          ['🔔 Benachrichtigungen','E-Mail bei Bericht-Freigabe, Wochen-Fortschritt, Reflexions-Erinnerung'],
          ['👑 Superadmin','Plattform-Übersicht, Spiel-Verwaltung, Admin-Impersonation, Eigenes Profil'],
        ].map(([t,d])=>`<div style="background:var(--bg-light);padding:10px 14px;border-radius:var(--radius);border-left:3px solid var(--blue-mid);">
          <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${t}</div>
          <div style="font-size:12px;color:var(--gray-dark);">${d}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="concept-section">
      <h2>🔒 Reflexions-System</h2>
      <p>Jeder Teilnehmer schreibt wöchentlich eine private Reflexion (Stimmung 1–5, Erfahrungen, Was war gut, Was anders machen). Nur der Autor und Admins/Superadmin können diese lesen.</p>
      <pre style="background:#1e1e2e;color:#cdd6f4;padding:14px;border-radius:8px;font-size:12px;line-height:1.6;">Sichtbarkeit:
- Eigene Reflexionen: nur der Autor
- Admin: alle Reflexionen im eigenen Spiel
- Superadmin: alle Reflexionen plattformweit
- Teams / andere Member: KEIN Zugriff</pre>
    </div>

    <div class="concept-section">
      <h2>📅 Wochen-Progression</h2>
      <p>Jedes Team läuft unabhängig durch die Wochen. Ein Team schließt die Woche durch Einreichen des Wochenberichts ab. Nach Admin-Freigabe startet automatisch die nächste Woche.</p>
      <div class="flow-row">
        <div class="flow-box" style="background:var(--bg-light);">📂 Woche offen</div><div class="flow-arrow">→</div>
        <div class="flow-box" style="background:#FFF3CD;border-color:#FFC107;">⏳ Bericht eingereicht</div><div class="flow-arrow">→</div>
        <div class="flow-box" style="background:#D4EDDA;border-color:#28A745;">✅ Admin gibt frei</div><div class="flow-arrow">→</div>
        <div class="flow-box" style="background:var(--bg-light);">📂 Nächste Woche</div>
      </div>
    </div>

    <div class="concept-section">
      <h2>📜 Change-Historie</h2>
      <div style="font-size:13px;">
        <!-- Phase 1: Aufbau-Ära (localStorage) -->
        <div style="margin:10px 0 6px;padding:4px 10px;background:var(--gray-lt);border-radius:6px;font-size:11px;font-weight:700;color:var(--gray-mid);letter-spacing:.5px;text-transform:uppercase;">📦 Phase 1 – Aufbau &amp; Prototyping (localStorage)</div>
        ${[
          ['v0.1','Initiales Prototyp: Grundstruktur, Teams, Buchungen (localStorage)'],
          ['v0.2','Ranking-Dashboard, Umsatz-Chart, Blog-System'],
          ['v0.3','Multi-Game-Support, Hochschulen, Admin-Konsole'],
          ['v0.4','Superadmin-Panel, GitHub Pages Deployment, Demo-Daten'],
          ['v0.5','Self-Registration, Ticker, Team-Profil, Logo-Upload'],
          ['v0.6','Bug-Fixes: Syntax-Fehler, Feedback-Layout, Superadmin Verwalten'],
          ['v0.7','Superadmin: Profil bearbeiten, zusätzliche Superadmins anlegen'],
          ['v0.8','Chart: echte Wochendaten statt Zufallszahlen, Wochen-Rollback'],
          ['v0.9','Passwort-System (SHA-256), E-Mail-Benachrichtigungen, CEO-Tab, FAQ-PDFs, DE/EN i18n'],
          ['v0.10','Rollen-Einzigartigkeit (CEO/CFO etc.), Inline-Editierung, CFO-only Buchungen'],
          ['v0.11','Eingebetteter PDF-Viewer, Session-Tracking → Google Sheet, Backup-System, Konzept-Seite'],
          ['v0.12','Sprach-Toggle in Topbar, Admin PDF-Upload, Dozenten-E-Mail pro Spiel, Pinnwand, Messaging'],
          ['v0.13','Bug-Fixes: SUPER-NEUSS Persistenz, Sprach-Button sichtbar, Rollen-Anzeige beim Login'],
        ].map(([v,d])=>`<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg-mid);">
          <div><span style="background:var(--blue-mid);color:white;padding:2px 7px;border-radius:20px;font-size:11px;font-weight:700;">${v}</span></div>
          <div style="color:var(--gray-dark);padding-top:2px;">${d}</div>
        </div>`).join('')}
        <!-- Phase 2: Firebase-Ära (SoSe 2026) -->
        <div style="margin:16px 0 6px;padding:4px 10px;background:var(--blue-xlt);border-radius:6px;font-size:11px;font-weight:700;color:var(--blue-dark);letter-spacing:.5px;text-transform:uppercase;">🔥 Phase 2 – Firebase Echtzeit-Sync (SoSe 2026)</div>
        ${[
          ['v0.7.0','Firebase Realtime Database integriert (Cross-Device-Sync), Kontakt-Seite mit Team-Verzeichnis, In-App-Direktnachrichten, Reflexionen bearbeiten &amp; löschen, Blog-Fix'],
          ['v0.7.1','Fix: Admin-Nachrichten jetzt immer zugestellt (In-App-Postfach, E-Mail als optionaler Hintergrund-Versand), ID-Kollision im Nachrichten-Modal behoben'],
          ['v0.7.2','Fix: Ghost-Teams (pending/namenlos) aus Ranking/Teams ausgeblendet, Kontakt-Verzeichnis für Superadmin korrekt befüllt, Teams-Seite und Admin-Panel jetzt am gleichen Spielscope ausgerichtet'],
          ['v0.7.3','Kassenbuch (Soll/Haben/Saldo), Reflexion-Detail-Modal, Stimmungsbarometer-Chart, Bugfixes: Ghost-Teams, Testumgebung, Kontakt'],
          ['v0.7.4','Session-Persistenz (Auto-Login nach Refresh), MVP-Ticker, Passwort-Reset via Admin, ⚡ Team-Aktivierung, Gruppe der Woche, Aktivitätslog (CSV-Export), Reflexions-Status in Blog-Freigabe, Stimmungsbarometer ans Ende, Team-Emoji änderbar, Nachrichten-Sendenfix, Support-Button'],
          ['v0.7.5','Soft-Delete mit Undo: 10-Sekunden Rückgängig-Toast bei Löschen von Mitglied/Team/Buchung/Reflexion/Nachricht; Papierkorb-Tab im Admin-Panel mit Wiederherstellung und endgültigem Löschen'],
          ['v0.7.6','🔒 Kritischer Bugfix: Firebase-Timeout auf 10s erhöht; verhindert Datenverlust durch Überschreiben von Firebase bei langsamer Verbindung; Retry-Logik in Einladungscode-Prüfung; Realtime-Listener auch im Fehler-Pfad aktiv'],
          ['v0.7.7','🐛 Vollständiger Code-Audit (6 Bugs): copyRegCode()-Shadowing (Copy-Button defekt), showRegister()-Shadowing (alte Funktion überschrieb aktive), openAddMemberModal()-Crash (fehlende DOM-Elemente), addMemberToTeam()-fehlende Felder (firstName/lastName/email/mobile), Superadmin-Zugriffsgate, E-Mail-Feld im Mitglied-Modal'],
          ['v0.8.0','🚀 6 neue Features: (a) Admin-Zusatzfragen pro Woche für Reflexion &amp; Bericht, (b) Business Model Canvas für CMO mit CEO-Genehmigung &amp; Dozenten-Feedback, (c) Automatische In-App-Erinnerungen vor Abgabe-Deadlines, (d) CSV-Export für Reflexionen &amp; Buchungen, (e) Vollständiger Aktivitätslog aller Aktionen (alle Rollen), (f) Gastadmin-Rolle: Superadmin vergibt Co-Dozenten-Zugang pro Spiel'],
          ['v0.8.1','🛠️ 14 Bugfixes &amp; Features: (1) CSV-Export mit Team/Wochen-Filtern; (2) Admin-Berichte-Tab mit Filtern; (3) Testmodus-Datentrennung fix; (4) Gruppe der Woche: Balkendiagramm, konfigurierbare Gewichtung, Eigene Einschätzung; (5) Aktivitätslog trackt alle Aktionen; (6) Blog-Dropdown-Fix; (7) Passwort-Reset-Flow + Login via E-Mail; (8) E-Mail-Erinnerungen (Reflexion/Bericht/Buchung) mit Opt-Out; (9) Firebase Write-Nonce (Nachrichten-Fix); (10) Reflexions-Status-Badges klickbar; (11) Hochschulen bearbeiten/löschen; (12) Telefon/Büro im Dozenten-Profil; (13) Papierkorb-Wiederherstellung; (14) Live-Checkbox entfernt, Admin-Profil-Tab'],
          ['v0.8.1.1','🐛 4 Bugfixes: (1) GdW Eigene Einschätzung: Expliziter Speichern-Button mit sofortiger Auswertungsaktualisierung; (2) Erinnerungssystem: 24h-Vorlauf – Reflexion freitags, Bericht+Buchungen samstags, auto-Trigger nach Login; (3) Reflexionen: Team-Filter jetzt auch für Karten aktiv (fix), CSV-Export robuster, PDF-Export hinzugefügt; (4) Berichte: Volltext-Leseansicht (Button + neues Fenster), CSV enthält alle Felder, PDF-Export hinzugefügt'],
          ['v0.8.2','✨ 5 neue Features: (1) Reflexionen-Badge zeigt eingereicht/gesamt für laufende Woche; (2) Dashboard: Laufende Woche als prominente Stat-Karte; (3) Dashboard: Wochengewinner-Banner (Vorwoche) + Verlaufsübersicht aller Sieger (Teams sehen nur sich selbst); (4) Stimmungsbarometer reagiert jetzt auf Team- und Wochenfilter; (5) Blog-Tab: b.tags-Crash behoben, informativere Leer-Zustand-Meldungen, Admin sieht alle Berichte inkl. ausstehende, Freigabe-Button direkt im Blog-Tab'],
          ['v0.8.3','🐛 6 Fixes &amp; Features: (1) Doppelte Vornamen in Status-Badges: Nachname-Initial zur Unterscheidung (z.B. "Florian K." vs. "Florian M."); (2) Reflexionen-Badge: Pill-Form statt Kreis (passt jetzt "19/20"), Zähllogik pro-Team statt globalem Min; (3) Superadmin: neuer Tab "Alle Wochenberichte" mit Volltext, Spiel-Filter, CSV- und PDF-Export; (4) Superadmin Reflexionen: Volltextanzeige ohne Kürzung; (5) Berichte-Tab: Abgabe-Status-Grid pro Woche mit klickbaren Team-Badges; (6) Firebase-Sync-Bugfix: _fbWriting=true sofort bei saveData() gesetzt – verhindert Race Condition bei Blog-Freigabe'],
          ['v0.8.2.2','🛠️ 2 Verbesserungen: (1) Team-Verwaltung: Aktive Teams werden jetzt oben angezeigt, freie Slots darunter – und nach Abschluss von KW1 werden leere Slots automatisch ausgeblendet; (2) Gruppe der Woche: Wochenauswahl-Dropdown ermöglicht nachträgliche Bewertung vergangener Wochen (Woche auswählen → Scoring + Auszeichnung für beliebige Woche)'],
          ['v0.8.3','✨ 3 Features &amp; Bugfixes: (1) Berichte-Tab: Volltext-Anzeige aller Wochenberichte mit Aufklapp-Funktion, CEO-Button nur für CEO sichtbar; (2) Berichte-Tab: Neue Sektion „Meine Reflexionen" mit allen eigenen vergangenen Reflexionen (nur für den jeweiligen User einsehbar); (3) ROI-Berechnung nutzt jetzt das tatsächliche Startkapital statt hartkodierter 5€; (4) Bugfix: mergeDuplicateMember überträgt E-Mail und Passwort-Hash auf kept-Member – behebt Login-Probleme nach Duplikat-Zusammenführung'],
          ['v0.8.4','🔍 3 Features &amp; 5 Bugfixes: (1) Wochenberichte vollständig für alle Teammitglieder sichtbar inkl. Admin-Feedback (blauer Kasten); (2) Bericht bearbeitbar für alle Mitglieder – Einreichen weiterhin nur CEO; (3) Admin-Vorschau als User (Impersonation): neuer Tab mit Mitglieder-Auswahl, blauer Vorschau-Banner, Schreibschutz während Vorschau; (4) Fix: b.challenge→b.challenges; (5) Fix: openDraftForEdit befüllt alle Felder; (6) Fix: isCeo-Logik; (7) Fix: gameId-Vererbung; (8) Code-Audit'],
          ['v0.8.5','🚀 4 Features &amp; 4 Bugfixes: (1) Feedback-Persistenz: saveData() nach FEEDBACKS.push() – Einträge gehen nicht mehr verloren; (2) E-Mail-Versand: Apps Script sendet jetzt auch an game.adminEmail; (3) Dateianhänge (PDF/Bild bis 500KB) für Wochenberichte und Reflexionen; (4) Admin-Ranking: Gewinner-Übersicht aller Wochen mit GdW-Team und MVP-Mitgliedern; (5) Reflexionen-Admin: neueste Woche oben; (6) Fix: Anhänge gehen beim Bearbeiten von Entwürfen nicht verloren; (7) Fix: Reflexions-Anhänge beim Bearbeiten korrekt wiederhergestellt; (8) Admin-Bericht-Restore-Tool im Berichte-Tab'],
          ['v0.9.0','🔒 Security-Upgrade: Firebase Auth Magic Link (passwortloser E-Mail-Login), serverseitige Authentifizierung ersetzt client-seitige Codes; DB-Regeln auf auth != null gesichert; CODES-Sichtbarkeit im Client eliminiert; Passwort-Node aus Firebase entfernt; Setup-Guide FIREBASE_SETUP_v0.9.md'],
          ['v0.91','🔀 Hybrid-Login: Magic Link (empfohlen) + Zugangscode + Testmodus gleichwertig als drei prominente Buttons; ☕ Spenden-Link (Buy Me a Coffee) wiederhergestellt; Code-User erhalten anonyme Firebase-Session (auth != null bleibt erfüllt); Session-Restore via sessionStorage für Code-Nutzer reaktiviert; Versions-Badge mit direktem Link zur Änderungshistorie auf allen Screens'],
          ['v0.92','🔑 Login-UX-Fix: Alle Texte in Login-Steps auf weiße Karte angepasst (vorher unsichtbar); "Passwort vergessen?" prominenter und auch direkt aus Schritt 1 zugänglich; Auto-Befüllung der E-Mail im Reset-Flow; verbesserter Reset-Hinweistext (Dozenten-Fallback); v0.92-Badge', true],
        ].map(([v,d,current])=>`<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg-mid);${current?'background:var(--blue-xlt);border-radius:6px;padding-left:6px;':''}">
          <div style="display:flex;align-items:flex-start;gap:4px;flex-wrap:wrap;">
            <span style="background:var(--blue-dark);color:white;padding:2px 7px;border-radius:20px;font-size:11px;font-weight:700;">${v}</span>
            ${current?'<span style="background:var(--green);color:white;padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700;">AKTUELL</span>':''}
          </div>
          <div style="color:var(--gray-dark);padding-top:2px;">${d}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="concept-section">
      <h2>🚀 Roadmap – Nächste Schritte</h2>
      <p>Was als nächstes kommt – geordnet nach Priorität für den laufenden SoSe 2026-Betrieb:</p>

      <!-- In v0.8.0 abgeschlossen -->
      <div style="margin:14px 0 6px;padding:4px 10px;background:var(--green-lt);border-radius:6px;font-size:11px;font-weight:700;color:var(--green);letter-spacing:.5px;text-transform:uppercase;">✅ In v0.8.0 abgeschlossen</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${[
          ['✅ Admin-Zusatzfragen','Pro Woche individuelle Reflexions- und Berichtsfragen — im Admin Wochen-Status-Tab verwaltbar'],
          ['✅ Export / Reporting','CSV-Export aller Reflexionen und Buchungen pro Spiel — Buttons in Admin-Tabs'],
          ['✅ Erinnerungen','Automatische In-App-Benachrichtigungen vor Abgabe-Deadline — Button im Wochen-Status-Tab'],
          ['✅ Gastadmin je Spiel','Superadmin vergibt Gast-Admin-Rolle pro Spiel (Co-Dozenten) — Tab im Superadmin-Panel'],
          ['✅ Business Model Canvas','CMO erstellt 9-Felder-Canvas; CEO genehmigt; Dozent gibt Feedback — neuer Canvas-Tab für CMO'],
          ['✅ Vollständiger Aktivitätslog','Alle Aktionen aller Rollen werden protokolliert — CSV-Export im Aktivitätslog-Tab'],
        ].map(([t,d])=>`<div style="background:var(--green-lt);padding:10px 14px;border-radius:var(--radius);border-left:3px solid var(--green);opacity:.85;">
          <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${t}</div>
          <div style="font-size:12px;color:var(--gray-dark);">${d}</div>
        </div>`).join('')}
      </div>

      <!-- Mittelfristig (v1.0) -->
      <div style="margin:14px 0 6px;padding:4px 10px;background:var(--blue-xlt);border-radius:6px;font-size:11px;font-weight:700;color:var(--blue-dark);letter-spacing:.5px;text-transform:uppercase;">🔵 Mittelfristig – Release v1.0</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${[
          ['📱 PWA / Mobile','Progressive Web App: App-Icon auf Homescreen, Offline-Fähigkeit, Mobile-optimiertes Layout'],
          ['🤖 KI-Feedback','Automatisches KI-Feedback auf Reflexionen und Wochenberichte (Claude/GPT-Integration)'],
          ['🎮 Gamification','Achievements, Badges und Level-System für aktive Teams und Mitglieder'],
          ['📅 Kalender','Deadlines in Google Calendar / iCal-Export, automatische Wochen-Erinnerungen'],
          ['🔗 LMS-Integration','ILIAS / Moodle SSO, automatische Rückmeldung von Benotungen'],
          ['🏦 Erweitertes Banking','Kredit-Simulation, Investitionsrechnung, Break-Even-Analyse im Kassenbuch'],
        ].map(([t,d])=>`<div style="background:var(--bg-light);padding:10px 14px;border-radius:var(--radius);border-left:3px solid var(--blue-mid);">
          <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${t}</div>
          <div style="font-size:12px;color:var(--gray-dark);">${d}</div>
        </div>`).join('')}
      </div>

      <!-- Was bereits erledigt ist -->
      <div class="info-box green" style="margin-top:4px;">
        <span class="info-box-icon">✅</span>
        <strong>Firebase Echtzeit-Sync ist bereits integriert</strong> (seit v0.7.0). Alle Geräte sehen die gleichen Daten in Echtzeit. Die alte localStorage-Architektur dient weiterhin als Fallback bei fehlender Internetverbindung.
      </div>
    </div>
  `;
}
function calcTeamAvgMood(teamId,week){
  const refs=REFLECTIONS.filter(r=>r.teamId===teamId&&r.week===week&&r.mood);
  if(refs.length===0)return 3;
  return Math.round(refs.reduce((s,r)=>s+r.mood,0)/refs.length);
}
function calcMvpWinner(teamId,week){
  // Count votes; CEO's vote counts double if tie
  const refs=REFLECTIONS.filter(r=>r.teamId===teamId&&r.week===week&&r.mvpVote);
  if(refs.length===0)return null;
  const ceo=MEMBERS.find(m=>m.teamId===teamId&&m.role==='CEO');
  const votes={};
  refs.forEach(r=>{
    const w=(ceo&&r.memberId===ceo.id)?2:1; // CEO vote double only in tie-break (tracked separately)
    votes[r.mvpVote]=(votes[r.mvpVote]||0)+1;
  });
  // Find max vote count (without double-counting yet)
  const maxVotes=Math.max(...Object.values(votes));
  const leaders=Object.keys(votes).filter(k=>votes[k]===maxVotes);
  let winnerId;
  if(leaders.length===1){
    winnerId=leaders[0];
  } else {
    // Tie: CEO's vote counts double → CEO's candidate wins if CEO voted
    const ceoRef=refs.find(r=>ceo&&r.memberId===ceo.id);
    winnerId=ceoRef?ceoRef.mvpVote:leaders[0];
  }
  // Check for CEO override
  const overrideId=getMyTeam()?.mvpOverride?.[week];
  if(overrideId) winnerId=overrideId;
  const votesForWinner=refs.filter(r=>r.mvpVote===winnerId).length;
  return {memberId:winnerId,votes:votesForWinner,total:refs.length,reason:`${votesForWinner}/${refs.length} Stimmen`};
}
// Helper: returns true if member has reflexion OR a same-name duplicate has
// (handles the case where a member was accidentally registered twice)
function _isMemberRefCovered(m, refs, allMembers){
  if(refs.find(r=>r.memberId===m.id)) return true;
  return allMembers.filter(x=>x.id!==m.id&&x.name===m.name).some(x=>refs.find(r=>r.memberId===x.id));
}
// Helper: deduplicate members by name (keep the one with a reflexion, else first entry)
function _deduplicateMembers(members, refs){
  const seen=new Set();
  return members.filter(m=>{
    if(seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  }).map(m=>{
    // If this name has a duplicate that submitted, use that duplicate's id for coverage
    return m;
  });
}
function allReflectionsIn(team){
  const members=MEMBERS.filter(m=>m.teamId===team.id);
  const refs=REFLECTIONS.filter(r=>r.teamId===team.id&&r.week===team.currentWeek);
  // Deduplicate by name: a member is covered if they or any same-name member submitted
  const unique=_deduplicateMembers(members, refs);
  return unique.every(m=>_isMemberRefCovered(m, refs, members));
}
function isMyCeo(){
  const me=getMyMember();return me&&me.role==='CEO';
}
function updateBlogReflectionStatus(){
  const team=getMyTeam();if(!team)return;
  const statusEl=document.getElementById('blogReflectionStatus');
  const overrideRow=document.getElementById('blogMvpOverrideRow');
  const submitBtn=document.getElementById('blogSubmitBtn');
  const hintEl=document.getElementById('blogSubmitHint');
  if(!statusEl)return;
  const allMembers=MEMBERS.filter(m=>m.teamId===team.id);
  const members=_deduplicateMembers(allMembers, []); // show deduplicated list
  const refs=REFLECTIONS.filter(r=>r.teamId===team.id&&r.week===team.currentWeek);
  const allIn=members.every(m=>_isMemberRefCovered(m, refs, allMembers));
  const moodAvg=allIn?calcTeamAvgMood(team.id,team.currentWeek):null;
  const moodEmoji=['','😩','😟','😐','😊','🚀'][moodAvg]||'';
  // Build status table (deduplicated)
  const rows=members.map(m=>{
    const hasRef=_isMemberRefCovered(m, refs, allMembers);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 10px;border-bottom:1px solid var(--border);">
      <span style="font-size:12px;font-weight:600;">${m.name} <span style="font-weight:400;color:var(--gray-mid);">(${m.role})</span></span>
      <span style="font-size:12px;">${hasRef?'✅ Reflexion eingereicht':'⏳ Noch offen'}</span></div>`;
  }).join('');
  statusEl.innerHTML=`<div class="card" style="margin-bottom:10px;">
    <div class="card-header"><h3>📋 Reflexionsstatus Woche ${team.currentWeek}</h3>${allIn?`<span class="tag tag-green">✅ Alle eingereicht ${moodEmoji} Ø${moodAvg}/5</span>`:`<span class="tag tag-orange">⏳ ${refs.length}/${members.length} eingereicht</span>`}</div>
    <div style="border-radius:0 0 var(--radius) var(--radius);overflow:hidden;">${rows}</div>
  </div>`;
  // MVP vote display (only if all reflections in)
  if(allIn){
    const winner=calcMvpWinner(team.id,team.currentWeek);
    const winnerMember=winner?MEMBERS.find(m=>m.id===winner.memberId):null;
    const mvpBox=winner?`<div class="info-box gold" style="margin-bottom:8px;"><span class="info-box-icon">🏆</span>Voting-Ergebnis: <strong>${winnerMember?.name}</strong> (${winner.votes}/${winner.total} Stimmen)</div>`:'<div class="info-box blue" style="margin-bottom:8px;"><span class="info-box-icon">🗳️</span>Keine Stimmen abgegeben.</div>';
    if(overrideRow){overrideRow.style.display='block';}
    const overrideSel=document.getElementById('blogMvpOverride');
    if(overrideSel){
      overrideSel.innerHTML='<option value="">-- Voting-Ergebnis übernehmen ('+(winnerMember?.name||'Kein MVP')+')</option>';
      members.forEach(m=>{const o=new Option(m.name+' ('+m.role+')',m.id);overrideSel.appendChild(o);});
    }
    statusEl.innerHTML+=mvpBox;
  } else {
    if(overrideRow) overrideRow.style.display='none';
  }
  // Submit button state
  const me=getMyMember();
  const isCeo=me&&me.role==='CEO';
  const teamLogin=state.currentUser.role==='team';
  if(submitBtn){
    if(!isCeo&&!teamLogin){
      submitBtn.disabled=true;
      if(hintEl) hintEl.textContent='Nur der CEO kann den Bericht einreichen.';
    } else if(!allIn){
      submitBtn.disabled=true;
      if(hintEl) hintEl.innerHTML='⏳ Noch nicht alle Reflexionen eingereicht (Deadline Samstag 23:59).';
    } else {
      submitBtn.disabled=false;
      if(hintEl) hintEl.textContent='';
    }
  }
}

