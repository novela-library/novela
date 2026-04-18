// Fetches covers for all Arabic books and updates app.js
const https = require('https');
const fs = require('fs');

function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function findCover(title, author) {
  const queries = [
    `${title} ${author}`,
    title,
  ];
  for (const q of queries) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=3&fields=items(volumeInfo/imageLinks,volumeInfo/title)`;
      const data = JSON.parse(await fetchUrl(url));
      for (const item of data.items || []) {
        const links = item.volumeInfo?.imageLinks;
        const thumb = links?.thumbnail || links?.smallThumbnail;
        if (thumb) {
          return thumb.replace('http://', 'https://').replace('zoom=1', 'zoom=3').replace('&edge=curl', '');
        }
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

async function main() {
  const appJs = fs.readFileSync('app.js', 'utf8');

  // Extract all Arabic books (lang:"ar") that don't have a cover field
  const bookRegex = /\{ id:(\d+), title:"([^"]+)", author:"([^"]+)", lang:"ar"(?!.*cover:)/g;
  const booksNeedingCover = [];
  let match;
  while ((match = bookRegex.exec(appJs)) !== null) {
    booksNeedingCover.push({ id: parseInt(match[1]), title: match[2], author: match[3] });
  }

  console.log(`Found ${booksNeedingCover.length} Arabic books without covers\n`);

  let updated = 0, failed = 0;
  let newAppJs = appJs;

  for (let i = 0; i < booksNeedingCover.length; i++) {
    const book = booksNeedingCover[i];
    process.stdout.write(`[${i+1}/${booksNeedingCover.length}] ${book.title}... `);

    const cover = await findCover(book.title, book.author);
    if (cover) {
      // Insert cover field after lang:"ar"
      const pattern = new RegExp(
        `(\\{ id:${book.id}, title:"${book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", author:"${book.author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", lang:"ar")`,
        'g'
      );
      const replacement = `$1,cover:"${cover}"`;
      const before = newAppJs;
      newAppJs = newAppJs.replace(pattern, replacement);
      if (newAppJs !== before) {
        console.log(`✅`);
        updated++;
      } else {
        console.log(`⚠️ pattern not matched`);
      }
    } else {
      console.log(`❌ not found`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync('app.js', newAppJs, 'utf8');
  console.log(`\n✅ Done! Updated: ${updated} | Failed: ${failed}`);
  console.log('app.js has been updated with cover URLs');
}

main().catch(console.error);
