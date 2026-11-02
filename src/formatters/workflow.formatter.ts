import type {
  WorkflowRunEventPayload,
  WorkflowJobEventPayload,
  CheckRunEventPayload,
} from '../types/github.js';

function formatOutcome(conclusion: string | null, status: string): string {
  if (status === 'queued') return 'QUEUED';
  if (status === 'in_progress') return 'IN PROGRESS';
  return (conclusion || status).toUpperCase();
}

export function formatWorkflowRunEvent(payload: WorkflowRunEventPayload): string {
  const repoName = payload.repository.full_name;
  const run = payload.workflow_run;
  const actor = run.actor.login || payload.sender.login;
  const outcome = formatOutcome(run.conclusion, run.status);
  const branch = run.head_branch || 'unknown';

  return (
    `> *[GITHUB // ACTIONS WORKFLOW]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Workflow:* ${run.name}\n\n` +
    `*Execution:*\n` +
    `- *Status:* \`${outcome}\`\n` +
    `- *Branch:* \`${branch}\`\n` +
    `- *Run Number:* \`#${run.run_number}\` (Attempt \`${run.run_attempt}\`)\n` +
    `- *Triggered by:* ${actor}\n` +
    `- *Event:* \`${run.event}\`\n\n` +
    `*Reference:*\n` +
    `${run.html_url}`
  );
}

export function formatWorkflowJobEvent(payload: WorkflowJobEventPayload): string {
  const repoName = payload.repository.full_name;
  const job = payload.workflow_job;
  const actor = payload.sender.login;
  const outcome = formatOutcome(job.conclusion, job.status);

  return (
    `> *[GITHUB // ACTIONS JOB]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Job:* ${job.name}\n\n` +
    `*Execution:*\n` +
    `- *Status:* \`${outcome}\`\n` +
    `- *Action:* ${payload.action.toUpperCase()}\n` +
    `- *Triggered by:* ${actor}\n\n` +
    `*Reference:*\n` +
    `${job.html_url}`
  );
}

export function formatCheckRunEvent(payload: CheckRunEventPayload): string {
  const repoName = payload.repository.full_name;
  const check = payload.check_run;
  const actor = payload.sender.login;
  const outcome = formatOutcome(check.conclusion, check.status);

  return (
    `> *[GITHUB // CHECK RUN]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Check:* ${check.name}\n\n` +
    `*Details:*\n` +
    `- *Status:* \`${outcome}\`\n` +
    `- *Action:* ${payload.action.toUpperCase()}\n` +
    `- *Triggered by:* ${actor}\n\n` +
    `*Reference:*\n` +
    `${check.html_url}`
  );
}
