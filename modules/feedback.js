// ════════════════════════════════════════════════════════════════════
//  FEEDBACK PAGE
// ════════════════════════════════════════════════════════════════════
function renderFeedback(){
  let selectedType=null;
  document.getElementById('feedbackContent').innerHTML=`
    <div class="feedback-hero">
      <h2>💬 Feedback, Infos &amp; Bugreports</h2>
      <p>Verbesserungsvorschläge, technische Probleme oder allgemeine Fragen – alles hier.</p>
    </div>
    <div class="info-box blue" style="margin-bottom:14px;"><span class="info-box-icon">📬</span>Dein Feedback wird direkt an den Dozenten (<a href="mailto:${(()=>{const _g=state.currentUser&&state.currentUser.gameId?GAMES.find(x=>x.id===state.currentUser.gameId):null;return _g&&_g.adminEmail?_g.adminEmail:'christian.neusser@me.com';})()}" style="color:var(--blue-mid);font-weight:700;">${(()=>{const _g=state.currentUser&&state.currentUser.gameId?GAMES.find(x=>x.id===state.currentUser.gameId):null;return _g&&_g.adminEmail?_g.adminEmail:'christian.neusser@me.com';})()}</a>) und in ein Google Sheet weitergeleitet.</div>
    <div class="feedback-type-grid">
      <div class="feedback-type-card" onclick="selectFeedbackType('info',this)"><div class="feedback-type-icon">ℹ️</div><div class="feedback-type-label">Info anfragen</div><div class="feedback-type-desc">Fragen zur Plattform oder zum Spiel</div></div>
      <div class="feedback-type-card" onclick="selectFeedbackType('improvement',this)"><div class="feedback-type-icon">💡</div><div class="feedback-type-label">Verbesserungsvorschlag</div><div class="feedback-type-desc">Ideen für neue Features</div></div>
      <div class="feedback-type-card" onclick="selectFeedbackType('bug',this)"><div class="feedback-type-icon">🐛</div><div class="feedback-type-label">Bugreport</div><div class="feedback-type-desc">Fehler oder technische Probleme melden</div></div>
      <div class="feedback-type-card" onclick="selectFeedbackType('other',this)"><div class="feedback-type-icon">📧</div><div class="feedback-type-label">Sonstiges</div><div class="feedback-type-desc">Allgemeine Nachrichten</div></div>
    </div>
    <div id="feedbackForm" style="display:none;max-width:640px;">
      <div class="card"><div class="card-body">
        <div class="form-group"><label class="form-label">Betreff <span class="req">*</span></label><input class="form-control" id="fbSubject" placeholder="Kurze Zusammenfassung..."></div>
        <div class="form-group"><label class="form-label">Nachricht <span class="req">*</span></label><textarea class="form-control" id="fbMessage" rows="4" placeholder="Detaillierte Beschreibung..." oninput="countChars(this,'fbCount',1000)"></textarea><div class="char-counter" id="fbCount">0 / 1000</div></div>
        <div id="bugFields" style="display:none;">
          <div class="form-group"><label class="form-label">Seite / Bereich</label><input class="form-control" id="fbPage" placeholder="z.B. Mein Team → Buchungen"></div>
          <div class="form-group"><label class="form-label">Schritte zur Reproduktion</label><textarea class="form-control" id="fbSteps" rows="2" placeholder="1. Klick auf... 2. Dann..."></textarea></div>
        </div>
        <div style="display:flex;gap:8px;"><button class="btn btn-secondary btn-sm" onclick="document.getElementById('feedbackForm').style.display='none'">Abbrechen</button><button class="btn btn-primary btn-sm" onclick="submitFeedback()">📤 Absenden</button></div>
      </div></div>
    </div>
    <div class="section-header" style="margin-top:28px;"><div class="section-title">❓ Häufige Fragen</div></div>
    <div id="faqList">
      ${[
        ['Wie reiche ich meinen Wochenbericht ein?','Im Bereich "Mein Team" → "Berichte" auf "+ Bericht einreichen" klicken. Nach Admin-Freigabe startet automatisch die nächste Woche.'],
        ['Wann wird mein Bericht freigeschaltet?','Berichte werden vom Dozenten/Admin geprüft. Nach Freigabe erscheint er im öffentlichen Blog und eure Woche wird weitergestellt.'],
        ['Kann ich meinen Team-Namen ändern?','Ja! Unter "Mein Team" → "Team-Profil" kann der Team-Name, Slogan und die Beschreibung bearbeitet werden.'],
        ['Wie ändere ich mein Profilfoto?','Unter "Mein Profil" (nur mit persönlichem Mitglieds-Code) das Foto hochladen oder auf das Profilbild klicken.'],
        ['Sind meine Reflexionen öffentlich?','Nein. Reflexionen sind streng privat – nur du und der Dozent/Admin können sie sehen.'],
        ['Wie bekomme ich meinen persönlichen Zugangscode?','Euer Admin generiert individuelle Codes (Format: MBR-XX-N) und teilt diese euch mit.'],
        ['Wer kann den Wochenbericht einreichen?','Alle Teammitglieder können den Wochenbericht bearbeiten und Inhalte eintragen. Einreichen (d.h. zur Freigabe übergeben) darf jedoch ausschließlich der CEO des Teams. Dies stellt sicher, dass der Bericht intern abgestimmt und freigegeben wurde.'],
        ['Bis wann muss die Reflexion eingereicht werden?','Die persönliche wöchentliche Reflexion muss bis Samstag 23:59 Uhr eingereicht werden. Erst wenn alle Teammitglieder ihre Reflexion abgegeben haben, kann der CEO den Wochenbericht einreichen. Der Wochenbericht hat eine Deadline von Sonntag 23:59 Uhr.'],
        ['Wie funktioniert die Wahl des Mitglieds der Woche?','Jedes Teammitglied nominiert in seiner persönlichen Reflexion ein anderes Mitglied als MVP. Nach Mehrheitsprinzip wird das Mitglied mit den meisten Stimmen ausgewählt. Bei Stimmengleichheit (Patt) zählt die Stimme des CEO doppelt. Der CEO kann das Ergebnis beim Einreichen des Wochenberichts überstimmen, falls gewünscht.'],
        ['Wann wird die Team-Stimmung sichtbar?','Die Team-Stimmung wird automatisch als Durchschnitt der Stimmungsangaben aus den individuellen Reflexionen berechnet. Sie erscheint erst nach der Freigabe des Wochenberichts durch den Admin im öffentlichen Blog, damit individuelle Angaben geschützt bleiben.'],
      ].map(([q,a])=>`<div class="faq-item"><div class="faq-question" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">❓ ${q} <span style="font-size:14px;">▾</span></div><div class="faq-answer">${a}</div></div>`).join('')}
    </div>
    <div id="faqCustomSection"></div>
    <div id="faqDocSection"></div>
  `;
  setTimeout(function(){
    const _u=state.currentUser;
    const _g=_u&&_u.gameId?GAMES.find(function(x){return x.id===_u.gameId;}):null;
    if(!_g) return;
    // Custom admin FAQs
    const _cstm=document.getElementById('faqCustomSection');
    if(_cstm&&_g.faqs&&_g.faqs.length>0){
      _cstm.innerHTML='<div class="section-header" style="margin-top:16px;"><div class="section-title">&#10067; Fragen vom Dozenten</div></div>'
        +_g.faqs.map(function(f){return '<div class="faq-item"><div class="faq-question" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'block\'?\'none\':\'block\'">❓ '+f.question+' <span style="font-size:14px;">▾</span></div><div class="faq-answer">'+f.answer+'</div></div>';}).join('');
    }
    // PDFs at the very bottom
    const _sec=document.getElementById('faqDocSection');
    if(!_sec) return;
    const _pdfs=(_g.faqPdfs||[]).concat(_g.faqPdf?[{id:'legacy',name:_g.faqPdfName||'Dokument',data:_g.faqPdf}]:[]);
    if(_pdfs.length===0) return;
    _sec.innerHTML='<div class="section-header" style="margin-top:16px;margin-bottom:8px;"><div class="section-title">&#128196; Dokumente vom Dozenten</div></div>'
      +_pdfs.map(function(p){
        return '<div class="card" style="margin-bottom:10px;"><div class="card-body" style="display:flex;align-items:center;gap:14px;padding:12px 16px;">'
          +'<span style="font-size:26px;">&#128196;</span>'
          +'<div style="flex:1;"><div style="font-weight:700;font-size:13px;">'+p.name+'</div>'
          +(p.uploadedAt?'<div style="font-size:11px;color:var(--gray-mid);">'+new Date(p.uploadedAt).toLocaleDateString('de-DE')+'</div>':'')
          +'</div>'
          +'<button class="btn btn-primary btn-sm" onclick=\"openGamePdf(\''+p.id+'\')">&#128065; &#214;ffnen</button>'
          +'</div></div>';
      }).join('');
  },50);
}
function openDraftForEdit(blogId){
  const b=BLOGS.find(x=>x.id===blogId);
  if(!b) return;
  // pre-fill modal fields from draft
  openModal('modalBlog');
  setTimeout(function(){
    if(document.getElementById('blogTitle')) document.getElementById('blogTitle').value=b.title||'';
    if(document.getElementById('blogWeek')) document.getElementById('blogWeek').value='Woche '+b.week;
    if(document.getElementById('blogActivities')) document.getElementById('blogActivities').value=b.body||'';
    if(document.getElementById('blogHighlight')) document.getElementById('blogHighlight').value=b.highlight||'';
    if(document.getElementById('blogChallenges')) document.getElementById('blogChallenges').value=b.challenges||'';
    if(document.getElementById('blogNextSteps')) document.getElementById('blogNextSteps').value=b.nextSteps||'';
    if(document.getElementById('blogTags')) document.getElementById('blogTags').value=(b.tags||[]).join(', ');
    // Restore existing attachments so they're not lost on re-save
    window._blogAttachments=[...(b.attachments||[])];
    _renderAttachBadges(window._blogAttachments,'blogAttachList','_blogAttachments');
    updateBlogReflectionStatus();
  },100);
}
// v0.8.5: unified blog modal opener for all team members
function openBlogModal(blogId){
  if(blogId) openDraftForEdit(blogId);
  else { _clearBlogAttachments(); openModal('modalBlog'); } // v0.8.5: clear stale attachments on fresh open
  setTimeout(function(){
    const me=getMyMember();
    const isCeo=me&&me.role==='CEO';
    const sbtn=document.getElementById('blogSubmitBtn');
    if(sbtn) sbtn.style.display=isCeo?'':'none';
  },80);
}
function updateLiveIndicator(){
  return;
}
function selectFeedbackType(type,el){
  document.querySelectorAll('.feedback-type-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  state.feedbackType=type;
  document.getElementById('feedbackForm').style.display='block';
  document.getElementById('bugFields').style.display=type==='bug'?'block':'none';
  document.getElementById('feedbackForm').scrollIntoView({behavior:'smooth'});
}
async function submitFeedback(){
  const s=document.getElementById('fbSubject').value.trim();
  const m=document.getElementById('fbMessage').value.trim();
  if(!s||!m){showToast('Bitte Betreff und Nachricht ausfüllen','error');return;}
  const payload={
    from: state.currentUser.name,
    team: getMyTeam()?.name||'—',
    type: state.feedbackType||'general',
    subject: s,
    message: m,
    page: document.getElementById('fbPage')?.value||'',
    steps: document.getElementById('fbSteps')?.value||'',
    date: new Date().toISOString(),
    adminEmail: CONFIG.ADMIN_EMAIL,
  };
  const fbEntry={id:'f'+Date.now(),...payload};
  FEEDBACKS.push(fbEntry);
  saveData(); // v0.8.5: persist to Firebase so feedback survives reload
  document.getElementById('feedbackForm').style.display='none';
  showToast('📤 Feedback gesendet – danke!');
  ['fbSubject','fbMessage','fbPage','fbSteps'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  // Send to Google Sheets + email via Apps Script
  if(CONFIG.FEEDBACK_ENDPOINT){
    try{
      fetch(CONFIG.FEEDBACK_ENDPOINT,{
        method:'POST',
        mode:'no-cors', // fire-and-forget – Apps Script receives it
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      }).catch(()=>{}); // ignore opaque-response error in no-cors
    }catch(e){console.warn('[Feedback] Endpoint nicht erreichbar:',e);}
  }
  if(typeof logActivity==='function') logActivity('feedback','Feedback: '+payload.type+' – '+payload.subject);
}

