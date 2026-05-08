import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import * as db from '../db/db';
import * as democracyClub from '../services/democracyClub';
import logger from '../logger';

export async function runDailyDigest(client: Client): Promise<void> {
  const guildsRows = db.getDigestGuildSettings();

  for (const guildSettings of guildsRows) {
    const { guild_id, default_channel_id, embed_colour } = guildSettings;
    if (!default_channel_id) continue;

    try {
      const subscriptions = db.getSubscriptions(guild_id);
      const postcodes = [...new Set(subscriptions.filter(s => s.postcode).map(s => s.postcode as string))];

      if (postcodes.length === 0) continue;

      const allElections = await Promise.all(postcodes.map(pc => democracyClub.getElectionsByPostcode(pc)));
      const elections = allElections.flat();

      if (elections.length === 0) continue;

      const embed = new EmbedBuilder()
        .setColor(parseInt((embed_colour ?? '#2f80ed').replace('#', ''), 16))
        .setTitle('📅 Daily Election Digest')
        .setDescription(`Found ${elections.length} upcoming election(s).`)
        .setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' })
        .setTimestamp();

      const channel = await client.channels.fetch(default_channel_id);
      if (channel instanceof TextChannel) {
        await channel.send({ embeds: [embed] });
      }
    } catch (err) {
      logger.error({ err, guild_id }, 'Daily digest error');
    }
  }
}
