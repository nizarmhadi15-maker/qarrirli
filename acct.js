// حسابات قرّرلي: تسجيل دخول اختياري + مزامنة "قائمتي" بين الأجهزة (Firebase)
const CFG = { apiKey: "AIzaSyCgY1WhEOKbZ5Df9BqY9nNKQTgkJ28fQXs", authDomain: "qarrirli.firebaseapp.com", projectId: "qarrirli", storageBucket: "qarrirli.firebasestorage.app", messagingSenderId: "324547749608", appId: "1:324547749608:web:379a3921f249ea07554b5d" };
const V = "10.12.2", G = `https://www.gstatic.com/firebasejs/${V}/`;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }, del: k => { try { localStorage.removeItem(k); } catch {} } };
let fb = null, booting = null, user = null, timer = null, ready = false;

function boot() {
  if (fb) return Promise.resolve(fb);
  return booting ||= Promise.all([import(G + "firebase-app.js"), import(G + "firebase-auth.js"), import(G + "firebase-firestore.js")]).then(([App, A, F]) => {
    const app = App.initializeApp(CFG);
    fb = { A, F, auth: A.getAuth(app), db: F.getFirestore(app) };
    A.onAuthStateChanged(fb.auth, onUser);
    return fb;
  });
}

// ---------- الزر في الأعلى ----------
function paintBtn() {
  const b = $("#acct"); if (!b) return;
  if (user) {
    const nm = user.displayName || (user.email || "").split("@")[0];
    b.querySelector(".av").innerHTML = user.photoURL ? `<img alt="" src="${esc(user.photoURL)}" referrerpolicy="no-referrer">` : esc((nm[0] || "؟").toUpperCase());
    b.querySelector(".an").textContent = "حسابي";
  } else { b.querySelector(".av").textContent = "👤"; b.querySelector(".an").textContent = "دخول / تسجيل"; }
}
$("#acct")?.addEventListener("click", () => { if (user) { location.hash = "mine"; } else openLogin(); });

// ---------- نافذة الدخول ----------
let mode = "in";
const msg = (t, ok) => { const m = $("#lmsg"); m.textContent = t || ""; m.classList.toggle("ok", !!ok); };
function setMode(m) {
  mode = m; document.querySelectorAll(".lmode button").forEach(b => b.classList.toggle("on", b.dataset.m === m));
  $("#lname").hidden = m !== "up"; $("#lsub").textContent = m === "up" ? "إنشاء حساب" : "دخول";
  $("#lpass").autocomplete = m === "up" ? "new-password" : "current-password"; msg("");
}
function openLogin() { $("#lm").hidden = false; boot().catch(() => msg("تعذّر الاتصال. تأكد من الإنترنت وحاول مرة ثانية.")); }
const closeLogin = () => { $("#lm").hidden = true; msg(""); };
window.qrLogin = openLogin;
$("#lmx").onclick = closeLogin;
$("#lm").addEventListener("click", e => { if (e.target.id === "lm") closeLogin(); });
document.querySelectorAll(".lmode button").forEach(b => b.onclick = () => setMode(b.dataset.m));
const AR = { "auth/invalid-email": "البريد الإلكتروني غير صحيح.", "auth/missing-password": "اكتب كلمة المرور.", "auth/weak-password": "كلمة المرور قصيرة، لازم 6 أحرف على الأقل.",
  "auth/email-already-in-use": "هذا البريد مسجّل من قبل. اختر «دخول».", "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة.", "auth/wrong-password": "كلمة المرور غير صحيحة.",
  "auth/user-not-found": "ما في حساب بهذا البريد. اختر «حساب جديد».", "auth/too-many-requests": "محاولات كثيرة. انتظر شوي وحاول مرة ثانية.",
  "auth/popup-closed-by-user": "أُغلقت نافذة Google قبل إكمال الدخول.", "auth/cancelled-popup-request": "", "auth/popup-blocked": "المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة وحاول مرة ثانية.",
  "auth/network-request-failed": "مشكلة في الاتصال بالإنترنت.", "auth/unauthorized-domain": "هذا النطاق غير مسموح لتسجيل الدخول بعد." };
const err = e => AR[e.code] ?? ("صار خطأ: " + (e.code || e.message));
$("#lgg").onclick = async () => {
  msg("");
  try { const { A, auth } = await boot(); await A.signInWithPopup(auth, new A.GoogleAuthProvider()); }
  catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") { try { const { A, auth } = fb; ls.set("qr-acct", "1"); await A.signInWithRedirect(auth, new A.GoogleAuthProvider()); return; } catch (e2) { return msg(err(e2)); } }
    msg(err(e));
  }
};
$("#lf").onsubmit = async e => {
  e.preventDefault(); const mail = $("#lmail").value.trim(), pass = $("#lpass").value, name = $("#lname").value.trim();
  if (mode === "up" && !name) return msg("اكتب اسمك.");
  msg("لحظة…", true);
  try {
    const { A, auth } = await boot();
    if (mode === "up") { const c = await A.createUserWithEmailAndPassword(auth, mail, pass); await A.updateProfile(c.user, { displayName: name }); user = c.user; paintBtn(); window.qrRefresh && window.qrRefresh(); }
    else await A.signInWithEmailAndPassword(auth, mail, pass);
  } catch (er) { msg(err(er)); }
};
$("#lforgot").onclick = async () => {
  const mail = $("#lmail").value.trim(); if (!mail) return msg("اكتب بريدك أولًا ثم اضغط «نسيت كلمة المرور».");
  try { const { A, auth } = await boot(); auth.languageCode = "ar"; await A.sendPasswordResetEmail(auth, mail); msg("أرسلنا لك رابط تغيير كلمة المرور على بريدك.", true); } catch (er) { msg(err(er)); }
};
window.qrLogout = async () => { if (!fb) return; await fb.A.signOut(fb.auth); };

// ---------- المزامنة ----------
const KEYS = ["later", "seen", "rate", "ep", "gd", "x"];
const pack = () => { const L = window.QLS || {}, o = {}; KEYS.forEach(k => o[k] = L[k] || {}); try { o.reg = localStorage.getItem("ft-reg") || ""; } catch {} return JSON.stringify(o); };
function unpack(str, union) {
  let r; try { r = JSON.parse(str || "{}"); } catch { return; }
  const L = window.QLS; if (!L) return;
  KEYS.forEach(k => { const rem = r[k] || {}; L[k] = union ? Object.assign({}, rem, L[k] || {}) : rem; });
  if (union) Object.keys(L.seen || {}).forEach(o => { if (L.later) delete L.later[o]; });
  if (r.reg && !ls.get("ft-reg")) ls.set("ft-reg", r.reg);
  ls.set("ft-ls", JSON.stringify(L));
}
async function push() {
  if (!user || !ready) return;
  const { F, db } = fb, now = Date.now();
  try { await F.setDoc(F.doc(db, "users", user.uid), { data: pack(), u: now, name: user.displayName || "", email: user.email || "" }, { merge: true }); ls.set("qr-sync-" + user.uid, String(now)); } catch {}
}
window.qrSync = () => { if (!user) return; clearTimeout(timer); timer = setTimeout(push, 1200); };
addEventListener("pagehide", () => { if (timer) { clearTimeout(timer); push(); } });

async function onUser(u) {
  user = u; window.QU = u; ready = false; paintBtn();
  if (!u) { ls.del("qr-acct"); window.qrRefresh && window.qrRefresh(); return; }
  ls.set("qr-acct", "1"); closeLogin();
  const { F, db } = fb, ref = F.doc(db, "users", u.uid);
  try {
    const snap = await F.getDoc(ref), last = +(ls.get("qr-sync-" + u.uid) || 0);
    if (!snap.exists()) {                      // حساب جديد: نرفع قائمة هذا الجهاز
      ready = true; await F.setDoc(ref, { data: pack(), u: Date.now(), created: Date.now(), name: u.displayName || "", email: u.email || "" });
      ls.set("qr-sync-" + u.uid, String(Date.now()));
      try { F.setDoc(F.doc(db, "stats", new Date().toISOString().slice(0, 10)), { signups: F.increment(1) }, { merge: true }); } catch {}
    } else {
      const d = snap.data();
      if (!last) unpack(d.data, true);          // أول دخول على هذا الجهاز: ندمج القائمتين
      else if ((d.u || 0) > last) unpack(d.data, false); // تحديث من جهاز آخر
      ready = true; await push();
    }
  } catch { ready = true; }
  window.qrRefresh && window.qrRefresh();
}

// المستخدم سجّل من قبل على هذا الجهاز؟ نشغّل Firebase مباشرة
if (ls.get("qr-acct")) boot().catch(() => {});
