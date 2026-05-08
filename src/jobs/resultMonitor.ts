import { Client } from 'discord.js';
import * as db from '../db/db';
import * as democracyClub from '../services/democracyClub';
import { notifyResult } from '../services/notifier';
import logger from '../logger';

export async function runResultMonitor(client: Client): Promise<void> {
  const guildsRows = db.getSubscriptionGuildIds('results');

  for (const { guild_id } of guildsRows) {
    const settings = db.getGuildSettings(guild_id);
    if (!settings?.live_results_enabled) continue;

    const allSubs = db.getSubscriptions(guild_id);
    const subscriptions = allSubs.filter(s => s.type === 'results');
    const electionSubs = allSubs.filter(s => s.election_id);

    for (const sub of subscriptions) {
      for (const s of electionSubs) {
        try {
          const result = await democracyClub.getResultsByElection(s.election_id!);
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
