// ════════════════════════════════════════════════════════════════════
//  FIREBASE AUTH – MAGIC LINK (v0.9.0)
// ════════════════════════════════════════════════════════════════════

// Hardcoded superadmin emails (not exposed in DB or client code)
const SUPERADMIN_EMAILS = [
  'christian.neusser@googlemail.com',
  'christian.neusser@me.com'
];

function showLoginScreen(){
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('appShell').style.display='none';
  // Reset all input fields
  const le=document.getElementById('loginEmail'); if(le) le.value='';
  const ee=document.getElementById('loginEmailError'); if(ee) ee.style.display='none';
  const sb=document.getElementById('loginSendBtn'); if(sb){ sb.disabled=false; sb.innerHTML='&#128233; Magic Link senden'; }
  const lce=document.getElementById('loginCode'); if(lce) lce.value='';
  const lcerr=document.getElementById('loginError'); if(lcerr) lcerr.style.display='none';
  const lrp=document.getElementById('loginRolePreview'); if(lrp) lrp.style.display='none';
  showLoginModeSelect();
}

async function sendMagicLink(){
  const emailEl=document.getElementById('loginEmail');
  const errEl=document.getElementById('loginEmailError');
  const btn=document.getElementById('loginSendBtn');
  const email=(emailEl ? emailEl.value : '').trim().toLowerCase();
  if(!email || !email.includes('@') || !email.includes('.')){
    if(errEl){ errEl.textContent='Bitte gib eine gültige E-Mail-Adresse ein.'; errEl.style.display='block'; }
    return;
  }
  if(btn){ btn.disabled=true; btn.textContent='⏳ Sende…'; }
  try{
    await firebase.auth().sendSignInLinkToEmail(email,{
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true
    });
    localStorage.setItem('vlEmailForSignIn', email);
    const mf=document.getElementById('magicLinkFlow'); if(mf) mf.style.display='none';
    const ms=document.getElementById('magicLinkSentStep'); if(ms) ms.style.display='block';
    const se=document.getElementById('loginSentEmail'); if(se) se.textContent=email;
  }catch(e){
    console.error('sendMagicLink error:',e);
    if(errEl){
      if(e.code==='auth/invalid-email') errEl.textContent='Ungültige E-Mail-Adresse.';
      else if(e.code==='auth/unauthorized-domain') errEl.textContent='Domain nicht freigegeben – Firebase-Console prüfen.';
      else errEl.textContent=(e.message||'Fehler – bitte erneut versuchen.');
      errEl.style.display='block';
    }
    if(btn){ btn.disabled=false; btn.textContent='📩 Magic Link senden'; }
  }
}

async function _completeMagicLink(){
  _setLoadingMsg('Bestätige E-Mail-Link…');
  let email=localStorage.getItem('vlEmailForSignIn');
  if(!email){
    email=prompt('Zur Bestätigung: Gib bitte nochmals deine E-Mail ein:');
    if(!email){ _hideLoadingOverlay(); showLoginScreen(); return; }
    email=email.trim().toLowerCase();
  }
  try{
    await firebase.auth().signInWithEmailLink(email, window.location.href);
    localStorage.removeItem('vlEmailForSignIn');
    window.history.replaceState({}, document.title, window.location.pathname);
    // onAuthStateChanged will fire next with the signed-in user
  }catch(e){
    console.error('_completeMagicLink error:',e);
    _hideLoadingOverlay();
    alert('Der Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.\n\n(' + (e.message||e.code) + ')');
    showLoginScreen();
  }
}

async function _onAuthUser(firebaseUser){
  _setLoadingMsg('Lade Daten…');
  _setFbStatus('online','Online');

  if(_db){
    try{
      const fbTimeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),10000));
      const snap=await Promise.race([_db.ref(STORAGE_KEY).once('value'), fbTimeout]);
      const d=snap.val();
      if(d){
        _fbDataLoaded=true;
        _replaceArrays(d); _postLoadCalc();
        try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(_buildPayload())); }catch(e){}
        console.log('✅ Loaded from Firebase');
      } else {
        _fbDataConfirmedEmpty=true;
        loadData();
        if(GAMES.length||TEAMS.length){
          _db.ref(STORAGE_KEY).set(_buildPayload()).catch(e=>console.warn('Initial push failed',e));
          console.log('📤 Pushed local data to Firebase');
        }
      }
    }catch(e){
      console.warn('Firebase data load error:',e);
      loadData();
      _setFbStatus('offline','Offline – lokale Daten');
    }
  } else {
    loadData();
  }

  rebuildCodes();
  _finishStartup();
  _setupRealtimeListener();

  const email=(firebaseUser.email||'').toLowerCase();
  const user=_resolveRoleFromEmail(email, firebaseUser);

  if(!user){
    console.warn('E-Mail nicht im System registriert:', email);
    firebase.auth().signOut().catch(()=>{});
    _hideLoadingOverlay();
    showLoginScreen();
    // Show magic link flow so error is visible
    showMagicLinkFlow();
    const errEl=document.getElementById('loginEmailError');
    if(errEl){
      errEl.textContent='E-Mail (' + email + ') ist nicht im System registriert. Bitte wende dich an den Dozenten.';
      errEl.style.display='block';
    }
    return;
  }

  state.currentUser=user;
  if(!state.lang) state.lang='de';
  logEvent('login',{role:user.role, email});
  _hideLoadingOverlay();
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').style.display='block';
  initApp();
  if(state.lang==='en') setTimeout(applyLang,150);
}

function _resolveRoleFromEmail(email, firebaseUser){
  const uid = firebaseUser ? firebaseUser.uid : null;
  // 1. Hardcoded superadmin emails
  if(SUPERADMIN_EMAILS.includes(email)){
    return { role:'superadmin', name:'Dr. Christian Neusser', email, uid, label:'Superadmin' };
  }
  // 2. SUPERADMINS array (from Firebase data)
  const sa=SUPERADMINS.find(s=>s.email && s.email.toLowerCase()===email);
  if(sa) return { ...sa, role:'superadmin', uid, label:'Superadmin' };
  // 3. ADMINS array
  const admin=ADMINS.find(a=>a.email && a.email.toLowerCase()===email);
  if(admin) return { ...admin, role:'admin', uid };
  // 4. MEMBERS array
  const member=MEMBERS.find(m=>m.email && m.email.toLowerCase()===email);
  if(member){
    const team=TEAMS.find(t=>t.id===member.teamId);
    return { ...member, role:'member', teamId:member.teamId, gameId:(team&&team.gameId)||'', uid };
  }
  return null;
}

function initDataAndStart(){
  if(!_fbConfigured()){
    // No Firebase configured → localStorage only, show login (test mode still available)
    _setLoadingMsg('Lade lokale Daten…');
    setTimeout(()=>{
      loadData(); rebuildCodes();
      _hideLoadingOverlay();
      _setFbStatus('offline','Nur lokal (kein Firebase)');
      _finishStartup();
      showLoginScreen();
    }, 300);
    return;
  }

  // Init Firebase (app + database + auth)
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    _fbOK = true;
  }catch(e){
    console.warn('Firebase init failed:', e);
    _setLoadingMsg('Firebase Fehler – lade lokal…');
    setTimeout(()=>{ loadData(); rebuildCodes(); _hideLoadingOverlay(); _finishStartup(); showLoginScreen(); }, 800);
    return;
  }

  _setLoadingMsg('Prüfe Anmeldung…');

  // If URL contains a magic link → complete sign-in
  if(firebase.auth().isSignInWithEmailLink(window.location.href)){
    _completeMagicLink();
    return;
  }

  // Watch auth state (fires immediately with current user or null on every page load)
  firebase.auth().onAuthStateChanged(async function(user){
    if(user && !user.isAnonymous){
      // Email-Link-Authentifizierung (Magic Link) → Rolle per E-Mail auflösen
      await _onAuthUser(user);
    } else if(user && user.isAnonymous){
      // Anonyme Session (für Code-Login-Pfad) → Daten laden, Session-Restore versuchen
      await _loadFirebaseDataForCodePath();
    } else {
      // Nicht angemeldet → anonyme Session holen (erfüllt auth != null DB-Regeln)
      firebase.auth().signInAnonymously().catch(function(e){
        console.warn('signInAnonymously failed, falling back to local data:', e);
        loadData(); rebuildCodes();
        _finishStartup();
        if(!state.currentUser && !window._testMode){ _hideLoadingOverlay(); showLoginScreen(); }
      });
    }
  });
}

function _finishStartup(){
  const before = JSON.stringify({t:TEAMS.length, g:GAMES.length});
  ensureDefaultSetupCodes();
  const after = JSON.stringify({t:TEAMS.length, g:GAMES.length});
  if(before !== after){
    // CRITICAL: Only push to Firebase if we are SURE Firebase is empty (not just timed out).
    if(_fbDataConfirmedEmpty || !_fbOK){
      saveData();
    } else {
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(_buildPayload())); }catch(e){}
      console.warn('_finishStartup: skipped Firebase write (data not confirmed empty)');
    }
  }

  // Session-Restore für Code-Nutzer (sessionStorage)
  // Nur wenn noch kein User gesetzt UND kein Firebase-Email-Auth-User vorhanden
  if(!state.currentUser && !window._testMode){
    const fbUser = (typeof firebase!=='undefined' && firebase.apps && firebase.apps.length)
      ? firebase.auth().currentUser : null;
    const isEmailAuth = fbUser && !fbUser.isAnonymous;
    if(!isEmailAuth){
      try{
        const saved = sessionStorage.getItem('venturelab_session');
        if(saved){
          const sess = JSON.parse(saved);
          const code = sess.code;
          if(code && CODES[code]){
            state.currentUser = {...CODES[code], code};
            if(sess.lang) state.lang = sess.lang;
            if(sess.managingGameId) state.managingGameId = sess.managingGameId;
            _hideLoadingOverlay();
            document.getElementById('loginScreen').style.display='none';
            document.getElementById('appShell').style.display='block';
            initApp();
            if(state.lang==='en') setTimeout(applyLang,150);
          } else {
            sessionStorage.removeItem('venturelab_session');
          }
        }
      }catch(e){ sessionStorage.removeItem('venturelab_session'); }
    }
  }
}
async function _loadFirebaseDataForCodePath(){
  // Daten für den Code-Login-Pfad laden (anonyme Firebase-Auth)
  _setFbStatus('online','Online');

  if(_db && !_fbDataLoaded){
    _setLoadingMsg('Lade Daten…');
    try{
      const fbTimeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),10000));
      const snap=await Promise.race([_db.ref(STORAGE_KEY).once('value'), fbTimeout]);
      const d=snap.val();
      if(d){
        _fbDataLoaded=true;
        _replaceArrays(d); _postLoadCalc();
        try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(_buildPayload())); }catch(e){}
        console.log('✅ Loaded from Firebase (code path)');
      } else {
        _fbDataConfirmedEmpty=true;
        loadData();
        if(GAMES.length||TEAMS.length){
          _db.ref(STORAGE_KEY).set(_buildPayload()).catch(e=>console.warn('Initial push failed',e));
          console.log('📤 Pushed local data to Firebase (code path)');
        }
      }
    }catch(e){
      console.warn('Firebase data load error (code path):', e);
      loadData();
      _setFbStatus('offline','Offline – lokale Daten');
    }
  } else if(!_fbDataLoaded){
    loadData();
  }

  rebuildCodes();
  _finishStartup();
  _setupRealtimeListener();

  if(!state.currentUser && !window._testMode){
    _hideLoadingOverlay();
    showLoginScreen();
  }
}

function resetToDemo(){
  if(!confirm('Demo-Daten wiederherstellen? Alle eigenen Daten gehen verloren.')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
function clearAllData(){
  if(!confirm('ALLE Daten löschen und Tracker leeren? Nicht rückgängig zu machen!')) return;
  // Leere Semester-Konfiguration behalten, nur operative Daten löschen
  BLOGS.length=0; TRANSACTIONS.length=0; REFLECTIONS.length=0; MESSAGES.length=0; FEEDBACKS.length=0;
  TEAMS.forEach(t=>{t.revenue=0;t.expenses=0;t.transactions=0;t.currentWeek=1;t.weekStatus='open';t.mvps=[];t.mvpOverride={};});
  saveData(); location.reload();
}
// Beim Start: Daten laden (Firebase zuerst, localStorage als Fallback)
// Wird nach dem Laden des DOM ausgeführt
const dataLoaded = false; // wird durch initDataAndStart() gesetzt

// Function to ensure default setup codes exist
function ensureDefaultSetupCodes(){
  const defaultGameId='g-default';
  const defaultGame=GAMES.find(g=>g.id===defaultGameId);

  if(!defaultGame){
    // Create default game if it doesn't exist
    const defaultUni=UNIVERSITIES.find(u=>u.id==='uni-default')||{id:'uni-default',name:'Deine Universität',short:'UNIV',slug:'univ',city:'',adminCount:1,gameCount:1};
    if(!UNIVERSITIES.find(u=>u.id==='uni-default')) UNIVERSITIES.push(defaultUni);

    const newDefaultGame={
      id:defaultGameId,name:'VentureLab Tracker Spielsession',universityId:'uni-default',uni:'UNIV',
      status:'active',isLive:true,currentWeek:1,teamCount:12,start:new Date().toISOString().split('T')[0],
      end:new Date(Date.now()+180*24*60*60*1000).toISOString().split('T')[0],
      mode:'intern',capital:5,teamSize:5,weeklyDeadline:'Sonntag 23:59',autoApprove:0,rounds:1,currentRound:1,
      adminEmail:'',faqs:[],faqPdfs:[]
    };
    GAMES.push(newDefaultGame);
  }

  // Ensure all 12 default setup codes exist
  const EMOJIS=['🚀','💡','🔧','🌱','⚡','🎯','💎','🔥','🌊','🐯','🐉','🦅'];
  const COLORS=['#2E75B6','#375623','#C55A11','#5B2C8D','#C00000','#1F6B75','#7B3F00','#2D6A4F','#8B4513','#006064','#2c5f7c','#5a3a7c'];

  for(let i=0;i<12;i++){
    const setupCode='SETUP-DFLT-'+String(i+1).padStart(3,'0');
    const existing=TEAMS.find(t=>t.setupCode===setupCode);
    if(!existing){
      // Create missing setup code slot
      const pendingTeam={
        id:'t-pending-'+(i+1)+'-'+Date.now(),
        gameId:defaultGameId,
        name:'',
        slogan:'',
        biz:'',
        approach:'',
        strategy:'',
        setupCode:setupCode,
        code:'',
        status:'pending',
        logo:EMOJIS[i%EMOJIS.length],
        color:COLORS[i%COLORS.length],
        logoDataUrl:null,
        revenue:0,
        expenses:0,
        capital:0,
        transactions:0,
        currentWeek:1,
        weekStatus:'open',
        mvps:[],
        mvpOverride:{},
        desc:'',
        email:'',
        notif:{blog:true,week:true,reflect:true},
        lang:'de',
        weekGoal:50
      };
      TEAMS.push(pendingTeam);
    }
  }
}

// Startup is now handled asynchronously by initDataAndStart()
// which is called from window.onload (see bottom of script)

