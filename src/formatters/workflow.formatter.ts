import type {
  WorkflowRunEventPayload,
  WorkflowJobEventPayload,
  CheckRunEventPayload,
} from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

function formatOutcome(conclusion: string | null, status: string): string {
  if (status === 'queued') return 'QUEUED';
  if (status === 'in_progress') return 'IN PROGRESS';
  return (conclusion || status).toUpperCase();
}

export function formatWorkflowRunEvent(payload: WorkflowRunEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const run = payload.workflow_run;
  const actor = run.actor.login || payload.sender.login;
  const outcome = formatOutcome(run.conclusion, run.status);
  const branch = run.head_branch || 'unknown';

  const text =
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
    `${run.html_url}`;

  return {
    text,
    title: `[WORKFLOW] ${run.name}: ${outcome}`,
    subtitle: `${repoName} | ${branch}`,
    sourceUrl: run.html_url,
  };
}

export function formatWorkflowJobEvent(payload: WorkflowJobEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const job = payload.workflow_job;
  const actor = payload.sender.login;
  const outcome = formatOutcome(job.conclusion, job.status);

  const text =
    `> *[GITHUB // ACTIONS JOB]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Job:* ${job.name}\n\n` +
    `*Execution:*\n` +
    `- *Status:* \`${outcome}\`\n` +
    `- *Action:* ${payload.action.toUpperCase()}\n` +
    `- *Triggered by:* ${actor}\n\n` +
    `*Reference:*\n` +
    `${job.html_url}`;

  return {
    text,
    title: `[JOB] ${job.name}: ${outcome}`,
    subtitle: repoName,
    sourceUrl: job.html_url,
  };
}

export function formatCheckRunEvent(payload: CheckRunEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const check = payload.check_run;
  const actor = payload.sender.login;
  const outcome = formatOutcome(check.conclusion, check.status);

  const text =
    `> *[GITHUB // CHECK RUN]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Check:* ${check.name}\n\n` +
    `*Details:*\n` +
    `- *Status:* \`${outcome}\`\n` +
    `- *Action:* ${payload.action.toUpperCase()}\n` +
    `- *Triggered by:* ${actor}\n\n` +
    `*Reference:*\n` +
    `${check.html_url}`;

  return {
    text,
    title: `[CHECK] ${check.name}: ${outcome}`,
    subtitle: repoName,
    sourceUrl: check.html_url,
  };
}
