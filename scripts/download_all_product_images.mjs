import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('client/public/images/products');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

function cleanQuery(name) {
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/[^\w\s&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchBingImages(query) {
  try {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query + ' product packaging');
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return [];
    const text = await res.text();
    const matches = [...text.matchAll(/&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)];
    return matches.map(m => m[1]);
  } catch (err) {
    return [];
  }
}

async function searchJumiaImages(query) {
  try {
    const url = 'https://www.jumia.com.ng/catalog/?q=' + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return [];
    const text = await res.text();
    const matches = [...text.matchAll(/data-src="(https:\/\/ng\.jumia\.is\/unsafe\/fit-in\/[0-9x]+\/filters:fill\(white\)\/product\/[^"]+)"/g)];
    return matches.map(m => m[1]);
  } catch (err) {
    return [];
  }
}

async function tryDownloadUrl(imgUrl, slug) {
  try {
    const res = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('image')) return null;

    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 4000) return null;

    const filename = `${slug}${ext}`;
    const filePath = path.join(OUT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return {
      localPath: `/images/products/${filename}`,
      size: buffer.length
    };
  } catch {
    return null;
  }
}

async function findAndSaveImage(name) {
  const slug = slugify(name);

  // Check if file already exists
  for (const ext of ['.jpg', '.png', '.webp']) {
    const f = path.join(OUT_DIR, `${slug}${ext}`);
    if (fs.existsSync(f) && fs.statSync(f).size > 4000) {
      return { localPath: `/images/products/${slug}${ext}`, reused: true };
    }
  }

  const clean = cleanQuery(name);
  
  // Try Bing first
  const bingUrls = await searchBingImages(clean);
  for (let i = 0; i < Math.min(6, bingUrls.length); i++) {
    const dl = await tryDownloadUrl(bingUrls[i], slug);
    if (dl) return { ...dl, source: 'bing' };
  }

  // Try Jumia
  const jumiaUrls = await searchJumiaImages(clean);
  for (let i = 0; i < Math.min(5, jumiaUrls.length); i++) {
    const dl = await tryDownloadUrl(jumiaUrls[i], slug);
    if (dl) return { ...dl, source: 'jumia' };
  }

  // Fallback to broader bing query
  const words = clean.split(' ').slice(0, 4).join(' ');
  const broadUrls = await searchBingImages(words);
  for (let i = 0; i < Math.min(5, broadUrls.length); i++) {
    const dl = await tryDownloadUrl(broadUrls[i], slug);
    if (dl) return { ...dl, source: 'bing-broad' };
  }

  return null;
}

async function run() {
  const productsModule = await import('../server/data/products.js');
  const products = productsModule.default;
  
  console.log(`Starting authentic packaging image search & download for ${products.length} products...`);
  
  let content = fs.readFileSync('server/data/products.js', 'utf8');
  let downloadedCount = 0;
  let reusedCount = 0;
  let failed = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.image && p.image.includes('cloudinary')) {
      continue; // keep original authentic Cloudinary images
    }

    process.stdout.write(`[${i + 1}/${products.length}] ${p.name.slice(0, 45)}... `);
    const result = await findAndSaveImage(p.name);
    if (result) {
      if (result.reused) {
        console.log(`REUSED -> ${result.localPath}`);
        reusedCount++;
      } else {
        console.log(`DOWNLOADED (${result.source}, ${result.size}b) -> ${result.localPath}`);
        downloadedCount++;
      }
      
      // Update the product's image in products.js if it currently has unsplash or old url
      if (p.image !== result.localPath) {
        content = content.replace(p.image, result.localPath);
      }
    } else {
      console.log(`FAILED!`);
      failed.push(p.name);
    }

    // Small courteous pause
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync('server/data/products.js', content, 'utf8');
  console.log('\n=========================================');
  console.log(`Done! Downloaded: ${downloadedCount}, Reused: ${reusedCount}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed items:', failed);
  }
}

run();
