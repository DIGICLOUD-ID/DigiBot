import type { DeploymentEventPayload, DeploymentStatusEventPayload } from '../types/github.js';

export function formatDeploymentEvent(payload: DeploymentEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const deployment = payload.deployment;

  return (
    `> *[GITHUB // DEPLOYMENT CREATED]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Environment:* \`${deployment.environment}\`\n\n` +
    `*Details:*\n` +
    `- *Creator:* ${actor}\n` +
    `- *Ref:* \`${deployment.ref}\`\n` +
    `- *SHA:* \`${deployment.sha.substring(0, 7)}\`\n` +
    (deployment.description ? `- *Description:* ${deployment.description}\n` : '') +
    `\n*Reference:*\n` +
    `${payload.repository.html_url}`
  );
}

export function formatDeploymentStatusEvent(payload: DeploymentStatusEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const deployment = payload.deployment;
  const status = payload.deployment_status;
  const stateLabel = status.state.toUpperCase();

  return (
    `> *[GITHUB // DEPLOYMENT STATUS]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Environment:* \`${deployment.environment}\`\n\n` +
    `*Status:*\n` +
    `- *State:* \`${stateLabel}\`\n` +
    `- *Actor:* ${actor}\n` +
    (status.description ? `- *Description:* ${status.description}\n` : '') +
    (status.target_url ? `- *Target URL:* ${status.target_url}\n` : '') +
    `\n*Reference:*\n` +
    `${payload.repository.html_url}`
  );
}
