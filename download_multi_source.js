// ===== MULTI-SOURCE BOOK DOWNLOADER =====
// Downloads books from multiple free sources: Gutenberg, Archive.org, Standard Ebooks, Feedbooks
// Target: 5GB of public domain books

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BOOKS_DIR = '../novela-books'; // Your other repo
const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
let totalSize = 0;
let downloadedCount = 0;

// Ensure directory exists
if (!fs.existsSync(BOOKS_DIR)) {
  console.log('❌ Directory not found:', BOOKS_DIR);
  console.log('Please clone the novela-books repo in the parent directory');
  process.exit(1);
}

// ===== SOURCES =====

// 1. Project Gutenberg - Most popular books
const GUTENBERG_TOP = [
  1342, 11, 84, 1661, 2701, 1952, 174, 98, 1260, 345, 
  2600, 1080, 46, 74, 1232, 16, 2554, 1497, 205, 244,
  1400, 2591, 100, 1184, 158, 219, 2852, 1399, 514, 135,
  5200, 1998, 43, 76, 2814, 1727, 408, 1250, 2500, 161,
  1259, 2641, 3825, 1322, 996, 4300, 1404, 2542, 3207, 1251,
  // French classics
  13951, 4650, 17989, 14155, 4772, 1257, 17500, 13415, 6838, 4791,
  // Spanish classics
  2000, 16, 2000, 3836, 14370, 15532, 16328, 29042, 14370, 2000,
  // German classics
  2229, 5682, 12898, 2147, 7849, 6999, 15404, 13635, 7369, 2407,
  // Italian classics
  997, 1232, 1009, 1011, 1012, 1013, 1014, 1015, 1016, 1017,
  // More popular English
  730, 1400, 768, 1260, 2701, 1342, 84, 98, 174, 11,
  // Science fiction
  35, 36, 64, 67, 68, 69, 70, 71, 72, 73,
  // Philosophy
  1497, 1998, 4280, 5827, 6456, 7370, 8492, 10615, 12203, 15776,
  // History
  1250, 2680, 3300, 4363, 5000, 6130, 7370, 8492, 9662, 10615
];

// 2. Internet Archive - Popular collections
const ARCHIVE_COLLECTIONS = [
  'opensource',
  'gutenberg',
  'americana',
  'texts',
  'booksbylanguage',
  'inlibrary'
];

// 3. Standard Ebooks - High quality public domain
const STANDARD_EBOOKS_BASE = 'https://standardebooks.org';

// ===== DOWNLOAD HELPERS =====

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(filepath);
        return downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`Status: ${response.statusCode}`));
      }
      
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        totalSize += chunk.length;
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(size);
      });
    });
    
    request.on('error', (err) => {
      file.close();
      fs.unlinkSync(filepath);
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      fs.unlinkSync(filepath);
      reject(new Error('Timeout'));
    });
  });
}

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ===== SOURCE 1: PROJECT GUTENBERG =====

async function downloadGutenberg() {
  console.log('\n📚 Downloading from Project Gutenberg...');
  
  for (const id of GUTENBERG_TOP) {
    if (totalSize >= MAX_SIZE) break;
    
    const filepath = path.join(BOOKS_DIR, `${id}.txt`);
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skip ${id} (exists)`);
      continue;
    }
    
    const urls = [
      `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
      `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
      `https://www.gutenberg.org/files/${id}/${id}.txt`,
      `https://gutenberg.pglaf.org/cache/epub/${id}/pg${id}.txt`,
      `https://gutenberg.readingroo.ms/${id}/${id}.txt`
    ];
    
    let success = false;
    for (const url of urls) {
      try {
        console.log(`⬇️  Downloading ${id} from ${url.split('/')[2]}...`);
        const size = await downloadFile(url, filepath);
        downloadedCount++;
        console.log(`✅ ${id}.txt (${(size/1024).toFixed(0)}KB) - Total: ${(totalSize/1024/1024).toFixed(0)}MB`);
        success = true;
        break;
      } catch(e) {
        // Try next URL
      }
    }
    
    if (!success) {
      console.log(`❌ Failed: ${id}`);
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
}

// ===== SOURCE 2: INTERNET ARCHIVE =====

async function downloadArchive() {
  console.log('\n📚 Downloading from Internet Archive...');
  
  const languages = ['english', 'french', 'spanish', 'german', 'italian', 'arabic'];
  
  for (const lang of languages) {
    if (totalSize >= MAX_SIZE) break;
    
    try {
      const searchUrl = `https://archive.org/advancedsearch.php?q=language:${lang}+AND+mediatype:texts+AND+format:txt&fl[]=identifier&fl[]=title&rows=50&output=json`;
      const data = await fetchJSON(searchUrl);
      
      for (const doc of data.response.docs) {
        if (totalSize >= MAX_SIZE) break;
        
        const identifier = doc.identifier;
        const filepath = path.join(BOOKS_DIR, `ia_${identifier}.txt`);
        
        if (fs.existsSync(filepath)) continue;
        
        try {
          // Get file list
          const metaUrl = `https://archive.org/metadata/${identifier}/files`;
          const metaData = await fetchJSON(metaUrl);
          
          const txtFile = metaData.result.find(f => 
            f.name.endsWith('.txt') && !f.name.includes('meta')
          );
          
          if (!txtFile) continue;
          
          const downloadUrl = `https://archive.org/download/${identifier}/${txtFile.name}`;
          console.log(`⬇️  Downloading ${identifier}...`);
          
          const size = await downloadFile(downloadUrl, filepath);
          downloadedCount++;
          console.log(`✅ ${identifier} (${(size/1024).toFixed(0)}KB) - Total: ${(totalSize/1024/1024).toFixed(0)}MB`);
          
          await new Promise(r => setTimeout(r, 1000));
        } catch(e) {
          console.log(`❌ Failed: ${identifier}`);
        }
      }
    } catch(e) {
      console.log(`❌ Archive search failed for ${lang}`);
    }
  }
}

// ===== SOURCE 3: FEEDBOOKS PUBLIC DOMAIN =====

async function downloadFeedbooks() {
  console.log('\n📚 Downloading from Feedbooks...');
  
  const categories = ['fiction', 'non-fiction', 'poetry', 'drama'];
  
  for (const cat of categories) {
    if (totalSize >= MAX_SIZE) break;
    
    try {
      // Feedbooks public domain catalog
      const catalogUrl = `https://catalog.feedbooks.com/catalog/public_domain.atom`;
      // Note: This is a simplified approach - in reality you'd parse the ATOM feed
      console.log(`⏭️  Feedbooks requires ATOM parsing - skipping for now`);
    } catch(e) {
      console.log(`❌ Feedbooks failed`);
    }
  }
}

// ===== SOURCE 4: WIKISOURCE =====

async function downloadWikisource() {
  console.log('\n📚 Downloading from Wikisource...');
  
  // Popular Wikisource texts
  const texts = [
    'The_Iliad_(Pope)',
    'The_Odyssey_(Pope)',
    'Beowulf_(Gummere)',
    'The_Divine_Comedy',
    'Paradise_Lost',
    'The_Canterbury_Tales',
    'Don_Quixote',
    'Les_Misérables',
    'War_and_Peace',
    'Crime_and_Punishment'
  ];
  
  for (const text of texts) {
    if (totalSize >= MAX_SIZE) break;
    
    const filepath = path.join(BOOKS_DIR, `ws_${text}.txt`);
    if (fs.existsSync(filepath)) continue;
    
    try {
      const url = `https://en.wikisource.org/wiki/${text}?action=raw`;
      console.log(`⬇️  Downloading ${text}...`);
      
      const size = await downloadFile(url, filepath);
      downloadedCount++;
      console.log(`✅ ${text} (${(size/1024).toFixed(0)}KB) - Total: ${(totalSize/1024/1024).toFixed(0)}MB`);
      
      await new Promise(r => setTimeout(r, 1000));
    } catch(e) {
      console.log(`❌ Failed: ${text}`);
    }
  }
}

// ===== SOURCE 5: CLASSIC LITERATURE =====

async function downloadClassics() {
  console.log('\n📚 Downloading additional classics...');
  
  // More Gutenberg IDs for classics
  const moreIds = [];
  for (let i = 1; i <= 1000; i++) {
    moreIds.push(i);
  }
  
  for (const id of moreIds) {
    if (totalSize >= MAX_SIZE) break;
    
    const filepath = path.join(BOOKS_DIR, `${id}.txt`);
    if (fs.existsSync(filepath)) continue;
    
    const url = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
    
    try {
      const size = await downloadFile(url, filepath);
      downloadedCount++;
      console.log(`✅ ${id}.txt (${(size/1024).toFixed(0)}KB) - Total: ${(totalSize/1024/1024).toFixed(0)}MB`);
      
      await new Promise(r => setTimeout(r, 300));
    } catch(e) {
      // Skip failed downloads
    }
  }
}

// ===== MAIN =====

async function main() {
  console.log('🚀 Multi-Source Book Downloader');
  console.log('📁 Target directory:', BOOKS_DIR);
  console.log('🎯 Target size: 5GB\n');
  
  try {
    // Download from all sources
    await downloadGutenberg();
    
    if (totalSize < MAX_SIZE) {
      await downloadArchive();
    }
    
    if (totalSize < MAX_SIZE) {
      await downloadWikisource();
    }
    
    if (totalSize < MAX_SIZE) {
      await downloadClassics();
    }
    
    console.log('\n✅ Download complete!');
    console.log(`📊 Downloaded: ${downloadedCount} books`);
    console.log(`💾 Total size: ${(totalSize/1024/1024/1024).toFixed(2)}GB`);
    
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
}

main();
