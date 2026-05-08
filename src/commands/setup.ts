import { ChatInputCommandInteraction } from 'discord.js';
import * as db from '../db/db';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';
import { isAdmin } from '../utils/permissions';
import { GuildMember } from 'discord.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const member = interaction.member as GuildMember;
  const settings = db.getGuildSettings(interaction.guildId!);

  if (!isAdmin(member, settings)) {
    await interaction.reply({ embeds: [createErrorEmbed('You need the Manage Server permission to run setup.')], ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel('channel', true);
  const adminRole = interaction.options.getRole('admin_role');
  const timezone = interaction.options.getString('timezone');
  const digestTime = interaction.options.getString('digest_time');

  db.upsertGuild(interaction.guildId!, interaction.guild?.name ?? 'Unknown Guild');
  db.upsertGuildSettings(interaction.guildId!, {
    guild_id: interaction.guildId!,
    default_channel_id: channel.id,
    admin_role_id: adminRole?.id ?? null,
    timezone: timezone ?? 'Europe/London',
    digest_time: digestTime ?? '09:00',
  });

  db.addAuditLog(interaction.guildId!, interaction.user.id, 'setup', { channelId: channel.id });

  await interaction.reply({
    embeds: [createSuccessEmbed('Setup Complete', `Default channel set to <#${channel.id}>.\nUElect is now configured for this server.`, '#2f80ed')],
  });
}
