import type {
  PushEventPayload,
  PullRequestEventPayload,
  IssuesEventPayload,
  IssueCommentEventPayload,
  ReleaseEventPayload,
  ForkEventPayload,
  WatchEventPayload,
  CreateEventPayload,
  DeleteEventPayload,
  WorkflowRunEventPayload,
  WorkflowJobEventPayload,
  CheckRunEventPayload,
  DeploymentEventPayload,
  DeploymentStatusEventPayload,
  DiscussionEventPayload,
  DiscussionCommentEventPayload,
  GenericGitHubPayload,
} from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

import { formatPushEvent } from './push.formatter.js';
import { formatPullRequestEvent } from './pull-request.formatter.js';
import { formatIssuesEvent } from './issues.formatter.js';
import { formatIssueCommentEvent } from './issue-comment.formatter.js';
import { formatReleaseEvent } from './release.formatter.js';
import {
  formatWorkflowRunEvent,
  formatWorkflowJobEvent,
  formatCheckRunEvent,
} from './workflow.formatter.js';
import { formatCreateEvent, formatDeleteEvent } from './branch-tag.formatter.js';
import { formatForkEvent, formatWatchEvent } from './repo-activity.formatter.js';
import {
  formatDeploymentEvent,
  formatDeploymentStatusEvent,
} from './deployment.formatter.js';
import {
  formatDiscussionEvent,
  formatDiscussionCommentEvent,
} from './discussion.formatter.js';
import { formatFallbackEvent } from './fallback.formatter.js';

export function formatGitHubEvent(event: string, payload: unknown): FormattedMessage {
  const genericPayload = (payload || {}) as GenericGitHubPayload;

  switch (event) {
    case 'push':
      return formatPushEvent(payload as PushEventPayload);

    case 'pull_request':
      return formatPullRequestEvent(payload as PullRequestEventPayload);

    case 'issues':
      return formatIssuesEvent(payload as IssuesEventPayload);

    case 'issue_comment':
      return formatIssueCommentEvent(payload as IssueCommentEventPayload);

    case 'release':
      return formatReleaseEvent(payload as ReleaseEventPayload);

    case 'fork':
      return formatForkEvent(payload as ForkEventPayload);

    case 'watch':
      return formatWatchEvent(payload as WatchEventPayload);

    case 'create':
      return formatCreateEvent(payload as CreateEventPayload);

    case 'delete':
      return formatDeleteEvent(payload as DeleteEventPayload);

    case 'workflow_run':
      return formatWorkflowRunEvent(payload as WorkflowRunEventPayload);

    case 'workflow_job':
      return formatWorkflowJobEvent(payload as WorkflowJobEventPayload);

    case 'check_run':
      return formatCheckRunEvent(payload as CheckRunEventPayload);

    case 'deployment':
      return formatDeploymentEvent(payload as DeploymentEventPayload);

    case 'deployment_status':
      return formatDeploymentStatusEvent(payload as DeploymentStatusEventPayload);

    case 'discussion':
      return formatDiscussionEvent(payload as DiscussionEventPayload);

    case 'discussion_comment':
      return formatDiscussionCommentEvent(payload as DiscussionCommentEventPayload);

    default:
      return formatFallbackEvent(event, genericPayload);
  }
}

export {
  formatPushEvent,
  formatPullRequestEvent,
  formatIssuesEvent,
  formatIssueCommentEvent,
  formatReleaseEvent,
  formatWorkflowRunEvent,
  formatWorkflowJobEvent,
  formatCheckRunEvent,
  formatCreateEvent,
  formatDeleteEvent,
  formatForkEvent,
  formatWatchEvent,
  formatDeploymentEvent,
  formatDeploymentStatusEvent,
  formatDiscussionEvent,
  formatDiscussionCommentEvent,
  formatFallbackEvent,
};
