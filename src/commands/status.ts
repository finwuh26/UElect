import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import * as db from '../db/db';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const settings = db.getGuildSettings(guildId);
  const subscriptions = db.getSubscriptions(guildId);

  const embed = new EmbedBuilder()
    .setColor(parseInt((settings?.embed_colour ?? '#2f80ed').replace('#', ''), 16))
    .setTitle('📊 UElect Status')
    .addFields(
      { name: 'Server', value: interaction.guild?.name ?? 'Unknown', inline: true },
      { name: 'Subscriptions', value: subscriptions.length.toString(), inline: true },
      { name: 'Default Channel', value: settings?.default_channel_id ? `<#${settings.default_channel_id}>` : 'Not set', inline: true },
      { name: 'Timezone', value: settings?.timezone ?? 'Not configured', inline: true },
      { name: 'Daily Digest', value: settings?.digest_enabled ? `Enabled (${settings.digest_time})` : 'Disabled', inline: true },
      { name: 'Live Results', value: settings?.live_results_enabled ? 'Enabled' : 'Disabled', inline: true },
    )
    .setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' });

  await interaction.reply({ embeds: [embed] });
}
