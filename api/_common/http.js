import axios from 'axios';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; WebCheck/2.0; +https://web-check.xyz)'
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
