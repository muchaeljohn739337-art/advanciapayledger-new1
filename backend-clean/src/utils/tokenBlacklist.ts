/**
 * In-memory JWT blacklist for logged-out tokens.
 * Tokens are automatically purged when they expire to prevent unbounded growth.
 * For multi-instance deployments, replace with a Redis-backed store.
 */

interface BlacklistEntry {
  expiry: number; // Unix epoch ms
}

const store = new Map<string, BlacklistEntry>();

// Purge expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (entry.expiry <= now) {
      store.delete(token);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Add a token to the blacklist.
 * @param token  Raw JWT string
 * @param expiry Expiry time in Unix epoch seconds (from JWT `exp` claim)
 */
export function blacklistToken(token: string, expiry: number): void {
  store.set(token, { expiry: expiry * 1000 }); // convert s → ms
}

/**
 * Returns true if the token has been explicitly revoked.
 */
export function isBlacklisted(token: string): boolean {
  const entry = store.get(token);
  if (!entry) return false;
  if (entry.expiry <= Date.now()) {
    store.delete(token);
    return false;
  }
  return true;
}
