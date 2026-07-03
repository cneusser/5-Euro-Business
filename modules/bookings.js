// ════════════════════════════════════════════════════════════════════
//  ACTIONS
// ════════════════════════════════════════════════════════════════════
function approveBlog(id){
  logEvent('admin_blog_approve', {blogId: id});
  const b=BLOGS.find(x=>x.id===id);if(!b)return;
  const feedbackEl=document.getElementById('blogFeedback_'+id);
  if(feedbackEl&&feedbackEl.value.trim()) b.adminFeedback=feedbackEl.value.trim();
  b.status='approved';
  const team=TEAMS.find(t=>t.id===b.teamId);
  if(team&&team.weekStatus==='submitted'){
    // Calculate & set team mood from reflections
    const avgMood=calcTeamAvgMood(team.id,b.week);
    b.mood=avgMood;
    // Ensure MVP is set (may already be set from submitBlog)
    const hasWeekMvp=team.mvps&&team.mvps.find(mv=>mv.week===b.week);
    if(!hasWeekMvp){
      const winner=calcMvpWinner(team.id,b.week);
      if(winner){team.mvps=team.mvps||[];team.mvps.push({week:b.week,memberId:winner.memberId,reason:winner.reason||'MVP der Woche!'});}
    }
    team.currentWeek++;team.weekStatus='open';
  }
  saveData();renderApprovalQueue();renderWeeksAdmin();renderBlogPage();
  showToast('✅ Bericht freigegeben! '+team?.name+' startet Woche '+team?.currentWeek);
  if(team) sendNotification('blog',team.id,(team.currentWeek-1));
  if(team) sendNotification('week',team.id,team.currentWeek);
}
function approveBlogAndAdvance(blogId,teamId){approveBlog(blogId);}
function manualAdvanceWeek(teamId){
  const team=TEAMS.find(t=>t.id===teamId);if(!team)return;
  logEvent('admin_week_advance', {teamId, week: team.currentWeek});
  team.currentWeek++;team.weekStatus='open';
  saveData();renderWeeksAdmin();showToast('⏭️ '+team.name+' – Woche '+team.currentWeek+' gestartet');
  sendNotification('week',team.id,team.currentWeek);
}
function manualRollbackWeek(teamId){
  const team=TEAMS.find(t=>t.id===teamId);if(!team)return;
  if(team.currentWeek<=1){showToast('Bereits in Woche 1','info');return;}
  if(!confirm('Team "'+team.name+'" eine Woche zurücksetzen auf Woche '+(team.currentWeek-1)+'? Der Bericht der aktuellen Woche bleibt erhalten.')) return;
  logEvent('week_rollback',{teamId,week:team.currentWeek});
  team.currentWeek--;team.weekStatus='open';
  saveData();renderWeeksAdmin();showToast('⏮️ '+team.name+' – zurück auf Woche '+team.currentWeek);
}
function quickApprove(id){approveBlog(id);}
function rejectBlog(id){const b=BLOGS.find(x=>x.id===id);if(b){const feedbackEl=document.getElementById('blogFeedback_'+id);if(feedbackEl&&feedbackEl.value.trim()) b.adminFeedback=feedbackEl.value.trim();b.status='pending';logEvent('blog_reject',{blogId:id});saveData();renderApprovalQueue();showToast('🔄 Überarbeitung angefragt','info');}}
function deleteBlog(id){const b=BLOGS.find(x=>x.id===id);if(b){b.status='rejected';renderApprovalQueue();showToast('❌ Abgelehnt','error');}}
function approveAll(){BLOGS.filter(b=>b.status==='pending').forEach(b=>approveBlog(b.id));showToast('✅ Alle freigegeben!');}

let _receiptData=null;
function handleReceiptUpload(e){
  const file=e.target.files[0];if(!file) return;
  if(file.size>5*1024*1024){showToast('Datei zu groß (max 5 MB)','error');return;}
  const reader=new FileReader();
  reader.onload=function(ev){
    _receiptData={data:ev.target.result,name:file.name,type:file.type};
    const lbl=document.getElementById('bFileLabel');
    if(lbl) lbl.textContent='✅ '+file.name;
    showToast('Beleg geladen: '+file.name,'success');
  };
  reader.readAsDataURL(file);
}
// ── v0.8.5: Attachment helpers ──────────────────────────────────────
window._blogAttachments=[];
window._refAttachments=[];
function _readFileAsBase64(file){
  return new Promise((res,rej)=>{
    if(file.size>512*1024){showToast('⚠️ '+file.name+' ist zu groß (max 500 KB)','error');rej('too large');return;}
    const r=new FileReader();
    r.onload=()=>res({name:file.name,type:file.type,size:file.size,data:r.result});
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}
function _renderAttachBadges(list,containerId,storeKey){
  const el=document.getElementById(containerId);if(!el)return;
  el.innerHTML=list.map((a,i)=>`<span style="background:#EFF6FF;border:1px solid #93C5FD;border-radius:20px;padding:2px 10px;font-size:12px;display:flex;align-items:center;gap:5px;">📎 ${a.name} <button onclick="window.${storeKey}.splice(${i},1);_renderAttachBadges(window.${storeKey},'${containerId}','${storeKey}')" style="background:none;border:none;cursor:pointer;color:#DC2626;font-weight:700;padding:0 2px;">✕</button></span>`).join('');
}
async function handleBlogAttachments(inp){
  for(const f of inp.files){try{const a=await _readFileAsBase64(f);window._blogAttachments.push(a);}catch(e){}}
  _renderAttachBadges(window._blogAttachments,'blogAttachList','_blogAttachments');
  inp.value='';
}
async function handleRefAttachments(inp){
  for(const f of inp.files){try{const a=await _readFileAsBase64(f);window._refAttachments.push(a);}catch(e){}}
  _renderAttachBadges(window._refAttachments,'refAttachList','_refAttachments');
  inp.value='';
}
function _clearBlogAttachments(){window._blogAttachments=[];const el=document.getElementById('blogAttachList');if(el)el.innerHTML='';}
function _clearRefAttachments(){window._refAttachments=[];const el=document.getElementById('refAttachList');if(el)el.innerHTML='';}
function _renderAttachmentLinks(attachments){
  if(!attachments||!attachments.length)return'';
  return`<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">${attachments.map(a=>`<a href="${a.data}" download="${a.name}" style="background:#EFF6FF;border:1px solid #93C5FD;border-radius:20px;padding:3px 10px;font-size:12px;color:#1D4ED8;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">📎 ${a.name}</a>`).join('')}</div>`;
}
function submitBooking(){
  if(state.currentUser?._impersonating){showToast('⛔ Schreiben nicht möglich im Vorschau-Modus','error');return;}
  const desc=document.getElementById('bDesc').value.trim();
  const amt=parseFloat(document.getElementById('bAmount').value);
  if(!desc||!amt){showToast('Pflichtfelder fehlen','error');return;}
  const team=getMyTeam();if(!team)return;
  // All members may record bookings; CFO can additionally edit/delete
  const u=state.currentUser;
  const tx={id:'tx'+Date.now(),teamId:team.id,date:document.getElementById('bDate').value||new Date().toISOString().split('T')[0],
    desc,cat:document.getElementById('bCat').value,type:document.getElementById('bType').value,amount:amt,receipt:_receiptData||false};
  _receiptData=null;const lbl2=document.getElementById('bFileLabel');if(lbl2)lbl2.textContent='';if(document.getElementById('bFile'))document.getElementById('bFile').value='';
  // Check if editing an existing transaction (CFO correction mode)
  const editTxId=document.getElementById('modalBooking').dataset.editTxId||'';
  if(editTxId){
    const existingIdx=TRANSACTIONS.findIndex(t=>t.id===editTxId);
    if(existingIdx>=0) TRANSACTIONS[existingIdx]=Object.assign(TRANSACTIONS[existingIdx],
      {desc:tx.desc,date:tx.date,cat:tx.cat,type:tx.type,amount:tx.amount});
  } else {
    TRANSACTIONS.push(tx);
  }
  // Recalculate team totals from scratch (correct for both new entries and edits)
  const allTx=TRANSACTIONS.filter(t=>t.teamId===team.id);
  team.revenue=allTx.filter(t=>t.type==='income'&&t.cat!=='Kapital').reduce((s,t)=>s+t.amount,0);
  team.expenses=allTx.filter(t=>t.type==='expense'&&t.cat!=='Kapital').reduce((s,t)=>s+t.amount,0);
  team.capital=allTx.filter(t=>t.cat==='Kapital').reduce((s,t)=>s+t.amount,0);
  team.transactions=allTx.length;
  logEvent(editTxId?'tx_edit':'tx_add',{desc,amount:amt,teamId:team.id,type:tx.type});
  saveData();closeModal('modalBooking');showToast(editTxId?'\u270f\ufe0f Buchung aktualisiert!':'\U0001f4b0 Buchung gespeichert!');buildTicker();
  if(state.currentPage==='myteam') renderMyTeamPanel('transactions');
}

function submitBlog(){
  if(state.currentUser?._impersonating){showToast('⛔ Schreiben nicht möglich im Vorschau-Modus','error');return;}
  const title=document.getElementById('blogTitle').value.trim();
  if(!title){showToast('Bitte Titel angeben','error');return;}
  const team=getMyTeam();if(!team)return;
  // CEO check: only member with role CEO (or team-login) may submit
  const me=getMyMember();
  if(me&&me.role!=='CEO'){showToast('Nur der CEO kann den Bericht einreichen!','error');return;}
  // Reflection completeness check (deduplicated: same-name duplicate members count as covered)
  const teamMembers=MEMBERS.filter(m=>m.teamId===team.id);
  const refsThisWeek=REFLECTIONS.filter(r=>r.teamId===team.id&&r.week===team.currentWeek);
  const uniqueMembers=_deduplicateMembers(teamMembers, refsThisWeek);
  const missing=uniqueMembers.filter(m=>!_isMemberRefCovered(m, refsThisWeek, teamMembers));
  if(missing.length>0){
    showToast('Noch nicht alle Reflexionen abgegeben: '+missing.map(m=>m.name).join(', '),'error');
    return;
  }
  // Determine MVP: voting result, CEO can override
  const voteResult=calcMvpWinner(team.id,team.currentWeek);
  const override=document.getElementById('blogMvpOverride')?.value;
  const mvpReason=document.getElementById('blogMvpReason')?.value.trim();
  const finalMvpId=override||voteResult?.memberId||null;
  if(override){team.mvpOverride=team.mvpOverride||{};team.mvpOverride[team.currentWeek]=override;}
  if(finalMvpId){team.mvps=team.mvps||[];
    team.mvps.push({week:team.currentWeek,memberId:finalMvpId,reason:mvpReason||voteResult?.reason||'MVP der Woche!'});}
  // Auto mood from reflections
  const avgMood=calcTeamAvgMood(team.id,team.currentWeek);
  const blog={id:'b'+Date.now(),teamId:team.id,week:team.currentWeek,title,
    body:document.getElementById('blogActivities').value||'',
    highlight:document.getElementById('blogHighlight').value||'',
    challenges:document.getElementById('blogChallenges').value||'',
    nextSteps:document.getElementById('blogNextSteps').value||'',
    mood:avgMood,
    tags:document.getElementById('blogTags').value.split(',').map(t=>t.trim()).filter(Boolean),
    attachments:[...(window._blogAttachments||[])],
    status:'pending',date:new Date().toISOString().split('T')[0]};
  _clearBlogAttachments();
  BLOGS.push(blog);team.weekStatus='submitted';
  logEvent('blog_submit',{week:team.currentWeek,title,teamId:team.id});
  saveData();
  closeModal('modalBlog');showToast('📤 Bericht eingereicht – wartet auf Freigabe!');
  if(state.currentPage==='myteam'){renderWeekSteps(team);renderMyTeamPanel(state.currentMyTeamTab);}
}
function saveBlogDraft(){
  if(state.currentUser?._impersonating){showToast('⛔ Schreiben nicht möglich im Vorschau-Modus','error');return;}
  const team=getMyTeam();if(!team) return;
  const title=document.getElementById('blogTitle').value.trim()||'(Entwurf)';
  const w=parseInt((document.getElementById('blogWeek').value||'Woche 1').replace('Woche ',''))||team.currentWeek||1;
  // remove existing draft for same week
  const idx=BLOGS.findIndex(b=>b.teamId===team.id&&b.week===w&&b.status==='draft');
  if(idx>=0) BLOGS.splice(idx,1);
  const body=[
    document.getElementById('blogActivities')?.value||'',
    document.getElementById('blogHighlight')?.value||'',
    document.getElementById('blogChallenges')?.value||'',
    document.getElementById('blogNextSteps')?.value||''
  ].filter(Boolean).join(' | ');
  BLOGS.push({id:'blog-draft-'+Date.now(),teamId:team.id,week:w,title,body,
    tags:(document.getElementById('blogTags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean),
    attachments:[...(window._blogAttachments||[])],
    status:'draft',createdAt:new Date().toISOString(),mood:null});
  _clearBlogAttachments();
  saveData();
  closeModal('modalBlog');
  showToast('📄 Entwurf gespeichert');
  if(state.currentPage==='myteam') renderMyTeamPanel(state.currentMyTeamTab||'blogs');
}

function submitReflection(){
  if(state.currentUser?._impersonating){showToast('⛔ Schreiben nicht möglich im Vorschau-Modus','error');return;}
  const m=getMyMember();if(!m){showToast('Nur für Mitglieder','error');return;}
  const exp=document.getElementById('refExperience').value.trim();
  const liked=document.getElementById('refLiked').value.trim();
  const imp=document.getElementById('refImproved').value.trim();
  if(!exp||!liked||!imp){showToast('Bitte alle Pflichtfelder ausfüllen','error');return;}
  const team=getMyTeam();
  const week=parseInt(document.getElementById('refWeek').value.replace('Woche ','')||1);
  const mvpVote=document.getElementById('refMvpVote')?.value||null;
  // Check if already submitted for this week
  const existing=REFLECTIONS.find(r=>r.memberId===m.id&&r.week===week);
  const weekOpen = !team || team.weekStatus==='open'; // editable while week not yet submitted
  if(existing){
    if(!weekOpen){
      showToast('Woche '+week+' ist abgeschlossen – die Reflexion kann nicht mehr geändert werden.','info');
      closeModal('modalReflection');return;
    }
    // Update existing reflection
    existing.mood=state.selectedMood;
    existing.experience=exp;existing.liked=liked;existing.improved=imp;
    existing.role=document.getElementById('refRole').value;
    existing.mvpVote=mvpVote||null;
    existing.attachments=[...(window._refAttachments||[])]; // v0.8.5
    existing.updatedAt=new Date().toISOString().split('T')[0];
    _clearRefAttachments();
    logEvent('reflection_update',{week,teamId:m.teamId});
    saveData();closeModal('modalReflection');showToast('✏️ Reflexion aktualisiert!');
  } else {
    REFLECTIONS.push({id:'r'+Date.now(),memberId:m.id,teamId:m.teamId,
      week,mood:state.selectedMood,experience:exp,liked,improved:imp,
      role:document.getElementById('refRole').value,
      mvpVote:mvpVote||null,
      customAnswers:collectCustomAnswers('refCustomQuestions'),
      attachments:[...(window._refAttachments||[])],
      date:new Date().toISOString().split('T')[0]});
    _clearRefAttachments();
    logEvent('reflection_submit',{week,teamId:m.teamId,role:document.getElementById('refRole').value||''});
    saveData();closeModal('modalReflection');showToast('💾 Reflexion gespeichert!');
  }
  renderReflectionPage();
  // Update blog modal status if open
  const blogModal=document.getElementById('modalBlog');
  if(blogModal&&blogModal.style.display!=='none') updateBlogReflectionStatus();
}

function editReflection(id){
  const r=REFLECTIONS.find(x=>x.id===id);
  if(!r) return;
  // Pre-fill modal fields
  const g=n=>document.getElementById(n);
  if(g('refExperience')) g('refExperience').value=r.experience||'';
  if(g('refLiked'))      g('refLiked').value=r.liked||'';
  if(g('refImproved'))   g('refImproved').value=r.improved||'';
  if(g('refRole'))       g('refRole').value=r.role||'';
  if(g('refWeek'))       g('refWeek').value='Woche '+r.week;
  // Set mood
  state.selectedMood=r.mood||3;
  // v0.8.5: restore existing attachments so they're not lost on re-save
  window._refAttachments=[...(r.attachments||[])];
  _renderAttachBadges(window._refAttachments,'refAttachList','_refAttachments');
  setTimeout(()=>document.querySelectorAll('.mood-btn').forEach(b=>{
    b.classList.toggle('selected',parseInt(b.dataset.val)===state.selectedMood);
  }),50);
  openModal('modalReflection');
}

function deleteReflection(id){
  if(!confirm('Reflexion wirklich löschen?')) return;
  const idx=REFLECTIONS.findIndex(r=>r.id===id);
  if(idx<0) return;
  const snap=JSON.parse(JSON.stringify(REFLECTIONS[idx]));
  const m=MEMBERS.find(x=>x.id===snap.memberId);
  REFLECTIONS.splice(idx,1);
  if(DELETED_ITEMS.length>=100) DELETED_ITEMS.shift();
  DELETED_ITEMS.push({id:'del_'+Date.now(),type:'reflection',deletedAt:new Date().toISOString(),label:'Reflexion W'+snap.week+': '+(m?.name||snap.memberId),data:snap});
  saveData();
  showUndoToast('🗑️ Reflexion gelöscht', ()=>{
    REFLECTIONS.push(snap);
    DELETED_ITEMS.splice(DELETED_ITEMS.findIndex(d=>d.data.id===snap.id),1);
    saveData();
    if(state.currentPage==='admin') renderAdminPage();
    else if(state.currentPage==='superadmin') renderSuperPage();
    else if(state.currentPage==='reflection') renderReflectionPage();
  });
  if(state.currentPage==='admin') renderAdminPage();
  else if(state.currentPage==='superadmin') renderSuperPage();
  else if(state.currentPage==='reflection') renderReflectionPage();
}

function openReflectionDetail(id){
  const r=REFLECTIONS.find(x=>x.id===id);
  if(!r) return;
  const m=MEMBERS.find(x=>x.id===r.memberId);
  const team=TEAMS.find(t=>t.id===r.teamId);
  const moodLabel=['','😩 Sehr schlecht','😟 Eher schlecht','😐 Neutral','😊 Gut','🚀 Sehr gut'][r.mood]||r.mood;
  document.getElementById('refDetailTitle').textContent=(m?.name||'Unbekannt')+' · Woche '+r.week+' · '+team?.name;
  document.getElementById('refDetailBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div><span style="font-size:11px;color:var(--gray-mid);">Stimmung</span><div style="font-size:18px;margin-top:4px;">${moodLabel}</div></div>
      <div><span style="font-size:11px;color:var(--gray-mid);">Datum</span><div style="margin-top:4px;font-size:13px;">${r.date||'—'}</div></div>
    </div>
    ${r.experience?`<div style="margin-bottom:14px;"><div style="font-weight:700;font-size:12px;color:var(--gray-mid);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">📝 Erfahrungen dieser Woche</div><div style="font-size:14px;line-height:1.6;color:var(--gray-dark);">${r.experience}</div></div>`:''}
    ${r.liked?`<div style="margin-bottom:14px;padding:10px 14px;background:var(--green-lt);border-radius:8px;border-left:3px solid var(--green);"><div style="font-weight:700;font-size:12px;color:var(--green);margin-bottom:6px;">👍 Das war gut</div><div style="font-size:14px;line-height:1.6;">${r.liked}</div></div>`:''}
    ${r.improved?`<div style="margin-bottom:14px;padding:10px 14px;background:var(--orange-lt);border-radius:8px;border-left:3px solid var(--orange);"><div style="font-weight:700;font-size:12px;color:var(--orange);margin-bottom:6px;">💡 Das würde ich anders machen</div><div style="font-size:14px;line-height:1.6;">${r.improved}</div></div>`:''}
    ${r.role?`<div style="margin-bottom:10px;"><span style="font-size:11px;color:var(--gray-mid);">Meine Rolle</span><div style="margin-top:4px;font-size:13px;font-weight:600;">${r.role}</div></div>`:''}
    ${r.mvpVote?`<div><span style="font-size:11px;color:var(--gray-mid);">MVP-Votum für</span><div style="margin-top:4px;font-size:13px;font-weight:600;">${MEMBERS.find(x=>x.id===r.mvpVote)?.name||r.mvpVote}</div></div>`:''}
  `;
  openModal('modalReflectionDetail');
}

function renderMoodChart(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u?.gameId;
  const allGameTeams=TEAMS.filter(t=>t.gameId===effectiveGameId&&t.status!=='pending');
  // Respect active filter selectors (team + week)
  const tfVal=document.getElementById('adminRefTeamFilter')?.value||'all';
  const wfVal=document.getElementById('adminRefWeekFilter')?.value||'all';
  const filteredTeams=tfVal==='all'?allGameTeams:allGameTeams.filter(t=>t.id===tfVal);
  let refs=REFLECTIONS.filter(r=>filteredTeams.some(t=>t.id===r.teamId));
  if(wfVal!=='all') refs=refs.filter(r=>String(r.week)===String(wfVal));
  if(refs.length===0){
    const moodEl=document.getElementById('moodByWeek');
    if(moodEl) moodEl.innerHTML='<div style="color:var(--gray-mid);font-size:12px;padding:8px;">Keine Reflexionen für den aktuellen Filter.</div>';
    if(state._moodChart){state._moodChart.destroy();state._moodChart=null;}
    return;
  }

  // Per-week average mood cards (respects filter)
  const weeks=[...new Set(refs.map(r=>r.week))].sort((a,b)=>a-b);
  const moodEl=document.getElementById('moodByWeek');
  if(moodEl) moodEl.innerHTML=weeks.map(w=>{
    const wRefs=refs.filter(r=>r.week===w);
    const avg=(wRefs.reduce((s,r)=>s+(r.mood||3),0)/wRefs.length).toFixed(1);
    const emoji=['','😩','😟','😐','😊','🚀'][Math.round(parseFloat(avg))]||'😐';
    return `<div class="stat-card" style="padding:12px;text-align:center;">
      <div style="font-size:11px;color:var(--gray-mid);margin-bottom:4px;">Woche ${w}</div>
      <div style="font-size:24px;">${emoji}</div>
      <div style="font-size:18px;font-weight:700;color:var(--blue-dark);">${avg}<span style="font-size:11px;color:var(--gray-mid);">/5</span></div>
      <div style="font-size:10px;color:var(--gray-mid);">${wRefs.length} Reflexionen</div>
    </div>`;
  }).join('');

  // Chart per team per week (respects filter)
  const ctx=document.getElementById('moodChartAdmin')?.getContext('2d');
  if(!ctx||weeks.length===0) return;
  if(state._moodChart) state._moodChart.destroy();
  const colors=['#2E75B6','#375623','#C55A11','#7030A0','#C00000','#1F497D'];
  state._moodChart=new Chart(ctx,{
    type:'line',
    data:{
      labels:weeks.map(w=>'W'+w),
      datasets:filteredTeams.map((team,i)=>({
        label:team.logo+' '+team.name,
        data:weeks.map(w=>{
          const tr=refs.filter(r=>r.teamId===team.id&&r.week===w);
          return tr.length>0?(tr.reduce((s,r)=>s+(r.mood||3),0)/tr.length).toFixed(1):null;
        }),
        borderColor:team.color||colors[i%colors.length],
        backgroundColor:(team.color||colors[i%colors.length])+'33',
        tension:.3,fill:false,pointRadius:5
      }))
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}},scales:{y:{min:1,max:5,ticks:{stepSize:1,callback:(v)=>['','😩','😟','😐','😊','🚀'][v]||v},grid:{color:'rgba(0,0,0,.06)'}},x:{grid:{display:false}}}}
  });
}

function saveTeamProfile(){
  const team=getMyTeam();if(!team)return;
  team.name=document.getElementById('tpName').value.trim()||team.name;
  team.slogan=document.getElementById('tpSlogan').value.trim();
  team.biz=document.getElementById('tpBiz').value.trim()||team.biz;
  team.desc=document.getElementById('tpDesc').value.trim();
  saveData();showToast('💾 Team-Profil gespeichert!');
  renderMyTeam();
}
function removeLogo(){const team=getMyTeam();if(team){team.logoDataUrl=null;renderTeamProfileForm(team);}}
function handleLogoUpload(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();reader.onload=ev=>{
    const team=getMyTeam();if(!team)return;
    team.logoDataUrl=ev.target.result;renderTeamProfileForm(team);renderMyTeam();buildTicker();
    showToast('🖼️ Logo hochgeladen!');};reader.readAsDataURL(file);
}

function saveMemberProfile(){
  const m=getMyMember();if(!m)return;
  m.name=document.getElementById('mpName').value.trim()||m.name;
  m.role=document.getElementById('mpRole').value;
  m.title=document.getElementById('mpTitle').value.trim();
  m.bio=document.getElementById('mpBio').value.trim();
  m.email=document.getElementById('mpEmail')?.value.trim()||'';
  const langEl=document.getElementById('mpLang');
  if(langEl){m.lang=langEl.value;state.lang=m.lang;if(m.lang==='en')setTimeout(applyLang,100);}
  if(!m.notif) m.notif={};
  const _newEmail=document.getElementById('mpEmail')?.value.trim()||'';
  // If email was just added and notif never explicitly set, auto-enable all
  if(_newEmail&&!m.email){m.notif={blog:true,week:true,reflect:true,emailReminders:true};}
  else{
    if(!m.notif) m.notif={};
    m.notif.blog=document.getElementById('mpNotifBlog')?.checked||false;
    m.notif.week=document.getElementById('mpNotifWeek')?.checked||false;
    m.notif.reflect=document.getElementById('mpNotifReflect')?.checked||false;
    m.notif.emailReminders=document.getElementById('mpNotifEmailReminders')?.checked!==false;
  }
  saveData();
  showToast(state.lang==='en'?'Profile saved!':'Profil gespeichert!');
  renderProfile();updateTopbar();
}
function showChangePassword(){
  document.getElementById('changePwdSection').style.display='block';
}
async function doChangePassword(){
  const code=state.currentUser?.code;
  const oldPwd=document.getElementById('cpOld').value;
  const np1=document.getElementById('cpNew1').value;
  const np2=document.getElementById('cpNew2').value;
  const pwds=getPwds();
  const lng=state.lang==='en';
  if(np1.length<6){showToast(lng?'Min. 6 characters':'Mind. 6 Zeichen','error');return;}
  if(np1!==np2){showToast(lng?'Passwords do not match':'Passwörter stimmen nicht überein','error');return;}
  if(pwds[code]){
    const oldHash=await hashPwd(oldPwd);
    if(pwds[code]!==oldHash){showToast(lng?'Wrong current password':'Falsches aktuelles Passwort','error');return;}
  }
  const newHash=await hashPwd(np1);
  savePwd(code,newHash);
  document.getElementById('changePwdSection').style.display='none';
  showToast(lng?'Password changed successfully!':'Passwort erfolgreich geändert!');
  renderProfile();
}
function removeAvatar(){const m=getMyMember();if(m){m.avatarDataUrl=null;renderProfile();}}
function handleAvatarUpload(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();reader.onload=ev=>{const m=getMyMember();if(!m)return;m.avatarDataUrl=ev.target.result;renderProfile();showToast('📷 Foto hochgeladen!');};
  reader.readAsDataURL(file);
}

// Storage-Status anzeigen (wird von updateStorageStatus() weiter unten überschrieben)

// Pre-populate modals when opened
const origOpenModal=openModal;
window.openModal=function(id){
  origOpenModal(id);
  if(id==='modalNewGame') prepareNewGameModal();
  if(id==='modalNewAdmin') prepareNewAdminModal();
  if(id==='modalBooking'){
    // Reset edit mode state
    const mbEl=document.getElementById('modalBooking');
    if(mbEl) delete mbEl.dataset.editTxId;
    const hdr=document.querySelector('#modalBooking .modal-header h3');
    if(hdr) hdr.innerHTML='&#128176; Buchung erfassen <span id="bookingRoleInfo" style="font-size:11px;font-weight:400;opacity:.7;"></span>';
    const bri=document.getElementById('bookingRoleInfo');
    if(bri){const me=getMyMember();bri.textContent=me?`(${me.name} · ${me.role})`:'';} 
    // Clear booking form fields for a fresh entry
    ['bDesc','bAmount','bCat'].forEach(fid=>{const el=document.getElementById(fid);if(el&&fid!=='bCat')el.value='';});
    const bDate=document.getElementById('bDate');
    if(bDate) bDate.value=new Date().toISOString().split('T')[0];
    _receiptData=null;
    const lbl=document.getElementById('bFileLabel');if(lbl) lbl.textContent='';
    const bFile=document.getElementById('bFile');if(bFile) bFile.value='';
  }
  if(id==='modalEditSuperProfile') openSuperProfileEdit();
  if(id==='modalNewSuperAdmin'){document.getElementById('nsaCode').value=makeSuperCode();}
  if(id==='modalNewTeam'){prepareNewTeamModal();document.getElementById('ntGameInfoBox').style.display='block';}
  if(id==='modalBlog'){
    const team=getMyTeam();
    const w=team?.currentWeek||1;
    // v0.8.6: populate week select from game.maxWeeks
    const _bgGame=team?GAMES.find(g=>g.id===team.gameId):null;
    const _bgMax=_bgGame?.maxWeeks||6;
    const _bwSel=document.getElementById('blogWeek');
    if(_bwSel){_bwSel.innerHTML=Array.from({length:_bgMax},(_,i)=>`<option>Woche ${i+1}</option>`).join('');}
    setTimeout(()=>populateCustomQuestionsModal('blog',w),30);
    document.getElementById('blogWeek').value='Woche '+w;
    // Reset fields
    ['blogTitle','blogActivities','blogHighlight','blogChallenges','blogNextSteps','blogTags'].forEach(fid=>{const el=document.getElementById(fid);if(el)el.value='';});
    // Update reflection status + MVP voting display
    setTimeout(updateBlogReflectionStatus,50);
  }
  if(id==='modalReflection'){
    const me=getMyMember();const team=getMyTeam();const w=team?.currentWeek||1;
    // v0.8.6: populate week select from game.maxWeeks
    const _rfGame=team?GAMES.find(g=>g.id===team.gameId):null;
    const _rfMax=_rfGame?.maxWeeks||6;
    const _rfSel=document.getElementById('refWeek');
    if(_rfSel){_rfSel.innerHTML=Array.from({length:_rfMax},(_,i)=>`<option>Woche ${i+1}</option>`).join('');}
    setTimeout(()=>populateCustomQuestionsModal('reflection',w),30);
    if(document.getElementById('refWeek')) document.getElementById('refWeek').value='Woche '+w;
    // ALWAYS clear text fields first (prevents showing another member's data)
    ['refExperience','refLiked','refImproved','refRole'].forEach(fid=>{
      const el=document.getElementById(fid);if(el) el.value='';
    });
    // reset mood buttons to neutral
    document.querySelectorAll('.mood-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.val)===3));
    state.selectedMood=3;
    // If current member already submitted this week, pre-fill for read-only review
    if(me){
      const existing=REFLECTIONS.find(r=>r.memberId===me.id&&r.week===w);
      if(existing){
        if(document.getElementById('refExperience')) document.getElementById('refExperience').value=existing.experience||'';
        if(document.getElementById('refLiked')) document.getElementById('refLiked').value=existing.liked||'';
        if(document.getElementById('refImproved')) document.getElementById('refImproved').value=existing.improved||'';
        if(document.getElementById('refRole')) document.getElementById('refRole').value=existing.role||'';
        // set mood from existing
        document.querySelectorAll('.mood-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.val)===existing.mood));
        state.selectedMood=existing.mood||3;
      }
      const submitBtn=document.querySelector('#modalReflection .btn-success');
      if(submitBtn){
        submitBtn.disabled=!!existing;
        submitBtn.textContent=existing?'✅ Bereits eingereicht':'💾 Reflexion speichern';
      }
    }
    // Populate MVP vote dropdown (all team members)
    const mvpSel=document.getElementById('refMvpVote');
    if(mvpSel&&team){
      mvpSel.innerHTML='<option value="">-- niemanden nominieren --</option>';
      MEMBERS.filter(m=>m.teamId===team.id).forEach(m=>{
        const o=new Option(m.name+' ('+m.role+')',m.id);mvpSel.appendChild(o);
      });
    }
  }
};


