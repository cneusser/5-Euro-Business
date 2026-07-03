// ════════════════════════════════════════════════════════════════════
//  ADMIN PAGE
// ════════════════════════════════════════════════════════════════════
function renderAdminPage(){
  const u=state.currentUser;
  if(u.role==='team'||u.role==='member'){navigateTo('dashboard');return;}
  const effectiveGameId = state.managingGameId || u.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId)||GAMES[0];
  // Back-Button für Superadmin anzeigen
  const backBtn = document.getElementById('adminBackToSuper');
  if(backBtn) backBtn.style.display = (u.role==='superadmin' && state.managingGameId) ? 'inline-flex' : 'none';
  // Show "Zurück zu Super" button also when impersonating (prevUser set)
  const backImpBtn=document.getElementById('adminBackFromImpersonate');
  if(backImpBtn) backImpBtn.style.display = state.prevUser ? 'inline-flex' : 'none';
  if(game) document.getElementById('adminHeroSub').textContent=game.name+' · '+(game.uni||'')+(u?.isGuest?' · Gastadmin':'');
  renderApprovalQueue();renderWeeksAdmin();renderReflectionsAdmin();renderAdminTeamsTable();renderAdminTxTable();renderCodesPanel();renderTeamAwardPanel();renderActivityLog();
  // notification dots
  const pending=BLOGS.filter(b=>b.status==='pending').length;
  document.getElementById('approvalCount').textContent=pending;
  // Show submitted/total reflexions per team's own currentWeek (aggregated)
  const effectiveGameId_rc=state.managingGameId||u?.gameId;
  const gameTeams_rc=TEAMS.filter(t=>t.gameId===effectiveGameId_rc&&t.status!=='pending'&&t.name&&t.name.trim());
  if(gameTeams_rc.length>0){
    // Aggregate: for each team, count members who submitted reflexion for that team's currentWeek
    const submitted_rc=gameTeams_rc.reduce((sum,t)=>sum+REFLECTIONS.filter(r=>r.teamId===t.id&&r.week===(t.currentWeek||1)).length,0);
    const totalMembers_rc=gameTeams_rc.reduce((sum,t)=>sum+MEMBERS.filter(m=>m.teamId===t.id).length,0);
    const badge=document.getElementById('reflectionCount');
    if(badge){badge.textContent=submitted_rc+'/'+totalMembers_rc;badge.style.background=submitted_rc>=totalMembers_rc?'var(--green)':'var(--orange)';}
  } else {
    const badge=document.getElementById('reflectionCount');
    if(badge) badge.textContent=REFLECTIONS.length;
  }
  // Papierkorb badge
  const pkorBadge=document.getElementById('pkorCount');
  if(pkorBadge){ pkorBadge.textContent=DELETED_ITEMS.length; pkorBadge.style.display=DELETED_ITEMS.length>0?'inline-flex':'none'; }
}
function switchAdminTab(tabId){
  document.querySelectorAll('#page-admin .admin-tab').forEach(t=>t.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.querySelectorAll('#page-admin .admin-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('adminPanel-'+tabId)?.classList.add('active');
  if(tabId==='weeks') renderCustomQuestionsAdmin();
  else if(tabId==='pinnwand') renderPinnwand();
  else if(tabId==='dokumente') renderDokumente();
  else if(tabId==='messaging') renderMessaging();
  else if(tabId==='teamAward') renderTeamAwardPanel();
  else if(tabId==='log') renderActivityLog();
  else if(tabId==='papierkorb') renderPapierkorb();
  else if(tabId==='berichte-admin') renderAdminBlogsPanel();
  else if(tabId==='admin-profil') renderAdminProfilePanel();
  if(state.lang==='en') setTimeout(applyLang,200);
}
function renderApprovalQueue(){
  const u=state.currentUser;
  const gameTeams=TEAMS.filter(t=>t.gameId===(u.gameId||t.gameId));
  const pending=BLOGS.filter(b=>b.status==='pending'&&gameTeams.some(t=>t.id===b.teamId));
  document.getElementById('approvalCount').textContent=pending.length;
  const el=document.getElementById('approvalQueue');
  if(pending.length===0){el.innerHTML='<div class="empty-state"><div class="empty-icon">✅</div><h3>Alle geprüft</h3><p>Keine ausstehenden Berichte.</p></div>';return;}
  el.innerHTML=pending.map(b=>{
    const team=TEAMS.find(t=>t.id===b.teamId);
    const teamMembersAll=MEMBERS.filter(m=>m.teamId===b.teamId);
    const teamMembers=_deduplicateMembers(teamMembersAll,[]);
    const refsForWeek=REFLECTIONS.filter(r=>r.teamId===b.teamId&&r.week===b.week);
    const reflStatusHtml=`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:8px 12px;background:var(--bg-light);border-top:1px solid var(--border);font-size:11px;">
      <span style="color:var(--gray-mid);font-weight:600;">📝 Reflexionen W${b.week}:</span>
      ${teamMembers.map(m=>{
        const hasRef=_isMemberRefCovered(m,refsForWeek,teamMembersAll);
        return '<span style="padding:2px 8px;border-radius:12px;font-weight:600;background:'+(hasRef?team?.color+'33':'#F3F4F6')+';color:'+(hasRef?team?.color:'#9CA3AF')+';border:1px solid '+(hasRef?team?.color+'66':'#E5E7EB')+';">'+m.name+' ('+(hasRef?'✓':'fehlt')+')</span>';
      }).join('')}
    </div>`;
    return `<div class="approval-row">
      <div class="approval-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        <div style="width:30px;height:30px;border-radius:8px;background:${team?.color};color:white;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${team?.logo}</div>
        <div><strong>${b.title}</strong><div style="font-size:11px;color:var(--gray-mid);">${team?.name} · Woche ${b.week} · ${fmtDate(b.date)}</div></div>
        <span class="blog-status status-pending" style="margin-left:auto;">⏳</span>
        <button style="background:none;border:none;cursor:pointer;font-size:12px;margin-left:6px;">▼</button>
      </div>
      <div class="approval-content" style="display:block!important;">
        ${b.body?`<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:var(--gray-mid);text-transform:uppercase;letter-spacing:.5px;">Aktivitäten</label><div style="padding:8px;background:var(--bg-light);border-radius:6px;font-size:13px;">${b.body}</div></div>`:''}
        ${b.highlight?`<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:var(--gray-mid);text-transform:uppercase;letter-spacing:.5px;">⭐ Highlight</label><div style="padding:8px;background:#FFFBEB;border-radius:6px;font-size:13px;">${b.highlight}</div></div>`:''}
        ${b.challenges?`<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:var(--gray-mid);text-transform:uppercase;letter-spacing:.5px;">⚠️ Herausforderungen</label><div style="padding:8px;background:var(--bg-light);border-radius:6px;font-size:13px;">${b.challenges}</div></div>`:''}
        ${b.nextSteps?`<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:var(--gray-mid);text-transform:uppercase;letter-spacing:.5px;">▶️ Nächste Schritte</label><div style="padding:8px;background:var(--bg-light);border-radius:6px;font-size:13px;">${b.nextSteps}</div></div>`:''}
        ${b.adminFeedback?`<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:.5px;">💬 Admin-Feedback</label><div style="padding:8px;background:#EFF6FF;border-radius:6px;font-size:13px;">${b.adminFeedback}</div></div>`:''}
        ${b.attachments&&b.attachments.length?`<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:var(--gray-mid);text-transform:uppercase;letter-spacing:.5px;">📎 Anhänge</label>${_renderAttachmentLinks(b.attachments)}</div>`:''}
      </div>
      ${reflStatusHtml}
      <div style="padding:8px 12px;background:var(--gray-lt);border-top:1px solid var(--border);">
        <textarea id="blogFeedback_${b.id}" placeholder="💬 Individuelles Feedback (optional)..." class="form-control" rows="2" style="font-size:12px;">${b.adminFeedback||''}</textarea>
      </div>
      <div class="approval-actions">
        <button class="btn btn-success btn-sm" onclick="approveBlog('${b.id}')">✅ Freigeben</button>
        <button class="btn btn-warning btn-sm" onclick="rejectBlog('${b.id}')">🔄 Überarbeitung</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBlog('${b.id}')">❌ Ablehnen</button>
        <span style="margin-left:auto;font-size:11px;color:var(--gray-mid);">${b.status==='approved'?'Stimmung: '+['','😩','😟','😐','😊','🚀'][b.mood]+'('+b.mood+'/5)':'Ø Stimmung nach Freigabe sichtbar'}</span>
      </div>
    </div>`;}).join('');
}
function renderWeeksAdmin(){
  const _u=state.currentUser;
  const _egId=state.managingGameId||_u?.gameId;
  const teams=TEAMS.filter(t=>t.gameId===_egId&&t.status!=='pending');
  let html=`<div style="display:flex;gap:12px;margin-bottom:10px;font-size:11px;align-items:center;"><strong>Legende:</strong>
<span class="tag tag-blue">📝 Offen</span>
<span class="tag tag-orange">⏳ Eingereicht</span>
<span class="tag tag-green">✅ Freigegeben</span></div>`;
  html+=`
    <table class="data-table" style="width:100%">
      <thead><tr><th>Team</th><th>Aktuelle Woche</th><th>Status</th><th>Bericht Woche ${1}</th><th>Aktion</th></tr></thead>
      <tbody>${teams.map(team=>{
        const blog=BLOGS.find(b=>b.teamId===team.id&&b.week===team.currentWeek&&b.status==='pending');
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:7px;"><div style="width:26px;height:26px;border-radius:6px;background:${team.color};color:white;font-size:12px;display:flex;align-items:center;justify-content:center;">${team.logo}</div><strong>${team.name}</strong></div></td>
          <td style="text-align:center;font-weight:700;">Woche ${team.currentWeek}</td>
          <td><span class="tag ${team.weekStatus==='approved'?'tag-green':team.weekStatus==='submitted'?'tag-orange':'tag-blue'}">${team.weekStatus==='submitted'?'⏳ Eingereicht':team.weekStatus==='approved'?'✅ Freigegeben':'📝 Offen'}</span></td>
          <td>${blog?`<button class="btn btn-success btn-xs" onclick="approveBlogAndAdvance('${blog.id}','${team.id}')">✅ Freigeben + W${team.currentWeek+1} starten</button>`:'—'}</td>
          <td style="display:flex;gap:4px;"><button class="btn btn-outline btn-xs" onclick="manualRollbackWeek('${team.id}')" title="Eine Woche zurück">⏮️ Zurück</button><button class="btn btn-outline btn-xs" onclick="manualAdvanceWeek('${team.id}')">⏭️ Weiter</button></td>
        </tr>`;}).join('')}</tbody>
    </table>`;
  document.getElementById('weeksAdminTable').innerHTML=html;
}
function renderReflectionsAdmin(){
  const el=document.getElementById('reflectionsAdminPanel');
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u?.gameId;
  const gameTeams_r=getVisibleTeams().filter(t=>t.gameId===effectiveGameId||!effectiveGameId);
  // Populate team filter
  const tSel=document.getElementById('adminRefTeamFilter');
  if(tSel){
    const prev=tSel.value;
    while(tSel.options.length>1) tSel.remove(1);
    gameTeams_r.forEach(t=>{const o=new Option(t.logo+' '+t.name,t.id);tSel.appendChild(o);});
    if(prev&&prev!=='all'&&gameTeams_r.some(t=>t.id===prev)) tSel.value=prev;
  }
  const tfVal=document.getElementById('adminRefTeamFilter')?.value||'all';
  const wfVal=document.getElementById('adminRefWeekFilter')?.value||'all';
  const filteredTeams=tfVal==='all'?gameTeams_r:gameTeams_r.filter(t=>t.id===tfVal);
  let allRefs=REFLECTIONS.filter(r=>filteredTeams.some(t=>t.id===r.teamId));
  if(wfVal!=='all') allRefs=allRefs.filter(r=>r.week==wfVal);
  if(allRefs.length===0){el.innerHTML='<div class="empty-state"><div class="empty-icon">💬</div><h3>Keine Reflexionen</h3></div>';return;}
  // Build missing reflections overview
  const weeks_r=[...new Set(allRefs.map(r=>r.week))].sort((a,b)=>b-a);
  filteredTeams.forEach(t=>{if(!weeks_r.includes(t.currentWeek))weeks_r.push(t.currentWeek);});
  weeks_r.sort((a,b)=>b-a); // v0.8.5: newest week first
  const missingHtml=`<div class="card" style="margin-bottom:16px;">
  <div class="card-header"><h3>📋 Reflexions-Status</h3></div>
  <div class="card-body" style="padding:12px;">
    ${weeks_r.map(w=>`
      <div style="margin-bottom:12px;">
        <div style="font-weight:700;font-size:12px;color:var(--gray-mid);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Woche ${w}</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
        ${gameTeams_r.map(team=>{
          const members=MEMBERS.filter(m=>m.teamId===team.id);
          const refsW=REFLECTIONS.filter(r=>r.teamId===team.id&&r.week===w);
          return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:13px;width:120px;flex-shrink:0;">${team.logo} ${team.name}</span>
            ${members.map(m=>{
              const has=refsW.find(r=>r.memberId===m.id);
              const _fn=m.name.split(' ')[0];
              const _dup=members.filter(x=>x.name.split(' ')[0]===_fn).length>1;
              const _lastInit=m.lastName?m.lastName[0]:(m.name.split(' ')[1]||'')[0]||'';
              const _dn=_dup&&_lastInit?_fn+'\u00A0'+_lastInit+'.':_fn;
              return '<span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;cursor:'+(has?'pointer':'default')+';background:'+(has?team.color+'22':'#F3F4F6')+';color:'+(has?team.color:'#9CA3AF')+';border:1px solid '+(has?team.color+'55':'#E5E7EB')+';white-space:nowrap;" title="'+(has?'Klicken zum Springen':'Fehlt noch')+'"'+(has?' onclick="var el=document.getElementById(\'refcard-'+has.id+'\');el&&(el.scrollIntoView({behavior:\'smooth\',block:\'center\'}),el.style.outline=\'3px solid '+team.color+'\',setTimeout(function(){el.style.outline=\'\'},1800))"':'')+'>'+_dn+'</span>';
            }).join('')}
          </div>`;
        }).join('')}
        </div>
      </div>
    `).join('')}
  </div>
</div>`;
  // Add mood chart section (moved to bottom, more compact)
  let chartHtml=`<div class="card" style="margin-top:20px;">
  <div class="card-header"><h3>📊 Stimmungsbarometer</h3></div>
  <div class="card-body">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px;" id="moodByWeek"></div>
    <div style="position:relative;max-height:220px;overflow:hidden;"><canvas id="moodChartAdmin" height="80"></canvas></div>
  </div>
</div>`;
  const grouped={};
  allRefs.forEach(r=>{if(!grouped[r.teamId])grouped[r.teamId]=[];grouped[r.teamId].push(r);});
  el.innerHTML=missingHtml+Object.entries(grouped).map(([teamId,refs])=>{
    const team=TEAMS.find(t=>t.id===teamId);
    return `<div class="card" style="margin-bottom:14px;">
      <div class="card-header"><h3>${team?.logo} ${team?.name}</h3></div>
      <div class="card-body">${refs.map(r=>{
        const m=MEMBERS.find(x=>x.id===r.memberId);
        const moodEmoji=['','😩','😟','😐','😊','🚀'][r.mood];
        return `<div id="refcard-${r.id}" style="border-bottom:1px solid var(--border);padding:10px 0;transition:outline .2s;"><div style="display:flex;gap:8px;align-items:center;margin-bottom:7px;">
          <div style="width:28px;height:28px;border-radius:50%;background:${team?.color};color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${m?.name?.charAt(0)}</div>
          <strong>${m?.name}</strong><span style="color:var(--gray-mid);font-size:11px;">(${m?.role})</span>
          <span style="margin-left:auto;font-size:12px;">${moodEmoji} ${r.mood}/5 · W${r.week}${r.date?' · '+fmtDate(r.date):''}</span></div>
          ${r.experience?`<div style="font-size:12px;color:var(--gray-dark);margin-bottom:4px;"><strong>Erfahrungen:</strong> ${r.experience}</div>`:''}
          ${r.liked?`<div style="font-size:12px;color:var(--green);margin-bottom:4px;">👍 ${r.liked}</div>`:''}
          ${r.improved?`<div style="font-size:12px;color:var(--orange);margin-bottom:6px;">💡 ${r.improved}</div>`:''}
          <div style="text-align:right;">
            <button class="btn btn-outline btn-xs" onclick="openReflectionDetail('${r.id}')" title="Vollständig lesen">👁️ Lesen</button>
            <button class="btn btn-danger btn-xs" onclick="deleteReflection('${r.id}')" title="Reflexion löschen">🗑️ Löschen</button>
          </div>
        </div>`;}).join('')}</div>
    </div>`;}).join('')+chartHtml;
  renderMoodChart();
}
function renderAdminTeamsTable(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u?.gameId;
  const allTeams=TEAMS.filter(t=>t.gameId===effectiveGameId);
  const pending=allTeams.filter(t=>t.status==='pending');
  const active=allTeams.filter(t=>t.status!=='pending');
  let html='';
  // Active teams first
  if(active.length>0){
    html+='<table class="data-table" style="width:100%">'
      +'<thead><tr><th>Team</th><th>Idee</th><th>Mitglieder</th><th>Umsatz</th><th>Gewinn</th><th>Einladungscode</th><th>Aktionen</th></tr></thead>'
      +'<tbody>'+active.map(team=>{const profit=team.revenue-team.expenses;
        return '<tr><td><div style="display:flex;gap:7px;align-items:center;">'
          +'<div style="width:26px;height:26px;border-radius:6px;background:'+team.color+';color:white;font-size:12px;display:flex;align-items:center;justify-content:center;">'+team.logo+'</div>'
          +'<div><strong>'+team.name+'</strong><div style="font-size:10px;color:var(--gray-mid);">'+( team.biz||'')+'</div></div></div></td>'
          +'<td style="font-size:11px;font-style:italic;">'+(team.slogan||'—')+'</td>'
          +'<td style="font-size:11px;">'+MEMBERS.filter(m=>m.teamId===team.id).length+' Pers.</td>'
          +'<td style="font-weight:700;">'+fmtEur(team.revenue)+'</td>'
          +'<td style="font-weight:700;color:'+(profit>=0?'var(--green)':'var(--red)')+';">'+(profit>=0?'+':'')+fmtEur(profit)+'</td>'
          +'<td><code style="font-size:11px;background:var(--blue-xlt);padding:1px 7px;border-radius:4px;">'+team.code+'</code>'
          +' <button class="btn btn-outline btn-xs" onclick="copyCode(this.dataset.code)" data-code="'+team.code+'">📋</button></td>'
          +'<td><div style="display:flex;gap:3px;">'
          +'<button class="btn btn-outline btn-xs" onclick="openMemberMgmt(this.dataset.id)" data-id="'+team.id+'" title="Mitglieder verwalten">👤 '+MEMBERS.filter(m=>m.teamId===team.id).length+'</button>'
          +'<button class="btn btn-outline btn-xs" onclick="openAdminKassenbuch(this.dataset.id)" data-id="'+team.id+'" title="Kassenbuch anzeigen">📒</button>'
          +'<button class="btn btn-outline btn-xs" onclick="openEmojiPickerForTeam(\''+team.id+'\')" title="Emoji ändern">'+team.logo+' ✏️</button>'
          +'<button class="btn btn-danger btn-xs" onclick="deleteTeam(this.dataset.id)" data-id="'+team.id+'" title="Team löschen">🗑️</button>'
          +'</div></td></tr>';}).join('')
      +'</tbody></table>';
  }
  // Pending team slots — show below active teams; hide once game has moved past KW1
  const pastKW1=active.length>0&&active.every(t=>(t.currentWeek||1)>1);
  if(pending.length>0&&!pastKW1){
    html+='<div class="info-box" style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:12px 16px;margin-top:16px;">'
      +'<strong>⏳ '+pending.length+' Team-Slot(s) warten auf Setup</strong>'
      +'<p style="font-size:12px;margin:6px 0 10px;">Gib jedem Teamleiter seinen Setup-Code. Er öffnet die App → „Neues Spiel" → gibt den Code ein → richtet sein Team ein.</p>'
      +'<table class="data-table" style="width:100%;margin:0;">'
      +'<thead><tr><th>Slot</th><th>Setup-Code (für Teamleiter)</th><th>Status</th><th></th></tr></thead>'
      +'<tbody>'
      +pending.map((t,i)=>'<tr>'
        +'<td style="font-weight:700;color:var(--blue-dark);">Team-Slot '+(i+1)+'</td>'
        +'<td><code style="font-size:14px;background:var(--blue-xlt);padding:3px 10px;border-radius:6px;font-weight:900;letter-spacing:2px;color:var(--blue-dark);">'+t.setupCode+'</code></td>'
        +'<td><span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">⏳ Ausstehend</span></td>'
        +'<td style="display:flex;gap:4px;">'
        +'<button class="btn btn-outline btn-xs" onclick="copyCode(this.dataset.code)" data-code="'+t.setupCode+'">📋 Kopieren</button>'
        +'<button class="btn btn-danger btn-xs" onclick="deletePendingSlot(this.dataset.id)" data-id="'+t.id+'" title="Slot löschen">🗑️</button>'
        +'</td>'
        +'</tr>').join('')
      +'</tbody></table></div>';
  }
  if(!active.length&&!pending.length){
    html='<div class="empty-state"><div class="empty-icon">👥</div><h3>Noch keine Teams</h3><p>Lege ein neues Spiel mit Team-Slots an.</p></div>';
  }
  document.getElementById('adminTeamsTable').innerHTML=html;
}
function renderAdminTxTable(){
  const txs=[...TRANSACTIONS].sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('adminTxTable').innerHTML=`<div class="tx-row header"><div>Datum</div><div>Team</div><div>Beschreibung</div><div>Kategorie</div><div>Betrag</div><div>Aktionen</div></div>`+
    txs.map(tx=>{const team=TEAMS.find(t=>t.id===tx.teamId);return `<div class="tx-row">
      <div style="color:var(--gray-mid)">${fmtDate(tx.date)}</div>
      <div style="display:flex;align-items:center;"><div class="tx-team-dot" style="background:${team?.color}">${team?.logo}</div>${team?.name}</div>
      <div>${tx.desc}</div><div style="color:var(--gray-mid)">${tx.cat}</div>
      <div class="tx-amt ${tx.type==='income'?'pos':'neg'}">${tx.type==='income'?'+':'-'}${fmtEur(tx.amount)}</div>
      <div style="display:flex;gap:3px;"><button class="btn btn-outline btn-xs" onclick="editTransaction('${tx.id}')">✏️</button><button class="btn btn-danger btn-xs" onclick="deleteTransaction('${tx.id}');renderAdminPage();">🗑️</button></div>
    </div>`;}).join('');
}
function renderCodesPanel(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u?.gameId;
  const allTeamsForCodes=TEAMS.filter(t=>t.gameId===effectiveGameId);
  const pendingTeams=allTeamsForCodes.filter(t=>t.status==='pending');
  const teams=allTeamsForCodes.filter(t=>t.status!=='pending');
  const memberCodes=MEMBERS.filter(m=>allTeamsForCodes.some(t=>t.id===m.teamId));
  document.getElementById('codesPanel').innerHTML=`
    <div class="info-box green"><span class="info-box-icon">🔑</span>Team-Codes für Login als komplettes Team, Mitglieds-Codes für individuellen Login.</div>
    ${pendingTeams.length?`<div class="form-section-title">Setup-Codes (für Teamleiter — noch nicht eingerichtet)</div>
    <table class="data-table" style="width:100%;margin-bottom:20px;">
      <thead><tr><th>Slot</th><th>Setup-Code</th><th>Status</th><th>Aktion</th></tr></thead>
      <tbody>${pendingTeams.map((t,i)=>`<tr>
        <td>Team-Slot ${i+1}</td>
        <td><code style="font-size:13px;background:var(--blue-xlt);padding:2px 9px;border-radius:4px;font-weight:900;letter-spacing:2px;">${t.setupCode}</code></td>
        <td><span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:12px;font-size:11px;">⏳ Ausstehend</span></td>
        <td style="display:flex;gap:4px;">
          <button class="btn btn-outline btn-xs" onclick="copyCode('${t.setupCode}')" title="Kopieren">📋 Kopieren</button>
          <button class="btn btn-xs" style="background:#EFF6FF;color:#1e3a5f;border:1px solid #93C5FD;" onclick="activatePendingTeamAdmin('${t.id}')" title="Team direkt aktivieren">⚡ Aktivieren</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>`:''}
    <div class="form-section-title">Einladungscodes (für Teammitglieder)</div>
    <table class="data-table" style="width:100%;margin-bottom:20px;">
      <thead><tr><th>Team</th><th>Code</th><th>Status</th><th>Aktion</th></tr></thead>
      <tbody>${teams.map(t=>`<tr>
        <td><strong>${t.name}</strong></td>
        <td><code style="font-size:12px;background:var(--blue-xlt);padding:2px 9px;border-radius:4px;font-weight:700;">${t.code}</code></td>
        <td><span class="blog-status status-approved">✅ Aktiv</span></td>
        <td><button class="btn btn-outline btn-xs" onclick="copyCode('${t.code}')" title="Kopieren">📋 Kopieren</button></td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="form-section-title">Mitglieds-Codes</div>
    <table class="data-table" style="width:100%">
      <thead><tr><th>Name</th><th>Team</th><th>Rolle</th><th>Code</th><th>Aktion</th></tr></thead>
      <tbody>${memberCodes.map(m=>{const team=TEAMS.find(t=>t.id===m.teamId);const hasPwd=!!PASSWORDS[m.code];return `<tr>
        <td><strong>${m.name}</strong></td><td>${team?.name}</td><td><span class="tag tag-blue">${m.role}</span></td>
        <td><code style="font-size:12px;background:var(--blue-xlt);padding:2px 9px;border-radius:4px;font-weight:700;">${m.code}</code></td>
        <td style="display:flex;gap:4px;">
          <button class="btn btn-outline btn-xs" onclick="copyCode('${m.code}')" title="Kopieren">📋 Kopieren</button>
          ${hasPwd?`<button class="btn btn-xs" style="background:#FEF9EC;color:#92400E;border:1px solid #F59E0B;" onclick="resetMemberPassword('${m.code}')" title="Passwort zurücksetzen">🔑 Reset</button>`:'<span style="font-size:10px;color:#888;align-self:center;">kein Passwort</span>'}
        </td>
      </tr>`;}).join('')}</tbody>
    </table>`;
}

// Team Award Panel
function renderTeamAwardPanel(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId);
  const gameTeams=getVisibleTeams();
  const currentWeek=gameTeams[0]?.currentWeek||1;
  const allScoringWeeks=[...new Set([currentWeek,...BLOGS.filter(b=>gameTeams.some(t=>t.id===b.teamId)).map(b=>b.week)])].sort((a,b)=>a-b);
  const selectedWeek=(state.gdwSelectedWeek&&allScoringWeeks.includes(state.gdwSelectedWeek))?state.gdwSelectedWeek:currentWeek;
  // Default weights (total must be 100)
  const defaultW={rev:20,blog:20,ref:20,mood:20,tx:10,selfEval:10};
  if(!game.gdwWeights) game.gdwWeights={...defaultW};
  const W=game.gdwWeights;
  // Ensure selfEval field exists
  if(W.selfEval===undefined) W.selfEval=defaultW.selfEval;
  if(!game.gdwSelfEvals) game.gdwSelfEvals={};
  const totalW=(W.rev||0)+(W.blog||0)+(W.ref||0)+(W.mood||0)+(W.tx||0)+(W.selfEval||0);
  const scores=gameTeams.map(team=>{
    const members=MEMBERS.filter(m=>m.teamId===team.id);
    const revScore=Math.min(10,Math.round((team.revenue/(team.capital||5))*5));
    const hasBlog=BLOGS.find(b=>b.teamId===team.id&&b.week===selectedWeek&&b.status!=='draft');
    const blogScore=hasBlog?10:0;
    const refs=REFLECTIONS.filter(r=>r.teamId===team.id&&r.week===selectedWeek);
    const refScore=Math.round((refs.length/Math.max(members.length,1))*10);
    const avgMood=refs.length>0?refs.reduce((s,r)=>s+(r.mood||3),0)/refs.length:0;
    const moodScore=Math.round((avgMood/5)*10);
    const txScore=Math.min(10,team.transactions||0);
    const selfEvalScore=parseFloat(game.gdwSelfEvals[team.id+'_w'+selectedWeek]||0);
    const total=Math.round((revScore*(W.rev||0)+blogScore*(W.blog||0)+refScore*(W.ref||0)+moodScore*(W.mood||0)+txScore*(W.tx||0)+selfEvalScore*(W.selfEval||0))/(totalW||100)*10)/10;
    return {team,revScore,blogScore,refScore,moodScore,txScore,selfEvalScore,total};
  }).sort((a,b)=>b.total-a.total);
  const awards=game?.teamAwards||[];
  const el=document.getElementById('teamAwardPanel');
  if(!el) return;
  const weightSumOk=totalW===100;
  el.innerHTML=`
    <!-- Week Selector -->
    ${allScoringWeeks.length>1?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;background:var(--blue-xlt);border-radius:8px;padding:10px 14px;">
      <span style="font-weight:700;font-size:13px;">📅 Woche:</span>
      <select class="form-control" style="max-width:130px;" onchange="state.gdwSelectedWeek=+this.value;renderTeamAwardPanel();">
        ${allScoringWeeks.map(w=>`<option value="${w}" ${w===selectedWeek?'selected':''}>Woche ${w}${w===currentWeek?' (aktuell)':''}</option>`).join('')}
      </select>
      ${selectedWeek<currentWeek?'<span style="font-size:11px;color:var(--gray-mid);">Nachträgliche Bewertung für Woche '+selectedWeek+'</span>':''}
    </div>`:''}
    <!-- Weight Config Card -->
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header" style="cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        <h3>⚙️ Gewichtung der Kriterien ${weightSumOk?'<span style=\"background:#dcfce7;color:#166534;font-size:10px;padding:2px 8px;border-radius:12px;font-weight:600;\">✓ 100%</span>':'<span style=\"background:#fee2e2;color:#c00;font-size:10px;padding:2px 8px;border-radius:12px;font-weight:600;\">⚠ Summe ≠ 100%</span>'} <span style="font-size:12px;color:var(--gray-mid);">▼</span></h3>
      </div>
      <div style="display:none;padding:14px;">
        <div class="info-box blue" style="margin-bottom:12px;font-size:12px;"><span class="info-box-icon">ℹ️</span>Die Summe aller Gewichtungen muss 100% ergeben. Die Werte werden pro Spiel gespeichert.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:12px;">
          <div class="form-group"><label class="form-label">💰 Umsatz (%)</label><input class="form-control" type="number" id="gdwW_rev" value="${W.rev||0}" min="0" max="100"></div>
          <div class="form-group"><label class="form-label">📖 Wochenbericht (%)</label><input class="form-control" type="number" id="gdwW_blog" value="${W.blog||0}" min="0" max="100"></div>
          <div class="form-group"><label class="form-label">📝 Reflexionen (%)</label><input class="form-control" type="number" id="gdwW_ref" value="${W.ref||0}" min="0" max="100"></div>
          <div class="form-group"><label class="form-label">😊 Stimmung (%)</label><input class="form-control" type="number" id="gdwW_mood" value="${W.mood||0}" min="0" max="100"></div>
          <div class="form-group"><label class="form-label">⚡ Aktivität (%)</label><input class="form-control" type="number" id="gdwW_tx" value="${W.tx||0}" min="0" max="100"></div>
          <div class="form-group"><label class="form-label">🌟 Eigene Einschätzung (%)</label><input class="form-control" type="number" id="gdwW_selfEval" value="${W.selfEval||0}" min="0" max="100"></div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="saveGdwWeights('${effectiveGameId}')">💾 Gewichtung speichern</button>
      </div>
    </div>
    <!-- Scores Table + Chart -->
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><h3>🏅 Gruppe der Woche – Auswertung Woche ${selectedWeek}</h3></div>
      <div class="card-body">
        <div style="font-size:12px;color:var(--gray-mid);margin-bottom:12px;">
          Gewichtung: Umsatz ${W.rev}% · Bericht ${W.blog}% · Reflexionen ${W.ref}% · Stimmung ${W.mood}% · Aktivität ${W.tx}% · Eigene Einschätzung ${W.selfEval}%
        </div>
        <!-- Bar Chart -->
        <div style="margin-bottom:16px;position:relative;max-height:260px;">
          <canvas id="gdwBarChart"></canvas>
        </div>
        <!-- Self-Eval inputs -->
        ${W.selfEval>0?`<div style="background:#F0FFF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;margin-bottom:14px;">
          <div style="font-weight:700;font-size:12px;margin-bottom:8px;color:#166534;">🌟 Eigene Einschätzung (0–10 pro Team, Woche ${selectedWeek})</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
            ${gameTeams.map(t=>`<div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:13px;">${t.logo} ${t.name}</span>
              <input type="number" id="selfEval_${t.id}" class="form-control" style="width:65px;" min="0" max="10" step="0.5" value="${game.gdwSelfEvals[t.id+'_w'+selectedWeek]||0}">
            </div>`).join('')}
          </div>
          <button class="btn btn-success btn-sm" onclick="saveAllGdwSelfEvals('${effectiveGameId}',${selectedWeek})">💾 Speichern &amp; Auswertung aktualisieren</button>
        </div>`:''}
        <table class="data-table" style="width:100%;">
          <thead><tr><th>Platz</th><th>Team</th><th>Umsatz</th><th>Bericht</th><th>Reflexion</th><th>Stimmung</th><th>Aktivität</th>${W.selfEval>0?'<th>Eigene Einsch.</th>':''}<th>Gesamt</th></tr></thead>
          <tbody>${scores.map((s,i)=>`<tr style="${i===0?'background:#FFFBEB;font-weight:700;':''}">
            <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'.'}</td>
            <td><span style="color:${s.team.color};">${s.team.logo}</span> ${s.team.name}</td>
            <td>${s.revScore}/10</td>
            <td>${s.blogScore}/10</td>
            <td>${s.refScore}/10</td>
            <td>${s.moodScore}/10</td>
            <td>${s.txScore}/10</td>
            ${W.selfEval>0?`<td>${s.selfEvalScore}/10</td>`:''}
            <td style="font-weight:700;color:${i===0?'var(--orange)':'var(--gray-dark)'};">${s.total}/10</td>
          </tr>`).join('')}</tbody>
        </table>
        <div style="margin-top:16px;padding:12px;background:var(--blue-xlt);border-radius:8px;">
          <div style="font-weight:700;margin-bottom:8px;">✅ Gruppe der Woche ${selectedWeek} manuell auszeichnen:</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <select class="form-control" id="awardTeamSelect" style="max-width:200px;">
              ${scores.map((s,i)=>`<option value="${s.team.id}" ${i===0?'selected':''}>${s.team.logo} ${s.team.name} (${s.total}/10)</option>`).join('')}
            </select>
            <input class="form-control" id="awardReason" placeholder="Begründung (optional)..." style="flex:1;min-width:200px;">
            <button class="btn btn-primary btn-sm" onclick="saveTeamAward(${selectedWeek})">🏅 Auszeichnen</button>
          </div>
        </div>
      </div>
    </div>
    ${awards.length>0?`<div class="card">
      <div class="card-header"><h3>🏆 Vergabeverlauf</h3></div>
      <div class="card-body">${[...awards].reverse().map(a=>{const t=TEAMS.find(x=>x.id===a.teamId);return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
        <span style="font-size:20px;">${t?.logo}</span>
        <div><strong>${t?.name}</strong><div style="font-size:11px;color:var(--gray-mid);">Woche ${a.week}${a.reason?' · '+a.reason:''}</div></div>
        <span class="tag tag-green" style="margin-left:auto;">🏅 Ausgezeichnet</span>
      </div>`;}).join('')}</div>
    </div>`:''}
    <!-- v0.8.5: MVP Gewinner-Historie nach Wochen -->
    ${(()=>{
      const allWeeks=[...new Set([...awards.map(a=>a.week),...gameTeams.flatMap(t=>(t.mvps||[]).map(m=>m.week))])].sort((a,b)=>b-a);
      if(!allWeeks.length) return '';
      const rows=allWeeks.map(w=>{
        const award=awards.find(a=>a.week===w);
        const gdwTeam=award?TEAMS.find(t=>t.id===award.teamId):null;
        const allMvpsThisWeek=gameTeams.flatMap(t=>(t.mvps||[]).filter(m=>m.week===w).map(m=>({...m,team:t})));
        const mvpRows=allMvpsThisWeek.map(m=>{const mem=MEMBERS.find(x=>x.id===m.memberId);return mem?`${m.team.logo} <strong>${mem.name}</strong> <span style="font-size:11px;color:var(--gray-mid);">(${mem.role||'MVP'}${m.reason?', '+m.reason:''})</span>`:''}).filter(Boolean).join('<br>');
        return `<tr style="border-bottom:1px solid var(--border);">
          <td style="padding:8px 10px;font-weight:700;white-space:nowrap;">Woche ${w}</td>
          <td style="padding:8px 10px;">${gdwTeam?`<span style="font-size:20px;">${gdwTeam.logo}</span> <strong>${gdwTeam.name}</strong>${award.reason?' <span style=\'font-size:11px;color:var(--gray-mid);\'> · '+award.reason+'</span>':''}`:'-'}</td>
          <td style="padding:8px 10px;font-size:13px;">${mvpRows||'-'}</td>
        </tr>`;
      }).join('');
      return `<div class="card" style="margin-top:16px;">
        <div class="card-header"><h3>📋 Gewinner-Übersicht nach Woche</h3></div>
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:var(--gray-lt);">
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:var(--gray-mid);font-weight:700;text-transform:uppercase;">Woche</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:var(--gray-mid);font-weight:700;text-transform:uppercase;">🏅 Gruppe der Woche</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:var(--gray-mid);font-weight:700;text-transform:uppercase;">🏆 MVP Mitglieder</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div></div>`;
    })()}
  `;
  // Render bar chart
  setTimeout(()=>{
    const ctx=document.getElementById('gdwBarChart')?.getContext('2d');
    if(!ctx) return;
    if(state._gdwChart) state._gdwChart.destroy();
    state._gdwChart=new Chart(ctx,{
      type:'bar',
      data:{
        labels:scores.map(s=>s.team.name),
        datasets:[
          {label:'Umsatz',data:scores.map(s=>+(s.revScore*(W.rev||0)/100).toFixed(2)),backgroundColor:'#2563EB',stack:'s'},
          {label:'Bericht',data:scores.map(s=>+(s.blogScore*(W.blog||0)/100).toFixed(2)),backgroundColor:'#16A34A',stack:'s'},
          {label:'Reflexion',data:scores.map(s=>+(s.refScore*(W.ref||0)/100).toFixed(2)),backgroundColor:'#EA580C',stack:'s'},
          {label:'Stimmung',data:scores.map(s=>+(s.moodScore*(W.mood||0)/100).toFixed(2)),backgroundColor:'#D97706',stack:'s'},
          {label:'Aktivität',data:scores.map(s=>+(s.txScore*(W.tx||0)/100).toFixed(2)),backgroundColor:'#7C3AED',stack:'s'},
          ...(W.selfEval>0?[{label:'Eigene Einsch.',data:scores.map(s=>+(s.selfEvalScore*(W.selfEval||0)/100).toFixed(2)),backgroundColor:'#0891B2',stack:'s'}]:[]),
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,max:10,ticks:{stepSize:1}}}}
    });
  },50);
}
function saveGdwWeights(gameId){
  const game=GAMES.find(g=>g.id===gameId);if(!game)return;
  const vals={
    rev:parseInt(document.getElementById('gdwW_rev')?.value||20),
    blog:parseInt(document.getElementById('gdwW_blog')?.value||20),
    ref:parseInt(document.getElementById('gdwW_ref')?.value||20),
    mood:parseInt(document.getElementById('gdwW_mood')?.value||20),
    tx:parseInt(document.getElementById('gdwW_tx')?.value||10),
    selfEval:parseInt(document.getElementById('gdwW_selfEval')?.value||10)
  };
  const total=Object.values(vals).reduce((s,v)=>s+v,0);
  if(total!==100){showToast('Summe muss 100% ergeben (aktuell: '+total+'%)','error');return;}
  game.gdwWeights=vals;
  saveData();
  showToast('Gewichtung gespeichert','success');
  renderTeamAwardPanel();
}
function saveGdwSelfEval(gameId,teamId,week,value){
  const game=GAMES.find(g=>g.id===gameId);if(!game)return;
  if(!game.gdwSelfEvals) game.gdwSelfEvals={};
  game.gdwSelfEvals[teamId+'_w'+week]=Math.min(10,Math.max(0,parseFloat(value)||0));
  saveData();
}
function saveAllGdwSelfEvals(gameId,week){
  const game=GAMES.find(g=>g.id===gameId);if(!game)return;
  if(!game.gdwSelfEvals) game.gdwSelfEvals={};
  const gameTeams=TEAMS.filter(t=>t.gameId===gameId&&t.status!=='pending'&&t.name&&t.name.trim());
  gameTeams.forEach(t=>{
    const inp=document.getElementById('selfEval_'+t.id);
    if(inp) game.gdwSelfEvals[t.id+'_w'+week]=Math.min(10,Math.max(0,parseFloat(inp.value)||0));
  });
  saveData();
  showToast('✅ Eigene Einschätzung gespeichert','success');
  renderTeamAwardPanel();
}
function saveTeamAward(week){
  const teamId=document.getElementById('awardTeamSelect')?.value;
  const reason=document.getElementById('awardReason')?.value.trim();
  if(!teamId) return;
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId);
  if(!game) return;
  if(!game.teamAwards) game.teamAwards=[];
  const idx=game.teamAwards.findIndex(a=>a.week===week);
  if(idx>=0) game.teamAwards.splice(idx,1);
  game.teamAwards.push({week,teamId,reason,date:new Date().toISOString().split('T')[0]});
  const team=TEAMS.find(t=>t.id===teamId);
  saveData();
  showToast('🏅 Gruppe der Woche ausgezeichnet!','success');
  renderTeamAwardPanel();
}

// Activity Log Panel
function renderActivityLog(){
  const el=document.getElementById('activityLogPanel');
  if(!el) return;
  const sorted=[...LOGS].reverse().slice(0,200);
  const actionIcon={login:'🔑',logout:'🚪',blog_submit:'📤',blog_approve:'✅',blog_reject:'🔄',reflection_submit:'📝',week_advance:'⏭️',week_rollback:'⏮️',admin_member_add:'👤',tx_add:'💰'};
  el.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="font-size:12px;color:var(--gray-mid);">${sorted.length} Einträge (max. 200 angezeigt)</div>
      <button class="btn btn-outline btn-sm" onclick="exportActivityLog()">📥 CSV Export</button>
    </div>
    ${sorted.length===0?'<div class="empty-state"><div class="empty-icon">📋</div><h3>Noch keine Aktivitäten</h3></div>':''}
    <table class="data-table" style="width:100%;font-size:11px;">
      <thead><tr><th>Zeit</th><th>Aktion</th><th>Person</th><th>Team</th><th>Details</th></tr></thead>
      <tbody>${sorted.map(e=>`<tr>
        <td style="white-space:nowrap;color:var(--gray-mid);">${e.ts?new Date(e.ts).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'}</td>
        <td><span style="white-space:nowrap;">${actionIcon[e.action]||'📌'} ${e.action}</span></td>
        <td>${e.uname||'—'}<span style="color:var(--gray-mid);"> (${e.urole||'—'})</span></td>
        <td>${e.tname||'—'}</td>
        <td style="color:var(--gray-mid);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.data||''}</td>
      </tr>`).join('')}
      </tbody>
    </table>`;
}
function exportActivityLog(){
  const sorted=[...LOGS].reverse();
  const header='Zeit,Aktion,Person,Rolle,Team,Spiel,Details';
  const rows=sorted.map(e=>[
    e.ts?new Date(e.ts).toLocaleString('de-DE'):'',
    e.action||'',
    (e.uname||'').replace(/,/g,' '),
    e.urole||'',
    (e.tname||'').replace(/,/g,' '),
    (e.gname||'').replace(/,/g,' '),
    (e.data||'').replace(/,/g,' ').replace(/"/g,'').substring(0,100)
  ].map(v=>'"'+v+'"').join(','));
  const csv=header+'\n'+rows.join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='venturelab_log_'+new Date().toISOString().split('T')[0]+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  showToast('📥 CSV exportiert','success');
}

// ── PAPIERKORB (Recycle Bin) ──────────────────────────────────────────────────
function renderPapierkorb(){
  const el=document.getElementById('pkorContent');
  if(!el) return;
  // Update badge
  const badge=document.getElementById('pkorCount');
  if(badge){ badge.textContent=DELETED_ITEMS.length; badge.style.display=DELETED_ITEMS.length>0?'inline-flex':'none'; }
  if(DELETED_ITEMS.length===0){
    el.innerHTML='<div class="empty-state"><div class="empty-icon">🗑️</div><h3>Papierkorb leer</h3><p>Gelöschte Elemente erscheinen hier und können wiederhergestellt werden.</p></div>';
    return;
  }
  const sorted=[...DELETED_ITEMS].reverse();
  const typeLabels={member:'👤 Mitglied',team:'👥 Team',transaction:'💳 Buchung',reflection:'📝 Reflexion',message:'✉️ Nachricht'};
  el.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:14px;color:var(--gray-mid);">${DELETED_ITEMS.length} gelöschte Elemente · werden nach 30 Tagen endgültig entfernt</div>
      <button class="btn btn-outline" onclick="clearOldDeletedItems()" style="font-size:12px;">🧹 Alte löschen</button>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="text-align:left;border-bottom:2px solid #eee;">
        <th style="padding:8px 10px;">Typ</th>
        <th style="padding:8px 10px;">Element</th>
        <th style="padding:8px 10px;">Gelöscht am</th>
        <th style="padding:8px 10px;">Aktion</th>
      </tr></thead>
      <tbody>
        ${sorted.map(item=>`
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 10px;">${typeLabels[item.type]||item.type}</td>
            <td style="padding:8px 10px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${item.label||''}">${item.label||'—'}</td>
            <td style="padding:8px 10px;color:var(--gray-mid);">${item.deletedAt?new Date(item.deletedAt).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td>
            <td style="padding:8px 10px;white-space:nowrap;">
              <button class="btn btn-outline" style="font-size:11px;padding:4px 10px;" onclick="restoreDeletedItem('${item.id}')">↩ Wiederherstellen</button>
              <button class="btn" style="font-size:11px;padding:4px 10px;background:#C00000;margin-left:4px;" onclick="permanentlyDeleteItem('${item.id}')">✕ Endgültig löschen</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}
function restoreDeletedItem(delId){
  const item=DELETED_ITEMS.find(d=>d.id===delId);
  if(!item){showToast('Element nicht gefunden','error');return;}
  if(item.type==='member'){
    MEMBERS.push(item.data);
    rebuildCodes();
    showToast('↩ '+item.data.name+' wiederhergestellt','success');
    logEvent('↩ Mitglied wiederhergestellt aus Papierkorb: '+item.data.name);
  } else if(item.type==='team'){
    TEAMS.push(item.data.team);
    (item.data.members||[]).forEach(m=>MEMBERS.push(m));
    const g=GAMES.find(x=>x.id===item.data.team.gameId);
    if(g) g.teamCount=TEAMS.filter(t=>t.gameId===g.id).length;
    rebuildCodes();
    showToast('↩ Team "'+item.data.team.name+'" wiederhergestellt','success');
    logEvent('↩ Team wiederhergestellt aus Papierkorb: '+item.data.team.name);
  } else if(item.type==='transaction'){
    TRANSACTIONS.push(item.data);
    const team=TEAMS.find(t=>t.id===item.data.teamId);
    if(team){
      const txs=TRANSACTIONS.filter(t=>t.teamId===team.id);
      team.revenue=txs.filter(t=>t.type==='income'&&t.cat!=='Kapital').reduce((s,t)=>s+t.amount,0);
      team.expenses=txs.filter(t=>t.type==='expense'&&t.cat!=='Kapital').reduce((s,t)=>s+t.amount,0);
      team.capital=txs.filter(t=>t.cat==='Kapital').reduce((s,t)=>s+t.amount,0);
      team.transactions=txs.length;
    }
    buildTicker();
    showToast('↩ Buchung wiederhergestellt','success');
  } else if(item.type==='reflection'){
    REFLECTIONS.push(item.data);
    showToast('↩ Reflexion wiederhergestellt','success');
  } else if(item.type==='message'){
    MESSAGES.push(item.data);
    buildNavigation();
    showToast('↩ Nachricht wiederhergestellt','success');
  }
  const idx=DELETED_ITEMS.findIndex(d=>d.id===delId);
  if(idx>=0) DELETED_ITEMS.splice(idx,1);
  saveData();
  renderPapierkorb();
  if(state.currentPage==='admin') setTimeout(renderAdminPage,100);
}
function permanentlyDeleteItem(delId){
  const item=DELETED_ITEMS.find(d=>d.id===delId);
  if(!item) return;
  if(!confirm('Element endgültig löschen? Dies kann nicht rückgängig gemacht werden.')) return;
  const idx=DELETED_ITEMS.findIndex(d=>d.id===delId);
  if(idx>=0) DELETED_ITEMS.splice(idx,1);
  saveData();
  renderPapierkorb();
  showToast('🗑️ Endgültig gelöscht','info');
}
function clearOldDeletedItems(){
  const cutoff=Date.now()-30*24*60*60*1000;
  const before=DELETED_ITEMS.length;
  for(let i=DELETED_ITEMS.length-1;i>=0;i--){
    if(new Date(DELETED_ITEMS[i].deletedAt).getTime()<cutoff) DELETED_ITEMS.splice(i,1);
  }
  const removed=before-DELETED_ITEMS.length;
  saveData();renderPapierkorb();
  showToast('🧹 '+removed+' alte Einträge entfernt','info');
}

// ── ADMIN PROFILE PANEL ──────────────────────────────────────────────────────
function renderAdminProfilePanel(){
  const el=document.getElementById('adminProfilContent');
  if(!el) return;
  const u=state.currentUser;
  if(!u) return;
  // Get admin record
  const adminRec=ADMINS.find(a=>a.id===u.adminId||a.code===u.code);
  if(!adminRec){
    el.innerHTML='<div class="empty-state"><div class="empty-icon">👤</div><h3>Kein Admin-Profil gefunden</h3></div>';
    return;
  }
  el.innerHTML=`
    <div class="section-header"><div class="section-title admin-title">👤 Mein Profil bearbeiten</div></div>
    <div class="card"><div class="card-body">
      <div class="info-box blue" style="margin-bottom:16px;"><span class="info-box-icon">ℹ️</span>Dein Name, E-Mail und Telefonnummer werden im <strong>Kontakt-Verzeichnis</strong> für alle Teilnehmer sichtbar angezeigt.</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-control" id="adminProfName" value="${adminRec.name||''}" placeholder="Dein Name">
        </div>
        <div class="form-group">
          <label class="form-label">E-Mail</label>
          <input class="form-control" type="email" id="adminProfEmail" value="${adminRec.email||''}" placeholder="dozent@hochschule.de">
        </div>
      </div>
      <div class="form-group" style="max-width:300px;">
        <label class="form-label">📞 Telefon / Mobil</label>
        <input class="form-control" id="adminProfPhone" value="${adminRec.phone||''}" placeholder="+49 170 1234567">
        <small style="color:var(--gray-mid);font-size:11px;">Wird im Kontakt-Verzeichnis angezeigt (optional)</small>
      </div>
      <div class="form-group" style="max-width:300px;">
        <label class="form-label">Büro / Sprechstunde (optional)</label>
        <input class="form-control" id="adminProfOffice" value="${adminRec.office||''}" placeholder="Raum A123, Di 10-12 Uhr">
      </div>
      <button class="btn btn-primary" onclick="saveAdminProfile('${adminRec.id}')">💾 Profil speichern</button>
    </div></div>
    <div class="card" style="margin-top:16px;"><div class="card-body">
      <div class="section-header"><div class="section-title admin-title" style="font-size:14px;">🔑 Passwort ändern</div></div>
      <div class="form-group" style="max-width:300px;">
        <label class="form-label">Neues Passwort</label>
        <input class="form-control" type="password" id="adminProfPwd1" placeholder="Neues Passwort">
      </div>
      <div class="form-group" style="max-width:300px;">
        <label class="form-label">Passwort bestätigen</label>
        <input class="form-control" type="password" id="adminProfPwd2" placeholder="Passwort wiederholen">
      </div>
      <button class="btn btn-secondary" onclick="saveAdminPassword('${adminRec.code}')">🔒 Passwort ändern</button>
    </div></div>`;
}
async function saveAdminProfile(adminId){
  const adminRec=ADMINS.find(a=>a.id===adminId);
  if(!adminRec) return;
  adminRec.name=document.getElementById('adminProfName').value.trim()||adminRec.name;
  adminRec.email=document.getElementById('adminProfEmail').value.trim();
  adminRec.phone=document.getElementById('adminProfPhone').value.trim();
  adminRec.office=document.getElementById('adminProfOffice').value.trim();
  // Update state
  if(state.currentUser){
    state.currentUser.name=adminRec.name;
    state.currentUser.email=adminRec.email;
  }
  // Update CODES entry
  if(adminRec.code && CODES[adminRec.code]){
    CODES[adminRec.code].name=adminRec.name;
    CODES[adminRec.code].email=adminRec.email;
  }
  saveData();
  showToast('Profil gespeichert','success');
  logEvent('admin_profile_update',{adminId,name:adminRec.name});
}
async function saveAdminPassword(adminCode){
  const p1=document.getElementById('adminProfPwd1').value;
  const p2=document.getElementById('adminProfPwd2').value;
  if(!p1){showToast('Bitte Passwort eingeben','error');return;}
  if(p1!==p2){showToast('Passwörter stimmen nicht überein','error');return;}
  if(p1.length<4){showToast('Passwort muss mindestens 4 Zeichen haben','error');return;}
  const hash=await sha256(p1);
  const pwdData=JSON.parse(localStorage.getItem('5euro_passwords')||'{}');
  pwdData[adminCode]=hash;
  localStorage.setItem('5euro_passwords',JSON.stringify(pwdData));
  saveData();
  document.getElementById('adminProfPwd1').value='';
  document.getElementById('adminProfPwd2').value='';
  showToast('Passwort geändert','success');
  logEvent('admin_password_change',{code:adminCode});
}

// Emoji Picker for Teams
function openEmojiPickerForTeam(teamId){
  const team=TEAMS.find(t=>t.id===teamId);
  if(!team) return;
  const emojis=['🚀','💡','🌿','📋','🔥','⚡','🌟','🎯','💎','🏆','🎪','🛒','📱','🤝','🌈','🍀','🦁','🐉','🎭','🎨'];
  const chosen=prompt('Wähle ein Emoji für '+team.name+':\n'+emojis.join(' ')+'\n\nOder gib ein eigenes Emoji ein:',team.logo||'🚀');
  if(chosen&&chosen.trim()){
    team.logo=chosen.trim().substring(0,2);
    saveData();rebuildCodes();
    renderAdminTeamsTable();
    showToast('✅ Emoji für '+team.name+' geändert','success');
  }
}

function changTeamEmoji(){
  const team=getMyTeam();if(!team) return;
  const emojis=['🚀','💡','🌿','📋','🔥','⚡','🌟','🎯','💎','🏆','🎪','🛒','📱','🤝','🌈','🍀','🦁','🐉','🎭','🎨'];
  const chosen=prompt('Emoji ändern:\n'+emojis.join(' ')+'\n\nOder eigenes Emoji eingeben:',team.logo||'🚀');
  if(chosen&&chosen.trim()){
    team.logo=chosen.trim().substring(0,2);
    saveData();rebuildCodes();
    renderMyTeam();
    showToast('✅ Emoji geändert: '+team.logo,'success');
  }
}

