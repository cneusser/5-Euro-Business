// ════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════════════
function navigateTo(pageId){
  if(!isPageEnabled(pageId)) return; // Feature-Flag game.modules (Default: alle aktiv)
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.topbar-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===pageId));
  const page=document.getElementById('page-'+pageId);
  if(page){page.classList.add('active');state.currentPage=pageId;renderPage(pageId);}
  document.getElementById('tickerBar').style.display=(pageId==='konzept')?'none':'flex';
}
function renderPage(p){
  ({dashboard:renderDashboard,myteam:renderMyTeam,profile:renderProfile,
    reflection:renderReflectionPage,teams:renderTeamsPage,blog:renderBlogPage,
    kontakt:renderKontaktPage,tx:renderTxPage,feedback:renderFeedback,admin:renderAdminPage,
    superadmin:renderSuperPage,konzept:renderKonzept,canvas:renderCanvasPage})[p]?.();
  if(state.lang==='en') setTimeout(applyLang,180);
}

// ── Re-render current view WITHOUT triggering saveData (used by Firebase listener)
function renderCurrentView(){
  if(!state || !state.currentPage || !state.currentUser) return;
  try{
    const page = state.currentPage;
    renderPage(page);
  }catch(e){console.warn('renderCurrentView error',e);}
}

