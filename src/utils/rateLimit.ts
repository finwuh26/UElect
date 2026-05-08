const postCounts = new Map<string, number>();
const MAX_POSTS = 5;

export function canPost(guildId: string): boolean {
  return (postCounts.get(guildId) ?? 0) < MAX_POSTS;
}

export function increment(guildId: string): void {
  postCounts.set(guildId, (postCounts.get(guildId) ?? 0) + 1);
}

export function reset(guildId: string): void {
  postCounts.delete(guildId);
}

export function resetAll(): void {
  postCounts.clear();
}
