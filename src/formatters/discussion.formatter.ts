import type { DiscussionEventPayload, DiscussionCommentEventPayload } from '../types/github.js';

export function formatDiscussionEvent(payload: DiscussionEventPayload): string {
  const repoName = payload.repository.full_name;
  const discussion = payload.discussion;
  const author = discussion.user.login;
  const actor = payload.sender.login;

  let header = '💡 *NEW DISCUSSION CREATED*';
  if (payload.action === 'answered') {
    header = '✅ *DISCUSSION ANSWERED*';
  } else if (payload.action === 'closed') {
    header = '🔒 *DISCUSSION CLOSED*';
  } else if (payload.action !== 'created') {
    header = `💡 *DISCUSSION ${payload.action.toUpperCase()}*`;
  }

  const cleanBody = discussion.body?.trim().replace(/\r?\n+/g, ' ') || '';
  const snippet = cleanBody.length > 140 ? `${cleanBody.substring(0, 140)}...` : cleanBody;

  return (
    `${header}\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Author:* ${author}\n` +
    (actor !== author ? `⚡ *Action by:* ${actor}\n` : '') +
    `🏷️ *Category:* ${discussion.category.name}\n` +
    `📝 *Title:* #${discussion.number} - ${discussion.title.trim()}\n` +
    (snippet ? `\n📄 *Preview:* _"${snippet}"_\n` : '') +
    `\n🔗 *URL:* ${discussion.html_url}`
  );
}

export function formatDiscussionCommentEvent(payload: DiscussionCommentEventPayload): string {
  const repoName = payload.repository.full_name;
  const discussion = payload.discussion;
  const comment = payload.comment;
  const commenter = comment.user.login;

  const cleanBody = comment.body.trim().replace(/\r?\n+/g, ' ');
  const snippet = cleanBody.length > 140 ? `${cleanBody.substring(0, 140)}...` : cleanBody;

  return (
    `💬 *NEW COMMENT ON DISCUSSION*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `📝 *Discussion:* #${discussion.number} - ${discussion.title.trim()}\n` +
    `👤 *User:* ${commenter}\n\n` +
    `💬 *Comment:*\n` +
    `_"${snippet}"_\n\n` +
    `🔗 *URL:* ${comment.html_url}`
  );
}
