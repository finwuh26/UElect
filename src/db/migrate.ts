import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

export function migrate(): void {
  const db = new Database(config.DATABASE_URL);
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    db.exec(stmt);
  }
  db.close();
}

if (require.main === module) {
  migrate();
  console.log('Migration complete.');
}
