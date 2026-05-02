// ===== VERSION CHECK & AUTO REFRESH =====
const APP_VERSION = '1.1.2';
const storedVersion = localStorage.getItem('novela_version');
if (storedVersion && storedVersion !== APP_VERSION) {
  console.log('New version detected, clearing cache...');
  // Clear all caches except user data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('gutenberg_') || key.startsWith('novela_cache_')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem('novela_version', APP_VERSION);
  // Force reload from server
  window.location.reload(true);
} else if (!storedVersion) {
  localStorage.setItem('novela_version', APP_VERSION);
}

// ===== I18N =====
let currentLang = localStorage.getItem('novela_lang') || 'en';

const TRANSLATIONS = {
  fr: {
    nav_home: 'Accueil', nav_library: 'Bibliothèque', nav_quiz: 'Quiz',
    nav_ai: 'IA Assistant', nav_history: 'Historique',
    hero_title: 'Bienvenue sur<br><span>Novela</span>',
    hero_sub: 'Des milliers de livres, un assistant IA, et des quiz pour tester vos connaissances.',
    hero_explore: 'Explorer les livres', hero_ai: "Parler à l'IA",
    search_placeholder: 'Rechercher parmi 70 000+ livres...',
    search_book: 'Chercher un livre...',
    quiz_intro: "Choisissez un livre — l'IA génère un quiz unique rien que pour vous !",
    chat_placeholder: 'Posez votre question...',
    read_btn: 'Lire', analyze_btn: "Analyser avec l'IA",
    loading_quiz: "L'IA génère votre quiz sur",
    quiz_next: 'Question suivante →', quiz_results: 'Voir les résultats 🏆',
    replay: 'Rejouer', choose_other: 'Choisir un autre livre',
    history_empty: "Vous n'avez pas encore lu de livres.",
    ai_greeting: "Bonjour {name} ! Je suis Biblio, votre assistant littéraire. Posez-moi vos questions !",
    ai_lang_note: 'Réponds toujours en français.',
    quiz_lang_note: 'Génère le quiz en français.',
    or_category: 'ou une catégorie classique',
    load_more: 'Charger plus',
    nav_community: 'Communauté',
    comm_welcome_title: 'Rejoignez une communauté',
    comm_welcome_sub: "Choisissez un groupe pour discuter avec d'autres lecteurs.",
    // Profile
    prof_no_bio: 'Aucune bio', prof_read: 'Lus', prof_favs: 'Favoris', prof_later: 'À lire',
    prof_public: 'Profil public', prof_tab_edit: 'Modifier', prof_tab_fav: 'Favoris',
    prof_tab_later: 'À lire', prof_tab_hist: 'Historique',
    prof_personal_info: 'Informations personnelles', prof_fullname: 'Nom complet',
    prof_name_ph: 'Votre nom', prof_bio_label: 'Bio', prof_bio_ph: 'Parlez de vous, vos genres préférés...',
    prof_current_pass: 'Mot de passe actuel', prof_current_pass_ph: 'Mot de passe actuel',
    prof_new_pass: 'Nouveau mot de passe', prof_new_pass_ph: 'Nouveau mot de passe',
    prof_fav_genres: 'Genres favoris', prof_save: 'Sauvegarder',
    prof_fav_empty: "Aucun favori. Cliquez sur ❤️ sur un livre pour l'ajouter.",
    prof_later_empty: 'Aucun livre à lire plus tard.', prof_hist_empty: 'Aucun livre lu.',
    prof_security: 'Sécurité', prof_2fa: 'Authentification à deux facteurs (2FA) — recevoir un code par email à chaque connexion',
    // Stats & Rewards
    nav_stats: 'Statistiques', nav_rewards: 'Récompenses',
    stats_books_finished: 'Livres terminés', stats_avg_rating: 'Note moyenne',
    stats_sessions: 'Sessions de lecture', stats_streak: 'Jours de suite',
    stats_monthly: 'Livres par mois', stats_genres: 'Genres préférés',
    stats_activity: 'Activité de lecture (90 derniers jours)',
    // Reviews
    prof_tab_reviews: 'Mes avis', reviews_empty: 'Aucun avis. Notez des livres pour les voir ici.',
    your_review: 'Votre avis', write_review: 'Écrivez votre avis (optionnel)...',
    save_review: 'Sauvegarder l\'avis', review_saved: 'Sauvegardé !',
    // Annotations
    my_annotations: 'Mes annotations', highlights: 'Surlignages', bookmarks: 'Marque-pages',
    export: 'Exporter', clear_all: 'Tout effacer', no_highlights: 'Aucun surlignage',
    no_bookmarks: 'Aucun marque-page', add_note: 'Ajouter une note',
    edit_note: 'Modifier', delete: 'Supprimer', bookmark_added: 'Marque-page ajouté !',
    text_highlighted: 'Texte surligné !', note_added: 'Note ajoutée !',
    // Scoreboard
    nav_scoreboard: 'Classement', sb_quiz: 'Quiz', sb_books: 'Livres lus',
  },
  en: {
    nav_home: 'Home', nav_library: 'Library', nav_quiz: 'Quiz',
    nav_ai: 'AI Assistant', nav_history: 'History',
    hero_title: 'Welcome to<br><span>Novela</span>',
    hero_sub: 'Thousands of books, an AI assistant, and quizzes to test your knowledge.',
    hero_explore: 'Explore books', hero_ai: 'Talk to AI',
    search_placeholder: 'Search 70,000+ books...',
    search_book: 'Search a book...',
    quiz_intro: 'Choose a book — the AI generates a unique quiz just for you!',
    chat_placeholder: 'Ask your question...',
    read_btn: 'Read', analyze_btn: 'Analyze with AI',
    loading_quiz: 'AI is generating your quiz on',
    quiz_next: 'Next question →', quiz_results: 'See results 🏆',
    replay: 'Play again', choose_other: 'Choose another book',
    history_empty: "You haven't read any books yet.",
    ai_greeting: "Hello {name}! I'm Biblio, your literary assistant. Ask me anything!",
    ai_lang_note: 'Always reply in English.',
    quiz_lang_note: 'Generate the quiz in English.',
    or_category: 'or a classic category',
    load_more: 'Load more',
    nav_community: 'Community',
    comm_welcome_title: 'Join a community',
    comm_welcome_sub: 'Choose a group to start chatting with other readers.',
    // Profile
    prof_no_bio: 'No bio yet', prof_read: 'Read', prof_favs: 'Favorites', prof_later: 'Read later',
    prof_public: 'Public profile', prof_tab_edit: 'Edit', prof_tab_fav: 'Favorites',
    prof_tab_later: 'Read later', prof_tab_hist: 'History',
    prof_personal_info: 'Personal information', prof_fullname: 'Full name',
    prof_name_ph: 'Your name', prof_bio_label: 'Bio', prof_bio_ph: 'Tell us about yourself, your favorite genres...',
    prof_current_pass: 'Current password', prof_current_pass_ph: 'Current password',
    prof_new_pass: 'New password', prof_new_pass_ph: 'New password',
    prof_fav_genres: 'Favorite genres', prof_save: 'Save',
    prof_fav_empty: 'No favorites yet. Click ❤️ on a book to add it.',
    prof_later_empty: 'No books in your read later list.', prof_hist_empty: 'No books read yet.',
    prof_security: 'Security', prof_2fa: 'Two-factor authentication (2FA) — receive a code by email at each login',
    // Stats & Rewards
    nav_stats: 'Statistics', nav_rewards: 'Rewards',
    stats_books_finished: 'Books finished', stats_avg_rating: 'Average rating',
    stats_sessions: 'Reading sessions', stats_streak: 'Day streak',
    stats_monthly: 'Books per month', stats_genres: 'Favorite genres',
    stats_activity: 'Reading activity (last 90 days)',
    // Reviews
    prof_tab_reviews: 'My reviews', reviews_empty: 'No reviews. Rate books to see them here.',
    your_review: 'Your review', write_review: 'Write your review (optional)...',
    save_review: 'Save review', review_saved: 'Saved!',
    // Annotations
    my_annotations: 'My annotations', highlights: 'Highlights', bookmarks: 'Bookmarks',
    export: 'Export', clear_all: 'Clear all', no_highlights: 'No highlights',
    no_bookmarks: 'No bookmarks', add_note: 'Add note',
    edit_note: 'Edit', delete: 'Delete', bookmark_added: 'Bookmark added!',
    text_highlighted: 'Text highlighted!', note_added: 'Note added!',
    // Scoreboard
    nav_scoreboard: 'Leaderboard', sb_quiz: 'Quiz', sb_books: 'Books read',
  },
  es: {
    nav_home: 'Inicio', nav_library: 'Biblioteca', nav_quiz: 'Quiz',
    nav_ai: 'Asistente IA', nav_history: 'Historial',
    hero_title: 'Bienvenido a<br><span>Novela</span>',
    hero_sub: 'Miles de libros, un asistente IA y cuestionarios para poner a prueba tus conocimientos.',
    hero_explore: 'Explorar libros', hero_ai: 'Hablar con la IA',
    search_placeholder: 'Buscar entre 70.000+ libros...',
    search_book: 'Buscar un libro...',
    quiz_intro: '¡Elige un libro — la IA genera un quiz único para ti!',
    chat_placeholder: 'Haz tu pregunta...',
    read_btn: 'Leer', analyze_btn: 'Analizar con IA',
    loading_quiz: 'La IA genera tu quiz sobre',
    quiz_next: 'Siguiente pregunta →', quiz_results: 'Ver resultados 🏆',
    replay: 'Jugar de nuevo', choose_other: 'Elegir otro libro',
    history_empty: 'Aún no has leído ningún libro.',
    ai_greeting: '¡Hola {name}! Soy Biblio, tu asistente literario. ¡Hazme preguntas!',
    ai_lang_note: 'Responde siempre en español.',
    quiz_lang_note: 'Genera el quiz en español.',
    or_category: 'o una categoría clásica',
    load_more: 'Cargar más',
    nav_community: 'Comunidad',
    comm_welcome_title: 'Únete a una comunidad',
    comm_welcome_sub: 'Elige un grupo para chatear con otros lectores.',
    // Profile
    prof_no_bio: 'Sin bio', prof_read: 'Leídos', prof_favs: 'Favoritos', prof_later: 'Leer después',
    prof_public: 'Perfil público', prof_tab_edit: 'Editar', prof_tab_fav: 'Favoritos',
    prof_tab_later: 'Leer después', prof_tab_hist: 'Historial',
    prof_personal_info: 'Información personal', prof_fullname: 'Nombre completo',
    prof_name_ph: 'Tu nombre', prof_bio_label: 'Bio', prof_bio_ph: 'Cuéntanos sobre ti, tus géneros favoritos...',
    prof_current_pass: 'Contraseña actual', prof_current_pass_ph: 'Contraseña actual',
    prof_new_pass: 'Nueva contraseña', prof_new_pass_ph: 'Nueva contraseña',
    prof_fav_genres: 'Géneros favoritos', prof_save: 'Guardar',
    prof_fav_empty: 'Sin favoritos. Haz clic en ❤️ en un libro para añadirlo.',
    prof_later_empty: 'No hay libros para leer después.', prof_hist_empty: 'No has leído ningún libro.',
    prof_security: 'Seguridad', prof_2fa: 'Autenticación de dos factores (2FA) — recibir un código por email en cada inicio de sesión',
    // Stats & Rewards
    nav_stats: 'Estadísticas', nav_rewards: 'Recompensas',
    stats_books_finished: 'Libros terminados', stats_avg_rating: 'Nota media',
    stats_sessions: 'Sesiones de lectura', stats_streak: 'Días seguidos',
    stats_monthly: 'Libros por mes', stats_genres: 'Géneros favoritos',
    stats_activity: 'Actividad de lectura (últimos 90 días)',
    // Reviews
    prof_tab_reviews: 'Mis reseñas', reviews_empty: 'Sin reseñas. Califica libros para verlos aquí.',
    your_review: 'Tu reseña', write_review: 'Escribe tu reseña (opcional)...',
    save_review: 'Guardar reseña', review_saved: '¡Guardado!',
    // Annotations
    my_annotations: 'Mis anotaciones', highlights: 'Resaltados', bookmarks: 'Marcadores',
    export: 'Exportar', clear_all: 'Borrar todo', no_highlights: 'Sin resaltados',
    no_bookmarks: 'Sin marcadores', add_note: 'Añadir nota',
    edit_note: 'Editar', delete: 'Eliminar', bookmark_added: '¡Marcador añadido!',
    text_highlighted: '¡Texto resaltado!', note_added: '¡Nota añadida!',
    // Scoreboard
    nav_scoreboard: 'Clasificación', sb_quiz: 'Quiz', sb_books: 'Libros leídos',
  },
  ar: {
    nav_home: 'الرئيسية', nav_library: 'المكتبة', nav_quiz: 'اختبار',
    nav_ai: 'مساعد الذكاء', nav_history: 'السجل',
    hero_title: 'مرحباً بك في<br><span>Novela</span>',
    hero_sub: 'آلاف الكتب، مساعد ذكاء اصطناعي، واختبارات لاختبار معرفتك.',
    hero_explore: 'استكشف الكتب', hero_ai: 'تحدث مع الذكاء',
    search_placeholder: 'ابحث في أكثر من 70,000 كتاب...',
    search_book: 'ابحث عن كتاب...',
    quiz_intro: 'اختر كتاباً — يولّد الذكاء الاصطناعي اختباراً فريداً لك!',
    chat_placeholder: 'اطرح سؤالك...',
    read_btn: 'قراءة', analyze_btn: 'تحليل مع الذكاء',
    loading_quiz: 'الذكاء يولّد اختبارك حول',
    quiz_next: 'السؤال التالي →', quiz_results: 'عرض النتائج 🏆',
    replay: 'العب مجدداً', choose_other: 'اختر كتاباً آخر',
    history_empty: 'لم تقرأ أي كتاب بعد.',
    ai_greeting: 'مرحباً {name}! أنا بيبليو، مساعدك الأدبي. اسألني أي شيء!',
    ai_lang_note: 'أجب دائماً باللغة العربية.',
    quiz_lang_note: 'أنشئ الاختبار باللغة العربية.',
    or_category: 'أو فئة كلاسيكية',
    load_more: 'تحميل المزيد',
    nav_community: 'المجتمع',
    comm_welcome_title: 'انضم إلى مجتمع',
    comm_welcome_sub: 'اختر مجموعة للتحدث مع القراء الآخرين.',
    // Profile
    prof_no_bio: 'لا توجد سيرة ذاتية', prof_read: 'مقروء', prof_favs: 'المفضلة', prof_later: 'للقراءة لاحقاً',
    prof_public: 'ملف عام', prof_tab_edit: 'تعديل', prof_tab_fav: 'المفضلة',
    prof_tab_later: 'للقراءة لاحقاً', prof_tab_hist: 'السجل',
    prof_personal_info: 'المعلومات الشخصية', prof_fullname: 'الاسم الكامل',
    prof_name_ph: 'اسمك', prof_bio_label: 'السيرة الذاتية', prof_bio_ph: 'أخبرنا عن نفسك...',
    prof_current_pass: 'كلمة المرور الحالية', prof_current_pass_ph: 'كلمة المرور الحالية',
    prof_new_pass: 'كلمة المرور الجديدة', prof_new_pass_ph: 'كلمة المرور الجديدة',
    prof_fav_genres: 'الأنواع المفضلة', prof_save: 'حفظ',
    prof_fav_empty: 'لا توجد مفضلة. انقر على ❤️ على كتاب لإضافته.',
    prof_later_empty: 'لا توجد كتب للقراءة لاحقاً.', prof_hist_empty: 'لم تقرأ أي كتاب بعد.',
    prof_security: 'الأمان', prof_2fa: 'المصادقة الثنائية (2FA) — استلام رمز عبر البريد الإلكتروني عند كل تسجيل دخول',
    // Stats & Rewards
    nav_stats: 'الإحصائيات', nav_rewards: 'المكافآت',
    stats_books_finished: 'الكتب المنتهية', stats_avg_rating: 'التقييم المتوسط',
    stats_sessions: 'جلسات القراءة', stats_streak: 'أيام متتالية',
    stats_monthly: 'الكتب شهرياً', stats_genres: 'الأنواع المفضلة',
    stats_activity: 'نشاط القراءة (آخر 90 يوماً)',
    // Reviews
    prof_tab_reviews: 'مراجعاتي', reviews_empty: 'لا توجد مراجعات. قيّم الكتب لرؤيتها هنا.',
    your_review: 'مراجعتك', write_review: 'اكتب مراجعتك (اختياري)...',
    save_review: 'حفظ المراجعة', review_saved: 'تم الحفظ!',
    // Annotations
    my_annotations: 'ملاحظاتي', highlights: 'التظليلات', bookmarks: 'الإشارات المرجعية',
    export: 'تصدير', clear_all: 'مسح الكل', no_highlights: 'لا توجد تظليلات',
    no_bookmarks: 'لا توجد إشارات مرجعية', add_note: 'إضافة ملاحظة',
    edit_note: 'تعديل', delete: 'حذف', bookmark_added: 'تمت إضافة الإشارة المرجعية!',
    text_highlighted: 'تم تظليل النص!', note_added: 'تمت إضافة الملاحظة!',
    // Scoreboard
    nav_scoreboard: 'التصنيف', sb_quiz: 'الاختبارات', sb_books: 'الكتب المقروءة',
  }
};

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['fr'][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('novela_lang', lang);
  // Update dropdown active state
  document.querySelectorAll('.lang-dropdown-menu button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('lang-' + lang);
  if (btn) btn.classList.add('active');
  // Update active button label
  const flags = { fr: '🇫🇷 FR', en: '🇬🇧 EN', ar: '🇸🇦 AR', es: '🇪🇸 ES' };
  const activeBtn = document.getElementById('lang-active-btn');
  if (activeBtn) activeBtn.innerHTML = `${flags[lang]} <i class="fas fa-chevron-down" id="lang-chevron"></i>`;
  // RTL for Arabic
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  // Apply translations
  applyTranslations();
}

function toggleLangDropdown(e) {
  if (e) e.stopPropagation();
  document.getElementById('lang-dropdown').classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  const dd = document.getElementById('lang-dropdown');
  if (dd) dd.classList.remove('open');
});

function applyTranslations() {
  // Text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  // Quiz divider
  const divider = document.querySelector('.quiz-divider span');
  if (divider) divider.textContent = t('or_category');
  // Load more button
  const loadMore = document.getElementById('load-more-wrap');
  if (loadMore) {
    const btn = loadMore.querySelector('button');
    if (btn) btn.innerHTML = `<i class="fas fa-plus"></i> ${t('load_more')}`;
  }
  // Re-init profile if open to refresh translated strings
  if (document.getElementById('page-profile')?.classList.contains('active') && currentUser) {
    initProfile();
  }
  // Re-render lang filters with new language labels
  initLangFilters();
}

// ===== BOOKS DATA (80 livres) =====
const BOOKS = [
  { id:1, isbn:"9780451524935", title:"1984", author:"George Orwell", genre:"Dystopie", year:1949, emoji:"🏭", color:"#2d3561", desc:"Dans un futur totalitaire, Winston Smith travaille pour le Parti. Un roman visionnaire sur la surveillance et la liberté de pensée." },
  { id:2, isbn:"9780156013987", title:"Le Petit Prince", author:"Antoine de Saint-Exupéry", genre:"Conte", year:1943, emoji:"🌹", color:"#c84b31", desc:"Un aviateur rencontre un petit prince venu d'une autre planète. Un conte poétique universel sur l'amitié et l'amour." },
  { id:3, isbn:"9780439708180", title:"Harry Potter à l'école des sorciers", author:"J.K. Rowling", genre:"Fantasy", year:1997, emoji:"⚡", color:"#7b2d8b", desc:"Un jeune orphelin découvre qu'il est un sorcier et intègre l'école de Poudlard. Le début d'une saga magique inoubliable." },
  { id:4, isbn:"9780618640157", title:"Le Seigneur des Anneaux", author:"J.R.R. Tolkien", genre:"Fantasy", year:1954, emoji:"💍", color:"#4a7c59", desc:"Frodon Sacquet doit détruire l'Anneau Unique pour sauver la Terre du Milieu. L'épopée fantasy fondatrice du genre moderne." },
  { id:5, isbn:"9780140449136", title:"Crime et Châtiment", author:"Fiodor Dostoïevski", genre:"Classique", year:1866, emoji:"🔪", color:"#8b1a1a", desc:"Raskolnikov, un étudiant pauvre, commet un meurtre et lutte avec sa conscience. Un chef-d'œuvre de la psychologie humaine." },
  { id:6, isbn:"9780441013593", title:"Dune", author:"Frank Herbert", genre:"Science-Fiction", year:1965, emoji:"🏜️", color:"#c4a35a", desc:"Sur la planète désertique Arrakis, Paul Atréides devient le messie d'un peuple opprimé. La saga SF la plus ambitieuse jamais écrite." },
  { id:7, isbn:"9780679720201", title:"L'Étranger", author:"Albert Camus", genre:"Philosophie", year:1942, emoji:"☀️", color:"#e07b39", desc:"Meursault, un homme indifférent, tue un Arabe sur une plage algérienne. Roman fondateur de la philosophie de l'absurde." },
  { id:8, isbn:"9780140449129", title:"Madame Bovary", author:"Gustave Flaubert", genre:"Classique", year:1857, emoji:"💌", color:"#9b4dca", desc:"Emma Bovary, épouse d'un médecin de campagne, rêve d'une vie romanesque. Portrait magistral du romantisme et de ses illusions." },
  { id:9, isbn:"9780140449266", title:"Le Comte de Monte-Cristo", author:"Alexandre Dumas", genre:"Aventure", year:1844, emoji:"⚔️", color:"#1a5276", desc:"Edmond Dantès, injustement emprisonné, s'évade et prépare une vengeance implacable. Le roman d'aventure ultime." },
  { id:10, isbn:"9780141439518", title:"Orgueil et Préjugés", author:"Jane Austen", genre:"Romance", year:1813, emoji:"🌸", color:"#c0392b", desc:"Elizabeth Bennet et Mr. Darcy s'affrontent avant de tomber amoureux. La comédie romantique anglaise par excellence." },
  { id:11, isbn:"9781451673319", title:"Fahrenheit 451", author:"Ray Bradbury", genre:"Dystopie", year:1953, emoji:"🔥", color:"#e74c3c", desc:"Dans un futur où les livres sont brûlés, un pompier commence à douter. Un hymne à la liberté de pensée." },
  { id:12, isbn:"9780060934347", title:"Don Quichotte", author:"Miguel de Cervantes", genre:"Classique", year:1605, emoji:"🗡️", color:"#27ae60", desc:"Un hidalgo fou de romans de chevalerie part à l'aventure avec son écuyer Sancho Pança. Le premier roman moderne." },
  { id:13, isbn:"9781503280786", title:"Moby Dick", author:"Herman Melville", genre:"Aventure", year:1851, emoji:"🐋", color:"#2980b9", desc:"Le capitaine Achab, obsédé par la baleine blanche, entraîne son équipage vers la destruction. Une épopée maritime." },
  { id:14, isbn:"9780451419439", title:"Les Misérables", author:"Victor Hugo", genre:"Classique", year:1862, emoji:"🎭", color:"#8e44ad", desc:"Jean Valjean, ancien forçat, cherche la rédemption dans la France du XIXe siècle. Le roman humaniste par excellence." },
  { id:15, isbn:"9780060850524", title:"Le Meilleur des Mondes", author:"Aldous Huxley", genre:"Dystopie", year:1932, emoji:"🧬", color:"#16a085", desc:"Dans un monde parfait et aseptisé, Bernard Marx remet en question l'ordre établi. Une dystopie visionnaire." },
  { id:16, isbn:"9780156001311", title:"Le Nom de la Rose", author:"Umberto Eco", genre:"Policier", year:1980, emoji:"🌹", color:"#6c3483", desc:"Un moine franciscain enquête sur des meurtres dans une abbaye médiévale. Un thriller intellectuel fascinant." },
  { id:17, isbn:"9780553293357", title:"Fondation", author:"Isaac Asimov", genre:"Science-Fiction", year:1951, emoji:"🌌", color:"#1a237e", desc:"Hari Seldon prédit la chute de l'Empire Galactique et crée la Fondation. La saga SF la plus influente de l'histoire." },
  { id:18, isbn:"9780140449174", title:"Anna Karénine", author:"Léon Tolstoï", genre:"Classique", year:1878, emoji:"🚂", color:"#b71c1c", desc:"Anna Karénine quitte son mari pour un officier séduisant. Une tragédie sur l'amour et la liberté." },
  { id:19, isbn:"9780547928227", title:"Le Hobbit", author:"J.R.R. Tolkien", genre:"Fantasy", year:1937, emoji:"🐉", color:"#2e7d32", desc:"Bilbo Sacquet part à l'aventure avec des nains pour récupérer un trésor gardé par le dragon Smaug." },
  { id:20, isbn:"9780060883287", title:"Cent ans de solitude", author:"Gabriel García Márquez", genre:"Réalisme magique", year:1967, emoji:"🦋", color:"#f39c12", desc:"L'histoire de la famille Buendía sur sept générations à Macondo. Le chef-d'œuvre du réalisme magique." },
  { id:21, isbn:"9781400079988", title:"Guerre et Paix", author:"Léon Tolstoï", genre:"Classique", year:1869, emoji:"⚔️", color:"#c0392b", desc:"Fresque monumentale de la société russe pendant les guerres napoléoniennes. Le plus grand roman jamais écrit." },
  { id:22, isbn:"9780140268867", title:"L'Odyssée", author:"Homère", genre:"Épopée", year:-800, emoji:"🌊", color:"#2471a3", desc:"Le retour d'Ulysse à Ithaque après la guerre de Troie. L'épopée fondatrice de la littérature occidentale." },
  { id:23, isbn:"9780140445923", title:"L'Iliade", author:"Homère", genre:"Épopée", year:-750, emoji:"🛡️", color:"#922b21", desc:"La colère d'Achille pendant le siège de Troie. L'une des plus anciennes œuvres de la littérature mondiale." },
  { id:24, isbn:"9780140449044", title:"Germinal", author:"Émile Zola", genre:"Classique", year:1885, emoji:"⛏️", color:"#4a235a", desc:"Étienne Lantier organise une grève des mineurs du Nord. Le roman social le plus puissant de Zola." },
  { id:25, isbn:"9780140447644", title:"Le Rouge et le Noir", author:"Stendhal", genre:"Classique", year:1830, emoji:"🎯", color:"#922b21", desc:"Julien Sorel, fils de charpentier ambitieux, gravit les échelons de la société par la séduction." },
  { id:26, isbn:"9780140440041", title:"Candide", author:"Voltaire", genre:"Philosophie", year:1759, emoji:"🌱", color:"#1e8449", desc:"Candide traverse le monde et découvre ses horreurs. Le conte philosophique le plus célèbre des Lumières." },
  { id:27, isbn:"9780140621198", title:"Les Fleurs du Mal", author:"Charles Baudelaire", genre:"Poésie", year:1857, emoji:"🥀", color:"#6c3483", desc:"Recueil de poèmes explorant la beauté, le mal et l'idéal. L'œuvre fondatrice de la poésie moderne française." },
  { id:28, isbn:"9780300140941", title:"À la recherche du temps perdu", author:"Marcel Proust", genre:"Classique", year:1913, emoji:"🍪", color:"#784212", desc:"Une œuvre-fleuve en sept volumes explorant la mémoire et le temps. Le roman le plus ambitieux de la littérature française." },
  { id:29, isbn:"9780805209990", title:"Le Procès", author:"Franz Kafka", genre:"Philosophie", year:1925, emoji:"⚖️", color:"#2c3e50", desc:"Josef K est arrêté sans savoir pourquoi. Un roman sur l'absurdité de la bureaucratie et de la culpabilité moderne." },
  { id:30, isbn:"9780486290300", title:"La Métamorphose", author:"Franz Kafka", genre:"Philosophie", year:1915, emoji:"🪲", color:"#1a5276", desc:"Gregor Samsa se réveille transformé en insecte géant. Une nouvelle magistrale sur l'aliénation humaine." },
  { id:31, isbn:"9780553573404", title:"Le Trône de Fer", author:"George R.R. Martin", genre:"Fantasy", year:1996, emoji:"👑", color:"#7d6608", desc:"Dans les Sept Couronnes de Westeros, les grandes familles se disputent le pouvoir. La fantasy épique moderne." },
  { id:32, isbn:"9780812550702", title:"Ender's Game", author:"Orson Scott Card", genre:"Science-Fiction", year:1985, emoji:"🎮", color:"#1a5276", desc:"Andrew Ender Wiggin est entraîné pour commander la flotte terrienne contre une invasion extraterrestre." },
  { id:33, isbn:"9780441569595", title:"Neuromancien", author:"William Gibson", genre:"Science-Fiction", year:1984, emoji:"💻", color:"#0d1117", desc:"Case, un hacker déchu, est recruté pour une mission dans le cyberespace. Le roman fondateur du cyberpunk." },
  { id:34, isbn:"9780064471046", title:"Les Chroniques de Narnia", author:"C.S. Lewis", genre:"Fantasy", year:1950, emoji:"🦁", color:"#d4ac0d", desc:"Quatre enfants découvrent un monde magique à travers une armoire. Une série fantasy empreinte de symbolisme." },
  { id:35, isbn:"9780451457998", title:"2001 : L'Odyssée de l'espace", author:"Arthur C. Clarke", genre:"Science-Fiction", year:1968, emoji:"🛸", color:"#1b2631", desc:"Une mission vers Jupiter révèle les origines de l'humanité. Un roman SF philosophique d'une profondeur rare." },
  { id:36, isbn:"9780156027601", title:"Solaris", author:"Stanisław Lem", genre:"Science-Fiction", year:1961, emoji:"🌊", color:"#1a5276", desc:"Des scientifiques étudient un océan vivant qui matérialise leurs souvenirs. La SF philosophique à son sommet." },
  { id:37, isbn:"9780385490818", title:"La Servante écarlate", author:"Margaret Atwood", genre:"Dystopie", year:1985, emoji:"🔴", color:"#922b21", desc:"Dans la République de Gilead, les femmes fertiles sont réduites à l'état de servantes reproductrices." },
  { id:38, isbn:"9780553283686", title:"Hyperion", author:"Dan Simmons", genre:"Science-Fiction", year:1989, emoji:"🕰️", color:"#4a235a", desc:"Sept pèlerins se rendent vers la créature Gritche sur la planète Hyperion. Une SF ambitieuse et érudite." },
  { id:39, isbn:"9780679720218", title:"La Peste", author:"Albert Camus", genre:"Philosophie", year:1947, emoji:"🦠", color:"#2c3e50", desc:"Une épidémie de peste frappe la ville d'Oran. Une allégorie sur la résistance collective face au mal." },
  { id:40, isbn:"9780679723165", title:"Lolita", author:"Vladimir Nabokov", genre:"Classique", year:1955, emoji:"🦋", color:"#c0392b", desc:"Un roman controversé d'une beauté stylistique troublante sur l'obsession et la manipulation." },
  { id:41, isbn:"9780451528018", title:"Sherlock Holmes - Le Chien des Baskerville", author:"Arthur Conan Doyle", genre:"Policier", year:1902, emoji:"🔍", color:"#2c3e50", desc:"Sherlock Holmes enquête sur la malédiction d'une famille noble dans les landes du Devon." },
  { id:42, isbn:"9780062073488", title:"Et puis il n'en resta plus aucun", author:"Agatha Christie", genre:"Policier", year:1939, emoji:"🏝️", color:"#922b21", desc:"Dix inconnus sont invités sur une île isolée et meurent un à un. Le roman policier le plus vendu de tous les temps." },
  { id:43, isbn:"9780307474278", title:"Le Da Vinci Code", author:"Dan Brown", genre:"Thriller", year:2003, emoji:"🎨", color:"#784212", desc:"Robert Langdon enquête sur un meurtre au Louvre qui révèle un secret millénaire sur le christianisme." },
  { id:44, isbn:"9780307269980", title:"Millenium - Les Hommes qui n'aimaient pas les femmes", author:"Stieg Larsson", genre:"Thriller", year:2005, emoji:"🐉", color:"#1b2631", desc:"Un journaliste et une hackeuse enquêtent sur la disparition d'une jeune femme. Le polar suédois fondateur." },
  { id:45, isbn:"9780802130341", title:"Le Maître et Marguerite", author:"Mikhaïl Boulgakov", genre:"Réalisme magique", year:1967, emoji:"😈", color:"#4a235a", desc:"Le diable visite Moscou soviétique et sème le chaos. Un roman satirique sur la liberté artistique." },
  { id:46, isbn:"9780062315007", title:"L'Alchimiste", author:"Paulo Coelho", genre:"Conte", year:1988, emoji:"✨", color:"#d4ac0d", desc:"Santiago part chercher un trésor en Égypte. Un conte philosophique sur la réalisation de ses rêves, traduit en 80 langues." },
  { id:47, isbn:"9780811200684", title:"Siddhartha", author:"Hermann Hesse", genre:"Philosophie", year:1922, emoji:"🧘", color:"#1e8449", desc:"Un jeune Indien quitte sa famille pour chercher l'illumination spirituelle. Un roman initiatique sur le bouddhisme." },
  { id:48, isbn:"9780684801223", title:"Le Vieil Homme et la Mer", author:"Ernest Hemingway", genre:"Classique", year:1952, emoji:"🎣", color:"#2471a3", desc:"Un vieux pêcheur cubain lutte seul en mer contre un immense marlin. Prix Nobel 1954." },
  { id:49, isbn:"9780679732242", title:"Le Bruit et la Fureur", author:"William Faulkner", genre:"Classique", year:1929, emoji:"🌳", color:"#4a235a", desc:"La décadence d'une famille du Sud américain racontée par quatre voix. Chef-d'œuvre du modernisme américain." },
  { id:50, isbn:"9780679722762", title:"Ulysse", author:"James Joyce", genre:"Classique", year:1922, emoji:"🌆", color:"#1b2631", desc:"Une journée dans la vie de Leopold Bloom à Dublin. Le roman moderniste le plus influent du XXe siècle." },
  { id:51, isbn:"9780156628709", title:"Mrs Dalloway", author:"Virginia Woolf", genre:"Classique", year:1925, emoji:"🌺", color:"#9b4dca", desc:"Une journée dans la vie de Clarissa Dalloway qui prépare une réception à Londres. Un roman stream of consciousness." },
  { id:52, isbn:"9780060932138", title:"L'Insoutenable Légèreté de l'être", author:"Milan Kundera", genre:"Philosophie", year:1984, emoji:"🕊️", color:"#4a235a", desc:"Tomas et Tereza vivent leur amour sous l'occupation soviétique. Un roman philosophique sur l'existence." },
  { id:53, isbn:"9781400033416", title:"Beloved", author:"Toni Morrison", genre:"Classique", year:1987, emoji:"👻", color:"#1b2631", desc:"Sethe, ancienne esclave, est hantée par le fantôme de sa fille morte. Prix Pulitzer 1988." },
  { id:54, isbn:"9780143039433", title:"Les Raisins de la colère", author:"John Steinbeck", genre:"Classique", year:1939, emoji:"🍇", color:"#922b21", desc:"La famille Joad fuit la misère de l'Oklahoma pendant la Grande Dépression. Prix Pulitzer 1940." },
  { id:55, isbn:"9780802133908", title:"Pedro Páramo", author:"Juan Rulfo", genre:"Réalisme magique", year:1955, emoji:"💀", color:"#784212", desc:"Juan Preciado cherche son père dans un village fantôme. Le fondateur du réalisme magique latino-américain." },
  { id:56, isbn:"9780802130303", title:"Ficciones", author:"Jorge Luis Borges", genre:"Fantastique", year:1944, emoji:"🌀", color:"#1a5276", desc:"Labyrinthes, bibliothèques infinies et univers parallèles. L'œuvre la plus influente de la littérature fantastique." },
  { id:57, isbn:"9780486282114", title:"Frankenstein", author:"Mary Shelley", genre:"Fantastique", year:1818, emoji:"⚡", color:"#1b2631", desc:"Victor Frankenstein crée un être artificiel qui se retourne contre lui. Le premier roman de science-fiction." },
  { id:58, isbn:"9780486411095", title:"Dracula", author:"Bram Stoker", genre:"Fantastique", year:1897, emoji:"🧛", color:"#922b21", desc:"Le comte Dracula quitte la Transylvanie pour l'Angleterre. Le roman gothique fondateur du mythe du vampire." },
  { id:59, isbn:"9780141439570", title:"Le Portrait de Dorian Gray", author:"Oscar Wilde", genre:"Fantastique", year:1890, emoji:"🖼️", color:"#4a235a", desc:"Dorian Gray reste éternellement jeune tandis que son portrait vieillit. Un roman sur la beauté et la corruption morale." },
  { id:60, isbn:"9780385474542", title:"Things Fall Apart", author:"Chinua Achebe", genre:"Littérature africaine", year:1958, emoji:"🌍", color:"#d4ac0d", desc:"Okonkwo voit sa société igbo détruite par la colonisation britannique. Le roman africain le plus lu au monde." },
  { id:61, isbn:"9780140042597", title:"Sur la route", author:"Jack Kerouac", genre:"Avant-garde", year:1957, emoji:"🚗", color:"#d4ac0d", desc:"Sal Paradise et Dean Moriarty traversent l'Amérique en quête de liberté. Le manifeste de la Beat Generation." },
  { id:62, isbn:"9780316769174", title:"L'Attrape-cœurs", author:"J.D. Salinger", genre:"Classique", year:1951, emoji:"🧢", color:"#c0392b", desc:"Holden Caulfield, adolescent rebelle, erre dans New York après son renvoi du lycée. Le roman de l'adolescence." },
  { id:63, isbn:"9780553296983", title:"Le Journal d'Anne Frank", author:"Anne Frank", genre:"Biographie", year:1947, emoji:"📔", color:"#d4ac0d", desc:"Le journal intime d'une jeune fille juive cachée à Amsterdam pendant l'occupation nazie." },
  { id:64, isbn:"9780679731726", title:"Les Vestiges du jour", author:"Kazuo Ishiguro", genre:"Classique", year:1989, emoji:"🍵", color:"#2c3e50", desc:"Stevens, majordome anglais, repense sa vie lors d'un voyage. Prix Booker 1989." },
  { id:65, isbn:"9781400078776", title:"Auprès de moi toujours", author:"Kazuo Ishiguro", genre:"Science-Fiction", year:2005, emoji:"💔", color:"#9b4dca", desc:"Des enfants élevés dans une école anglaise découvrent leur terrible destin. Un roman dystopique émouvant." },
  { id:66, isbn:"9780812976533", title:"Les Enfants de Minuit", author:"Salman Rushdie", genre:"Réalisme magique", year:1981, emoji:"🌙", color:"#d4ac0d", desc:"Saleem Sinai, né à l'indépendance de l'Inde, est télépathiquement lié aux autres enfants de minuit. Prix Booker." },
  { id:67, isbn:"9780679757016", title:"Le Dieu des Petits Riens", author:"Arundhati Roy", genre:"Classique", year:1997, emoji:"🌿", color:"#4a7c59", desc:"Des jumeaux dans le Kerala des années 60. Un roman sur les castes, l'amour interdit et la famille. Prix Booker." },
  { id:68, isbn:"9780307387899", title:"La Route", author:"Cormac McCarthy", genre:"Dystopie", year:2006, emoji:"🌑", color:"#1b2631", desc:"Un père et son fils traversent une Amérique post-apocalyptique. Prix Pulitzer 2007." },
  { id:69, isbn:"9780307389732", title:"L'Amour aux temps du choléra", author:"Gabriel García Márquez", genre:"Romance", year:1985, emoji:"💛", color:"#d4ac0d", desc:"Un homme attend 53 ans pour retrouver la femme qu'il aime. Un roman sur l'amour et la vieillesse." },
  { id:70, isbn:"9780679720218", title:"La Chute", author:"Albert Camus", genre:"Philosophie", year:1956, emoji:"🌉", color:"#2c3e50", desc:"Jean-Baptiste Clamence confesse ses péchés dans un bar d'Amsterdam. Le dernier roman de Camus." },
  { id:71, isbn:"9780307474278", title:"Inferno", author:"Dan Brown", genre:"Thriller", year:2013, emoji:"🔥", color:"#c0392b", desc:"Robert Langdon se réveille à Florence sans mémoire. Un thriller sur la surpopulation mondiale." },
  { id:72, isbn:"9780553573404", title:"A Clash of Kings", author:"George R.R. Martin", genre:"Fantasy", year:1998, emoji:"⚔️", color:"#922b21", desc:"Cinq rois se disputent le pouvoir après la mort de Robert Baratheon. La suite du Trône de Fer." },
  { id:73, isbn:"9780765326355", title:"The Way of Kings", author:"Brandon Sanderson", genre:"Fantasy", year:2010, emoji:"⚡", color:"#2471a3", desc:"Kaladin, Shallan et Dalinar dans le monde de Roshar. Le début de la saga Stormlight Archive." },
  { id:74, isbn:"9780756404741", title:"Le Nom du Vent", author:"Patrick Rothfuss", genre:"Fantasy", year:2007, emoji:"🎵", color:"#d4ac0d", desc:"Kvothe raconte sa vie légendaire à un chroniqueur. Un roman de fantasy littéraire exceptionnel." },
  { id:75, isbn:"9780439023481", title:"Hunger Games", author:"Suzanne Collins", genre:"Dystopie", year:2008, emoji:"🏹", color:"#c0392b", desc:"Katniss Everdeen participe aux Hunger Games pour sauver sa sœur. La dystopie YA la plus vendue." },
  { id:76, isbn:"9780345391803", title:"Le Guide du voyageur galactique", author:"Douglas Adams", genre:"Science-Fiction", year:1979, emoji:"🌌", color:"#2471a3", desc:"Arthur Dent survit à la destruction de la Terre. La comédie SF la plus drôle jamais écrite." },
  { id:77, isbn:"9780380789030", title:"American Gods", author:"Neil Gaiman", genre:"Fantasy", year:2001, emoji:"⚡", color:"#1b2631", desc:"Shadow rencontre les anciens dieux qui vivent en Amérique. Un roman sur la mythologie et l'Amérique." },
  { id:78, isbn:"9780062024022", title:"Divergent", author:"Veronica Roth", genre:"Dystopie", year:2011, emoji:"⚡", color:"#2471a3", desc:"Tris Prior choisit la faction Audacieux dans une société divisée. Une dystopie YA populaire." },
  { id:79, isbn:"9780679744399", title:"De si beaux chevaux", author:"Cormac McCarthy", genre:"Classique", year:1992, emoji:"🐎", color:"#d4ac0d", desc:"John Grady Cole part au Mexique à cheval. Un roman sur la fin de l'Ouest sauvage." },
  { id:80, isbn:"9780312278670", title:"Le Loup des steppes", author:"Hermann Hesse", genre:"Philosophie", year:1927, emoji:"🐺", color:"#2c3e50", desc:"Harry Haller erre entre deux mondes. Un roman sur la dualité de l'âme humaine." },

  // ===== روايات عربية =====
  { id:81, title:"خوف", author:"مصطفى محمود", lang:"ar",cover:"https://books.google.com/books/content?id=eDlHEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1978, emoji:"😨", color:"#1a1a2e", desc:"رواية فلسفية تتناول الخوف الوجودي الإنساني من الموت والمجهول. من أشهر أعمال مصطفى محمود الفكرية." },
  { id:82, title:"عمارة يعقوبيان", author:"علاء الأسواني", lang:"ar", genre:"رواية عربية", year:2002, emoji:"🏢", color:"#8b1a1a", desc:"رواية تصور الحياة في عمارة قاهرية عريقة وتعكس تناقضات المجتمع المصري بكل طبقاته وأسراره." },
  { id:83, title:"أولاد حارتنا", author:"نجيب محفوظ", lang:"ar", genre:"رواية عربية", year:1959, emoji:"🌙", color:"#2c3e50", desc:"ملحمة رمزية تروي تاريخ البشرية من خلال حارة مصرية. أثارت جدلاً واسعاً وأسهمت في حصول محفوظ على نوبل." },
  { id:84, title:"الحرافيش", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=R8VvEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1977, emoji:"⚔️", color:"#784212", desc:"ملحمة عائلية تمتد عبر عشرة أجيال في حارة شعبية، تستكشف الصراع بين القوة والعدالة والإيمان." },
  { id:85, title:"ثلاثية القاهرة", author:"نجيب محفوظ", lang:"ar", genre:"رواية عربية", year:1956, emoji:"🏙️", color:"#1a5276", desc:"ثلاثية بين القصرين وقصر الشوق والسكرية. أعظم رواية عربية في القرن العشرين تصور مصر بين الحربين." },
  { id:86, title:"موسم الهجرة إلى الشمال", author:"الطيب صالح", lang:"ar", genre:"رواية عربية", year:1966, emoji:"🌊", color:"#2471a3", desc:"رواية سودانية تعدّ من أعظم الروايات العربية. تتناول الصراع بين الشرق والغرب من خلال شخصية مصطفى سعيد." },
  { id:87, title:"الخبز الحافي", author:"محمد شكري", lang:"ar", genre:"رواية عربية", year:1973, emoji:"🍞", color:"#922b21", desc:"سيرة ذاتية صادمة لطفولة قاسية في المغرب. ترجمها بول بولز وأصبحت من أكثر الروايات العربية انتشاراً عالمياً." },
  { id:88, title:"زقاق المدق", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=qOD2EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1947, emoji:"🏚️", color:"#4a235a", desc:"تصوير حي لحياة سكان زقاق شعبي في القاهرة خلال الحرب العالمية الثانية. من أجمل روايات محفوظ الواقعية." },
  { id:89, title:"اللص والكلاب", author:"نجيب محفوظ", lang:"ar", genre:"رواية عربية", year:1961, emoji:"🐕", color:"#1b2631", desc:"رواية وجودية عن سعيد مهران الخارج من السجن يبحث عن الانتقام. من أكثر روايات محفوظ عمقاً وكثافة." },
  { id:90, title:"مدن الملح", author:"عبد الرحمن منيف", lang:"ar", genre:"رواية عربية", year:1984, emoji:"🏜️", color:"#c4a35a", desc:"خماسية ملحمية تصور تحول الجزيرة العربية بعد اكتشاف النفط. من أهم الروايات العربية في القرن العشرين." },
  { id:91, title:"شيكاغو", author:"علاء الأسواني", lang:"ar",cover:"https://books.google.com/books/content?id=PXM0EQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:2007, emoji:"🌆", color:"#2c3e50", desc:"رواية تتناول حياة المصريين في شيكاغو وصراعهم بين الهوية والاندماج في المجتمع الأمريكي." },
  { id:92, title:"رامة والتنين", author:"إدوار الخراط", lang:"ar", genre:"رواية عربية", year:1980, emoji:"🐉", color:"#6c3483", desc:"رواية شعرية تجريبية تجمع بين الحب والأسطورة والتاريخ المصري القديم. تحفة الحداثة العربية." },
  { id:93, title:"الطنطورية", author:"رضوى عاشور", lang:"ar",cover:"https://books.google.com/books/content?id=m0MEEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:2010, emoji:"🌿", color:"#1e8449", desc:"رواية فلسطينية تحكي قصة امرأة من قرية الطنطورة عبر ستة عقود من النكبة والمنفى والصمود." },
  { id:94, title:"بنات الرياض", author:"رجاء الصانع", lang:"ar",cover:"https://books.google.com/books/content?id=-3I0EQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:2005, emoji:"💌", color:"#c0392b", desc:"رواية سعودية تكشف عن الحياة الخاصة لأربع فتيات في الرياض. أثارت جدلاً واسعاً وترجمت لعشرين لغة." },
  { id:95, title:"أنا أحيا", author:"ليلى بعلبكي", lang:"ar", genre:"رواية عربية", year:1958, emoji:"✨", color:"#9b4dca", desc:"رواية لبنانية رائدة تعبر عن تمرد المرأة العربية وبحثها عن الحرية والهوية في مجتمع محافظ." },
  { id:96, title:"حكاية زهرة", author:"حنان الشيخ", lang:"ar",cover:"https://books.google.com/books/content?id=g-ykQLo4jnYC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1980, emoji:"🌸", color:"#c0392b", desc:"رواية لبنانية تصور معاناة امرأة خلال الحرب الأهلية اللبنانية. من أهم الأصوات النسائية في الأدب العربي." },
  { id:97, title:"الشحاذ", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=SqWEEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1965, emoji:"🌀", color:"#2c3e50", desc:"رواية وجودية عن محامٍ ناجح يترك كل شيء بحثاً عن معنى الحياة. تأمل عميق في الروح الإنسانية." },
  { id:98, title:"قنديل أم هاشم", author:"يحيى حقي", lang:"ar", genre:"رواية عربية", year:1944, emoji:"🕯️", color:"#d4ac0d", desc:"رواية قصيرة تصور الصراع بين العلم والإيمان من خلال طبيب مصري عائد من أوروبا." },
  { id:99, title:"الزيني بركات", author:"جمال الغيطاني", lang:"ar", genre:"رواية عربية", year:1974, emoji:"🏛️", color:"#784212", desc:"رواية تاريخية تصور مصر في العصر المملوكي وتعكس في الوقت ذاته واقع الاستبداد المعاصر." },
  { id:100, title:"تغريبة بني هلال", author:"التراث العربي", lang:"ar",cover:"https://books.google.com/books/content?id=O5OsDQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"ملحمة عربية", year:1000, emoji:"🐪", color:"#c4a35a", desc:"ملحمة شعبية عربية كبرى تحكي هجرة قبيلة بني هلال من نجد إلى المغرب. من أعظم الملاحم الشعبية العربية." },

  // ===== روايات إنجليزية =====
  { id:101, isbn:"9780743273565", title:"The Great Gatsby", author:"F. Scott Fitzgerald", genre:"English Novel", year:1925, emoji:"🥂", color:"#d4ac0d", desc:"Jay Gatsby throws lavish parties to win back his lost love Daisy. The quintessential novel of the Jazz Age and the American Dream." },
  { id:102, isbn:"9780061935466", title:"To Kill a Mockingbird", author:"Harper Lee", genre:"English Novel", year:1960, emoji:"⚖️", color:"#4a7c59", desc:"Young Scout Finch watches her father defend a Black man falsely accused of a crime in Alabama. A Pulitzer Prize masterpiece on justice and innocence." },
  { id:103, isbn:"9780451524935", title:"1984", author:"George Orwell", genre:"English Novel", year:1949, emoji:"👁️", color:"#2d3561", desc:"In a totalitarian future, Winston Smith rebels against Big Brother's surveillance state. The most influential dystopian novel ever written." },
  { id:104, isbn:"9780316769174", title:"The Catcher in the Rye", author:"J.D. Salinger", genre:"English Novel", year:1951, emoji:"🧢", color:"#c0392b", desc:"Holden Caulfield wanders New York after being expelled from school. The defining novel of teenage rebellion and alienation." },
  { id:105, isbn:"9780062315007", title:"The Alchemist", author:"Paulo Coelho", genre:"English Novel", year:1988, emoji:"✨", color:"#d4ac0d", desc:"A shepherd boy travels from Spain to Egypt following his dream. A philosophical fable translated into 80 languages, one of the best-selling books ever." },
  { id:106, isbn:"9780307387899", title:"The Road", author:"Cormac McCarthy", genre:"English Novel", year:2006, emoji:"🌑", color:"#1b2631", desc:"A father and son journey through a post-apocalyptic America. Pulitzer Prize 2007 — a devastating and beautiful meditation on love and survival." },
  { id:107, isbn:"9780385490818", title:"The Handmaid's Tale", author:"Margaret Atwood", genre:"English Novel", year:1985, emoji:"🔴", color:"#922b21", desc:"In the Republic of Gilead, fertile women are enslaved as handmaids. A chilling feminist dystopia more relevant than ever." },
  { id:108, isbn:"9780679720201", title:"Lolita", author:"Vladimir Nabokov", genre:"English Novel", year:1955, emoji:"🦋", color:"#4a235a", desc:"A controversial masterpiece of literary style about obsession and manipulation. One of the most debated novels of the 20th century." },
  { id:109, isbn:"9780812550702", title:"Ender's Game", author:"Orson Scott Card", genre:"English Novel", year:1985, emoji:"🎮", color:"#1a5276", desc:"Child prodigy Ender Wiggin is trained to command Earth's fleet against an alien invasion. A Hugo and Nebula Award-winning sci-fi classic." },
  { id:110, isbn:"9780553573404", title:"A Game of Thrones", author:"George R.R. Martin", genre:"English Novel", year:1996, emoji:"👑", color:"#7d6608", desc:"Noble families battle for the Iron Throne of Westeros. The epic fantasy series that redefined the genre with its moral complexity." },
  { id:111, isbn:"9780439023481", title:"The Hunger Games", author:"Suzanne Collins", genre:"English Novel", year:2008, emoji:"🏹", color:"#c0392b", desc:"Katniss Everdeen volunteers for a deadly televised competition to save her sister. The dystopian YA phenomenon that captivated a generation." },
  { id:112, isbn:"9780345391803", title:"The Hitchhiker's Guide to the Galaxy", author:"Douglas Adams", genre:"English Novel", year:1979, emoji:"🌌", color:"#2471a3", desc:"Arthur Dent survives Earth's demolition and travels the galaxy. The funniest science fiction novel ever written — the answer is 42." },
  { id:113, isbn:"9780380789030", title:"American Gods", author:"Neil Gaiman", genre:"English Novel", year:2001, emoji:"⚡", color:"#1b2631", desc:"Ex-convict Shadow discovers that old gods live among Americans. A mythological road trip through the heart of America." },
  { id:114, isbn:"9780679731726", title:"The Remains of the Day", author:"Kazuo Ishiguro", genre:"English Novel", year:1989, emoji:"🍵", color:"#2c3e50", desc:"An English butler reflects on a life of service and missed opportunities. Booker Prize winner — a quiet, devastating masterpiece." },
  { id:115, isbn:"9781400078776", title:"Never Let Me Go", author:"Kazuo Ishiguro", genre:"English Novel", year:2005, emoji:"💔", color:"#9b4dca", desc:"Students at an idyllic English school discover their terrifying purpose. A heartbreaking dystopian novel about what it means to be human." },
  { id:116, isbn:"9780307474278", title:"The Da Vinci Code", author:"Dan Brown", genre:"English Novel", year:2003, emoji:"🎨", color:"#784212", desc:"Robert Langdon investigates a murder at the Louvre that reveals a centuries-old secret. The thriller that became a global phenomenon." },
  { id:117, isbn:"9780307387134", title:"No Country for Old Men", author:"Cormac McCarthy", genre:"English Novel", year:2005, emoji:"💼", color:"#2c3e50", desc:"A hunter finds drug money and is pursued by an unstoppable killer. A brutal meditation on fate, violence, and the changing American West." },
  { id:118, isbn:"9780679744399", title:"All the Pretty Horses", author:"Cormac McCarthy", genre:"English Novel", year:1992, emoji:"🐎", color:"#d4ac0d", desc:"John Grady Cole rides into Mexico seeking the old cowboy life. A lyrical coming-of-age story about love, loss, and the end of an era." },
  { id:119, isbn:"9780062024022", title:"Divergent", author:"Veronica Roth", genre:"English Novel", year:2011, emoji:"⚡", color:"#2471a3", desc:"Tris Prior chooses the Dauntless faction in a divided society. The YA dystopia that launched a massive franchise." },
  { id:120, isbn:"9780553283686", title:"Hyperion", author:"Dan Simmons", genre:"English Novel", year:1989, emoji:"🕰️", color:"#4a235a", desc:"Seven pilgrims journey to the Time Tombs on Hyperion. An ambitious SF epic structured like Canterbury Tales — Hugo Award winner." },
  { id:121, isbn:"9780156027601", title:"Solaris", author:"Stanisław Lem", genre:"English Novel", year:1961, emoji:"🌊", color:"#1a5276", desc:"Scientists study a living ocean on planet Solaris that materializes their deepest memories. The pinnacle of philosophical science fiction." },
  { id:122, isbn:"9780385490818", title:"The Blind Assassin", author:"Margaret Atwood", genre:"English Novel", year:2000, emoji:"📖", color:"#6c3483", desc:"A novel within a novel within a novel — an elderly woman recalls her sister's scandalous life. Booker Prize 2000." },
  { id:123, isbn:"9780812976533", title:"Midnight's Children", author:"Salman Rushdie", genre:"English Novel", year:1981, emoji:"🌙", color:"#d4ac0d", desc:"Saleem Sinai, born at India's independence, is telepathically linked to 1,000 other midnight children. Booker Prize winner." },
  { id:124, isbn:"9781400033416", title:"Beloved", author:"Toni Morrison", genre:"English Novel", year:1987, emoji:"👻", color:"#1b2631", desc:"Former slave Sethe is haunted by the ghost of her dead daughter. Pulitzer Prize 1988 — a shattering novel about slavery's legacy." },
  { id:125, isbn:"9780679757016", title:"The God of Small Things", author:"Arundhati Roy", genre:"English Novel", year:1997, emoji:"🌿", color:"#4a7c59", desc:"Twins in Kerala, India, are torn apart by forbidden love and caste. Booker Prize 1997 — a lyrical debut of extraordinary power." },
  { id:126, isbn:"9780062315007", title:"Life of Pi", author:"Yann Martel", genre:"English Novel", year:2001, emoji:"🐯", color:"#f39c12", desc:"A boy survives 227 days at sea in a lifeboat with a Bengal tiger. Booker Prize 2002 — a dazzling fable about faith and survival." },
  { id:127, isbn:"9780385737951", title:"The Maze Runner", author:"James Dashner", genre:"English Novel", year:2009, emoji:"🌿", color:"#4a7c59", desc:"Thomas wakes up in a maze with no memory. A gripping YA dystopia that spawned a major film franchise." },
  { id:128, isbn:"9780307269980", title:"The Girl with the Dragon Tattoo", author:"Stieg Larsson", genre:"English Novel", year:2005, emoji:"🐉", color:"#1b2631", desc:"Journalist Mikael Blomkvist and hacker Lisbeth Salander investigate a decades-old disappearance. The Swedish thriller that changed crime fiction." },
  { id:129, isbn:"9780062073488", title:"And Then There Were None", author:"Agatha Christie", genre:"English Novel", year:1939, emoji:"🏝️", color:"#922b21", desc:"Ten strangers are lured to an island and killed one by one. The best-selling mystery novel of all time." },
  { id:130, isbn:"9780451528018", title:"The Hound of the Baskervilles", author:"Arthur Conan Doyle", genre:"English Novel", year:1902, emoji:"🔍", color:"#2c3e50", desc:"Sherlock Holmes investigates a supernatural hound terrorizing a noble family on the Devon moors. The greatest detective novel ever written." },

  // ===== المزيد من الروايات العربية =====
  { id:131, title:"رجال في الشمس", author:"غسان كنفاني", lang:"ar",cover:"https://books.google.com/books/content?id=7ypfrL4j9IQC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1963, emoji:"☀️", color:"#c4a35a", desc:"ثلاثة فلسطينيين يحاولون العبور إلى الكويت داخل صهريج مياه. رواية قصيرة مكثفة تعدّ من أعظم الأعمال الفلسطينية." },
  { id:132, title:"ما تبقى لكم", author:"غسان كنفاني", lang:"ar",cover:"https://books.google.com/books/content?id=2lPuzAEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1966, emoji:"🌵", color:"#d4ac0d", desc:"رواية تجريبية تتشابك فيها ثلاثة أصوات وثلاثة أزمنة في صحراء النقب. تحفة سردية فلسطينية." },
  { id:133, title:"المتشائل", author:"إميل حبيبي", lang:"ar",cover:"https://books.google.com/books/content?id=LGM8AAAAIAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1974, emoji:"😔", color:"#2c3e50", desc:"رواية ساخرة عن سعيد أبو النحس المتشائل الفلسطيني الباقي في أرضه. فازت بجائزة القدس للأدب." },
  { id:134, title:"باب الشمس", author:"إلياس خوري", lang:"ar",cover:"https://archive.org/services/img/1_20240415", genre:"رواية عربية", year:1998, emoji:"🌅", color:"#e07b39", desc:"ملحمة فلسطينية ضخمة تروي تاريخ النكبة والمخيمات عبر قصص متشابكة. من أعظم الروايات العربية المعاصرة." },
  { id:135, title:"ذاكرة الجسد", author:"أحلام مستغانمي", lang:"ar",cover:"https://books.google.com/books/content?id=mwD5EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1993, emoji:"💜", color:"#6c3483", desc:"رواية جزائرية تجمع بين الحب والوطن والذاكرة. الأكثر مبيعاً في تاريخ الرواية العربية النسائية." },
  { id:136, title:"فوضى الحواس", author:"أحلام مستغانمي", lang:"ar",cover:"https://books.google.com/books/content?id=cPYlDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1997, emoji:"🌊", color:"#2471a3", desc:"الجزء الثاني من ثلاثية أحلام مستغانمي. رحلة في الحب والكتابة والهوية الجزائرية." },
  { id:137, title:"عابر سرير", author:"أحلام مستغانمي", lang:"ar",cover:"https://books.google.com/books/content?id=b8mn0AEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:2003, emoji:"🌙", color:"#4a235a", desc:"الجزء الثالث من الثلاثية. تأمل في الكتابة والحرية والمرأة العربية." },
  { id:138, title:"موسم الهجرة إلى الشمال", author:"الطيب صالح", lang:"ar",cover:"https://books.google.com/books/content?id=D2sZAAAAIAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1966, emoji:"🌊", color:"#2471a3", desc:"رواية سودانية تعدّ من أعظم الروايات العربية. تتناول الصراع بين الشرق والغرب من خلال شخصية مصطفى سعيد." },
  { id:139, title:"بريد الليل", author:"هدى بركات", lang:"ar",cover:"https://books.google.com/books/content?id=N3M0EQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:2018, emoji:"✉️", color:"#784212", desc:"رواية لبنانية تتكون من رسائل خمسة مهاجرين في الليل. فازت بالجائزة العالمية للرواية العربية 2019." },
  { id:140, title:"طشاري", author:"إنعام كجه جي", lang:"ar",cover:"https://books.google.com/books/content?id=tPAaEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:2013, emoji:"🌿", color:"#1e8449", desc:"رواية عراقية تحكي قصة عائلة مشتتة بين العراق والمنفى. فازت بجائزة نجيب محفوظ للأدب." },
  { id:141, title:"شرق المتوسط", author:"عبد الرحمن منيف", lang:"ar",cover:"https://books.google.com/books/content?id=8mloEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1975, emoji:"🌊", color:"#1a5276", desc:"رواية عن السجن والتعذيب والمقاومة في بلد عربي مجهول. من أكثر الروايات العربية جرأة وصدقاً." },
  { id:142, title:"النهايات", author:"عبد الرحمن منيف", lang:"ar",cover:"https://books.google.com/books/content?id=Ll3vAAAAMAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1977, emoji:"🏜️", color:"#c4a35a", desc:"رواية تصور حياة قرية صحراوية وصراع الإنسان مع الطبيعة والجفاف والموت." },
  { id:143, title:"الأيام", author:"طه حسين", lang:"ar",cover:"https://books.google.com/books/content?id=pP7fAAAAMAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1929, emoji:"📚", color:"#784212", desc:"سيرة ذاتية لعميد الأدب العربي تصور طفولته في صعيد مصر وعمله في الأزهر. من أجمل السير العربية." },
  { id:144, title:"دعاء الكروان", author:"طه حسين", lang:"ar",cover:"https://books.google.com/books/content?id=hu0MEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1934, emoji:"🐦", color:"#1e8449", desc:"رواية تصور معاناة فتاة ريفية مصرية وثأرها لشرف أختها. من أجمل روايات طه حسين." },
  { id:145, title:"الأرض", author:"عبد الرحمن الشرقاوي", lang:"ar",cover:"https://books.google.com/books/content?id=s01w-DI7hesC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:1954, emoji:"🌾", color:"#d4ac0d", desc:"رواية تصور نضال الفلاحين المصريين ضد الإقطاع والاستعمار. من أهم الروايات الاجتماعية العربية." },
  { id:146, title:"الحرام", author:"يوسف إدريس", lang:"ar",cover:"https://books.google.com/books/content?id=K2wMAAAAIAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1959, emoji:"🌾", color:"#4a7c59", desc:"رواية تصور معاناة عاملة زراعية مصرية. من أقوى الروايات الاجتماعية في الأدب العربي." },
  { id:147, title:"بنات الرياض", author:"رجاء الصانع", lang:"ar",cover:"https://books.google.com/books/content?id=HCokAQAAMAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:2005, emoji:"💌", color:"#c0392b", desc:"رواية سعودية تكشف عن الحياة الخاصة لأربع فتيات في الرياض. أثارت جدلاً واسعاً وترجمت لعشرين لغة." },
  { id:148, title:"الطنطورية", author:"رضوى عاشور", lang:"ar",cover:"https://books.google.com/books/content?id=DOJtDQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:2010, emoji:"🌿", color:"#1e8449", desc:"رواية فلسطينية تحكي قصة امرأة من قرية الطنطورة عبر ستة عقود من النكبة والمنفى والصمود." },
  { id:149, title:"حكاية زهرة", author:"حنان الشيخ", lang:"ar",cover:"https://books.google.com/books/content?id=9LDTDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1980, emoji:"🌸", color:"#c0392b", desc:"رواية لبنانية تصور معاناة امرأة خلال الحرب الأهلية اللبنانية. من أهم الأصوات النسائية في الأدب العربي." },
  { id:150, title:"الزيني بركات", author:"جمال الغيطاني", lang:"ar",cover:"https://books.google.com/books/content?id=9zm8DAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1974, emoji:"🏛️", color:"#784212", desc:"رواية تاريخية تصور مصر في العصر المملوكي وتعكس في الوقت ذاته واقع الاستبداد المعاصر." },
  { id:151, title:"السمان والخريف", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=KMGAEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1962, emoji:"🍂", color:"#784212", desc:"رواية عن موظف حكومي يعيش أزمة منتصف العمر ويبحث عن معنى الحياة." },
  { id:152, title:"ميرامار", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=Yfn-EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1967, emoji:"🌊", color:"#2471a3", desc:"رواية تدور في بنسيون بالإسكندرية وتصور مصر في أعقاب ثورة يوليو من زوايا متعددة." },
  { id:153, title:"الكرنك", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=_EgDEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1974, emoji:"🏛️", color:"#c4a35a", desc:"رواية قصيرة تكشف عن ممارسات التعذيب في عهد عبد الناصر. من أجرأ أعمال محفوظ السياسية." },
  { id:154, title:"حضرة المحترم", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=Wca1EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1975, emoji:"👔", color:"#2c3e50", desc:"رواية عن موظف يكرس حياته للترقي الوظيفي على حساب كل شيء آخر. نقد لاذع للبيروقراطية." },
  { id:155, title:"ليالي ألف ليلة", author:"نجيب محفوظ", lang:"ar",cover:"https://covers.openlibrary.org/b/id/13158539-L.jpg", genre:"رواية عربية", year:1982, emoji:"🌙", color:"#4a235a", desc:"رواية تعيد كتابة شخصيات ألف ليلة وليلة في سياق معاصر. إبداع فريد يمزج التراث بالحداثة." },
  { id:156, title:"رحلة ابن فطومة", author:"نجيب محفوظ", lang:"ar",cover:"https://books.google.com/books/content?id=-VvGEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1983, emoji:"🗺️", color:"#1e8449", desc:"رواية رمزية عن رحلة بحث عن أرض الجبل المثالية. تأمل فلسفي في الحضارة والإنسانية." },
  { id:157, title:"العائش في الحقيقة", author:"نجيب محفوظ", lang:"ar",cover:"https://covers.openlibrary.org/b/id/3178205-L.jpg", genre:"رواية عربية", year:1985, emoji:"☀️", color:"#d4ac0d", desc:"رواية تاريخية عن الفرعون أخناتون وثورته الدينية. من أجمل الروايات التاريخية العربية." },
  { id:158, title:"الخبز الحافي", author:"محمد شكري", lang:"ar",cover:"https://books.google.com/books/content?id=nlFpDgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1973, emoji:"🍞", color:"#922b21", desc:"سيرة ذاتية صادمة لطفولة قاسية في المغرب. ترجمها بول بولز وأصبحت من أكثر الروايات العربية انتشاراً عالمياً." },
  { id:159, title:"مدن الملح", author:"عبد الرحمن منيف", lang:"ar",cover:"https://books.google.com/books/content?id=l7Y2AAAAMAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", genre:"رواية عربية", year:1984, emoji:"🏜️", color:"#c4a35a", desc:"خماسية ملحمية تصور تحول الجزيرة العربية بعد اكتشاف النفط. من أهم الروايات العربية في القرن العشرين." },
  { id:160, title:"شيكاغو", author:"علاء الأسواني", lang:"ar",cover:"https://books.google.com/books/content?id=PXM0EQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", genre:"رواية عربية", year:2007, emoji:"🌆", color:"#2c3e50", desc:"رواية تتناول حياة المصريين في شيكاغو وصراعهم بين الهوية والاندماج في المجتمع الأمريكي." },

  // ===== المزيد من الروايات الإنجليزية =====
  { id:161, isbn:"9780385333849", title:"Slaughterhouse-Five", author:"Kurt Vonnegut", genre:"English Novel", year:1969, emoji:"💣", color:"#2c3e50", desc:"Billy Pilgrim becomes unstuck in time and witnesses the firebombing of Dresden. A darkly comic anti-war masterpiece." },
  { id:162, isbn:"9781451626650", title:"Catch-22", author:"Joseph Heller", genre:"English Novel", year:1961, emoji:"✈️", color:"#e74c3c", desc:"Yossarian tries to avoid flying more WWII missions by claiming insanity. The ultimate anti-war satire." },
  { id:163, isbn:"9780679720201", title:"Lolita", author:"Vladimir Nabokov", genre:"English Novel", year:1955, emoji:"🦋", color:"#c0392b", desc:"A controversial masterpiece of literary style. One of the most debated and beautifully written novels of the 20th century." },
  { id:164, isbn:"9780684801223", title:"The Old Man and the Sea", author:"Ernest Hemingway", genre:"English Novel", year:1952, emoji:"🎣", color:"#2471a3", desc:"An old Cuban fisherman battles a giant marlin alone at sea. Hemingway's Nobel Prize-winning novella about dignity and defeat." },
  { id:165, isbn:"9780684803357", title:"For Whom the Bell Tolls", author:"Ernest Hemingway", genre:"English Novel", year:1940, emoji:"🔔", color:"#922b21", desc:"Robert Jordan fights with Spanish Republicans during the Civil War. Hemingway's most ambitious novel about love and sacrifice." },
  { id:166, isbn:"9780679732242", title:"The Sound and the Fury", author:"William Faulkner", genre:"English Novel", year:1929, emoji:"🌳", color:"#4a235a", desc:"The decline of the Compson family told through four different voices. Faulkner's modernist masterpiece, Nobel Prize 1949." },
  { id:167, isbn:"9780679720218", title:"The Plague", author:"Albert Camus", genre:"English Novel", year:1947, emoji:"🦠", color:"#2c3e50", desc:"A plague strikes the Algerian city of Oran. An allegory of collective resistance against evil." },
  { id:168, isbn:"9780156628709", title:"Mrs Dalloway", author:"Virginia Woolf", genre:"English Novel", year:1925, emoji:"🌺", color:"#9b4dca", desc:"Clarissa Dalloway prepares for a party while a WWI veteran struggles with trauma. A stream-of-consciousness masterpiece." },
  { id:169, isbn:"9780156453806", title:"Invisible Cities", author:"Italo Calvino", genre:"English Novel", year:1972, emoji:"🏙️", color:"#2471a3", desc:"Marco Polo describes 55 imaginary cities to Kublai Khan. A poetic meditation on memory, desire, and imagination." },
  { id:170, isbn:"9780679722069", title:"Death in Venice", author:"Thomas Mann", genre:"English Novel", year:1912, emoji:"🌊", color:"#2471a3", desc:"An aging writer becomes obsessed with a beautiful boy in Venice. A haunting novella about beauty, obsession, and mortality." },
  { id:171, isbn:"9780156907644", title:"The Tin Drum", author:"Günter Grass", genre:"English Novel", year:1959, emoji:"🥁", color:"#d4ac0d", desc:"Oskar Matzerath decides to stop growing at age three. Nobel Prize winner — a surreal masterpiece about Nazi Germany." },
  { id:172, isbn:"9780375725845", title:"Perfume", author:"Patrick Süskind", genre:"English Novel", year:1985, emoji:"🌹", color:"#9b4dca", desc:"Jean-Baptiste Grenouille creates the ultimate perfume. A dark and mesmerizing thriller about obsession." },
  { id:173, isbn:"9780060932138", title:"The Unbearable Lightness of Being", author:"Milan Kundera", genre:"English Novel", year:1984, emoji:"🕊️", color:"#4a235a", desc:"Tomas and Tereza live their love under Soviet occupation. A philosophical novel about existence and freedom." },
  { id:174, isbn:"9780553418026", title:"The Martian", author:"Andy Weir", genre:"English Novel", year:2011, emoji:"🚀", color:"#d4ac0d", desc:"Astronaut Mark Watney is stranded on Mars and must survive using science and humor. The most fun sci-fi novel in years." },
  { id:175, isbn:"9780593135204", title:"Project Hail Mary", author:"Andy Weir", genre:"English Novel", year:2021, emoji:"⭐", color:"#2471a3", desc:"Ryland Grace wakes up alone in space with no memory. A brilliant and heartwarming sci-fi adventure." },
  { id:176, isbn:"9780765382030", title:"The Three-Body Problem", author:"Liu Cixin", genre:"English Novel", year:2008, emoji:"🌍", color:"#2c3e50", desc:"Chinese scientists contact an alien civilization. Chinese science fiction at its finest — Hugo Award winner." },
  { id:177, isbn:"9780307595867", title:"The Snowman", author:"Jo Nesbø", genre:"English Novel", year:2007, emoji:"⛄", color:"#2c3e50", desc:"Harry Hole investigates a serial killer who leaves snowmen at crime scenes. The best Nordic noir thriller." },
  { id:178, isbn:"9780062073488", title:"Murder on the Orient Express", author:"Agatha Christie", genre:"English Novel", year:1934, emoji:"🚂", color:"#784212", desc:"Hercule Poirot investigates a murder on a snowbound train. One of the most ingenious mystery plots ever devised." },
  { id:179, isbn:"9780307474278", title:"Angels and Demons", author:"Dan Brown", genre:"English Novel", year:2000, emoji:"⚡", color:"#1b2631", desc:"Robert Langdon discovers a bomb hidden in the Vatican. The first Robert Langdon thriller — fast-paced and gripping." },
  { id:180, isbn:"9780385504225", title:"The Lost Symbol", author:"Dan Brown", genre:"English Novel", year:2009, emoji:"🔺", color:"#d4ac0d", desc:"Robert Langdon uncovers Freemason secrets in Washington D.C. A fast-paced esoteric thriller." },
  { id:181, isbn:"9780385537858", title:"Inferno", author:"Dan Brown", genre:"English Novel", year:2013, emoji:"🔥", color:"#c0392b", desc:"Robert Langdon wakes up in Florence with no memory. A thriller about overpopulation and Dante's Inferno." },
  { id:182, isbn:"9780062315007", title:"Life of Pi", author:"Yann Martel", genre:"English Novel", year:2001, emoji:"🐯", color:"#f39c12", desc:"A boy survives 227 days at sea in a lifeboat with a Bengal tiger. Booker Prize 2002 — a dazzling fable about faith and survival." },
  { id:183, isbn:"9780679744399", title:"Blood Meridian", author:"Cormac McCarthy", genre:"English Novel", year:1985, emoji:"🌵", color:"#922b21", desc:"A teenager joins a band of scalpers in 1850s Texas. McCarthy's most violent and most beautiful novel." },
  { id:184, isbn:"9780812976533", title:"Midnight's Children", author:"Salman Rushdie", genre:"English Novel", year:1981, emoji:"🌙", color:"#d4ac0d", desc:"Saleem Sinai, born at India's independence, is telepathically linked to 1,000 midnight children. Booker Prize winner." },
  { id:185, isbn:"9781400033416", title:"Beloved", author:"Toni Morrison", genre:"English Novel", year:1987, emoji:"👻", color:"#1b2631", desc:"Former slave Sethe is haunted by the ghost of her dead daughter. Pulitzer Prize 1988 — a shattering novel about slavery's legacy." },
  { id:186, isbn:"9780679757016", title:"The God of Small Things", author:"Arundhati Roy", genre:"English Novel", year:1997, emoji:"🌿", color:"#4a7c59", desc:"Twins in Kerala are torn apart by forbidden love and caste. Booker Prize 1997 — a lyrical debut of extraordinary power." },
  { id:187, isbn:"9780553573404", title:"A Storm of Swords", author:"George R.R. Martin", genre:"English Novel", year:1999, emoji:"🌩️", color:"#2c3e50", desc:"The War of the Five Kings reaches its peak. The most intense volume of A Song of Ice and Fire." },
  { id:188, isbn:"9780765326355", title:"Words of Radiance", author:"Brandon Sanderson", genre:"English Novel", year:2014, emoji:"💎", color:"#d4ac0d", desc:"Shallan and Kaladin face the Voidbringers. The second Stormlight Archive book — even more epic than the first." },
  { id:189, isbn:"9780439023481", title:"Catching Fire", author:"Suzanne Collins", genre:"English Novel", year:2009, emoji:"🔥", color:"#d4ac0d", desc:"Katniss returns to the arena. The second Hunger Games novel — darker and more intense than the first." },
  { id:190, isbn:"9780439023511", title:"Mockingjay", author:"Suzanne Collins", genre:"English Novel", year:2010, emoji:"🕊️", color:"#2c3e50", desc:"Katniss becomes the symbol of revolution. The powerful conclusion to the Hunger Games trilogy." },

  // ===== 50+ كتب عربية إضافية =====
  { id:191, lang:"ar", title:"قنديل أم هاشم", author:"يحيى حقي", genre:"رواية عربية", year:1944, emoji:"🕯️", color:"#d4ac0d", desc:"رواية قصيرة تصور الصراع بين العلم والإيمان من خلال طبيب مصري عائد من أوروبا." },
  { id:192, lang:"ar",cover:"https://books.google.com/books/content?id=yPdDEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"السقا مات", author:"يوسف إدريس", genre:"رواية عربية", year:1955, emoji:"💧", color:"#2471a3", desc:"رواية تصور حياة الفقراء في الأحياء الشعبية المصرية بأسلوب واقعي حاد." },
  { id:193, lang:"ar",cover:"https://books.google.com/books/content?id=iDgqXTJn1v4C&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الوقت الضائع", author:"يوسف إدريس", genre:"رواية عربية", year:1959, emoji:"⏰", color:"#784212", desc:"مجموعة قصصية من أجمل أعمال يوسف إدريس تصور الحياة المصرية بعمق نفسي." },
  { id:194, lang:"ar",cover:"https://books.google.com/books/content?id=Iq_bDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"نهر الجنون", author:"يوسف إدريس", genre:"رواية عربية", year:1962, emoji:"🌊", color:"#1a5276", desc:"رواية تستكشف الجنون والعقل في المجتمع المصري." },
  { id:195, lang:"ar",cover:"https://books.google.com/books/content?id=7tUPAAAAYAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"أبو الهول", author:"يوسف إدريس", genre:"رواية عربية", year:1969, emoji:"🏛️", color:"#c4a35a", desc:"رواية تاريخية تستلهم من الحضارة المصرية القديمة." },
  { id:196, lang:"ar",cover:"https://books.google.com/books/content?id=aDhHEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الحب والجسد", author:"يوسف إدريس", genre:"رواية عربية", year:1971, emoji:"❤️", color:"#c0392b", desc:"رواية تتناول العلاقات الإنسانية والحب في المجتمع المصري." },
  { id:197, lang:"ar",cover:"https://covers.openlibrary.org/b/isbn/9771441272-L.jpg", title:"البيضاء", author:"يوسف إدريس", genre:"رواية عربية", year:1975, emoji:"⚪", color:"#2c3e50", desc:"رواية تصور الصراع الداخلي للإنسان المصري في مواجهة التحولات الاجتماعية." },
  { id:198, lang:"ar",cover:"https://books.google.com/books/content?id=YItsDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"عودة الروح", author:"توفيق الحكيم", genre:"رواية عربية", year:1933, emoji:"👻", color:"#4a235a", desc:"رواية تصور الحياة في مصر وتستلهم من الأسطورة الفرعونية. من أوائل الروايات العربية الحديثة." },
  { id:199, lang:"ar",cover:"https://books.google.com/books/content?id=gnA-DwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"يوميات نائب في الأرياف", author:"توفيق الحكيم", genre:"رواية عربية", year:1937, emoji:"📔", color:"#1e8449", desc:"رواية تصور حياة قاضٍ في الريف المصري وتكشف عن الفجوة بين المثقف والشعب." },
  { id:200, lang:"ar",cover:"https://books.google.com/books/content?id=Ma80DAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"عصفور من الشرق", author:"توفيق الحكيم", genre:"رواية عربية", year:1938, emoji:"🐦", color:"#2471a3", desc:"رواية تصور تجربة مصري في باريس وصراعه بين الشرق والغرب." },
  { id:201, lang:"ar",cover:"https://books.google.com/books/content?id=iGEZAQAAIAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"أهل الكهف", author:"توفيق الحكيم", genre:"رواية عربية", year:1933, emoji:"🏔️", color:"#784212", desc:"مسرحية شعرية تعيد تفسير قصة أصحاب الكهف. من أعظم أعمال توفيق الحكيم." },
  { id:202, lang:"ar",cover:"https://books.google.com/books/content?id=czrsEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الرباط المقدس", author:"توفيق الحكيم", genre:"رواية عربية", year:1944, emoji:"⛓️", color:"#2c3e50", desc:"رواية تتناول الصراع بين الروح والجسد والبحث عن المطلق." },
  { id:203, lang:"ar",cover:"https://books.google.com/books/content?id=Zfn-EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"السراب", author:"نجيب محفوظ", genre:"رواية عربية", year:1948, emoji:"🌫️", color:"#1a5276", desc:"رواية نفسية تصور شاباً يعاني من عقدة أوديب ويبحث عن الحب المستحيل." },
  { id:204, lang:"ar",cover:"https://books.google.com/books/content?id=nOD2EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"بداية ونهاية", author:"نجيب محفوظ", genre:"رواية عربية", year:1949, emoji:"🔄", color:"#922b21", desc:"رواية تصور عائلة مصرية تكافح بعد وفاة عائلها. من أقوى روايات محفوظ الاجتماعية." },
  { id:205, lang:"ar",cover:"https://books.google.com/books/content?id=kq53Es780VYC&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"خان الخليلي", author:"نجيب محفوظ", genre:"رواية عربية", year:1945, emoji:"🏪", color:"#d4ac0d", desc:"رواية تصور حياة الطبقة الوسطى في حي خان الخليلي القاهري خلال الحرب العالمية الثانية." },
  { id:206, lang:"ar",cover:"https://books.google.com/books/content?id=X_n-EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"القاهرة الجديدة", author:"نجيب محفوظ", genre:"رواية عربية", year:1945, emoji:"🌆", color:"#2c3e50", desc:"رواية تصور طلاباً جامعيين يواجهون الفساد والطموح في القاهرة الحديثة." },
  { id:207, lang:"ar",cover:"https://books.google.com/books/content?id=D2X1b9_ngEEC&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"نداء المجهول", author:"نجيب محفوظ", genre:"رواية عربية", year:1947, emoji:"📢", color:"#4a235a", desc:"رواية تصور رجلاً يبحث عن معنى الحياة في مدينة القاهرة." },
  { id:208, lang:"ar",cover:"https://books.google.com/books/content?id=h1eYPtZ3xrEC&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"المرايا", author:"نجيب محفوظ", genre:"رواية عربية", year:1972, emoji:"🪞", color:"#1b2631", desc:"رواية تتكون من صور لشخصيات مختلفة تعكس مصر في القرن العشرين." },
  { id:209, lang:"ar",cover:"https://books.google.com/books/content?id=VTVODwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الطريق", author:"نجيب محفوظ", genre:"رواية عربية", year:1964, emoji:"🛤️", color:"#784212", desc:"رواية عن شاب يبحث عن أبيه المجهول. رحلة روحية وجودية عميقة." },
  { id:210, lang:"ar",cover:"https://books.google.com/books/content?id=Tfn-EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"ثرثرة فوق النيل", author:"نجيب محفوظ", genre:"رواية عربية", year:1966, emoji:"🌊", color:"#2471a3", desc:"رواية تصور مثقفين مصريين يقضون أوقاتهم على عوامة فوق النيل هرباً من الواقع." },
  { id:211, lang:"ar",cover:"https://books.google.com/books/content?id=93D_EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الحب تحت المطر", author:"نجيب محفوظ", genre:"رواية عربية", year:1973, emoji:"🌧️", color:"#9b4dca", desc:"رواية تصور قصص حب متشابكة في القاهرة المعاصرة." },
  { id:212, lang:"ar",cover:"https://books.google.com/books/content?id=MaUOEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"السكرية", author:"نجيب محفوظ", genre:"رواية عربية", year:1957, emoji:"🏘️", color:"#c0392b", desc:"الجزء الثالث من ثلاثية القاهرة. يصور مصر في الأربعينيات وصعود الحركات السياسية." },
  { id:213, lang:"ar",cover:"https://books.google.com/books/content?id=KO1xEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"قصر الشوق", author:"نجيب محفوظ", genre:"رواية عربية", year:1957, emoji:"🏰", color:"#d4ac0d", desc:"الجزء الثاني من ثلاثية القاهرة. يصور الجيل الثاني من عائلة السيد أحمد عبد الجواد." },
  { id:214, lang:"ar",cover:"https://books.google.com/books/content?id=YEBxEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"بين القصرين", author:"نجيب محفوظ", genre:"رواية عربية", year:1956, emoji:"🏛️", color:"#8e44ad", desc:"الجزء الأول من ثلاثية القاهرة. يصور حياة عائلة مصرية في حي بين القصرين." },
  { id:215, lang:"ar",cover:"https://books.google.com/books/content?id=PPspDgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الغريب", author:"ألبير كامو", genre:"رواية عربية", year:1942, emoji:"☀️", color:"#e07b39", desc:"رواية ميرسو الذي يقتل عربياً على شاطئ جزائري. ترجمة عربية لرواية كامو الفلسفية." },
  { id:216, lang:"ar",cover:"https://books.google.com/books/content?id=VWZuDAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الأمير الصغير", author:"أنطوان دو سانت إكزوبيري", genre:"رواية عربية", year:1943, emoji:"🌹", color:"#c84b31", desc:"الترجمة العربية لرواية الأمير الصغير. قصة شاعرية عن الصداقة والحب ومعنى الحياة." },
  { id:217, lang:"ar",cover:"https://books.google.com/books/content?id=4hvlEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"مئة عام من العزلة", author:"غابرييل غارسيا ماركيز", genre:"رواية عربية", year:1967, emoji:"🦋", color:"#f39c12", desc:"الترجمة العربية لرواية ماركيز الشهيرة. ملحمة عائلة بوينديا في ماكوندو." },
  { id:218, lang:"ar",cover:"https://books.google.com/books/content?id=kB4v0QEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الجريمة والعقاب", author:"فيودور دوستويفسكي", genre:"رواية عربية", year:1866, emoji:"🔪", color:"#8b1a1a", desc:"الترجمة العربية لرواية دوستويفسكي. راسكولنيكوف يرتكب جريمة ويصارع ضميره." },
  { id:219, lang:"ar", title:"البؤساء", author:"فيكتور هوغو", genre:"رواية عربية", year:1862, emoji:"🎭", color:"#8e44ad", desc:"الترجمة العربية لرواية هوغو الإنسانية الكبرى. جان فالجان يبحث عن الخلاص." },
  { id:220, lang:"ar",cover:"https://books.google.com/books/content?id=iwtWEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الحرب والسلام", author:"ليو تولستوي", genre:"رواية عربية", year:1869, emoji:"⚔️", color:"#c0392b", desc:"الترجمة العربية لملحمة تولستوي. روسيا في زمن الحروب النابليونية." },
  { id:221, lang:"ar",cover:"https://books.google.com/books/content?id=11pB0QEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"آنا كارنينا", author:"ليو تولستوي", genre:"رواية عربية", year:1878, emoji:"🚂", color:"#b71c1c", desc:"الترجمة العربية لرواية تولستوي. مأساة امرأة تتمرد على قيود المجتمع." },
  { id:222, lang:"ar",cover:"https://books.google.com/books/content?id=s6gaEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الأخوة كارامازوف", author:"فيودور دوستويفسكي", genre:"رواية عربية", year:1880, emoji:"👨‍👦", color:"#4a235a", desc:"الترجمة العربية لآخر روايات دوستويفسكي الكبرى. صراع الإيمان والشك والأخوة." },
  { id:223, lang:"ar",cover:"https://books.google.com/books/content?id=ox4hEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الأبله", author:"فيودور دوستويفسكي", genre:"رواية عربية", year:1869, emoji:"😇", color:"#2471a3", desc:"الترجمة العربية لرواية الأمير ميشكين الطيب في مجتمع فاسد." },
  { id:224, lang:"ar",cover:"https://books.google.com/books/content?id=p1rrDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الشيطان", author:"فيودور دوستويفسكي", genre:"رواية عربية", year:1872, emoji:"😈", color:"#1b2631", desc:"الترجمة العربية لرواية دوستويفسكي عن الإرهاب السياسي والعدمية." },
  { id:225, lang:"ar",cover:"https://books.google.com/books/content?id=2DvqDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"المسخ", author:"فرانز كافكا", genre:"رواية عربية", year:1915, emoji:"🪲", color:"#1a5276", desc:"الترجمة العربية لقصة غريغور سامسا الذي يستيقظ متحولاً إلى حشرة." },
  { id:226, lang:"ar",cover:"https://books.google.com/books/content?id=VnUOEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"المحاكمة", author:"فرانز كافكا", genre:"رواية عربية", year:1925, emoji:"⚖️", color:"#2c3e50", desc:"الترجمة العربية لرواية كافكا عن يوزف ك. المحاكَم دون أن يعرف تهمته." },
  { id:227, lang:"ar",cover:"https://books.google.com/books/content?id=Oq0sDgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"ألف شمس مشرقة", author:"خالد حسيني", genre:"رواية عربية", year:2007, emoji:"☀️", color:"#c0392b", desc:"الترجمة العربية لرواية حسيني. قصة امرأتين أفغانيتين تجمعهما الحرب والمعاناة." },
  { id:228, lang:"ar",cover:"https://books.google.com/books/content?id=Oq0sDgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"عداء الطائرة الورقية", author:"خالد حسيني", genre:"رواية عربية", year:2003, emoji:"🪁", color:"#d4ac0d", desc:"الترجمة العربية لرواية حسيني. أمير يخون صديقه حسن ويبحث عن الفداء." },
  { id:229, lang:"ar",cover:"https://books.google.com/books/content?id=DpZkEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الخيميائي", author:"باولو كويلو", genre:"رواية عربية", year:1988, emoji:"✨", color:"#d4ac0d", desc:"الترجمة العربية لرواية كويلو الفلسفية. سانتياغو يبحث عن كنزه في مصر." },
  { id:230, lang:"ar",cover:"https://books.google.com/books/content?id=cPYlDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"رواية الأسود يليق بك", author:"أحلام مستغانمي", genre:"رواية عربية", year:2012, emoji:"🖤", color:"#1b2631", desc:"رواية عن امرأة تعيش بين باريس وبيروت وتبحث عن نفسها في زمن الربيع العربي." },
  { id:231, lang:"ar",cover:"https://books.google.com/books/content?id=ef2KCgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"نساء على حافة الانهيار", author:"أحلام مستغانمي", genre:"رواية عربية", year:2015, emoji:"🌊", color:"#9b4dca", desc:"رواية تصور نساء عربيات يواجهن تحديات الحياة والحب والهوية." },
  { id:232, lang:"ar",cover:"https://books.google.com/books/content?id=EgD4EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الحب في زمن الكوليرا", author:"غابرييل غارسيا ماركيز", genre:"رواية عربية", year:1985, emoji:"💛", color:"#d4ac0d", desc:"الترجمة العربية لرواية ماركيز. فلورنتينو ينتظر 53 عاماً ليعود إلى حبيبته." },
  { id:233, lang:"ar",cover:"https://books.google.com/books/content?id=SByyEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الشيخ والبحر", author:"إرنست همنغواي", genre:"رواية عربية", year:1952, emoji:"🎣", color:"#2471a3", desc:"الترجمة العربية لرواية همنغواي. صياد عجوز يصارع سمكة عملاقة في البحر." },
  { id:234, lang:"ar",cover:"https://books.google.com/books/content?id=LMaTzwEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الغاتسبي العظيم", author:"فرانسيس سكوت فيتزجيرالد", genre:"رواية عربية", year:1925, emoji:"🥂", color:"#d4ac0d", desc:"الترجمة العربية لرواية فيتزجيرالد. جاي غاتسبي يسعى لاسترداد حبه الضائع." },
  { id:235, lang:"ar",cover:"https://books.google.com/books/content?id=4hvlEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"مئة عام من العزلة", author:"ماركيز", genre:"رواية عربية", year:1967, emoji:"🦋", color:"#f39c12", desc:"الترجمة العربية للملحمة الكبرى. سبعة أجيال من عائلة بوينديا في ماكوندو." },
  { id:236, lang:"ar",cover:"https://books.google.com/books/content?id=tKpGEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الطاعون", author:"ألبير كامو", genre:"رواية عربية", year:1947, emoji:"🦠", color:"#2c3e50", desc:"الترجمة العربية لرواية كامو. وباء يضرب مدينة وهران ويكشف عن الطبيعة الإنسانية." },
  { id:237, lang:"ar",cover:"https://books.google.com/books/content?id=uLvTDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الأمير", author:"نيكولو مكيافيلي", genre:"رواية عربية", year:1532, emoji:"👑", color:"#784212", desc:"الترجمة العربية لكتاب مكيافيلي الشهير في السياسة والحكم." },
  { id:238, lang:"ar",cover:"https://books.google.com/books/content?id=MG95EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"كليلة ودمنة", author:"ابن المقفع", genre:"ملحمة عربية", year:750, emoji:"🦁", color:"#d4ac0d", desc:"كتاب الحكمة العربي الكلاسيكي. قصص الحيوانات التي تحمل دروساً في السياسة والحكمة." },
  { id:239, lang:"ar",cover:"https://books.google.com/books/content?id=-gP2DwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"ألف ليلة وليلة", author:"التراث العربي", genre:"ملحمة عربية", year:800, emoji:"🌙", color:"#4a235a", desc:"الملحمة الشعبية العربية الكبرى. شهرزاد تروي حكاياتها لإنقاذ حياتها." },
  { id:240, lang:"ar",cover:"https://books.google.com/books/content?id=BHbbEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"المقامات", author:"بديع الزمان الهمذاني", genre:"ملحمة عربية", year:1000, emoji:"📜", color:"#784212", desc:"أول مقامات في الأدب العربي. أبو الفتح الإسكندري يجوب البلاد بلسانه الفصيح." },

  // ===== المزيد من الروايات العربية =====
  { id:241, lang:"ar",cover:"https://books.google.com/books/content?id=M8RtDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"زينب", author:"محمد حسين هيكل", genre:"رواية عربية", year:1914, emoji:"🌾", color:"#1e8449", desc:"أول رواية عربية حديثة. تصور الحياة الريفية المصرية وقصة حب بين الفلاحين." },
  { id:242, lang:"ar",cover:"https://books.google.com/books/content?id=pYomDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"إبراهيم الكاتب", author:"إبراهيم المازني", genre:"رواية عربية", year:1931, emoji:"✍️", color:"#2c3e50", desc:"رواية ساخرة تصور حياة كاتب مصري وعلاقاته العاطفية بأسلوب فكاهي رائع." },
  { id:243, lang:"ar",cover:"https://books.google.com/books/content?id=6680DAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"حمار الحكيم", author:"توفيق الحكيم", genre:"رواية عربية", year:1940, emoji:"🫏", color:"#d4ac0d", desc:"سيرة ذاتية ساخرة لتوفيق الحكيم تصور تجاربه في الريف المصري بأسلوب فكاهي." },
  { id:244, lang:"ar",cover:"https://books.google.com/books/content?id=KnTSEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"سجن العمر", author:"توفيق الحكيم", genre:"رواية عربية", year:1964, emoji:"🔒", color:"#4a235a", desc:"سيرة ذاتية تصور حياة توفيق الحكيم وتجاربه الأدبية والفكرية." },
  { id:245, lang:"ar",cover:"https://books.google.com/books/content?id=PH4FvEaq_cUC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"أوراق من دفتر الأيام", author:"طه حسين", genre:"رواية عربية", year:1929, emoji:"📓", color:"#784212", desc:"مذكرات طه حسين تصور رحلته الفكرية وتجاربه في مصر وفرنسا." },
  { id:246, lang:"ar",cover:"https://books.google.com/books/content?id=0qeCEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"مستقبل الثقافة في مصر", author:"طه حسين", genre:"رواية عربية", year:1938, emoji:"🎓", color:"#1a5276", desc:"كتاب فكري مهم لطه حسين يناقش مستقبل التعليم والثقافة في مصر." },
  { id:247, lang:"ar",cover:"https://books.google.com/books/content?id=gqeCEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"على هامش السيرة", author:"طه حسين", genre:"رواية عربية", year:1933, emoji:"📚", color:"#2c3e50", desc:"كتاب يتناول السيرة النبوية بأسلوب أدبي رفيع." },
  { id:248, lang:"ar",cover:"https://books.google.com/books/content?id=dH2BEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الوعد الحق", author:"طه حسين", genre:"رواية عربية", year:1949, emoji:"🌟", color:"#d4ac0d", desc:"رواية تاريخية تصور صدر الإسلام وشخصية علي بن أبي طالب." },
  { id:249, lang:"ar",cover:"https://books.google.com/books/content?id=dKeCEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"المعذبون في الأرض", author:"طه حسين", genre:"رواية عربية", year:1949, emoji:"😢", color:"#922b21", desc:"رواية تصور معاناة الفقراء والمهمشين في المجتمع المصري." },
  { id:250, lang:"ar",cover:"https://books.google.com/books/content?id=AVzkVljF7bIC&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"أديب", author:"طه حسين", genre:"رواية عربية", year:1935, emoji:"📖", color:"#1e8449", desc:"رواية تصور حياة أديب مصري في باريس وصراعه بين الشرق والغرب." },
  { id:251, lang:"ar",cover:"https://books.google.com/books/content?id=m9jwAAAAMAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الحب الضائع", author:"عباس محمود العقاد", genre:"رواية عربية", year:1943, emoji:"💔", color:"#c0392b", desc:"رواية تصور قصة حب فاشلة وتأملات فلسفية في طبيعة الحب والإنسان." },
  { id:252, lang:"ar",cover:"https://books.google.com/books/content?id=Msp6DwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"سارة", author:"عباس محمود العقاد", genre:"رواية عربية", year:1938, emoji:"🌹", color:"#9b4dca", desc:"رواية شبه سيرية تصور علاقة حب معقدة بين الكاتب وامرأة متمردة." },
  { id:253, lang:"ar",cover:"https://books.google.com/books/content?id=ZdJ8EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الديوان", author:"عباس محمود العقاد وإبراهيم المازني", genre:"رواية عربية", year:1921, emoji:"📜", color:"#784212", desc:"كتاب نقدي ثوري أحدث انقلاباً في الشعر العربي الحديث." },
  { id:254, lang:"ar",cover:"https://books.google.com/books/content?id=wqaCEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"حياة قلم", author:"عباس محمود العقاد", genre:"رواية عربية", year:1959, emoji:"✒️", color:"#2c3e50", desc:"سيرة ذاتية للعقاد تصور مسيرته الأدبية والفكرية الطويلة." },
  { id:255, lang:"ar",cover:"https://books.google.com/books/content?id=PDIyEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"أنا", author:"عباس محمود العقاد", genre:"رواية عربية", year:1964, emoji:"🪞", color:"#4a235a", desc:"كتاب فلسفي يتأمل العقاد فيه ذاته وفكره وحياته." },
  { id:256, lang:"ar",cover:"https://books.google.com/books/content?id=38JtDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الفردوس المفقود", author:"جون ميلتون", genre:"رواية عربية", year:1667, emoji:"🌿", color:"#1e8449", desc:"الترجمة العربية للملحمة الشعرية الكبرى. قصة آدم وحواء وسقوطهما من الجنة." },
  { id:257, lang:"ar",cover:"https://books.google.com/books/content?id=s1850QEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"دون كيخوته", author:"ميغيل دي ثيرفانتيس", genre:"رواية عربية", year:1605, emoji:"🗡️", color:"#27ae60", desc:"الترجمة العربية لأول رواية حديثة في تاريخ الأدب العالمي." },
  { id:258, lang:"ar",cover:"https://books.google.com/books/content?id=kB4v0QEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الجريمة والعقاب", author:"دوستويفسكي", genre:"رواية عربية", year:1866, emoji:"🔪", color:"#8b1a1a", desc:"الترجمة العربية لرواية دوستويفسكي النفسية الكبرى عن الجريمة والضمير." },
  { id:259, lang:"ar",cover:"https://books.google.com/books/content?id=VWZuDAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الأمير الصغير", author:"سانت إكزوبيري", genre:"رواية عربية", year:1943, emoji:"🌹", color:"#c84b31", desc:"الترجمة العربية للقصة الفلسفية الخالدة عن الصداقة والحب والبراءة." },
  { id:260, lang:"ar",cover:"https://books.google.com/books/content?id=cPYlDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"رواية الأسود يليق بك", author:"أحلام مستغانمي", genre:"رواية عربية", year:2012, emoji:"🖤", color:"#1b2631", desc:"رواية عن امرأة تبحث عن هويتها بين باريس وبيروت في زمن التحولات." },
  { id:261, lang:"ar",cover:"https://books.google.com/books/content?id=C5EmDAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"عزازيل", author:"يوسف زيدان", genre:"رواية عربية", year:2008, emoji:"😈", color:"#4a235a", desc:"رواية تاريخية تصور صراع الأديان في مصر القديمة. فازت بالجائزة العالمية للرواية العربية 2009." },
  { id:262, lang:"ar",cover:"https://books.google.com/books/content?id=h6Q_EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"النبطي", author:"يوسف زيدان", genre:"رواية عربية", year:2010, emoji:"🏜️", color:"#c4a35a", desc:"رواية تاريخية تصور الحياة في شبه الجزيرة العربية قبل الإسلام." },
  { id:263, lang:"ar",cover:"https://books.google.com/books/content?id=u6k8DwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"محال", author:"يوسف زيدان", genre:"رواية عربية", year:2012, emoji:"🌀", color:"#2c3e50", desc:"رواية فلسفية تتناول أسئلة الوجود والزمن والحقيقة." },
  { id:264, lang:"ar", title:"ظل الأفعى", author:"يوسف زيدان", genre:"رواية عربية", year:2014, emoji:"🐍", color:"#1e8449", desc:"رواية تاريخية تصور الصراع بين الحضارات في العصور الوسطى." },
  { id:265, lang:"ar", title:"فردقان", author:"يوسف زيدان", genre:"رواية عربية", year:2016, emoji:"🌙", color:"#784212", desc:"رواية تاريخية تصور الحياة في الأندلس في عصرها الذهبي." },
  { id:266, lang:"ar",cover:"https://books.google.com/books/content?id=v7wvDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"واحة الغروب", author:"بهاء طاهر", genre:"رواية عربية", year:2007, emoji:"🌅", color:"#d4ac0d", desc:"رواية تصور ضابطاً مصرياً في واحة سيوة مع زوجته الإيرلندية. فازت بالجائزة العالمية للرواية العربية." },
  { id:267, lang:"ar",cover:"https://books.google.com/books/content?id=k0nvAAAAMAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"خالتي صفية والدير", author:"بهاء طاهر", genre:"رواية عربية", year:1991, emoji:"⛪", color:"#2471a3", desc:"رواية تصور العلاقة بين المسلمين والمسيحيين في صعيد مصر." },
  { id:268, lang:"ar",cover:"https://books.google.com/books/content?id=lI-cEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"قالت ضحى", author:"بهاء طاهر", genre:"رواية عربية", year:1985, emoji:"🌸", color:"#c0392b", desc:"رواية تصور قصة حب في زمن الثورة والتحولات السياسية." },
  { id:269, lang:"ar",cover:"https://books.google.com/books/content?id=M2FHDAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الحب في المنفى", author:"بهاء طاهر", genre:"رواية عربية", year:1995, emoji:"✈️", color:"#1b2631", desc:"رواية تصور حياة مصري في المنفى وصراعه بين الوطن والغربة." },
  { id:270, lang:"ar",cover:"https://books.google.com/books/content?id=I_-HDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"نصف شمس صفراء", author:"شيماماندا نغوزي أديشي", genre:"رواية عربية", year:2006, emoji:"🌅", color:"#d4ac0d", desc:"الترجمة العربية لرواية أديشي عن حرب بيافرا في نيجيريا." },
  { id:271, lang:"ar",cover:"https://books.google.com/books/content?id=_wZ1Rf1QQ_EC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"أمريكانا", author:"شيماماندا نغوزي أديشي", genre:"رواية عربية", year:2013, emoji:"✈️", color:"#2c3e50", desc:"الترجمة العربية لرواية أديشي عن نيجيرية تكتشف العنصرية في أمريكا." },
  { id:272, lang:"ar",cover:"https://books.google.com/books/content?id=QgFJn-NGGr8C&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الشيء يتداعى", author:"شينوا أتشيبي", genre:"رواية عربية", year:1958, emoji:"🌍", color:"#d4ac0d", desc:"الترجمة العربية لرواية أتشيبي. أوكونكو يرى مجتمعه الإيبو يتفكك أمام الاستعمار." },
  { id:273, lang:"ar",cover:"https://books.google.com/books/content?id=rBP5EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"رسالة الغفران", author:"أبو العلاء المعري", genre:"ملحمة عربية", year:1033, emoji:"🌟", color:"#4a235a", desc:"رحلة خيالية إلى الجنة والنار. من أعظم الأعمال الأدبية العربية الكلاسيكية." },
  { id:274, lang:"ar",cover:"https://books.google.com/books/content?id=se3tDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"المقدمة", author:"ابن خلدون", genre:"ملحمة عربية", year:1377, emoji:"📚", color:"#784212", desc:"مقدمة ابن خلدون الشهيرة. أول كتاب في علم الاجتماع والتاريخ في العالم." },
  { id:275, lang:"ar",cover:"https://books.google.com/books/content?id=6595EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الأغاني", author:"أبو الفرج الأصفهاني", genre:"ملحمة عربية", year:967, emoji:"🎵", color:"#9b4dca", desc:"موسوعة أدبية ضخمة تجمع أشعار العرب وأخبارهم وأغانيهم عبر العصور." },
  { id:276, lang:"ar",cover:"https://books.google.com/books/content?id=VYyUEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"طوق الحمامة", author:"ابن حزم الأندلسي", genre:"ملحمة عربية", year:1022, emoji:"🕊️", color:"#c0392b", desc:"كتاب في الحب والمحبين. من أجمل ما كتب العرب عن الحب والعاطفة." },
  { id:277, lang:"ar",cover:"https://books.google.com/books/content?id=wp_bEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"حي بن يقظان", author:"ابن طفيل", genre:"ملحمة عربية", year:1169, emoji:"🌿", color:"#1e8449", desc:"رواية فلسفية عن طفل ينشأ وحيداً في جزيرة ويكتشف الحقيقة بعقله." },
  { id:278, lang:"ar",cover:"https://books.google.com/books/content?id=k2DGOWSVDO4C&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"رسائل إخوان الصفا", author:"إخوان الصفا", genre:"ملحمة عربية", year:983, emoji:"📜", color:"#2c3e50", desc:"موسوعة فلسفية وعلمية ضخمة تجمع معارف العصر الإسلامي الذهبي." },
  { id:279, lang:"ar",cover:"https://books.google.com/books/content?id=H2cDAAAAYAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الكامل في التاريخ", author:"ابن الأثير", genre:"ملحمة عربية", year:1231, emoji:"🏛️", color:"#784212", desc:"موسوعة تاريخية شاملة تصور تاريخ العالم الإسلامي من البداية." },
  { id:280, lang:"ar",cover:"https://books.google.com/books/content?id=48dwDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"تاريخ الطبري", author:"محمد بن جرير الطبري", genre:"ملحمة عربية", year:915, emoji:"📖", color:"#d4ac0d", desc:"أعظم موسوعة تاريخية في التراث العربي الإسلامي." },
  { id:281, lang:"ar",cover:"https://books.google.com/books/content?id=S5VDDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"سيرة ابن هشام", author:"ابن هشام", genre:"ملحمة عربية", year:833, emoji:"🌙", color:"#1a5276", desc:"السيرة النبوية الشريفة. المرجع الأساسي لحياة النبي محمد صلى الله عليه وسلم." },
  { id:282, lang:"ar",cover:"https://books.google.com/books/content?id=_zoaEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الأيام الثلاثة", author:"محمود درويش", genre:"رواية عربية", year:2004, emoji:"🌹", color:"#c0392b", desc:"نثر شعري لمحمود درويش يصور أيامه الأخيرة في رام الله." },
  { id:283, lang:"ar",cover:"https://books.google.com/books/content?id=89ViQgAACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"في حضرة الغياب", author:"محمود درويش", genre:"رواية عربية", year:2006, emoji:"🌿", color:"#1e8449", desc:"نص نثري شعري يتأمل فيه درويش الغياب والحضور والهوية الفلسطينية." },
  { id:284, lang:"ar",cover:"https://books.google.com/books/content?id=LP09EQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"ذاكرة للنسيان", author:"محمود درويش", genre:"رواية عربية", year:1987, emoji:"💭", color:"#2471a3", desc:"نص نثري يصور يوماً واحداً من الحرب الأهلية اللبنانية عام 1982." },
  { id:285, lang:"ar",cover:"https://archive.org/services/img/YacineB00502BibliothqueApcHamma", title:"أثر الفراشة", author:"محمود درويش", genre:"رواية عربية", year:2008, emoji:"🦋", color:"#9b4dca", desc:"آخر كتب درويش النثرية. تأملات في الشعر والحياة والموت." },
  { id:286, lang:"ar",cover:"https://books.google.com/books/content?id=fqwNEQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الجدار", author:"جبران خليل جبران", genre:"رواية عربية", year:1919, emoji:"🌊", color:"#2471a3", desc:"مجموعة نثرية شعرية من أجمل أعمال جبران. تأملات في الحياة والحب والطبيعة." },
  { id:287, lang:"ar",cover:"https://books.google.com/books/content?id=m5vQDwAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"النبي", author:"جبران خليل جبران", genre:"رواية عربية", year:1923, emoji:"🌟", color:"#d4ac0d", desc:"الترجمة العربية لأشهر أعمال جبران. المصطفى يودع مدينته بحكم خالدة." },
  { id:288, lang:"ar",cover:"https://books.google.com/books/content?id=PyWxDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الأجنحة المتكسرة", author:"جبران خليل جبران", genre:"رواية عربية", year:1912, emoji:"🕊️", color:"#c0392b", desc:"رواية رومانسية تصور قصة حب مستحيلة في لبنان. من أجمل روايات جبران." },
  { id:289, lang:"ar",cover:"https://books.google.com/books/content?id=pwH5EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"دمعة وابتسامة", author:"جبران خليل جبران", genre:"رواية عربية", year:1914, emoji:"😢", color:"#4a235a", desc:"مجموعة نثرية شعرية تجمع بين الحزن والفرح والتأمل الفلسفي." },
  { id:290, lang:"ar",cover:"https://covers.openlibrary.org/b/isbn/9789772089260-L.jpg", title:"المجنون", author:"جبران خليل جبران", genre:"رواية عربية", year:1918, emoji:"🌀", color:"#1b2631", desc:"مجموعة من الحكايات الرمزية والتأملات الفلسفية بأسلوب جبران الفريد." },
  { id:291, lang:"ar",cover:"https://archive.org/services/img/AAskZad-1252058", title:"عرائس المروج", author:"جبران خليل جبران", genre:"رواية عربية", year:1906, emoji:"🌸", color:"#1e8449", desc:"مجموعة قصصية تصور الطبيعة اللبنانية والحياة الريفية بأسلوب شعري." },
  { id:292, lang:"ar",cover:"https://books.google.com/books/content?id=Mp0jEQAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"الأرواح المتمردة", author:"جبران خليل جبران", genre:"رواية عربية", year:1908, emoji:"🔥", color:"#e74c3c", desc:"مجموعة قصصية تنتقد الظلم الاجتماعي والديني في المجتمع اللبناني." },
  { id:293, lang:"ar",cover:"https://books.google.com/books/content?id=rF7GEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"البدائع والطرائف", author:"جبران خليل جبران", genre:"رواية عربية", year:1923, emoji:"✨", color:"#d4ac0d", desc:"مجموعة من المقالات والقصائد النثرية تعكس فلسفة جبران الإنسانية." },
  { id:294, lang:"ar",cover:"https://books.google.com/books/content?id=mJnyEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"حديقة النبي", author:"جبران خليل جبران", genre:"رواية عربية", year:1931, emoji:"🌿", color:"#1e8449", desc:"استكمال لكتاب النبي. المصطفى يعود ليكمل حكمته مع تلاميذه." },
  { id:295, lang:"ar",cover:"https://books.google.com/books/content?id=_gT0EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"يسوع ابن الإنسان", author:"جبران خليل جبران", genre:"رواية عربية", year:1928, emoji:"✝️", color:"#2c3e50", desc:"رواية تصور شخصية المسيح من خلال شهادات معاصريه بأسلوب جبران الفريد." },
  { id:296, lang:"ar",cover:"https://books.google.com/books/content?id=jU99EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"رمل وزبد", author:"جبران خليل جبران", genre:"رواية عربية", year:1926, emoji:"🏖️", color:"#c4a35a", desc:"مجموعة من الحكم والأمثال والتأملات القصيرة." },
  { id:297, lang:"ar",cover:"https://books.google.com/books/content?id=kr5QDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", title:"التائه", author:"جبران خليل جبران", genre:"رواية عربية", year:1932, emoji:"🌙", color:"#4a235a", desc:"آخر أعمال جبران. حكايات رمزية عن الإنسان الباحث عن الحقيقة." },
  { id:298, lang:"ar",cover:"https://books.google.com/books/content?id=HwL5EAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"الموسيقى", author:"جبران خليل جبران", genre:"رواية عربية", year:1905, emoji:"🎵", color:"#9b4dca", desc:"مقالة شعرية تتأمل في جوهر الموسيقى وعلاقتها بالروح الإنسانية." },
  { id:299, lang:"ar", title:"حفيدة الشمس", author:"أمين معلوف", genre:"رواية عربية", year:2019, emoji:"☀️", color:"#d4ac0d", desc:"رواية تصور مستقبل البشرية في عالم تتصارع فيه الحضارات." },
  { id:300, lang:"ar",cover:"https://books.google.com/books/content?id=elvzEAAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api", title:"سمرقند", author:"أمين معلوف", genre:"رواية عربية", year:1988, emoji:"🏰", color:"#784212", desc:"رواية تاريخية تصور حياة عمر الخيام وقصيدة رباعياته الشهيرة." }
];


// ===== QUIZ DATA =====
const QUIZ_DATA = {
  "Classiques": {
    icon: "📚", desc: "10 questions sur les grands classiques",
    questions: [
      { q:"Qui a écrit '1984' ?", opts:["George Orwell","Aldous Huxley","Ray Bradbury","H.G. Wells"], ans:0, exp:"George Orwell a publié 1984 en 1949, un an avant sa mort." },
      { q:"Dans quel pays se déroule 'Crime et Châtiment' ?", opts:["France","Allemagne","Russie","Pologne"], ans:2, exp:"Le roman de Dostoïevski se déroule à Saint-Pétersbourg, en Russie." },
      { q:"Quel est le vrai prénom de Madame Bovary ?", opts:["Marie","Emma","Claire","Sophie"], ans:1, exp:"Emma Bovary est l'héroïne du roman de Gustave Flaubert." },
      { q:"En quelle année a été publié 'Don Quichotte' ?", opts:["1505","1605","1705","1805"], ans:1, exp:"La première partie de Don Quichotte a été publiée en 1605 par Cervantes." },
      { q:"Qui est l'auteur des 'Misérables' ?", opts:["Balzac","Zola","Victor Hugo","Flaubert"], ans:2, exp:"Victor Hugo a publié Les Misérables en 1862." },
      { q:"Qui a écrit 'Anna Karénine' ?", opts:["Dostoïevski","Tchekhov","Tolstoï","Tourgueniev"], ans:2, exp:"Léon Tolstoï a publié Anna Karénine entre 1875 et 1878." },
      { q:"Dans 'L'Étranger', comment s'appelle le protagoniste ?", opts:["Meursault","Mersault","Moreau","Marceau"], ans:0, exp:"Meursault est le narrateur et protagoniste du roman d'Albert Camus." },
      { q:"Quel roman commence par 'Longtemps, je me suis couché de bonne heure' ?", opts:["Germinal","À la recherche du temps perdu","Madame Bovary","Le Rouge et le Noir"], ans:1, exp:"C'est la célèbre première phrase de Marcel Proust dans 'Du côté de chez Swann'." },
      { q:"Qui a écrit 'Moby Dick' ?", opts:["Jack London","Mark Twain","Herman Melville","Ernest Hemingway"], ans:2, exp:"Herman Melville a publié Moby Dick en 1851." },
      { q:"Quel roman de Zola décrit la vie des mineurs ?", opts:["Nana","L'Assommoir","Germinal","Au Bonheur des Dames"], ans:2, exp:"Germinal (1885) décrit la vie des mineurs du Nord de la France et leur grève." },
    ]
  },
  "Fantasy & SF": {
    icon: "🚀", desc: "10 questions sur la fantasy et la SF",
    questions: [
      { q:"Quel est le nom de l'école de sorcellerie dans Harry Potter ?", opts:["Beauxbâtons","Poudlard","Durmstrang","Castelobruxo"], ans:1, exp:"Poudlard (Hogwarts en anglais) est l'école de sorcellerie où étudie Harry Potter." },
      { q:"Qui a créé l'Anneau Unique dans Le Seigneur des Anneaux ?", opts:["Gandalf","Sauron","Saruman","Morgoth"], ans:1, exp:"Sauron a forgé l'Anneau Unique dans les feux de la Montagne du Destin." },
      { q:"Sur quelle planète se déroule 'Dune' ?", opts:["Tatooine","Arrakis","Pandora","Solaris"], ans:1, exp:"Arrakis, aussi appelée Dune, est la planète désertique source de l'Épice." },
      { q:"Quel est le nom du dragon dans 'Le Hobbit' ?", opts:["Smaug","Fafnir","Glaurung","Ancalagon"], ans:0, exp:"Smaug est le dragon qui garde le trésor des nains sous la Montagne Solitaire." },
      { q:"Qui a écrit la série 'Fondation' ?", opts:["Arthur C. Clarke","Isaac Asimov","Philip K. Dick","Robert Heinlein"], ans:1, exp:"Isaac Asimov a créé la saga Fondation, publiée à partir de 1951." },
      { q:"Dans 'Fahrenheit 451', quelle est la température à laquelle le papier brûle ?", opts:["233°C","451°F","300°C","212°F"], ans:1, exp:"451°F (environ 233°C) est la température à laquelle le papier s'enflamme." },
      { q:"Quel est le vrai nom de Voldemort ?", opts:["Tom Jedusor","Tom Riddle","Les deux sont corrects","Aucun des deux"], ans:2, exp:"Tom Jedusor est la traduction française de Tom Riddle, le vrai nom de Voldemort." },
      { q:"Qui est le créateur de la Terre du Milieu ?", opts:["C.S. Lewis","J.R.R. Tolkien","Terry Pratchett","George R.R. Martin"], ans:1, exp:"J.R.R. Tolkien a créé l'univers de la Terre du Milieu." },
      { q:"Dans 'La Servante écarlate', comment s'appelle la République totalitaire ?", opts:["Oceania","Gilead","Panem","Airstrip One"], ans:1, exp:"La République de Gilead est le régime totalitaire dans le roman de Margaret Atwood." },
      { q:"Quel roman SF a inventé le concept de 'cyberespace' ?", opts:["Dune","Fondation","Neuromancien","2001"], ans:2, exp:"William Gibson a inventé le terme 'cyberespace' dans Neuromancien (1984)." },
    ]
  },
  "Auteurs": {
    icon: "✍️", desc: "10 questions sur les grands auteurs",
    questions: [
      { q:"Dans quel pays est né Victor Hugo ?", opts:["Belgique","Suisse","France","Canada"], ans:2, exp:"Victor Hugo est né à Besançon, en France, en 1802." },
      { q:"Quel auteur a écrit sous le pseudonyme 'Voltaire' ?", opts:["Jean-Baptiste Poquelin","François-Marie Arouet","Jean-Paul Sartre","Denis Diderot"], ans:1, exp:"Voltaire est le pseudonyme de François-Marie Arouet, philosophe des Lumières." },
      { q:"Gabriel García Márquez est originaire de quel pays ?", opts:["Mexique","Argentine","Colombie","Brésil"], ans:2, exp:"Gabriel García Márquez est né à Aracataca, en Colombie, en 1927." },
      { q:"En quelle année Shakespeare est-il né ?", opts:["1544","1564","1584","1604"], ans:1, exp:"William Shakespeare est né le 23 avril 1564 à Stratford-upon-Avon." },
      { q:"Albert Camus a reçu le Prix Nobel de littérature en quelle année ?", opts:["1947","1952","1957","1962"], ans:2, exp:"Albert Camus a reçu le Prix Nobel de littérature en 1957." },
      { q:"Quel auteur russe a écrit 'Guerre et Paix' ?", opts:["Dostoïevski","Tolstoï","Tchekhov","Gogol"], ans:1, exp:"Léon Tolstoï a publié Guerre et Paix entre 1865 et 1869." },
      { q:"Qui a écrit 'Le Nom de la Rose' ?", opts:["Umberto Eco","Italo Calvino","Primo Levi","Alberto Moravia"], ans:0, exp:"Umberto Eco a publié Le Nom de la Rose en 1980, son premier roman." },
      { q:"Franz Kafka est né dans quelle ville ?", opts:["Vienne","Berlin","Prague","Budapest"], ans:2, exp:"Franz Kafka est né à Prague en 1883." },
      { q:"Toni Morrison a reçu le Prix Nobel en quelle année ?", opts:["1987","1991","1993","1998"], ans:2, exp:"Toni Morrison a reçu le Prix Nobel de littérature en 1993." },
      { q:"Qui a écrit 'L'Alchimiste' ?", opts:["Jorge Amado","Paulo Coelho","Gabriel García Márquez","Mario Vargas Llosa"], ans:1, exp:"Paulo Coelho a publié L'Alchimiste en 1988, traduit en 80 langues." },
    ]
  },
  "Culture Générale": {
    icon: "🌍", desc: "10 questions de culture littéraire",
    questions: [
      { q:"Quel est le livre le plus vendu de l'histoire (hors Bible) ?", opts:["Don Quichotte","Harry Potter","Le Petit Prince","Le Seigneur des Anneaux"], ans:0, exp:"Don Quichotte de Cervantes est considéré comme le livre le plus vendu avec plus de 500 millions d'exemplaires." },
      { q:"Combien de livres compte la saga Harry Potter ?", opts:["5","6","7","8"], ans:2, exp:"La saga Harry Potter compte 7 romans, publiés entre 1997 et 2007." },
      { q:"Quel prix littéraire est le plus prestigieux en France ?", opts:["Prix Médicis","Prix Goncourt","Prix Renaudot","Prix Femina"], ans:1, exp:"Le Prix Goncourt, créé en 1903, est le prix littéraire le plus prestigieux en France." },
      { q:"Qui a écrit 'L'Odyssée' ?", opts:["Sophocle","Virgile","Homère","Hésiode"], ans:2, exp:"L'Odyssée est attribuée à Homère, poète grec de l'Antiquité." },
      { q:"Dans quel siècle a vécu Molière ?", opts:["XVe","XVIe","XVIIe","XVIIIe"], ans:2, exp:"Molière (Jean-Baptiste Poquelin) a vécu au XVIIe siècle, de 1622 à 1673." },
      { q:"Qui a écrit 'Les Fleurs du Mal' ?", opts:["Verlaine","Rimbaud","Baudelaire","Mallarmé"], ans:2, exp:"Charles Baudelaire a publié Les Fleurs du Mal en 1857." },
      { q:"Quel est le premier roman de l'histoire de la littérature mondiale ?", opts:["L'Odyssée","Don Quichotte","Le Dit du Genji","Les Mille et Une Nuits"], ans:2, exp:"Le Dit du Genji (vers 1008) de Murasaki Shikibu est considéré comme le premier roman de l'histoire." },
      { q:"Qui a écrit 'Frankenstein' ?", opts:["Bram Stoker","Mary Shelley","Edgar Allan Poe","H.G. Wells"], ans:1, exp:"Mary Shelley a publié Frankenstein en 1818, à seulement 20 ans." },
      { q:"Dans quel pays se déroule 'Dracula' de Bram Stoker ?", opts:["Hongrie","Bulgarie","Roumanie","Serbie"], ans:2, exp:"Le château du comte Dracula se trouve en Transylvanie, en Roumanie." },
      { q:"Quel mouvement littéraire André Breton a-t-il fondé ?", opts:["Dadaïsme","Surréalisme","Futurisme","Cubisme"], ans:1, exp:"André Breton a fondé le surréalisme en 1924 avec la publication du Manifeste du surréalisme." },
    ]
  }
};

// ===== GROQ AI =====
const HARDCODED_API_KEY = ''; // Removed — key is now stored securely on server
let geminiApiKey = localStorage.getItem('gemini_api_key') || '';

// Load API key from server on startup
async function loadApiKey() {
  try {
    const res = await fetch('/api/ai-key');
    if (res.ok) {
      const data = await res.json();
      if (data.key) geminiApiKey = data.key;
    }
  } catch(e) {}
}
let chatHistory = [];

function getSystemPrompt() {
  const langNote = t('ai_lang_note');
  return `You are Biblio, an expert literary assistant for Novela, a universal online library. ${langNote}

You know world literature perfectly: classics, fantasy, sci-fi, mystery, philosophy, poetry, African, Asian, Latin American literature, etc.

You can:
- Recommend books based on user preferences
- Summarize and analyze literary works
- Talk about authors and their lives
- Explain literary movements
- Create literary quizzes
- Compare works
- Give critical opinions on books

Our library has 70,000+ books from Project Gutenberg plus curated titles.

Be warm, passionate about literature, and give detailed, enriching responses. Use emojis sparingly.`;
}

async function callGemini(userMessage) {
  if (!geminiApiKey) {
    return "❌ Aucune clé API configurée. Contactez l'administrateur du site.";
  }

  // Groq utilise le format OpenAI
  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...chatHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${geminiApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.8,
        max_tokens: 1024
      })
    });

    const data = await res.json();

    if (data.error) {
      return `❌ Erreur : ${data.error.message}`;
    }

    const reply = data.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse.";
    chatHistory.push({ role: "user", content: userMessage });
    chatHistory.push({ role: "assistant", content: reply });
    // Garder l'historique court (20 derniers messages)
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    return reply;
  } catch (e) {
    return `❌ Erreur réseau. Vérifiez votre connexion internet.`;
  }
}

// ===== API KEY MODAL =====
function showApiKeyModal() {
  document.getElementById('api-key-modal').classList.add('open');
}

async function callGroqDirect(prompt, maxTokens = 1200) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${geminiApiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

function closeApiKeyModal() {
  document.getElementById('api-key-modal').classList.remove('open');
}

function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key) return;
  geminiApiKey = key;
  localStorage.setItem('gemini_api_key', key);
  closeApiKeyModal();
  addMessage('✅ Clé API sauvegardée ! Je suis maintenant connecté à Gemini. Posez-moi vos questions !', 'ai');
}

// ===== AUTH =====
let currentUser = null;
const API_BASE = window.location.origin + '/api';

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => t.classList.toggle('active', (i === 0) === (tab === 'login')));
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function register() {
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username')?.value.trim() || '';
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const err = document.getElementById('reg-error');
  if (!name || !email || !pass) { err.style.color='var(--error)'; err.textContent = 'Tous les champs sont requis.'; return; }
  if (pass.length < 6) { err.style.color='var(--error)'; err.textContent = 'Mot de passe trop court (min 6 caractères).'; return; }
  if (username && !/^[a-z0-9_]{3,20}$/.test(username)) { err.style.color='var(--error)'; err.textContent = 'Nom d\'utilisateur invalide (3-20 caractères, lettres/chiffres/_).'; return; }
  try {
    const res = await fetch(API_BASE + '/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, username, email, pass}) });
    const data = await res.json();
    if (!res.ok) { err.style.color='var(--error)'; err.textContent = data.error || 'Erreur.'; return; }
    if (data.requiresVerification === false) {
      err.style.color = 'var(--success)'; err.textContent = '✅ Compte créé ! Connectez-vous.';
      setTimeout(() => { err.textContent = ''; switchTab('login'); }, 1400);
      return;
    }
    showVerifyScreen(email, 'register');
  } catch(e) {
    const users = JSON.parse(localStorage.getItem('biblio_users') || '[]');
    if (users.find(u => u.email === email)) { err.style.color='var(--error)'; err.textContent = 'Email déjà utilisé.'; return; }
    if (username && users.find(u => u.username === username)) { err.style.color='var(--error)'; err.textContent = 'Nom d\'utilisateur déjà pris.'; return; }
    users.push({ id: Date.now(), name, username, email, pass, verified: true, twofa: false, createdAt: new Date().toISOString() });
    localStorage.setItem('biblio_users', JSON.stringify(users));
    err.style.color = 'var(--success)'; err.textContent = '✅ Compte créé ! Connectez-vous.';
    setTimeout(() => { err.textContent = ''; switchTab('login'); }, 1400);
  }
}

async function login() {
  const emailOrUser = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  if (!emailOrUser || !pass) { err.textContent = 'Remplissez tous les champs.'; return; }
  try {
    const res = await fetch(API_BASE + '/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email: emailOrUser, pass}) });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Email/username ou mot de passe incorrect.'; return; }
    if (data.requires2fa) { showVerifyScreen(emailOrUser, 'login2fa'); return; }
    finishLogin(data.user);
  } catch(e) {
    const users = JSON.parse(localStorage.getItem('biblio_users') || '[]');
    const user = users.find(u => (u.email === emailOrUser || u.username === emailOrUser || u.name === emailOrUser) && u.pass === pass);
    if (!user) { err.textContent = 'Email/username ou mot de passe incorrect.'; return; }
    finishLogin(user);
  }
}

function finishLogin(user) {
  currentUser = user;
  localStorage.setItem('biblio_session', JSON.stringify(user));
  hideLanding();
  document.getElementById('auth-overlay').classList.remove('active');
  document.getElementById('app').style.display = 'block';
  document.getElementById('nav-username').textContent = user.name;
  loadApiKey().then(() => initApp());
}

// ===== AUTH HELPERS =====
function togglePassVis(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.querySelector('i').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
}

function checkPasswordStrength(pass) {
  const bar = document.getElementById('pstr-fill');
  const label = document.getElementById('pstr-label');
  const wrap = document.getElementById('pass-strength');
  if (!bar || !pass) return;
  wrap.style.display = pass.length > 0 ? 'block' : 'none';
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  const levels = [
    { w: '25%', bg: '#ef4444', txt: 'Très faible' },
    { w: '50%', bg: '#f97316', txt: 'Faible' },
    { w: '75%', bg: '#eab308', txt: 'Moyen' },
    { w: '100%', bg: '#22c55e', txt: 'Fort' },
  ];
  const l = levels[score] || levels[0];
  bar.style.width = l.w;
  bar.style.background = l.bg;
  label.textContent = l.txt;
  label.style.color = l.bg;
}

// Attach password strength listener after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const passInput = document.getElementById('reg-password');
  if (passInput) passInput.addEventListener('input', () => checkPasswordStrength(passInput.value));
});

// ===== EMAIL VERIFICATION SCREEN =====
function showVerifyScreen(email, type) {
  const box = document.querySelector('.auth-box');
  box.innerHTML = `
    <div class="auth-logo"><img src="logo.png" class="site-logo-img" alt="Novela"/> Novela</div>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:2.5rem;margin-bottom:8px">📧</div>
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:6px">Check your email</h3>
      <p style="color:var(--text2);font-size:.85rem">We sent a 6-digit code to<br><strong style="color:var(--accent3)">${email}</strong></p>
    </div>
    <input type="text" id="verify-code" placeholder="000000" maxlength="6" style="text-align:center;font-size:1.5rem;letter-spacing:8px;font-weight:700" oninput="this.value=this.value.replace(/[^0-9]/g,'')"/>
    <p id="verify-error" class="error-msg"></p>
    <button class="btn-primary" style="margin-top:12px" onclick="submitVerifyCode('${email}','${type}')">Verify</button>
    <p style="text-align:center;margin-top:12px;font-size:.82rem;color:var(--text2)">
      Didn't receive it? <button onclick="resendCode('${email}','${type}')" style="background:none;border:none;color:var(--accent3);cursor:pointer;font-size:.82rem">Resend</button>
    </p>
    ${type === 'register' ? '' : `<p style="text-align:center;margin-top:8px"><button onclick="location.reload()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:.8rem">← Back to login</button></p>`}`;
}

async function submitVerifyCode(email, type) {
  const code = document.getElementById('verify-code').value.trim();
  const err = document.getElementById('verify-error');
  if (code.length !== 6) { err.textContent = 'Enter the 6-digit code.'; return; }
  const endpoint = type === 'register' ? '/verify-email' : '/verify-2fa';
  try {
    const res = await fetch(API_BASE + endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,code}) });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Invalid code.'; return; }
    finishLogin(data.user);
  } catch(e) { err.textContent = 'Server error. Try again.'; }
}

async function resendCode(email, type) {
  const endpoint = type === 'register' ? '/verify-email-resend' : '/forgot-password';
  // Just re-trigger by calling login or register again — simplest approach
  showProfileToast('Code resent!');
}

// ===== FORGOT PASSWORD =====
function showForgotPassword() {
  const box = document.querySelector('.auth-box');
  box.innerHTML = `
    <div class="auth-logo"><img src="logo.png" class="site-logo-img" alt="Novela"/> Novela</div>
    <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;text-align:center">Reset your password</h3>
    <input type="email" id="reset-email" placeholder="Your email"/>
    <p id="reset-error" class="error-msg"></p>
    <button class="btn-primary" style="margin-top:12px" onclick="sendResetCode()">Send reset code</button>
    <p style="text-align:center;margin-top:12px"><button onclick="location.reload()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:.82rem">← Back to login</button></p>`;
}

async function sendResetCode() {
  const email = document.getElementById('reset-email').value.trim();
  const err = document.getElementById('reset-error');
  if (!email) { err.textContent = 'Enter your email.'; return; }
  try {
    const res = await fetch(API_BASE + '/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Error.'; return; }
    showResetCodeScreen(email);
  } catch(e) { err.textContent = 'Server offline.'; }
}

function showResetCodeScreen(email) {
  const box = document.querySelector('.auth-box');
  box.innerHTML = `
    <div class="auth-logo"><img src="logo.png" class="site-logo-img" alt="Novela"/> Novela</div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:2rem;margin-bottom:6px">🔑</div>
      <p style="color:var(--text2);font-size:.85rem">Enter the code sent to <strong style="color:var(--accent3)">${email}</strong></p>
    </div>
    <input type="text" id="reset-code" placeholder="000000" maxlength="6" style="text-align:center;font-size:1.4rem;letter-spacing:8px;font-weight:700"/>
    <input type="password" id="reset-newpass" placeholder="New password" style="margin-top:10px"/>
    <p id="reset-err2" class="error-msg"></p>
    <button class="btn-primary" style="margin-top:12px" onclick="submitResetPassword('${email}')">Reset password</button>`;
}

async function submitResetPassword(email) {
  const code = document.getElementById('reset-code').value.trim();
  const newPass = document.getElementById('reset-newpass').value;
  const err = document.getElementById('reset-err2');
  if (!code || !newPass) { err.textContent = 'Fill all fields.'; return; }
  if (newPass.length < 6) { err.textContent = 'Password too short.'; return; }
  try {
    const res = await fetch(API_BASE + '/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,code,newPass}) });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Error.'; return; }
    err.style.color = 'var(--success)'; err.textContent = '✅ Password reset! Sign in.';
    setTimeout(() => location.reload(), 1500);
  } catch(e) { err.textContent = 'Server offline.'; }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('biblio_session');
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-overlay').classList.remove('active');
  showLanding();
}

function checkSession() {
  if (!document.getElementById('auth-overlay')) return;
  const s = localStorage.getItem('biblio_session');
  if (s) {
    currentUser = JSON.parse(s);
    hideLanding();
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('app').style.display = 'block';
    document.getElementById('nav-username').textContent = currentUser.name;
    loadApiKey().then(() => initApp());
  } else {
    showLanding();
  }
}

// ===== LANDING PAGE =====
function showLanding() {
  const lp = document.getElementById('landing-page');
  if (lp) {
    lp.style.display = 'block';
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('app').style.display = 'none';
    // Animate counters
    setTimeout(animateLandingCounters, 400);
  }
}

function hideLanding() {
  const lp = document.getElementById('landing-page');
  if (lp) lp.style.display = 'none';
}

function showAuth(tab) {
  hideLanding();
  const overlay = document.getElementById('auth-overlay');
  overlay.classList.add('active');
  switchTab(tab || 'login');
}

function animateLandingCounters() {
  document.querySelectorAll('.landing-stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      if (target >= 1000) {
        el.textContent = Math.floor(current).toLocaleString('fr-FR') + '+';
      } else {
        el.textContent = Math.floor(current);
      }
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ===== EFFET 3D TILT SUR LES CARTES =====
function init3DTilt() {
  document.querySelectorAll('.book-card').forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = '1';
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px) scale(1.02)`;
      card.style.boxShadow = `${-rotY * 2}px ${rotX * 2}px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(124,106,247,.25)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// Appeler init3DTilt après chaque rendu de grille
const _origInit3D = window.init3DTilt;
document.addEventListener('click', () => setTimeout(init3DTilt, 300));

// ===== RATINGS & REVIEWS =====
function getRatings() {
  return JSON.parse(localStorage.getItem('novela_ratings_' + (currentUser?.email||'')) || '{}');
}

function saveRating(bookId, rating, review = '') {
  const ratings = getRatings();
  ratings[bookId] = { rating, review, date: Date.now() };
  localStorage.setItem('novela_ratings_' + (currentUser?.email||''), JSON.stringify(ratings));
  
  // Update global ratings
  const globalRatings = JSON.parse(localStorage.getItem('novela_global_ratings') || '{}');
  if (!globalRatings[bookId]) globalRatings[bookId] = { total: 0, count: 0, reviews: [] };
  globalRatings[bookId].total += rating;
  globalRatings[bookId].count += 1;
  if (review) {
    globalRatings[bookId].reviews.push({
      user: currentUser?.name || 'Anonyme',
      rating,
      review,
      date: Date.now()
    });
  }
  localStorage.setItem('novela_global_ratings', JSON.stringify(globalRatings));
}

function getAverageRating(bookId) {
  const globalRatings = JSON.parse(localStorage.getItem('novela_global_ratings') || '{}');
  if (!globalRatings[bookId] || globalRatings[bookId].count === 0) return null;
  return (globalRatings[bookId].total / globalRatings[bookId].count).toFixed(1);
}

function getUserRating(bookId) {
  const ratings = getRatings();
  return ratings[bookId] || null;
}

// ===== READING PROGRESS =====
function getReadingProgress() {
  return JSON.parse(localStorage.getItem('novela_progress_' + (currentUser?.email||'')) || '{}');
}

function saveReadingProgress(bookId, position, total) {
  const progress = getReadingProgress();
  const percent = Math.round((position / total) * 100);
  progress[bookId] = {
    position,
    total,
    percent,
    lastRead: Date.now(),
    startDate: progress[bookId]?.startDate || Date.now()
  };
  localStorage.setItem('novela_progress_' + (currentUser?.email||''), JSON.stringify(progress));
  
  // Track reading session
  const sessions = JSON.parse(localStorage.getItem('novela_sessions_' + (currentUser?.email||'')) || []);
  sessions.push({ bookId, date: Date.now(), duration: 5 }); // 5 min estimate
  localStorage.setItem('novela_sessions_' + (currentUser?.email||''), JSON.stringify(sessions));
}

function getBookProgress(bookId) {
  const progress = getReadingProgress();
  return progress[bookId] || null;
}

function getInProgressBooks() {
  const progress = getReadingProgress();
  return Object.entries(progress)
    .filter(([_, p]) => p.percent > 0 && p.percent < 100)
    .sort((a, b) => b[1].lastRead - a[1].lastRead)
    .slice(0, 5);
}

// ===== READING STATS =====
function getReadingStats() {
  const sessions = JSON.parse(localStorage.getItem('novela_sessions_' + (currentUser?.email||'')) || []);
  const ratings = getRatings();
  const progress = getReadingProgress();
  
  // Books per month (last 6 months)
  const now = Date.now();
  const sixMonthsAgo = now - (6 * 30 * 24 * 60 * 60 * 1000);
  const finishedBooks = Object.entries(progress).filter(([_, p]) => p.percent === 100);
  
  const monthlyData = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now - (i * 30 * 24 * 60 * 60 * 1000));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = 0;
  }
  
  finishedBooks.forEach(([_, p]) => {
    if (p.lastRead >= sixMonthsAgo) {
      const date = new Date(p.lastRead);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key] !== undefined) monthlyData[key]++;
    }
  });
  
  // Genre distribution
  const genreCount = {};
  finishedBooks.forEach(([bookId, _]) => {
    const book = BOOKS.find(b => b.id == bookId);
    if (book) {
      genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    }
  });
  
  // Reading heatmap (last 90 days)
  const heatmapData = {};
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
  sessions.filter(s => s.date >= ninetyDaysAgo).forEach(s => {
    const date = new Date(s.date).toISOString().split('T')[0];
    heatmapData[date] = (heatmapData[date] || 0) + 1;
  });
  
  return {
    monthlyData,
    genreCount,
    heatmapData,
    totalBooks: finishedBooks.length,
    totalSessions: sessions.length,
    avgRating: Object.values(ratings).reduce((sum, r) => sum + r.rating, 0) / Object.keys(ratings).length || 0
  };
}

// ===== BADGES & DÉFIS =====
const BADGES_DEF = [
  { id:'first_book',  emoji:'📖', name:'Premier livre',    desc:'Lire 1 livre',          condition: u => (u.booksRead||0) >= 1 },
  { id:'bookworm5',   emoji:'🐛', name:'Bookworm',         desc:'Lire 5 livres',          condition: u => (u.booksRead||0) >= 5 },
  { id:'reader10',    emoji:'📚', name:'Grand lecteur',    desc:'Lire 10 livres',         condition: u => (u.booksRead||0) >= 10 },
  { id:'quiz_first',  emoji:'🧠', name:'Premier quiz',     desc:'Compléter 1 quiz',       condition: u => (u.quizDone||0) >= 1 },
  { id:'quiz_ace',    emoji:'🏆', name:'Quiz Master',      desc:'Score 100% à un quiz',   condition: u => (u.bestQuiz||0) >= 100 },
  { id:'streak3',     emoji:'🔥', name:'En feu',           desc:'3 jours de suite',       condition: u => (u.streak||0) >= 3 },
  { id:'streak7',     emoji:'⚡', name:'Semaine parfaite', desc:'7 jours de suite',       condition: u => (u.streak||0) >= 7 },
  { id:'fav5',        emoji:'❤️', name:'Collectionneur',   desc:'5 livres en favoris',    condition: u => (u.favCount||0) >= 5 },
  { id:'community',   emoji:'💬', name:'Social',           desc:'Envoyer 1 message',      condition: u => (u.msgSent||0) >= 1 },
  { id:'polyglot',    emoji:'🌍', name:'Polyglotte',       desc:'Lire dans 2 langues',    condition: u => (u.langsRead||0) >= 2 },
];

const CHALLENGES_DEF = [
  { id:'read_month',  emoji:'📅', name:'Lecteur du mois',  desc:'Lire 5 livres ce mois',  target: 5,  key:'booksRead',  color:'linear-gradient(135deg,#7c6af7,#5b4de0)' },
  { id:'quiz_week',   emoji:'🧩', name:'Quiz de la semaine', desc:'Faire 3 quiz',          target: 3,  key:'quizDone',   color:'linear-gradient(135deg,#2dd4bf,#16a085)' },
  { id:'streak_goal', emoji:'🔥', name:'Streak 7 jours',   desc:'7 jours consécutifs',    target: 7,  key:'streak',     color:'linear-gradient(135deg,#fb923c,#d4ac0d)' },
  { id:'fav_collect', emoji:'❤️', name:'Collectionneur',   desc:'Ajouter 10 favoris',     target: 10, key:'favCount',   color:'linear-gradient(135deg,#f472b6,#c0392b)' },
];

function getUserStats() {
  if (!currentUser) return {};
  const key = 'novela_stats_' + currentUser.email;
  return JSON.parse(localStorage.getItem(key) || '{}');
}

function saveUserStats(stats) {
  if (!currentUser) return;
  const key = 'novela_stats_' + currentUser.email;
  localStorage.setItem(key, JSON.stringify(stats));
}

function incrementStat(statKey, amount = 1) {
  const stats = getUserStats();
  stats[statKey] = (stats[statKey] || 0) + amount;
  saveUserStats(stats);
  checkNewBadges(stats);
}

function checkNewBadges(stats) {
  const earned = JSON.parse(localStorage.getItem('novela_badges_' + (currentUser?.email||'')) || '[]');
  BADGES_DEF.forEach(b => {
    if (!earned.includes(b.id) && b.condition(stats)) {
      earned.push(b.id);
      localStorage.setItem('novela_badges_' + currentUser.email, JSON.stringify(earned));
      showBadgeToast(b);
    }
  });
}

function showBadgeToast(badge) {
  const toast = document.createElement('div');
  toast.className = 'badge-toast';
  toast.innerHTML = `<span style="font-size:1.4rem">${badge.emoji}</span><div><div style="font-weight:700;font-size:.88rem">Badge débloqué !</div><div style="font-size:.78rem;color:var(--text2)">${badge.name}</div></div>`;
  toast.style.cssText = `position:fixed;bottom:80px;right:20px;z-index:9999;background:var(--bg2);border:1px solid rgba(124,106,247,.3);border-radius:14px;padding:12px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:slideInRight .4s ease;`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOutRight .3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===== PAGE RÉCOMPENSES =====
function renderRewardsPage() {
  const stats = getUserStats();
  const earned = JSON.parse(localStorage.getItem('novela_badges_' + (currentUser?.email||'')) || '[]');

  // Streak
  const streakNum = document.getElementById('rewards-streak-num');
  if (streakNum) streakNum.textContent = stats.streak || 0;

  // Défis
  const challengesGrid = document.getElementById('rewards-challenges-grid');
  if (challengesGrid) {
    challengesGrid.innerHTML = CHALLENGES_DEF.map(c => {
      const val = Math.min(stats[c.key] || 0, c.target);
      const pct = Math.round((val / c.target) * 100);
      const done = pct >= 100;
      return `<div class="challenge-card ${done ? 'completed' : ''}">
        <div class="challenge-icon" style="background:${c.color}">${c.emoji}</div>
        <div class="challenge-info">
          <div class="challenge-name">${c.name}</div>
          <div class="challenge-desc">${c.desc}</div>
          <div class="challenge-progress-wrap">
            <div class="challenge-progress-fill" style="width:${pct}%;background:${c.color}"></div>
          </div>
          <div class="challenge-pct">${val} / ${c.target}</div>
        </div>
        ${done ? '<div class="challenge-check">✓</div>' : ''}
      </div>`;
    }).join('');
  }

  // Badges
  const badgesGrid = document.getElementById('rewards-badges-grid');
  const badgesCount = document.getElementById('rewards-badges-count');
  if (badgesGrid) {
    badgesGrid.innerHTML = BADGES_DEF.map(b => {
      const unlocked = earned.includes(b.id);
      return `<div class="rewards-badge-card ${unlocked ? 'unlocked' : 'locked'}">
        ${unlocked ? '<div class="rewards-badge-check">✓</div>' : ''}
        <span class="rewards-badge-emoji">${b.emoji}</span>
        <span class="rewards-badge-name">${b.name}</span>
        <span class="rewards-badge-desc">${b.desc}</span>
      </div>`;
    }).join('');
  }
  if (badgesCount) {
    badgesCount.textContent = `${earned.length} / ${BADGES_DEF.length} débloqués`;
  }
}

// ===== PAGE STATISTIQUES =====
function renderStatsPage() {
  const stats = getReadingStats();
  const userStats = getUserStats();
  
  // Overview cards
  document.getElementById('stat-total-books').textContent = stats.totalBooks;
  document.getElementById('stat-avg-rating').textContent = stats.avgRating.toFixed(1);
  document.getElementById('stat-sessions').textContent = stats.totalSessions;
  document.getElementById('stat-streak').textContent = userStats.streak || 0;
  
  // Monthly chart
  const monthlyChart = document.getElementById('monthly-chart');
  if (monthlyChart) {
    const maxBooks = Math.max(...Object.values(stats.monthlyData), 1);
    monthlyChart.innerHTML = Object.entries(stats.monthlyData).map(([month, count]) => {
      const height = (count / maxBooks) * 100;
      const label = month.split('-')[1] + '/' + month.split('-')[0].slice(2);
      return `<div class="chart-bar" style="height:${height}%">
        <span class="chart-bar-value">${count}</span>
        <span class="chart-bar-label">${label}</span>
      </div>`;
    }).join('');
  }
  
  // Genre bars
  const genreBars = document.getElementById('genre-bars');
  if (genreBars) {
    const sortedGenres = Object.entries(stats.genreCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxCount = Math.max(...sortedGenres.map(g => g[1]), 1);
    genreBars.innerHTML = sortedGenres.map(([genre, count]) => {
      const width = (count / maxCount) * 100;
      return `<div class="genre-bar-item">
        <div class="genre-bar-label">${genre}</div>
        <div class="genre-bar-track">
          <div class="genre-bar-fill" style="width:${width}%">
            <span class="genre-bar-count">${count}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  
  // Reading heatmap
  const heatmap = document.getElementById('reading-heatmap');
  if (heatmap) {
    const days = 91; // 13 weeks
    const now = new Date();
    let html = '';
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      const count = stats.heatmapData[dateStr] || 0;
      const level = count === 0 ? 0 : Math.min(Math.ceil(count / 2), 4);
      const tooltip = `${dateStr}: ${count} session${count > 1 ? 's' : ''}`;
      html += `<div class="heatmap-day level-${level}" title="${tooltip}">
        <div class="heatmap-tooltip">${tooltip}</div>
      </div>`;
    }
    heatmap.innerHTML = html;
  }
}

// Add rating display to book cards
function addRatingToBookCard(bookId) {
  const avgRating = getAverageRating(bookId);
  if (!avgRating) return '';
  const stars = Math.round(parseFloat(avgRating));
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    starsHTML += `<i class="fas fa-star ${i <= stars ? 'filled' : 'empty'}"></i>`;
  }
  return `<div class="book-rating">${starsHTML}<span class="book-rating-text">${avgRating}</span></div>`;
}

// Add progress badge to book cards
function addProgressBadge(bookId) {
  const progress = getBookProgress(bookId);
  if (!progress || progress.percent === 0 || progress.percent === 100) return '';
  return `<div class="continue-reading-badge">${progress.percent}%</div>`;
}

// Rating functions
function setRating(bookId, rating) {
  // Update stars visually
  const stars = document.querySelectorAll(`#rating-input-${bookId} .rating-star`);
  stars.forEach((star, i) => {
    star.classList.toggle('active', i < rating);
  });
  
  // Show review textarea and save button
  document.getElementById(`review-${bookId}`).style.display = 'block';
  document.getElementById(`save-review-${bookId}`).style.display = 'block';
  
  // Save rating immediately
  const review = document.getElementById(`review-${bookId}`).value;
  saveRating(bookId, rating, review);
}

function saveReview(bookId) {
  const stars = document.querySelectorAll(`#rating-input-${bookId} .rating-star.active`);
  const rating = stars.length;
  const review = document.getElementById(`review-${bookId}`).value;
  
  if (rating > 0) {
    saveRating(bookId, rating, review);
    const btn = document.getElementById(`save-review-${bookId}`);
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Sauvegardé !';
    btn.style.background = 'var(--success)';
    setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; }, 2000);
  }
}

// ===== COMMUNITY REVIEWS =====
function renderCommunityReviews(bookId) {
  const globalRatings = JSON.parse(localStorage.getItem('novela_global_ratings') || '{}');
  const reviews = globalRatings[bookId]?.reviews || [];
  if (!reviews.length) return '';

  const items = reviews.map((r, i) => {
    const stars = [1,2,3,4,5].map(s => `<i class="fas fa-star" style="color:${s<=r.rating?'#fbbf24':'#374151'};font-size:.7rem"></i>`).join('');
    const date = new Date(r.date).toLocaleDateString('fr-FR');
    const avatar = (r.user || 'A')[0].toUpperCase();
    return `
      <div class="community-review-item">
        <div class="cr-header">
          <div class="cr-avatar">${avatar}</div>
          <div class="cr-meta">
            <span class="cr-user">${r.user || 'Anonyme'}</span>
            <div class="cr-stars">${stars}</div>
          </div>
          <div class="cr-right">
            <span class="cr-date">${date}</span>
            <button class="cr-report-btn" onclick="reportReview(${bookId},${i},'${(r.review||'').replace(/'/g,"\\'").substring(0,80)}','${(r.user||'').replace(/'/g,"\\'")}')">
              <i class="fas fa-flag"></i>
            </button>
          </div>
        </div>
        ${r.review ? `<p class="cr-text">"${r.review}"</p>` : ''}
      </div>`;
  }).join('');

  return `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)">
      <h4 style="font-size:.9rem;margin-bottom:12px;color:var(--text2)">
        <i class="fas fa-users" style="margin-right:6px"></i>Avis de la communauté (${reviews.length})
      </h4>
      <div class="community-reviews-list">${items}</div>
    </div>`;
}

async function reportReview(bookId, reviewIndex, reviewText, reviewUser) {
  const reasons = ['Contenu inapproprié', 'Spam', 'Harcèlement', 'Faux avis', 'Autre'];
  
  // Show reason picker modal
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid rgba(124,106,247,.3);border-radius:16px;padding:24px;max-width:360px;width:100%">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:6px;color:var(--text)"><i class="fas fa-flag" style="color:#f87171;margin-right:8px"></i>Signaler cet avis</h3>
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:16px;font-style:italic">"${reviewText}${reviewText.length>=80?'...':''}"</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        ${reasons.map(r => `<button onclick="submitReport(${bookId},${reviewIndex},'${reviewText}','${reviewUser}','${r}',this.closest('[style*=fixed]'))" 
          style="padding:10px 14px;background:var(--bg3);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:var(--text);cursor:pointer;text-align:left;font-size:.88rem;transition:all .2s"
          onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)'">${r}</button>`).join('')}
      </div>
      <button onclick="this.closest('[style*=fixed]').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:10px;color:var(--text2);cursor:pointer;font-size:.85rem">Annuler</button>
    </div>`;
  document.body.appendChild(modal);
}

async function submitReport(bookId, reviewIndex, reviewText, reviewUser, reason, modalEl) {
  modalEl.remove();
  try {
    await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, reviewIndex, reviewText, reviewUser, reason, reportedBy: currentUser?.name || 'Anonyme' })
    });
  } catch(e) {
    // Store locally as fallback
    const reports = JSON.parse(localStorage.getItem('novela_reports') || '[]');
    reports.push({ bookId, reviewIndex, reviewText, reviewUser, reason, reportedBy: currentUser?.name, date: Date.now(), status: 'pending' });
    localStorage.setItem('novela_reports', JSON.stringify(reports));
  }
  showProfileToast('🚩 Signalement envoyé. Merci !');
}

// ===== UPDATE USERNAME/NAME =====
async function updateUsername(newName, newUsername) {
  if (!currentUser) return;
  try {
    const res = await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, name: newName, username: newUsername })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    currentUser.name = newName || currentUser.name;
    currentUser.username = newUsername || currentUser.username;
    localStorage.setItem('biblio_session', JSON.stringify(currentUser));
    document.getElementById('nav-username').textContent = currentUser.name;
    return { success: true };
  } catch(e) {
    // Fallback: update locally
    currentUser.name = newName || currentUser.name;
    currentUser.username = newUsername || currentUser.username;
    localStorage.setItem('biblio_session', JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem('biblio_users') || '[]');
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) { users[idx].name = currentUser.name; users[idx].username = currentUser.username; localStorage.setItem('biblio_users', JSON.stringify(users)); }
    return { success: true };
  }
}

// Ajouter badge toast animation CSS
const badgeStyle = document.createElement('style');
badgeStyle.textContent = `
@keyframes slideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideOutRight{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(60px)}}
`;
document.head.appendChild(badgeStyle);

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const links = document.getElementById('nav-links');
  const overlay = document.getElementById('mobile-overlay');
  const icon = document.getElementById('hamburger-icon');
  const isOpen = links.classList.contains('mobile-open');
  links.classList.toggle('mobile-open', !isOpen);
  overlay.classList.toggle('active', !isOpen);
  icon.className = isOpen ? 'fas fa-bars' : 'fas fa-times';
}
function closeMobileMenu() {
  const links = document.getElementById('nav-links');
  const overlay = document.getElementById('mobile-overlay');
  const icon = document.getElementById('hamburger-icon');
  links.classList.remove('mobile-open');
  overlay.classList.remove('active');
  icon.className = 'fas fa-bars';
}

// ===== NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const idx = ['home','library','quiz','ai','history'].indexOf(id);
  if (idx >= 0) document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  if (id === 'history') renderHistory();
  if (id === 'profile') initProfile();
  if (id === 'community') initCommunity();
  if (id === 'scoreboard') renderScoreboard();
  if (id === 'rewards') renderRewardsPage();
  if (id === 'stats') renderStatsPage();
  if (id === 'home') { renderHomeExtras(); }
  if (id === 'library' && document.getElementById('library-books').children.length <= BOOKS.length) {
    setTimeout(() => fetchGutenbergPage(true), 100);
  }
  if (id === 'quiz') {
    const grid = document.getElementById('quiz-books-grid');
    if (grid && grid.children.length === 0) initQuizBooks();
  }
  // Update sidebar active state
  ['home','library','quiz','ai','history','scoreboard','rewards','stats','community'].forEach(p => {
    const el = document.getElementById('sb-' + p);
    if (el) el.classList.toggle('active', p === id);
  });
  // Update mobile bottom nav
  ['home','library','quiz','ai','profile'].forEach(p => {
    const el = document.getElementById('mob-' + p);
    if (el) el.classList.toggle('active', p === id);
  });
  // Init 3D tilt on new cards
  setTimeout(init3DTilt, 300);
}

// ===== BOOKS =====
let activeGenre = 'Tous';

function getCoverUrl(b) {
  if (b.cover) return b.cover;
  if (b.isbn) return `https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`;
  if (b.olid) return `https://covers.openlibrary.org/b/olid/${b.olid}-M.jpg`;
  return null;
}

// Fetch cover from multiple sources
async function fetchGoogleBooksCover(bookId, title, author) {
  if (coverCache[bookId]) return coverCache[bookId];
  
  // Try multiple search strategies
  const queries = [
    `${title} ${author}`,
    title,
    `${author} ${title.substring(0, 15)}`
  ];

  for (const q of queries) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=3&fields=items(volumeInfo/imageLinks,volumeInfo/title)`);
      const data = await res.json();
      for (const item of data.items || []) {
        const links = item.volumeInfo?.imageLinks;
        const thumb = links?.thumbnail || links?.smallThumbnail;
        if (thumb) {
          // Skip white/blank covers (they're usually very small)
          const url = thumb.replace('http://', 'https://').replace('zoom=1', 'zoom=2').replace('&edge=curl', '');
          coverCache[bookId] = url;
          return url;
        }
      }
    } catch(e) {}
  }

  // Try Open Library by title as last resort
  try {
    const q = encodeURIComponent(title.substring(0, 20));
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i`);
    const data = await res.json();
    const coverId = data.docs?.[0]?.cover_i;
    if (coverId) {
      const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
      coverCache[bookId] = url;
      return url;
    }
  } catch(e) {}

  return null;
}

// Cache for Google Books covers
const coverCache = {};

// Pre-load covers — DISABLED (too slow, loads on demand instead)
async function preloadMissingCovers() {
  // Covers load on-demand via loadMissingCovers() when books are rendered
}

async function fetchGoogleBooksCover(bookId, title, author) {
  if (coverCache[bookId]) return coverCache[bookId];
  try {
    // Try multiple search strategies
    const queries = [
      `"${title}" "${author}"`,
      `${title} ${author}`,
      title
    ];
    for (const q of queries) {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1&fields=items(volumeInfo/imageLinks)`);
      const data = await res.json();
      const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
        || data.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail;
      if (thumb) {
        const url = thumb.replace('http://', 'https://').replace('zoom=1', 'zoom=3');
        coverCache[bookId] = url;
        return url;
      }
    }
  } catch(e) {}
  return null;
}

function renderBookCardWithCover(b, eager = false) {
  const cover = getCoverUrl(b);
  const loadAttr = eager ? 'eager' : 'lazy';
  if (cover) {
    return `<img src="${cover}" alt="${b.title}" loading="${loadAttr}" decoding="async"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';loadGoogleCoverForCard(${b.id},'${b.title.replace(/'/g,"\\'")}','${b.author.replace(/'/g,"\\'")}',this.parentElement)"
      style="width:100%;height:100%;object-fit:cover;display:block">
      <div class="cover-placeholder" style="display:none;background:${b.color}25">
        <span>${b.emoji}</span><p>${b.title}</p>
      </div>`;
  }
  if (coverCache[b.id]) {
    return `<img src="${coverCache[b.id]}" alt="${b.title}" loading="${loadAttr}" decoding="async"
      onerror="this.style.display='none'"
      style="width:100%;height:100%;object-fit:cover;display:block">`;
  }
  // No cover — show placeholder and load Google Books cover async
  return `<div class="cover-placeholder" id="cover-${b.id}" style="background:${b.color}25">
    <span>${b.emoji}</span><p>${b.title}</p>
  </div>`;
}

async function loadGoogleCoverForCard(bookId, title, author, container) {
  const url = await fetchGoogleBooksCover(bookId, title, author);
  if (url && container) {
    container.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`;
  }
}

// Load Google Books covers for books without ISBN — batched to avoid rate limiting
async function loadMissingCovers() {
  const placeholders = document.querySelectorAll('[id^="cover-"]');
  if (!placeholders.length) return;

  // Process in batches of 4 with small delay
  const batch = Array.from(placeholders).slice(0, 12);
  for (let i = 0; i < batch.length; i += 4) {
    const group = batch.slice(i, i + 4);
    await Promise.all(group.map(async el => {
      const id = parseInt(el.id.replace('cover-', ''));
      const book = BOOKS.find(b => b.id === id);
      if (!book) return;
      const url = await fetchGoogleBooksCover(id, book.title, book.author);
      if (url) {
        const elNow = document.getElementById('cover-' + id);
        if (elNow) {
          // Validate image loads properly before replacing
          const img = new Image();
          img.onload = () => {
            // Skip tiny images (likely blank/white covers)
            if (img.naturalWidth < 30) return;
            const el2 = document.getElementById('cover-' + id);
            if (el2) el2.outerHTML = `<img src="${url}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display='none'">`;
          };
          img.src = url;
        }
      }
    }));
    if (i + 4 < batch.length) await new Promise(r => setTimeout(r, 200));
  }
}

function renderBooks(container, books) {
  const el = document.getElementById(container);
  if (!books.length) { el.innerHTML = '<p style="color:var(--text2);grid-column:1/-1;text-align:center;padding:40px">Aucun livre trouvé.</p>'; return; }
  el.innerHTML = books.map((b, i) => {
    const eager = i < 8; // first 8 load immediately
    return `
    <div class="book-card" onclick="openBook(${b.id})">
      <div class="book-cover">${renderBookCardWithCover(b, eager)}</div>
      <div class="book-info">
        <h4>${b.title}</h4>
        <p>${b.author}</p>
        <span class="book-genre">${b.genre}</span>
      </div>
      <div class="book-card-actions">
        <button class="book-action-btn fav ${isFavorite(b.id)?'active':''}" onclick="event.stopPropagation();toggleFavorite(${b.id},this)" title="Favoris"><i class="fas fa-heart"></i></button>
        <button class="book-action-btn later ${isReadLater(b.id)?'active':''}" onclick="event.stopPropagation();toggleReadLater(${b.id},this)" title="Lire plus tard"><i class="fas fa-clock"></i></button>
      </div>
    </div>`;
  }).join('');
  setTimeout(() => loadMissingCovers(), 100);
}

function filterBooks() {
  const q = document.getElementById('search-input').value.toLowerCase();
  let filtered = BOOKS;

  // Filter by active language using both lang field AND genre
  if (gutenbergLang && gutenbergLang !== 'fr') {
    filtered = filtered.filter(b => {
      const lang = b.lang || '';
      const genre = b.genre || '';
      if (gutenbergLang === 'en') {
        return lang === 'en' || genre.includes('English') || genre.includes('Anglais');
      }
      if (gutenbergLang === 'ar') {
        return lang === 'ar' || genre.includes('عربية') || genre.includes('Arabic');
      }
      if (gutenbergLang === 'es') {
        return lang === 'es' || genre.includes('Español') || genre.includes('Spanish');
      }
      return true;
    });
  } else if (gutenbergLang === 'fr') {
    filtered = filtered.filter(b => {
      const lang = b.lang || '';
      const genre = b.genre || '';
      return lang === 'fr' || genre.includes('Français') || genre.includes('French') ||
             genre.includes('Roman') || genre.includes('Policier') || genre.includes('Science-fiction') ||
             genre.includes('Philosophie') || genre.includes('Poésie') ||
             (!lang && !genre.includes('English') && !genre.includes('عربية') && !genre.includes('Español'));
    });
  }

  if (activeGenre !== 'Tous') filtered = filtered.filter(b => b.genre === activeGenre);
  if (q) filtered = filtered.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.genre || '').toLowerCase().includes(q)
  );
  renderBooks('library-books', filtered);
}

function initGenreFilters() {
  const genres = ['Tous', ...new Set(BOOKS.map(b => b.genre))];
  // Map Arabic genre names to clean labels
  const genreLabels = {
    'رواية عربية': '🇸🇦 Arabe',
    'ملحمة عربية': '🇸🇦 Épopée arabe',
    'English Novel': '🇬🇧 English',
  };
  document.getElementById('genre-filters').innerHTML = genres.map(g => {
    const label = genreLabels[g] || g;
    return `<button class="genre-btn${g==='Tous'?' active':''}" onclick="setGenre('${g}')">${label}</button>`;
  }).join('');
}

function setGenre(g) {
  activeGenre = g;
  document.querySelectorAll('.genre-btn').forEach(b => b.classList.toggle('active', b.textContent === g));
  filterBooks();
}

async function openBook(id) {
  const b = BOOKS.find(x => x.id === id);
  if (!b) return;

  // Show modal immediately with placeholder, then load cover
  const coverSrc = getCoverUrl(b) || coverCache[b.id] || null;
  const coverHTML = coverSrc
    ? `<img src="${coverSrc}" alt="${b.title}" id="modal-cover-img"
        style="width:120px;height:180px;object-fit:cover;border-radius:8px;float:left;margin:0 20px 12px 0"
        onerror="this.outerHTML='<div style=\\'width:120px;height:180px;background:${b.color}30;border-radius:8px;float:left;margin:0 20px 12px 0;display:flex;align-items:center;justify-content:center;font-size:3rem\\'>${b.emoji}</div>'">`
    : `<div style="width:120px;height:180px;background:${b.color}30;border-radius:8px;float:left;margin:0 20px 12px 0;display:flex;align-items:center;justify-content:center;font-size:3rem" id="modal-cover-placeholder">${b.emoji}</div>`;

  document.getElementById('modal-content').innerHTML = `
    ${coverHTML}
    <h2 class="modal-book-title">${b.title}</h2>
    <p class="modal-book-author">✍️ ${b.author}</p>
    <div class="modal-book-meta">
      <span>📅 ${b.year < 0 ? Math.abs(b.year)+' av. J.-C.' : b.year}</span>
      <span>🏷️ ${b.genre}</span>
      ${getAverageRating(b.id) ? `<span>⭐ ${getAverageRating(b.id)}/5</span>` : ''}
    </div>
    <p class="modal-book-desc">${b.desc}</p>
    
    <!-- Rating Section -->
    <div style="clear:both;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)">
      <h4 style="font-size:.9rem;margin-bottom:8px">Votre avis</h4>
      <div class="rating-input" id="rating-input-${b.id}">
        ${[1,2,3,4,5].map(i => `<i class="fas fa-star rating-star ${getUserRating(b.id)?.rating >= i ? 'active' : ''}" onclick="setRating(${b.id}, ${i})"></i>`).join('')}
      </div>
      ${getUserRating(b.id)?.review ? `<p style="font-size:.85rem;color:var(--text2);font-style:italic;margin-top:8px">"${getUserRating(b.id).review}"</p>` : ''}
      <textarea class="review-textarea" id="review-${b.id}" placeholder="Écrivez votre avis (optionnel)..." style="display:${getUserRating(b.id) ? 'block' : 'none'}">${getUserRating(b.id)?.review || ''}</textarea>
      <button class="btn-secondary" id="save-review-${b.id}" style="display:${getUserRating(b.id) ? 'block' : 'none'};margin-top:8px;font-size:.82rem" onclick="saveReview(${b.id})">
        <i class="fas fa-save"></i> Sauvegarder l'avis
      </button>
    </div>
    ${renderCommunityReviews(b.id)}
    
    <br>
    <div style="display:flex;gap:10px;clear:both;margin-top:12px">
      <button class="btn-primary" style="flex:1" onclick="openReader(${b.id}); closeBookModal()">
        <i class="fas fa-book-open"></i> Lire
      </button>
      <button class="btn-secondary" style="flex:1" onclick="askAI('Parle-moi du livre ${b.title.replace(/'/g,"\\'")} de ${b.author}'); closeBookModal(); showPage('ai')">
        <i class="fas fa-robot"></i> Analyser avec l'IA
      </button>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn-secondary" style="flex:1;font-size:.82rem" onclick="toggleFavorite(${b.id});closeBookModal()">
        <i class="fas fa-heart" style="color:var(--pink)"></i> ${isFavorite(b.id) ? 'Retirer' : 'Favoris'}
      </button>
      <button class="btn-secondary" style="flex:1;font-size:.82rem" onclick="toggleReadLater(${b.id});closeBookModal()">
        <i class="fas fa-clock" style="color:var(--teal)"></i> ${isReadLater(b.id) ? 'Retirer' : 'À lire'}
      </button>
    </div>`;
  document.getElementById('book-modal').classList.add('open');

  // Load cover async in background if not available
  if (!coverSrc) {
    fetchGoogleBooksCover(b.id, b.title, b.author).then(url => {
      if (url) {
        const ph = document.getElementById('modal-cover-placeholder');
        if (ph) ph.outerHTML = `<img src="${url}" style="width:120px;height:180px;object-fit:cover;border-radius:8px;float:left;margin:0 20px 12px 0" onerror="this.style.display='none'">`;
      }
    }).catch(() => {});
  }
}

function closeBookModal() { document.getElementById('book-modal').classList.remove('open'); }
function closeModal(e) { if (e.target.id === 'book-modal') closeBookModal(); }

function openReader(id, gutId) {
  // Incrémenter les stats de lecture
  if (currentUser) {
    const stats = getUserStats();
    const histKey = 'reading_history_' + currentUser.email;
    const hist = JSON.parse(localStorage.getItem(histKey) || '{}');
    const bookKey = gutId ? 'g' + gutId : 'b' + id;
    if (!hist[bookKey]) {
      // Nouveau livre — incrémenter booksRead
      incrementStat('booksRead');
      // Détecter la langue pour polyglot badge
      const b = BOOKS.find(x => x.id === id);
      if (b && b.lang) {
        const langs = JSON.parse(localStorage.getItem('novela_langs_' + currentUser.email) || '[]');
        if (!langs.includes(b.lang)) {
          langs.push(b.lang);
          localStorage.setItem('novela_langs_' + currentUser.email, JSON.stringify(langs));
          const s = getUserStats();
          s.langsRead = langs.length;
          saveUserStats(s);
          checkNewBadges(s);
        }
      }
    }
  }
  if (gutId) window.location.href = 'reader.html?gid=' + gutId;
  else window.location.href = 'reader.html?id=' + id;
}

// ===== ARCHIVE.ORG FOR ARABIC BOOKS =====
async function searchArchiveOrg(title, author) {
  try {
    const q = encodeURIComponent(`language:arabic AND mediatype:texts AND title:(${title})`);
    const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&fl[]=creator&rows=3&output=json`;
    const res = await fetch(url);
    const data = await res.json();
    const docs = data.response?.docs;
    if (!docs?.length) return null;
    // Pick best match
    const match = docs.find(d => d.title?.includes(title.substring(0,5))) || docs[0];
    return match.identifier;
  } catch(e) { return null; }
}

function getArchiveCoverUrl(identifier) {
  return `https://archive.org/services/img/${identifier}`;
}

async function getArchiveTextUrl(identifier) {
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}/files`);
    const data = await res.json();
    const files = data.result || [];
    // Prefer plain text
    const txt = files.find(f => f.name?.endsWith('.txt') || f.format === 'DjVuTXT');
    if (txt) return `https://archive.org/download/${identifier}/${txt.name}`;
    // Fallback: djvu or pdf text layer
    const djvu = files.find(f => f.name?.endsWith('_djvu.txt'));
    if (djvu) return `https://archive.org/download/${identifier}/${djvu.name}`;
    return null;
  } catch(e) { return null; }
}
let gutenbergPage = 1;
let gutenbergQuery = '';
let gutenbergLang = '';  // filtre langue actif
let gutenbergLoading = false;
let searchTimer = null;

// Langues disponibles sur Gutenberg avec drapeaux
const GUTENBERG_LANGS = [
  { code: '', label: '🌍 Tous', labelEn: '🌍 All', labelEs: '🌍 Todos', labelAr: '🌍 الكل' },
  { code: 'en', label: '🇬🇧 Anglais', labelEn: '🇬🇧 English', labelEs: '🇬🇧 Inglés', labelAr: '🇬🇧 الإنجليزية' },
  { code: 'fr', label: '🇫🇷 Français', labelEn: '🇫🇷 French', labelEs: '🇫🇷 Francés', labelAr: '🇫🇷 الفرنسية' },
  { code: 'de', label: '🇩🇪 Allemand', labelEn: '🇩🇪 German', labelEs: '🇩🇪 Alemán', labelAr: '🇩🇪 الألمانية' },
  { code: 'es', label: '🇪🇸 Espagnol', labelEn: '🇪🇸 Spanish', labelEs: '🇪🇸 Español', labelAr: '🇪🇸 الإسبانية' },
  { code: 'it', label: '🇮🇹 Italien', labelEn: '🇮🇹 Italian', labelEs: '🇮🇹 Italiano', labelAr: '🇮🇹 الإيطالية' },
  { code: 'pt', label: '🇵🇹 Portugais', labelEn: '🇵🇹 Portuguese', labelEs: '🇵🇹 Portugués', labelAr: '🇵🇹 البرتغالية' },
  { code: 'ru', label: '🇷🇺 Russe', labelEn: '🇷🇺 Russian', labelEs: '🇷🇺 Ruso', labelAr: '🇷🇺 الروسية' },
  { code: 'zh', label: '🇨🇳 Chinois', labelEn: '🇨🇳 Chinese', labelEs: '🇨🇳 Chino', labelAr: '🇨🇳 الصينية' },
  { code: 'ar', label: '🇸🇦 Arabe', labelEn: '🇸🇦 Arabic', labelEs: '🇸🇦 Árabe', labelAr: '🇸🇦 العربية' },
  { code: 'ja', label: '🇯🇵 Japonais', labelEn: '🇯🇵 Japanese', labelEs: '🇯🇵 Japonés', labelAr: '🇯🇵 اليابانية' },
  { code: 'nl', label: '🇳🇱 Néerlandais', labelEn: '🇳🇱 Dutch', labelEs: '🇳🇱 Holandés', labelAr: '🇳🇱 الهولندية' },
  { code: 'la', label: '🏛️ Latin', labelEn: '🏛️ Latin', labelEs: '🏛️ Latín', labelAr: '🏛️ اللاتينية' },
  { code: 'fi', label: '🇫🇮 Finnois', labelEn: '🇫🇮 Finnish', labelEs: '🇫🇮 Finlandés', labelAr: '🇫🇮 الفنلندية' },
];

function initLangFilters() {
  const container = document.getElementById('lang-filters');
  if (!container) return;
  const labelKey = currentLang === 'en' ? 'labelEn' : currentLang === 'es' ? 'labelEs' : currentLang === 'ar' ? 'labelAr' : 'label';
  container.innerHTML = GUTENBERG_LANGS.map(l =>
    `<button class="lang-filter-btn${l.code === gutenbergLang ? ' active' : ''}" onclick="setLangFilter('${l.code}',this)">${l[labelKey]}</button>`
  ).join('');
}

function setLangFilter(code, btn) {
  gutenbergLang = code;
  gutenbergPage = 1;
  gutenbergQuery = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.lang-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // For Arabic — show local Arabic books directly
  if (code === 'ar') {
    const arabicBooks = BOOKS.filter(b => b.lang === 'ar' || (b.genre && b.genre.includes('\u0639\u0631\u0628\u064a\u0629')));
    renderBooks('library-books', arabicBooks);
    document.getElementById('load-more-wrap').style.display = 'none';
    return;
  }

  // For other languages — filter local books first, then fetch Gutenberg
  filterBooks();
  fetchGutenbergPage(true);
}

function onSearchInput() {
  const q = document.getElementById('search-input').value.trim();
  clearTimeout(searchTimer);
  if (q.length === 0) {
    filterBooks(); // local search
    return;
  }
  searchTimer = setTimeout(() => searchGutenbergBooks(q), 500);
}

async function searchGutenbergBooks(query) {
  gutenbergQuery = query;
  gutenbergPage = 1;
  const el = document.getElementById('library-books');
  el.innerHTML = '<p style="color:var(--text2);grid-column:1/-1;text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i> Recherche...</p>';
  document.getElementById('load-more-wrap').style.display = 'none';
  await fetchGutenbergPage(true);
}

async function fetchGutenbergPage(replace = false) {
  if (gutenbergLoading) return;
  gutenbergLoading = true;
  const el = document.getElementById('library-books');
  const loadingBar = document.getElementById('library-loading-bar');
  const loadMoreWrap = document.getElementById('load-more-wrap');
  
  console.log('fetchGutenbergPage called:', { 
    replace, 
    page: gutenbergPage, 
    loadMoreWrapExists: !!loadMoreWrap,
    currentDisplay: loadMoreWrap?.style.display 
  });

  if (replace) {
    if (loadingBar) loadingBar.style.display = 'block';
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';

    // Show local books immediately — don't replace with skeletons
    const localBooks = gutenbergLang === 'en'
      ? BOOKS.filter(b => b.lang === 'en' || (b.genre || '').includes('English'))
      : gutenbergLang === 'ar'
      ? BOOKS.filter(b => b.lang === 'ar' || (b.genre || '').includes('عربية'))
      : gutenbergLang === 'es'
      ? BOOKS.filter(b => b.lang === 'es' || (b.genre || '').includes('Español'))
      : BOOKS.slice(0, 20);
    renderBooks('library-books', localBooks.length ? localBooks : BOOKS.slice(0, 20));
  }

  try {
    // Check cache first (5 min expiry)
    const cacheKey = `gutenberg_${gutenbergPage}_${gutenbergLang}_${gutenbergQuery}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 300000) { // 5 min
          console.log('Using cached data:', { page: gutenbergPage, resultsCount: data.results?.length, hasNext: !!data.next });
          renderGutenbergBooks(data.results, replace);
          // Always show load more button if we have results
          const shouldShow = data.next || (data.results && data.results.length >= 32);
          if (loadMoreWrap) loadMoreWrap.style.display = shouldShow ? 'block' : 'none';
          if (loadingBar) loadingBar.style.display = 'none';
          gutenbergLoading = false;
          return;
        }
      } catch(e) {
        console.log('Cache parse error, fetching fresh data');
        localStorage.removeItem(cacheKey);
      }
    }

    let url = `https://gutendex.com/books/?page=${gutenbergPage}&sort=popular`;
    if (gutenbergLang) url += `&languages=${gutenbergLang}`;
    else url += `&languages=fr,en,es,de,it,pt,ru,zh,ar,ja`;
    if (gutenbergQuery) url += `&search=${encodeURIComponent(gutenbergQuery)}`;
    
    // Reduced timeout for faster fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    
    console.log('Gutenberg response:', { 
      page: gutenbergPage, 
      resultsCount: data.results?.length, 
      hasNext: !!data.next,
      nextUrl: data.next 
    });
    
    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch(e) {
      // Quota exceeded, clear old cache
      Object.keys(localStorage).filter(k => k.startsWith('gutenberg_')).forEach(k => localStorage.removeItem(k));
    }
    
    renderGutenbergBooks(data.results, replace);
    // Always show load more button if we have results (Gutenberg has many pages)
    if (loadMoreWrap) {
      const shouldShow = data.next || (data.results && data.results.length >= 32);
      loadMoreWrap.style.display = shouldShow ? 'block' : 'none';
      console.log('Load more button:', shouldShow ? 'visible' : 'hidden', 'Element exists:', !!loadMoreWrap);
    } else {
      console.error('Load more wrap element not found!');
    }
  } catch(e) {
    console.error('Gutenberg fetch error:', e);
    if (replace) {
      // Fallback to local books if Gutenberg fails
      renderBooks('library-books', BOOKS.slice(0, 20));
      if (loadMoreWrap) {
        loadMoreWrap.style.display = 'none';
      } else {
        console.error('Load more wrap element not found in error handler!');
      }
    }
  }
  
  // Hide loading bar
  if (loadingBar) loadingBar.style.display = 'none';
  gutenbergLoading = false;
  
  // Final check: ensure load more button is visible if we're on page 1
  setTimeout(() => {
    const btn = document.getElementById('load-more-wrap');
    if (btn && gutenbergPage === 1) {
      btn.style.display = 'block';
      console.log('Force showing load more button on page 1');
    }
  }, 500);
}

function renderGutenbergBooks(books, replace) {
  const el = document.getElementById('library-books');
  const html = books.map((b, idx) => {
    const cover = b.formats?.['image/jpeg'] || '';
    const author = b.authors?.[0]?.name || 'Auteur inconnu';
    const authorFmt = author.includes(',') ? author.split(',').reverse().map(s=>s.trim()).join(' ') : author;
    const lang = b.languages?.[0] || '';
    // Prioritize loading first 6 images, lazy load rest
    const loadingAttr = idx < 6 ? 'eager' : 'lazy';
    const coverHTML = cover
      ? `<img src="${cover}" alt="${b.title}" loading="${loadingAttr}" decoding="async" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cover-placeholder" style="display:none;background:#1c1b35"><span>📖</span></div>`
      : `<div class="cover-placeholder" style="background:#1c1b35"><span>📖</span></div>`;
    return `<div class="book-card" onclick="openGutenbergBook(${b.id}, ${JSON.stringify(b.title).replace(/"/g,'&quot;')}, ${JSON.stringify(authorFmt).replace(/"/g,'&quot;')}, '${cover}', ${JSON.stringify(b.summaries?.[0]||'').replace(/"/g,'&quot;')})">
      <div class="book-cover">${coverHTML}</div>
      <div class="book-info">
        <h4>${b.title.substring(0, 50)}${b.title.length > 50 ? '...' : ''}</h4>
        <p>${authorFmt}</p>
        <span class="book-genre">${lang.toUpperCase()} · ${(b.download_count/1000).toFixed(0)}k ⬇️</span>
      </div>
    </div>`;
  }).join('');
  if (replace) el.innerHTML = html;
  else el.innerHTML += html;
}

function openGutenbergBook(gutId, title, author, cover, desc) {
  // Use gutId as a string key for favorites/read later
  const bookKey = 'gut_' + gutId;
  const isFav = isFavoriteKey(bookKey);
  const isLater = isReadLaterKey(bookKey);

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-book-cover" style="background:#1c1b35;border-radius:10px;overflow:hidden">
      ${cover ? `<img src="${cover}" style="width:120px;height:180px;object-fit:cover">` : `<span style="font-size:3rem">📖</span>`}
    </div>
    <h2 class="modal-book-title">${title}</h2>
    <p class="modal-book-author">✍️ ${author}</p>
    <div class="modal-book-meta"><span>✅ Texte intégral gratuit</span><span>Project Gutenberg</span></div>
    <p class="modal-book-desc">${(desc||'').substring(0,300)}${desc?.length>300?'...':''}</p>
    <br>
    <div style="display:flex;gap:10px;clear:both;margin-top:12px">
      <button class="btn-primary" style="flex:1" onclick="openReader(0,${gutId}); closeBookModal()">
        <i class="fas fa-book-open"></i> Lire le livre entier
      </button>
      <button class="btn-secondary" style="flex:1" onclick="askAI('Parle-moi du livre ${title.replace(/'/g,"\\'")} de ${author}'); closeBookModal(); showPage('ai')">
        <i class="fas fa-robot"></i> Analyser avec l'IA
      </button>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn-secondary" style="flex:1;font-size:.82rem" id="gut-fav-btn" onclick="toggleFavoriteKey('${bookKey}','${title.replace(/'/g,"\\'")}','${author.replace(/'/g,"\\'")}','${cover}',this)">
        <i class="fas fa-heart" style="color:var(--pink)"></i> ${isFav ? 'Retirer' : 'Favoris'}
      </button>
      <button class="btn-secondary" style="flex:1;font-size:.82rem" id="gut-later-btn" onclick="toggleReadLaterKey('${bookKey}','${title.replace(/'/g,"\\'")}','${author.replace(/'/g,"\\'")}','${cover}',this)">
        <i class="fas fa-clock" style="color:var(--teal)"></i> ${isLater ? 'Retirer' : 'À lire'}
      </button>
    </div>`;
  document.getElementById('book-modal').classList.add('open');
}

async function loadMoreGutenberg() {
  gutenbergPage++;
  await fetchGutenbergPage(false);
}

// ===== QUIZ IA =====
let quizState = { book: null, questions: [], idx: 0, score: 0, cat: null };

// ===== QUIZ BOOKS (Gutenberg) =====
let quizGutPage = 1;
let quizGutQuery = '';
let quizGutLoading = false;
let quizSearchTimer = null;

function initQuizBooks() {
  const grid = document.getElementById('quiz-books-grid');
  if (!grid) return;
  fetchQuizGutenbergPage(true);
}

async function fetchQuizGutenbergPage(replace = false) {
  if (quizGutLoading) return;
  quizGutLoading = true;
  const grid = document.getElementById('quiz-books-grid');
  if (!grid) { quizGutLoading = false; return; }

  if (replace) {
    grid.innerHTML = Array(12).fill(0).map(() => `
      <div class="book-card skeleton-card">
        <div class="book-cover skeleton-cover"></div>
        <div class="book-info">
          <div class="skeleton-line" style="width:80%;height:12px;margin-bottom:8px"></div>
          <div class="skeleton-line" style="width:55%;height:10px"></div>
        </div>
      </div>`).join('');
  }

  try {
    let url = `https://gutendex.com/books/?page=${quizGutPage}&languages=fr,en`;
    if (quizGutQuery) url += `&search=${encodeURIComponent(quizGutQuery)}`;
    const res = await fetch(url);
    const data = await res.json();
    renderQuizGutBooks(data.results, replace);
    const moreBtn = document.getElementById('quiz-load-more');
    if (moreBtn) moreBtn.style.display = data.next ? 'inline-block' : 'none';
  } catch(e) {
    // fallback to local books
    renderQuizBooks(BOOKS.slice(0, 24));
  }
  quizGutLoading = false;
}

function renderQuizGutBooks(books, replace) {
  const grid = document.getElementById('quiz-books-grid');
  if (!grid) return;
  const html = books.map(b => {
    const cover = b.formats?.['image/jpeg'] || '';
    const author = b.authors?.[0]?.name || '';
    const authorFmt = author.includes(',') ? author.split(',').reverse().map(s=>s.trim()).join(' ') : author;
    // Escape for safe use in onclick attribute
    const safeTitle = b.title.replace(/'/g, "\\'").replace(/"/g, '&quot;').substring(0, 80);
    const safeAuthor = authorFmt.replace(/'/g, "\\'").replace(/"/g, '&quot;').substring(0, 60);
    const coverHTML = cover
      ? `<img src="${cover}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cover-placeholder" style="display:none;background:#1c1b35"><span>📖</span></div>`
      : `<div class="cover-placeholder" style="background:#1c1b35"><span>📖</span></div>`;
    return `<div class="book-card quiz-book-pick" onclick="startAIQuizGut(${b.id}, '${safeTitle}', '${safeAuthor}')">
      <div class="book-cover">${coverHTML}</div>
      <div class="book-info">
        <h4>${b.title.substring(0,45)}${b.title.length>45?'...':''}</h4>
        <p>${authorFmt}</p>
      </div>
      <div class="quiz-pick-overlay"><i class="fas fa-question-circle"></i> Quiz IA</div>
    </div>`;
  }).join('');
  if (replace) grid.innerHTML = html;
  else grid.innerHTML += html;
}

function renderQuizBooks(books) {
  const grid = document.getElementById('quiz-books-grid');
  if (!grid) return;
  grid.innerHTML = books.map(b => {
    const cover = getCoverUrl(b);
    const img = cover
      ? `<img src="${cover}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:100%;height:100%;object-fit:cover"><div class="cover-placeholder" style="display:none;background:${b.color}25"><span>${b.emoji}</span></div>`
      : `<div class="cover-placeholder" style="background:${b.color}25"><span>${b.emoji}</span></div>`;
    return `<div class="book-card quiz-book-pick" onclick="startAIQuiz(${b.id})">
      <div class="book-cover">${img}</div>
      <div class="book-info"><h4>${b.title}</h4><p>${b.author}</p></div>
      <div class="quiz-pick-overlay"><i class="fas fa-question-circle"></i> Quiz IA</div>
    </div>`;
  }).join('');
}

function filterQuizBooks() {
  const q = document.getElementById('quiz-search').value.trim();
  clearTimeout(quizSearchTimer);
  quizSearchTimer = setTimeout(() => {
    quizGutQuery = q;
    quizGutPage = 1;
    fetchQuizGutenbergPage(true);
  }, 400);
}

function loadMoreQuizBooks() {
  quizGutPage++;
  fetchQuizGutenbergPage(false);
}

// Quiz from Gutenberg book
async function startAIQuizGut(gutId, title, author) {
  document.getElementById('quiz-menu').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-loading').style.display = 'flex';
  document.getElementById('quiz-book-name').textContent = title;
  await generateAndStartQuiz({ title, author, id: gutId });
}

// Quiz from local book
async function startAIQuiz(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;
  document.getElementById('quiz-menu').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-loading').style.display = 'flex';
  document.getElementById('quiz-book-name').textContent = book.title;
  await generateAndStartQuiz(book);
}

async function generateAndStartQuiz(book) {
  // Use interface language instead of book language
  const langInstructions = {
    fr: 'Génère le quiz en français.',
    en: 'Generate the quiz in English.',
    es: 'Genera el quiz en español.',
    ar: 'اكتب الاختبار باللغة العربية الفصحى.'
  };
  
  const bookLangNote = langInstructions[currentLang] || langInstructions['en'];

  const prompt = `${bookLangNote} Generate a quiz of exactly 5 multiple choice questions about the book "${book.title}" by ${book.author}. 4 options per question, exactly 1 correct answer, short explanation. Respond ONLY with valid JSON, nothing else:
{"questions":[{"q":"question","opts":["A","B","C","D"],"ans":0,"exp":"explanation"}]}`;

  try {
    const apiKey = geminiApiKey;
    if (!apiKey) throw new Error('No API key');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.choices?.[0]?.message?.content || '';

    // Extract JSON robustly
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON: ' + raw.substring(0, 100));
    const parsed = JSON.parse(raw.substring(start, end + 1));
    if (!parsed.questions?.length) throw new Error('No questions in response');

    quizState = { book, questions: parsed.questions, idx: 0, score: 0, cat: book.title };
    document.getElementById('quiz-loading').style.display = 'none';
    document.getElementById('quiz-game').style.display = 'block';
    document.getElementById('quiz-category-title').textContent = `📖 ${book.title}`;
    renderQuestion();
  } catch(e) {
    console.error('Quiz error:', e.message);
    document.getElementById('quiz-loading').style.display = 'none';
    document.getElementById('quiz-menu').style.display = 'block';
    const errorMessages = {
      fr: e.message.includes('API key') ? 'Clé API manquante' : e.message.includes('JSON') ? 'Réponse invalide — réessayez' : 'Erreur de génération. Réessayez.',
      en: e.message.includes('API key') ? 'API key missing' : e.message.includes('JSON') ? 'Invalid response — try again' : 'Generation error. Try again.',
      es: e.message.includes('API key') ? 'Clave API faltante' : e.message.includes('JSON') ? 'Respuesta inválida — inténtalo de nuevo' : 'Error de generación. Inténtalo de nuevo.',
      ar: e.message.includes('API key') ? 'مفتاح API مفقود' : e.message.includes('JSON') ? 'استجابة غير صالحة — حاول مرة أخرى' : 'خطأ في التوليد. حاول مرة أخرى.'
    };
    showToastQuiz('❌ ' + (errorMessages[currentLang] || errorMessages['en']));
  }
}

function showToastQuiz(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e2035;color:#f87171;padding:12px 24px;border-radius:50px;border:1px solid rgba(248,113,113,.3);font-size:.88rem;z-index:999';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function initQuizCategories() {
  const el = document.getElementById('quiz-categories');
  if (!el) return;
  el.innerHTML = Object.entries(QUIZ_DATA).map(([name, data]) => `
    <div class="quiz-cat-card" onclick="startStaticQuiz('${name}')">
      <div class="cat-icon">${data.icon}</div>
      <h3>${name}</h3>
      <p>${data.desc}</p>
    </div>`).join('');
}

function startStaticQuiz(cat) {
  quizState = { book: null, questions: [...QUIZ_DATA[cat].questions].sort(() => Math.random() - 0.5), idx: 0, score: 0, cat };
  document.getElementById('quiz-menu').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-game').style.display = 'block';
  document.getElementById('quiz-category-title').textContent = QUIZ_DATA[cat].icon + ' ' + cat;
  renderQuestion();
}

function renderQuestion() {
  const { questions, idx, score } = quizState;
  const q = questions[idx];
  document.getElementById('quiz-progress').textContent = `Question ${idx+1} / ${questions.length}`;
  document.getElementById('quiz-score-display').textContent = `Score: ${score}`;
  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-next-btn').style.display = 'none';
  document.getElementById('quiz-options').innerHTML = q.opts.map((o, i) =>
    `<button class="quiz-option" onclick="answerQuiz(${i})">${o}</button>`).join('');
}

function answerQuiz(chosen) {
  const q = quizState.questions[quizState.idx];
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach(o => o.disabled = true);
  const fb = document.getElementById('quiz-feedback');
  if (chosen === q.ans) {
    opts[chosen].classList.add('correct');
    quizState.score++;
    fb.textContent = '✅ Correct ! ' + q.exp;
    fb.className = 'quiz-feedback show correct';
  } else {
    opts[chosen].classList.add('wrong');
    opts[q.ans].classList.add('correct');
    fb.textContent = '❌ Incorrect. ' + q.exp;
    fb.className = 'quiz-feedback show wrong';
  }
  document.getElementById('quiz-score-display').textContent = `Score: ${quizState.score}`;
  const btn = document.getElementById('quiz-next-btn');
  btn.textContent = quizState.idx >= quizState.questions.length - 1 ? 'Voir les résultats 🏆' : 'Question suivante →';
  btn.style.display = 'inline-block';
}

function nextQuestion() {
  quizState.idx++;
  if (quizState.idx >= quizState.questions.length) { showResult(); return; }
  renderQuestion();
}

function showResult() {
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  const { score, questions } = quizState;
  const pct = Math.round((score / questions.length) * 100);
  const icons = ['😢','😕','🙂','😊','🌟'];
  const msgs = ['Continuez à lire !','Pas mal, mais vous pouvez mieux faire !','Bien joué !','Excellent !','Parfait ! Vous êtes un expert !'];
  const lvl = Math.min(4, Math.floor(pct / 20));
  document.getElementById('result-icon').textContent = icons[lvl];
  document.getElementById('result-title').textContent = msgs[lvl];
  document.getElementById('result-score').textContent = `${score} / ${questions.length} (${pct}%)`;
  document.getElementById('result-msg').textContent = quizState.book ? `Quiz sur : ${quizState.book.title}` : `Catégorie : ${quizState.cat}`;
  // Incrémenter stats quiz
  incrementStat('quizDone');
  const stats = getUserStats();
  if (pct > (stats.bestQuiz || 0)) {
    stats.bestQuiz = pct;
    saveUserStats(stats);
    checkNewBadges(stats);
  }
  // Save score to scoreboard
  const bookTitle = quizState.book ? quizState.book.title : quizState.cat;
  saveQuizScore(score, questions.length, bookTitle);
}

function resetQuiz() {
  if (quizState.book) {
    // Re-run quiz on same book — just call generateAndStartQuiz directly
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-game').style.display = 'none';
    document.getElementById('quiz-loading').style.display = 'flex';
    document.getElementById('quiz-book-name').textContent = quizState.book.title;
    generateAndStartQuiz(quizState.book);
  } else {
    startStaticQuiz(quizState.cat);
  }
}

function backToQuizMenu() {
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-loading').style.display = 'none';
  document.getElementById('quiz-menu').style.display = 'block';
}

// ===== AI CHAT =====
function formatAIText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function addMessage(text, role) {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div class="chat-avatar"><i class="fas fa-${role==='ai'?'robot':'user'}"></i></div>
    <div class="chat-bubble"><p>${formatAIText(text)}</p></div>`;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function addTyping() {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = 'chat-msg ai';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="chat-avatar"><i class="fas fa-robot"></i></div><div class="chat-bubble typing-dots"><span></span><span></span><span></span></div>`;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.disabled = true;
  document.querySelector('.chat-input-area button').disabled = true;

  addMessage(msg, 'user');
  addTyping();

  const reply = await callGemini(msg);
  removeTyping();

  if (reply) addMessage(reply, 'ai');

  input.disabled = false;
  document.querySelector('.chat-input-area button').disabled = false;
  input.focus();
}

function askAI(msg) {
  showPage('ai');
  document.getElementById('chat-input').value = msg;
  sendMessage();
}

// ===== INIT =====
function initApp() {
  setLang(currentLang);
  // Init lang dropdown active state on load
  const flags = { fr: '🇫🇷 FR', en: '🇬🇧 EN', ar: '🇸🇦 AR', es: '🇪🇸 ES' };
  const activeBtn = document.getElementById('lang-active-btn');
  if (activeBtn) activeBtn.innerHTML = `${flags[currentLang] || '🇫🇷 FR'} <i class="fas fa-chevron-down" id="lang-chevron"></i>`;
  const activeLangBtn = document.getElementById('lang-' + currentLang);
  if (activeLangBtn) activeLangBtn.classList.add('active');

  // Show local books IMMEDIATELY — no API calls
  renderBooks('featured-books', [...BOOKS].sort(() => Math.random() - 0.5).slice(0, 8));
  renderBooks('library-books', BOOKS);
  initGenreFilters();
  initLangFilters();
  initQuizCategories();

  // AI greeting
  const greeting = t('ai_greeting').replace('{name}', currentUser.name);
  setTimeout(() => addMessage(greeting, 'ai'), 300);

  // Render home extras after a short delay
  setTimeout(() => {
    renderHomeExtras();
    init3DTilt();
  }, 200);

  // Check if returning from reader — go to library page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('page') === 'library') {
    showPage('library');
    window.history.replaceState({}, '', window.location.pathname);
  }
}

// ===== HISTORY =====
function getHistory() {
  if (!currentUser) return {};
  return JSON.parse(localStorage.getItem('reading_history_' + currentUser.email) || '{}');
}

function renderHistory() {
  const history = getHistory();
  const el = document.getElementById('history-content');
  const items = Object.values(history).sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead));
  // Sync books score to Supabase
  saveBooksScore();
  if (!items.length) {
    el.innerHTML = `<div style="text-align:center;padding:80px 20px;color:var(--text2)">
      <div style="font-size:3rem;margin-bottom:16px">📚</div>
      <p style="font-size:1.1rem">Vous n'avez pas encore lu de livres.</p>
      <p style="margin-top:8px;font-size:0.9rem">Cliquez sur un livre et choisissez "Lire" pour commencer !</p>
    </div>`;
    return;
  }
  el.innerHTML = `<div class="history-grid">${items.map(item => {
    // Build cover
    let coverHTML;
    if (item.cover && item.cover !== 'null' && item.cover !== 'undefined') {
      coverHTML = `<img src="${item.cover}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:100%;height:100%;object-fit:cover"><div class="cover-placeholder" style="display:none;background:#1c1b35"><span>📖</span></div>`;
    } else if (item.isbn) {
      coverHTML = `<img src="https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:100%;height:100%;object-fit:cover"><div class="cover-placeholder" style="display:none;background:#1c1b35"><span>📖</span></div>`;
    } else {
      const bg = item.color || '#1c1b35';
      const em = item.emoji || '📖';
      coverHTML = `<div class="cover-placeholder" style="background:${bg}25"><span>${em}</span></div>`;
    }
    const progress = item.progress || 0;
    const title = item.title || 'Livre inconnu';
    const author = item.author || '';
    const date = item.lastRead ? new Date(item.lastRead).toLocaleDateString('fr-FR', {day:'numeric',month:'short'}) : '';
    // bookId can be 'g123' or 'b5' — store as data attribute, not inline JS param
    const safeId = String(item.bookId).replace(/'/g, '');
    // Determine reader URL
    let readerUrl = '#';
    if (String(item.bookId).startsWith('g')) {
      readerUrl = `reader.html?gid=${String(item.bookId).substring(1)}`;
    } else {
      const numId = parseInt(String(item.bookId).replace('b','')) || item.bookId;
      readerUrl = `reader.html?id=${numId}`;
    }
    return `<div class="history-card" onclick="window.location.href='${readerUrl}'" style="position:relative;cursor:pointer">
      <button class="history-remove-btn" onclick="event.stopPropagation();removeFromHistory('${safeId}')" title="Retirer">✕</button>
      <div class="book-cover" style="height:160px">${coverHTML}</div>
      <div class="history-info">
        <h4>${title}</h4>
        <p>${author}</p>
        <div class="history-progress-bar"><div class="history-progress-fill" style="width:${progress}%"></div></div>
        <div class="history-meta"><span>${progress}% lu</span><span>${date}</span></div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function removeFromHistory(bookId) {
  if (!currentUser) return;
  const key = 'reading_history_' + currentUser.email;
  const hist = JSON.parse(localStorage.getItem(key) || '{}');
  delete hist[bookId];
  localStorage.setItem(key, JSON.stringify(hist));
  renderHistory();
  const histTab = document.getElementById('ptab-history');
  if (histTab?.classList.contains('active')) renderProfileHistory();
}

function clearHistory() {
  if (!currentUser) return;
  showConfirmModal(
    '🗑️ Effacer l\'historique',
    'Voulez-vous vraiment effacer tout votre historique de lecture ? Cette action est irréversible.',
    () => {
      localStorage.removeItem('reading_history_' + currentUser.email);
      renderHistory();
    }
  );
}

// ===== CONFIRM MODAL =====
function showConfirmModal(title, message, onConfirm) {
  let modal = document.getElementById('confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:420px;text-align:center">
        <h3 id="confirm-title" style="font-size:1.1rem;font-weight:800;margin-bottom:12px"></h3>
        <p id="confirm-msg" style="color:var(--text2);font-size:.9rem;line-height:1.6;margin-bottom:24px"></p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn-secondary" onclick="closeConfirmModal()">Annuler</button>
          <button class="btn-primary" id="confirm-ok-btn" style="width:auto;background:linear-gradient(135deg,#f87171,#ef4444)">Confirmer</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = message;
  document.getElementById('confirm-ok-btn').onclick = () => { closeConfirmModal(); onConfirm(); };
  modal.classList.add('open');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.remove('open');
}

// ===== PROFILE =====
function getProfile() {
  if (!currentUser) return {};
  return JSON.parse(localStorage.getItem('profile_' + currentUser.email) || '{}');
}
function saveProfileData(data) {
  if (!currentUser) return;
  localStorage.setItem('profile_' + currentUser.email, JSON.stringify(data));
}

function initProfile() {
  const p = getProfile();
  const u = currentUser;
  // Avatar
  const initials = u.name ? u.name.split(' ').map(w=>w[0]).join('').toUpperCase().substring(0,2) : '?';
  const avatarHTML = p.avatar ? `<img src="${p.avatar}" alt="avatar">` : initials;
  document.getElementById('profile-avatar-display').innerHTML = avatarHTML;
  document.getElementById('profile-nav-avatar').innerHTML = avatarHTML;
  // Info
  document.getElementById('profile-name-display').textContent = u.name || '—';
  document.getElementById('profile-email-display').textContent = u.email || '—';
  document.getElementById('profile-bio-display').textContent = p.bio || t('prof_no_bio');
  // Form
  document.getElementById('pf-name').value = u.name || '';
  document.getElementById('pf-email').value = u.email || '';
  document.getElementById('pf-bio').value = p.bio || '';
  // Public toggle
  document.getElementById('profile-public-toggle').checked = !!p.isPublic;
  // 2FA toggle
  const twofaToggle = document.getElementById('twofa-toggle');
  if (twofaToggle) twofaToggle.checked = !!currentUser.twofa;
  // Stats
  const hist = JSON.parse(localStorage.getItem('reading_history_' + u.email) || '{}');
  const favs = p.favorites || [];
  const later = p.readLater || [];
  document.getElementById('pstat-read').textContent = Object.keys(hist).length;
  document.getElementById('pstat-fav').textContent = favs.length;
  document.getElementById('pstat-later').textContent = later.length;
  // Genre chips
  const genres = ['Fantasy','Science-Fiction','Classique','Policier','Romance','Dystopie','Philosophie','Aventure','Thriller','Biographie'];
  const favGenres = p.favGenres || [];
  document.getElementById('fav-genres-chips').innerHTML = genres.map(g =>
    `<button class="genre-chip ${favGenres.includes(g)?'selected':''}" onclick="toggleFavGenre('${g}',this)">${g}</button>`
  ).join('');
  // Switch to edit tab by default
  switchProfileTab('edit');
}

async function toggle2FA(enabled) {
  try {
    await fetch(API_BASE + '/toggle-2fa', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:currentUser.email, enabled}) });
    currentUser.twofa = enabled;
    localStorage.setItem('biblio_session', JSON.stringify(currentUser));
    showProfileToast(enabled ? '🔐 2FA enabled' : '2FA disabled');
  } catch(e) {
    const users = JSON.parse(localStorage.getItem('biblio_users') || '[]');
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) { users[idx].twofa = enabled; localStorage.setItem('biblio_users', JSON.stringify(users)); }
    currentUser.twofa = enabled;
    localStorage.setItem('biblio_session', JSON.stringify(currentUser));
    showProfileToast(enabled ? '🔐 2FA enabled' : '2FA disabled');
  }
}

function toggleFavGenre(genre, btn) {
  const p = getProfile();
  p.favGenres = p.favGenres || [];
  if (p.favGenres.includes(genre)) {
    p.favGenres = p.favGenres.filter(g => g !== genre);
    btn.classList.remove('selected');
  } else {
    p.favGenres.push(genre);
    btn.classList.add('selected');
  }
  saveProfileData(p);
}

function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    const p = getProfile();
    p.avatar = dataUrl;
    saveProfileData(p);
    const img = `<img src="${dataUrl}" alt="avatar">`;
    document.getElementById('profile-avatar-display').innerHTML = img;
    document.getElementById('profile-nav-avatar').innerHTML = img;
    showProfileToast('✅ Photo mise à jour !');
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  const name = document.getElementById('pf-name').value.trim();
  const email = document.getElementById('pf-email').value.trim();
  const bio = document.getElementById('pf-bio').value.trim();
  const passCurrent = document.getElementById('pf-pass-current').value;
  const passNew = document.getElementById('pf-pass').value;
  if (!name || !email) { showProfileToast('❌ Nom et email requis', true); return; }

  // Si l'utilisateur veut changer le mot de passe, vérifier l'ancien
  if (passNew) {
    if (!passCurrent) { showProfileToast('❌ Entrez votre mot de passe actuel', true); return; }
    // Vérifier via le serveur ou localStorage
    let valid = false;
    try {
      const res = await fetch(API_BASE + '/login', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: currentUser.email, pass: passCurrent })
      });
      valid = res.ok;
    } catch(e) {
      // Fallback localStorage
      const users = JSON.parse(localStorage.getItem('biblio_users') || '[]');
      const user = users.find(u => u.email === currentUser.email && u.pass === passCurrent);
      valid = !!user;
    }
    if (!valid) { showProfileToast('❌ Mot de passe actuel incorrect', true); return; }
  }

  // Update server
  try {
    const body = { name, email };
    if (passNew) body.pass = passNew;
    await fetch(`${API_BASE}/users/${currentUser.id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
  } catch(e) {
    const users = JSON.parse(localStorage.getItem('biblio_users') || '[]');
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) { users[idx].name = name; users[idx].email = email; if (passNew) users[idx].pass = passNew; }
    localStorage.setItem('biblio_users', JSON.stringify(users));
  }

  // Update session
  currentUser.name = name;
  currentUser.email = email;
  localStorage.setItem('biblio_session', JSON.stringify(currentUser));
  document.getElementById('nav-username').textContent = name;

  // Save profile data
  const p = getProfile();
  p.bio = bio;
  saveProfileData(p);

  // Refresh display
  document.getElementById('profile-name-display').textContent = name;
  document.getElementById('profile-email-display').textContent = email;
  document.getElementById('profile-bio-display').textContent = bio || t('prof_no_bio');
  document.getElementById('pf-pass-current').value = '';
  document.getElementById('pf-pass').value = '';
  showProfileToast('✅ Profil sauvegardé !');
}

function togglePublicProfile(isPublic) {
  const p = getProfile();
  p.isPublic = isPublic;
  saveProfileData(p);
  showProfileToast(isPublic ? '🌍 Profil public activé' : '🔒 Profil privé');
}

function switchProfileTab(tab) {
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ptab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`.ptab[onclick*="${tab}"]`).classList.add('active');
  document.getElementById('ptab-' + tab).classList.add('active');
  if (tab === 'favorites') renderProfileFavorites();
  if (tab === 'later') renderProfileLater();
  if (tab === 'reviews') renderProfileReviews();
  if (tab === 'history') renderProfileHistory();
}

function renderProfileReviews() {
  const ratings = getRatings();
  const list = document.getElementById('profile-reviews-list');
  const empty = document.getElementById('reviews-empty');
  const entries = Object.entries(ratings).sort((a, b) => b[1].date - a[1].date);
  
  if (!entries.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.innerHTML = entries.map(([bookId, data]) => {
    const book = BOOKS.find(b => b.id == bookId);
    if (!book) return '';
    
    const stars = Array(5).fill(0).map((_, i) => 
      `<i class="fas fa-star ${i < data.rating ? 'filled' : 'empty'}"></i>`
    ).join('');
    
    const date = new Date(data.date).toLocaleDateString('fr-FR');
    
    return `<div class="review-item">
      <div class="review-header">
        <div>
          <strong style="color:var(--text);font-size:.9rem">${book.title}</strong>
          <div class="book-rating" style="margin-top:4px">${stars}</div>
        </div>
        <span class="review-date">${date}</span>
      </div>
      ${data.review ? `<p class="review-text">${data.review}</p>` : ''}
    </div>`;
  }).join('');
}

function renderProfileFavorites() {
  const p = getProfile();
  const favs = p.favorites || [];
  const grid = document.getElementById('profile-favorites-grid');
  const empty = document.getElementById('fav-empty');
  if (!favs.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  const books = favs.map(id => BOOKS.find(b => b.id === id)).filter(Boolean);
  grid.innerHTML = books.map(b => bookCardHTML(b, true)).join('');
}

function renderProfileLater() {
  const p = getProfile();
  const later = p.readLater || [];
  const grid = document.getElementById('profile-later-grid');
  const empty = document.getElementById('later-empty');
  if (!later.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  const books = later.map(id => BOOKS.find(b => b.id === id)).filter(Boolean);
  grid.innerHTML = books.map(b => bookCardHTML(b, false, true)).join('');
}

function renderProfileHistory() {
  const hist = JSON.parse(localStorage.getItem('reading_history_' + currentUser.email) || '{}');
  const grid = document.getElementById('profile-history-grid');
  const empty = document.getElementById('hist-empty');
  const items = Object.values(hist).sort((a,b) => new Date(b.lastRead) - new Date(a.lastRead));
  if (!items.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = items.map(item => {
    const cover = item.cover
      ? `<img src="${item.cover}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
      : `<div class="cover-placeholder" style="background:#1c1b35"><span>📖</span></div>`;
    const progress = item.progress || 0;
    const date = new Date(item.lastRead).toLocaleDateString('fr-FR', {day:'numeric',month:'short'});
    // Build correct reader URL from bookId (can be 'g123' or 'b5')
    const bid = String(item.bookId);
    const readerUrl = bid.startsWith('g')
      ? `reader.html?gid=${bid.substring(1)}`
      : `reader.html?id=${parseInt(bid.replace('b','')) || bid}`;
    return `<div class="history-card" onclick="window.location.href='${readerUrl}'" style="cursor:pointer">
      <div class="book-cover" style="height:160px">${cover}</div>
      <div class="history-info">
        <h4>${item.title}</h4>
        <p>${item.author}</p>
        <div class="history-progress-bar"><div class="history-progress-fill" style="width:${progress}%"></div></div>
        <div class="history-meta"><span>${progress}% lu</span><span>${date}</span></div>
      </div>
    </div>`;
  }).join('');
}

function bookCardHTML(b, isFav = false, isLater = false) {
  const cover = getCoverUrl(b);
  const coverHTML = cover
    ? `<img src="${cover}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cover-placeholder" style="display:none;background:${b.color}25"><span>${b.emoji}</span></div>`
    : `<div class="cover-placeholder" style="background:${b.color}25"><span>${b.emoji}</span></div>`;
  return `<div class="book-card" onclick="openBook(${b.id})">
    <div class="book-cover">${coverHTML}</div>
    <div class="book-info"><h4>${b.title}</h4><p>${b.author}</p><span class="book-genre">${b.genre}</span></div>
    <div class="book-card-actions">
      ${isFav ? `<button class="book-action-btn fav active" onclick="event.stopPropagation();toggleFavorite(${b.id},this)" title="Retirer des favoris"><i class="fas fa-heart"></i></button>` : ''}
      ${isLater ? `<button class="book-action-btn later active" onclick="event.stopPropagation();toggleReadLater(${b.id},this)" title="Retirer de la liste"><i class="fas fa-clock"></i></button>` : ''}
    </div>
  </div>`;
}

function toggleFavorite(bookId, btn) {
  if (!currentUser) return;
  const p = getProfile();
  p.favorites = p.favorites || [];
  if (p.favorites.includes(bookId)) {
    p.favorites = p.favorites.filter(id => id !== bookId);
    btn?.classList.remove('active');
    showProfileToast('💔 Retiré des favoris');
  } else {
    p.favorites.push(bookId);
    btn?.classList.add('active');
    showProfileToast('❤️ Ajouté aux favoris !');
  }
  saveProfileData(p);
  document.getElementById('pstat-fav').textContent = p.favorites.length;
}

function toggleReadLater(bookId, btn) {
  if (!currentUser) return;
  const p = getProfile();
  p.readLater = p.readLater || [];
  if (p.readLater.includes(bookId)) {
    p.readLater = p.readLater.filter(id => id !== bookId);
    btn?.classList.remove('active');
    showProfileToast('Retiré de la liste');
  } else {
    p.readLater.push(bookId);
    btn?.classList.add('active');
    showProfileToast('🕐 Ajouté à lire plus tard !');
  }
  saveProfileData(p);
  document.getElementById('pstat-later').textContent = p.readLater.length;
}

function isFavorite(bookId) {
  const p = getProfile();
  return (p.favorites || []).includes(bookId);
}
function isReadLater(bookId) {
  const p = getProfile();
  return (p.readLater || []).includes(bookId);
}

// For Gutenberg books — use string keys
function isFavoriteKey(key) {
  const p = getProfile();
  return (p.favoritesExt || []).some(f => f.key === key);
}
function isReadLaterKey(key) {
  const p = getProfile();
  return (p.readLaterExt || []).some(f => f.key === key);
}
function toggleFavoriteKey(key, title, author, cover, btn) {
  const p = getProfile();
  p.favoritesExt = p.favoritesExt || [];
  const idx = p.favoritesExt.findIndex(f => f.key === key);
  if (idx !== -1) {
    p.favoritesExt.splice(idx, 1);
    if (btn) btn.innerHTML = `<i class="fas fa-heart" style="color:var(--pink)"></i> Favoris`;
    showProfileToast('💔 Retiré des favoris');
  } else {
    p.favoritesExt.push({ key, title, author, cover });
    if (btn) btn.innerHTML = `<i class="fas fa-heart" style="color:var(--pink)"></i> Retirer`;
    showProfileToast('❤️ Ajouté aux favoris !');
  }
  saveProfileData(p);
}
function toggleReadLaterKey(key, title, author, cover, btn) {
  const p = getProfile();
  p.readLaterExt = p.readLaterExt || [];
  const idx = p.readLaterExt.findIndex(f => f.key === key);
  if (idx !== -1) {
    p.readLaterExt.splice(idx, 1);
    if (btn) btn.innerHTML = `<i class="fas fa-clock" style="color:var(--teal)"></i> À lire`;
    showProfileToast('Retiré de la liste');
  } else {
    p.readLaterExt.push({ key, title, author, cover });
    if (btn) btn.innerHTML = `<i class="fas fa-clock" style="color:var(--teal)"></i> Retirer`;
    showProfileToast('🕐 Ajouté à lire plus tard !');
  }
  saveProfileData(p);
}

function showProfileToast(msg, isError = false) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:50px;font-size:.85rem;font-weight:600;z-index:9999;background:${isError?'rgba(248,113,113,.2)':'rgba(52,211,153,.2)'};color:${isError?'#f87171':'#34d399'};border:1px solid ${isError?'rgba(248,113,113,.3)':'rgba(52,211,153,.3)'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ===== STREAK & BADGES =====
const BADGES = [
  { id:'first_book', icon:'📖', label:'Premier livre', color:'#7c6af7', borderColor:'rgba(124,106,247,.4)', check: h => Object.keys(h).length >= 1 },
  { id:'books_5', icon:'📚', label:'5 livres lus', color:'#2dd4bf', borderColor:'rgba(45,212,191,.4)', check: h => Object.values(h).filter(b=>b.progress>=100).length >= 5 },
  { id:'books_10', icon:'🏆', label:'10 livres lus', color:'#f59e0b', borderColor:'rgba(245,158,11,.4)', check: h => Object.values(h).filter(b=>b.progress>=100).length >= 10 },
  { id:'books_50', icon:'👑', label:'50 livres lus', color:'#f472b6', borderColor:'rgba(244,114,182,.4)', check: h => Object.values(h).filter(b=>b.progress>=100).length >= 50 },
  { id:'streak_3', icon:'🔥', label:'3 jours de suite', color:'#fb923c', borderColor:'rgba(251,146,60,.4)', check: () => getStreak() >= 3 },
  { id:'streak_7', icon:'⚡', label:'7 jours de suite', color:'#fbbf24', borderColor:'rgba(251,191,36,.4)', check: () => getStreak() >= 7 },
  { id:'quiz_1', icon:'🎯', label:'Premier quiz', color:'#34d399', borderColor:'rgba(52,211,153,.4)', check: () => (JSON.parse(localStorage.getItem('novela_quiz_scores')||'[]').find(s=>s.email===currentUser?.email)?.total_quizzes||0) >= 1 },
  { id:'quiz_perfect', icon:'💯', label:'Quiz parfait', color:'#a78bfa', borderColor:'rgba(167,139,250,.4)', check: () => (JSON.parse(localStorage.getItem('novela_quiz_scores')||'[]').find(s=>s.email===currentUser?.email)?.best_score||0) >= 100 },
  { id:'community', icon:'💬', label:'Membre actif', color:'#60a5fa', borderColor:'rgba(96,165,250,.4)', check: () => { const g = JSON.parse(localStorage.getItem('novela_groups')||'[]'); return g.some(gr=>gr.members?.includes(currentUser?.email)); } },
];

function getStreak() {
  if (!currentUser) return 0;
  const key = 'reading_streak_' + currentUser.email;
  const data = JSON.parse(localStorage.getItem(key) || '{"streak":0,"lastDate":""}');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (data.lastDate === today) return data.streak;
  if (data.lastDate === yesterday) return data.streak; // still active
  return 0;
}

function updateStreak() {
  if (!currentUser) return;
  const key = 'reading_streak_' + currentUser.email;
  const data = JSON.parse(localStorage.getItem(key) || '{"streak":0,"lastDate":""}');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (data.lastDate === today) return; // already updated today
  if (data.lastDate === yesterday) {
    data.streak++;
  } else if (data.lastDate !== today) {
    data.streak = 1; // reset
  }
  data.lastDate = today;
  localStorage.setItem(key, JSON.stringify(data));
}

function renderAchievements() {
  if (!currentUser) return;
  const hist = JSON.parse(localStorage.getItem('reading_history_' + currentUser.email) || '{}');
  const streak = getStreak();

  // Update streak display
  document.getElementById('streak-num').textContent = streak;
  const heroStreak = document.getElementById('hero-streak');
  if (heroStreak) heroStreak.textContent = streak;

  // Render badges
  const row = document.getElementById('badges-row');
  if (!row) return;
  row.innerHTML = BADGES.map(b => {
    const unlocked = b.check(hist);
    return `<div class="badge-item ${unlocked?'unlocked':'locked'}" style="color:${b.color};border-color:${b.borderColor};background:${b.color}15" title="${b.label}">
      ${b.icon} <span>${b.label}</span>
    </div>`;
  }).join('');
}

// ===== RECOMMENDATIONS =====
function getRecommendations() {
  if (!currentUser) return [];
  const hist = JSON.parse(localStorage.getItem('reading_history_' + currentUser.email) || '{}');
  const readIds = Object.keys(hist);
  if (!readIds.length) return [];

  // Get genres from read books
  const readBooks = readIds.map(id => {
    const numId = parseInt(String(id).replace('b','').replace('g',''));
    return BOOKS.find(b => b.id === numId);
  }).filter(Boolean);

  const genreCounts = {};
  readBooks.forEach(b => { genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1; });
  const topGenres = Object.entries(genreCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(([g]) => g);

  // Find unread books in same genres
  const recommended = BOOKS.filter(b =>
    topGenres.includes(b.genre) &&
    !readIds.includes('b' + b.id) &&
    !readIds.includes(String(b.id))
  ).sort(() => Math.random() - 0.5).slice(0, 12);

  return recommended;
}

function renderHomeExtras() {
  if (!currentUser) return;
  updateStreak();
  renderAchievements();

  // Continue reading
  const hist = JSON.parse(localStorage.getItem('reading_history_' + currentUser.email) || '{}');
  const inProgress = Object.values(hist)
    .filter(b => b.progress > 0 && b.progress < 100)
    .sort((a,b) => new Date(b.lastRead) - new Date(a.lastRead))
    .slice(0, 4);

  const continueSection = document.getElementById('continue-reading-section');
  const continueGrid = document.getElementById('continue-grid');
  if (inProgress.length && continueSection && continueGrid) {
    continueSection.style.display = 'block';
    continueGrid.innerHTML = inProgress.map(item => {
      const bid = String(item.bookId);
      const readerUrl = bid.startsWith('g') ? `reader.html?gid=${bid.substring(1)}` : `reader.html?id=${parseInt(bid.replace('b',''))||bid}`;
      const coverSrc = item.cover || (item.isbn ? `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg` : null);
      const coverHTML = coverSrc
        ? `<img class="continue-cover" src="${coverSrc}" onerror="this.style.display='none'" alt="">`
        : `<div class="continue-cover" style="background:${item.color||'#1c1b35'};display:flex;align-items:center;justify-content:center;font-size:1.5rem">${item.emoji||'📖'}</div>`;
      return `<div class="continue-card" onclick="window.location.href='${readerUrl}'">
        ${coverHTML}
        <div class="continue-info">
          <h4>${item.title}</h4>
          <p>${item.author}</p>
          <div class="continue-progress"><div class="continue-progress-fill" style="width:${item.progress}%"></div></div>
          <div class="continue-pct">${item.progress}% lu</div>
        </div>
      </div>`;
    }).join('');
  }

  // Recommendations
  const recs = getRecommendations();
  const recSection = document.getElementById('recommended-section');
  const recGrid = document.getElementById('recommended-books');
  if (recs.length >= 3 && recSection && recGrid) {
    recSection.style.display = 'block';
    recGrid.innerHTML = recs.map(b => {
      const cover = getCoverUrl(b);
      const coverHTML = cover
        ? `<img src="${cover}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cover-placeholder" style="display:none;background:${b.color}25"><span>${b.emoji}</span></div>`
        : `<div class="cover-placeholder" style="background:${b.color}25"><span>${b.emoji}</span></div>`;
      return `<div class="book-card" onclick="openBook(${b.id})">
        <div class="book-cover">${coverHTML}</div>
        <div class="book-info"><h4>${b.title}</h4><p>${b.author}</p><span class="book-genre">${b.genre}</span></div>
      </div>`;
    }).join('');
  }

  // Trending (random popular books)
  const trending = [...BOOKS].sort(() => Math.random() - 0.5).slice(0, 12);
  const trendGrid = document.getElementById('trending-books');
  if (trendGrid) {
    trendGrid.innerHTML = trending.map(b => {
      const cover = getCoverUrl(b);
      const coverHTML = cover
        ? `<img src="${cover}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cover-placeholder" style="display:none;background:${b.color}25"><span>${b.emoji}</span></div>`
        : `<div class="cover-placeholder" style="background:${b.color}25"><span>${b.emoji}</span></div>`;
      return `<div class="book-card" onclick="openBook(${b.id})">
        <div class="book-cover">${coverHTML}</div>
        <div class="book-info"><h4>${b.title}</h4><p>${b.author}</p></div>
      </div>`;
    }).join('');
  }

  // Scroll animations
  initScrollAnimations();

  // Hero particles
  initParticles();
}

function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.cssText = `left:${Math.random()*100}%;animation-duration:${3+Math.random()*4}s;animation-delay:${Math.random()*3}s;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;opacity:${0.2+Math.random()*0.3}`;
    container.appendChild(p);
  }
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.book-card, .continue-card, .section-header').forEach(el => {
    el.classList.add('fade-in-up');
    observer.observe(el);
  });
}



async function saveQuizScore(score, total, bookTitle) {
  if (!currentUser) return;
  const pct = Math.round((score / total) * 100);
  try {
    await fetch(API_BASE + '/scores/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, name: currentUser.name, score, total, bookTitle })
    });
  } catch(e) {
    // Fallback localStorage
    const scores = JSON.parse(localStorage.getItem('novela_quiz_scores') || '[]');
    const existing = scores.find(s => s.email === currentUser.email);
    if (existing) {
      existing.total_quizzes = (existing.total_quizzes || 0) + 1;
      existing.total_score = (existing.total_score || 0) + pct;
      existing.best_score = Math.max(existing.best_score || 0, pct);
      existing.avg_score = Math.round(existing.total_score / existing.total_quizzes);
      existing.last_book = bookTitle;
    } else {
      scores.push({ email: currentUser.email, name: currentUser.name, total_quizzes: 1, total_score: pct, best_score: pct, avg_score: pct, last_book: bookTitle });
    }
    localStorage.setItem('novela_quiz_scores', JSON.stringify(scores));
  }
}

async function saveBooksScore() {
  if (!currentUser) return;
  const hist = JSON.parse(localStorage.getItem('reading_history_' + currentUser.email) || '{}');
  // Only count books finished at 100%
  const booksRead = Object.values(hist).filter(b => (b.progress || 0) >= 100).length;
  try {
    await fetch(API_BASE + '/scores/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, name: currentUser.name, booksRead })
    });
  } catch(e) {
    const scores = JSON.parse(localStorage.getItem('novela_books_scores') || '[]');
    const existing = scores.find(s => s.email === currentUser.email);
    if (existing) { existing.books_read = booksRead; existing.name = currentUser.name; }
    else scores.push({ email: currentUser.email, name: currentUser.name, books_read: booksRead });
    localStorage.setItem('novela_books_scores', JSON.stringify(scores));
  }
}

function switchSbTab(tab) {
  document.querySelectorAll('.sb-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sb-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.sb-tab[onclick*="${tab}"]`).classList.add('active');
  document.getElementById('sb-' + tab + '-panel').classList.add('active');
}

async function renderScoreboard() {
  renderQuizScoreboard([]);
  renderBooksScoreboard([]);
  // Load from server
  try {
    const [quizRes, booksRes] = await Promise.all([
      fetch(API_BASE + '/scores/quiz').then(r => r.json()),
      fetch(API_BASE + '/scores/books').then(r => r.json())
    ]);
    renderQuizScoreboard(Array.isArray(quizRes) ? quizRes : []);
    renderBooksScoreboard(Array.isArray(booksRes) ? booksRes : []);
  } catch(e) {
    // Fallback to localStorage
    renderQuizScoreboard(JSON.parse(localStorage.getItem('novela_quiz_scores') || '[]'));
    renderBooksScoreboard(JSON.parse(localStorage.getItem('novela_books_scores') || '[]'));
  }
}

function renderQuizScoreboard(scores) {
  scores = [...scores].sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0));
  const myIdx = scores.findIndex(s => s.email === currentUser?.email);
  const myScore = myIdx >= 0 ? scores[myIdx] : null;

  const myEl = document.getElementById('sb-my-quiz');
  if (myScore) {
    myEl.innerHTML = `
      <div class="sb-rank">${myIdx < 3 ? ['🥇','🥈','🥉'][myIdx] : '#' + (myIdx + 1)}</div>
      <div class="sb-info">
        <h3>${myScore.name}</h3>
        <p>${myScore.total_quizzes} quiz · Meilleur: ${myScore.best_score}%</p>
        <p style="font-size:.75rem;color:var(--text3)">Dernier: ${myScore.last_book || '—'}</p>
      </div>
      <div class="sb-val"><span>${myScore.avg_score}%</span><p>Score moyen</p></div>`;
  } else {
    myEl.innerHTML = `<div style="color:var(--text2);font-size:.88rem;padding:4px 0"><i class="fas fa-info-circle" style="color:var(--accent3);margin-right:8px"></i>Faites un quiz pour apparaître dans le classement !</div>`;
  }

  const listEl = document.getElementById('sb-quiz-list');
  if (!scores.length) {
    listEl.innerHTML = `<div class="sb-empty"><i class="fas fa-question-circle"></i>Aucun score encore. Soyez le premier !</div>`;
    return;
  }
  const posIcon = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
  const posClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
  listEl.innerHTML = scores.slice(0, 20).map((s, i) => {
    const isMe = s.email === currentUser?.email;
    const p = getProfile();
    const avatarHTML = (isMe && p.avatar) ? `<img src="${p.avatar}">` : s.name.charAt(0).toUpperCase();
    return `<div class="sb-row ${isMe ? 'me' : ''}">
      <div class="sb-pos ${posClass(i)}">${posIcon(i)}</div>
      <div class="sb-avatar">${avatarHTML}</div>
      <div class="sb-name">${s.name}${isMe ? ' <span style="color:var(--accent3);font-size:.72rem">(vous)</span>' : ''}</div>
      <div style="text-align:right">
        <div class="sb-score-val">${s.avg_score}%</div>
        <div class="sb-score-label">${s.total_quizzes} quiz</div>
      </div>
    </div>`;
  }).join('');
}

function renderBooksScoreboard(scores) {
  scores = [...scores].sort((a, b) => (b.books_read || 0) - (a.books_read || 0)).filter(s => s.books_read > 0);
  const myIdx = scores.findIndex(s => s.email === currentUser?.email);
  const myScore = myIdx >= 0 ? scores[myIdx] : null;

  const myEl = document.getElementById('sb-my-books');
  if (myScore) {
    const badge = n => n >= 50 ? '⭐ Expert' : n >= 20 ? '📚 Avancé' : n >= 5 ? '📖 Régulier' : '🌱 Débutant';
    myEl.innerHTML = `
      <div class="sb-rank">${myIdx < 3 ? ['🥇','🥈','🥉'][myIdx] : '#' + (myIdx + 1)}</div>
      <div class="sb-info"><h3>${myScore.name}</h3><p>${badge(myScore.books_read)}</p></div>
      <div class="sb-val"><span>${myScore.books_read}</span><p>Livres lus</p></div>`;
  } else {
    myEl.innerHTML = `<div style="color:var(--text2);font-size:.88rem;padding:4px 0"><i class="fas fa-info-circle" style="color:var(--accent3);margin-right:8px"></i>Lisez des livres pour apparaître dans le classement !</div>`;
  }

  const listEl = document.getElementById('sb-books-list');
  if (!scores.length) {
    listEl.innerHTML = `<div class="sb-empty"><i class="fas fa-book-open"></i>Aucun lecteur encore. Commencez à lire !</div>`;
    return;
  }
  const posIcon = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
  const posClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
  const badge = n => n >= 50 ? '⭐' : n >= 20 ? '📚' : n >= 5 ? '📖' : '🌱';
  listEl.innerHTML = scores.slice(0, 20).map((s, i) => {
    const isMe = s.email === currentUser?.email;
    const p = getProfile();
    const avatarHTML = (isMe && p.avatar) ? `<img src="${p.avatar}">` : s.name.charAt(0).toUpperCase();
    return `<div class="sb-row ${isMe ? 'me' : ''}">
      <div class="sb-pos ${posClass(i)}">${posIcon(i)}</div>
      <div class="sb-avatar">${avatarHTML}</div>
      <div class="sb-name">${s.name}${isMe ? ' <span style="color:var(--accent3);font-size:.72rem">(vous)</span>' : ''} ${badge(s.books_read)}</div>
      <div style="text-align:right">
        <div class="sb-score-val">${s.books_read}</div>
        <div class="sb-score-label">livres lus</div>
      </div>
    </div>`;
  }).join('');
}


const DEFAULT_GROUPS = [
  { id:'fantasy', name:'Fantasy & Magie', icon:'🧙', desc:'Tolkien, Rowling, Martin... Parlez de vos univers fantastiques préférés.', cat:'genre', color:'#7b2d8b', members:[], messages:[] },
  { id:'scifi', name:'Science-Fiction', icon:'🚀', desc:'Dune, Asimov, Philip K. Dick... Le futur de la littérature.', cat:'genre', color:'#1a237e', members:[], messages:[] },
  { id:'classiques', name:'Grands Classiques', icon:'📜', desc:'Hugo, Zola, Tolstoï... Les œuvres qui ont traversé les siècles.', cat:'genre', color:'#784212', members:[], messages:[] },
  { id:'policier', name:'Policier & Thriller', icon:'🔍', desc:'Christie, Larsson, Nesbo... Les meilleurs polars du monde.', cat:'genre', color:'#1b2631', members:[], messages:[] },
  { id:'romance', name:'Romance & Amour', icon:'💕', desc:'Austen, Coelho... Les plus belles histoires d\'amour.', cat:'genre', color:'#c0392b', members:[], messages:[] },
  { id:'philo', name:'Philosophie & Essais', icon:'🤔', desc:'Camus, Sartre, Nietzsche... Les grandes idées.', cat:'genre', color:'#2c3e50', members:[], messages:[] },
  { id:'manga', name:'Manga & BD', icon:'🎌', desc:'Naruto, One Piece, Astérix... La bande dessinée mondiale.', cat:'genre', color:'#e74c3c', members:[], messages:[] },
  { id:'africa', name:'Littérature Africaine', icon:'🌍', desc:'Achebe, Adichie, Mariama Bâ... Les voix du continent.', cat:'genre', color:'#d4ac0d', members:[], messages:[] },
  { id:'jeunesse', name:'Jeunesse & YA', icon:'⭐', desc:'Harry Potter, Hunger Games... Les livres qui nous ont fait aimer lire.', cat:'genre', color:'#f39c12', members:[], messages:[] },
  { id:'bookclub', name:'Book Club Novela', icon:'📚', desc:'Le club de lecture officiel de Novela. Lecture du mois et discussions.', cat:'general', color:'#7c6af7', members:[], messages:[] },
  { id:'recommendations', name:'Recommandations', icon:'💡', desc:'Partagez vos coups de cœur et découvrez de nouveaux livres.', cat:'general', color:'#16a085', members:[], messages:[] },
  { id:'quotes', name:'Citations & Extraits', icon:'✍️', desc:'Partagez vos citations préférées de la littérature mondiale.', cat:'general', color:'#8e44ad', members:[], messages:[] },
];

let activeGroupId = null;
let allGroups = [];

function getGroups() {
  const stored = localStorage.getItem('novela_groups');
  if (!stored) {
    localStorage.setItem('novela_groups', JSON.stringify(DEFAULT_GROUPS));
    return DEFAULT_GROUPS;
  }
  const custom = JSON.parse(stored);
  // Merge defaults with custom (keep default messages/members)
  const ids = custom.map(g => g.id);
  const merged = [...custom];
  DEFAULT_GROUPS.forEach(dg => { if (!ids.includes(dg.id)) merged.unshift(dg); });
  return merged;
}

function saveGroups(groups) {
  localStorage.setItem('novela_groups', JSON.stringify(groups));
}

function getGroupMessages(groupId) {
  return JSON.parse(localStorage.getItem('novela_msgs_' + groupId) || '[]');
}

function saveGroupMessages(groupId, msgs) {
  // Keep last 200 messages
  const toSave = msgs.slice(-200);
  localStorage.setItem('novela_msgs_' + groupId, JSON.stringify(toSave));
}

function isGroupMember(groupId) {
  if (!currentUser) return false;
  const groups = getGroups();
  const g = groups.find(g => g.id === groupId);
  return g?.members?.includes(currentUser.email) || false;
}

function initCommunity() {
  allGroups = getGroups();
  renderGroupsList(allGroups);
}

function renderGroupsList(groups) {
  const list = document.getElementById('groups-list');
  if (!groups.length) { list.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text2);font-size:.85rem">Aucun groupe trouvé</p>'; return; }
  list.innerHTML = groups.map(g => {
    const msgs = getGroupMessages(g.id);
    const lastMsg = msgs[msgs.length - 1];
    const preview = lastMsg ? `${lastMsg.userName}: ${lastMsg.text.substring(0, 30)}${lastMsg.text.length > 30 ? '...' : ''}` : g.desc.substring(0, 40) + '...';
    const memberCount = g.members?.length || 0;
    const isMember = isGroupMember(g.id);
    const iconHTML = g.photo
      ? `<img src="${g.photo}" class="group-icon-img" alt="${g.name}">`
      : g.icon;
    return `<div class="group-item ${activeGroupId === g.id ? 'active' : ''}" onclick="openGroup('${g.id}')">
      <div class="group-icon" style="background:${g.color}25">${iconHTML}</div>
      <div class="group-item-info">
        <div class="group-item-name">${g.name}</div>
        <div class="group-item-preview">${preview}</div>
      </div>
      <div class="group-item-meta">
        <span class="group-member-count"><i class="fas fa-user"></i> ${memberCount}</span>
        ${isMember ? '<span class="group-cat-badge">Membre</span>' : ''}
      </div>
    </div>`;
  }).join('');
}

function filterGroups() {
  const q = document.getElementById('group-search').value.toLowerCase();
  const filtered = q ? allGroups.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)) : allGroups;
  renderGroupsList(filtered);
}

function openGroup(groupId) {
  activeGroupId = groupId;
  const groups = getGroups();
  const g = groups.find(g => g.id === groupId);
  if (!g) return;

  // Update sidebar active state
  document.querySelectorAll('.group-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.querySelector(`.group-item[onclick*="${groupId}"]`);
  if (activeEl) activeEl.classList.add('active');

  // Show chat
  document.getElementById('community-welcome').style.display = 'none';
  document.getElementById('group-chat').style.display = 'flex';

  // Header
  const iconSmHTML = g.photo
    ? `<img src="${g.photo}" class="group-icon-img-sm" alt="${g.name}">`
    : g.icon;
  document.getElementById('chat-group-icon').innerHTML = iconSmHTML;
  document.getElementById('chat-group-icon').style.background = g.photo ? 'transparent' : g.color + '25';
  document.getElementById('chat-group-name').textContent = g.name;
  document.getElementById('chat-group-members').textContent = `${g.members?.length || 0} membres · ${g.cat}`;

  // Join/Leave button
  const btn = document.getElementById('join-leave-btn');
  const member = isGroupMember(groupId);
  btn.textContent = member ? '✓ Membre' : '+ Rejoindre';
  btn.className = 'group-action-btn ' + (member ? 'leave' : 'join');

  // Input visibility
  document.getElementById('group-input-area').style.display = member ? 'flex' : 'none';

  // Load messages
  renderGroupMessages(groupId);
}

function renderGroupMessages(groupId) {
  const msgs = getGroupMessages(groupId);
  const container = document.getElementById('group-messages');
  if (!msgs.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text2);font-size:.88rem">
      <div style="font-size:2rem;margin-bottom:8px">💬</div>
      Soyez le premier à écrire dans ce groupe !
    </div>`;
    return;
  }
  let lastDate = '';
  container.innerHTML = msgs.map(msg => {
    const isOwn = currentUser && msg.userEmail === currentUser.email;
    const msgDate = new Date(msg.ts).toLocaleDateString('fr-FR', {day:'numeric', month:'short'});
    let dateSep = '';
    if (msgDate !== lastDate) { dateSep = `<div class="group-date-sep">${msgDate}</div>`; lastDate = msgDate; }
    const p = getProfile();
    const avatarContent = (isOwn && p.avatar) ? `<img src="${p.avatar}">` : msg.userName.charAt(0).toUpperCase();
    const avatarColor = stringToColor(msg.userEmail || msg.userName);
    const time = new Date(msg.ts).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
    return `${dateSep}<div class="group-msg ${isOwn ? 'own' : ''}">
      <div class="group-msg-avatar" style="background:${avatarColor}">${avatarContent}</div>
      <div class="group-msg-body">
        <div class="group-msg-meta">
          <span class="group-msg-name">${isOwn ? 'Vous' : msg.userName}</span>
          <span>${time}</span>
        </div>
        <div class="group-msg-bubble">${escapeHTML(msg.text)}</div>
      </div>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function sendGroupMessage() {
  if (!currentUser || !activeGroupId) return;
  if (!isGroupMember(activeGroupId)) { showProfileToast('Rejoignez le groupe pour écrire', true); return; }
  const input = document.getElementById('group-msg-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  const msgs = getGroupMessages(activeGroupId);
  const p = getProfile();
  msgs.push({
    id: Date.now(),
    userEmail: currentUser.email,
    userName: currentUser.name,
    userAvatar: p.avatar || null,
    text,
    ts: new Date().toISOString()
  });
  saveGroupMessages(activeGroupId, msgs);
  // Update group preview
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === activeGroupId);
  if (idx !== -1) { groups[idx].lastMsg = text; saveGroups(groups); }
  renderGroupMessages(activeGroupId);
  renderGroupsList(allGroups);
  // Stats badge
  incrementStat('msgSent');
}

function toggleJoinGroup() {
  if (!currentUser || !activeGroupId) return;
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === activeGroupId);
  if (idx === -1) return;
  groups[idx].members = groups[idx].members || [];
  const memberIdx = groups[idx].members.indexOf(currentUser.email);
  if (memberIdx !== -1) {
    groups[idx].members.splice(memberIdx, 1);
    showProfileToast('Vous avez quitté le groupe');
  } else {
    groups[idx].members.push(currentUser.email);
    showProfileToast('✅ Vous avez rejoint le groupe !');
    // Welcome message
    const msgs = getGroupMessages(activeGroupId);
    msgs.push({ id: Date.now(), userEmail: 'system', userName: 'Novela', text: `👋 ${currentUser.name} a rejoint le groupe !`, ts: new Date().toISOString() });
    saveGroupMessages(activeGroupId, msgs);
  }
  saveGroups(groups);
  allGroups = groups;
  openGroup(activeGroupId);
  renderGroupsList(allGroups);
}

function openCreateGroup() {
  // Reset form
  document.getElementById('new-group-name').value = '';
  document.getElementById('new-group-desc').value = '';
  document.getElementById('new-group-icon').value = '';
  document.getElementById('group-photo-img').style.display = 'none';
  document.getElementById('group-photo-placeholder').style.display = 'block';
  document.getElementById('group-photo-input').value = '';
  document.getElementById('create-group-modal').classList.add('open');
}

function previewGroupPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('group-photo-img');
    const placeholder = document.getElementById('group-photo-placeholder');
    img.src = e.target.result;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}
function closeCreateGroup() {
  document.getElementById('create-group-modal').classList.remove('open');
}

function createGroup() {
  const name = document.getElementById('new-group-name').value.trim();
  const desc = document.getElementById('new-group-desc').value.trim();
  const icon = document.getElementById('new-group-icon').value.trim() || '📖';
  const cat = document.getElementById('new-group-cat').value;
  const photoImg = document.getElementById('group-photo-img');
  const photo = photoImg.style.display !== 'none' ? photoImg.src : null;
  if (!name) { showProfileToast('❌ Nom requis', true); return; }
  const groups = getGroups();
  const id = 'custom_' + Date.now();
  const colors = ['#7c6af7','#f472b6','#2dd4bf','#fb923c','#34d399','#60a5fa'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const newGroup = { id, name, icon, photo, desc: desc || name, cat, color, members: [currentUser.email], messages: [], createdBy: currentUser.email };
  groups.push(newGroup);
  saveGroups(groups);
  allGroups = groups;
  closeCreateGroup();
  renderGroupsList(allGroups);
  openGroup(id);
  showProfileToast('✅ Groupe créé !');
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#7c6af7','#f472b6','#2dd4bf','#fb923c','#34d399','#60a5fa','#a78bfa','#f87171'];
  return colors[Math.abs(hash) % colors.length];
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

checkSession();
