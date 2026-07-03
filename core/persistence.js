// ════════════════════════════════════════════════════════════════════
//  PERSISTENZ (Firebase + localStorage Fallback)
// ════════════════════════════════════════════════════════════════════
const STORAGE_KEY = '5euro_tracker_v5';

// ── Firebase state ──────────────────────────────────────────────────
let _db = null;
let _fbOK = false;          // Firebase reachable + initialised
let _fbWriting = false;     // suppress own-write listener bounce
let _fbListenerOn = false;
let _fbSaveTimer = null;    // debounce Firebase writes
let _fbDataConfirmedEmpty = false; // true ONLY when Firebase replied with null (safe to push defaults)
let _fbDataLoaded = false;  // true once any Firebase data has arrived (or confirmed empty)

function _fbConfigured(){
  return !Object.values(FIREBASE_CONFIG).some(v => String(v).includes('FILL_IN'))
    && !!FIREBASE_CONFIG.databaseURL
    && !FIREBASE_CONFIG.databaseURL.includes('FILL_IN');
}

function _setFbStatus(state, msg){
  const el = document.getElementById('fbStatus');
  if(!el) return;
  el.className = state; // 'online' | 'offline' | 'syncing'
  const icons = {online:'🟢', offline:'🔴', syncing:'🔄'};
  el.textContent = icons[state] + ' ' + msg;
  el.style.display = 'block';
}

// ── Core data helpers ───────────────────────────────────────────────
function _replaceArrays(d){
  const replace=(arr,data)=>{arr.length=0;(data||[]).forEach(x=>arr.push(x));};
  replace(UNIVERSITIES,d.UNIVERSITIES); replace(GAMES,d.GAMES);
  replace(TEAMS,d.TEAMS);              replace(MEMBERS,d.MEMBERS);
  replace(BLOGS,d.BLOGS);              replace(TRANSACTIONS,d.TRANSACTIONS);
  replace(REFLECTIONS,d.REFLECTIONS);  replace(ADMINS,d.ADMINS);
  replace(MESSAGES,d.MESSAGES||[]);    replace(FEEDBACKS,d.FEEDBACKS||[]);
  replace(LOGS,d.LOGS||[]);
  replace(DELETED_ITEMS,d.DELETED_ITEMS||[]);
  replace(SUPERADMINS,d.SUPERADMINS||[]);
  replace(FAQ_DOCS,d.FAQ_DOCS||[]);    replace(ANNOUNCEMENTS,d.ANNOUNCEMENTS||[]);
  replace(CANVASES,d.CANVASES||[]);
  // Merge PASSWORDS dict
  if(d.PASSWORDS && typeof d.PASSWORDS==='object') Object.assign(PASSWORDS, d.PASSWORDS);
  // Migrate legacy localStorage passwords
  try{const lp=JSON.parse(localStorage.getItem(PWD_KEY)||'{}');Object.assign(PASSWORDS,lp);localStorage.removeItem(PWD_KEY);}catch(e){}
}

function _postLoadCalc(){
  // Recalculate team financials from TRANSACTIONS (ensures Kapital excluded)
  TEAMS.forEach(function(team){
    const txs=TRANSACTIONS.filter(function(t){return t.teamId===team.id;});
    team.revenue=txs.filter(function(t){return t.type==='income'&&t.cat!=='Kapital';}).reduce(function(s,t){return s+t.amount;},0);
    team.expenses=txs.filter(function(t){return t.type==='expense'&&t.cat!=='Kapital';}).reduce(function(s,t){return s+t.amount;},0);
    team.capital=txs.filter(function(t){return t.cat==='Kapital';}).reduce(function(s,t){return s+t.amount;},0);
    team.transactions=txs.length;
  });
  // Migrate single-PDF fields to faqPdfs array
  GAMES.forEach(g=>{
    if(!g.faqPdfs) g.faqPdfs=[];
    if(g.faqPdf&&g.faqPdfName&&!g.faqPdfs.some(p=>p.name===g.faqPdfName)){
      g.faqPdfs.push({id:'pdf-migrated',name:g.faqPdfName,data:g.faqPdf,uploadedAt:new Date().toISOString()});
      delete g.faqPdf; delete g.faqPdfName;
    }
  });
  rebuildCodes();
}

function _buildPayload(){
  return {UNIVERSITIES,GAMES,TEAMS,MEMBERS,BLOGS,TRANSACTIONS,REFLECTIONS,MESSAGES,ADMINS,FEEDBACKS,LOGS,DELETED_ITEMS,SUPERADMINS,FAQ_DOCS,ANNOUNCEMENTS,CANVASES,PASSWORDS};
}

// ── saveData (localStorage + Firebase async) ─────────────────────────
let _localWriteNonce='';
function saveData(){
  try{
    if(!saveData._cnt) saveData._cnt=0;
    if(++saveData._cnt % 10 === 0) flushTrackBuffer();
    // Generate a nonce so the real-time listener can skip our own echo
    _localWriteNonce='w'+Date.now()+Math.random().toString(36).substr(2,4);
    const payload = _buildPayload();
    payload._nonce = _localWriteNonce;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Firebase debounced write (max once per 800ms for faster persistence)
    if(_fbOK && _db){
      // Block listener IMMEDIATELY (before debounce fires) to prevent remote
      // snapshots from overwriting our freshly-updated local state during the
      // 800ms debounce window (fixes approved-blog-disappearing race condition)
      _fbWriting = true;
      if(saveData._fbWriteReset) clearTimeout(saveData._fbWriteReset);
      if(_fbSaveTimer) clearTimeout(_fbSaveTimer);
      _fbSaveTimer = setTimeout(()=>{
        _fbSaveTimer = null;
        _db.ref('5euro_tracker_v5').set(payload)
          .then(()=>{ _fbWriting = false; })
          .catch(e=>{ console.warn('FB write error',e); _fbWriting = false; });
      }, 800);
      // Safety reset: force _fbWriting=false after 10s in case write never resolves
      saveData._fbWriteReset = setTimeout(()=>{ _fbWriting = false; }, 10000);
    }
  }catch(e){console.warn('saveData error',e);}
}

// ── loadData (localStorage only – used as fallback) ──────────────────
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    const d = JSON.parse(raw);
    _replaceArrays(d);
    _postLoadCalc();
    return true;
  }catch(e){console.warn('loadData error',e);return false;}
}

// ── Real-time listener ───────────────────────────────────────────────
function _setupRealtimeListener(){
  if(!_fbOK || !_db || _fbListenerOn) return;
  _fbListenerOn = true;
  _db.ref('5euro_tracker_v5').on('value', snapshot => {
    if(window._testMode) return;
    if(_fbWriting) return; // own write, skip
    const d = snapshot.val();
    if(!d) return;
    // Skip if this is an echo of our own write (same nonce)
    const isOwnEcho = d._nonce && d._nonce === _localWriteNonce;
    _fbDataLoaded = true; // Mark that we have received Firebase data
    if(!isOwnEcho){
      _replaceArrays(d);
      _postLoadCalc();
      // Refresh cache ONLY - do NOT call saveData()
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(_buildPayload())); }catch(e){}
      // Re-render current view if app is running - use renderCurrentView (no saveData)
      if(state && state.currentPage && state.currentUser){
        try{ renderCurrentView(); }catch(e){console.warn('[VentureLab] renderCurrentView error after remote update:',e);}
      }
      _setFbStatus('online','Online');
      showToast('🔄 Daten von anderem Gerät aktualisiert','info',2500);
    }
  });
  // Monitor connection state with enhanced offline detection
  let offlineWarnShown = false;
  _db.ref('.info/connected').on('value', snap=>{
    if(snap.val()===true){
      _setFbStatus('online','Online');
      offlineWarnShown = false;
    }
    else {
      _setFbStatus('offline','Keine Verbindung');
      // Only warn once per session
      if(!offlineWarnShown) {
        offlineWarnShown = true;
        setTimeout(()=>{
          const msg = 'Firebase zeigt Offline. Prüfe: databaseURL in config (europe-west1 vs US)?';
          console.warn(msg);
          showToast(msg, 'warning', 5000);
        }, 4000);
      }
    }
  });
}

// ── Async startup: Firebase first, localStorage fallback ──────────────
function _hideLoadingOverlay(){
  const el = document.getElementById('fbLoadingOverlay');
  if(el) el.style.display='none';
}
function _setLoadingMsg(msg){
  const el = document.getElementById('fbLoadingMsg');
  if(el) el.textContent = msg;
}

