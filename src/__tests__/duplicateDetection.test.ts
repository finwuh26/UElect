import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { hashContent } from '../utils/normalise';
import fs from 'fs';
import path from 'path';

function createTestDb() {
  const db = new Database(':memory:');
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    db.exec(stmt);
  }
  return db;
}

describe('duplicate detection', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    db.prepare('INSERT INTO guilds (guild_id, guild_name, created_at, updated_at) VALUES (?, ?, ?, ?)').run('g1', 'Test Guild', new Date().toISOString(), new Date().toISOString());
  });

  afterEach(() => {
    db.close();
  });

  it('allows inserting a new seen update', () => {
    const hash = hashContent({ election: 'test-1', status: 'upcoming' });
    db.prepare('INSERT INTO seen_updates (guild_id, subscription_id, source, external_id, content_hash, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run('g1', null, 'democracy_club', 'election-1', hash, new Date().toISOString(), new Date().toISOString());
    const row = db.prepare('SELECT * FROM seen_updates WHERE guild_id = ? AND external_id = ?').get('g1', 'election-1') as any;
    expect(row).toBeTruthy();
    expect(row.content_hash).toBe(hash);
  });

  it('rejects duplicate seen update (same guild, source, id, hash)', () => {
    const hash = hashContent({ election: 'test-1' });
    const stmt = db.prepare('INSERT INTO seen_updates (guild_id, subscription_id, source, external_id, content_hash, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run('g1', null, 'democracy_club', 'election-1', hash, new Date().toISOString(), new Date().toISOString());
    expect(() => stmt.run('g1', null, 'democracy_club', 'election-1', hash, new Date().toISOString(), new Date().toISOString())).toThrow();
  });

  it('allows same election with different content hash (updated data)', () => {
    const hash1 = hashContent({ election: 'test-1', status: 'upcoming' });
    const hash2 = hashContent({ election: 'test-1', status: 'declared' });
    const stmt = db.prepare('INSERT INTO seen_updates (guild_id, subscription_id, source, external_id, content_hash, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    expect(() => {
      stmt.run('g1', null, 'democracy_club', 'election-1', hash1, new Date().toISOString(), new Date().toISOString());
      stmt.run('g1', null, 'democracy_club', 'election-1', hash2, new Date().toISOString(), new Date().toISOString());
    }).not.toThrow();
    const rows = db.prepare('SELECT * FROM seen_updates WHERE guild_id = ? AND external_id = ?').all('g1', 'election-1') as any[];
    expect(rows).toHaveLength(2);
  });
});
