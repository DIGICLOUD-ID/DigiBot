import type { PushEventPayload } from '../types/github.js';

export function formatPushEvent(payload: PushEventPayload): string {
  const repoName = payload.repository.full_name;
  const pusherName = payload.pusher.name || payload.sender.login;
  const branch = payload.ref.replace('refs/heads/', '');
  const commitCount = payload.commits.length;

  let commitsBlock = '';
  if (commitCount > 0) {
    const displayCommits = payload.commits.slice(0, 5);
    commitsBlock = displayCommits
      .map((c) => {
        const hash = c.id.substring(0, 7);
        const title = c.message.split('\n')[0]?.trim() || 'No commit message';
        return `[${hash}] ${title}`;
      })
      .join('\n');

    if (commitCount > 5) {
      commitsBlock += `\n...and ${commitCount - 5} more commit(s)`;
    }
  } else {
    commitsBlock = 'No new commits (branch update)';
  }

  let targetUrl = payload.compare;
  if (commitCount === 1 && payload.head_commit) {
    targetUrl = payload.head_commit.url;
  } else if (!targetUrl) {
    targetUrl = payload.repository.html_url;
  }

  const beforeHash = payload.before.substring(0, 7);
  const afterHash = payload.after.substring(0, 7);

  return (
    `> *[GITHUB // PUSH]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Branch:* \`${branch}\`\n\n` +
    `*Summary:*\n` +
    `- *Author:* ${pusherName}\n` +
    `- *Total Commits:* ${commitCount}\n` +
    `- *Changes:* \`${beforeHash}...${afterHash}\`\n\n` +
    `*Commits:*\n` +
    `\`\`\`\n` +
    `${commitsBlock}\n` +
    `\`\`\`\n\n` +
    `*Reference:*\n` +
    `${targetUrl}`
  );
}
