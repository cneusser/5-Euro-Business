// ════════════════════════════════════════════════════════════════════
//  MY TEAM PAGE
// ════════════════════════════════════════════════════════════════════
function switchMyTeamTab(tab){
  state.currentMyTeamTab=tab;
  document.querySelectorAll('#page-myteam .profile-tab').forEach(b=>b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.querySelectorAll('#page-myteam .profile-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('myteamPanel-'+tab)?.classList.add('active');
  renderMyTeamPanel(tab);
}

function renderMyTeam(){
  const team=getMyTeam();if(!team)return;
  setTimeout(renderTeamAnnouncements,100);
  // Hero
  const logoHtml=team.logoDataUrl?`<img src="${team.logoDataUrl}" style="width:56px;height:56px;border-radius:12px;object-fit:cover;border:3px solid rgba(255,255,255,.4);">`:`<span style="font-size:40px;">${team.logo}</span>`;
  document.getElementById('myTeamHero').style.background=`linear-gradient(135deg,${team.color}EE,${team.color}88)`;
  const members=MEMBERS.filter(m=>m.teamId===team.id);
  const allTeams=getVisibleTeams();
  const sorted=[...allTeams].sort((a,b)=>(b.revenue-b.expenses)-(a.revenue-a.expenses));
  const rank=sorted.findIndex(t=>t.id===team.id)+1;
  document.getElementById('myTeamHero').innerHTML=`
    <div style="display:flex;align-items:center;gap:16px;">
      ${logoHtml}
      <div>
        <div style="font-size:22px;font-weight:800;margin-bottom:2px;">${team.name}</div>
        <div style="font-size:13px;opacity:.85;font-style:italic;">${team.slogan||''}</div>
        <div style="font-size:12px;opacity:.75;margin-top:2px;">${team.biz}</div>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
          ${members.map(m=>`<span style="background:rgba(255,255,255,.25);padding:2px 9px;border-radius:20px;font-size:11px;">👤 ${m.name} <span style="opacity:.7;">(${m.role})</span></span>`).join('')}
        </div>
      </div>
    </div>
    <div style="text-align:center;background:rgba(255,255,255,.2);border-radius:12px;padding:12px 20px;flex-shrink:0;">
      <div style="font-size:40px;font-weight:900;">#${rank}</div>
      <div style="font-size:11px;opacity:.8;">von ${allTeams.length} Teams</div>
      <div style="margin-top:6px;"><span class="tag ${team.weekStatus==='approved'?'tag-green':team.weekStatus==='submitted'?'tag-orange':'tag-blue'}" style="font-size:12px;">Woche ${team.currentWeek} ${team.weekStatus==='submitted'?'⏳':team.weekStatus==='approved'?'✅':'📝'}</span></div>
    </div>`;
  // Week steps
  renderWeekSteps(team);
  renderMyTeamPanel(state.currentMyTeamTab||'overview');
}

function renderWeekSteps(team){
  const _wsGame=GAMES.find(g=>g.id===team.gameId);
  const totalWeeks=_wsGame?.maxWeeks||6;
  const el=document.getElementById('weekSteps');
  el.innerHTML=Array.from({length:totalWeeks},(_,i)=>{
    const w=i+1;
    const isDone=w<team.currentWeek;
    const isCurrent=w===team.currentWeek;
    const isPending=isCurrent&&team.weekStatus==='submitted';
    const cls=isDone?'done':isPending?'pending':isCurrent?'active':'';
    const statusText=isDone?'✅ Abgeschlossen':isPending?'⏳ Warten auf Freigabe':isCurrent?'📝 Aktuell':'—';
    return `<div class="week-step ${cls}"><div class="week-step-num">${w}</div><div class="week-step-lbl">Woche ${w}</div><div class="week-step-status" style="color:${isDone?'var(--green)':isPending?'var(--orange)':isCurrent?'var(--blue-mid)':'var(--gray-mid)'}">${statusText}</div></div>`;
  }).join('');
  const banner=document.getElementById('weekBanner');
  if(team.weekStatus==='submitted'){
    banner.className='week-banner submitted';banner.innerHTML='⏳ <strong>Wochenbericht eingereicht</strong> – wartet auf Freigabe durch den Admin. Danach startet Woche '+(team.currentWeek+1)+' automatisch.';
  } else if(team.weekStatus==='approved'){
    banner.className='week-banner approved';banner.innerHTML='✅ <strong>Freigabe erhalten!</strong> Woche '+(team.currentWeek-1)+' abgeschlossen. Ihr seid jetzt in Woche '+team.currentWeek+'.';
  } else {
    banner.className='week-banner open';banner.innerHTML='📝 <strong>Woche '+team.currentWeek+' läuft</strong> – Buchungen erfassen und am Ende Wochenbericht einreichen.';
  }
}

function renderMyTeamPanel(tab){
  const team=getMyTeam();if(!team)return;
  if(tab==='overview') renderMyTeamOverview(team);
  else if(tab==='profil') renderTeamProfileForm(team);
  else if(tab==='members') renderMembersSection(team);
  else if(tab==='transactions') renderMyTransactions(team);
  else if(tab==='kassenbuch') renderKassenbuch(team);
  else if(tab==='blogs') renderMyBlogs(team);
}

function renderMyTeamOverview(team){
  const myTx=TRANSACTIONS.filter(tx=>tx.teamId===team.id);
  const profit=team.revenue-team.expenses;
  document.getElementById('myTeamKpis').innerHTML=`
    <div class="kpi-card"><div class="kpi-label">Umsatz</div><div class="kpi-value">${fmtEur(team.revenue)}</div><div class="kpi-trend">${myTx.filter(t=>t.type==='income'&&t.cat!=='Kapital').length} Einnahmen</div></div>
    <div class="kpi-card"><div class="kpi-label">Ausgaben</div><div class="kpi-value neg">${fmtEur(team.expenses)}</div><div class="kpi-trend">${myTx.filter(t=>t.type==='expense'&&t.cat!=='Kapital').length} Ausgaben</div></div>
    <div class="kpi-card"><div class="kpi-label">Gewinn</div><div class="kpi-value ${profit>=0?'pos':'neg'}">${profit>=0?'+':''}${fmtEur(profit)}</div></div>
    <div class="kpi-card"><div class="kpi-label">ROI</div><div class="kpi-value ${profit>=0?'pos':'neg'}">${((profit/(team.capital||5))*100).toFixed(0)}%</div><div class="kpi-trend">auf ${fmtEur(team.capital||5)} Start</div></div>
    ${team.capital?`<div class="kpi-card" style="border-left:3px solid var(--blue-mid);"><div class="kpi-label">Startkapital</div><div class="kpi-value" style="color:var(--blue-mid);">${fmtEur(team.capital)}</div><div class="kpi-trend">Basis für ROI</div></div>`:''}`;
  // MVP section
  const mvpEl=document.getElementById('myTeamMvpSection');
  const mvps=team.mvps||[];
  if(mvps.length===0){mvpEl.innerHTML='<div class="empty-state"><div class="empty-icon">🏆</div><h3>Noch kein MVP gewählt</h3><p>Im Wochenbericht kannst du ein Mitglied der Woche wählen.</p></div>';return;}
  mvpEl.innerHTML=`<div class="section-header"><div class="section-title">🏆 Mitglied der Woche</div></div>`+
    mvps.map(mv=>{const m=MEMBERS.find(x=>x.id===mv.memberId);return `<div class="mvp-card"><div class="mvp-card-title">🏆 Woche ${mv.week} – Mitglied der Woche</div><div style="display:flex;gap:12px;align-items:center;">
      <div class="member-avatar" style="background:${team.color};width:44px;height:44px;">${m?.avatarDataUrl?`<img src="${m.avatarDataUrl}">`:(m?.name?.charAt(0)||'?')}</div>
      <div><div style="font-weight:700;font-size:14px;">${m?.name||'—'}</div><div style="font-size:12px;color:var(--gray-mid);">${mv.reason}</div></div>
      <span class="mvp-badge" style="margin-left:auto;">🏆 MVP W${mv.week}</span></div></div>`;}).join('');
  // Blog status – v0.8.6: use game.maxWeeks, pick best status when duplicate entries exist
  const _bsGame=GAMES.find(g=>g.id===team.gameId);
  const _bsMax=_bsGame?.maxWeeks||6;
  document.getElementById('myTeamBlogStatus').innerHTML=`<div class="section-header"><div class="section-title">📋 Berichtsstatus</div></div>`+
    Array.from({length:_bsMax},(_,i)=>i+1).map(w=>{
      const _bws=BLOGS.filter(b=>b.teamId===team.id&&b.week===w);
      const blog=_bws.find(b=>b.status==='approved')||_bws.find(b=>b.status==='pending')||_bws.find(b=>b.status==='submitted')||_bws[0];
      const s=blog?blog.status:'missing';
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:white;border-radius:8px;margin-bottom:6px;box-shadow:var(--shadow);">
        <span style="font-size:13px;font-weight:600;">Woche ${w}</span>
        <span class="blog-status status-${s==='missing'?'draft':s}">${s==='approved'?'✅ Freigegeben':s==='pending'?'⏳ In Prüfung':s==='rejected'?'❌ Abgelehnt':s==='draft'?'📄 Entwurf':'— Noch offen'}</span>
      </div>`;}).join('');
}

function renderTeamProfileForm(team){
  document.getElementById('teamProfileForm').innerHTML=`
    <div class="form-section-title">Team-Profil bearbeiten</div>
    <div class="form-group"><label class="form-label">Team-Name <span class="req">*</span></label>
      <input class="form-control" id="tpName" value="${team.name}"></div>
    <div class="form-group"><label class="form-label">Slogan</label>
      <input class="form-control" id="tpSlogan" value="${team.slogan||''}" placeholder="Euer Unternehmens-Slogan"></div>
    <div class="form-group"><label class="form-label">Geschäftsidee / Beschreibung</label>
      <input class="form-control" id="tpBiz" value="${team.biz}"></div>
    <div class="form-group"><label class="form-label">Detaillierte Beschreibung</label>
      <textarea class="form-control" id="tpDesc" rows="3" placeholder="Beschreibt euer Business ausführlicher...">${team.desc||''}</textarea></div>
    <div class="form-group"><label class="form-label">Team-Emoji</label>
    <div style="display:flex;align-items:center;gap:10px;">
      <span id="tpLogoPreview" style="font-size:28px;">${team.logo}</span>
      <button class="btn btn-outline btn-sm" type="button" onclick="changTeamEmoji()">Emoji ändern</button>
    </div></div>
    <button class="btn btn-primary btn-sm" onclick="saveTeamProfile()">💾 Speichern</button>`;
  document.getElementById('logoUploadSection').innerHTML=`
    <div class="form-section-title">Team-Logo</div>
    ${team.logoDataUrl?`<div style="margin-bottom:12px;"><img src="${team.logoDataUrl}" style="width:80px;height:80px;border-radius:12px;object-fit:cover;border:2px solid var(--blue-light);"><br><button class="btn btn-secondary btn-xs" style="margin-top:6px;" onclick="removeLogo()">🗑️ Entfernen</button></div>`:''}
    <div class="upload-zone" onclick="document.getElementById('logoFile').click()">
      <div class="upload-icon">🖼️</div>
      <p>Logo hochladen<br>JPG, PNG bis 2 MB</p>
      <input type="file" id="logoFile" style="display:none;" accept=".jpg,.jpeg,.png" onchange="handleLogoUpload(event)">
    </div>
    <div class="form-hint" style="margin-top:6px;">Das Logo wird auf Teamkarten und im Ranking angezeigt.</div>`;
}

function renderTeamAnnouncements(){
  const team=getMyTeam();
  if(!team) return;
  const u=state.currentUser;
  const relevant=ANNOUNCEMENTS.filter(function(a){
    return a.gameId===team.gameId&&(a.teamId===null||a.teamId===''||a.teamId===team.id);
  }).sort(function(a,b){return new Date(b.ts)-new Date(a.ts);}).slice(0,5);
  const el=document.getElementById('teamAnnouncements');
  if(!el||relevant.length===0) return;
  el.innerHTML='<div class="section-header" style="margin-top:20px;"><div class="section-title">Ankuendigungen</div></div>'
    +relevant.map(function(a){
      return '<div class="announce-card'+(a.pinned?' pinned':'')+'"><div class="announce-title">'+(a.pinned?'X ':'')+a.title+'</div><div style="font-size:13px;white-space:pre-wrap;">'+a.text+'</div><div class="announce-meta">Von '+a.from+' &middot; '+new Date(a.ts).toLocaleDateString('de-DE')+'</div></div>';
    }).join('');
}
function renderMembersSection(team){
  const members=MEMBERS.filter(m=>m.teamId===team.id);
  const u=state.currentUser;
  const myMemberId=u.memberId||null;
  document.getElementById('membersSection').innerHTML=`
    <div class="section-header"><div class="section-title">👥 Teammitglieder</div></div>
    <div class="info-box blue"><span class="info-box-icon">ℹ️</span>Jedes Mitglied kann sein eigenes Profil mit seinem persönlichen Login-Code bearbeiten (MBR-XX-N).</div>
    <div class="member-grid">${members.map(m=>{
      const isMe=m.id===myMemberId;
      const avatarHtml=m.avatarDataUrl?`<img src="${m.avatarDataUrl}">`:(m.name.charAt(0));
      return `<div class="member-card ${isMe?'is-me':''}">
        <div class="member-avatar" style="background:${team.color};">${avatarHtml}</div>
        <div class="member-info">
          <div class="member-info-name">${m.name} ${isMe?'<span style="color:var(--blue-mid);font-size:10px;">(Du)</span>':''}</div>
          <div class="member-role-badge">${m.role==="CEO"?"👑 CEO":m.role==="CFO"?"💰 CFO":m.role} · ${m.title}</div>
          <div class="member-bio">${m.bio||'Noch keine Bio.'}</div>
          ${isMe?`<button class="btn btn-outline btn-xs" style="margin-top:6px;" onclick="navigateTo('profile')">✏️ Bearbeiten</button>`:`<div style="font-size:10px;color:var(--gray-mid);margin-top:4px;">Code: <code>${m.code}</code></div>`}
        </div>
      </div>`;}).join('')}</div>`;
  // CEO management tab visibility
  const ceotab=document.getElementById('ceomgmtTab');
  const cusr=state.currentUser;
  const myMem=MEMBERS.find(mb=>mb.code===cusr.code);
  if(ceotab) ceotab.style.display=(myMem?.role==='CEO'||cusr.role==='admin'||cusr.role==='superadmin')?'':'none';
  // Kassenbuch tab visibility (for CEO and CFO)
  const kassenbuchTab=document.getElementById('kassenbuchTab');
  if(kassenbuchTab) kassenbuchTab.style.display=(myMem?.role==='CFO'||myMem?.role==='CEO'||cusr.role==='admin'||cusr.role==='superadmin')?'':'none';
}

function renderMyTransactions(team){
  const myTx=TRANSACTIONS.filter(tx=>tx.teamId===team.id).sort((a,b)=>b.date.localeCompare(a.date));
  const u=state.currentUser;
  const me=getMyMember();
  const isCFO=me&&me.role==='CFO';
  const isAdmin=u.role==='admin'||u.role==='superadmin'||u.role==='team';
  const canEdit=isCFO||isAdmin;
  document.getElementById('myTxTable').innerHTML=`
    <div class="tx-row header"><div>Datum</div><div>Typ</div><div>Beschreibung</div><div>Kategorie</div><div>Betrag</div><div>Beleg</div>${canEdit?'<div>CFO</div>':''}</div>`+
    myTx.map(tx=>{
      const isKapital=tx.cat==='Kapital';
      const rowStyle=isKapital?'background:var(--blue-xlt);':'';
      const typeTag=isKapital
        ?'<span class="tag" style="background:var(--blue-light);color:var(--blue-dark);">🏦 Kapital</span>'
        :`<span class="tag ${tx.type==='income'?'tag-green':''}" style="${tx.type==='expense'?'background:var(--red-lt);color:var(--red);':''}">${tx.type==='income'?'📈':'📉'}</span>`;
      const amt=isKapital
        ?`<span class="tx-amt" style="color:var(--blue-mid);">${fmtEur(tx.amount)}</span>`
        :`<span class="tx-amt ${tx.type==='income'?'pos':'neg'}">${tx.type==='income'?'+':'-'}${fmtEur(tx.amount)}</span>`;
      const editBtns=canEdit
        ?`<div style="display:flex;gap:4px;"><button class="btn btn-outline btn-xs" title="Bearbeiten" onclick="editTransaction('${tx.id}')">✏️</button><button class="btn btn-danger btn-xs" title="Löschen" onclick="deleteTransaction('${tx.id}')">✕</button></div>`
        :'';
      return `<div class="tx-row" style="${rowStyle}">
        <div style="color:var(--gray-mid)">${fmtDate(tx.date)}</div>
        <div>${typeTag}</div>
        <div>${tx.desc}</div><div style="color:var(--gray-mid)">${tx.cat}</div>
        ${amt}
        <div>${tx.receipt?`<span style="color:var(--green);cursor:pointer;text-decoration:underline dotted;" title="${(tx.receipt.name||'Beleg')} – klicken zum Anzeigen" onclick="viewReceipt('${tx.id}')">✅ Beleg</span>`:'—'}</div>
        ${canEdit?editBtns:''}
      </div>`;
    }).join('');
}
function viewReceipt(txId){
  const tx=TRANSACTIONS.find(t=>t.id===txId);
  if(!tx||!tx.receipt||!tx.receipt.data){showToast('Kein Beleg vorhanden','error');return;}
  const r=tx.receipt;
  try{
    const byteStr=atob(r.data.split(',')[1]);
    const bytes=new Uint8Array(byteStr.length);
    for(let i=0;i<byteStr.length;i++) bytes[i]=byteStr.charCodeAt(i);
    const blob=new Blob([bytes],{type:r.type||'image/jpeg'});
    const url=URL.createObjectURL(blob);
    const w=window.open(url,'_blank');
    if(w) w.document.title=r.name||'Beleg';
  }catch(e){
    // Fallback: direct data URL
    const w=window.open(r.data,'_blank');
    if(w) w.document.title=r.name||'Beleg';
  }
}
function editTransaction(txId){
  const tx=TRANSACTIONS.find(t=>t.id===txId);if(!tx) return;
  // pre-fill modal
  openModal('modalBooking');
  setTimeout(function(){
    const bDesc=document.getElementById('bDesc');if(bDesc) bDesc.value=tx.desc;
    const bAmt=document.getElementById('bAmount');if(bAmt) bAmt.value=tx.amount;
    const bDate=document.getElementById('bDate');if(bDate) bDate.value=tx.date;
    const bCat=document.getElementById('bCat');if(bCat) bCat.value=tx.cat;
    const bType=document.getElementById('bType');if(bType) bType.value=tx.type;
    // Store txId being edited so submitBooking knows to update
    document.getElementById('modalBooking').dataset.editTxId=txId;
    const hdr=document.querySelector('#modalBooking .modal-header h3');
    if(hdr) hdr.innerHTML='💰 Buchung bearbeiten <span style="font-size:11px;font-weight:400;opacity:.7;">(CFO-Korrektur)</span>';
  },80);
}
function deleteTransaction(txId){
  if(!confirm('Buchung wirklich löschen?')) return;
  const tx=TRANSACTIONS.find(t=>t.id===txId);if(!tx) return;
  const txSnap=JSON.parse(JSON.stringify(tx));
  const team=TEAMS.find(t=>t.id===tx.teamId);
  TRANSACTIONS.splice(TRANSACTIONS.indexOf(tx),1);
  function recalcTeam(t){
    if(!t) return;
    const txs=TRANSACTIONS.filter(x=>x.teamId===t.id);
    t.revenue=txs.filter(x=>x.type==='income'&&x.cat!=='Kapital').reduce((s,x)=>s+x.amount,0);
    t.expenses=txs.filter(x=>x.type==='expense'&&x.cat!=='Kapital').reduce((s,x)=>s+x.amount,0);
    t.capital=txs.filter(x=>x.cat==='Kapital').reduce((s,x)=>s+x.amount,0);
    t.transactions=txs.length;
  }
  recalcTeam(team);
  logEvent('tx_delete',{desc:txSnap.desc,amount:txSnap.amount,teamId:txSnap.teamId});
  if(DELETED_ITEMS.length>=100) DELETED_ITEMS.shift();
  DELETED_ITEMS.push({id:'del_'+Date.now(),type:'transaction',deletedAt:new Date().toISOString(),label:'Buchung: '+txSnap.desc+' ('+txSnap.amount+'€, '+(team?.name||txSnap.teamId)+')',data:txSnap});
  saveData();buildTicker();
  showUndoToast('🗑️ Buchung gelöscht', ()=>{
    TRANSACTIONS.push(txSnap);
    recalcTeam(TEAMS.find(t=>t.id===txSnap.teamId));
    DELETED_ITEMS.splice(DELETED_ITEMS.findIndex(d=>d.data.id===txSnap.id),1);
    saveData();buildTicker();
    if(state.currentPage==='myteam') renderMyTeamPanel('transactions');
    else if(state.currentPage==='tx') renderTxPage();
    else if(state.currentPage==='admin') renderAdminPage();
  });
  if(state.currentPage==='myteam') renderMyTeamPanel('transactions');
  else if(state.currentPage==='tx') renderTxPage();
  else if(state.currentPage==='admin') renderAdminPage();
}

function renderKassenbuch(team){
  const txs=TRANSACTIONS.filter(t=>t.teamId===team.id).sort((a,b)=>a.date.localeCompare(b.date));
  let saldo=0;
  const rows=txs.map(tx=>{
    const soll=tx.type==='expense'?tx.amount:0;
    const haben=tx.type==='income'?tx.amount:0;
    saldo+=(haben-soll);
    return {tx,soll,haben,saldo};
  });
  const el=document.getElementById('myTeamContent');
  if(!el) return;
  el.innerHTML=`
    <div class="section-header"><div class="section-title">📒 Kassenbuch</div></div>
    <div style="overflow-x:auto;">
    <table class="data-table" style="width:100%;min-width:550px;">
      <thead><tr>
        <th>Datum</th><th>Beschreibung</th><th>Kategorie</th>
        <th style="text-align:right;color:var(--red);">Soll (−)</th>
        <th style="text-align:right;color:var(--green);">Haben (+)</th>
        <th style="text-align:right;font-weight:800;">Saldo</th>
      </tr></thead>
      <tbody>
      ${rows.length===0?'<tr><td colspan="6" style="text-align:center;color:var(--gray-mid);padding:20px;">Keine Buchungen vorhanden</td></tr>':
        rows.map(({tx,soll,haben,saldo:s})=>`<tr>
          <td style="white-space:nowrap;color:var(--gray-mid);">${fmtDate(tx.date)}</td>
          <td>${tx.desc}</td>
          <td style="font-size:11px;color:var(--gray-mid);">${tx.cat}</td>
          <td style="text-align:right;color:var(--red);font-weight:600;">${soll>0?fmtEur(soll):'—'}</td>
          <td style="text-align:right;color:var(--green);font-weight:600;">${haben>0?fmtEur(haben):'—'}</td>
          <td style="text-align:right;font-weight:700;color:${s>=0?'var(--green)':'var(--red)'};">${s>=0?'+':''}${fmtEur(s)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr style="background:var(--gray-lt);font-weight:700;">
        <td colspan="3" style="padding:8px 10px;">Summe</td>
        <td style="text-align:right;color:var(--red);">${fmtEur(rows.reduce((s,r)=>s+r.soll,0))}</td>
        <td style="text-align:right;color:var(--green);">${fmtEur(rows.reduce((s,r)=>s+r.haben,0))}</td>
        <td style="text-align:right;color:${saldo>=0?'var(--green)':'var(--red)'};">${saldo>=0?'+':''}${fmtEur(saldo)}</td>
      </tr></tfoot>
    </table></div>
    <div style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
      <div class="stat-card green"><div class="stat-label">Einnahmen (Haben)</div><div class="stat-value">${fmtEur(rows.reduce((s,r)=>s+r.haben,0))}</div></div>
      <div class="stat-card" style="border-left:4px solid var(--red);"><div class="stat-label">Ausgaben (Soll)</div><div class="stat-value" style="color:var(--red);">${fmtEur(rows.reduce((s,r)=>s+r.soll,0))}</div></div>
      <div class="stat-card ${saldo>=0?'green':''}"><div class="stat-label">Kassensaldo</div><div class="stat-value" style="color:${saldo>=0?'var(--green)':'var(--red)'};">${saldo>=0?'+':''}${fmtEur(saldo)}</div></div>
    </div>`;
}

function openAdminKassenbuch(teamId){
  const team=TEAMS.find(t=>t.id===teamId);
  if(!team) return;
  const txs=TRANSACTIONS.filter(t=>t.teamId===teamId).sort((a,b)=>a.date.localeCompare(b.date));
  let saldo=0;
  const rows=txs.map(tx=>{
    const soll=tx.type==='expense'?tx.amount:0;
    const haben=tx.type==='income'?tx.amount:0;
    saldo+=(haben-soll);
    return {tx,soll,haben,saldo};
  });
  const modal=document.getElementById('modalAdminKassenbuch');
  document.getElementById('adminKassenbuchTitle').textContent=team.logo+' '+team.name+' – Kassenbuch';
  document.getElementById('adminKassenbuchBody').innerHTML=`
    <div style="overflow-x:auto;">
    <table class="data-table" style="width:100%;min-width:500px;">
      <thead><tr><th>Datum</th><th>Beschreibung</th><th>Kat.</th><th style="text-align:right;color:var(--red);">Soll</th><th style="text-align:right;color:var(--green);">Haben</th><th style="text-align:right;">Saldo</th></tr></thead>
      <tbody>${rows.length===0?'<tr><td colspan="6" style="text-align:center;padding:16px;color:var(--gray-mid);">Keine Buchungen</td></tr>':rows.map(({tx,soll,haben,saldo:s})=>`<tr><td style="color:var(--gray-mid);white-space:nowrap;">${fmtDate(tx.date)}</td><td>${tx.desc}</td><td style="font-size:11px;">${tx.cat}</td><td style="text-align:right;color:var(--red);font-weight:600;">${soll>0?fmtEur(soll):'—'}</td><td style="text-align:right;color:var(--green);font-weight:600;">${haben>0?fmtEur(haben):'—'}</td><td style="text-align:right;font-weight:700;color:${s>=0?'var(--green)':'var(--red)'};">${s>=0?'+':''}${fmtEur(s)}</td></tr>`).join('')}</tbody>
      <tfoot><tr style="background:var(--gray-lt);font-weight:700;"><td colspan="3">Summe</td><td style="text-align:right;color:var(--red);">${fmtEur(rows.reduce((s,r)=>s+r.soll,0))}</td><td style="text-align:right;color:var(--green);">${fmtEur(rows.reduce((s,r)=>s+r.haben,0))}</td><td style="text-align:right;color:${saldo>=0?'var(--green)':'var(--red)'};">${saldo>=0?'+':''}${fmtEur(saldo)}</td></tr></tfoot>
    </table></div>`;
  openModal('modalAdminKassenbuch');
}

function renderMyBlogs(team){
  const me=getMyMember();
  const isCeo=me&&me.role==='CEO';
  // v0.8.6: hide drafts for weeks where a submitted/approved version already exists
  const myBlogs=BLOGS.filter(b=>b.teamId===team.id);
  const nonDraftWeeks=new Set(myBlogs.filter(b=>b.status!=='draft').map(b=>b.week));
  const displayBlogs=myBlogs.filter(b=>!(b.status==='draft'&&nonDraftWeeks.has(b.week)));
  const el=document.getElementById('myBlogList');
  // v0.8.5: button visible to all; label differs by role; submit gated in submitBlog()
  const submitBtn=document.getElementById('btnSubmitBlog');
  if(submitBtn){
    submitBtn.disabled=team.weekStatus==='submitted';
    submitBtn.style.display='';
    submitBtn.textContent=isCeo?'+ Bericht einreichen':'📝 Bericht bearbeiten';
  }
  if(displayBlogs.length===0){el.innerHTML='<div class="empty-state"><div class="empty-icon">📝</div><h3>Noch keine Berichte</h3><p>Reiche deinen ersten Wochenbericht ein!</p></div>';}
  else{
    el.innerHTML=displayBlogs.sort((a,b)=>b.week-a.week).map(b=>{
      const uid='blog-expand-'+b.id;
      const hasBody=(b.body||'').trim().length>0;
      const sections=[
        b.highlight?`<div style="margin-top:10px;background:#FFFBEB;border-radius:6px;padding:8px 12px;"><span style="font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;">⭐ Highlight</span><div style="font-size:13px;margin-top:3px;">${b.highlight}</div></div>`:'',
        b.challenges?`<div style="margin-top:8px;background:#FFF7ED;border-radius:6px;padding:8px 12px;"><span style="font-size:10px;font-weight:700;color:#C2410C;text-transform:uppercase;">⚠️ Herausforderungen</span><div style="font-size:13px;margin-top:3px;">${b.challenges}</div></div>`:'',
        b.nextSteps?`<div style="margin-top:8px;background:#F0FFF4;border-radius:6px;padding:8px 12px;"><span style="font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;">▶️ Nächste Schritte</span><div style="font-size:13px;margin-top:3px;">${b.nextSteps}</div></div>`:'',
        hasBody?`<div style="margin-top:8px;"><span style="font-size:10px;font-weight:700;color:var(--gray-mid);text-transform:uppercase;">Aktivitäten</span><div style="font-size:13px;margin-top:3px;color:var(--gray-dark);white-space:pre-wrap;">${b.body}</div></div>`:''
      ].filter(Boolean).join('');
      // v0.8.5: adminFeedback always visible (not inside collapsible)
      const feedbackHtml=b.adminFeedback?`<div style="margin-top:10px;background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:6px;padding:8px 12px;"><div style="font-size:10px;font-weight:700;color:#1D4ED8;text-transform:uppercase;margin-bottom:3px;">💬 Feedback vom Betreuer</div><div style="font-size:13px;color:#1E3A8A;white-space:pre-wrap;">${b.adminFeedback}</div></div>`:'';
      return `<div class="card" style="margin-bottom:12px;">
        <div class="card-body" style="padding:12px 16px;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:5px;">
            <div><div style="font-size:10px;font-weight:700;color:var(--blue-mid);text-transform:uppercase;margin-bottom:1px;">Woche ${b.week} · ${b.date||''}</div>
              <div style="font-size:14px;font-weight:700;color:var(--blue-dark);">${b.title}</div></div>
            <span class="blog-status status-${b.status}">${b.status==='approved'?'✅ Freigegeben':b.status==='pending'?'⏳ In Prüfung':b.status==='rejected'?'❌ Abgelehnt':'📄 Entwurf'}</span>
          </div>
          ${feedbackHtml}
          ${sections?`<div id="${uid}" style="display:${b.status==='approved'?'block':'none'};">${sections}</div>
          <button class="btn btn-outline btn-xs" style="margin-top:8px;" onclick="const d=document.getElementById('${uid}');const open=d.style.display==='block';d.style.display=open?'none':'block';this.textContent=open?'📖 Volltext lesen':'🔼 Einklappen';">${b.status==='approved'?'🔼 Einklappen':'📖 Volltext lesen'}</button>`:''}
          ${b.attachments&&b.attachments.length?_renderAttachmentLinks(b.attachments):''}
          ${b.status==='draft'&&b.week===team.currentWeek?'<button class="btn btn-outline btn-xs" style="margin-top:6px;" onclick="openBlogModal(\''+b.id+'\')">✏️ Weiterschreiben</button>':''}
        </div>
      </div>`;
    }).join('');
  }
  // Reflections for current member only
  const refEl=document.getElementById('myBlogsReflectionsList');
  if(refEl&&me){
    const myRefs=REFLECTIONS.filter(r=>r.memberId===me.id).sort((a,b)=>b.week-a.week);
    if(myRefs.length===0){refEl.innerHTML='<div class="empty-state" style="padding:20px 0;"><div class="empty-icon">💬</div><p style="color:var(--gray-mid);">Noch keine Reflexionen eingereicht.</p></div>';}
    else{
      refEl.innerHTML=myRefs.map(r=>{
        const moodEmoji=['','😩','😟','😐','😊','🚀'][r.mood||0];
        const uid2='ref-expand-'+r.id;
        const body=[
          r.experience?`<div class="reflection-section"><div class="reflection-section-label">Erfahrungen</div><div class="reflection-text">${r.experience}</div></div>`:'',
          r.liked?`<div class="reflection-section"><div class="reflection-section-label">👍 Was war gut</div><div class="reflection-text">${r.liked}</div></div>`:'',
          r.improved?`<div class="reflection-section"><div class="reflection-section-label">💡 Was ich anders machen würde</div><div class="reflection-text">${r.improved}</div></div>`:'',
          r.role?`<div class="reflection-section"><div class="reflection-section-label">🤝 Meine Rolle</div><div class="reflection-text">${r.role}</div></div>`:''
        ].filter(Boolean).join('');
        return `<div class="reflection-card" style="margin-bottom:10px;">
          <div class="reflection-header" style="cursor:pointer;" onclick="const d=document.getElementById('${uid2}');const open=d.style.display!=='none';d.style.display=open?'none':'block';">
            <div><strong>Woche ${r.week}</strong> · ${fmtDate(r.date)}</div>
            <div style="display:flex;align-items:center;gap:6px;">${moodEmoji} <span style="font-size:13px;font-weight:700;">${r.mood||0}/5</span><span style="font-size:11px;color:var(--gray-mid);">▼</span></div>
          </div>
          <div id="${uid2}" class="reflection-body" style="display:none;">${body||'<em style="color:var(--gray-mid);font-size:12px;">Keine weiteren Inhalte.</em>'}</div>
        </div>`;
      }).join('');
    }
  }
}

