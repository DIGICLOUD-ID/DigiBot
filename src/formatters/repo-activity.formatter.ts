import type { ForkEventPayload, WatchEventPayload } from '../types/github.js';

export function formatForkEvent(payload: ForkEventPayload): string {
  const repoName = payload.repository.full_name;
  const user = payload.sender.login;
  const forkeeName = payload.forkee.full_name;

  return (
    `🍴 *REPOSITORY FORKED*\n\n` +
    `📦 *Source:* ${repoName}\n` +
    `👤 *Forked by:* ${user}\n` +
    `🌿 *New Fork:* ${forkeeName}\n\n` +
    `🔗 *Fork URL:* ${payload.forkee.html_url}`
  );
}

export function formatWatchEvent(payload: WatchEventPayload): string {
  const repoName = payload.repository.full_name;
  const user = payload.sender.login;

  return (
    `⭐ *NEW STAR RECEIVED*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Starred by:* ${user}\n\n` +
    `🔗 *URL:* ${payload.repository.html_url}`
  );
}
