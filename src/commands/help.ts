import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import * as db from '../db/db';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const settings = db.getGuildSettings(interaction.guildId!);
  const color = parseInt((settings?.embed_colour ?? '#2f80ed').replace('#', ''), 16);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('📖 UElect Help')
    .setDescription('UElect keeps your Discord server informed about UK elections.')
    .addFields(
      { name: '🚀 Getting Started', value: '`/uelect setup` — Configure UElect for your server', inline: false },
      { name: '📋 Subscriptions', value: '`/uelect subscribe postcode` — Subscribe to updates for a postcode\n`/uelect subscribe election` — Subscribe to a specific election\n`/uelect unsubscribe all` — Remove all subscriptions', inline: false },
      { name: '🗳️ Lookups', value: '`/uelect elections postcode` — List upcoming elections\n`/uelect candidates postcode` — List candidates\n`/uelect pollingstation` — Find your polling station\n`/uelect results election` — View election results', inline: false },
      { name: '⚙️ Configuration', value: '`/uelect config view` — View current settings\n`/uelect config channel` — Change default channel\n`/uelect alerts live-results` — Toggle live results', inline: false },
      { name: '📚 Sources', value: '`/uelect sources` — View data sources\n`/uelect status` — View bot status', inline: false },
    )
    .setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' });

  await interaction.reply({ embeds: [embed] });
}
