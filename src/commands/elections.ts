import { ChatInputCommandInteraction } from 'discord.js';
import * as democracyClub from '../services/democracyClub';
import { createElectionEmbed, createErrorEmbed } from '../utils/embeds';
import { validatePostcode, normalisePostcode } from '../utils/normalise';
import * as db from '../db/db';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const settings = db.getGuildSettings(interaction.guildId!);
  const color = settings?.embed_colour ?? '#2f80ed';

  await interaction.deferReply();

  if (sub === 'postcode') {
    const raw = interaction.options.getString('postcode', true);
    const postcode = normalisePostcode(raw);
    if (!validatePostcode(postcode)) {
      await interaction.editReply({ embeds: [createErrorEmbed(`Invalid postcode: ${raw}`)] });
      return;
    }
    const elections = await democracyClub.getElectionsByPostcode(postcode);
    if (elections.length === 0) {
      await interaction.editReply({ embeds: [createErrorEmbed('No upcoming elections found for this postcode.')] });
      return;
    }
    const embeds = elections.slice(0, 3).map(e => createElectionEmbed(e, color));
    await interaction.editReply({ embeds });

  } else if (sub === 'national') {
    await interaction.editReply({ embeds: [createErrorEmbed('National election lookups coming soon.')] });

  } else if (sub === 'constituency') {
    const name = interaction.options.getString('name', true);
    await interaction.editReply({ embeds: [createErrorEmbed(`Constituency lookup for **${name}** coming soon.`)] });

  } else if (sub === 'council') {
    const name = interaction.options.getString('name', true);
    await interaction.editReply({ embeds: [createErrorEmbed(`Council lookup for **${name}** coming soon.`)] });

  } else {
    await interaction.editReply({ embeds: [createErrorEmbed('Unknown subcommand.')] });
  }
}
