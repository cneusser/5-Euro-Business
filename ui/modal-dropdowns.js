// ════════════════════════════════════════════════════════════════════
//  MODAL-DROPDOWNS DYNAMISCH BEFÜLLEN
// ════════════════════════════════════════════════════════════════════
function prepareNewGameModal(){
  const uniSel = document.getElementById('ngUni');
  const adminSel = document.getElementById('ngAdmin');
  if(uniSel){ uniSel.innerHTML = UNIVERSITIES.map(u=>`<option>${u.name}</option>`).join(''); }
  if(adminSel){ adminSel.innerHTML = ADMINS.map(a=>`<option>${a.name}</option>`).join(''); }
}
function prepareNewAdminModal(){
  const uniSel = document.getElementById('naUni');
  const gameSel = document.getElementById('naGame');
  if(uniSel){ uniSel.innerHTML = UNIVERSITIES.map(u=>`<option>${u.name}</option>`).join(''); }
  if(gameSel){ gameSel.innerHTML = GAMES.map(g=>`<option value="${g.id}">${g.name}</option>`).join(''); }
  genAdminCode();
}
function prepareNewTeamModal(){
  document.getElementById('ntName').value='';
  document.getElementById('ntBiz').value='';
  document.getElementById('ntSlogan').value='';
  if(document.getElementById('ntApproach')) document.getElementById('ntApproach').value='';
  if(document.getElementById('ntStrategy')) document.getElementById('ntStrategy').value='';
  const u = state.currentUser;
  const game = GAMES.find(g=>g.id===u.gameId)||GAMES[0];
  if(game && document.getElementById('ntGameInfo')){
    document.getElementById('ntGameInfo').textContent = game.name;
  }
  genTeamCode();
}
function createGame(){
  const name = document.getElementById('ngName').value.trim();
  if(!name){showToast('Bitte Spielname angeben','error');return;}
  const uniName = document.getElementById('ngUni').value;
  const uni = UNIVERSITIES.find(u=>u.name===uniName)||{id:'u1',name:uniName,slug:'XX'};
  const adminName = document.getElementById('ngAdmin').value;
  const admin = ADMINS.find(a=>a.name===adminName);
  const gameId = nextId(GAMES,'g');
  const newGame = {
    id:gameId, name, uni:uni.name, uniId:uni.id,
    admin:adminName, adminCode:admin?.code||'',
    mode: document.getElementById('ngMode').value,
    start: document.getElementById('ngStart').value,
    end: document.getElementById('ngEnd').value,
    capital: parseFloat(document.getElementById('ngCapital').value)||5,
    teamSize: parseInt(document.getElementById('ngTeamSize').value)||4,
    status:'active', teamCount:0, weeklyDeadline:'Sonntag 23:59', autoApprove:0, rounds:1, currentRound:1
  };
  GAMES.push(newGame);
  if(admin){admin.gameId=gameId;}
  // Auto-generate pending team slots with setup codes
  const numTeams=parseInt(document.getElementById('ngNumTeams')?.value)||0;
  const COLORS_T=['#2E75B6','#375623','#C55A11','#5B2C8D','#C00000','#1F6B75','#7B3F00','#2D6A4F','#8B4513','#006064'];
  const EMOJIS_T=['🚀','💡','🔧','🌱','⚡','🎯','💎','🔥','🌊','🦁'];
  for(let i=0;i<numTeams;i++){
    const setupCode=makeSetupCode(gameId,i+1);
    const slotId=nextId(TEAMS,'t');
    TEAMS.push({
      id:slotId, gameId, name:'', slogan:'', biz:'', approach:'', strategy:'',
      setupCode, code:'',
      status:'pending',
      logo:EMOJIS_T[i%EMOJIS_T.length], color:COLORS_T[i%COLORS_T.length],
      logoDataUrl:null,
      revenue:0, expenses:0, capital:0, transactions:0,
      currentWeek:1, weekStatus:'open', weekGoal:50,
      mvps:[], mvpOverride:{}, desc:'', email:'', notif:{blog:true,week:true,reflect:true}, lang:'de'
    });
  }
  newGame.teamCount=numTeams;
  rebuildCodes(); saveData();
  closeModal('modalNewGame');
  showToast('🎮 Spiel "'+name+'" angelegt! '+numTeams+' Team-Slots mit Setup-Codes erstellt.');
  renderSuperPage();
}
function createAdmin(){
  const name = document.getElementById('naName').value.trim();
  const email = document.getElementById('naEmail').value.trim();
  if(!name){showToast('Bitte Name angeben','error');return;}
  const code = document.getElementById('naCode').value||makeAdminCode();
  const uniName = document.getElementById('naUni').value;
  const gameName = document.getElementById('naGame').value;
  const game = GAMES.find(g=>g.name===gameName||g.id===gameName);
  const adminId = nextId(ADMINS,'a');
  const newAdmin = {id:adminId, name, email, uni:uniName, gameId:game?.id||'', code};
  ADMINS.push(newAdmin);
  rebuildCodes(); saveData();
  closeModal('modalNewAdmin');
  showToast('🛡️ Admin "'+name+'" ernannt – Code: '+code);
  renderSuperPage();
}
function createTeam(){
  const name = document.getElementById('ntName').value.trim();
  if(!name){showToast('Bitte Team-Namen angeben','error');return;}
  // Determine game: admin sees their game
  const u = state.currentUser;
  const gameId = u.gameId||(GAMES[0]?.id||'g1');
  const code = document.getElementById('ntCode').value||makeUniqueTeamCode(name);
  const COLORS = ['#2E75B6','#375623','#C55A11','#5B2C8D','#C00000','#1F6B75','#7B3F00','#2D6A4F'];
  const EMOJIS = ['🚀','💡','🔧','🌱','⚡','🎯','💎','🔥'];
  const idx = TEAMS.length % COLORS.length;
  const teamId = nextId(TEAMS,'t');
  const newTeam = {
    id:teamId, name,
    biz: document.getElementById('ntBiz').value.trim()||'Unternehmensidee folgt',
    slogan: document.getElementById('ntSlogan').value.trim(),
    approach: document.getElementById('ntApproach')?.value.trim()||'',
    strategy: document.getElementById('ntStrategy')?.value.trim()||'',
    color: COLORS[idx], logo: EMOJIS[idx], logoDataUrl:null,
    gameId, code, revenue:0, expenses:0, transactions:0, weekGoal:50,
    currentWeek:1, weekStatus:'open', mvps:[], mvpOverride:{}, desc:''
  };
  TEAMS.push(newTeam);
  // Mitglieder aus dem Textfeld anlegen
  const membersRaw = document.getElementById('ntMembers').value;
  const roles = ['CEO','CFO','CMO','COO','CTO','Mitglied','Mitglied','Mitglied'];
  if(membersRaw.trim()){
    membersRaw.split(',').forEach((n,i)=>{
      const mname = n.trim(); if(!mname) return;
      const memberId = nextId(MEMBERS,'mb');
      const mcode = makeMemberCode(newTeam, MEMBERS.filter(m=>m.teamId===teamId).length);
      MEMBERS.push({id:memberId, teamId, name:mname, role:roles[i]||'Mitglied',
        title:roles[i]||'Mitglied', bio:'', code:mcode, avatarDataUrl:null});
    });
  }
  // Update game teamCount
  const game = GAMES.find(g=>g.id===gameId);
  if(game) game.teamCount = TEAMS.filter(t=>t.gameId===gameId).length;
  rebuildCodes(); saveData();
  closeModal('modalNewTeam');
  const mCount = MEMBERS.filter(m=>m.teamId===teamId).length;
  showToast('👥 Team "'+name+'" angelegt'+( mCount?` mit ${mCount} Mitgliedern`:'')+'! Code: '+code);
  if(state.currentPage==='admin') renderAdminPage();
  else if(state.currentPage==='superadmin') renderSuperPage();
}
function createUni(){
  const name = document.getElementById('nuName').value.trim();
  if(!name){showToast('Bitte Name angeben','error');return;}
  const uniId = nextId(UNIVERSITIES,'u');
  UNIVERSITIES.push({id:uniId, name,
    slug: document.getElementById('nuSlug').value.trim().toUpperCase()||name.substring(0,2).toUpperCase(),
    city: document.getElementById('nuCity').value.trim(), adminCount:0, gameCount:0});
  saveData();
  closeModal('modalNewUni');
  showToast('🏫 Hochschule "'+name+'" hinzugefügt!');
  renderSuperPage();
}

