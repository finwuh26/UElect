import { EmbedBuilder } from 'discord.js';
import { NormalizedElection, NormalizedCandidate, NormalizedResult } from '../types';

const FOOTER_TEXT = 'UElect · UK election updates · Sources linked · Non-partisan';
const DEFAULT_COLOR = '#2f80ed';

function hexToInt(color: string): number {
  return parseInt(color.replace('#', ''), 16);
}

export function createElectionEmbed(election: NormalizedElection, color: string = DEFAULT_COLOR): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(hexToInt(color))
    .setTitle(`🗳️ ${election.name}`)
    .setFooter({ text: FOOTER_TEXT });

  if (election.date) embed.addFields({ name: 'Date', value: election.date, inline: true });
  if (election.area) embed.addFields({ name: 'Area', value: election.area, inline: true });
  if (election.status) embed.addFields({ name: 'Status', value: election.status, inline: true });
  if (election.sourceUrl) embed.setURL(election.sourceUrl);

  embed.addFields({ name: 'Source', value: election.source, inline: true });
  return embed;
}

export function createCandidateEmbed(
  candidates: NormalizedCandidate[],
  electionName: string,
  color: string = DEFAULT_COLOR,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(hexToInt(color))
    .setTitle(`👤 Candidates: ${electionName}`)
    .setFooter({ text: FOOTER_TEXT });

  if (candidates.length === 0) {
    embed.setDescription('No candidates found.');
    return embed;
  }

  const candidateList = candidates
    .slice(0, 25)
    .map(c => `**${c.name}**${c.party ? ` — ${c.party}` : ''}${c.area ? ` (${c.area})` : ''}`)
    .join('\n');

  embed.setDescription(candidateList);
  return embed;
}

export function createPollingStationEmbed(data: unknown, color: string = DEFAULT_COLOR): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(hexToInt(color))
    .setTitle('📍 Polling Station')
    .setFooter({ text: FOOTER_TEXT });

  const d = data as Record<string, unknown> | null;

  if (d?.polling_station) {
    const station = d.polling_station as Record<string, unknown>;
    const stationData = station.station as Record<string, unknown> | undefined;
    const props = stationData?.properties as Record<string, unknown> | undefined;
    if (props?.address) {
      embed.addFields({ name: 'Address', value: String(props.address), inline: false });
    }
    if (props?.postcode) {
      embed.addFields({ name: 'Postcode', value: String(props.postcode), inline: true });
    }
  } else if (d?.address_picker) {
    embed.setDescription('Multiple addresses found for this postcode. Please visit the Electoral Commission website for your specific polling station.');
  } else {
    embed.setDescription('No polling station information found. You may be able to vote by post or proxy.');
  }

  return embed;
}

export function createResultEmbed(result: NormalizedResult, color: string = DEFAULT_COLOR): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(hexToInt(color))
    .setTitle(`📊 Election Results${result.area ? `: ${result.area}` : ''}`)
    .setFooter({ text: FOOTER_TEXT });

  embed.addFields({ name: 'Status', value: result.status, inline: true });

  if (result.winner) {
    embed.addFields({ name: 'Winner', value: result.winner, inline: true });
  }

  if (result.candidates && result.candidates.length > 0) {
    const candidateResults = result.candidates
      .slice(0, 10)
      .map(c => {
        const elected = c.elected ? '✅ ' : '';
        const votes = c.votes !== undefined ? ` — ${c.votes.toLocaleString()} votes` : '';
        return `${elected}**${c.name}**${c.party ? ` (${c.party})` : ''}${votes}`;
      })
      .join('\n');
    embed.addFields({ name: 'Results', value: candidateResults, inline: false });
  }

  if (result.sourceUrl) embed.setURL(result.sourceUrl);
  embed.addFields({ name: 'Source', value: result.source, inline: true });

  return embed;
}

export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('❌ Error')
    .setDescription(message)
    .setFooter({ text: FOOTER_TEXT });
}

export function createSuccessEmbed(title: string, description: string, color: string = DEFAULT_COLOR): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(hexToInt(color))
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setFooter({ text: FOOTER_TEXT });
}
