import Database, { Database as DatabaseType } from 'better-sqlite3';
import { config } from '../config';
import { GuildSettings, Subscription } from '../types';

export const db: DatabaseType = new Database(config.DATABASE_URL);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function getGuild(guildId: string): unknown {
  return db.prepare('SELECT * FROM guilds WHERE guild_id = ?').get(guildId);
}

export function upsertGuild(guildId: string, guildName: string): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO guilds (guild_id, guild_name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET guild_name = excluded.guild_name, updated_at = excluded.updated_at
  `).run(guildId, guildName, now, now);
}

export function getGuildSettings(guildId: string): GuildSettings | null {
  return (db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId) as GuildSettings) ?? null;
}

export function upsertGuildSettings(guildId: string, settings: Partial<GuildSettings>): void {
  const existing = getGuildSettings(guildId);
  if (existing) {
    const fields = Object.keys(settings).filter(k => k !== 'guild_id');
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values: unknown[] = fields.map(f => (settings as Record<string, unknown>)[f]);
    db.prepare(`UPDATE guild_settings SET ${setClause} WHERE guild_id = ?`).run(...values, guildId);
  } else {
    const defaults: GuildSettings = {
      guild_id: guildId,
      default_channel_id: null,
      admin_role_id: null,
      timezone: config.DEFAULT_TIMEZONE,
      update_interval_minutes: config.DEFAULT_UPDATE_INTERVAL_MINUTES,
      digest_enabled: 1,
      digest_time: '09:00',
      live_results_enabled: 0,
      civic_api_enabled: 0,
      embed_colour: '#2f80ed',
      ...settings,
    };
    db.prepare(`
      INSERT INTO guild_settings (guild_id, default_channel_id, admin_role_id, timezone, update_interval_minutes, digest_enabled, digest_time, live_results_enabled, civic_api_enabled, embed_colour)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      defaults.guild_id,
      defaults.default_channel_id,
      defaults.admin_role_id,
      defaults.timezone,
      defaults.update_interval_minutes,
      defaults.digest_enabled,
      defaults.digest_time,
      defaults.live_results_enabled,
      defaults.civic_api_enabled,
      defaults.embed_colour,
    );
  }
}

export function getSubscriptions(guildId: string): Subscription[] {
  return db.prepare('SELECT * FROM subscriptions WHERE guild_id = ? AND enabled = 1').all(guildId) as Subscription[];
}

export function addSubscription(sub: Omit<Subscription, 'id'>): number {
  const result = db.prepare(`
    INSERT INTO subscriptions (guild_id, channel_id, type, postcode, election_id, constituency, council, region, enabled, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sub.guild_id, sub.channel_id, sub.type, sub.postcode, sub.election_id,
    sub.constituency, sub.council, sub.region, sub.enabled, sub.created_by, sub.created_at,
  );
  return result.lastInsertRowid as number;
}

export function removeSubscription(id: number): void {
  db.prepare('UPDATE subscriptions SET enabled = 0 WHERE id = ?').run(id);
}

export function removeSubscriptionsByFilter(guildId: string, filter: Partial<Subscription>): void {
  const fields = Object.keys(filter).filter(k => k !== 'guild_id');
  if (fields.length === 0) {
    db.prepare('UPDATE subscriptions SET enabled = 0 WHERE guild_id = ?').run(guildId);
    return;
  }
  const whereClause = fields.map(f => `${f} = ?`).join(' AND ');
  const values: unknown[] = fields.map(f => (filter as Record<string, unknown>)[f]);
  db.prepare(`UPDATE subscriptions SET enabled = 0 WHERE guild_id = ? AND ${whereClause}`).run(guildId, ...values);
}

export function getSeenUpdates(guildId: string, source: string, externalId: string): unknown[] {
  return db.prepare('SELECT * FROM seen_updates WHERE guild_id = ? AND source = ? AND external_id = ?').all(guildId, source, externalId);
}

export function addSeenUpdate(
  guildId: string,
  subscriptionId: number | null,
  source: string,
  externalId: string,
  contentHash: string,
): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR IGNORE INTO seen_updates (guild_id, subscription_id, source, external_id, content_hash, first_seen_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(guildId, subscriptionId, source, externalId, contentHash, now, now);
}

export function addAuditLog(guildId: string, userId: string, action: string, details?: unknown): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO audit_log (guild_id, user_id, action, details_json, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(guildId, userId, action, details ? JSON.stringify(details) : null, now);
}
