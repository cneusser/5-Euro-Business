// ════════════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════════════
let state = {
  currentUser: null,
  prevUser: null,       // v0.8.5: holds prior user during impersonation
  managingGameId: null, // superadmin managing a specific game
  lang: 'de',
  currentPage: 'dashboard',
  currentMyTeamTab: 'overview',
  currentAdminTab: 'approval',
  currentSuperTab: 'overview',
  currentProfileTab: 'edit',
  selectedMood: 3,
  feedbackType: 'general',
  revenueChart: null,
  superChart: null,
};


