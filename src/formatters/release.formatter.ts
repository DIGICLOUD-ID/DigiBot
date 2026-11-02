import type { ReleaseEventPayload } from '../types/github.js';

export function formatReleaseEvent(payload: ReleaseEventPayload): string {
  const repoName = payload.repository.full_name;
  const release = payload.release;
  const author = release.author.login || payload.sender.login;

  let header = '🎉 *NEW RELEASE PUBLISHED*';
  if (payload.action === 'created') {
    header = '📦 *RELEASE DRAFT CREATED*';
  } else if (payload.action === 'edited') {
    header = '✏️ *RELEASE EDITED*';
  } else if (payload.action === 'prereleased') {
    header = '🧪 *PRERELEASE PUBLISHED*';
  }

  const tagName = release.tag_name;
  const releaseName = release.name || tagName;

  let bodyExcerpt = '';
  if (release.body) {
    const cleanBody = release.body.trim().replace(/\r?\n+/g, ' ');
    const snippet = cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody;
    bodyExcerpt = `\n📝 *Notes:* _"${snippet}"_\n`;
  }

  return (
    `${header}\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `🏷️ *Tag:* \`${tagName}\`\n` +
    `📌 *Name:* ${releaseName}\n` +
    `👤 *Author:* ${author}` +
    bodyExcerpt +
    `\n🔗 *URL:* ${release.html_url}`
  );
}
