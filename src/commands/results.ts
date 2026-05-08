import { ChatInputCommandInteraction } from 'discord.js';
import * as democracyClub from '../services/democracyClub';
import { createResultEmbed, createErrorEmbed } from '../utils/embeds';
import * as db from '../db/db';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const settings = db.getGuildSettings(interaction.guildId!);
  const color = settings?.embed_colour ?? '#2f80ed';

  await interaction.deferReply();

  if (sub === 'election') {
    const electionId = interaction.options.getString('election_id', true);
    const result = await democracyClub.getResultsByElection(electionId);
    if (!result) {
      await interaction.editReply({ embeds: [createErrorEmbed(`No results found for election \`${electionId}\`.`)] });
      return;
    }
    await interaction.editReply({ embeds: [createResultEmbed(result, color)] });

  } else if (sub === 'constituency') {
    const name = interaction.options.getString('name', true);
    await interaction.editReply({ embeds: [createErrorEmbed(`Constituency results for **${name}** coming soon.`)] });

  } else if (sub === 'latest') {
    await interaction.editReply({ embeds: [createErrorEmbed('Latest results feature coming soon.')] });

  } else {
    await interaction.editReply({ embeds: [createErrorEmbed('Unknown subcommand.')] });
  }
}
