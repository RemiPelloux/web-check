import axios from 'axios';
import tls from 'tls';
import middleware from './_common/middleware.js';

const MOZILLA_TLS_OBSERVATORY_API = 'https://tls-observatory.services.mozilla.com/api/v1';

const tlsHandler = async (url) => {
  try {
    const domain = new URL(url).hostname;
    const port = new URL(url).port || 443;

    // Try Mozilla TLS Observatory first (with timeout)
    try {
      const scanResponse = await axios.post(
        `${MOZILLA_TLS_OBSERVATORY_API}/scan?target=${domain}`,
        {},
        { timeout: 5000 }
      );
      const scanId = scanResponse.data.scan_id;

      if (typeof scanId === 'number') {
        const resultResponse = await axios.get(
          `${MOZILLA_TLS_OBSERVATORY_API}/results?id=${scanId}`,
          { timeout: 5000 }
        );
        return {
          statusCode: 200,
          body: resultResponse.data,
        };
      }
    } catch (mozillaError) {
      console.log('Mozilla TLS Observatory unavailable, using fallback:', mozillaError.message);
    }

    // Fallback: Use direct TLS connection analysis
    const fallbackData = await analyzeTLSDirect(domain, port);
    return {
      statusCode: 200,
      body: {
        ...fallbackData,
        note: 'Analysis performed using direct TLS connection (Mozilla TLS Observatory unavailable)',
      },
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: `TLS analysis failed: ${error.message}`,
        hostname: new URL(url).hostname,
        available: false,
      },
    };
  }
};

async function analyzeTLSDirect(hostname, port) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        hostname,
        port,
        error: 'Connection timeout',
        available: false,
      });
    }, 8000);

    try {
      const socket = tls.connect(port, hostname, {
        servername: hostname,
        rejectUnauthorized: false,
      }, () => {
        try {
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();
          const cert = socket.getPeerCertificate(true);

          const result = {
            hostname,
            port,
            protocol: protocol || 'Unknown',
            cipher: cipher?.name || 'Unknown',
            bits: cipher?.bits || 0,
            version: cipher?.version || 'Unknown',
            certificate: cert ? {
              subject: cert.subject,
              issuer: cert.issuer,
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysRemaining: cert.valid_to ? Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            } : null,
            available: true,
            securityLevel: assessSecurityLevel(cipher, protocol),
          };

          clearTimeout(timeout);
          socket.end();
          resolve(result);
        } catch (err) {
          clearTimeout(timeout);
          socket.end();
          resolve({
            hostname,
            port,
            error: 'Failed to extract TLS information',
            available: false,
          });
        }
      });

      socket.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          hostname,
          port,
          error: error.message,
          available: false,
        });
      });

      socket.setTimeout(8000);
      socket.on('timeout', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({
          hostname,
          port,
          error: 'Socket timeout',
          available: false,
        });
      });
    } catch (error) {
      clearTimeout(timeout);
      resolve({
        hostname,
        port,
        error: error.message,
        available: false,
      });
    }
  });
}

function assessSecurityLevel(cipher, protocol) {
  if (!cipher || !protocol) return 'unknown';
  
  if (protocol === 'TLSv1.3') return 'excellent';
  if (protocol === 'TLSv1.2') {
    if (cipher.name && (cipher.name.includes('AES256') || cipher.name.includes('CHACHA20'))) {
      return 'good';
    }
    return 'acceptable';
  }
  if (protocol === 'TLSv1.1' || protocol === 'TLSv1') return 'weak';
  if (protocol.includes('SSL')) return 'insecure';
  
  return 'unknown';
}

export const handler = middleware(tlsHandler);
export default handler;
