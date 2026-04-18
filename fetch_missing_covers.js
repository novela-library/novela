// Fetches covers for Arabic books not found on Google Books
// Tries: Open Library, Archive.org, WorldCat, Goodreads via scraping
const https = require('https');
const fs = require('fs');

function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout }, res => {
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

// 1. Google Books
async function tryGoogleBooks(title, author) {
  const queries = [`${title} ${author}`, title, author + ' ' + title.substring(0,10)];
  for (const q of queries) {
    try {
      const data = JSON.parse(await fetchUrl(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&langRestrict=ar&fields=items(volumeInfo/imageLinks)`
      ));
      for (const item of data.items || []) {
        const links = item.volumeInfo?.imageLinks;
        const thumb = links?.thumbnail || links?.smallThumbnail;
        if (thumb) return thumb.replace('http://','https://').replace('zoom=1','zoom=3').replace('&edge=curl','');
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 150));
  }
  return null;
}

// 2. Open Library search
async function tryOpenLibrary(title) {
  try {
    const q = encodeURIComponent(title);
    const data = JSON.parse(await fetchUrl(`https://openlibrary.org/search.json?q=${q}&limit=3&fields=cover_i,isbn`));
    for (const doc of data.docs || []) {
      if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      if (doc.isbn?.[0]) return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
    }
  } catch(e) {}
  return null;
}

// 3. Archive.org
async function tryArchive(title, author) {
  try {
    const q = encodeURIComponent(`language:arabic AND title:(${title.substring(0,12)})`);
    const data = JSON.parse(await fetchUrl(
      `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&rows=3&output=json`
    ));
    const doc = data.response?.docs?.[0];
    if (doc) return `https://archive.org/services/img/${doc.identifier}`;
  } catch(e) {}
  return null;
}

// 4. WorldCat
async function tryWorldCat(title) {
  try {
    const q = encodeURIComponent(title);
    const html = await fetchUrl(`https://www.worldcat.org/search?q=${q}&qt=results_page`);
    const match = html.match(/coverart\.oclc\.org\/PhotoWebService\/Svc\/getImage\?[^"]+/);
    if (match) return 'https://' + match[0];
  } catch(e) {}
  return null;
}

// 5. Google Images via Custom Search (no key needed for basic)
async function tryGoogleImages(title, author) {
  try {
    // Use Google Books without language restriction
    const data = JSON.parse(await fetchUrl(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=5&fields=items(volumeInfo/imageLinks,volumeInfo/title)`
    ));
    for (const item of data.items || []) {
      const t = item.volumeInfo?.title || '';
      // Check if title has Arabic characters
      if (/[\u0600-\u06FF]/.test(t)) {
        const links = item.volumeInfo?.imageLinks;
        const thumb = links?.thumbnail || links?.smallThumbnail;
        if (thumb) return thumb.replace('http://','https://').replace('zoom=1','zoom=3').replace('&edge=curl','');
      }
    }
    // Take any result
    for (const item of data.items || []) {
      const links = item.volumeInfo?.imageLinks;
      const thumb = links?.thumbnail || links?.smallThumbnail;
      if (thumb) return thumb.replace('http://','https://').replace('zoom=1','zoom=3').replace('&edge=curl','');
    }
  } catch(e) {}
  return null;
}

// Books that failed
const MISSING = [
  { id:100, title:"تغريبة بني هلال", author:"التراث العربي" },
  { id:133, title:"المتشائل", author:"إميل حبيبي" },
  { id:134, title:"باب الشمس", author:"إلياس خوري" },
  { id:135, title:"ذاكرة الجسد", author:"أحلام مستغانمي" },
  { id:136, title:"فوضى الحواس", author:"أحلام مستغانمي" },
  { id:142, title:"النهايات", author:"عبد الرحمن منيف" },
  { id:146, title:"الحرام", author:"يوسف إدريس" },
  { id:147, title:"بنات الرياض", author:"رجاء الصانع" },
  { id:148, title:"الطنطورية", author:"رضوى عاشور" },
  { id:149, title:"حكاية زهرة", author:"حنان الشيخ" },
  { id:150, title:"الزيني بركات", author:"جمال الغيطاني" },
  { id:151, title:"السمان والخريف", author:"نجيب محفوظ" },
  { id:152, title:"ميرامار", author:"نجيب محفوظ" },
  { id:153, title:"الكرنك", author:"نجيب محفوظ" },
  { id:154, title:"حضرة المحترم", author:"نجيب محفوظ" },
  { id:155, title:"ليالي ألف ليلة", author:"نجيب محفوظ" },
  { id:156, title:"رحلة ابن فطومة", author:"نجيب محفوظ" },
  { id:157, title:"العائش في الحقيقة", author:"نجيب محفوظ" },
  { id:158, title:"الخبز الحافي", author:"محمد شكري" },
  { id:159, title:"مدن الملح", author:"عبد الرحمن منيف" },
  // More from the full list
  { id:192, title:"السقا مات", author:"يوسف إدريس" },
  { id:193, title:"الوقت الضائع", author:"يوسف إدريس" },
  { id:195, title:"أبو الهول", author:"يوسف إدريس" },
  { id:197, title:"البيضاء", author:"يوسف إدريس" },
  { id:198, title:"عودة الروح", author:"توفيق الحكيم" },
  { id:199, title:"يوميات نائب في الأرياف", author:"توفيق الحكيم" },
  { id:201, title:"أهل الكهف", author:"توفيق الحكيم" },
  { id:202, title:"الرباط المقدس", author:"توفيق الحكيم" },
  { id:204, title:"بداية ونهاية", author:"نجيب محفوظ" },
  { id:205, title:"خان الخليلي", author:"نجيب محفوظ" },
  { id:207, title:"نداء المجهول", author:"نجيب محفوظ" },
  { id:209, title:"الطريق", author:"نجيب محفوظ" },
  { id:212, title:"السكرية", author:"نجيب محفوظ" },
  { id:215, title:"الغريب", author:"ألبير كامو" },
  { id:216, title:"الأمير الصغير", author:"أنطوان دو سانت إكزوبيري" },
  { id:217, title:"مئة عام من العزلة", author:"غابرييل غارسيا ماركيز" },
  { id:223, title:"الأبله", author:"فيودور دوستويفسكي" },
  { id:226, title:"المحاكمة", author:"فرانز كافكا" },
  { id:227, title:"ألف شمس مشرقة", author:"خالد حسيني" },
  { id:228, title:"عداء الطائرة الورقية", author:"خالد حسيني" },
  { id:230, title:"رواية الأسود يليق بك", author:"أحلام مستغانمي" },
  { id:231, title:"نساء على حافة الانهيار", author:"أحلام مستغانمي" },
  { id:232, title:"الحب في زمن الكوليرا", author:"غابرييل غارسيا ماركيز" },
  { id:234, title:"الغاتسبي العظيم", author:"فرانسيس سكوت فيتزجيرالد" },
  { id:235, title:"مئة عام من العزلة", author:"ماركيز" },
  { id:236, title:"الطاعون", author:"ألبير كامو" },
  { id:241, title:"زينب", author:"محمد حسين هيكل" },
  { id:243, title:"حمار الحكيم", author:"توفيق الحكيم" },
  { id:247, title:"على هامش السيرة", author:"طه حسين" },
  { id:248, title:"الوعد الحق", author:"طه حسين" },
  { id:250, title:"أديب", author:"طه حسين" },
  { id:251, title:"الحب الضائع", author:"عباس محمود العقاد" },
  { id:252, title:"سارة", author:"عباس محمود العقاد" },
  { id:255, title:"أنا", author:"عباس محمود العقاد" },
  { id:256, title:"الفردوس المفقود", author:"جون ميلتون" },
  { id:258, title:"الجريمة والعقاب", author:"دوستويفسكي" },
  { id:260, title:"رواية الأسود يليق بك", author:"أحلام مستغانمي" },
  { id:266, title:"واحة الغروب", author:"بهاء طاهر" },
  { id:267, title:"خالتي صفية والدير", author:"بهاء طاهر" },
  { id:268, title:"قالت ضحى", author:"بهاء طاهر" },
  { id:269, title:"الحب في المنفى", author:"بهاء طاهر" },
  { id:273, title:"رسالة الغفران", author:"أبو العلاء المعري" },
  { id:274, title:"المقدمة", author:"ابن خلدون" },
  { id:278, title:"رسائل إخوان الصفا", author:"إخوان الصفا" },
  { id:279, title:"الكامل في التاريخ", author:"ابن الأثير" },
  { id:280, title:"تاريخ الطبري", author:"محمد بن جرير الطبري" },
  { id:283, title:"في حضرة الغياب", author:"محمود درويش" },
  { id:284, title:"ذاكرة للنسيان", author:"محمود درويش" },
  { id:285, title:"أثر الفراشة", author:"محمود درويش" },
  { id:288, title:"الأجنحة المتكسرة", author:"جبران خليل جبران" },
  { id:290, title:"المجنون", author:"جبران خليل جبران" },
  { id:291, title:"عرائس المروج", author:"جبران خليل جبران" },
  { id:292, title:"الأرواح المتمردة", author:"جبران خليل جبران" },
  { id:294, title:"حديقة النبي", author:"جبران خليل جبران" },
  { id:297, title:"التائه", author:"جبران خليل جبران" },
];

async function main() {
  let appJs = fs.readFileSync('app.js', 'utf8');
  let updated = 0, failed = 0;

  console.log(`Searching covers for ${MISSING.length} books...\n`);

  for (let i = 0; i < MISSING.length; i++) {
    const book = MISSING[i];
    process.stdout.write(`[${i+1}/${MISSING.length}] ${book.title}... `);

    let cover = null;

    // Try all sources in order
    cover = await tryGoogleBooks(book.title, book.author);
    if (!cover) cover = await tryGoogleImages(book.title, book.author);
    if (!cover) cover = await tryOpenLibrary(book.title);
    if (!cover) cover = await tryArchive(book.title, book.author);

    if (cover) {
      // Try to insert cover into existing entry
      const escaped = book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const authorEscaped = book.author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Pattern: id:X, title:"...", author:"...", lang:"ar" (no cover yet)
      const pattern = new RegExp(
        `(id:${book.id},[^}]*?lang:"ar")(?!,cover:)`,
        'g'
      );
      const before = appJs;
      appJs = appJs.replace(pattern, `$1,cover:"${cover}"`);

      if (appJs !== before) {
        console.log(`✅`);
        updated++;
      } else {
        // Try simpler pattern
        const p2 = new RegExp(`(title:"${escaped}"[^}]*?lang:"ar")(?!,cover:)`, 'g');
        const before2 = appJs;
        appJs = appJs.replace(p2, `$1,cover:"${cover}"`);
        if (appJs !== before2) {
          console.log(`✅ (alt)`);
          updated++;
        } else {
          console.log(`⚠️ found cover but pattern failed`);
          failed++;
        }
      }
    } else {
      console.log(`❌`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync('app.js', appJs, 'utf8');
  console.log(`\n✅ Done! Updated: ${updated} | Failed: ${failed}`);
}

main().catch(console.error);
