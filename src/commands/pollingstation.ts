import { ChatInputCommandInteraction } from 'discord.js';
import * as electoralCommission from '../services/electoralCommission';
import { createPollingStationEmbed, createErrorEmbed } from '../utils/embeds';
import { validatePostcode, normalisePostcode } from '../utils/normalise';
import * as db from '../db/db';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const raw = interaction.options.getString('postcode', true);
  const postcode = normalisePostcode(raw);

  if (!validatePostcode(postcode)) {
    await interaction.reply({ embeds: [createErrorEmbed(`Invalid postcode: ${raw}`)], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const settings = db.getGuildSettings(interaction.guildId!);
  const color = settings?.embed_colour ?? '#2f80ed';

  const data = await electoralCommission.getElectionInfoByPostcode(postcode);
  if (!data) {
    await interaction.editReply({ embeds: [createErrorEmbed('Could not fetch polling station information. Please try again later.')] });
    return;
  }

  await interaction.editReply({ embeds: [createPollingStationEmbed(data, color)] });
}
