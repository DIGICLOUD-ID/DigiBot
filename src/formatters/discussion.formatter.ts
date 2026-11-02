import type { DiscussionEventPayload, DiscussionCommentEventPayload } from '../types/github.js';

export function formatDiscussionEvent(payload: DiscussionEventPayload): string {
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

  return (
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
    `${discussion.html_url}`
  );
}

export function formatDiscussionCommentEvent(payload: DiscussionCommentEventPayload): string {
  const repoName = payload.repository.full_name;
  const discussion = payload.discussion;
  const comment = payload.comment;
  const commenter = comment.user.login;
  const actionLabel = payload.action.toUpperCase();

  const cleanBody = comment.body.trim().replace(/\r?\n+/g, ' ');
  const snippet = cleanBody.length > 200 ? `${cleanBody.substring(0, 200)}...` : cleanBody;

  return (
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
    `${comment.html_url}`
  );
}
