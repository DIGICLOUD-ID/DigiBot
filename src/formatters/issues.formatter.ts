import type { IssuesEventPayload } from '../types/github.js';

export function formatIssuesEvent(payload: IssuesEventPayload): string {
  const repoName = payload.repository.full_name;
  const issue = payload.issue;
  const author = issue.user.login;
  const actor = payload.sender.login;
  const actionLabel = payload.action.toUpperCase();

  let bodySection = '';
  if (issue.body) {
    const cleanBody = issue.body.trim().replace(/\r?\n+/g, ' ');
    const snippet = cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody;
    bodySection = `\n*Description:*\n\`\`\`\n${snippet}\n\`\`\`\n`;
  }

  return (
    `> *[GITHUB // ISSUE]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Action:* ${actionLabel}\n\n` +
    `*Details:*\n` +
    `- *Title:* ${issue.title.trim()}\n` +
    `- *Number:* \`#${issue.number}\`\n` +
    `- *Author:* ${author}\n` +
    (actor !== author ? `- *Action by:* ${actor}\n` : '') +
    `- *State:* ${issue.state.toUpperCase()}\n` +
    bodySection +
    `\n*Reference:*\n` +
    `${issue.html_url}`
  );
}
