import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import * as db from '../db/db';
import { isAdmin } from '../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;
  const settings = db.getGuildSettings(guildId);
  const member = interaction.member as GuildMember;

  if (!isAdmin(member, settings)) {
    await interaction.reply({ embeds: [createErrorEmbed('You need admin permissions to manage alerts.')], ephemeral: true });
    return;
  }

  const enabled = interaction.options.getBoolean('enabled', true);

  if (sub === 'live-results') {
    db.upsertGuildSettings(guildId, { live_results_enabled: enabled ? 1 : 0 });
    await interaction.reply({ embeds: [createSuccessEmbed('Alerts Updated', `Live results alerts ${enabled ? 'enabled' : 'disabled'}.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'candidates') {
    await interaction.reply({ embeds: [createSuccessEmbed('Alerts Updated', `Candidate alerts ${enabled ? 'enabled' : 'disabled'}.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'polling-station') {
    await interaction.reply({ embeds: [createSuccessEmbed('Alerts Updated', `Polling station alerts ${enabled ? 'enabled' : 'disabled'}.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'digest') {
    db.upsertGuildSettings(guildId, { digest_enabled: enabled ? 1 : 0 });
    await interaction.reply({ embeds: [createSuccessEmbed('Alerts Updated', `Daily digest ${enabled ? 'enabled' : 'disabled'}.`, settings?.embed_colour ?? '#2f80ed')] });

  } else {
    await interaction.reply({ embeds: [createErrorEmbed('Unknown subcommand.')], ephemeral: true });
  }
}
