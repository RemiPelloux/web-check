import axios from 'axios';
import cheerio from 'cheerio';

const url = 'https://visitmonaco.com';
console.log('🔍 Debugging visitmonaco.com HTML\n');

const { data: html } = await axios.get(url, { 
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0' }
});

const $ = cheerio.load(html);

console.log('1️⃣  Tarteaucitron Script Check:');
const scripts = $('script').map((_, el) => $(el).attr('src') || '').get();
const tarteaucitronScript = scripts.find(s => s.includes('tarteaucitron'));
console.log(tarteaucitronScript ? `  ✅ Found: ${tarteaucitronScript}` : '  ❌ Not in initial HTML');

console.log('\n2️⃣  Tarteaucitron DOM Elements:');
const tarteaucitronElements = $('[id*="tarteaucitron"], [class*="tarteaucitron"]');
console.log(`  Found ${tarteaucitronElements.length} elements`);

console.log('\n3️⃣  All Buttons on Page:');
const buttons = $('button').map((_, el) => $(el).text().trim()).get().filter(t => t);
console.log(`  Total buttons: ${buttons.length}`);
buttons.slice(0, 10).forEach(b => console.log(`    - "${b}"`));

console.log('\n4️⃣  Images on Page:');
const images = $('img[src]').map((_, el) => $(el).attr('src')).get();
console.log(`  Total images: ${images.length}`);
images.slice(0, 5).forEach(img => {
  try {
    const imgUrl = new URL(img, url);
    console.log(`    - ${imgUrl.hostname}`);
  } catch(e) {
    console.log(`    - ${img.substring(0, 50)}`);
  }
});

console.log('\n5️⃣  External Domains Check:');
const allSrc = $('[src], [href]').map((_, el) => $(el).attr('src') || $(el).attr('href')).get();
const externalDomains = new Set();
allSrc.forEach(src => {
  try {
    const srcUrl = new URL(src, url);
    if (!srcUrl.hostname.includes('visitmonaco')) {
      externalDomains.add(srcUrl.hostname);
    }
  } catch(e) {}
});
console.log(`  External domains found: ${externalDomains.size}`);
Array.from(externalDomains).slice(0, 10).forEach(d => console.log(`    ✓ ${d}`));

console.log('\n6️⃣  JavaScript-loaded content indicators:');
const jsFrameworks = [
  html.includes('React') || html.includes('react'),
  html.includes('Vue') || html.includes('vue'),
  html.includes('Angular') || html.includes('angular'),
  html.includes('next') || html.includes('Next'),
  $('script[type="application/ld+json"]').length > 0
];
console.log(`  React: ${jsFrameworks[0] ? '✓' : '✗'}`);
console.log(`  Vue: ${jsFrameworks[1] ? '✓' : '✗'}`);
console.log(`  Angular: ${jsFrameworks[2] ? '✓' : '✗'}`);
console.log(`  Next.js: ${jsFrameworks[3] ? '✓' : '✗'}`);
console.log(`  JSON-LD: ${jsFrameworks[4] ? '✓' : '✗'}`);

console.log('\n📊 Conclusion:');
console.log(tarteaucitronScript ? '  ✅ Tarteaucitron script exists' : '  ❌ Tarteaucitron not in source');
console.log(tarteaucitronElements.length > 0 ? '  ✅ Tarteaucitron DOM exists' : '  ⚠️  Tarteaucitron DOM injected by JS');
console.log(externalDomains.size > 0 ? `  ✅ ${externalDomains.size} external domains` : '  ⚠️  External resources loaded by JS');
