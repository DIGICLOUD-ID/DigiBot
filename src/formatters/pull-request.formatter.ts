import type { PullRequestEventPayload } from '../types/github.js';

export function formatPullRequestEvent(payload: PullRequestEventPayload): string {
  const repoName = payload.repository.full_name;
  const pr = payload.pull_request;
  const author = pr.user.login;
  const actor = payload.sender.login;

  let actionLabel = payload.action.toUpperCase();
  let statusDetail = pr.draft ? 'Draft' : 'Open';

  if (payload.action === 'closed') {
    if (pr.merged) {
      actionLabel = 'CLOSED (MERGED)';
      statusDetail = 'Merged into ' + pr.base.ref;
    } else {
      actionLabel = 'CLOSED (UNMERGED)';
      statusDetail = 'Closed without merge';
    }
  } else if (payload.action === 'synchronize') {
    actionLabel = 'COMMITS UPDATED';
    statusDetail = 'New commit(s) pushed to head';
  } else if (payload.action === 'reopened') {
    actionLabel = 'REOPENED';
    statusDetail = 'Reopened for review';
  }

  let descriptionSection = '';
  if (pr.body) {
    const cleanBody = pr.body.trim().replace(/\r?\n+/g, ' ');
    const snippet = cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody;
    descriptionSection = `\n*Description:*\n\`\`\`\n${snippet}\n\`\`\`\n`;
  }

  return (
    `> *[GITHUB // PULL REQUEST]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Action:* ${actionLabel}\n\n` +
    `*Details:*\n` +
    `- *Title:* ${pr.title.trim()}\n` +
    `- *Number:* \`#${pr.number}\`\n` +
    `- *Author:* ${author}\n` +
    (actor !== author ? `- *Action by:* ${actor}\n` : '') +
    `- *Branch:* \`${pr.base.ref}\` <- \`${pr.head.ref}\`\n` +
    `- *Status:* ${statusDetail}\n` +
    descriptionSection +
    `\n*Reference:*\n` +
    `${pr.html_url}`
  );
}
