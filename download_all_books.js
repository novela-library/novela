const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, 'books');
if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });

const TARGET_GB = 5;
const TARGET_BYTES = TARGET_GB * 1024 * 1024 * 1024;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3s between retries
const BOOK_DELAY = 150;   // 150ms between books
const PAGE_DELAY = 800;   // 800ms between pages

// ===== FETCH WITH RETRY =====
function fetchUrl(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES, timeout = 30000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchUrl(url, timeout);
    } catch (e) {
      if (i < retries - 1) {
        const wait = RETRY_DELAY * (i + 1);
        console.log(`  ⚠️  Retry ${i + 1}/${retries - 1} for ${url.substring(0, 60)}... (${e.message})`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw e;
      }
    }
  }
}

// ===== GET GUTENBERG PAGE =====
async function getGutenbergPage(page) {
  const url = `https://gutendex.com/books/?page=${page}&languages=fr,en,ar,es,de,it,pt`;
  const data = JSON.parse(await fetchWithRetry(url, MAX_RETRIES, 20000));
  return { books: data.results || [], hasNext: !!data.next };
}

// ===== MAIN =====
let downloaded = 0, skipped = 0, failed = 0;

async function main() {
  // Calculate already downloaded size
  const existing = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
  let totalBytes = existing.reduce((sum, f) => sum + fs.statSync(path.join(BOOKS_DIR, f)).size, 0);
  skipped = existing.length;

  console.log(`\n📚 Novela Book Downloader`);
  console.log(`Already downloaded: ${skipped} books (${(totalBytes / 1024 / 1024).toFixed(0)} MB)`);
  console.log(`Target: ${TARGET_GB} GB\n`);

  if (totalBytes >= TARGET_BYTES) {
    console.log('✅ Target already reached!');
    return;
  }

  let page = 1;

  while (totalBytes < TARGET_BYTES) {
    console.log(`\n📄 Page ${page} | 📚 ${downloaded + skipped} books | 💾 ${(totalBytes / 1024 / 1024 / 1024).toFixed(2)} GB`);

    let books, hasNext;
    try {
      ({ books, hasNext } = await getGutenbergPage(page));
    } catch (e) {
      console.log(`❌ Failed to fetch page ${page}: ${e.message} — skipping`);
      page++;
      await new Promise(r => setTimeout(r, PAGE_DELAY * 2));
      continue;
    }

    if (!books.length) {
      console.log('No more books found.');
      break;
    }

    for (const book of books) {
      if (totalBytes >= TARGET_BYTES) break;

      const filePath = path.join(BOOKS_DIR, `${book.id}.txt`);
      if (fs.existsSync(filePath)) {
        totalBytes += fs.statSync(filePath).size;
        continue;
      }

      // Get text URL
      const txtUrl = book.formats?.['text/plain; charset=utf-8']
        || book.formats?.['text/plain']
        || Object.entries(book.formats || {}).find(([k]) => k.startsWith('text/plain'))?.[1];

      if (!txtUrl) { failed++; continue; }

      try {
        const text = await fetchWithRetry(txtUrl, 3, 25000);
        if (text && text.length > 500) {
          const toSave = text.substring(0, 3000000); // max 3MB per book
          fs.writeFileSync(filePath, toSave, 'utf8');
          const bytes = Buffer.byteLength(toSave);
          totalBytes += bytes;
          downloaded++;
          const total = downloaded + skipped;
          if (total % 50 === 0) {
            console.log(`  ✅ ${total} books | ${(totalBytes / 1024 / 1024).toFixed(0)} MB`);
          }
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }

      await new Promise(r => setTimeout(r, BOOK_DELAY));
    }

    if (!hasNext) {
      console.log('\n🔄 Reached end of Gutenberg catalog — restarting from page 1...');
      page = 1;
      await new Promise(r => setTimeout(r, 2000));
    } else {
      page++;
      await new Promise(r => setTimeout(r, PAGE_DELAY));
    }
  }

  console.log(`\n✅ DONE!`);
  console.log(`Downloaded: ${downloaded} new books`);
  console.log(`Skipped (already had): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total size: ${(totalBytes / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Books saved in: ${BOOKS_DIR}`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
