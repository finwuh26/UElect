import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import * as db from '../db/db';
import { isAdmin } from '../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';
import { normalisePostcode } from '../utils/normalise';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;
  const settings = db.getGuildSettings(guildId);
  const member = interaction.member as GuildMember;

  if (!isAdmin(member, settings)) {
    await interaction.reply({ embeds: [createErrorEmbed('You need admin permissions to unsubscribe.')], ephemeral: true });
    return;
  }

  if (sub === 'postcode') {
    const raw = interaction.options.getString('postcode', true);
    const postcode = normalisePostcode(raw);
    db.removeSubscriptionsByFilter(guildId, { postcode });
    await interaction.reply({ embeds: [createSuccessEmbed('Unsubscribed', `Removed postcode subscription for ${postcode}.`, '#2f80ed')] });

  } else if (sub === 'election') {
    const electionId = interaction.options.getString('election_id', true);
    db.removeSubscriptionsByFilter(guildId, { election_id: electionId });
    await interaction.reply({ embeds: [createSuccessEmbed('Unsubscribed', `Removed election subscription for \`${electionId}\`.`, '#2f80ed')] });

  } else if (sub === 'all') {
    db.removeSubscriptionsByFilter(guildId, {});
    await interaction.reply({ embeds: [createSuccessEmbed('Unsubscribed', 'All subscriptions have been removed.', '#2f80ed')] });

  } else {
    await interaction.reply({ embeds: [createErrorEmbed('Unknown subcommand.')], ephemeral: true });
  }
}
