// ════════════════════════════════════════════════════════════════════
//  CODE-GENERIERUNG
// ════════════════════════════════════════════════════════════════════
function makeTeamAbbr(name){
  // "CampusClips" → "CC", "GreenWheels" → "GW", "StudyBuddy" → "SB"
  const words = name.trim().split(/\s+/);
  if(words.length>=2) return (words[0][0]+words[1][0]).toUpperCase();
  return name.substring(0,2).toUpperCase();
}
function makeUniqueTeamCode(name){
  const abbr = makeTeamAbbr(name);
  const base = 'TEAM-'+abbr;
  let n = 1;
  while(CODES[base+String(n).padStart(3,'0')]||TEAMS.find(t=>t.code===base+String(n).padStart(3,'0'))) n++;
  return base+String(n).padStart(3,'0');
}
function makeMemberCode(team, memberIdx){
  const abbr = makeTeamAbbr(team.name);
  const base = 'MBR-'+abbr+'-';
  let n = memberIdx+1;
  while(CODES[base+n]||MEMBERS.find(m=>m.code===base+n)) n++;
  return base+n;
}
function makeAdminCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do{ code='ADMIN-'+Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join(''); }
  while(CODES[code]);
  return code;
}
function makeSetupCode(gameId, slotNum){
  // generates e.g. SETUP-G1-001
  const gshort=(gameId||'G').replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(-4);
  const base='SETUP-'+gshort+'-'+String(slotNum).padStart(3,'0');
  // ensure uniqueness
  let code=base, n=1;
  while(TEAMS.find(t=>t.setupCode===code)) code=base+'-'+n++;
  return code;
}
function nextId(arr, prefix){
  const nums = arr.map(x=>parseInt(x.id.replace(prefix,''))||0);
  return prefix+(nums.length?Math.max(...nums)+1:1);
}
function genAdminCode(){document.getElementById('naCode').value=makeAdminCode();}
function genTeamCode(){
  const name = document.getElementById('ntName')?.value.trim()||'';
  document.getElementById('ntCode').value = name ? makeUniqueTeamCode(name) : 'TEAM-'+Math.random().toString(36).substring(2,6).toUpperCase();
}
function copyCode(c){
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(c).then(()=>showToast('Kopiert: '+c,'success')).catch(()=>copyCodeFallback(c));
  } else { copyCodeFallback(c); }
}
function copyCodeFallback(c){
  const el=document.createElement('textarea');
  el.value=c; el.style.position='fixed'; el.style.opacity='0';
  document.body.appendChild(el); el.select();
  try{document.execCommand('copy');showToast('Kopiert: '+c,'success');}
  catch(e){showToast('Code: '+c,'info');}
  document.body.removeChild(el);
}

