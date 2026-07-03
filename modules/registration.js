// ════════════════════════════════════════════════════════════════════
//  REGISTRATION
// ════════════════════════════════════════════════════════════════════
let regState = { type: null, selectedTeamId: null, newCode: null };

function showRegisterMode(){
  document.getElementById('loginMode').style.display='none';
  document.getElementById('registerMode').style.display='block';
  const tp=document.getElementById('testModePanel');if(tp) tp.style.display='none';
  ['regSetupStep','regProfileStep','regPasswordStep','regSuccessStep'].forEach(id=>{
    const el=document.getElementById(id);if(el) el.style.display='none';
  });
  const inv=document.getElementById('regInviteStep');if(inv) inv.style.display='block';
  const invInput=document.getElementById('regInviteCode');if(invInput) invInput.value='';
  const prev=document.getElementById('regInvitePreview');if(prev) prev.style.display='none';
  const err=document.getElementById('regInviteError');if(err) err.style.display='none';
}
function showRegister(){showRegisterMode();}
let _regInviteTeam=null;
let _regInviteGame=null;
let _regSelectedRole=null;
let _regNewCode=null;
let _profileLoginCode=null;

function initEmojiPicker(){
  const emojis=['🚀','💡','🔧','🌱','⚡','🎯','💎','🔥','🌊','🦁','🐉','🦅','🌟','🎪','🏆'];
  const container=document.getElementById('setupEmojiPicker');
  if(!container) return;
  container.innerHTML='';
  emojis.forEach(emoji=>{
    const span=document.createElement('span');
    span.onclick=function(){selectSetupEmoji(this,emoji);};
    span.dataset.emoji=emoji;
    span.style.fontSize='24px';
    span.style.cursor='pointer';
    span.style.padding='4px';
    span.style.borderRadius='8px';
    span.style.border='2px solid transparent';
    span.style.lineHeight='1';
    span.textContent=emoji;
    container.appendChild(span);
  });
  // Set default selection
  const selected=window._setupSelectedEmoji||'🚀';
  document.querySelectorAll('#setupEmojiPicker [data-emoji]').forEach(e=>{
    e.style.border=e.dataset.emoji===selected?'2px solid #2563EB':'2px solid transparent';
  });
}

function selectSetupEmoji(el,emoji){
  window._setupSelectedEmoji=emoji;
  document.querySelectorAll('#setupEmojiPicker [data-emoji]').forEach(e=>{
    e.style.border=e.dataset.emoji===emoji?'2px solid #2563EB':'2px solid transparent';
  });
}
function submitTeamSetup(){
  const errEl=document.getElementById('regSetupError');
  errEl.style.display='none';
  const tname=document.getElementById('setupTeamName').value.trim();
  const tbiz=document.getElementById('setupTeamBiz').value.trim();
  if(!tname){errEl.textContent='Bitte Team-Namen eingeben.';errEl.style.display='block';return;}
  if(!tbiz){errEl.textContent='Bitte Unternehmensidee eingeben.';errEl.style.display='block';return;}
  const game=_regInviteGame;
  if(TEAMS.find(t=>t.gameId===game.id&&t.status!=='pending'&&t.name.toLowerCase()===tname.toLowerCase())){
    errEl.textContent='Dieser Team-Name ist bereits vergeben.';errEl.style.display='block';return;
  }
  // Update the pending team slot
  const team=_regInviteTeam;
  team.name=tname;
  team.biz=tbiz;
  team.approach=document.getElementById('setupTeamApproach').value.trim();
  team.strategy=document.getElementById('setupTeamStrategy').value.trim();
  team.logo=window._setupSelectedEmoji||team.logo||'🚀';
  team.code=makeUniqueTeamCode(tname);
  team.status='active';
  saveData();rebuildCodes();
  // Move to profile step (CEO role fixed)
  _regSelectedRole='CEO';
  document.getElementById('regSetupStep').style.display='none';
  document.getElementById('regProfileStep').style.display='block';
  document.getElementById('regTeamBadge').innerHTML=team.logo+' <strong>'+team.name+'</strong> &mdash; '+game.name+' <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:12px;font-size:11px;margin-left:6px;">CEO</span>';
  document.getElementById('regFirstName').value='';
  document.getElementById('regLastName').value='';
  document.getElementById('regEmail').value='';
  document.getElementById('regMobile').value='';
  // Hide role grid (CEO is fixed for team founder)
  const grid=document.getElementById('regRoleGrid');
  if(grid) grid.innerHTML='<div style="grid-column:1/-1;padding:10px;background:#EFF6FF;border-radius:8px;font-size:12px;font-weight:700;color:#1e3a5f;">👑 Du gründest dieses Team als CEO. Andere Rollen können deine Mitglieder wählen, wenn sie mit dem Einladungscode beitreten.</div>';
}
function checkInviteCode(_retry){
  const code=document.getElementById('regInviteCode').value.trim().toUpperCase();
  const errEl=document.getElementById('regInviteError');
  errEl.style.display='none';
  if(!code){errEl.textContent='Bitte Code eingeben.';errEl.style.display='block';return;}
  // If TEAMS appears empty and Firebase hasn't confirmed data yet, wait and retry (max 3x)
  if(!_fbDataLoaded && TEAMS.filter(t=>t.status!=='pending'&&t.code).length===0 && (_retry||0)<3){
    errEl.textContent='⏳ Daten werden noch geladen – bitte einen Moment warten…';
    errEl.style.display='block';errEl.style.color='#1d4ed8';
    const retryN=(_retry||0)+1;
    setTimeout(()=>{ errEl.style.display='none'; checkInviteCode(retryN); }, 2000);
    return;
  }
  errEl.style.color='';

  // ── Check for SETUP CODE (team slot not yet set up)
  const pendingTeam=TEAMS.find(t=>t.setupCode&&(t.setupCode.toUpperCase()===code||t.setupCode===code)&&t.status==='pending');
  if(pendingTeam){
    const game=GAMES.find(g=>g.id===pendingTeam.gameId);
    if(!game||game.status==='closed'){errEl.textContent='Dieses Spiel ist nicht mehr aktiv.';errEl.style.display='block';return;}
    _regInviteTeam=pendingTeam; _regInviteGame=game; _regSelectedRole='CEO';
    document.getElementById('regInvitePreview').innerHTML='🆕 <strong>Setup-Code erkannt</strong> &middot; '+game.name+' &middot; Team-Slot wird eingerichtet';
    document.getElementById('regInvitePreview').style.display='block';
    document.getElementById('regInviteStep').style.display='none';
    document.getElementById('regSetupStep').style.display='block';
    document.getElementById('regSetupBadge').innerHTML='🎮 '+game.name+' &mdash; Richte dein Team ein';
    document.getElementById('setupTeamName').value='';
    document.getElementById('setupTeamBiz').value='';
    document.getElementById('setupTeamApproach').value='';
    document.getElementById('setupTeamStrategy').value='';
    window._setupSelectedEmoji=pendingTeam.logo||'🚀';
    initEmojiPicker();
    return;
  }

  // ── Check for INVITE CODE (join existing active team)
  const team=TEAMS.find(t=>t.code&&t.code.toUpperCase()===code&&t.status!=='pending');
  if(!team){errEl.textContent='Ungültiger Code. Prüfe ob du einen Setup-Code (von deinem Dozenten) oder einen Einladungscode (von deinem Teamleiter) hast.';errEl.style.display='block';return;}
  const game=GAMES.find(g=>g.id===team.gameId);
  if(!game||game.status==='closed'){errEl.textContent='Dieses Spiel ist nicht mehr aktiv.';errEl.style.display='block';return;}
  _regInviteTeam=team; _regInviteGame=game; _regSelectedRole=null;
  const prev=document.getElementById('regInvitePreview');
  prev.innerHTML='<strong>'+team.logo+' '+team.name+'</strong> &middot; '+game.name;
  prev.style.display='block';
  document.getElementById('regInviteStep').style.display='none';
  buildRegRoleGrid(team,game);
  document.getElementById('regProfileStep').style.display='block';
  document.getElementById('regTeamBadge').innerHTML=team.logo+' <strong>'+team.name+'</strong> &mdash; '+game.name;
  document.getElementById('regFirstName').value='';
  document.getElementById('regLastName').value='';
  document.getElementById('regEmail').value='';
  document.getElementById('regMobile').value='';
}
function buildRegRoleGrid(team,game){
  const ROLES=['CEO','CFO','CMO','COO','CTO'];
  const takenRoles=MEMBERS.filter(m=>m.teamId===team.id).map(m=>m.role);
  const grid=document.getElementById('regRoleGrid');
  grid.innerHTML=ROLES.map(r=>{
    const taken=takenRoles.filter(x=>x===r).length;
    const maxSlots=r==='CEO'?1:2;
    const available=taken<maxSlots;
    return '<div onclick="selectRegRole(this,\''+r+'\')" data-role="'+r+'" style="border:2px solid '+(available?'#E0E7F0':'#F0F0F0')+';border-radius:10px;padding:10px;text-align:center;cursor:'+(available?'pointer':'not-allowed')+';opacity:'+(available?'1':'.4')+';">'
      +'<div style="font-size:20px;">'+(r==='CEO'?'👑':r==='CFO'?'💰':r==='CMO'?'📣':r==='COO'?'⚙️':'💻')+'</div>'
      +'<div style="font-size:12px;font-weight:700;margin-top:4px;">'+r+'</div>'
      +(available?'<div style="font-size:10px;color:#888;">verfügbar</div>':'<div style="font-size:10px;color:#c00;">besetzt</div>')
    +'</div>';
  }).join('');
}
function selectRegRole(el,role){
  if(el.style.cursor==='not-allowed') return;
  document.querySelectorAll('#regRoleGrid [data-role]').forEach(e=>e.style.border='2px solid #E0E7F0');
  el.style.border='2px solid #2563EB';
  _regSelectedRole=role;
}
function submitRegProfile(){
  const errEl=document.getElementById('regProfileError');
  errEl.style.display='none';
  if(!_regSelectedRole){errEl.textContent='Bitte eine Rolle auswählen.';errEl.style.display='block';return;}
  const fn=document.getElementById('regFirstName').value.trim();
  const ln=document.getElementById('regLastName').value.trim();
  const email=document.getElementById('regEmail').value.trim().toLowerCase();
  if(!fn||!ln){errEl.textContent='Bitte Vor- und Nachname eingeben.';errEl.style.display='block';return;}
  if(!email||!email.includes('@')){errEl.textContent='Bitte eine gültige E-Mail-Adresse eingeben.';errEl.style.display='block';return;}
  if(MEMBERS.find(m=>m.email&&m.email.toLowerCase()===email)){errEl.textContent='Diese E-Mail-Adresse ist bereits registriert.';errEl.style.display='block';return;}
  document.getElementById('regProfileStep').style.display='none';
  document.getElementById('regPasswordStep').style.display='block';
  document.getElementById('regPwdBadge').innerHTML=fn+' '+ln+' &middot; <strong>'+_regSelectedRole+'</strong> &mdash; '+_regInviteTeam.logo+' '+_regInviteTeam.name;
  document.getElementById('regPwd1').value='';
  document.getElementById('regPwd2').value='';
}
async function submitRegPassword(){
  const errEl=document.getElementById('regPwdError');
  errEl.style.display='none';
  const pwd1=document.getElementById('regPwd1').value;
  const pwd2=document.getElementById('regPwd2').value;
  if(!pwd1||pwd1.length<6){errEl.textContent='Passwort muss mindestens 6 Zeichen haben.';errEl.style.display='block';return;}
  if(pwd1!==pwd2){errEl.textContent='Passwörter stimmen nicht überein.';errEl.style.display='block';return;}
  const fn=document.getElementById('regFirstName').value.trim();
  const ln=document.getElementById('regLastName').value.trim();
  const email=document.getElementById('regEmail').value.trim().toLowerCase();
  const mobile=document.getElementById('regMobile').value.trim();
  const team=_regInviteTeam;
  const mCount=MEMBERS.filter(m=>m.teamId===team.id).length;
  const code=makeMemberCode(team,mCount);
  const memberId=nextId(MEMBERS,'mb');
  MEMBERS.push({id:memberId,teamId:team.id,name:fn+' '+ln,firstName:fn,lastName:ln,
    email:email,mobile:mobile,role:_regSelectedRole,title:_regSelectedRole,bio:'',code:code,avatarDataUrl:null});
  const hash=await hashPwd(pwd1);
  savePwd(code,hash);
  const game=_regInviteGame;
  rebuildCodes();saveData();
  _regNewCode=code;
  document.getElementById('regPasswordStep').style.display='none';
  document.getElementById('regSuccessStep').style.display='block';
  document.getElementById('regSuccessCode').textContent=code;
  const wasSetup=team.code&&team.setupCode; // team had a setupCode = was a pending slot
  document.getElementById('regSuccessInfo').innerHTML=
    '<b>Name:</b> '+fn+' '+ln+'<br><b>E-Mail:</b> '+email+'<br><b>Rolle:</b> '+_regSelectedRole+'<br><b>Team:</b> '+team.logo+' '+team.name+'<br><b>Spiel:</b> '+game.name
    +(wasSetup?'<hr style="margin:10px 0;"><div style="background:#EFF6FF;border-radius:8px;padding:10px;"><div style="font-size:11px;font-weight:700;color:#888;margin-bottom:4px;">📨 EINLADUNGSCODE FÜR DEIN TEAM</div>'
      +'<div style="font-family:monospace;font-size:16px;font-weight:900;letter-spacing:2px;color:#1e3a5f;">'+team.code+'</div>'
      +'<div style="font-size:11px;color:#666;margin-top:4px;">Gib diesen Code an deine Teammitglieder weiter, damit sie sich registrieren können.</div>'
      +'<button onclick="navigator.clipboard?.writeText(this.dataset.code);showToast(\'Kopiert!\')" data-code="'+team.code+'" style="margin-top:6px;background:none;border:1px solid #2563EB;color:#2563EB;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;">📋 Kopieren</button>'
    +'</div>':'');
}
function copyRegCode(){
  const code=_regNewCode||document.getElementById('regSuccessCode')?.textContent;
  if(code) navigator.clipboard?.writeText(code);
  const el=document.getElementById('regSuccessCode');if(el){el.style.background='linear-gradient(135deg,#375623,#52873a)';setTimeout(()=>{el.style.background='linear-gradient(135deg,#1F3864,#2E75B6)';},800);}
}
function loginWithNewCode(){
  const code=_regNewCode;
  if(!code) return;
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('appShell').style.display='none';
  document.getElementById('loginMode').style.display='block';
  document.getElementById('registerMode').style.display='none';
  const tp=document.getElementById('testModePanel');if(tp) tp.style.display='none';
  ['loginStep1','loginStep2','loginStep3','loginStep4'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  document.getElementById('loginStep1').style.display='block';
  document.getElementById('loginCode').value=code;
  setTimeout(()=>doLoginStep1(),100);
}
// ── TEST MODE ────────────────────────────────────────────────────────────
const TEST_DATA={UNIVERSITIES:[{id:'test-uni',name:'DHBW Stuttgart',short:'DHBW',slug:'DHBW',city:'Stuttgart',adminCount:1,gameCount:1}],GAMES:[{id:'test-g1',name:'VentureLab Demo SoSe 2026',universityId:'test-uni',uni:'DHBW',status:'active',isLive:true,currentWeek:2,teamCount:3,start:'2026-03-01',end:'2026-07-31',mode:'intern',capital:5,teamSize:5,weeklyDeadline:'Sonntag 23:59',autoApprove:0,rounds:1,currentRound:1,adminEmail:'demo@dhbw.de',faqs:[],faqPdfs:[]}],TEAMS:[{id:'test-t1',gameId:'test-g1',name:'Die Ideenschmiede',logo:'💡',color:'#2563EB',code:'TEAM-DEMO1',approach:'Direktvertrieb',strategy:'Kostenführerschaft',biz:'Innovative Dienstleistungen',revenue:12.50,expenses:3.00,capital:5.00,transactions:4,currentWeek:2,weekStatus:'open',mvps:[],mvpOverride:{},slogan:'Ideen verwirklichen',desc:'',email:'',notif:{},lang:'de',weekGoal:50},{id:'test-t2',gameId:'test-g1',name:'GreenWheels',logo:'🌿',color:'#16A34A',code:'TEAM-DEMO2',approach:'Online-First',strategy:'Nachhaltigkeit',biz:'Fahrrad-Sharing',revenue:8.00,expenses:2.50,capital:5.00,transactions:3,currentWeek:2,weekStatus:'open',mvps:[],mvpOverride:{},slogan:'Grün und schnell',desc:'',email:'',notif:{},lang:'de',weekGoal:50},{id:'test-t3',gameId:'test-g1',name:'Prepify',logo:'📋',color:'#7C3AED',code:'TEAM-PREP1',approach:'B2B-Direktvertrieb',strategy:'Spezialisierung',biz:'Prüfungsvorbereitung für Studenten',revenue:6.00,expenses:1.50,capital:5.00,transactions:2,currentWeek:2,weekStatus:'open',mvps:[],mvpOverride:{},slogan:'Vorbereitet studieren',desc:'',email:'',notif:{},lang:'de',weekGoal:50}],MEMBERS:[{id:'test-mb1',teamId:'test-t1',name:'Anna Müller',firstName:'Anna',lastName:'Müller',email:'anna@test.de',mobile:'',role:'CEO',title:'CEO',bio:'',code:'TEST-CEO',avatarDataUrl:null},{id:'test-mb2',teamId:'test-t1',name:'Ben Schneider',firstName:'Ben',lastName:'Schneider',email:'ben@test.de',mobile:'',role:'CFO',title:'CFO',bio:'',code:'TEST-CFO',avatarDataUrl:null},{id:'test-mb3',teamId:'test-t1',name:'Lisa Weber',firstName:'Lisa',lastName:'Weber',email:'lisa@test.de',mobile:'',role:'CMO',title:'CMO',bio:'',code:'TEST-CMO',avatarDataUrl:null},{id:'test-mb4',teamId:'test-t2',name:'Tim Braun',firstName:'Tim',lastName:'Braun',email:'tim@test.de',mobile:'',role:'CEO',title:'CEO',bio:'',code:'TEST-CEO2',avatarDataUrl:null},{id:'test-mb5',teamId:'test-t3',name:'Tina Heckel',firstName:'Tina',lastName:'Heckel',email:'tina@test.de',mobile:'',role:'CEO',title:'CEO',bio:'',code:'TEST-PREP-CEO',avatarDataUrl:null}],TRANSACTIONS:[{id:'test-tx1',teamId:'test-t1',date:'2026-03-07',desc:'Startkapital',cat:'Kapital',type:'income',amount:5,receipt:false},{id:'test-tx2',teamId:'test-t1',date:'2026-03-08',desc:'Ersten Kunden gewonnen',cat:'Umsatz',type:'income',amount:8.50,receipt:false},{id:'test-tx3',teamId:'test-t1',date:'2026-03-10',desc:'Materialeinkauf',cat:'Kosten',type:'expense',amount:3.00,receipt:false},{id:'test-tx4',teamId:'test-t1',date:'2026-03-12',desc:'Beratungsservice',cat:'Umsatz',type:'income',amount:4.00,receipt:false},{id:'test-tx5',teamId:'test-t2',date:'2026-03-07',desc:'Startkapital',cat:'Kapital',type:'income',amount:5,receipt:false},{id:'test-tx6',teamId:'test-t2',date:'2026-03-09',desc:'Fahrrad-Verleih',cat:'Umsatz',type:'income',amount:8,receipt:false},{id:'test-tx7',teamId:'test-t2',date:'2026-03-11',desc:'Reparaturkosten',cat:'Kosten',type:'expense',amount:2.50,receipt:false},{id:'test-tx8',teamId:'test-t3',date:'2026-03-07',desc:'Startkapital',cat:'Kapital',type:'income',amount:5,receipt:false},{id:'test-tx9',teamId:'test-t3',date:'2026-03-10',desc:'Erste Nachhilfesession',cat:'Umsatz',type:'income',amount:6.00,receipt:false},{id:'test-tx10',teamId:'test-t3',date:'2026-03-12',desc:'Druckkosten Lernmaterial',cat:'Kosten',type:'expense',amount:1.50,receipt:false}],BLOGS:[
  {id:'test-b1',teamId:'test-t1',week:1,title:'Ideenschmiede – Woche 1: Der erste Schritt',body:'Wir haben unsere Geschäftsidee konkretisiert und erste Gespräche mit potenziellen Kunden geführt. Drei Personen haben Interesse an unserem Beratungsservice bekundet. Ben hat die erste Finanztabelle aufgestellt und Lisa eine erste Social-Media-Präsenz aufgebaut.',highlight:'3 Interessenten in der ersten Woche!',challenges:'Das Targeting ist noch zu breit – wir sprechen zu viele Zielgruppen an.',nextSteps:'Fokus auf eine Kernzielgruppe, erste Preisgestaltung festlegen.',status:'approved',mood:4,tags:['Kundengewinnung','Finanzen'],date:'2026-03-10',adminFeedback:'Toller Start! Euer Highlight zeigt echten Unternehmergeist. Fokussiert euch tatsächlich auf eine klar definierte Zielgruppe – das ist der entscheidende Schritt von der Idee zum Business. Schaut euch das Value Proposition Canvas an.'},
  {id:'test-b2',teamId:'test-t1',week:2,title:'Ideenschmiede – Woche 2: Erste Umsätze!',body:'Wir haben zwei zahlende Kunden gewonnen und 12,50 € Umsatz erzielt. Lisa hat einen Flyer erstellt, der gut ankommt. Ben hat die Kostenstruktur optimiert, wir sind profitabel!',highlight:'Erste 12,50 € Umsatz – wir verdienen Geld!',challenges:'Kapazitätsengpass: Alle drei machen alles. Wir brauchen klarere Rollenverteilung.',nextSteps:'CEO übernimmt Kundenakquise, CFO Buchhaltung, CMO Marketing-Kampagne für Woche 3.',status:'pending',mood:5,tags:['Umsatz','Skalierung'],date:'2026-03-17',adminFeedback:''},
  {id:'test-b3',teamId:'test-t2',week:1,title:'GreenWheels – Woche 1: Nachhaltigkeit als USP',body:'Wir haben 5 Fahrräder für unser Sharing-Konzept identifiziert. Erste Nutzer aus dem Studierendenumfeld zeigen Interesse. Tim hat einen QR-Code-basierten Verleihprozess konzipiert.',highlight:'Unser nachhaltiges Konzept kommt bei Studierenden sehr gut an.',challenges:'Versicherungsfrage für die Fahrräder noch ungeklärt.',nextSteps:'Klärung der Haftungsfrage, Pilotbetrieb mit 2 Fahrrädern starten.',status:'approved',mood:3,tags:['Nachhaltigkeit','Pilotbetrieb'],date:'2026-03-10',adminFeedback:'Guter erster Ansatz! Die Versicherungsfrage ist absolut kritisch – das ist kein optionales Detail, sondern Voraussetzung für den Betrieb. Ich empfehle, das mit Priorität 1 in Woche 2 zu klären. Euer Nachhaltigkeitsfokus ist ein echter Differenziator im Wettbewerb.'},
  {id:'test-b4',teamId:'test-t3',week:1,title:'Prepify – Woche 1: Marktforschung und erster Kurs',body:'Wir haben 15 Studis befragt – 80% würden für gute Prüfungsvorbereitung zahlen. Tina hat einen ersten Probetermin für Mathe-Vorbereitung angeboten. 4 Teilnehmer, Feedback sehr positiv.',highlight:'80% Zahlungsbereitschaft in der Umfrage bestätigt unseren Ansatz!',challenges:'Skalierung des Angebots ohne mehr Zeitressourcen ist schwierig.',nextSteps:'Lernmaterialien digitalisieren, Gruppenkurs für 8-10 Personen planen.',status:'approved',mood:4,tags:['Marktforschung','Pilotangebot'],date:'2026-03-10',adminFeedback:'Exzellente Marktforschung! Die 80% Zahlungsbereitschaft ist ein sehr starkes Signal. Achtet jedoch darauf, dass Befragungsverzerrungen vorliegen können (soziale Erwünschtheit). Die Digitalisierung eurer Materialien ist der richtige Schritt zur Skalierung. Denkt auch über ein Abonnement-Modell nach.'}
],REFLECTIONS:[],ADMINS:[{id:'test-a1',gameId:'test-g1',name:'Dr. Neusser',code:'TEST-ADMIN',email:'neusser@dhbw.de',uni:'DHBW'}],FEEDBACKS:[],SUPERADMINS:[],FAQ_DOCS:[],ANNOUNCEMENTS:[{id:'test-ann1',gameId:'test-g1',text:'Willkommen in der Testumgebung! 🚀',date:'2026-03-01',pinned:true}]};
const TEST_PWDS={'TEST-CEO':'test','TEST-CFO':'test','TEST-CMO':'test','TEST-CEO2':'test','TEST-PREP-CEO':'test','TEST-ADMIN':'test'};
function loadTestData(){
  window._testModeActive=true;
  window._testMode=true;
  const orig=localStorage.getItem('5euro_tracker_v5');
  window._testModeOrigData=orig;
  localStorage.setItem('5euro_tracker_v5',JSON.stringify(TEST_DATA));
  const origPwd=localStorage.getItem('5euro_passwords');
  window._testModeOrigPwd=origPwd;
  localStorage.setItem('5euro_passwords',JSON.stringify(TEST_PWDS));
  loadData();
  rebuildCodes();
  const accounts=[{code:'TEST-CEO',label:'💡 Die Ideenschmiede',role:'CEO (Anna Müller)'},{code:'TEST-CFO',label:'💡 Die Ideenschmiede',role:'CFO (Ben Schneider)'},{code:'TEST-CMO',label:'💡 Die Ideenschmiede',role:'CMO (Lisa Weber)'},{code:'TEST-CEO2',label:'🌿 GreenWheels',role:'CEO (Tim Braun)'},{code:'TEST-PREP-CEO',label:'📋 Prepify',role:'CEO (Tina Heckel)'},{code:'TEST-ADMIN',label:'🏫 DHBW Stuttgart',role:'Admin (Dr. Neusser)'}];
  document.getElementById('testAccountList').innerHTML=accounts.map(a=>'<button onclick="testLogin(\''+a.code+'\')" style="width:100%;text-align:left;background:white;border:2px solid #E0E7F0;border-radius:10px;padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;"><div><div style="font-size:13px;font-weight:700;color:#1e3a5f;">'+a.role+'</div><div style="font-size:11px;color:#888;">'+a.label+'</div></div><div style="margin-left:auto;font-size:11px;color:#2563EB;font-weight:700;">Einloggen →</div></button>').join('');
  const existing=document.getElementById('testModeBanner');if(existing) existing.remove();
  const banner=document.createElement('div');
  banner.id='testModeBanner';
  banner.className='test-mode-banner';
  banner.innerHTML='🧪 TESTUMGEBUNG – Keine echten Daten werden gespeichert';
  document.body.prepend(banner);
}
function testLogin(code){
  finishLogin(code);
  const banner=document.getElementById('testModeBanner');
  if(banner) document.body.appendChild(banner);
}
function showTestMode(){
  const lm=document.getElementById('loginMode'); if(lm) lm.style.display='none';
  const tp=document.getElementById('testModePanel'); if(tp) tp.style.display='block';
  loadTestData();
}

function showLogin(){
  showLoginModeSelect();
  const banner=document.getElementById('testModeBanner'); if(banner) banner.remove();
  if(window._testModeActive){ window._testModeActive=false; }
}

function showLoginModeSelect(){
  ['loginStep1','loginStep2','loginStep3','loginStep4','loginStep5','loginStep6',
   'magicLinkFlow','magicLinkSentStep'].forEach(function(id){
    const el=document.getElementById(id); if(el) el.style.display='none';
  });
  const msel=document.getElementById('loginModeSelect'); if(msel) msel.style.display='block';
  const lm=document.getElementById('loginMode'); if(lm) lm.style.display='block';
  const tp=document.getElementById('testModePanel'); if(tp) tp.style.display='none';
  const banner=document.getElementById('testModeBanner'); if(banner) banner.remove();
  if(window._testModeActive){ window._testModeActive=false; }
}

function showMagicLinkFlow(){
  const msel=document.getElementById('loginModeSelect'); if(msel) msel.style.display='none';
  const mf=document.getElementById('magicLinkFlow'); if(mf) mf.style.display='block';
  const ms=document.getElementById('magicLinkSentStep'); if(ms) ms.style.display='none';
  const le=document.getElementById('loginEmail'); if(le) le.value='';
  const ee=document.getElementById('loginEmailError'); if(ee) ee.style.display='none';
  const sb=document.getElementById('loginSendBtn'); if(sb){ sb.disabled=false; sb.innerHTML='&#128233; Magic Link senden'; }
  setTimeout(()=>document.getElementById('loginEmail')?.focus(), 50);
}

function showCodeFlow(){
  const msel=document.getElementById('loginModeSelect'); if(msel) msel.style.display='none';
  const s1=document.getElementById('loginStep1'); if(s1) s1.style.display='block';
  setTimeout(()=>document.getElementById('loginCode')?.focus(), 50);
}

function skipProfile(){
  const s4=document.getElementById('loginStep4'); if(s4) s4.style.display='none';
  _profileLoginCode=null;
  if(!window._testMode && state.currentUser){
    try{ sessionStorage.setItem('venturelab_session',JSON.stringify({code:state.currentUser.code,lang:state.lang||'de'})); }catch(e){}
  }
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').style.display='block';
  initApp();
  if(state.lang==='en') setTimeout(applyLang,150);
}
function showLoginStep1(){
  const msel=document.getElementById('loginModeSelect');if(msel) msel.style.display='none';
  document.getElementById('loginStep1').style.display='block';
  setTimeout(()=>document.getElementById('loginCode')?.focus(),50);
}
// NOTE: showRegister() is defined above as alias for showRegisterMode() – do not redefine here
function updateRegTeamList(){
  const gameId = document.getElementById('regGame').value;
  if(!gameId){ document.getElementById('regTeamSection').style.display='none'; return; }
  document.getElementById('regTeamSection').style.display='block';
  // Reset type selection
  setRegType(null);
}
function setRegType(type){
  regState.type = type;
  regState.selectedTeamId = null;
  const btnNew = document.getElementById('btnNewTeam');
  const btnJoin = document.getElementById('btnJoinTeam');
  btnNew.classList.toggle('active', type==='new');
  btnJoin.classList.toggle('active', type==='join');
  document.getElementById('regNewTeamFields').style.display = type==='new' ? 'block' : 'none';
  document.getElementById('regJoinTeamFields').style.display = type==='join' ? 'block' : 'none';
  if(type==='join') renderRegTeamList();
}
function renderRegTeamList(){
  const gameId = document.getElementById('regGame').value;
  const teams = TEAMS.filter(t=>t.gameId===gameId);
  const el = document.getElementById('regTeamList');
  if(teams.length===0){
    el.innerHTML='<div style="padding:12px;font-size:12px;color:#999;text-align:center;">Noch keine Teams vorhanden – gründe das erste!</div>';
    return;
  }
  el.innerHTML = teams.map(t=>{
    const mCount = MEMBERS.filter(m=>m.teamId===t.id).length;
    const game = GAMES.find(g=>g.id===t.gameId);
    const maxSize = game?.teamSize||4;
    const full = mCount>=maxSize;
    const oc = full ? '' : `selectRegTeam('${t.id}')`;
    return `<div class="reg-team-row ${regState.selectedTeamId===t.id?'selected':''}" onclick="${oc}">
      <div>
        <div style="font-weight:700;">${t.logo||'👥'} ${t.name}</div>
        <div style="font-size:11px;color:#888;">${t.biz||''}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;${full?'color:#C00000;':'color:#375623;'}">${mCount}/${maxSize} ${full?'voll':'frei'}</div>
        ${!full?`<button class="btn btn-primary btn-xs" onclick="event.stopPropagation();selectRegTeam('${t.id}')">Beitreten</button>`:''}
      </div>
    </div>`;
  }).join('');
}
function selectRegTeam(teamId){
  regState.selectedTeamId = teamId;
  renderRegTeamList();
}
function registerUser(){
  const name = document.getElementById('regName').value.trim();
  const gameId = document.getElementById('regGame').value;
  const errEl = document.getElementById('regError');
  errEl.style.display='none';
  if(!name){ errEl.textContent='Bitte deinen Namen eingeben.'; errEl.style.display='block'; return; }
  if(!gameId){ errEl.textContent='Bitte ein Spiel auswählen.'; errEl.style.display='block'; return; }
  if(!regState.type){ errEl.textContent='Möchtest du ein neues Team gründen oder beitreten?'; errEl.style.display='block'; return; }

  const game = GAMES.find(g=>g.id===gameId);
  let memberId, code, teamName, teamId, role, info;

  if(regState.type==='new'){
    const tname = document.getElementById('regTeamName').value.trim();
    if(!tname){ errEl.textContent='Bitte Team-Namen eingeben.'; errEl.style.display='block'; return; }
    // Check name not taken
    if(TEAMS.find(t=>t.gameId===gameId&&t.name.toLowerCase()===tname.toLowerCase())){
      errEl.textContent='Dieser Team-Name ist bereits vergeben.'; errEl.style.display='block'; return;
    }
    role = document.getElementById('regRoleNew').value;
    const COLORS=['#2E75B6','#375623','#C55A11','#5B2C8D','#C00000','#1F6B75','#7B3F00','#2D6A4F'];
    const EMOJIS=['🚀','💡','🔧','🌱','⚡','🎯','💎','🔥'];
    const idx=TEAMS.length%COLORS.length;
    teamId = nextId(TEAMS,'t');
    const tcode = makeUniqueTeamCode(tname);
    const newTeam={
      id:teamId, name:tname,
      biz:document.getElementById('regBiz').value.trim()||'Unternehmensidee folgt',
      slogan:'', color:COLORS[idx], logo:EMOJIS[idx], logoDataUrl:null,
      gameId, code:tcode, revenue:0, expenses:0, transactions:0, weekGoal:50,
      currentWeek:1, weekStatus:'open', mvps:[], mvpOverride:{}, desc:'', email:'', notif:{blog:true,week:true,reflect:true}, lang:'de'
    };
    TEAMS.push(newTeam);
    if(game) game.teamCount=TEAMS.filter(t=>t.gameId===gameId).length;
    memberId = nextId(MEMBERS,'mb');
    code = makeMemberCode(newTeam, 0);
    MEMBERS.push({id:memberId, teamId, name, role, title:role, bio:'', code, avatarDataUrl:null});
    teamName = tname;
    info = `<b>Team:</b> ${tname}<br><b>Rolle:</b> ${role}<br><b>Spiel:</b> ${game?.name}<br><br>Als Gründer bist du automatisch der erste Ansprechpartner für dein Team.`;
  } else {
    if(!regState.selectedTeamId){ errEl.textContent='Bitte ein Team auswählen.'; errEl.style.display='block'; return; }
    teamId = regState.selectedTeamId;
    const team = TEAMS.find(t=>t.id===teamId);
    const mCount = MEMBERS.filter(m=>m.teamId===teamId).length;
    if(mCount>=(game?.teamSize||4)){ errEl.textContent='Dieses Team ist leider voll.'; errEl.style.display='block'; return; }
    role = document.getElementById('regRoleJoin').value;
    memberId = nextId(MEMBERS,'mb');
    code = makeMemberCode(team, mCount);
    MEMBERS.push({id:memberId, teamId, name, role, title:role, bio:'', code, avatarDataUrl:null});
    teamName = team?.name||'';
    info = `<b>Team:</b> ${teamName}<br><b>Rolle:</b> ${role}<br><b>Spiel:</b> ${game?.name}`;
  }

  rebuildCodes(); saveData();
  regState.newCode = code;

  // Show success
  document.getElementById('regResultCode').textContent = code;
  document.getElementById('regResultInfo').innerHTML = info;
  document.getElementById('regStep1').style.display='none';
  document.getElementById('regStep2').style.display='block';
}
// NOTE: copyRegCode() is defined above (uses _regNewCode for invite-code flow)

