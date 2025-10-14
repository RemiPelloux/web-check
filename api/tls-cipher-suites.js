import tls from 'tls';
import middleware from './_common/middleware.js';

const tlsCipherSuitesHandler = async (url) => {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    const hostname = new URL(url).hostname;
    const port = new URL(url).port || 443;

    if (!url.startsWith('https://')) {
      return {
        error: 'TLS analysis only available for HTTPS URLs',
        hostname,
        port,
        supportedCiphers: [],
        tlsVersions: [],
        summary: 'Not an HTTPS connection'
      };
    }

    const tlsInfo = await analyzeTLSConnection(hostname, port);
    return tlsInfo;

  } catch (error) {
    console.error('TLS cipher suites analysis error:', error);
    return {
      error: `Failed to analyze TLS: ${error.message}`,
      hostname: new URL(url).hostname,
      supportedCiphers: [],
      tlsVersions: [],
      summary: 'TLS analysis failed'
    };
  }
};

async function analyzeTLSConnection(hostname, port) {
  return new Promise((resolve) => {
    const result = {
      hostname,
      port: parseInt(port),
      timestamp: new Date().toISOString(),
      supportedCiphers: [],
      tlsVersions: [],
      certificate: null,
      summary: '',
      securityLevel: 'unknown'
    };

    const socket = tls.connect(port, hostname, {
      servername: hostname,
      rejectUnauthorized: false // We want to analyze even invalid certs
    }, () => {
      try {
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();
        const cert = socket.getPeerCertificate();

        // Get cipher information
        if (cipher) {
          result.supportedCiphers = [{
            name: cipher.name,
            version: cipher.version,
            bits: cipher.bits || 'unknown'
          }];
        }

        // Get TLS version
        if (protocol) {
          result.tlsVersions = [protocol];
        }

        // Get certificate info
        if (cert && Object.keys(cert).length > 0) {
          result.certificate = {
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            fingerprint: cert.fingerprint,
            serialNumber: cert.serialNumber
          };
        }

        // Determine security level
        result.securityLevel = assessSecurityLevel(cipher, protocol);
        result.summary = `TLS ${protocol} with ${cipher?.name || 'unknown cipher'}`;

        socket.end();
        resolve(result);

      } catch (error) {
        socket.end();
        result.summary = 'TLS connection established but analysis failed';
        resolve(result);
      }
    });

    socket.on('error', (error) => {
      result.error = error.message;
      result.summary = 'TLS connection failed';
      resolve(result);
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      result.error = 'Connection timeout';
      result.summary = 'TLS connection timed out';
      resolve(result);
    });
  });
}

function assessSecurityLevel(cipher, protocol) {
  if (!cipher || !protocol) return 'unknown';

  // Check TLS version
  if (protocol === 'TLSv1.3') {
    return 'excellent';
  } else if (protocol === 'TLSv1.2') {
    // Check cipher strength for TLS 1.2
    if (cipher.name && (cipher.name.includes('AES256') || cipher.name.includes('CHACHA20'))) {
      return 'good';
    } else if (cipher.name && cipher.name.includes('AES128')) {
      return 'acceptable';
    } else {
      return 'weak';
    }
  } else if (protocol === 'TLSv1.1' || protocol === 'TLSv1') {
    return 'weak';
  } else if (protocol.includes('SSL')) {
    return 'insecure';
  }

  return 'unknown';
}

export const handler = middleware(tlsCipherSuitesHandler);
export default handler;

