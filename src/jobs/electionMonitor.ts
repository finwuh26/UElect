import { Client } from 'discord.js';
import * as db from '../db/db';
import * as democracyClub from '../services/democracyClub';
import { notifyElection } from '../services/notifier';
import logger from '../logger';

export async function runElectionMonitor(client: Client): Promise<void> {
  const guildsRows = (db.db as unknown as { prepare: (sql: string) => { all: () => Array<{ guild_id: string }> } })
    .prepare('SELECT DISTINCT guild_id FROM subscriptions WHERE enabled = 1').all();

  for (const { guild_id } of guildsRows) {
    const settings = db.getGuildSettings(guild_id);
    const subscriptions = db.getSubscriptions(guild_id);

    for (const sub of subscriptions) {
      if (sub.type === 'postcode' && sub.postcode) {
        try {
          const elections = await democracyClub.getElectionsByPostcode(sub.postcode);
          for (const election of elections) {
            await notifyElection(client, sub, election, settings);
          }
        } catch (err) {
          logger.error({ err, subscriptionId: sub.id }, 'Election monitor error for postcode subscription');
        }
      } else if (sub.type === 'election' && sub.election_id) {
        try {
          const election = await democracyClub.getElectionById(sub.election_id);
          if (election) {
            await notifyElection(client, sub, election, settings);
          }
        } catch (err) {
          logger.error({ err, subscriptionId: sub.id }, 'Election monitor error for election subscription');
        }
      }
    }
  }
}
