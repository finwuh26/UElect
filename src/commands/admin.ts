import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import * as db from '../db/db';
import { isAdmin } from '../utils/permissions';
import { createErrorEmbed } from '../utils/embeds';
import * as cache from '../services/cache';

interface AuditRow {
  id: number;
  created_at: string;
  action: string;
  user_id: string;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;
  const settings = db.getGuildSettings(guildId);
  const member = interaction.member as GuildMember;

  if (!isAdmin(member, settings)) {
    await interaction.reply({ embeds: [createErrorEmbed('You need admin permissions to use admin commands.')], ephemeral: true });
    return;
  }

  const color = parseInt((settings?.embed_colour ?? '#2f80ed').replace('#', ''), 16);

  if (sub === 'list-subscriptions') {
    const subs = db.getSubscriptions(guildId);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('📋 Active Subscriptions')
      .setDescription(subs.length === 0 ? 'No active subscriptions.' : subs.map(s => `**#${s.id}** ${s.type} in <#${s.channel_id}>${s.postcode ? ` — ${s.postcode}` : ''}${s.election_id ? ` — ${s.election_id}` : ''}`).join('\n'))
      .setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' });
    await interaction.reply({ embeds: [embed], ephemeral: true });

  } else if (sub === 'force-update') {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setTitle('🔄 Force Update').setDescription('Manual update triggered. Check back shortly for new data.').setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' })], ephemeral: true });

  } else if (sub === 'clear-cache') {
    cache.clear();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setTitle('🗑️ Cache Cleared').setDescription('Cache has been cleared successfully.').setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' })], ephemeral: true });

  } else if (sub === 'audit-log') {
    const limit = interaction.options.getInteger('limit') ?? 10;
    const rows = (db.db as unknown as { prepare: (sql: string) => { all: (guildId: string, limit: number) => AuditRow[] } })
      .prepare('SELECT * FROM audit_log WHERE guild_id = ? ORDER BY id DESC LIMIT ?').all(guildId, limit);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('📜 Audit Log')
      .setDescription(rows.length === 0 ? 'No audit log entries.' : rows.map(r => `\`${r.created_at}\` **${r.action}** by <@${r.user_id}>`).join('\n'))
      .setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' });
    await interaction.reply({ embeds: [embed], ephemeral: true });

  } else {
    await interaction.reply({ embeds: [createErrorEmbed('Unknown subcommand.')], ephemeral: true });
  }
}
