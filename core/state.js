// ════════════════════════════════════════════════════════════════════
//  DATA MODEL
// ════════════════════════════════════════════════════════════════════

let UNIVERSITIES = [];

let GAMES = [];

let ADMINS = [];

let TEAMS = [];

let MEMBERS = [];

let TRANSACTIONS = [];

let BLOGS = [];

let REFLECTIONS = [];

// MESSAGES: direct messaging system
let MESSAGES = [];

// FEEDBACK submissions
let FEEDBACKS = [];
// Activity logs
let LOGS = [];
// Soft-delete recycle bin (max 100 items, persisted to Firebase)
let DELETED_ITEMS = [];
let SUPERADMINS = []; // zusätzliche Superadmins
let FAQ_DOCS   = []; // PDFs/Docs in FAQ
let ANNOUNCEMENTS = [];
let CANVASES   = []; // Business Model Canvas (CMO, pro Team)
let PASSWORDS  = {}; // {code: sha256hash} – shared via Firebase

// ════════════════════════════════════════════════════════════════════
//  AUTH / CODES
// ════════════════════════════════════════════════════════════════════

let CODES = {};
function rebuildCodes(){
  CODES = {};
  // Read Superadmin profile: Firebase (PASSWORDS) → localStorage → default
  const _spLs=(()=>{try{return JSON.parse(localStorage.getItem('5euro_superprofile')||'null');}catch(e){return null;}})();
  const _spName  = PASSWORDS['__sp_name']  || (_spLs&&_spLs.name)  || 'Dr. Christian Neusser';
  const _spEmail = PASSWORDS['__sp_email'] || (_spLs&&_spLs.email) || 'christian.neusser@me.com';
  CODES['SUPER-NEUSS'] = {role:'superadmin', name:_spName, email:_spEmail, label:'Superadmin'};
  SUPERADMINS.forEach(sa => {
    if(sa.code) CODES[sa.code] = {role:'superadmin', superAdminId:sa.id, name:sa.name, email:sa.email||'', label:'Superadmin'};
  });
  ADMINS.forEach(a => {
    if(a.code) CODES[a.code] = {role:'admin', adminId:a.id, gameId:a.gameId, name:a.name, uni:a.uni||'', label:'Admin '+(a.uni||'')};
  });
  TEAMS.forEach(t => {
    if(t.code) CODES[t.code] = {role:'team', teamId:t.id, gameId:t.gameId, name:t.name};
  });
  MEMBERS.forEach(m => {
    const team = TEAMS.find(t => t.id === m.teamId);
    if(m.code) CODES[m.code] = {role:'member', memberId:m.id, teamId:m.teamId, name:m.name, gameId:team?.gameId||'g1'};
  });
}
rebuildCodes();
