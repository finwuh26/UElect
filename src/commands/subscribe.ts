import { ChatInputCommandInteraction } from 'discord.js';
import * as db from '../db/db';
import { validatePostcode, normalisePostcode } from '../utils/normalise';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';
import { SubscriptionType } from '../types';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;
  const channelOption = interaction.options.getChannel('channel');
  const channelId = channelOption?.id ?? interaction.channelId;

  db.upsertGuild(guildId, interaction.guild?.name ?? 'Unknown');

  const base = {
    guild_id: guildId,
    channel_id: channelId,
    enabled: 1,
    created_by: interaction.user.id,
    created_at: new Date().toISOString(),
    postcode: null,
    election_id: null,
    constituency: null,
    council: null,
    region: null,
  };

  try {
    if (sub === 'postcode') {
      const raw = interaction.options.getString('postcode', true);
      const postcode = normalisePostcode(raw);
      if (!validatePostcode(postcode)) {
        await interaction.reply({ embeds: [createErrorEmbed(`Invalid postcode: ${raw}`)], ephemeral: true });
        return;
      }
      db.addSubscription({ ...base, type: 'postcode' as SubscriptionType, postcode });
      await interaction.reply({ embeds: [createSuccessEmbed('Subscribed', `Subscribed to election updates for postcode area.`, '#2f80ed')] });

    } else if (sub === 'election') {
      const electionId = interaction.options.getString('election_id', true);
      db.addSubscription({ ...base, type: 'election' as SubscriptionType, election_id: electionId });
      await interaction.reply({ embeds: [createSuccessEmbed('Subscribed', `Subscribed to updates for election \`${electionId}\`.`, '#2f80ed')] });

    } else if (sub === 'constituency') {
      const constituency = interaction.options.getString('constituency', true);
      db.addSubscription({ ...base, type: 'constituency' as SubscriptionType, constituency });
      await interaction.reply({ embeds: [createSuccessEmbed('Subscribed', `Subscribed to updates for constituency **${constituency}**.`, '#2f80ed')] });

    } else if (sub === 'council') {
      const council = interaction.options.getString('council', true);
      db.addSubscription({ ...base, type: 'council' as SubscriptionType, council });
      await interaction.reply({ embeds: [createSuccessEmbed('Subscribed', `Subscribed to updates for council **${council}**.`, '#2f80ed')] });

    } else if (sub === 'national') {
      db.addSubscription({ ...base, type: 'national' as SubscriptionType });
      await interaction.reply({ embeds: [createSuccessEmbed('Subscribed', 'Subscribed to national election updates.', '#2f80ed')] });

    } else if (sub === 'results') {
      db.addSubscription({ ...base, type: 'results' as SubscriptionType });
      await interaction.reply({ embeds: [createSuccessEmbed('Subscribed', 'Subscribed to live election results.', '#2f80ed')] });

    } else {
      await interaction.reply({ embeds: [createErrorEmbed('Unknown subcommand.')], ephemeral: true });
    }
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'SQLITE_CONSTRAINT' || error?.message?.includes('UNIQUE')) {
      await interaction.reply({ embeds: [createErrorEmbed('You already have this subscription in this channel.')], ephemeral: true });
    } else {
      throw err;
    }
  }
}
