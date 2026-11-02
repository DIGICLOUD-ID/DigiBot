import type { IssueCommentEventPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatIssueCommentEvent(payload: IssueCommentEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const issue = payload.issue;
  const comment = payload.comment;
  const commenter = comment.user.login;
  const isPR = Boolean(issue.pull_request);
  const targetType = isPR ? 'PULL REQUEST' : 'ISSUE';
  const actionLabel = payload.action.toUpperCase();

  const cleanBody = comment.body.trim().replace(/\r?\n+/g, ' ');
  const snippet = cleanBody.length > 200 ? `${cleanBody.substring(0, 200)}...` : cleanBody;

  const text =
    `> *[GITHUB // ${targetType} COMMENT]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Target:* ${targetType} \`#${issue.number}\`\n\n` +
    `*Details:*\n` +
    `- *Title:* ${issue.title.trim()}\n` +
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
    title: `[COMMENT] #${issue.number} ${issue.title.trim()}`,
    subtitle: `${repoName} | By ${commenter}`,
    sourceUrl: comment.html_url,
  };
}
