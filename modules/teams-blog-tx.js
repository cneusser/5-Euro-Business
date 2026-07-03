// ════════════════════════════════════════════════════════════════════
//  TEAMS / BLOG / TX PAGES
// ════════════════════════════════════════════════════════════════════
function renderTeamsPage(){
  const teams=getVisibleTeams();
  const sorted=[...teams].sort((a,b)=>(b.revenue-b.expenses)-(a.revenue-a.expenses));
  const u=state.currentUser;const myTeam=getMyTeam();
  document.getElementById('teamsGrid').innerHTML=sorted.map((team,i)=>{
    const profit=team.revenue-team.expenses;
    const roi=((profit/(team.capital||5))*100).toFixed(0);
    const progress=Math.min((team.revenue/team.weekGoal)*100,100).toFixed(0);
    const rankCls=i===0?'top1':i===1?'top2':i===2?'top3':'';
    const isMe=myTeam&&team.id===myTeam.id;
    const mvp=team.mvps?.slice(-1)[0];const mvpMember=mvp?MEMBERS.find(m=>m.id===mvp.memberId):null;
    const logoHtml=team.logoDataUrl?`<img src="${team.logoDataUrl}">`:(team.logo||'?');
    return `<div class="team-card ${isMe?'my-card':''}">
      <div class="team-card-header">
        <div class="team-avatar" style="background:${team.color}">${logoHtml}</div>
        <div><div class="team-name">${team.name}${isMe?' <span style="font-size:10px;color:var(--blue-mid);">(Mein Team)</span>':''}</div>
          <div class="team-slogan">${team.slogan||team.biz}</div></div>
        <div class="team-rank ${rankCls}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
      </div>
      <div class="team-card-body">
        <div class="team-metrics">
          <div class="metric"><div class="metric-val">${fmtEur(team.revenue)}</div><div class="metric-lbl">Umsatz</div></div>
          <div class="metric"><div class="metric-val ${profit>=0?'positive':'negative'}">${profit>=0?'+':''}${fmtEur(profit)}</div><div class="metric-lbl">Gewinn</div></div>
          <div class="metric"><div class="metric-val positive">${roi}%</div><div class="metric-lbl">ROI</div></div>
        </div>
        <div class="progress-wrap">
          <div class="progress-label"><span>Wochenziel</span><span>${fmtEur(team.revenue)} / ${fmtEur(team.weekGoal)}</span></div>
          <div class="progress-bar"><div class="progress-fill ${progress>=100?'green':''}" style="width:${progress}%"></div></div>
        </div>
        ${mvpMember?`<div style="margin-top:6px;display:flex;align-items:center;gap:7px;"><span class="mvp-badge">🏆 MVP W${mvp.week}</span><span style="font-size:12px;font-weight:600;">${mvpMember.name}</span></div>`:''}
      </div>
      <div class="team-card-footer">
        <div style="display:flex;">${MEMBERS.filter(m=>m.teamId===team.id).map(m=>`<div style="width:22px;height:22px;border-radius:50%;background:${team.color};color:white;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid white;margin-left:-4px;overflow:hidden;">${m.avatarDataUrl?`<img src="${m.avatarDataUrl}" style="width:100%;height:100%;object-fit:cover;">`:m.name.charAt(0)}</div>`).join('')}</div>
        <span class="tag ${team.weekStatus==='submitted'?'tag-orange':team.weekStatus==='approved'?'tag-green':'tag-blue'}">W${team.currentWeek} ${team.weekStatus==='submitted'?'⏳':''}</span>
      </div>
    </div>`;
  }).join('');
}

function renderBlogPage(){
  const u=state.currentUser;const teams=getVisibleTeams();
  const tSel=document.getElementById('blogTeamFilter');
  // Always rebuild team filter to avoid stale options after data reload
  const prevTf=tSel.value;
  while(tSel.options.length>1) tSel.remove(1);
  teams.forEach(t=>{const o=new Option(t.logo+' '+t.name,t.id);tSel.appendChild(o);});
  if(prevTf&&prevTf!=='all'&&teams.some(t=>t.id===prevTf)) tSel.value=prevTf;
  const tf=document.getElementById('blogTeamFilter').value;
  const wf=document.getElementById('blogWeekFilter').value;
  const isAdmin=u.role==='admin'||u.role==='superadmin'||u.role==='guest';
  let blogs=BLOGS.filter(b=>{
    const teamOk=teams.some(t=>t.id===b.teamId);
    const fT=tf==='all'||b.teamId===tf;
    const fW=wf==='all'||String(b.week)===String(wf);
    // Members/team only see approved; admins see all
    const statusOk=isAdmin||b.status==='approved';
    return teamOk&&fT&&fW&&statusOk;
  }).sort((a,b)=>b.week-a.week||(a.teamId>b.teamId?1:-1));
  const grid=document.getElementById('blogGrid');
  if(blogs.length===0){
    const hint=isAdmin?'<p>Noch keine Wochenberichte eingereicht. Teams können ihren Bericht unter <strong>Mein Team → Wochenbericht</strong> einreichen.</p>':'<p>Noch keine freigegebenen Berichte. Sobald dein Dozent Berichte freigibt, erscheinen sie hier.</p>';
    grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📖</div><h3>Keine Berichte</h3>${hint}</div>`;
    return;
  }
  grid.innerHTML=blogs.map(b=>{
    const team=TEAMS.find(t=>t.id===b.teamId);
    const moodEmoji=['','😩','😟','😐','😊','🚀'][b.mood]||'';
    const statusLabel=b.status==='approved'?'<span style="background:#dcfce7;color:#15803d;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;">✅ Freigegeben</span>':b.status==='pending'?'<span style="background:#fef9c3;color:#a16207;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;">⏳ Ausstehend</span>':'<span style="background:#f1f5f9;color:#64748b;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;">📄 Entwurf</span>';
    return `<div class="blog-card">
      <div class="blog-header"><div class="blog-week">Woche ${b.week} · ${team?.name||'—'}</div>
        <div class="blog-title">${b.title||'(kein Titel)'}</div>
        <div class="blog-meta"><span>${b.status==='approved'&&moodEmoji?moodEmoji+' '+b.mood+'/5':'🔒 Stimmung n. Freigabe'}</span>·<span>${fmtDate(b.date)}</span>·${statusLabel}</div></div>
      <div class="blog-body">${(b.body||'').substring(0,400)}${(b.body||'').length>400?'…':''}</div>
      ${b.highlight?`<div style="padding:0 16px 8px;"><div style="background:var(--green-lt);color:var(--green);padding:7px 10px;border-radius:7px;font-size:11px;font-weight:600;">⭐ ${b.highlight}</div></div>`:''}
      <div class="blog-footer"><div style="display:flex;gap:5px;flex-wrap:wrap;">${(b.tags||[]).map(t=>`<span class="blog-tag">${t}</span>`).join('')}</div>
        ${isAdmin&&b.status==='pending'?`<button class="btn btn-success btn-xs" onclick="quickApprove('${b.id}');renderBlogPage()">✅ Freigeben</button>`:''}
        ${isAdmin?`<button class="btn btn-outline btn-xs" onclick="openBlogDetailAdmin('${b.id}')">📖 Lesen</button>`:''}
      </div>
    </div>`;}).join('');
}

function renderTxPage(){
  const u=state.currentUser;const teams=getVisibleTeams();
  const tSel=document.getElementById('txTeamFilter');
  if(tSel.options.length<=1) teams.forEach(t=>{const o=new Option(t.logo+' '+t.name,t.id);tSel.appendChild(o);});
  // CFO-only bookings: only CFO member (or admin/team-login) can add transactions
  const myMemberForTx=MEMBERS.find(m=>m.code===u.code);
  const canBook=(u.role==='admin'||u.role==='superadmin'||u.role==='team'||(u.role==='member'&&myMemberForTx?.role==='CFO'));
  document.getElementById('btnAddTx').style.display=canBook?'inline-flex':'none';
  const tf=document.getElementById('txTeamFilter').value;
  const tyf=document.getElementById('txTypeFilter').value;
  const own=u.role==='team'||u.role==='member';
  const myTid=getMyTeam()?.id;
  let txs=TRANSACTIONS.filter(tx=>{
    const teamOk=teams.some(t=>t.id===tx.teamId);
    const fT=tf==='all'||tx.teamId===tf;
    const fTy=tyf==='all'||tx.type===tyf;
    const fOwn=!own||tx.teamId===myTid;
    return teamOk&&fT&&fTy&&fOwn;
  }).sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('txTableRows').innerHTML=`
    <div class="tx-row header"><div>Datum</div><div>Team</div><div>Beschreibung</div><div>Kategorie</div><div>Betrag</div><div>Beleg</div></div>`+
    txs.map(tx=>{const team=TEAMS.find(t=>t.id===tx.teamId);return `<div class="tx-row">
      <div style="color:var(--gray-mid)">${fmtDate(tx.date)}</div>
      <div style="display:flex;align-items:center;"><div class="tx-team-dot" style="background:${team?.color}">${team?.logo}</div>${team?.name}</div>
      <div>${tx.desc}</div><div style="color:var(--gray-mid)">${tx.cat}</div>
      <div class="tx-amt ${tx.type==='income'?'pos':'neg'}">${tx.type==='income'?'+':'-'}${fmtEur(tx.amount)}</div>
      <div>${tx.receipt?`<span style="color:var(--green);cursor:pointer;text-decoration:underline dotted;" title="${(tx.receipt.name||'Beleg')} – klicken zum Anzeigen" onclick="viewReceipt('${tx.id}')">✅ Beleg</span>`:'—'}</div>
    </div>`;}).join('');
}
function clearTxFilters(){['txTeamFilter','txTypeFilter'].forEach(id=>document.getElementById(id).value='all');renderTxPage();}

