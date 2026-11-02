import type { ForkEventPayload, WatchEventPayload } from '../types/github.js';

export function formatForkEvent(payload: ForkEventPayload): string {
  const repoName = payload.repository.full_name;
  const user = payload.sender.login;
  const forkeeName = payload.forkee.full_name;

  return (
    `> 🍴 *[GITHUB // REPOSITORY FORKED]*\n` +
    `> *Source:* ${repoName}\n` +
    `> *Fork:* \`${forkeeName}\`\n\n` +
    `*Details:*\n` +
    `- *User:* ${user}\n` +
    `- *Fork URL:* ${payload.forkee.html_url}\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`
  );
}

export function formatWatchEvent(payload: WatchEventPayload): string {
  const repoName = payload.repository.full_name;
  const user = payload.sender.login;

  return (
    `> ⭐ *[GITHUB // STAR ADDED]*\n` +
    `> *Repository:* ${repoName}\n\n` +
    `*Details:*\n` +
    `- *Starred by:* ${user}\n` +
    `- *Action:* STARRED\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`
  );
}
