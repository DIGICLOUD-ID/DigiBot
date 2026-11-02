import type { IssuesEventPayload } from '../types/github.js';

export function formatIssuesEvent(payload: IssuesEventPayload): string {
  const repoName = payload.repository.full_name;
  const issue = payload.issue;
  const author = issue.user.login;
  const actor = payload.sender.login;

  let titleHeader = '⚠️ *ISSUE OPENED*';
  if (payload.action === 'closed') {
    titleHeader = '✅ *ISSUE CLOSED*';
  } else if (payload.action === 'reopened') {
    titleHeader = '🔄 *ISSUE REOPENED*';
  } else if (payload.action === 'edited') {
    titleHeader = '✏️ *ISSUE EDITED*';
  } else {
    titleHeader = `⚠️ *ISSUE ${payload.action.toUpperCase()}*`;
  }

  const issueNumber = `#${issue.number}`;
  const issueTitle = issue.title.trim();

  let bodyExcerpt = '';
  if (payload.action === 'opened' && issue.body) {
    const cleanBody = issue.body.trim().replace(/\r?\n+/g, ' ');
    const snippet = cleanBody.length > 120 ? `${cleanBody.substring(0, 120)}...` : cleanBody;
    bodyExcerpt = `\n📄 *Description:* _"${snippet}"_\n`;
  }

  return (
    `${titleHeader}\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Author:* ${author}\n` +
    (actor !== author ? `⚡ *Action by:* ${actor}\n` : '') +
    `📝 *Title:* ${issueTitle}\n` +
    `🔢 *Issue:* ${issueNumber}` +
    bodyExcerpt +
    `\n🔗 *URL:* ${issue.html_url}`
  );
}
