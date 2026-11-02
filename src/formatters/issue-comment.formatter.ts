import type { IssueCommentEventPayload } from '../types/github.js';

export function formatIssueCommentEvent(payload: IssueCommentEventPayload): string {
  const repoName = payload.repository.full_name;
  const issue = payload.issue;
  const comment = payload.comment;
  const commenter = comment.user.login;
  const isPR = Boolean(issue.pull_request);
  const targetType = isPR ? 'PULL REQUEST' : 'ISSUE';

  let header = `💬 *NEW COMMENT ON ${targetType}*`;
  if (payload.action === 'edited') {
    header = `✏️ *COMMENT EDITED ON ${targetType}*`;
  } else if (payload.action === 'deleted') {
    header = `🗑️ *COMMENT DELETED ON ${targetType}*`;
  }

  const cleanBody = comment.body.trim().replace(/\r?\n+/g, ' ');
  const snippet = cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody;

  return (
    `${header}\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `🔢 *${targetType}:* #${issue.number} - ${issue.title.trim()}\n` +
    `👤 *User:* ${commenter}\n\n` +
    `💬 *Comment:*\n` +
    `_"${snippet}"_\n\n` +
    `🔗 *URL:* ${comment.html_url}`
  );
}
