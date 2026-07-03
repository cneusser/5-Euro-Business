// ════════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════════
function initApp(){
  if(!_sessionStart) _sessionStart=new Date().toISOString();
  const u=state.currentUser;
  buildNavigation();updateTopbar();updateLiveIndicator();
  buildTicker();
  const def=u.role==='superadmin'?'superadmin':u.role==='admin'?'admin':'dashboard';
  navigateTo(def);
  logEvent('page_load',{page:def});
  sendAutoBackup();
  // Auto-reminders for admins/superadmins on Fri/Sat
  if(u.role==='admin'||u.role==='superadmin'||u.role==='guest'){
    setTimeout(checkAutoReminders,3000);
  }
  // Show unread message notification
  const u_msg=state.currentUser;
  const myMsgId=u_msg.memberId||u_msg.code;
  const unreadMsgs=MESSAGES.filter(m=>m.toId===myMsgId&&!m.read);
  if(unreadMsgs.length>0){
    setTimeout(()=>{
      showToast('📬 '+unreadMsgs.length+' neue Nachricht'+(unreadMsgs.length>1?'en':'')+'! Unter Kontakt ansehen.','success');
    },800);
  }
  if(state.lang==='en') setTimeout(applyLang,200);
}

function buildNavigation(){
  const u=state.currentUser;const nav=document.getElementById('topNav');nav.innerHTML='';
  const langBtn=document.getElementById('langToggleBtn');
  if(langBtn) langBtn.textContent=state.lang==='en'?'EN':'DE';
  const pages=[];
  const unread = MESSAGES.filter(m => m.toId === (u.memberId||u.code) && !m.read).length;
  const kontaktLabel = unread > 0 ? `📬 Kontakt (${unread})` : '📬 Kontakt';
  if(u.role==='team'){
    pages.push({id:'dashboard',label:'🏆 Ranking'});
    pages.push({id:'myteam',  label:'👤 Mein Team'});
    pages.push({id:'blog',    label:'📖 Blog'});
    pages.push({id:'teams',   label:'👥 Teams'});
    pages.push({id:'kontakt',  label:kontaktLabel});
    pages.push({id:'feedback',label:'💬 Feedback'});
    pages.push({id:'konzept',  label:'📐 Konzept'});
  } else if(u.role==='member'){
    pages.push({id:'dashboard',  label:'🏆 Ranking'});
    pages.push({id:'myteam',     label:'👥 Mein Team'});
    pages.push({id:'profile',    label:'👤 Mein Profil'});
    pages.push({id:'reflection', label:'🔒 Reflexion'});
    // All members get Buchung nav item
    pages.push({id:'__booking',label:'💰 Buchung'});
    if(getMyMember()?.role==='CMO') pages.push({id:'canvas',label:'🗺️ Canvas'});
    pages.push({id:'blog',       label:'📖 Blog'});
    pages.push({id:'kontakt',    label:kontaktLabel});
    pages.push({id:'feedback',   label:'💬 Feedback'});
    pages.push({id:'konzept',    label:'📐 Konzept'});
  } else if(u.role==='admin'){
    pages.push({id:'dashboard',label:'🏆 Ranking'});
    pages.push({id:'teams',    label:'👥 Teams'});
    pages.push({id:'tx',       label:'💳 Buchungen'});
    pages.push({id:'blog',     label:'📖 Blog'});
    pages.push({id:'kontakt',  label:kontaktLabel});
    pages.push({id:'admin',    label:'⚙️ Admin',cls:'admin-nav'});
    pages.push({id:'feedback', label:'💬 Feedback'});
    pages.push({id:'konzept',  label:'📐 Konzept'});
  } else {
    // Superadmin: only show Teams/Ranking/Buchungen when managing a specific game
    if(state.managingGameId){
      pages.push({id:'dashboard',  label:'🏆 Ranking'});
      pages.push({id:'teams',      label:'👥 Teams'});
      pages.push({id:'tx',         label:'💳 Buchungen'});
      pages.push({id:'blog',       label:'📖 Blog'});
      pages.push({id:'kontakt',    label:kontaktLabel});
    }
    pages.push({id:'admin',      label:'⚙️ Admin',cls:'admin-nav'});
    pages.push({id:'superadmin', label:'👑 Super',cls:'superadmin-nav'});
    pages.push({id:'feedback',   label:'💬 Feedback'});
    pages.push({id:'konzept',    label:'📐 Konzept'});
  }
  // Feature-Flags: deaktivierte Module ausblenden (Default: alle aktiv → kein Verhaltensunterschied)
  pages.filter(p=>isPageEnabled(p.id)).forEach(p=>{
    const btn=document.createElement('button');
    btn.innerHTML=p.label;btn.className=p.cls||'';btn.dataset.page=p.id;
    btn.onclick=()=>{if(p.id==='__booking'){openModal('modalBooking');}else{navigateTo(p.id);}};nav.appendChild(btn);
  });
}

function updateTopbar(){
  const u=state.currentUser;
  const langBtn=document.getElementById('langToggleBtn');
  if(langBtn) langBtn.textContent=state.lang==='en'?'EN':'DE';
  const badge=document.getElementById('roleBadge');
  const team=getMyTeam();
  const game=u.gameId?GAMES.find(g=>g.id===u.gameId):null;
  document.getElementById('topbarGameName').textContent=game?game.name:'Plattform-Übersicht';
  if(u.role==='superadmin'){badge.className='role-badge super-badge';badge.innerHTML='👑 '+u.name+' · Superadmin';}
  else if(u.role==='admin'){badge.className='role-badge admin-badge';badge.innerHTML='⚙️ '+u.name+' · '+u.uni;}
  else if(u.role==='member'){
    const m=getMyMember();
    badge.className='role-badge member-badge';
    badge.innerHTML=(m?m.role:'?')+' · '+(team?team.logo+' '+team.name:'');
  } else {
    badge.className='role-badge team-badge';
    badge.innerHTML=(team?team.logo+' '+team.name:u.name);
  }
}

function toggleLang(){
  state.lang=state.lang==='de'?'en':'de';
  const u=state.currentUser;
  if(u&&u.role==='member'){const m=getMyMember();if(m){m.lang=state.lang;saveData();}}
  else if(u){u.lang=state.lang;saveData();}
  const langBtn=document.getElementById('langToggleBtn');
  if(langBtn) langBtn.textContent=state.lang==='en'?'EN':'DE';
  navigateTo(state.currentPage);
  if(state.lang==='en') setTimeout(applyLang,150);
  logEvent('lang_toggle',{lang:state.lang});
}

function renderPinnwand(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const gameAnnouncements=ANNOUNCEMENTS.filter(a=>a.gameId===effectiveGameId).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  const teams=TEAMS.filter(t=>t.gameId===effectiveGameId);
  const el=document.getElementById('pinnwandContent');
  if(!el) return;
  el.innerHTML='<div class="section-header"><div class="section-title admin-title">Pinnwand</div></div>'
    +'<div class="card"><div class="card-body">'
    +'<div class="form-row">'
    +'<div class="form-group" style="flex:2"><label class="form-label">Titel</label>'
    +'<input class="form-control" id="annTitle" placeholder="Titel..."></div>'
    +'<div class="form-group" style="flex:1"><label class="form-label">Zielgruppe</label>'
    +'<select class="form-control" id="annTarget"><option value="">Alle Teams</option>'
    +teams.map(t=>'<option value="'+t.id+'">'+t.logo+' '+t.name+'</option>').join('')
    +'</select></div></div>'
    +'<div class="form-group"><label class="form-label">Nachricht</label>'
    +'<textarea class="form-control" id="annText" rows="3"></textarea></div>'
    +'<div style="display:flex;gap:8px;align-items:center;">'
    +'<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">'
    +'<input type="checkbox" id="annPinned"> Anpinnen</label>'
    +'<button class="btn btn-primary btn-sm" onclick="postAnnouncement()">Ankuendigung senden</button>'
    +'</div></div></div>'
    +(gameAnnouncements.length===0
      ?'<div class="empty-state"><div class="empty-icon"></div><h3>Keine Ankuendigungen</h3></div>'
      :gameAnnouncements.map(a=>'<div class="announce-card'+(a.pinned?' pinned':'')+'"><div class="announce-title">'+(a.pinned?'X ':'')+a.title+'</div><div style="font-size:13px;white-space:pre-wrap;">'+a.text+'</div><div class="announce-meta">'+(a.teamId?'Team: '+(TEAMS.find(t=>t.id===a.teamId)||{name:a.teamId}).name:'Alle Teams')+' Von '+a.from+' <button class="btn btn-danger btn-sm" style="margin-left:12px;padding:2px 8px;" onclick="deleteAnnouncement(\''+a.id+'\')">Loeschen</button></div></div>').join(''));
}

function postAnnouncement(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const title=document.getElementById('annTitle').value.trim();
  const text=document.getElementById('annText').value.trim();
  if(!title||!text){showToast('Bitte Titel und Text ausfuellen','error');return;}
  ANNOUNCEMENTS.push({id:'ann-'+Date.now(),gameId:effectiveGameId,teamId:document.getElementById('annTarget').value||null,title,text,from:u.name||u.code,fromRole:u.role,ts:new Date().toISOString(),pinned:document.getElementById('annPinned').checked});
  saveData();
  logEvent('announcement_post',{gameId:effectiveGameId});
  showToast('Ankuendigung gesendet!','success');
  renderPinnwand();
}

function deleteAnnouncement(id){
  const idx=ANNOUNCEMENTS.findIndex(a=>a.id===id);
  if(idx>=0){ANNOUNCEMENTS.splice(idx,1);saveData();renderPinnwand();showToast('Geloescht','info');}
}

function renderDokumente(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId);
  const el=document.getElementById('dokumenteContent');
  if(!el||!game) return;
  if(!game.faqPdfs) game.faqPdfs=[];
  const pdfs=game.faqPdfs;
  el.innerHTML='<div class="section-header"><div class="section-title admin-title">Spielregeln / FAQ-Dokumente</div></div>'
    +'<div class="card"><div class="card-body">'
    +'<p style="font-size:13px;color:var(--gray-mid);margin-bottom:12px;">Lade beliebig viele PDFs hoch (je max. 5 MB).</p>'
    +(pdfs.length===0
      ?'<div class="info-box blue" style="margin-bottom:12px;"><span class="info-box-icon">i</span>Noch keine Dokumente.</div>'
      :'<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">'
        +pdfs.map(function(p){return '<div style="display:flex;align-items:center;gap:10px;background:var(--bg-light);padding:8px 12px;border-radius:var(--radius);">'
          +'<span style="font-size:20px;">&#128196;</span>'
          +'<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+p.name+'</div>'
          +(p.uploadedAt?'<div style="font-size:11px;color:var(--gray-mid);">'+new Date(p.uploadedAt).toLocaleDateString('de-DE')+'</div>':'')
          +'</div>'
          +'<button class="btn btn-outline btn-xs" onclick=\"openPdfById(\''+game.id+'\',\''+p.id+'\')">&#128065;</button>'
          +'<button class="btn btn-danger btn-xs" onclick=\"removeGamePdfById(\''+game.id+'\',\''+p.id+'\')">&#10005;</button>'
          +'</div>';}).join('')+'</div>')
    +'<div class="form-group"><label class="form-label">PDF hinzufuegen (Mehrfachauswahl moeglich)</label>'
    +'<input type="file" class="form-control" id="gamePdfFile" accept=".pdf" multiple onchange="uploadGamePdf(\''+game.id+'\',this)"></div>'
    +'</div></div>'
    +'<div class="section-header" style="margin-top:24px;"><div class="section-title admin-title">&#128506;&#65039; Canvas-Anleitungen</div></div>'
    +'<div class="card"><div class="card-body">'
    +'<p style="font-size:13px;color:var(--gray-mid);margin-bottom:12px;">Lade Pr&#228;sentationen oder Anleitungen f&#252;r den Business Model Canvas hoch (je max. 10 MB, PDF oder PPTX).</p>'
    +(function(){if(!game.canvasDocs)game.canvasDocs=[];const docs=game.canvasDocs;return docs.length===0
      ?'<div class="info-box blue" style="margin-bottom:12px;"><span class="info-box-icon">i</span>Noch keine Canvas-Dokumente.</div>'
      :'<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">'
        +docs.map(function(d){return '<div style="display:flex;align-items:center;gap:10px;background:var(--bg-light);padding:8px 12px;border-radius:var(--radius);">'
          +'<span style="font-size:20px;">'+(d.name&&d.name.endsWith('.pptx')?'&#128203;':'&#128196;')+'</span>'
          +'<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+d.name+'</div>'
          +(d.uploadedAt?'<div style="font-size:11px;color:var(--gray-mid);">'+new Date(d.uploadedAt).toLocaleDateString('de-DE')+'</div>':'')
          +'</div>'
          +'<button class="btn btn-outline btn-xs" onclick=\"openCanvasDoc(\''+game.id+'\',\''+d.id+'\')">&#128065;</button>'
          +'<button class="btn btn-danger btn-xs" onclick=\"removeCanvasDocById(\''+game.id+'\',\''+d.id+'\')">&#10005;</button>'
          +'</div>';}).join('')+'</div>';})()
    +'<div class="form-group"><label class="form-label">Dokument hinzuf&#252;gen (PDF oder PPTX)</label>'
    +'<input type="file" class="form-control" id="canvasDocFile" accept=".pdf,.pptx,.ppt" multiple onchange="uploadCanvasDoc(\''+game.id+'\',this)"></div>'
    +'</div></div>'
    +'<div class="section-header" style="margin-top:24px;"><div class="section-title admin-title">Spiel-Einstellungen</div></div>'
    +'<div class="card"><div class="card-body"><div class="form-row"><div class="form-group"><label class="form-label">Dozenten-E-Mail</label>'
    +'<input class="form-control" id="gameAdminEmail" value="'+(game.adminEmail||'')+'" placeholder="dozent@hochschule.de"></div>'
    +'<div class="form-group"><label class="form-label">noreply-Domain</label>'
    +'<input class="form-control" id="gameNoreply" value="'+(game.noreplyDomain||'5euro-business.de')+'"></div>'
    +'<div class="form-group"><label class="form-label">Anzahl Runden</label>'
    +'<input class="form-control" id="gameMaxWeeks" type="number" min="1" max="12" value="'+(game.maxWeeks||6)+'" style="max-width:80px;" title="Wie viele Wochen läuft das Spiel?"></div>'
    +'</div>'
    +'<button class="btn btn-primary btn-sm" onclick=\"saveGameSettings(\''+game.id+'\')">Speichern</button>'
    +'&nbsp;&nbsp;<button class="btn btn-secondary btn-sm" onclick=\"closeGame(\''+game.id+'\') " style="background:var(--orange)!important;color:white!important;" title="Spiel abschließen – keine neuen Buchungen mehr möglich">🔒 Spiel abschließen</button>'
    +(game.status==='closed'?'<span class="tag" style="background:#fee2e2;color:#c00;margin-left:8px;">🔒 ABGESCHLOSSEN</span>':'')
    +'</div></div>'
    +'<div id="adminFaqSection"></div>';
  setTimeout(function(){renderAdminFaq(effectiveGameId);},100);
}

function renderAdminFaq(gameId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  if(!game.faqs) game.faqs=[];
  const el=document.getElementById('dokumenteContent');
  if(!el) return;
  // append FAQ editor section
  const faqSection=document.getElementById('adminFaqSection');
  if(!faqSection) return;
  faqSection.innerHTML='<div class="section-header" style="margin-top:24px;"><div class="section-title admin-title">&#10067; Häufige Fragen verwalten</div></div>'
    +'<div class="card"><div class="card-body">'
    +'<div id="adminFaqList">'
    +game.faqs.map(function(f){return '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;background:var(--bg-light);padding:10px;border-radius:var(--radius);">'
      +'<div style="flex:1;"><div style="font-weight:700;font-size:13px;margin-bottom:3px;">'+f.question+'</div>'
      +'<div style="font-size:12px;color:var(--gray-mid);">'+f.answer+'</div></div>'
      +'<button class="btn btn-danger btn-xs" onclick=\"removeGameFaq(\''+gameId+'\',\''+f.id+'\')">&#10005;</button>'
      +'</div>';}).join('')
    +'</div>'
    +'<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">'
    +'<div class="form-group"><label class="form-label">Neue Frage</label>'
    +'<input class="form-control" id="faqNewQ" placeholder="z.B. Wie funktioniert die Abrechnung?"></div>'
    +'<div class="form-group"><label class="form-label">Antwort</label>'
    +'<textarea class="form-control" id="faqNewA" rows="2" placeholder="Antwort..."></textarea></div>'
    +'<button class="btn btn-primary btn-sm" onclick=\"addGameFaq(\''+gameId+'\')">&#10133; Frage hinzufügen</button>'
    +'</div></div></div>';
}
function addGameFaq(gameId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  if(!game.faqs) game.faqs=[];
  const q=document.getElementById('faqNewQ').value.trim();
  const a=document.getElementById('faqNewA').value.trim();
  if(!q||!a){showToast('Frage und Antwort ausfüllen','error');return;}
  game.faqs.push({id:'faq-'+Date.now(),question:q,answer:a,createdAt:new Date().toISOString()});
  saveData();
  renderAdminFaq(gameId);
  showToast('FAQ hinzugefügt','success');
}
function removeGameFaq(gameId,faqId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game||!game.faqs) return;
  game.faqs=game.faqs.filter(function(f){return f.id!==faqId;});
  saveData();
  renderAdminFaq(gameId);
}
function uploadGamePdf(gameId,input){
  const files=Array.from(input.files);
  if(!files.length) return;
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  if(!game.faqPdfs) game.faqPdfs=[];
  let done=0;
  files.forEach(function(file){
    if(file.size>5*1024*1024){showToast(file.name+' zu gross (max. 5 MB)','error');return;}
    const reader=new FileReader();
    reader.onload=function(e){
      game.faqPdfs.push({id:'pdf-'+Date.now()+'-'+Math.random().toString(36).substr(2,4),
        name:file.name,data:e.target.result.split(',')[1],uploadedAt:new Date().toISOString()});
      done++;
      if(done===files.length){saveData();showToast(done+' PDF(s) gespeichert','success');logEvent('pdf_upload',{gameId,count:done});renderDokumente();}
    };
    reader.onerror=function(){done++;showToast('Fehler beim Lesen: '+file.name,'error');if(done===files.length&&game.faqPdfs.length){saveData();renderDokumente();}};
    reader.readAsDataURL(file);
  });
}

function removeGamePdf(gameId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  delete game.faqPdf; delete game.faqPdfName;
  if(game.faqPdfs) game.faqPdfs=[];
  saveData();showToast('PDFs entfernt','info');renderDokumente();
}

function removeGamePdfById(gameId,pdfId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game||!game.faqPdfs) return;
  const p=game.faqPdfs.find(function(x){return x.id===pdfId;});
  game.faqPdfs=game.faqPdfs.filter(function(x){return x.id!==pdfId;});
  saveData();showToast((p?p.name:'PDF')+' entfernt','info');renderDokumente();
}

// --- Canvas Documents (admin upload for CMO instruction files) ---
function uploadCanvasDoc(gameId,input){
  const files=Array.from(input.files);
  if(!files.length) return;
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  if(!game.canvasDocs) game.canvasDocs=[];
  let done=0;
  files.forEach(function(file){
    if(file.size>10*1024*1024){showToast(file.name+' zu gross (max. 10 MB)','error');return;}
    const reader=new FileReader();
    reader.onload=function(e){
      game.canvasDocs.push({id:'cdoc-'+Date.now()+'-'+Math.random().toString(36).substr(2,4),
        name:file.name,data:e.target.result.split(',')[1],mime:file.type||'application/octet-stream',uploadedAt:new Date().toISOString()});
      done++;
      if(done===files.length){saveData();showToast(done+' Dokument(e) gespeichert','success');logEvent('canvas_doc_upload',{gameId,count:done});renderDokumente();}
    };
    reader.onerror=function(){done++;showToast('Fehler beim Lesen: '+file.name,'error');};
    reader.readAsDataURL(file);
  });
}
function removeCanvasDocById(gameId,docId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game||!game.canvasDocs) return;
  const d=game.canvasDocs.find(function(x){return x.id===docId;});
  game.canvasDocs=game.canvasDocs.filter(function(x){return x.id!==docId;});
  saveData();showToast((d?d.name:'Dokument')+' entfernt','info');renderDokumente();
}
function openCanvasDoc(gameId,docId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game||!game.canvasDocs) return;
  const d=game.canvasDocs.find(function(x){return x.id===docId;});
  if(!d){showToast('Dokument nicht gefunden','error');return;}
  if(d.name&&d.name.toLowerCase().endsWith('.pdf')){
    const frame=document.getElementById('pdfViewerFrame');
    const title=document.getElementById('pdfViewerTitle');
    const dl=document.getElementById('pdfViewerDownload');
    if(title) title.textContent=d.name;
    const src='data:application/pdf;base64,'+d.data;
    if(frame) frame.src=src;
    if(dl){dl.href=src;dl.download=d.name;}
    openModal('modalPdfViewer');
    logEvent('canvas_doc_view',{gameId,name:d.name});
  } else {
    // For PPTX and other types: trigger download
    const a=document.createElement('a');
    a.href='data:'+(d.mime||'application/octet-stream')+';base64,'+d.data;
    a.download=d.name;document.body.appendChild(a);a.click();document.body.removeChild(a);
    logEvent('canvas_doc_download',{gameId,name:d.name});
  }
}
function openPdfById(gameId,pdfId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game||!game.faqPdfs) return;
  const p=game.faqPdfs.find(function(x){return x.id===pdfId;});
  if(!p){showToast('PDF nicht gefunden','error');return;}
  const frame=document.getElementById('pdfViewerFrame');
  const title=document.getElementById('pdfViewerTitle');
  const dl=document.getElementById('pdfViewerDownload');
  if(title) title.textContent=p.name;
  const src='data:application/pdf;base64,'+p.data;
  frame.src=src;
  if(dl){dl.href=src;dl.download=p.name;}
  openModal('modalPdfViewer');
  logEvent('pdf_view',{gameId,name:p.name});
}

function openGamePdf(pdfId){
  const u=state.currentUser;
  const g=u&&u.gameId?GAMES.find(function(x){return x.id===u.gameId;}):null;
  if(!g) return;
  const pdfs=(g.faqPdfs||[]);
  const p=pdfId?pdfs.find(function(x){return x.id===pdfId;}):pdfs[0];
  const data=p?p.data:g.faqPdf;
  const name=p?p.name:(g.faqPdfName||'Dokument');
  if(!data){showToast('Kein Dokument verfuegbar','error');return;}
  const frame=document.getElementById('pdfViewerFrame');
  const title=document.getElementById('pdfViewerTitle');
  const dl=document.getElementById('pdfViewerDownload');
  if(title) title.textContent=name;
  const src='data:application/pdf;base64,'+data;
  frame.src=src;
  if(dl){dl.href=src;dl.download=name;}
  openModal('modalPdfViewer');
  logEvent('pdf_view',{name});
}

function closeGame(gameId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  if(game.status==='closed'){showToast('Spiel ist bereits abgeschlossen.','info');return;}
  if(!confirm('Spiel "'+game.name+'" wirklich abschließen? Danach können keine neuen Buchungen oder Berichte mehr eingereicht werden.')) return;
  game.status='closed';
  saveData();
  showToast('🔒 Spiel abgeschlossen.','success');
  if(state.currentUser?.role==='admin') navigateTo('admin');
  else renderSuperPanel();
}
function deleteGame(gameId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  if(!confirm('Spiel "'+game.name+'" und ALLE zugehörigen Daten (Teams, Mitglieder, Buchungen, Berichte) endgültig löschen? Diese Aktion kann NICHT rückgängig gemacht werden!')) return;
  if(!confirm('Wirklich? Dies löscht alle Daten des Spiels unwiderruflich.')) return;
  const tids=TEAMS.filter(t=>t.gameId===gameId).map(t=>t.id);
  const mids=MEMBERS.filter(m=>tids.includes(m.teamId)).map(m=>m.id);
  function filterOut(arr,key,ids){let i=arr.length;while(i--){if(ids.includes(arr[i][key]))arr.splice(i,1);}}
  filterOut(TRANSACTIONS,'teamId',tids);
  filterOut(BLOGS,'teamId',tids);
  filterOut(REFLECTIONS,'teamId',tids);
  filterOut(REFLECTIONS,'memberId',mids);
  filterOut(MEMBERS,'teamId',tids);
  filterOut(TEAMS,'gameId',[gameId]);
  filterOut(ADMINS,'gameId',[gameId]);
  const gi=GAMES.findIndex(g=>g.id===gameId);if(gi>=0) GAMES.splice(gi,1);
  rebuildCodes();saveData();
  showToast('🗑️ Spiel gelöscht.','success');
  renderSuperPanel();
}
function saveGameSettings(gameId){
  const game=GAMES.find(g=>g.id===gameId);
  if(!game) return;
  game.adminEmail=document.getElementById('gameAdminEmail').value.trim();
  game.noreplyDomain=document.getElementById('gameNoreply').value.trim();
  const mw=parseInt(document.getElementById('gameMaxWeeks')?.value);
  if(mw&&mw>=1&&mw<=12) game.maxWeeks=mw;
  saveData();
  updateLiveIndicator();
  showToast('Gespeichert','success');
  logEvent('game_settings_save',{gameId,adminEmail:game.adminEmail,maxWeeks:game.maxWeeks});
}


function renderMessaging(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId);
  const teams=TEAMS.filter(t=>t.gameId===effectiveGameId&&t.status!=='pending');
  const allMembers=MEMBERS.filter(m=>teams.some(t=>t.id===m.teamId));
  const withEmail=allMembers.filter(m=>m.email);
  const el=document.getElementById('messagingContent');
  if(!el) return;
  el.innerHTML='<div class="section-header"><div class="section-title admin-title">Nachricht versenden</div></div>'
    +'<div class="card"><div class="card-body">'
    +'<p style="font-size:13px;color:var(--gray-mid);margin-bottom:12px;">In-App-Nachricht an alle Studierenden ('+allMembers.length+' Personen'+(withEmail.length>0?', '+withEmail.length+' per E-Mail':'')+')</p>'
    +'<div class="form-group"><label class="form-label">Empfänger</label>'
    +'<select class="form-control" id="msgRecipient"><option value="all">Alle ('+allMembers.length+')</option>'
    +teams.map(function(t){var tm=allMembers.filter(function(m){return m.teamId===t.id;});return tm.length>0?'<option value="team:'+t.id+'">'+t.logo+' '+t.name+' ('+tm.length+')</option>':''}).join('')
    +allMembers.map(function(m){return '<option value="member:'+m.id+'">'+m.name+' ('+m.role+')</option>'}).join('')
    +'</select></div>'
    +'<div class="form-group"><label class="form-label">Betreff</label><input class="form-control" id="msgSubject" placeholder="..."></div>'
    +'<div class="form-group"><label class="form-label">Nachricht</label><textarea class="form-control" id="msgBody" rows="5"></textarea></div>'
    +'<button class="btn btn-primary btn-sm" onclick="sendAdminMessage()">Senden</button>'
    +'<div id="msgStatus" style="margin-top:10px;"></div></div></div>';
}

async function sendAdminMessage(){
  const u=state.currentUser;
  const effectiveGameId=state.managingGameId||u.gameId;
  const game=GAMES.find(g=>g.id===effectiveGameId);
  const subject=document.getElementById('msgSubject').value.trim();
  const body=document.getElementById('msgBody').value.trim();
  const recipientVal=document.getElementById('msgRecipient').value;
  if(!subject||!body){showToast('Betreff und Nachricht fehlen','error');return;}
  const teams=TEAMS.filter(t=>t.gameId===effectiveGameId);
  // Resolve recipient member IDs
  let targetMembers=[];
  if(recipientVal==='all'){targetMembers=MEMBERS.filter(m=>teams.some(t=>t.id===m.teamId));}
  else if(recipientVal.startsWith('team:')){const tid=recipientVal.split(':')[1];targetMembers=MEMBERS.filter(m=>m.teamId===tid);}
  else if(recipientVal.startsWith('member:')){const mid=recipientVal.split(':')[1];const mem=MEMBERS.find(x=>x.id===mid);if(mem) targetMembers=[mem];}
  if(targetMembers.length===0){showToast('Keine Empfänger gefunden','error');return;}
  const statusEl=document.getElementById('msgStatus');
  statusEl.innerHTML='<div class="info-box blue">⏳ Wird gesendet...</div>';
  const now=new Date().toISOString().split('T')[0];
  const fromId=u.memberId||u.code;
  const fromName=u.name||u.code;
  // 1) Always save in-app messages (guaranteed to work)
  targetMembers.forEach(mem=>{
    MESSAGES.push({
      id:'m'+Date.now()+Math.random().toString(36).substr(2,4),
      fromId, fromName,
      toId:mem.id||mem.code,
      toName:mem.name||mem.email||'Unbekannt',
      subject, body,
      date:now,
      read:false,
      adminBroadcast:true
    });
  });
  saveData();
  logEvent('admin_message_sent',{gameId:effectiveGameId,count:targetMembers.length});
  statusEl.innerHTML='<div class="info-box green">✅ Nachricht an '+targetMembers.length+' Empfänger gesendet</div>';
  document.getElementById('msgSubject').value='';
  document.getElementById('msgBody').value='';
  buildNavigation();
  // 2) Optionally try email as fire-and-forget (failure is silent)
  const emailRecipients=targetMembers.filter(m=>m.email).map(m=>m.email);
  if(emailRecipients.length>0 && CONFIG.FEEDBACK_ENDPOINT && !CONFIG.FEEDBACK_ENDPOINT.includes('DEINE')){
    fetch(CONFIG.FEEDBACK_ENDPOINT,{method:'POST',body:JSON.stringify({
      type:'admin_message',from:fromName,
      noreplyDomain:game&&game.noreplyDomain?game.noreplyDomain:'venturelab.dhbw.de',
      gameName:game?game.name:'VentureLab',subject,body,recipients:emailRecipients
    })}).then(r=>r.json()).then(res=>{
      if(res&&res.success) console.info('📧 E-Mail gesendet an',emailRecipients.length,'Empfänger');
      else console.warn('📧 E-Mail-Versand Fehler:',res&&res.error);
    }).catch(e=>console.warn('📧 E-Mail-Versand nicht möglich (kein Server):',e.message));
  }
}

function buildTicker(){
  const track=document.getElementById('tickerTrack');
  if(!track) return;
  // Only show non-pending named teams
  const visibleTeams=TEAMS.filter(t=>t.status!=='pending'&&t.name&&t.name.trim());
  if(visibleTeams.length===0){
    track.innerHTML='<span>Willkommen beim VentureLab Tracker 🎓</span><span>Registriere dein Team um loszulegen 🚀</span>';
    return;
  }
  // MVP items — one per team per completed week (newest first)
  const mvpItems=[];
  visibleTeams.forEach(team=>{
    const mvps=[...(team.mvps||[])].sort((a,b)=>b.week-a.week);
    mvps.forEach(mv=>{
      const member=MEMBERS.find(m=>m.id===mv.memberId);
      if(member) mvpItems.push(`<span>🏆 MVP Woche ${mv.week}: <strong>${member.name}</strong> — ${team.logo} ${team.name}</span>`);
    });
  });
  // Transaction items (last 8, most recent first)
  const txItems=[...TRANSACTIONS]
    .filter(tx=>visibleTeams.find(t=>t.id===tx.teamId))
    .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(tx=>{
      const team=visibleTeams.find(t=>t.id===tx.teamId);
      return `<span>${team.logo+' '+team.name}: ${tx.type==='income'?'+':'-'}${fmtEur(tx.amount)} – ${tx.desc}</span>`;
    });
  const allItems=[...mvpItems,...txItems];
  if(allItems.length===0){track.innerHTML='<span>Noch keine Aktivitäten 🚀</span>';return;}
  // Duplicate for seamless loop
  const html=allItems.join('');
  track.innerHTML=html+html;
}

