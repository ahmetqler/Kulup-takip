"use strict";
/* ============================================================
   Kulüp Takip — Faz 2 (Firebase sürümü)
   Veri Firestore'da saklanır. Kimlik doğrulama Firebase Auth
   (e-posta/şifre). Çoklu kulüp desteklenir; bir kullanıcı birden
   fazla kulübe üye olabilir, roller kulüp bazındadır. Cloud
   Functions kullanılmaz — tüm yazma işlemleri firestore.rules
   içindeki güvenlik kurallarıyla korunan istemci taraflı
   işlemlerdir (bkz. firestore.rules).
   ============================================================ */

/* ---------- Icons (Lucide-style inline SVG) ---------- */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5H9z"/><path d="M9 11h6M9 15h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  location: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  flag: '<path d="M4 21V4M4 4h13l-2 4 2 4H4"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.07 0l2.5-2.5a5 5 0 0 0-7.07-7.07L11 4.91"/><path d="M14 11a5 5 0 0 0-7.07 0l-2.5 2.5a5 5 0 0 0 7.07 7.07L13 19.09"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-4 8 4Z"/>',
};
function icon(name, cls) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="'+cls+'"' : '') + '>' + (ICONS[name]||'') + '</svg>';
}

/* ---------- Tema (açık/koyu) ---------- */
const THEME_KEY = 'kulupTakip.theme';
function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {}
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0e1015' : '#4f46e5');
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
applyTheme(getPreferredTheme());

/* ---------- Dil (Türkçe/İngilizce) ----------
   Roller (ROLES) veritabanında her zaman Türkçe saklanır (izin kontrolleri
   bu değerlere göre çalışır, bkz. isViceAdmin). ROLE_LABELS_EN sadece
   EKRANDA gösterim içindir, saklanan/karşılaştırılan değeri değiştirmez. */
const LANG_KEY = 'kulupTakip.lang';
let lang = 'tr';
function getPreferredLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'tr' || saved === 'en') return saved;
  } catch (e) {}
  return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
}
const ROLE_LABELS_EN = {
  'Başkan': 'President',
  'Başkan Yardımcısı': 'Vice President',
  'Yönetim Kurulu': 'Board Member',
  'Sekreter': 'Secretary',
  'Sayman': 'Treasurer',
  'Etkinlik Sorumlusu': 'Events Officer',
  'Sosyal Medya': 'Social Media',
  'Üye': 'Member',
};
function roleLabel(role) { return lang === 'en' ? (ROLE_LABELS_EN[role] || role) : role; }

const STRINGS = {
  tr: {
    auth_login:'Giriş yap', auth_signup:'Hesap oluştur', auth_welcome:"Kulüp Takip'e hoş geldin",
    auth_email:'E-posta', auth_password:'Şifre', auth_password_ph:'En az 6 karakter', auth_wait:'Bekleyin…',
    auth_no_account:'Hesabın yok mu?', auth_have_account:'Zaten hesabın var mı?',
    err_email_pass_required:'E-posta ve şifre gerekli',
    err_wrong_password:'E-posta veya şifre hatalı.',
    err_email_in_use:'Bu e-posta ile zaten bir hesap var, giriş yapmayı deneyin.',
    err_weak_password:'Şifre en az 6 karakter olmalı.',
    err_invalid_email:'Geçersiz e-posta adresi.',
    err_too_many:'Çok fazla deneme yapıldı, biraz sonra tekrar dene.',
    err_generic:'Bir hata oluştu, tekrar deneyin.',

    gate_title:'Kulübe başla', gate_sub:'Bir kulübe katıl ya da yeni bir kulüp oluştur',
    gate_join_tab:'Kulübe katıl', gate_create_tab:'Kulüp oluştur',
    gate_name_label:'Adın Soyadın', gate_name_ph:'Bu kulüpte görünecek adın',
    gate_code_label:'Davet kodu', gate_code_ph:'Örn. 8F3K9A2C',
    gate_joining:'Katılınıyor…', gate_join_btn:'Kulübe katıl',
    gate_clubname_label:'Kulüp adı', gate_clubname_ph:'Örn. Bilgisayar Kulübü',
    gate_creating:'Oluşturuluyor…', gate_create_btn:'Kulübü oluştur', gate_logout:'Çıkış yap',
    err_name_required:'Adın gerekli', err_code_required:'Davet kodu gerekli',
    err_clubname_required:'Kulüp adı gerekli', err_invalid_code:'Geçersiz davet kodu', err_generic2:'Bir hata oluştu',
    err_name_not_allowed:'Bu isim kullanılamaz, lütfen başka bir isim dene',

    tab_panel:'Panel', tab_members:'Üyeler', tab_tasks:'Görevler', tab_events:'Etkinlikler', tab_attendance:'Yoklama',

    panel_hello:'Merhaba, {name} 👋', panel_admin_view:'Yönetici görünümü',
    stat_active_members:'Aktif üye', stat_open_tasks:'Açık görev', stat_week_events:'Bu hafta etkinlik', stat_overdue:'Geciken görev',
    sec_my_upcoming_tasks:'Yaklaşan görevlerim', empty_tasks_title:'Harika!', empty_tasks_sub:'Üzerinde bekleyen görevin yok.',
    sec_upcoming_events:'Yaklaşan etkinlikler', empty_events_title:'Planlı etkinlik yok', empty_events_sub:'Yeni bir etkinlik ekleyebilirsin.',
    sec_overdue_tasks:'Geciken görevler',

    members_title:'Üyeler', members_sub:'{active} aktif · {total} toplam',
    btn_add_unit:'Birim ekle', btn_invite:'Davet et', sec_units:'Birimler', sec_unassigned:'Birimsiz / Kulüp geneli',
    empty_all_assigned:'Herkes bir birime atanmış',
    badge_inactive:'Pasif', badge_admin:'Yönetici', badge_unit_head:'Birim Başkanı',
    attendance_rate:'Katılım %{rate}', unit_members_count:'{n} üye', unit_heads_count:'{n} başkan',
    empty_unit_no_members:'Bu birimde üye yok', empty_unit_no_members_sub:'Üye profilinden birime atama yapabilirsin.',
    btn_edit:'Düzenle',

    member_profile:'Üye profili', kv_email:'E-posta', kv_status:'Durum', status_active:'Aktif',
    kv_unit:'Birim', unit_none:'Birimsiz', kv_joined:'Katılım tarihi',
    sec_attendance_stats:'Katılım istatistiği', att_marked_count:'{n} etkinlikte işaretlendi',
    att_present:'Geldi', att_absent:'Gelmedi', att_excused:'Mazeretli',
    empty_no_attendance:'Henüz katılım kaydı yok.', sec_tasks_open:'Görevleri ({n} açık)',
    empty_task_title:'Görev yok', empty_task_member_sub:'Bu üyeye atanmış görev bulunmuyor.',

    tasks_title:'Görevler', tasks_sub:'{n} açık görev', btn_task:'Görev',
    seg_all:'Tümü', seg_mine:'Bana atanan', seg_open:'Açık', seg_overdue:'Geciken', seg_completed:'Tamamlanan',
    filter_unit_label:'Birim', filter_all_units:'Tüm birimler', filter_clubwide:'Kulüp geneli',
    empty_task_filter_sub:'Bu filtrede görev bulunmuyor.',
    task_completed_at:'{date} tamamlandı', task_due:'Son: {rel}',
    status_pending:'Bekliyor', status_in_progress:'Devam ediyor', status_completed:'Tamamlandı', status_overdue:'Gecikti',

    events_title:'Etkinlikler', events_sub:'{n} yaklaşan', btn_event:'Etkinlik',
    sec_upcoming:'Yaklaşan', empty_event_filter:'Yaklaşan etkinlik yok', empty_event_filter_sub:'Yeni etkinlik ekleyerek başla.',
    sec_past:'Geçmiş', event_attendance_count:'{present}/{total} katılım', btn_attendance:'Yoklama',

    attendance_title:'Yoklama', attendance_sub:'Etkinlik katılımını işaretle',
    empty_no_events:'Etkinlik yok', empty_no_events_sub:'Önce bir etkinlik oluştur.', field_event:'Etkinlik',
    stat_unmarked:'İşaretsiz',
    callout_mark_restricted:'Yoklama işaretlemeyi yalnızca yöneticiler veya bu etkinliğin biriminin başkanı yapabilir. Aşağıdaki liste salt görünümdür.',
    att_seg_excused:'Mazeret', reason_none:'Sebep belirtilmedi', sec_absentees:'Gelmeyenler',

    mf_title_edit:'Üyeyi düzenle', mf_sub_admin:'Rol, yetki ve birim bilgilerini güncelle.', mf_sub_unit:'Birim bilgisini güncelle.',
    field_name:'Ad Soyad', field_name_ph:'Örn. Ayşe Yıldız', field_role:'Rol / Pozisyon',
    sw_admin_title:'Yönetici yetkisi', sw_admin_desc:'Görev/etkinlik oluşturabilir, yoklama alır.',
    sw_active_title:'Aktif üye', sw_active_desc:'Pasif üyeler listelerde görünmez.',
    sw_unit_head_title:'Birim Başkanı', sw_unit_head_desc:'Kendi biriminin görev/etkinlik/üyelerini yönetebilir.',
    btn_save:'Kaydet', btn_remove_from_club:'Kulüpten çıkar', label_saving:'Kaydediliyor…', label_creating:'Oluşturuluyor…',
    toast_name_required:'Ad Soyad gerekli', toast_member_updated:'Üye güncellendi', toast_save_failed:'Kaydedilemedi',
    toast_no_permission_member:'Bu üyeyi düzenleme yetkin yok',

    tf_edit:'Görevi düzenle', tf_new:'Yeni görev', tf_sub:'Görevi bir üyeye ata ve son tarih belirle.',
    field_title:'Başlık', field_title_ph_task:'Örn. Afişi tasarla',
    field_desc:'Açıklama', field_desc_ph:'Kısa açıklama (isteğe bağlı)',
    field_assignee:'Atanan üye', field_due_date:'Son teslim tarihi', field_status:'Durum',
    field_unit_optional:'Birim (isteğe bağlı)', btn_delete:'Sil', btn_create:'Oluştur',
    toast_title_required:'Başlık gerekli', toast_task_updated:'Görev güncellendi', toast_task_created:'Görev oluşturuldu',
    toast_no_permission_task_edit:'Bu görevi düzenleme yetkin yok', toast_no_permission_task_create:'Görev oluşturma yetkin yok',

    ef_edit:'Etkinliği düzenle', ef_new:'Yeni etkinlik', ef_sub:'Tarih, saat ve yer bilgisi gir.',
    field_title_ph_event:'Örn. Tanışma Etkinliği', field_datetime:'Tarih ve saat',
    field_location:'Yer', field_location_ph:'Örn. B-201',
    toast_date_required:'Tarih gerekli', toast_event_updated:'Etkinlik güncellendi', toast_event_created:'Etkinlik oluşturuldu',
    toast_no_permission_event_edit:'Bu etkinliği düzenleme yetkin yok', toast_no_permission_event_create:'Etkinlik oluşturma yetkin yok',

    uf_edit:'Birimi düzenle', uf_new:'Yeni birim', uf_sub:'Birim adını gir.',
    field_unit_name:'Birim adı', field_unit_name_ph:'Örn. Yazılım Birimi', sec_unit_icon:'Birim ikonu',
    btn_upload_icon:'İkon yükle', callout_icon_first_save:'İkon eklemek için önce birimi oluştur, sonra düzenle.',
    btn_delete_unit:'Birimi sil', toast_unit_name_required:'Birim adı gerekli',
    toast_unit_updated:'Birim güncellendi', toast_unit_created:'Birim oluşturuldu',
    toast_no_permission_units:'Birim yönetimi sadece kulüp yöneticisine açık',
    toast_icon_processing:'İkon işleniyor…', toast_icon_updated:'İkon güncellendi', toast_icon_failed:'İkon yüklenemedi',

    rf_sub:'Gelmeme sebebini yazabilirsin (isteğe bağlı).', field_reason:'Sebep', field_reason_ph:'Örn. Sınavı vardı',
    btn_save_no_reason:'Sebepsiz kaydet',

    btn_cancel:'Vazgeç', btn_yes:'Evet',

    settings_title:'Ayarlar', settings_sub:'Kulüp ve hesap seçenekleri.',
    field_club_name:'Kulüp adı', kv_club:'Kulüp', sec_club_logo:'Kulüp logosu', btn_upload_logo:'Logo yükle',
    sec_invite:'Üye davet et', btn_copy_code:'Kodu kopyala', btn_copy_link:'Linki kopyala', btn_regen_code:'Kodu yenile',
    sec_data:'Veri', field_export_scope:'Yedek kapsamı', opt_all_club:'Tüm kulüp',
    btn_export:'Yedek al', btn_export_my_unit:'Yedek al (Birimim)',
    callout_data_shared:'Veriler Firebase üzerinde saklanır ve kulübündeki tüm üyelerle paylaşılır.',
    btn_close:'Kapat',
    toast_saved:'Kaydedildi', toast_logo_processing:'Logo işleniyor…', toast_logo_updated:'Logo güncellendi', toast_logo_failed:'Logo yüklenemedi',
    toast_code_copied:'Kod kopyalandı', toast_link_copied:'Link kopyalandı', toast_copy_failed:'Kopyalanamadı',
    toast_code_regenerated:'Kod yenilendi', confirm_regen_title:'Kodu yenile',
    confirm_regen_msg:'Eski davet linkleri geçersiz olacak. Emin misin?', toast_action_failed:'İşlem başarısız',
    toast_export_no_permission:'Yedek alma yetkin yok', toast_backup_downloaded:'Yedek indirildi',

    confirm_remove_member_title:'Üyeyi kulüpten çıkar', confirm_remove_member_msg:'{name} bu kulüpten çıkarılsın mı?',
    toast_member_removed:'Üye çıkarıldı',
    confirm_delete_task_title:'Görevi sil', confirm_delete_task_msg:'Bu görev silinsin mi?',
    toast_task_deleted:'Görev silindi', toast_delete_failed:'Silinemedi',
    confirm_delete_event_title:'Etkinliği sil', confirm_delete_event_msg:'Bu etkinlik ve yoklaması silinsin mi?',
    toast_event_deleted:'Etkinlik silindi',
    confirm_delete_unit_title:'Birimi sil',
    confirm_delete_unit_msg:'Birim silinsin mi? Birimdeki üyeler ve görev/etkinlikler birimsiz kalır.',
    toast_unit_deleted:'Birim silindi', toast_task_completed:'Görev tamamlandı 🎉',
    toast_attendance_failed:'Yoklama kaydedilemedi', toast_club_load_failed:'Kulüp yüklenemedi',
    toast_join_failed:'Davet koduyla katılım başarısız',

    loading:'Yükleniyor…', loading_app:'Kulüp Takip başlatılıyor.', loading_club_switch:'Kulüp değiştiriliyor.',
    fatal_title:'Bir şeyler ters gitti', fatal_conn:'Bağlantı hatası', btn_retry:'Tekrar dene',
    default_club_name:'Kulüp Takip', default_club_fallback:'Kulüp',
    image_only:'Sadece görsel dosyası yükleyebilirsin', file_read_failed:'Dosya okunamadı',
    image_open_failed:'Görsel açılamadı', image_too_complex:'Görsel çok büyük/karmaşık, daha basit bir görsel dene',

    platform_admin_title:'Platform Yönetimi', platform_admin_sub:'{n} kulüp',
    platform_admin_empty:'Henüz hiç kulüp yok',
    platform_admin_created:'{date} oluşturuldu',
    confirm_platform_delete_title:'Kulübü kalıcı olarak sil',
    confirm_platform_delete_msg:'"{name}" kulübü ve tüm üyeleri/görevleri/etkinlikleri/yoklamaları kalıcı olarak silinecek. Bu işlem GERİ ALINAMAZ. Emin misin?',
    toast_club_deleted:'Kulüp silindi',
    toast_name_not_allowed:'Bu isim kullanılamaz, lütfen başka bir isim dene',
  },
  en: {
    auth_login:'Log in', auth_signup:'Create account', auth_welcome:'Welcome to Club Tracker',
    auth_email:'Email', auth_password:'Password', auth_password_ph:'At least 6 characters', auth_wait:'Please wait…',
    auth_no_account:"Don't have an account?", auth_have_account:'Already have an account?',
    err_email_pass_required:'Email and password are required',
    err_wrong_password:'Incorrect email or password.',
    err_email_in_use:'An account with this email already exists — try logging in.',
    err_weak_password:'Password must be at least 6 characters.',
    err_invalid_email:'Invalid email address.',
    err_too_many:'Too many attempts, try again in a bit.',
    err_generic:'Something went wrong, please try again.',

    gate_title:'Get started with a club', gate_sub:'Join a club or create a new one',
    gate_join_tab:'Join a club', gate_create_tab:'Create a club',
    gate_name_label:'Your full name', gate_name_ph:'Your name in this club',
    gate_code_label:'Invite code', gate_code_ph:'e.g. 8F3K9A2C',
    gate_joining:'Joining…', gate_join_btn:'Join club',
    gate_clubname_label:'Club name', gate_clubname_ph:'e.g. Computer Club',
    gate_creating:'Creating…', gate_create_btn:'Create club', gate_logout:'Log out',
    err_name_required:'Your name is required', err_code_required:'Invite code is required',
    err_clubname_required:'Club name is required', err_invalid_code:'Invalid invite code', err_generic2:'Something went wrong',
    err_name_not_allowed:'This name isn\'t allowed, please try a different name',

    tab_panel:'Panel', tab_members:'Members', tab_tasks:'Tasks', tab_events:'Events', tab_attendance:'Attendance',

    panel_hello:'Hi, {name} 👋', panel_admin_view:'Admin view',
    stat_active_members:'Active members', stat_open_tasks:'Open tasks', stat_week_events:'Events this week', stat_overdue:'Overdue tasks',
    sec_my_upcoming_tasks:'My upcoming tasks', empty_tasks_title:'Great!', empty_tasks_sub:"You don't have any pending tasks.",
    sec_upcoming_events:'Upcoming events', empty_events_title:'No planned events', empty_events_sub:'You can add a new event.',
    sec_overdue_tasks:'Overdue tasks',

    members_title:'Members', members_sub:'{active} active · {total} total',
    btn_add_unit:'Add unit', btn_invite:'Invite', sec_units:'Units', sec_unassigned:'Unassigned / Club-wide',
    empty_all_assigned:'Everyone is assigned to a unit',
    badge_inactive:'Inactive', badge_admin:'Admin', badge_unit_head:'Unit Head',
    attendance_rate:'{rate}% attendance', unit_members_count:'{n} members', unit_heads_count:'{n} heads',
    empty_unit_no_members:'No members in this unit', empty_unit_no_members_sub:'You can assign members from their profile.',
    btn_edit:'Edit',

    member_profile:'Member profile', kv_email:'Email', kv_status:'Status', status_active:'Active',
    kv_unit:'Unit', unit_none:'No unit', kv_joined:'Joined on',
    sec_attendance_stats:'Attendance stats', att_marked_count:'Marked in {n} events',
    att_present:'Present', att_absent:'Absent', att_excused:'Excused',
    empty_no_attendance:'No attendance record yet.', sec_tasks_open:'Tasks ({n} open)',
    empty_task_title:'No tasks', empty_task_member_sub:'No tasks assigned to this member.',

    tasks_title:'Tasks', tasks_sub:'{n} open tasks', btn_task:'Task',
    seg_all:'All', seg_mine:'Assigned to me', seg_open:'Open', seg_overdue:'Overdue', seg_completed:'Completed',
    filter_unit_label:'Unit', filter_all_units:'All units', filter_clubwide:'Club-wide',
    empty_task_filter_sub:'No tasks match this filter.',
    task_completed_at:'completed {date}', task_due:'Due: {rel}',
    status_pending:'Pending', status_in_progress:'In progress', status_completed:'Completed', status_overdue:'Overdue',

    events_title:'Events', events_sub:'{n} upcoming', btn_event:'Event',
    sec_upcoming:'Upcoming', empty_event_filter:'No upcoming events', empty_event_filter_sub:'Start by adding a new event.',
    sec_past:'Past', event_attendance_count:'{present}/{total} attended', btn_attendance:'Attendance',

    attendance_title:'Attendance', attendance_sub:'Mark event attendance',
    empty_no_events:'No events', empty_no_events_sub:'Create an event first.', field_event:'Event',
    stat_unmarked:'Unmarked',
    callout_mark_restricted:"Only admins or this event's unit head can mark attendance. The list below is read-only.",
    att_seg_excused:'Excuse', reason_none:'No reason given', sec_absentees:'No-shows',

    mf_title_edit:'Edit member', mf_sub_admin:'Update role, permissions and unit info.', mf_sub_unit:'Update unit info.',
    field_name:'Full name', field_name_ph:'e.g. Jane Doe', field_role:'Role / Position',
    sw_admin_title:'Admin permission', sw_admin_desc:'Can create tasks/events, take attendance.',
    sw_active_title:'Active member', sw_active_desc:'Inactive members are hidden from lists.',
    sw_unit_head_title:'Unit Head', sw_unit_head_desc:"Can manage their unit's tasks/events/members.",
    btn_save:'Save', btn_remove_from_club:'Remove from club', label_saving:'Saving…', label_creating:'Creating…',
    toast_name_required:'Full name is required', toast_member_updated:'Member updated', toast_save_failed:'Could not save',
    toast_no_permission_member:"You don't have permission to edit this member",

    tf_edit:'Edit task', tf_new:'New task', tf_sub:'Assign the task to a member and set a due date.',
    field_title:'Title', field_title_ph_task:'e.g. Design the poster',
    field_desc:'Description', field_desc_ph:'Short description (optional)',
    field_assignee:'Assignee', field_due_date:'Due date', field_status:'Status',
    field_unit_optional:'Unit (optional)', btn_delete:'Delete', btn_create:'Create',
    toast_title_required:'Title is required', toast_task_updated:'Task updated', toast_task_created:'Task created',
    toast_no_permission_task_edit:"You don't have permission to edit this task", toast_no_permission_task_create:"You don't have permission to create tasks",

    ef_edit:'Edit event', ef_new:'New event', ef_sub:'Enter date, time and location.',
    field_title_ph_event:'e.g. Welcome event', field_datetime:'Date and time',
    field_location:'Location', field_location_ph:'e.g. Room B-201',
    toast_date_required:'Date is required', toast_event_updated:'Event updated', toast_event_created:'Event created',
    toast_no_permission_event_edit:"You don't have permission to edit this event", toast_no_permission_event_create:"You don't have permission to create events",

    uf_edit:'Edit unit', uf_new:'New unit', uf_sub:'Enter the unit name.',
    field_unit_name:'Unit name', field_unit_name_ph:'e.g. Software Team', sec_unit_icon:'Unit icon',
    btn_upload_icon:'Upload icon', callout_icon_first_save:'Save the unit first, then edit it to add an icon.',
    btn_delete_unit:'Delete unit', toast_unit_name_required:'Unit name is required',
    toast_unit_updated:'Unit updated', toast_unit_created:'Unit created',
    toast_no_permission_units:'Unit management is admin-only',
    toast_icon_processing:'Processing icon…', toast_icon_updated:'Icon updated', toast_icon_failed:'Could not upload icon',

    rf_sub:'You can add a reason for the absence (optional).', field_reason:'Reason', field_reason_ph:'e.g. Had an exam',
    btn_save_no_reason:'Save without a reason',

    btn_cancel:'Cancel', btn_yes:'Yes',

    settings_title:'Settings', settings_sub:'Club and account options.',
    field_club_name:'Club name', kv_club:'Club', sec_club_logo:'Club logo', btn_upload_logo:'Upload logo',
    sec_invite:'Invite members', btn_copy_code:'Copy code', btn_copy_link:'Copy link', btn_regen_code:'Regenerate code',
    sec_data:'Data', field_export_scope:'Backup scope', opt_all_club:'Whole club',
    btn_export:'Get backup', btn_export_my_unit:'Get backup (My unit)',
    callout_data_shared:'Data is stored on Firebase and shared with everyone in the club.',
    btn_close:'Close',
    toast_saved:'Saved', toast_logo_processing:'Processing logo…', toast_logo_updated:'Logo updated', toast_logo_failed:'Could not upload logo',
    toast_code_copied:'Code copied', toast_link_copied:'Link copied', toast_copy_failed:'Could not copy',
    toast_code_regenerated:'Code regenerated', confirm_regen_title:'Regenerate code',
    confirm_regen_msg:'Old invite links will stop working. Are you sure?', toast_action_failed:'Action failed',
    toast_export_no_permission:"You don't have permission to export data", toast_backup_downloaded:'Backup downloaded',

    confirm_remove_member_title:'Remove member from club', confirm_remove_member_msg:'Remove {name} from this club?',
    toast_member_removed:'Member removed',
    confirm_delete_task_title:'Delete task', confirm_delete_task_msg:'Delete this task?',
    toast_task_deleted:'Task deleted', toast_delete_failed:'Could not delete',
    confirm_delete_event_title:'Delete event', confirm_delete_event_msg:'Delete this event and its attendance records?',
    toast_event_deleted:'Event deleted',
    confirm_delete_unit_title:'Delete unit',
    confirm_delete_unit_msg:'Delete this unit? Its members, tasks and events will become unassigned.',
    toast_unit_deleted:'Unit deleted', toast_task_completed:'Task completed 🎉',
    toast_attendance_failed:'Could not save attendance', toast_club_load_failed:'Could not load club',
    toast_join_failed:'Failed to join with invite code',

    loading:'Loading…', loading_app:'Starting Club Tracker.', loading_club_switch:'Switching club.',
    fatal_title:'Something went wrong', fatal_conn:'Connection error', btn_retry:'Try again',
    default_club_name:'Club Tracker', default_club_fallback:'Club',
    image_only:'You can only upload image files', file_read_failed:'Could not read file',
    image_open_failed:'Could not open image', image_too_complex:'Image is too large/complex, try a simpler image',

    platform_admin_title:'Platform Admin', platform_admin_sub:'{n} clubs',
    platform_admin_empty:'No clubs yet',
    platform_admin_created:'created {date}',
    confirm_platform_delete_title:'Permanently delete club',
    confirm_platform_delete_msg:'"{name}" and all its members/tasks/events/attendance will be permanently deleted. This CANNOT be undone. Are you sure?',
    toast_club_deleted:'Club deleted',
    toast_name_not_allowed:'This name isn\'t allowed, please try a different name',
  },
};
function T(key, vars) {
  let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.tr[key] || key;
  if (vars) Object.keys(vars).forEach(k => { s = s.split('{'+k+'}').join(vars[k]); });
  return s;
}
function applyLang(newLang) {
  lang = (newLang === 'en') ? 'en' : 'tr';
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'tr');
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = lang === 'en' ? 'TR' : 'EN';
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
}
function toggleLang() { applyLang(lang === 'en' ? 'tr' : 'en'); rerenderCurrentScreen(); }
applyLang(getPreferredLang());

/* ---------- Utilities ---------- */
const $ = (sel, el) => (el||document).querySelector(sel);
const esc = (s) => String(s==null?'':s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- İsim filtresi (küfür/hakaret + dinî unvan istismarı) ----------
   Sadece arayüz seviyesinde bir engel — client-side (bkz. app.js yorumları
   genelinde: gerçek güvenlik sınırı firestore.rules'dır, bu filtre değil).
   DİKKAT: Muhammed/Musa/İsa/Meryem gibi gerçek, yaygın kişi adları BİLEREK
   listede yok — sadece kimsenin gerçek adı olmayan unvan/iddialar (peygamber,
   tanrı, mesih vb.) ve küfür/hakaretler engellenir. */
const BLOCKED_NAME_WORDS = [
  // Türkçe küfür/hakaret
  'amk','aq','oç','orospu','piç','yavşak','ibne','götveren','siktir','sikik','sik','yarrak','pezevenk','kahpe','dallama','gavat','şerefsiz',
  // İngilizce küfür/hakaret
  'fuck','shit','bitch','asshole','cunt','whore','slut','faggot','nigger','dick','pussy','cock',
  // Dinî unvan/iddia (kişi adı değil — bkz. yukarıdaki not)
  'peygamber','prophet','tanrı','ilah','mesih','messiah',
];
function normalizeForNameFilter(s) {
  return String(s==null?'':s).toLocaleLowerCase('tr')
    .replace(/3/g,'e').replace(/1/g,'i').replace(/0/g,'o').replace(/4/g,'a').replace(/5/g,'s').replace(/7/g,'t').replace(/@/g,'a').replace(/\$/g,'s')
    .replace(/[^a-zçğıöşü]/g,'');
}
function hasBlockedContent(text) {
  const raw = String(text||'').trim();
  if (!raw) return false;
  const words = raw.split(/\s+/).map(normalizeForNameFilter).filter(Boolean);
  const squashed = normalizeForNameFilter(raw.replace(/\s+/g,''));
  return BLOCKED_NAME_WORDS.some(bw => {
    const nb = normalizeForNameFilter(bw);
    if (!nb) return false;
    if (words.some(w => w.includes(nb))) return true;
    return squashed.includes(nb) && squashed.length <= nb.length + 3;
  });
}

function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function daysFromNow(n) { const d = startOfToday(); d.setDate(d.getDate()+n); return d; }
function toISODate(d) { const x = new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); }
const MONTHS_BY_LANG = {
  tr: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
};
const DAYS_BY_LANG = {
  tr: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
};
function monthsList() { return MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.tr; }
function daysList() { return DAYS_BY_LANG[lang] || DAYS_BY_LANG.tr; }
function fmtDate(iso) { if(!iso) return '—'; const d = new Date(iso); if(isNaN(d)) return '—'; return d.getDate()+' '+monthsList()[d.getMonth()]+' '+d.getFullYear(); }
function fmtDateShort(iso) { if(!iso) return '—'; const d = new Date(iso); if(isNaN(d)) return '—'; return d.getDate()+' '+monthsList()[d.getMonth()]; }
function fmtDateTime(iso) { if(!iso) return '—'; const d = new Date(iso); if(isNaN(d)) return '—'; return d.getDate()+' '+monthsList()[d.getMonth()]+' '+d.getFullYear()+', '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function fmtDayName(iso) { const d = new Date(iso); return daysList()[d.getDay()]; }
function relDays(iso) {
  const d = new Date(iso); d.setHours(0,0,0,0);
  const diff = Math.round((d - startOfToday())/86400000);
  if (diff === 0) return lang==='en' ? 'Today' : 'Bugün';
  if (diff === 1) return lang==='en' ? 'Tomorrow' : 'Yarın';
  if (diff === -1) return lang==='en' ? 'Yesterday' : 'Dün';
  if (diff > 1 && diff <= 7) return lang==='en' ? ('in '+diff+' days') : (diff+' gün sonra');
  if (diff < -1 && diff >= -7) return lang==='en' ? (Math.abs(diff)+' days ago') : (Math.abs(diff)+' gün önce');
  return fmtDateShort(iso);
}

const AVATAR_COLORS = ['#4f46e5','#0891b2','#16a34a','#d97706','#db2777','#7c3aed','#0d9488','#dc2626','#2563eb','#65a30d'];
function avatarColor(id) { let h=0; const s=String(id); for (let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return AVATAR_COLORS[h % AVATAR_COLORS.length]; }
function initials(name) { const p = (name||'').trim().split(/\s+/); return ((p[0]||'')[0]||'').toUpperCase() + ((p[p.length-1]||'')[0]||'').toUpperCase(); }
function avatarHTML(member, cls) {
  return '<span class="avatar '+(cls||'')+'" style="background:'+avatarColor(member.id)+'">'+esc(initials(member.name))+'</span>';
}
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // karışabilecek karakterler (0,O,1,I) çıkarıldı
  let code = '';
  for (let i=0;i<8;i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}

/* ---------- Constants ---------- */
const ROLES = ['Başkan','Başkan Yardımcısı','Yönetim Kurulu','Sekreter','Sayman','Etkinlik Sorumlusu','Sosyal Medya','Üye'];
const TASK_STATUS_KEYS = ['pending','in_progress','completed'];
function taskStatusInfo(status) {
  const map = {
    pending:     { label: T('status_pending'),     badge: 'b-gray' },
    in_progress: { label: T('status_in_progress'), badge: 'b-info' },
    completed:   { label: T('status_completed'),   badge: 'b-success' },
  };
  return map[status] || map.pending;
}
function attInfo(status) {
  const map = {
    present: { label: T('att_present'), badge: 'b-success' },
    absent:  { label: T('att_absent'),  badge: 'b-danger' },
    excused: { label: T('att_excused'), badge: 'b-warning' },
  };
  return map[status];
}

/* ---------- Global state ---------- */
let state = null;          // { clubId, clubName, clubInviteCode, currentUserId, currentView, members, tasks, events, attendance, units }
let subView = null;        // {type:'member', id}
let taskFilter = 'all';
let taskUnitFilter = 'all';   // 'all' | 'none' | unitId
let eventUnitFilter = 'all';  // 'all' | 'none' | unitId
let attendanceEventId = null;

let authUser = null;       // Firebase User (firebase.auth().currentUser) ya da null
let myClubs = [];          // [{club_id, name, role, isAdmin}]
let activeClubId = null;
let pendingJoinCode = null;

let authMode = 'login';    // 'login' | 'signup'
let authError = '';
let authLoading = false;

let clubGateTab = 'join';  // 'join' | 'create'
let clubGateError = '';
let clubGateLoading = false;

/* platformAdmins/{uid} belgesinin varlığı: sadece Firebase Console'dan elle
   eklenir, hiçbir client kod yolu kendini bu role atayamaz (bkz. firestore.rules). */
let isPlatformAdminUser = false;
let platformAdminMode = false;
let platformAdminClubs = null;

/* ---------- Toast ---------- */
let toastTimer=null;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Selectors (pure, read from already-loaded state) ---------- */
const getMember = (id) => state.members.find(x => x.id === id);
const currentUser = () => getMember(state.currentUserId) || state.members[0];
const isAdmin = () => !!(currentUser() && currentUser().isAdmin);
const activeMembers = () => state.members.filter(m => m.active);
const getUnit = (id) => id ? state.units.find(u => u.id === id) : null;
const myUnitId = () => { const cu = currentUser(); return cu ? cu.unitId : null; };
const amUnitHead = () => { const cu = currentUser(); return !!(cu && cu.isUnitHead && cu.unitId); };
const isViceAdmin = () => { const cu = currentUser(); return !!(cu && cu.role === 'Başkan Yardımcısı'); };
// Görev/etkinlik yönetiminde Başkan Yardımcısı, birim sınırı olmaksızın Başkan'la aynı yetkiye sahiptir.
const canManageAllTasksEvents = () => isAdmin() || isViceAdmin();
function canManageMember(m) {
  if (isAdmin()) return true;
  if (!amUnitHead()) return false;
  return m.unitId === myUnitId() || m.unitId === null;
}
function canManageTask(t) {
  return canManageAllTasksEvents() || (amUnitHead() && t.unitId === myUnitId());
}
function canManageEvent(ev) {
  return canManageAllTasksEvents() || (amUnitHead() && ev.unitId === myUnitId());
}
// Veri yedeği: sıradan üyeler alamaz. Birim başkanı sadece kendi biriminin
// yedeğini alabilir; Başkan/Başkan Yardımcısı istediği birimi (ya da tüm
// kulübü) seçip alabilir.
function canExportData() { return isAdmin() || isViceAdmin() || amUnitHead(); }
function canPickExportUnit() { return isAdmin() || isViceAdmin(); }

function isOverdue(t) { return t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < startOfToday(); }
function effectiveStatusBadge(t) {
  if (isOverdue(t)) return { label: T('status_overdue'), badge: 'b-danger' };
  return taskStatusInfo(t.status);
}
function memberAttendance(memberId) {
  let present=0, absent=0, excused=0;
  Object.keys(state.attendance).forEach(evId => {
    const rec = state.attendance[evId][memberId];
    if (!rec) return;
    if (rec.status==='present') present++;
    else if (rec.status==='absent') absent++;
    else if (rec.status==='excused') excused++;
  });
  const total = present+absent+excused;
  const rate = total ? Math.round(present/total*100) : null;
  return { present, absent, excused, total, rate };
}
function eventIsPast(ev) { return new Date(ev.datetime) < new Date(); }

/* ---------- Firestore doc -> JS shape mappers ---------- */
function rowToMember(doc) { const d = doc.data(); return { id: doc.id, name: d.name, email: d.email, role: d.role, isAdmin: !!d.isAdmin, active: !!d.active, joinedAt: d.joinedAt, unitId: d.unitId||null, isUnitHead: !!d.isUnitHead }; }
function rowToTask(doc) { const d = doc.data(); return { id: doc.id, title: d.title, desc: d.desc, assigneeId: d.assigneeId||null, dueDate: d.dueDate||null, status: d.status, completedAt: d.completedAt||null, createdById: d.createdById, createdAt: d.createdAt, unitId: d.unitId||null }; }
function rowToEvent(doc) { const d = doc.data(); return { id: doc.id, title: d.title, desc: d.desc, datetime: d.datetime, location: d.location, createdById: d.createdById, unitId: d.unitId||null }; }
function rowToUnit(doc) { const d = doc.data(); return { id: doc.id, name: d.name, iconUrl: d.iconUrl||null }; }

/* ---------- Görsel işleme (Firebase Storage kullanılmıyor — Blaze plan/kredi
   kartı gerektirmesin diye görseller küçültülüp doğrudan Firestore belgesine
   base64 metin olarak kaydediliyor; Firestore belge sınırı 1MB olduğu için
   küçük boyuta ve düşük kaliteye zorluyoruz) ---------- */
function resizeImageToDataURL(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) { reject(new Error(T('image_only'))); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(T('file_read_failed')));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(T('image_open_failed')));
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; } }
        else { if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
async function processImageForFirestore(file) {
  let quality = 0.75;
  let dataUrl = await resizeImageToDataURL(file, 220, quality);
  while (dataUrl.length > 350000 && quality > 0.25) {
    quality -= 0.15;
    dataUrl = await resizeImageToDataURL(file, 220, quality);
  }
  if (dataUrl.length > 450000) throw new Error(T('image_too_complex'));
  return dataUrl;
}

/* ---------- Firestore data layer ---------- */
function clubRef(clubId) { return db.collection('clubs').doc(clubId); }

async function refreshMyClubs() {
  const snap = await db.collectionGroup('members').where('uid', '==', authUser.uid).get();
  const rows = snap.docs.filter(d => d.data().active);
  myClubs = await Promise.all(rows.map(async d => {
    const clubId = d.ref.parent.parent.id;
    const data = d.data();
    const cSnap = await clubRef(clubId).get();
    return { club_id: clubId, name: cSnap.exists ? cSnap.data().name : T('default_club_fallback'), role: data.role, isAdmin: !!data.isAdmin };
  }));
}

async function loadClubData(clubId) {
  const [membersSnap, tasksSnap, eventsSnap, unitsSnap, clubSnap] = await Promise.all([
    clubRef(clubId).collection('members').get(),
    clubRef(clubId).collection('tasks').get(),
    clubRef(clubId).collection('events').get(),
    clubRef(clubId).collection('units').get(),
    clubRef(clubId).get(),
  ]);

  const members = membersSnap.docs.map(rowToMember);
  const tasks = tasksSnap.docs.map(rowToTask);
  const events = eventsSnap.docs.map(rowToEvent);
  const units = unitsSnap.docs.map(rowToUnit);

  const attendance = {};
  await Promise.all(eventsSnap.docs.map(async d => {
    const attSnap = await clubRef(clubId).collection('events').doc(d.id).collection('attendance').get();
    if (attSnap.empty) return;
    attendance[d.id] = {};
    attSnap.docs.forEach(a => {
      const ad = a.data();
      attendance[d.id][a.id] = { status: ad.status, reason: ad.reason||'', markedById: ad.markedById, markedAt: ad.markedAt };
    });
  }));

  activeClubId = clubId;
  taskFilter = 'all';
  taskUnitFilter = 'all';
  eventUnitFilter = 'all';
  attendanceEventId = null;
  subView = null;
  state = {
    clubId,
    clubName: clubSnap.exists ? clubSnap.data().name : T('default_club_name'),
    clubInviteCode: clubSnap.exists ? clubSnap.data().inviteCode : '',
    clubLogoUrl: clubSnap.exists ? (clubSnap.data().logoUrl || null) : null,
    currentUserId: authUser.uid,
    currentView: 'panel',
    members, tasks, events, attendance, units,
  };
}

async function joinClubWithCode(code) {
  const codeSnap = await db.collection('inviteCodes').doc(code.toUpperCase().trim()).get();
  if (!codeSnap.exists) throw new Error(T('err_invalid_code'));
  const clubId = codeSnap.data().clubId;
  const memberRef = clubRef(clubId).collection('members').doc(authUser.uid);
  const existing = await memberRef.get();
  if (!existing.exists) {
    const displayName = (authUser.email||'Üye').split('@')[0];
    await memberRef.set({ uid: authUser.uid, name: displayName, email: authUser.email, role: 'Üye', isAdmin: false, active: true, joinedAt: toISODate(new Date()), unitId: null, isUnitHead: false });
  }
  activeClubId = clubId;
}

/* ---------- Render root ---------- */
function getTabs() {
  return [
    { id:'panel',    label:T('tab_panel'),      icon:'home' },
    { id:'uyeler',   label:T('tab_members'),    icon:'users' },
    { id:'gorevler', label:T('tab_tasks'),      icon:'clipboard' },
    { id:'etkinlik', label:T('tab_events'),     icon:'calendar' },
    { id:'yoklama',  label:T('tab_attendance'), icon:'checkCircle' },
  ];
}

function renderShellForAuthless() {
  $('#clubName').textContent = T('default_club_name');
  $('#brandLogo').innerHTML = icon('spark');
  $('#settingsBtn').style.display = 'none';
  $('#clubSwitchBox').style.display = 'none';
  $('#tabs').innerHTML = '';
  document.querySelector('.tabbar').style.display = 'none';
}

function render() {
  document.querySelector('.tabbar').style.display = '';
  $('#clubName').textContent = state.clubName || T('default_club_name');
  $('#brandLogo').innerHTML = state.clubLogoUrl
    ? '<img src="'+esc(state.clubLogoUrl)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9px">'
    : icon('spark');
  $('#settingsBtn').innerHTML = icon('settings');
  $('#settingsBtn').style.display = '';
  renderClubSwitch();
  renderTabs();
  const view = $('#view');
  if (subView) { renderSubView(view); }
  else {
    switch (state.currentView) {
      case 'panel': renderPanel(view); break;
      case 'uyeler': renderMembers(view); break;
      case 'gorevler': renderTasks(view); break;
      case 'etkinlik': renderEvents(view); break;
      case 'yoklama': renderAttendance(view); break;
      default: renderPanel(view);
    }
  }
  window.scrollTo(0,0);
}

function renderClubSwitch() {
  const box = $('#clubSwitchBox');
  if (myClubs.length <= 1) { box.style.display = 'none'; return; }
  box.style.display = '';
  const sel = $('#clubSelectEl');
  sel.innerHTML = myClubs.map(c => '<option value="'+c.club_id+'"'+(c.club_id===activeClubId?' selected':'')+'>'+esc(c.name)+'</option>').join('');
}

function renderTabs() {
  $('#tabs').innerHTML = getTabs().map(tb =>
    '<button class="tab'+(state.currentView===tb.id && !subView?' active':'')+'" data-action="tab" data-id="'+tb.id+'">'+icon(tb.icon)+'<span>'+esc(tb.label)+'</span></button>'
  ).join('');
}

/* ===================== AUTH SCREENS ===================== */
function translateAuthError(e) {
  const code = (e && e.code) || '';
  const map = {
    'auth/wrong-password': T('err_wrong_password'),
    'auth/user-not-found': T('err_wrong_password'),
    'auth/invalid-credential': T('err_wrong_password'),
    'auth/email-already-in-use': T('err_email_in_use'),
    'auth/weak-password': T('err_weak_password'),
    'auth/invalid-email': T('err_invalid_email'),
    'auth/too-many-requests': T('err_too_many'),
  };
  return map[code] || (e && e.message) || T('err_generic');
}

function renderAuthScreen() {
  renderShellForAuthless();
  const view = $('#view');
  let h = '';
  h += '<div class="view-head"><div><h2>'+(authMode==='login'?T('auth_login'):T('auth_signup'))+'</h2><div class="sub">'+T('auth_welcome')+'</div></div></div>';
  h += '<div class="card" style="padding:18px">';
  if (authError) h += '<div class="callout" style="margin-bottom:14px;background:var(--danger-weak);border-color:var(--danger);color:var(--danger-ink)">'+icon('alert')+'<div>'+esc(authError)+'</div></div>';
  h += field(T('auth_email'),'<input id="f_authEmail" type="email" placeholder="ornek@kulup.edu" autocomplete="email">');
  h += field(T('auth_password'),'<input id="f_authPass" type="password" placeholder="'+esc(T('auth_password_ph'))+'" autocomplete="'+(authMode==='login'?'current-password':'new-password')+'">');
  h += '<button class="btn primary block" id="authSubmit"'+(authLoading?' disabled':'')+'>'+(authLoading?T('auth_wait'):(authMode==='login'?T('auth_login'):T('auth_signup')))+'</button>';
  h += '<div style="text-align:center;margin-top:14px;font-size:13px;color:var(--muted)">'
     + (authMode==='login' ? T('auth_no_account') : T('auth_have_account'))
     + ' <button class="btn ghost sm" data-action="auth-toggle" style="padding:2px 8px">'+(authMode==='login'?T('auth_signup'):T('auth_login'))+'</button>'
     + '</div>';
  h += '</div>';
  view.innerHTML = h;
  $('#authSubmit').onclick = submitAuthForm;
  ['f_authEmail','f_authPass'].forEach(id => { const el=$('#'+id); el.addEventListener('keydown', e => { if (e.key==='Enter') submitAuthForm(); }); });
}

async function submitAuthForm() {
  const email = $('#f_authEmail').value.trim();
  const pass = $('#f_authPass').value;
  if (!email || !pass) { authError = T('err_email_pass_required'); renderAuthScreen(); return; }
  authLoading = true; authError = ''; renderAuthScreen();
  try {
    if (authMode==='login') {
      await auth.signInWithEmailAndPassword(email, pass);
    } else {
      await auth.createUserWithEmailAndPassword(email, pass);
    }
    // firebase.auth().onAuthStateChanged dinleyicisi oturumu yakalayıp onSessionReady()'yi tetikleyecek
  } catch (e) {
    authLoading = false; authError = translateAuthError(e); renderAuthScreen();
  }
}

/* ===================== CLUB GATE (create/join) ===================== */
function renderClubGate() {
  renderShellForAuthless();
  const view = $('#view');
  let h = '';
  h += '<div class="view-head"><div><h2>'+T('gate_title')+'</h2><div class="sub">'+T('gate_sub')+'</div></div></div>';
  h += '<div class="seg" style="margin-bottom:14px">'
    + '<button class="'+(clubGateTab==='join'?'active':'')+'" data-action="gate-tab" data-id="join">'+T('gate_join_tab')+'</button>'
    + '<button class="'+(clubGateTab==='create'?'active':'')+'" data-action="gate-tab" data-id="create">'+T('gate_create_tab')+'</button>'
    + '</div>';
  h += '<div class="card" style="padding:18px">';
  if (clubGateError) h += '<div class="callout" style="margin-bottom:14px;background:var(--danger-weak);border-color:var(--danger);color:var(--danger-ink)">'+icon('alert')+'<div>'+esc(clubGateError)+'</div></div>';
  h += field(T('gate_name_label'),'<input id="f_gateName" placeholder="'+esc(T('gate_name_ph'))+'">');
  if (clubGateTab==='join') {
    h += field(T('gate_code_label'),'<input id="f_gateCode" placeholder="'+esc(T('gate_code_ph'))+'" style="text-transform:uppercase">');
    h += '<button class="btn primary block" id="gateSubmit"'+(clubGateLoading?' disabled':'')+'>'+(clubGateLoading?T('gate_joining'):T('gate_join_btn'))+'</button>';
  } else {
    h += field(T('gate_clubname_label'),'<input id="f_gateClubName" placeholder="'+esc(T('gate_clubname_ph'))+'">');
    h += '<button class="btn primary block" id="gateSubmit"'+(clubGateLoading?' disabled':'')+'>'+(clubGateLoading?T('gate_creating'):T('gate_create_btn'))+'</button>';
  }
  h += '</div>';
  h += '<div style="text-align:center;margin-top:14px"><button class="btn ghost sm" data-action="logout">'+icon('logOut')+T('gate_logout')+'</button></div>';
  view.innerHTML = h;
  $('#gateSubmit').onclick = submitClubGate;
}

async function submitClubGate() {
  const name = $('#f_gateName').value.trim();
  if (!name) { clubGateError = T('err_name_required'); renderClubGate(); return; }
  if (hasBlockedContent(name)) { clubGateError = T('err_name_not_allowed'); renderClubGate(); return; }
  // Form alanlarını, tüm ekranı yeniden çizen renderClubGate() DOM'u
  // sıfırlamadan ÖNCE okumamız gerekiyor — aksi halde inputlar boş
  // yeniden oluşturulur ve aşağıdaki değerler her zaman boş okunur.
  const code = clubGateTab==='join' ? $('#f_gateCode').value.trim().toUpperCase() : null;
  const clubName = clubGateTab==='create' ? $('#f_gateClubName').value.trim() : null;
  if (clubGateTab==='join' && !code) { clubGateError = T('err_code_required'); renderClubGate(); return; }
  if (clubGateTab==='create' && !clubName) { clubGateError = T('err_clubname_required'); renderClubGate(); return; }
  if (clubGateTab==='create' && hasBlockedContent(clubName)) { clubGateError = T('err_name_not_allowed'); renderClubGate(); return; }
  clubGateLoading = true; clubGateError = ''; renderClubGate();
  try {
    if (clubGateTab==='join') {
      const codeSnap = await db.collection('inviteCodes').doc(code).get();
      if (!codeSnap.exists) throw new Error(T('err_invalid_code'));
      const clubId = codeSnap.data().clubId;
      const memberRef = clubRef(clubId).collection('members').doc(authUser.uid);
      const existing = await memberRef.get();
      if (!existing.exists) {
        await memberRef.set({ uid: authUser.uid, name, email: authUser.email, role: 'Üye', isAdmin: false, active: true, joinedAt: toISODate(new Date()), unitId: null, isUnitHead: false });
      }
      activeClubId = clubId;
    } else {
      const inviteCode = generateInviteCode();
      const newClub = await db.collection('clubs').add({
        name: clubName, createdBy: authUser.uid, inviteCode: inviteCode,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await clubRef(newClub.id).collection('members').doc(authUser.uid).set({
        uid: authUser.uid, name, email: authUser.email, role: 'Başkan', isAdmin: true, active: true, joinedAt: toISODate(new Date()),
        unitId: null, isUnitHead: false,
      });
      await db.collection('inviteCodes').doc(inviteCode).set({ clubId: newClub.id });
      activeClubId = newClub.id;
    }
    await refreshMyClubs();
    await loadClubData(activeClubId);
    clubGateLoading = false;
    render();
  } catch (e) {
    clubGateLoading = false; clubGateError = e.message || T('err_generic2'); renderClubGate();
  }
}

/* ===================== PLATFORM ADMIN (yalnızca platformAdmins/{uid} kaydı olan hesap) =====================
   Bu, kulüp bazlı "Başkan" yetkisinden tamamen ayrı: platform sahibinin (senin)
   tüm kulüpleri görüp gerektiğinde (spam/kötüye kullanım) silebilmesi için.
   platformAdmins/{uid} belgesi hiçbir client kod yolundan yazılamaz (bkz.
   firestore.rules "allow write: if false") — sadece Firebase Console'dan elle
   eklenir, kimse kendini bu role atayamaz. */
async function checkPlatformAdmin() {
  if (!authUser) { isPlatformAdminUser = false; }
  else {
    try {
      const snap = await db.collection('platformAdmins').doc(authUser.uid).get();
      isPlatformAdminUser = snap.exists;
    } catch (e) { isPlatformAdminUser = false; }
  }
  const btn = document.getElementById('platformAdminBtn');
  if (btn) btn.style.display = isPlatformAdminUser ? '' : 'none';
}

async function openPlatformAdmin() {
  platformAdminMode = true;
  document.querySelector('.tabbar').style.display = 'none';
  $('#clubSwitchBox').style.display = 'none';
  $('#settingsBtn').style.display = 'none';
  $('#clubName').textContent = T('platform_admin_title');
  $('#brandLogo').innerHTML = icon('shield');
  const view = $('#view');
  view.innerHTML = emptyState('spark', T('loading'), T('loading_app'));
  try {
    const snap = await db.collection('clubs').orderBy('createdAt', 'desc').get();
    platformAdminClubs = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
  } catch (e) {
    view.innerHTML = '<div class="empty">'+icon('alert')+'<div class="t">'+T('fatal_title')+'</div><div class="s">'+esc(e.message||T('fatal_conn'))+'</div></div>';
    return;
  }
  renderPlatformAdminList();
}

function closePlatformAdmin() {
  platformAdminMode = false;
  rerenderCurrentScreen();
}

function platformClubRowHTML(c) {
  const created = (c.createdAt && c.createdAt.toDate) ? fmtDate(c.createdAt.toDate().toISOString()) : '—';
  return '<div class="row">'
    + '<span class="avatar" style="background:var(--primary)">'+icon('flag')+'</span>'
    + '<div class="grow"><div class="title">'+esc(c.name||'')+'</div>'
    + '<div class="meta"><span>'+esc(T('platform_admin_created',{date:created}))+'</span><span class="dot"></span><span>'+esc(c.inviteCode||'')+'</span></div></div>'
    + '<button class="btn danger-ghost sm" data-action="platform-admin-delete-club" data-id="'+c.id+'">'+icon('trash')+'</button>'
    + '</div>';
}

function renderPlatformAdminList() {
  const view = $('#view');
  let h = '<div class="view-head"><button class="icon-btn" data-action="platform-admin-close">'+icon('arrowLeft')+'</button>'
    + '<div><h2>'+T('platform_admin_title')+'</h2><div class="sub">'+esc(T('platform_admin_sub',{n:platformAdminClubs.length}))+'</div></div></div>';
  h += '<div class="card"><div class="list">';
  h += platformAdminClubs.length ? platformAdminClubs.map(platformClubRowHTML).join('') : emptyState('users', T('platform_admin_empty'), '');
  h += '</div></div>';
  view.innerHTML = h;
}

/* Firestore alt koleksiyonları silmez (SQL foreign key gibi cascade yok) —
   Cloud Functions olmadığımız için her alt koleksiyonu tek tek client'tan
   siliyoruz. Küçük/orta ölçekli bir kulüp için maliyeti önemsiz. */
async function platformDeleteClub(clubId, inviteCode) {
  const cRef = db.collection('clubs').doc(clubId);
  const eventsSnap = await cRef.collection('events').get();
  const attSnaps = await Promise.all(eventsSnap.docs.map(d => d.ref.collection('attendance').get()));
  await Promise.all(attSnaps.flatMap(s => s.docs.map(d => d.ref.delete())));
  await Promise.all(eventsSnap.docs.map(d => d.ref.delete()));
  const [tasksSnap, unitsSnap, membersSnap] = await Promise.all([
    cRef.collection('tasks').get(), cRef.collection('units').get(), cRef.collection('members').get(),
  ]);
  await Promise.all(tasksSnap.docs.map(d => d.ref.delete()));
  await Promise.all(unitsSnap.docs.map(d => d.ref.delete()));
  await Promise.all(membersSnap.docs.map(d => d.ref.delete()));
  if (inviteCode) { try { await db.collection('inviteCodes').doc(inviteCode).delete(); } catch (e) {} }
  await cRef.delete();
}

/* ===================== PANEL (Dashboard) ===================== */
function renderPanel(view) {
  const cu = currentUser();
  const openTasks = state.tasks.filter(t => t.status!=='completed');
  const overdue = state.tasks.filter(isOverdue);
  const upcomingEvents = state.events.filter(e => !eventIsPast(e)).sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const weekEvents = upcomingEvents.filter(e => new Date(e.datetime) <= daysFromNow(7));
  const myTasks = state.tasks.filter(t => t.assigneeId===cu.id && t.status!=='completed')
    .sort((a,b)=> (a.dueDate||'').localeCompare(b.dueDate||''));

  let h = '';
  h += '<div class="view-head"><div><h2>'+esc(T('panel_hello',{name:cu.name.split(' ')[0]}))+'</h2><div class="sub">'+esc(roleLabel(cu.role))+(isAdmin()?' · '+esc(T('panel_admin_view')):'')+'</div></div></div>';

  h += '<div class="stat-grid">'
    + statTile(activeMembers().length, T('stat_active_members'), 'users', 'i-primary')
    + statTile(openTasks.length, T('stat_open_tasks'), 'clipboard', 'i-info')
    + statTile(weekEvents.length, T('stat_week_events'), 'calendar', 'i-success')
    + statTile(overdue.length, T('stat_overdue'), 'alert', overdue.length?'i-danger':'i-success')
    + '</div>';

  h += '<div class="section-title">'+T('sec_my_upcoming_tasks')+'</div>';
  h += '<div class="card"><div class="list">';
  if (myTasks.length) {
    h += myTasks.slice(0,5).map(t => taskRow(t, {compact:true})).join('');
  } else {
    h += emptyState('checkCircle', T('empty_tasks_title'), T('empty_tasks_sub'));
  }
  h += '</div></div>';

  h += '<div class="section-title">'+T('sec_upcoming_events')+'</div>';
  h += '<div class="card"><div class="list">';
  if (upcomingEvents.length) {
    h += upcomingEvents.slice(0,4).map(e => eventRow(e, {compact:true})).join('');
  } else {
    h += emptyState('calendar', T('empty_events_title'), T('empty_events_sub'));
  }
  h += '</div></div>';

  if (isAdmin() && overdue.length) {
    h += '<div class="section-title">'+T('sec_overdue_tasks')+'</div>';
    h += '<div class="card"><div class="list">' + overdue.map(t=>taskRow(t,{compact:true})).join('') + '</div></div>';
  }

  view.innerHTML = h;
}
function statTile(n, label, ic, cls) {
  return '<div class="stat"><div class="chip '+cls+'">'+icon(ic)+'</div><div class="n">'+n+'</div><div class="l">'+esc(label)+'</div></div>';
}
function emptyState(ic, t, s) {
  return '<div class="empty">'+icon(ic)+'<div class="t">'+esc(t)+'</div><div class="s">'+esc(s)+'</div></div>';
}

/* ===================== MEMBERS ===================== */
function memberRowHTML(m) {
  const att = memberAttendance(m.id);
  return '<div class="row clickable" data-action="member-open" data-id="'+m.id+'">'
    + avatarHTML(m)
    + '<div class="grow"><div class="title">'+esc(m.name)+(m.active?'':' <span class="badge b-gray">'+esc(T('badge_inactive'))+'</span>')+'</div>'
    + '<div class="meta"><span>'+esc(roleLabel(m.role))+'</span>'
    + (m.isAdmin?'<span class="dot"></span><span class="badge b-primary"><span class="bd"></span>'+esc(T('badge_admin'))+'</span>':'')
    + (m.isUnitHead?'<span class="dot"></span><span class="badge b-warning"><span class="bd"></span>'+esc(T('badge_unit_head'))+'</span>':'')
    + (att.total?'<span class="dot"></span><span>'+esc(T('attendance_rate',{rate:att.rate}))+'</span>':'')
    + '</div></div>'
    + '<div class="actions">'+icon('arrowLeft','')+'</div>'
    + '</div>';
}
function sortMembers(list) { return list.slice().sort((a,b)=> (b.active-a.active) || ROLES.indexOf(a.role)-ROLES.indexOf(b.role)); }

function rotateBackArrows(h) {
  return h.replace(/<svg viewBox="0 0 24 24"[^>]*>\s*<path d="M19 12H5M12 19l-7-7 7-7"\/><\/svg>/g,
    '<svg viewBox="0 0 24 24" fill="none" stroke="#c3c8d1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(180deg);width:18px;height:18px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>');
}
function unitRowHTML(u) {
  const count = state.members.filter(m=>m.unitId===u.id).length;
  const headCount = state.members.filter(m=>m.unitId===u.id && m.isUnitHead).length;
  const avatar = u.iconUrl
    ? '<span class="avatar" style="background:var(--primary);overflow:hidden"><img src="'+esc(u.iconUrl)+'" style="width:100%;height:100%;object-fit:cover"></span>'
    : '<span class="avatar" style="background:var(--primary)">'+icon('flag')+'</span>';
  return '<div class="row clickable" data-action="unit-open" data-id="'+u.id+'">'
    + avatar
    + '<div class="grow"><div class="title">'+esc(u.name)+'</div>'
    + '<div class="meta"><span>'+esc(T('unit_members_count',{n:count}))+'</span>'+(headCount?'<span class="dot"></span><span>'+esc(T('unit_heads_count',{n:headCount}))+'</span>':'')+'</div></div>'
    + '<div class="actions">'+icon('arrowLeft','')+'</div>'
    + '</div>';
}

function renderMembers(view) {
  let h = '';
  h += '<div class="view-head"><div><h2>'+T('members_title')+'</h2><div class="sub">'+esc(T('members_sub',{active:activeMembers().length, total:state.members.length}))+'</div></div><div class="spacer"></div>';
  if (isAdmin()) h += '<button class="btn" data-action="unit-add">'+icon('flag')+T('btn_add_unit')+'</button>&nbsp;';
  if (isAdmin()) h += '<button class="btn primary" data-action="settings-open">'+icon('mail')+T('btn_invite')+'</button>';
  h += '</div>';

  if (state.units.length) {
    h += '<div class="section-title">'+T('sec_units')+'</div>';
    h += '<div class="card"><div class="list">' + state.units.map(unitRowHTML).join('') + '</div></div>';
  }

  h += '<div class="section-title">'+T('sec_unassigned')+'</div>';
  const unassigned = sortMembers(state.members.filter(m=>!m.unitId));
  h += '<div class="card"><div class="list">';
  h += unassigned.length ? unassigned.map(memberRowHTML).join('') : emptyState('users', T('empty_all_assigned'), '');
  h += '</div></div>';

  view.innerHTML = rotateBackArrows(h);
}

function renderUnitDetail(view, id) {
  const u = getUnit(id);
  if (!u) { subView=null; return renderMembers(view); }
  const members = sortMembers(state.members.filter(m=>m.unitId===u.id));
  let h = '';
  h += '<div class="view-head"><button class="icon-btn" data-action="back">'+icon('arrowLeft')+'</button><div><h2>'+esc(u.name)+'</h2><div class="sub">'+esc(T('unit_members_count',{n:members.length}))+'</div></div><div class="spacer"></div>';
  if (isAdmin()) h += '<button class="btn sm" data-action="unit-edit" data-id="'+u.id+'">'+icon('edit')+T('btn_edit')+'</button>';
  h += '</div>';
  h += '<div class="card"><div class="list">';
  h += members.length ? members.map(memberRowHTML).join('') : emptyState('users', T('empty_unit_no_members'), T('empty_unit_no_members_sub'));
  h += '</div></div>';
  view.innerHTML = rotateBackArrows(h);
}

function renderMemberDetail(view, id) {
  const m = getMember(id);
  if (!m) { subView=null; return renderMembers(view); }
  const att = memberAttendance(id);
  const theirTasks = state.tasks.filter(t=>t.assigneeId===id);
  const openT = theirTasks.filter(t=>t.status!=='completed');
  let h = '';
  h += '<div class="view-head"><button class="icon-btn" data-action="back">'+icon('arrowLeft')+'</button><div><h2>'+T('member_profile')+'</h2></div></div>';
  h += '<div class="card" style="padding:18px"><div style="display:flex;gap:14px;align-items:center">'
     + avatarHTML(m).replace('class="avatar"','class="avatar" style="width:56px;height:56px;border-radius:16px;font-size:20px;background:'+avatarColor(m.id)+'"')
     + '<div class="grow"><div style="font-size:19px;font-weight:750">'+esc(m.name)+'</div>'
     + '<div class="meta" style="margin-top:4px">'+esc(roleLabel(m.role))+(m.isAdmin?' · <span class="badge b-primary" style="margin-left:4px"><span class="bd"></span>'+esc(T('badge_admin'))+'</span>':'')+(m.isUnitHead?' · <span class="badge b-warning" style="margin-left:4px"><span class="bd"></span>'+esc(T('badge_unit_head'))+'</span>':'')+'</div></div>';
  if (canManageMember(m)) h += '<button class="btn sm" data-action="member-edit" data-id="'+m.id+'">'+icon('edit')+T('btn_edit')+'</button>';
  h += '</div>';
  h += '<div style="margin-top:16px">'
     + '<div class="kv"><span class="k">'+icon('mail')+' '+T('kv_email')+'</span><span class="v">'+esc(m.email||'—')+'</span></div>'
     + '<div class="kv"><span class="k">'+T('kv_status')+'</span><span class="v">'+(m.active?'<span class="badge b-success"><span class="bd"></span>'+esc(T('status_active'))+'</span>':'<span class="badge b-gray">'+esc(T('badge_inactive'))+'</span>')+'</span></div>'
     + '<div class="kv"><span class="k">'+T('kv_unit')+'</span><span class="v">'+(getUnit(m.unitId)?esc(getUnit(m.unitId).name):T('unit_none'))+'</span></div>'
     + '<div class="kv"><span class="k">'+T('kv_joined')+'</span><span class="v">'+fmtDate(m.joinedAt)+'</span></div>'
     + '</div></div>';

  h += '<div class="section-title">'+T('sec_attendance_stats')+'</div>';
  h += '<div class="card" style="padding:16px">';
  if (att.total) {
    h += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px"><div style="font-size:28px;font-weight:800">%'+att.rate+'</div><div class="meta">'+esc(T('att_marked_count',{n:att.total}))+'</div></div>';
    h += '<div class="meter"><span style="width:'+att.rate+'%;background:'+(att.rate>=70?'var(--success)':att.rate>=40?'var(--warning)':'var(--danger)')+'"></span></div>';
    h += '<div class="pill-row" style="margin-top:12px">'
       + '<span class="badge b-success"><span class="bd"></span>'+esc(T('att_present'))+' '+att.present+'</span>'
       + '<span class="badge b-danger"><span class="bd"></span>'+esc(T('att_absent'))+' '+att.absent+'</span>'
       + '<span class="badge b-warning"><span class="bd"></span>'+esc(T('att_excused'))+' '+att.excused+'</span>'
       + '</div>';
  } else {
    h += '<div class="meta">'+T('empty_no_attendance')+'</div>';
  }
  h += '</div>';

  h += '<div class="section-title">'+esc(T('sec_tasks_open',{n:openT.length}))+'</div>';
  h += '<div class="card"><div class="list">';
  h += theirTasks.length ? theirTasks.sort((a,b)=>(a.status==='completed')-(b.status==='completed')).map(t=>taskRow(t,{compact:true,hideAssignee:true})).join('') : emptyState('clipboard', T('empty_task_title'), T('empty_task_member_sub'));
  h += '</div></div>';

  view.innerHTML = h;
}

/* ===================== TASKS ===================== */
function renderTasks(view) {
  const cu = currentUser();
  let h = '';
  h += '<div class="view-head"><div><h2>'+T('tasks_title')+'</h2><div class="sub">'+esc(T('tasks_sub',{n:state.tasks.filter(t=>t.status!=='completed').length}))+'</div></div><div class="spacer"></div>';
  if (canManageAllTasksEvents() || amUnitHead()) h += '<button class="btn primary" data-action="task-add">'+icon('plus')+T('btn_task')+'</button>';
  h += '</div>';

  h += '<div class="seg" style="margin-bottom:14px">'
    + segBtn('all',T('seg_all'),taskFilter)
    + segBtn('mine',T('seg_mine'),taskFilter)
    + segBtn('open',T('seg_open'),taskFilter)
    + segBtn('overdue',T('seg_overdue'),taskFilter)
    + segBtn('completed',T('seg_completed'),taskFilter)
    + '</div>';

  if (state.units.length) {
    h += '<div class="field" style="margin-bottom:14px"><label>'+T('filter_unit_label')+'</label><select id="taskUnitFilterSel" data-action="task-unit-filter-change">'
      + '<option value="all"'+(taskUnitFilter==='all'?' selected':'')+'>'+T('filter_all_units')+'</option>'
      + '<option value="none"'+(taskUnitFilter==='none'?' selected':'')+'>'+T('filter_clubwide')+'</option>'
      + state.units.map(u=>'<option value="'+u.id+'"'+(taskUnitFilter===u.id?' selected':'')+'>'+esc(u.name)+'</option>').join('')
      + '</select></div>';
  }

  let list = state.tasks.slice();
  if (taskFilter==='mine') list = list.filter(t=>t.assigneeId===cu.id);
  else if (taskFilter==='open') list = list.filter(t=>t.status!=='completed');
  else if (taskFilter==='overdue') list = list.filter(isOverdue);
  else if (taskFilter==='completed') list = list.filter(t=>t.status==='completed');
  if (taskUnitFilter==='none') list = list.filter(t=>!t.unitId);
  else if (taskUnitFilter!=='all') list = list.filter(t=>t.unitId===taskUnitFilter);
  list.sort((a,b)=>{
    if ((a.status==='completed')!==(b.status==='completed')) return a.status==='completed'?1:-1;
    if (isOverdue(a)!==isOverdue(b)) return isOverdue(a)?-1:1;
    return (a.dueDate||'9999').localeCompare(b.dueDate||'9999');
  });

  h += '<div class="card"><div class="list">';
  h += list.length ? list.map(t=>taskRow(t,{})).join('') : emptyState('clipboard', T('empty_task_title'), T('empty_task_filter_sub'));
  h += '</div></div>';
  view.innerHTML = h;
}
function segBtn(id,label,cur){ return '<button class="'+(cur===id?'active':'')+'" data-action="task-filter" data-id="'+id+'">'+esc(label)+'</button>'; }

function taskRow(t, opts) {
  opts = opts||{};
  const cu = currentUser();
  const a = getMember(t.assigneeId);
  const sb = effectiveStatusBadge(t);
  const canComplete = t.status!=='completed' && (t.assigneeId===cu.id || isAdmin());
  let meta = '';
  if (t.unitId && getUnit(t.unitId)) meta += '<span class="badge b-info" style="margin-right:2px"><span class="bd"></span>'+esc(getUnit(t.unitId).name)+'</span><span class="dot"></span>';
  if (!opts.hideAssignee && a) meta += '<span>'+esc(a.name)+'</span><span class="dot"></span>';
  if (t.status==='completed' && t.completedAt) meta += '<span>'+icon('check')+' '+esc(T('task_completed_at',{date:fmtDateTime(t.completedAt)}))+'</span>';
  else meta += '<span'+(isOverdue(t)?' style="color:var(--danger);font-weight:650"':'')+'>'+esc(T('task_due',{rel:relDays(t.dueDate)}))+'</span>';

  let actions = '';
  if (canComplete) actions += '<button class="btn success sm" data-action="task-complete" data-id="'+t.id+'" title="'+esc(T('status_completed'))+'">'+icon('check')+'</button>';
  if (canManageTask(t)) {
    actions += '<button class="icon-btn" style="width:34px;height:34px" data-action="task-edit" data-id="'+t.id+'" title="'+esc(T('btn_edit'))+'">'+icon('edit')+'</button>';
  }

  return '<div class="row">'
    + '<div class="grow"><div class="title" style="'+(t.status==='completed'?'text-decoration:line-through;color:var(--muted)':'')+'">'+esc(t.title)+'</div>'
    + '<div class="meta">'+meta+'</div></div>'
    + '<div class="actions"><span class="badge '+sb.badge+'"><span class="bd"></span>'+sb.label+'</span>'+actions+'</div>'
    + '</div>';
}

/* ===================== EVENTS ===================== */
function renderEvents(view) {
  let h = '';
  h += '<div class="view-head"><div><h2>'+T('events_title')+'</h2><div class="sub">'+esc(T('events_sub',{n:state.events.filter(e=>!eventIsPast(e)).length}))+'</div></div><div class="spacer"></div>';
  if (canManageAllTasksEvents() || amUnitHead()) h += '<button class="btn primary" data-action="event-add">'+icon('plus')+T('btn_event')+'</button>';
  h += '</div>';

  if (state.units.length) {
    h += '<div class="field" style="margin-bottom:14px"><label>'+T('filter_unit_label')+'</label><select id="eventUnitFilterSel" data-action="event-unit-filter-change">'
      + '<option value="all"'+(eventUnitFilter==='all'?' selected':'')+'>'+T('filter_all_units')+'</option>'
      + '<option value="none"'+(eventUnitFilter==='none'?' selected':'')+'>'+T('filter_clubwide')+'</option>'
      + state.units.map(u=>'<option value="'+u.id+'"'+(eventUnitFilter===u.id?' selected':'')+'>'+esc(u.name)+'</option>').join('')
      + '</select></div>';
  }

  let events = state.events;
  if (eventUnitFilter==='none') events = events.filter(e=>!e.unitId);
  else if (eventUnitFilter!=='all') events = events.filter(e=>e.unitId===eventUnitFilter);

  const upcoming = events.filter(e=>!eventIsPast(e)).sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const past = events.filter(eventIsPast).sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));

  h += '<div class="section-title">'+T('sec_upcoming')+'</div><div class="card"><div class="list">';
  h += upcoming.length ? upcoming.map(e=>eventRow(e,{})).join('') : emptyState('calendar', T('empty_event_filter'), T('empty_event_filter_sub'));
  h += '</div></div>';

  if (past.length) {
    h += '<div class="section-title">'+T('sec_past')+'</div><div class="card"><div class="list">';
    h += past.map(e=>eventRow(e,{past:true})).join('');
    h += '</div></div>';
  }
  view.innerHTML = h;
}
function eventRow(ev, opts) {
  opts = opts||{};
  const d = new Date(ev.datetime);
  const att = state.attendance[ev.id];
  let markedCount = att ? Object.keys(att).length : 0;
  let presentCount = att ? Object.values(att).filter(x=>x.status==='present').length : 0;
  const dateBox = '<div style="width:46px;text-align:center;flex-shrink:0"><div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase">'+monthsList()[d.getMonth()]+'</div><div style="font-size:20px;font-weight:800;line-height:1">'+d.getDate()+'</div></div>';
  let meta = '';
  if (ev.unitId && getUnit(ev.unitId)) meta += '<span class="badge b-info"><span class="bd"></span>'+esc(getUnit(ev.unitId).name)+'</span><span class="dot"></span>';
  meta += '<span>'+fmtDayName(ev.datetime)+' · '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'</span>';
  if (ev.location) meta += '<span class="dot"></span><span>'+esc(ev.location)+'</span>';
  if (opts.past && markedCount) meta += '<span class="dot"></span><span>'+esc(T('event_attendance_count',{present:presentCount, total:markedCount}))+'</span>';

  let actions = '';
  if (canManageEvent(ev) && !opts.compact) {
    actions += '<button class="btn sm" data-action="event-attendance" data-id="'+ev.id+'">'+icon('checkCircle')+T('btn_attendance')+'</button>';
    actions += '<button class="icon-btn" style="width:34px;height:34px" data-action="event-edit" data-id="'+ev.id+'" title="'+esc(T('btn_edit'))+'">'+icon('edit')+'</button>';
  }
  return '<div class="row">'+dateBox
    + '<div class="grow"><div class="title">'+esc(ev.title)+'</div><div class="meta">'+meta+'</div></div>'
    + '<div class="actions">'+(!opts.past?'<span class="badge b-primary"><span class="bd"></span>'+relDays(ev.datetime)+'</span>':'')+actions+'</div>'
    + '</div>';
}

/* ===================== ATTENDANCE ===================== */
function renderAttendance(view) {
  if (!attendanceEventId || !state.events.find(e=>e.id===attendanceEventId)) {
    const sorted = state.events.slice().sort((a,b)=>Math.abs(new Date(a.datetime)-new Date())-Math.abs(new Date(b.datetime)-new Date()));
    attendanceEventId = sorted.length ? sorted[0].id : null;
  }
  let h = '';
  h += '<div class="view-head"><div><h2>'+T('attendance_title')+'</h2><div class="sub">'+T('attendance_sub')+'</div></div></div>';

  if (!state.events.length) { h += '<div class="card"><div class="list">'+emptyState('calendar', T('empty_no_events'), T('empty_no_events_sub'))+'</div></div>'; view.innerHTML=h; return; }

  h += '<div class="field"><label>'+T('field_event')+'</label><select id="attEventSelect" data-action="att-event-change">'
     + state.events.slice().sort((a,b)=>new Date(b.datetime)-new Date(a.datetime)).map(e=>'<option value="'+e.id+'"'+(e.id===attendanceEventId?' selected':'')+'>'+esc(e.title)+' · '+fmtDateShort(e.datetime)+'</option>').join('')
     + '</select></div>';

  const ev = state.events.find(e=>e.id===attendanceEventId);
  const att = state.attendance[ev.id] || {};
  const list = activeMembers();
  let present=0,absent=0,excused=0,unmarked=0;
  list.forEach(m=>{ const r=att[m.id]; if(!r) unmarked++; else if(r.status==='present')present++; else if(r.status==='absent')absent++; else excused++; });

  h += '<div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px">'
    + statTile(present, T('att_present'), 'check', 'i-success')
    + statTile(absent, T('att_absent'), 'x', 'i-danger')
    + statTile(excused, T('att_excused'), 'info', 'i-warning')
    + statTile(unmarked, T('stat_unmarked'), 'users', 'i-primary')
    + '</div>';

  const canMark = canManageEvent(ev);
  if (!canMark) h += '<div class="callout" style="margin-bottom:14px">'+icon('info')+'<div>'+T('callout_mark_restricted')+'</div></div>';

  h += '<div class="card"><div class="list">';
  h += list.map(m=>{
    const r = att[m.id]; const st = r?r.status:null;
    let right;
    if (canMark) {
      right = '<div class="att-seg">'
        + '<button class="'+(st==='present'?'on present':'')+'" data-action="att-set" data-mid="'+m.id+'" data-status="present">'+esc(T('att_present'))+'</button>'
        + '<button class="'+(st==='absent'?'on absent':'')+'" data-action="att-set" data-mid="'+m.id+'" data-status="absent">'+esc(T('att_absent'))+'</button>'
        + '<button class="'+(st==='excused'?'on excused':'')+'" data-action="att-set" data-mid="'+m.id+'" data-status="excused">'+esc(T('att_seg_excused'))+'</button>'
        + '</div>';
    } else {
      right = st ? '<span class="badge '+attInfo(st).badge+'"><span class="bd"></span>'+esc(attInfo(st).label)+'</span>' : '<span class="badge b-gray">—</span>';
    }
    const reasonLine = (r && r.reason) ? '<div class="meta" style="margin-top:4px;color:var(--warning)">'+icon('info')+' '+esc(r.reason)+'</div>' : '';
    return '<div class="att-row">'+avatarHTML(m,'sm')
      + '<div class="grow"><div class="title" style="font-size:14px">'+esc(m.name)+'</div><div class="meta">'+esc(roleLabel(m.role))+'</div>'+reasonLine+'</div>'
      + right + '</div>';
  }).join('');
  h += '</div></div>';

  const absentees = list.filter(m=> att[m.id] && (att[m.id].status==='absent'||att[m.id].status==='excused'));
  if (absentees.length) {
    h += '<div class="section-title">'+T('sec_absentees')+'</div><div class="card"><div class="list">';
    h += absentees.map(m=>{ const r=att[m.id]; return '<div class="row">'+avatarHTML(m,'sm')+'<div class="grow"><div class="title" style="font-size:14px">'+esc(m.name)+'</div>'+(r.reason?'<div class="meta">'+esc(r.reason)+'</div>':'<div class="meta">'+T('reason_none')+'</div>')+'</div><span class="badge '+attInfo(r.status).badge+'"><span class="bd"></span>'+esc(attInfo(r.status).label)+'</span></div>'; }).join('');
    h += '</div></div>';
  }

  view.innerHTML = h;
}

/* ===================== SUBVIEW ROUTER ===================== */
function renderSubView(view) {
  if (subView.type==='member') renderMemberDetail(view, subView.id);
  else if (subView.type==='unit') renderUnitDetail(view, subView.id);
  else { subView=null; render(); }
}

/* ===================== MODALS ===================== */
const modalRoot = () => $('#modalRoot');
function openModal(html) {
  modalRoot().innerHTML = '<div class="modal-backdrop" data-action="modal-close"></div><div class="modal">'+html+'</div>';
  modalRoot().classList.add('open');
  const firstInput = modalRoot().querySelector('input,select,textarea');
  if (firstInput) setTimeout(()=>firstInput.focus(), 60);
}
function closeModal() { modalRoot().classList.remove('open'); modalRoot().innerHTML=''; }

function confirmModal(title, message, onYes, danger) {
  openModal('<h3>'+esc(title)+'</h3><div class="modal-sub">'+esc(message)+'</div>'
    + '<div class="modal-actions"><button class="btn" data-action="modal-close">'+T('btn_cancel')+'</button>'
    + '<button class="btn '+(danger?'':'primary')+'" id="confirmYes" style="'+(danger?'background:var(--danger);border-color:var(--danger);color:#fff':'')+'">'+T('btn_yes')+'</button></div>');
  $('#confirmYes').onclick = () => { closeModal(); onYes(); };
}

function setModalSubmitLoading(loading, label) {
  const btn = $('#modalSubmit');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = label;
}

/* ---- Member form (düzenleme; üye ekleme davet koduyla yapılır) ---- */
function memberForm(id) {
  const m = getMember(id);
  if (!m) return;
  const admin = isAdmin();
  if (!canManageMember(m)) { toast(T('toast_no_permission_member')); return; }

  let unitOptions = '<option value="">'+T('unit_none')+'</option>';
  if (admin) {
    unitOptions += state.units.map(u=>'<option value="'+u.id+'"'+(m.unitId===u.id?' selected':'')+'>'+esc(u.name)+'</option>').join('');
  } else {
    const myUnit = getUnit(myUnitId());
    if (myUnit) unitOptions += '<option value="'+myUnit.id+'"'+(m.unitId===myUnit.id?' selected':'')+'>'+esc(myUnit.name)+'</option>';
  }

  let html = '<h3>'+T('mf_title_edit')+'</h3><div class="modal-sub">'+(admin?T('mf_sub_admin'):T('mf_sub_unit'))+'</div>';
  html += field(T('field_name'), admin ? ('<input id="f_name" value="'+esc(m.name)+'" placeholder="'+esc(T('field_name_ph'))+'">') : ('<input value="'+esc(m.name)+'" disabled>'));
  html += field(T('kv_email'),'<input value="'+esc(m.email||'')+'" disabled>');
  if (admin) {
    html += field(T('field_role'),'<select id="f_role">'+ROLES.map(r=>'<option value="'+esc(r)+'"'+(m.role===r?' selected':'')+'>'+esc(roleLabel(r))+'</option>').join('')+'</select>');
    html += '<div class="switch-line"><div><div class="lbl">'+T('sw_admin_title')+'</div><div class="desc">'+T('sw_admin_desc')+'</div></div><label class="toggle"><input type="checkbox" id="f_admin"'+(m.isAdmin?' checked':'')+'><span class="slider"></span></label></div>';
    html += '<div class="switch-line"><div><div class="lbl">'+T('sw_active_title')+'</div><div class="desc">'+T('sw_active_desc')+'</div></div><label class="toggle"><input type="checkbox" id="f_active"'+(m.active?' checked':'')+'><span class="slider"></span></label></div>';
  }
  html += field(T('kv_unit'),'<select id="f_unit">'+unitOptions+'</select>');
  html += '<div class="switch-line"><div><div class="lbl">'+T('sw_unit_head_title')+'</div><div class="desc">'+T('sw_unit_head_desc')+'</div></div><label class="toggle"><input type="checkbox" id="f_unitHead"'+(m.isUnitHead?' checked':'')+'><span class="slider"></span></label></div>';
  html += modalActions(T('btn_save'), admin ? ('<button class="btn danger-ghost" data-action="member-delete" data-id="'+m.id+'">'+icon('trash')+T('btn_remove_from_club')+'</button>') : '');

  openModal(html);
  $('#modalSubmit').onclick = async () => {
    const patch = {};
    if (admin) {
      const name = $('#f_name').value.trim();
      if (!name) { toast(T('toast_name_required')); $('#f_name').focus(); return; }
      if (hasBlockedContent(name)) { toast(T('toast_name_not_allowed')); $('#f_name').focus(); return; }
      patch.name = name;
      patch.role = $('#f_role').value;
      patch.isAdmin = $('#f_admin').checked;
      patch.active = $('#f_active').checked;
    }
    patch.unitId = $('#f_unit').value || null;
    patch.isUnitHead = patch.unitId ? $('#f_unitHead').checked : false;
    setModalSubmitLoading(true, T('label_saving'));
    try {
      await clubRef(state.clubId).collection('members').doc(m.id).update(patch);
      Object.assign(m, patch);
      toast(T('toast_member_updated')); closeModal(); render();
    } catch (e) { toast(e.message || T('toast_save_failed')); setModalSubmitLoading(false, T('btn_save')); }
  };
}

/* ---- Task form ---- */
function unitFieldHTML(currentUnitId) {
  if (canManageAllTasksEvents()) {
    return field(T('field_unit_optional'),'<select id="f_unit"><option value="">'+T('filter_clubwide')+'</option>'
      + state.units.map(u=>'<option value="'+u.id+'"'+(currentUnitId===u.id?' selected':'')+'>'+esc(u.name)+'</option>').join('')
      + '</select>');
  }
  const u = getUnit(myUnitId());
  return field(T('kv_unit'), '<input value="'+esc(u?u.name:T('unit_none'))+'" disabled>');
}
function resolvedUnitId() {
  if (canManageAllTasksEvents()) { const el = $('#f_unit'); return el ? (el.value || null) : null; }
  return myUnitId();
}

function taskForm(id) {
  const t = id ? state.tasks.find(x=>x.id===id) : null;
  if (t && !canManageTask(t)) { toast(T('toast_no_permission_task_edit')); return; }
  if (!t && !canManageAllTasksEvents() && !amUnitHead()) { toast(T('toast_no_permission_task_create')); return; }
  const opts = activeMembers().map(mm=>'<option value="'+mm.id+'"'+(t&&t.assigneeId===mm.id?' selected':'')+'>'+esc(mm.name)+'</option>').join('');
  openModal(
    '<h3>'+(t?T('tf_edit'):T('tf_new'))+'</h3><div class="modal-sub">'+T('tf_sub')+'</div>'
    + field(T('field_title'),'<input id="f_title" value="'+esc(t?t.title:'')+'" placeholder="'+esc(T('field_title_ph_task'))+'">')
    + field(T('field_desc'),'<textarea id="f_desc" placeholder="'+esc(T('field_desc_ph'))+'">'+esc(t?t.desc:'')+'</textarea>')
    + '<div class="row-2">'+field(T('field_assignee'),'<select id="f_assignee">'+opts+'</select>')
    + field(T('field_due_date'),'<input id="f_due" type="date" value="'+esc(t?t.dueDate:toISODate(daysFromNow(3)))+'">')+'</div>'
    + (t?field(T('field_status'),'<select id="f_status">'+TASK_STATUS_KEYS.map(k=>'<option value="'+k+'"'+(t.status===k?' selected':'')+'>'+esc(taskStatusInfo(k).label)+'</option>').join('')+'</select>'):'')
    + unitFieldHTML(t?t.unitId:(canManageAllTasksEvents()?null:myUnitId()))
    + modalActions(t?T('btn_save'):T('btn_create'), t?('<button class="btn danger-ghost" data-action="task-delete" data-id="'+t.id+'">'+icon('trash')+T('btn_delete')+'</button>'):'')
  );
  $('#modalSubmit').onclick = async () => {
    const title = $('#f_title').value.trim();
    if (!title) { toast(T('toast_title_required')); return; }
    const unitId = resolvedUnitId();
    setModalSubmitLoading(true, t ? T('label_saving') : T('label_creating'));
    try {
      const tasksCol = clubRef(state.clubId).collection('tasks');
      if (t) {
        const newStatus = $('#f_status').value;
        const patch = {
          title, desc: $('#f_desc').value.trim(), assigneeId: $('#f_assignee').value || null,
          dueDate: $('#f_due').value || null, status: newStatus,
          completedAt: newStatus==='completed' ? (t.status==='completed' ? t.completedAt : new Date().toISOString()) : null,
          unitId,
        };
        await tasksCol.doc(t.id).update(patch);
        Object.assign(t, patch);
        toast(T('toast_task_updated'));
      } else {
        const insertRow = {
          title, desc: $('#f_desc').value.trim(), assigneeId: $('#f_assignee').value || null,
          dueDate: $('#f_due').value || null, status: 'pending', completedAt: null,
          createdById: state.currentUserId, createdAt: new Date().toISOString(),
          unitId,
        };
        const ref = await tasksCol.add(insertRow);
        state.tasks.push(Object.assign({ id: ref.id }, insertRow));
        toast(T('toast_task_created'));
      }
      closeModal(); render();
    } catch (e) { toast(e.message || T('toast_save_failed')); setModalSubmitLoading(false, t?T('btn_save'):T('btn_create')); }
  };
}

/* ---- Event form ---- */
function eventForm(id) {
  const e = id ? state.events.find(x=>x.id===id) : null;
  if (e && !canManageEvent(e)) { toast(T('toast_no_permission_event_edit')); return; }
  if (!e && !canManageAllTasksEvents() && !amUnitHead()) { toast(T('toast_no_permission_event_create')); return; }
  openModal(
    '<h3>'+(e?T('ef_edit'):T('ef_new'))+'</h3><div class="modal-sub">'+T('ef_sub')+'</div>'
    + field(T('field_title'),'<input id="f_title" value="'+esc(e?e.title:'')+'" placeholder="'+esc(T('field_title_ph_event'))+'">')
    + field(T('field_desc'),'<textarea id="f_desc" placeholder="'+esc(T('field_desc_ph'))+'">'+esc(e?e.desc:'')+'</textarea>')
    + '<div class="row-2">'+field(T('field_datetime'),'<input id="f_dt" type="datetime-local" value="'+esc(e?e.datetime:toISODate(daysFromNow(3))+'T18:00')+'">')
    + field(T('field_location'),'<input id="f_loc" value="'+esc(e?e.location:'')+'" placeholder="'+esc(T('field_location_ph'))+'">')+'</div>'
    + unitFieldHTML(e?e.unitId:(canManageAllTasksEvents()?null:myUnitId()))
    + modalActions(e?T('btn_save'):T('btn_create'), e?('<button class="btn danger-ghost" data-action="event-delete" data-id="'+e.id+'">'+icon('trash')+T('btn_delete')+'</button>'):'')
  );
  $('#modalSubmit').onclick = async () => {
    const title = $('#f_title').value.trim();
    if (!title) { toast(T('toast_title_required')); return; }
    const dt = $('#f_dt').value;
    if (!dt) { toast(T('toast_date_required')); return; }
    const patch = { title, desc: $('#f_desc').value.trim(), datetime: dt, location: $('#f_loc').value.trim(), unitId: resolvedUnitId() };
    setModalSubmitLoading(true, e ? T('label_saving') : T('label_creating'));
    try {
      const eventsCol = clubRef(state.clubId).collection('events');
      if (e) {
        await eventsCol.doc(e.id).update(patch);
        Object.assign(e, patch);
        toast(T('toast_event_updated'));
      } else {
        const insertRow = Object.assign({ createdById: state.currentUserId }, patch);
        const ref = await eventsCol.add(insertRow);
        state.events.push(Object.assign({ id: ref.id }, insertRow));
        toast(T('toast_event_created'));
      }
      closeModal(); render();
    } catch (err) { toast(err.message || T('toast_save_failed')); setModalSubmitLoading(false, e?T('btn_save'):T('btn_create')); }
  };
}

/* ---- Unit (birim) form ---- */
function unitForm(id) {
  if (!isAdmin()) { toast(T('toast_no_permission_units')); return; }
  const u = id ? getUnit(id) : null;
  openModal(
    '<h3>'+(u?T('uf_edit'):T('uf_new'))+'</h3><div class="modal-sub">'+T('uf_sub')+'</div>'
    + field(T('field_unit_name'),'<input id="f_unitName" value="'+esc(u?u.name:'')+'" placeholder="'+esc(T('field_unit_name_ph'))+'">')
    + (u ? (
        '<div class="section-title" style="margin-top:6px">'+T('sec_unit_icon')+'</div>'
        + '<div class="pill-row" style="margin-bottom:8px;align-items:center">'
        + (u.iconUrl ? '<img src="'+esc(u.iconUrl)+'" style="width:40px;height:40px;border-radius:9px;object-fit:cover">' : '')
        + '<label class="btn sm" style="cursor:pointer">'+icon('upload')+T('btn_upload_icon')+'<input type="file" id="f_unitIconFile" accept="image/*" style="display:none"></label>'
        + '</div>'
      ) : '<div class="callout" style="margin-bottom:8px">'+icon('info')+'<div>'+T('callout_icon_first_save')+'</div></div>')
    + modalActions(u?T('btn_save'):T('btn_create'), u?('<button class="btn danger-ghost" data-action="unit-delete" data-id="'+u.id+'">'+icon('trash')+T('btn_delete_unit')+'</button>'):'')
  );
  $('#modalSubmit').onclick = async () => {
    const name = $('#f_unitName').value.trim();
    if (!name) { toast(T('toast_unit_name_required')); return; }
    if (hasBlockedContent(name)) { toast(T('toast_name_not_allowed')); return; }
    setModalSubmitLoading(true, u?T('label_saving'):T('label_creating'));
    try {
      if (u) {
        await clubRef(state.clubId).collection('units').doc(u.id).update({ name });
        u.name = name;
        toast(T('toast_unit_updated'));
      } else {
        const ref = await clubRef(state.clubId).collection('units').add({ name, createdBy: state.currentUserId, createdAt: new Date().toISOString() });
        state.units.push({ id: ref.id, name, iconUrl: null });
        toast(T('toast_unit_created'));
      }
      closeModal(); render();
    } catch (e) { toast(e.message || T('toast_save_failed')); setModalSubmitLoading(false, u?T('btn_save'):T('btn_create')); }
  };
  const iconInput = $('#f_unitIconFile');
  if (iconInput) {
    iconInput.addEventListener('change', async () => {
      const file = iconInput.files[0];
      if (!file) return;
      toast(T('toast_icon_processing'));
      try {
        const dataUrl = await processImageForFirestore(file);
        await clubRef(state.clubId).collection('units').doc(u.id).update({ iconUrl: dataUrl });
        u.iconUrl = dataUrl;
        render(); unitForm(u.id); toast(T('toast_icon_updated'));
      } catch (e) { toast(e.message || T('toast_icon_failed')); }
    });
  }
}

/* ---- Attendance reason (for absent/excused) ---- */
function reasonForm(eventId, memberId, status) {
  const m = getMember(memberId);
  const cur = (state.attendance[eventId] && state.attendance[eventId][memberId]) ? state.attendance[eventId][memberId].reason : '';
  openModal(
    '<h3>'+esc(attInfo(status).label)+' · '+esc(m.name)+'</h3><div class="modal-sub">'+T('rf_sub')+'</div>'
    + field(T('field_reason'),'<textarea id="f_reason" placeholder="'+esc(T('field_reason_ph'))+'">'+esc(cur)+'</textarea>')
    + '<div class="modal-actions"><button class="btn" data-action="att-skip-reason" data-eid="'+eventId+'" data-mid="'+memberId+'" data-status="'+status+'">'+T('btn_save_no_reason')+'</button>'
    + '<button class="btn primary" id="modalSubmit">'+T('btn_save')+'</button></div>'
  );
  $('#modalSubmit').onclick = async () => { await setAttendance(eventId, memberId, status, $('#f_reason').value.trim()); closeModal(); };
}

function field(label, inner) { return '<div class="field"><label>'+esc(label)+'</label>'+inner+'</div>'; }
function modalActions(submitLabel, extra) {
  return '<div class="modal-actions">'+(extra||'<button class="btn" data-action="modal-close">Vazgeç</button>')
    + '<button class="btn primary" id="modalSubmit">'+esc(submitLabel)+'</button></div>'
    + (extra? '<div style="margin-top:10px;text-align:center"><button class="btn ghost sm" data-action="modal-close">Vazgeç</button></div>':'');
}

/* ---- Settings (kulüp adı, davet kodu, veri, çıkış) ---- */
function settingsModal() {
  const admin = isAdmin();
  openModal(
    '<h3>'+T('settings_title')+'</h3><div class="modal-sub">'+T('settings_sub')+'</div>'
    + (admin
        ? field(T('field_club_name'),'<input id="f_club" value="'+esc(state.clubName||'')+'" placeholder="'+esc(T('gate_clubname_ph'))+'">')
        : '<div class="kv"><span class="k">'+T('kv_club')+'</span><span class="v">'+esc(state.clubName||'')+'</span></div>')
    + (admin ? (
        '<div class="section-title" style="margin-top:6px">'+T('sec_club_logo')+'</div>'
        + '<div class="pill-row" style="margin-bottom:8px;align-items:center">'
        + (state.clubLogoUrl ? '<img src="'+esc(state.clubLogoUrl)+'" style="width:40px;height:40px;border-radius:9px;object-fit:cover">' : '')
        + '<label class="btn sm" style="cursor:pointer">'+icon('upload')+T('btn_upload_logo')+'<input type="file" id="f_logoFile" accept="image/*" style="display:none"></label>'
        + '</div>'
      ) : '')
    + (admin ? (
        '<div class="section-title" style="margin-top:6px">'+T('sec_invite')+'</div>'
        + field(T('gate_code_label'),'<input id="f_inviteCode" value="'+esc(state.clubInviteCode||'')+'" readonly>')
        + '<div class="pill-row" style="margin-bottom:8px">'
        + '<button class="btn sm" data-action="invite-copy-code">'+icon('copy')+T('btn_copy_code')+'</button>'
        + '<button class="btn sm" data-action="invite-copy-link">'+icon('link')+T('btn_copy_link')+'</button>'
        + '<button class="btn sm danger-ghost" data-action="invite-regenerate">'+icon('key')+T('btn_regen_code')+'</button>'
        + '</div>'
      ) : '')
    + (canExportData() ? (
        '<div class="section-title" style="margin-top:6px">'+T('sec_data')+'</div>'
        + (canPickExportUnit()
            ? field(T('field_export_scope'),'<select id="exportUnitSel"><option value="all">'+T('opt_all_club')+'</option>'+state.units.map(u=>'<option value="'+u.id+'">'+esc(u.name)+'</option>').join('')+'</select>')
            : '')
        + '<div class="pill-row" style="margin-bottom:8px">'
        + '<button class="btn sm" data-action="data-export">'+icon('download')+(canPickExportUnit()?T('btn_export'):T('btn_export_my_unit'))+'</button>'
        + '</div>'
      ) : '')
    + '<div class="callout" style="margin-top:12px">'+icon('info')+'<div>'+T('callout_data_shared')+'</div></div>'
    + '<div class="modal-actions">'
    + (admin ? '<button class="btn primary block" id="modalSubmit">'+T('btn_save')+'</button>' : '<button class="btn block" data-action="modal-close">'+T('btn_close')+'</button>')
    + '</div>'
    + '<div style="text-align:center;margin-top:14px"><button class="btn ghost sm" data-action="logout">'+icon('logOut')+T('gate_logout')+'</button></div>'
  );
  if (admin) {
    $('#modalSubmit').onclick = async () => {
      const name = $('#f_club').value.trim() || T('default_club_name');
      if (hasBlockedContent(name)) { toast(T('toast_name_not_allowed')); return; }
      setModalSubmitLoading(true, T('label_saving'));
      try {
        await clubRef(state.clubId).update({ name });
        state.clubName = name; closeModal(); render(); toast(T('toast_saved'));
        refreshMyClubs().catch(()=>{});
      } catch (e) { toast(e.message || T('toast_save_failed')); setModalSubmitLoading(false, T('btn_save')); }
    };
    const logoInput = $('#f_logoFile');
    logoInput.addEventListener('change', async () => {
      const file = logoInput.files[0];
      if (!file) return;
      toast(T('toast_logo_processing'));
      try {
        const dataUrl = await processImageForFirestore(file);
        await clubRef(state.clubId).update({ logoUrl: dataUrl });
        state.clubLogoUrl = dataUrl;
        render(); settingsModal(); toast(T('toast_logo_updated'));
      } catch (e) { toast(e.message || T('toast_logo_failed')); }
    });
  }
}

/* ---------- Attendance mutation ---------- */
async function setAttendance(eventId, memberId, status, reason) {
  const markedAt = new Date().toISOString();
  try {
    await clubRef(state.clubId).collection('events').doc(eventId).collection('attendance').doc(memberId).set({
      status, reason: reason||'', markedById: state.currentUserId, markedAt,
    });
    if (!state.attendance[eventId]) state.attendance[eventId] = {};
    state.attendance[eventId][memberId] = { status, reason: reason||'', markedById: state.currentUserId, markedAt };
    render();
  } catch (e) { toast(e.message || T('toast_attendance_failed')); }
}

/* ---------- Data export ---------- */
function slugify(s) { return String(s||'birim').toLowerCase().replace(/[^a-z0-9ığüşöç]+/gi,'-').replace(/^-+|-+$/g,'') || 'birim'; }

function buildExportPayload(scope) {
  if (scope === 'all') return state;
  const unit = getUnit(scope);
  const members = state.members.filter(m=>m.unitId===scope);
  const tasks = state.tasks.filter(t=>t.unitId===scope);
  const events = state.events.filter(e=>e.unitId===scope);
  const eventIds = events.map(e=>e.id);
  const attendance = {};
  eventIds.forEach(eid => { if (state.attendance[eid]) attendance[eid] = state.attendance[eid]; });
  return { clubId: state.clubId, clubName: state.clubName, unit: unit?{id:unit.id,name:unit.name}:null, members, tasks, events, attendance };
}

function exportData(scope) {
  scope = scope || 'all';
  const payload = buildExportPayload(scope);
  const unit = scope!=='all' ? getUnit(scope) : null;
  const filename = unit ? ('kulup-takip-'+slugify(unit.name)+'-yedek.json') : 'kulup-takip-yedek.json';
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url); toast(T('toast_backup_downloaded'));
}

/* ---------- Event delegation ---------- */
document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const a = el.getAttribute('data-action');
  const id = el.getAttribute('data-id');
  switch (a) {
    case 'tab': subView=null; state.currentView=id; render(); break;
    case 'back': subView=null; render(); break;
    case 'modal-close': closeModal(); break;

    case 'auth-toggle': authMode = authMode==='login'?'signup':'login'; authError=''; renderAuthScreen(); break;
    case 'gate-tab': clubGateTab = id; clubGateError=''; renderClubGate(); break;
    case 'logout': {
      try { await auth.signOut(); } catch (e) {}
      closeModal();
      break;
    }

    case 'settings-open': settingsModal(); break;

    case 'platform-admin-close': closePlatformAdmin(); break;
    case 'platform-admin-delete-club': {
      const c = (platformAdminClubs||[]).find(x => x.id === id);
      if (!c) break;
      confirmModal(T('confirm_platform_delete_title'), T('confirm_platform_delete_msg',{name:c.name||''}), async () => {
        try {
          await platformDeleteClub(c.id, c.inviteCode);
          platformAdminClubs = platformAdminClubs.filter(x => x.id !== c.id);
          renderPlatformAdminList();
          toast(T('toast_club_deleted'));
        } catch (e) { toast(e.message || T('toast_action_failed')); }
      }, true);
      break;
    }

    case 'unit-add': unitForm(null); break;
    case 'unit-open': subView={type:'unit', id}; render(); break;
    case 'unit-edit': unitForm(id); break;
    case 'unit-delete': {
      confirmModal(T('confirm_delete_unit_title'), T('confirm_delete_unit_msg'), async ()=>{
        try {
          const batch = db.batch();
          state.members.filter(m=>m.unitId===id).forEach(m => batch.update(clubRef(state.clubId).collection('members').doc(m.id), { unitId: null, isUnitHead: false }));
          state.tasks.filter(t=>t.unitId===id).forEach(t => batch.update(clubRef(state.clubId).collection('tasks').doc(t.id), { unitId: null }));
          state.events.filter(ev=>ev.unitId===id).forEach(ev => batch.update(clubRef(state.clubId).collection('events').doc(ev.id), { unitId: null }));
          batch.delete(clubRef(state.clubId).collection('units').doc(id));
          await batch.commit();
          state.units = state.units.filter(u=>u.id!==id);
          state.members.forEach(m=>{ if (m.unitId===id) { m.unitId=null; m.isUnitHead=false; } });
          state.tasks.forEach(t=>{ if (t.unitId===id) t.unitId=null; });
          state.events.forEach(ev=>{ if (ev.unitId===id) ev.unitId=null; });
          closeModal(); render(); toast(T('toast_unit_deleted'));
        } catch (e) { toast(e.message || T('toast_delete_failed')); }
      }, true);
      break;
    }
    case 'invite-copy-code':
      navigator.clipboard.writeText(state.clubInviteCode||'').then(()=>toast(T('toast_code_copied'))).catch(()=>toast(T('toast_copy_failed')));
      break;
    case 'invite-copy-link': {
      const link = location.origin + location.pathname + '?join=' + encodeURIComponent(state.clubInviteCode||'');
      navigator.clipboard.writeText(link).then(()=>toast(T('toast_link_copied'))).catch(()=>toast(T('toast_copy_failed')));
      break;
    }
    case 'invite-regenerate': {
      confirmModal(T('confirm_regen_title'), T('confirm_regen_msg'), async ()=>{
        try {
          const newCode = generateInviteCode();
          const oldCode = state.clubInviteCode;
          await db.collection('inviteCodes').doc(newCode).set({ clubId: state.clubId });
          await clubRef(state.clubId).update({ inviteCode: newCode });
          if (oldCode) db.collection('inviteCodes').doc(oldCode).delete().catch(()=>{});
          state.clubInviteCode = newCode;
          settingsModal(); toast(T('toast_code_regenerated'));
        } catch (e) { toast(e.message || T('toast_action_failed')); }
      }, true);
      break;
    }

    case 'member-edit': closeModal(); memberForm(id); break;
    case 'member-open': subView={type:'member', id}; render(); break;
    case 'member-delete': {
      const m=getMember(id);
      confirmModal(T('confirm_remove_member_title'), T('confirm_remove_member_msg',{name:m.name}), async ()=>{
        try {
          const affected = state.tasks.filter(t=>t.assigneeId===id);
          const batch = db.batch();
          affected.forEach(t => batch.update(clubRef(state.clubId).collection('tasks').doc(t.id), { assigneeId: null }));
          batch.delete(clubRef(state.clubId).collection('members').doc(id));
          await batch.commit();
          state.members = state.members.filter(x=>x.id!==id);
          state.tasks.forEach(t=>{ if(t.assigneeId===id) t.assigneeId=null; });
          subView=null; closeModal(); render(); toast(T('toast_member_removed'));
        } catch (e) { toast(e.message || T('toast_action_failed')); }
      }, true);
      break;
    }

    case 'task-add': taskForm(null); break;
    case 'task-edit': taskForm(id); break;
    case 'task-filter': taskFilter=id; render(); break;
    case 'task-complete': {
      const t=state.tasks.find(x=>x.id===id);
      try {
        const completedAt = new Date().toISOString();
        await clubRef(state.clubId).collection('tasks').doc(id).update({ status:'completed', completedAt });
        t.status='completed'; t.completedAt=completedAt; render(); toast(T('toast_task_completed'));
      } catch (e) { toast(e.message || T('toast_action_failed')); }
      break;
    }
    case 'task-delete': {
      confirmModal(T('confirm_delete_task_title'), T('confirm_delete_task_msg'), async ()=>{
        try {
          await clubRef(state.clubId).collection('tasks').doc(id).delete();
          state.tasks = state.tasks.filter(x=>x.id!==id);
          closeModal(); render(); toast(T('toast_task_deleted'));
        } catch (e) { toast(e.message || T('toast_delete_failed')); }
      }, true);
      break;
    }

    case 'event-add': eventForm(null); break;
    case 'event-edit': eventForm(id); break;
    case 'event-attendance': attendanceEventId=id; state.currentView='yoklama'; subView=null; render(); break;
    case 'event-delete': {
      confirmModal(T('confirm_delete_event_title'), T('confirm_delete_event_msg'), async ()=>{
        try {
          const eventRef = clubRef(state.clubId).collection('events').doc(id);
          const attSnap = await eventRef.collection('attendance').get();
          const batch = db.batch();
          attSnap.docs.forEach(d => batch.delete(d.ref));
          batch.delete(eventRef);
          await batch.commit();
          state.events = state.events.filter(x=>x.id!==id);
          delete state.attendance[id];
          closeModal(); render(); toast(T('toast_event_deleted'));
        } catch (e) { toast(e.message || T('toast_delete_failed')); }
      }, true);
      break;
    }

    case 'att-set': {
      const mid=el.getAttribute('data-mid'); const status=el.getAttribute('data-status');
      if (status==='present') await setAttendance(attendanceEventId, mid, 'present', '');
      else reasonForm(attendanceEventId, mid, status);
      break;
    }
    case 'att-skip-reason': {
      await setAttendance(el.getAttribute('data-eid'), el.getAttribute('data-mid'), el.getAttribute('data-status'), '');
      closeModal(); break;
    }

    case 'data-export': {
      if (!canExportData()) { toast(T('toast_export_no_permission')); break; }
      const sel = $('#exportUnitSel');
      exportData(canPickExportUnit() ? (sel ? sel.value : 'all') : myUnitId());
      break;
    }
  }
});

document.addEventListener('change', async (ev) => {
  const el = ev.target;
  if (el.id === 'clubSelectEl') {
    const newClubId = el.value;
    if (!newClubId || newClubId === activeClubId) return;
    $('#view').innerHTML = emptyState('spark', T('loading'), T('loading_club_switch'));
    try { await loadClubData(newClubId); render(); } catch (e) { toast(T('toast_club_load_failed')); }
  } else if (el.id === 'attEventSelect') { attendanceEventId=el.value; render(); }
  else if (el.id === 'taskUnitFilterSel') { taskUnitFilter=el.value; render(); }
  else if (el.id === 'eventUnitFilterSel') { eventUnitFilter=el.value; render(); }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalRoot().classList.contains('open')) closeModal(); });

$('#settingsBtn').addEventListener('click', settingsModal);
$('#themeBtn').addEventListener('click', toggleTheme);
$('#langBtn').addEventListener('click', toggleLang);
$('#platformAdminBtn').innerHTML = icon('shield');
$('#platformAdminBtn').addEventListener('click', openPlatformAdmin);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

/* ---------- Boot: auth + kulüp seçimi ---------- */
function currentUrlJoinCode() {
  const params = new URLSearchParams(location.search);
  return params.get('join');
}

async function onSessionReady() {
  if (!authUser) {
    state = null; myClubs = []; activeClubId = null;
    isPlatformAdminUser = false; platformAdminMode = false;
    const btn = document.getElementById('platformAdminBtn');
    if (btn) btn.style.display = 'none';
    renderAuthScreen();
    return;
  }
  try {
    await Promise.all([refreshMyClubs(), checkPlatformAdmin()]);
    if (pendingJoinCode) {
      const code = pendingJoinCode; pendingJoinCode = null;
      try { await joinClubWithCode(code); } catch (e) { toast(e.message || T('toast_join_failed')); }
      history.replaceState(null, '', location.pathname);
      await refreshMyClubs();
    }
    if (!myClubs.length) { clubGateError=''; renderClubGate(); return; }
    if (!activeClubId || !myClubs.find(c=>c.club_id===activeClubId)) {
      activeClubId = myClubs[0].club_id;
    }
    await loadClubData(activeClubId);
    render();
  } catch (e) {
    console.error('onSessionReady hatası:', e);
    $('#view').innerHTML = '<div class="empty">'+icon('alert')+'<div class="t">'+T('fatal_title')+'</div><div class="s">'+esc(e.message||T('fatal_conn'))+'</div></div>'
      + '<div style="text-align:center;margin-top:10px"><button class="btn primary sm" onclick="location.reload()">'+T('btn_retry')+'</button></div>';
  }
}

function rerenderCurrentScreen() {
  if (!authUser) { renderAuthScreen(); return; }
  if (platformAdminMode && platformAdminClubs) { $('#clubName').textContent = T('platform_admin_title'); renderPlatformAdminList(); return; }
  if (!state) { if (!myClubs.length) renderClubGate(); return; }
  render();
}

function boot() {
  pendingJoinCode = currentUrlJoinCode();
  auth.onAuthStateChanged((user) => {
    authUser = user;
    onSessionReady();
  });
}

$('#view').innerHTML = emptyState('spark', T('loading'), T('loading_app'));
boot();
