export interface GitHubSender {
  login: string;
  id: number;
  avatar_url?: string;
  html_url: string;
  type?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  default_branch?: string;
  owner: {
    login: string;
    html_url: string;
  };
}

export interface GitHubCommitAuthor {
  name: string;
  email: string;
  username?: string;
}

export interface GitHubCommit {
  id: string;
  tree_id?: string;
  distinct?: boolean;
  message: string;
  timestamp: string;
  url: string;
  author: GitHubCommitAuthor;
  committer?: GitHubCommitAuthor;
  added?: string[];
  removed?: string[];
  modified?: string[];
}

export interface PushEventPayload {
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  base_ref: string | null;
  compare: string;
  commits: GitHubCommit[];
  head_commit: GitHubCommit | null;
  repository: GitHubRepository;
  pusher: {
    name: string;
    email: string;
  };
  sender: GitHubSender;
}

export interface PullRequestBranch {
  label: string;
  ref: string;
  sha: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string | null;
  user: GitHubSender;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merged: boolean;
  draft?: boolean;
  head: PullRequestBranch;
  base: PullRequestBranch;
}

export interface PullRequestEventPayload {
  action: 'opened' | 'closed' | 'reopened' | 'edited' | 'assigned' | 'unassigned' | 'review_requested' | 'review_request_removed' | 'labeled' | 'unlabeled' | 'synchronize';
  number: number;
  pull_request: GitHubPullRequest;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  user: GitHubSender;
  state: 'open' | 'closed';
  html_url: string;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  pull_request?: {
    url: string;
    html_url: string;
  };
}

export interface IssuesEventPayload {
  action: 'opened' | 'closed' | 'reopened' | 'edited' | 'deleted' | 'transferred' | 'pinned' | 'unpinned' | 'labeled' | 'unlabeled' | 'locked' | 'unlocked' | 'milestoned' | 'demilestoned';
  issue: GitHubIssue;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubIssueComment {
  id: number;
  html_url: string;
  body: string;
  user: GitHubSender;
  created_at: string;
  updated_at: string;
}

export interface IssueCommentEventPayload {
  action: 'created' | 'edited' | 'deleted';
  issue: GitHubIssue;
  comment: GitHubIssueComment;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  html_url: string;
  body: string | null;
  author: GitHubSender;
}

export interface ReleaseEventPayload {
  action: 'published' | 'unpublished' | 'created' | 'edited' | 'deleted' | 'prereleased' | 'released';
  release: GitHubRelease;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface ForkEventPayload {
  forkee: GitHubRepository;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface WatchEventPayload {
  action: 'started';
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface CreateEventPayload {
  ref: string;
  ref_type: 'branch' | 'tag' | 'repository';
  master_branch: string;
  description: string | null;
  pusher_type: string;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface DeleteEventPayload {
  ref: string;
  ref_type: 'branch' | 'tag';
  pusher_type: string;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string | null;
  head_sha: string;
  event: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out' | 'action_required' | 'stale' | 'skipped' | null;
  html_url: string;
  run_number: number;
  run_attempt: number;
  actor: GitHubSender;
  triggering_actor?: GitHubSender;
}

export interface WorkflowRunEventPayload {
  action: 'requested' | 'completed' | 'in_progress';
  workflow: {
    id: number;
    name: string;
    path: string;
    state: string;
  };
  workflow_run: GitHubWorkflowRun;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubWorkflowJob {
  id: number;
  run_id: number;
  name: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out' | 'action_required' | 'skipped' | null;
  started_at: string;
  completed_at: string | null;
  html_url: string;
}

export interface WorkflowJobEventPayload {
  action: 'queued' | 'in_progress' | 'completed';
  workflow_job: GitHubWorkflowJob;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubCheckRun {
  id: number;
  head_sha: string;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out' | 'action_required' | 'skipped' | null;
  html_url: string;
  started_at: string;
  completed_at: string | null;
  output?: {
    title: string | null;
    summary: string | null;
  };
}

export interface CheckRunEventPayload {
  action: 'created' | 'completed' | 'rerequested' | 'requested_action';
  check_run: GitHubCheckRun;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  task: string;
  environment: string;
  original_environment: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeploymentEventPayload {
  action: 'created';
  deployment: GitHubDeployment;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubDeploymentStatus {
  id: number;
  state: 'error' | 'failure' | 'in_progress' | 'queued' | 'pending' | 'success';
  description: string | null;
  target_url: string | null;
  created_at: string;
}

export interface DeploymentStatusEventPayload {
  action: 'created';
  deployment: GitHubDeployment;
  deployment_status: GitHubDeploymentStatus;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubDiscussion {
  id: number;
  number: number;
  title: string;
  body: string;
  category: {
    id: number;
    name: string;
    description: string;
    emoji: string;
  };
  state: 'open' | 'locked' | 'closed';
  html_url: string;
  user: GitHubSender;
  created_at: string;
}

export interface DiscussionEventPayload {
  action: 'created' | 'edited' | 'deleted' | 'pinned' | 'unpinned' | 'locked' | 'unlocked' | 'category_changed' | 'answered' | 'unanswered' | 'closed' | 'reopened' | 'transferred';
  discussion: GitHubDiscussion;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GitHubDiscussionComment {
  id: number;
  body: string;
  user: GitHubSender;
  html_url: string;
  created_at: string;
}

export interface DiscussionCommentEventPayload {
  action: 'created' | 'edited' | 'deleted';
  discussion: GitHubDiscussion;
  comment: GitHubDiscussionComment;
  repository: GitHubRepository;
  sender: GitHubSender;
}

export interface GenericGitHubPayload {
  action?: string;
  repository?: GitHubRepository;
  sender?: GitHubSender;
  [key: string]: unknown;
}

export type SupportedGitHubEvent =
  | 'push'
  | 'pull_request'
  | 'issues'
  | 'issue_comment'
  | 'release'
  | 'fork'
  | 'watch'
  | 'create'
  | 'delete'
  | 'workflow_run'
  | 'workflow_job'
  | 'check_run'
  | 'deployment'
  | 'deployment_status'
  | 'discussion'
  | 'discussion_comment'
  | 'ping';
