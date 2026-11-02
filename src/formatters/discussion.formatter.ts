import type { DiscussionEventPayload, DiscussionCommentEventPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatDiscussionEvent(payload: DiscussionEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const discussion = payload.discussion;
  const author = discussion.user.login;
  const actor = payload.sender.login;
  const actionLabel = payload.action.toUpperCase();

  let bodySection = '';
  if (discussion.body) {
    const cleanBody = discussion.body.trim().replace(/\r?\n+/g, ' ');
    const snippet = cleanBody.length > 200 ? `${cleanBody.substring(0, 200)}...` : cleanBody;
    bodySection = `\n*Content:*\n\`\`\`\n${snippet}\n\`\`\`\n`;
  }

  const text =
    `> *[GITHUB // DISCUSSION]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Category:* ${discussion.category.name}\n\n` +
    `*Details:*\n` +
    `- *Title:* ${discussion.title.trim()}\n` +
    `- *Number:* \`#${discussion.number}\`\n` +
    `- *Author:* ${author}\n` +
    (actor !== author ? `- *Action by:* ${actor}\n` : '') +
    `- *Action:* ${actionLabel}\n` +
    bodySection +
    `\n*Reference:*\n` +
    `${discussion.html_url}`;

  return {
    text,
    title: `[DISCUSSION #${discussion.number}] ${discussion.title.trim()}`,
    subtitle: `${repoName} | ${discussion.category.name}`,
    sourceUrl: discussion.html_url,
  };
}

export function formatDiscussionCommentEvent(payload: DiscussionCommentEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const discussion = payload.discussion;
  const comment = payload.comment;
  const commenter = comment.user.login;
  const actionLabel = payload.action.toUpperCase();

  const cleanBody = comment.body.trim().replace(/\r?\n+/g, ' ');
  const snippet = cleanBody.length > 200 ? `${cleanBody.substring(0, 200)}...` : cleanBody;

  const text =
    `> *[GITHUB // DISCUSSION COMMENT]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Target:* DISCUSSION \`#${discussion.number}\`\n\n` +
    `*Details:*\n` +
    `- *Title:* ${discussion.title.trim()}\n` +
    `- *User:* ${commenter}\n` +
    `- *Action:* ${actionLabel}\n\n` +
    `*Comment:*\n` +
    `\`\`\`\n` +
    `${snippet}\n` +
    `\`\`\`\n\n` +
    `*Reference:*\n` +
    `${comment.html_url}`;

  return {
    text,
    title: `[DISC COMMENT] #${discussion.number}`,
    subtitle: `${repoName} | By ${commenter}`,
    sourceUrl: comment.html_url,
  };
}
