// ════════════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════════════

// ── PASSWORD & LANGUAGE SYSTEM ───────────────────────────────────────────────
const PWD_KEY='5euro_passwords';
function getPwds(){return PASSWORDS;}
function savePwd(code,hash){PASSWORDS[code]=hash;saveData();}
async function hashPwd(str){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
let _loginLang='de';
let _loginTempCode='';
// ── setLoginLang() → verschoben nach /i18n/en.js (Modul-Split, reines Refactoring) ──
function doLogin(){doLoginStep1();}

function showLoginRolePreview(code){
  const preview=document.getElementById('loginRolePreview');
  if(!preview) return;
  if(!code||code.length<3){preview.style.display='none';return;}
  const user=CODES[code.toUpperCase()];
  if(!user){preview.style.display='none';return;}
  const icons={superadmin:'👑',admin:'⚙️',team:'👥',member:'👤'};
  // Privacy: show team name + role, NOT the real name
  let displayText='';
  if(user.role==='member'){
    // find team via member
    const mem=MEMBERS.find(m=>m.code===code.toUpperCase());
    const team=mem?TEAMS.find(t=>t.id===mem.teamId):null;
    const roleLabel=mem?mem.role:'Mitglied';
    displayText=(icons.member)+' '+(team?team.logo+' '+team.name:'Team')+' &middot; '+roleLabel;
  } else if(user.role==='team'){
    const team=TEAMS.find(t=>t.code===code.toUpperCase());
    displayText=(icons.team)+' '+(team?team.logo+' '+team.name:'Team')+' &middot; Teamleiter';
  } else if(user.role==='admin'){
    const game=GAMES.find(g=>g.id===user.gameId);
    displayText=(icons.admin)+' Admin &middot; '+(game?game.name:user.uni||'');
  } else {
    displayText=(icons[user.role]||'?')+' '+(user.role==='superadmin'?'Superadmin':user.role);
  }
  preview.style.display='block';
  preview.innerHTML=displayText;
}
function showPwdResetRequest(){
  document.getElementById('loginStep2').style.display='none';
  document.getElementById('loginStep5').style.display='block';
  document.getElementById('loginResetError').style.display='none';
  // Prefill email if code user has one
  const member=_loginTempCode?MEMBERS.find(m=>m.code===_loginTempCode)||ADMINS.find(a=>a.code===_loginTempCode):null;
  const re=document.getElementById('resetEmail');
  if(re&&member&&member.email) re.value=member.email;
  setTimeout(()=>document.getElementById('resetEmail')?.focus(),50);
}
function showPwdResetFromCode(){
  // Called from Step 1 — try to prefill email from the typed code
  const typedCode=(document.getElementById('loginCode')?.value||'').trim().toUpperCase();
  const member=typedCode?MEMBERS.find(m=>m.code===typedCode)||ADMINS.find(a=>a.code===typedCode):null;
  document.getElementById('loginStep1').style.display='none';
  document.getElementById('loginStep5').style.display='block';
  document.getElementById('loginResetError').style.display='none';
  const re=document.getElementById('resetEmail');
  if(re&&member&&member.email) re.value=member.email;
  setTimeout(()=>document.getElementById('resetEmail')?.focus(),50);
}
function showLoginStep5(){
  document.getElementById('loginStep6').style.display='none';
  document.getElementById('loginStep5').style.display='block';
  document.getElementById('loginResetError').style.display='none';
}
function showLoginStep2(){
  document.getElementById('loginStep5').style.display='none';
  document.getElementById('loginStep2').style.display='block';
}
window._resetTokenStore={};
async function sendPwdResetToken(){
  const email=document.getElementById('resetEmail').value.trim().toLowerCase();
  if(!email){document.getElementById('loginResetError').style.display='block';return;}
  // Find user by email across members and admins
  const memberMatch=MEMBERS.find(m=>m.email&&m.email.toLowerCase()===email);
  const adminMatch=ADMINS.find(a=>a.email&&a.email.toLowerCase()===email);
  const superMatch=(CODES['SUPER-NEUSS']?.email||'').toLowerCase()===email?{code:'SUPER-NEUSS',name:CODES['SUPER-NEUSS']?.name}:null;
  const saMatch=SUPERADMINS.find(s=>s.email&&s.email.toLowerCase()===email);
  const userCode=memberMatch?.code||adminMatch?.code||(superMatch?'SUPER-NEUSS':null)||saMatch?.code;
  if(!userCode){
    document.getElementById('loginResetError').style.display='block';
    setTimeout(()=>document.getElementById('loginResetError').style.display='none',3000);
    return;
  }
  const token=String(Math.floor(100000+Math.random()*900000));
  window._resetTokenStore[email]={token,code:userCode,expiry:Date.now()+15*60*1000};
  // Send email
  try{
    const game=GAMES[0]||{};
    await fetch(CONFIG.FEEDBACK_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'notification',
        to:email,
        subject:'🔑 Dein Reset-Code für VentureLab',
        message:`Hallo,\n\ndein Reset-Code lautet: ${token}\n\nDieser Code ist 15 Minuten gültig.\n\nFalls du kein Passwort-Reset beantragt hast, ignoriere diese E-Mail.\n\nVentureLab`,
        sender:'VentureLab System',
        team:'',
        game:game.name||''
      })
    });
    showToast('📧 Reset-Code gesendet an '+email,'success');
  }catch(e){
    showToast('E-Mail konnte nicht gesendet werden. Bitte Admin kontaktieren.','error');
  }
  document.getElementById('loginStep5').style.display='none';
  document.getElementById('loginStep6').style.display='block';
  document.getElementById('loginResetTokenError').style.display='none';
  document.getElementById('resetToken').value='';
  document.getElementById('resetNewPwd1').value='';
  document.getElementById('resetNewPwd2').value='';
  setTimeout(()=>document.getElementById('resetToken')?.focus(),50);
  window._resetPendingEmail=email;
}
async function verifyAndResetPwd(){
  const email=window._resetPendingEmail;
  const token=document.getElementById('resetToken').value.trim();
  const p1=document.getElementById('resetNewPwd1').value;
  const p2=document.getElementById('resetNewPwd2').value;
  const errEl=document.getElementById('loginResetTokenError');
  const entry=window._resetTokenStore[email];
  if(!entry||entry.token!==token||Date.now()>entry.expiry){
    errEl.textContent='❌ Code falsch oder abgelaufen';errEl.style.display='block';return;
  }
  if(p1.length<6){errEl.textContent='❌ Mindestens 6 Zeichen';errEl.style.display='block';return;}
  if(p1!==p2){errEl.textContent='❌ Passwörter stimmen nicht überein';errEl.style.display='block';return;}
  const hash=await hashPwd(p1);
  savePwd(entry.code,hash);
  delete window._resetTokenStore[email];
  delete window._resetPendingEmail;
  showToast('✅ Passwort erfolgreich zurückgesetzt! Bitte jetzt einloggen.','success');
  // Go back to step 1
  document.getElementById('loginStep6').style.display='none';
  document.getElementById('loginStep1').style.display='block';
  document.getElementById('loginCode').value='';
}
function doLoginStep1(){
  let code=document.getElementById('loginCode').value.trim();
  if(code.includes('@')){
    const emailLower=code.toLowerCase();
    const memberByEmail=MEMBERS.find(m=>m.email&&m.email.toLowerCase()===emailLower);
    const adminByEmail=ADMINS.find(a=>a.email&&a.email.toLowerCase()===emailLower);
    const saByEmail=SUPERADMINS.find(s=>s.email&&s.email.toLowerCase()===emailLower);
    const mainSaEmail=(CODES['SUPER-NEUSS']?.email||'').toLowerCase();
    if(memberByEmail) code=memberByEmail.code;
    else if(adminByEmail) code=adminByEmail.code;
    else if(saByEmail) code=saByEmail.code;
    else if(emailLower===mainSaEmail) code='SUPER-NEUSS';
    else {
      const err=document.getElementById('loginError');err.style.display='block';
      setTimeout(()=>err.style.display='none',3000);return;
    }
  } else {
    code=code.toUpperCase();
  }
  const user=CODES[code.toUpperCase()] || CODES[code];
  if(!user){
    const err=document.getElementById('loginError');err.style.display='block';
    document.getElementById('loginCode').style.borderColor='#C00000';
    setTimeout(()=>{err.style.display='none';document.getElementById('loginCode').style.borderColor='';},3000);
    return;
  }
  _loginTempCode=code.toUpperCase();
  const pwds=getPwds();
  if(pwds[_loginTempCode]){
    document.getElementById('loginStep1').style.display='none';
    document.getElementById('loginStep2').style.display='block';
    document.getElementById('lt_pwdUser').textContent=user.name;
    document.getElementById('loginPwd').value='';
    setTimeout(()=>document.getElementById('loginPwd').focus(),50);
  } else {
    document.getElementById('loginStep1').style.display='none';
    document.getElementById('loginStep3').style.display='block';
    document.getElementById('loginNewPwd').value='';
    document.getElementById('loginNewPwd2').value='';
    setTimeout(()=>document.getElementById('loginNewPwd').focus(),50);
  }
}
async function doLoginStep2(){
  const pwd=document.getElementById('loginPwd').value;
  if(!pwd){document.getElementById('loginPwdError').style.display='block';return;}
  const hash=await hashPwd(pwd);
  const pwds=getPwds();
  if(pwds[_loginTempCode]!==hash){
    document.getElementById('loginPwdError').style.display='block';
    setTimeout(()=>document.getElementById('loginPwdError').style.display='none',3000);
    return;
  }
  finishLogin(_loginTempCode);
}
async function doSetFirstPassword(){
  const p1=document.getElementById('loginNewPwd').value;
  const p2=document.getElementById('loginNewPwd2').value;
  const errEl=document.getElementById('loginPwdSetError');
  if(p1.length<6){
    document.getElementById('lt_errPwdSet').textContent=_loginLang==='en'?'Min. 6 characters':'Mindestens 6 Zeichen';
    errEl.style.display='block';return;
  }
  if(p1!==p2){errEl.style.display='block';return;}
  const hash=await hashPwd(p1);
  savePwd(_loginTempCode,hash);
  showToast(_loginLang==='en'?'Password set successfully!':'\u2705 Passwort erfolgreich gesetzt!');
  finishLogin(_loginTempCode);
}
function skipPassword(){finishLogin(_loginTempCode);}
function saveProfileAndLogin(){
  logEvent('profile_save',{});
  const code=_profileLoginCode||_loginTempCode;
  if(!code) return;
  const mem=MEMBERS.find(m=>m.code===code);
  if(mem){
    const fn=document.getElementById('profileFirstName')?.value.trim();
    const ln=document.getElementById('profileLastName')?.value.trim();
    const email=document.getElementById('profileEmail')?.value.trim().toLowerCase();
    const mobile=document.getElementById('profileMobile')?.value.trim();
    if(fn) mem.firstName=fn;
    if(ln) mem.lastName=ln;
    if(fn&&ln) mem.name=fn+' '+ln;
    if(email) mem.email=email;
    if(mobile) mem.mobile=mobile;
    saveData();
  }
  document.getElementById('loginStep4').style.display='none';
  _profileLoginCode=null;
  // Save session so refresh doesn't require re-login
  if(!window._testMode && state.currentUser){
    try{ sessionStorage.setItem('venturelab_session', JSON.stringify({code:state.currentUser.code, lang:state.lang||'de'})); }catch(e){}
  }
  initApp();
}
function loginBack(){
  _loginTempCode='';
  document.getElementById('loginStep2').style.display='none';
  document.getElementById('loginStep3').style.display='none';
  if(document.getElementById('loginStep4')) document.getElementById('loginStep4').style.display='none';
  document.getElementById('loginStep1').style.display='block';
}
function finishLogin(code){
  const user=CODES[code];
  const member=MEMBERS.find(m=>m.code===code)||ADMINS.find(a=>a.code===code);
  const lang=(member&&member.lang)?member.lang:_loginLang||'de';
  state.lang=lang;
  state.currentUser={...user,code};
  logEvent('login',{role:user.role});
  if(user.role==='member'||user.memberId){
    const mem=MEMBERS.find(m=>m.id===user.memberId||m.code===code);
    if(mem&&(!mem.email||!mem.firstName)){
      // Profile completion step (test mode only in v0.9.0 – elements may not exist)
      _profileLoginCode=code;
      const _s2=document.getElementById('loginStep2'); if(_s2) _s2.style.display='none';
      const _s3=document.getElementById('loginStep3'); if(_s3) _s3.style.display='none';
      const _s4=document.getElementById('loginStep4'); if(_s4) _s4.style.display='block';
      if(mem.firstName){ const f=document.getElementById('profileFirstName'); if(f) f.value=mem.firstName; }
      if(mem.lastName){ const f=document.getElementById('profileLastName'); if(f) f.value=mem.lastName; }
      if(mem.email){ const f=document.getElementById('profileEmail'); if(f) f.value=mem.email; }
      if(mem.mobile){ const f=document.getElementById('profileMobile'); if(f) f.value=mem.mobile; }
      if(!document.getElementById('loginStep4')){ // Elements removed → skip profile step
        document.getElementById('loginScreen').style.display='none';
        document.getElementById('appShell').style.display='block';
        initApp();
      }
      return;
    }
  }
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').style.display='block';
  if(!window._testMode){
    try{
      sessionStorage.setItem('venturelab_session', JSON.stringify({
        code: code,
        lang: state.lang||'de'
      }));
    }catch(e){}
  }
  initApp();
  if(state.lang==='en') setTimeout(applyLang,150);
}

function doLogout(){
  logEvent('logout', {duration: Math.round((Date.now() - new Date(_sessionStart).getTime())/1000)+'s'});
  flushTrackBuffer(true);
  // Sofort Login-Screen zeigen (keine kurze Ladeanzeige nach Logout)
  showLoginScreen();
  // Code-User-Session löschen
  try{ sessionStorage.removeItem('venturelab_session'); }catch(e){}
  // Restore original data if exiting test mode
  if(window._testMode || window._testModeActive){
    window._testMode=false; window._testModeActive=false;
    if(window._testModeOrigData) localStorage.setItem('5euro_tracker_v5',window._testModeOrigData);
    else localStorage.removeItem('5euro_tracker_v5');
    if(window._testModeOrigPwd) localStorage.setItem('5euro_passwords',window._testModeOrigPwd);
    else localStorage.removeItem('5euro_passwords');
    window._testModeOrigData=null; window._testModeOrigPwd=null;
    _fbDataLoaded=false;
    const testBanner=document.getElementById('testModeBanner'); if(testBanner) testBanner.remove();
    loadData(); rebuildCodes();
  }
  window._testMode=false;
  state.currentUser=null; state.prevUser=null;
  const _ib=document.getElementById('impersonationBanner'); if(_ib) _ib.style.display='none';
  ['revenueChart','superChart'].forEach(k=>{if(state[k]){state[k].destroy();state[k]=null;}});
  // Sign out from Firebase Auth (session persistence cleared; onAuthStateChanged fires null → showLoginScreen)
  if(typeof firebase!=='undefined' && firebase.apps && firebase.apps.length){
    firebase.auth().signOut().catch(()=>{});
    // onAuthStateChanged will call showLoginScreen() after signOut completes
  } else {
    showLoginScreen();
  }
}

