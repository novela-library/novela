// Downloads the top 200 most popular Gutenberg books first
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, 'books');
if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });

function fetchUrl(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, res => {
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

async function main() {
  console.log('📚 Downloading top popular Gutenberg books...\n');
  let downloaded = 0, skipped = 0, failed = 0;

  // Fetch top books sorted by download count (most popular first)
  for (let page = 1; page <= 7; page++) {
    console.log(`Page ${page}...`);
    let data;
    try {
      const raw = await fetchUrl(`https://gutendex.com/books/?page=${page}&sort=popular`);
      data = JSON.parse(raw);
    } catch(e) {
      console.log('  API error:', e.message);
      continue;
    }

    for (const book of data.results || []) {
      const filePath = path.join(BOOKS_DIR, `${book.id}.txt`);
      if (fs.existsSync(filePath)) { skipped++; continue; }

      const txtUrl = book.formats?.['text/plain; charset=utf-8']
        || book.formats?.['text/plain']
        || Object.entries(book.formats || {}).find(([k]) => k.startsWith('text/plain'))?.[1];

      if (!txtUrl) { failed++; continue; }

      try {
        const text = await fetchUrl(txtUrl, 25000);
        if (text && text.length > 500) {
          fs.writeFileSync(filePath, text.substring(0, 3000000), 'utf8');
          downloaded++;
          console.log(`  ✅ [${book.id}] ${book.title.substring(0, 50)}`);
        } else { failed++; }
      } catch(e) {
        console.log(`  ❌ [${book.id}] ${book.title.substring(0, 40)} — ${e.message}`);
        failed++;
      }
      await new Promise(r => setTimeout(r, 150));
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Done! Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed}`);
}

main().catch(console.error);
