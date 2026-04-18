// ===== NOVELA READER - Project Gutenberg Full Text =====
const params = new URLSearchParams(window.location.search);
const bookId = parseInt(params.get('id')) || 0;
const gutenbergId = parseInt(params.get('gid')) || 0; // Gutenberg ID direct

let book = null;
let currentChapter = 0;
let chapters = [];
let fontSize = 18;
let lineHeight = 1.8;
let maxWidth = 700;
let currentFont = 'Lora';
let settingsOpen = false;
let tocOpen = false;

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
  loadPrefs();

  // One-time cleanup: remove old shared cache keys that caused wrong book text
  // Old keys were 'fulltext_0', 'fulltext_null', 'fulltext_undefined'
  ['fulltext_0', 'fulltext_null', 'fulltext_undefined', 'fulltext_NaN'].forEach(k => {
    localStorage.removeItem(k);
  });
  // Also remove any numeric-only keys (old format) that could be wrong
  Object.keys(localStorage).filter(k => /^fulltext_\d+$/.test(k)).forEach(k => {
    localStorage.removeItem(k);
  });

  // Get book info — with timeout so it never hangs forever
  if (gutenbergId) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`https://gutendex.com/books/${gutenbergId}`, { signal: ctrl.signal });
      clearTimeout(t);
      const data = await res.json();
      book = parseGutBook(data);
    } catch(e) { book = null; }
  } else if (bookId && typeof BOOKS !== 'undefined') {
    const local = BOOKS.find(b => b.id === bookId);
    if (local) {
      // Use local data immediately — search Gutenberg in background for txtUrl
      book = localToGutBook(local);
      renderTopbar();
      renderBookHeader();
      // Try to find Gutenberg match in background (gives us txtUrl)
      searchGutenberg(local.title, local.author).then(gutBook => {
        if (gutBook && gutBook.gutId) {
          book.gutId = gutBook.gutId;
          book.txtUrl = gutBook.txtUrl;
          book.cover = book.cover || gutBook.cover;
        }
      }).catch(() => {});
    }
  }

  if (!book) {
    showError('Livre introuvable.');
    return;
  }

  addToHistory();
  // Only render topbar/header if not already done (local book path renders early)
  if (!document.getElementById('topbar-title').textContent) {
    renderTopbar();
    renderBookHeader();
  } else {
    renderTopbar();
    renderBookHeader();
  }

  // Load saved position
  const session = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (session) {
    const hist = JSON.parse(localStorage.getItem('reading_history_' + session.email) || '{}');
    const key = book.gutId ? 'g' + book.gutId : 'b' + bookId;
    if (hist[key]) currentChapter = hist[key].chapter || 0;
  }

  // Set page direction based on book language
  const bookLang = book.lang || detectBookLang(book);
  if (bookLang === 'ar') {
    document.getElementById('book-text').style.direction = 'rtl';
    document.getElementById('book-text').style.fontFamily = 'Arial, sans-serif';
    document.getElementById('chapter-title').style.direction = 'rtl';
  }

  // Load full text
  await loadFullText();

  // Scroll & hide topbar
  window.addEventListener('scroll', onScroll);
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const bar = document.getElementById('reader-topbar');
    if (y > lastY + 10 && y > 80) bar.classList.add('hidden');
    else if (y < lastY - 10) bar.classList.remove('hidden');
    lastY = y;
  });
});

// ===== GITHUB CDN — pre-downloaded books =====
const GITHUB_CDN = 'https://raw.githubusercontent.com/novela-library/novela-books/main/';

async function fetchFromCDN(gutId) {
  if (!gutId) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(GITHUB_CDN + gutId + '.txt', { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const text = await res.text();
      if (text.length > 500) return text;
    }
  } catch(e) {}
  return null;
}
async function fetchWithProxy(targetUrl, timeoutMs = 10000) {
  // Try direct first (Gutenberg supports CORS on most browsers)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(targetUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const text = await res.text();
      if (text.length > 200) return text;
    }
  } catch(e) {}

  // Try 2 best proxies in parallel — fastest wins
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
  ];
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const text = await Promise.any(
      proxies.map(url =>
        fetch(url, { signal: ctrl.signal })
          .then(r => { if (!r.ok) throw new Error('bad'); return r.text(); })
          .then(t => { if (t.length < 200) throw new Error('short'); return t; })
      )
    );
    clearTimeout(t);
    return text;
  } catch(e) {}

  throw new Error('All sources failed');
}

// ===== GUTENBERG API =====
async function fetchGutenbergMeta(gid) {
  try {
    const res = await fetch(`https://gutendex.com/books/${gid}`);
    const data = await res.json();
    return parseGutBook(data);
  } catch(e) { return null; }
}

async function searchGutenberg(title, author) {
  try {
    const q = encodeURIComponent(title.split(':')[0].trim().substring(0, 40));
    const res = await fetch(`https://gutendex.com/books/?search=${q}`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (!data.results?.length) return null;
    const match = data.results.find(b => {
      const t = b.title.toLowerCase();
      const a = (b.authors[0]?.name || '').toLowerCase();
      return t.includes(title.toLowerCase().substring(0,8)) ||
             a.includes(author.toLowerCase().split(' ').pop().toLowerCase());
    }) || data.results[0];
    return parseGutBook(match);
  } catch(e) { return null; }
}

function parseGutBook(data) {
  const txtUrl = data.formats?.['text/plain; charset=utf-8'] ||
                 data.formats?.['text/plain'] ||
                 Object.entries(data.formats || {}).find(([k]) => k.includes('text/plain'))?.[1];
  const cover = data.formats?.['image/jpeg'] || null;
  const author = data.authors?.[0]?.name || 'Auteur inconnu';
  // Gutenberg stores "Last, First" format
  const authorFormatted = author.includes(',')
    ? author.split(',').reverse().map(s => s.trim()).join(' ')
    : author;
  return {
    gutId: data.id,
    title: data.title,
    author: authorFormatted,
    year: data.authors?.[0]?.birth_year || '',
    cover,
    txtUrl,
    desc: data.summaries?.[0] || '',
    subjects: data.subjects || [],
    lang: data.languages?.[0] || 'en',
    downloadCount: data.download_count || 0
  };
}

function localToGutBook(local) {
  return {
    gutId: null,
    title: local.title,
    author: local.author,
    year: local.year,
    isbn: local.isbn || null,
    cover: local.isbn ? `https://covers.openlibrary.org/b/isbn/${local.isbn}-L.jpg` : null,
    desc: local.desc,
    subjects: [],
    lang: local.lang || (local.genre?.includes('عربية') ? 'ar' : local.genre?.includes('English') ? 'en' : 'fr')
  };
}

// ===== LOAD FULL TEXT =====
async function loadFullText() {
  // Build a unique cache key using both gutId AND bookId AND title
  const cacheKey = 'fulltext_' + (book.gutId ? 'g' + book.gutId : 'b' + bookId + '_' + book.title.substring(0, 20).replace(/\s+/g, '_'));
  const cached = localStorage.getItem(cacheKey);

  // 1. Instant: pre-downloaded texts
  if (typeof BOOK_TEXTS !== 'undefined' && BOOK_TEXTS[bookId]) {
    chapters = splitIntoChapters(BOOK_TEXTS[bookId], book.title);
    renderToc(); renderChapter(); return;
  }

  // 2. Instant: localStorage cache
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed[0]?.title && parsed[0]?.content) {
        chapters = parsed; renderToc(); renderChapter(); return;
      }
    } catch(e) {}
    chapters = splitIntoChapters(cached, book.title);
    renderToc(); renderChapter(); return;
  }

  const isArabic = /[\u0600-\u06FF]/.test(book.title + book.author) || book.lang === 'ar';
  const bookLang = book.lang || (isArabic ? 'ar' : 'en');

  showLoader('📖 Loading book...');

  // Global timeout — auto-retry once, then show message
  let retryCount = 0;
  const globalTimeout = setTimeout(async () => {
    if (retryCount === 0) {
      retryCount++;
      setLoaderMsg('🔄 Retrying...');
      // Clear bad cache and try again
      try { localStorage.removeItem(cacheKey); } catch(e) {}
      await loadFullText();
    } else {
      hideLoader();
      chapters = [{
        title: 'Chargement lent...',
        content: `<p class="chapter-intro">${book.desc || ''}</p>
          <p style="margin-top:16px;color:var(--text2)">Le téléchargement prend plus de temps que prévu.</p>
          <p style="margin-top:12px">
            <button onclick="clearCacheAndReload()" style="padding:10px 20px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;margin-right:8px">🔄 Réessayer</button>
            <a href="https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title)}" target="_blank" style="color:var(--accent3)">Chercher sur Gutenberg</a>
          </p>`
      }];
      renderToc(); renderChapter();
    }
  }, 60000); // 60s before auto-retry

  try {
    // 3. Fast: check GitHub CDN first (pre-downloaded books)
    if (book.gutId) {
      setLoaderMsg('📖 Loading from CDN...');
      const cdnText = await fetchFromCDN(book.gutId);
      if (cdnText) {
        try { localStorage.setItem(cacheKey, cdnText.substring(0, 2000000)); } catch(e) {}
        chapters = splitIntoChapters(cdnText, book.title);
        clearTimeout(globalTimeout);
        hideLoader(); renderToc(); renderChapter(); return;
      }
    }

    // 4. Check server cache (already downloaded)
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 3000);
      const serverRes = await fetch(
        `${window.location.origin}/api/book-text/${bookId}?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&lang=${bookLang}`,
        { signal: ctrl.signal }
      );
      if (serverRes.status === 200) {
        const text = await serverRes.text();
        if (text.length > 300) {
          try { localStorage.setItem(cacheKey, text.substring(0, 2000000)); } catch(e) {}
          chapters = splitIntoChapters(text, book.title);
          clearTimeout(globalTimeout);
          hideLoader(); renderToc(); renderChapter(); return;
        }
      }
    } catch(e) { /* timeout or server offline */ }

    // 4. Direct download
    if (isArabic) {
      await loadArabicBook();
      clearTimeout(globalTimeout);
      return;
    }

    // For Gutenberg books
    // If no gutId yet, search Gutenberg now (synchronously)
    if (!book.gutId && !book.txtUrl) {
      setLoaderMsg('🔍 Searching Gutenberg...');
      try {
        const gutBook = await searchGutenberg(book.title, book.author);
        if (gutBook) {
          book.gutId = gutBook.gutId;
          book.txtUrl = gutBook.txtUrl;
        }
      } catch(e) {}
    }

    if (book.gutId || book.txtUrl) {
      setLoaderMsg('📥 Downloading...');
      const gutId = book.gutId;
      const urlsToTry = [];
      if (book.txtUrl) urlsToTry.push(book.txtUrl);
      if (gutId) {
        urlsToTry.push(
          `https://www.gutenberg.org/cache/epub/${gutId}/pg${gutId}.txt`,
          `https://www.gutenberg.org/files/${gutId}/${gutId}-0.txt`,
          `https://www.gutenberg.org/files/${gutId}/${gutId}.txt`,
        );
      }
      for (const u of urlsToTry) {
        try {
          const text = await fetchWithProxy(u, 20000); // 20s for big books
          if (text && text.length > 500) {
            try { localStorage.setItem(cacheKey, text.substring(0, 2000000)); } catch(e) {}
            chapters = splitIntoChapters(text, book.title);
            clearTimeout(globalTimeout);
            hideLoader(); renderToc(); renderChapter(); return;
          }
        } catch(e) { continue; }
      }
    }

    clearTimeout(globalTimeout);
    hideLoader();
    showNoTextMessage();

  } catch(e) {
    clearTimeout(globalTimeout);
    hideLoader();
    showNoTextMessage();
  }
}

async function loadArabicBook() {
  showLoader('🔍 Searching for Arabic text on Archive.org...');
  const cacheKey = 'fulltext_' + (book.gutId ? 'g' + book.gutId : 'b' + bookId + '_' + book.title.substring(0, 20).replace(/\s+/g, '_'));

  try {
    const titleShort = book.title.substring(0, 12);
    const q = encodeURIComponent('language:arabic AND mediatype:texts AND title:(' + titleShort + ')');
    const searchUrl = 'https://archive.org/advancedsearch.php?q=' + q + '&fl[]=identifier&fl[]=title&rows=8&output=json';
    const res = await fetch(searchUrl);
    const data = await res.json();
    const docs = data.response?.docs || [];

    for (const doc of docs) {
      setLoaderMsg('📖 Found: ' + doc.title.substring(0, 40) + ' — loading...');
      try {
        const metaRes = await fetch('https://archive.org/metadata/' + doc.identifier + '/files');
        const metaData = await metaRes.json();
        const files = metaData.result || [];
        const txtFile = files.find(f => f.name?.endsWith('_djvu.txt'))
          || files.find(f => f.name?.endsWith('.txt') && !f.name.includes('meta'));
        if (!txtFile) continue;
        const txtUrl = 'https://archive.org/download/' + doc.identifier + '/' + txtFile.name;
        const text = await fetchWithProxy(txtUrl);
        if (text && text.length > 300) {
          try { localStorage.setItem(cacheKey, text.substring(0, 2000000)); } catch(e) {}
          // Update cover
          const archiveCover = 'https://archive.org/services/img/' + doc.identifier;
          const coverEl = document.querySelector('.book-header-cover, .book-header-cover-placeholder');
          if (coverEl) {
            const img = document.createElement('img');
            img.className = 'book-header-cover';
            img.src = archiveCover;
            img.alt = book.title;
            img.onerror = () => img.style.display = 'none';
            coverEl.replaceWith(img);
          }
          chapters = splitIntoChapters(text, book.title);
          hideLoader(); renderToc(); renderChapter(); return;
        }
      } catch(e) { continue; }
    }
  } catch(e) { console.warn('Archive search failed:', e.message); }

  hideLoader();
  showNoTextMessage();
}

function showNoTextMessage() {
  const isArabic = /[\u0600-\u06FF]/.test(book.title);
  chapters = [{
    title: isArabic ? 'غير متاح' : 'Not available',
    content: `<p class="chapter-intro">${book.desc || ''}</p>
      <p style="margin-top:16px">${isArabic ? 'هذا الكتاب غير متاح حالياً.' : 'This book is not available as free full text.'}</p>
      <p style="margin-top:12px">
        <button onclick="clearCacheAndReload()" style="padding:10px 20px;background:var(--accent);color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:600;margin-right:8px">🔄 Retry</button>
        <a href="https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title)}" target="_blank" style="color:var(--accent3)">Search Gutenberg</a>
      </p>`
  }];
  renderToc(); renderChapter();
}

// ===== SPLIT TEXT INTO CHAPTERS =====
function splitIntoChapters(rawText, title) {
  let text = rawText;
  const isArabic = /[\u0600-\u06FF]{10,}/.test(text.substring(0, 1000));

  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = text.replace(/\f/g, '\n\n'); // form feeds (Archive.org DjVu)
  text = text.replace(/\[.*?\]/g, ''); // remove [OCR notes]

  // For Arabic DjVu text — sentences ending with . or ؟ or ، followed by newline = paragraph break
  if (isArabic) {
    text = text.replace(/([.؟!])\n/g, '$1\n\n');
    text = text.replace(/\n([^\n])/g, '\n\n$1'); // every line break = paragraph
  }

  // Remove Gutenberg header/footer — multiple patterns
  // Pattern 1: standard *** START OF ... ***
  const startMatch = text.match(/\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG[^\n]*/i);
  if (startMatch) text = text.substring(startMatch.index + startMatch[0].length);

  // Pattern 2: if no *** marker, skip everything before "Produced by" or title line
  if (!startMatch) {
    // Skip the legal header block (first ~3000 chars if it contains Gutenberg boilerplate)
    const header = text.substring(0, 4000);
    if (/gutenberg|contact us|www\.gutenberg\.org|produced by|transcribed by/i.test(header)) {
      // Find first real paragraph — skip lines until we hit actual content
      const lines = text.split('\n');
      let contentStart = 0;
      let blankCount = 0;
      for (let i = 0; i < Math.min(lines.length, 80); i++) {
        const line = lines[i].trim();
        if (line === '') { blankCount++; }
        // After 3+ blank lines, next non-empty line is likely content
        if (blankCount >= 3 && line.length > 20 && !/gutenberg|contact|copyright|license|trademark|http|www\./i.test(line)) {
          contentStart = i;
          break;
        }
      }
      if (contentStart > 0) text = lines.slice(contentStart).join('\n');
    }
  }

  const endMatch = text.match(/\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG/i);
  if (endMatch) text = text.substring(0, endMatch.index);

  // Remove any remaining Gutenberg footer lines
  text = text.replace(/\n.*?End of (the )?Project Gutenberg.*$/gim, '');
  text = text.replace(/\n.*?www\.gutenberg\.org.*$/gim, '');
  text = text.replace(/\n.*?gutenberg\.net.*$/gim, '');

  text = text.trim();

  // Chapter patterns
  const patterns = isArabic ? [
    /\n[ \t]*(الفصل|الباب|الجزء|القسم|الحلقة)[ \t][\u0600-\u06FF\s\d]{1,40}\n/g,
    /\n[ \t]*[\u0660-\u0669\d]+[ \t]*[-–]\s*\n/g,
  ] : [
    /\n[ \t]*(CHAPTER|CHAPITRE|PARTIE|PART|BOOK|LIVRE|SECTION)[ \t]+([IVXLCDM]+|\d+|[A-Z]+)[^\n]{0,60}\n/gi,
    /\n[ \t]*([IVXLCDM]{1,6}\.?)[ \t]*\n/g,
    /\n[ \t]*(\d{1,3}\.)[ \t]*\n/g,
  ];

  let splits = [];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length >= 2) { splits = matches; break; }
  }

  if (splits.length >= 2) {
    const result = [];
    for (let i = 0; i < splits.length; i++) {
      const start = splits[i].index + splits[i][0].length;
      const end = i + 1 < splits.length ? splits[i + 1].index : text.length;
      const chTitle = splits[i][0].trim().replace(/\n+/g, ' ') || `${isArabic ? 'فصل' : 'Chapter'} ${i + 1}`;
      const content = text.substring(start, end).trim();
      if (content.length > 100) {
        result.push({ title: chTitle.substring(0, 80), content: formatTextToHTML(content, isArabic) });
      }
    }
    if (result.length >= 2) return result;
  }

  // Fallback: word chunks
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunkSize = isArabic ? 1500 : 2500;
  const result = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    result.push({
      title: isArabic ? `الجزء ${Math.floor(i / chunkSize) + 1}` : `Part ${Math.floor(i / chunkSize) + 1}`,
      content: formatTextToHTML(chunk, isArabic)
    });
  }
  return result.length ? result : [{ title, content: formatTextToHTML(text.substring(0, 100000), isArabic) }];
}

function formatTextToHTML(text, isArabic = false) {
  // Remove any HTML tags that might be in the raw text
  let clean = text.replace(/<[^>]+>/g, ' ');
  // Remove common OCR artifacts
  clean = clean.replace(/\[.*?\]/g, '');
  clean = clean.replace(/\{.*?\}/g, '');

  const normalized = clean
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([^\n])\n([^\n])/g, '$1 $2');

  const paras = normalized.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 15);
  const dir = isArabic ? ' dir="rtl" style="text-align:right;font-family:Arial,sans-serif"' : '';

  return paras.map((p, i) => {
    const safe = p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    if (i === 0 && safe.length < 300) return `<p class="chapter-intro"${dir}>${safe}</p>`;
    return `<p${dir}>${safe}</p>`;
  }).join('\n');
}

// ===== AI FALLBACK =====
async function loadWithAI() {
  const apiKey = (typeof HARDCODED_API_KEY !== 'undefined' && HARDCODED_API_KEY)
    ? HARDCODED_API_KEY
    : localStorage.getItem('gemini_api_key') || '';

  if (!apiKey) {
    chapters = [{ title: 'Non disponible', content: `<p class="chapter-intro">${book.desc || ''}</p><p>Ce livre n\'est pas disponible en texte intégral sur Project Gutenberg.</p>` }];
    renderToc(); renderChapter(); return;
  }

  showLoader('Generating book content with AI...');

  // Detect book language from title/author or lang field
  const bookLang = book.lang || detectBookLang(book);
  const langInstruction = bookLang === 'ar'
    ? 'اكتب النص باللغة العربية الفصحى.'
    : bookLang === 'fr'
    ? 'Écris le texte en français.'
    : bookLang === 'es'
    ? 'Escribe el texto en español.'
    : 'Write the text in English.';

  try {
    const tocRes = await callGroqReader(
      `${langInstruction} List the chapters of the book "${book.title}" by ${book.author}. Reply ONLY with this JSON: {"chapters":["Title 1","Title 2",...]} Maximum 8 chapters.`,
      apiKey, 400
    );
    let titles = ['Chapter I','Chapter II','Chapter III','Chapter IV','Chapter V'];
    try { titles = JSON.parse(tocRes.match(/\{[\s\S]*?\}/)[0]).chapters; } catch(e) {}

    const result = [];
    for (let i = 0; i < Math.min(titles.length, 6); i++) {
      setLoaderMsg(`Generating chapter ${i+1}/${titles.length}...`);
      const text = await callGroqReader(
        `${langInstruction} For the book "${book.title}" by ${book.author}, write the full detailed content of the chapter "${titles[i]}". Minimum 800 words. Style faithful to the author. Start directly with the text, no introduction.`,
        apiKey, 1500
      );
      const paras = text.split(/\n\n+/).filter(p => p.trim().length > 30);
      result.push({
        title: titles[i],
        content: paras.map((p,i) => i===0 ? `<p class="chapter-intro">${p}</p>` : `<p>${p}</p>`).join('\n')
      });
    }
    chapters = result;
    try { localStorage.setItem('fulltext_' + (book.gutId ? 'g' + book.gutId : 'b' + bookId + '_' + book.title.substring(0,20).replace(/\s+/g,'_')), JSON.stringify(chapters)); } catch(e) {}
  } catch(e) {
    chapters = [{ title: book.title, content: `<p>${book.desc}</p>` }];
  }

  hideLoader(); renderToc(); renderChapter();
}

function detectBookLang(book) {
  // Detect Arabic by checking if title contains Arabic characters
  if (/[\u0600-\u06FF]/.test(book.title + book.author)) return 'ar';
  if (book.lang) return book.lang;
  // French authors
  const frAuthors = ['Hugo','Zola','Flaubert','Camus','Proust','Balzac','Stendhal','Voltaire','Baudelaire','Molière'];
  if (frAuthors.some(a => book.author.includes(a))) return 'fr';
  return 'en';
}

async function callGroqReader(prompt, apiKey, maxTokens) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: maxTokens })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

// ===== LOADER =====
function showLoader(msg) {
  document.getElementById('chapter-nav-top').style.display = 'none';
  document.getElementById('chapter-title').textContent = '';
  document.getElementById('book-text').innerHTML = '';
  let loader = document.getElementById('reader-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'reader-loader';
    loader.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:20px;text-align:center;padding:40px';
    loader.innerHTML = `<div style="width:52px;height:52px;border:4px solid rgba(167,139,250,.2);border-top-color:#a78bfa;border-radius:50%;animation:spin .8s linear infinite"></div><p id="loader-msg" style="color:#eeeeff;font-size:1rem;font-weight:500"></p><p style="color:#8b8fa8;font-size:.82rem">Le texte est mis en cache après le premier chargement</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    document.getElementById('reader-container').prepend(loader);
  }
  document.getElementById('loader-msg').textContent = msg;
}

function setLoaderMsg(msg) {
  const el = document.getElementById('loader-msg');
  if (el) el.textContent = msg;
}

function hideLoader() {
  const loader = document.getElementById('reader-loader');
  if (loader) loader.remove();
  document.getElementById('chapter-nav-top').style.display = '';
}

// ===== RENDER =====
function renderTopbar() {
  document.getElementById('topbar-title').textContent = book.title;
  document.getElementById('topbar-author').textContent = book.author;
}

function renderBookHeader() {
  const el = document.getElementById('book-header-section');

  // Build cover HTML — try multiple sources
  let coverHTML = '';
  if (book.cover) {
    coverHTML = `<img class="book-header-cover" src="${book.cover}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      alt="${book.title}">
      <div class="book-header-cover-placeholder" style="background:#1c1b35;display:none"><span>📖</span></div>`;
  } else if (book.isbn) {
    coverHTML = `<img class="book-header-cover"
      src="https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg"
      onerror="this.src='https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex'}"
      alt="${book.title}">
      <div class="book-header-cover-placeholder" style="background:#1c1b35;display:none"><span>📖</span></div>`;
  } else {
    // No cover — try Google Books async
    coverHTML = `<div class="book-header-cover-placeholder" id="reader-cover-placeholder" style="background:#1c1b35"><span>📖</span></div>`;
    // Async load
    const q = encodeURIComponent(book.title + ' ' + book.author);
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`)
      .then(r => r.json())
      .then(data => {
        const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (thumb) {
          const url = thumb.replace('http://', 'https://').replace('zoom=1', 'zoom=3');
          const ph = document.getElementById('reader-cover-placeholder');
          if (ph) ph.outerHTML = `<img class="book-header-cover" src="${url}" alt="${book.title}" onerror="this.style.display='none'">`;
        }
      }).catch(() => {});
  }

  el.innerHTML = `
    ${coverHTML}
    <div class="book-header-info">
      <h1>${book.title}</h1>
      <div class="book-author">${book.author}</div>
      <div class="book-meta">
        ${book.year ? `<span class="book-meta-tag">📅 ${book.year}</span>` : ''}
        ${book.lang ? `<span class="book-meta-tag">🌐 ${book.lang.toUpperCase()}</span>` : ''}
        ${book.gutId ? `<span class="book-meta-tag">✅ Full text</span>` : ''}
        ${book.downloadCount ? `<span class="book-meta-tag">⬇️ ${(book.downloadCount/1000).toFixed(0)}k downloads</span>` : ''}
      </div>
      ${book.desc ? `<div class="book-desc">${book.desc.substring(0, 300)}${book.desc.length > 300 ? '...' : ''}</div>` : ''}
    </div>`;
  document.getElementById('topbar-title').textContent = book.title;
  document.getElementById('topbar-author').textContent = book.author;
}

function renderToc() {
  const list = document.getElementById('toc-list');
  list.innerHTML = chapters.map((ch, i) => `
    <div class="toc-item ${i === currentChapter ? 'active' : ''}" onclick="goToChapter(${i})">
      <span class="toc-num">${i + 1}.</span>${ch.title}
    </div>`).join('');
  // Update chapter count in header
  const tag = document.querySelector('.book-meta-tag');
  if (tag && book.gutId) {
    const countTag = document.createElement('span');
    countTag.className = 'book-meta-tag';
    countTag.textContent = `📖 ${chapters.length} chapitres`;
    tag.parentElement.appendChild(countTag);
  }
}

function renderChapter() {
  const ch = chapters[currentChapter];
  if (!ch) return;
  document.getElementById('chapter-title').textContent = ch.title;
  document.getElementById('book-text').innerHTML = ch.content;
  document.getElementById('chapter-counter').textContent = `${currentChapter + 1} / ${chapters.length}`;
  document.getElementById('prev-btn').disabled = currentChapter === 0;
  document.getElementById('next-btn').disabled = currentChapter === chapters.length - 1;
  checkBookmark();
  saveProgress();
  updateReadingTime();

  // Restore scroll position if returning to same chapter
  const id = book.gutId ? 'g' + book.gutId : 'b' + bookId;
  const saved = JSON.parse(localStorage.getItem('scroll_' + id) || 'null');
  if (saved && saved.chapter === currentChapter && saved.scrollPct > 0) {
    // Wait for content to render then scroll
    requestAnimationFrame(() => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      window.scrollTo({ top: saved.scrollPct * maxScroll, behavior: 'instant' });
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.toc-item').forEach((el, i) => el.classList.toggle('active', i === currentChapter));
}

function onScroll() {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  const pagePct = total > 0 ? (scrolled / total) : 0;

  // Progress bar
  document.getElementById('reading-progress-bar').style.width = (pagePct * 100) + '%';

  // Calculate overall book progress:
  // Each chapter = equal slice of 100%. Within chapter, use scroll position.
  const total_chapters = chapters.length;
  if (total_chapters <= 1) {
    const pct = Math.round(pagePct * 100);
    updateProgress(pct);
  } else {
    const chapterSlice = 1 / total_chapters;
    const basePct = currentChapter / total_chapters;
    const withinChapter = pagePct * chapterSlice;
    const pct = Math.round((basePct + withinChapter) * 100);
    updateProgress(Math.min(100, pct));
  }
}

function updateProgress(pct) {
  const s = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!s) return;
  const key = 'reading_history_' + s.email;
  const hist = JSON.parse(localStorage.getItem(key) || '{}');
  const id = book.gutId ? 'g' + book.gutId : 'b' + bookId;
  if (!hist[id]) return;
  // Only update if progress increased
  if (pct > (hist[id].progress || 0)) {
    hist[id].progress = pct;
    hist[id].lastRead = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(hist));
  }
  // Save scroll position
  const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
  localStorage.setItem('scroll_' + id, JSON.stringify({ chapter: currentChapter, scrollPct }));
}

// ===== NAVIGATION =====
function prevChapter() { if (currentChapter > 0) { currentChapter--; renderChapter(); } }
function nextChapter() { if (currentChapter < chapters.length - 1) { currentChapter++; renderChapter(); } }
function goToChapter(i) { currentChapter = i; renderChapter(); toggleToc(); }
function goBack() {
  // Always works — even during loading
  window.location.href = 'index.html?page=library';
}

// ===== FOCUS MODE =====
let focusMode = false;
function toggleFocusMode() {
  focusMode = !focusMode;
  document.getElementById('reader-app').classList.toggle('focus-mode', focusMode);
  const btn = document.getElementById('focus-btn');
  btn.classList.toggle('active', focusMode);
  btn.querySelector('i').className = focusMode ? 'fas fa-compress' : 'fas fa-expand';
  showToast(focusMode ? '🎯 Mode focus activé' : 'Mode focus désactivé');
}

// ===== READING TIME =====
function updateReadingTime() {
  if (!chapters.length) return;
  const remaining = chapters.slice(currentChapter);
  const words = remaining.reduce((sum, ch) => sum + (ch.content.replace(/<[^>]+>/g,'').split(/\s+/).length), 0);
  const minutes = Math.ceil(words / 200); // avg 200 wpm
  const el = document.getElementById('reading-time');
  if (el) el.textContent = minutes < 60 ? `~${minutes} min` : `~${Math.round(minutes/60)}h`;
}

// ===== DICTIONARY =====
let dictTimeout;
document.addEventListener('mouseup', async () => {
  const sel = window.getSelection();
  const word = sel?.toString().trim();
  if (!word || word.length < 2 || word.length > 30 || word.includes(' ')) {
    hideDictTooltip(); return;
  }
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  clearTimeout(dictTimeout);
  dictTimeout = setTimeout(() => showDictTooltip(word, rect), 600);
});

document.addEventListener('mousedown', hideDictTooltip);

async function showDictTooltip(word, rect) {
  const tooltip = document.getElementById('dict-tooltip');
  if (!tooltip) return;
  tooltip.innerHTML = `<strong>${word}</strong><span style="color:var(--text3)">Chargement...</span>`;
  tooltip.classList.add('show');
  tooltip.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
  tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const data = await res.json();
    const def = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
    const partOfSpeech = data[0]?.meanings?.[0]?.partOfSpeech || '';
    if (def) {
      tooltip.innerHTML = `<strong>${word}</strong> <em style="color:var(--text3);font-size:.75rem">${partOfSpeech}</em><br>${def.substring(0, 120)}`;
    } else {
      hideDictTooltip();
    }
  } catch(e) { hideDictTooltip(); }
}

function hideDictTooltip() {
  const t = document.getElementById('dict-tooltip');
  if (t) t.classList.remove('show');
}

// ===== SETTINGS =====
function toggleSettings() {
  settingsOpen = !settingsOpen;
  document.getElementById('settings-panel').classList.toggle('open', settingsOpen);
  if (tocOpen) toggleToc();
}
function toggleToc() {
  tocOpen = !tocOpen;
  document.getElementById('toc-panel').classList.toggle('open', tocOpen);
  document.getElementById('toc-overlay').classList.toggle('open', tocOpen);
  if (settingsOpen) toggleSettings();
}
function changeFontSize(d) {
  fontSize = Math.max(14, Math.min(28, fontSize + d));
  document.getElementById('font-size-val').textContent = fontSize;
  document.getElementById('book-text').style.fontSize = fontSize + 'px';
  savePrefs();
}
function changeLineHeight(d) {
  lineHeight = Math.max(1.4, Math.min(2.5, Math.round((lineHeight + d) * 10) / 10));
  document.getElementById('line-height-val').textContent = lineHeight;
  document.getElementById('book-text').style.lineHeight = lineHeight;
  savePrefs();
}
function changeWidth(d) {
  maxWidth = Math.max(400, Math.min(960, maxWidth + d));
  document.getElementById('reader-container').style.maxWidth = maxWidth + 'px';
  savePrefs();
}
function setTheme(theme, save = true) {
  document.getElementById('reader-app').className = 'theme-' + theme;
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + theme);
  if (btn) btn.classList.add('active');
  if (save) savePrefs({ theme });
}
function setFont(font) {
  currentFont = font;
  document.getElementById('book-text').style.fontFamily = font + ', Georgia, serif';
  ['lora','inter','georgia'].forEach(f => document.getElementById('btn-'+f)?.classList.remove('active'));
  document.getElementById('btn-' + font.toLowerCase())?.classList.add('active');
  savePrefs();
}
function loadPrefs() {
  const p = JSON.parse(localStorage.getItem('reader_prefs') || '{}');
  if (p.fontSize) fontSize = p.fontSize;
  if (p.lineHeight) lineHeight = p.lineHeight;
  if (p.maxWidth) maxWidth = p.maxWidth;
  if (p.font) currentFont = p.font;
  if (p.theme) setTheme(p.theme, false);
  document.getElementById('font-size-val').textContent = fontSize;
  document.getElementById('line-height-val').textContent = lineHeight;
  document.getElementById('book-text').style.fontSize = fontSize + 'px';
  document.getElementById('book-text').style.lineHeight = lineHeight;
  document.getElementById('reader-container').style.maxWidth = maxWidth + 'px';
  document.getElementById('book-text').style.fontFamily = currentFont + ', Georgia, serif';
}
function savePrefs(extra = {}) {
  const p = JSON.parse(localStorage.getItem('reader_prefs') || '{}');
  Object.assign(p, { fontSize, lineHeight, maxWidth, font: currentFont }, extra);
  localStorage.setItem('reader_prefs', JSON.stringify(p));
}

// ===== BOOKMARKS =====
function getBookmarks() {
  const s = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!s) return {};
  return JSON.parse(localStorage.getItem('bookmarks_' + s.email) || '{}');
}
function saveBookmarks(bm) {
  const s = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!s) return;
  localStorage.setItem('bookmarks_' + s.email, JSON.stringify(bm));
}
function toggleBookmark() {
  const bm = getBookmarks();
  const key = (book.gutId || bookId) + '_' + currentChapter;
  if (bm[key]) {
    delete bm[key];
    showToast('Marque-page supprimé');
    updateBookmarkBtn(false);
  } else {
    bm[key] = { bookId: book.gutId || bookId, chapter: currentChapter, chapterTitle: chapters[currentChapter]?.title || '', date: new Date().toISOString() };
    showToast('📌 Marque-page ajouté !');
    updateBookmarkBtn(true);
  }
  saveBookmarks(bm);
}
function updateBookmarkBtn(active) {
  const btn = document.getElementById('bookmark-btn');
  const icon = document.getElementById('bookmark-icon');
  if (active) { btn.classList.add('bookmarked'); icon.className = 'fas fa-bookmark'; }
  else { btn.classList.remove('bookmarked'); icon.className = 'far fa-bookmark'; }
}
function checkBookmark() {
  const bm = getBookmarks();
  updateBookmarkBtn(!!bm[(book.gutId || bookId) + '_' + currentChapter]);
}

// ===== HISTORY =====
function addToHistory() {
  const s = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!s) return;
  const key = 'reading_history_' + s.email;
  const hist = JSON.parse(localStorage.getItem(key) || '{}');
  const id = book.gutId ? 'g' + book.gutId : 'b' + bookId;
  // Get local book data for cover/emoji/color
  const localBook = (typeof BOOKS !== 'undefined') ? BOOKS.find(b => b.id === parseInt(bookId)) : null;
  // Update reading streak
  const streakKey = 'reading_streak_' + s.email;
  const streakData = JSON.parse(localStorage.getItem(streakKey) || '{"streak":0,"lastDate":""}');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (streakData.lastDate !== today) {
    streakData.streak = streakData.lastDate === yesterday ? streakData.streak + 1 : 1;
    streakData.lastDate = today;
    localStorage.setItem(streakKey, JSON.stringify(streakData));
  }

  hist[id] = {
    bookId: id,
    title: book.title,
    author: book.author,
    cover: book.cover || (localBook?.isbn ? `https://covers.openlibrary.org/b/isbn/${localBook.isbn}-M.jpg` : null),
    isbn: localBook?.isbn || null,
    emoji: localBook?.emoji || '📖',
    color: localBook?.color || '#1c1b35',
    chapter: currentChapter,
    lastRead: new Date().toISOString(),
    progress: 0
  };
  localStorage.setItem(key, JSON.stringify(hist));
}

function saveProgress() {
  const s = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!s) return;
  const key = 'reading_history_' + s.email;
  const hist = JSON.parse(localStorage.getItem(key) || '{}');
  const id = book.gutId ? 'g' + book.gutId : 'b' + bookId;
  if (!hist[id]) return;
  const total = chapters.length;
  // Calculate progress based on chapter position
  const pct = total <= 1 ? 0 : Math.round((currentChapter / (total - 1)) * 100);
  hist[id].chapter = currentChapter;
  hist[id].totalChapters = total;
  // Only increase progress, never decrease
  if (pct > (hist[id].progress || 0)) {
    hist[id].progress = pct;
  }
  // Mark 100% if on last chapter
  if (currentChapter === total - 1) {
    hist[id].progress = 100;
  }
  hist[id].lastRead = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(hist));
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('reader-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showError(msg) {
  document.getElementById('book-text').innerHTML = `<p style="color:#f87171">${msg}</p>`;
}

function clearCacheAndReload() {
  // Clear all fulltext caches
  Object.keys(localStorage).filter(k => k.startsWith('fulltext_')).forEach(k => localStorage.removeItem(k));
  window.location.reload();
}
