// ════════════════════════════════════════════════════════════════════
//  CODE-EXPORT
// ════════════════════════════════════════════════════════════════════
function openCodeExport(){
  const u = state.currentUser;
  const gameTeams = TEAMS.filter(t=>t.gameId===(u.gameId||t.gameId));
  let html = `<div class="info-box blue" style="margin-bottom:14px;"><span class="info-box-icon">📋</span>Alle Codes für dieses Spiel – per Klick kopieren oder als Text exportieren.</div>`;
  html += `<div class="form-section-title">Team-Codes (für Team-Login)</div>`;
  html += `<table class="data-table" style="width:100%;margin-bottom:18px;"><thead><tr><th>Team</th><th>Business</th><th>Code</th></tr></thead><tbody>`;
  gameTeams.forEach(t=>{
    html+=`<tr><td><strong>${t.name}</strong></td><td style="font-size:11px;">${t.biz}</td><td><code style="font-size:12px;font-weight:700;">${t.code}</code> <button class="btn btn-xs btn-outline" onclick="copyCode('${t.code}')">📋</button></td></tr>`;
  });
  html += '</tbody></table>';
  html += `<div class="form-section-title">Mitglieds-Codes (individueller Login)</div>`;
  html += `<table class="data-table" style="width:100%;"><thead><tr><th>Name</th><th>Team</th><th>Rolle</th><th>Code</th></tr></thead><tbody>`;
  const gameMembers = MEMBERS.filter(m=>gameTeams.some(t=>t.id===m.teamId));
  gameMembers.forEach(m=>{
    const team = TEAMS.find(t=>t.id===m.teamId);
    html+=`<tr><td><strong>${m.name}</strong></td><td>${team?.name}</td><td><span class="tag tag-blue" style="font-size:10px;">${m.role}</span></td><td><code style="font-size:12px;font-weight:700;">${m.code}</code> <button class="btn btn-xs btn-outline" onclick="copyCode('${m.code}')">📋</button></td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('codeExportContent').innerHTML = html;
  openModal('modalCodeExport');
}
function copyAllCodes(){
  const u = state.currentUser;
  const gameTeams = TEAMS.filter(t=>t.gameId===(u.gameId||t.gameId));
  let text = '=== ZUGANGSCODES VentureLab Tracker ===\n\n';
  text += 'TEAM-CODES (für ganzes Team):\n';
  gameTeams.forEach(t=>{ text += `  ${t.name.padEnd(20)} ${t.code}\n`; });
  text += '\nMITGLIEDS-CODES (individuell):\n';
  MEMBERS.filter(m=>gameTeams.some(t=>t.id===m.teamId)).forEach(m=>{
    const team = TEAMS.find(t=>t.id===m.teamId);
    text += `  ${m.name.padEnd(20)} ${m.code.padEnd(14)} (${team?.name}, ${m.role})\n`;
  });
  navigator.clipboard?.writeText(text);
  showToast('📋 Alle Codes kopiert!');
}

