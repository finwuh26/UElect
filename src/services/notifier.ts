import { Client, TextChannel } from 'discord.js';
import { NormalizedElection, NormalizedResult, Subscription } from '../types';
import * as db from '../db/db';
import { hashContent } from '../utils/normalise';
import { createElectionEmbed, createResultEmbed } from '../utils/embeds';
import { canPost, increment } from '../utils/rateLimit';
import logger from '../logger';
import { GuildSettings } from '../types';

export async function notifyElection(
  client: Client,
  subscription: Subscription,
  election: NormalizedElection,
  settings: GuildSettings | null,
): Promise<void> {
  if (!canPost(subscription.guild_id)) {
    logger.warn({ guildId: subscription.guild_id }, 'Rate limit reached for guild');
    return;
  }

  const contentHash = hashContent(election);
  const existing = db.getSeenUpdates(subscription.guild_id, election.source, election.id ?? election.name);
  if ((existing as Array<{ content_hash: string }>).some(e => e.content_hash === contentHash)) return;

  try {
    const channel = await client.channels.fetch(subscription.channel_id);
    if (!channel || !(channel instanceof TextChannel)) return;

    const embed = createElectionEmbed(election, settings?.embed_colour ?? '#2f80ed');
    await channel.send({ embeds: [embed] });

    db.addSeenUpdate(subscription.guild_id, subscription.id, election.source, election.id ?? election.name, contentHash);
    increment(subscription.guild_id);
  } catch (err) {
    logger.error({ err, subscriptionId: subscription.id }, 'Failed to send election notification');
  }
}

export async function notifyResult(
  client: Client,
  subscription: Subscription,
  result: NormalizedResult,
  settings: GuildSettings | null,
): Promise<void> {
  if (!canPost(subscription.guild_id)) {
    logger.warn({ guildId: subscription.guild_id }, 'Rate limit reached for guild');
    return;
  }

  const contentHash = hashContent(result);
  const externalId = result.electionId ?? result.area ?? 'unknown';
  const existing = db.getSeenUpdates(subscription.guild_id, result.source, externalId);
  if ((existing as Array<{ content_hash: string }>).some(e => e.content_hash === contentHash)) return;

  try {
    const channel = await client.channels.fetch(subscription.channel_id);
    if (!channel || !(channel instanceof TextChannel)) return;

    const embed = createResultEmbed(result, settings?.embed_colour ?? '#2f80ed');
    await channel.send({ embeds: [embed] });

    db.addSeenUpdate(subscription.guild_id, subscription.id, result.source, externalId, contentHash);
    increment(subscription.guild_id);
  } catch (err) {
    logger.error({ err, subscriptionId: subscription.id }, 'Failed to send result notification');
  }
}
