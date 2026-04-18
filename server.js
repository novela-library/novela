const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const BOOKS_DIR = path.join(__dirname, 'books');
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Create books directory if it doesn't exist
if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://xrcjaplurfkvjeiogikw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

async function supaFetch(method, table, body, query) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);
    const req = https.request({
      hostname: 'xrcjaplurfkvjeiogikw.supabase.co',
      path: '/rest/v1/' + table + (query || ''),
      method, headers
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d ? JSON.parse(d) : null }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ===== USER STORAGE (Supabase primary, local fallback) =====
let usersCache = null;

async function readUsersDB() {
  if (!SUPABASE_KEY) return readUsersLocal();
  try {
    const r = await supaFetch('GET', 'users', null, '?select=*&order=created_at.asc');
    if (r.status === 200 && Array.isArray(r.data)) { usersCache = r.data; return r.data; }
  } catch(e) { console.log('Supabase read error:', e.message); }
  return readUsersLocal();
}

async function addUserDB(user) {
  if (!SUPABASE_KEY) { const u = readUsersLocal(); u.push(user); writeUsersLocal(u); return; }
  try {
    await supaFetch('POST', 'users', { name: user.name, username: user.username || '', email: user.email, pass: user.pass, verified: true, twofa: false });
  } catch(e) { console.log('Supabase add error:', e.message); }
}

async function updateUserDB(id, updates) {
  if (!SUPABASE_KEY) return;
  try { await supaFetch('PATCH', 'users?id=eq.' + id, updates); } catch(e) {}
}

async function deleteUserDB(id) {
  if (!SUPABASE_KEY) return;
  try { await supaFetch('DELETE', 'users?id=eq.' + id); } catch(e) {}
}

function readUsersLocal() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch(e) { return []; }
}
function writeUsersLocal(users) {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8'); } catch(e) {}
}
function readUsers() {
  if (usersCache) return usersCache;
  return readUsersLocal();
}
function writeUsers(users) {
  usersCache = users;
  writeUsersLocal(users);
}

// Load users from Supabase on startup
readUsersDB().then(u => console.log('Users loaded:', u.length)).catch(e => console.log('Startup error:', e.message));

// ===== GROQ TEXT CLEANER =====
async function cleanArabicTextWithAI(rawText, title) {
  // Split into chunks of ~3000 chars to stay within token limits
  const chunkSize = 3000;
  const chunks = [];
  for (let i = 0; i < rawText.length; i += chunkSize) {
    chunks.push(rawText.substring(i, i + chunkSize));
  }

  // Only clean first 10 chunks (30000 chars) to save API calls
  const toClean = chunks.slice(0, 10);
  const cleaned = [];

  for (const chunk of toClean) {
    try {
      const body = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `أنت محرر نصوص عربية. النص التالي مستخرج من ملف OCR وقد يحتوي على أخطاء إملائية وأحرف غريبة وتشويه في الكلمات العربية.

مهمتك: صحح النص وأعده نظيفاً مع الحفاظ على المحتوى الأصلي تماماً. لا تضف ولا تحذف أي معنى.

النص:
${chunk}

أعد النص المصحح فقط بدون أي تعليق:`
        }],
        temperature: 0.1,
        max_tokens: 2000
      });

      const res = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.groq.com',
          path: '/openai/v1/chat/completions',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Length': Buffer.byteLength(body) }
        }, res => {
          let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.write(body); req.end();
      });

      const data = JSON.parse(res);
      const cleanedChunk = data.choices?.[0]?.message?.content || chunk;
      cleaned.push(cleanedChunk);
      await new Promise(r => setTimeout(r, 500)); // rate limit
    } catch(e) {
      cleaned.push(chunk); // keep original if AI fails
    }
  }

  // Combine cleaned chunks + remaining uncleaned chunks
  return [...cleaned, ...chunks.slice(10)].join('\n\n');
}

// Create books directory if it doesn't exist
if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR);

// ===== BOOK DOWNLOADER =====
function fetchUrlNode(targetUrl, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const mod = targetUrl.startsWith('https') ? https : http;
    const req = mod.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrlNode(res.headers.location, timeout).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function searchArchiveForBook(title, lang) {
  const shortTitle = title.substring(0, 12);
  const langFilter = lang === 'ar' ? 'language:arabic' : lang === 'fr' ? 'language:french' : 'language:english';
  const q = encodeURIComponent(`${langFilter} AND mediatype:texts AND title:(${shortTitle})`);
  const data = JSON.parse(await fetchUrlNode(
    `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&rows=5&output=json`
  ));
  return data.response?.docs || [];
}

async function getArchiveTextUrl(identifier) {
  const data = JSON.parse(await fetchUrlNode(`https://archive.org/metadata/${identifier}/files`));
  const files = data.result || [];
  const f = files.find(x => x.name?.endsWith('_djvu.txt'))
    || files.find(x => x.name?.endsWith('.txt') && !x.name.includes('meta') && !x.name.includes('jp2'));
  return f ? `https://archive.org/download/${identifier}/${f.name}` : null;
}

async function downloadBookText(bookId, title, author, lang) {
  const filePath = path.join(BOOKS_DIR, `${bookId}.txt`);
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');

  let rawText = null;

  // Try Gutenberg first for EN/FR books
  if (lang !== 'ar') {
    try {
      const gutLang = lang === 'fr' ? 'fr' : 'en';
      const q = encodeURIComponent(title.split(':')[0].trim());
      const gutData = JSON.parse(await fetchUrlNode(
        `https://gutendex.com/books/?search=${q}&languages=${gutLang}`
      ));
      const book = gutData.results?.[0];
      if (book) {
        const txtUrl = book.formats?.['text/plain; charset=utf-8'] || book.formats?.['text/plain'];
        if (txtUrl) {
          const text = await fetchUrlNode(txtUrl);
          if (text.length > 500) rawText = text;
        }
      }
    } catch(e) {}
  }

  // Try Archive.org
  if (!rawText) {
    try {
      const docs = await searchArchiveForBook(title, lang);
      for (const doc of docs) {
        try {
          const txtUrl = await getArchiveTextUrl(doc.identifier);
          if (!txtUrl) continue;
          const text = await fetchUrlNode(txtUrl);
          if (text.length > 300) { rawText = text; break; }
        } catch(e) { continue; }
      }
    } catch(e) {}
  }

  if (!rawText) return null;

  // Clean Arabic text with AI
  let finalText = rawText.substring(0, 3000000);
  if (lang === 'ar' && GROQ_API_KEY) {
    console.log(`  🤖 Cleaning Arabic text for: ${title}`);
    try {
      finalText = await cleanArabicTextWithAI(finalText, title);
    } catch(e) {
      console.log(`  ⚠️ AI cleaning failed, using raw text`);
    }
  }

  fs.writeFileSync(filePath, finalText, 'utf8');
  return finalText;
}

// Background downloader — downloads books queue
const downloadQueue = [];
let isDownloading = false;

async function processDownloadQueue() {
  if (isDownloading || downloadQueue.length === 0) return;
  isDownloading = true;
  while (downloadQueue.length > 0) {
    const item = downloadQueue.shift();
    try {
      await downloadBookText(item.id, item.title, item.author, item.lang);
      console.log(`✅ Downloaded: ${item.title}`);
    } catch(e) {
      console.log(`❌ Failed: ${item.title} — ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000)); // 1s delay between downloads
  }
  isDownloading = false;
}

// ===== EMAIL CONFIG =====
const EMAIL_FROM = 'novela.library@gmail.com';
// ===== EMAIL VIA GMAIL OAUTH2 / SMTP2GO (works on Render) =====
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SMTP2GO_KEY = process.env.SMTP2GO_KEY || '';
console.log('Email keys - Resend:', RESEND_API_KEY ? 'YES' : 'NO', 'SMTP2GO:', SMTP2GO_KEY ? 'YES' : 'NO');

async function sendVerificationEmail(toEmail, code, type, userName) {
  const subjects = {
    register: 'Verify your Novela account',
    login2fa: 'Your Novela login code',
    reset: 'Reset your Novela password'
  };
  const bodyText = {
    register: `Hi ${userName},\n\nWelcome to Novela!\n\nYour verification code is: ${code}\n\nExpires in 10 minutes.\n\n— Novela Team`,
    login2fa: `Hi ${userName},\n\nYour login code: ${code}\n\nExpires in 10 minutes.\n\n— Novela Team`,
    reset: `Hi ${userName},\n\nYour password reset code: ${code}\n\nExpires in 10 minutes.\n\n— Novela Team`
  };
  const htmlBody = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d0e1c;color:#eeeeff;border-radius:16px">
    <h2 style="color:#a78bfa">Novela 📚</h2>
    <p style="color:#8b8fa8">${bodyText[type].replace(/\n/g,'<br>')}</p>
    <div style="background:#1a1d35;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
      <span style="font-size:2rem;font-weight:900;letter-spacing:10px;color:#a78bfa">${code}</span>
    </div>
  </div>`;

  // Try SMTP2GO first (free, works on Render)
  if (SMTP2GO_KEY) {
    const body = JSON.stringify({
      api_key: SMTP2GO_KEY,
      to: [toEmail],
      sender: 'Novela <noreply@novela-app.com>',
      subject: subjects[type],
      text_body: bodyText[type],
      html_body: htmlBody
    });
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.smtp2go.com',
        path: '/v3/email/send',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => res.statusCode < 300 ? resolve(d) : reject(new Error(`SMTP2GO ${res.statusCode}: ${d}`)));
      });
      req.on('error', reject); req.write(body); req.end();
    });
    console.log('Email sent via SMTP2GO');
    return;
  }

  // Try Resend (only works if domain verified)
  if (RESEND_API_KEY) {
    const body = JSON.stringify({
      from: 'Novela <onboarding@resend.dev>',
      to: [toEmail],
      subject: subjects[type],
      text: bodyText[type],
      html: htmlBody
    });
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.resend.com', path: '/emails', method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => res.statusCode < 300 ? resolve(d) : reject(new Error(`Resend ${res.statusCode}: ${d}`)));
      });
      req.on('error', reject); req.write(body); req.end();
    });
    console.log('Email sent via Resend');
    return;
  }

  throw new Error('No email service configured');
}

// Pending codes in memory: { email: { code, expires, type } }
const pendingCodes = {};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =====================================================
// ===== COMPTES ADMIN — MODIFIE ICI UNIQUEMENT =====
// =====================================================
const ADMIN_ACCOUNTS = [
  { username: 'admin', password: 'novela2024' },
  { username: 'mathieu', password: 'mathNSI' },
];
// =====================================================

// Token secret fixe — ne change pas au redémarrage
// Utilise ADMIN_SECRET en variable d'env sur Render, sinon fallback local
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'novela_admin_secret_2024';

function generateAdminToken(username) {
  // Token = base64(username:secret) — valide même après restart
  return Buffer.from(username + ':' + ADMIN_SECRET).toString('base64');
}

function validateAdminToken(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, secret] = decoded.split(':');
    return secret === ADMIN_SECRET && ADMIN_ACCOUNTS.some(a => a.username === username);
  } catch(e) { return false; }
}

// ===== HELPERS =====
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    // Add cache control headers to force reload on new versions
    const headers = { 'Content-Type': contentType };
    // For HTML, CSS, JS files - no cache
    if (contentType.includes('html') || contentType.includes('javascript') || contentType.includes('css')) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      // For images and other assets - cache for 1 hour
      headers['Cache-Control'] = 'public, max-age=3600';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}
function getBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { resolve({}); } });
  });
}

// ===== SERVER =====
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') { sendJSON(res, 200, {}); return; }

  // ===== STATIC FILES =====
  const staticFiles = {
    '/': 'index.html', '/index.html': 'index.html',
    '/app.js': 'app.js', '/style.css': 'style.css',
    '/reader.html': 'reader.html', '/reader.css': 'reader.css',
    '/reader.js': 'reader.js', '/admin.html': 'admin.html',
    '/admin-login.html': 'admin-login.html',
    '/logo.png': 'logo.png',
    '/book_texts.js': 'book_texts.js',
    '/books-content.js': 'books-content.js',
    '/manifest.json': 'manifest.json',
    '/sw.js': 'sw.js'
  };

  // Protect admin.html — redirect to admin-login if no session
  if (pathname === '/admin.html' || pathname === '/admin') {
    const token = parsed.query.token;
    if (!validateAdminToken(token)) {
      serveFile(res, path.join(__dirname, 'admin-login.html'), 'text/html');
      return;
    }
  }
  const mimeTypes = {
    '.html': 'text/html', '.js': 'application/javascript',
    '.css': 'text/css', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
  };

  if (staticFiles[pathname]) {
    const ext = path.extname(staticFiles[pathname]);
    serveFile(res, path.join(__dirname, staticFiles[pathname]), mimeTypes[ext] || 'text/plain');
    return;
  }

  // GET /api/book-text/:id — get book text (downloads if not cached)
  if (pathname.startsWith('/api/book-text/') && req.method === 'GET') {
    const bookId = pathname.split('/')[3];
    const filePath = path.join(BOOKS_DIR, `${bookId}.txt`);

    if (fs.existsSync(filePath)) {
      const text = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      });
      res.end(text);
      return;
    }

    // Not cached — trigger download and return 202
    const { title, author, lang } = parsed.query;
    if (title) {
      downloadQueue.push({ id: bookId, title, author: author || '', lang: lang || 'en' });
      processDownloadQueue();
    }
    sendJSON(res, 202, { status: 'downloading', message: 'Book is being downloaded, try again in 10 seconds' });
    return;
  }

  // POST /api/queue-books — queue multiple books for download
  if (pathname === '/api/queue-books' && req.method === 'POST') {
    const body = await getBody(req);
    const books = body.books || [];
    let queued = 0;
    for (const b of books) {
      const filePath = path.join(BOOKS_DIR, `${b.id}.txt`);
      if (!fs.existsSync(filePath)) {
        downloadQueue.push(b);
        queued++;
      }
    }
    processDownloadQueue();
    sendJSON(res, 200, { queued, total: books.length, queueLength: downloadQueue.length });
    return;
  }

  // GET /api/book-status — check which books are downloaded
  if (pathname === '/api/book-status' && req.method === 'GET') {
    const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
    const downloaded = files.map(f => parseInt(f.replace('.txt', ''))).filter(n => !isNaN(n));
    sendJSON(res, 200, { downloaded, count: downloaded.length, queueLength: downloadQueue.length });
    return;
  }

  // ===== API =====

  // GET /api/ai-key — serve Groq key to frontend securely
  if (pathname === '/api/ai-key' && req.method === 'GET') {
    const key = process.env.GROQ_API_KEY || GROQ_API_KEY;
    if (!key) { sendJSON(res, 404, { error: 'No key' }); return; }
    sendJSON(res, 200, { key });
    return;
  }
  if (pathname === '/api/admin-login' && req.method === 'POST') {
    const body = await getBody(req);
    const { username, password } = body;
    const valid = ADMIN_ACCOUNTS.find(a => a.username === username && a.password === password);
    if (!valid) { sendJSON(res, 401, { error: 'Identifiants incorrects' }); return; }
    const token = generateAdminToken(username);
    sendJSON(res, 200, { success: true, token });
    return;
  }

  // POST /api/admin-logout
  if (pathname === '/api/admin-logout' && req.method === 'POST') {
    // Token est stateless — pas besoin de supprimer côté serveur
    sendJSON(res, 200, { success: true });
    return;
  }

  // Protect /api/users routes — require valid admin token
  if (pathname.startsWith('/api/users')) {
    const token = req.headers['x-admin-token'];
    if (!validateAdminToken(token)) {
      sendJSON(res, 401, { error: 'Non autorisé' }); return;
    }
  }

  // GET /api/users — liste tous les comptes (admin)
  if (pathname === '/api/users' && req.method === 'GET') {
    const users = await readUsersDB();
    sendJSON(res, 200, users.map(u => ({ ...u, pass: '••••••' })));
    return;
  }

  // POST /api/register — create account + send verification email
  if (pathname === '/api/register' && req.method === 'POST') {
    const body = await getBody(req);
    const { name, email, pass, username } = body;
    if (!name || !email || !pass) { sendJSON(res, 400, { error: 'Missing fields' }); return; }
    const users = readUsers();
    if (users.find(u => u.email === email)) { sendJSON(res, 409, { error: 'Email already in use' }); return; }
    if (username && users.find(u => u.username === username)) { sendJSON(res, 409, { error: 'Username already taken' }); return; }
    const newUser = { id: Date.now(), name, username: username || '', email, pass, verified: true, twofa: false, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeUsers(users);
    await addUserDB(newUser);
    sendJSON(res, 201, { success: true, requiresVerification: false, user: { id: newUser.id, name, username: newUser.username, email } });
    return;
  }

  // POST /api/verify-email — verify code after register
  if (pathname === '/api/verify-email' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, code } = body;
    const pending = pendingCodes[email];
    if (!pending || pending.type !== 'register') { sendJSON(res, 400, { error: 'No pending verification' }); return; }
    if (Date.now() > pending.expires) { delete pendingCodes[email]; sendJSON(res, 400, { error: 'Code expired' }); return; }
    if (pending.code !== code) { sendJSON(res, 400, { error: 'Invalid code' }); return; }
    delete pendingCodes[email];
    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx !== -1) { users[idx].verified = true; writeUsers(users); }
    const user = users[idx];
    sendJSON(res, 200, { success: true, user: { id: user.id, name: user.name, email: user.email } });
    return;
  }

  // POST /api/login — login
  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, pass } = body;
    // Always read fresh from Supabase for login
    const users = await readUsersDB();
    // Accept email OR username
    const user = users.find(u => (u.email === email || u.username === email || u.name === email) && u.pass === pass);
    if (!user) { sendJSON(res, 401, { error: 'Incorrect email/username or password' }); return; }
    sendJSON(res, 200, { success: true, user: { id: user.id, name: user.name, username: user.username || '', email: user.email, twofa: user.twofa } });
    return;
  }

  // POST /api/verify-2fa — verify 2FA login code
  if (pathname === '/api/verify-2fa' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, code } = body;
    const pending = pendingCodes[email];
    if (!pending || pending.type !== 'login2fa') { sendJSON(res, 400, { error: 'No pending 2FA' }); return; }
    if (Date.now() > pending.expires) { delete pendingCodes[email]; sendJSON(res, 400, { error: 'Code expired' }); return; }
    if (pending.code !== code) { sendJSON(res, 400, { error: 'Invalid code' }); return; }
    delete pendingCodes[email];
    const users = readUsers();
    const user = users.find(u => u.email === email);
    sendJSON(res, 200, { success: true, user: { id: user.id, name: user.name, email: user.email, twofa: user.twofa } });
    return;
  }

  // POST /api/forgot-password — send reset code
  if (pathname === '/api/forgot-password' && req.method === 'POST') {
    const body = await getBody(req);
    const { email } = body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) { sendJSON(res, 404, { error: 'No account with this email' }); return; }
    const code = generateCode();
    pendingCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000, type: 'reset' };
    try { await sendVerificationEmail(email, code, 'reset', user.name); }
    catch(e) { console.error('Email error:', e.message); }
    sendJSON(res, 200, { success: true });
    return;
  }

  // POST /api/reset-password — verify code + set new password
  if (pathname === '/api/reset-password' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, code, newPass } = body;
    const pending = pendingCodes[email];
    if (!pending || pending.type !== 'reset') { sendJSON(res, 400, { error: 'No pending reset' }); return; }
    if (Date.now() > pending.expires) { delete pendingCodes[email]; sendJSON(res, 400, { error: 'Code expired' }); return; }
    if (pending.code !== code) { sendJSON(res, 400, { error: 'Invalid code' }); return; }
    delete pendingCodes[email];
    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx !== -1) { users[idx].pass = newPass; writeUsers(users); }
    sendJSON(res, 200, { success: true });
    return;
  }

  // POST /api/toggle-2fa — enable/disable 2FA
  if (pathname === '/api/toggle-2fa' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, enabled } = body;
    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) { sendJSON(res, 404, { error: 'User not found' }); return; }
    users[idx].twofa = !!enabled;
    writeUsers(users);
    sendJSON(res, 200, { success: true, twofa: users[idx].twofa });
    return;
  }

  // PUT /api/users/:id — modifier un compte (admin)
  if (pathname.startsWith('/api/users/') && req.method === 'PUT') {
    const id = parseInt(pathname.split('/')[3]);
    const body = await getBody(req);
    const users = readUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) { sendJSON(res, 404, { error: 'Utilisateur introuvable' }); return; }
    if (body.name) users[idx].name = body.name;
    if (body.username !== undefined) users[idx].username = body.username;
    if (body.email) users[idx].email = body.email;
    if (body.pass) users[idx].pass = body.pass;
    if (body.banned !== undefined) users[idx].banned = body.banned;
    writeUsers(users);
    // Sync to Supabase
    const updates = {};
    if (body.name) updates.name = body.name;
    if (body.username !== undefined) updates.username = body.username;
    if (body.email) updates.email = body.email;
    if (body.pass) updates.pass = body.pass;
    if (body.banned !== undefined) updates.banned = body.banned;
    await updateUserDB(id, updates).catch(() => {});
    sendJSON(res, 200, { success: true });
    return;
  }

  // DELETE /api/users/:id — supprimer un compte (admin)
  if (pathname.startsWith('/api/users/') && req.method === 'DELETE') {
    const id = parseInt(pathname.split('/')[3]);
    const users = readUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) { sendJSON(res, 404, { error: 'Utilisateur introuvable' }); return; }
    writeUsers(filtered);
    sendJSON(res, 200, { success: true });
    return;
  }

  // ===== ADMIN REVIEWS/REPORTS =====

  // GET /api/admin/reviews — get all reviews (admin)
  if (pathname === '/api/admin/reviews' && req.method === 'GET') {
    const token = req.headers['x-admin-token'];
    if (!validateAdminToken(token)) { sendJSON(res, 401, { error: 'Non autorisé' }); return; }
    const ratings = JSON.parse(fs.existsSync('global_ratings.json') ? fs.readFileSync('global_ratings.json','utf8') : '{}');
    const all = [];
    Object.entries(ratings).forEach(([bookId, data]) => {
      (data.reviews || []).forEach((r, i) => {
        all.push({ bookId, index: i, ...r });
      });
    });
    all.sort((a, b) => b.date - a.date);
    sendJSON(res, 200, all);
    return;
  }

  // DELETE /api/admin/reviews — delete a review (admin)
  if (pathname === '/api/admin/reviews' && req.method === 'DELETE') {
    const token = req.headers['x-admin-token'];
    if (!validateAdminToken(token)) { sendJSON(res, 401, { error: 'Non autorisé' }); return; }
    const body = await getBody(req);
    const { bookId, index } = body;
    const ratingsPath = 'global_ratings.json';
    const ratings = JSON.parse(fs.existsSync(ratingsPath) ? fs.readFileSync(ratingsPath,'utf8') : '{}');
    if (ratings[bookId]?.reviews) {
      ratings[bookId].reviews.splice(index, 1);
      fs.writeFileSync(ratingsPath, JSON.stringify(ratings));
    }
    sendJSON(res, 200, { success: true });
    return;
  }

  // GET /api/admin/reports — get all reports (admin)
  if (pathname === '/api/admin/reports' && req.method === 'GET') {
    const token = req.headers['x-admin-token'];
    if (!validateAdminToken(token)) { sendJSON(res, 401, { error: 'Non autorisé' }); return; }
    const reports = JSON.parse(fs.existsSync('reports.json') ? fs.readFileSync('reports.json','utf8') : '[]');
    sendJSON(res, 200, reports);
    return;
  }

  // POST /api/admin/reports — submit a report (user)
  if (pathname === '/api/admin/reports' && req.method === 'POST') {
    const body = await getBody(req);
    const { bookId, reviewIndex, reviewText, reviewUser, reason, reportedBy } = body;
    const reportsPath = 'reports.json';
    const reports = JSON.parse(fs.existsSync(reportsPath) ? fs.readFileSync(reportsPath,'utf8') : '[]');
    reports.push({ id: Date.now(), bookId, reviewIndex, reviewText, reviewUser, reason, reportedBy, date: Date.now(), status: 'pending' });
    fs.writeFileSync(reportsPath, JSON.stringify(reports));
    sendJSON(res, 200, { success: true });
    return;
  }

  // PUT /api/admin/reports/:id — update report status (admin)
  if (pathname.startsWith('/api/admin/reports/') && req.method === 'PUT') {
    const token = req.headers['x-admin-token'];
    if (!validateAdminToken(token)) { sendJSON(res, 401, { error: 'Non autorisé' }); return; }
    const id = parseInt(pathname.split('/')[4]);
    const body = await getBody(req);
    const reportsPath = 'reports.json';
    const reports = JSON.parse(fs.existsSync(reportsPath) ? fs.readFileSync(reportsPath,'utf8') : '[]');
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) { reports[idx].status = body.status || 'resolved'; fs.writeFileSync(reportsPath, JSON.stringify(reports)); }
    sendJSON(res, 200, { success: true });
    return;
  }

  // POST /api/update-profile — update username/name (user)
  if (pathname === '/api/update-profile' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, name, username } = body;
    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) { sendJSON(res, 404, { error: 'User not found' }); return; }
    if (username && username !== users[idx].username) {
      if (users.find(u => u.username === username && u.email !== email)) {
        sendJSON(res, 409, { error: 'Username already taken' }); return;
      }
      users[idx].username = username;
    }
    if (name) users[idx].name = name;
    writeUsers(users);
    sendJSON(res, 200, { success: true, user: { ...users[idx], pass: undefined } });
    return;
  }

  // ===== SCOREBOARD ENDPOINTS =====

  // GET /api/scores/quiz — get all quiz scores
  if (pathname === '/api/scores/quiz' && req.method === 'GET') {
    try {
      const r = await supaFetch('GET', 'quiz_scores', null, '?select=*&order=avg_score.desc&limit=50');
      if (r.status === 200) { sendJSON(res, 200, r.data || []); return; }
    } catch(e) {}
    sendJSON(res, 200, []);
    return;
  }

  // GET /api/scores/books — get all books scores
  if (pathname === '/api/scores/books' && req.method === 'GET') {
    try {
      const r = await supaFetch('GET', 'books_scores', null, '?select=*&order=books_read.desc&limit=50');
      if (r.status === 200) { sendJSON(res, 200, r.data || []); return; }
    } catch(e) {}
    sendJSON(res, 200, []);
    return;
  }

  // POST /api/scores/quiz — upsert quiz score
  if (pathname === '/api/scores/quiz' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, name, score, total, bookTitle } = body;
    if (!email || !name) { sendJSON(res, 400, { error: 'Missing fields' }); return; }
    const pct = Math.round((score / total) * 100);
    try {
      // Check existing
      const existing = await supaFetch('GET', 'quiz_scores', null, `?email=eq.${encodeURIComponent(email)}&select=*`);
      if (existing.status === 200 && existing.data?.length > 0) {
        const cur = existing.data[0];
        const newTotal = (cur.total_quizzes || 0) + 1;
        const newTotalScore = (cur.total_score || 0) + pct;
        await supaFetch('PATCH', `quiz_scores?email=eq.${encodeURIComponent(email)}`, {
          name,
          total_quizzes: newTotal,
          total_score: newTotalScore,
          best_score: Math.max(cur.best_score || 0, pct),
          avg_score: Math.round(newTotalScore / newTotal),
          last_book: bookTitle,
          updated_at: new Date().toISOString()
        });
      } else {
        await supaFetch('POST', 'quiz_scores', {
          email, name,
          total_quizzes: 1,
          total_score: pct,
          best_score: pct,
          avg_score: pct,
          last_book: bookTitle,
          updated_at: new Date().toISOString()
        });
      }
      sendJSON(res, 200, { success: true });
    } catch(e) {
      console.log('Score save error:', e.message);
      sendJSON(res, 500, { error: e.message });
    }
    return;
  }

  // POST /api/scores/books — upsert books read score
  if (pathname === '/api/scores/books' && req.method === 'POST') {
    const body = await getBody(req);
    const { email, name, booksRead } = body;
    if (!email || !name) { sendJSON(res, 400, { error: 'Missing fields' }); return; }
    try {
      const existing = await supaFetch('GET', 'books_scores', null, `?email=eq.${encodeURIComponent(email)}&select=*`);
      if (existing.status === 200 && existing.data?.length > 0) {
        await supaFetch('PATCH', `books_scores?email=eq.${encodeURIComponent(email)}`, {
          name, books_read: booksRead, updated_at: new Date().toISOString()
        });
      } else {
        await supaFetch('POST', 'books_scores', {
          email, name, books_read: booksRead, updated_at: new Date().toISOString()
        });
      }
      sendJSON(res, 200, { success: true });
    } catch(e) {
      console.log('Books score save error:', e.message);
      sendJSON(res, 500, { error: e.message });
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n✅ Novela server running at http://localhost:${PORT}`);
  console.log(`📚 Site:  http://localhost:${PORT}/`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`\nPress Ctrl+C to stop.\n`);
});
