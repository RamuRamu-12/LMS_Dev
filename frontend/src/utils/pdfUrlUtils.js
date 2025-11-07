export const isAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /^https?:\/\//i.test(url.trim());
};

const GOOGLE_DRIVE_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'drive.googleusercontent.com'
];

const trimUrl = (url) => (typeof url === 'string' ? url.trim() : '');

export const isGoogleDriveUrl = (url) => {
  try {
    const parsed = new URL(trimUrl(url));
    return GOOGLE_DRIVE_HOSTS.includes(parsed.hostname);
  } catch (error) {
    return false;
  }
};

export const extractGoogleDriveFileId = (url) => {
  if (!url) return null;

  const cleanedUrl = trimUrl(url);

  try {
    const parsed = new URL(cleanedUrl);
    const { pathname, searchParams } = parsed;

    const directMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (directMatch && directMatch[1]) {
      return directMatch[1];
    }

    const documentMatch = pathname.match(/\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/);
    if (documentMatch && documentMatch[1]) {
      return documentMatch[1];
    }

    const foldersMatch = pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (foldersMatch && foldersMatch[1]) {
      return foldersMatch[1];
    }

    if (searchParams.has('id')) {
      return searchParams.get('id');
    }

    if (searchParams.has('file')) {
      const fileParam = searchParams.get('file');
      const fileParamMatch = fileParam && fileParam.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileParamMatch && fileParamMatch[1]) {
        return fileParamMatch[1];
      }
    }

    if (searchParams.has('url')) {
      const nestedUrl = searchParams.get('url');
      const nestedId = extractGoogleDriveFileId(nestedUrl);
      if (nestedId) {
        return nestedId;
      }
    }

    // Links like https://drive.googleusercontent.com/uc?id=<id>&export=download
    const idMatch = cleanedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }

    // Shared links with ?resourcekey and other parameters sometimes contain the ID before query
    const resourceKeyMatch = cleanedUrl.match(/\/d\/([a-zA-Z0-9_-]+)(?:\/view)?/);
    if (resourceKeyMatch && resourceKeyMatch[1]) {
      return resourceKeyMatch[1];
    }
  } catch (error) {
    // Ignore parsing errors and fall back to regex-based detection
  }

  const fallbackMatch = cleanedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }

  return null;
};

const buildGoogleDrivePreviewUrl = (fileId) => {
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

const buildGoogleDriveDownloadUrl = (fileId) => {
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

const buildGoogleDocsViewerUrl = (sourceUrl) => {
  if (!sourceUrl) return null;
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(sourceUrl)}`;
};

export const normalizePdfSource = (url) => {
  const cleanedUrl = trimUrl(url);
  const absolute = isAbsoluteUrl(cleanedUrl);
  const isDrive = absolute && isGoogleDriveUrl(cleanedUrl);
  const fileId = isDrive ? extractGoogleDriveFileId(cleanedUrl) : null;

  if (isDrive && !fileId) {
    // Treat as non-drive if we can't extract ID
    return {
      originalUrl: cleanedUrl,
      isGoogleDrive: false,
      fileId: null,
      previewUrl: cleanedUrl,
      downloadUrl: cleanedUrl,
      docsViewerUrl: buildGoogleDocsViewerUrl(cleanedUrl),
      proxySourceUrl: cleanedUrl
    };
  }

  if (isDrive) {
    const previewUrl = buildGoogleDrivePreviewUrl(fileId);
    const downloadUrl = buildGoogleDriveDownloadUrl(fileId);
    const docsViewerUrl = buildGoogleDocsViewerUrl(downloadUrl);

    return {
      originalUrl: cleanedUrl,
      isGoogleDrive: true,
      fileId,
      previewUrl,
      downloadUrl,
      docsViewerUrl,
      proxySourceUrl: downloadUrl
    };
  }

  return {
    originalUrl: cleanedUrl,
    isGoogleDrive: false,
    fileId: null,
    previewUrl: cleanedUrl,
    downloadUrl: cleanedUrl,
    docsViewerUrl: buildGoogleDocsViewerUrl(cleanedUrl),
    proxySourceUrl: cleanedUrl
  };
};

export const getOpenInNewTabUrl = (normalized) => {
  if (!normalized) return null;
  if (normalized.isGoogleDrive && normalized.previewUrl) {
    return normalized.previewUrl;
  }
  return normalized.previewUrl || normalized.originalUrl;
};

export const getDownloadUrl = (normalized) => {
  if (!normalized) return null;
  return normalized.downloadUrl || normalized.originalUrl;
};

export const getProxyUrl = (normalized) => {
  if (!normalized) return null;
  const source = normalized.proxySourceUrl || normalized.originalUrl;
  return `/api/pdf/proxy?url=${encodeURIComponent(source)}`;
};


