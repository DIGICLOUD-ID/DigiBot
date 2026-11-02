import type { ReleaseEventPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatReleaseEvent(payload: ReleaseEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const release = payload.release;
  const author = release.author.login || payload.sender.login;
  const actionLabel = payload.action.toUpperCase();

  let notesSection = '';
  if (release.body) {
    const cleanBody = release.body.trim().replace(/\r?\n+/g, ' ');
    const snippet = cleanBody.length > 250 ? `${cleanBody.substring(0, 250)}...` : cleanBody;
    notesSection = `\n*Release Notes:*\n\`\`\`\n${snippet}\n\`\`\`\n`;
  }

  const tagName = release.tag_name;
  const releaseName = release.name || tagName;

  const text =
    `> *[GITHUB // RELEASE]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Tag:* \`${tagName}\`\n\n` +
    `*Details:*\n` +
    `- *Name:* ${releaseName}\n` +
    `- *Author:* ${author}\n` +
    `- *Action:* ${actionLabel}\n` +
    `- *Prerelease:* ${release.prerelease ? 'YES' : 'NO'}\n` +
    notesSection +
    `\n*Reference:*\n` +
    `${release.html_url}`;

  return {
    text,
    title: `[RELEASE ${tagName}] ${releaseName}`,
    subtitle: `${repoName} | ${actionLabel}`,
    sourceUrl: release.html_url,
  };
}
