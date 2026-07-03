// ════════════════════════════════════════════════════════════════════
//  MITGLIEDER-MANAGEMENT
// ════════════════════════════════════════════════════════════════════
function openMemberMgmt(teamId){
  state.managingTeamId = teamId;
  const team = TEAMS.find(t=>t.id===teamId);
  if(!team) return;
  document.getElementById('memberMgmtTitle').textContent = '👤 Mitglieder: '+team.name;
  // Auto-generate next member code preview
  const existingCount = MEMBERS.filter(m=>m.teamId===teamId).length;
  document.getElementById('nmCode').value = makeMemberCode(team, existingCount);
  document.getElementById('nmName').value = '';
  document.getElementById('nmRole').value = 'CEO';
  renderMemberMgmtList();
  openModal('modalMemberMgmt');
}
function mergeDuplicateMember(keepId, deleteId){
  const keep=MEMBERS.find(m=>m.id===keepId);
  const del=MEMBERS.find(m=>m.id===deleteId);
  if(!keep||!del) return showToast('Mitglied nicht gefunden','error');
  // Migrate reflexions: reassign deleteId → keepId where keepId has none for that week
  REFLECTIONS.forEach(r=>{
    if(r.memberId===deleteId){
      const alreadyHas=REFLECTIONS.find(x=>x.memberId===keepId&&x.week===r.week&&x.teamId===r.teamId);
      if(!alreadyHas) r.memberId=keepId;
    }
    if(r.mvpVote===deleteId) r.mvpVote=keepId;
  });
  // Remove any remaining reflexions still pointing to deleteId (covered by keepId now)
  const remaining=REFLECTIONS.filter(r=>r.memberId===deleteId);
  remaining.forEach(r=>{const i=REFLECTIONS.indexOf(r);if(i>=0) REFLECTIONS.splice(i,1);});
  // Deduplicate: if keepId now has two entries for same week, keep the newer one
  const seen=new Set();
  const toRemove=[];
  REFLECTIONS.forEach((r,i)=>{ if(r.memberId===keepId){const k=r.teamId+'_'+r.week; if(seen.has(k)) toRemove.push(i); else seen.add(k); }});
  for(let i=toRemove.length-1;i>=0;i--) REFLECTIONS.splice(toRemove[i],1);
  // Migrate team MVP records
  const team=TEAMS.find(t=>t.id===keep.teamId);
  if(team&&team.mvps) team.mvps.forEach(mv=>{if(mv.memberId===deleteId) mv.memberId=keepId;});
  if(team&&team.mvpOverride) Object.keys(team.mvpOverride).forEach(w=>{if(team.mvpOverride[w]===deleteId) team.mvpOverride[w]=keepId;});
  // Remove duplicate member
  // Migrate email: copy from deleted to kept if kept has none
  if(!keep.email && del.email) keep.email = del.email;
  // Migrate password hash: copy from deleted code to kept code if kept has no password
  if(del.code && keep.code && PASSWORDS){
    if(!PASSWORDS[keep.code] && PASSWORDS[del.code]){
      PASSWORDS[keep.code] = PASSWORDS[del.code];
    }
    delete PASSWORDS[del.code]; // Remove orphaned password entry
  }
  const idx=MEMBERS.findIndex(m=>m.id===deleteId);
  if(idx>=0) MEMBERS.splice(idx,1);
  rebuildCodes(); saveData();
  renderMemberMgmtList();
  if(state.currentPage==='admin') renderAdminTeamsTable();
  showToast('✅ Zusammengeführt: '+del.name+' (Duplikat entfernt, Daten übertragen)','success');
  logEvent('🔀 Mitglied-Duplikat zusammengeführt: '+del.name+' ('+deleteId+') → '+keepId);
}
function renderMemberMgmtList(){
  const teamId = state.managingTeamId;
  const members = MEMBERS.filter(m=>m.teamId===teamId);
  const el = document.getElementById('memberMgmtList');
  const hasCeo = members.some(m=>m.role==='CEO');
  if(members.length===0){
    el.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">👤</div><h3>Noch keine Mitglieder</h3><p style="color:var(--red);font-weight:600;">⚠️ Bitte CEO zuerst hinzufügen!</p></div>';
    return;
  }
  // Detect duplicate names
  const dupeNames=members.filter(m=>members.filter(x=>x.name===m.name).length>1).map(m=>m.name);
  const uniqueDupeNames=[...new Set(dupeNames)];
  const dupeWarning=uniqueDupeNames.length>0?uniqueDupeNames.map(name=>{
    const pair=members.filter(m=>m.name===name);
    // Prefer to keep the one with more reflexions; else prefer the one with login data
    const refCounts=pair.map(m=>REFLECTIONS.filter(r=>r.memberId===m.id).length);
    const keepIdx=refCounts[0]>=refCounts[1]?0:1;
    const deleteIdx=keepIdx===0?1:0;
    const keepM=pair[keepIdx]; const delM=pair[deleteIdx];
    return `<div class="info-box" style="background:#FFF3CD;border-left:3px solid var(--orange);margin-bottom:8px;">
      <span class="info-box-icon">⚠️</span>
      <div>
        <strong>Duplikat erkannt: ${name}</strong> – zwei Einträge mit gleichem Namen.<br>
        <span style="font-size:11px;color:var(--gray-dark);">Behalten: <strong>${keepM.name}</strong> (${keepM.role} · Code: ${keepM.code} · ${refCounts[keepIdx]} Reflexionen) &nbsp;|&nbsp; Löschen: ${delM.name} (${delM.role} · Code: ${delM.code} · ${refCounts[deleteIdx]} Reflexionen)</span><br>
        <button class="btn btn-warning btn-sm" style="margin-top:6px;" onclick="if(confirm('Duplikat zusammenführen? ${delM.name} (${delM.code}) wird gelöscht, Daten auf ${keepM.code} übertragen.')) mergeDuplicateMember('${keepM.id}','${delM.id}')">🔀 Duplikat zusammenführen</button>
      </div>
    </div>`;
  }).join(''):'';
  const usedRoles=members.map(m=>m.role);
  el.innerHTML=`
    ${dupeWarning}
    ${!hasCeo?'<div class="info-box" style="background:#FFF3CD;border-left:3px solid var(--orange);margin-bottom:10px;"><span class="info-box-icon">⚠️</span>Kein CEO definiert! Bitte einen CEO zuweisen.</div>':''}
    <table class="data-table" style="width:100%;margin-bottom:16px;">
    <thead><tr><th>Name</th><th>Rolle</th><th>Code</th><th style="text-align:right;">Aktion</th></tr></thead>
    <tbody id="memberMgmtRows">${members.map(m=>`<tr id="mrow_${m.id}">
      <td><strong>${m.name}</strong></td>
      <td><span class="tag" style="${m.role==='CEO'?'background:#FFF3CD;color:#856404;font-weight:700;':m.role==='CFO'?'background:#E8F5E9;color:#2E7D32;font-weight:700;':'background:var(--blue-xlt);color:var(--blue-dark);'}"
          >${m.role==='CEO'?'👑 CEO':m.role==='CFO'?'💰 CFO':m.role}</span></td>
      <td><code style="font-size:11px;background:var(--blue-xlt);padding:2px 8px;border-radius:4px;font-weight:700;">${m.code}</code>
          <button class="btn btn-xs btn-outline" onclick="copyCode('${m.code}')" style="margin-left:4px;" title="Kopieren">📋</button></td>
      <td style="text-align:right;">
        <button class="btn btn-outline btn-xs" onclick="openEditMember('${m.id}')" title="Bearbeiten">✏️</button>
        <button class="btn btn-xs" style="margin-left:3px;background:#FEF9EC;color:#92400E;border:1px solid #F59E0B;" onclick="resetMemberPassword('${m.code}')" title="Passwort zurücksetzen">🔑</button>
        <button class="btn btn-danger btn-xs" onclick="deleteMemberFromTeam('${m.id}')" title="Entfernen" style="margin-left:3px;">🗑️</button>
      </td>
    </tr>`).join('')}</tbody>
  </table>
  <div id="editMemberInline" style="display:none;background:var(--bg-light);border-radius:var(--radius);padding:14px;margin-bottom:12px;border:1.5px solid var(--blue-light);">
    <div style="font-weight:700;margin-bottom:10px;color:var(--blue-dark);">✏️ Mitglied bearbeiten</div>
    <input type="hidden" id="editMemberId">
    <div class="form-row">
      <div class="form-group"><label class="form-label">Name</label>
        <input class="form-control" id="editMemberName" placeholder="Vorname Nachname"></div>
      <div class="form-group"><label class="form-label">Rolle</label>
        <select class="form-control" id="editMemberRole" onchange="checkEditRoleAvail(this.value)">
          <option>CEO</option><option>CFO</option><option>CMO</option>
          <option>COO</option><option>CTO</option><option>Gründer</option><option>Mitglied</option>
        </select>
        <div id="editRoleWarn" style="font-size:11px;color:var(--red);margin-top:3px;display:none;">
          ⚠️ Diese Rolle ist bereits vergeben. Wird jetzt übertragen (alter Inhaber wird zu "Mitglied").
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary btn-sm" onclick="saveEditMember()">✅ Speichern</button>
      <button class="btn btn-secondary btn-sm" onclick="closeEditMember()">✗ Abbrechen</button>
    </div>
  </div>`;
}
function addMemberToTeam(){
  const teamId = state.managingTeamId;
  const team = TEAMS.find(t=>t.id===teamId);
  const name = document.getElementById('nmName').value.trim();
  if(!name){showToast('Bitte Name eingeben','error');return;}
  const role = document.getElementById('nmRole').value;
  logEvent('admin_member_add', {teamId, role, name});
  // Role uniqueness check
  if(getRoleTaken(teamId,role,null)){
    showToast(`Rolle "${role}" ist bereits vergeben. Bitte zuerst die bestehende Rolle ändern.`,'error');
    return;
  }
  const existingCount = MEMBERS.filter(m=>m.teamId===teamId).length;
  const code = makeMemberCode(team, existingCount);
  const memberId = nextId(MEMBERS,'mb');
  // Split name into firstName/lastName for contact page and profile display
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0]||'';
  const lastName = nameParts.slice(1).join(' ')||'';
  const email = (document.getElementById('nmEmail')?.value||'').trim().toLowerCase();
  MEMBERS.push({id:memberId, teamId, name, firstName, lastName, role, title:role, bio:'', code, avatarDataUrl:null, email, mobile:'', notif:{blog:true,week:true,reflect:true}, lang:'de'});
  rebuildCodes(); saveData();
  showToast('✅ '+name+' hinzugefügt – Code: '+code);
  document.getElementById('nmName').value='';
  const nmEmail=document.getElementById('nmEmail');if(nmEmail) nmEmail.value='';
  const newCount = MEMBERS.filter(m=>m.teamId===teamId).length;
  document.getElementById('nmCode').value = makeMemberCode(team, newCount);
  renderMemberMgmtList();
  if(state.currentPage==='admin') renderAdminTeamsTable();
}
function deleteMemberFromTeam(memberId){
  const m = MEMBERS.find(x=>x.id===memberId);
  if(!m) return;
  if(!confirm('Mitglied "'+m.name+'" wirklich entfernen?')) return;
  const snapshot = JSON.parse(JSON.stringify(m));
  const idx = MEMBERS.indexOf(m); if(idx>=0) MEMBERS.splice(idx,1);
  // Store in soft-delete bin
  if(DELETED_ITEMS.length>=100) DELETED_ITEMS.shift();
  DELETED_ITEMS.push({id:'del_'+Date.now(),type:'member',deletedAt:new Date().toISOString(),label:snapshot.name+' ('+snapshot.role+', '+(TEAMS.find(t=>t.id===snapshot.teamId)?.name||snapshot.teamId)+')',data:snapshot});
  rebuildCodes(); saveData();
  showUndoToast('🗑️ '+snapshot.name+' entfernt', ()=>{
    MEMBERS.push(snapshot);
    DELETED_ITEMS.splice(DELETED_ITEMS.findIndex(d=>d.data.id===snapshot.id),1);
    rebuildCodes(); saveData();
    renderMemberMgmtList();
    logEvent('↩ Mitglied wiederhergestellt: '+snapshot.name);
  });
  logEvent('🗑️ Mitglied gelöscht: '+snapshot.name+' ('+snapshot.role+')');
  renderMemberMgmtList();
}
function resetMemberPassword(code){
  const m=MEMBERS.find(x=>x.code===code)||ADMINS.find(a=>a.code===code);
  const name=m?m.name:code;
  if(!confirm('Passwort von "'+name+'" zurücksetzen?\nBeim nächsten Login wird ein neues Passwort verlangt.')) return;
  delete PASSWORDS[code];
  saveData();
  showToast('🔑 Passwort von '+name+' zurückgesetzt – neue Vergabe beim nächsten Login','success');
  if(document.getElementById('codesPanel')) renderCodesPanel();
}
function activatePendingTeamAdmin(teamId){
  const team=TEAMS.find(t=>t.id===teamId&&t.status==='pending');
  if(!team){showToast('Team nicht gefunden','error');return;}
  const tname=prompt('Team-Name für diesen Slot eingeben:','');
  if(!tname||!tname.trim()){showToast('Kein Name eingegeben','error');return;}
  const tbiz=prompt('Unternehmensidee (kurz):','');
  team.name=tname.trim();
  team.biz=(tbiz||'').trim();
  team.logo='🚀';
  team.code=makeUniqueTeamCode(tname.trim());
  team.status='active';
  rebuildCodes(); saveData();
  showToast('✅ Team "'+team.name+'" aktiviert – Einladungscode: '+team.code,'success');
  renderCodesPanel();
  if(state.currentPage==='admin') renderAdminTeamsTable();
}
function deleteTeam(teamId){
  const team = TEAMS.find(t=>t.id===teamId);
  if(!team) return;
  if(!confirm('Team "'+team.name+'" und alle zugehörigen Mitglieder wirklich löschen?')) return;
  const teamSnap = JSON.parse(JSON.stringify(team));
  const memberSnaps = MEMBERS.filter(m=>m.teamId===teamId).map(m=>JSON.parse(JSON.stringify(m)));
  const idx = TEAMS.indexOf(team); if(idx>=0) TEAMS.splice(idx,1);
  memberSnaps.forEach(ms=>{ const i=MEMBERS.findIndex(m=>m.id===ms.id); if(i>=0) MEMBERS.splice(i,1); });
  const game = GAMES.find(g=>g.id===teamSnap.gameId);
  if(game) game.teamCount = TEAMS.filter(t=>t.gameId===game.id).length;
  // Store in soft-delete bin
  if(DELETED_ITEMS.length>=100) DELETED_ITEMS.shift();
  DELETED_ITEMS.push({id:'del_'+Date.now(),type:'team',deletedAt:new Date().toISOString(),label:'Team: '+teamSnap.name+' ('+memberSnaps.length+' Mitglieder)',data:{team:teamSnap,members:memberSnaps}});
  rebuildCodes(); saveData();
  showUndoToast('🗑️ Team "'+teamSnap.name+'" gelöscht', ()=>{
    TEAMS.push(teamSnap);
    memberSnaps.forEach(ms=>MEMBERS.push(ms));
    DELETED_ITEMS.splice(DELETED_ITEMS.findIndex(d=>d.data.team&&d.data.team.id===teamSnap.id),1);
    const g2=GAMES.find(g=>g.id===teamSnap.gameId);
    if(g2) g2.teamCount=TEAMS.filter(t=>t.gameId===g2.id).length;
    rebuildCodes(); saveData();
    renderAdminPage();
    logEvent('↩ Team wiederhergestellt: '+teamSnap.name);
  });
  logEvent('🗑️ Team gelöscht: '+teamSnap.name+' ('+memberSnaps.length+' Mitglieder)');
  renderAdminPage();
}

function deletePendingSlot(teamId){
  const slot = TEAMS.find(t=>t.id===teamId&&t.status==='pending');
  if(!slot) return;
  if(!confirm('Team-Slot "'+slot.setupCode+'" löschen? Er kann danach nicht mehr für den Erstzugang genutzt werden.')) return;
  const idx = TEAMS.indexOf(slot); if(idx>=0) TEAMS.splice(idx,1);
  rebuildCodes(); saveData();
  showToast('🗑️ Slot '+slot.setupCode+' gelöscht','info');
  renderAdminPage();
}

