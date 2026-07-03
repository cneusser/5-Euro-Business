// ═══════════════════════════════════════════════════════════════════════════
//  SESSION TRACKING
// ═══════════════════════════════════════════════════════════════════════════
let _sessionId = 'S-' + Date.now() + '-' + Math.random().toString(36).substr(2,6).toUpperCase();
let _sessionStart = new Date().toISOString();
let _trackBuffer = [];
const TRACK_BATCH_SIZE = 10;
const TRACK_KEY = '5euro_trackbuffer';


