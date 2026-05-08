import { Client } from 'discord.js';
import * as db from '../db/db';
import * as democracyClub from '../services/democracyClub';
import { notifyResult } from '../services/notifier';
import logger from '../logger';

export async function runResultMonitor(client: Client): Promise<void> {
  const guildsRows = (db.db as unknown as { prepare: (sql: string) => { all: (arg: string) => Array<{ guild_id: string }> } })
    .prepare('SELECT DISTINCT guild_id FROM subscriptions WHERE enabled = 1 AND type = ?').all('results');

  for (const { guild_id } of guildsRows) {
    const settings = db.getGuildSettings(guild_id);
    if (!settings?.live_results_enabled) continue;

    const subscriptions = db.getSubscriptions(guild_id).filter(s => s.type === 'results');

    for (const sub of subscriptions) {
      const allSubs = db.getSubscriptions(guild_id);
      for (const s of allSubs) {
        if (s.election_id) {
          try {
            const result = await democracyClub.getResultsByElection(s.election_id);
            if (result) {
              await notifyResult(client, sub, result, settings);
            }
          } catch (err) {
            logger.error({ err, subscriptionId: sub.id }, 'Result monitor error');
          }
        }
      }
    }
  }
}
