import type { DeploymentEventPayload, DeploymentStatusEventPayload } from '../types/github.js';

export function formatDeploymentEvent(payload: DeploymentEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const deployment = payload.deployment;

  return (
    `🚀 *NEW DEPLOYMENT CREATED*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `🌍 *Environment:* \`${deployment.environment}\`\n` +
    `📌 *Ref / Branch:* \`${deployment.ref}\`\n` +
    (deployment.description ? `📝 *Description:* ${deployment.description}\n` : '') +
    `\n🔗 *URL:* ${payload.repository.html_url}`
  );
}

export function formatDeploymentStatusEvent(payload: DeploymentStatusEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const deployment = payload.deployment;
  const status = payload.deployment_status;

  let stateIcon = 'ℹ️';
  if (status.state === 'success') stateIcon = '✅';
  else if (status.state === 'failure' || status.state === 'error') stateIcon = '❌';
  else if (status.state === 'in_progress') stateIcon = '🔄';
  else if (status.state === 'queued' || status.state === 'pending') stateIcon = '⏳';

  return (
    `${stateIcon} *DEPLOYMENT STATUS: ${status.state.toUpperCase()}*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `🌍 *Environment:* \`${deployment.environment}\`\n` +
    (status.description ? `📝 *Status:* ${status.description}\n` : '') +
    (status.target_url ? `🔗 *Target URL:* ${status.target_url}\n` : '') +
    `🔗 *Repo:* ${payload.repository.html_url}`
  );
}
