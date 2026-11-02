import type { GenericGitHubPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatFallbackEvent(event: string, payload: GenericGitHubPayload): FormattedMessage {
  const repoName = payload.repository?.full_name || 'Unknown Repository';
  const senderName = payload.sender?.login || 'Unknown User';
  const action = payload.action ? ` (${payload.action.toUpperCase()})` : '';
  const url = payload.repository?.html_url || 'https://github.com';

  if (event === 'ping') {
    const zen = typeof payload['zen'] === 'string' ? payload['zen'] : 'Keep it logically awesome.';
    const text =
      `> *[GITHUB // WEBHOOK PING]*\n` +
      `> *Repository:* ${repoName}\n\n` +
      `*Status:*\n` +
      `- *Connection:* ACTIVE\n` +
      `- *Triggered by:* ${senderName}\n` +
      `- *Zen:* "${zen}"\n\n` +
      `*Result:*\n` +
      `Webhook connection verified successfully.`;

    return {
      text,
      title: `[PING] ${repoName}`,
      subtitle: `Webhook verified by ${senderName}`,
      sourceUrl: url,
    };
  }

  const text =
    `> *[GITHUB // EVENT: ${event.toUpperCase()}${action}]*\n` +
    `> *Repository:* ${repoName}\n\n` +
    `*Details:*\n` +
    `- *Event:* \`${event}\`\n` +
    `- *User:* ${senderName}\n\n` +
    `*Reference:*\n` +
    `${url}`;

  return {
    text,
    title: `[EVENT: ${event.toUpperCase()}] ${repoName}`,
    subtitle: `Triggered by ${senderName}`,
    sourceUrl: url,
  };
}
