// ════════════════════════════════════════════════════════════════════
//  REFLECTION PAGE
// ════════════════════════════════════════════════════════════════════
function selectMood(v){
  state.selectedMood=v;document.getElementById('refMood').value=v;
  document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.toggle('selected',parseInt(b.dataset.val)===v);});
}
function renderReflectionPage(){
  const m=getMyMember();if(!m){navigateTo('dashboard');return;}
  const myRefs=REFLECTIONS.filter(r=>r.memberId===m.id).sort((a,b)=>b.date.localeCompare(a.date));
  // pre-select current mood btn
  setTimeout(()=>document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.toggle('selected',parseInt(b.dataset.val)===state.selectedMood);}),50);
  const el=document.getElementById('reflectionList');
  if(myRefs.length===0){el.innerHTML='<div class="empty-state"><div class="empty-icon">💬</div><h3>Noch keine Reflexionen</h3><p>Klicke oben auf "Neue Reflexion".</p></div>';return;}
  const myTeam=getMyTeam();
  el.innerHTML=myRefs.map(r=>{
    const moodEmoji=['','😩','😟','😐','😊','🚀'][r.mood];
    const weekOpen = myTeam && myTeam.currentWeek===r.week && myTeam.weekStatus==='open';
    return `<div class="reflection-card">
      <div class="reflection-header">
        <div><strong>Woche ${r.week}</strong> · ${fmtDate(r.date)}${r.updatedAt?` <span style="font-size:10px;color:var(--gray-mid);">(bearbeitet ${fmtDate(r.updatedAt)})</span>`:''}</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span>${moodEmoji} ${r.mood}/5</span>
          ${weekOpen?`<button class="btn btn-outline btn-xs" onclick="editReflection('${r.id}')" title="Bearbeiten solange Woche offen">✏️ Bearbeiten</button>`:'<span style="font-size:10px;color:var(--gray-mid);">🔒 Abgeschlossen</span>'}
        </div>
      </div>
      <div class="reflection-body">
        ${r.experience?`<div class="reflection-section"><div class="reflection-section-label">Erfahrungen</div><div class="reflection-text">${r.experience}</div></div>`:''}
        ${r.liked?`<div class="reflection-section"><div class="reflection-section-label">👍 Was war gut</div><div class="reflection-text">${r.liked}</div></div>`:''}
        ${r.improved?`<div class="reflection-section"><div class="reflection-section-label">💡 Was ich anders machen würde</div><div class="reflection-text">${r.improved}</div></div>`:''}
        ${r.role?`<div class="reflection-section"><div class="reflection-section-label">🤝 Meine Rolle</div><div class="reflection-text">${r.role}</div></div>`:''}
      </div>
    </div>`;}).join('');
}

