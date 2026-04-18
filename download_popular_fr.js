// Downloads top French/popular books — Le Monde 100 + French classics
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

// ===== BOOK LIST — Le Monde 100 + French classics =====
const BOOKS_TO_FIND = [
  // Le Monde Top 100
  { title: "L'Étranger", author: "Albert Camus", lang: "fr" },
  { title: "À la recherche du temps perdu", author: "Marcel Proust", lang: "fr" },
  { title: "Le Procès", author: "Franz Kafka", lang: "fr" },
  { title: "Le Petit Prince", author: "Antoine de Saint-Exupéry", lang: "fr" },
  { title: "La Condition humaine", author: "André Malraux", lang: "fr" },
  { title: "Voyage au bout de la nuit", author: "Louis-Ferdinand Céline", lang: "fr" },
  { title: "Les Raisins de la colère", author: "John Steinbeck", lang: "fr" },
  { title: "Le Grand Meaulnes", author: "Alain-Fournier", lang: "fr" },
  { title: "L'Écume des jours", author: "Boris Vian", lang: "fr" },
  { title: "Le Deuxième Sexe", author: "Simone de Beauvoir", lang: "fr" },
  { title: "En attendant Godot", author: "Samuel Beckett", lang: "fr" },
  { title: "L'Être et le Néant", author: "Jean-Paul Sartre", lang: "fr" },
  { title: "Le Nom de la Rose", author: "Umberto Eco", lang: "fr" },
  { title: "Paroles", author: "Jacques Prévert", lang: "fr" },
  { title: "Le Monde nouveau", author: "Aldous Huxley", lang: "fr" },
  { title: "1984", author: "George Orwell", lang: "fr" },
  { title: "Lolita", author: "Vladimir Nabokov", lang: "fr" },
  { title: "Bonjour Tristesse", author: "Françoise Sagan", lang: "fr" },
  { title: "La Vie mode d'emploi", author: "Georges Perec", lang: "fr" },
  { title: "Le Chien des Baskerville", author: "Arthur Conan Doyle", lang: "fr" },
  { title: "Le Grand Gatsby", author: "F. Scott Fitzgerald", lang: "fr" },
  { title: "L'Attrape-cœurs", author: "J.D. Salinger", lang: "fr" },
  { title: "Le Maître et Marguerite", author: "Mikhail Bulgakov", lang: "fr" },
  { title: "Thérèse Desqueyroux", author: "François Mauriac", lang: "fr" },
  { title: "Zazie dans le métro", author: "Raymond Queneau", lang: "fr" },
  { title: "La Montagne magique", author: "Thomas Mann", lang: "fr" },
  { title: "Le Seigneur des Anneaux", author: "J.R.R. Tolkien", lang: "fr" },
  { title: "Vendredi ou les Limbes du Pacifique", author: "Michel Tournier", lang: "fr" },
  { title: "La Ravissement de Lol V. Stein", author: "Marguerite Duras", lang: "fr" },
  { title: "Cent ans de solitude", author: "Gabriel García Márquez", lang: "fr" },
  // French classics
  { title: "Les Misérables", author: "Victor Hugo", lang: "fr" },
  { title: "Notre-Dame de Paris", author: "Victor Hugo", lang: "fr" },
  { title: "Les Trois Mousquetaires", author: "Alexandre Dumas", lang: "fr" },
  { title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas", lang: "fr" },
  { title: "Madame Bovary", author: "Gustave Flaubert", lang: "fr" },
  { title: "Germinal", author: "Émile Zola", lang: "fr" },
  { title: "L'Assommoir", author: "Émile Zola", lang: "fr" },
  { title: "Nana", author: "Émile Zola", lang: "fr" },
  { title: "Au Bonheur des Dames", author: "Émile Zola", lang: "fr" },
  { title: "La Bête humaine", author: "Émile Zola", lang: "fr" },
  { title: "Candide", author: "Voltaire", lang: "fr" },
  { title: "Le Rouge et le Noir", author: "Stendhal", lang: "fr" },
  { title: "La Chartreuse de Parme", author: "Stendhal", lang: "fr" },
  { title: "Père Goriot", author: "Honoré de Balzac", lang: "fr" },
  { title: "Eugénie Grandet", author: "Honoré de Balzac", lang: "fr" },
  { title: "La Cousine Bette", author: "Honoré de Balzac", lang: "fr" },
  { title: "Les Fleurs du Mal", author: "Charles Baudelaire", lang: "fr" },
  { title: "Une vie", author: "Guy de Maupassant", lang: "fr" },
  { title: "Bel-Ami", author: "Guy de Maupassant", lang: "fr" },
  { title: "La Peste", author: "Albert Camus", lang: "fr" },
  { title: "La Chute", author: "Albert Camus", lang: "fr" },
  { title: "Les Liaisons dangereuses", author: "Pierre Choderlos de Laclos", lang: "fr" },
  { title: "Paul et Virginie", author: "Bernardin de Saint-Pierre", lang: "fr" },
  { title: "Manon Lescaut", author: "Abbé Prévost", lang: "fr" },
  { title: "Les Confessions", author: "Jean-Jacques Rousseau", lang: "fr" },
  { title: "Émile", author: "Jean-Jacques Rousseau", lang: "fr" },
  { title: "Du contrat social", author: "Jean-Jacques Rousseau", lang: "fr" },
  { title: "L'Esprit des lois", author: "Montesquieu", lang: "fr" },
  { title: "Lettres persanes", author: "Montesquieu", lang: "fr" },
  { title: "Tartuffe", author: "Molière", lang: "fr" },
  { title: "Le Misanthrope", author: "Molière", lang: "fr" },
  { title: "L'Avare", author: "Molière", lang: "fr" },
  { title: "Dom Juan", author: "Molière", lang: "fr" },
  { title: "Phèdre", author: "Jean Racine", lang: "fr" },
  { title: "Andromaque", author: "Jean Racine", lang: "fr" },
  { title: "Le Cid", author: "Pierre Corneille", lang: "fr" },
  { title: "Les Fables", author: "Jean de La Fontaine", lang: "fr" },
  { title: "Cyrano de Bergerac", author: "Edmond Rostand", lang: "fr" },
  { title: "La Princesse de Clèves", author: "Madame de La Fayette", lang: "fr" },
  { title: "Vingt mille lieues sous les mers", author: "Jules Verne", lang: "fr" },
  { title: "Le Tour du monde en quatre-vingts jours", author: "Jules Verne", lang: "fr" },
  { title: "Voyage au centre de la Terre", author: "Jules Verne", lang: "fr" },
  { title: "De la Terre à la Lune", author: "Jules Verne", lang: "fr" },
  { title: "Michel Strogoff", author: "Jules Verne", lang: "fr" },
  { title: "L'Île mystérieuse", author: "Jules Verne", lang: "fr" },
  { title: "Les Enfants du capitaine Grant", author: "Jules Verne", lang: "fr" },
  { title: "Arsène Lupin gentleman cambrioleur", author: "Maurice Leblanc", lang: "fr" },
  { title: "Sans famille", author: "Hector Malot", lang: "fr" },
  { title: "Le Bossu", author: "Paul Féval", lang: "fr" },
  { title: "Fantômas", author: "Marcel Allain", lang: "fr" },
  { title: "Les Misérables", author: "Victor Hugo", lang: "fr" },
  { title: "Ruy Blas", author: "Victor Hugo", lang: "fr" },
  { title: "Hernani", author: "Victor Hugo", lang: "fr" },
  { title: "Les Contemplations", author: "Victor Hugo", lang: "fr" },
  { title: "La Légende des siècles", author: "Victor Hugo", lang: "fr" },
  { title: "Salammbô", author: "Gustave Flaubert", lang: "fr" },
  { title: "L'Éducation sentimentale", author: "Gustave Flaubert", lang: "fr" },
  { title: "Thérèse Raquin", author: "Émile Zola", lang: "fr" },
  { title: "La Fortune des Rougon", author: "Émile Zola", lang: "fr" },
  { title: "Le Ventre de Paris", author: "Émile Zola", lang: "fr" },
  { title: "Une page d'amour", author: "Émile Zola", lang: "fr" },
  { title: "La Joie de vivre", author: "Émile Zola", lang: "fr" },
  { title: "L'Œuvre", author: "Émile Zola", lang: "fr" },
  { title: "La Terre", author: "Émile Zola", lang: "fr" },
  { title: "La Débâcle", author: "Émile Zola", lang: "fr" },
  { title: "Le Docteur Pascal", author: "Émile Zola", lang: "fr" },
  { title: "Pierre et Jean", author: "Guy de Maupassant", lang: "fr" },
  { title: "Fort comme la mort", author: "Guy de Maupassant", lang: "fr" },
  { title: "Mont-Oriol", author: "Guy de Maupassant", lang: "fr" },
];

async function searchGutenberg(title, author, lang) {
  const q = encodeURIComponent(title.split(':')[0].trim().substring(0, 40));
  const langParam = lang === 'fr' ? '&languages=fr' : '';
  const data = JSON.parse(await fetchUrl(`https://gutendex.com/books/?search=${q}${langParam}`));
  const results = data.results || [];
  const match = results.find(b => {
    const t = b.title.toLowerCase();
    const a = (b.authors[0]?.name || '').toLowerCase();
    return t.includes(title.toLowerCase().substring(0, 8)) ||
           a.includes(author.toLowerCase().split(' ').pop().toLowerCase());
  }) || results[0];
  return match || null;
}

async function searchArchive(title, lang) {
  const langFilter = lang === 'fr' ? 'language:french' : 'language:english';
  const q = encodeURIComponent(`${langFilter} AND mediatype:texts AND title:(${title.substring(0, 15)})`);
  const data = JSON.parse(await fetchUrl(
    `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&rows=3&output=json`
  ));
  return data.response?.docs?.[0] || null;
}

async function getArchiveTxtUrl(identifier) {
  const data = JSON.parse(await fetchUrl(`https://archive.org/metadata/${identifier}/files`));
  const files = data.result || [];
  const f = files.find(x => x.name?.endsWith('_djvu.txt'))
    || files.find(x => x.name?.endsWith('.txt') && !x.name.includes('meta'));
  return f ? `https://archive.org/download/${identifier}/${f.name}` : null;
}

async function main() {
  console.log(`📚 Downloading ${BOOKS_TO_FIND.length} popular French books...\n`);
  const results = [];
  let downloaded = 0, skipped = 0, failed = 0;

  for (let i = 0; i < BOOKS_TO_FIND.length; i++) {
    const book = BOOKS_TO_FIND[i];
    console.log(`[${i+1}/${BOOKS_TO_FIND.length}] ${book.title}`);

    let gutBook = null;
    let text = null;

    // 1. Search Gutenberg
    try {
      gutBook = await searchGutenberg(book.title, book.author, book.lang);
    } catch(e) {}

    if (gutBook) {
      const filePath = path.join(BOOKS_DIR, `${gutBook.id}.txt`);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ Already downloaded (${gutBook.id})`);
        skipped++;
      } else {
        const txtUrl = gutBook.formats?.['text/plain; charset=utf-8']
          || gutBook.formats?.['text/plain']
          || Object.entries(gutBook.formats || {}).find(([k]) => k.startsWith('text/plain'))?.[1];
        if (txtUrl) {
          try {
            text = await fetchUrl(txtUrl, 25000);
            if (text && text.length > 500) {
              fs.writeFileSync(filePath, text.substring(0, 3000000), 'utf8');
              console.log(`  ✅ Gutenberg (${gutBook.id}) — ${Math.round(text.length/1024)}KB`);
              downloaded++;
            }
          } catch(e) { console.log(`  ⚠️ Gutenberg download failed: ${e.message}`); }
        }
      }

      const author = gutBook.authors?.[0]?.name || book.author;
      const authorFmt = author.includes(',') ? author.split(',').reverse().map(s=>s.trim()).join(' ') : author;
      results.push({
        gutId: gutBook.id,
        title: gutBook.title,
        author: authorFmt,
        cover: gutBook.formats?.['image/jpeg'] || null,
        lang: book.lang,
        year: gutBook.authors?.[0]?.birth_year || '',
        desc: gutBook.summaries?.[0] || '',
        downloads: gutBook.download_count || 0,
      });
    } else {
      // 2. Try Archive.org
      try {
        const doc = await searchArchive(book.title, book.lang);
        if (doc) {
          const txtUrl = await getArchiveTxtUrl(doc.identifier);
          if (txtUrl) {
            text = await fetchUrl(txtUrl, 25000);
            if (text && text.length > 500) {
              const archiveId = 'arc_' + doc.identifier.substring(0, 20);
              const filePath = path.join(BOOKS_DIR, `${archiveId}.txt`);
              if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, text.substring(0, 3000000), 'utf8');
                console.log(`  ✅ Archive.org (${doc.identifier})`);
                downloaded++;
              } else { skipped++; }
              results.push({
                archiveId,
                title: book.title,
                author: book.author,
                cover: `https://archive.org/services/img/${doc.identifier}`,
                lang: book.lang,
                year: '',
                desc: '',
              });
            }
          }
        } else {
          console.log(`  ❌ Not found anywhere`);
          failed++;
          results.push({ title: book.title, author: book.author, lang: book.lang, notFound: true });
        }
      } catch(e) {
        console.log(`  ❌ Error: ${e.message}`);
        failed++;
      }
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Save results as JS
  const found = results.filter(r => !r.notFound);
  console.log(`\n✅ Done! Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log(`Found: ${found.length}/${BOOKS_TO_FIND.length} books`);

  // Write metadata file
  fs.writeFileSync('popular_fr_meta.json', JSON.stringify(found, null, 2), 'utf8');
  console.log('\nSaved: popular_fr_meta.json');
  console.log('Run: node build_popular_fr.js to add them to app.js');
}

main().catch(console.error);
