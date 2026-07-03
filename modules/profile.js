// ════════════════════════════════════════════════════════════════════
//  PROFILE PAGE (member)
// ════════════════════════════════════════════════════════════════════
function renderProfile(){
  const m=getMyMember();if(!m){navigateTo('dashboard');return;}
  const team=TEAMS.find(t=>t.id===m.teamId);
  const avatarHtml=m.avatarDataUrl?`<img src="${m.avatarDataUrl}">`:(m.name.charAt(0));
  document.getElementById('profileHero').style.background=`linear-gradient(135deg,${team?.color||'#2E75B6'}EE,${team?.color||'#2E75B6'}88)`;
  document.getElementById('profileHero').innerHTML=`
    <div class="profile-avatar-big" onclick="document.getElementById('avatarFile').click()" style="background:${team?.color||'#2E75B6'}">
      ${avatarHtml}<div class="profile-avatar-overlay">📷</div>
    </div>
    <input type="file" id="avatarFile" style="display:none;" accept=".jpg,.jpeg,.png" onchange="handleAvatarUpload(event)">
    <div>
      <div style="font-size:22px;font-weight:800;">${m.name}</div>
      <div style="font-size:13px;opacity:.8;margin-top:2px;">${m.title} · ${team?.name||''}</div>
      <div style="font-size:12px;opacity:.7;margin-top:4px;font-style:italic;">${m.bio||'Noch keine Bio hinterlegt.'}</div>
    </div>`;
  document.getElementById('profileEditForm').innerHTML=`
    <div class="form-section-title">${state.lang==='en'?'Edit My Profile':'Mein Profil bearbeiten'}</div>
    <div class="form-group"><label class="form-label">${state.lang==='en'?'Name':'Name'}</label>
      <input class="form-control" id="mpName" value="${m.name}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">${state.lang==='en'?'Role / Function':'Rolle / Funktion'}</label>
        <select class="form-control" id="mpRole">
          ${['CEO','CFO','CMO','COO','CTO','Gründer','Berater','Sonstiges'].map(r=>`<option ${m.role===r?'selected':''}>${r}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">${state.lang==='en'?'Title (e.g. Managing Director)':'Titel (z.B. Geschäftsführer)'}</label>
        <input class="form-control" id="mpTitle" value="${m.title||''}"></div>
    </div>
    <div class="form-group"><label class="form-label">E-Mail <span style="font-size:10px;color:var(--gray-mid);">(${state.lang==='en'?'for notifications':'für Benachrichtigungen'})</span></label>
      <input type="email" class="form-control" id="mpEmail" placeholder="${state.lang==='en'?'your@email.com':'deine@email.de'}" value="${m.email||''}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">${state.lang==='en'?'Language':'Sprache'}</label>
        <select class="form-control" id="mpLang">
          <option value="de" ${(m.lang||'de')==='de'?'selected':''}>🇩🇪 Deutsch</option>
          <option value="en" ${m.lang==='en'?'selected':''}>🇬🇧 English</option>
        </select></div>
    </div>
    <div class="form-group"><label class="form-label">Bio (max. 200 ${state.lang==='en'?'characters':'Zeichen'})</label>
      <textarea class="form-control" id="mpBio" rows="3" maxlength="200" oninput="countChars(this,'mpBioCount',200)">${m.bio||''}</textarea>
      <div class="char-counter" id="mpBioCount">${(m.bio||'').length} / 200</div></div>
    <div class="form-section-title" style="margin-top:18px;">${state.lang==='en'?'Notifications':'Benachrichtigungen'} <span style="font-size:11px;font-weight:400;color:var(--gray-mid);">${state.lang==='en'?'(requires email)':'(erfordert E-Mail)'}</span></div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
        <input type="checkbox" id="mpNotifBlog" ${(m.notif&&m.notif.blog!==false)?'checked':''} ${m.email?'':'disabled'}> ${state.lang==='en'?'Blog report approved':'Wochenbericht freigegeben'}</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
        <input type="checkbox" id="mpNotifWeek" ${(m.notif&&m.notif.week!==false)?'checked':''} ${m.email?'':'disabled'}> ${state.lang==='en'?'New week starts':'Neue Woche startet'}</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
        <input type="checkbox" id="mpNotifReflect" ${(m.notif&&m.notif.reflect!==false)?'checked':''} ${m.email?'':'disabled'}> ${state.lang==='en'?'Reflection reminder (Saturday)':'Reflexions-Erinnerung (Samstag)'}</label>
    </div>
    <div style="margin:10px 0 4px;border-top:1px solid var(--border);padding-top:10px;">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
        <input type="checkbox" id="mpNotifEmailReminders" ${(m.notif?.emailReminders!==false)?'checked':''} ${m.email?'':'disabled'}>
        <span>📧 ${state.lang==='en'?'Receive email reminders (reflection, report, bookings)':'E-Mail-Erinnerungen erhalten (Reflexion, Bericht, Buchungen)'}</span>
      </label>
      ${!m.email?`<div style="font-size:11px;color:var(--orange);margin-top:4px;">⚠️ ${state.lang==='en'?'Add email address to enable':'E-Mail-Adresse hinterlegen, um zu aktivieren'}</div>`:''}
    </div>
    <div class="form-section-title" style="margin-top:18px;">${state.lang==='en'?'Security':'Sicherheit'}</div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="showChangePassword()">🔐 ${state.lang==='en'?'Change Password':'Passwort ändern'}</button>
      <span id="pwdStatusBadge"></span>
    </div>
    <div id="changePwdSection" style="display:none;background:var(--bg-light);padding:14px;border-radius:var(--radius);margin-bottom:14px;">
      <div class="form-group"><label class="form-label">${state.lang==='en'?'Current Password (leave empty if none set)':'Aktuelles Passwort (leer lassen wenn keins gesetzt)'}</label>
        <input type="password" class="form-control" id="cpOld" placeholder="(${state.lang==='en'?'current password':'aktuelles Passwort'})"></div>
      <div class="form-group"><label class="form-label">${state.lang==='en'?'New Password (min. 6 characters)':'Neues Passwort (mind. 6 Zeichen)'}</label>
        <input type="password" class="form-control" id="cpNew1" placeholder="${state.lang==='en'?'New password':'Neues Passwort'}"></div>
      <div class="form-group"><label class="form-label">${state.lang==='en'?'Confirm Password':'Passwort bestätigen'}</label>
        <input type="password" class="form-control" id="cpNew2" placeholder="${state.lang==='en'?'Confirm':'Bestätigen'}"></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="doChangePassword()">✅ ${state.lang==='en'?'Save':'Speichern'}</button>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('changePwdSection').style.display='none'">✗ ${state.lang==='en'?'Cancel':'Abbrechen'}</button>
      </div>
    </div>
    <div class="info-box blue" style="font-size:11px;margin-bottom:14px;">
      <span class="info-box-icon">🔑</span>${state.lang==='en'?'Your access code: ':'Dein Zugangscode: '}<strong style="font-family:monospace;letter-spacing:1px;">${state.currentUser?.code||''}</strong>
    </div>
    <button class="btn btn-primary btn-sm" onclick="saveMemberProfile()">💾 ${state.lang==='en'?'Save Profile':'Profil speichern'}</button>`;
  document.getElementById('profileAvatarSection').innerHTML=`
    <div class="form-section-title">Profilfoto</div>
    ${m.avatarDataUrl?`<div style="margin-bottom:10px;text-align:center;"><img src="${m.avatarDataUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--blue-light);"><br><button class="btn btn-secondary btn-xs" style="margin-top:6px;" onclick="removeAvatar()">🗑️ Entfernen</button></div>`:''}
    <div class="upload-zone" onclick="document.getElementById('avatarFile').click()">
      <div class="upload-icon">📷</div><p>Foto hochladen<br>JPG, PNG bis 2 MB</p>
    </div>
    <div class="form-hint" style="margin-top:6px;">Dein Foto ist für alle Teammitglieder sichtbar.</div>`;
  renderMyReflections();
  // Update password status badge
  const psBadge=document.getElementById('pwdStatusBadge');
  if(psBadge){
    const hasPwd=!!getPwds()[state.currentUser?.code];
    const lng=state.lang==='en';
    psBadge.innerHTML=hasPwd
      ?`<span style="color:var(--green)">✅ ${lng?'Password set':'Passwort gesetzt'}</span>`
      :`<span style="color:var(--orange)">⚠️ ${lng?'No password yet (insecure)':'Noch kein Passwort (unsicher)'}</span>`;
  }
}

function switchProfileTab(tab){
  state.currentProfileTab=tab;
  document.querySelectorAll('#page-profile .profile-tab').forEach(b=>b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.querySelectorAll('#page-profile .profile-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('profilePanel-'+tab)?.classList.add('active');
  if(tab==='myreflections') renderMyReflections();
  if(tab==='ceomgmt') renderCeoManagement();
}

function renderMyReflections(){
  const m=getMyMember();if(!m)return;
  const myRefs=REFLECTIONS.filter(r=>r.memberId===m.id).sort((a,b)=>b.date.localeCompare(a.date));
  const el=document.getElementById('myReflectionsList');
  if(!el) return;
  if(myRefs.length===0){el.innerHTML='<div class="empty-state"><div class="empty-icon">💬</div><h3>Noch keine Reflexionen</h3><p>Klicke auf "Neue Reflexion" um zu starten.</p></div>';return;}
  el.innerHTML=myRefs.map(r=>{
    const moodEmoji=['','😩','😟','😐','😊','🚀'][r.mood];
    return `<div class="reflection-card">
      <div class="reflection-header">
        <div><strong>Woche ${r.week}</strong> · ${fmtDate(r.date)}</div>
        <div style="display:flex;align-items:center;gap:8px;">${moodEmoji} <span style="font-size:13px;font-weight:700;">${r.mood}/5</span></div>
      </div>
      <div class="reflection-body">
        ${r.experience?`<div class="reflection-section"><div class="reflection-section-label">Erfahrungen</div><div class="reflection-text">${r.experience}</div></div>`:''}
        ${r.liked?`<div class="reflection-section"><div class="reflection-section-label">👍 Was war gut</div><div class="reflection-text">${r.liked}</div></div>`:''}
        ${r.improved?`<div class="reflection-section"><div class="reflection-section-label">💡 Was ich anders machen würde</div><div class="reflection-text">${r.improved}</div></div>`:''}
        ${r.role?`<div class="reflection-section"><div class="reflection-section-label">🤝 Meine Rolle</div><div class="reflection-text">${r.role}</div></div>`:''}
      </div>
    </div>`;}).join('');
}

