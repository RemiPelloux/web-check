import axios from 'axios';

const API = 'http://localhost:3000';
const url = 'https://visitmonaco.com';

console.log('🧪 Testing APDP plugins on visitmonaco.com\n');
console.log('='.repeat(70));

const tests = [
  { name: 'Cookie Banner', endpoint: '/apdp-cookie-banner' },
  { name: 'Privacy Policy', endpoint: '/apdp-privacy-policy' },
  { name: 'Legal Notices', endpoint: '/apdp-legal-notices' }
];

for (const test of tests) {
  console.log(`\n📋 ${test.name}`);
  console.log('-'.repeat(70));
  
  try {
    const { data } = await axios.get(`${API}${test.endpoint}?url=${encodeURIComponent(url)}`, {
      timeout: 20000
    });
    
    // Check what was found
    const hasFound = data.hasCookieBanner || data.hasPrivacyPolicy || data.hasLegalNotice;
    
    if (hasFound) {
      console.log(`✅ FOUND!`);
      
      if (data.hasCookieBanner !== undefined) {
        console.log(`  Banner détectée: ${data.hasCookieBanner ? 'Oui' : 'Non'}`);
        if (data.detectedLibrary) console.log(`  Solution: ${data.detectedLibrary}`);
      }
      
      if (data.hasPrivacyPolicy !== undefined) {
        console.log(`  Politique: ${data.hasPrivacyPolicy ? 'Oui' : 'Non'}`);
        if (data.privacyPolicyUrl) console.log(`  URL: ${data.privacyPolicyUrl}`);
        if (data.detectedVia) console.log(`  Détecté via: ${data.detectedVia}`);
      }
      
      if (data.hasLegalNotice !== undefined) {
        console.log(`  Mentions légales: ${data.hasLegalNotice ? 'Oui' : 'Non'}`);
        if (data.legalNoticeUrl) console.log(`  URL: ${data.legalNoticeUrl}`);
        if (data.detectedVia) console.log(`  Détecté via: ${data.detectedVia}`);
      }
      
      console.log(`  Conformité: ${data.compliance?.level || 'N/A'}`);
      console.log(`  Score: ${data.compliance?.score || 0}/100`);
      
    } else {
      console.log(`❌ NOT FOUND`);
      
      if (data.footerLinksFound && data.footerLinksFound.length > 0) {
        console.log(`  Footer links found: ${data.footerLinksFound.length}`);
        data.footerLinksFound.slice(0, 3).forEach(l => {
          console.log(`    → "${l.text}" (${l.href})`);
        });
      }
    }
    
    if (data.analysisTime) {
      console.log(`  ⏱️  Analysis time: ${data.analysisTime}ms`);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ERROR: API server not running on ${API}`);
      console.log(`   Start it with: cd web-check && npm run dev`);
      break;
    } else {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n💡 Expected to find:');
console.log('  → https://www.visitmonaco.com/cookies');
console.log('  → https://www.visitmonaco.com/mentions-legales');
