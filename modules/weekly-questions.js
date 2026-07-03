// ════════════════════════════════════════════════════════════════════
//  FEATURE (a): CUSTOM WEEKLY QUESTIONS
// ════════════════════════════════════════════════════════════════════
function getGameCustomQuestions(gameId){
  const g=GAMES.find(x=>x.id===gameId);
  if(!g) return [];
  if(!g.customQuestions) g.customQuestions=[];
  return g.customQuestions;
}
function renderCustomQuestionsAdmin(){
  const wrap=document.getElementById('customQuestionsAdminWrap');
  if(!wrap) return;
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u?.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId);
  if(!game) return;
  if(!game.customQuestions) game.customQuestions=[];
  const qs=game.customQuestions;
  wrap.innerHTML=`
    <div class="card" style="margin-top:18px;margin-bottom:16px;">
      <div class="card-header"><h3 style="font-size:13px;">&#128221; Zusatzfragen pro Woche</h3></div>
      <div class="card-body">
        <div class="info-box blue" style="margin-bottom:12px;"><span class="info-box-icon">&#128161;</span>Zusatzfragen erscheinen in den Reflexions- bzw. Berichtsformularen der jeweiligen Woche zus&#228;tzlich zu den Standard-Fragen.</div>
        <div class="form-row" style="align-items:flex-end;gap:8px;flex-wrap:wrap;">
          <div class="form-group" style="min-width:180px;flex:2"><label class="form-label">Frage</label>
            <input class="form-control" id="cqText" placeholder="z.B. Wie war die Kundenkommunikation?"></div>
          <div class="form-group"><label class="form-label">Woche</label>
            <select class="form-control" id="cqWeek">${[1,2,3,4,5,6,7,8].map(w=>`<option value="${w}">Woche ${w}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Ziel</label>
            <select class="form-control" id="cqTarget"><option value="reflection">Reflexion</option><option value="blog">Wochenbericht</option><option value="both">Beide</option></select></div>
          <div class="form-group" style="align-self:flex-end;">
            <button class="btn btn-primary btn-sm" onclick="addCustomQuestion('${effectiveGameId}')">+ Hinzuf&#252;gen</button>
          </div>
        </div>
        ${qs.length===0?'<div style="color:var(--gray-mid);font-size:12px;padding:8px 0;">Noch keine Zusatzfragen angelegt.</div>':''}
        <table class="data-table" style="width:100%;${qs.length===0?'display:none':''}">
          <thead><tr><th>Woche</th><th>Ziel</th><th>Frage</th><th>Aktion</th></tr></thead>
          <tbody>${qs.map(q=>`<tr>
            <td>W${q.week}</td>
            <td><span class="tag tag-blue">${q.target==='reflection'?'Reflexion':q.target==='blog'?'Bericht':'Beide'}</span></td>
            <td style="font-size:12px;">${q.text}</td>
            <td><button class="btn btn-danger btn-xs" onclick="deleteCustomQuestion('${effectiveGameId}','${q.id}')">&#128465;&#65039;</button></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
}
function addCustomQuestion(gameId){
  const text=document.getElementById('cqText')?.value.trim();
  if(!text){showToast('Bitte Fragetext eingeben','error');return;}
  const week=parseInt(document.getElementById('cqWeek')?.value||1);
  const target=document.getElementById('cqTarget')?.value||'reflection';
  const game=GAMES.find(g=>g.id===gameId);if(!game) return;
  if(!game.customQuestions) game.customQuestions=[];
  const q={id:'cq'+Date.now(),week,target,text};
  game.customQuestions.push(q);
  logEvent('custom_q_add',{gameId,week,target,text});
  saveData();renderCustomQuestionsAdmin();
  document.getElementById('cqText').value='';
  showToast('&#128221; Zusatzfrage hinzugef&#252;gt','success');
}
function deleteCustomQuestion(gameId,qId){
  const game=GAMES.find(g=>g.id===gameId);if(!game||!game.customQuestions) return;
  const idx=game.customQuestions.findIndex(q=>q.id===qId);
  if(idx<0) return;
  game.customQuestions.splice(idx,1);
  logEvent('custom_q_delete',{gameId,qId});
  saveData();renderCustomQuestionsAdmin();
  showToast('&#10005; Frage gel&#246;scht','info');
}
function populateCustomQuestionsModal(target,week){
  const team=getMyTeam();if(!team) return;
  const game=GAMES.find(g=>g.id===team.gameId);if(!game) return;
  const qs=(game.customQuestions||[]).filter(q=>q.week===week&&(q.target===target||q.target==='both'));
  const containerId=target==='reflection'?'refCustomQuestions':'blogCustomQuestions';
  const el=document.getElementById(containerId);if(!el) return;
  if(qs.length===0){el.innerHTML='';return;}
  el.innerHTML=`<div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px;">
    <div class="form-section-title">&#128221; Zusatzfragen Woche ${week}</div>
    ${qs.map(q=>`<div class="form-group">
      <label class="form-label">${q.text}</label>
      <textarea class="form-control" id="cqa_${q.id}" rows="2" data-cqid="${q.id}" placeholder="Deine Antwort..."></textarea>
    </div>`).join('')}
  </div>`;
}
function collectCustomAnswers(containerId){
  const el=document.getElementById(containerId);if(!el) return {};
  const ans={};
  el.querySelectorAll('[data-cqid]').forEach(inp=>{
    if(inp.value.trim()) ans[inp.dataset.cqid]=inp.value.trim();
  });
  return ans;
}

