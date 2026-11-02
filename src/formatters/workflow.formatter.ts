import type {
  WorkflowRunEventPayload,
  WorkflowJobEventPayload,
  CheckRunEventPayload,
} from '../types/github.js';

function getConclusionIcon(conclusion: string | null, status: string): string {
  if (status === 'queued') return '⏳ Queued';
  if (status === 'in_progress') return '🔄 In Progress';

  switch (conclusion) {
    case 'success':
      return '✅ Success';
    case 'failure':
      return '❌ Failure';
    case 'cancelled':
      return '⏹️ Cancelled';
    case 'timed_out':
      return '⏱️ Timed Out';
    case 'skipped':
      return '⚪ Skipped';
    case 'action_required':
      return '⚠️ Action Required';
    default:
      return `ℹ️ ${conclusion || status}`;
  }
}

export function formatWorkflowRunEvent(payload: WorkflowRunEventPayload): string {
  const repoName = payload.repository.full_name;
  const run = payload.workflow_run;
  const actor = run.actor.login || payload.sender.login;
  const workflowName = run.name;
  const branch = run.head_branch || 'unknown';
  const statusOutcome = getConclusionIcon(run.conclusion, run.status);

  return (
    `⚙️ *GITHUB ACTIONS WORKFLOW*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `🔧 *Workflow:* ${workflowName}\n` +
    `🌿 *Branch:* ${branch}\n` +
    `📊 *Status:* ${run.status}\n` +
    `🏁 *Result:* ${statusOutcome}\n\n` +
    `🔗 *URL:* ${run.html_url}`
  );
}

export function formatWorkflowJobEvent(payload: WorkflowJobEventPayload): string {
  const repoName = payload.repository.full_name;
  const job = payload.workflow_job;
  const actor = payload.sender.login;
  const statusOutcome = getConclusionIcon(job.conclusion, job.status);

  return (
    `⚙️ *GITHUB ACTIONS JOB*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `🔧 *Job:* ${job.name}\n` +
    `📊 *Status:* ${job.status}\n` +
    `🏁 *Result:* ${statusOutcome}\n\n` +
    `🔗 *URL:* ${job.html_url}`
  );
}

export function formatCheckRunEvent(payload: CheckRunEventPayload): string {
  const repoName = payload.repository.full_name;
  const check = payload.check_run;
  const actor = payload.sender.login;
  const statusOutcome = getConclusionIcon(check.conclusion, check.status);

  return (
    `🩺 *CHECK RUN ${payload.action.toUpperCase()}*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `🔍 *Check:* ${check.name}\n` +
    `📊 *Status:* ${check.status}\n` +
    `🏁 *Result:* ${statusOutcome}\n\n` +
    `🔗 *URL:* ${check.html_url}`
  );
}
