// Downloads top French books from Gutenberg + saves metadata for app.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, 'books');
if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });

function fetchUrl(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const GENRES_FR = {
  'Fiction': 'Roman', 'Novel': 'Roman', 'Romance': 'Romance',
  'Poetry': 'Poésie', 'Drama': 'Théâtre', 'Philosophy': 'Philosophie',
  'History': 'Histoire', 'Science': 'Science', 'Adventure': 'Aventure',
  'Mystery': 'Policier', 'Fantasy': 'Fantasy', 'Children': 'Jeunesse',
  'Short Stories': 'Nouvelles', 'Biography': 'Biographie',
};

function getGenre(subjects) {
  for (const s of subjects || []) {
    for (const [key, val] of Object.entries(GENRES_FR)) {
      if (s.toLowerCase().includes(key.toLowerCase())) return val;
    }
  }
  return 'Classique';
}

const EMOJIS = {
  'Roman': '📖', 'Romance': '💌', 'Poésie': '🌹', 'Théâtre': '🎭',
  'Philosophie': '🤔', 'Histoire': '🏛️', 'Science': '🔬', 'Aventure': '⚔️',
  'Policier': '🔍', 'Fantasy': '🐉', 'Jeunesse': '⭐', 'Nouvelles': '📝',
  'Biographie': '👤', 'Classique': '📚',
};

const COLORS = [
  '#1a1d35','#2c3e50','#4a235a','#1a5276','#784212','#922b21',
  '#1e8449','#2471a3','#6c3483','#c0392b','#d4ac0d','#2c3e50',
];

async function main() {
  console.log('📚 Downloading top French books from Gutenberg...\n');
  const books = [];
  let downloaded = 0, skipped = 0, failed = 0;
  let colorIdx = 0;

  for (let page = 1; page <= 32; page++) { // 32 pages × 32 = ~1000 books
    console.log(`Page ${page}/32 | Books so far: ${books.length}`);
    let data;
    try {
      const raw = await fetchUrl(`https://gutendex.com/books/?page=${page}&languages=fr&sort=popular`);
      data = JSON.parse(raw);
    } catch(e) {
      console.log('  API error:', e.message);
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }

    for (const book of data.results || []) {
      const author = book.authors?.[0]?.name || 'Auteur inconnu';
      const authorFmt = author.includes(',')
        ? author.split(',').reverse().map(s => s.trim()).join(' ')
        : author;
      const year = book.authors?.[0]?.birth_year || '';
      const cover = book.formats?.['image/jpeg'] || null;
      const txtUrl = book.formats?.['text/plain; charset=utf-8']
        || book.formats?.['text/plain']
        || Object.entries(book.formats || {}).find(([k]) => k.startsWith('text/plain'))?.[1];
      const genre = getGenre(book.subjects);
      const emoji = EMOJIS[genre] || '📖';
      const color = COLORS[colorIdx % COLORS.length];
      colorIdx++;
      const desc = book.summaries?.[0] || `${book.title} par ${authorFmt}.`;

      books.push({
        id: 10000 + books.length, // start at 10000 to avoid conflicts
        gutId: book.id,
        title: book.title.substring(0, 100),
        author: authorFmt,
        genre,
        year,
        emoji,
        color,
        cover,
        lang: 'fr',
        desc: desc.substring(0, 300),
        downloads: book.download_count || 0,
      });

      // Download text
      if (txtUrl) {
        const filePath = path.join(BOOKS_DIR, `${book.id}.txt`);
        if (fs.existsSync(filePath)) { skipped++; continue; }
        try {
          const text = await fetchUrl(txtUrl, 25000);
          if (text && text.length > 500) {
            fs.writeFileSync(filePath, text.substring(0, 3000000), 'utf8');
            downloaded++;
          } else { failed++; }
        } catch(e) { failed++; }
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (!data.next) break;
    await new Promise(r => setTimeout(r, 500));
  }

  // Save metadata as JS file
  const jsContent = `// ===== TOP FRENCH BOOKS FROM GUTENBERG =====
// Auto-generated — ${books.length} books
// Run: node download_french_books.js to regenerate

const FRENCH_BOOKS = ${JSON.stringify(books, null, 2)};

if (typeof BOOKS !== 'undefined') {
  // Prepend French books to BOOKS array (they appear first)
  BOOKS.unshift(...FRENCH_BOOKS.filter(fb => !BOOKS.find(b => b.title === fb.title)));
}
`;
  fs.writeFileSync('french_books.js', jsContent, 'utf8');

  console.log(`\n✅ Done!`);
  console.log(`Books metadata: ${books.length}`);
  console.log(`Text downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log(`\nFiles created:`);
  console.log(`  french_books.js — include this in index.html before app.js`);
  console.log(`  books/*.txt — text files for instant loading`);
}

main().catch(console.error);
