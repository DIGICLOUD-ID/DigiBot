import type { PullRequestEventPayload } from '../types/github.js';

export function formatPullRequestEvent(payload: PullRequestEventPayload): string {
  const repoName = payload.repository.full_name;
  const pr = payload.pull_request;
  const author = pr.user.login;
  const actor = payload.sender.login;

  let titleHeader = '🔀 *PULL REQUEST OPENED*';
  if (payload.action === 'closed') {
    if (pr.merged) {
      titleHeader = '🟣 *PULL REQUEST MERGED*';
    } else {
      titleHeader = '❌ *PULL REQUEST CLOSED*';
    }
  } else if (payload.action === 'reopened') {
    titleHeader = '🔄 *PULL REQUEST REOPENED*';
  } else if (payload.action === 'synchronize') {
    titleHeader = '🔄 *PULL REQUEST COMMITS UPDATED*';
  } else {
    titleHeader = `🔀 *PULL REQUEST ${payload.action.toUpperCase()}*`;
  }

  const baseBranch = pr.base.ref;
  const headBranch = pr.head.ref;
  const prNumber = `#${pr.number}`;
  const prTitle = pr.title.trim();

  let message =
    `${titleHeader}\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Author:* ${author}\n` +
    (actor !== author ? `⚡ *Action by:* ${actor}\n` : '') +
    `📝 *Title:* ${prTitle}\n` +
    `🔢 *PR Number:* ${prNumber}\n` +
    `📌 *Base:* \`${baseBranch}\` ⬅️ 🌿 *Head:* \`${headBranch}\`\n`;

  if (pr.draft) {
    message += `📋 *Status:* Draft\n`;
  }

  message += `\n🔗 *URL:* ${pr.html_url}`;
  return message;
}
