import https from 'https';
import { performance, PerformanceObserver } from 'perf_hooks';
import middleware from './_common/middleware.js';

const statusHandler = async (url) => {
  if (!url) {
    return {
      isUp: false,
      error: 'URL parameter is required',
      responseCode: null,
      dnsLookupTime: null,
      responseTime: null
    };
  }

  let dnsLookupTime;
  let responseCode;
  let startTime;
  let obs;

  try {
    obs = new PerformanceObserver((items) => {
      dnsLookupTime = items.getEntries()[0].duration;
      performance.clearMarks();
    });

    obs.observe({ entryTypes: ['measure'] });
    performance.mark('A');

    startTime = performance.now();
    
    const response = await Promise.race([
      new Promise((resolve, reject) => {
        const req = https.get(url, res => {
          let data = '';
          responseCode = res.statusCode;
          res.on('data', chunk => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(res);
          });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        req.end();
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]);

    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
    let responseTime = performance.now() - startTime;
    
    if (obs) obs.disconnect();

    const isUp = responseCode >= 200 && responseCode < 400;

    return { 
      isUp, 
      dnsLookupTime: dnsLookupTime || null, 
      responseTime: responseTime || null, 
      responseCode: responseCode || null,
      ...(responseCode >= 400 && { warning: `Received response code: ${responseCode}` })
    };

  } catch (error) {
    if (obs) obs.disconnect();
    
    return {
      isUp: false,
      error: error.message,
      responseCode: responseCode || null,
      dnsLookupTime: dnsLookupTime || null,
      responseTime: null
    };
  }
};

export const handler = middleware(statusHandler);
export default handler;
