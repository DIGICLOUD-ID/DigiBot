import type { GenericGitHubPayload } from '../types/github.js';

export function formatFallbackEvent(event: string, payload: GenericGitHubPayload): string {
  const repoName = payload.repository?.full_name || 'Unknown Repository';
  const senderName = payload.sender?.login || 'Unknown User';
  const action = payload.action ? ` (${payload.action})` : '';
  const url = payload.repository?.html_url || 'https://github.com';

  if (event === 'ping') {
    const zen = typeof payload['zen'] === 'string' ? payload['zen'] : 'Keep it logically awesome.';
    return (
      `🔔 *GITHUB WEBHOOK PING*\n\n` +
      `📦 *Repository:* ${repoName}\n` +
      `🧘 *Zen:* _"${zen}"_\n` +
      `👤 *Triggered by:* ${senderName}\n\n` +
      `✅ *Webhook setup verified successfully!*`
    );
  }

  return (
    `🔔 *GITHUB EVENT: ${event.toUpperCase()}${action}*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *User:* ${senderName}\n\n` +
    `🔗 *URL:* ${url}`
  );
}
