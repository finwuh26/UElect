import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import * as db from '../db/db';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const settings = db.getGuildSettings(interaction.guildId!);
  const color = parseInt((settings?.embed_colour ?? '#2f80ed').replace('#', ''), 16);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('📚 Data Sources')
    .setDescription('UElect uses the following official and verified data sources:')
    .addFields(
      { name: '🗳️ Electoral Commission / WDIV', value: 'Official polling station and registration data\nhttps://www.electoralcommission.org.uk/', inline: false },
      { name: '🏛️ Democracy Club', value: 'Crowd-verified candidate and election data\nhttps://democracyclub.org.uk/', inline: false },
      { name: '⚖️ UK Parliament Members API', value: 'Official current MP and peer information\nhttps://members-api.parliament.uk/', inline: false },
    )
    .setFooter({ text: 'UElect · UK election updates · Sources linked · Non-partisan' });

  await interaction.reply({ embeds: [embed] });
}
