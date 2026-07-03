// ════════════════════════════════════════════════════════════════════
//  FEATURE (b): BUSINESS MODEL CANVAS (CMO)
// ════════════════════════════════════════════════════════════════════
function renderCanvasPage(){
  const me=getMyMember();const team=getMyTeam();
  if(!team){showToast('Nur für Teammitglieder','error');return;}
  const u=state.currentUser;
  const isCMO=me?.role==='CMO';
  const isCEO=me?.role==='CEO';
  const isAdmin=u.role==='admin'||u.role==='superadmin';
  // Show canvas instruction docs if available
  const game=GAMES.find(g=>g.id===(team.gameId));
  const docsWrap=document.getElementById('canvasDocsWrap');
  if(docsWrap){
    const docs=game?.canvasDocs||[];
    if(docs.length>0){
      const docsHtml=docs.map(d=>`<button class="btn btn-outline btn-xs" style="margin:2px 4px 2px 0;" onclick="openCanvasDoc('${game.id}','${d.id}')">${(d.name.endsWith('.pptx')||d.name.endsWith('.ppt'))?'&#128203;':'&#128196;'} ${d.name}</button>`).join('');
      docsWrap.style.display='block';
      docsWrap.innerHTML='<div class="info-box" style="background:#EFF6FF;border-color:#BFDBFE;margin-bottom:0;"><span class="info-box-icon">&#128506;</span><strong>Canvas-Anleitungen:</strong> '+docsHtml+'</div>';
    } else {
      docsWrap.style.display='none';docsWrap.innerHTML='';
    }
  }
  // Find latest canvas for this team
  const canvas=CANVASES.filter(c=>c.teamId===team.id).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0];
  const BMC_IDS=['partners','activities','resources','value','relations','channels','segments','costs','revenue'];
  // Fill in fields if canvas exists
  BMC_IDS.forEach(k=>{
    const el=document.getElementById('bmc_'+k);
    if(el) el.value=canvas?.blocks?.[k]||'';
    if(el) el.readOnly=(!isCMO&&!isAdmin);
  });
  // Status info
  const infoBox=document.getElementById('canvasInfoBox');
  if(canvas&&infoBox){
    const statusLabel=canvas.status==='approved'?'<span style="color:var(--green);font-weight:700;">&#10003; Genehmigt</span>':canvas.status==='submitted'?'<span style="color:var(--orange);font-weight:700;">&#8987; Eingereicht</span>':'<span style="color:var(--gray-mid);">Entwurf</span>';
    document.getElementById('canvasLastSubmit').innerHTML=statusLabel+(canvas.submittedAt?' am '+fmtDate(canvas.submittedAt):'');
  }
  // Admin feedback
  const feedbackWrap=document.getElementById('canvasAdminFeedbackWrap');
  if(feedbackWrap&&canvas?.adminFeedback){
    feedbackWrap.style.display='block';
    feedbackWrap.innerHTML=`<div class="info-box blue" style="margin-bottom:12px;"><span class="info-box-icon">&#128172;</span><strong>Dozenten-Feedback:</strong> ${canvas.adminFeedback}</div>`;
  }
  // Show/hide CMO buttons
  const btnWrap=document.querySelector('#page-canvas .section-header > div');
  if(btnWrap) btnWrap.style.display=(isCMO?'flex':'none');
  // CEO section
  const ceoSec=document.getElementById('canvasCeoSection');
  if(ceoSec){
    if((isCEO||isAdmin)&&canvas&&canvas.status==='submitted'){
      ceoSec.style.display='block';
      ceoSec.innerHTML=`<div class="card"><div class="card-header"><h3>&#128081; CEO – Canvas genehmigen</h3></div><div class="card-body">
        ${isAdmin?`<div class="form-group"><label class="form-label">&#128172; Dozenten-Feedback (optional)</label><textarea class="form-control" id="canvasFeedbackInput" rows="2" placeholder="Feedback an das Team...">${canvas.adminFeedback||''}</textarea></div>`:''}
        <div style="display:flex;gap:10px;margin-top:10px;">
          <button class="btn btn-success" onclick="approveCanvas('${canvas.id}')">&#10003; Canvas genehmigen</button>
          ${isAdmin?`<button class="btn btn-primary btn-sm" onclick="saveCanvasFeedback('${canvas.id}')">&#128172; Feedback speichern</button>`:''}
        </div>
      </div></div>`;
    } else if(isAdmin&&canvas){
      ceoSec.style.display='block';
      ceoSec.innerHTML=`<div class="card"><div class="card-header"><h3>&#128272; Admin – Canvas Feedback</h3></div><div class="card-body">
        <div class="form-group"><label class="form-label">&#128172; Feedback</label><textarea class="form-control" id="canvasFeedbackInput" rows="2" placeholder="Feedback an das Team...">${canvas.adminFeedback||''}</textarea></div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="saveCanvasFeedback('${canvas.id}')">&#128190; Feedback speichern</button>
      </div></div>`;
    } else {
      ceoSec.style.display='none';
    }
  }
}
function _getCanvasBlocks(){
  return {
    partners:document.getElementById('bmc_partners')?.value||'',
    activities:document.getElementById('bmc_activities')?.value||'',
    resources:document.getElementById('bmc_resources')?.value||'',
    value:document.getElementById('bmc_value')?.value||'',
    relations:document.getElementById('bmc_relations')?.value||'',
    channels:document.getElementById('bmc_channels')?.value||'',
    segments:document.getElementById('bmc_segments')?.value||'',
    costs:document.getElementById('bmc_costs')?.value||'',
    revenue:document.getElementById('bmc_revenue')?.value||''
  };
}
function saveCanvasDraft(){
  const me=getMyMember();const team=getMyTeam();if(!team) return;
  if(me?.role!=='CMO'){showToast('Nur der CMO kann den Canvas bearbeiten','error');return;}
  const blocks=_getCanvasBlocks();
  const existing=CANVASES.find(c=>c.teamId===team.id&&c.status!=='approved');
  if(existing){
    existing.blocks=blocks;existing.updatedAt=new Date().toISOString();existing.status='draft';
  } else {
    CANVASES.push({id:'canvas'+Date.now(),teamId:team.id,gameId:team.gameId,blocks,status:'draft',
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),adminFeedback:''});
  }
  saveData();showToast('&#128196; Entwurf gespeichert','success');
}
function submitCanvas(){
  const me=getMyMember();const team=getMyTeam();if(!team) return;
  if(me?.role!=='CMO'){showToast('Nur der CMO kann den Canvas einreichen','error');return;}
  const blocks=_getCanvasBlocks();
  const hasContent=Object.values(blocks).some(v=>v.trim().length>0);
  if(!hasContent){showToast('Bitte mind. ein Feld ausf&#252;llen','error');return;}
  const existing=CANVASES.find(c=>c.teamId===team.id&&c.status!=='approved');
  if(existing){
    existing.blocks=blocks;existing.status='submitted';existing.submittedAt=new Date().toISOString();existing.updatedAt=new Date().toISOString();
  } else {
    CANVASES.push({id:'canvas'+Date.now(),teamId:team.id,gameId:team.gameId,blocks,status:'submitted',
      createdAt:new Date().toISOString(),submittedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),adminFeedback:''});
  }
  logEvent('canvas_submit',{teamId:team.id});
  saveData();renderCanvasPage();showToast('&#128228; Canvas eingereicht!','success');
}
function approveCanvas(canvasId){
  const c=CANVASES.find(x=>x.id===canvasId);if(!c) return;
  // Save admin feedback if present
  const feedbackEl=document.getElementById('canvasFeedbackInput');
  if(feedbackEl&&feedbackEl.value.trim()) c.adminFeedback=feedbackEl.value.trim();
  c.status='approved';c.approvedAt=new Date().toISOString();
  logEvent('canvas_approve',{canvasId,teamId:c.teamId});
  saveData();renderCanvasPage();showToast('&#10003; Canvas genehmigt!','success');
}
function saveCanvasFeedback(canvasId){
  const c=CANVASES.find(x=>x.id===canvasId);if(!c) return;
  const feedbackEl=document.getElementById('canvasFeedbackInput');
  if(!feedbackEl) return;
  c.adminFeedback=feedbackEl.value.trim();
  logEvent('canvas_feedback',{canvasId,teamId:c.teamId});
  saveData();renderCanvasPage();showToast('&#128172; Feedback gespeichert','success');
}
// Admin: show all canvases for a game
function renderAdminCanvases(gameId){
  const effectiveGameId=gameId||state.managingGameId||state.currentUser?.gameId;
  const gameTeams=TEAMS.filter(t=>t.gameId===effectiveGameId);
  const canvases=CANVASES.filter(c=>gameTeams.some(t=>t.id===c.teamId));
  return canvases;
}

function logEvent(action, data){
  const u = state.currentUser;
  if(!u) return;
  const team = TEAMS.find(t => t.id === (u.teamId || (getMyTeam()?.id)));
  const game = team ? GAMES.find(g => g.id === team.gameId) : (u.gameId ? GAMES.find(g => g.id === u.gameId) : null);
  const evt = {
    ts: new Date().toISOString(),
    sid: _sessionId,
    uid: u.code || '?',
    uname: u.name || '?',
    urole: u.role || '?',
    tid: team?.id || u.teamId || '',
    tname: team?.name || '',
    gid: game?.id || u.gameId || '',
    gname: game?.name || '',
    action,
    data: typeof data === 'object' ? JSON.stringify(data) : String(data||'')
  };
  _trackBuffer.push(evt);
  // Persist important events
  // Log ALL user actions to LOGS (for research & audit), skip noisy page_load
  const skipActions=['page_load','session_pause','lang_toggle'];
  if(!skipActions.includes(action)){
    LOGS.push({...evt, id:'log'+Date.now()+Math.random().toString(36).substr(2,4)});
    if(LOGS.length>2000) LOGS.splice(0,LOGS.length-2000); // keep last 2000 events
  }
  if(_trackBuffer.length >= TRACK_BATCH_SIZE) flushTrackBuffer();
}

async function flushTrackBuffer(force){
  if(_trackBuffer.length === 0) return;
  const batch = [..._trackBuffer];
  _trackBuffer = [];
  if(!CONFIG.FEEDBACK_ENDPOINT || CONFIG.FEEDBACK_ENDPOINT.includes('DEINE')) return;
  try {
    await fetch(CONFIG.FEEDBACK_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({type:'tracking', events: batch})
    });
  } catch(e) {
    // Re-queue failed events (max 50 to prevent unbounded growth)
    if(_trackBuffer.length < 50) _trackBuffer.unshift(...batch.slice(0,20));
  }
}

// Auto-flush on page hide
window.addEventListener('visibilitychange', ()=>{
  if(document.hidden) {
    logEvent('session_pause', {page: state.currentPage});
    flushTrackBuffer(true);
  }
});
window.addEventListener('beforeunload', ()=>flushTrackBuffer(true));


