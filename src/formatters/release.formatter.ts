import type { ReleaseEventPayload } from '../types/github.js';

export function formatReleaseEvent(payload: ReleaseEventPayload): string {
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

  return (
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
    `${release.html_url}`
  );
}
