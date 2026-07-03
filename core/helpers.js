// ════════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════════
function fmtEur(n){return n.toFixed(2).replace('.',',')+' €';}
function fmtDate(d){return new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});}
function getVisibleTeams(){
  const u=state.currentUser;
  // Always exclude pending setup-slots and teams with no name from public views
  const base=TEAMS.filter(t=>t.status!=='pending' && t.name && t.name.trim());
  if(u.role==='superadmin'){
    // When managing a specific game, scope to that game (keeps Admin panel + Teams page in sync)
    if(state.managingGameId) return base.filter(t=>t.gameId===state.managingGameId);
    return base;
  }
  const gid=u.gameId||(u.teamId?TEAMS.find(t=>t.id===u.teamId)?.gameId:null);
  return gid?base.filter(t=>t.gameId===gid):base;
}
function getMyTeam(){
  const u=state.currentUser;
  if(u.teamId) return TEAMS.find(t=>t.id===u.teamId);
  if(u.memberId){const m=MEMBERS.find(x=>x.id===u.memberId);return m?TEAMS.find(t=>t.id===m.teamId):null;}
  return null;
}
function getMyMember(){
  const u=state.currentUser;
  return u.memberId?MEMBERS.find(m=>m.id===u.memberId):null;
}
function fillCode(c){document.getElementById('loginCode').value=c;document.getElementById('loginCode').focus();}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');});
function showToast(msg,type='success'){
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px 18px;border-radius:9px;font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.2);animation:fadeIn .2s;max-width:320px;';
  t.style.background=type==='success'?'#2d7a3e':type==='error'?'#C00000':'#2E75B6';
  t.style.color='white';t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),3000);
}
function showUndoToast(msg, undoFn){
  // Remove any existing undo toast
  document.querySelectorAll('.undo-toast').forEach(x=>x.remove());
  const t=document.createElement('div');
  t.className='undo-toast';
  t.style.cssText='position:fixed;bottom:20px;right:20px;z-index:10000;padding:10px 14px;border-radius:9px;font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.3);animation:fadeIn .2s;max-width:360px;display:flex;align-items:center;gap:10px;background:#444;color:white;';
  const txt=document.createElement('span');
  txt.style.flex='1';txt.textContent=msg;
  const bar=document.createElement('div');
  bar.style.cssText='position:absolute;bottom:0;left:0;height:3px;background:#facc15;border-radius:0 0 9px 9px;transition:width linear;width:100%;';
  const btn=document.createElement('button');
  btn.textContent='↩ Rückgängig';
  btn.style.cssText='background:#facc15;color:#333;border:none;border-radius:6px;padding:4px 10px;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;';
  let cancelled=false;
  btn.onclick=()=>{ cancelled=true; t.remove(); undoFn(); showToast('↩ Wiederhergestellt','success'); };
  t.appendChild(txt);t.appendChild(btn);t.appendChild(bar);
  document.body.appendChild(t);
  // Countdown bar
  const dur=10000;
  const start=performance.now();
  function tick(){
    const elapsed=performance.now()-start;
    const pct=Math.max(0,100-(elapsed/dur*100));
    bar.style.width=pct+'%';
    if(elapsed<dur&&!cancelled) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setTimeout(()=>{ if(!cancelled) t.remove(); }, dur);
}
function countChars(el,counterId,max){
  const len=el.value.length;const c=document.getElementById(counterId);
  if(!c)return;c.textContent=len+' / '+max;
  c.className='char-counter'+(len>max?'over':len>max*0.8?' warn':'');
}

