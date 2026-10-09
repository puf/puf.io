const LINK_TYPES_BY_HOSTNAME = new Map([
  ['x.com', 'twitter'],
  ['threads.net', 'threads'],
  ['threads.com', 'threads'],
  ['c.im', 'mastodon'],
  ['linkedin.com', 'linkedin'],
  ['goodreads.com', 'goodreads'],
  ['bookhive.buzz', 'bookhive'],
  ['medium.com', 'medium'],
  ['bsky.app', 'bluesky'],
  ['stackoverflow.com', 'stackoverflow'],
]);

function getHostname(link) {
  if (typeof link !== 'string' || link.length === 0) return undefined;

  try {
    return new URL(link).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export function getExternalLinkType(link) {
  const hostname = getHostname(link);
  return hostname ? LINK_TYPES_BY_HOSTNAME.get(hostname) : undefined;
}

export function getExternalLinkLabel(link) {
  return getHostname(link) ?? link;
}

export function normalizeBookLinks(link, alsoOn = []) {
  return [...new Set([link, ...alsoOn]
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean))];
}
