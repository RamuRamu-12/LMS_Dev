const fetch = require('node-fetch');
const logger = require('../utils/logger');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';
const DRIVE_HOSTS = ['drive.google.com', 'docs.google.com', 'drive.googleusercontent.com'];

const ensureUrl = (value) => {
  if (!value) {
    throw new Error('Invalid PDF URL');
  }

  try {
    return new URL(value);
  } catch (error) {
    throw new Error('Invalid PDF URL');
  }
};

const buildHeaders = (extra = {}) => ({
  'User-Agent': USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  ...extra
});

const isDriveHost = (hostname) => DRIVE_HOSTS.includes(hostname);

const extractDriveFileId = (rawUrl) => {
  if (!rawUrl) return null;

  let urlString = rawUrl;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.searchParams.has('url')) {
      urlString = parsed.searchParams.get('url');
    }
  } catch (error) {
    // Fall back to raw string parsing
  }

  if (!urlString) return null;

  try {
    const parsed = new URL(urlString);
    const { pathname, searchParams } = parsed;

    const matchFile = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchFile) return matchFile[1];

    const matchDocument = pathname.match(/\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/);
    if (matchDocument) return matchDocument[1];

    if (searchParams.has('id')) {
      return searchParams.get('id');
    }

    const matchGeneric = pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchGeneric) return matchGeneric[1];

    const queryMatch = urlString.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryMatch) return queryMatch[1];
  } catch (error) {
    // Ignore parsing errors below
  }

  const fallbackMatch = urlString.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fallbackMatch) return fallbackMatch[1];

  return null;
};

const driveDownloadUrl = (fileId, confirmToken) => {
  let url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  if (confirmToken) {
    url += `&confirm=${confirmToken}`;
  }
  return url;
};

const normalizeDriveLocation = (location) => {
  if (!location) return null;
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return location;
  }
  if (location.startsWith('//')) {
    return `https:${location}`;
  }
  return `https://drive.google.com${location}`;
};

const collectCookies = (headers = []) => {
  if (!headers || !headers.length) return undefined;
  return headers.map((header) => header.split(';')[0]).join('; ');
};

const fetchDriveFile = async (fileId, { signal } = {}) => {
  if (!fileId) {
    throw new Error('Unable to determine Google Drive file ID');
  }

  const baseHeaders = buildHeaders({ Referer: 'https://drive.google.com/' });

  const executeRequest = async (targetUrl, extraHeaders = {}, redirect = 'manual') =>
    fetch(targetUrl, {
      method: 'GET',
      headers: { ...baseHeaders, ...extraHeaders },
      redirect,
      signal
    });

  let response = await executeRequest(driveDownloadUrl(fileId));

  if (response.status === 302 || response.status === 301) {
    const location = normalizeDriveLocation(response.headers.get('location'));
    const cookies = collectCookies(response.headers.raw()['set-cookie']);
    const cookieHeader = cookies ? { Cookie: cookies } : {};
    response = await executeRequest(location, cookieHeader, 'follow');
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    const html = await response.text();
    const confirmMatch = html.match(/confirm=([0-9A-Za-z_]+)&/);

    if (confirmMatch) {
      const confirmToken = confirmMatch[1];
      const cookies = collectCookies(response.headers.raw()['set-cookie']);
      const cookieHeader = cookies ? { Cookie: cookies } : {};
      response = await executeRequest(driveDownloadUrl(fileId, confirmToken), cookieHeader, 'follow');
    } else if (/You need access|Sign in|Google Drive/i.test(html)) {
      throw new Error('Google Drive requires authentication to access this file.');
    } else {
      throw new Error('Unexpected HTML response from Google Drive.');
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to download Google Drive file: ${response.status} ${response.statusText}`);
  }

  return response;
};

const fetchResource = async (rawUrl, options = {}) => {
  const target = ensureUrl(rawUrl);
  const hostname = target.hostname;

  if (isDriveHost(hostname)) {
    const fileId = extractDriveFileId(rawUrl);
    if (fileId) {
      return fetchDriveFile(fileId, { signal: options.signal });
    }

    // Fall back to nested URL parameter if present (docs viewer wrapper)
    if (target.searchParams.has('url')) {
      return fetchResource(target.searchParams.get('url'), options);
    }
  }

  const method = options.method || 'GET';
  const headers = buildHeaders(options.headers || {});

  return fetch(target.href, {
    method,
    headers,
    redirect: options.redirect || 'follow',
    signal: options.signal
  });
};

const proxyPDF = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL is required'
      });
    }

    const response = await fetchResource(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const contentLength = response.headers.get('content-length');
    const disposition = response.headers.get('content-disposition') || 'inline';

    res.status(response.status);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': disposition,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600'
    });

    if (contentLength) {
      res.set('Content-Length', contentLength);
    }

    response.body.pipe(res);

    logger.info(`PDF proxied successfully: ${url}`);
  } catch (error) {
    logger.error('PDF proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load PDF',
      error: error.message
    });
  }
};

const getPDFInfo = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL is required'
      });
    }

    const response = await fetchResource(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`PDF not accessible: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const lastModified = response.headers.get('last-modified');

    if (response.body && typeof response.body.destroy === 'function') {
      response.body.destroy();
    }

    res.json({
      success: true,
      data: {
        url,
        accessible: true,
        contentType,
        contentLength: contentLength ? parseInt(contentLength, 10) : null,
        lastModified,
        size: contentLength ? `${(parseInt(contentLength, 10) / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
      }
    });

    logger.info(`PDF info retrieved: ${url}`);
  } catch (error) {
    logger.error('PDF info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PDF info',
      error: error.message
    });
  }
};

module.exports = {
  proxyPDF,
  getPDFInfo
};
