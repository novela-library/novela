

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
const HARDCODED_API_KEY = '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';
let geminiApiKey = HARDCODED_API_KEY || localStorage.getItem('gemini_api_key') || '';
let chatHistory = [];

const SYSTEM_PROMPT = `Tu es un assistant littéraire expert de Novela, une bibliothèque universelle en ligne. Tu t'appelles "Biblio". Tu parles français.

Tu connais parfaitement la littérature mondiale : classiques, fantasy, science-fiction, policier, philosophie, poésie, littérature africaine, asiatique, latino-américaine, etc.

Tu peux :
- Recommander des livres selon les goûts de l'utilisateur
- Résumer et analyser des œuvres littéraires
- Parler des auteurs et de leur vie
- Expliquer des mouvements littéraires (réalisme, romantisme, surréalisme, etc.)
- Créer des quiz littéraires
- Comparer des œuvres entre elles
- Donner des avis critiques sur des livres

Notre bibliothèque contient ces livres : ${BOOKS.map(b => `"${b.title}" de ${b.author} (${b.genre}, ${b.year})`).join(', ')}.

Sois chaleureux, passionné par la littérature, et donne des réponses détaillées et enrichissantes. Utilise des emojis avec modération pour rendre tes réponses plus vivantes.`;

async function callGemini(userMessage) {
  if (!geminiApiKey) {
    return "❌ Aucune clé API configurée. Contactez l'administrateur du site.";
  }

  // Groq utilise le format OpenAI
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
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

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => t.classList.toggle('active', (i === 0) === (tab === 'login')));
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function getUsers() { return JSON.parse(localStorage.getItem('biblio_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('biblio_users', JSON.stringify(u)); }

function register() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const err = document.getElementById('reg-error');
  if (!name || !email || !pass) { err.textContent = 'Tous les champs sont requis.'; return; }
  if (pass.length < 6) { err.textContent = 'Mot de passe trop court (6 caractères min).'; return; }
  const users = getUsers();
  if (users.find(u => u.email === email)) { err.textContent = 'Email déjà utilisé.'; return; }
  users.push({ name, email, pass });
  saveUsers(users);
  err.style.color = 'var(--success)';
  err.textContent = 'Compte créé ! Connectez-vous.';
  setTimeout(() => { err.textContent = ''; switchTab('login'); }, 1200);
}

function login() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  const users = getUsers();
  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) { err.textContent = 'Email ou mot de passe incorrect.'; return; }
  currentUser = user;
  localStorage.setItem('biblio_session', JSON.stringify(user));
  document.getElementById('auth-overlay').classList.remove('active');
  document.getElementById('app').style.display = 'block';
  document.getElementById('nav-username').textContent = user.name;
  initApp();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('biblio_session');
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-overlay').classList.add('active');
}

function checkSession() {
  const s = localStorage.getItem('biblio_session');
  if (s) {
    currentUser = JSON.parse(s);
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('app').style.display = 'block';
    document.getElementById('nav-username').textContent = currentUser.name;
    initApp();
  }
}

// ===== NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const idx = ['home','library','quiz','ai'].indexOf(id);
  if (idx >= 0) document.querySelectorAll('.nav-btn')[idx].classList.add('active');
}

// ===== BOOKS =====
let activeGenre = 'Tous';

function getCoverUrl(b) {
  if (b.isbn) return `https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`;
  if (b.olid) return `https://covers.openlibrary.org/b/olid/${b.olid}-M.jpg`;
  return null;
}

function renderBooks(container, books) {
  const el = document.getElementById(container);
  if (!books.length) { el.innerHTML = '<p style="color:var(--text2);grid-column:1/-1;text-align:center;padding:40px">Aucun livre trouvé.</p>'; return; }
  el.innerHTML = books.map(b => {
    const cover = getCoverUrl(b);
    const coverHTML = cover
      ? `<img src="${cover}" alt="${b.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'cover-placeholder\\' style=\\'background:${b.color}25;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px\\'><span style=\\'font-size:2.5rem\\'>${b.emoji}</span><p style=\\'font-size:0.75rem;color:rgba(255,255,255,0.8);font-weight:600;text-align:center\\'>${b.title}</p></div>'">`
      : `<div class="cover-placeholder" style="background:${b.color}25;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px"><span style="font-size:2.5rem">${b.emoji}</span><p style="font-size:0.75rem;color:rgba(255,255,255,0.8);font-weight:600;text-align:center">${b.title}</p></div>`;
    return `
    <div class="book-card" onclick="openBook(${b.id})">
      <div class="book-cover">${coverHTML}</div>
      <div class="book-info">
        <h4>${b.title}</h4>
        <p>${b.author}</p>
        <span class="book-genre">${b.genre}</span>
      </div>
    </div>`;
  }).join('');
}

function filterBooks() {
  const q = document.getElementById('search-input').value.toLowerCase();
  let filtered = BOOKS;
  if (activeGenre !== 'Tous') filtered = filtered.filter(b => b.genre === activeGenre);
  if (q) filtered = filtered.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q));
  renderBooks('library-books', filtered);
}

function initGenreFilters() {
  const genres = ['Tous', ...new Set(BOOKS.map(b => b.genre))];
  document.getElementById('genre-filters').innerHTML = genres.map(g =>
    `<button class="genre-btn${g==='Tous'?' active':''}" onclick="setGenre('${g}')">${g}</button>`).join('');
}

function setGenre(g) {
  activeGenre = g;
  document.querySelectorAll('.genre-btn').forEach(b => b.classList.toggle('active', b.textContent === g));
  filterBooks();
}

function openBook(id) {
  const b = BOOKS.find(x => x.id === id);
  const cover = getCoverUrl(b);
  const coverHTML = cover
    ? `<img src="${cover}" alt="${b.title}" style="width:120px;height:180px;object-fit:cover;border-radius:8px;float:left;margin:0 24px 16px 0" onerror="this.outerHTML='<div style=\\'width:120px;height:180px;background:${b.color}30;border-radius:8px;float:left;margin:0 24px 16px 0;display:flex;align-items:center;justify-content:center;font-size:3rem\\'>${b.emoji}</div>'">`
    : `<div style="width:120px;height:180px;background:${b.color}30;border-radius:8px;float:left;margin:0 24px 16px 0;display:flex;align-items:center;justify-content:center;font-size:3rem">${b.emoji}</div>`;
  document.getElementById('modal-content').innerHTML = `
    ${coverHTML}
    <h2 class="modal-book-title">${b.title}</h2>
    <p class="modal-book-author">✍️ ${b.author}</p>
    <div class="modal-book-meta">
      <span>📅 ${b.year < 0 ? Math.abs(b.year)+' av. J.-C.' : b.year}</span>
      <span>🏷️ ${b.genre}</span>
    </div>
    <p class="modal-book-desc">${b.desc}</p>
    <br>
    <button class="btn-secondary" style="width:100%;margin-top:12px;clear:both;display:block" onclick="askAI('Parle-moi du livre ${b.title.replace(/'/g,"\\'")} de ${b.author}'); closeBookModal(); showPage('ai')">
      <i class="fas fa-robot"></i> Analyser avec l'IA
    </button>`;
  document.getElementById('book-modal').classList.add('open');
}

function closeBookModal() { document.getElementById('book-modal').classList.remove('open'); }
function closeModal(e) { if (e.target.id === 'book-modal') closeBookModal(); }

// ===== QUIZ =====
let quizState = { cat: null, questions: [], idx: 0, score: 0 };

function initQuizCategories() {
  document.getElementById('quiz-categories').innerHTML = Object.entries(QUIZ_DATA).map(([name, data]) => `
    <div class="quiz-cat-card" onclick="startQuiz('${name}')">
      <div class="cat-icon">${data.icon}</div>
      <h3>${name}</h3>
      <p>${data.desc}</p>
    </div>`).join('');
}

function startQuiz(cat) {
  quizState = { cat, questions: [...QUIZ_DATA[cat].questions].sort(() => Math.random() - 0.5), idx: 0, score: 0 };
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
  document.getElementById('result-msg').textContent = `Catégorie : ${quizState.cat}`;
}

function resetQuiz() { startQuiz(quizState.cat); }

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
  renderBooks('featured-books', [...BOOKS].sort(() => Math.random() - 0.5).slice(0, 8));
  renderBooks('library-books', BOOKS);
  initGenreFilters();
  initQuizCategories();
  if (!geminiApiKey) {
    setTimeout(() => {
      addMessage('👋 Bonjour ' + currentUser.name + ' ! Je suis **Biblio**, votre assistant littéraire. Posez-moi vos questions sur la littérature !', 'ai');
    }, 300);
  } else {
    setTimeout(() => {
      addMessage('👋 Bonjour ' + currentUser.name + ' ! Je suis **Biblio**, votre assistant littéraire propulsé par **Gemini AI**. Posez-moi n\'importe quelle question sur la littérature !', 'ai');
    }, 300);
  }
}

checkSession();
