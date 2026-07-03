// ════════════════════════════════════════════════════════════════════
//  KONTAKT PAGE (Contact Directory & Messaging)
// ════════════════════════════════════════════════════════════════════
function renderKontaktPage(){
  const u=state.currentUser;
  const myId=u.memberId||u.code;
  const myMember=MEMBERS.find(m=>m.id===myId);
  // Superadmin uses managingGameId; fallback to u.gameId; if still none, show all members
  const myGameId=(u.role==='superadmin'?state.managingGameId:null)||u.gameId||null;

  // Get all members from the same game (or all members if no game context)
  const gameMembers=myGameId
    ?MEMBERS.filter(m=>{const mTeam=TEAMS.find(t=>t.id===m.teamId);return mTeam&&mTeam.gameId===myGameId&&mTeam.status!=='pending'&&mTeam.name&&mTeam.name.trim();})
    :MEMBERS.filter(m=>{const mTeam=TEAMS.find(t=>t.id===m.teamId);return mTeam&&mTeam.status!=='pending'&&mTeam.name&&mTeam.name.trim();});

  // Build member cards
  const memberCards=gameMembers.map(member=>{
    const team=TEAMS.find(t=>t.id===member.teamId);
    const initials=member.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    const teamColor=team?.color||'#999';
    const email=member.email||'—';
    return `<div class="card" style="padding:14px;text-align:center;">
      <div style="width:50px;height:50px;border-radius:50%;background:${teamColor};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;margin:0 auto 10px;">${initials}</div>
      <div style="font-weight:700;font-size:14px;">${member.name}</div>
      <div style="font-size:11px;color:var(--gray-mid);margin:4px 0;">${member.role||'Mitglied'}</div>
      <div style="font-size:11px;color:var(--blue);margin:4px 0;">${team?.name||'—'}</div>
      <div style="font-size:11px;color:var(--gray-mid);margin:8px 0;">${email}</div>
      <button class="btn btn-primary btn-sm" onclick="openMessageModal('${member.id}','${member.name.replace(/'/g,"\\'")}')">💬 Nachricht</button>
    </div>`;
  }).join('');

  // Get messages for current user
  const myId_safe=myId.replace(/'/g,"\\'");
  const inbox=MESSAGES.filter(m=>m.toId===myId).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const allMyIds=new Set([myId,u.code,u.memberId,u.adminId].filter(Boolean));
  const sent=MESSAGES.filter(m=>allMyIds.has(m.fromId)).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const inboxHtml=inbox.length===0?'<div style="text-align:center;padding:20px;color:var(--gray-mid);">📭 Keine Nachrichten</div>':
    inbox.map(msg=>`<div class="card" style="margin-bottom:10px;padding:12px;${msg.read?'':'background:var(--blue-lt);'} opacity:${msg.read?0.7:1}">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px;">
        <div style="flex:1;">
          <div style="font-weight:700;font-size:13px;color:${msg.read?'var(--gray-mid)':'var(--blue-dark)'}">${msg.fromName}</div>
          ${msg.subject?'<div style="color:var(--gray-dark);margin:4px 0;font-size:12px;">'+msg.subject+'</div>':''}
          <div style="color:var(--gray-mid);font-size:11px;margin:4px 0;">${msg.date}</div>
          <div style="margin-top:8px;color:var(--gray-dark);font-size:13px;">${msg.body}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          ${!msg.read?'<button class="btn btn-xs" onclick="markMessageRead(\''+msg.id+'\')">✅</button>':''}
          <button class="btn btn-xs btn-outline" onclick="openMessageModal(\''+msg.fromId+'\',\''+msg.fromName.replace(/'/g,"\\'")+'\')" title="Antworten">↩️</button>
          <button class="btn btn-danger btn-xs" onclick="deleteMessage(\''+msg.id+'\')">🗑️</button>
        </div>
      </div>
    </div>`).join('');

  const sentHtml=sent.length===0?'<div style="text-align:center;padding:20px;color:var(--gray-mid);">📤 Noch keine Nachrichten gesendet</div>':
    sent.map(msg=>`<div class="card" style="margin-bottom:10px;padding:12px;opacity:0.7;">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px;">
        <div style="flex:1;">
          <div style="font-weight:700;font-size:13px;color:var(--gray-mid);">An: ${msg.toName}</div>
          ${msg.subject?'<div style="color:var(--gray-dark);margin:4px 0;font-size:12px;">'+msg.subject+'</div>':''}
          <div style="color:var(--gray-mid);font-size:11px;margin:4px 0;">${msg.date}</div>
          <div style="margin-top:8px;color:var(--gray-dark);font-size:13px;">${msg.body}</div>
        </div>
        <button class="btn btn-danger btn-xs" onclick="deleteMessage(\''+msg.id+'\')">🗑️</button>
      </div>
    </div>`).join('');

  // Build admin/lecturer contact card
  const gameAdmins=myGameId
    ? ADMINS.filter(a=>a.gameId===myGameId)
    : [];
  const adminCards=gameAdmins.map(a=>`<div class="card" style="padding:14px;text-align:center;border-top:4px solid #2E75B6;">
    <div style="width:50px;height:50px;border-radius:50%;background:#2E75B6;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;margin:0 auto 10px;">${(a.name||'?').charAt(0).toUpperCase()}</div>
    <div style="font-weight:700;font-size:14px;">${a.name||'Dozent/in'}</div>
    <div style="font-size:11px;color:#2E75B6;margin:4px 0;font-weight:700;">⚙️ Spielleitung</div>
    ${a.uni?`<div style="font-size:11px;color:var(--gray-mid);margin:2px 0;">🏫 ${a.uni}</div>`:''}
    ${a.email?`<div style="font-size:11px;color:var(--gray-mid);margin:4px 0;">✉️ ${a.email}</div>`:''}
    ${a.phone?`<div style="font-size:11px;color:var(--gray-mid);margin:2px 0;">📞 ${a.phone}</div>`:''}
    ${a.office?`<div style="font-size:11px;color:var(--gray-mid);margin:2px 0;">🏢 ${a.office}</div>`:''}
    ${a.email?`<button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="openMessageModal('${a.code}','${(a.name||'Dozent').replace(/'/g,"\\'")}')">💬 Nachricht</button>`:''}
  </div>`).join('');

  document.getElementById('kontaktContent').innerHTML=`
    ${adminCards?`<div style="margin-bottom:32px;">
      <div class="section-header"><div class="section-title">🎓 Spielleitung / Dozent</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">${adminCards}</div>
    </div>`:''}
    <div style="margin-bottom:32px;">
      <div class="section-header"><div class="section-title">👥 Team-Verzeichnis</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">${memberCards}</div>
    </div>
    <div style="margin-bottom:32px;">
      <div class="section-header"><div class="section-title">📬 Posteingang</div></div>
      ${inboxHtml}
    </div>
    <div>
      <div class="section-header"><div class="section-title">📤 Gesendet</div></div>
      ${sentHtml}
    </div>
  `;
}

function openMessageModal(toId,toName){
  document.getElementById('dmMsgTo').value=toName;
  document.getElementById('dmMsgToId').value=toId;
  document.getElementById('dmMsgSubject').value='';
  document.getElementById('dmMsgBody').value='';
  openModal('modalSendMessage');
}

function sendMessage(){
  const toId=document.getElementById('dmMsgToId').value;
  const toName=document.getElementById('dmMsgTo').value;
  const subject=document.getElementById('dmMsgSubject').value.trim();
  const body=document.getElementById('dmMsgBody').value.trim();
  if(!body){showToast('Bitte Nachricht eingeben','error');return;}
  const u=state.currentUser;
  MESSAGES.push({
    id:'m'+Date.now(),
    fromId:u.memberId||u.code,
    fromName:u.name,
    toId,toName,subject,body,
    date:new Date().toISOString().split('T')[0],
    read:false
  });
  saveData();
  closeModal('modalSendMessage');
  showToast('📬 Nachricht gesendet!','success');
  renderKontaktPage();
  buildNavigation();
}

function markMessageRead(id){
  const msg=MESSAGES.find(m=>m.id===id);
  if(msg){msg.read=true;saveData();renderKontaktPage();buildNavigation();}
}

function deleteMessage(id){
  const idx=MESSAGES.findIndex(m=>m.id===id);
  if(idx<0) return;
  const snap=JSON.parse(JSON.stringify(MESSAGES[idx]));
  MESSAGES.splice(idx,1);
  if(DELETED_ITEMS.length>=100) DELETED_ITEMS.shift();
  DELETED_ITEMS.push({id:'del_'+Date.now(),type:'message',deletedAt:new Date().toISOString(),label:'Nachricht: "'+snap.text?.substring(0,50)+'"',data:snap});
  saveData();
  showUndoToast('🗑️ Nachricht gelöscht', ()=>{
    MESSAGES.push(snap);
    DELETED_ITEMS.splice(DELETED_ITEMS.findIndex(d=>d.data.id===snap.id),1);
    saveData();renderKontaktPage();buildNavigation();
  });
  renderKontaktPage();buildNavigation();
}

