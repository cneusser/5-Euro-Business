// ═══════════════════════════════════════════════════════════════════════════
//  BACKUP SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
const BACKUP_KEY = '5euro_lastbackup';
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function exportDataJson(){
  const d = {UNIVERSITIES,GAMES,TEAMS,MEMBERS,BLOGS,TRANSACTIONS,REFLECTIONS,MESSAGES,ADMINS,FEEDBACKS,SUPERADMINS,FAQ_DOCS,ANNOUNCEMENTS,PASSWORDS};
  return JSON.stringify(d, null, 2);
}

function downloadBackup(){
  const json = exportDataJson();
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '5euro-backup-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  logEvent('manual_backup', {size: json.length});
}

function importBackup(){
  const input = document.createElement('input');
  input.type='file'; input.accept='.json';
  input.onchange = e => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if(!d.GAMES || !d.TEAMS) { showToast('Ungültige Backup-Datei','error'); return; }
        if(!confirm('Backup wiederherstellen? Alle aktuellen Daten werden ÜBERSCHRIEBEN!')) return;
        const replace=(arr,data)=>{arr.length=0;(data||[]).forEach(x=>arr.push(x));};
        replace(UNIVERSITIES,d.UNIVERSITIES); replace(GAMES,d.GAMES);
        replace(TEAMS,d.TEAMS); replace(MEMBERS,d.MEMBERS);
        replace(BLOGS,d.BLOGS); replace(TRANSACTIONS,d.TRANSACTIONS);
        replace(REFLECTIONS,d.REFLECTIONS); replace(MESSAGES,d.MESSAGES||[]);
        replace(ADMINS,d.ADMINS);
        replace(FEEDBACKS,d.FEEDBACKS||[]); replace(SUPERADMINS,d.SUPERADMINS||[]);
        replace(FAQ_DOCS,d.FAQ_DOCS||[]);
        rebuildCodes(); saveData();
        showToast('✅ Backup wiederhergestellt!');
        logEvent('backup_restore', {date: file.name});
        location.reload();
      } catch(err) { showToast('Fehler beim Lesen der Datei: '+err.message,'error'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function updateStorageStatus(){
  const u=state.currentUser;
  if(u.role!=='superadmin') return;
  const last=parseInt(localStorage.getItem(BACKUP_KEY)||'0');
  const lastBackupDate=last?new Date(last).toLocaleDateString('de-DE')+' '+new Date(last).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'Noch nie';
  const totalSize=(JSON.stringify(_buildPayload()).length/1024).toFixed(0);
  const fbState=_fbOK?'🟢 Firebase aktiv (Echtzeit-Sync)':'🔴 Kein Firebase – nur lokal';
  const msg=`${fbState} | Zuletzt gesichert: ${lastBackupDate} | Speicher: ${totalSize} KB (${TEAMS.length} Teams, ${TRANSACTIONS.length} Buchungen, ${BLOGS.length} Berichte)`;
  const el=document.getElementById('storageStatusText');
  if(el) el.textContent=msg;
}

async function sendAutoBackup(){
  const last = parseInt(localStorage.getItem(BACKUP_KEY)||'0');
  if(Date.now() - last < BACKUP_INTERVAL_MS) return; // not yet
  if(!CONFIG.FEEDBACK_ENDPOINT || CONFIG.FEEDBACK_ENDPOINT.includes('DEINE')) return;
  const json = exportDataJson();
  try {
    await fetch(CONFIG.FEEDBACK_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({type:'backup', data: json, date: new Date().toISOString(), game: GAMES.map(g=>g.name).join(', ')})
    });
    localStorage.setItem(BACKUP_KEY, String(Date.now()));
    console.log('Auto-backup sent:', new Date().toISOString());
  } catch(e){ console.warn('Auto-backup failed:', e); }
}

