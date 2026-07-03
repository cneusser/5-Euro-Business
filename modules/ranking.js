// ════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════════

function renderEmptyDashboard(){
  const u = state.currentUser;
  let html = '';
  if(u.role==='superadmin'){
    html = `<div style="text-align:center;padding:60px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">🎓</div>
      <h2 style="font-size:22px;font-weight:800;color:var(--blue-dark);margin-bottom:8px;">Willkommen, ${state.currentUser?.name||'Superadmin'}!</h2>
      <p style="color:var(--gray-mid);max-width:400px;margin:0 auto 24px;">Der Tracker ist bereit. So startest du ein neues Semester:</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;max-width:700px;margin:0 auto 28px;text-align:left;">
        <div style="background:white;border-radius:12px;padding:16px;box-shadow:var(--shadow);">
          <div style="font-size:28px;margin-bottom:8px;">1️⃣</div>
          <div style="font-weight:700;color:var(--blue-dark);margin-bottom:4px;">Hochschule anlegen</div>
          <div style="font-size:12px;color:var(--gray-mid);">Superadmin → Hochschulen → + Hinzufügen</div>
        </div>
        <div style="background:white;border-radius:12px;padding:16px;box-shadow:var(--shadow);">
          <div style="font-size:28px;margin-bottom:8px;">2️⃣</div>
          <div style="font-weight:700;color:var(--blue-dark);margin-bottom:4px;">Neues Spiel anlegen</div>
          <div style="font-size:12px;color:var(--gray-mid);">Superadmin → Spiele → + Neues Spiel</div>
        </div>
        <div style="background:white;border-radius:12px;padding:16px;box-shadow:var(--shadow);">
          <div style="font-size:28px;margin-bottom:8px;">3️⃣</div>
          <div style="font-weight:700;color:var(--blue-dark);margin-bottom:4px;">Admin ernennen</div>
          <div style="font-size:12px;color:var(--gray-mid);">Superadmin → Admins → + Admin ernennen</div>
        </div>
        <div style="background:white;border-radius:12px;padding:16px;box-shadow:var(--shadow);">
          <div style="font-size:28px;margin-bottom:8px;">4️⃣</div>
          <div style="font-weight:700;color:var(--blue-dark);margin-bottom:4px;">Link teilen</div>
          <div style="font-size:12px;color:var(--gray-mid);">Studierende registrieren sich selbst auf der Website</div>
        </div>
      </div>
      <button class="btn btn-purple" onclick="navigateTo('superadmin')">&#9654; Zum Setup &rarr;</button>
    </div>`;
  } else if(u.role==='admin'){
    html = `<div style="text-align:center;padding:60px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">📋</div>
      <h2 style="font-size:20px;font-weight:800;color:var(--blue-dark);margin-bottom:8px;">Noch keine Teams</h2>
      <p style="color:var(--gray-mid);margin-bottom:20px;">Teile den Link mit deinen Studierenden – sie registrieren sich selbst!</p>
      <button class="btn btn-primary" onclick="navigateTo('admin')">&#128101; Teams verwalten &rarr;</button>
    </div>`;
  } else {
    html = `<div style="text-align:center;padding:60px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">🏁</div>
      <h2 style="font-size:20px;font-weight:800;color:var(--blue-dark);margin-bottom:8px;">Das Spiel startet bald!</h2>
      <p style="color:var(--gray-mid);">Warte auf deinen Dozenten – sobald das Semester beginnt, siehst du hier alle Infos.</p>
    </div>`;
  }
  document.getElementById('dashStats').innerHTML='';
  document.getElementById('leaderboard').innerHTML=html;
  document.getElementById('activityFeed').innerHTML='';
}
function renderDashboard(){
  const teams=getVisibleTeams();
  if(teams.length===0){renderEmptyDashboard();return;}
  const allTx=TRANSACTIONS.filter(tx=>teams.some(t=>t.id===tx.teamId));
  const totalRev=allTx.filter(t=>t.type==='income'&&t.cat!=='Kapital').reduce((s,t)=>s+t.amount,0);
  const totalExp=allTx.filter(t=>t.type==='expense'&&t.cat!=='Kapital').reduce((s,t)=>s+t.amount,0);
  const u=state.currentUser;
  const effectiveGameId_dash=state.managingGameId||u?.gameId;
  const game=effectiveGameId_dash?GAMES.find(g=>g.id===effectiveGameId_dash):null;
  const minWeek=teams.length?Math.min(...teams.map(t=>t.currentWeek||1)):1;
  const maxWeek=teams.length?Math.max(...teams.map(t=>t.currentWeek||1)):1;
  const weekLabel=minWeek===maxWeek?`W${minWeek}`:`W${minWeek}–${maxWeek}`;
  document.getElementById('dashStats').innerHTML=`
    <div class="stat-card" style="border-top:3px solid var(--blue-mid);">
      <div class="stat-label">🗓️ Laufende Woche</div>
      <div class="stat-value" style="color:var(--blue-mid);">${weekLabel}</div>
      <div class="stat-sub">von ${game?.weeks||6} Wochen</div>
    </div>
    <div class="stat-card"><div class="stat-label">Gesamtumsatz</div><div class="stat-value">${fmtEur(totalRev)}</div><div class="stat-sub">${teams.length} Teams</div></div>
    <div class="stat-card green"><div class="stat-label">Gewinn gesamt</div><div class="stat-value" style="color:${totalRev-totalExp>=0?'var(--green)':'var(--red)'}">${fmtEur(totalRev-totalExp)}</div><div class="stat-sub">nach Kosten</div></div>
    <div class="stat-card orange"><div class="stat-label">Transaktionen</div><div class="stat-value">${allTx.length}</div><div class="stat-sub">gesamt</div></div>
    <div class="stat-card gold"><div class="stat-label">Ø ROI</div><div class="stat-value">${(((totalRev-totalExp)/Math.max(teams.length*5,1))*100).toFixed(0)}%</div><div class="stat-sub">auf 5€ Start</div></div>
  `;
  document.getElementById('rankingGameLabel').textContent=game?game.name:'';
  renderLeaderboard('leaderboard',teams);
  // Activity
  const feed=document.getElementById('activityFeed');
  feed.innerHTML=[...TRANSACTIONS].filter(tx=>teams.some(t=>t.id===tx.teamId))
    .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(tx=>{
      const team=TEAMS.find(t=>t.id===tx.teamId);
      const bg=tx.type==='income'?'var(--green-lt)':'var(--red-lt)';
      return `<div class="activity-item"><div class="act-icon" style="background:${bg}">${tx.type==='income'?'💰':'🛍️'}</div>
        <div class="act-body"><div class="act-text"><strong>${team?.name}</strong>: ${tx.desc} <strong style="color:${tx.type==='income'?'var(--green)':'var(--red)'}">${tx.type==='income'?'+':'-'}${fmtEur(tx.amount)}</strong></div>
        <div class="act-time">${fmtDate(tx.date)}</div></div></div>`;
    }).join('');
  // ── Wochengewinner-Sektion (#3) ──
  const winnerEl=document.getElementById('weekWinnerSection');
  if(winnerEl){
    const awards=(game?.teamAwards||[]);
    const myTeam=(u.role==='member'||u.role==='team')?getMyTeam():null;
    // Filter awards relevant for current user
    const visibleAwards=myTeam?awards.filter(a=>a.teamId===myTeam.id):awards;
    const prevWeek=minWeek>1?minWeek-1:null;
    const prevWinner=prevWeek?awards.find(a=>a.week===prevWeek):null;
    const prevTeam=prevWinner?TEAMS.find(t=>t.id===prevWinner.teamId):null;
    // Sort awards descending
    const sortedAwards=[...visibleAwards].sort((a,b)=>b.week-a.week);
    const hasAwards=sortedAwards.length>0;
    if(prevWinner&&prevTeam){
      // Prominent last-week winner banner
      const bannerHtml=`<div style="background:linear-gradient(135deg,${prevTeam.color}22,${prevTeam.color}11);border:2px solid ${prevTeam.color}55;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="font-size:36px;">🏅</div>
        <div style="flex:1;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--gray-mid);margin-bottom:2px;">Gruppe der Woche ${prevWeek}</div>
          <div style="font-size:18px;font-weight:800;color:var(--blue-dark);">${prevTeam.logo} ${prevTeam.name}</div>
          ${prevWinner.reason?`<div style="font-size:12px;color:var(--gray-dark);margin-top:2px;">„${prevWinner.reason}"</div>`:''}
        </div>
        <span style="background:${prevTeam.color};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">W${prevWeek} Sieger</span>
      </div>`;
      winnerEl.innerHTML=bannerHtml+(hasAwards&&sortedAwards.length>1?`
        <div class="section-header" style="margin-top:8px;"><div class="section-title">🏆 Alle Wochensieger</div></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">${sortedAwards.map(a=>{const t=TEAMS.find(x=>x.id===a.teamId);return `<div style="display:flex;align-items:center;gap:8px;background:white;border:1px solid var(--border);border-left:4px solid ${t?.color||'var(--blue-mid)'};border-radius:8px;padding:8px 12px;min-width:180px;">
          <span style="font-size:20px;">${t?.logo||'🏅'}</span>
          <div><div style="font-weight:700;font-size:13px;">${t?.name||'—'}</div><div style="font-size:11px;color:var(--gray-mid);">Woche ${a.week}${a.reason?' · '+a.reason:''}</div></div>
        </div>`;}).join('')}</div>`:hasAwards?'':'');
    } else if(hasAwards){
      winnerEl.innerHTML=`
        <div class="section-header"><div class="section-title">🏆 Wochensieger</div></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">${sortedAwards.map(a=>{const t=TEAMS.find(x=>x.id===a.teamId);return `<div style="display:flex;align-items:center;gap:8px;background:white;border:1px solid var(--border);border-left:4px solid ${t?.color||'var(--blue-mid)'};border-radius:8px;padding:8px 12px;min-width:180px;">
          <span style="font-size:20px;">${t?.logo||'🏅'}</span>
          <div><div style="font-weight:700;font-size:13px;">${t?.name||'—'}</div><div style="font-size:11px;color:var(--gray-mid);">Woche ${a.week}${a.reason?' · '+a.reason:''}</div></div>
        </div>`;}).join('')}</div>`;
    } else {
      winnerEl.innerHTML='';
    }
  }
  // Chart — echte Wochendaten
  try{
  if(state.revenueChart) state.revenueChart.destroy();
  const ctx=document.getElementById('revenueChart').getContext('2d');
  const chartGame=effectiveGameId_dash?GAMES.find(g=>g.id===effectiveGameId_dash):GAMES[0];
  const maxWeek=teams.length?Math.max(...teams.map(t=>t.currentWeek)):1;
  const weekLabels=Array.from({length:maxWeek},(_,i)=>'W'+(i+1));
  // Für jedes Team: Umsatz kumuliert pro Woche
  function getWeekForDate(dateStr,gameStart){
    if(!dateStr||!gameStart) return 1;
    const diff=(new Date(dateStr)-new Date(gameStart))/(1000*60*60*24);
    return Math.max(1,Math.ceil((diff+1)/7));
  }
  const datasets=teams.slice(0,6).map(team=>{
    const weekRevs=Array(maxWeek).fill(0);
    TRANSACTIONS.filter(tx=>tx.teamId===team.id&&tx.type==='income').forEach(tx=>{
      const w=getWeekForDate(tx.date,chartGame?.start)-1;
      if(w>=0&&w<maxWeek) weekRevs[w]+=tx.amount;
    });
    // kumuliert
    const cumData=weekRevs.reduce((acc,v,i)=>{acc.push(+(((acc[i-1]||0)+v).toFixed(2)));return acc;},[]);
    return {label:team.name,data:cumData,borderColor:team.color,backgroundColor:team.color+'22',
      borderWidth:2,tension:0.3,fill:false,pointRadius:4,pointHoverRadius:6};
  });
  const hasData=datasets.some(d=>d.data.some(v=>v>0));
  if(!hasData){
    // Leere Anzeige wenn keine Transaktionen
    document.getElementById('revenueChart').parentElement.innerHTML=
      '<div style="height:180px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:var(--gray-mid);">'+
      '<div style="font-size:32px;">📈</div><div style="font-size:13px;">Noch keine Buchungen — startet hier sobald Umsätze erfasst werden</div></div>';
    return;
  }
  state.revenueChart=new Chart(ctx,{type:'line',data:{labels:weekLabels,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}},
        tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmtEur(c.parsed.y)+' (kum.)'}}},
      scales:{y:{ticks:{callback:v=>fmtEur(v)},grid:{color:'#E0E7F0'},beginAtZero:true},
        x:{grid:{display:false}}}}});
  }catch(e){console.warn('Chart error:',e);}
}

function renderLeaderboard(elId,teams){
  const u=state.currentUser;
  const sorted=[...teams].sort((a,b)=>(b.revenue-b.expenses)-(a.revenue-a.expenses));
  const maxP=Math.max(...sorted.map(t=>t.revenue-t.expenses),1);
  document.getElementById(elId).innerHTML=`
    <div class="lb-row header"><div>Platz</div><div>Team</div><div>Umsatz</div><div>Gewinn</div><div>Woche</div><div>Bar</div></div>`+
    sorted.map((team,i)=>{
      const profit=team.revenue-team.expenses;
      const isMe=(u.role==='team'||u.role==='member')&&team.id===getMyTeam()?.id;
      const rankCls=i===0?'r1':i===1?'r2':i===2?'r3':'';
      const barW=Math.max((profit/maxP)*100,0).toFixed(0);
      const weekBadge=`<span class="tag ${team.weekStatus==='approved'?'tag-green':team.weekStatus==='submitted'?'tag-orange':'tag-blue'}">W${team.currentWeek}</span>`;
      const logoHtml=team.logoDataUrl?`<img src="${team.logoDataUrl}" style="width:100%;height:100%;object-fit:cover;">`:(team.logo||'?');
      return `<div class="lb-row ${isMe?'my-team':''}">
        <div class="lb-rank ${rankCls}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
        <div class="lb-team"><div class="lb-dot" style="background:${team.color}">${logoHtml}</div>
          <div><div class="lb-name">${team.name}${isMe?' <span style="color:var(--blue-mid);font-size:10px;">(Du)</span>':''}</div>
          <div class="lb-biz">${team.slogan||team.biz}</div></div></div>
        <div class="lb-num">${fmtEur(team.revenue)}</div>
        <div class="lb-num ${profit>=0?'pos':'neg'}">${profit>=0?'+':''}${fmtEur(profit)}</div>
        <div>${weekBadge}</div>
        <div><div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${barW}%;background:${team.color};border-radius:3px;"></div></div></div>
      </div>`;
    }).join('');
}

