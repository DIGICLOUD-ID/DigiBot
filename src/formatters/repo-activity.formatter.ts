import type { ForkEventPayload, WatchEventPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatForkEvent(payload: ForkEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const user = payload.sender.login;
  const forkeeName = payload.forkee.full_name;

  const text =
    `> *[GITHUB // REPOSITORY FORKED]*\n` +
    `> *Source:* ${repoName}\n` +
    `> *Fork:* \`${forkeeName}\`\n\n` +
    `*Details:*\n` +
    `- *User:* ${user}\n` +
    `- *Fork URL:* ${payload.forkee.html_url}\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`;

  return {
    text,
    title: `[FORK] ${forkeeName}`,
    subtitle: `Forked from ${repoName} by ${user}`,
    sourceUrl: payload.forkee.html_url,
  };
}

export function formatWatchEvent(payload: WatchEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const user = payload.sender.login;

  const text =
    `> *[GITHUB // STAR ADDED]*\n` +
    `> *Repository:* ${repoName}\n\n` +
    `*Details:*\n` +
    `- *Starred by:* ${user}\n` +
    `- *Action:* STARRED\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`;

  return {
    text,
    title: `[STAR] ${repoName}`,
    subtitle: `Starred by ${user}`,
    sourceUrl: payload.repository.html_url,
  };
}
