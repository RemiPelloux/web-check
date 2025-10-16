import axios from 'axios';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0'
};

const DEFAULT_CONFIG = {
  timeout: 8000,
  maxRedirects: 5,
  maxContentLength: 1024 * 1024,
  maxBodyLength: 1024 * 1024,
  validateStatus: (status) => status < 500,
  headers: DEFAULT_HEADERS
};

export const fetchHtml = async (url, overrides = {}) => {
  const config = { ...DEFAULT_CONFIG, ...overrides };
  config.headers = { ...DEFAULT_CONFIG.headers, ...(overrides.headers || {}) };
  const response = await axios.get(url, config);
  if (response.status >= 400) {
    const err = new Error(`Request failed with status ${response.status}`);
    err.response = response;
    throw err;
  }
  return response;
};

export const safeFetch = async (url, overrides = {}) => {
  try {
    return await fetchHtml(url, overrides);
  } catch (error) {
    return { error };
  }
};

export default fetchHtml;
