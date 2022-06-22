const getDomainFromUrl = (url: string): string | null => {
  let rawUrl: URL;
  try {
    rawUrl = new URL(url);
  } catch (err) {
    return null;
  }

  if (!["http:", "https:"].includes(rawUrl.protocol)) {
    return null;
  }
  return `${rawUrl.protocol}//${rawUrl.hostname}/*`;
};

export default getDomainFromUrl;
