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
async function fetchWithProxy(targetUrl, timeoutMs = 8000) {
  // Try direct first (Gutenberg supports CORS on most browsers)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000); // Reduced from 8s to 5s
    const res = await fetch(targetUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const text = await res.text();
      if (text.length > 200) return text;
    }
  } catch(e) {}

  // Try 3 best proxies in parallel — fastest wins
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
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
let quickTimeout, globalTimeout; // Make timeouts accessible globally

async function loadFullText() {
  console.log('loadFullText called for book:', { bookId, gutId: book.gutId, title: book.title });
  
  // Build a unique cache key using both gutId AND bookId AND title
  const cacheKey = 'fulltext_' + (book.gutId ? 'g' + book.gutId : 'b' + bookId + '_' + book.title.substring(0, 20).replace(/\s+/g, '_'));
  const cached = localStorage.getItem(cacheKey);

  // 1. Instant: pre-downloaded texts
  if (typeof BOOK_TEXTS !== 'undefined' && BOOK_TEXTS[bookId]) {
    console.log('Loading from BOOK_TEXTS');
    chapters = splitIntoChapters(BOOK_TEXTS[bookId], book.title);
    renderToc(); renderChapter(); return;
  }

  // 2. Instant: localStorage cache
  if (cached) {
    console.log('Loading from localStorage cache');
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

  console.log('Showing loader, starting download...');
  showLoader('📖 Loading book...');

  // Quick fallback - if nothing loads in 5 seconds, show a message
  quickTimeout = setTimeout(() => {
    console.warn('Quick timeout reached (5s), showing fallback message');
    if (chapters.length === 0) {
      hideLoader();
      chapters = [{
        title: 'Chargement en cours...',
        content: `<p class="chapter-intro">${book.desc || ''}</p>
          <p style="margin-top:16px;color:var(--text2)">Le livre est en cours de téléchargement. Cela peut prendre quelques secondes...</p>
          <p style="margin-top:12px">
            <button onclick="location.reload()" style="padding:10px 20px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">🔄 Recharger la page</button>
          </p>`
      }];
      renderToc(); renderChapter();
    }
  }, 5000);

  // Global timeout — reduced to 30s, auto-retry once
  let retryCount = 0;
  globalTimeout = setTimeout(async () => {
    clearTimeout(quickTimeout);
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
  }, 30000); // Reduced from 60s to 30s

  try {
    // 3. Fast: check GitHub CDN first (pre-downloaded books)
    if (book.gutId) {
      console.log('Trying GitHub CDN for gutId:', book.gutId);
      setLoaderMsg('📖 Loading from CDN...');
      const cdnText = await fetchFromCDN(book.gutId);
      if (cdnText) {
        console.log('CDN success, text length:', cdnText.length);
        try { localStorage.setItem(cacheKey, cdnText.substring(0, 2000000)); } catch(e) {}
        chapters = splitIntoChapters(cdnText, book.title);
        clearTimeout(quickTimeout);
        clearTimeout(globalTimeout);
        hideLoader(); renderToc(); renderChapter(); return;
      } else {
        console.log('CDN failed, trying server cache...');
      }
    }

    // 4. Check server cache (already downloaded) - with shorter timeout
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 2000); // Reduced from 3s to 2s
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
          const text = await fetchWithProxy(u, 12000); // Reduced from 20s to 12s
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
  console.log('renderChapter called:', { 
    currentChapter, 
    totalChapters: chapters.length, 
    hasChapter: !!chapters[currentChapter] 
  });
  
  const ch = chapters[currentChapter];
  if (!ch) {
    console.error('No chapter found at index:', currentChapter);
    return;
  }
  
  console.log('Rendering chapter:', ch.title, 'Content length:', ch.content?.length);
  
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


// ===== ANNOTATIONS SYSTEM =====
let annotations = {};
let selectedText = '';
let selectedRange = null;

// Load annotations for current book
function loadAnnotations() {
  const bookKey = book.gutId ? 'g' + book.gutId : 'b' + bookId;
  const session = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!session) return;
  
  const key = 'annotations_' + session.email + '_' + bookKey;
  annotations = JSON.parse(localStorage.getItem(key) || '{}');
  applyAnnotations();
}

// Save annotations
function saveAnnotations() {
  const bookKey = book.gutId ? 'g' + book.gutId : 'b' + bookId;
  const session = JSON.parse(localStorage.getItem('biblio_session') || 'null');
  if (!session) return;
  
  const key = 'annotations_' + session.email + '_' + bookKey;
  localStorage.setItem(key, JSON.stringify(annotations));
}

// Apply highlights to text
function applyAnnotations() {
  const chapterKey = 'ch' + currentChapter;
  if (!annotations[chapterKey]) return;
  
  const textEl = document.getElementById('book-text');
  if (!textEl) return;
  
  const paras = textEl.querySelectorAll('p');
  
  // Get all annotations for this chapter
  const anns = Object.entries(annotations[chapterKey]);
  if (anns.length === 0) return;
  
  // Sort by position (forward order)
  const sorted = anns.sort((a, b) => a[1].start - b[1].start);
  
  let charCount = 0;
  
  for (let p of paras) {
    const pText = p.textContent;
    const pStart = charCount;
    const pEnd = charCount + pText.length;
    
    // Find annotations in this paragraph
    const annsInPara = sorted.filter(([id, ann]) => 
      ann.start >= pStart && ann.end <= pEnd
    );
    
    if (annsInPara.length > 0) {
      // Build HTML with highlights - process in reverse to maintain positions
      let html = pText;
      const reversedAnns = [...annsInPara].reverse();
      
      reversedAnns.forEach(([id, ann]) => {
        const localStart = ann.start - pStart;
        const localEnd = ann.end - pStart;
        const text = html.substring(localStart, localEnd);
        
        const color = ann.color || 'yellow';
        const hasNote = ann.note ? 'true' : 'false';
        const noteTitle = ann.note ? ann.note.replace(/"/g, '&quot;') : 'Cliquez pour modifier';
        
        // Escape the text for HTML
        const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Create highlight span with modern styling
        const highlight = `<mark class="highlight" data-id="${id}" data-color="${color}" data-has-note="${hasNote}" onclick="showAnnotationMenu('${id}')" title="${noteTitle}">${escapedText}</mark>`;
        
        // Replace in HTML
        const before = html.substring(0, localStart);
        const after = html.substring(localEnd);
        html = before + highlight + after;
      });
      
      p.innerHTML = html;
    }
    
    charCount += pText.length + 1; // +1 for paragraph break
  }
  
  // Update bookmark button
  checkBookmark();
}

// ===== ANNOTATION MODE =====
let annotationMode = false;
// selectedText and selectedRange already declared above in ANNOTATIONS SYSTEM section

function toggleAnnotationMode() {
  annotationMode = !annotationMode;
  const btn = document.getElementById('toggle-annotation-btn');
  const textEl = document.getElementById('book-text');
  
  if (!textEl) {
    console.error('book-text element not found');
    return;
  }
  
  if (annotationMode) {
    btn.innerHTML = '<i class="fas fa-highlighter"></i>';
    btn.style.background = 'var(--accent)';
    btn.style.color = '#fff';
    textEl.style.userSelect = 'text';
    textEl.style.webkitUserSelect = 'text';
    showToast('✨ Mode annotation activé - Sélectionnez du texte');
  } else {
    btn.innerHTML = '<i class="fas fa-highlighter"></i>';
    btn.style.background = '';
    btn.style.color = '';
    textEl.style.userSelect = 'auto';
    textEl.style.webkitUserSelect = 'auto';
    hideHighlightMenu();
    window.getSelection().removeAllRanges();
  }
}

// Initialize text as selectable on load
window.addEventListener('DOMContentLoaded', () => {
  const textEl = document.getElementById('book-text');
  if (textEl) {
    textEl.style.userSelect = 'auto';
    textEl.style.webkitUserSelect = 'auto';
  }
});

// Text selection handler - only works in annotation mode
document.addEventListener('mouseup', handleTextSelection);

// ===== MOBILE: TAP ON SENTENCE =====
let touchStartX = 0, touchStartY = 0, touchMoved = false;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchMoved = false;
}, { passive: true });

document.addEventListener('touchmove', () => {
  touchMoved = true;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!annotationMode) return;
  if (touchMoved) return; // Was a scroll, not a tap
  if (e.target.closest('button') || e.target.closest('.highlight-menu') || e.target.closest('.annotation-menu')) return;

  const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  if (dx > 10 || dy > 10) return; // Moved too much = scroll

  const target = e.target;
  // Only trigger on text inside book-text
  if (!target.closest('#book-text')) return;

  e.preventDefault();

  // Get the tapped paragraph
  const para = target.closest('p');
  if (!para) return;

  // Get the sentence around the tap point
  const sentence = getSentenceAtTouch(para, e.changedTouches[0]);
  if (!sentence || sentence.text.length < 3) return;

  selectedText = sentence.text;
  selectedRange = null; // Mobile doesn't use range

  // Show menu at tap position
  showHighlightMenu({
    clientX: e.changedTouches[0].clientX,
    clientY: e.changedTouches[0].clientY
  });
}, { passive: false });

// Get the sentence closest to the touch point within a paragraph
function getSentenceAtTouch(para, touch) {
  const text = para.textContent;
  if (!text.trim()) return null;

  // Split into sentences
  const sentenceRegex = /[^.!?؟،\n]+[.!?؟،]?/g;
  const sentences = [];
  let match;
  while ((match = sentenceRegex.exec(text)) !== null) {
    const s = match[0].trim();
    if (s.length > 3) sentences.push(s);
  }

  if (sentences.length === 0) return { text: text.trim() };

  // Find which sentence was tapped using a Range
  try {
    const range = document.caretRangeFromPoint
      ? document.caretRangeFromPoint(touch.clientX, touch.clientY)
      : document.caretPositionFromPoint
        ? (() => {
            const pos = document.caretPositionFromPoint(touch.clientX, touch.clientY);
            const r = document.createRange();
            r.setStart(pos.offsetNode, pos.offset);
            r.collapse(true);
            return r;
          })()
        : null;

    if (!range) return { text: sentences[0] };

    const offset = range.startOffset;
    const nodeText = range.startContainer.textContent || '';

    // Find position in full paragraph text
    let charPos = 0;
    const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node === range.startContainer) {
        charPos += offset;
        break;
      }
      charPos += node.textContent.length;
    }

    // Find which sentence contains this position
    let pos = 0;
    for (const s of sentences) {
      const idx = text.indexOf(s, pos);
      if (idx !== -1 && charPos >= idx && charPos <= idx + s.length) {
        return { text: s.trim() };
      }
      pos = idx + s.length;
    }

    // Fallback: return closest sentence
    return { text: sentences[Math.floor(sentences.length / 2)] };
  } catch(e) {
    return { text: sentences[0] };
  }
}

function handleTextSelection(e) {
  // Only handle selection in annotation mode (desktop)
  if (!annotationMode) return;
  if (e.target.closest('button') || e.target.closest('.highlight-menu')) return;
  
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0 && text.length < 500) {
    selectedText = text;
    selectedRange = selection.getRangeAt(0);
    showHighlightMenu(e);
  } else {
    hideHighlightMenu();
  }
}

// Show highlight menu
function showHighlightMenu(e) {
  let menu = document.getElementById('highlight-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'highlight-menu';
    menu.className = 'highlight-menu';
    menu.innerHTML = `
      <button onclick="highlightText('yellow'); event.stopPropagation();" style="background:#ffeb3b" title="Jaune">🟡</button>
      <button onclick="highlightText('green'); event.stopPropagation();" style="background:#4caf50" title="Vert">🟢</button>
      <button onclick="highlightText('pink'); event.stopPropagation();" style="background:#f472b6" title="Rose">🔴</button>
      <button onclick="highlightText('blue'); event.stopPropagation();" style="background:#2196f3" title="Bleu">🔵</button>
      <button onclick="addNote(); event.stopPropagation();" title="Ajouter une note">📝</button>
      <button onclick="addBookmark(); event.stopPropagation();" title="Marque-page">🔖</button>
      <button onclick="hideHighlightMenu(); event.stopPropagation();" style="background:#f87171" title="Fermer">✕</button>
    `;
    document.body.appendChild(menu);
  }
  
  // Better positioning for mobile and desktop
  const x = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || window.innerWidth / 2;
  const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 100;
  
  // Keep menu on screen
  const menuWidth = 280;
  const menuHeight = 50;
  let left = Math.min(x - menuWidth / 2, window.innerWidth - menuWidth - 10);
  left = Math.max(10, left);
  let top = y - menuHeight - 10;
  if (top < 10) top = y + 20;
  
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.style.display = 'flex';
  
  // Auto-hide after 10 seconds
  clearTimeout(menu.hideTimeout);
  menu.hideTimeout = setTimeout(() => hideHighlightMenu(), 10000);
}

function hideHighlightMenu() {
  const menu = document.getElementById('highlight-menu');
  if (menu) {
    menu.style.display = 'none';
    clearTimeout(menu.hideTimeout);
  }
}

// Highlight text
function highlightText(color) {
  if (!selectedText) return;
  
  const chapterKey = 'ch' + currentChapter;
  if (!annotations[chapterKey]) annotations[chapterKey] = {};
  
  const textEl = document.getElementById('book-text');
  const fullText = textEl.textContent;
  
  // Find the text — use indexOf for mobile (no range), or range position for desktop
  let start = -1;
  if (selectedRange) {
    // Desktop: use range to get accurate position
    const preRange = document.createRange();
    preRange.selectNodeContents(textEl);
    preRange.setEnd(selectedRange.startContainer, selectedRange.startOffset);
    start = preRange.toString().length;
  } else {
    // Mobile: find by text content
    start = fullText.indexOf(selectedText);
  }
  
  if (start === -1) {
    showToast('❌ Texte introuvable');
    return;
  }
  
  const id = 'ann_' + Date.now();
  annotations[chapterKey][id] = {
    text: selectedText,
    color,
    start,
    end: start + selectedText.length,
    date: Date.now()
  };
  
  saveAnnotations();
  hideHighlightMenu();
  if (selectedRange) window.getSelection().removeAllRanges();
  selectedText = '';
  selectedRange = null;
  
  renderChapter();
  showToast('✨ Surligné !');
}

// Add note to selection
function addNote() {
  if (!selectedText) return;
  hideHighlightMenu();
  showNoteModal(selectedText, null, (note) => {
    if (!note) return;
    const chapterKey = 'ch' + currentChapter;
    if (!annotations[chapterKey]) annotations[chapterKey] = {};
    const textEl = document.getElementById('book-text');
    const fullText = textEl.textContent;
    let start = -1;
    if (selectedRange) {
      const preRange = document.createRange();
      preRange.selectNodeContents(textEl);
      preRange.setEnd(selectedRange.startContainer, selectedRange.startOffset);
      start = preRange.toString().length;
    } else {
      start = fullText.indexOf(selectedText);
    }
    if (start === -1) return;
    const id = 'ann_' + Date.now();
    annotations[chapterKey][id] = {
      text: selectedText, color: 'yellow', note,
      start, end: start + selectedText.length, date: Date.now()
    };
    saveAnnotations();
    if (selectedRange) window.getSelection().removeAllRanges();
    selectedText = ''; selectedRange = null;
    renderChapter();
    showToast('📝 Note ajoutée !');
  });
}

// ===== CUSTOM NOTE MODAL =====
function showNoteModal(text, existingNote, callback) {
  // Remove any existing modal
  document.getElementById('note-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'note-modal';
  modal.innerHTML = `
    <div class="note-modal-backdrop"></div>
    <div class="note-modal-box">
      <div class="note-modal-header">
        <span>📝 Ajouter une note</span>
        <button class="note-modal-close" onclick="document.getElementById('note-modal').remove()">✕</button>
      </div>
      <div class="note-modal-quote">"${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"</div>
      <textarea class="note-modal-input" id="note-modal-input" placeholder="Écris ta note ici..." rows="4">${existingNote || ''}</textarea>
      <div class="note-modal-actions">
        <button class="note-modal-cancel" onclick="document.getElementById('note-modal').remove()">Annuler</button>
        <button class="note-modal-save" onclick="
          const val = document.getElementById('note-modal-input').value.trim();
          document.getElementById('note-modal').remove();
          window._noteModalCb(val);
        ">💾 Sauvegarder</button>
      </div>
    </div>
  `;
  window._noteModalCb = callback;
  document.body.appendChild(modal);

  // Focus textarea
  setTimeout(() => document.getElementById('note-modal-input')?.focus(), 100);

  // Close on backdrop click
  modal.querySelector('.note-modal-backdrop').addEventListener('click', () => {
    modal.remove();
  });
}

// Show annotation menu (edit/delete)
function showAnnotationMenu(id) {
  const chapterKey = 'ch' + currentChapter;
  const ann = annotations[chapterKey]?.[id];
  if (!ann) return;

  // Remove existing menus
  document.querySelectorAll('.annotation-menu').forEach(m => m.remove());

  const colorMap = { yellow: '#fbbf24', green: '#4ade80', pink: '#f472b6', blue: '#60a5fa' };
  const colorDot = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colorMap[ann.color]||'#fbbf24'};margin-right:6px"></span>`;

  const menu = document.createElement('div');
  menu.className = 'annotation-menu';
  menu.innerHTML = `
    <div class="ann-ctx-menu">
      <div class="ann-ctx-text">${colorDot}"${ann.text.substring(0, 55)}${ann.text.length > 55 ? '...' : ''}"</div>
      ${ann.note ? `<div class="ann-ctx-note">📝 ${ann.note}</div>` : ''}
      <div class="ann-ctx-colors">
        <button onclick="changeHighlightColor('${id}','yellow')" class="ann-color-btn" style="background:#fbbf24" title="Jaune"></button>
        <button onclick="changeHighlightColor('${id}','green')" class="ann-color-btn" style="background:#4ade80" title="Vert"></button>
        <button onclick="changeHighlightColor('${id}','pink')" class="ann-color-btn" style="background:#f472b6" title="Rose"></button>
        <button onclick="changeHighlightColor('${id}','blue')" class="ann-color-btn" style="background:#60a5fa" title="Bleu"></button>
      </div>
      <div class="ann-ctx-actions">
        <button onclick="editAnnotationNote('${id}')" class="ann-ctx-btn ann-ctx-edit">✏️ Note</button>
        <button onclick="deleteAnnotation('${id}')" class="ann-ctx-btn ann-ctx-delete">🗑️ Supprimer</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // Position near the highlight
  const highlight = document.querySelector(`[data-id="${id}"]`);
  if (highlight) {
    const rect = highlight.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    // Keep on screen
    if (left + 260 > window.innerWidth) left = window.innerWidth - 270;
    if (left < 8) left = 8;
    if (top + 180 > window.innerHeight) top = rect.top - 188;
    menu.style.cssText = `position:fixed;top:${top}px;left:${left}px;z-index:10001`;
  }

  // Close on outside click/tap
  setTimeout(() => {
    const close = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', close);
        document.removeEventListener('touchend', close);
      }
    };
    document.addEventListener('click', close);
    document.addEventListener('touchend', close);
  }, 100);
}

function changeHighlightColor(id, color) {
  const chapterKey = 'ch' + currentChapter;
  if (!annotations[chapterKey]?.[id]) return;
  annotations[chapterKey][id].color = color;
  saveAnnotations();
  document.querySelectorAll('.annotation-menu').forEach(m => m.remove());
  renderChapter();
}
      }
    });
  }, 100);
}

function editAnnotationNote(id) {
  const chapterKey = 'ch' + currentChapter;
  const ann = annotations[chapterKey][id];
  if (!ann) return;
  document.querySelectorAll('.annotation-menu').forEach(m => m.remove());
  showNoteModal(ann.text, ann.note || '', (newNote) => {
    if (newNote === null) return;
    ann.note = newNote;
    saveAnnotations();
    renderChapter();
    showToast('✏️ Note modifiée !');
  });
}

function deleteAnnotation(id) {
  if (!confirm('Supprimer cette annotation ?')) return;
  
  const chapterKey = 'ch' + currentChapter;
  delete annotations[chapterKey][id];
  saveAnnotations();
  renderChapter();
  
  // Close menu
  document.querySelectorAll('.annotation-menu').forEach(m => m.remove());
  showToast('🗑️ Annotation supprimée');
}

// Bookmarks
function addBookmark() {
  const chapterKey = 'ch' + currentChapter;
  const note = prompt('Note pour ce marque-page (optionnel) :', '');
  
  if (!annotations.bookmarks) annotations.bookmarks = [];
  
  annotations.bookmarks.push({
    chapter: currentChapter,
    chapterTitle: chapters[currentChapter].title,
    note,
    date: Date.now()
  });
  
  saveAnnotations();
  hideHighlightMenu();
  window.getSelection().removeAllRanges();
  
  showToast('🔖 Marque-page ajouté !');
  updateBookmarkButton();
}

function checkBookmark() {
  const hasBookmark = annotations.bookmarks?.some(b => b.chapter === currentChapter);
  const btn = document.getElementById('bookmark-btn');
  if (btn) {
    btn.innerHTML = hasBookmark ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
    btn.style.color = hasBookmark ? 'var(--accent3)' : '';
  }
}

function updateBookmarkButton() {
  checkBookmark();
}

// Show annotations panel
function toggleAnnotationsPanel() {
  let panel = document.getElementById('annotations-panel');
  
  if (panel) {
    panel.classList.remove('open');
    setTimeout(() => panel.remove(), 300);
    return;
  }
  
  panel = document.createElement('div');
  panel.id = 'annotations-panel';
  panel.className = 'annotations-panel';
  
  // Count annotations
  let highlightCount = 0;
  Object.values(annotations).forEach(ch => {
    if (typeof ch === 'object' && !Array.isArray(ch)) {
      highlightCount += Object.keys(ch).length;
    }
  });
  
  const bookmarkCount = annotations.bookmarks?.length || 0;
  
  panel.innerHTML = `
    <div class="annotations-panel-header">
      <h3><i class="fas fa-highlighter"></i> Mes annotations</h3>
      <button onclick="toggleAnnotationsPanel()">×</button>
    </div>
    
    <div class="annotations-tabs">
      <button class="ann-tab active" onclick="switchAnnTab('highlights')">
        ✨ Surlignages (${highlightCount})
      </button>
      <button class="ann-tab" onclick="switchAnnTab('bookmarks')">
        🔖 Marque-pages (${bookmarkCount})
      </button>
    </div>
    
    <div id="ann-tab-highlights" class="ann-tab-content active">
      ${renderHighlightsList()}
    </div>
    
    <div id="ann-tab-bookmarks" class="ann-tab-content">
      ${renderBookmarksList()}
    </div>
    
    <div class="annotations-panel-footer">
      <button onclick="exportAnnotations()" style="flex:1;padding:10px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">
        <i class="fas fa-download"></i> Exporter
      </button>
      <button onclick="clearAllAnnotations()" style="flex:1;padding:10px;background:#ef4444;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">
        <i class="fas fa-trash"></i> Tout effacer
      </button>
    </div>
  `;
  
  document.body.appendChild(panel);
  // Trigger slide-in animation
  requestAnimationFrame(() => panel.classList.add('open'));
}

function renderHighlightsList() {
  let html = '<div class="annotations-list">';
  let hasAny = false;

  Object.entries(annotations).forEach(([chKey, chData]) => {
    if (chKey === 'bookmarks' || typeof chData !== 'object') return;
    const chNum = parseInt(chKey.replace('ch', ''));
    const chTitle = chapters[chNum]?.title || `Chapitre ${chNum + 1}`;

    Object.entries(chData).forEach(([id, ann]) => {
      hasAny = true;
      const colorLabel = { yellow: 'Jaune', green: 'Vert', pink: 'Rose', blue: 'Bleu' }[ann.color] || '';
      const colorDot = { yellow: '#fbbf24', green: '#4ade80', pink: '#f472b6', blue: '#60a5fa' }[ann.color] || '#fbbf24';

      html += `
        <div class="annotation-item" data-color="${ann.color}" onclick="goToAnnotation(${chNum}, '${id}')">
          <div class="annotation-item-header">
            <span style="display:flex;align-items:center;gap:6px">
              <span style="width:10px;height:10px;border-radius:50%;background:${colorDot};display:inline-block;flex-shrink:0"></span>
              <span>${chTitle}</span>
            </span>
            <span style="font-size:.7rem;color:var(--text2)">${new Date(ann.date).toLocaleDateString()}</span>
          </div>
          <div class="annotation-item-text">"${ann.text.substring(0, 100)}${ann.text.length > 100 ? '...' : ''}"</div>
          ${ann.note ? `<div class="annotation-item-note">📝 ${ann.note}</div>` : ''}
        </div>
      `;
    });
  });

  html += '</div>';
  return hasAny ? html : '<p style="text-align:center;color:var(--text2);padding:40px 20px;font-size:.9rem">Aucun surlignage pour l\'instant.<br><br>Active le mode ✏️ et tape sur une phrase !</p>';
}

function renderBookmarksList() {
  if (!annotations.bookmarks || annotations.bookmarks.length === 0) {
    return '<p style="text-align:center;color:var(--text2);padding:40px">Aucun marque-page</p>';
  }
  
  let html = '<div class="annotations-list">';
  
  annotations.bookmarks.forEach((bm, i) => {
    html += `
      <div class="annotation-item" onclick="goToChapter(${bm.chapter})">
        <div class="annotation-item-header">
          <span>🔖 ${bm.chapterTitle}</span>
          <button onclick="event.stopPropagation();deleteBookmark(${i})" style="background:none;border:none;color:var(--error);cursor:pointer">🗑️</button>
        </div>
        ${bm.note ? `<div class="annotation-item-note">${bm.note}</div>` : ''}
        <div style="font-size:.7rem;color:var(--text3);margin-top:4px">${new Date(bm.date).toLocaleDateString()}</div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

function switchAnnTab(tab) {
  document.querySelectorAll('.ann-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ann-tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`.ann-tab[onclick*="${tab}"]`).classList.add('active');
  document.getElementById('ann-tab-' + tab).classList.add('active');
}

function goToAnnotation(chNum, annId) {
  currentChapter = chNum;
  renderChapter();
  toggleAnnotationsPanel();
  
  // Scroll to highlight
  setTimeout(() => {
    const highlight = document.querySelector(`[data-id="${annId}"]`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlight.style.animation = 'pulse 1s ease';
    }
  }, 300);
}

function deleteBookmark(index) {
  if (!confirm('Supprimer ce marque-page ?')) return;
  annotations.bookmarks.splice(index, 1);
  saveAnnotations();
  toggleAnnotationsPanel();
  toggleAnnotationsPanel(); // Refresh
  showToast('🗑️ Marque-page supprimé');
}

function exportAnnotations() {
  let text = `📚 ${book.title} - ${book.author}\n`;
  text += `📝 Mes annotations\n`;
  text += `${'='.repeat(50)}\n\n`;
  
  // Highlights
  Object.entries(annotations).forEach(([chKey, chData]) => {
    if (chKey === 'bookmarks' || typeof chData !== 'object') return;
    
    const chNum = parseInt(chKey.replace('ch', ''));
    const chTitle = chapters[chNum]?.title || `Chapitre ${chNum + 1}`;
    
    text += `\n📖 ${chTitle}\n${'-'.repeat(40)}\n`;
    
    Object.values(chData).forEach(ann => {
      text += `\n✨ "${ann.text}"\n`;
      if (ann.note) text += `   📝 ${ann.note}\n`;
    });
  });
  
  // Bookmarks
  if (annotations.bookmarks && annotations.bookmarks.length > 0) {
    text += `\n\n🔖 Marque-pages\n${'-'.repeat(40)}\n`;
    annotations.bookmarks.forEach(bm => {
      text += `\n• ${bm.chapterTitle}\n`;
      if (bm.note) text += `  ${bm.note}\n`;
    });
  }
  
  // Download
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}_annotations.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📥 Annotations exportées !');
}

function clearAllAnnotations() {
  if (!confirm('Supprimer TOUTES les annotations de ce livre ? Cette action est irréversible.')) return;
  
  annotations = {};
  saveAnnotations();
  toggleAnnotationsPanel();
  renderChapter();
  
  showToast('🗑️ Toutes les annotations supprimées');
}

// Toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'reader-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;
    bottom:80px;
    left:50%;
    transform:translateX(-50%);
    background:var(--bg2);
    color:var(--text);
    padding:12px 24px;
    border-radius:50px;
    box-shadow:0 8px 24px rgba(0,0,0,.5);
    z-index:10000;
    font-size:.9rem;
    font-weight:600;
    animation:slideUp .3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Add CSS animations
const annotationStyles = document.createElement('style');
annotationStyles.textContent = `
@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
@keyframes slideDown { from { opacity:1; transform:translateX(-50%) translateY(0); } to { opacity:0; transform:translateX(-50%) translateY(20px); } }
@keyframes pulse { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.05); background:rgba(167,139,250,.6); } }
`;
document.head.appendChild(annotationStyles);

// Initialize annotations when chapter loads - wrap properly
const _originalRenderChapter = renderChapter;
renderChapter = function() {
  try {
    _originalRenderChapter.call(this);
    loadAnnotations();
  } catch(e) {
    console.error('Error in renderChapter:', e);
    // Call original even if loadAnnotations fails
    if (e.message.includes('loadAnnotations')) {
      _originalRenderChapter.call(this);
    }
  }
};
