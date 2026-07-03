// ════════════════════════════════════════════════════════════════════
//  FEATURE (c): AUTOMATIC IN-APP REMINDERS
// ════════════════════════════════════════════════════════════════════
// checkAutoReminders: called on login for admin/superadmin roles, checks day-of-week
// Reflexion deadline: Saturday 23:59 → remind on Friday (day 5)
// Blog + Buchungen deadline: Sunday 23:59 → remind on Saturday (day 6)
function checkAutoReminders(){
  const u=state.currentUser;
  if(!u||u.role==='member') return;
  const today=new Date();
  const dow=today.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  if(dow!==5&&dow!==6) return; // only fire on Friday or Saturday
  const dayKey=today.toISOString().split('T')[0];
  const storeKey='_vl_autoremind_'+dayKey;
  if(localStorage.getItem(storeKey)) return; // already sent today
  // Collect game IDs to remind for
  const gameIds=[];
  if(u.role==='superadmin'){
    GAMES.forEach(g=>{if(g.id) gameIds.push(g.id);});
  } else if(u.role==='admin'||u.role==='guest'){
    const gId=state.managingGameId||u.gameId;
    if(gId) gameIds.push(gId);
  }
  if(gameIds.length===0) return;
  gameIds.forEach(gId=>{
    // On Friday: reflexion reminders only
    // On Saturday: blog + booking reminders only
    checkAndSendReminders(gId,false,dow===5?'reflect':dow===6?'blogbook':'all');
  });
  localStorage.setItem(storeKey,'1');
}
function checkAndSendReminders(gameId,force,reminderTypes){
  const u=state.currentUser;
  const effectiveGameId=gameId||state.managingGameId||u?.gameId;
  if(!effectiveGameId){showToast('Kein Spiel ausgewählt','error');return;}
  const game=GAMES.find(g=>g.id===effectiveGameId);if(!game) return;
  const types=reminderTypes||'all'; // 'reflect', 'blogbook', or 'all'
  const now=new Date().toISOString();
  const cutoff=new Date(Date.now()-23*60*60*1000).toISOString();
  const gameTeams=TEAMS.filter(t=>t.gameId===effectiveGameId&&t.status!=='pending');
  let sent=0;
  const emailJobs=[];
  gameTeams.forEach(team=>{
    const members=MEMBERS.filter(m=>m.teamId===team.id);
    const w=team.currentWeek;
    // ── Reflexion reminder (Friday → Sat 23:59 deadline) ──
    if(types==='reflect'||types==='all'){
    members.forEach(m=>{
      const hasRef=REFLECTIONS.find(r=>r.memberId===m.id&&r.week===w);
      if(!hasRef){
        const recent=MESSAGES.find(msg=>msg.toId===m.id&&msg.type==='reminder'&&msg.week===w&&msg.sentAt>cutoff);
        if(!recent||force){
          MESSAGES.push({
            id:'msg-rem-'+Date.now()+'-'+Math.random().toString(36).substr(2,4),
            type:'reminder',from:'System',fromId:'system',
            toId:m.id,toTeamId:team.id,gameId:effectiveGameId,
            subject:'⏰ Erinnerung: Reflexion Woche '+w,
            body:'Hallo '+m.name+',\n\nbitte reiche deine Reflexion für Woche '+w+' noch ein. Deadline: Freitag 23:59 Uhr (24 h vor Ablauf).\n\nℹ️ E-Mail-Erinnerungen deaktivieren: Profil → Benachrichtigungen.\n\nViele Grüße,\ndein VentureLab-Team',
            date:new Date().toISOString().split('T')[0],sentAt:now,read:false,week:w
          });
          sent++;
          // Email if opted in
          if(m.email&&m.notif?.reflect!==false&&m.notif?.emailReminders!==false){
            emailJobs.push({type:'reflect',teamId:team.id,member:m,week:w,game});
          }
        }
      }
    });
    } // end reflect
    // ── Blog reminder (CEO only; Saturday → Sun 23:59 deadline) ──
    if(types==='blogbook'||types==='all'){
    const hasBlog=BLOGS.find(b=>b.teamId===team.id&&b.week===w&&(b.status==='pending'||b.status==='approved'));
    if(!hasBlog){
      const ceo=members.find(m=>m.role==='CEO');
      if(ceo){
        const recent=MESSAGES.find(msg=>msg.toId===ceo.id&&msg.type==='blog_reminder'&&msg.week===w&&msg.sentAt>cutoff);
        if(!recent||force){
          MESSAGES.push({
            id:'msg-brem-'+Date.now()+'-'+Math.random().toString(36).substr(2,4),
            type:'blog_reminder',from:'System',fromId:'system',
            toId:ceo.id,toTeamId:team.id,gameId:effectiveGameId,
            subject:'⏰ Erinnerung: Wochenbericht Woche '+w,
            body:'Hallo '+ceo.name+',\n\nbitte reiche den Wochenbericht für Woche '+w+' noch ein. Deadline: Samstag 23:59 Uhr (24 h vor Ablauf).\n\nℹ️ E-Mail-Erinnerungen deaktivieren: Profil → Benachrichtigungen.\n\nViele Grüße,\ndein VentureLab-Team',
            date:new Date().toISOString().split('T')[0],sentAt:now,read:false,week:w
          });
          sent++;
          if(ceo.email&&ceo.notif?.reflect!==false&&ceo.notif?.emailReminders!==false){
            emailJobs.push({type:'blog',teamId:team.id,member:ceo,week:w,game});
          }
        }
      }
    }
    } // end blogbook types-guard
    // ── Booking reminder (CFO – no transactions yet this week; Saturday → Sun 23:59) ──
    if(types==='blogbook'||types==='all'){
    const cfo=members.find(m=>m.role==='CFO');
    if(cfo&&team.transactions===0){
      const recent=MESSAGES.find(msg=>msg.toId===cfo.id&&msg.type==='booking_reminder'&&msg.week===w&&msg.sentAt>cutoff);
      if(!recent||force){
        MESSAGES.push({
          id:'msg-book-'+Date.now()+'-'+Math.random().toString(36).substr(2,4),
          type:'booking_reminder',from:'System',fromId:'system',
          toId:cfo.id,toTeamId:team.id,gameId:effectiveGameId,
          subject:'⏰ Erinnerung: Buchungen Woche '+w,
          body:'Hallo '+cfo.name+',\n\nfür Woche '+w+' wurden noch keine Buchungen erfasst. Bitte trage Einnahmen und Ausgaben im Kassenbuch ein (Deadline: Samstag 23:59 Uhr).\n\nViele Grüße,\ndein VentureLab-Team',
          date:new Date().toISOString().split('T')[0],sentAt:now,read:false,week:w
        });
        sent++;
        if(cfo.email&&cfo.notif?.emailReminders!==false){
          emailJobs.push({type:'booking',teamId:team.id,member:cfo,week:w,game});
        }
      }
    }
    } // end blogbook types-guard
  });
  if(sent>0){
    logEvent('reminder_sent',{gameId:effectiveGameId,count:sent,emails:emailJobs.length});
    saveData();buildNavigation();
    showToast('🔔 '+sent+' In-App-Erinnerung(en)'+(emailJobs.length>0?' + '+emailJobs.length+' E-Mail(s)':'')+' versendet','success');
    // Send emails async
    emailJobs.forEach(job=>{
      const subjectMap={
        reflect:'⏰ Erinnerung: Reflexion Woche '+job.week+' (Deadline: Fr 23:59)',
        blog:'⏰ Erinnerung: Wochenbericht Woche '+job.week+' (Deadline: Sa 23:59)',
        booking:'⏰ Erinnerung: Buchungen Woche '+job.week+' (Deadline: Sa 23:59)'
      };
      const bodyMap={
        reflect:`Hallo ${job.member.name},\n\nbitte reiche deine Reflexion für ${job.game?.name||'das Spiel'} Woche ${job.week} noch ein (Deadline: Freitag 23:59 – noch 24 h).\n\nZum Abmelden: In der App unter Profil → Benachrichtigungen.\n\nVentureLab`,
        blog:`Hallo ${job.member.name},\n\nbitte reiche als CEO den Wochenbericht für ${job.game?.name||'das Spiel'} Woche ${job.week} noch ein (Deadline: Samstag 23:59 – noch 24 h).\n\nZum Abmelden: In der App unter Profil → Benachrichtigungen.\n\nVentureLab`,
        booking:`Hallo ${job.member.name},\n\nfür ${job.game?.name||'das Spiel'} Woche ${job.week} wurden noch keine Buchungen erfasst. Bitte Kassenbuch aktualisieren (Deadline: Samstag 23:59 – noch 24 h).\n\nZum Abmelden: In der App unter Profil → Benachrichtigungen.\n\nVentureLab`
      };
      fetch(CONFIG.FEEDBACK_ENDPOINT,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({type:'notification',to:job.member.email,subject:subjectMap[job.type],message:bodyMap[job.type],sender:'VentureLab System',team:TEAMS.find(t=>t.id===job.teamId)?.name||'',game:job.game?.name||''})
      }).catch(()=>{});
    });
  } else {
    showToast('Alle Mitglieder haben bereits eingereicht ✓','info');
  }
}

