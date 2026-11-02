import type { PushEventPayload } from '../types/github.js';

export function formatPushEvent(payload: PushEventPayload): string {
  const repoName = payload.repository.full_name;
  const pusherName = payload.pusher.name || payload.sender.login;
  const branch = payload.ref.replace('refs/heads/', '');
  const commitCount = payload.commits.length;

  // Format list of commits (up to 5 to avoid overly long messages)
  let commitsList = '';
  if (commitCount > 0) {
    const displayCommits = payload.commits.slice(0, 5);
    commitsList = displayCommits
      .map((c) => {
        const shortHash = c.id.substring(0, 7);
        const firstLine = c.message.split('\n')[0]?.trim() || 'No commit message';
        return `• \`${shortHash}\` - ${firstLine}`;
      })
      .join('\n');

    if (commitCount > 5) {
      commitsList += `\n_...and ${commitCount - 5} more commit(s)_`;
    }
  } else {
    commitsList = '_No new commits (branch update)_';
  }

  // URL priority: compare URL if multiple, single commit URL if 1 commit, repo URL otherwise
  let targetUrl = payload.compare;
  if (commitCount === 1 && payload.head_commit) {
    targetUrl = payload.head_commit.url;
  } else if (!targetUrl) {
    targetUrl = payload.repository.html_url;
  }

  return (
    `🚀 *GITHUB PUSH*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Author:* ${pusherName}\n` +
    `🌿 *Branch:* ${branch}\n` +
    `📊 *Commits:* ${commitCount}\n\n` +
    `📝 *Commit(s):*\n` +
    `${commitsList}\n\n` +
    `🔗 *URL:* ${targetUrl}`
  );
}
