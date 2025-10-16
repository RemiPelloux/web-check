import https from 'https';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const carbonHandler = async (url) => {

  try {
    // Use our smart HTTP client that handles WAFs and redirects
    const response = await fetchHtml(url);
    const html = response.data; // Axios returns HTML in response.data
    const sizeInBytes = Buffer.byteLength(html, 'utf8');
    // Check if we got valid HTML
    if (!html || sizeInBytes === 0) {
      return {
        error: 'Impossible de récupérer le HTML du site',
        bytes: 0,
        statistics: {
          adjustedBytes: 0,
          energy: 0,
          co2: { grid: { grams: 0 }, renewable: { grams: 0 } }
        }
      };
    }

    const apiUrl = `https://api.websitecarbon.com/data?bytes=${sizeInBytes}&green=0`;

    // Then use that size to get the carbon data with timeout
    const carbonData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: websitecarbon.com API took too long'));
      }, 10000); // 10 second timeout

      https.get(apiUrl, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response from websitecarbon.com'));
          }
        });
      }).on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Add metadata
    carbonData.scanUrl = url;
    carbonData.htmlSizeBytes = sizeInBytes;
    carbonData.htmlSizeKB = Math.round(sizeInBytes / 1024);
    
    return carbonData;
  } catch (error) {
    console.error('Carbon API error:', error);
    return {
      error: `Erreur: ${error.message}`,
      bytes: 0,
      statistics: {
        adjustedBytes: 0,
        energy: 0,
        co2: { grid: { grams: 0 }, renewable: { grams: 0 } }
      }
    };
  }
};

export const handler = middleware(carbonHandler);
export default handler;
