// ═══════════════════════════════════════════════════════════════════
//  i18n EN — unverändert verschoben aus index.html (Modul-Split v0.93)
//  Quelle: setLoginLang() (ehem. Z. 2542–2626), TRANS_MAP + applyLang()
//  (ehem. Z. 7385–7687). Kein Code geändert.
// ═══════════════════════════════════════════════════════════════════

function setLoginLang(lang){
  _loginLang=lang;
  const _t=(id,v)=>{ const el=document.getElementById(id); if(el) el.innerHTML=v; };
  const de=document.getElementById('langBtnDE'); if(de) de.classList.toggle('active',lang==='de');
  const en=document.getElementById('langBtnEN'); if(en) en.classList.toggle('active',lang==='en');
  if(lang==='en'){
    _t('lt_sub','Tracker \u00b7 Management \u00b7 Reflection <span style="font-size:10px;color:#999;">(v0.92)</span>');
    // Mode select
    _t('lt_magicLinkBtn','Magic Link \u2013 by Email (recommended)');
    _t('lt_magicLinkSub','Passwordless &amp; secure');
    _t('lt_codeBtn','Access Code');
    _t('lt_codeSub','Code + Password');
    _t('lt_testModeBtn','Demo / Test mode');
    _t('lt_testModeSub','Demo data, no login needed');
    _t('lt_coffeeTitle','Support VentureLab');
    _t('lt_coffeeSub','Support this project \u2013 Buy Me a Coffee');
    // Magic Link flow
    _t('lt_emailLabel','Email address');
    _t('loginSendBtn','&#128233; Send Magic Link');
    _t('lt_magicInfo','You will receive a one-time link by email \u2013 no password needed. Your email must be registered by the lecturer.');
    _t('lt_backToSelect','\u2190 Back');
    _t('lt_linkSentTitle','Link on the way!');
    // Code flow
    _t('lt_code','Access code');
    _t('lt_codeLoginBtn','Log in \u2192');
    _t('lt_back','\u2190 Back');
    _t('lt_forgotPwdStep1','Forgot password?');
    _t('lt_pwdFor','Password for:');
    _t('lt_loginBtn2','Continue \u2192');
    _t('lt_back2','\u2190 Back');
    _t('lt_forgotPwd','&#128273; Forgot password?');
    _t('lt_pwdSetTitle','&#128272; Set password');
    _t('lt_pwdSetInfo','Set a personal password for future logins.');
    _t('lt_errPwdSet','Passwords do not match.');
    _t('lt_pwdSetBtn','Set password \u2192');
    _t('lt_skipPwd','Skip');
    _t('lt_profileTitle','&#128100; Complete profile');
    _t('lt_profileInfo','This information helps your lecturer give you better feedback.');
    _t('lt_profileSaveBtn','Save &amp; log in \u2192');
    _t('lt_profileSkip','Skip');
    _t('lt_resetInfo','Enter your email \u2013 you\u2019ll receive a 6-digit reset code. Your email must be in the system. If not, contact your lecturer.');
    _t('lt_resetBtn','Send reset code \u2192');
    _t('lt_resetCodeInfo','Enter the code from your email &amp; set a new password. Valid 15 minutes.');
    _t('lt_resetCodeBtn','Reset password \u2192');
  } else {
    _t('lt_sub','Tracker \u00b7 Management \u00b7 Reflexion <span style="font-size:10px;color:#999;">(v0.92)</span>');
    // Mode select
    _t('lt_magicLinkBtn','Magic Link \u2013 per E-Mail (empfohlen)');
    _t('lt_magicLinkSub','Passwortlos &amp; sicher');
    _t('lt_codeBtn','Zugangscode');
    _t('lt_codeSub','Code + Passwort');
    _t('lt_testModeBtn','Demo / Testmodus');
    _t('lt_testModeSub','Demo-Daten, kein Login nötig');
    _t('lt_coffeeTitle','Support VentureLab');
    _t('lt_coffeeSub','Dieses Projekt unterst\u00fctzen \u2013 Buy Me a Coffee');
    // Magic Link flow
    _t('lt_emailLabel','E-Mail-Adresse');
    _t('loginSendBtn','&#128233; Magic Link senden');
    _t('lt_magicInfo','Du bekommst einen Einmal-Link per E-Mail \u2013 kein Passwort n\u00f6tig. Deine E-Mail muss vom Dozenten im System hinterlegt sein.');
    _t('lt_backToSelect','\u2190 Zur\u00fcck');
    _t('lt_linkSentTitle','Link unterwegs!');
    // Code flow
    _t('lt_code','Zugangscode');
    _t('lt_codeLoginBtn','Einloggen \u2192');
    _t('lt_back','\u2190 Zur\u00fcck');
    _t('lt_forgotPwdStep1','Passwort vergessen?');
    _t('lt_pwdFor','Passwort f\u00fcr:');
    _t('lt_loginBtn2','Weiter \u2192');
    _t('lt_back2','\u2190 Zur\u00fcck');
    _t('lt_forgotPwd','&#128273; Passwort vergessen?');
    _t('lt_pwdSetTitle','&#128272; Passwort festlegen');
    _t('lt_pwdSetInfo','Lege ein pers\u00f6nliches Passwort f\u00fcr zuk\u00fcnftige Anmeldungen fest.');
    _t('lt_errPwdSet','Passw\u00f6rter stimmen nicht \u00fcberein.');
    _t('lt_pwdSetBtn','Passwort setzen \u2192');
    _t('lt_skipPwd','\u00dcberspringen');
    _t('lt_profileTitle','&#128100; Profil vervollst\u00e4ndigen');
    _t('lt_profileInfo','Diese Angaben helfen dem Dozenten, dir besser Feedback zu geben.');
    _t('lt_profileSaveBtn','Speichern &amp; einloggen \u2192');
    _t('lt_profileSkip','\u00dcberspringen');
    _t('lt_resetInfo','Gib deine E-Mail ein \u2013 du bekommst einen 6-stelligen Reset-Code. Deine E-Mail muss im System sein. Falls nicht, wende dich an den Dozenten.');
    _t('lt_resetBtn','Reset-Code senden \u2192');
    _t('lt_resetCodeInfo','Code aus E-Mail eingeben &amp; neues Passwort setzen. G\u00fcltig 15 Minuten.');
    _t('lt_resetCodeBtn','Passwort zur\u00fccksetzen \u2192');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  i18n — COMPLETE DE → EN TRANSLATION MAP
// ═══════════════════════════════════════════════════════════════════════════════
const TRANS_MAP = {
  // Navigation
  'Ranking':'Ranking', 'Mein Team':'My Team', 'Mein Profil':'My Profile',
  'Reflexion':'Reflection', 'Blog':'Blog', 'Buchungen':'Transactions',
  'Feedback':'Feedback', 'Konzept':'Concept', 'Admin':'Admin', 'Super':'Super',
  // Dashboard stats
  'Gesamtumsatz':'Total Revenue', 'Gewinn gesamt':'Total Profit',
  'Transaktionen':'Transactions', 'Ø ROI':'Avg ROI',
  'nach Kosten':'after costs', 'gesamt':'total', 'auf 5€ Start':'on €5 start',
  'Aktuelles Ranking':'Current Ranking', 'Aktivitäten':'Activities',
  'Umsatzentwicklung':'Revenue Development',
  'Noch keine Buchungen — startet hier sobald Umsätze erfasst werden':'No transactions yet — chart appears as revenue is recorded',
  // My Team tabs
  'Übersicht':'Overview', 'Team-Profil':'Team Profile', 'Mitglieder':'Members',
  'Berichte':'Reports', 'Verwaltung':'Management',
  // Week states
  'Offen':'Open', 'Eingereicht':'Submitted', 'Freigegeben':'Approved',
  'Woche läuft':'Week running', 'wartet auf Freigabe':'awaiting approval',
  // Common buttons
  'Speichern':'Save', 'Abbrechen':'Cancel', 'Schließen':'Close',
  'Bearbeiten':'Edit', 'Löschen':'Delete', 'Hinzufügen':'Add',
  'Absenden':'Send', 'Zurück':'Back', 'Weiter':'Next',
  'Kopieren':'Copy', 'Hochladen':'Upload',
  'Profil speichern':'Save Profile', 'Änderungen speichern':'Save Changes',
  // Profile
  'Mein Profil bearbeiten':'Edit My Profile', 'Name':'Name',
  'Rolle / Funktion':'Role / Function',
  'Titel (z.B. Geschäftsführer)':'Title (e.g. Managing Director)',
  'Bio (max. 200 Zeichen)':'Bio (max. 200 characters)',
  'Profilfoto':'Profile Photo',
  'Foto hochladen':'Upload Photo',
  'Dein Foto ist für alle Teammitglieder sichtbar.':'Your photo is visible to all team members.',
  'Dein Zugangscode':'Your access code',
  'Passwort ändern':'Change Password',
  'Passwort gesetzt':'Password set', 'Noch kein Passwort (unsicher)':'No password yet (insecure)',
  'Aktuelles Passwort (leer lassen wenn keins gesetzt)':'Current Password (leave empty if none set)',
  'Neues Passwort (mind. 6 Zeichen)':'New Password (min. 6 characters)',
  'Passwort bestätigen':'Confirm Password',
  'Sprache':'Language', 'Sicherheit':'Security',
  'Benachrichtigungen':'Notifications',
  'für Benachrichtigungen':'for notifications',
  'erfordert E-Mail':'requires email',
  'Wochenbericht freigegeben':'Blog report approved',
  'Neue Woche startet':'New week starts',
  'Reflexions-Erinnerung (Samstag)':'Reflection reminder (Saturday)',
  // Team Profile
  'Team-Name':'Team Name', 'Slogan':'Slogan', 'Geschäftsidee':'Business Idea',
  'Beschreibung':'Description', 'Team-Farbe':'Team Color',
  'Team-Logo':'Team Logo', 'Logo hochladen':'Upload Logo',
  'Team-Logo anpassen':'Customize Team Logo',
  // Reflection
  'Persönliche Reflexion':'Personal Reflection',
  'Neue Reflexion':'New Reflection',
  'Erfahrung diese Woche':'Experience this week',
  'Was lief gut?':'What went well?',
  'Was kann verbessert werden?':'What can be improved?',
  'Stimmung / Energie':'Mood / Energy',
  'Mitglied der Woche (MVP)':'Member of the week (MVP)',
  'Reflexion einreichen':'Submit Reflection',
  'Meine Reflexionen':'My Reflections',
  'Deine Reflexion ist nur für dich und den Dozenten sichtbar.':'Your reflection is only visible to you and the instructor.',
  // Blog
  'Wochenbericht einreichen':'Submit Weekly Report',
  'Umsatz diese Woche':'Revenue this week',
  'Was haben wir gelernt?':'What did we learn?',
  'Ausblick nächste Woche':'Outlook next week',
  'Herausforderungen':'Challenges',
  'Bericht einreichen':'Submit report',
  'Wochenberichte':'Weekly Reports',
  // Transactions / Booking
  'Buchung erfassen':'Record Transaction',
  'Einnahme':'Income', 'Ausgabe':'Expense',
  'Betrag (€)':'Amount (€)', 'Beschreibung':'Description',
  'Kategorie':'Category', 'Datum':'Date',
  'Umsatz':'Revenue', 'Gewinn':'Profit', 'Kosten':'Costs',
  // Admin
  'Admin-Panel':'Admin Panel', 'Blog-Freigabe':'Blog Approval',
  'Wochen-Status':'Week Status', 'Reflexionen':'Reflections',
  'Teams':'Teams', 'Codes':'Codes',
  'Blog-Berichte zur Freigabe':'Blog reports for approval',
  'Alle freigeben':'Approve all',
  'Wochen-Status pro Team':'Week status per team',
  'Jedes Team durchläuft die Wochen unabhängig voneinander.':'Each team progresses through weeks independently.',
  'TEAM':'TEAM', 'AKTUELLE WOCHE':'CURRENT WEEK', 'STATUS':'STATUS',
  'AKTION':'ACTION', 'Manuell weiter':'Manual advance',
  'Nutzerverwaltung':'User Management',
  'Zugangscode':'Access code',
  // Superadmin
  'Superadmin-Panel':'Superadmin Panel',
  'Plattform-Verwaltung · Alle Spiele · Alle Hochschulen':'Platform Management · All Games · All Universities',
  'Spiele':'Games', 'Admins':'Admins', 'Hochschulen':'Universities',
  'Alle Reflexionen':'All Reflections',
  'Neues Spiel anlegen':'Create new game',
  'Admin ernennen':'Appoint admin',
  'Superadmin ernennen':'Appoint superadmin',
  'Mein Profil':'My Profile',
  'Verwalten':'Manage',
  'Neues Spiel':'New Game',
  'Übersicht':'Overview',
  // Feedback
  'Feedback, Infos & Bugreports':'Feedback, Info & Bug Reports',
  'Verbesserungsvorschläge, technische Probleme oder allgemeine Fragen – alles hier.':'Suggestions, technical issues or general questions — all here.',
  'Info anfragen':'Request info',
  'Fragen zur Plattform oder zum Spiel':'Questions about the platform or game',
  'Verbesserungsvorschlag':'Suggestion',
  'Ideen für neue Features':'Ideas for new features',
  'Bugreport':'Bug report',
  'Fehler oder technische Probleme melden':'Report errors or technical issues',
  'Sonstiges':'Other',
  'Allgemeine Nachrichten':'General messages',
  'Häufige Fragen':'Frequently Asked Questions',
  'Dokumente & Anleitungen':'Documents & Guides',
  'Betreff':'Subject', 'Nachricht':'Message',
  'Detaillierte Beschreibung...':'Detailed description...',
  'Seite / Bereich':'Page / Section',
  'Schritte zur Reproduktion':'Steps to reproduce',
  'Dein Feedback wird direkt an den Dozenten':'Your feedback is sent directly to the instructor',
  // Registration
  'Registrierung':'Registration',
  'Tritt einem aktiven Spiel bei':'Join an active game',
  'DEIN NAME *':'YOUR NAME *',
  'SEMESTER / SPIEL *':'SEMESTER / GAME *',
  'Neues Team gründen':'Found a new team',
  'Bestehendem Team beitreten':'Join existing team',
  'Vorname Nachname':'First Last Name',
  'Team-Name *':'Team Name *',
  'Geschäftsidee (optional)':'Business idea (optional)',
  'Team gründen & starten':'Found team & start',
  'Team beitreten':'Join team',
  'Dein Zugangscode:':'Your access code:',
  'Notiere diesen Code! Du brauchst ihn zum Einloggen.':'Note this code! You need it to log in.',
  'Mit diesem Code einloggen':'Log in with this code',
  // Misc
  'Noch keine Bio hinterlegt.':'No bio added yet.',
  'Noch keine Bio.':'No bio yet.',
  'Lade...':'Loading...', 'Fehler':'Error',
  'Keine Daten':'No data',
  'Keine Einträge':'No entries',
  'Keine Teams':'No teams',
  'Keine Reflexionen':'No reflections',
  'Keine Buchungen':'No transactions',
  // Konzept
  'Konzept':'Concept',
  // Additional body text translations
  'Buchung erfassen':'Record Transaction', 'Buchung':'Transaction',
  'Einnahme erfassen':'Record Income', 'Ausgabe erfassen':'Record Expense',
  'Beleg (optional)':'Receipt (optional)',
  'Klicken zum Hochladen':'Click to upload',
  'Beleg geladen':'Receipt loaded',
  'Kapital':'Capital',
  'Nur der CFO kann Buchungen erfassen':'Only the CFO can record transactions',
  'Häufige Fragen':'Frequently Asked Questions',
  'Fragen vom Dozenten':'Questions from the Instructor',
  'Dokumente vom Dozenten':'Documents from the Instructor',
  'Spiel ist LIVE / aktiv':'Game is LIVE / active',
  'Ticker zeigt grünes LIVE-Symbol':'Ticker shows green LIVE indicator',
  'Ankuendigungen':'Announcements',
  'Von':'From',
  'Alle Teams':'All Teams',
  'Entwurf':'Draft',
  'Weiterschreiben':'Continue writing',
  'Bericht einreichen':'Submit report',
  'Entwurf speichern':'Save draft',
  'Mitglied der Woche':'Member of the Week',
  'Wen nominierst du als Mitglied der Woche?':'Who do you nominate as Member of the Week?',
  'Mein MVP-Vote':'My MVP Vote',
  'niemanden nominieren':'nominate nobody',
  'Begründung (optional)':'Reason (optional)',
  'Wochenbericht':'Weekly Report',
  'Übersicht':'Overview',
  'Teamleiter':'Team Leader',
  'Mitglied':'Member',
  'Neuer Eintrag':'New Entry',
  'Frage hinzufügen':'Add question',
  'Neue Frage':'New question',
  'Antwort':'Answer',
  'Spiel-Einstellungen':'Game Settings',
  'Dozenten-E-Mail':'Instructor Email',
  'Nachrichten':'Messages',
  'Nachricht versenden':'Send message',
  'Empfaenger':'Recipient',
  'Betreff':'Subject',
  'Pinnwand':'Bulletin Board',
  'Ankuendigung senden':'Post announcement',
  'Anpinnen':'Pin to top',
  'Keine Ankuendigungen':'No announcements',
  'Noch offen':'Still open',
  // Reflection page
  'Persönliche wöchentliche Reflexion':'Personal weekly reflection',
  'Woche läuft, Bericht nicht eingereicht':'Week running, report not submitted',
  'Alle Pflichtfelder ausfüllen':'Fill in all required fields',
  'Einreichen':'Submit',
  'Bereits eingereicht':'Already submitted',
  // My Team tabs
  'Transaktionen':'Transactions',
  // Login
  'Noch kein Code?':'No code yet?',
  'Jetzt registrieren':'Register now',
  'Einloggen / Sign In':'Sign In',
  // Week banners
  ' läuft':' running',
  'wartet auf Freigabe durch den Admin.':'awaiting approval by the admin.',
  'Danach startet Woche':'After that, week',
  'automatisch.':'starts automatically.',
  'Freigabe erhalten!':'Approved!',
  'abgeschlossen. Ihr seid jetzt in Woche':'completed. You are now in week',
  'Wochenbericht eingereicht':'Weekly report submitted',
  // Week / Status
  'Woche ':'Week ', 'Wochen ':'Weeks ',
  'aktuelle Woche':'current week', 'Aktuelle Woche':'Current Week',
  'Ausstehend':'Pending', 'ausstehend':'pending',
  'Freigeben':'Approve', 'Ablehnen':'Reject', 'Überarbeitung':'Revision',
  'Legende':'Legend',
  // Contact / Messages
  'Kontakt':'Contact', 'Kontakt & Verzeichnis':'Contact & Directory',
  'Team-Verzeichnis':'Team Directory',
  'Posteingang':'Inbox', 'Gesendet':'Sent',
  'Nachricht senden':'Send Message', 'Nachricht versenden':'Send Message',
  'Antworten':'Reply', 'antworten':'reply',
  'Keine Nachrichten':'No messages', 'Noch keine Nachrichten gesendet':'No messages sent yet',
  // Admin new features
  'Stimmungsbarometer':'Mood Barometer',
  'Reflexions-Status':'Reflection Status',
  'Gruppe der Woche':'Team of the Week',
  'Aktivitätslog':'Activity Log',
  'Individuelles Feedback':'Individual Feedback',
  'Kriterien':'Criteria', 'Auszeichnen':'Award',
  'Vergabeverlauf':'Award History', 'Ausgezeichnet':'Awarded',
  'Automatische Auswertung':'Automatic Evaluation',
  'Gruppe der Woche – Automatische Auswertung':'Team of the Week – Automatic Evaluation',
  'Vergabe':'Award', 'manuell vergeben':'manually award',
  'Begründung':'Reason', 'Begründung (optional)':'Reason (optional)',
  'Gesamt':'Total', 'gesamt':'total',
  'Umsatz (20%)':'Revenue (20%)', 'Bericht (20%)':'Report (20%)',
  'Stimmung (20%)':'Mood (20%)', 'Aktivität (20%)':'Activity (20%)',
  // Kassenbuch
  'Kassenbuch':'Cash Book', 'Soll':'Debit', 'Haben':'Credit', 'Saldo':'Balance',
  'Startkapital':'Start Capital',
  // Teams / Admin
  'Team-Verwaltung':'Team Management', 'Team-Slot':'Team Slot',
  'Aktion':'Action', 'Aktionen':'Actions',
  'Emoji ändern':'Change Emoji', 'Emoji':'Emoji',
  'Passwort zurücksetzen':'Reset Password', 'kein Passwort':'no password',
  'Aktivieren':'Activate', 'aktivieren':'activate',
  'Einladungscode':'Invite Code',
  'Mitglieder':'Members', 'Mitglied':'Member',
  'Platz':'Rank', 'Plätze':'Ranks',
  'Umsatz':'Revenue', 'Gewinn':'Profit',
  // Log / Export
  'CSV Export':'CSV Export',
  'Einträge (max. 200 angezeigt)':'entries (max. 200 shown)',
  'Noch keine Aktivitäten':'No activities yet',
  'Zeit':'Time', 'Aktion':'Action', 'Person':'Person', 'Details':'Details',
  // Reflections
  'Noch keine Reflexion eingereicht':'No reflection submitted yet',
  'Reflexion abgegeben':'Reflection submitted', 'Fehlt noch':'Missing',
  'fehlt':'missing',
  // Blog approval
  'Aktivitäten':'Activities', 'Highlight':'Highlight',
  'Herausforderungen':'Challenges', 'Nächste Schritte':'Next Steps',
  'Admin-Feedback':'Admin Feedback',
  'Reflexionen W':'Reflections W',
  // Support
  'Support VentureLab':'Support VentureLab',
  'Dieses Projekt unterstützen – Buy Me a Coffee':'Support this project – Buy Me a Coffee',
  // Misc new
  'kein Passwort':'no password', 'Reset':'Reset',
  'Alle geprüft':'All reviewed',
  'Keine ausstehenden Berichte.':'No pending reports.',
  'Ø Stimmung nach Freigabe sichtbar':'Avg mood visible after approval',
  'Stimmung: ':'Mood: ',
};

function applyLang(){
  if(state.lang!=='en') return;
  const root=document.getElementById('appShell')||document.body;
  // Text nodes
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    let t=n.textContent;
    // Replace known German phrases (longest first to avoid partial replacement)
    const keys=Object.keys(TRANS_MAP).sort((a,b)=>b.length-a.length);
    for(const k of keys){
      if(t.includes(k)){t=t.replaceAll(k,TRANS_MAP[k]);}
    }
    if(t!==n.textContent) n.textContent=t;
  });
  // Placeholders
  root.querySelectorAll('[placeholder]').forEach(el=>{
    const ph=el.getAttribute('placeholder');
    if(ph&&TRANS_MAP[ph]) el.setAttribute('placeholder',TRANS_MAP[ph]);
  });
  // title attributes
  root.querySelectorAll('[title]').forEach(el=>{
    const ti=el.getAttribute('title');
    if(ti&&TRANS_MAP[ti]) el.setAttribute('title',TRANS_MAP[ti]);
  });
}
