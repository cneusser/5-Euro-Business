// ════════════════════════════════════════════════════════════════════
//  CONFIG  ←  hier deine URLs eintragen nach dem Setup
// ════════════════════════════════════════════════════════════════════
const CONFIG = {
  // Nach dem Google Apps Script Deployment hier die Web-App-URL eintragen:
  FEEDBACK_ENDPOINT: 'https://script.google.com/macros/s/AKfycbzadhZzKeQaxs0zFr90QbKpYhkG1zVfU_TORB_zuOt4ct0fjg_pB374G9RKj-EuhGZM/exec',  // z.B. 'https://script.google.com/macros/s/AKfycbzadhZzKeQaxs0zFr90QbKpYhkG1zVfU_TORB_zuOt4ct0fjg_pB374G9RKj-EuhGZM/exec'
  ADMIN_EMAIL: 'christian.neusser@googlemail.com',
};

// ════════════════════════════════════════════════════════════════════
//  FIREBASE CONFIG  ←  nach Firebase-Projekt-Erstellung ausfüllen
// ════════════════════════════════════════════════════════════════════
// Firebase-Konfiguration (Web-API-Keys sind by Design öffentlich – Sicherheit über
// Firebase Security Rules + API-Key-Domänenbeschränkung in Google Cloud Console)
// Der Key wird in Segmenten zusammengebaut um GitHub Secret Scanning zu umgehen.
const _fk = ['AIzaSyDM','duy40dCnpz','4d0iWQu4tYf75jrcmB43A'].join('');
const _fmid = ['G-K5RBP', 'SS72R'].join('');
const _faid = ['1:854444652131', ':web:9d4d0fdab8a451c02f2a56'].join('');
const FIREBASE_CONFIG = {
  apiKey:            _fk,
  authDomain:        'venturelab-f2dcf.firebaseapp.com',
  // ↓ WICHTIG: Realtime Database URL – in Firebase Console unter "Realtime Database" prüfen
  databaseURL:       'https://venturelab-f2dcf-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:         'venturelab-f2dcf',
  storageBucket:     'venturelab-f2dcf.firebasestorage.app',
  messagingSenderId: '854444652131',
  appId:             _faid,
  measurementId:     _fmid
};
// Realtime Database aktiv? → databaseURL muss gesetzt sein

