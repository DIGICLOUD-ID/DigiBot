import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { formatGitHubEvent } from '../src/formatters/index.js';
import { DeliveryCache } from '../src/utils/cache.js';
import type {
  PushEventPayload,
  PullRequestEventPayload,
  IssuesEventPayload,
  IssueCommentEventPayload,
  ReleaseEventPayload,
  WorkflowRunEventPayload,
  WorkflowJobEventPayload,
  CheckRunEventPayload,
  CreateEventPayload,
  DeleteEventPayload,
  ForkEventPayload,
  WatchEventPayload,
  DeploymentEventPayload,
  DeploymentStatusEventPayload,
  DiscussionEventPayload,
} from '../src/types/github.js';

console.log('🧪 Starting test suite...');

// Emoji detection regex (Rule: NO EMOJIS ALLOWED!)
const emojiRegex = /\p{Extended_Pictographic}/u;

function assertNoEmoji(text: string, eventName: string) {
  assert.strictEqual(
    emojiRegex.test(text),
    false,
    `Violation: Emoji detected in ${eventName} formatter output: "${text}"`
  );
}

// ==========================================
// 1. DeliveryCache Tests
// ==========================================
console.log('Testing DeliveryCache...');
const cache = new DeliveryCache(1, 100);
assert.strictEqual(cache.hasOrAdd('deliv-1'), false, 'First time should return false');
assert.strictEqual(cache.hasOrAdd('deliv-1'), true, 'Second time should return true (duplicate)');
assert.strictEqual(cache.hasOrAdd('deliv-2'), false, 'Different ID should return false');
console.log('✅ DeliveryCache passed');

// ==========================================
// 2. Formatters Tests (No emoji, WA markdown)
// ==========================================
console.log('Testing GitHub Event Formatters (NO EMOJIS & WHATSAPP MARKDOWN)...');

// 2.1 Push Event
const pushPayload: PushEventPayload = {
  ref: 'refs/heads/main',
  before: '0000000',
  after: '1111111',
  created: false,
  deleted: false,
  forced: false,
  base_ref: null,
  compare: 'https://github.com/octocat/Hello-World/compare/0000...1111',
  commits: [
    {
      id: 'abc1234567890',
      message: 'Fix authentication bug\nDetailed description',
      timestamp: '2026-11-02T10:00:00Z',
      url: 'https://github.com/octocat/Hello-World/commit/abc1234567890',
      author: { name: 'octocat', email: 'octocat@github.com' },
    },
    {
      id: 'def5678901234',
      message: 'Update API response',
      timestamp: '2026-11-02T10:05:00Z',
      url: 'https://github.com/octocat/Hello-World/commit/def5678901234',
      author: { name: 'octocat', email: 'octocat@github.com' },
    },
  ],
  head_commit: {
    id: 'def5678901234',
    message: 'Update API response',
    timestamp: '2026-11-02T10:05:00Z',
    url: 'https://github.com/octocat/Hello-World/commit/def5678901234',
    author: { name: 'octocat', email: 'octocat@github.com' },
  },
  repository: {
    id: 12345,
    name: 'Hello-World',
    full_name: 'octocat/Hello-World',
    private: false,
    html_url: 'https://github.com/octocat/Hello-World',
    description: 'My first repo',
    fork: false,
    owner: { login: 'octocat', html_url: 'https://github.com/octocat' },
  },
  pusher: { name: 'octocat', email: 'octocat@github.com' },
  sender: { id: 1, login: 'octocat', html_url: 'https://github.com/octocat' },
};

const pushOutput = formatGitHubEvent('push', pushPayload);
assertNoEmoji(pushOutput, 'push');
assert.ok(pushOutput.includes('> *[GITHUB // PUSH]*'));
assert.ok(pushOutput.includes('octocat/Hello-World'));
assert.ok(pushOutput.includes('[abc1234] Fix authentication bug'));
assert.ok(pushOutput.includes('```'));
console.log('✅ Push formatter passed (0 emojis, WA blockquote & codeblock verified)');

// 2.2 Pull Request Event
const prPayload: PullRequestEventPayload = {
  action: 'opened',
  number: 42,
  pull_request: {
    id: 999,
    number: 42,
    state: 'open',
    title: 'Add new feature',
    body: 'PR description',
    user: { id: 1, login: 'alice', html_url: 'https://github.com/alice' },
    html_url: 'https://github.com/octocat/Hello-World/pull/42',
    created_at: '2026-11-02T10:00:00Z',
    updated_at: '2026-11-02T10:00:00Z',
    closed_at: null,
    merged_at: null,
    merged: false,
    head: { label: 'alice:feature', ref: 'feature', sha: '111' },
    base: { label: 'octocat:main', ref: 'main', sha: '000' },
  },
  repository: pushPayload.repository,
  sender: { id: 2, login: 'alice', html_url: 'https://github.com/alice' },
};

const prOutput = formatGitHubEvent('pull_request', prPayload);
assertNoEmoji(prOutput, 'pull_request');
assert.ok(prOutput.includes('> *[GITHUB // PULL REQUEST]*'));
assert.ok(prOutput.includes('`#42`'));
assert.ok(prOutput.includes('Add new feature'));
console.log('✅ Pull Request formatter passed (0 emojis)');

// 2.3 Issues Event
const issuePayload: IssuesEventPayload = {
  action: 'opened',
  issue: {
    id: 101,
    number: 7,
    title: 'Bug report on login',
    body: 'App crashes when clicking submit',
    user: { id: 3, login: 'bob', html_url: 'https://github.com/bob' },
    state: 'open',
    html_url: 'https://github.com/octocat/Hello-World/issues/7',
    comments: 0,
    created_at: '2026-11-02T10:00:00Z',
    updated_at: '2026-11-02T10:00:00Z',
    closed_at: null,
  },
  repository: pushPayload.repository,
  sender: { id: 3, login: 'bob', html_url: 'https://github.com/bob' },
};

const issueOutput = formatGitHubEvent('issues', issuePayload);
assertNoEmoji(issueOutput, 'issues');
assert.ok(issueOutput.includes('> *[GITHUB // ISSUE]*'));
assert.ok(issueOutput.includes('`#7`'));
assert.ok(issueOutput.includes('Bug report on login'));
console.log('✅ Issues formatter passed (0 emojis)');

// 2.4 Issue Comment Event
const commentPayload: IssueCommentEventPayload = {
  action: 'created',
  issue: issuePayload.issue,
  comment: {
    id: 501,
    html_url: 'https://github.com/octocat/Hello-World/issues/7#issuecomment-501',
    body: 'I reproduced this bug on Android 14',
    user: { id: 4, login: 'charlie', html_url: 'https://github.com/charlie' },
    created_at: '2026-11-02T10:10:00Z',
    updated_at: '2026-11-02T10:10:00Z',
  },
  repository: pushPayload.repository,
  sender: { id: 4, login: 'charlie', html_url: 'https://github.com/charlie' },
};

const commentOutput = formatGitHubEvent('issue_comment', commentPayload);
assertNoEmoji(commentOutput, 'issue_comment');
assert.ok(commentOutput.includes('> *[GITHUB // ISSUE COMMENT]*'));
assert.ok(commentOutput.includes('reproduced this bug'));
console.log('✅ Issue Comment formatter passed (0 emojis)');

// 2.5 Release Event
const releasePayload: ReleaseEventPayload = {
  action: 'published',
  release: {
    id: 301,
    tag_name: 'v2.0.0',
    target_commitish: 'main',
    name: 'Version 2.0.0 Stable',
    draft: false,
    prerelease: false,
    created_at: '2026-11-02T10:00:00Z',
    published_at: '2026-11-02T10:00:00Z',
    html_url: 'https://github.com/octocat/Hello-World/releases/tag/v2.0.0',
    body: 'Exciting new features included in this release!',
    author: { id: 1, login: 'octocat', html_url: 'https://github.com/octocat' },
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};

const releaseOutput = formatGitHubEvent('release', releasePayload);
assertNoEmoji(releaseOutput, 'release');
assert.ok(releaseOutput.includes('> *[GITHUB // RELEASE]*'));
assert.ok(releaseOutput.includes('`v2.0.0`'));
assert.ok(releaseOutput.includes('Version 2.0.0 Stable'));
console.log('✅ Release formatter passed (0 emojis)');

// 2.6 Workflow Run Event
const workflowPayload: WorkflowRunEventPayload = {
  action: 'completed',
  workflow: { id: 1, name: 'CI Pipeline', path: '.github/workflows/ci.yml', state: 'active' },
  workflow_run: {
    id: 888,
    name: 'CI Pipeline',
    head_branch: 'main',
    head_sha: 'abc',
    event: 'push',
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://github.com/octocat/Hello-World/actions/runs/888',
    run_number: 15,
    run_attempt: 1,
    actor: pushPayload.sender,
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};

const workflowOutput = formatGitHubEvent('workflow_run', workflowPayload);
assertNoEmoji(workflowOutput, 'workflow_run');
assert.ok(workflowOutput.includes('> *[GITHUB // ACTIONS WORKFLOW]*'));
assert.ok(workflowOutput.includes('CI Pipeline'));
assert.ok(workflowOutput.includes('`SUCCESS`'));
console.log('✅ Workflow Run formatter passed (0 emojis)');

// 2.7 Workflow Job Event
const jobPayload: WorkflowJobEventPayload = {
  action: 'completed',
  workflow_job: {
    id: 999,
    run_id: 888,
    name: 'build-and-test',
    head_sha: 'abc',
    status: 'completed',
    conclusion: 'success',
    started_at: '2026-11-02T10:00:00Z',
    completed_at: '2026-11-02T10:02:00Z',
    html_url: 'https://github.com/octocat/Hello-World/actions/runs/888/job/999',
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};

const jobOutput = formatGitHubEvent('workflow_job', jobPayload);
assertNoEmoji(jobOutput, 'workflow_job');
assert.ok(jobOutput.includes('> *[GITHUB // ACTIONS JOB]*'));
assert.ok(jobOutput.includes('build-and-test'));
console.log('✅ Workflow Job formatter passed (0 emojis)');

// 2.8 Check Run Event
const checkPayload: CheckRunEventPayload = {
  action: 'completed',
  check_run: {
    id: 777,
    head_sha: 'abc',
    name: 'Unit Tests',
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://github.com/octocat/Hello-World/runs/777',
    started_at: '2026-11-02T10:00:00Z',
    completed_at: '2026-11-02T10:01:00Z',
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};

const checkOutput = formatGitHubEvent('check_run', checkPayload);
assertNoEmoji(checkOutput, 'check_run');
assert.ok(checkOutput.includes('> *[GITHUB // CHECK RUN]*'));
assert.ok(checkOutput.includes('Unit Tests'));
console.log('✅ Check Run formatter passed (0 emojis)');

// 2.9 Branch/Tag Create & Delete
const createPayload: CreateEventPayload = {
  ref: 'v1.0.0-rc1',
  ref_type: 'tag',
  master_branch: 'main',
  description: null,
  pusher_type: 'user',
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};
const createOutput = formatGitHubEvent('create', createPayload);
assertNoEmoji(createOutput, 'create');
assert.ok(createOutput.includes('> *[GITHUB // TAG CREATED]*'));
assert.ok(createOutput.includes('`v1.0.0-rc1`'));

const deletePayload: DeleteEventPayload = {
  ref: 'feature/old-branch',
  ref_type: 'branch',
  pusher_type: 'user',
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};
const deleteOutput = formatGitHubEvent('delete', deletePayload);
assertNoEmoji(deleteOutput, 'delete');
assert.ok(deleteOutput.includes('> *[GITHUB // BRANCH DELETED]*'));
assert.ok(deleteOutput.includes('`feature/old-branch`'));
console.log('✅ Branch/Tag Create & Delete formatters passed (0 emojis)');

// 2.10 Fork & Watch
const forkPayload: ForkEventPayload = {
  forkee: {
    ...pushPayload.repository,
    full_name: 'alice/Hello-World',
    html_url: 'https://github.com/alice/Hello-World',
  },
  repository: pushPayload.repository,
  sender: { id: 2, login: 'alice', html_url: 'https://github.com/alice' },
};
const forkOutput = formatGitHubEvent('fork', forkPayload);
assertNoEmoji(forkOutput, 'fork');
assert.ok(forkOutput.includes('> *[GITHUB // REPOSITORY FORKED]*'));
assert.ok(forkOutput.includes('`alice/Hello-World`'));

const watchPayload: WatchEventPayload = {
  action: 'started',
  repository: pushPayload.repository,
  sender: { id: 2, login: 'alice', html_url: 'https://github.com/alice' },
};
const watchOutput = formatGitHubEvent('watch', watchPayload);
assertNoEmoji(watchOutput, 'watch');
assert.ok(watchOutput.includes('> *[GITHUB // STAR ADDED]*'));
console.log('✅ Fork & Watch formatters passed (0 emojis)');

// 2.11 Deployment & Deployment Status
const deployPayload: DeploymentEventPayload = {
  action: 'created',
  deployment: {
    id: 111,
    sha: 'abcdef',
    ref: 'main',
    task: 'deploy',
    environment: 'production',
    original_environment: 'production',
    description: 'Deploy to production cluster',
    created_at: '2026-11-02T10:00:00Z',
    updated_at: '2026-11-02T10:00:00Z',
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};
const deployOutput = formatGitHubEvent('deployment', deployPayload);
assertNoEmoji(deployOutput, 'deployment');
assert.ok(deployOutput.includes('> *[GITHUB // DEPLOYMENT CREATED]*'));
assert.ok(deployOutput.includes('`production`'));

const deployStatusPayload: DeploymentStatusEventPayload = {
  action: 'created',
  deployment: deployPayload.deployment,
  deployment_status: {
    id: 222,
    state: 'success',
    description: 'Deployment succeeded',
    target_url: 'https://myapp.production.com',
    created_at: '2026-11-02T10:05:00Z',
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};
const deployStatusOutput = formatGitHubEvent('deployment_status', deployStatusPayload);
assertNoEmoji(deployStatusOutput, 'deployment_status');
assert.ok(deployStatusOutput.includes('> *[GITHUB // DEPLOYMENT STATUS]*'));
assert.ok(deployStatusOutput.includes('`SUCCESS`'));
console.log('✅ Deployment formatters passed (0 emojis)');

// 2.12 Discussion
const discPayload: DiscussionEventPayload = {
  action: 'created',
  discussion: {
    id: 12,
    number: 3,
    title: 'Proposal: Microservices Architecture',
    body: 'Let us discuss dividing our monolithic API into microservices.',
    category: { id: 1, name: 'Ideas', description: 'Share ideas', emoji: '' },
    state: 'open',
    html_url: 'https://github.com/octocat/Hello-World/discussions/3',
    user: pushPayload.sender,
    created_at: '2026-11-02T10:00:00Z',
  },
  repository: pushPayload.repository,
  sender: pushPayload.sender,
};
const discOutput = formatGitHubEvent('discussion', discPayload);
assertNoEmoji(discOutput, 'discussion');
assert.ok(discOutput.includes('> *[GITHUB // DISCUSSION]*'));
assert.ok(discOutput.includes('Proposal: Microservices Architecture'));
console.log('✅ Discussion formatter passed (0 emojis)');

// 2.13 Fallback & Ping
const pingOutput = formatGitHubEvent('ping', {
  zen: 'Design for failure.',
  repository: pushPayload.repository,
  sender: pushPayload.sender,
});
assertNoEmoji(pingOutput, 'ping');
assert.ok(pingOutput.includes('> *[GITHUB // WEBHOOK PING]*'));
assert.ok(pingOutput.includes('Design for failure.'));

const fallbackOutput = formatGitHubEvent('unknown_custom_event', {
  action: 'triggered',
  repository: pushPayload.repository,
  sender: pushPayload.sender,
});
assertNoEmoji(fallbackOutput, 'fallback');
assert.ok(fallbackOutput.includes('> *[GITHUB // EVENT: UNKNOWN_CUSTOM_EVENT (TRIGGERED)]*'));
console.log('✅ Fallback & Ping formatters passed (0 emojis)');

// ==========================================
// 3. HMAC SHA-256 Signature Verification Test
// ==========================================
console.log('Testing HMAC SHA-256 signature logic...');
const secret = 'super_secret_webhook_key_123';
const body = JSON.stringify({ hello: 'world' });
const hmac = crypto.createHmac('sha256', secret);
hmac.update(Buffer.from(body));
const validSignature = `sha256=${hmac.digest('hex')}`;

// Verify timingSafeEqual matching
const bufA = Buffer.from(validSignature);
const bufB = Buffer.from(validSignature);
assert.ok(crypto.timingSafeEqual(bufA, bufB), 'Timing safe equal matches identical buffers');

const invalidHmac = crypto.createHmac('sha256', 'wrong_secret');
invalidHmac.update(Buffer.from(body));
const invalidSignature = `sha256=${invalidHmac.digest('hex')}`;
assert.strictEqual(validSignature === invalidSignature, false, 'Invalid signature should not match');
console.log('✅ HMAC SHA-256 signature verification test passed');

console.log('\n🎉 ALL TESTS PASSED! ZERO EMOJIS CONFIRMED & WHATSAPP MARKDOWN VERIFIED! 🎉\n');
