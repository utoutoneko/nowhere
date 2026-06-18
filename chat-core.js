/* ============================
   Firebase SDK 読み込み
============================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInAnonymously 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  push, 
  onChildAdded,
  onValue,
  set,
  onDisconnect,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ============================
   ★ ここをあなたの Firebase 設定に書き換える
============================ */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "数字",
  appId: "アプリID"
};

/* ============================
   Firebase 初期化
============================ */
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export let uid = null;

/* ============================
   匿名ログイン（固定ID）
============================ */
export function initAuth(callback) {
  signInAnonymously(auth).then(() => {
    uid = auth.currentUser.uid;
    console.log("ログイン成功:", uid);
    callback();
  });
}

/* ============================
   入室人数（presence）
============================ */
export function enterRoom(roomId) {
  const roomRef = ref(db, `presence/${roomId}/${uid}`);
  set(roomRef, true);
  onDisconnect(roomRef).remove();
}

export function watchPresence(roomId, callback) {
  onValue(ref(db, `presence/${roomId}`), (snap) => {
    callback(snap.size);
  });
}

/* ============================
   メッセージ送信
============================ */
export function sendMessage(roomId, text, whisperTo = null) {
  push(ref(db, `messages/${roomId}`), {
    uid: uid,
    text: text,
    whisperTo: whisperTo,
    time: Date.now()
  });
}

/* ============================
   メッセージ受信
============================ */
export function watchMessages(roomId, callback) {
  onChildAdded(ref(db, `messages/${roomId}`), (snap) => {
    callback(snap.val());
  });
}

/* ============================
   パスワードチェック（クローズ部屋）
============================ */
export async function checkPassword(inputPass) {
  const snap = await get(ref(db, "settings/closePassword"));
  return snap.val() === inputPass;
}
