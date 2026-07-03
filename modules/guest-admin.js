// ════════════════════════════════════════════════════════════════════
//  FEATURE (f): GUEST ADMIN
// ════════════════════════════════════════════════════════════════════
function renderGuestAdminList(){
  const el=document.getElementById('guestAdminListWrap');if(!el) return;
  const guestAdmins=ADMINS.filter(a=>a.isGuest);
  if(guestAdmins.length===0){
    el.innerHTML='<div class="empty-state" style="padding:20px 0;"><div class="empty-icon">&#128737;&#65039;</div><h3>Noch keine Gastadmins</h3><p>Ernennen Sie Co-Dozenten als Gastadmins f&#252;r einzelne Spiele.</p></div>';
    return;
  }
  el.innerHTML=`<table class="data-table" style="width:100%;margin-top:12px;">
    <thead><tr><th>Name</th><th>E-Mail</th><th>Spiel</th><th>Code</th><th>Aktion</th></tr></thead>
    <tbody>${guestAdmins.map(a=>{const game=GAMES.find(g=>g.id===a.gameId);return `<tr>
      <td><strong>${a.name}</strong></td>
      <td style="font-size:12px;color:var(--gray-mid);">${a.email||'—'}</td>
      <td>${game?.name||'—'}</td>
      <td><code style="font-size:11px;background:var(--blue-xlt);padding:2px 7px;border-radius:4px;">${a.code}</code>
        <button class="btn btn-outline btn-xs" onclick="copyCode('${a.code}')" title="Kopieren" style="margin-left:4px;">&#128203;</button></td>
      <td><button class="btn btn-danger btn-xs" onclick="removeGuestAdmin('${a.id}')">&#128465;&#65039; Entfernen</button></td>
    </tr>`;}).join('')}</tbody>
  </table>`;
}
function addGuestAdmin(){
  const name=(document.getElementById('gaName')?.value||'').trim();
  const email=(document.getElementById('gaEmail')?.value||'').trim();
  const gameId=document.getElementById('gaGameId')?.value||'';
  const code=(document.getElementById('gaCode')?.value||'').trim().toUpperCase();
  if(!name||!gameId||!code){showToast('Bitte Name, Spiel und Code eingeben','error');return;}
  if(CODES[code]){showToast('Code bereits vergeben','error');return;}
  const game=GAMES.find(g=>g.id===gameId);if(!game) return;
  const gaId='ga'+Date.now();
  ADMINS.push({id:gaId,gameId,name,email,code,uni:game.uni||'',isGuest:true});
  rebuildCodes();
  logEvent('guest_admin_add',{gameId,name,code});
  saveData();renderGuestAdminList();renderSuperAdminList();
  closeModal('modalNewGuestAdmin');
  showToast('&#128737;&#65039; Gastadmin ernennt: '+name,'success');
}
function removeGuestAdmin(gaId){
  if(!confirm('Gastadmin wirklich entfernen?')) return;
  const idx=ADMINS.findIndex(a=>a.id===gaId&&a.isGuest);if(idx<0) return;
  const ga=ADMINS[idx];
  ADMINS.splice(idx,1);
  rebuildCodes();
  logEvent('guest_admin_remove',{gaId,name:ga.name});
  saveData();renderGuestAdminList();renderSuperAdminList();
  showToast('Gastadmin entfernt','info');
}
function openGuestAdminModal(){
  // Pre-fill game dropdown
  const sel=document.getElementById('gaGameId');
  if(sel){sel.innerHTML=GAMES.map(g=>`<option value="${g.id}">${g.name}</option>`).join('');}
  document.getElementById('gaCode').value='GUEST-'+Math.random().toString(36).toUpperCase().substr(2,5);
  openModal('modalNewGuestAdmin');
}

