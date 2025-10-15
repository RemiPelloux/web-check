import dns from 'dns/promises';
import middleware from './_common/middleware.js';

const txtRecordHandler = async (url, event, context) => {
  try {
    const parsedUrl = new URL(url);
    
    const txtRecords = await dns.resolveTxt(parsedUrl.hostname).catch(err => {
      // Handle common DNS errors gracefully
      if (err.code === 'ENODATA' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
        return [];
      }
      throw err;
    });

    if (!txtRecords || txtRecords.length === 0) {
      return {
        hostname: parsedUrl.hostname,
        records: [],
        message: 'No TXT records found for this domain'
      };
    }

    // Parsing and formatting TXT records into a single object
    const readableTxtRecords = txtRecords.reduce((acc, recordArray) => {
      const recordObject = recordArray.reduce((recordAcc, recordString) => {
        const splitRecord = recordString.split('=');
        const key = splitRecord[0];
        const value = splitRecord.slice(1).join('=');
        return { ...recordAcc, [key]: value };
      }, {});
      return { ...acc, ...recordObject };
    }, {});

    return {
      hostname: parsedUrl.hostname,
      records: readableTxtRecords,
      count: txtRecords.length
    };

  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      return {
        error: `Invalid URL: ${error.message}`,
        records: []
      };
    } else {
      return {
        error: `Failed to resolve TXT records: ${error.message}`,
        records: []
      };
    }
  }
};

export const handler = middleware(txtRecordHandler);
export default handler;
