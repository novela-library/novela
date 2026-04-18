// Downloads books from Wikisource + Gallica for books not found on Gutenberg/Archive
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

// Books not found on Gutenberg/Archive — try Wikisource + Gallica
const MISSING_BOOKS = [
  { title: "Le Petit Prince", author: "Antoine de Saint-Exupéry", lang: "fr" },
  { title: "La Condition humaine", author: "André Malraux", lang: "fr" },
  { title: "L'Écume des jours", author: "Boris Vian", lang: "fr" },
  { title: "Le Deuxième Sexe", author: "Simone de Beauvoir", lang: "fr" },
  { title: "En attendant Godot", author: "Samuel Beckett", lang: "fr" },
  { title: "L'Être et le Néant", author: "Jean-Paul Sartre", lang: "fr" },
  { title: "Bonjour Tristesse", author: "Françoise Sagan", lang: "fr" },
  { title: "La Vie mode d'emploi", author: "Georges Perec", lang: "fr" },
  { title: "Thérèse Desqueyroux", author: "François Mauriac", lang: "fr" },
  { title: "Zazie dans le métro", author: "Raymond Queneau", lang: "fr" },
  { title: "La Montagne magique", author: "Thomas Mann", lang: "fr" },
  { title: "Cent ans de solitude", author: "Gabriel García Márquez", lang: "fr" },
  { title: "La Ravissement de Lol V. Stein", author: "Marguerite Duras", lang: "fr" },
];

// ===== WIKISOURCE =====
async function searchWikisource(title, lang = 'fr') {
  try {
    const domain = lang === 'fr' ? 'fr.wikisource.org' : 'en.wikisource.org';
    const q = encodeURIComponent(title.substring(0, 30));
    const url = `https://${domain}/w/api.php?action=query&list=search&srsearch=${q}&format=json&srlimit=3`;
    const data = JSON.parse(await fetchUrl(url));
    const results = data.query?.search || [];
    if (!results.length) return null;
    const match = results.find(r => r.title.toLowerCase().includes(title.toLowerCase().substring(0, 8)))
      || results[0];
    return match ? { domain, title: match.title } : null;
  } catch(e) { return null; }
}

async function getWikisourceText(domain, pageTitle) {
  try {
    const q = encodeURIComponent(pageTitle);
    const url = `https://${domain}/w/api.php?action=query&titles=${q}&prop=revisions&rvprop=content&format=json&rvslots=main`;
    const data = JSON.parse(await fetchUrl(url));
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    const content = page?.revisions?.[0]?.slots?.main?.['*'] || page?.revisions?.[0]?.['*'];
    if (!content || content.length < 500) return null;
    // Strip wiki markup
    return content
      .replace(/\{\{[^}]*\}\}/g, '')
      .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
      .replace(/'''?/g, '')
      .replace(/==+([^=]+)==+/g, '\n\n$1\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch(e) { return null; }
}

// ===== GALLICA (BnF) =====
async function searchGallica(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const url = `https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=dc.title+all+%22${encodeURIComponent(title.substring(0,20))}%22+and+dc.type+all+%22monographie%22&maximumRecords=3&recordSchema=dc`;
    const xml = await fetchUrl(url, 15000);
    // Extract identifier from XML
    const match = xml.match(/ark:\/12148\/([a-z0-9]+)/);
    return match ? match[1] : null;
  } catch(e) { return null; }
}

async function getGallicaText(arkId) {
  try {
    // Get plain text from Gallica
    const url = `https://gallica.bnf.fr/ark:/12148/${arkId}.texteBrut`;
    const text = await fetchUrl(url, 20000);
    return text.length > 500 ? text : null;
  } catch(e) { return null; }
}

// ===== FEEDBOOKS =====
async function searchFeedbooks(title, lang = 'fr') {
  try {
    const q = encodeURIComponent(title.substring(0, 25));
    const url = `https://www.feedbooks.com/search.json?query=${q}&lang=${lang}&page=1`;
    const data = JSON.parse(await fetchUrl(url, 10000));
    const books = data.books || data.results || [];
    const match = books.find(b => b.title?.toLowerCase().includes(title.toLowerCase().substring(0, 8)));
    return match || null;
  } catch(e) { return null; }
}

async function main() {
  console.log(`📚 Trying extra sources for ${MISSING_BOOKS.length} missing books...\n`);
  let found = 0, failed = 0;

  for (const book of MISSING_BOOKS) {
    console.log(`🔍 ${book.title}`);

    // 1. Try Wikisource
    const wsResult = await searchWikisource(book.title, book.lang);
    if (wsResult) {
      const text = await getWikisourceText(wsResult.domain, wsResult.title);
      if (text && text.length > 500) {
        const id = 'ws_' + book.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        fs.writeFileSync(path.join(BOOKS_DIR, `${id}.txt`), text.substring(0, 3000000), 'utf8');
        console.log(`  ✅ Wikisource — ${Math.round(text.length/1024)}KB`);
        found++;
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
    }

    // 2. Try Gallica
    const arkId = await searchGallica(book.title, book.author);
    if (arkId) {
      const text = await getGallicaText(arkId);
      if (text && text.length > 500) {
        const id = 'bnf_' + arkId.substring(0, 20);
        fs.writeFileSync(path.join(BOOKS_DIR, `${id}.txt`), text.substring(0, 3000000), 'utf8');
        console.log(`  ✅ Gallica/BnF — ${Math.round(text.length/1024)}KB`);
        found++;
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
    }

    console.log(`  ❌ Not available (likely under copyright)`);
    failed++;
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n✅ Done! Found: ${found} | Not available (copyright): ${failed}`);
}

main().catch(console.error);
