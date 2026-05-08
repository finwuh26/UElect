import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import * as db from '../db/db';
import { isAdmin } from '../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;
  const settings = db.getGuildSettings(guildId);
  const member = interaction.member as GuildMember;

  if (sub !== 'view' && !isAdmin(member, settings)) {
    await interaction.reply({ embeds: [createErrorEmbed('You need admin permissions to change configuration.')], ephemeral: true });
    return;
  }

  if (sub === 'view') {
    if (!settings) {
      await interaction.reply({ embeds: [createErrorEmbed('No settings found. Run `/uelect setup` first.')], ephemeral: true });
      return;
    }
    await interaction.reply({
      embeds: [createSuccessEmbed('Server Configuration', [
        `**Default Channel:** ${settings.default_channel_id ? `<#${settings.default_channel_id}>` : 'Not set'}`,
        `**Admin Role:** ${settings.admin_role_id ? `<@&${settings.admin_role_id}>` : 'Not set'}`,
        `**Timezone:** ${settings.timezone}`,
        `**Update Interval:** ${settings.update_interval_minutes} minutes`,
        `**Digest:** ${settings.digest_enabled ? `Enabled at ${settings.digest_time}` : 'Disabled'}`,
        `**Live Results:** ${settings.live_results_enabled ? 'Enabled' : 'Disabled'}`,
        `**Embed Colour:** ${settings.embed_colour}`,
      ].join('\n'), settings.embed_colour)],
    });

  } else if (sub === 'channel') {
    const channel = interaction.options.getChannel('channel', true);
    db.upsertGuildSettings(guildId, { default_channel_id: channel.id });
    await interaction.reply({ embeds: [createSuccessEmbed('Updated', `Default channel updated to <#${channel.id}>.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'admin-role') {
    const role = interaction.options.getRole('role', true);
    db.upsertGuildSettings(guildId, { admin_role_id: role.id });
    await interaction.reply({ embeds: [createSuccessEmbed('Updated', `Admin role updated to <@&${role.id}>.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'interval') {
    const minutes = interaction.options.getInteger('minutes', true);
    db.upsertGuildSettings(guildId, { update_interval_minutes: minutes });
    await interaction.reply({ embeds: [createSuccessEmbed('Updated', `Update interval set to ${minutes} minutes.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'digest') {
    const enabled = interaction.options.getBoolean('enabled', true);
    const time = interaction.options.getString('time');
    db.upsertGuildSettings(guildId, { digest_enabled: enabled ? 1 : 0, ...(time ? { digest_time: time } : {}) });
    await interaction.reply({ embeds: [createSuccessEmbed('Updated', `Daily digest ${enabled ? 'enabled' : 'disabled'}${time ? ` at ${time}` : ''}.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'timezone') {
    const timezone = interaction.options.getString('timezone', true);
    db.upsertGuildSettings(guildId, { timezone });
    await interaction.reply({ embeds: [createSuccessEmbed('Updated', `Timezone set to ${timezone}.`, settings?.embed_colour ?? '#2f80ed')] });

  } else if (sub === 'colour') {
    const colour = interaction.options.getString('colour', true);
    db.upsertGuildSettings(guildId, { embed_colour: colour });
    await interaction.reply({ embeds: [createSuccessEmbed('Updated', `Embed colour set to ${colour}.`, colour)] });

  } else {
    await interaction.reply({ embeds: [createErrorEmbed('Unknown subcommand.')], ephemeral: true });
  }
}
