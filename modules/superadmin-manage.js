// ════════════════════════════════════════════════════════════════════
//  SUPERADMIN: Spiel verwalten, Profil, Ernennung
// ════════════════════════════════════════════════════════════════════
function manageGameAsSuperAdmin(gameId){
  state.managingGameId = gameId;
  // Persist managingGameId in session so it survives page refresh
  try{
    const saved = sessionStorage.getItem('venturelab_session');
    if(saved){
      const d = JSON.parse(saved);
      d.managingGameId = gameId;
      sessionStorage.setItem('venturelab_session', JSON.stringify(d));
    }
  }catch(e){}
  navigateTo('admin');
}
function impersonateAdmin(adminCode){
  const entry=CODES[adminCode];
  if(!entry||entry.role!=='admin'){showToast('Admin-Code nicht gefunden','error');return;}
  // Save superadmin context for return
  state.prevUser=state.currentUser;
  state.currentUser={...entry, code:adminCode};
  state.managingGameId=null;
  buildNavigation();updateTopbar();
  navigateTo('admin');
  showToast('Angemeldet als '+entry.name+' (Admin) — "Zurueck zu Super" zum Wechseln','info');
}
function returnToSuperAdminFromImpersonation(){
  if(state.prevUser){
    state.currentUser=state.prevUser;
    state.prevUser=null;
    buildNavigation();updateTopbar();
    navigateTo('superadmin');
    showToast('Zurueck als Superadmin','success');
  }
}
// v0.8.5: Member impersonation for admin
function renderUserViewPanel(){
  const sel=document.getElementById('impersonateSelect');
  if(!sel) return;
  const adminGameId=state.currentUser.gameId;
  // Members don't store gameId directly — resolve via their team
  const gameMembers=MEMBERS.filter(m=>{
    if(m.gameId===adminGameId) return true; // direct match if field exists
    const t=TEAMS.find(tt=>tt.id===m.teamId);
    return t&&t.gameId===adminGameId;
  });
  const currentVal=sel.value;
  sel.innerHTML='<option value="">— Mitglied auswählen —</option>';
  // Group by team for readability
  const teamsSorted=[...new Set(gameMembers.map(m=>m.teamId))];
  teamsSorted.forEach(teamId=>{
    const team=TEAMS.find(t=>t.id===teamId);
    const grp=document.createElement('optgroup');
    grp.label=(team?team.logo+' '+team.name:'kein Team');
    gameMembers.filter(m=>m.teamId===teamId).forEach(m=>{
      const opt=document.createElement('option');
      opt.value=m.id;
      opt.textContent=(m.name||m.id)+' ('+( m.role||'member')+')';
      grp.appendChild(opt);
    });
    sel.appendChild(grp);
  });
  if(currentVal) sel.value=currentVal;
  const info=document.getElementById('userViewInfo');
  if(info) info.textContent=gameMembers.length+' Mitglieder in '+teamsSorted.length+' Teams geladen.';
}
function startMemberImpersonation(){
  const sel=document.getElementById('impersonateSelect');
  if(!sel||!sel.value){showToast('Bitte ein Mitglied auswählen','error');return;}
  const member=MEMBERS.find(m=>m.id===sel.value);
  if(!member){showToast('Mitglied nicht gefunden','error');return;}
  state.prevUser=state.currentUser;
  // Derive the member's gameId from their team, fallback to admin's gameId
  const memberTeam=TEAMS.find(t=>t.id===member.teamId);
  const memberGameId=memberTeam?.gameId||member.gameId||state.currentUser.gameId;
  // Build a minimal user object that looks like a logged-in member
  state.currentUser={
    ...state.currentUser,
    name: member.name||member.id,
    memberId: member.id,
    role: 'member',
    teamId: member.teamId,
    gameId: memberGameId,
    _impersonating: true,
    _impersonatingName: member.name||member.id,
  };
  // Show impersonation banner
  const banner=document.getElementById('impersonationBanner');
  const nameEl=document.getElementById('impersonationName');
  if(banner){banner.style.display='flex';}
  if(nameEl){nameEl.textContent=(member.name||member.id);}
  buildNavigation();updateTopbar();
  navigateTo('myteam');
  showToast('👁️ Vorschau als '+( member.name||member.id)+'  — "Vorschau beenden" zum Zurückkehren','info');
}
function exitMemberImpersonation(){
  if(!state.prevUser) return;
  state.currentUser=state.prevUser;
  state.prevUser=null;
  const banner=document.getElementById('impersonationBanner');
  if(banner) banner.style.display='none';
  buildNavigation();updateTopbar();
  navigateTo('admin');
  showToast('Admin-Ansicht wiederhergestellt','success');
}
function backToSuperAdmin(){
  state.managingGameId = null;
  navigateTo('superadmin');
}
function makeSuperCode(){
  const r=()=>Math.random().toString(36).substring(2,4).toUpperCase();
  return 'SUPER-'+r()+r();
}
function openSuperProfileEdit(){
  const u=state.currentUser;
  document.getElementById('espName').value = u.name||'';
  document.getElementById('espEmail').value = u.email||'';
  document.getElementById('espCode').value = u.code||'SUPER-NEUSS';
  openModal('modalEditSuperProfile');
}
function openEditSuperProfile(){
  const u = state.currentUser;
  const el = n => document.getElementById(n);
  if(el('espName'))  el('espName').value  = u.name  || '';
  if(el('espEmail')) el('espEmail').value = u.email || '';
  if(el('espPhone')) el('espPhone').value = u.phone || '';
  if(el('espOffice')) el('espOffice').value = u.office || '';
  if(el('espCode'))  el('espCode').value  = u.code  || 'SUPER-NEUSS';
  openModal('modalEditSuperProfile');
}

function saveSuperProfile(){
  const name    = document.getElementById('espName').value.trim();
  const email   = document.getElementById('espEmail').value.trim();
  const phone   = document.getElementById('espPhone')?.value.trim()||'';
  const office  = document.getElementById('espOffice')?.value.trim()||'';
  const newCode = document.getElementById('espCode').value.trim().toUpperCase()||'SUPER-NEUSS';
  if(!name){showToast('Bitte Name eingeben','error');return;}
  const oldCode = state.currentUser.code;
  // Update CODES
  delete CODES[oldCode];
  CODES[newCode] = {role:'superadmin', name, email, label:'Superadmin'};
  if(newCode==='SUPER-NEUSS'){
    CODES['SUPER-NEUSS'] = {role:'superadmin', name, email, label:'Superadmin'};
  }
  state.currentUser.name  = name;
  state.currentUser.email = email;
  state.currentUser.phone = phone;
  state.currentUser.office = office;
  state.currentUser.code  = newCode;
  // Also update SUPERADMINS record if present
  const saRec=SUPERADMINS.find(s=>s.code===oldCode||s.code===newCode);
  if(saRec){saRec.name=name;saRec.email=email;saRec.phone=phone;saRec.office=office;saRec.code=newCode;}
  // Persist: localStorage (fallback) + PASSWORDS dict (→ Firebase sync)
  localStorage.setItem('5euro_superprofile', JSON.stringify({name, email, phone, office}));
  PASSWORDS['__sp_name']  = name;
  PASSWORDS['__sp_email'] = email;
  saveData();
  closeModal('modalEditSuperProfile');
  showToast('✅ Profil gespeichert: '+name);
  renderSuperPage();
  const badge = document.getElementById('roleBadge');
  if(badge) badge.innerHTML='👑 '+name+' · Superadmin';
}
function createSuperAdmin(){
  const name = document.getElementById('nsaName').value.trim();
  const email = document.getElementById('nsaEmail').value.trim();
  const code = document.getElementById('nsaCode').value.trim().toUpperCase()||makeSuperCode();
  if(!name){showToast('Bitte Name angeben','error');return;}
  if(CODES[code]){showToast('Code bereits vergeben','error');return;}
  const saId = nextId(SUPERADMINS,'sa');
  SUPERADMINS.push({id:saId, name, email, code});
  rebuildCodes(); saveData();
  closeModal('modalNewSuperAdmin');
  showToast('👑 Superadmin "'+name+'" ernannt – Code: '+code);
  renderSuperPage();
}
function renderSuperAdminList(){
  const el = document.getElementById('superAdminListRows');
  if(!el) return;
  const _mainSa = CODES['SUPER-NEUSS']||{};
  const rows = [{name:_mainSa.name||'Dr. Christian Neusser', email:_mainSa.email||'christian.neusser@me.com', code:'SUPER-NEUSS', builtin:true}, ...SUPERADMINS];
  el.innerHTML = rows.map(sa => `<div class="admin-list-row">
    <div><strong>👑 ${sa.name}</strong><div style="font-size:10px;color:var(--gray-mid);">${sa.email||''}</div></div>
    <div><span style="font-size:11px;color:var(--gray-mid);">${sa.builtin?'Haupt-Superadmin':'Ernannt'}</span></div>
    <div style="font-size:11px;color:var(--gray-mid);">Alle Spiele</div>
    <div><span class="blog-status status-approved">✅</span></div>
    <div style="display:flex;gap:3px;">
      <button class="btn btn-outline btn-xs" onclick="showToast('Code: ${sa.code}','info')">🔑</button>
      ${!sa.builtin ? `<button class="btn btn-danger btn-xs" onclick="removeSuperAdmin('${sa.id}')">🗑️</button>` : ''}
    </div>
  </div>`).join('');
}
function removeSuperAdmin(id){
  if(!confirm('Superadmin wirklich entfernen?')) return;
  const idx = SUPERADMINS.findIndex(sa=>sa.id===id);
  if(idx>=0) SUPERADMINS.splice(idx,1);
  rebuildCodes(); saveData();
  renderSuperPage();
  showToast('Superadmin entfernt');
}

function editUniversity(uniId){
  const u=UNIVERSITIES.find(x=>x.id===uniId);if(!u)return;
  const newName=prompt('Name der Hochschule:',u.name||'');
  if(newName===null) return;
  if(!newName.trim()){showToast('Name darf nicht leer sein','error');return;}
  const newShort=prompt('Kürzel (z.B. HFP):',u.slug||u.short||'');
  if(newShort===null) return;
  const newCity=prompt('Stadt:',u.city||'');
  if(newCity===null) return;
  u.name=newName.trim();
  u.slug=newShort.trim()||u.slug;
  u.short=u.slug;
  u.city=newCity.trim();
  saveData();
  renderSuperPage();
  showToast('Hochschule aktualisiert','success');
}
function deleteUniversity(uniId){
  const u=UNIVERSITIES.find(x=>x.id===uniId);if(!u)return;
  const linkedAdmins=ADMINS.filter(a=>a.uni===u.name||a.uniId===uniId).length;
  const linkedGames=GAMES.filter(g=>g.universityId===uniId||g.uni===u.slug).length;
  if(linkedAdmins>0||linkedGames>0){
    showToast('Hochschule kann nicht gelöscht werden: '+linkedAdmins+' Admin(s) / '+linkedGames+' Spiel(e) verknüpft','error');
    return;
  }
  if(!confirm('Hochschule "'+u.name+'" wirklich löschen?')) return;
  const idx=UNIVERSITIES.findIndex(x=>x.id===uniId);
  if(idx>=0) UNIVERSITIES.splice(idx,1);
  saveData();
  renderSuperPage();
  showToast('Hochschule gelöscht');
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
async function sendNotification(type, teamId, extra){
  const team=TEAMS.find(t=>t.id===teamId);if(!team)return;
  const members=MEMBERS.filter(m=>m.teamId===teamId&&m.email);
  if(!members.length)return;
  const game=GAMES.find(g=>g.id===team.gameId);
  const subjects={
    blog:  {de:'✅ Wochenbericht freigegeben – Woche '+(extra||''),       en:'✅ Weekly report approved – Week '+(extra||'')},
    week:  {de:'🚀 Neue Woche '+(extra||'')+' startet – '+team.name,     en:'🚀 New week '+(extra||'')+' starts – '+team.name},
    reflect:{de:'📝 Reflexion noch ausstehend – bis Samstag 23:59',       en:'📝 Reflection pending – due Saturday 23:59'}
  };
  const bodies={
    blog:  {de:`Hallo Team ${team.name},\n\neuer Wochenbericht für Woche ${extra} wurde freigegeben. Ihr seid jetzt in der nächsten Woche.\n\nBei Fragen: ${CONFIG.ADMIN_EMAIL}`,
            en:`Hi Team ${team.name},\n\nYour weekly report for week ${extra} has been approved. You are now in the next week.\n\nQuestions: ${CONFIG.ADMIN_EMAIL}`},
    week:  {de:`Hallo Team ${team.name},\n\nWoche ${extra} hat begonnen. Erfasst eure Buchungen und reicht bis Sonntag 23:59 den Wochenbericht ein.\n\nErreichbar unter: ${CONFIG.ADMIN_EMAIL}`,
            en:`Hi Team ${team.name},\n\nWeek ${extra} has started. Record your transactions and submit your weekly report by Sunday 23:59.\n\nContact: ${CONFIG.ADMIN_EMAIL}`},
    reflect:{de:`Hallo,\n\nerinnerung: bitte heute noch deine Reflexion für ${team.name} einreichen (Deadline: Samstag 23:59).\n\nZugangscode: [dein Code]\nSpiel: ${game?.name||''}`,
             en:`Hi,\n\nreminder: please submit your reflection for ${team.name} today (deadline: Saturday 23:59).\n\nAccess code: [your code]\nGame: ${game?.name||''}`}
  };
  for(const member of members){
    const notifKey=type;
    if(!member.notif||member.notif[notifKey]===false) continue;
    const lang=member.lang||'de';
    const subj=subjects[type][lang];
    const body=bodies[type][lang];
    try{
      await fetch(CONFIG.FEEDBACK_ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({type:'notification',to:member.email,subject:subj,message:body,sender:member.name,team:team.name,game:game?.name||''})
      });
    }catch(e){console.warn('Notification failed',e);}
  }
}

// ── CEO / ADMIN TEAM MANAGEMENT ─────────────────────────────────────────────
function renderCeoManagement(){
  const team=getMyTeam();if(!team)return;
  const el=document.getElementById('ceoMgmtSection');if(!el)return;
  const members=MEMBERS.filter(m=>m.teamId===team.id);
  const game=GAMES.find(g=>g.id===team.gameId);
  const maxSize=game?.teamSize||4;
  const lng=state.lang==='en';
  const hasCeoMbr=members.some(m=>m.role==='CEO');
  el.innerHTML=`
    <div class="section-header">
      <div class="section-title">&#128081; ${lng?'Team Management':'Team-Verwaltung'}</div>
      <button class="btn btn-primary btn-sm" onclick="openAddMemberModal('${team.id}')">+ ${lng?'Add Member':'Mitglied hinzufügen'}</button>
      ${members.length>=maxSize?`<span style="font-size:11px;color:var(--orange);margin-left:8px;">⚠️ ${lng?'Above recommended size ('+maxSize+')':'Über empfohlener Größe ('+maxSize+')'}</span>`:''}
    </div>
    ${!hasCeoMbr?`<div class="info-box" style="background:#FFF3CD;border-left:3px solid var(--orange);margin-bottom:10px;"><span class="info-box-icon">⚠️</span>${lng?'No CEO assigned! Please assign a CEO.':'Kein CEO vergeben! Bitte einen CEO zuweisen.'}</div>`:''}
    <div class="info-box blue" style="margin-bottom:14px;font-size:12px;">
      <span class="info-box-icon">ℹ️</span>
      <strong>CEO</strong> ${lng?'submits weekly report':'reicht Wochenbericht ein'} &nbsp;·&nbsp;
      <strong>CFO</strong> ${lng?'records all bookings':'erfasst alle Buchungen'}
    </div>
    <div class="info-box gold" style="margin-bottom:14px;">
      <span class="info-box-icon">&#128274;</span>${lng?'Access codes are shown here. Share them only with the respective team members.':'Zugangscodes werden hier angezeigt. Teile sie nur mit den jeweiligen Teammitgliedern.'}
    </div>
    <div class="data-table-wrap">
      <div class="admin-list-row header"><div>${lng?'Name':'Name'}</div><div>${lng?'Role':'Rolle'}</div><div>${lng?'Email':'E-Mail'}</div><div>${lng?'Access Code':'Zugangscode'}</div><div>${lng?'Actions':'Aktionen'}</div></div>
      ${members.map(m=>`<div class="admin-list-row">
        <div><strong>${m.name}</strong>${m.role==='CEO'?` <span class="tag tag-gold" style="font-size:9px;">CEO</span>`:''}</div>
        <div><span style="font-size:12px;">${m.role}</span></div>
        <div style="font-size:11px;color:var(--gray-mid);">${m.email||`<em>${lng?'not set':'nicht hinterlegt'}</em>`}</div>
        <div><code style="font-size:11px;background:var(--bg-light);padding:2px 6px;border-radius:4px;">${m.code}</code></div>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-outline btn-xs" onclick="copyCeoCode('${m.code}')" title="${lng?'Copy code':'Code kopieren'}">&#128203;</button>
          <button class="btn btn-outline btn-xs" onclick="editMemberFromCeo('${m.id}')" title="${lng?'Edit':'Bearbeiten'}">&#9998;</button>
          ${m.role!=='CEO'?`<button class="btn btn-danger btn-xs" onclick="removeMemberFromCeo('${m.id}')" title="${lng?'Remove':'Entfernen'}">&#128465;</button>`:''}
        </div>
      </div>`).join('')}
    </div>
    <div id="ceoEditArea" style="display:none;background:var(--bg-light);border-radius:var(--radius);padding:14px;margin-top:14px;border:1.5px solid var(--blue-light);"></div>`;
}
function copyCeoCode(code){
  navigator.clipboard?.writeText(code).then(()=>showToast((state.lang==='en'?'Code copied: ':'Code kopiert: ')+code,'info'));
}
function openAddMemberModal(teamId){
  // Delegate to the working admin member management modal
  openMemberMgmt(teamId);
}
function editMemberFromCeo(memberId){
  // Use the same edit form as admin (set managingTeamId to current team)
  const team=getMyTeam();if(!team)return;
  state.managingTeamId=team.id;
  // If admin modal is not open, open inline edit in CEO panel
  openEditMemberCeoPanel(memberId);
}
function openEditMemberCeoPanel(memberId){
  const m=MEMBERS.find(x=>x.id===memberId);if(!m)return;
  const lng=state.lang==='en';
  const team=getMyTeam();if(!team)return;
  const members=MEMBERS.filter(x=>x.teamId===team.id);
  // Build an edit form in the CEO mgmt section
  const editArea=document.getElementById('ceoEditArea');
  if(!editArea)return;
  const roles=['CEO','CFO','CMO','COO','CTO','Gründer','Mitglied'];
  editArea.style.display='block';
  editArea.innerHTML=`
    <div style="font-weight:700;margin-bottom:10px;color:var(--blue-dark);">✏️ ${lng?'Edit Member':'Mitglied bearbeiten'}: ${m.name}</div>
    <input type="hidden" id="ceoeditId" value="${m.id}">
    <div class="form-row">
      <div class="form-group"><label class="form-label">${lng?'Name':'Name'}</label>
        <input class="form-control" id="ceoeditName" value="${m.name}"></div>
      <div class="form-group"><label class="form-label">${lng?'Role':'Rolle'}</label>
        <select class="form-control" id="ceoeditRole" onchange="checkCeoEditRole(this.value,'${m.id}')">
          ${roles.map(r=>`<option ${m.role===r?'selected':''}>${r}</option>`).join('')}
        </select>
        <div id="ceoeditRoleWarn" style="font-size:11px;color:var(--orange);margin-top:3px;display:none;">
          ⚠️ ${lng?'This role is already taken. The current holder will become "Mitglied".':'Rolle bereits vergeben. Bisheriger Inhaber wird zu "Mitglied".'}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary btn-sm" onclick="saveCeoEditMember()">✅ ${lng?'Save':'Speichern'}</button>
      <button class="btn btn-secondary btn-sm" onclick="document.getElementById('ceoEditArea').style.display='none'">✗ ${lng?'Cancel':'Abbrechen'}</button>
    </div>`;
  editArea.scrollIntoView({behavior:'smooth',block:'center'});
}
function checkCeoEditRole(role,excludeId){
  const team=getMyTeam();if(!team)return;
  const taken=getRoleTaken(team.id,role,excludeId);
  const w=document.getElementById('ceoeditRoleWarn');
  if(w) w.style.display=taken?'block':'none';
}
function saveCeoEditMember(){
  const id=document.getElementById('ceoeditId').value;
  const m=MEMBERS.find(x=>x.id===id);if(!m)return;
  const newName=document.getElementById('ceoeditName').value.trim();
  const newRole=document.getElementById('ceoeditRole').value;
  if(!newName){showToast('Name darf nicht leer sein','error');return;}
  const team=getMyTeam();if(!team)return;
  // Role transfer
  if(UNIQUE_ROLES.includes(newRole)&&newRole!==m.role){
    const oldHolder=MEMBERS.find(x=>x.teamId===team.id&&x.role===newRole&&x.id!==id);
    if(oldHolder){oldHolder.role='Mitglied';showToast(`ℹ️ ${oldHolder.name} → Mitglied`,'info');}
  }
  m.name=newName;m.role=newRole;
  rebuildCodes();saveData();
  document.getElementById('ceoEditArea').style.display='none';
  renderCeoManagement();renderMembersSection(team);
  showToast(`✅ ${m.name} (${newRole}) ${state.lang==='en'?'updated':'aktualisiert'}`);
}
function removeMemberFromCeo(memberId){
  const m=MEMBERS.find(x=>x.id===memberId);if(!m)return;
  const lng=state.lang==='en';
  if(!confirm((lng?'Remove ':'Mitglied ')+m.name+(lng?' from the team?':' aus dem Team entfernen?'))) return;
  const idx=MEMBERS.indexOf(m);
  MEMBERS.splice(idx,1);
  rebuildCodes();saveData();
  renderCeoManagement();renderMembersSection(getMyTeam());
  showToast(lng?m.name+' removed.':m.name+' entfernt.');
}

// ── FAQ DOCS ──────────────────────────────────────────────────────────────────
function renderFaqDocs(container){
  if(FAQ_DOCS.length===0 && state.currentUser?.role!=='superadmin') return;
  const lng=state.lang==='en';
  const docTypeLabels={
    instructions:{de:'Spielanleitung',en:'Game Instructions',icon:'📘'},
    howto:{de:'How to Play',en:'How to Play',icon:'🎯'},
    template:{de:'Vorlage',en:'Template',icon:'📄'},
    other:{de:'Dokument',en:'Document',icon:'📎'}
  };
  let html2=`<div class="section-header" style="margin-top:28px;">
    <div class="section-title">&#128196; ${lng?'Documents & Guides':'Dokumente &amp; Anleitungen'}</div>
    ${state.currentUser?.role==='superadmin'?`<button class="btn btn-purple btn-sm" onclick="openModal('modalUploadDoc')">+ ${lng?'Add Document':'Dokument hinzufügen'}</button>`:''}
  </div>`;
  if(FAQ_DOCS.length===0){
    html2+=`<div class="empty-state" style="padding:20px;"><div class="empty-icon">📄</div><p>${lng?'No documents yet. Add game instructions or how-to guides here.':'Noch keine Dokumente. Füge hier Spielanleitung oder How-to-Guides hinzu.'}</p></div>`;
  } else {
    html2+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">`;
    FAQ_DOCS.forEach(doc=>{
      const t=docTypeLabels[doc.type]||docTypeLabels.other;
      html2+=`<div class="card">
        <div class="card-body" style="display:flex;gap:12px;align-items:flex-start;">
          <div style="font-size:32px;line-height:1;">${t.icon}</div>
          <div style="flex:1;">
            <div style="font-weight:700;color:var(--blue-dark);margin-bottom:3px;">${doc.title}</div>
            <div style="font-size:11px;color:var(--gray-mid);margin-bottom:8px;">${doc.desc||t[lng?'en':'de']}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${doc.url?`<a href="${doc.url}" target="_blank" class="btn btn-primary btn-xs">&#128196; ${lng?'Open':'Öffnen'}</a>`:''}
              <button class="btn btn-primary btn-xs" onclick="openPdfDoc('${doc.id}')">&#128196; ${lng?'View':'Anzeigen'}</button>
              ${state.currentUser?.role==='superadmin'?`<button class="btn btn-danger btn-xs" onclick="removeFaqDoc('${doc.id}')">&#128465;</button>`:''}
            </div>
          </div>
        </div>
      </div>`;
    });
    html2+=`</div>`;
  }
  container.insertAdjacentHTML('afterbegin', html2);
}
function openPdfDoc(docId){
  const doc=FAQ_DOCS.find(d=>d.id===docId);if(!doc)return;
  const src=doc.data||doc.url||'';
  document.getElementById('pdfViewerTitle').textContent='📄 '+doc.title;
  document.getElementById('pdfViewerFrame').src=src;
  const dl=document.getElementById('pdfViewerDownload');
  dl.href=src; dl.download=doc.title+'.pdf';
  document.getElementById('pdfViewerOpen').href=src;
  openModal('modalPdfViewer');
  logEvent('doc_view',{docId,title:doc.title});
}
function removeFaqDoc(docId){
  if(!confirm('Dokument wirklich entfernen?'))return;
  const idx=FAQ_DOCS.findIndex(d=>d.id===docId);
  if(idx>=0) FAQ_DOCS.splice(idx,1);
  saveData();
  // re-render feedback page
  if(state.currentPage==='feedback') navigateTo('feedback');
  showToast('Dokument entfernt.');
}
function saveDocUpload(){
  const title=document.getElementById('docTitle').value.trim();
  if(!title){showToast('Bitte Titel angeben','error');return;}
  const desc=document.getElementById('docDesc').value.trim();
  const type=document.getElementById('docType').value;
  const url=document.getElementById('docUrl').value.trim();
  const file=document.getElementById('docFile').files[0];
  const docId='doc'+Date.now();
  if(file){
    const reader=new FileReader();
    reader.onload=ev=>{
      FAQ_DOCS.push({id:docId,title,desc,type,data:ev.target.result,url:'',date:new Date().toISOString().split('T')[0]});
      saveData();
      closeModal('modalUploadDoc');
      showToast('Dokument hochgeladen!');
      if(state.currentPage==='feedback') navigateTo('feedback');
    };
    reader.readAsDataURL(file);
  } else if(url){
    FAQ_DOCS.push({id:docId,title,desc,type,data:'',url,date:new Date().toISOString().split('T')[0]});
    saveData();
    closeModal('modalUploadDoc');
    showToast('Dokument gespeichert!');
    if(state.currentPage==='feedback') navigateTo('feedback');
  } else {
    showToast('Bitte Datei hochladen oder URL eingeben','error');
  }
}

// ── TRANS_MAP + applyLang() → verschoben nach /i18n/en.js (Modul-Split, reines Refactoring) ──


// ── ROLE SYSTEM HELPERS ───────────────────────────────────────────────────────
const UNIQUE_ROLES=['CEO','CFO','CMO','COO','CTO']; // these can only appear once per team
function getRoleTaken(teamId,role,excludeMemberId){
  if(!UNIQUE_ROLES.includes(role)) return false;
  return MEMBERS.some(m=>m.teamId===teamId&&m.role===role&&m.id!==excludeMemberId);
}
function checkRoleAvail(role){
  const teamId=state.managingTeamId;
  const taken=getRoleTaken(teamId,role,null);
  const w=document.getElementById('nmRoleWarn');
  if(w) w.style.display=taken?'block':'none';
}
function checkEditRoleAvail(role){
  const id=document.getElementById('editMemberId')?.value;
  const teamId=state.managingTeamId;
  const taken=getRoleTaken(teamId,role,id);
  const w=document.getElementById('editRoleWarn');
  if(w) w.style.display=taken?'block':'none';
}
function openEditMember(memberId){
  const m=MEMBERS.find(x=>x.id===memberId);if(!m)return;
  document.getElementById('editMemberId').value=m.id;
  document.getElementById('editMemberName').value=m.name;
  document.getElementById('editMemberRole').value=m.role;
  document.getElementById('editRoleWarn').style.display='none';
  document.getElementById('editMemberInline').style.display='block';
  document.getElementById('editMemberInline').scrollIntoView({behavior:'smooth',block:'center'});
}
function closeEditMember(){
  document.getElementById('editMemberInline').style.display='none';
}
function saveEditMember(){
  const id=document.getElementById('editMemberId').value;
  const m=MEMBERS.find(x=>x.id===id);if(!m)return;
  const newName=document.getElementById('editMemberName').value.trim();
  const newRole=document.getElementById('editMemberRole').value;
  if(!newName){showToast('Name darf nicht leer sein','error');return;}
  const teamId=state.managingTeamId;
  // Role transfer: if new role is unique and already taken → transfer (demote old holder to Mitglied)
  if(UNIQUE_ROLES.includes(newRole)&&newRole!==m.role){
    const oldHolder=MEMBERS.find(x=>x.teamId===teamId&&x.role===newRole&&x.id!==id);
    if(oldHolder){
      oldHolder.role='Mitglied';
      showToast(`ℹ️ ${oldHolder.name} wurde zu "Mitglied" (${newRole} übertragen)`,'info');
    }
  }
  m.name=newName;
  m.role=newRole;
  m.title=m.title===m.role?newRole:m.title; // update title if it was same as role
  rebuildCodes();saveData();
  closeEditMember();
  renderMemberMgmtList();
  // Also update CEO tab if open
  const team=TEAMS.find(t=>t.id===teamId);
  if(team) renderMembersSection(team);
  showToast(`✅ ${m.name} aktualisiert (${newRole})`);
}

