"use strict";
/* ============================================================
   Firebase bağlantı ayarları.
   Firebase Console > Project settings (dişli ikon) > Genel >
   "Uygulamalarınız" altında bir Web uygulaması ekleyin, orada
   çıkan firebaseConfig objesindeki değerleri aşağıya yapıştırın.
   Bu bilgiler herkese açık istemci anahtarlarıdır (gizli değildir)
   — asıl güvenlik firestore.rules dosyasındaki kurallardadır.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCAYopMUIvQx4_wLCE-uyDxuXFhYH4xSeY",
  authDomain: "kulupdenetim.firebaseapp.com",
  projectId: "kulupdenetim",
  storageBucket: "kulupdenetim.firebasestorage.app",
  messagingSenderId: "1098497048040",
  appId: "1:1098497048040:web:8966b1b1c1d27c6d9bb85d",
};

firebase.initializeApp(firebaseConfig);

/* App Check: isteklerin gerçekten bu siteden geldiğini doğrular, bot/script
   trafiğini engeller. reCAPTCHA v3 site anahtarını aşağıya yapıştırın
   (https://www.google.com/recaptcha/admin/create — bkz. README "App Check
   kurulumu"). Anahtar boşken App Check devre dışı kalır, uygulama normal
   çalışmaya devam eder — Firestore'da "Enforce" AÇMADAN önce mutlaka
   anahtarı buraya girip test edin. */
const RECAPTCHA_V3_SITE_KEY = "6LeKq14tAAAAAIMX-HWSg6j9mJ7abzAAwEYjWHym";
if (RECAPTCHA_V3_SITE_KEY && RECAPTCHA_V3_SITE_KEY !== "YOUR-RECAPTCHA-V3-SITE-KEY") {
  const appCheck = firebase.appCheck();
  appCheck.activate(RECAPTCHA_V3_SITE_KEY, true);
}

const auth = firebase.auth();
const db = firebase.firestore();
