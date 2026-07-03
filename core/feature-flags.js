// ═══════════════════════════════════════════════════════════════════
//  FEATURE-FLAGS (game.modules) — NEU im Modul-Split v0.93
//  Reines Refactoring: alle Defaults = true → identisches Verhalten.
//  Künftig kann ein Spiel z.B. game.modules = {bmc:false} setzen,
//  um den Canvas-Tab für dieses Spiel auszublenden.
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_MODULES = {
  ranking:true, myteam:true, profile:true, reflections:true, bookings:true,
  blog:true, teams:true, kontakt:true, feedback:true, konzept:true,
  bmc:true, reports:true, admin:true, superadmin:true
};
// Seiten-ID (navigateTo / buildNavigation) → Modulname
const PAGE_MODULE_MAP = {
  dashboard:'ranking', myteam:'myteam', profile:'profile', reflection:'reflections',
  tx:'bookings', '__booking':'bookings', blog:'blog', teams:'teams',
  kontakt:'kontakt', feedback:'feedback', konzept:'konzept', canvas:'bmc',
  admin:'admin', superadmin:'superadmin'
};
function getGameModules(game){
  return Object.assign({}, DEFAULT_MODULES, (game && game.modules) || {});
}
function isModuleEnabled(moduleName){
  const u = state.currentUser;
  if(!u) return true;
  if(u.role==='superadmin' && !state.managingGameId) return true; // Superadmin sieht immer alles
  const gid = u.gameId || state.managingGameId;
  const g = GAMES.find(x => x.id === gid);
  return getGameModules(g)[moduleName] !== false;
}
function isPageEnabled(pageId){
  const m = PAGE_MODULE_MAP[pageId];
  return m ? isModuleEnabled(m) : true;
}
