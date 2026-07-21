// Deterministic avatar background color derived from the username.
export function avatarColor(username: string): string {
  let hash = 0;
  for (const char of username) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return `hsl(${hash}, 45%, 42%)`;
}
