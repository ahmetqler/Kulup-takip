# Kulüp Takip — Uygulama (Faz 2)

Üniversite kulüpleri için üye, görev, etkinlik ve yoklama takibi yapan web uygulaması.
Faz 2 ile birlikte veriler artık **Firebase**'de (Firestore) saklanıyor: herkes kendi
e-posta/şifresiyle giriş yapar, istediği kadar kulüp oluşturabilir veya davet koduyla
mevcut bir kulübe katılabilir. Aynı kulüpteki herkes aynı veriyi aynı anda görür.

## Ne yapabilir?

- **Panel:** Aktif üye / açık görev / bu hafta etkinlik / geciken görev özetleri; "yaklaşan görevlerim" ve "yaklaşan etkinlikler".
- **Üyeler:** Rol ve yönetici yetkisi düzenleme, aktif/pasif durum, üye profili ve katılım istatistiği. Yeni üyeler davet kodu/linkiyle katılır.
- **Görevler:** Görev oluşturma, bir üyeye atama, son teslim tarihi, durum (Bekliyor / Devam ediyor / Tamamlandı), otomatik "Gecikti" işareti. Üyeler kendi görevlerini "tamamladım" olarak işaretleyince tamamlanma zamanı otomatik kaydedilir.
- **Etkinlikler:** Etkinlik oluşturma, yaklaşan/geçmiş ayrımı, tarih-saat-yer bilgisi.
- **Yoklama:** Her etkinlik için Geldi / Gelmedi / Mazeretli işaretleme, **gelmeme sebebi** girişi, gelmeyenlerin otomatik listesi ve üye bazlı **katılım oranı** istatistiği.
- **Çoklu kulüp:** Bir hesap birden fazla kulübe üye olabilir; üstteki kulüp seçiciyle aralarında geçiş yapılır.
- **Birimler:** Kulüp yöneticisi kulüp içinde birimler (departmanlar) oluşturabilir. Her üye tek bir birime atanır; bir birimin bir veya daha fazla "Birim Başkanı" olabilir. Görev ve etkinlikler isteğe bağlı olarak bir birime bağlanabilir ve Görevler/Etkinlikler sayfalarında birime göre filtrelenebilir.

## Roller ve yetkiler

Roller **kulüp bazındadır** — aynı kişi bir kulüpte yönetici, başka bir kulüpte sade üye olabilir. Ayrıca birim bazlı bir ara kademe vardır:

- **Yönetici** (kulübü oluşturan kişi otomatik yöneticidir): görev/etkinlik/birim oluşturur, yoklama alır, tüm üyeleri düzenler, davet kodunu paylaşır/yeniler.
- **Birim Başkanı:** sadece kendi biriminin üyelerini (birime atama/çıkarma), görevlerini ve etkinliklerini (oluşturma/düzenleme/silme, yoklama alma) yönetebilir. Kulüp geneli ayarlara veya başka birimlere dokunamaz.
- **Üye:** kendine atanan görevleri görür ve tamamlar; kendi katılım geçmişini görür; düzenleme yapamaz.

Yetki sınırları sadece arayüzde değil, Firestore tarafında **Security Rules** ile de uygulanır — bkz. `firestore.rules`. Cloud Functions kullanılmıyor; her şey Firebase'in ücretsiz (Spark) planında çalışır.

> **Bilinen sınırlama:** "Bir kulübün son yöneticisi çıkarılamaz" kuralı sunucu tarafında zorlanmıyor (bunu güvenli yapmak Cloud Functions gerektirirdi). Sadece kendinize dikkat edin — kulübün tek yöneticisiyken kendinizi silmeyin/yönetici yetkinizi kaldırmayın.

## Platform yönetimi (senin için — kulüp yöneticiliğinden ayrı)

Yukarıdaki roller hep **bir kulübün içinde** geçerli. Bunun dışında, uygulamanın sahibi (sen) için ayrı ve çok daha kısıtlı bir "platform yöneticisi" kavramı var: tüm kulüpleri listeleyebilme ve gerekirse (spam/kötüye kullanım) bir kulübü tamamen silebilme. Bu rol **hiçbir client kod yolundan** verilemez — sadece Firebase Console'dan elle açılır, böylece kimse (kulüp yöneticileri dahil) kendini bu role atayamaz.

Kendini platform yöneticisi yapmak için:
1. Firebase Console → **Firestore Database** → **Data** sekmesi.
2. **+ Start collection** ile `platformAdmins` adında yeni bir koleksiyon oluştur.
3. Belge kimliği (Document ID) olarak **kendi Firebase Auth UID'ini** yapıştır (Authentication sekmesinde kullanıcı listesinde e-postanın yanında görünür).
4. İçine herhangi bir alan ekle (örn. `note: "ben"`), **Save**.
5. Siteyi yenile, giriş yaptığında sağ üstte bir kalkan ikonu belirir — o, platform paneline açılır (tüm kulüpler + her birinin yanında "Sil" butonu).

**Dikkat:** Bir kulübü silmek geri alınamaz — o kulübün tüm üyeleri/görevleri/etkinlikleri/yoklamaları kalıcı olarak silinir.

## Kurulum (ilk sefer)

1. **Firebase projesi:** [console.firebase.google.com](https://console.firebase.google.com) üzerinde bir proje oluştur (veya mevcut projeni kullan).
2. **E-posta girişini aç:** Sol menüde **Build → Authentication** → **Get started** → **Sign-in method** sekmesinde **Email/Password**'ü etkinleştir.
3. **Veritabanını oluştur:** Sol menüde **Build → Firestore Database** → **Create database** → "production mode" seç → bir bölge seç (örn. `eur3 (europe-west)`).
4. **Kuralları kur:** Firestore ekranında **Rules** sekmesine geç, `firestore.rules` dosyasının tamamını kopyalayıp oradaki kutuya yapıştır → **Publish**.
5. **Web uygulaması ekle:** Proje ana sayfasında `</>` (Web) simgesine tıkla, bir isim ver, "Firebase Hosting" kutucuğunu **işaretlemene gerek yok** → **Register app**. Karşına çıkan `firebaseConfig` objesindeki değerleri `firebaseConfig.js` dosyasına yapıştır.
6. Uygulamayı aç (bkz. aşağıdaki "Visual Studio Code'da geliştirme"), hesap oluştur, ardından "Kulüp oluştur" ile ilk kulübünü kur.

### Kurulumdan sonra karşına çıkabilecek bir uyarı

İlk giriş yaptığında tarayıcı konsolunda (F12) "The query requires an index" gibi bir Firestore hatası görebilirsin — bu normaldir (çoklu kulüp desteği için gereken bir index ilk seferde otomatik önerilir). Hata mesajındaki linke tıkla, Firebase Console'da "Create index" butonuna bas, birkaç dakika bekle, sonra sayfayı yenile.

## App Check kurulumu (isteğe bağlı, ekstra güvenlik katmanı)

App Check, Firestore'a gelen isteklerin gerçekten bu siteden geldiğini doğrular; script/bot trafiğiyle kotanın kötüye kullanılmasını zorlaştırır. Kurulmadan da uygulama normal çalışır — bu adım isteğe bağlı bir sıkılaştırmadır.

1. [google.com/recaptcha/admin/create](https://www.google.com/recaptcha/admin/create) adresine git, Google hesabınla giriş yap.
2. Bir etiket yaz (örn. "Kulüp Takip"), **reCAPTCHA v3** türünü seç.
3. **Domains** kısmına yayına alacağın domaini ekle; yerel test için `localhost` da ekle (Live Server'ı `127.0.0.1:5500` yerine `http://localhost:5500` üzerinden açman gerekir — reCAPTCHA IP adresini değil "localhost" adını tanır).
4. Kaydet, çıkan **Site Key**'i kopyala.
5. Firebase Console → sol menü → **Security** → **App Check** → **Get started** → Web uygulamanı seç → **reCAPTCHA v3** sağlayıcısını ekle → Site Key'i yapıştır.
6. `firebaseConfig.js` içindeki `RECAPTCHA_V3_SITE_KEY` değerini bu key ile değiştir.
7. Siteyi yenile, Firebase Console'da App Check → **Apps** sekmesinde isteklerin "Verified" olarak göründüğünü doğrula (birkaç dakika sürebilir).
8. **Sadece doğrulama başarılıysa:** App Check → **APIs** sekmesi → Cloud Firestore → **Enforce** düğmesini aç. Bunu doğrulamadan açarsan uygulama herkes için (sen dahil) kilitlenebilir.

## Yayına alma (Firebase Hosting) ve mobilde "ana ekrana ekle"

Uygulama Firebase Hosting'e yayınlanacak şekilde hazır (`firebase.json`, `.firebaserc`) ve bir PWA (Progressive Web App) — telefonda "Ana ekrana ekle" ile gerçek bir uygulama ikonu gibi açılabiliyor (`manifest.json`, `sw.js`, `icons/`). Bu ortamda Node.js/npm kurulu olmadığı için `firebase deploy` komutu kendi bilgisayarınızda çalıştırılmalı:

1. [nodejs.org](https://nodejs.org) üzerinden Node.js (LTS sürüm) kurun.
2. VS Code'da yeni bir terminal açın (Terminal → New Terminal), şunu çalıştırın: `npm install -g firebase-tools`
3. `firebase login` — `kulupdenetim` projesinin sahibi olan Google hesabıyla giriş yapın.
4. Proje klasöründeyken: `firebase deploy --only hosting`
5. Komut sonunda çıkan `https://kulupdenetim.web.app` linkini tarayıcıda açıp giriş ekranının hatasız geldiğini doğrulayın.
6. [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) → "Kulüp Takip" kaydına `kulupdenetim.web.app` domainini ekleyin (App Check'in localhost dışında da çalışması için — bkz. "App Check kurulumu").
7. Telefonda linki açıp tarayıcı menüsünden "Ana ekrana ekle" / "Add to Home Screen" ile test edin.

İleride PWA dosyalarında (`index.html`, `app.js`, ...) bir değişiklik yaptığınızda, kullanıcıların eski önbelleklenmiş sürümü değil yeni sürümü almasını garantilemek için `sw.js` içindeki `CACHE_NAME` değerini bir artırın (`kulup-takip-shell-v1` → `v2`), sonra tekrar `firebase deploy --only hosting` çalıştırın.

## Veri nerede saklanıyor?

Veriler artık **Firebase Firestore**'da saklanır, tarayıcıya bağlı değildir — herkes kendi hesabıyla, herhangi bir cihazdan girip aynı kulüp verisini görür. Her kulübün verisi diğer kulüplerden Security Rules ile tamamen izole edilmiştir.

- **Kulübe üye eklemek:** ⚙ Ayarlar'daki davet kodunu/linkini paylaş; yeni kişi kayıt olup kodu girer ya da linke tıklar.
- **Yedek:** ⚙ Ayarlar → "Yedek al (JSON)" ile o an gördüğün kulüp verisinin bir kopyasını indirebilirsin (kişisel yedek; geri yükleme özelliği yok — paylaşımlı canlı veri artık tek kişinin dosyasıyla değiştirilemez).

## Sonraki adımlar

1. ~~Online yayın + link~~ / ~~Gerçek giriş + çok kullanıcı~~ / ~~PWA (ana ekrana ekle)~~ — tamamlandı, bkz. "Yayına alma" bölümü.
2. **Faz 3 — Bildirimler:** Yaklaşan görev/etkinlik için e-posta veya push hatırlatma.
3. **Faz 4 — Mağaza yayını:** İstenirse Play Store / App Store'a (Bubblewrap/Capacitor gibi araçlarla) gönderilir — ayrı geliştirici hesapları (Google 25$ tek seferlik, Apple 99$/yıl) ve ek bir kurulum süreci gerektirir.

## Visual Studio Code'da geliştirme

1. VS Code'da **File → Open Folder** ile bu klasörü aç.
2. **Çalıştırma:** VS Code'da **Live Server** eklentisini kur, `index.html` açıkken sağ alttaki **"Go Live"** butonuna bas.
   - Firebase Auth genelde `file://` üzerinden çift-tıklamayla da çalışır, ama tutarlılık ve ileride yayına almayı kolaylaştırmak için Live Server (http://) önerilir.

### Kod nerede?

Uygulama 3 dosyaya bölünmüş durumda (build aracı yok, sürükle-bırak deploy edilebilir):

- `index.html` — sayfa iskeleti + tüm `<style>` (tasarım/CSS, renkler `:root` içindeki değişkenlerde).
- `firebaseConfig.js` — Firebase proje bağlantı bilgileri (bkz. Kurulum).
- `app.js` — tüm uygulama mantığı. Bölümler yorum satırlarıyla ayrıldı:
  - `Icons`, `Utilities`, `Constants`
  - `Selectors` (yardımcı sorgular), `Firestore doc -> JS shape mappers`, `Firestore data layer` (`loadClubData`, `refreshMyClubs`, `joinClubWithCode`)
  - `AUTH SCREENS`, `CLUB GATE` (kulüp oluştur/katıl)
  - Ekran çizim fonksiyonları: `renderPanel`, `renderMembers`, `renderMemberDetail`, `renderTasks`, `renderEvents`, `renderAttendance`
  - `Modals` (form pencereleri), `Event delegation` (tüm tıklama işlemleri tek yerde)
- `firestore.rules` — veritabanı güvenlik kuralları. Sadece kurulumda (veya kuralları değiştirdiğinde) Firebase Console'daki Rules sekmesine yapıştırılır, uygulama çalışırken kullanılmaz.

### Veri modeli (Firestore koleksiyonları)

- `clubs/{clubId}` — kulüp adı, davet kodu, kurucu.
- `clubs/{clubId}/units/{unitId}` — birim (departman) adı.
- `clubs/{clubId}/members/{uid}` — belge id'si doğrudan kullanıcının Firebase Auth uid'si; ad, rol, yönetici mi, aktif mi, `unitId` (bağlı olduğu birim), `isUnitHead` (birim başkanı mı).
- `clubs/{clubId}/tasks/{taskId}`, `clubs/{clubId}/events/{eventId}`, `clubs/{clubId}/events/{eventId}/attendance/{uid}` — task/event belgelerinde isteğe bağlı `unitId` alanı.
- `inviteCodes/{code}` — davet kodundan `clubId`'ye eşleme (sadece tam kodu bilen "get" yapabilir, kimse tüm kodları listeleyemez).

### Sık gereken işlemler

- **Rolleri değiştirmek:** `app.js` içindeki `ROLES` dizisi.
- **Yetkileri değiştirmek:** `firestore.rules` — değişiklik sonrası Firebase Console → Firestore → Rules sekmesine tekrar yapıştırıp **Publish** demen gerekir.

## Dosyalar

- `index.html` — sayfa iskeleti ve tasarım.
- `app.js` — uygulama mantığı (auth, kulüp yönetimi, ekranlar).
- `firebaseConfig.js` — Firebase bağlantı bilgileri (kendi proje bilgilerinle doldur).
- `firestore.rules` — Firestore güvenlik kuralları (Firebase Console'a yapıştırılır).
- `manifest.json`, `sw.js`, `icons/` — PWA desteği ("ana ekrana ekle"), bkz. "Yayına alma" bölümü.
- `firebase.json`, `.firebaserc` — Firebase Hosting yapılandırması (`firebase deploy` bunları kullanır).
- `README.md` — bu dosya.
- `shots/` — Faz 1'den kalma ekran görüntüleri (dokümantasyon amaçlı; arayüz büyük ölçüde aynı kaldı).
