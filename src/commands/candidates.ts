import { ChatInputCommandInteraction } from 'discord.js';
import * as democracyClub from '../services/democracyClub';
import { createCandidateEmbed, createErrorEmbed } from '../utils/embeds';
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
    const ballots = await democracyClub.getBallotsByPostcode(postcode);
    if (ballots.length === 0) {
      await interaction.editReply({ embeds: [createErrorEmbed('No ballots found for this postcode.')] });
      return;
    }
    const firstBallot = ballots[0] as Record<string, unknown>;
    const candidates = await democracyClub.getCandidatesByElection(
      (firstBallot.ballot_paper_id ?? firstBallot.election_id) as string,
    );
    await interaction.editReply({ embeds: [createCandidateEmbed(candidates, (firstBallot.election_title ?? 'Election') as string, color)] });

  } else if (sub === 'election') {
    const electionId = interaction.options.getString('election_id', true);
    const candidates = await democracyClub.getCandidatesByElection(electionId);
    await interaction.editReply({ embeds: [createCandidateEmbed(candidates, electionId, color)] });

  } else if (sub === 'constituency') {
    const name = interaction.options.getString('name', true);
    await interaction.editReply({ embeds: [createErrorEmbed(`Constituency candidate lookup for **${name}** coming soon.`)] });

  } else {
    await interaction.editReply({ embeds: [createErrorEmbed('Unknown subcommand.')] });
  }
}
