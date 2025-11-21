import dns from 'dns';
import { promisify } from 'util';
import URL from 'url-parse';
import middleware from './_common/middleware.js';

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

// TODO: Fix.

const mailConfigHandler = async (url, event, context) => {
  try {
    const domain = new URL(url).hostname || new URL(url).pathname;
    
    console.log(`Analyzing mail configuration for domain: ${domain}`);

    // Get MX records with timeout
    let mxRecords = [];
    try {
      mxRecords = await Promise.race([
        resolveMx(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MX lookup timeout')), 10000))
      ]);
      console.log(`Found ${mxRecords.length} MX records`);
    } catch (mxError) {
      console.log(`MX lookup failed: ${mxError.message}`);
      // Continue without MX records
    }

    // Get TXT records with timeout
    let txtRecords = [];
    try {
      txtRecords = await Promise.race([
        resolveTxt(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TXT lookup timeout')), 10000))
      ]);
      console.log(`Found ${txtRecords.length} TXT records`);
    } catch (txtError) {
      console.log(`TXT lookup failed: ${txtError.message}`);
      // Continue without TXT records
    }

    // Filter for only e-mail related TXT records (SPF, DKIM, DMARC, and certain provider verifications)
    const emailTxtRecords = txtRecords.filter(record => {
      const recordString = record.join('');
      return (
        recordString.startsWith('v=spf1') ||
        recordString.startsWith('v=DKIM1') ||
        recordString.startsWith('v=DMARC1') ||
        recordString.startsWith('protonmail-verification=') ||
        recordString.startsWith('google-site-verification=') || // Google Workspace
        recordString.startsWith('MS=') || // Microsoft 365
        recordString.startsWith('zoho-verification=') || // Zoho
        recordString.startsWith('titan-verification=') || // Titan
        recordString.includes('bluehost.com') || // BlueHost
        recordString.includes('mailgun') || // Mailgun
        recordString.includes('sendgrid') || // SendGrid
        recordString.includes('amazonses') || // Amazon SES
        recordString.includes('mandrill') || // Mandrill
        recordString.includes('postmark') // Postmark
      );
    });

    // Identify specific mail services from TXT records
    const mailServices = [];
    
    emailTxtRecords.forEach(record => {
      const recordString = record.join('');
      if (recordString.startsWith('protonmail-verification=')) {
        mailServices.push({ provider: 'ProtonMail', type: 'verification', value: recordString.split('=')[1] });
      } else if (recordString.startsWith('google-site-verification=')) {
        mailServices.push({ provider: 'Google Workspace', type: 'verification', value: recordString.split('=')[1] });
      } else if (recordString.startsWith('MS=')) {
        mailServices.push({ provider: 'Microsoft 365', type: 'verification', value: recordString.split('=')[1] });
      } else if (recordString.startsWith('zoho-verification=')) {
        mailServices.push({ provider: 'Zoho', type: 'verification', value: recordString.split('=')[1] });
      } else if (recordString.startsWith('titan-verification=')) {
        mailServices.push({ provider: 'Titan', type: 'verification', value: recordString.split('=')[1] });
      } else if (recordString.includes('bluehost.com')) {
        mailServices.push({ provider: 'BlueHost', type: 'hosting', value: recordString });
      } else if (recordString.includes('mailgun')) {
        mailServices.push({ provider: 'Mailgun', type: 'transactional', value: recordString });
      } else if (recordString.includes('sendgrid')) {
        mailServices.push({ provider: 'SendGrid', type: 'transactional', value: recordString });
      } else if (recordString.includes('amazonses')) {
        mailServices.push({ provider: 'Amazon SES', type: 'transactional', value: recordString });
      } else if (recordString.includes('mandrill')) {
        mailServices.push({ provider: 'Mandrill', type: 'transactional', value: recordString });
      } else if (recordString.includes('postmark')) {
        mailServices.push({ provider: 'Postmark', type: 'transactional', value: recordString });
      }
    });

    // Check MX records for common providers
    mxRecords.forEach(mx => {
      const exchange = mx.exchange.toLowerCase();
      if (exchange.includes('yahoodns.net') || exchange.includes('yahoo.com')) {
        if (!mailServices.find(s => s.provider === 'Yahoo')) {
          mailServices.push({ provider: 'Yahoo', type: 'mx', value: mx.exchange, priority: mx.priority });
        }
      } else if (exchange.includes('mimecast.com')) {
        if (!mailServices.find(s => s.provider === 'Mimecast')) {
          mailServices.push({ provider: 'Mimecast', type: 'security', value: mx.exchange, priority: mx.priority });
        }
      } else if (exchange.includes('google.com') || exchange.includes('googlemail.com')) {
        if (!mailServices.find(s => s.provider === 'Google Workspace')) {
          mailServices.push({ provider: 'Google Workspace', type: 'mx', value: mx.exchange, priority: mx.priority });
        }
      } else if (exchange.includes('outlook.com') || exchange.includes('hotmail.com') || exchange.includes('office365.com')) {
        if (!mailServices.find(s => s.provider === 'Microsoft 365')) {
          mailServices.push({ provider: 'Microsoft 365', type: 'mx', value: mx.exchange, priority: mx.priority });
        }
      } else if (exchange.includes('zoho.com') || exchange.includes('zoho.eu')) {
        if (!mailServices.find(s => s.provider === 'Zoho')) {
          mailServices.push({ provider: 'Zoho', type: 'mx', value: mx.exchange, priority: mx.priority });
        }
      }
    });

    // Analyze e-mail security
    const hasSpf = emailTxtRecords.some(record => record.join('').startsWith('v=spf1'));
    const hasDmarc = emailTxtRecords.some(record => record.join('').startsWith('v=DMARC1'));
    const hasDkim = emailTxtRecords.some(record => record.join('').startsWith('v=DKIM1'));
    
    const securityAnalysis = {
      spf: hasSpf,
      dmarc: hasDmarc,
      dkim: hasDkim,
      score: (hasSpf ? 1 : 0) + (hasDmarc ? 1 : 0) + (hasDkim ? 1 : 0),
      maxScore: 3,
      recommendations: []
    };

    if (!hasSpf) {
      securityAnalysis.recommendations.push('Configure SPF record to prevent e-mail spoofing');
    }
    if (!hasDmarc) {
      securityAnalysis.recommendations.push('Configure DMARC policy for e-mail authentication');
    }
    if (!hasDkim) {
      securityAnalysis.recommendations.push('Set up DKIM signing for e-mail integrity');
    }

    // If no mail records found at all
    if (mxRecords.length === 0 && emailTxtRecords.length === 0) {
      return {
        mxRecords: [],
        txtRecords: [],
        mailServices: [],
        securityAnalysis: {
          spf: false,
          dmarc: false,
          dkim: false,
          score: 0,
          maxScore: 3,
          recommendations: ['No mail server configuration detected for this domain']
        },
        message: 'No mail server configuration found',
        analysis: 'This domain does not appear to have email services configured, or they are configured on a subdomain.'
      };
    }

    return {
      mxRecords,
      txtRecords: emailTxtRecords,
      mailServices,
      securityAnalysis,
      summary: {
        totalMxRecords: mxRecords.length,
        totalTxtRecords: emailTxtRecords.length,
        identifiedServices: mailServices.length,
        securityScore: `${securityAnalysis.score}/${securityAnalysis.maxScore}`,
        hasBasicSecurity: hasSpf || hasDmarc || hasDkim
      }
    };
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return { skipped: 'No mail server in use on this domain' };
    } else {
      return {
        statusCode: 500,
        body: { error: error.message },
      };
    }
  }
};

export const handler = middleware(mailConfigHandler);
export default handler;
